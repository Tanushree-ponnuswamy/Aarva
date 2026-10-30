import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse, Response
import threading
import time
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from database.postgres import get_db
from models.models import Textbook, User, ChatSession, ChatMessage
from database.chroma import chroma_store
from services.llama_service import llama_service
from services.auth_service import get_current_user, get_owned_textbook, require_self_or_admin
from config import settings

router = APIRouter(prefix="/api/textbooks", tags=["Textbooks Management"])

# Books being processed in the background: ids still running, and ids the user asked to delete mid-way.
_active: set = set()
_cancelled: set = set()
_process_slots = threading.Semaphore(2)  # bound memory: at most two documents processed at once


UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

@router.get("", include_in_schema=False)
@router.get("/")
def get_textbooks(user_id: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id if user_id is None else user_id
    require_self_or_admin(user_id, current_user)
    # Drop books stuck in "processing" (e.g. the server restarted mid-upload); hide in-flight and failed ones.
    from datetime import timedelta
    stale = db.query(Textbook).filter(Textbook.user_id == user_id, Textbook.status == "processing",
                                      Textbook.uploaded_at < datetime.utcnow() - timedelta(minutes=60)).all()
    for s in stale:
        db.delete(s)
    if stale:
        db.commit()
    books = db.query(Textbook).filter(Textbook.user_id == user_id, Textbook.status.notin_(["processing", "failed"])).order_by(Textbook.uploaded_at.desc()).all()
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Uploads always belong to the authenticated user (client-supplied user_id must match).
    require_self_or_admin(user_id, current_user)
    user = current_user
    title = title.strip()[:200]
    if not title:
        raise HTTPException(status_code=400, detail="Title is required.")
    author = (author or "Unknown Author").strip()[:200]

    from services.knowledge_base_service import knowledge_base_service
    import re

    allowed_extensions = {
        ".pdf", ".docx", ".doc", ".xlsx", ".xls",
        ".txt", ".md", ".csv", ".png", ".jpg", ".jpeg", ".webp"
    }

    raw_filename = file.filename if (file and file.filename) else f"{title.lower().replace(' ', '_')}.pdf"
    # Prevent directory traversal attacks by taking basename and stripping non-alphanumerics
    safe_base = os.path.basename(raw_filename).strip()
    safe_base = re.sub(r"[^\w\s\.\-_]", "_", safe_base).lstrip(".")
    if not safe_base:
        safe_base = f"document_{int(datetime.utcnow().timestamp())}.pdf"

    ext = Path(safe_base).suffix.lower()
    if file and ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(sorted(allowed_extensions))}"
        )

    filename = safe_base

    # Read uploaded file content or generate starter document
    if file:
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        file_bytes = await file.read(max_bytes + 1)
        if len(file_bytes) > max_bytes:
            raise HTTPException(status_code=413, detail=f"File too large. Maximum is {settings.MAX_UPLOAD_SIZE_MB} MB.")
    else:
        # Fallback text representation
        default_content = (
            f"# {title}\nAuthor: {author or 'Academic Faculty'}\n\n"
            f"Foundational principles and advanced paradigms of {title}. "
            f"Covers system architecture, protocols, performance metrics, and compliance guidelines.\n"
        )
        file_bytes = default_content.encode("utf-8")
        clean_name = re.sub(r'[^\w\s\.\-_]', '_', title.lower()).strip() or 'document'
        filename = f"{clean_name}.txt"

    # Create the book right away as "processing" and finish the heavy work in the background, so a
    # large document never hits the proxy's request timeout (which showed up as a 502).
    size_mb = f"{max(0.1, round(len(file_bytes) / (1024 * 1024), 2))} MB"
    book = Textbook(
        user_id=user_id,
        title=title,
        author=author or "Academic Author",
        file_name=filename,
        file_size=size_mb,
        total_pages=0,
        status="processing",
        summary_data=None,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    book_id = book.id

    # Keep the original file for the preview pane.
    target_path = (UPLOADS_DIR / f"{book_id}_{filename}").resolve()
    if not target_path.is_relative_to(UPLOADS_DIR.resolve()):
        raise HTTPException(status_code=400, detail="Invalid target file destination.")
    try:
        with open(target_path, "wb") as f:
            f.write(file_bytes)
    except Exception as e:
        print(f"[WARN] Failed to write preview file to disk: {e}")

    _active.add(book_id)
    threading.Thread(
        target=_process_in_background,
        args=(book_id, file_bytes, filename, user_id, title, author or "Academic Author"),
        daemon=True,
    ).start()

    return JSONResponse(status_code=202, content={
        "success": True,
        "processing": True,
        "message": f"'{title}' uploaded. Processing has started.",
        "textbook": {
            "id": book_id,
            "title": title,
            "author": author or "Academic Author",
            "file_name": filename,
            "file_size": size_mb,
            "total_pages": 0,
            "status": "processing",
        },
    })


def _process_in_background(book_id: int, file_bytes: bytes, filename: str, user_id: int, title: str, author: str) -> None:
    """Parse, chunk, summarise and index one document; runs in its own thread with its own DB session."""
    from database.postgres import SessionLocal
    from services.knowledge_base_service import knowledge_base_service, UploadCancelled

    db = SessionLocal()
    try:
        with _process_slots:
            result = knowledge_base_service.ingest_document(
                file_bytes=file_bytes,
                filename=filename,
                user_id=user_id,
                title=title,
                author=author,
                db=db,
                should_cancel=lambda: book_id in _cancelled,
                existing_id=book_id,
            )
        try:
            session = ChatSession(user_id=user_id, textbook_id=book_id, session_title=f"Chat about {title}", message_count=2)
            db.add(session)
            db.commit()
            db.refresh(session)
            db.add(ChatMessage(chat_session_id=session.id, role="user", content=f"📎 Attached: {filename}"))
            db.add(ChatMessage(
                chat_session_id=session.id,
                role="assistant",
                content=f"✅ **{result['title']}** has been processed!\n\nThe summary and breakdown are on the right. Ask me anything about this document!",
            ))
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[WARN] Failed to save upload chat history: {e}")
        # Stage 2: the book is already searchable and visible; now read EVERY page for the full summary.
        try:
            from services.deep_summary import run_deep_summary
            parse_result = result.get("_parse_result")
            if parse_result is not None:
                sections = knowledge_base_service._build_document_sections(parse_result, title)
                run_deep_summary(
                    book_id=book_id,
                    pages=parse_result.pages,
                    sections=sections,
                    title=title,
                    filename=filename,
                    db=db,
                    should_cancel=lambda: book_id in _cancelled,
                )
        except Exception as e:
            print(f"[DEEP SUMMARY ERROR] Book {book_id}: {type(e).__name__}: {e}")
            try:
                db.rollback()
                row = db.get(Textbook, book_id)
                if row is not None and (row.summary_data or {}).get("summary_state") == "running":
                    data = dict(row.summary_data)
                    data["summary_state"] = "done"  # keep the quick summary rather than showing progress forever
                    row.summary_data = data
                    db.commit()
            except Exception:
                db.rollback()
    except UploadCancelled:
        pass  # the user deleted the book while it was processing; the pipeline already cleaned up
    except Exception as e:
        print(f"[UPLOAD ERROR] Processing book {book_id} failed: {type(e).__name__}: {e}")
        try:
            db.rollback()
            row = db.get(Textbook, book_id)
            if row is not None:
                row.status = "failed"
                row.summary_data = {"error": f"{type(e).__name__}: {str(e)[:200]}"}
                db.commit()
        except Exception:
            db.rollback()
    finally:
        _active.discard(book_id)
        _cancelled.discard(book_id)
        db.close()


@router.get("/{textbook_id}/status")
def get_textbook_status(textbook_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Polled by the app while a book is processing."""
    book = get_owned_textbook(db, textbook_id, current_user)
    status = book.status
    if status == "processing" and textbook_id not in _active:
        status = "failed"  # the worker is gone (server restarted); do not leave the user waiting
    payload = {"status": status}
    if status == "failed":
        payload["error"] = (book.summary_data or {}).get("error") or "Processing did not finish. Please upload the file again."
    if status == "processed":
        payload["textbook"] = {
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "file_name": book.file_name,
            "file_size": book.file_size,
            "total_pages": book.total_pages,
            "status": "processed",
            "summary": book.summary_data or {},
        }
    return payload


@router.get("/{textbook_id}/file")
def get_textbook_file(textbook_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Serve the raw file content or PDF for preview (owner only)."""
    book = get_owned_textbook(db, textbook_id, current_user)

    # Check disk for saved file securely
    for p in UPLOADS_DIR.glob(f"{textbook_id}_*"):
        p_resolved = p.resolve()
        if not p_resolved.is_relative_to(UPLOADS_DIR.resolve()):
            continue
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
        return FileResponse(
            path=p, media_type=media_type, filename=book.file_name, content_disposition_type="inline",
            headers={"X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox", "Cache-Control": "private, max-age=3600"},
        )

    # Final fallback response
    summary_text = (book.summary_data or {}).get("complete_summary", f"Document summary for {book.title}.")
    content = f"# {book.title}\nAuthor: {book.author}\n\n{summary_text}"
    return Response(content=content, media_type="text/plain")

@router.delete("/{textbook_id}")
def delete_textbook(textbook_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    book = get_owned_textbook(db, textbook_id, current_user)
    if textbook_id in _active:
        _cancelled.add(textbook_id)  # worker stops at its next checkpoint

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

