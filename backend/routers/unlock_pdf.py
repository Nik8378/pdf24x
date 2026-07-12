"""
Unlock PDF — removes password protection from an encrypted PDF
using pikepdf, which properly handles PDF encryption unlike pdf-lib.
"""
import pikepdf
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from core.file_handling import save_upload_to_temp, new_temp_output_path, cleanup_paths

router = APIRouter()

@router.post("/unlock")
async def unlock_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    password: str = Form(""),
):
    input_path = None
    output_path = new_temp_output_path(suffix="_unlocked.pdf")

    try:
        input_path = await save_upload_to_temp(file)

        try:
            pdf = pikepdf.open(str(input_path), password=password)
        except pikepdf.PasswordError:
            raise HTTPException(status_code=400, detail="Incorrect password. Please try again.")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not open PDF: {e}")

        pdf.save(str(output_path))
        pdf.close()

    except HTTPException:
        cleanup_paths(*(p for p in [input_path, output_path] if p))
        raise
    except Exception as e:
        cleanup_paths(*(p for p in [input_path, output_path] if p))
        raise HTTPException(status_code=500, detail=f"Failed to unlock PDF: {e}")

    background_tasks.add_task(cleanup_paths, input_path, output_path)

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename="unlocked.pdf",
    )
