from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from database.postgres import get_db
from models.models import Textbook, User
from database.chroma import chroma_store
from services.llama_service import llama_service

router = APIRouter(prefix="/api/textbooks", tags=["Textbooks Management"])

@router.get("/")
def get_textbooks(user_id: int, db: Session = Depends(get_db)):
    books = db.query(Textbook).filter(Textbook.user_id == user_id).order_by(Textbook.uploaded_at.desc()).all()
    return [
        {
            "id": b.id,
            "title": b.title,
            "author": b.author,
            "file_name": b.file_name,
            "file_size": b.file_size,
            "total_pages": b.total_pages,
            "status": b.status,
            "uploaded_at": b.uploaded_at.strftime("%Y-%m-%d %H:%M"),
            "has_summary": bool(b.summary_data)
        }
        for b in books
    ]

@router.post("/upload")
async def upload_textbook(
    user_id: int = Form(...),
    title: str = Form(...),
    author: Optional[str] = Form("Unknown Author"),
    pages: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Verify user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    from services.knowledge_base_service import knowledge_base_service

    filename = file.filename if (file and file.filename) else f"{title.lower().replace(' ', '_')}.pdf"
    
    # Read uploaded file content or generate starter document
    if file:
        file_bytes = await file.read()
    else:
        # Fallback text representation
        default_content = (
            f"# {title}\nAuthor: {author or 'Academic Faculty'}\n\n"
            f"Foundational principles and advanced paradigms of {title}. "
            f"Covers system architecture, protocols, performance metrics, and compliance guidelines.\n"
        )
        file_bytes = default_content.encode("utf-8")
        filename = f"{title.lower().replace(' ', '_')}.txt"

    # Execute end-to-end ingestion pipeline (Parsing -> Chunking -> Embedding -> DB)
    result = knowledge_base_service.ingest_document(
        file_bytes=file_bytes,
        filename=filename,
        user_id=user_id,
        title=title,
        author=author or "Academic Author",
        db=db
    )

    return {
        "success": True,
        "message": f"'{result['title']}' ({result['file_type'].upper()}) parsed and indexed successfully ({result['total_chunks']} chunks, {result['total_pages']} pages/sheets).",
        "textbook": {
            "id": result["document_id"],
            "title": result["title"],
            "author": result["author"],
            "file_name": result["file_name"],
            "file_type": result["file_type"],
            "file_size": result["file_size"],
            "total_pages": result["total_pages"],
            "total_chunks": result["total_chunks"],
            "status": "processed",
            "summary": result["summary"]
        }
    }

@router.delete("/{textbook_id}")
def delete_textbook(textbook_id: int, db: Session = Depends(get_db)):
    book = db.query(Textbook).filter(Textbook.id == textbook_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Textbook not found.")

    # Remove vector chunks from ChromaDB
    chroma_store.delete_textbook_chunks(textbook_id=textbook_id)

    db.delete(book)
    db.commit()
    return {"success": True, "message": "Textbook and vector chunks deleted."}

