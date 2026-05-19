import api from './api';

export const waait = () =>
  new Promise((res) => setTimeout(res, Math.random() * 800));

const BUDGET_HUES = [
  210, 160, 320, 45, 280, 180, 15, 120, 260, 80,
  340, 200, 140, 300, 60, 350, 240, 175, 330, 90,
  195, 270, 38, 155, 15, 200, 340, 160, 100, 280
];

const generateRandomColor = async () => {
  try {
    const res = await api.get('/budgets');
    const existingBudgetLength = res.data.length ?? 0;
    const hue = BUDGET_HUES[existingBudgetLength % BUDGET_HUES.length];
    return `${hue} 65% 50%`;
  } catch {
    return `210 65% 50%`;
  }
};

export const fetchData = async (category) => {
  if (category === 'userName') {
    return JSON.parse(localStorage.getItem('userName'));
  }
  try {
    const res = await api.get(`/${category}`);
    return res.data.map(item => ({ ...item, id: item._id || item.id }));
  } catch (error) {
    console.error(`Error fetching ${category}:`, error);
    throw error;
  }
};

export const getAllMatchingItems = async ({ category, key, value }) => {
  const data = await fetchData(category);
  return data.filter((item) => item[key] === value);
};

export const deleteItem = async ({ key, id }) => {
  if (id) {
    try {
      await api.delete(`/${key}/${id}`);
    } catch (error) {
      console.error(`Error deleting from ${key}:`, error);
      throw error;
    }
  } else {
    if (key === 'userName') localStorage.removeItem('userName');
  }
};

export const createBudget = async ({ name, amount }) => {
  try {
    const color = await generateRandomColor();
    const res = await api.post('/budgets', { name, amount: +amount, color });
    return res.data;
  } catch (error) {
    console.error('Error creating budget:', error);
    throw error;
  }
};

export const createExpense = async ({ name, amount, budgetId, category }) => {
  try {
    const res = await api.post('/expenses', { name, amount: +amount, budgetId, category });
    return res.data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

export const calculateSpentByBudget = async (budgetId) => {
  const expenses = await fetchData("expenses");
  const budgetSpent = expenses.reduce((acc, expense) => {
    const expBudgetId = expense.budget || expense.budgetId;
    if (expBudgetId !== budgetId) return acc;
    return (acc += expense.amount);
  }, 0);
  return budgetSpent;
};

// FORMATTING
export const formatDateToLocaleString = (epoch) =>
  new Date(epoch).toLocaleDateString();

export const formatPercentage = (amt) => {
  return amt.toLocaleString(undefined, {
    style: "percent",
    minimumFractionDigits: 0,
  });
};

export const formatCurrency = (amt) => {
  let currency;
  try {
    currency = localStorage.getItem('budgetbrain-currency') || 'NPR';
  } catch {
    currency = 'NPR';
  }
  const amount = Number.isFinite(Number(amt)) ? Number(amt) : 0;
  return amount.toLocaleString(undefined, {
    style: "currency",
    currency,
  });
};

export const updateBudget = async (updatedBudget) => {
  try {
    await api.put(`/budgets/${updatedBudget._id || updatedBudget.id}`, updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

export const updateExpense = async (expenseId, updatedExpense) => {
  try {
    await api.put(`/expenses/${expenseId}`, updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    await api.delete(`/expenses/${expenseId}`);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};
