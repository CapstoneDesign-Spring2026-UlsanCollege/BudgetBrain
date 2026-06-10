# BudgetBrain API Reference

## Base URL

```
/api
```

In development, Vite proxies `/api` requests to the backend server. In production, Vercel rewrites `/api/*` to the serverless function.

## Authentication

Most endpoints require JWT authentication. Include the token in the request header:

```
Authorization: Bearer <token>
```

The token is obtained from the login or register response and stored in localStorage on the frontend. Tokens expire after 7 days.

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password1"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "🎯",
    "createdAt": "2026-03-15T10:30:00.000Z"
  }
}
```

**Auth:** No

**Errors:** 400 (missing fields, weak password, duplicate email)

---

### POST /api/auth/login

Authenticate an existing user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "Password1"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "🎯",
    "createdAt": "2026-03-15T10:30:00.000Z"
  }
}
```

**Auth:** No

**Errors:** 400 (invalid email or password)

---

### POST /api/auth/forgot-password

Request a password reset code sent to the user's email.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "msg": "If an account exists for that email, a password reset code has been sent."
}
```

**Auth:** No

**Note:** In development mode without Vercel, the response includes the reset code directly for testing. In production, the code is sent via email using the Resend API.

---

### POST /api/auth/reset-password

Reset password using the email reset code.

**Request:**
```json
{
  "email": "john@example.com",
  "code": "123456",
  "password": "NewPassword1"
}
```

**Response (200):**
```json
{
  "msg": "Password reset successfully. You can log in with your new password."
}
```

**Auth:** No

**Errors:** 400 (invalid/expired code, weak password)

---

### GET /api/auth/me

Get the authenticated user's profile.

**Response (200):**
```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "🎯",
  "createdAt": "2026-03-15T10:30:00.000Z"
}
```

**Auth:** Yes

---

### PUT /api/auth/me

Update user name and/or avatar.

**Request:**
```json
{
  "name": "Jane Doe",
  "avatar": "🌟"
}
```

**Response (200):**
```json
{
  "id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "name": "Jane Doe",
  "email": "john@example.com",
  "avatar": "🌟",
  "createdAt": "2026-03-15T10:30:00.000Z"
}
```

**Auth:** Yes

---

### PUT /api/auth/password

Change the authenticated user's password.

**Request:**
```json
{
  "currentPassword": "OldPassword1",
  "newPassword": "NewPassword1"
}
```

**Response (200):**
```json
{
  "msg": "Password changed successfully"
}
```

**Auth:** Yes

---

## Budget Endpoints

### GET /api/budgets

List all budgets for the authenticated user.

**Response (200):**
```json
[
  {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e2",
    "user": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Food",
    "amount": 20000,
    "color": "#ff6b6b",
    "createdAt": "2026-03-15T10:30:00.000Z"
  }
]
```

**Auth:** Yes

---

### POST /api/budgets

Create a new budget.

**Request:**
```json
{
  "name": "Food",
  "amount": 20000,
  "color": "#ff6b6b"
}
```

**Response (201):** Created budget object

**Auth:** Yes

**Errors:** 400 (missing name, invalid amount, invalid color)

---

### PUT /api/budgets/:id

Update an existing budget.

**Request:** (any subset of fields)
```json
{
  "name": "Groceries",
  "amount": 25000
}
```

**Response (200):** Updated budget object

**Auth:** Yes

**Errors:** 400 (invalid id), 403 (not authorized), 404 (not found)

---

### DELETE /api/budgets/:id

Delete a budget and all its associated expenses.

**Response (200):**
```json
{
  "msg": "Budget removed"
}
```

**Auth:** Yes

**Errors:** 400 (invalid id), 403 (not authorized), 404 (not found)

---

## Expense Endpoints

### GET /api/expenses

List all expenses for the authenticated user.

**Response (200):**
```json
[
  {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e3",
    "user": "64a1b2c3d4e5f6a7b8c9d0e1",
    "budget": "64a1b2c3d4e5f6a7b8c9d0e2",
    "name": "Weekly groceries",
    "amount": 5000,
    "category": "food",
    "createdAt": "2026-03-15T12:00:00.000Z"
  }
]
```

**Auth:** Yes

---

### POST /api/expenses

Create a new expense.

**Request:**
```json
{
  "name": "Weekly groceries",
  "amount": 5000,
  "budgetId": "64a1b2c3d4e5f6a7b8c9d0e2",
  "category": "food"
}
```

**Response (201):** Created expense object

**Auth:** Yes

**Errors:** 400 (missing fields, invalid amount, invalid budget)

---

### PUT /api/expenses/:id

Update an existing expense.

**Request:** (any subset of fields)
```json
{
  "name": "Monthly groceries",
  "amount": 6000
}
```

**Response (200):** Updated expense object

**Auth:** Yes

---

### DELETE /api/expenses/:id

Delete an expense.

**Response (200):**
```json
{
  "msg": "Expense removed"
}
```

**Auth:** Yes

---

## Savings Goal Endpoints

### GET /api/goals

List all savings goals for the authenticated user.

**Response (200):**
```json
[
  {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e4",
    "user": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "New Laptop",
    "targetAmount": 100000,
    "savedAmount": 25000,
    "deadline": "2026-12-31T00:00:00.000Z",
    "icon": "💻",
    "createdAt": "2026-03-15T14:00:00.000Z"
  }
]
```

**Auth:** Yes

---

### POST /api/goals

Create a new savings goal.

**Request:**
```json
{
  "name": "New Laptop",
  "targetAmount": 100000,
  "deadline": "2026-12-31",
  "icon": "💻"
}
```

**Response (201):** Created goal object

**Auth:** Yes

---

### POST /api/goals/:id/savings

Add savings to an existing goal. The amount is added to the current `savedAmount`.

**Request:**
```json
{
  "amount": 10000
}
```

**Response (200):** Updated goal object with incremented savedAmount

**Auth:** Yes

---

### PUT /api/goals/:id

Update a goal's details (name, targetAmount, savedAmount, deadline, icon).

**Request:** (any subset of fields)
```json
{
  "targetAmount": 120000,
  "deadline": "2027-01-31"
}
```

**Response (200):** Updated goal object

**Auth:** Yes

---

### DELETE /api/goals/:id

Delete a savings goal.

**Response (200):**
```json
{
  "msg": "Goal removed"
}
```

**Auth:** Yes

---

## Health Check

### GET /api/health

Check API and database health status.

**Response (200) — healthy:**
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 1234.56
}
```

