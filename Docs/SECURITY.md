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
RESEND_API_KEY=required_for_production_email_delivery
PASSWORD_RESET_FROM=verified_sender_address
```

Never commit these to the repository.

## Final Security Notes

### JWT Handling
- Tokens expire after 7 days
- Stored in localStorage (frontend)
- Attached to requests via Axios interceptor
- Consider HttpOnly cookies for enhanced security in production

### Password Hashing
- bcrypt with salt rounds
- No plain-text passwords stored anywhere

### Reset Code Security
- 6-digit numeric codes
- SHA-256 hashed before storage
- 10-minute expiration
- Maximum 5 failed attempts before lockout
- Codes are one-time use

### Environment Secrets
- All secrets stored in environment variables
- .env files are gitignored
- Vercel environment variables configured via dashboard
- Never log or expose secrets in client code

### Student Project Limitations
- No dedicated security audit performed
- No penetration testing
- Standard security practices applied but not exhaustive
- Use strong, unique passwords

## Future Security Plans

- Rate limiting on auth endpoints (partially implemented)
- HTTPS enforced (already on Vercel)
- Email verification on registration
- API key rotation
- Multi-factor authentication
- HttpOnly cookie-based sessions
