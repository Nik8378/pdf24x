"""
Protect PDF — adds password protection using pikepdf.
Supports user password (open) and owner password (permissions).
"""
import pikepdf
from pikepdf import Permissions, Encryption
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from core.file_handling import save_upload_to_temp, new_temp_output_path, cleanup_paths

router = APIRouter()

@router.post("/protect")
async def protect_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_password: str = Form(...),
    owner_password: str = Form(""),
    allow_printing: bool = Form(True),
    allow_copying: bool = Form(False),
    allow_editing: bool = Form(False),
):
    if not user_password:
        raise HTTPException(status_code=400, detail="User password is required.")
    if len(user_password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters.")

    input_path = None
    output_path = new_temp_output_path(suffix="_protected.pdf")

    try:
        input_path = await save_upload_to_temp(file)
        owner_pwd = owner_password if owner_password else user_password + "_owner"

        pdf = pikepdf.open(str(input_path), allow_overwriting_input=False)
        permissions = Permissions(
            print_lowres=allow_printing,
            print_highres=allow_printing,
            extract=allow_copying,
            modify_other=allow_editing,
            modify_annotation=allow_editing,
            modify_assembly=False,
            modify_form=allow_editing,
        )
        encryption = Encryption(
            user=user_password,
            owner=owner_pwd,
            R=6,
            allow=permissions,
        )
        pdf.save(str(output_path), encryption=encryption)
        pdf.close()

    except HTTPException:
        raise
    except Exception as e:
        cleanup_paths(*(p for p in [input_path, output_path] if p))
        raise HTTPException(status_code=500, detail=f"Failed to protect PDF: {e}")

    background_tasks.add_task(cleanup_paths, input_path, output_path)

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename="protected.pdf",
    )
