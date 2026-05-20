import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  PlusIcon, TrashIcon, BanknotesIcon,
} from '@heroicons/react/24/solid';
import api from '../api';
import { formatCurrency } from '../helpers';

const ICONS = ['\uD83C\uDFAF', '\uD83C\uDFE0', '\uD83D\uDE97', '\u2708\uFE0F', '\uD83C\uDF93', '\uD83D\uDCBB', '\u2764\uFE0F', '\uD83C\uDFAE', '\uD83D\uDCF1', '\uD83D\uDC8E', '\uD83C\uDFD6\uFE0F', '\uD83C\uDFB8'];

export async function goalsLoader() {
  try {
    const res = await api.get('/goals');
    return { goals: res.data.map(normalizeGoal) };
  } catch {
    return { goals: [] };
  }
}

function normalizeGoal(goal) {
  return {
    ...goal,
    id: goal.id || goal._id,
    savedAmount: Number(goal.savedAmount || 0),
    targetAmount: Number(goal.targetAmount || 0),
  };
}

async function loadGoalsFromDatabase() {
  const res = await api.get('/goals');
  return res.data.map(normalizeGoal);
}

const Goals = () => {
  const { goals: initialGoals } = useLoaderData();
  const [goals, setGoals] = useState(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [addAmounts, setAddAmounts] = useState({});
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('\uD83C\uDFAF');

  const refreshGoalsFromDatabase = async () => {
    const latestGoals = await loadGoalsFromDatabase();
    setGoals(latestGoals);
    window.dispatchEvent(new CustomEvent('budgetbrain-goals-change', { detail: latestGoals }));
    return latestGoals;
  };

  const refreshGoalsQuietly = async () => {
    try {
      return await refreshGoalsFromDatabase();
    } catch (err) {
      console.warn('Goal saved, but refresh failed:', err.userMessage || err.message);
      return null;
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', {
        name, targetAmount: +target, deadline: deadline || null, icon,
      });
      await refreshGoalsQuietly();
      setName('');
      setTarget('');
      setDeadline('');
      setIcon('\uD83C\uDFAF');
      setShowForm(false);
      toast.success('Goal created and saved to database!');
    } catch (err) {
      toast.error(err.userMessage || err.response?.data?.msg || 'Failed to create goal');
    }
  };

  const handleAddSavings = async (event, goalId) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get('amount'));
    if (!amount || amount <= 0) return toast.error('Enter a valid amount');
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return toast.error('Goal not found');
    try {
      const currentSaved = typeof goal.savedAmount === 'number' ? goal.savedAmount : 0;
      let res;
      try {
        res = await api.post(`/goals/${goalId}/savings`, { amount });
      } catch (postErr) {
        try {
          res = await api.put(`/goals/${goalId}/savings`, { amount });
        } catch {
          res = await api.put(`/goals/${goalId}`, { savedAmount: currentSaved + amount });
        }
      }

      const savedGoalFromResponse = normalizeGoal(res.data);
      setGoals((currentGoals) => currentGoals.map((item) => (
        item.id === goalId ? savedGoalFromResponse : item
      )));
      window.dispatchEvent(new CustomEvent('budgetbrain-goals-change', { detail: savedGoalFromResponse }));
      setAddAmounts((current) => ({ ...current, [goalId]: '' }));
      event.currentTarget.reset();
      toast.success(`Added ${formatCurrency(amount)} and saved to database!`);

      const latestGoals = await refreshGoalsQuietly();
      const savedGoal = latestGoals?.find((item) => item.id === goalId) || savedGoalFromResponse;

      if (savedGoal.savedAmount >= savedGoal.targetAmount && currentSaved < savedGoal.targetAmount) {
        const message = `Congratulations! You reached your goal for ${savedGoal.name}!`;
        toast.success(message);
        if (localStorage.getItem('budgetbrain-notifications') !== 'false' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('BudgetBrain goal reached', { body: message });
        }
      }
    } catch (err) {
      const message = err.userMessage || err.response?.data?.msg || err.message || `Failed to add savings to ${goal.name}`;
      toast.error(`Could not save goal amount: ${message}`);
    }
  };

  const handleDelete = async (goalId) => {
    if (!confirm('Delete this goal?')) return;
    const goal = goals.find(g => g.id === goalId);
    try {
      await api.delete(`/goals/${goalId}`);
      await refreshGoalsQuietly();
      toast.success('Goal deleted from database');
    } catch (err) {
      toast.error(err.userMessage || err.response?.data?.msg || `Failed to delete ${goal?.name || 'goal'}`);
    }
  };

  const totalTarget = goals.reduce((a, g) => a + g.targetAmount, 0);
  const totalSaved = goals.reduce((a, g) => a + g.savedAmount, 0);

  return (
    <div className="grid-lg" style={{ width: '100%' }}>
      <div className="expenses-header">
        <h1>Savings Goals</h1>
        <button className="btn btn--dark" onClick={() => setShowForm(!showForm)}>
          <PlusIcon width={18} />
          <span>{showForm ? 'Cancel' : 'New Goal'}</span>
        </button>
      </div>

      <div className="analytics-stats">
        <div className="stat-card">
          <span className="stat-label">Total Target</span>
          <span className="stat-value">{formatCurrency(totalTarget)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Saved</span>
          <span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(totalSaved)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Remaining</span>
          <span className="stat-value">{formatCurrency(totalTarget - totalSaved)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Progress</span>
          <span className="stat-value" style={{ color: '#8b5cf6' }}>
            {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="goal-form">
          <div className="goal-form-grid">
            <div className="grid-xs">
              <label>Icon</label>
              <div className="icon-picker">
                {ICONS.map(ic => (
                  <button
                    type="button"
                    key={ic}
                    className={`icon-btn ${icon === ic ? 'active' : ''}`}
                    onClick={() => setIcon(ic)}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid-xs">
              <label>Goal Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Emergency Fund" required />
            </div>
            <div className="grid-xs">
              <label>Target Amount</label>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="Rs. 50,000" required />
            </div>
            <div className="grid-xs">
              <label>Deadline (optional)</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn--dark" style={{ marginTop: '1rem' }}>
            Create Goal
          </button>
        </form>
      )}

      {goals.length > 0 ? (
        <div className="goals-grid">
          {goals.map(goal => {
            const pct = goal.targetAmount > 0
              ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
              : 0;
            const daysLeft = goal.deadline
              ? Math.max(0, Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)))
              : null;

            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-card-header">
                  <span className="goal-icon">{goal.icon}</span>
                  <div>
                    <h3>{goal.name}</h3>
                    {daysLeft !== null && (
                      <small className="goal-deadline">{daysLeft} days left</small>
                    )}
                  </div>
                  <button type="button" className="goal-delete" onClick={() => handleDelete(goal.id)}>
                    <TrashIcon width={16} />
                  </button>
                </div>

                <div className="goal-amounts">
                  <span className="goal-saved">{formatCurrency(goal.savedAmount)}</span>
                  <span className="goal-target">of {formatCurrency(goal.targetAmount)}</span>
                </div>

                <div className="goal-progress-bar">
                  <div
                    className="goal-progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 100
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                    }}
                  />
                </div>
                <small style={{ color: 'hsl(215 20% 65%)' }}>{pct.toFixed(1)}% complete</small>

                <form className="goal-add-savings" onSubmit={(event) => handleAddSavings(event, goal.id)}>
                  <input
                    type="number"
                    name="amount"
                    placeholder="Add Rs..."
                    min="0"
                    step="0.01"
                    value={addAmounts[goal.id] || ''}
                    onChange={e => setAddAmounts({ ...addAmounts, [goal.id]: e.target.value })}
                  />
                  <button
                    type="submit"
                    className="btn btn--dark"
                  >
                    <BanknotesIcon width={16} />
                    <span>Add</span>
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      ) : (
        !showForm && <p style={{ color: 'hsl(215 20% 65%)' }}>No savings goals yet. Create one to start tracking!</p>
      )}
    </div>
  );
};

export default Goals;
