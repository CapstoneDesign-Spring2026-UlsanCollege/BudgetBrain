# BudgetBrain Testing

## Current Status

The project does not have automated tests yet. Testing is done manually.

## Manual Testing Checklist

### Authentication
- [ ] Register with valid data works
- [ ] Register with missing fields shows error
- [ ] Login with correct credentials works
- [ ] Login with wrong email shows error
- [ ] Login with wrong password shows error
- [ ] Registration redirects to login (no auto-login)

### Budgets
- [ ] Create budget with valid data
- [ ] Create budget with empty name shows error
- [ ] Edit budget name and amount
- [ ] Delete budget removes it and its expenses
- [ ] Budget color shows correctly

### Expenses
- [ ] Add expense to budget
- [ ] Edit expense amount
- [ ] Delete expense
- [ ] Expense list shows correct totals

### Goals
- [ ] Create goal with target amount
- [ ] Add savings to goal
- [ ] Progress bar updates correctly
- [ ] Delete goal

### UI/UX
- [ ] Theme toggle works (dark/light)
- [ ] Responsive layout on mobile
- [ ] Sidebar navigation works
- [ ] No console errors

### API Testing with curl

```sh
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## Future Testing Plans

- Unit tests for API routes with Jest
- Component tests with React Testing Library
- End-to-end tests with Playwright
- Automated CI pipeline with GitHub Actions
