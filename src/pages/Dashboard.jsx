import { Suspense, lazy } from "react";
import { Link, useLoaderData, useRouteLoaderData } from "react-router-dom";
import { toast } from "react-toastify";
import { WalletIcon, ArrowTrendingDownIcon, ChartBarIcon, DocumentTextIcon, CircleStackIcon, TrophyIcon } from "@heroicons/react/24/solid";

import WelcomeBanner from "../components/WelcomeBanner";
import EmptyState from "../components/EmptyState";
import AddBudgetForm from "../components/AddBudgetForm";
import AddExpenseForm from "../components/AddExpenseForm";
import BudgetItem from "../components/BudgetItem";
import Table from "../components/Table";
import LoadingSpinner from "../components/LoadingSpinner";
import CurrencyRateWidget from "../components/CurrencyRateWidget";

import {
  createBudget,
  createExpense,
  deleteItem,
  fetchData,
  formatCurrency,
} from "../helpers";
import api from "../api";

const Charts = lazy(() => import("../components/Charts"));

export async function dashboardLoader() {
  let goals = [];
  try {
    const res = await api.get('/goals');
    goals = res.data;
  } catch {}
  return { goals };
}

// action
export async function dashboardAction({ request }) {
  const data = await request.formData();
  const { _action, ...values } = Object.fromEntries(data);

  if (_action === "createBudget") {
    try {
      await createBudget({
        name: values.newBudget,
        amount: values.newBudgetAmount,
      });
      return toast.success("Budget created!");
    } catch (e) {
      throw new Error("There was a problem creating your budget.");
    }
  }

  if (_action === "createExpense") {
    try {
      await createExpense({
        name: values.newExpense,
        amount: values.newExpenseAmount,
        budgetId: values.newExpenseBudget,
        category: values.category,
        receiptImage: values.receiptImage,
      });
      return toast.success(`Expense ${values.newExpense} created!`);
    } catch (e) {
      throw new Error("There was a problem creating your expense.");
    }
  }

  if (_action === "deleteExpense") {
    try {
      await deleteItem({
        key: "expenses",
        id: values.expenseId,
      });
      return toast.success("Expense deleted!");
    } catch (e) {
      throw new Error("There was a problem deleting your expense.");
    }
  }
}

const Dashboard = () => {
  const { goals } = useLoaderData();
  const { userName, budgets, expenses } = useRouteLoaderData("main");

  const totalBudget = budgets ? budgets.reduce((acc, b) => acc + b.amount, 0) : 0;
  const totalSpent = expenses ? expenses.reduce((acc, e) => acc + e.amount, 0) : 0;
  const remaining = totalBudget - totalSpent;
  const totalSaved = goals ? goals.reduce((a, g) => a + g.savedAmount, 0) : 0;
  const totalTarget = goals ? goals.reduce((a, g) => a + g.targetAmount, 0) : 0;

  return (
    <>
      <WelcomeBanner userName={userName} />
      <div className="dashboard-top-tools" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <CurrencyRateWidget />
      </div>

      <div className="dashboard-content">
        {budgets && budgets.length > 0 ? (
          <>
            {/* Section 1: Top Level Summaries */}
            <section className="flow-section">
              <div className="summary-cards">
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p className="stat-label">Total Allocated</p>
                      <h2>{formatCurrency(totalBudget)}</h2>
                    </div>
                    <WalletIcon width={48} style={{ color: 'hsl(var(--accent))', opacity: 0.8 }} />
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p className="stat-label">Total Spent</p>
                      <h2 style={{ color: totalSpent > totalBudget ? 'hsl(var(--danger))' : 'hsl(var(--text))' }}>
                        {formatCurrency(totalSpent)}
                      </h2>
                    </div>
                    <ArrowTrendingDownIcon width={48} style={{ color: 'hsl(var(--accent-light))', opacity: 0.8 }} />
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p className="stat-label">Remaining Funds</p>
                      <h2 style={{ color: remaining < 0 ? 'hsl(var(--danger))' : 'hsl(var(--success))' }}>
                        {formatCurrency(remaining)}
                      </h2>
                    </div>
                    <CircleStackIcon width={48} style={{ color: 'hsl(var(--success))', opacity: 0.8 }} />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Main Analytics & Forms */}
            <section className="flow-section analytics-grid">
              {expenses && expenses.length > 0 && (
                <div className="glass-card">
                  <h3 className="section-title">
                    <ChartBarIcon width={24} className="highlight" />
                    Financial Analytics
                  </h3>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Charts budgets={budgets} expenses={expenses} />
                  </Suspense>
                </div>
              )}

              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <h3 className="section-title">Record Expense</h3>
                  <AddExpenseForm budgets={budgets} />
                </div>
                <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                  <h3 className="section-title">New Budget</h3>
                  <AddBudgetForm />
                </div>
              </div>
            </section>

            {/* Section 3: Recent Transactions */}
            {expenses && expenses.length > 0 && (
              <section className="flow-section">
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>
                      <DocumentTextIcon width={24} className="highlight" />
                      Recent Transactions
                    </h3>
                    {expenses.length > 5 && (
                      <Link to="/expenses" className="btn btn--outline" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                        View All History
                      </Link>
                    )}
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <Table
                      expenses={expenses
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5)}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Section 4: Goals Progress */}
            {goals && goals.length > 0 && (
              <section className="flow-section">
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>
                      <TrophyIcon width={24} className="highlight" />
                      Savings Goals Progress
                    </h3>
                    <Link to="/goals" className="btn btn--outline" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                      View All Goals
                    </Link>
                  </div>
                  <div className="goals-mini-grid">
                    {goals.slice(0, 3).map(goal => {
                      const pct = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
                      return (
                        <div key={goal._id} className="goal-mini-card">
                          <div className="goal-mini-header">
                            <span className="goal-mini-icon">{goal.icon}</span>
                            <div>
                              <strong>{goal.name}</strong>
                              <small style={{ color: 'hsl(215 20% 65%)', display: 'block' }}>
                                {formatCurrency(goal.savedAmount)} of {formatCurrency(goal.targetAmount)}
                              </small>
                            </div>
                            <span style={{ color: pct >= 100 ? 'hsl(var(--success))' : 'hsl(var(--accent))', fontWeight: 700 }}>
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                          <div className="goal-mini-bar">
                            <div className="goal-mini-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Section 5: Detailed Budget Progress */}
            <section className="flow-section">
              <h3 className="section-title" style={{ marginTop: '1rem' }}>Detailed Budget Breakdown</h3>
              <div className="budget-breakdown-grid">
                {budgets.map((budget) => (
                  <BudgetItem key={budget.id} budget={budget} expenses={expenses} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="flow-section">
            <EmptyState />
            <div className="glass-card" style={{ marginTop: '2rem', maxWidth: '600px', margin: '2rem auto' }}>
              <h3 className="section-title" style={{ justifyContent: 'center' }}>Create Your First Budget</h3>
              <AddBudgetForm />
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default Dashboard;
