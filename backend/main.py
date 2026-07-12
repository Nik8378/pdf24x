from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import merge, compress, analyze, render, split, info, pdf_to_word, pdf_to_jpg, image_to_pdf, unlock_pdf, protect_pdf, watermark_pdf

app = FastAPI(title="PDF24X API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://pdf24x.com", "https://www.pdf24x.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(merge.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(compress.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(analyze.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(render.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(split.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(info.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(pdf_to_word.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(pdf_to_jpg.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(image_to_pdf.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(unlock_pdf.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(protect_pdf.router, prefix="/api/pdf", tags=["pdf"])
app.include_router(watermark_pdf.router, prefix="/api/pdf", tags=["pdf"])

@app.get("/")
def health_check():
    return {"status": "ok", "service": "PDF24X API"}
