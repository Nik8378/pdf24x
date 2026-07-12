"""
Analyze PDF — lightweight inspection endpoint that suggests a
compression level based on the file's actual composition, without
doing any real compression work. Used by the frontend right after
upload to show a "Suggested: Medium" hint before the user picks a
level themselves.
"""

import fitz
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks

from core.file_handling import save_upload_to_temp, cleanup_paths

router = APIRouter()


def _suggest_level(image_bytes_ratio: float, page_count: int) -> tuple[str, str]:
    """
    Returns (suggested_level, human_readable_reason) based on how much
    of the file's size actually comes from raster images.

    Reasoning: compression only meaningfully shrinks raster images, so
    a file that's mostly text/vector content won't benefit much from
    aggressive settings — High is "free" quality-wise there. A file
    that's mostly images benefits most from Medium (a real size/quality
    balance), since High would visibly degrade photos that matter.
    """
    if image_bytes_ratio < 0.15:
        return (
            "high",
            "This file is mostly text or vector content — High compression "
            "won't noticeably affect quality.",
        )
    elif image_bytes_ratio < 0.50:
        return (
            "medium",
            "This file has a moderate amount of images — Medium gives a "
            "good size reduction while keeping them sharp.",
        )
    else:
        return (
            "medium",
            "This file is photo-heavy — Medium is recommended to balance "
            "file size and image quality. High may visibly degrade photos.",
        )


@router.post("/analyze")
async def analyze_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """
    Accepts one PDF file. Returns composition stats and a suggested
    compression level — does NOT compress or modify the file.
    """
    input_path = None

    try:
        input_path = await save_upload_to_temp(file)
        original_size = input_path.stat().st_size

        doc = fitz.open(str(input_path))
        page_count = len(doc)
        total_image_bytes = 0
        image_count = 0

        for page in doc:
            for img in page.get_images(full=True):
                xref = img[0]
                try:
                    base_image = doc.extract_image(xref)
                    total_image_bytes += len(base_image["image"])
                    image_count += 1
                except Exception:
                    continue

        doc.close()

        image_bytes_ratio = total_image_bytes / original_size if original_size else 0
        suggested_level, reason = _suggest_level(image_bytes_ratio, page_count)

    except HTTPException:
        cleanup_paths(*(p for p in [input_path] if p))
        raise
    except Exception as e:
        cleanup_paths(*(p for p in [input_path] if p))
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    background_tasks.add_task(cleanup_paths, input_path)

    return {
        "page_count": page_count,
        "image_count": image_count,
        "original_size_bytes": original_size,
        "image_bytes_ratio": round(image_bytes_ratio, 3),
        "suggested_level": suggested_level,
        "reason": reason,
    }
