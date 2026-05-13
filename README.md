
# ![budget(2)](https://github.com/agrSaket/Budget-Planner/assets/134057654/dc52a02d-881e-42d0-a311-779ee2d2fd8e) Budget Buddy

BudgetBuddy is a budget planner web application which is built using the React JavaScript library. 
This application allows users to manage their budgets and expenses. 
The application provides an intuitive interface for creating and managing budgets, adding and editing expenses, and tracking spending over time.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-and-tools-used)
- [License](#license)


## Features

- Create, edit, and delete budgets
- Add, edit, and delete expenses associated with specific budgets
- View a list of all expenses or filter by budget
- User-friendly interface with responsive design
- Real-time updates and feedback using toast notifications

## Demo

You can view a live demo of the application [here](https://agr-budget-buddy.netlify.com).

![budget-buddy](https://github.com/agrSaket/Budget-Planner/assets/134057654/051a8e8f-a518-456c-8491-4c2202390167)


## Installation
   
1. Clone the repository:
   ```sh
   git clone https://github.com/CapstoneDesign-Spring2026-UlsanCollege/BudgetBrain.git
   ```
2. Navigate to the project directory:
   ```sh
   cd Budget-Planner
   ```
3. Install frontend dependencies:
   ```sh
   npm install
   ```
4. Install backend dependencies:
   ```sh
   cd backend
   npm install
   cd ..
   ```

## Environment

Create `backend/.env` for local API development:

```sh
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
PORT=5000
```

For Vercel, add `MONGO_URI` and `JWT_SECRET` as production environment variables.


## Usage

1. Start the backend API:
   ```sh
   cd backend
   npm start
   ```
2. In a second terminal, start the frontend:
   ```sh
   npm run dev
   ```
3. Open your web browser and navigate to the Vite URL, usually `http://localhost:5173`.

The Vite dev server proxies `/api` requests to `http://localhost:5000`.

## Deployment

This project is configured for Vercel:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Required environment variables: `MONGO_URI`, `JWT_SECRET`


## Technologies and Tools Used

- React.js
- React Router
- React Toastify
- HTML5
- CSS3
- Heroicons


## License

This project is licensed under the [MIT License](LICENSE).
