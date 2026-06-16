import base64
import os
import tempfile
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from paddleocr import PaddleOCR


class OcrRequest(BaseModel):
    image: str | None = None
    imageBase64: str | None = None


app = FastAPI(title="BudgetBrain PaddleOCR Service")
ocr = PaddleOCR(use_angle_cls=True, lang=os.getenv("PADDLEOCR_LANG", "korean"))


def require_api_key(authorization: str | None) -> None:
    expected_key = os.getenv("OCR_API_KEY")
    if not expected_key:
        return

    if authorization != f"Bearer {expected_key}":
        raise HTTPException(status_code=401, detail="Invalid OCR API key.")


def decode_image(payload: OcrRequest) -> bytes:
    encoded = payload.imageBase64 or payload.image
    if not encoded:
        raise HTTPException(status_code=400, detail="image or imageBase64 is required.")

    if "," in encoded and encoded.lower().startswith("data:image/"):
        encoded = encoded.split(",", 1)[1]

    try:
        return base64.b64decode(encoded, validate=True)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid base64 image.") from exc


def flatten_paddle_result(result: Any) -> list[dict[str, Any]]:
    lines: list[dict[str, Any]] = []

    for page in result or []:
        for item in page or []:
            if not item or len(item) < 2:
                continue

            box = item[0]
            text_meta = item[1]
            text = ""
            confidence = None

            if isinstance(text_meta, (list, tuple)) and text_meta:
                text = str(text_meta[0]).strip()
                if len(text_meta) > 1:
                    confidence = float(text_meta[1])
            elif isinstance(text_meta, str):
                text = text_meta.strip()

            if text:
                lines.append({
                    "text": text,
                    "confidence": confidence,
                    "box": box,
                })

    return lines


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "provider": "PaddleOCR"}


@app.post("/ocr")
def read_receipt(payload: OcrRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    require_api_key(authorization)
    image_bytes = decode_image(payload)

    suffix = ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
        temp.write(image_bytes)
        temp_path = temp.name

    try:
        result = ocr.ocr(temp_path, cls=True)
        lines = flatten_paddle_result(result)
        text = "\n".join(line["text"] for line in lines)
        return {
            "provider": "PaddleOCR",
            "text": text,
            "lines": lines,
        }
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass
