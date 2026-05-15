# BudgetBrain Component Reference

## Pages

### Login.jsx
Login form with email and password fields. Shows error messages for wrong email vs wrong password. Links to Register page.

### Register.jsx
Registration form with name, email, and password. Redirects to Login on success (no auto-login).

### Dashboard.jsx
Main overview page showing total budget, total spent, remaining balance, and budget cards with progress bars.

### BudgetsList.jsx
Lists all budgets with color-coded cards. Each card shows name, amount, spent, and progress bar.

### BudgetPage.jsx
Single budget detail view. Shows budget info and a table of expenses for that budget.

### ExpensesPage.jsx
Full expenses view with filtering by budget. Table shows name, amount, date, and budget category.

### Goals.jsx
Savings goals page. Shows goal cards with progress bars and buttons to add savings.

### Analytics.jsx
Charts page. Uses Recharts for pie chart (spending by category) and bar chart (monthly trends).

### Profile.jsx
Profile editing page. Avatar picker with multiple options. Name editing.

### Settings.jsx
Settings page. Theme toggle (dark/light), currency selector, notification toggle.

## Components

### Sidebar.jsx
Navigation sidebar with links to all pages. Active link highlighting. Collapsible on mobile.

### Navbar.jsx
Top navigation bar with logo, page title, and user avatar. Works with sidebar.

### BudgetItem.jsx
Individual budget card. Shows name, amount, color, and spending progress.

### AddBudgetForm.jsx
Modal form for creating/editing budgets. Name, amount, and color picker fields.

### AddExpenseForm.jsx
Modal form for adding expenses. Name, amount, date, and budget selection.

### ExpenseItem.jsx
Single expense row in table. Shows name, amount, date, and delete button.

### Charts.jsx
Recharts wrapper. Renders pie chart and bar chart from data props.

### EmptyState.jsx
Placeholder component shown when no data exists. Encourages user to add data.

### LoadingSpinner.jsx
Simple loading spinner shown during API calls.

### Table.jsx
Reusable table component. Used for expenses list. Supports custom columns.

### WelcomeBanner.jsx
Welcome message shown on first visit or when user has no budgets yet.

## Layouts

### Main.jsx
Main layout wrapper. Includes Sidebar, Navbar, and content area. Used on all authenticated pages.
