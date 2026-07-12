"""
Shared helpers for saving uploaded files to a temp directory and
cleaning them up afterward. Every tool router uses these so the
save/cleanup logic isn't duplicated per tool.
"""

import os
import uuid
import shutil
from pathlib import Path

from fastapi import UploadFile, HTTPException

TEMP_DIR = Path(__file__).parent.parent / "temp"
TEMP_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE_MB = 50
ALLOWED_PDF_TYPE = "application/pdf"


def validate_pdf(file: UploadFile) -> None:
    """Reject non-PDF uploads early, before any processing work happens."""
    if file.content_type != ALLOWED_PDF_TYPE:
        raise HTTPException(
            status_code=400,
            detail=f"'{file.filename}' is not a PDF. Only PDF files are accepted.",
        )


async def save_upload_to_temp(file: UploadFile) -> Path:
    """
    Save an uploaded file to a uniquely-named path inside temp/.
    Returns the saved file's path. Enforces a max size while streaming,
    so a huge upload doesn't fully buffer into memory first.
    """
    validate_pdf(file)

    dest_path = TEMP_DIR / f"{uuid.uuid4()}.pdf"
    size = 0
    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024

    with open(dest_path, "wb") as out_file:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > max_bytes:
                out_file.close()
                dest_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=413,
                    detail=f"'{file.filename}' exceeds the {MAX_FILE_SIZE_MB}MB limit.",
                )
            out_file.write(chunk)

    return dest_path


def new_temp_output_path(suffix: str = ".pdf") -> Path:
    """Generate a unique path in temp/ for a tool's output file."""
    return TEMP_DIR / f"{uuid.uuid4()}{suffix}"


def cleanup_paths(*paths: Path) -> None:
    """Delete temp files after they've been sent in the response."""
    for path in paths:
        try:
            if path.exists():
                path.unlink()
        except OSError:
            pass  # best-effort cleanup; don't crash the request over this


# ============================================================
# Session registry for comparison/preview features.
#
# Some features (before/after page comparison) need to look at a file
# again *after* the main request that created it has finished — e.g.
# the user picks a different page to compare minutes after compressing.
# Rather than keeping files forever, each registered file gets a
# session ID and a longer (but still bounded) expiry, after which a
# background sweep deletes it. This keeps the "files are automatically
# deleted" privacy promise intact while allowing brief follow-up access.
# ============================================================

import time
import threading

_SESSION_REGISTRY: dict[str, dict] = {}
_SESSION_LOCK = threading.Lock()
SESSION_TTL_SECONDS = 15 * 60  # 15 minutes — enough for a user to browse pages


def register_session_file(path: Path) -> str:
    """Register a file for short-lived follow-up access. Returns a session ID."""
    session_id = str(uuid.uuid4())
    with _SESSION_LOCK:
        _SESSION_REGISTRY[session_id] = {
            "path": path,
            "expires_at": time.time() + SESSION_TTL_SECONDS,
        }
    return session_id


def get_session_file(session_id: str) -> Path:
    """Look up a registered file by session ID. Raises 404 if missing/expired."""
    with _SESSION_LOCK:
        entry = _SESSION_REGISTRY.get(session_id)

    if not entry or time.time() > entry["expires_at"]:
        raise HTTPException(
            status_code=404,
            detail="This file is no longer available for preview (session expired).",
        )

    if not entry["path"].exists():
        raise HTTPException(status_code=404, detail="File not found.")

    return entry["path"]


def cleanup_expired_sessions() -> None:
    """Delete files whose session has expired. Call periodically."""
    now = time.time()
    with _SESSION_LOCK:
        expired_ids = [sid for sid, e in _SESSION_REGISTRY.items() if now > e["expires_at"]]
        for sid in expired_ids:
            entry = _SESSION_REGISTRY.pop(sid)
            try:
                if entry["path"].exists():
                    entry["path"].unlink()
            except OSError:
                pass
