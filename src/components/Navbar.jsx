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

export default function Navbar({ onToggleSidebar, userName }) {
  const navigate = useNavigate();
  
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  return (
    <header className="top-navbar">
      <button className="sidebar-toggle btn-icon" onClick={onToggleSidebar}>
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
          >
            <BellIcon width={24} />
            <span className="notif-badge"></span>
          </button>
          
          {isNotifOpen && (
            <div className="dropdown-menu notif-dropdown">
              <div className="dropdown-header">Notifications</div>
              <div className="empty-notif">
                <BellIcon width={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>You're all caught up!</p>
                <small style={{ opacity: 0.7 }}>No new alerts or messages.</small>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userMenuRef} style={{ position: 'relative' }}>
          <button 
            className="avatar-btn"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-label="User menu"
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
