# BudgetBrain User Flow

## Complete User Journey

This document describes the full user flow from opening the BudgetBrain website to logging out, including all major features and interactions.

```
                        ┌─────────────────────┐
                        │   Open BudgetBrain   │
                        │   (Landing Page)     │
                        └─────────┬───────────┘
                                  │
                                  ▼
                        ┌─────────────────────┐
                        │   Login Page         │
                        │   /login             │
                        └──┬──────────────┬───┘
                           │              │
              ┌────────────┤              ├────────────┐
              ▼            │              │            ▼
     ┌──────────────┐     │              │    ┌──────────────┐
     │  Register    │     │              │    │ Forgot       │
     │  /register   │     │              │    │ Password     │
     └──────┬───────┘     │              │    └──────┬───────┘
            │             │              │           │
            ▼             │              │           ▼
     ┌──────────────┐     │              │    ┌──────────────┐
     │ Fill Form:   │     │              │    │ Enter Email  │
     │ Name, Email, │     │              │    │ Receive Code │
     │ Password     │     │              │    │ Reset PWD    │
     └──────┬───────┘     │              │    └──────┬───────┘
            │             │              │           │
            ▼             │              │           │
     ┌──────────────┐     │              │           │
     │ Registration │     │   ┌──────────┘           │
     │ Successful   │     │   │                      │
     │ Redirect to  ├─────┘   │                      │
     │ /login       │         │                      │
     └──────────────┘         │                      │
                              ▼                      │
                    ┌──────────────────┐             │
                    │  Login Submit    │             │
                    │  (email + pwd)   │             │
                    └────────┬─────────┘             │
                             │                       │
                             ▼                       │
                    ┌──────────────────┐             │
                    │  JWT Stored in   │             │
                    │  localStorage    │             │
                    │  Redirect to /   │             │
                    └────────┬─────────┘             │
                             │                       │
                             ▼                       │
                    ┌──────────────────┐             │
                    │   DASHBOARD      │             │
                    │   (Main Hub)     │             │
                    └──┬───┬───┬───┬──┘              │
                       │   │   │   │                 │
          ┌────────────┘   │   │   └────────────┐    │
          ▼                ▼   ▼                ▼    │
    ┌──────────┐    ┌──────────────┐    ┌──────────┐ │
    │ Add      │    │ Create       │    │ View     │ │
    │ Expense  │    │ Budget       │    │ Analytics│ │
    └────┬─────┘    └──────┬───────┘    └────┬─────┘ │
         │                │                  │       │
         ▼                ▼                  ▼       │
    ┌──────────┐    ┌──────────────┐    ┌──────────┐ │
    │ Select   │    │ Set Name,    │    │ Charts:  │ │
    │ Budget,  │    │ Amount,      │    │ Pie, Bar │ │
    │ Enter    │    │ Color        │    │ Spending │ │
    │ Amount   │    │              │    │ Trends   │ │
    └──────────┘    └──────────────┘    └──────────┘ │
         │                │                  │       │
         ▼                ▼                  ▼       │
    ┌─────────────────────────────────────────────┐  │
    │         Budget Progress Cards                │  │
    │  See spent vs allocated per budget category │  │
    └─────────────────────┬───────────────────────┘  │
                          │                          │
                          ▼                          │
               ┌──────────────────────┐             │
               │   Savings Goals      │             │
               │   /goals             │             │
               └──┬───────────────┬───┘             │
                  │               │                 │
                  ▼               ▼                 │
          ┌──────────────┐ ┌──────────────┐         │
          │ Create Goal  │ │ Add Savings  │         │
          │ Name, Target │ │ Amount to    │         │
          │ Deadline,Icon│ │ Existing Goal│         │
          └──────────────┘ └──────────────┘         │
                  │               │                 │
                  ▼               ▼                 │
          ┌──────────────────────────────────────┐  │
          │       Goal Progress Percentage        │  │
          │   savedAmount / targetAmount x 100    │  │
          └──────────────────────────────────────┘  │
                          │                          │
                          ▼                          │
               ┌──────────────────────┐             │
               │   Profile/Settings   │             │
               │                      │             │
               ├──────────────────────┤             │
               │ • Edit Name         │             │
               │ • Change Avatar     │             │
               │ • Change Password   │             │
               │ • Toggle Theme      │             │
               │   (Dark/Light)      │             │
               │ • Set Currency      │             │
               │   (NPR default)     │             │
               └──────────┬───────────┘             │
                          │                         │
                          ▼                         │
               ┌──────────────────────┐             │
               │       Logout         ├─────────────┘
               │ Clear localStorage  │
               │ Redirect to /login  │
               └──────────────────────┘
```

## Step-by-Step Flow

### 1. Landing on the App
- User opens the BudgetBrain URL
- If not authenticated, redirected to `/login`
- If authenticated (token in localStorage), redirected to `/` (Dashboard)

### 2. Registration (New Users)
- Click "Create one here" link on login page
- Fill in name, email, password, and confirm password
- Password must meet strength requirements (8+ chars, letter + number)
- Submit form → API call to `/api/auth/register`
- Success → redirected to login page (no auto-login)
- Error → toast notification with error message

### 3. Login (Returning Users)
- Enter email and password
- Submit form → API call to `/api/auth/login`
- Success → JWT stored in localStorage, redirected to Dashboard
- Error → toast with "Invalid email or password" message

### 4. Dashboard Overview
- Welcome banner with user name
- Summary cards: total allocated, total spent, remaining funds
- Financial analytics charts (if expenses exist)
- Recent transactions (last 5)
- Savings goals progress mini-cards
- Currency conversion widget
- Budget progress breakdown

### 5. Adding an Expense
- Use the "Record Expense" form on Dashboard
- Select budget category from dropdown
- Enter expense name and amount
- Select category
- Submit → expense appears in recent transactions and budget tracking

### 6. Viewing Transaction History
- Click "View All History" on Dashboard
- Full expense list on `/expenses` page
- Sortable by date (newest first)
- Edit or delete individual expenses

### 7. Creating a Budget
- Use the "New Budget" form on Dashboard
- Enter budget name and amount
- Select display color
- Submit → budget appears in budget breakdown cards

### 8. Tracking Budget Progress
- Each budget card shows amount spent vs allocated
- Visual progress bar with percentage
- Color-coded (green = under budget, red = over budget)

### 9. Creating a Savings Goal
- Navigate to `/goals` page
- Click "Add Goal" or use the form
- Enter goal name, target amount, deadline, and icon
- Submit → goal appears with 0% progress

### 10. Adding Savings to a Goal
- On `/goals` page, use "Add Savings" on an existing goal
- Enter amount to add
- Progress percentage updates automatically

### 11. Managing Profile / Settings
- Navigate to `/profile` to:
  - Edit display name
  - Change avatar emoji
  - Change password
- Navigate to `/settings` to:
  - Toggle dark/light theme
  - Set preferred currency

### 12. Logout
- Click logout button
- localStorage is cleared (token, userName, avatar)
- Redirected to `/login`
