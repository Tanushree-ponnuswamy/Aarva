import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from database.postgres import get_db
from models.models import Textbook, User, ChatSession, ChatMessage
from database.chroma import chroma_store
from services.llama_service import llama_service

router = APIRouter(prefix="/api/textbooks", tags=["Textbooks Management"])

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

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

    # Save file to disk for preview
    file_path = UPLOADS_DIR / f"{result['document_id']}_{filename}"
    try:
        with open(file_path, "wb") as f:
            f.write(file_bytes)
    except Exception as e:
        print(f"[WARN] Failed to write preview file to disk: {e}")

    # Persist the upload event to the chat history
    try:
        session = ChatSession(
            user_id=user_id,
            textbook_id=result['document_id'],
            session_title=f"Chat about {title}",
            message_count=2
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        user_msg = ChatMessage(
            chat_session_id=session.id,
            role="user",
            content=f"📎 Attached: {filename}"
        )
        ai_msg = ChatMessage(
            chat_session_id=session.id,
            role="assistant",
            content=f"✅ **{result['title']}** has been uploaded successfully!\n\nThe extracted summary and breakdown are now loaded on the right. Ask me any question about this document!"
        )
        db.add(user_msg)
        db.add(ai_msg)
        db.commit()
    except Exception as e:
        print(f"[WARN] Failed to save upload chat history: {e}")

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

@router.get("/{textbook_id}/file")
def get_textbook_file(textbook_id: int, db: Session = Depends(get_db)):
    """Serve the raw file content or PDF for preview."""
    book = db.query(Textbook).filter(Textbook.id == textbook_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Textbook not found.")

    # Check disk for saved file
    for p in UPLOADS_DIR.glob(f"{textbook_id}_*"):
        ext = p.suffix.lower()
        mime_map = {
            ".pdf":  "application/pdf",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".doc":  "application/msword",
            ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".xls":  "application/vnd.ms-excel",
            ".png":  "image/png",
            ".jpg":  "image/jpeg",
            ".jpeg": "image/jpeg",
            ".bmp":  "image/bmp",
            ".tiff": "image/tiff",
            ".tif":  "image/tiff",
            ".webp": "image/webp",
            ".txt":  "text/plain",
            ".md":   "text/plain",
            ".csv":  "text/csv",
        }
        media_type = mime_map.get(ext, "application/octet-stream")
        return FileResponse(path=p, media_type=media_type, filename=book.file_name, content_disposition_type="inline")

    # Fallback to sample tender PDF if available on disk
    sample_pdf = UPLOADS_DIR / "nit_scada-635.pdf"
    if sample_pdf.exists():
        return FileResponse(path=sample_pdf, media_type="application/pdf", filename=book.file_name or "document.pdf", content_disposition_type="inline")

    # Final fallback response
    summary_text = (book.summary_data or {}).get("complete_summary", f"Document summary for {book.title}.")
    content = f"# {book.title}\nAuthor: {book.author}\n\n{summary_text}"
    return Response(content=content, media_type="text/plain")

@router.delete("/{textbook_id}")
def delete_textbook(textbook_id: int, db: Session = Depends(get_db)):
    book = db.query(Textbook).filter(Textbook.id == textbook_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Textbook not found.")

    # Remove vector chunks from ChromaDB
    chroma_store.delete_textbook_chunks(textbook_id=textbook_id)

    # Clean file from disk
    for p in UPLOADS_DIR.glob(f"{textbook_id}_*"):
        try:
            p.unlink()
        except Exception:
            pass

    db.delete(book)
    db.commit()
    return {"success": True, "message": "Textbook and vector chunks deleted."}

