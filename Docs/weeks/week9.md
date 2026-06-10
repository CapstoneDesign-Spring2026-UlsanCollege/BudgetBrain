# Week 9 — Savings Goal Feature

## Goal

Implement the savings goal feature with progress tracking and visual display.

## Work Completed

- Created Goal model with target amount, saved amount, deadline, and icon
- Implemented GET, POST, PUT, DELETE routes for goals
- Added special route for adding savings (POST /api/goals/:id/savings)
- Built goal creation form with name, target, deadline, and icon selector
- Created goal progress cards with percentage bars
- Added "Add Savings" button to increment saved amount
- Displayed goal progress on dashboard as mini-cards
- Fixed "Add Savings" bug with defensive null checks

## Frontend Progress

| Component | Status |
|-----------|--------|
| Add Goal Form | ✅ Complete |
| Goal Progress Cards | ✅ Complete |
| Add Savings Button | ✅ Complete |
| Goal Progress on Dashboard | ✅ Complete |
| Goal Edit/Delete | ✅ Complete |

## Backend Progress

| Route | Status |
|-------|--------|
| GET /api/goals | ✅ Working |
| POST /api/goals | ✅ Working |
| PUT /api/goals/:id | ✅ Working |
| POST /api/goals/:id/savings | ✅ Working |
| DELETE /api/goals/:id | ✅ Working |

## Database Progress

- Goal model with savedAmount defaulting to 0
- Proper indexes for user-based queries

## Testing Progress

- Tested creating goals with name, target, and deadline
- Tested adding savings incrementally
- Verified progress percentage calculation
- Tested goal deletion

## Problems Faced

- "Add Savings" button caused a bug where null/undefined `savedAmount` broke the addition
- Goal deadlines stored as Date objects required careful handling

## Solution or Next Step

- Fixed with defensive null check: `Number(goal.savedAmount || 0) + parsedAmount.value`
- Validated optional date parsing with `parseOptionalDate` utility
- Next step: profile, settings, and UI improvements

## Evidence

- Goals working with progress tracking
- Add Savings feature functional
- Goals display on dashboard

## Demo Readiness Status

Mostly ready — all core features working
