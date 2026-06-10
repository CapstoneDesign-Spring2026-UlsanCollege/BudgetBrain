# BudgetBrain — Poster Content

## Project Title
**BudgetBrain: Smart Finance Management for College Students**

## One-Sentence Pitch
A full-stack web application that helps college students track expenses, manage budgets, set savings goals, and visualize spending through interactive charts.

## Problem
College students lack accessible budgeting tools. Existing solutions are either too complex or require bank integration, leaving students without a simple way to manage their finances.

## Solution
BudgetBrain provides a complete, easy-to-use budgeting platform accessible from any browser. It combines budget tracking, expense management, savings goals, and visual analytics in one application.

## Key Features
- User authentication with JWT and password reset
- Budget creation with color-coded categories
- Expense tracking linked to budgets
- Savings goals with progress indicators
- Interactive charts (pie, bar) for spending analytics
- Dark/light theme toggle
- Receipt scanning with OCR
- Currency conversion with live exchange rates
- Responsive design for all devices

## System Architecture
```
React 18 + Vite (Frontend)
        ↓ Axios API calls
Express.js + Node.js (Backend)
        ↓ Mongoose ODM
MongoDB Atlas (Database)
```

Deployed on Vercel with serverless API functions.

## Screenshots
TODO: add real screenshots

[Placeholder for Dashboard Screenshot]
[Placeholder for Budgets Page]
[Placeholder for Analytics Charts]
[Placeholder for Dark Mode]

## Results
- 4 MongoDB collections, 20+ API endpoints
- All features tested with 90+ manual test cases
- Build passes with 0 errors
- Live at budgetbrain.vercel.app
- Developed over 15 weeks using agile sprints

## Future Work
- Bank transaction integration
- Recurring transactions
- Data export (CSV/PDF)
- AI-powered spending insights
- Mobile app (React Native)

## Team
- Bidhan Pokhrel — Frontend Lead
- Suvakar Dahal — Backend Lead
- Sunil Tamang — Documentation & Deployment
- Angnima Sherpa — UI/UX Designer

**Ulsan College — Capstone Design Spring 2026**
