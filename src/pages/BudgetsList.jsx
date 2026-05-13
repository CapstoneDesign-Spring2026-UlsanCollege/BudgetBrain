import { useLoaderData, Link } from 'react-router-dom';
import { WalletIcon } from '@heroicons/react/24/solid';
import { fetchData } from '../helpers';
import BudgetItem from '../components/BudgetItem';

export async function budgetsListLoader() {
  const budgets = await fetchData('budgets');
  const expenses = await fetchData('expenses');
  return { budgets, expenses };
}

const BudgetsList = () => {
  const { budgets, expenses } = useLoaderData();

  return (
    <div className="grid-lg" style={{ width: '100%' }}>
      <div className="expenses-header">
        <h1>My Budgets</h1>
      </div>

      {budgets && budgets.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {budgets.map((budget) => (
            <BudgetItem key={budget.id} budget={budget} expenses={expenses} />
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <WalletIcon width={64} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No budgets created yet</h3>
          <p style={{ color: 'hsl(215 20% 65%)', marginTop: '0.5rem' }}>
            Head to the dashboard to create your first budget.
          </p>
          <Link to="/" className="btn btn--dark" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
};

export default BudgetsList;
