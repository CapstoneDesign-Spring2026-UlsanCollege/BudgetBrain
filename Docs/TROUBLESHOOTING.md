# BudgetBrain Troubleshooting Guide

## Build Errors

**Error: Module not found**
- Run `npm install` in both root and backend directories
- Check that package.json has all dependencies

**Error: Build fails with Vite**
- Try `rm -rf node_modules && npm install`
- Check Node.js version (18+ recommended)

## API Issues

**Error: Cannot connect to API**
- Make sure backend is running: `cd backend && npm start`
- Check that port 5000 is not in use
- In dev mode, Vite proxies /api to localhost:5000

**Error: 401 Unauthorized**
- Your token expired. Login again.
- Clear localStorage and refresh

**Error: 403 Forbidden**
- Check your email and password are correct
- Registration redirects to login, not auto-login

**Error: 500 Server Error**
- Check MongoDB connection
- Look at terminal for error details
- The in-memory fallback may be active

## MongoDB Issues

**Error: Mongoose connection failed**
- Check MONGO_URI in backend/.env
- Ensure MongoDB Atlas IP whitelist includes your IP
- The app will use in-memory fallback automatically

## Vercel Deployment Issues

**Error: 404 on page refresh**
- Vercel rewrites should handle this. Check vercel.json

**Error: API returns 500 on Vercel**
- Check Vercel environment variables
- Verify MONGO_URI and JWT_SECRET are set in Vercel dashboard
- Check Vercel function logs

## Frontend Issues

**Theme not changing**
- Go to Settings and toggle theme manually
- Check browser console for errors

**Charts not showing**
- Make sure you have expenses with data
- Recharts requires valid number values
- Check console for Recharts errors

## Data Issues

**My budgets are gone**
- In-memory fallback loses data on restart
- Connect to MongoDB Atlas for persistence
- Check that you are logged in to the same account
