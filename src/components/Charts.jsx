import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';
import { formatCurrency } from '../helpers';

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#6366f1', '#14b8a6'];

const Charts = ({ budgets, expenses }) => {
  // Bar chart data
  const barData = budgets.map((budget) => {
    const amountSpent = expenses.reduce((acc, expense) => {
      const expBudgetId = expense.budget || expense.budgetId;
      if (expBudgetId !== budget._id && expBudgetId !== budget.id) return acc;
      return acc + expense.amount;
    }, 0);
    return {
      name: budget.name,
      Budget: budget.amount,
      Spent: amountSpent,
    };
  });

  // Pie chart data
  const pieData = budgets.map((budget, i) => {
    const spent = expenses.reduce((acc, expense) => {
      const expBudgetId = expense.budget || expense.budgetId;
      if (expBudgetId !== budget._id && expBudgetId !== budget.id) return acc;
      return acc + expense.amount;
    }, 0);
    return { name: budget.name, value: spent, color: COLORS[i % COLORS.length] };
  }).filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].name || payload[0].payload.name}</p>
          <div className="tooltip-items">
            {payload.map((entry, i) => (
              <div key={i} className="tooltip-item">
                <span className="tooltip-dot" style={{ backgroundColor: entry.color || entry.payload.color }}></span>
                <span className="tooltip-text">
                  {entry.name}: <span className="tooltip-value">{formatCurrency(entry.value)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="charts-container animate-fade">
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="chart-card-wrapper">
          <h3 className="chart-title">Budget vs Spending</h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(217 33% 20% / 0.5)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent) / 0.05)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Budget" fill="url(#colorBudget)" radius={[6, 6, 0, 0]} barSize={30} />
                <Bar dataKey="Spent" fill="url(#colorSpent)" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <div className="chart-card-wrapper">
            <h3 className="chart-title">Expense Breakdown</h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1200}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '0.85rem', color: '#94a3b8', paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Charts;
