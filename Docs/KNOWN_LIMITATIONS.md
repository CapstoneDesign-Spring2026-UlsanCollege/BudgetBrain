# BudgetBrain — Known Limitations

This document honestly documents the current limitations of the BudgetBrain application. These are acknowledged as part of the student capstone project scope.

## Functional Limitations

### No Bank/Card Integration
BudgetBrain does not connect to bank accounts or credit cards. All transactions must be entered manually or scanned from receipts. This is by design for this MVP, as bank API integration requires additional security compliance and third-party partnerships.

### No Recurring Transactions
The app does not support recurring or subscription-based transactions. Each expense must be entered individually. This is planned as a future enhancement.

### No Data Export
Users cannot currently export their data as CSV, PDF, or other formats. Data only lives in the application and database.

### No Multi-User Features
BudgetBrain is single-user only. Features like budget sharing with family/roommates or collaborative budgeting are not implemented.

## Technical Limitations

### OCR Dependency
Receipt scanning depends on either:
- An external PaddleOCR-compatible service (requires separate deployment)
- Browser-based Tesseract.js (slower, less accurate)

OCR accuracy varies based on image quality, lighting, and receipt condition.

### Limited Test Automation
Testing was performed manually. There is no automated CI/CD test pipeline. While all core features were manually verified, regression testing is not automated.

### No Production Monitoring
There is no application performance monitoring (APM), error tracking service, or user analytics configured. Debugging relies on Vercel logs and browser developer tools.

### In-Memory Fallback
When MongoDB is unavailable, the app falls back to an in-memory store. Data in this mode is lost on server restart. This is intended for development only.

### No PWA / Offline Support
The application requires an active internet connection. There is no offline caching or progressive web app support.

### No Push Notifications
The app does not support push notifications. Password reset emails are sent via Resend API, but there are no in-app or push notifications for budget limits, goal reminders, etc.

## Deployment Limitations

### Vercel Free Tier
Deployed on Vercel free tier, which has:
- Serverless function execution time limits
- Bandwidth and build minute limits
- No custom domain (unless configured separately)

### MongoDB Atlas Free Tier
Database hosted on MongoDB Atlas free tier (M0 cluster) with:
- 512 MB storage limit
- Limited connection capacity
- No automated backups (manual only)

## Project Scope Limitations

### Student Project
BudgetBrain was developed as a capstone project with a fixed 15-week timeline. Some features that would be expected in a commercial product are not yet implemented (see Future Enhancements).

### Single Developer per Area
Each major area (frontend, backend, documentation, UI design) had one primary team member. There was no dedicated QA engineer, DevOps specialist, or security auditor.

## Known Bugs

No known bugs at the time of release. All tested features are functioning as designed.

## Future Improvements

See [FUTURE_ENHANCEMENTS.md](FUTURE_ENHANCEMENTS.md) and [ROADMAP.md](ROADMAP.md) for planned improvements beyond this release.
