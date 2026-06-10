# BudgetBrain — Maintenance Plan

## Weekly Maintenance

- [ ] Check Vercel deployment status and logs
- [ ] Verify MongoDB Atlas cluster connectivity
- [ ] Monitor application uptime
- [ ] Review any new GitHub issues
- [ ] Check OCR service availability (if configured)

## Monthly Maintenance

- [ ] Update npm dependencies (`npm update` in root and backend)
- [ ] Run `npm audit` and address vulnerabilities
- [ ] Review and rotate JWT_SECRET if needed
- [ ] Check MongoDB Atlas data usage (free tier limit)
- [ ] Verify Resend API email delivery (if configured)
- [ ] Test password reset flow end-to-end
- [ ] Review and close stale GitHub issues

## Quarterly Maintenance

- [ ] Full dependency upgrade (`npm outdated` → `npm update`)
- [ ] Security review of all dependencies
- [ ] Update documentation if API or UI changes
- [ ] Review and update environment variables
- [ ] Test full registration → budget → expense → goal flow
- [ ] Verify responsive design on new device sizes
- [ ] Check Vercel usage and billing (if applicable)

## Annual Maintenance

- [ ] Major framework version upgrades (React, Express, Vite)
- [ ] Database schema review and optimization
- [ ] Full application security audit
- [ ] Update license and team information
- [ ] Archive old data if needed

## Database Backup Notes

- MongoDB Atlas provides automated backups (check your plan)
- For manual backup: use `mongodump` or Atlas export
- Store backups in a secure, separate location
- Test restore process periodically

## Monitoring Notes

- Vercel provides deployment logs and analytics
- MongoDB Atlas provides database monitoring
- No third-party APM tool configured (student project scope)
- Consider adding Sentry or similar for error tracking in production

## Security Checks

- [ ] No .env files committed to repository
- [ ] JWT tokens expire and require re-login
- [ ] Password reset codes expire after 10 minutes
- [ ] Rate limiting active on auth endpoints
- [ ] CORS restricted to frontend origin
- [ ] Input validation on all API endpoints

## Owner Responsibilities

| Area | Responsible Role |
|------|-----------------|
| Frontend code | Frontend Lead |
| Backend API | Backend Lead |
| Database | Backend Lead |
| Deployment | Documentation & Deployment Lead |
| Documentation | Documentation & Deployment Lead |
| Security | All team members |
| Dependency updates | Rotating responsibility |
