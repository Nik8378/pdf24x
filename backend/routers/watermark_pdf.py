"""
Watermark PDF — draws text watermark directly on PDF canvas using PyMuPDF.
"""
import fitz
import math
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

            # Get text width
            tw = fitz.get_text_length(text.strip(), fontname="helv", fontsize=font_size)

            # Position mapping
            if position == "center":
                cx, cy = w / 2, h / 2
            elif position == "top-left":
                cx, cy = w * 0.2, h * 0.85
            elif position == "top-right":
                cx, cy = w * 0.8, h * 0.85
            elif position == "bottom-left":
                cx, cy = w * 0.2, h * 0.15
            elif position == "bottom-right":
                cx, cy = w * 0.8, h * 0.15
            else:
                cx, cy = w / 2, h / 2

            # Draw text using shape for better control
            angle_rad = math.radians(rotation)
            
            # Insert text at position
            page.insert_text(
                fitz.Point(cx - tw / 2, cy + font_size / 3),
                text.strip(),
                fontname="helv",
                fontsize=font_size,
                color=rgb,
                rotate=rotation,
                render_mode=3,  # invisible (stroke only) - try 0 for fill
            )
            
            # Actually use a Shape to draw with proper opacity
            shape = page.new_shape()
            shape.insert_text(
                fitz.Point(cx - tw / 2, cy + font_size / 3),
                text.strip(),
                fontname="helv",
                fontsize=font_size,
                color=rgb,
                rotate=rotation,
                render_mode=0,
            )
            shape.finish(fill=rgb, color=rgb, fill_opacity=opacity, stroke_opacity=opacity)
            shape.commit()

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
