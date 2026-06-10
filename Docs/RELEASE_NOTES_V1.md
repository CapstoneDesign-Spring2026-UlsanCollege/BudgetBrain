# BudgetBrain — v1.0 Release Notes

## Release Name
BudgetBrain Capstone Final Release

## Release Date
June 2026

## Overview
BudgetBrain v1.0 is the final capstone release of a full-stack personal finance management web application designed for college students. This release includes all planned MVP features, comprehensive documentation, and deployment infrastructure.

## Features

### Authentication & Security
- User registration with validation (name, email, password)
- Secure login with JWT token-based authentication
- Password reset via time-limited email codes (Resend API)
- Bcrypt password hashing (no plain-text storage)
- Rate limiting on auth endpoints

### Budget Management
- Create budgets with name, amount, and color
- Edit and delete existing budgets
- Visual progress bars (spent vs. allocated)
- 10+ color category options

### Expense Tracking
- Add expenses linked to budgets
- Edit and delete individual expenses
- Chronological transaction history
- Category-based organization

### Savings Goals
- Create goals with target amounts and deadlines
- Add savings incrementally
- Visual progress indicators (percentage)
- Goal lifecycle management

### Analytics & Dashboard
- Summary cards (total budgets, expenses, goals, balance)
- Pie chart of spending by budget category
- Bar chart of monthly spending trends
- Recent transactions list
- Currency conversion with live exchange rates

### Receipt Scanning
- Image upload for receipts
- OCR text extraction (PaddleOCR service)
- Browser-based OCR fallback (Tesseract.js)

### User Experience
- Dark and light theme toggle
- Emoji avatar selection
- Currency preference settings
- Fully responsive design (mobile, tablet, desktop)
- Premium UI effects (glass morphism, 3D)

## Technical Stack
- **Frontend:** React 18, Vite, React Router v6, Recharts
- **Backend:** Node.js, Express 5.x
- **Database:** MongoDB (Atlas + in-memory fallback)
- **Auth:** JWT (JSON Web Tokens)
- **OCR:** PaddleOCR service, Tesseract.js browser fallback
- **Email:** Resend API
- **Deployment:** Vercel (static + serverless)

## Deployment
- Live URL: https://budgetbrain.vercel.app/
- Environment variables required: MONGO_URI, JWT_SECRET
- Optional: RESEND_API_KEY, PASSWORD_RESET_FROM, PADDLEOCR_API_URL, PADDLEOCR_API_KEY, EXCHANGE_RATE_API_URL

## Known Limitations
- No bank/card transaction integration
- OCR accuracy depends on image quality
- No automated CI/CD test pipeline
- No data export (CSV/PDF) feature
- No offline/PWA support
- No push notifications

## Future Improvements
See Docs/FUTURE_ENHANCEMENTS.md and Docs/ROADMAP.md.

## Documentation
Complete documentation set available in the Docs/ directory:
- 15 weekly reports
- 15 sprint packets
- Full API reference
- Database design documentation
- Deployment guide
- User guide and FAQ
- Final portfolio deliverables
