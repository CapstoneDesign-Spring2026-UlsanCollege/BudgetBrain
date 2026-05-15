# Week 2 - Requirements Planning

**Date:** March 9-13, 2026

## What We Did

We spent this week figuring out exactly what features BudgetBrain should have. We wrote user stories, planned the requirements, and created the first version of our design document.

## Features Planned

- User registration and login
- Budget management (create, edit, delete)
- Expense tracking within budgets
- Savings goals with progress tracking
- Analytics dashboard with charts
- Dark/light theme
- Profile page with avatar
- Responsive design

## Documents Created

- User stories document
- Team agreement
- Initial design document v1

## Tasks Completed

| Task | Status |
|---|---|
| User stories written | Done |
| Requirements documented | Done |
| Team agreement signed | Done |
| Design doc started | Done |
| Tech stack finalized | Done |

## Decisions Made

- Registration should NOT auto-login the user (redirect to login page instead)
- Default currency is NPR (Nepalese Rupee)
- No external CSS frameworks
- React Context + localStorage for state management (no Redux)

## What is Next

Set up the repo structure and scaffolding in Week 3.

## Detailed Notes

We spent a lot of time discussing what features to include and what to leave out. The main question was how detailed the expense tracking should be. We decided to keep it simple: each expense belongs to a budget category, has a name, amount, and date. No receipt scanning or tags for now.

The registration flow was a topic of debate. Some wanted auto-login after registration. We decided against it because it is better UX to let users verify their credentials by logging in manually.

The default currency is NPR because most of the team is from Nepal and the app is targeted at Nepali students. But we made it configurable in Settings.

The team agreement was important to set expectations. We agreed to daily standups, GitHub Issues for tracking, and no direct pushes to main. We also agreed to use Discord for quick questions and weekly check-ins on Friday.
