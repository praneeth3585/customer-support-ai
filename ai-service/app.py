from fastapi import FastAPI, UploadFile, Depends, HTTPException, status
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List

from upload import upload_pdf
from database import SessionLocal
from models import Ticket, ChatHistory
from rag import ask_rag

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class ChatRequest(BaseModel):
    question: str

class StatusUpdateRequest(BaseModel):
    status: str

# --- Database Dependency ---
# This automatically opens a session per request and closes it when done.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Endpoints ---

@app.get("/")
def home():
    return {"message": "Customer Support AI Running"}


@app.get("/db-debug")
def db_debug(db: Session = Depends(get_db)):
    database = db.execute(text("SELECT current_database()")).scalar()
    
    columns = db.execute(
        text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tickets' 
            ORDER BY ordinal_position
        """)
    ).fetchall()
    
    return {
        "database": database,
        "columns": [c[0] for c in columns]
    }


@app.post("/chat")
def chat(request: ChatRequest):
    return ask_rag(request.question)


@app.post("/upload")
async def upload(file: UploadFile):
    return await upload_pdf(file)


@app.get("/tickets")
def get_tickets(db: Session = Depends(get_db)):
    tickets = db.query(Ticket).order_by(Ticket.id.desc()).all()
    
    return [
        {
            "id": ticket.id,
            "question": ticket.question,
            "status": ticket.status
        }
        for ticket in tickets
    ]


@app.put("/tickets/{ticket_id}/close")
def close_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Ticket not found"
        )
        
    ticket.status = "CLOSED"
    db.commit()
    db.refresh(ticket)
    
    return {
        "message": "Ticket closed successfully",
        "ticket_id": ticket.id,
        "status": ticket.status
    }


@app.put("/tickets/{ticket_id}/status")
def update_ticket_status(
    ticket_id: int, 
    payload: StatusUpdateRequest, 
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Ticket not found"
        )
        
    ticket.status = payload.status
    db.commit()
    db.refresh(ticket)
    
    return {
        "message": "Status updated",
        "ticket_id": ticket.id,
        "status": ticket.status
    }


@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_tickets = db.query(Ticket).count()
    open_tickets = db.query(Ticket).filter(Ticket.status == "OPEN").count()
    in_progress_tickets = db.query(Ticket).filter(Ticket.status == "IN_PROGRESS").count()
    closed_tickets = db.query(Ticket).filter(Ticket.status == "CLOSED").count()
    
    return {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "in_progress_tickets": in_progress_tickets,
        "closed_tickets": closed_tickets
    }


@app.get("/chat-history")
def get_chat_history(db: Session = Depends(get_db)):
    chats = db.query(ChatHistory).order_by(ChatHistory.id.desc()).all()
    
    return [
        {
            "id": chat.id,
            "question": chat.question,
            "answer": chat.answer,
            "confidence": chat.confidence,
            "created_at": chat.created_at
        }
        for chat in chats
    ]