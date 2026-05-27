# Week 5 — Backend Setup with Node.js and Express

## Goal

Set up the Express.js backend server with basic routing and middleware.

## Work Completed

- Initialized Node.js project in `backend/` directory
- Installed Express.js, Mongoose, bcryptjs, jsonwebtoken, cors, dotenv
- Created Express server entry point (`server.js`)
- Set up CORS configuration
- Added JSON body parser middleware
- Created basic route structure for auth, budgets, expenses, goals
- Added security headers middleware
- Created rate limiting for auth routes

## Frontend Progress

- No frontend changes this week

## Backend Progress

| Component | Status |
|-----------|--------|
| Express Server | ✅ Running on port 5000 |
| CORS Config | ✅ Configured |
| Security Headers | ✅ Middleware added |
| Rate Limiting | ✅ Auth routes limited |
| Route Structure | ✅ Scaffolded |
| Error Handling | ✅ Global handler |

## Database Progress

- Mongoose installed and configured
- Models planned but not yet implemented

## Testing Progress

- Server starts successfully
- API responds to requests

## Problems Faced

- Express 5.x had some syntax differences from Express 4
- CORS configuration required careful origin handling

## Solution or Next Step

- Used Express 5 compatible patterns
- Implemented dynamic allowed origins via environment variable
- Next step: implement database models and auth routes

## Evidence

- Server starts and responds to health check
- Route scaffolding in place

## Demo Readiness Status

Not ready — no database or authentication yet
