# BudgetBrain Architecture Sketch

**Team:** Angnima Sherpa, Sunil Tamang, Bidhan Pokhrel, Suvakar Dahal

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

## Backend Architecture
- **Runtime**: Node.js + Express 5.x
- **Auth**: JWT tokens (Bearer headers)
- **Database**: MongoDB via Mongoose, with in-memory fallback
- **Port**: 5001

## Data Flow
1. User authenticates -> JWT stored in localStorage
2. Axios interceptor attaches JWT to all requests
3. Express middleware verifies JWT on protected routes
4. CRUD operations go through Mongoose models
5. Currency preference stored in localStorage (default: NPR)

## File Structure
```
BudgetBrain/
├── Docs/                    # Sprint documentation
├── backend/                 # Express API server
│   ├── middleware/auth.js   # JWT verification
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route handlers
│   └── server.js            # Entry point
├── src/                     # React frontend
│   ├── api.js               # Axios config
│   ├── components/          # Reusable UI components
│   ├── layouts/             # Layout wrappers
│   ├── pages/               # Route pages
│   └── helpers.js           # Utility functions
└── vite.config.js           # Build configuration
```
