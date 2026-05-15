# BudgetBrain API Reference

Base URL: `/api` (proxied by Vite in dev, served by Vercel in production)

## Authentication

All endpoints except register and login require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Register

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response: `201 Created`

```json
{
  "message": "User registered successfully"
}
```

### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response: `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": 0
  }
}
```

### Get Profile

```
GET /api/auth/profile
Authorization: Bearer <token>
```

Response: `200 OK` with user object.

### Update Profile

```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Name",
  "avatar": 2
}
```

## Budgets

### List Budgets

```
GET /api/budgets
Authorization: Bearer <token>
```

Response: array of budget objects with total spent per budget.

### Create Budget

```
POST /api/budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Food",
  "amount": 20000,
  "color": "#ff6b6b"
}
```

### Get Single Budget

```
GET /api/budgets/:id
Authorization: Bearer <token>
```

### Update Budget

```
PUT /api/budgets/:id
Authorization: Bearer <token>
```

### Delete Budget

```
DELETE /api/budgets/:id
Authorization: Bearer <token>
```

## Expenses

### List Expenses

```
GET /api/expenses?budget=budgetId
Authorization: Bearer <token>
```

### Create Expense

```
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "budget": "budgetId",
  "name": "Groceries",
  "amount": 5000,
  "date": "2026-04-15"
}
```

### Update Expense

```
PUT /api/expenses/:id
Authorization: Bearer <token>
```

### Delete Expense

```
DELETE /api/expenses/:id
Authorization: Bearer <token>
```

## Goals

### List Goals

```
GET /api/goals
Authorization: Bearer <token>
```

### Create Goal

```
POST /api/goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Laptop",
  "targetAmount": 100000,
  "savedAmount": 0,
  "deadline": "2026-12-31"
}
```

### Add Savings to Goal

```
PUT /api/goals/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "savedAmount": 50000
}
```

### Delete Goal

```
DELETE /api/goals/:id
Authorization: Bearer <token>
```

## Error Responses

```json
{
  "message": "Error description here"
}
```

Common status codes:
- 400: Bad request (missing fields)
- 401: Unauthorized (no token)
- 403: Wrong credentials
- 404: Resource not found
- 500: Server error
