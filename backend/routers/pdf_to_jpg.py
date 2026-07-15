"""
PDF to JPG — rasterizes every page of a PDF into a JPG image, at a
chosen quality/resolution. If the PDF has exactly one page, returns
that single JPG directly. Otherwise, bundles all pages into a zip —
same pattern as Split PDF for consistency.
"""

import io
import zipfile

import fitz
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse

from core.file_handling import save_upload_to_temp, new_temp_output_path, cleanup_paths

router = APIRouter()

# level -> (zoom factor, JPEG quality). Zoom 1.0 ≈ 72 DPI (PDF default);
# higher zoom = higher effective DPI = larger, sharper image.
QUALITY_LEVELS = {
    "low": (1.0, 70),
    "medium": (2.0, 85),
    "high": (3.0, 95),
}


@router.post("/to-jpg")
async def pdf_to_jpg(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    quality: str = Form("medium"),
):
    """Accepts one PDF file plus a `quality` field (low|medium|high)."""
    if quality not in QUALITY_LEVELS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid quality '{quality}'. Use low, medium, or high.",
        )

    zoom, jpeg_quality = QUALITY_LEVELS[quality]
    input_path = None

    try:
        input_path = await save_upload_to_temp(file)
        doc = fitz.open(str(input_path))
        page_count = len(doc)

        if page_count == 0:
            raise HTTPException(status_code=400, detail="This PDF has no pages.")

        matrix = fitz.Matrix(zoom, zoom)
        jpg_pages = []

        for page in doc:
            pix = page.get_pixmap(matrix=matrix)
            jpg_bytes = pix.tobytes("jpeg", jpg_quality=jpeg_quality)
            jpg_pages.append(jpg_bytes)

        doc.close()

    except HTTPException:
        cleanup_paths(*(p for p in [input_path] if p))
        raise
    except Exception as e:
        cleanup_paths(*(p for p in [input_path] if p))
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")

    # Single page -> return the JPG directly.
    if page_count == 1:
        output_path = new_temp_output_path(suffix=".jpg")
        with open(output_path, "wb") as f:
            f.write(jpg_pages[0])
        background_tasks.add_task(cleanup_paths, input_path, output_path)
        return FileResponse(
            path=output_path,
            media_type="image/jpeg",
            filename="page.jpg",
            headers={"X-Output-Count": "1"},
        )

    # Multiple pages -> bundle into a zip.
    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, jpg_bytes in enumerate(jpg_pages, start=1):
            zf.writestr(f"page_{i}.jpg", jpg_bytes)
    zip_buf.seek(0)

    background_tasks.add_task(cleanup_paths, input_path)

    return StreamingResponse(
        zip_buf,
        media_type="application/zip",
        headers={
            "Content-Disposition": "attachment; filename=pages.zip",
            "X-Output-Count": str(page_count),
        },
    )
