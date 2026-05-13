import { createBrowserRouter, RouterProvider, redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Main, { mainLoader } from "./layouts/Main";
import { logoutAction } from "./actions/logout";
import { deleteBudget } from "./actions/deleteBudget";

import Dashboard, { dashboardAction, dashboardLoader } from "./pages/Dashboard";
import Error from "./pages/Error";
import BudgetPage, { budgetAction, budgetLoader } from "./pages/BudgetPage";
import ExpensesPage, { expensesAction, expensesLoader } from "./pages/ExpensesPage";
import Analytics, { analyticsLoader } from "./pages/Analytics";
import Goals, { goalsLoader } from "./pages/Goals";
import Profile, { profileLoader } from "./pages/Profile";
import Settings from "./pages/Settings";
import BudgetsList, { budgetsListLoader } from "./pages/BudgetsList";
import Login from "./pages/Login";
import Register from "./pages/Register";

const authLoader = () => {
  const token = localStorage.getItem("token");
  if (!token) return redirect("/login");
  return null;
};

const protectedLoader = (loaderFn) => async (args) => {
  const auth = authLoader();
  if (auth) return auth;
  return await loaderFn(args);
};

const router = createBrowserRouter([
  { path: "/login", element: <Login />, errorElement: <Error /> },
  { path: "/register", element: <Register />, errorElement: <Error /> },
  {
    path: "/",
    id: "main",
    element: <Main />,
    loader: mainLoader,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Dashboard />,
        loader: protectedLoader(dashboardLoader),
        action: dashboardAction,
        errorElement: <Error />,
      },
      {
        path: "budgets",
        element: <BudgetsList />,
        loader: protectedLoader(budgetsListLoader),
        errorElement: <Error />,
      },
      {
        path: "budget/:id",
        element: <BudgetPage />,
        loader: protectedLoader(budgetLoader),
        action: budgetAction,
        errorElement: <Error />,
        children: [{ path: "delete", action: deleteBudget }],
      },
      {
        path: "expenses",
        element: <ExpensesPage />,
        loader: protectedLoader(expensesLoader),
        action: expensesAction,
        errorElement: <Error />,
      },
      {
        path: "analytics",
        element: <Analytics />,
        loader: protectedLoader(analyticsLoader),
        errorElement: <Error />,
      },
      {
        path: "goals",
        element: <Goals />,
        loader: protectedLoader(goalsLoader),
        errorElement: <Error />,
      },
      {
        path: "profile",
        element: <Profile />,
        loader: protectedLoader(profileLoader),
        errorElement: <Error />,
      },
      {
        path: "settings",
        element: <Settings />,
        errorElement: <Error />,
      },
      { path: "logout", action: logoutAction },
    ],
  },
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
      <ToastContainer theme="dark" />
    </div>
  );
}

export default App;
