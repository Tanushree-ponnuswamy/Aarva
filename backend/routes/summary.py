from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database.postgres import get_db
from models.models import Textbook
from services.llama_service import llama_service

router = APIRouter(prefix="/api/summary", tags=["Textbook Summarization & AI Chat"])

class ChatMessageRequest(BaseModel):
    query: str
    textbook_id: Optional[int] = None
    document_id: Optional[int] = None
    language: Optional[str] = "English"
    conversation_history: Optional[List[dict]] = None

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
            "title": book.title,
            "mode": "complete",
            "summary": stored_data.get("complete_summary", f"Complete summary of {book.title}."),
            "chapters": stored_data.get("chapters", []),
            "key_points": stored_data.get("key_points", []),
            "definitions": stored_data.get("definitions", [])
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
                "key_points": stored_data.get("key_points", [])[:2],
                "definitions": stored_data.get("definitions", [])[:2]
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
def chat_with_tutor(req: ChatMessageRequest):
    """
    Interactive Knowledge Base / Tutor Chat endpoint.
    Retrieves grounded context using Hybrid Retrieval (Dense Vector + BM25 Lexical)
    and generates an answer via Mistral / Llama with cited page/sheet sources.
    """
    target_id = req.document_id if req.document_id is not None else req.textbook_id
    reply = llama_service.chat_response(
        query=req.query,
        textbook_id=target_id,
        language=req.language or "English",
        conversation_history=req.conversation_history
    )
    return reply

