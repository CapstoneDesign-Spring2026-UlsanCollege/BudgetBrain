# Week 6 - Backend and API Setup

**Date:** April 6-10, 2026

## What We Did

This week we built the backend API with Express and MongoDB. We created all the route handlers, database models, and authentication middleware. We also connected the frontend to the backend using Axios.

## Backend Structure

- Express server running on port 5000
- MongoDB connection with Mongoose
- JWT authentication middleware
- Route handlers for all features

## API Endpoints Created

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/budgets | List all budgets |
| POST | /api/budgets | Create budget |
| GET | /api/budgets/:id | Get single budget |
| PUT | /api/budgets/:id | Update budget |
| DELETE | /api/budgets/:id | Delete budget |
| GET | /api/expenses | List expenses |
| POST | /api/expenses | Add expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/goals | List goals |
| POST | /api/goals | Create goal |
| PUT | /api/goals/:id | Update goal |
| DELETE | /api/goals/:id | Delete goal |

## Database Models

- User (email, password hashed, name, avatar)
- Budget (userId, name, amount, color)
- Expense (budgetId, userId, name, amount, date)
- Goal (userId, name, targetAmount, savedAmount, deadline)

## Tasks Completed

| Task | Status |
|---|---|
| Express server setup | Done |
| MongoDB connection | Done |
| User model and auth routes | Done |
| Budget model and routes | Done |
| Expense model and routes | Done |
| Goal model and routes | Done |
| JWT middleware | Done |
| Frontend-backend integration | Done |

## What is Next

Complete budget and expense features with full CRUD in Week 7.
