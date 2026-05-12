# BudgetBrain
BudgetBrain is a modern personal budget planner website designed to help users manage their finances easily and effectively. The system allows users to track income, expenses, savings, and monthly budgets through a clean and interactive dashboard. With features like transaction management, budget tracking, and financial reports, BudgetBrain helps users understand their spending habits and make smarter financial decisions. The website uses a modern dark-themed interface with animations and responsive design to provide a smooth user experience.

## Demo

### Local Setup Demo

Run the app locally to see the full demo:

**Terminal 1 — Backend:**
```sh
cd backend && npm start
```

**Terminal 2 — Frontend:**
```sh
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001`
- Register a new account → Create budgets → Add expenses → Track goals → Explore analytics

### Screenshots

| Dashboard | Analytics |
|-----------|-----------|
| Overview with budget stats, goal progress, spending summaries | Charts, spending breakdowns, budget vs actual comparisons |

| Budgets | Expenses |
|---------|----------|
| Create, edit, delete budgets with auto-colored cards | Filter by category, date range, search with export |

| Profile & Settings | Savings Goals |
|-------------------|---------------|
| Avatar picker, inline name editing, theme/currency settings | Track targets with progress bars and emoji icons |

## Features

- **Authentication** — Register/Login with JWT, distinct error messages for wrong email vs wrong password, avatar per account
- **Budgets** — Create, edit, and delete budgets with auto-colored cards based on 30 distinct hues
- **Expenses** — Add, edit, delete with categories, date range filter, search, CSV/PDF export
- **Savings Goals** — Track goals with progress bars, emoji icons, deadline tracking, add savings
- **Analytics** — Pie charts, bar charts, spending trends, budget vs actual comparisons
- **Dashboard** — Overview with top 3 goal progress, budget summaries, recent spending
- **Profile** — Emoji avatar picker (12 icons), inline name editing, server-synced
- **Settings** — Theme toggle (dark/light), currency selector (NPR, USD, EUR, GBP, JPY, CAD, AUD, SGD), notification preferences
- **Premium UI** — 3D glass cards, liquid buttons with shimmer, animated aurora background, grain texture overlay, DIY LED strip effects, neon tube text glow, ambient light bleed, custom scrollbar, dark/light theme
- **Responsive** — Works on desktop, tablet, and mobile

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18, React Router 6, Vite 4, SWC |
| **Charts** | Recharts 3 (PieChart, BarChart, LineChart, AreaChart) |
| **HTTP Client** | Axios |
| **Icons** | @heroicons/react v2 |
| **Notifications** | React Toastify v9 |
| **Styling** | CSS3 Custom Properties (HSL), CSS animations, keyframes |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB + Mongoose 9, mongodb-memory-server (in-memory fallback) |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Environment** | dotenv |
| **CORS** | cors |

## Installation

### Prerequisites
- Node.js v18+
- MongoDB (optional — app auto-falls back to in-memory database)

### Setup

```sh
# 1. Clone
git clone https://github.com/CapstoneDesign-Spring2026-UlsanCollege/BudgetBrain.git
cd BudgetBrain

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Start backend
cd backend && npm start

# 5. Start frontend (new terminal)
npm run dev
```

## Project Structure

```
BudgetBrain/
├── backend/
│   ├── middleware/auth.js     # JWT auth middleware
│   ├── models/
│   │   ├── User.js            # User schema (name, email, password, avatar)
│   │   ├── Budget.js          # Budget schema (name, amount, color)
│   │   ├── Expense.js         # Expense schema (name, amount, budgetId, category)
│   │   └── Goal.js            # Goal schema (name, target, saved, icon, deadline)
│   ├── routes/
│   │   ├── auth.js            # Register, login, profile update
│   │   ├── budgets.js         # CRUD budgets
│   │   ├── expenses.js        # CRUD expenses
│   │   └── goals.js           # CRUD goals
│   ├── server.js              # Express entry point, DB connection
│   └── package.json
├── public/
│   └── favicon.svg
├── src/
│   ├── actions/
│   │   ├── deleteBudget.js    # Delete budget + its expenses
│   │   └── logout.js          # Clear auth state
│   ├── assets/                # Images, illustrations, icons
│   ├── components/
│   │   ├── AddBudgetForm.jsx  # Budget creation form
│   │   ├── AddExpenseForm.jsx # Expense creation form
│   │   ├── BudgetItem.jsx     # Budget card component
│   │   ├── Charts.jsx         # Recharts wrappers (Pie, Bar, Line, Area)
│   │   ├── EmptyState.jsx     # Empty state placeholder
│   │   ├── ExpenseItem.jsx    # Expense row with category badge
│   │   ├── LoadingSpinner.jsx # Loading indicator
│   │   ├── Navbar.jsx         # Top navbar with avatar, search, dropdown
│   │   ├── Sidebar.jsx        # Side navigation with user footer
│   │   ├── Table.jsx          # Reusable data table
│   │   └── WelcomeBanner.jsx  # Welcome message on dashboard
│   ├── layouts/
│   │   └── Main.jsx           # Main layout (sidebar + navbar + content)
│   ├── pages/
│   │   ├── Login.jsx          # Login page with error messages
│   │   ├── Register.jsx       # Register page (redirects to login)
│   │   ├── Dashboard.jsx      # Main dashboard overview
│   │   ├── BudgetPage.jsx     # Single budget detail view
│   │   ├── BudgetsList.jsx    # All budgets grid view
│   │   ├── ExpensesPage.jsx   # Expenses with filters and export
│   │   ├── Goals.jsx          # Savings goals management
│   │   ├── Analytics.jsx      # Charts and spending insights
│   │   ├── Profile.jsx        # Avatar picker, name editing
│   │   ├── Settings.jsx       # Theme, currency, notifications
│   │   ├── Error.jsx          # Error/404 page
│   │   ├── Auth.css           # Login/register page styles
│   │   └── Dashboard.css      # Dashboard-specific styles
│   ├── api.js                 # Axios instance with interceptor
│   ├── App.jsx                # Route definitions
│   ├── helpers.js             # Utility functions (formatCurrency, etc.)
│   ├── index.css              # Global styles, themes, LED/neon effects
│   └── main.jsx               # Entry point
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update name/avatar |
| GET | `/api/budgets` | Get all budgets |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/:id` | Update budget |
| DELETE | `/api/budgets/:id` | Delete budget |
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/goals` | Get all goals |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |

## Color System

The app uses HSL variables for full theming with an extended palette:

- **Primary:** Cyan (`--accent: 195 85% 55%`)
- **Secondary:** Pink (`--accent-secondary: 330 85% 60%`)
- **10 extended colors:** pink, indigo, teal, rose, coral, lime, sky, amber, emerald, violet
- **30 budget hues** for auto-colored budget cards
- **Dark/Light themes** with full variable overrides

## UI Effects

- Animated aurora background with drifting orbs
- Grain texture noise overlay
- 3D perspective cards with hover lift
- Liquid button shimmer and glow
- DIY LED strip rainbow borders
- Neon tube text glow effects
- RGB rotating border ring
- Ambient light bleed behind elements
- Breathing LED pulse animations
- Conic gradient RGB spinner
- Shiny gradient accent text
- Vertical sidebar LED strip
- Desktop glow spill under cards
