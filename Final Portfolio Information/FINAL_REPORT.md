# BudgetBrain — Final Report

## Capstone Design — Spring 2026
### Ulsan College, South Korea

**Team Members:** Angnima Sherpa, Sunil Tamang, Bidhan Pokhrel, Suvakar Dahal
**Instructor:** TODO: add instructor name
**Submission Date:** June 2026

---

## Abstract

BudgetBrain is a full-stack personal finance management web application designed to help college students track expenses, manage budgets, set savings goals, and visualize spending habits through interactive charts. Built with React and Express, the application provides a premium user experience with dark/light theme support, responsive design, and receipt scanning via OCR. The project was developed over 15 weeks following an agile sprint methodology, with all source code and documentation hosted on GitHub and deployed via Vercel.

---

## Problem Statement

College students often struggle with managing their finances due to a lack of accessible, easy-to-use budgeting tools. Existing solutions are either too complex, require bank integration that many students cannot use, or lack features specifically relevant to student life. BudgetBrain addresses this gap by providing a straightforward, feature-rich budget planning tool designed with students in mind.

---

## Target Users

- College and university students
- Young adults managing personal finances for the first time
- Anyone seeking a simple, visual budget tracking tool

---

## Project Goals

1. Provide a simple, intuitive interface for budget and expense tracking
2. Enable savings goal setting with visual progress tracking
3. Offer meaningful spending analytics through charts and summaries
4. Deliver a polished, premium user experience across devices
5. Ensure data security through proper authentication and encryption
6. Deploy a live, accessible web application

---

## System Overview

BudgetBrain is a three-tier web application:

- **Frontend:** React 18 single-page application with Vite build tool, React Router v6 for navigation, Recharts for data visualization
- **Backend:** Express.js REST API with JWT authentication, input validation, rate limiting
- **Database:** MongoDB with Mongoose ODM, hosted on MongoDB Atlas with in-memory fallback

The application is deployed on Vercel, serving both static frontend assets and serverless API functions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express 5.x |
| Database | MongoDB (Atlas + in-memory fallback) |
| Authentication | JWT (JSON Web Tokens) |
| Charts | Recharts |
| OCR | PaddleOCR service + Tesseract.js browser fallback |
| Styling | Vanilla CSS with CSS custom properties |
| Email | Resend API |
| Deployment | Vercel |
| Version Control | Git / GitHub |

---

## Key Features

### User Authentication
- Secure registration and login with JWT tokens
- Password hashing with bcrypt
- Password reset via time-limited email codes (Resend API)

### Budget Management
- Create, edit, and delete budgets with custom color categories
- Visual progress bars showing spent vs. allocated amounts
- 10+ preset color options

### Expense Tracking
- Add, edit, and delete expenses linked to budgets
- Chronological transaction history
- Category-based organization

### Savings Goals
- Set savings targets with optional deadlines
- Track progress with percentage-based visual indicators
- Add savings incrementally

### Analytics Dashboard
- Summary cards showing total budgets, expenses, and savings
- Pie chart of spending by budget category
- Bar chart of monthly spending trends
- Recent transactions list

### Receipt Scanning
- OCR-based receipt text extraction
- PaddleOCR service integration (primary)
- Tesseract.js browser fallback

### User Experience
- Dark/light theme toggle with persistence
- Emoji avatar selection
- Currency preference and live exchange rates
- Responsive design for mobile, tablet, and desktop
- Premium UI with glass morphism and 3D effects

---

## Architecture Summary

The application follows a client-server architecture:

```
Browser → Vercel CDN → React SPA (static assets)
                          ↓ (API calls via Axios)
                     Express.js API (serverless)
                          ↓ (Mongoose ODM)
                     MongoDB Atlas
```

Frontend communicates with the backend through RESTful API endpoints. JWT tokens stored in localStorage are attached to requests via Axios interceptors. Vite proxies API calls in development; Vercel rewrites handle them in production.

---

## Database Summary

Four MongoDB collections:

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| users | Account data | name, email, password (hashed), avatar |
| budgets | Budget categories | user ref, name, amount, color |
| expenses | Individual expenses | user ref, budget ref, name, amount, category |
| goals | Savings goals | user ref, name, targetAmount, savedAmount, deadline |

Relationships: User 1:N Budgets, User 1:N Expenses, User 1:N Goals, Budget 1:N Expenses (cascading delete).

---

## Testing Summary

All features tested manually with comprehensive checklist:

| Area | Test Cases | Status |
|------|-----------|--------|
| Authentication | 16 | ✅ All passing |
| Budgets | 8 | ✅ All passing |
| Expenses | 8 | ✅ All passing |
| Savings Goals | 8 | ✅ All passing |
| Dashboard/Charts | 8 | ✅ All passing |
| Profile/Settings | 8 | ✅ All passing |
| API Endpoints | 22 | ✅ All working |
| Database | 6 | ✅ All passing |
| Error Handling | 6 | ✅ All passing |

Build: `npm run build` passes with 0 errors.

---

## Deployment Summary

- **Platform:** Vercel (free tier)
- **Frontend:** Static build output (`dist/`)
- **Backend:** Serverless function (`api/index.js`)
- **Database:** MongoDB Atlas (cloud)
- **Live URL:** https://budgetbrain.vercel.app/
- **Environment Variables:** MONGO_URI, JWT_SECRET, RESEND_API_KEY, PASSWORD_RESET_FROM

---

## Team Roles

| Team Member | Role | Responsibilities |
|-------------|------|-----------------|
| Bidhan Pokhrel | Frontend Lead | React components, UI/UX implementation, chart integration |
| Suvakar Dahal | Backend Lead | Express API, database design, authentication, OCR integration |
| Sunil Tamang | Documentation & Deployment | Documentation, Vercel deployment, environment configuration |
| Angnima Sherpa | UI/UX Designer | Wireframes, design system, theme implementation, visual effects |

---

## Lessons Learned

1. **Start documentation early.** Maintaining docs alongside code prevents last-minute rushes.
2. **Consistent naming conventions matter.** Using uppercase WEEK_XX.md from the start avoids duplicate files.
3. **Agile sprints keep momentum.** Weekly deliverables ensure steady progress.
4. **AI tools are accelerators, not replacements.** All AI-generated code requires human review.
5. **Deployment should be tested early.** Early Vercel setup caught configuration issues before the final week.
6. **Mobile responsiveness from the start.** Retrofitting responsive design is harder than building it in.

---

## Future Enhancements

- Bank/card transaction integration
- Recurring transaction support
- CSV/PDF data export
- AI-powered spending insights
- Mobile app (React Native)
- Multi-user budget collaboration
- PWA offline support
- Multi-factor authentication

---

## Conclusion

BudgetBrain successfully delivers a complete, production-ready personal finance management application. All core features are implemented, tested, and documented. The project demonstrates proficiency in full-stack web development, agile project management, and user-centered design. BudgetBrain is ready for demonstration and future enhancement.
