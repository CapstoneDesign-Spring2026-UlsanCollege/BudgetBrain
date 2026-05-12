import React, { useState } from "react";
import { Outlet, useLoaderData } from "react-router-dom";

// components
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../pages/Dashboard.css"; // Import the layout CSS globally

// helper functions
import { fetchData } from "../helpers";

// loader
export async function mainLoader() {
  const userName = await fetchData("userName");
  const budgets = await fetchData("budgets");
  const expenses = await fetchData("expenses");
  return { userName, budgets, expenses };
}

const Main = () => {
  const { userName, budgets, expenses } = useLoaderData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="dashboard-wrapper">
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} budgets={budgets} expenses={expenses} userName={userName} />
      
      <main className="dashboard-main">
        <Navbar onToggleSidebar={toggleSidebar} userName={userName} />
        
        {/* Outlet renders the child routes like Dashboard, Expenses, etc. */}
        <Outlet />
      </main>
    </div>
  );
};

export default Main;