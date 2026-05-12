import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  HomeIcon, 
  WalletIcon, 
  BanknotesIcon, 
  ChartPieIcon,
  XMarkIcon,
  TrophyIcon,
  UserCircleIcon,
  Cog8ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { formatCurrency } from "../helpers";

export default function Sidebar({ isOpen, onClose, budgets, expenses, userName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const getAvatar = () => localStorage.getItem('budgetbrain-avatar') || null;
  const avatar = getAvatar();
  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  const calculateBudgetProgress = (budget) => {
    if (!expenses) return 0;
    const spent = expenses
      .filter((expense) => (expense.budget || expense.budgetId) === budget.id)
      .reduce((acc, expense) => acc + expense.amount, 0);
    const percentage = (spent / budget.amount) * 100;
    return Math.min(percentage, 100);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("budgetbrain-avatar");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <aside className={`sidebar ${isOpen ? "show" : ""}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="sidebar-brand">
          <BanknotesIcon width={32} className="brand-icon" />
          BudgetBrain
        </Link>
        {isOpen && (
          <button className="btn-icon" onClick={onClose} style={{ marginBottom: '2rem', display: 'block' }}>
            <XMarkIcon width={24} />
          </button>
        )}
      </div>

      <nav>
        <ul>
          <li>
            <Link to="/" className={isActive("/")}>
              <HomeIcon width={20} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/expenses" className={isActive("/expenses")}>
              <BanknotesIcon width={20} />
              Transactions
            </Link>
          </li>
          <li>
            <Link to="/budgets" className={isActive("/budgets")}>
              <WalletIcon width={20} />
              My Budgets
            </Link>
          </li>
          <li>
            <Link to="/analytics" className={isActive("/analytics")}>
              <ChartPieIcon width={20} />
              Analytics
            </Link>
          </li>
          <li>
            <Link to="/goals" className={isActive("/goals")}>
              <TrophyIcon width={20} />
              Goals
            </Link>
          </li>
        </ul>
      </nav>

      {budgets && budgets.length > 0 && (
        <div className="sidebar-progress-section">
          <h4 className="sidebar-progress-title">Live Budget Status</h4>
          {budgets.slice(0, 3).map((budget) => {
            const progress = calculateBudgetProgress(budget);
            const isOverBudget = progress >= 100;
            return (
              <div key={budget.id} className="sidebar-budget-item">
                <p>
                  <span>{budget.name}</span>
                  <span style={{ color: isOverBudget ? 'hsl(var(--danger))' : 'hsl(var(--muted))' }}>
                    {formatCurrency(budget.amount)}
                  </span>
                </p>
                <div className="sidebar-progress-bar">
                  <div 
                    className="sidebar-progress-fill" 
                    style={{ 
                      width: `${progress}%`,
                      background: isOverBudget ? 'hsl(var(--danger))' : 'linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accent-light)))'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="sidebar-profile-footer">
        <div className="sidebar-profile-info">
          <div className="sidebar-profile-avatar">{avatar || initial}</div>
          <div>
            <div className="sidebar-profile-name">{userName || "User"}</div>
            <div className="sidebar-profile-role">Free Plan</div>
          </div>
        </div>
        <div className="sidebar-actions">
          <Link to="/profile" className="btn btn--outline" style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}>
            <UserCircleIcon width={16} /> Profile
          </Link>
          <Link to="/settings" className="btn btn--outline" style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}>
            <Cog8ToothIcon width={16} /> Settings
          </Link>
        </div>
        <button className="btn btn--warning" style={{ width: '100%' }} onClick={handleLogout}>
          <ArrowRightOnRectangleIcon width={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
