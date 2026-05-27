# BudgetBrain Deployment Guide

The app is deployed on Vercel at https://budgetbrain.vercel.app.

## Vercel Setup

1. Push code to GitHub
2. Go to https://vercel.com and import the repo
3. Configure:

| Setting | Value |
|---|---|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Root Directory | `/` |

4. Add environment variables:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `RESEND_API_KEY` | Optional API key for production password reset email delivery |
| `PASSWORD_RESET_FROM` | Optional sender address for password reset email |
| `PASSWORD_RESET_BASE_URL` | Optional frontend URL used in reset links |

## How It Works

Vercel serves the built React frontend from `dist/`. API requests to `/api/*` are rewritten to the serverless function in the `api/` directory.

## Local Development

```sh
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
npm run dev
```

Frontend runs on `:5173`, backend on `:5000`. Vite proxies `/api` requests.

## Environment Variables

```sh
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_random_secret
PORT=5000
RESEND_API_KEY=re_...
PASSWORD_RESET_FROM=BudgetBrain <onboarding@resend.dev>
PASSWORD_RESET_BASE_URL=https://budgetbrain.vercel.app
```

## Build

```sh
npm run build
```

Check `dist/` for output. No errors expected.

## Troubleshooting

- Check Vercel build logs
- Verify MONGO_URI and JWT_SECRET are set
- Make sure MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check that all dependencies are in root package.json
