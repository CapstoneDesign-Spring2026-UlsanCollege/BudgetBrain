# BudgetBrain Testing Plan

## Overview

This document outlines the manual testing plan for the BudgetBrain application. All tests should be performed on both desktop and mobile browsers before demo or deployment.

## Browser Testing

| Browser | Status | Notes |
|---------|--------|-------|
| Google Chrome | ✅ Tested | Primary development browser |
| Mozilla Firefox | ⬜ Expected | Should be verified |
| Microsoft Edge | ⬜ Expected | Should be verified |
| Safari | ⬜ Expected | Should be verified if available |

## Mobile Responsive Testing

| Device | Status | Notes |
|--------|--------|-------|
| Desktop (1920x1080) | ✅ Tested | Full layout |
| Tablet (768px width) | ⬜ Expected | Responsive breakpoints |
| Mobile (375px width) | ⬜ Expected | Touch interactions |

## Authentication Testing

### Registration

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Register with valid data | Success, redirect to login | ✅ |
| Register with empty name | Error message shown | ✅ |
| Register with invalid email | Error message shown | ✅ |
| Register with short password (< 8 chars) | Validation prevents submission | ✅ |
| Register with password without letter | Validation warning shown | ✅ |
| Register with password without number | Validation warning shown | ✅ |
| Register with mismatched confirm password | Validation warning shown | ✅ |
| Register with existing email | Error "User already exists" | ✅ |
| Verify no auto-login after register | Redirected to /login | ✅ |

### Login

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Login with valid credentials | Success, redirect to dashboard | ✅ |
| Login with wrong email | Error message shown | ✅ |
| Login with wrong password | Error message shown | ✅ |
| Login with empty fields | HTML validation prevents submission | ✅ |
| Login with unregistered email | Error "Invalid email or password" | ✅ |

### Password Reset

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Request reset with valid email | Success message shown | ✅ |
| Request reset with invalid email | Success message (security) | ✅ |
| Reset with valid code and new password | Success, can login with new password | ✅ |
| Reset with expired/invalid code | Error message shown | ✅ |
| Reset with weak password | Error message shown | ✅ |

## Dashboard Testing

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Dashboard loads with user name | Welcome banner displayed | ✅ |
| Empty state shown when no budgets | Create budget form shown | ✅ |
| Summary cards display correct totals | Values match budgets/expenses | ✅ |
| Currency rates widget loads | Exchange rates displayed | ✅ |
| Charts render when expenses exist | Pie/bar charts visible | ✅ |
| Recent transactions show last 5 | Table with 5 most recent | ✅ |
| Goals progress mini-cards display | Goals with progress bars shown | ✅ |
| Budget breakdown cards render | Each budget card visible | ✅ |

## Transaction Testing

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Add expense with valid data | Expense created, toast shown | ✅ |
| Add expense with empty name | Error message shown | ✅ |
| Add expense with zero amount | Error message shown | ✅ |
| Add expense without selecting budget | Error message shown | ✅ |
| Edit expense name | Name updated correctly | ✅ |
| Edit expense amount | Amount updated correctly | ✅ |
| Delete expense | Expense removed, toast shown | ✅ |
| View all expenses | Full transaction history loaded | ✅ |
| Sort by date | Newest first by default | ✅ |

## Budget Testing

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Create budget with valid data | Budget created, toast shown | ✅ |
| Create budget with empty name | Error message shown | ✅ |
| Create budget with zero amount | Error message shown | ✅ |
| Create budget with invalid color | Error message shown | ✅ |
| Edit budget name | Name updated correctly | ✅ |
| Edit budget amount | Amount updated correctly | ✅ |
| Delete budget | Budget and expenses removed | ✅ |
| Budget progress bar reflects expenses | Percentage calculated correctly | ✅ |

## Savings Goal Testing

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Create goal with valid data | Goal created, toast shown | ✅ |
| Create goal with empty name | Error message shown | ✅ |
| Create goal with zero target | Error message shown | ✅ |
| Add savings to goal | Amount added, progress updated | ✅ |
| Add savings with zero amount | Error message shown | ✅ |
| Add savings exceeding target | Progress shows 100% | ✅ |
| Edit goal details | Fields updated correctly | ✅ |
| Delete goal | Goal removed, toast shown | ✅ |

## Profile / Settings Testing

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| View profile | Name, email, avatar displayed | ✅ |
| Edit name | Name saved and displayed | ✅ |
| Change avatar | Avatar updated immediately | ✅ |
| Change password with correct current | Password changed, success toast | ✅ |
| Change password with wrong current | Error "Current password is incorrect" | ✅ |
| Toggle dark/light theme | Theme switches immediately | ✅ |
| Theme persists after page reload | Theme preference saved | ✅ |
| Change currency preference | Currency updates on dashboard | ✅ |

## API Testing

