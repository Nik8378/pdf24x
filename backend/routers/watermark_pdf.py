"""
Watermark PDF — adds text watermark using PyMuPDF with proper transparency.
"""
import fitz
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from core.file_handling import save_upload_to_temp, new_temp_output_path, cleanup_paths

router = APIRouter()

def hex_to_rgb(hex_color: str):
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16) / 255.0
    g = int(hex_color[2:4], 16) / 255.0
    b = int(hex_color[4:6], 16) / 255.0
    return (r, g, b)

@router.post("/watermark")
async def watermark_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    text: str = Form("CONFIDENTIAL"),
    font_size: int = Form(48),
    opacity: float = Form(0.3),
    color: str = Form("#FF0000"),
    rotation: int = Form(0),
    position: str = Form("center"),
    pages: str = Form("all"),
):
    if not text.strip():
        raise HTTPException(status_code=400, detail="Watermark text cannot be empty.")

    input_path = None
    output_path = new_temp_output_path(suffix="_watermarked.pdf")

    try:
        input_path = await save_upload_to_temp(file)
        rgb = hex_to_rgb(color)
        doc = fitz.open(str(input_path))

        # Page selection
        if pages == "all":
            page_indices = list(range(len(doc)))
        elif pages == "odd":
            page_indices = list(range(0, len(doc), 2))
        elif pages == "even":
            page_indices = list(range(1, len(doc), 2))
        else:
            page_indices = list(range(len(doc)))

        for i in page_indices:
            page = doc[i]
            w, h = page.rect.width, page.rect.height

            # Create a new overlay page for the watermark
            # Use insert_textbox with a full-page rect for center
            # or positioned rect for corners
            
            if position == "center":
                # Full page rect, centered
                rect = fitz.Rect(0, 0, w, h)
                align = fitz.TEXT_ALIGN_CENTER
                # Adjust y for vertical centering
                rect = fitz.Rect(0, (h - font_size * 1.5) / 2, w, (h + font_size * 1.5) / 2)
            elif position == "top-left":
                rect = fitz.Rect(20, h - font_size * 2, w * 0.6, h - 10)
                align = fitz.TEXT_ALIGN_LEFT
            elif position == "top-right":
                rect = fitz.Rect(w * 0.4, h - font_size * 2, w - 20, h - 10)
                align = fitz.TEXT_ALIGN_RIGHT
            elif position == "bottom-left":
                rect = fitz.Rect(20, 10, w * 0.6, font_size * 2)
                align = fitz.TEXT_ALIGN_LEFT
            elif position == "bottom-right":
                rect = fitz.Rect(w * 0.4, 10, w - 20, font_size * 2)
                align = fitz.TEXT_ALIGN_RIGHT
            else:
                rect = fitz.Rect(0, (h - font_size * 1.5) / 2, w, (h + font_size * 1.5) / 2)
                align = fitz.TEXT_ALIGN_CENTER

            # Valid rotations for insert_textbox: 0, 90, 180, 270
            valid_rotations = {0: 0, 45: 0, 90: 90, 180: 180, 270: 270, 315: 270, -45: 0, -90: 270}
            safe_rotation = valid_rotations.get(rotation, 0)

            page.insert_textbox(
                rect,
                text.strip(),
                fontsize=font_size,
                fontname="helv",
                color=rgb,
                rotate=safe_rotation,
                align=align if safe_rotation == 0 else fitz.TEXT_ALIGN_CENTER,
                fill_opacity=opacity,
                overlay=True,
            )

        doc.save(str(output_path), garbage=4, deflate=True)
        doc.close()

    except HTTPException:
        raise
    except Exception as e:
        cleanup_paths(*(p for p in [input_path, output_path] if p))
        raise HTTPException(status_code=500, detail=f"Failed to add watermark: {e}")

    background_tasks.add_task(cleanup_paths, input_path, output_path)

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename="watermarked.pdf",
    )
