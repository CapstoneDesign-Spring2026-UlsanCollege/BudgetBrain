# BudgetBrain Architecture Sketch

## High-Level Overview

```
[User Browser] <--> [Vite Dev Server / Static Build]
                         |
                    [Express API Server :5001]
                         |
                    [MongoDB Atlas / In-Memory Fallback]
```

## Frontend Architecture
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **State**: React Context (UserContext) + localStorage
- **Styling**: CSS variables with dark/light themes + 3D/liquid effects
- **HTTP**: Axios instance configured in `src/api.js`
- **Charts**: Recharts library

## Backend Architecture
- **Runtime**: Node.js + Express 5.x
- **Auth**: JWT tokens (Bearer headers)
- **Database**: MongoDB via Mongoose, with in-memory fallback
- **Port**: 5001 (development), serverless on Vercel (production)

## Data Flow
1. User authenticates -> JWT stored in localStorage
2. Axios interceptor attaches JWT to all requests
3. Express middleware verifies JWT on protected routes
4. CRUD operations go through Mongoose models
5. Currency preference stored in localStorage (default: NPR)

## Data Models
- **User**: email, password (hashed), name, avatar
- **Budget**: user, name, amount, color
- **Expense**: budget, user, name, amount, date
- **Goal**: user, name, targetAmount, savedAmount, deadline

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/profile | Yes | Get profile |
| PUT | /api/auth/profile | Yes | Update profile |
| GET | /api/budgets | Yes | List budgets |
| POST | /api/budgets | Yes | Create budget |
| GET | /api/budgets/:id | Yes | Get budget detail |
| PUT | /api/budgets/:id | Yes | Update budget |
| DELETE | /api/budgets/:id | Yes | Delete budget |
| GET | /api/expenses | Yes | List expenses |
| POST | /api/expenses | Yes | Create expense |
| PUT | /api/expenses/:id | Yes | Update expense |
| DELETE | /api/expenses/:id | Yes | Delete expense |
| GET | /api/goals | Yes | List goals |
| POST | /api/goals | Yes | Create goal |
| PUT | /api/goals/:id | Yes | Update goal |
| DELETE | /api/goals/:id | Yes | Delete goal |

## File Structure

```
BudgetBrain/
├── Docs/                    # Documentation
│   └── weeks/               # Weekly progress reports
├── .github/                 # GitHub templates
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── backend/                 # Express API server
│   ├── middleware/auth.js   # JWT verification
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Budget.js
│   │   ├── Expense.js
│   │   └── Goal.js
│   ├── routes/              # API route handlers
│   │   ├── auth.js
│   │   ├── budgets.js
│   │   ├── expenses.js
│   │   └── goals.js
│   └── server.js            # Entry point
├── src/                     # React frontend
│   ├── api.js               # Axios config
│   ├── components/          # Reusable UI components
│   ├── layouts/             # Layout wrappers
│   ├── pages/               # Route pages
│   ├── App.jsx              # Main app
│   └── main.jsx             # Entry point
├── public/
├── package.json
└── vite.config.js
```
