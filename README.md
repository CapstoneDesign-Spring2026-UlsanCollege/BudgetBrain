# BudgetBrain

BudgetBrain is a full-stack budget planning web app built with React and Express. It helps college students track expenses, manage budgets, set savings goals, and see their spending habits through charts.

## Features

- Register and login with JWT authentication
- Reset forgotten passwords through secure, expiring email codes
- Create, edit, and delete budgets by category
- Add, edit, and delete expenses within budgets
- Set savings goals and track progress
- View spending analytics with charts
- Scan receipts with PaddleOCR service support and browser OCR fallback
- Dark and light theme toggle
- Profile with avatar selection
- Responsive design for mobile and desktop
- Premium UI with 3D and liquid effects

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express 5.x |
| Database | MongoDB (Atlas + in-memory fallback) |
| Auth | JWT (JSON Web Tokens) |
| Charts | Recharts |
| OCR | Optional PaddleOCR service, browser Tesseract fallback |
| Styling | Vanilla CSS with CSS variables |
| Deployment | Vercel |

## Live Demo

https://budgetbrain.vercel.app/

## Installation

1. Clone the repo:
   ```sh
   git clone https://github.com/CapstoneDesign-Spring2026-UlsanCollege/BudgetBrain.git
   ```

2. Install frontend dependencies:
   ```sh
   npm install
   ```

3. Install backend dependencies:
   ```sh
   cd backend
   npm install
   cd ..
   ```

4. Create `backend/.env`:
   ```sh
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_strong_jwt_secret
   PORT=5000
   # Optional: override the live exchange-rate provider URL.
   # Use {base} where the base currency code should be inserted.
   EXCHANGE_RATE_API_URL=https://open.er-api.com/v6/latest/{base}
   # Required in production for welcome emails and forgot-password reset codes.
   RESEND_API_KEY=your_resend_api_key
   PASSWORD_RESET_FROM=BudgetBrain <verified-sender@yourdomain.com>
   # Optional: PaddleOCR-compatible service endpoint for receipt scanning.
   # The app POSTs { image, imageBase64 } and accepts text/fullText/ocrText-style responses.
   PADDLEOCR_API_URL=https://your-paddleocr-service.example.com/ocr
   PADDLEOCR_API_KEY=optional_bearer_token
   ```

## Usage

1. Start backend:
   ```sh
   cd backend
   npm start
   ```

2. Start frontend (second terminal):
   ```sh
   npm run dev
   ```

3. Open http://localhost:5173

## Deployment

Deployed on Vercel. Required env vars: `MONGO_URI`, `JWT_SECRET`.
Optional env var: `EXCHANGE_RATE_API_URL` for overriding the live currency provider.
Optional receipt OCR env vars: `PADDLEOCR_API_URL`, `PADDLEOCR_API_KEY`.
Email delivery env vars: `RESEND_API_KEY` and `PASSWORD_RESET_FROM` are required for production welcome emails and forgot-password reset codes.

The deployable PaddleOCR service lives in [`paddleocr-service`](paddleocr-service/README.md). Deploy that service separately, then paste its `/ocr` URL into `PADDLEOCR_API_URL` in Vercel.

Build: `npm run build`  
Output: `dist`

## Documentation

All docs are in the [Docs](/Docs) folder:

### Quick Links
| Resource | Link |
|----------|------|
| Docs Index | [Docs/README.md](Docs/README.md) |
| Final Report | [Final Portfolio Information/FINAL_REPORT.md](Final%20Portfolio%20Information/FINAL_REPORT.md) |
| Demo Script | [Final Portfolio Information/FINAL_DEMO_SCRIPT.md](Final%20Portfolio%20Information/FINAL_DEMO_SCRIPT.md) |
| Release Notes | [Docs/RELEASE_NOTES_V1.md](Docs/RELEASE_NOTES_V1.md) |
| Handoff Guide | [Docs/HANDOFF_GUIDE.md](Docs/HANDOFF_GUIDE.md) |
| Weekly Reports | [Docs/weeks/](Docs/weeks/) |
| Sprint Packets | [Docs/sprint-packets/](Docs/sprint-packets/) |

### Core Documents
- [Project Overview](Docs/PROJECT.md)
- [Architecture](Docs/ARCHITECTURE_SKETCH.md)
- [Design Doc](Docs/DESIGN_DOC_V1.md)
- [System Architecture](Docs/SYSTEM_ARCHITECTURE.md)
- [Wireframes](Docs/WIREFRAMES.md)
- [User Stories](Docs/user_stories.md)
- [Team Agreement](Docs/TEAM_AGREEMENT.md)
- [API Reference](Docs/API_REFERENCE.md)
- [Database Design](Docs/DATABASE_DESIGN.md)
- [Testing Plan](Docs/TESTING_PLAN.md)
- [Deployment Guide](Docs/DEPLOYMENT_GUIDE.md)
- [User Guide](Docs/USER_GUIDE.md)

### Project Summaries
- [Week 15 Final Summary](PROJECT/WEEK_15/README.md)
- [Week 12 Summary](PROJECT/WEEK_12/README.md)

## License

MIT
