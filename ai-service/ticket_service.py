from database import SessionLocal
from models import Ticket, ChatHistory


def create_ticket(question):

    db = SessionLocal()

    try:

        ticket = Ticket(
            question=question
        )

        db.add(ticket)

        db.commit()

        db.refresh(ticket)

        return {
            "ticket_id": ticket.id,
            "question": ticket.question,
            "status": ticket.status
        }

    finally:
        db.close()


def save_chat_history(
    question,
    answer,
    confidence
):

    db = SessionLocal()

    try:

        chat = ChatHistory(
            question=question,
            answer=answer,
            confidence=confidence
        )

        db.add(chat)

        db.commit()

        db.refresh(chat)

        return {
            "id": chat.id,
            "question": chat.question,
            "confidence": chat.confidence,
            "created_at": chat.created_at
        }

    finally:
        db.close()