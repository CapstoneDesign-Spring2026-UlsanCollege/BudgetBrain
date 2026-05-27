# PROJECT.md - Capstone Design Project Overview

---

# Team Information

**Team Name**

BudgetBrain Development Team

**Repository**

https://github.com/CapstoneDesign-Spring2026-UlsanCollege/BudgetBrain

**Team Members**

| Name | Role Rotation (first week) |
| --- | --- |
| Bidhan Pokhrel | Frontend Lead |
| Suvakar Dahal | Backend Lead |
| Sunil Tamang | Documentation & Deployment Lead |
| Angnima Sherpa | UI/UX Designer |

---

# Project Title

BudgetBrain — Personal Finance Management Web Application

---

# Problem Statement

Many college students, especially international students, struggle to manage personal finances. Tracking daily expenses, staying within monthly budgets, and saving for goals are common challenges. Existing finance apps are either too complex, require bank connections, or are not designed for student needs.

Our project solves this by providing a simple, accessible budget planning tool that works on any device without requiring bank integration.

---

# Target Users

- College and university students
- Young professionals starting to manage personal finances
- Anyone looking for a simple budget tracking tool

---

# Project Goal

BudgetBrain will allow users to create budgets by category, record and track expenses, set savings goals with progress tracking, and view spending analytics through visual charts — all from a clean, responsive web interface.

---

# Core Features (First Version)

- User registration and login with JWT authentication
- Budget creation, editing, and deletion by category
- Expense recording, editing, and deletion
- Savings goal creation with progress tracking
- Dashboard with summary cards and spending analytics charts
- Profile management with avatar selection
- Dark/light theme toggle
- Password reset via email codes

---

# Demo Scenario (Very Important)

Step 1: User opens BudgetBrain and registers a new account
Step 2: User logs in and lands on the dashboard
Step 3: User creates a budget (e.g., "Food" — 20,000 NPR)
Step 4: User records an expense against that budget
Step 5: User creates a savings goal (e.g., "New Laptop" — 100,000 NPR)
Step 6: User adds savings to the goal and sees progress update
Step 7: Dashboard shows budget progress bars, analytics charts, and recent transactions

---

# Minimum Viable Product (MVP)

The MVP will allow a user to register, log in, create budgets, record expenses, set savings goals, and view a dashboard with summary cards and basic charts. All data persists via MongoDB. The app runs on Vercel with a live demo URL.

---

# Stretch Goals (Optional)

- Smart bank/card transaction integration
- Receipt scanning with OCR
- AI-powered spending insights
- Monthly financial report generation
- Email and push notifications
- Multi-language support

---

# Technology Stack

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

# Project Scope Rules

To keep the project realistic:

- Start small: core auth, budgets, expenses, goals
- Add features gradually each sprint
- Focus on working software above all

Avoid:

- Too large scope (no bank integrations in v1)
- Unclear features
- Impossible demo scenarios

A good project is:

```text
Demoable
Feasible
Well-scoped
```

---

# Weekly Development Process

Your team will work in **weekly sprints**.

Typical cycle:

```text
Idea
↓
Issue
↓
Branch
↓
Pull Request
↓
Merge
↓
Demo
```

Each week ends with a **Sprint Packet submission**.

---

# Project Evolution

This project will change during the semester.

Update this document when:

- the scope changes
- new features are added
- the demo scenario evolves
- technology decisions change

Use Git commits to track changes.
