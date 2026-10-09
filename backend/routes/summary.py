from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database.postgres import get_db
from models.models import Textbook, ChatSession, ChatMessage
from services.llama_service import llama_service

router = APIRouter(prefix="/api/summary", tags=["Textbook Summarization & AI Chat"])

class ChatMessageRequest(BaseModel):
    query: str
    textbook_id: Optional[int] = None
    document_id: Optional[int] = None
    user_id: Optional[int] = None
    language: Optional[str] = "English"
    conversation_history: Optional[List[dict]] = None

@router.get("/chat/history/{textbook_id}")
def get_chat_history(
    textbook_id: int,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Retrieve stored chat history for a textbook session."""
    session = db.query(ChatSession).filter(
        ChatSession.textbook_id == textbook_id,
        ChatSession.user_id == user_id
    ).order_by(ChatSession.updated_at.desc()).first()

    if not session:
        return {"messages": []}

    msgs = db.query(ChatMessage).filter(
        ChatMessage.chat_session_id == session.id
    ).order_by(ChatMessage.created_at.asc()).all()

    return {
        "session_id": session.id,
        "textbook_id": textbook_id,
        "messages": [
            {
                "from": "user" if m.role == "user" else "ai",
                "text": m.content,
                "timestamp": m.created_at.strftime("%H:%M")
            }
            for m in msgs
        ]
    }

@router.get("/{textbook_id}")
def get_summary(
    textbook_id: int,
    mode: str = Query("complete", description="complete, chapter, page, concept"),
    chapter: Optional[int] = None,
    concept: Optional[str] = None,
    db: Session = Depends(get_db)
):
    book = db.query(Textbook).filter(Textbook.id == textbook_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Textbook not found.")

    # If book has precomputed summary data
    stored_data = book.summary_data or {}

    if mode == "complete":
        return {
            "textbook_id": book.id,
            "title": stored_data.get("title") or book.title,
            "mode": "complete",
            "overview": stored_data.get("overview") or stored_data.get("complete_summary") or f"A comprehensive study overview for {book.title}.",
            "summary": stored_data.get("overview") or stored_data.get("complete_summary") or f"A comprehensive study overview for {book.title}.",
            "main_takeaway": stored_data.get("main_takeaway") or f"Core insights and workflow of {book.title}.",
            "key_points": stored_data.get("key_points", []),
            "topics_covered": stored_data.get("topics_covered", []),
            "chapters": stored_data.get("chapters", []),
            "concepts": stored_data.get("concepts", []),
            "definitions": stored_data.get("definitions", []),
            "important_notes": stored_data.get("important_notes", [])
        }
    elif mode == "chapter":
        ch_num = chapter or 1
        ch_list = stored_data.get("chapters", [])
        matching = next((c for c in ch_list if c.get("chapter") == ch_num), None)
        if matching:
            return {
                "textbook_id": book.id,
                "title": book.title,
                "mode": "chapter",
                "chapter_info": matching,
                "key_points": stored_data.get("key_points", [])[:3],
                "definitions": stored_data.get("definitions", [])[:3]
            }
        else:
            return llama_service.generate_summary(book.title, mode="chapter", chapter_id=ch_num)
    elif mode == "concept":
        c_name = concept or "Core Architecture"
        return llama_service.generate_summary(book.title, mode="concept", concept=c_name)
    elif mode == "page":
        return llama_service.generate_summary(book.title, mode="page")

    return llama_service.generate_summary(book.title, mode=mode)

@router.post("/chat")
def chat_with_tutor(req: ChatMessageRequest, db: Session = Depends(get_db)):
    """
    Interactive Knowledge Base / Tutor Chat endpoint.
    Retrieves grounded context using Hybrid Retrieval (Dense Vector + BM25 Lexical),
    stores chat history, and returns AI answer with cited sources.
    """
    target_id = req.document_id if req.document_id is not None else req.textbook_id

    # Execute RAG query
    reply = llama_service.chat_response(
        query=req.query,
        textbook_id=target_id,
        language=req.language or "English",
        conversation_history=req.conversation_history
    )

    # Persist chat session & messages if user_id & textbook_id provided
    if req.user_id and target_id:
        try:
            session = db.query(ChatSession).filter(
                ChatSession.textbook_id == target_id,
                ChatSession.user_id == req.user_id
            ).first()

            if not session:
                session = ChatSession(
                    user_id=req.user_id,
                    textbook_id=target_id,
                    session_title=f"Chat about textbook #{target_id}",
                    message_count=0
                )
                db.add(session)
                db.commit()
                db.refresh(session)

            user_msg = ChatMessage(
                chat_session_id=session.id,
                role="user",
                content=req.query
            )
            ai_msg = ChatMessage(
                chat_session_id=session.id,
                role="assistant",
                content=reply.get("response", "")
            )
            session.message_count += 2
            session.updated_at = datetime.utcnow()

            db.add(user_msg)
            db.add(ai_msg)
            db.commit()
        except Exception as e:
            print(f"[WARN] Failed to persist chat history: {e}")

    return reply

