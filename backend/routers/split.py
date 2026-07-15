"""
Split PDF — divides one PDF into multiple files, three ways:

  1. mode=ranges  + ranges="1-3,5,8-10"   -> one output PDF per range
  2. mode=every_n + n=2                    -> chunks of N consecutive pages
  3. mode=extract + pages="1,3,5"          -> one output PDF per listed page

If the operation produces exactly one output file, that PDF is returned
directly. If it produces multiple, they're bundled into a single zip.
"""

import io
import zipfile
from typing import List, Tuple

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from pypdf import PdfReader, PdfWriter

from core.file_handling import save_upload_to_temp, new_temp_output_path, cleanup_paths

router = APIRouter()


def _parse_ranges(ranges_str: str, page_count: int) -> List[Tuple[int, int]]:
    """
    Parses a string like "1-3,5,8-10" into a list of 0-indexed
    (start, end_inclusive) tuples. Raises HTTPException on invalid input.
    """
    if not ranges_str or not ranges_str.strip():
        raise HTTPException(status_code=400, detail="No page ranges provided.")

    result = []
    for part in ranges_str.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            try:
                start_str, end_str = part.split("-", 1)
                start, end = int(start_str), int(end_str)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid range: '{part}'")
        else:
            try:
                start = end = int(part)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid page number: '{part}'")

        if start < 1 or end < 1 or start > end:
            raise HTTPException(status_code=400, detail=f"Invalid range: '{part}'")
        if start > page_count or end > page_count:
            raise HTTPException(
                status_code=400,
                detail=f"Range '{part}' is out of bounds — this PDF has {page_count} pages.",
            )

        result.append((start - 1, end - 1))  # convert to 0-indexed

    if not result:
        raise HTTPException(status_code=400, detail="No valid page ranges found.")

    return result


def _parse_page_list(pages_str: str, page_count: int) -> List[int]:
    """Parses "1,3,5" into a sorted list of 0-indexed page numbers."""
    if not pages_str or not pages_str.strip():
        raise HTTPException(status_code=400, detail="No pages provided.")

    pages = []
    for part in pages_str.split(","):
        part = part.strip()
        if not part:
            continue
        try:
            page_num = int(part)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid page number: '{part}'")

        if page_num < 1 or page_num > page_count:
            raise HTTPException(
                status_code=400,
                detail=f"Page {page_num} is out of bounds — this PDF has {page_count} pages.",
            )
        pages.append(page_num - 1)

    if not pages:
        raise HTTPException(status_code=400, detail="No valid pages found.")

    return pages


def _build_pdf_bytes(reader: PdfReader, page_indices: List[int]) -> bytes:
    """Builds a single PDF (as bytes) containing exactly the given pages, in order."""
    writer = PdfWriter()
    for idx in page_indices:
        writer.add_page(reader.pages[idx])
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


@router.post("/split")
async def split_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    mode: str = Form(...),
    ranges: str = Form(None),
    n: int = Form(None),
    pages: str = Form(None),
):
    if mode not in ("ranges", "every_n", "extract"):
        raise HTTPException(
            status_code=400,
            detail="mode must be 'ranges', 'every_n', or 'extract'.",
        )

    input_path = None

    try:
        input_path = await save_upload_to_temp(file)
        reader = PdfReader(str(input_path))
        page_count = len(reader.pages)

        # Build a list of page-index-lists — each inner list becomes
        # one output file.
        output_groups: List[List[int]] = []

        if mode == "ranges":
            parsed_ranges = _parse_ranges(ranges, page_count)
            for start, end in parsed_ranges:
                output_groups.append(list(range(start, end + 1)))

        elif mode == "every_n":
            if not n or n < 1:
                raise HTTPException(status_code=400, detail="'n' must be a positive integer.")
            for i in range(0, page_count, n):
                output_groups.append(list(range(i, min(i + n, page_count))))

        elif mode == "extract":
            page_indices = _parse_page_list(pages, page_count)
            # Each extracted page becomes its own output file.
            for idx in page_indices:
                output_groups.append([idx])

        if not output_groups:
            raise HTTPException(status_code=400, detail="This produced no output files.")

        # Single output -> return the PDF directly.
        if len(output_groups) == 1:
            pdf_bytes = _build_pdf_bytes(reader, output_groups[0])
            output_path = new_temp_output_path(suffix="_split.pdf")
            with open(output_path, "wb") as f:
                f.write(pdf_bytes)
            background_tasks.add_task(cleanup_paths, input_path, output_path)
            return FileResponse(
                path=output_path,
                media_type="application/pdf",
                filename="split.pdf",
                headers={"X-Output-Count": "1"},
            )

        # Multiple outputs -> bundle into a zip.
        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for i, group in enumerate(output_groups, start=1):
                pdf_bytes = _build_pdf_bytes(reader, group)
                zf.writestr(f"split_{i}.pdf", pdf_bytes)
        zip_buf.seek(0)

        background_tasks.add_task(cleanup_paths, input_path)

        return StreamingResponse(
            zip_buf,
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=split_files.zip",
                "X-Output-Count": str(len(output_groups)),
            },
        )

    except HTTPException:
        cleanup_paths(*(p for p in [input_path] if p))
        raise
    except Exception as e:
        cleanup_paths(*(p for p in [input_path] if p))
        raise HTTPException(status_code=500, detail=f"Split failed: {e}")
