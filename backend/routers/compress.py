"""
Compress PDF — reduces file size using Ghostscript, the same
battle-tested compression engine used by many production PDF tools.

After extensive testing, hand-rolling image recompression via
PyMuPDF (resize + re-encode + replace_image/insert_image) proved
unreliable on certain real-world files — edge cases involving soft
masks, unusual aspect ratios, and content-stream z-ordering could
cause images or overlaid content to render incorrectly. Ghostscript
handles all of this correctly since it operates on the PDF's actual
rendering pipeline rather than manipulating image objects directly.

Two modes:
  1. Manual level ("low" | "medium" | "high") — maps to Ghostscript's
     /screen, /ebook, /printer presets respectively.
  2. Target size (target_kb) — tries image-DPI settings from mild to
     aggressive until the output is at or under the target.

SAFEGUARD: on some already-optimized files, Ghostscript's re-encoding
can occasionally produce a slightly LARGER file than the original. If
that happens, we serve the original file unchanged instead — a
"compression" that increases file size isn't useful to anyone.
"""

import shutil
import subprocess
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import fitz  # only used for page count metadata, not image manipulation

from core.file_handling import (
    save_upload_to_temp,
    new_temp_output_path,
    cleanup_paths,
    register_session_file,
)

router = APIRouter()

GHOSTSCRIPT_BIN = "gs"  # must be on PATH — see README for install instructions

LEVEL_PRESETS = {
    "low": "/printer",
    "medium": "/ebook",
    "high": "/screen",
}

TARGET_SIZE_DPI_STEPS = [200, 150, 120, 100, 85, 72, 60, 50]


def _run_ghostscript(input_path, output_path, preset: str = None, image_dpi: int = None):
    cmd = [
        GHOSTSCRIPT_BIN,
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
    ]

    if preset:
        cmd.append(f"-dPDFSETTINGS={preset}")
    elif image_dpi:
        cmd += [
            "-dDownsampleColorImages=true",
            f"-dColorImageResolution={image_dpi}",
            "-dDownsampleGrayImages=true",
            f"-dGrayImageResolution={image_dpi}",
            "-dDownsampleMonoImages=true",
            f"-dMonoImageResolution={image_dpi}",
            "-dColorImageDownsampleType=/Average",
            "-dGrayImageDownsampleType=/Average",
        ]

    cmd += [
        f"-sOutputFile={output_path}",
        str(input_path),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

    if result.returncode != 0:
        raise RuntimeError(f"Ghostscript failed: {result.stderr[:500]}")


@router.post("/compress")
async def compress_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    level: str = Form(None),
    target_kb: int = Form(None),
):
    if not level and not target_kb:
        raise HTTPException(
            status_code=400,
            detail="Provide either 'level' or 'target_kb'.",
        )

    if level and level not in LEVEL_PRESETS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid compression level '{level}'. Use low, medium, or high.",
        )

    input_path = None
    output_path = new_temp_output_path(suffix="_compressed.pdf")
    target_reached = True
    info_label = None
    fellback_to_original = False

    try:
        input_path = await save_upload_to_temp(file)
        original_size = input_path.stat().st_size

        if target_kb:
            target_bytes = target_kb * 1024
            target_reached = False

            for dpi in TARGET_SIZE_DPI_STEPS:
                _run_ghostscript(input_path, output_path, image_dpi=dpi)
                result_size = output_path.stat().st_size

                if result_size <= target_bytes:
                    target_reached = True
                    info_label = f"target reached at {dpi} DPI image resolution"
                    break
            else:
                info_label = "target not reached - file size is mostly non-image content"

        else:
            preset = LEVEL_PRESETS[level]
            _run_ghostscript(input_path, output_path, preset=preset)
            info_label = f"level={level}"

        final_size = output_path.stat().st_size

        # Safeguard: never return a "compressed" file that's larger
        # than the original — fall back to serving the original as-is.
        if final_size >= original_size:
            shutil.copyfile(input_path, output_path)
            final_size = original_size
            fellback_to_original = True
            info_label = (info_label or "") + " (already optimal - original kept)"

        page_count = fitz.open(str(input_path)).page_count

    except HTTPException:
        cleanup_paths(*(p for p in [input_path, output_path] if p))
        raise
    except Exception as e:
        cleanup_paths(*(p for p in [input_path, output_path] if p))
        raise HTTPException(status_code=500, detail=f"Compression failed: {e}")

    original_session_id = register_session_file(input_path)
    compressed_session_id = register_session_file(output_path)

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename="compressed.pdf",
        headers={
            "X-Compression-Info": info_label,
            "X-Target-Reached": str(target_reached).lower(),
            "X-Original-Size": str(original_size),
            "X-Final-Size": str(final_size),
            "X-Page-Count": str(page_count),
            "X-Original-Session-Id": original_session_id,
            "X-Compressed-Session-Id": compressed_session_id,
            "X-Fellback-To-Original": str(fellback_to_original).lower(),
        },
    )
