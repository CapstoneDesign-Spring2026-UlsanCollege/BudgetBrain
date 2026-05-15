# Week 3 - Repository and Basic Structure

**Date:** March 16-20, 2026

## What We Did

This week we set up the actual project structure. We initialized the frontend with Vite and React, set up the Express backend, and organized everything in the repo.

## Project Structure

```
BudgetBrain/
├── Docs/              # Documentation files
├── backend/           # Express API server
│   ├── middleware/     # JWT auth middleware
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API route handlers
│   └── server.js      # Entry point
├── src/               # React frontend
│   ├── components/    # Reusable UI components
│   ├── layouts/       # Layout wrappers
│   ├── pages/         # Route pages
│   ├── api.js         # Axios config
│   ├── App.jsx        # Main app component
│   └── main.jsx       # Entry point
├── public/            # Static assets
├── package.json
└── vite.config.js
```

## Tasks Completed

| Task | Status |
|---|---|
| Vite + React project initialized | Done |
| Express server scaffolding | Done |
| Project folder structure | Done |
| Git workflow established | Done |
| Backend dependencies installed | Done |
| Dev environment verified | Done |

## What is Next

Design wireframes and plan the UI in Week 4.

## Detailed Notes

Setting up the project structure took longer than expected because we had to make sure everything worked together. The Vite setup was straightforward. The Express backend needed some configuration for ES modules since we used "type": "module" in package.json.

We created the folder structure with separate directories for frontend and backend code. The Docs folder was created to hold all documentation. We set up the .gitignore file to exclude node_modules, .env, and build output.

Git workflow was established. We decided on branch naming: feature/feature-name and fix/bug-name. Each feature gets its own branch. PRs are required before merging to main.

All team members got the dev environment working. We tested that the Vite dev server starts, the Express server starts, and the MongoDB connection works. The proxy config in vite.config.js was set up to forward /api requests to the backend.
