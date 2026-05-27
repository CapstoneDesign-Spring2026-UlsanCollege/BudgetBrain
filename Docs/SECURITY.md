# BudgetBrain Security

## Authentication

- Passwords are hashed with bcrypt (no plain text storage)
- JWT tokens for stateless authentication
- Tokens expire and require re-login
- Login returns a generic invalid-credentials message to reduce account enumeration
- Forgot-password reset codes are stored hashed, expire after 10 minutes, and are limited to 5 attempts

## API Security

- CORS enabled for frontend origin only
- JWT middleware on all protected routes
- Rate limiting is applied to auth endpoints
- Input validation on all endpoints

## Data Storage

- MongoDB Atlas with encrypted connection
- Environment variables for secrets (never committed)
- .env files are gitignored
- In-memory fallback for dev only

## Best Practices

- No console.log of sensitive data
- No secrets in client-side code
- User data isolated by JWT user ID
- Avatar selection is client-side only
- XSS protection through React's built-in escaping

## Environment Variables Required

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
PORT=5000
RESEND_API_KEY=optional_for_password_reset_email
PASSWORD_RESET_FROM=optional_sender_address
```

Never commit these to the repository.

## Future Security Plans

- Rate limiting on auth endpoints
- HTTPS enforced (already on Vercel)
- Email verification on registration
- API key rotation
