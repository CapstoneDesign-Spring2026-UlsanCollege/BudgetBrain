# Design Document v1 - BudgetBrain

**Team:** Angnima Sherpa, Sunil Tamang, Bidhan Pokhrel, Suvakar Dahal

## Purpose
A full-stack budget planning application for college students to track expenses, manage budgets, set savings goals, and visualize spending patterns.

## Core Features
1. **User Authentication** - Register/Login with JWT
2. **Budget Management** - Create, edit, delete budgets per category
3. **Expense Tracking** - Add/edit/delete expenses within budgets
4. **Savings Goals** - Set targets and track progress
5. **Analytics** - Visual charts for spending patterns
6. **Profile** - Avatar selection, name editing
7. **Settings** - Theme toggle, currency selection, notifications

## Technical Decisions
- **React + Vite**: Fast development and optimized builds
- **Express + MongoDB**: Familiar stack with flexible schema
- **JWT Auth**: Stateless authentication
- **CSS Variables**: Dynamic theming without a CSS framework
- **NPR Default**: Built for Nepalese Rupee currency context

## UI/UX Principles
- Dark/light theme support
- Responsive design (mobile-first)
- 3D and liquid visual effects for premium feel
- Smooth transitions and hover feedback
- Distinct color coding per budget category

## Constraints
- No external CSS frameworks (vanilla CSS only)
- No state management libraries (React Context + localStorage)
- In-memory DB fallback when MongoDB unavailable
