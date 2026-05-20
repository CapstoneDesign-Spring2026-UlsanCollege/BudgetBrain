import React, { useState } from "react";
import { Outlet, useLoaderData } from "react-router-dom";

// components
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../pages/Dashboard.css"; // Import the layout CSS globally

// helper functions
import { fetchData, refreshExchangeRate } from "../helpers";

// loader
export async function mainLoader() {
  if (!localStorage.getItem("token")) {
    return { userName: null, budgets: [], expenses: [] };
  }

  const userName = await fetchData("userName");
  const [budgets, expenses, goals] = await Promise.all([
    fetchData("budgets"),
    fetchData("expenses"),
    fetchData("goals"),
  ]);
  return { userName, budgets, expenses, goals };
}

const Main = () => {
  const { userName, budgets, expenses, goals } = useLoaderData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [, setCurrencyVersion] = useState(0);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  React.useEffect(() => {
    refreshExchangeRate().catch((err) => {
      console.warn('Could not refresh exchange rate:', err.userMessage || err.message);
    });

    const handleCurrencyChange = () => setCurrencyVersion((value) => value + 1);
    window.addEventListener('budgetbrain-currency-change', handleCurrencyChange);
    return () => window.removeEventListener('budgetbrain-currency-change', handleCurrencyChange);
  }, []);

  return (
    <div className="dashboard-wrapper">
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} budgets={budgets} expenses={expenses} userName={userName} />
      
      <main className="dashboard-main">
        <Navbar onToggleSidebar={toggleSidebar} userName={userName} budgets={budgets} expenses={expenses} goals={goals} />
        
        {/* Outlet renders the child routes like Dashboard, Expenses, etc. */}
        <Outlet />
      </main>
    </div>
  );
};

export default Main;
