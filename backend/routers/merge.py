"""
Merge PDF — combines multiple uploaded PDFs into a single output file,
in the order they were uploaded (matching the frontend's drag-to-reorder
list, since the order files arrive in the request is the order the
frontend already sorted them into).
"""

from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pypdf import PdfWriter

from core.file_handling import save_upload_to_temp, new_temp_output_path, cleanup_paths

router = APIRouter()


@router.post("/merge")
async def merge_pdfs(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
):
    """
    Accepts 2+ PDF files (multipart/form-data, field name "files",
    repeated). Returns the merged PDF as a downloadable file.
    """
    if len(files) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 PDF files are required to merge.",
        )

    saved_input_paths = []
    output_path = new_temp_output_path(suffix="_merged.pdf")

    try:
        # Save every upload to disk first — pypdf reads from file paths,
        # and this also means a bad file fails validation before we do
        # any actual merge work.
        for upload in files:
            saved_input_paths.append(await save_upload_to_temp(upload))

        writer = PdfWriter()
        for path in saved_input_paths:
            writer.append(str(path))

        with open(output_path, "wb") as out_file:
            writer.write(out_file)
        writer.close()

    except HTTPException:
        cleanup_paths(*saved_input_paths, output_path)
        raise
    except Exception as e:
        cleanup_paths(*saved_input_paths, output_path)
        raise HTTPException(status_code=500, detail=f"Merge failed: {e}")

    # Clean up every temp file (inputs + output) after the response has
    # been sent — BackgroundTasks runs this after the client has the file.
    background_tasks.add_task(cleanup_paths, *saved_input_paths, output_path)

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename="merged.pdf",
    )
