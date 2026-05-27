# BudgetBrain Deployment Guide

## Local Setup Guide

Follow these steps to run BudgetBrain on your local machine for development or testing.

### Prerequisites

- Node.js (v18 or later recommended)
- npm (comes with Node.js)
- MongoDB (local installation or MongoDB Atlas account)
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/CapstoneDesign-Spring2026-UlsanCollege/BudgetBrain.git
cd BudgetBrain
```

### Step 2: Install Frontend Dependencies

From the project root:

```bash
npm install
```

This installs all frontend dependencies (React, Vite, Recharts, Axios, etc.) and backend dependencies (Express, Mongoose, bcryptjs, etc.) as listed in the root `package.json`.

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

This installs backend-specific packages listed in `backend/package.json`.

### Step 4: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
MONGO_URI=mongodb://localhost:27017/budgetbrain
JWT_SECRET=your_strong_jwt_secret_here
PORT=5001
```

**Configuration Notes:**
- `MONGO_URI`: Connection string for your MongoDB instance. Use `mongodb://localhost:27017/budgetbrain` for a local MongoDB, or your MongoDB Atlas connection string for cloud.
- `JWT_SECRET`: A random string used to sign JSON Web Tokens. Use a long, unique value in production.
- `PORT`: The port the backend server will listen on (default: 5000).

### Step 5: Start the Backend Server

```bash
cd backend
npm start
```

The server will start and connect to MongoDB. You should see:
```
Server running on port 5001
MongoDB connected successfully.
```

### Step 6: Start the Frontend Development Server

Open a new terminal in the project root:

```bash
npm run dev
```

This starts the Vite development server, typically at `http://localhost:5173`. The Vite config proxies `/api` requests to the backend at `http://localhost:5001`.

### Step 7: Open the Application

Open `http://localhost:5173` in your browser. You should see the BudgetBrain login page.

## Database Setup

### Option A: Local MongoDB

1. Install MongoDB Community Edition from the official MongoDB website
2. Start the MongoDB service:
   ```bash
   # Windows
   net start MongoDB

   # macOS/Linux
   sudo systemctl start mongod
   ```
3. Set `MONGO_URI=mongodb://localhost:27017/budgetbrain` in `.env`

### Option B: MongoDB Atlas (Cloud)

1. Create a free account at https://www.mongodb.com/atlas
2. Create a new cluster (free tier is sufficient)
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string from the Atlas dashboard
6. Set `MONGO_URI=<your_atlas_connection_string>` in `.env`

## Common Problems and Fixes

### Problem: MongoDB connection fails
**Fix:** Ensure MongoDB is running locally. Check the `MONGO_URI` value in `.env`. For Atlas, verify your IP is whitelisted.

### Problem: Port already in use
**Fix:** Change the `PORT` value in `backend/.env` or kill the process using the port.

### Problem: CORS errors in browser
**Fix:** Ensure the backend is running on the correct port. The Vite dev server proxies `/api` to `localhost:5001` by default.

### Problem: npm install fails
**Fix:** Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

### Problem: Blank page on localhost
**Fix:** Check the browser console for errors. Ensure the backend is running and MongoDB is connected.

## Vercel Deployment

### Prerequisites

- GitHub repository with the project code
- Vercel account (free tier)
- MongoDB Atlas URI for production database

### Deployment Steps

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. Go to https://vercel.com and import your GitHub repository

3. Configure the project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add environment variables in Vercel dashboard (Settings → Environment Variables):
   - `MONGO_URI` — Your MongoDB Atlas connection string
   - `JWT_SECRET` — A strong random secret for JWT signing
   - `NODE_ENV` — `production`

5. Deploy — Vercel will automatically build and deploy the application

### How Vercel Deployment Works

- The frontend is built into static files in the `dist/` directory
- The backend runs as a serverless function at `api/index.js`
- Vercel rewrites `/api/*` requests to the serverless function
- All other routes are rewritten to `index.html` for SPA routing

## Security Notes

- Never commit the `.env` file to version control
- Use strong, unique values for `JWT_SECRET` in production
- MongoDB Atlas connection strings contain credentials — keep them secure
- The `.env` file is listed in `.gitignore` to prevent accidental commits

## Future Deployment Plan

| Target | Status | Notes |
|--------|--------|-------|
| Vercel (current) | ✅ Deployed | Serves both frontend and API |
| Custom Domain | ⬜ Planned | May add custom domain later |
| Docker Container | ⬜ Planned | Containerized deployment |
| CI/CD Pipeline | ⬜ Planned | Automated testing before deploy |
