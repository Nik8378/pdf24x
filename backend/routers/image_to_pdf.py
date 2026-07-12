"""
Image to PDF — combines one or more images into a single PDF, one
image per page, in the order received. Each image is scaled to fit
centered on a standard A4 page, preserving aspect ratio.
"""

import io
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from PIL import Image, ImageOps

from core.file_handling import new_temp_output_path, cleanup_paths

router = APIRouter()

A4_WIDTH_PX = 1240
A4_HEIGHT_PX = 1754

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}
MAX_IMAGE_SIZE_MB = 25


def _fit_image_to_page(img: Image.Image) -> Image.Image:
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    img_ratio = img.width / img.height
    page_ratio = A4_WIDTH_PX / A4_HEIGHT_PX

    if img_ratio > page_ratio:
        new_width = A4_WIDTH_PX
        new_height = int(A4_WIDTH_PX / img_ratio)
    else:
        new_height = A4_HEIGHT_PX
        new_width = int(A4_HEIGHT_PX * img_ratio)

    resized = img.resize((new_width, new_height), Image.LANCZOS)

    canvas = Image.new("RGB", (A4_WIDTH_PX, A4_HEIGHT_PX), "white")
    offset_x = (A4_WIDTH_PX - new_width) // 2
    offset_y = (A4_HEIGHT_PX - new_height) // 2
    canvas.paste(resized, (offset_x, offset_y))

    return canvas


@router.post("/image-to-pdf")
async def image_to_pdf(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
):
    if not files:
        raise HTTPException(status_code=400, detail="No images provided.")

    pages = []
    max_bytes = MAX_IMAGE_SIZE_MB * 1024 * 1024

    try:
        for upload in files:
            if upload.content_type not in ALLOWED_IMAGE_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"'{upload.filename}' isn't a supported image type (JPEG, PNG, WebP, HEIC).",
                )

            contents = await upload.read()
            if len(contents) > max_bytes:
                raise HTTPException(
                    status_code=413,
                    detail=f"'{upload.filename}' exceeds the {MAX_IMAGE_SIZE_MB}MB limit.",
                )

            img = Image.open(io.BytesIO(contents))
            page = _fit_image_to_page(img)
            pages.append(page)

        if not pages:
            raise HTTPException(status_code=400, detail="No valid images to convert.")

        output_path = new_temp_output_path(suffix=".pdf")
        first_page, *rest_pages = pages
        first_page.save(str(output_path), "PDF", save_all=True, append_images=rest_pages)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {e}")

    background_tasks.add_task(cleanup_paths, output_path)

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename="images.pdf",
    )
