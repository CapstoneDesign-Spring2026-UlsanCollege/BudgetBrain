# BudgetBrain - System Architecture

## Overview
BudgetBrain follows a client-server architecture with a React frontend communicating with an Express REST API.

## System Diagram

```
┌─────────────────────────────────────────────────┐
│                   Client Browser                  │
│  ┌───────────────────────────────────────────┐   │
│  │          React SPA (Vite Build)           │   │
│  │  ┌─────┐ ┌──────┐ ┌──────┐ ┌──────────┐ │   │
│  │  │Auth │ │Budget│ │Goals │ │Analytics │ │   │
│  │  │Pages│ │Pages │ │Pages │ │  Pages   │ │   │
│  │  └─────┘ └──────┘ └──────┘ └──────────┘ │   │
│  │  ┌──────────────────────────────────────┐ │   │
│  │  │         Axios HTTP Client            │ │   │
│  │  └──────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │ HTTP/JSON
                       │ JWT Auth Header
                       ▼
┌─────────────────────────────────────────────────┐
│              Express API Server :5001             │
│  ┌───────────────────────────────────────────┐   │
│  │           Middleware Stack                │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  CORS    │ │   JSON   │ │   Auth   │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘  │   │
│  └───────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────┐   │
│  │              Route Handlers               │   │
│  │  /api/auth    /api/budgets  /api/goals    │   │
│  │  /api/expenses  /api/profile              │   │
│  └───────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────┐   │
│  │         Mongoose ODM Layer               │   │
│  └───────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   ┌──────────────┐      ┌──────────────────┐
   │ MongoDB Atlas│      │ In-Memory        │
   │ (Production) │      │ Fallback (Dev)   │
   └──────────────┘      └──────────────────┘
```

## Data Models
- **User**: email, password (hashed), name, avatar
- **Budget**: user, name, amount, color
- **Expense**: budget, user, name, amount, date
- **Goal**: user, name, targetAmount, savedAmount, deadline, icon

## API Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/profile | Yes | Get profile |
| PUT | /api/auth/profile | Yes | Update profile |
| GET | /api/budgets | Yes | List budgets |
| POST | /api/budgets | Yes | Create budget |
| GET | /api/budgets/:id | Yes | Get budget |
| PUT | /api/budgets/:id | Yes | Update budget |
| DELETE | /api/budgets/:id | Yes | Delete budget |
| GET | /api/expenses | Yes | List expenses |
| POST | /api/expenses | Yes | Create expense |
| PUT | /api/expenses/:id | Yes | Update expense |
| DELETE | /api/expenses/:id | Yes | Delete expense |
| GET | /api/goals | Yes | List goals |
| POST | /api/goals | Yes | Create goal |
| PUT | /api/goals/:id | Yes | Update goal (add savings) |
| DELETE | /api/goals/:id | Yes | Delete goal |
