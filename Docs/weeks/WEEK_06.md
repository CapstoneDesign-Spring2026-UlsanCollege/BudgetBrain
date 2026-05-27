# Week 6 — Database Planning and User Authentication

## Goal

Implement MongoDB database models and complete the user authentication system (register, login, JWT).

## Work Completed

- Created Mongoose models: User, Budget, Expense, Goal
- Implemented User registration route with bcrypt password hashing
- Implemented User login route with JWT token generation
- Created JWT authentication middleware
- Added input validation for auth requests
- Tested register and login flow end-to-end
- Connected backend to MongoDB (local and Atlas)

## Frontend Progress

- Connected login/register pages to backend API
- Added JWT token storage in localStorage
- Added Axios interceptor for automatic token attachment
- Implemented success/error toasts for auth actions

## Backend Progress

| Component | Status |
|-----------|--------|
| User Model | ✅ Complete |
| Budget Model | ✅ Complete |
| Expense Model | ✅ Complete |
| Goal Model | ✅ Complete |
| Register Route | ✅ Working |
| Login Route | ✅ Working |
| JWT Middleware | ✅ Working |
| Auth Validation | ✅ Implemented |

## Database Progress

- MongoDB connection established
- Models created with proper indexes
- Test data inserted and queried successfully

## Testing Progress

- Tested register with valid and invalid data
- Tested login with correct and incorrect credentials
- Verified JWT tokens are generated and verified
- Tested protected routes with and without tokens

## Problems Faced

- Password hashing with bcrypt required salt rounds configuration
- JWT secret needed to be stored securely in environment variables
- MongoDB connection error handling needed graceful degradation

## Solution or Next Step

- Used environment variables for JWT_SECRET
- Added try-catch for database connection with fallback messaging
- Next step: implement budget and expense routes

## Evidence

- Register and login working end-to-end
- JWT authentication functional
- MongoDB models created

## Demo Readiness Status

Partially ready — auth working, budgets/expenses pending