**Response (503) — degraded:**
```json
{
  "status": "degraded",
  "database": "disconnected",
  "uptime": 1234.56
}
```

**Auth:** No

---

## Exchange Rates

### GET /api/exchange/:base

Get exchange rates for a base currency.

**Auth:** No

---

## Common Error Responses

### 400 Bad Request
```json
{
  "msg": "Budget name is required."
}
```

### 401 Unauthorized
```json
{
  "msg": "No token, authorization denied."
}
```

### 403 Forbidden
```json
{
  "msg": "Not authorized."
}
```

### 404 Not Found
```json
{
  "msg": "Budget not found."
}
```

### 500 Server Error
```json
{
  "msg": "Server Error"
}
```

### 503 Service Unavailable
```json
{
  "msg": "Database connection failed. Please try again shortly."
}
```

## OCR Endpoint (External Service)

### POST /api/ocr/scan (if PaddleOCR service configured)

Scan a receipt image and extract text.

**Request:** Form-data with image file

**Response:**
```json
{
  "text": "Store Name\nDate: 2026-01-15\nItem 1......$10.00\nItem 2......$5.00\nTotal......$15.00",
  "fullText": "..."
}
```

**Auth:** Yes

**Note:** This endpoint requires a configured PaddleOCR service. Falls back to browser-based Tesseract.js if unavailable.

---

## HTTP Status Code Summary

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (wrong user) |
| 404 | Not Found |
| 413 | Request Entity Too Large |
| 500 | Internal Server Error |
| 503 | Service Unavailable (DB down) |