| Endpoint | Method | Status |
|----------|--------|--------|
| /api/auth/register | POST | ✅ Working |
| /api/auth/login | POST | ✅ Working |
| /api/auth/forgot-password | POST | ✅ Working |
| /api/auth/reset-password | POST | ✅ Working |
| /api/auth/me | GET | ✅ Working |
| /api/auth/me | PUT | ✅ Working |
| /api/auth/password | PUT | ✅ Working |
| /api/budgets | GET | ✅ Working |
| /api/budgets | POST | ✅ Working |
| /api/budgets/:id | PUT | ✅ Working |
| /api/budgets/:id | DELETE | ✅ Working |
| /api/expenses | GET | ✅ Working |
| /api/expenses | POST | ✅ Working |
| /api/expenses/:id | PUT | ✅ Working |
| /api/expenses/:id | DELETE | ✅ Working |
| /api/goals | GET | ✅ Working |
| /api/goals | POST | ✅ Working |
| /api/goals/:id | PUT | ✅ Working |
| /api/goals/:id/savings | POST | ✅ Working |
| /api/goals/:id | DELETE | ✅ Working |
| /api/health | GET | ✅ Working |

## Database Testing

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| User data persists after login | User found in DB | ✅ |
| Budgets persist after creation | Budgets stored in DB | ✅ |
| Expenses persist and link to budgets | Expenses stored with budget ref | ✅ |
| Goals persist with progress | Goals stored with savedAmount | ✅ |
| Cascading delete (budget → expenses) | Expenses deleted with budget | ✅ |

## Error Handling Testing

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Network error during API call | Toast with error message | ✅ |
| Server returns 500 | Generic error message shown | ✅ |
| Token expired (401) | Auto-redirect to login | ✅ |
| Database unavailable | 503 error returned | ✅ |
| Invalid ObjectId in URL | 400 error returned | ✅ |
| Unauthorized access to other user's data | 403 error returned | ✅ |

## Demo Readiness Checklist

| Criterion | Status |
|-----------|--------|
| Registration works end-to-end | ✅ |
| Login works end-to-end | ✅ |
| Dashboard loads with data | ✅ |
| Budget CRUD fully functional | ✅ |
| Expense CRUD fully functional | ✅ |
| Savings goal tracking works | ✅ |
| Password reset flow works | ✅ |
| Dark/light theme toggle works | ✅ |
| Profile edit works | ✅ |
| Mobile responsive | ✅ |
| API returns correct responses | ✅ |
| Error states handled gracefully | ✅ |
| Loading states shown during API calls | ✅ |

## Week 13 Regression Testing Checklist

### Authentication
| Test Case | Status |
|-----------|--------|
| Register with valid data | ✅ |
| Register with duplicate email | ✅ |
| Login with valid credentials | ✅ |
| Login with invalid credentials | ✅ |
| Password reset request email flow | ✅ |
| Password reset with valid code | ✅ |
| Password reset with expired code | ✅ |
| JWT token expiry forces re-login | ✅ |

### Budgets
| Test Case | Status |
|-----------|--------|
| Create budget with valid data | ✅ |
| Create budget with missing fields | ✅ |
| Edit budget name and amount | ✅ |
| Delete budget (cascades expenses) | ✅ |
| Budget progress reflects expenses | ✅ |

### Expenses
| Test Case | Status |
|-----------|--------|
| Add expense to budget | ✅ |
| Edit expense details | ✅ |
| Delete expense | ✅ |
| View all expenses sorted by date | ✅ |

### Savings Goals
| Test Case | Status |
|-----------|--------|
| Create goal with valid data | ✅ |
| Add savings to goal (progress update) | ✅ |
| Edit goal target and deadline | ✅ |
| Delete goal | ✅ |

### Dashboard / Charts
| Test Case | Status |
|-----------|--------|
| Summary cards show correct totals | ✅ |
| Pie chart renders with expense data | ✅ |
| Bar chart shows monthly trends | ✅ |
| Recent transactions list is accurate | ✅ |

### Receipt Scanning
| Test Case | Status |
|-----------|--------|
| PaddleOCR service returns text | ✅ |
| Browser Tesseract fallback works | ✅ |

### Responsive Layout
| Test Case | Status |
|-----------|--------|
| Desktop (1920x1080) renders correctly | ✅ |
| Tablet (768px) responsive breakpoints | ✅ |
| Mobile (375px) touch interactions | ✅ |

### Theme Toggle
| Test Case | Status |
|-----------|--------|
| Toggle dark/light theme | ✅ |
| Theme persists on page reload | ✅ |

### Deployment Smoke Test
| Test Case | Status |
|-----------|--------|
| Vercel deployment loads | ✅ |
| API responds at /api/health | ✅ |
| Static assets served correctly | ✅ |
| SPA routing works (direct URL entry) | ✅ |
