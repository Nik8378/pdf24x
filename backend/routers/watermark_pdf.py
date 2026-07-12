"""
Watermark PDF — adds text watermark to every page using PyMuPDF.
Supports position, color, opacity, font size, and rotation.
"""
import fitz  # PyMuPDF
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from core.file_handling import save_upload_to_temp, new_temp_output_path, cleanup_paths

router = APIRouter()

def hex_to_rgb(hex_color: str):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))

@router.post("/watermark")
async def watermark_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    text: str = Form("CONFIDENTIAL"),
    font_size: int = Form(48),
    opacity: float = Form(0.3),
    color: str = Form("#FF0000"),
    rotation: int = Form(-45),
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

        page_indices = []
        if pages == "all":
            page_indices = list(range(len(doc)))
        elif pages == "odd":
            page_indices = list(range(0, len(doc), 2))
        elif pages == "even":
            page_indices = list(range(1, len(doc), 2))
        else:
            try:
                page_indices = [int(p.strip()) - 1 for p in pages.split(",") if p.strip().isdigit()]
                page_indices = [i for i in page_indices if 0 <= i < len(doc)]
            except:
                page_indices = list(range(len(doc)))

        for i in page_indices:
            page = doc[i]
            rect = page.rect
            w, h = rect.width, rect.height

            if position == "center":
                x, y = w / 2, h / 2
            elif position == "top-left":
                x, y = w * 0.15, h * 0.85
            elif position == "top-right":
                x, y = w * 0.85, h * 0.85
            elif position == "bottom-left":
                x, y = w * 0.15, h * 0.15
            elif position == "bottom-right":
                x, y = w * 0.85, h * 0.15
            else:
                x, y = w / 2, h / 2

            # PyMuPDF insert_text only supports 0/90/180/270 rotation
            # Use insert_textbox with a rotated rect for arbitrary angles
            # Snap rotation to nearest supported value
            snap = min([0, 90, 180, 270], key=lambda v: abs(v - (rotation % 360)))
            
            # Calculate text width estimate
            text_width = len(text) * font_size * 0.6
            text_height = font_size * 1.2
            
            # Create rect centered at position
            x1 = max(0, x - text_width / 2)
            y1 = max(0, y - text_height / 2)
            x2 = min(w, x + text_width / 2)
            y2 = min(h, y + text_height / 2)
            
            rect_obj = fitz.Rect(x1, y1, x2, y2)
            
            page.insert_textbox(
                rect_obj,
                text,
                fontsize=font_size,
                color=rgb,
                rotate=snap,
                fill_opacity=opacity,
                align=fitz.TEXT_ALIGN_CENTER,
            )

        doc.save(str(output_path))
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
