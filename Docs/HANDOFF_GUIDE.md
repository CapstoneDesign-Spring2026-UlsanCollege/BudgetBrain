# BudgetBrain — Project Handoff Guide

## How to Run Locally

### Prerequisites
- Node.js (v18 or later)
- npm
- MongoDB (local or Atlas account)
- Git

### Steps

1. Clone the repository:
   ```sh
   git clone https://github.com/CapstoneDesign-Spring2026-UlsanCollege/BudgetBrain.git
   cd BudgetBrain
   ```

2. Install frontend dependencies:
   ```sh
   npm install
   ```

3. Install backend dependencies:
   ```sh
   cd backend
   npm install
   cd ..
   ```

4. Create `backend/.env`:
   ```sh
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_strong_jwt_secret
   PORT=5001
   ```

5. Start the backend:
   ```sh
   cd backend
   npm start
   ```

6. Start the frontend (new terminal):
   ```sh
   npm run dev
   ```

7. Open http://localhost:5173

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| MONGO_URI | Yes | MongoDB connection string |
| JWT_SECRET | Yes | Secret key for JWT signing |
| PORT | No | Backend server port (default: 5000) |
| RESEND_API_KEY | No | For email delivery (password reset) |
| PASSWORD_RESET_FROM | No | Verified sender email address |
| PADDLEOCR_API_URL | No | OCR service endpoint |
| PADDLEOCR_API_KEY | No | OCR service authentication |
| EXCHANGE_RATE_API_URL | No | Currency rate provider URL |

## Frontend Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (output: dist/) |
| `npm run preview` | Preview production build locally |

## Backend Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (auto-restart) |

## Deployment Notes

- **Platform:** Vercel (free tier)
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Serverless function:** `api/index.js`
- **Vercel rewrites:** `/api/*` → serverless function, all other routes → `index.html`
- Set environment variables in Vercel dashboard (Settings → Environment Variables)

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| MongoDB connection fails | DB not running or wrong URI | Check MONGO_URI, verify MongoDB is running |
| Port already in use | Another process on same port | Change PORT in .env or kill the process |
| CORS errors | Backend not running or wrong port | Ensure backend is running on correct port |
| Blank page on localhost | Console errors or backend down | Check browser console, ensure backend is up |
| npm install fails | Dependency conflicts | Delete node_modules and package-lock.json, reinstall |

## Where Important Files Live

| File | Purpose |
|------|---------|
| `src/` | React frontend source code |
| `backend/` | Express.js backend server |
| `api/index.js` | Vercel serverless entry point |
| `Docs/` | All project documentation |
| `Final Portfolio Information/` | Final report, demo script, etc. |
| `PROJECT/` | Weekly project summaries |
| `vercel.json` | Vercel deployment configuration |
| `vite.config.js` | Vite build configuration |

## Maintenance Checklist

### Weekly
- Check Vercel deployment logs for errors
- Verify MongoDB Atlas cluster is running
- Review GitHub issues and pull requests

### Monthly
- Update npm dependencies (`npm update`)
- Check for security advisories (`npm audit`)
- Review and archive old issues
- Backup MongoDB Atlas data (if needed)

### Quarterly
- Review and update documentation
- Test password reset email flow
- Verify OCR service endpoints
- Check SSL certificate validity (Vercel handles this)
