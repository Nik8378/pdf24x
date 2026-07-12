"""
PDF info — lightweight endpoint that returns basic metadata (just the
page count, for now) without rendering or processing anything. Used by
tools like Split PDF to bootstrap a thumbnail grid before any images
are fetched.
"""

import fitz
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks

from core.file_handling import save_upload_to_temp, cleanup_paths, register_session_file

router = APIRouter()


@router.post("/info")
async def get_pdf_info(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """
    Accepts one PDF file. Returns its page count and a session_id that
    can be used with /api/pdf/render-page to fetch individual page
    thumbnails on demand, without re-uploading the file.
    """
    input_path = None

    try:
        input_path = await save_upload_to_temp(file)
        doc = fitz.open(str(input_path))
        page_count = len(doc)
        doc.close()
    except HTTPException:
        cleanup_paths(*(p for p in [input_path] if p))
        raise
    except Exception as e:
        cleanup_paths(*(p for p in [input_path] if p))
        raise HTTPException(status_code=500, detail=f"Failed to read PDF: {e}")

    session_id = register_session_file(input_path)

    return {
        "page_count": page_count,
        "session_id": session_id,
    }
