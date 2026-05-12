# BudgetBrain

BudgetBrain is a full-stack budget planner web application built with React (Vite) frontend and Express/MongoDB backend. Manage budgets, expenses, savings goals, and track your finances with rich analytics and a premium dark-themed UI.

## Features

- **Authentication** — Register/Login with JWT, distinct error messages, avatar per account
- **Budgets** — Create, edit, and delete budgets with auto-colored cards
- **Expenses** — Add, edit, delete expenses with categories, date range & search filters
- **Savings Goals** — Track savings targets with progress bars and icons
- **Analytics** — Charts, spending breakdowns, budget vs actual comparisons
- **Profile** — Avatar picker, inline name editing, settings sync
- **Settings** — Theme toggle, currency selector (NPR, USD, EUR, GBP, JPY, CAD, AUD, SGD), notification prefs
- **Dashboard** — Overview with goal progress, spending summaries, budget stats
- **Premium UI** — 3D glass cards, liquid buttons, animated aurora background, DIY LED strip effects, neon glows, grain texture, dark/light theme
- **Responsive** — Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Vite, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose (in-memory fallback) |
| Auth | JWT (JSON Web Tokens) |
| Styling | CSS3 custom properties, HSL theming |
| Notifications | React Toastify |
| Icons | Heroicons |

## Installation

### Prerequisites
- Node.js v18+
- MongoDB (optional — app falls back to in-memory)

### Setup

```sh
# 1. Clone the repository
git clone https://github.com/CapstoneDesign-Spring2026-UlsanCollege/BudgetBrain.git

# 2. Navigate to project
cd BudgetBrain

# 3. Install frontend dependencies
npm install

# 4. Install backend dependencies
cd backend && npm install && cd ..

# 5. Start backend (terminal 1)
cd backend && npm start

# 6. Start frontend (terminal 2)
npm run dev
```

Frontend runs at `http://localhost:5173` — Backend runs at `http://localhost:5001`

## Project Structure

```
BudgetBrain/
├── backend/
│   ├── middleware/    # Auth middleware
│   ├── models/       # Mongoose schemas (User, Budget, Expense, Goal)
│   ├── routes/       # API routes (auth, budgets, expenses, goals)
│   ├── server.js     # Express entry point
│   └── .env          # Environment config
├── public/
├── src/
│   ├── actions/      # Action helpers (deleteBudget, logout)
│   ├── assets/       # Images, icons, illustrations
│   ├── components/   # Reusable UI components
│   ├── layouts/      # Layout wrappers
│   ├── pages/        # Page components
│   ├── api.js        # Axios config
│   ├── helpers.js    # Utility functions
│   ├── index.css     # Global styles + themes
│   └── main.jsx      # App entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```
