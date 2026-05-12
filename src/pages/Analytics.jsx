import { useLoaderData } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { fetchData, formatCurrency } from '../helpers';

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#6366f1', '#14b8a6'];

export async function analyticsLoader() {
  const budgets = await fetchData('budgets');
  const expenses = await fetchData('expenses');
  return { budgets, expenses };
}

const Analytics = () => {
  const { budgets, expenses } = useLoaderData();

  // Spending by category pie
  const categoryData = budgets.map((budget, i) => {
    const spent = expenses.reduce((acc, exp) => {
      const eid = exp.budget || exp.budgetId;
      if (eid !== budget.id && eid !== budget._id) return acc;
      return acc + exp.amount;
    }, 0);
    return { name: budget.name, value: spent, color: COLORS[i % COLORS.length] };
  }).filter(d => d.value > 0);

  // Spending over time (group by day)
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const dailyMap = {};
  sortedExpenses.forEach(exp => {
    const day = new Date(exp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyMap[day] = (dailyMap[day] || 0) + exp.amount;
  });
  const dailyData = Object.entries(dailyMap).map(([date, amount]) => ({ date, amount }));

  // Top expenses
  const topExpenses = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);

  // Stats
  const totalBudget = budgets.reduce((a, b) => a + b.amount, 0);
  const totalSpent = expenses.reduce((a, e) => a + e.amount, 0);
  const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'hsl(222 47% 15%)',
          border: '1px solid hsl(217 33% 20%)',
          borderRadius: '8px',
          padding: '10px 14px',
          color: '#e2e8f0',
          fontSize: '0.85rem',
        }}>
          <p style={{ fontWeight: 600 }}>{payload[0].payload.name || payload[0].payload.date}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color }}>
              {entry.name}: ₹{(entry.value).toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid-lg" style={{ width: '100%' }}>
      <h1 className="existbud">Analytics</h1>

      {/* Quick Stats */}
      <div className="analytics-stats">
        <div className="stat-card">
          <span className="stat-label">Total Budget</span>
          <span className="stat-value">{formatCurrency(totalBudget)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Spent</span>
          <span className="stat-value" style={{ color: totalSpent > totalBudget ? '#ef4444' : '#06b6d4' }}>
            {formatCurrency(totalSpent)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg. Expense</span>
          <span className="stat-value">{formatCurrency(avgExpense)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Highest Expense</span>
          <span className="stat-value" style={{ color: '#f59e0b' }}>
            {formatCurrency(highestExpense)}
          </span>
        </div>
      </div>

      <div className="charts-grid">
        {/* Pie Chart */}
        {categoryData.length > 0 ? (
          <div className="chart-card">
            <h3 className="chart-title">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-card">
            <h3 className="chart-title">Spending by Category</h3>
            <p style={{ color: 'hsl(215 20% 65%)', textAlign: 'center', padding: '4rem 0' }}>No expense data yet</p>
          </div>
        )}

        {/* Area Chart – Spending over time */}
        {dailyData.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Spending Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fill="url(#colorAmount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Expenses Table */}
      {topExpenses.length > 0 && (
        <div className="chart-card" style={{ maxWidth: '100%' }}>
          <h3 className="chart-title">Top 5 Expenses</h3>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {topExpenses.map((exp, i) => (
                  <tr key={exp.id || exp._id}>
                    <td>{i + 1}</td>
                    <td>{exp.name}</td>
                    <td>{formatCurrency(exp.amount)}</td>
                    <td>{new Date(exp.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
