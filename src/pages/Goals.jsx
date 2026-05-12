import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  PlusIcon, TrashIcon, BanknotesIcon,
} from '@heroicons/react/24/solid';
import api from '../api';
import { formatCurrency } from '../helpers';

const ICONS = ['🎯', '🏠', '🚗', '✈️', '🎓', '💻', '❤️', '🎮', '📱', '💎', '🏖️', '🎸'];

export async function goalsLoader() {
  try {
    const res = await api.get('/goals');
    return { goals: res.data };
  } catch {
    return { goals: [] };
  }
}

const Goals = () => {
  const { goals: initialGoals } = useLoaderData();
  const [goals, setGoals] = useState(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [addAmounts, setAddAmounts] = useState({});

  // Form state
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('🎯');

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/goals', {
        name, targetAmount: +target, deadline: deadline || null, icon,
      });
      setGoals([res.data, ...goals]);
      setName(''); setTarget(''); setDeadline(''); setIcon('🎯');
      setShowForm(false);
      toast.success('Goal created!');
    } catch {
      toast.error('Failed to create goal');
    }
  };

  const handleAddSavings = async (goalId) => {
    const amount = +addAmounts[goalId];
    if (!amount || amount <= 0) return toast.error('Enter a valid amount');
    const goal = goals.find(g => g._id === goalId);
    if (!goal) return toast.error('Goal not found');
    try {
      const currentSaved = typeof goal.savedAmount === 'number' ? goal.savedAmount : 0;
      const res = await api.put(`/goals/${goalId}`, {
        savedAmount: currentSaved + amount,
      });
      setGoals(goals.map(g => g._id === goalId ? res.data : g));
      setAddAmounts({ ...addAmounts, [goalId]: '' });
      toast.success(`Added ${formatCurrency(amount)}!`);
    } catch {
      toast.error('Failed to add savings');
    }
  };

  const handleDelete = async (goalId) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await api.delete(`/goals/${goalId}`);
      setGoals(goals.filter(g => g._id !== goalId));
      toast.success('Goal deleted');
    } catch {
      toast.error('Failed to delete');
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

      {/* Stats */}
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

      {/* Create Form */}
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
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="₹50,000" required />
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

      {/* Goals Grid */}
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
              <div key={goal._id} className="goal-card">
                <div className="goal-card-header">
                  <span className="goal-icon">{goal.icon}</span>
                  <div>
                    <h3>{goal.name}</h3>
                    {daysLeft !== null && (
                      <small className="goal-deadline">{daysLeft} days left</small>
                    )}
                  </div>
                  <button className="goal-delete" onClick={() => handleDelete(goal._id)}>
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

                <div className="goal-add-savings">
                  <input
                    type="number"
                    placeholder="Add ₹..."
                    value={addAmounts[goal._id] || ''}
                    onChange={e => setAddAmounts({ ...addAmounts, [goal._id]: e.target.value })}
                  />
                  <button className="btn btn--dark" onClick={() => handleAddSavings(goal._id)}>
                    <BanknotesIcon width={16} />
                    <span>Add</span>
                  </button>
                </div>
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
