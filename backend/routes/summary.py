from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import json
from database.postgres import get_db
from models.models import Textbook, ChatSession, ChatMessage, User
from services.auth_service import get_current_user, get_owned_textbook, require_self_or_admin
from services.llama_service import llama_service
from schemas.language import normalize_language_code, get_language_display_name, is_valid_language

router = APIRouter(prefix="/api/summary", tags=["Textbook Summarization & AI Chat"])

class ChatMessageRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=4000)
    textbook_id: Optional[int] = None
    document_id: Optional[int] = None
    user_id: Optional[int] = None
    language: Optional[str] = "English"
    conversation_history: Optional[List[dict]] = None

    @validator("language", pre=True, always=True)
    def validate_language(cls, v):
        if not v:
            return "English"
        if not is_valid_language(v):
            raise ValueError(f"Unsupported language '{v}'. Supported: English, Tamil, Hindi, Telugu, Marathi, Malayalam, Odia, Bengali.")
        return get_language_display_name(v)

@router.get("/chat/history/{textbook_id}")
def get_chat_history(
    textbook_id: int,
    user_id: Optional[int] = Query(None, description="User ID (must be the caller; defaults to the caller)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve stored chat history for a textbook session (own sessions only)."""
    user_id = current_user.id if user_id is None else user_id
    require_self_or_admin(user_id, current_user)
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
    language: Optional[str] = Query("English", description="Target language for summary and concepts"),
    chapter: Optional[int] = None,
    concept: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = get_owned_textbook(db, textbook_id, current_user)

    # If book has precomputed summary data
    stored_data = book.summary_data or {}
    norm_code = "en"
    lang_name = "English"

    # Always use the primary English summary data
    data_source = stored_data

    if mode == "complete":
        return {
            "textbook_id": book.id,
            "title": data_source.get("title") or stored_data.get("title") or book.title,
            "mode": "complete",
            "language": lang_name,
            "language_code": norm_code,
            "overview": data_source.get("overview") or data_source.get("complete_summary") or f"A comprehensive study overview for {book.title}.",
            "summary": data_source.get("overview") or data_source.get("complete_summary") or f"A comprehensive study overview for {book.title}.",
            "main_takeaway": data_source.get("main_takeaway") or f"Core insights and workflow of {book.title}.",
            "key_points": data_source.get("key_points", []),
            "topics_covered": data_source.get("topics_covered", []),
            "chapters": data_source.get("chapters", []),
            "concepts": data_source.get("concepts", []),
            "definitions": data_source.get("definitions", []),
            "important_notes": data_source.get("important_notes", []),
            "summary_state": data_source.get("summary_state", "done"),
            "summary_progress": data_source.get("summary_progress"),
            "summary_engine": data_source.get("summary_engine"),
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
def chat_with_tutor(req: ChatMessageRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Interactive Knowledge Base / Tutor Chat endpoint.
    Retrieves grounded context using Hybrid Retrieval (Dense Vector + BM25 Lexical),
    stores chat history, and returns AI answer with cited sources.
    """
    target_id = req.document_id if req.document_id is not None else req.textbook_id
    doc_summary_data = None
    doc_title = None
    req.user_id = current_user.id  # never trust a client-supplied user id
    req.conversation_history = (req.conversation_history or [])[-20:]  # bound prompt size

    if target_id:
        book = get_owned_textbook(db, target_id, current_user)  # 404 if not the caller's
        doc_title = book.title
        doc_summary_data = book.summary_data

    if target_id:
        try:
            from services.knowledge_base_service import knowledge_base_service
            knowledge_base_service.ensure_indexed(target_id, db)  # rebuilds the index if the server lost it
        except Exception as e:
            print(f"[REINDEX WARN] {e}")

    # Execute RAG query
    reply = llama_service.chat_response(
        query=req.query,
        textbook_id=target_id,
        language="English",
        conversation_history=req.conversation_history,
        doc_summary_data=doc_summary_data,
        doc_title=doc_title
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

