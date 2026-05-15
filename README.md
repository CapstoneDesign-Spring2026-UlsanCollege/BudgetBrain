# BudgetBrain

BudgetBrain is a full-stack budget planning web app built with React and Express. It helps college students track expenses, manage budgets, set savings goals, and see their spending habits through charts.

## Features

- Register and login with JWT authentication
- Create, edit, and delete budgets by category
- Add, edit, and delete expenses within budgets
- Set savings goals and track progress
- View spending analytics with charts
- Dark and light theme toggle
- Profile with avatar selection
- Responsive design for mobile and desktop
- Premium UI with 3D and liquid effects

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express 5.x |
| Database | MongoDB (Atlas + in-memory fallback) |
| Auth | JWT (JSON Web Tokens) |
| Charts | Recharts |
| Styling | Vanilla CSS with CSS variables |
| Deployment | Vercel |

## Live Demo

https://budget-brain-puce.vercel.app

## Installation

1. Clone the repo:
   ```sh
   git clone https://github.com/CapstoneDesign-Spring2026-UlsanCollege/BudgetBrain.git
   ```

2. Install frontend dependencies:
   ```sh
   npm install
   ```

3. Install backend dependencies:
   ```sh
   cd backend
   npm install
   cd ..
   ```

4. Create `backend/.env`:
   ```sh
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_strong_jwt_secret
   PORT=5000
   ```

## Usage

1. Start backend:
   ```sh
   cd backend
   npm start
   ```

2. Start frontend (second terminal):
   ```sh
   npm run dev
   ```

3. Open http://localhost:5173

## Deployment

Deployed on Vercel. Required env vars: `MONGO_URI`, `JWT_SECRET`.

Build: `npm run build`  
Output: `dist`

## Documentation

All docs are in the [Docs](/Docs) folder:
- [Project Overview](Docs/PROJECT.md)
- [Architecture](Docs/ARCHITECTURE_SKETCH.md)
- [Design Doc](Docs/DESIGN_DOC_V1.md)
- [Wireframes](Docs/WIREFRAMES.md)
- [User Stories](Docs/user_stories.md)
- [Team Agreement](Docs/TEAM_AGREEMENT.md)
- [Weekly Progress](Docs/weeks/)

## License

MIT
