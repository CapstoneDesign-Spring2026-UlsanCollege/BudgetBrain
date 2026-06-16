# BudgetBrain PaddleOCR Service

This is a separate OCR API for BudgetBrain receipt scanning. It runs PaddleOCR in a Dockerized FastAPI service.

## Endpoints

- `GET /health`
- `POST /ocr`

Request body:

```json
{
  "image": "data:image/jpeg;base64,...",
  "imageBase64": "..."
}
```

Response:

```json
{
  "provider": "PaddleOCR",
  "text": "Grand Total 450\nMilk 100\nRice 350",
  "lines": []
}
```

## Deploy On Render

1. Push this repo to GitHub.
2. Open Render dashboard.
3. New -> Blueprint.
4. Select this repository.
5. Render will read the root `render.yaml` and build `paddleocr-service`.
6. After deployment, copy the public URL.

Use this value in Vercel:

```env
PADDLEOCR_API_URL=https://budgetbrain-paddleocr.onrender.com/ocr
PADDLEOCR_API_KEY=<Render generated OCR_API_KEY value>
```

If you remove `OCR_API_KEY` from Render, leave `PADDLEOCR_API_KEY` empty in Vercel.

For Korean receipts, keep this value in the PaddleOCR service environment:

```env
PADDLEOCR_LANG=korean
```

The BudgetBrain app also normalizes common receipt labels into English, Nepali, and Korean during review.

## Local Run

```sh
cd paddleocr-service
docker build -t budgetbrain-paddleocr .
docker run -p 8000:8000 budgetbrain-paddleocr
```

Then set:

```env
PADDLEOCR_API_URL=http://localhost:8000/ocr
```
