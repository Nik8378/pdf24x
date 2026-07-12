"""
Render PDF page — returns a single PDF page rasterized as a PNG image.
Used by the before/after comparison feature: given a session_id (from
a previous compress/merge/etc. response) and a page number, returns
that page as an image so the frontend can show visual comparisons
without needing the browser's native PDF viewer.
"""

import fitz
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

from core.file_handling import get_session_file

router = APIRouter()

# Render at a fixed zoom for consistent, reasonably-sized comparison
# images — high enough to judge quality, not so high it's slow/heavy.
RENDER_ZOOM = 1.5


@router.get("/render-page")
async def render_page(
    session_id: str = Query(..., description="Session ID from a previous tool response"),
    page: int = Query(1, ge=1, description="1-indexed page number to render"),
):
    """Returns the requested page as a PNG image."""
    file_path = get_session_file(session_id)

    try:
        doc = fitz.open(str(file_path))

        if page > doc.page_count:
            raise HTTPException(
                status_code=400,
                detail=f"Page {page} doesn't exist — this file has {doc.page_count} page(s).",
            )

        pdf_page = doc[page - 1]  # convert to 0-indexed
        matrix = fitz.Matrix(RENDER_ZOOM, RENDER_ZOOM)
        pix = pdf_page.get_pixmap(matrix=matrix)
        png_bytes = pix.tobytes("png")
        doc.close()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to render page: {e}")

    return Response(content=png_bytes, media_type="image/png")
