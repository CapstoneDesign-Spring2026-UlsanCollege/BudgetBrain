# BudgetBrain Security

## Authentication

- Passwords are hashed with bcrypt (no plain text storage)
- JWT tokens for stateless authentication
- Tokens expire and require re-login
- Distinct error messages for email vs password to prevent enumeration

## API Security

- CORS enabled for frontend origin only
- JWT middleware on all protected routes
- No rate limiting yet (planned)
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
```

Never commit these to the repository.

## Future Security Plans

- Rate limiting on auth endpoints
- HTTPS enforced (already on Vercel)
- Password strength validation
- Email verification on registration
- API key rotation
