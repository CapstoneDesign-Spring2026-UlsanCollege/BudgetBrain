# BudgetBrain - Project Questions

## Architecture Questions
1. Should we use MongoDB Atlas or a local instance for development?
2. Is in-memory fallback acceptable for demo purposes?
3. Should we add rate limiting to auth endpoints?

## Feature Questions
1. Should goals have a deadline reminder system?
2. Should expenses support recurring transactions?
3. Should we add budget rollover to next month?

## Deployment Questions
1. Should we use a custom domain?
2. Should production email delivery be configured for password reset?
3. Should Vercel analytics be enabled?

## UI/UX Questions
1. Should we add onboarding tutorial for new users?
2. Should we support multiple currencies per user?
3. Should we add export to CSV/PDF?

## Answered
- Q: Registration auto-login? A: No, redirect to login page
- Q: Default currency? A: NPR (Nepalese Rupee)
- Q: CSS framework? A: Vanilla CSS only
- Q: State management? A: React Context + localStorage
- Q: Production hosting? A: Vercel
