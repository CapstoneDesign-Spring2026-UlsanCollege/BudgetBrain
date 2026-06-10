# BudgetBrain FAQ

## General

**Q: What is BudgetBrain?**
A: BudgetBrain is a full-stack web application for personal finance management. It helps college students track expenses, manage budgets, set savings goals, and visualize spending through interactive charts.

**Q: Is it free?**
A: Yes, completely free and open-source under the MIT license.

**Q: Do I need an account?**
A: Yes, you need to register with your name, email, and password to save your data. Your data is private and secured.

**Q: Where can I access it?**
A: The live app is at https://budgetbrain.vercel.app/. All source code is on GitHub.

## Account & Authentication

**Q: How do I create an account?**
A: Click "Register" on the login page, enter your name, email, and password (must include a letter and a number, minimum 8 characters).

**Q: I forgot my password. What do I do?**
A: Click "Forgot Password?" on the login page, enter your email, and you'll receive a reset code. Use that code to set a new password. The code expires after 10 minutes.

**Q: Can I change my password?**
A: Yes, go to Profile and use the "Change Password" option. You'll need your current password.

**Q: Is my account secure?**
A: Yes. Passwords are hashed with bcrypt. Authentication uses JWT tokens that expire. No plain-text passwords are stored.

## Features

**Q: Can I create multiple budgets?**
A: Yes, you can create as many budgets as you want. Each budget has a name, amount, and color.

**Q: Can I track individual expenses?**
A: Yes, expenses are recorded within budgets. Each expense has a name, amount, date, and category.

**Q: What happens when I delete a budget?**
A: Deleting a budget also deletes all associated expenses (cascading delete).

**Q: Is there a dark mode?**
A: Yes, you can switch between dark and light themes in Settings. Your preference is saved.

**Q: What currency does it use?**
A: You can choose your preferred currency in Settings. Live exchange rates are shown on the dashboard.

**Q: Can I set savings goals?**
A: Yes, create goals with target amounts and optional deadlines. Track your progress with visual indicators.

**Q: How do the analytics charts work?**
A: The Analytics page shows a pie chart of spending by category and a bar chart of monthly spending trends.

**Q: Can I scan receipts?**
A: Yes, upload a receipt image and the app extracts text using OCR. Primary OCR is via PaddleOCR service; browser-based Tesseract.js is the fallback.

## Technical

**Q: Is there a mobile app?**
A: Not yet. The web app is fully mobile-responsive and works on any device with a browser.

**Q: How is my data stored?**
A: Data is stored in MongoDB Atlas (cloud database). Passwords are hashed with bcrypt. JWT tokens handle sessions.

**Q: Is my data safe?**
A: We follow security best practices: no plain-text passwords, no secrets in client code, CORS restricted to the frontend origin, rate limiting on auth endpoints.

**Q: Can I export my data?**
A: Not yet. CSV and PDF export are planned for future releases.

**Q: Is my data shared with anyone?**
A: No. Your data belongs to you. BudgetBrain does not sell or share user data.

**Q: What happens if the database is down?**
A: The app handles this gracefully with appropriate error messages. There is no data loss; data persists in MongoDB Atlas.

## Deployment

**Q: How is BudgetBrain deployed?**
A: The frontend is built as static files with Vite and served on Vercel. The backend runs as a Vercel serverless function. Database is MongoDB Atlas.

**Q: Can I run it locally?**
A: Yes. Clone the repo, install dependencies with `npm install`, set up MongoDB, create a `.env` file, and run `npm run dev` for the frontend and `npm start` in the `/backend` directory.

**Q: What environment variables are needed?**
A: `MONGO_URI`, `JWT_SECRET`, and optionally `RESEND_API_KEY`, `PASSWORD_RESET_FROM`, `PADDLEOCR_API_URL`, `PADDLEOCR_API_KEY`, and `EXCHANGE_RATE_API_URL`.

## Limitations

**Q: Does BudgetBrain connect to my bank?**
A: No. BudgetBrain does not currently support bank integration. All transactions must be entered manually or via receipt scanning.

**Q: Can I share budgets with others?**
A: Not yet. Multi-user budget collaboration is a planned future feature.

**Q: Is there offline support?**
A: Not yet. PWA support is planned but not implemented.

## Troubleshooting

**Q: The app is slow. What should I do?**
A: Check your internet connection. The app requires connectivity to the backend API and MongoDB Atlas.

**Q: My data disappeared after refresh.**
A: If using the in-memory database fallback (development mode), data is lost on server restart. Production data persists in MongoDB Atlas.

**Q: Theme keeps resetting.**
A: Ensure localStorage is enabled in your browser settings. Theme preference is stored locally.

**Q: Receipt scanning doesn't work.**
A: Make sure the image is clear. Try a different format (JPG or PNG). If the PaddleOCR service is down, the app falls back to browser-based Tesseract.
