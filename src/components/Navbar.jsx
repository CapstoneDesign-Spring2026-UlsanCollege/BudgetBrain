import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Bars3Icon, 
  BellIcon, 
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  Cog8ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import api from "../api";
import { formatCurrency } from "../helpers";

function buildNotifications({ budgets = [], expenses = [], goals = [] }) {
  const notifications = [];
  const budgetAlertsEnabled = localStorage.getItem('budgetbrain-budget-alerts') !== 'false';

  if (budgetAlertsEnabled) {
    budgets.forEach((budget) => {
      const budgetId = budget._id || budget.id;
      const spent = expenses.reduce((total, expense) => {
        const expenseBudgetId = expense.budget || expense.budgetId;
        return expenseBudgetId === budgetId ? total + Number(expense.amount || 0) : total;
      }, 0);
      const amount = Number(budget.amount || 0);
      const pct = amount > 0 ? spent / amount : 0;

      if (pct >= 1) {
        notifications.push({
          id: `budget-over-${budgetId}`,
          title: `${budget.name} is over budget`,
          body: `${formatCurrency(spent)} spent from ${formatCurrency(amount)}.`,
          to: `/budget/${budgetId}`,
          severity: 'danger',
        });
      } else if (pct >= 0.8) {
        notifications.push({
          id: `budget-near-${budgetId}`,
          title: `${budget.name} is near its limit`,
          body: `${Math.round(pct * 100)}% used. ${formatCurrency(amount - spent)} remaining.`,
          to: `/budget/${budgetId}`,
          severity: 'warning',
        });
      }
    });
  }

  goals.forEach((goal) => {
    const goalId = goal._id || goal.id;
    const saved = Number(goal.savedAmount || 0);
    const target = Number(goal.targetAmount || 0);
    const deadline = goal.deadline ? new Date(goal.deadline) : null;
    const daysLeft = deadline
      ? Math.ceil((deadline.setHours(23, 59, 59, 999) - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    if (target > 0 && saved >= target) {
      notifications.push({
        id: `goal-complete-${goalId}`,
        title: `${goal.name} goal reached`,
        body: `${formatCurrency(saved)} saved.`,
        to: '/goals',
        severity: 'success',
      });
    } else if (daysLeft !== null && daysLeft <= 7) {
      notifications.push({
        id: `goal-due-${goalId}`,
        title: `${goal.name} deadline is close`,
        body: daysLeft < 0 ? 'Deadline has passed.' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left.`,
        to: '/goals',
        severity: daysLeft < 0 ? 'danger' : 'warning',
      });
    }
  });

  return notifications.slice(0, 8);
}

export default function Navbar({ onToggleSidebar, userName, budgets = [], expenses = [], goals = [] }) {
  const navigate = useNavigate();
  
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveGoals, setLiveGoals] = useState(goals);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const getAvatar = () => localStorage.getItem('budgetbrain-avatar') || null;
  const avatar = getAvatar();
  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  useEffect(() => {
    const savedTheme = localStorage.getItem("budgetbrain-theme");
    if (savedTheme === "light") {
      setIsDarkTheme(false);
      document.body.classList.add("light-theme");
    }
  }, []);

  useEffect(() => {
    setLiveGoals(goals || []);
  }, [goals]);

  useEffect(() => {
    async function refreshGoals() {
      try {
        const res = await api.get('/goals');
        setLiveGoals(res.data.map((goal) => ({ ...goal, id: goal._id || goal.id })));
      } catch {
        /* notifications can still render budget alerts */
      }
    }

    window.addEventListener('budgetbrain-goals-change', refreshGoals);
    return () => window.removeEventListener('budgetbrain-goals-change', refreshGoals);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme((prev) => {
      const newTheme = !prev;
      if (newTheme) {
        document.body.classList.remove("light-theme");
        localStorage.setItem("budgetbrain-theme", "dark");
      } else {
        document.body.classList.add("light-theme");
        localStorage.setItem("budgetbrain-theme", "light");
      }
      return newTheme;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/expenses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("budgetbrain-avatar");
    toast.success("You've logged out successfully!");
    navigate("/login");
  };

  const handleUserMenuClick = () => {
    const isMobile = window.matchMedia?.("(max-width: 640px)").matches;
    if (isMobile) {
      setIsUserMenuOpen(false);
      navigate("/profile");
      return;
    }
    setIsUserMenuOpen((open) => !open);
  };

  const notifications = buildNotifications({ budgets, expenses, goals: liveGoals });
  const notificationsEnabled = localStorage.getItem('budgetbrain-notifications') !== 'false';

  useEffect(() => {
    if (!notificationsEnabled || notificationPermission !== 'granted' || notifications.length === 0) return;

    const shown = JSON.parse(localStorage.getItem('budgetbrain-shown-notifications') || '{}');
    const nextAlert = notifications.find((item) => !shown[item.id]);
    if (!nextAlert) return;

    new Notification(nextAlert.title, { body: nextAlert.body });
    localStorage.setItem('budgetbrain-shown-notifications', JSON.stringify({
      ...shown,
      [nextAlert.id]: Date.now(),
    }));
  }, [notificationPermission, notificationsEnabled, notifications]);

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser notifications are not supported here.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    toast[permission === 'granted' ? 'success' : 'info'](
      permission === 'granted' ? 'Browser notifications enabled.' : 'Browser notifications were not enabled.'
    );
  };

  return (
    <header className="top-navbar">
      <button className="sidebar-toggle btn-icon" onClick={onToggleSidebar} aria-label="Open navigation">
        <Bars3Icon width={24} />
      </button>
      
      <form onSubmit={handleSearch} className="search-box glass-input-wrapper">
        <MagnifyingGlassIcon width={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search transactions..."
          className="glass-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className="nav-icons">
        <button 
          className="btn-icon" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDarkTheme ? <SunIcon width={24} /> : <MoonIcon width={24} />}
        </button>

        <div className="relative" ref={notifRef} style={{ position: 'relative' }}>
          <button 
            className={`notif-btn btn-icon ${isNotifOpen ? 'active' : ''}`}
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications"
          >
            <BellIcon width={24} />
            {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
          </button>
          
          {isNotifOpen && (
            <div className="dropdown-menu notif-dropdown">
              <div className="dropdown-header">Notifications</div>
              {notifications.length > 0 ? (
                <div className="notif-list">
                  {notifications.map((item) => (
                    <Link
                      key={item.id}
                      to={item.to}
                      className={`notif-item ${item.severity}`}
                      onClick={() => setIsNotifOpen(false)}
                    >
                      <strong>{item.title}</strong>
                      <small>{item.body}</small>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-notif">
                  <BellIcon width={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <p>You're all caught up!</p>
                  <small style={{ opacity: 0.7 }}>No active budget or goal alerts.</small>
                </div>
              )}
              {notificationsEnabled && notificationPermission === 'default' && (
                <button className="dropdown-item" onClick={requestNotifications}>
                  Enable browser notifications
                </button>
              )}
              {!notificationsEnabled && (
                <div className="notif-muted">Notifications are disabled in Settings.</div>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={userMenuRef} style={{ position: 'relative' }}>
          <button 
            className="avatar-btn"
            onClick={handleUserMenuClick}
            aria-label="Open profile"
          >
            <div className="avatar avatar-sm">{avatar || initial}</div>
          </button>
          
          {isUserMenuOpen && (
            <div className="dropdown-menu user-dropdown">
              <div className="dropdown-user-info">
                <div className="avatar avatar-md">{avatar || initial}</div>
                <div>
                  <p className="dropdown-user-name">{userName || "User"}</p>
                  <small style={{ color: 'hsl(215 20% 65%)' }}>View Profile</small>
                </div>
              </div>
              <div className="dropdown-divider" />
              <Link to="/profile" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                <UserCircleIcon width={18} />
                Profile
              </Link>
              <Link to="/settings" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                <Cog8ToothIcon width={18} />
                Settings
              </Link>
              <div className="dropdown-divider" />
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <ArrowRightOnRectangleIcon width={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
