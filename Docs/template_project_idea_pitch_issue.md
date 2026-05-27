# Project Idea Pitch — BudgetBrain

## Team

**Team Name**

BudgetBrain Development Team

**Members**

- Bidhan Pokhrel
- Suvakar Dahal
- Sunil Tamang
- Angnima Sherpa

**Repository**

https://github.com/CapstoneDesign-Spring2026-UlsanCollege/BudgetBrain

---

## 1. Project Title

BudgetBrain — Personal Finance Management Web Application

---

## 2. Problem

Many college students, especially international students, struggle to manage their personal finances. Tracking daily expenses, staying within monthly budgets, and saving money for goals are common challenges. Most finance apps are either too complex, require bank account connections, or are not designed for student needs. There is a clear need for a simple, accessible budget tracking tool that works on any device.

---

## 3. Target Users

- College and university students managing living expenses
- Young professionals starting personal finance management
- Anyone looking for a simple, no-frills budget tracking tool

---

## 4. What the System Will Do

Users can create budgets by category (e.g., Food, Transport, Entertainment), record daily expenses against those budgets, set savings goals with visual progress tracking, and view their overall financial health through dashboard summary cards and analytics charts.

---

## 5. Core Features (First Version)

- User registration and login with JWT authentication
- Create, edit, and delete budgets by category with color coding
- Add, edit, and delete expenses linked to budgets
- Set savings goals with target amount, deadline, and progress tracking
- Dashboard with summary cards and spending analytics charts
- Profile management with avatar selection
- Dark/light theme toggle
- Password reset via email codes

---

## 6. Demo Scenario

Step 1: User opens BudgetBrain and registers a new account
Step 2: User logs in and lands on the dashboard
Step 3: User creates a budget (e.g., "Food" — 20,000 NPR)
Step 4: User records an expense against that budget
Step 5: User creates a savings goal (e.g., "New Laptop" — 100,000 NPR)
Step 6: User adds savings to the goal and watches the progress bar update
Step 7: Dashboard displays budget progress, analytics charts, and recent transactions

---

## 7. Minimum Viable Product (MVP)

The MVP allows a user to register, log in, create budgets, record expenses, set savings goals, and view a dashboard with summary cards and basic charts. All data is persisted in MongoDB. The app is deployed on Vercel with a live demo URL.

---

## 8. Technology Plan

| Area | Tool |
| --- | --- |
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express 5.x |
| Database | MongoDB (Atlas) |
| Auth | JWT (JSON Web Tokens) |
| Charts | Recharts |
| Styling | Vanilla CSS with CSS variables |
| Hosting | Vercel |

---

## 9. Risks or Unknowns

- MongoDB connection handling in serverless environment (Vercel)
- Password reset email delivery in production requires third-party API (Resend)
- Team members have varying skill levels with React and Express
- Deploying a full-stack app with serverless functions adds complexity

---

## 10. Scope Check

- [x] Demoable
- [x] Feasible
- [x] Well scoped

---

## Instructor Review (leave blank)

Comments:

Suggested changes:
