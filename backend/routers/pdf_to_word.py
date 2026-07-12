"""
PDF to Word — converts a PDF into an editable .docx file using
pdf2docx, which analyzes page layout (text blocks, tables, images)
and reconstructs them as native Word content.

LICENSING NOTE: pdf2docx is licensed under AGPL-3.0. Running it as
part of a network service (this API) may carry source-disclosure
obligations under that license depending on how this product is
deployed and monetized. This has not yet been reviewed by a lawyer —
flagging here so it isn't forgotten before a real production launch.

LIMITATIONS (communicated to users on the frontend):
- Works best on standard single/simple-multi-column documents — letters,
  reports, articles with straightforward text and basic tables.
- Complex multi-column magazine-style layouts may not convert cleanly.
- Scanned/image-only PDFs are NOT supported — this requires OCR first,
  which is a separate, unimplemented feature. Such files will likely
  produce a near-empty or image-only docx.
- Complex tables, charts, and decorative vector graphics may lose
  structure or not transfer at all.
"""

from pdf2docx import Converter
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse

from core.file_handling import save_upload_to_temp, new_temp_output_path, cleanup_paths

router = APIRouter()


@router.post("/to-word")
async def pdf_to_word(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Accepts one PDF file. Returns a converted .docx file."""
    input_path = None
    output_path = new_temp_output_path(suffix="_converted.docx")

    try:
        input_path = await save_upload_to_temp(file)

        cv = Converter(str(input_path))
        cv.convert(str(output_path))
        cv.close()

        if not output_path.exists() or output_path.stat().st_size == 0:
            raise RuntimeError("Conversion produced an empty file.")

    except HTTPException:
        cleanup_paths(*(p for p in [input_path, output_path] if p))
        raise
    except Exception as e:
        cleanup_paths(*(p for p in [input_path, output_path] if p))
        raise HTTPException(
            status_code=500,
            detail=f"Conversion failed — this can happen with scanned or "
                   f"unusually complex PDFs. ({e})",
        )

    background_tasks.add_task(cleanup_paths, input_path, output_path)

    return FileResponse(
        path=output_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename="converted.docx",
    )
