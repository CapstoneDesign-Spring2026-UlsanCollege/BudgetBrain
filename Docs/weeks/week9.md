# Week 9 - Improvement After Midterm and Stabilization

**Date:** April 27 - May 1, 2026 

## What We Did

After the midterm, we took the feedback and made several improvements. We focused on making the app more stable and getting it deployed on Vercel.

## Improvements Made

- Reduced dashboard API request load (fewer API calls on load)
- Improved Vercel auth database handling
- Fixed Vercel function entry point for serverless deployment
- Fixed API routing for Vercel (prepend /api prefix in serverless function)
- Added backend dependencies to root package.json for Vercel compatibility
- Replaced in-memory MongoDB with proper connection handling
- Organized sprint documentation files

## Tasks Completed

| Task | Status |
|---|---|
| Vercel deployment working | Done |
| API request optimization | Done |
| Auth handling improved | Done |
| Documentation organized | Done |
| Build verified (0 errors) | Done |
| Performance improvements | Done |

## Known Issues

- In-memory fallback still used when MongoDB is unavailable
- No automated tests yet (Planned)

## What is Next

Future improvements could include:
- Unit tests for API routes
- Recurring transactions
- CSV/PDF export
- Email notifications for budget limits
