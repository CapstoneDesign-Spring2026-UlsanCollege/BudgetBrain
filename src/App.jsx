import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, redirect } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Main, { mainLoader } from "./layouts/Main";
import { logoutAction } from "./actions/logout";
import { deleteBudget } from "./actions/deleteBudget";

import Error from "./pages/Error";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LoadingSpinner from "./components/LoadingSpinner";

import { dashboardAction, dashboardLoader } from "./pages/Dashboard";
import { budgetAction, budgetLoader } from "./pages/BudgetPage";
import { expensesAction } from "./pages/ExpensesPage";
import { goalsLoader } from "./pages/Goals";
import { profileLoader } from "./pages/Profile";
import { fetchData } from "./helpers";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const BudgetPage = lazy(() => import("./pages/BudgetPage"));
const ExpensesPage = lazy(() => import("./pages/ExpensesPage"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Goals = lazy(() => import("./pages/Goals"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const BudgetsList = lazy(() => import("./pages/BudgetsList"));

async function analyticsLoader() {
  const budgets = await fetchData('budgets');
  const expenses = await fetchData('expenses');
  return { budgets, expenses };
}

const withSuspense = (element) => (
  <Suspense fallback={<LoadingSpinner />}>
    {element}
  </Suspense>
);

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
        element: withSuspense(<Dashboard />),
        loader: protectedLoader(dashboardLoader),
        action: dashboardAction,
        errorElement: <Error />,
      },
      {
        path: "budgets",
        element: withSuspense(<BudgetsList />),
        loader: authLoader,
        errorElement: <Error />,
      },
      {
        path: "budget/:id",
        element: withSuspense(<BudgetPage />),
        loader: protectedLoader(budgetLoader),
        action: budgetAction,
        errorElement: <Error />,
        children: [{ path: "delete", action: deleteBudget }],
      },
      {
        path: "expenses",
        element: withSuspense(<ExpensesPage />),
        loader: authLoader,
        action: expensesAction,
        errorElement: <Error />,
      },
      {
        path: "analytics",
        element: withSuspense(<Analytics />),
        loader: protectedLoader(analyticsLoader),
        errorElement: <Error />,
      },
      {
        path: "goals",
        element: withSuspense(<Goals />),
        loader: protectedLoader(goalsLoader),
        errorElement: <Error />,
      },
      {
        path: "profile",
        element: withSuspense(<Profile />),
        loader: protectedLoader(profileLoader),
        errorElement: <Error />,
      },
      {
        path: "settings",
        element: withSuspense(<Settings />),
        loader: authLoader,
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
