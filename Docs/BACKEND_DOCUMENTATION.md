# BudgetBrain Backend Documentation

## Backend Purpose

The BudgetBrain backend is a RESTful API server built with Node.js and Express.js. It handles user authentication, budget management, expense tracking, savings goals, and currency exchange data. The server processes JSON requests, validates data, interacts with MongoDB, and returns structured JSON responses.

## Technology Stack

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express 5.x | Web framework and routing |
| Mongoose 9.x | MongoDB ODM |
| jsonwebtoken | JWT generation and verification |
| bcryptjs | Password hashing |
| cors | Cross-origin resource sharing |
| dotenv | Environment variable management |

## Express Server

The server is initialized in `backend/server.js` with the following configuration:

- **Port:** 5000 (default, configurable via `PORT` env var)
- **JSON body limit:** 100kb
- **CORS:** Configurable allowed origins from `CLIENT_ORIGIN` env var
- **Rate limiting:** Auth routes limited to 40 requests per 15 minutes
- **Security headers:** Custom middleware for HTTP security headers

The server conditionally starts listening only when run directly (`require.main === module`). When imported as a module (e.g., for Vercel serverless), it exports `{ app, connectDB, validateConfig }`.

## Middleware

### Security Headers (`backend/middleware/security.js`)

Custom middleware that adds HTTP security headers to all responses.

### Rate Limiting (`backend/middleware/rateLimit.js`)

Configurable rate limiter applied to authentication routes to prevent brute force attacks.

### Authentication (`backend/middleware/auth.js`)

JWT verification middleware that extracts and validates the token from the `x-auth-token` or `Authorization` header. Decoded user ID is attached to `req.user` for use in protected routes.

### Error Handling

Global error handler catches and formats errors:

- `entity.too.large` → 413 status
- CORS origin errors → 400 status
- All other errors → 500 status with generic message

## JSON API

All routes are prefixed with `/api`. The server accepts and returns JSON. Request bodies are parsed with `express.json()`.

## Authentication Flow

### Registration

1. Client sends `POST /api/auth/register` with name, email, and password
2. Server validates input (email format, password strength)
3. Checks if user already exists
4. Hashes password with bcrypt (salt rounds: 10)
5. Creates user in database
6. Returns JWT token and user data
7. Attempts to send welcome email (non-blocking)

### Login

1. Client sends `POST /api/auth/login` with email and password
2. Server looks up user by email
3. Compares password hash with bcrypt
4. Returns JWT token (7-day expiration) and user data
5. Token is stored in localStorage on the frontend

### Password Reset

1. Client requests reset code via `POST /api/auth/forgot-password`
2. Server generates a 6-digit code with SHA-256 hash and 10-minute expiration
3. Code is sent via email using Resend API (or returned in dev mode)
4. Client submits code + new password to `POST /api/auth/reset-password`
5. Server verifies code hash and expiration
6. Password is hashed and saved
7. Max 5 reset attempts before code is invalidated

## JWT Authentication

- Tokens are signed with `JWT_SECRET` environment variable
- Default expiration: 7 days
- Token payload: `{ user: { id } }`
- Frontend sends token in `Authorization: Bearer <token>` or `x-auth-token` header
- Protected routes use the `auth` middleware to verify tokens

## Protected Routes

All routes except `/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/health`, and `/api/exchange` require authentication via the `auth` middleware.

## Route Modules

### Auth Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login user |
| POST | /api/auth/forgot-password | Public | Request password reset code |
| POST | /api/auth/reset-password | Public | Reset password with code |
| GET | /api/auth/me | Private | Get current user profile |
| PUT | /api/auth/me | Private | Update user name/avatar |
| PUT | /api/auth/password | Private | Change password |

### Budget Routes (`/api/budgets`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/budgets | Private | List all user budgets |
| POST | /api/budgets | Private | Create new budget |
| PUT | /api/budgets/:id | Private | Update budget |
| DELETE | /api/budgets/:id | Private | Delete budget and its expenses |

### Expense Routes (`/api/expenses`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/expenses | Private | List all user expenses |
| POST | /api/expenses | Private | Create new expense |
| PUT | /api/expenses/:id | Private | Update expense |
| DELETE | /api/expenses/:id | Private | Delete expense |

### Goal Routes (`/api/goals`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/goals | Private | List all user goals |
| POST | /api/goals | Private | Create new goal |
| PUT | /api/goals/:id | Private | Update goal |
| POST | /api/goals/:id/savings | Private | Add savings to goal |
| DELETE | /api/goals/:id | Private | Delete goal |

### Exchange Routes (`/api/exchange`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/exchange/:base | Public | Get exchange rates |

## Error Handling

- Validation errors return 400 with specific field messages
- Authentication errors return 401
- Authorization errors return 403
- Not found errors return 404
- Server errors return 500
- Database unavailable returns 503

## Server Start Process

1. Load environment variables from `.env` (dotenv)
2. Validate required config (`JWT_SECRET`, `MONGO_URI` in production)
3. Configure Express with middleware (security, CORS, JSON parser, rate limiters)
4. Register route modules
5. Connect to MongoDB via Mongoose
6. Start listening on configured port
