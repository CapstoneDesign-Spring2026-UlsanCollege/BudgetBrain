# BudgetBrain System Architecture

## C4-Lite Architecture Overview

BudgetBrain follows a three-tier client-server architecture with a React frontend, Express.js backend, and MongoDB database.

```
                        ┌─────────────────────────────┐
                        │      Finance User            │
                        │  (Browser on Desktop/Mobile) │
                        └─────────────┬───────────────┘
                                      │
                                      │ HTTPS / HTTP
                                      ▼
                        ┌─────────────────────────────┐
                        │    BudgetBrain Frontend      │
                        │  React 18 + Vite + Recharts  │
                        │                               │
                        │  ┌─────────┐ ┌──────────┐   │
                        │  │ Auth    │ │ Dashboard │   │
                        │  │ Pages   │ │ + Charts  │   │
                        │  ├─────────┤ ├──────────┤   │
                        │  │ Budget  │ │ Savings  │   │
                        │  │ UI      │ │ Goals UI │   │
                        │  ├─────────┤ ├──────────┤   │
                        │  │ Profile │ │ Settings │   │
                        │  │ Page    │ │ Page     │   │
                        │  └─────────┘ └──────────┘   │
                        │                               │
                        │   Axios HTTP Client           │
                        │   JWT in localStorage          │
                        └─────────────┬─────────────────┘
                                      │
                                      │ JSON API (/api/*)
                                      ▼
                        ┌─────────────────────────────┐
                        │    Express.js Backend API    │
                        │  Node.js + Express 5.x       │
                        │                               │
                        │  ┌──────────┐ ┌───────────┐ │
                        │  │ Auth     │ │ Middleware │ │
                        │  │ Routes   │ │ JWT Verify│ │
                        │  ├──────────┤ ├───────────┤ │
                        │  │ Budget   │ │ Expense   │ │
                        │  │ Routes   │ │ Routes    │ │
                        │  ├──────────┤ ├───────────┤ │
                        │  │ Goal     │ │ Exchange  │ │
                        │  │ Routes   │ │ Routes    │ │
                        │  └──────────┘ └───────────┘ │
                        │                               │
                        │   Rate Limiting               │
                        │   Security Headers            │
                        │   CORS Configuration          │
                        └─────────────┬─────────────────┘
                                      │
                                      │ Mongoose ODM
                                      ▼
                        ┌─────────────────────────────┐
                        │       MongoDB Database       │
                        │  (MongoDB Atlas / Local)     │
                        │                               │
                        │  ┌──────────┐ ┌───────────┐ │
                        │  │ users    │ │ budgets   │ │
                        │  ├──────────┤ ├───────────┤ │
                        │  │ expenses │ │ goals     │ │
                        │  └──────────┘ └───────────┘ │
                        │                               │
                        │   In-Memory Fallback           │
                        │   (when DB unavailable)        │
                        └─────────────────────────────┘
```

## Architecture Layers

### 1. Presentation Layer (Frontend)

The frontend is a single-page application built with React 18 and Vite. It communicates with the backend through REST API calls using Axios. The application uses React Router v6 for client-side routing, allowing a seamless multi-page experience without full page reloads.

**Key technologies:** React 18, Vite, React Router v6, Recharts, Axios, Vanilla CSS with CSS variables

### 2. Application Layer (Backend API)

The backend is a RESTful API built with Express.js. It handles authentication, data validation, business logic, and database operations. JWT tokens are used for maintaining user sessions. The server implements rate limiting for auth routes and security headers for protection.

**Key technologies:** Node.js, Express 5.x, JWT (jsonwebtoken), bcryptjs, Mongoose ODM

### 3. Data Layer (Database)

MongoDB serves as the primary data store, accessed through the Mongoose ODM. The database contains collections for users, budgets, expenses, and savings goals. When MongoDB is unavailable, the server gracefully handles errors and returns appropriate status codes.

**Key technologies:** MongoDB, Mongoose ODM, MongoDB Atlas (cloud)

## How Frontend Connects to Backend

1. The frontend makes API calls using an Axios instance configured in `src/api.js`
2. All requests use a relative base URL `/api`
3. The Axios interceptor automatically attaches the JWT token from `localStorage` to every request
4. In development, Vite proxies `/api` requests to the backend server (`localhost:5001`)
5. In production, Vercel rewrites `/api/*` requests to the serverless function

## How Backend Connects to Database

1. The server imports Mongoose and connects to MongoDB using the `MONGO_URI` environment variable
2. If `MONGO_URI` is not set, the server logs a warning and skips connection
3. API routes that require the database return a 503 error if the database is not connected
4. The server implements connection pooling and periodic health checks via ping commands

## Planned Smart Finance / Analytics System

Future architecture plans include:

- **AI Insights Module:** Analysis of spending patterns using machine learning
- **Notification Service:** Email and in-app alerts for budget limits and bill reminders
- **Data Export Pipeline:** PDF and CSV report generation
- **Mobile App:** React Native wrapper for native mobile experience
- **Third-party Integration:** Bank API connectors for automatic transaction import
