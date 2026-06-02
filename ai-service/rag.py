import os

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

from vector_store import db
from ticket_service import (
    create_ticket,
    save_chat_history
)

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)


def ask_rag(question):

    try:

        docs = db.similarity_search(
            question,
            k=5
        )

        if not docs:

            ticket = create_ticket(question)

            save_chat_history(
                question,
                "No relevant documents were found in the knowledge base.",
                "LOW"
            )

            return {
                "answer": (
                    "No relevant documents were found "
                    "in the knowledge base."
                ),
                "confidence": "LOW",
                "ticket": ticket
            }

        context = "\n\n".join(
            [doc.page_content for doc in docs]
        )

        prompt = f"""
You are a professional customer support AI.

Rules:

1. Answer ONLY using the provided context.
2. Do not make up information.
3. If the answer cannot be found in the context,
respond exactly:

I could not find that information in the knowledge base.

4. Keep answers clear and concise.
5. Use bullet points when useful.

CONTEXT:
{context}

QUESTION:
{question}
"""

        response = llm.invoke(prompt)

        answer = response.content.strip()

        sources = []
        seen = set()

        for doc in docs:

            source = (
                doc.metadata.get("source"),
                doc.metadata.get("page")
            )

            if source not in seen:

                seen.add(source)

                sources.append({
                    "file": doc.metadata.get("source"),
                    "page": doc.metadata.get("page")
                })

        confidence = (
            "HIGH"
            if len(docs) >= 3
            else "MEDIUM"
        )

        save_chat_history(
            question,
            answer,
            confidence
        )

        if (
            "I could not find that information"
            in answer
        ):

            ticket = create_ticket(question)

            return {
                "answer": answer,
                "confidence": "LOW",
                "ticket": ticket,
                "sources": sources
            }

        return {
            "answer": answer,
            "confidence": confidence,
            "sources": sources
        }

    except Exception as e:

        return {
            "error": str(e)
        }