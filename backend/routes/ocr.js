const express = require('express');

const router = express.Router();

function collectText(value, output = []) {
  if (!value) return output;

  if (typeof value === 'string') {
    if (value.trim()) output.push(value.trim());
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectText(item, output));
    return output;
  }

  if (typeof value === 'object') {
    const directText = value.text || value.label || value.transcription || value.rec_text || value.ocr_text;
    if (typeof directText === 'string' && directText.trim()) {
      output.push(directText.trim());
    }

    Object.entries(value).forEach(([key, nested]) => {
      if (['box', 'bbox', 'points', 'score', 'confidence'].includes(key)) return;
      if (nested !== directText) collectText(nested, output);
    });
  }

  return output;
}

function normalizeOcrText(payload) {
  const preferred = payload?.text
    || payload?.fullText
    || payload?.ocrText
    || payload?.resultText
    || payload?.data?.text
    || payload?.data?.fullText;

  if (typeof preferred === 'string' && preferred.trim()) {
    return preferred.trim();
  }

  return collectText(payload)
    .filter((line, index, lines) => lines.indexOf(line) === index)
    .join('\n')
    .trim();
}

router.post('/receipt', async (req, res) => {
  const image = req.body?.image;
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ msg: 'Receipt image is required.' });
  }

  if (!process.env.PADDLEOCR_API_URL) {
    return res.status(501).json({
      msg: 'PaddleOCR is not configured.',
      provider: 'PaddleOCR',
    });
  }

  try {
    const paddleRes = await fetch(process.env.PADDLEOCR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.PADDLEOCR_API_KEY
          ? { Authorization: `Bearer ${process.env.PADDLEOCR_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        image,
        imageBase64: image.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, ''),
      }),
    });

    const raw = await paddleRes.text();
    let payload;
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      payload = { text: raw };
    }

    if (!paddleRes.ok) {
      return res.status(502).json({
        msg: payload?.msg || payload?.message || 'PaddleOCR request failed.',
        provider: 'PaddleOCR',
      });
    }

    const text = normalizeOcrText(payload);
    if (!text) {
      return res.status(422).json({
        msg: 'PaddleOCR did not return readable text.',
        provider: 'PaddleOCR',
      });
    }

    return res.json({
      provider: 'PaddleOCR',
      text,
    });
  } catch (err) {
    console.error(`PaddleOCR request failed: ${err.message}`);
    return res.status(502).json({
      msg: 'PaddleOCR service is unavailable.',
      provider: 'PaddleOCR',
    });
  }
});

module.exports = router;
