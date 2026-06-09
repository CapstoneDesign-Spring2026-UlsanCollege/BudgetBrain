import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  SunIcon,
  MoonIcon,
  CurrencyDollarIcon,
  BellIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/solid';
import {
  BASE_CURRENCY,
  SUPPORTED_CURRENCIES,
  getExchangeRate,
  refreshExchangeRate,
} from '../helpers';

const Settings = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [currency, setCurrency] = useState(localStorage.getItem('budgetbrain-currency') || BASE_CURRENCY);
  const [exchangeRate, setExchangeRate] = useState(getExchangeRate());
  const [exchangeUpdated, setExchangeUpdated] = useState(localStorage.getItem('budgetbrain-exchange-updated'));
  const [exchangeProvider, setExchangeProvider] = useState(localStorage.getItem('budgetbrain-exchange-provider'));
  const [exchangeProviderUrl, setExchangeProviderUrl] = useState(localStorage.getItem('budgetbrain-exchange-provider-url'));
  const [isRefreshingRate, setIsRefreshingRate] = useState(false);
  const [notifications, setNotifications] = useState(
    localStorage.getItem('budgetbrain-notifications') !== 'false'
  );
  const [budgetAlerts, setBudgetAlerts] = useState(
    localStorage.getItem('budgetbrain-budget-alerts') !== 'false'
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem('budgetbrain-theme');
    if (savedTheme === 'light') setIsDarkTheme(false);

    setIsRefreshingRate(true);
    refreshExchangeRate(currency)
      .then((payload) => {
        setExchangeRate(payload.rate);
        setExchangeUpdated(localStorage.getItem('budgetbrain-exchange-updated'));
        setExchangeProvider(payload.provider);
        setExchangeProviderUrl(payload.providerUrl || localStorage.getItem('budgetbrain-exchange-provider-url'));
      })
      .catch((err) => {
        toast.error(err.userMessage || 'Could not refresh exchange rate');
      })
      .finally(() => setIsRefreshingRate(false));
  }, []);

  const handleThemeToggle = () => {
    setIsDarkTheme((prev) => {
      const newTheme = !prev;
      if (newTheme) {
        document.body.classList.remove('light-theme');
        localStorage.setItem('budgetbrain-theme', 'dark');
      } else {
        document.body.classList.add('light-theme');
        localStorage.setItem('budgetbrain-theme', 'light');
      }
      return newTheme;
    });
    toast.success(`Theme switched to ${isDarkTheme ? 'light' : 'dark'} mode`);
  };

  const handleCurrencyChange = async (e) => {
    const val = e.target.value;
    setCurrency(val);
    setIsRefreshingRate(true);

    try {
      const payload = await refreshExchangeRate(val);
      setExchangeRate(payload.rate);
      setExchangeUpdated(localStorage.getItem('budgetbrain-exchange-updated'));
      setExchangeProvider(payload.provider);
      setExchangeProviderUrl(payload.providerUrl || localStorage.getItem('budgetbrain-exchange-provider-url'));
      toast.success(`Display currency set to ${val}`);
    } catch (err) {
      setCurrency(localStorage.getItem('budgetbrain-currency') || BASE_CURRENCY);
      toast.error(err.userMessage || 'Could not update exchange rate');
    } finally {
      setIsRefreshingRate(false);
    }
  };

  const handleRefreshRate = async () => {
    setIsRefreshingRate(true);
    try {
      const payload = await refreshExchangeRate(currency);
      setExchangeRate(payload.rate);
      setExchangeUpdated(localStorage.getItem('budgetbrain-exchange-updated'));
      setExchangeProvider(payload.provider);
      setExchangeProviderUrl(payload.providerUrl || localStorage.getItem('budgetbrain-exchange-provider-url'));
      toast.success('Exchange rate refreshed');
    } catch (err) {
      toast.error(err.userMessage || 'Could not refresh exchange rate');
    } finally {
      setIsRefreshingRate(false);
    }
  };

  const handleNotificationsToggle = () => {
    setNotifications((prev) => {
      localStorage.setItem('budgetbrain-notifications', !prev);
      return !prev;
    });
    toast.success('Notification preferences updated');
  };

  const handleBudgetAlertsToggle = () => {
    setBudgetAlerts((prev) => {
      localStorage.setItem('budgetbrain-budget-alerts', !prev);
      return !prev;
    });
    toast.success('Budget alert preferences updated');
  };

  return (
    <div className="grid-lg" style={{ width: '100%', maxWidth: '800px' }}>
      <h1>Settings</h1>

      <div className="profile-section">
        <h3><SunIcon width={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> Appearance</h3>
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Theme</strong>
            <p style={{ color: 'hsl(215 20% 65%)', fontSize: '0.9rem' }}>Switch between dark and light mode</p>
          </div>
          <button className={`toggle-btn ${isDarkTheme ? 'dark' : 'light'}`} onClick={handleThemeToggle}>
            {isDarkTheme ? <MoonIcon width={18} /> : <SunIcon width={18} />}
            <span>{isDarkTheme ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </div>

      <div className="profile-section">
        <h3><CurrencyDollarIcon width={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> Currency</h3>
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Display Currency</strong>
            <p style={{ color: 'hsl(215 20% 65%)', fontSize: '0.9rem' }}>Amounts are saved in NPR but shown in your selected currency</p>
          </div>
          <select value={currency} onChange={handleCurrencyChange} className="settings-select" disabled={isRefreshingRate}>
            {SUPPORTED_CURRENCIES.map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Live Exchange Rate</strong>
            <p style={{ color: 'hsl(215 20% 65%)', fontSize: '0.9rem' }}>
              1 {BASE_CURRENCY} = {exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {currency}
              {exchangeUpdated ? ` - updated ${new Date(exchangeUpdated).toLocaleString()}` : ''}
              {exchangeProvider ? ` - ${exchangeProvider}` : ''}
            </p>
            {exchangeProviderUrl && currency !== BASE_CURRENCY && (
              <a
                href="https://www.exchangerate-api.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'hsl(var(--accent))', fontSize: '0.85rem' }}
              >
                Rates By Exchange Rate API
              </a>
            )}
          </div>
          <button className="btn btn--outline" onClick={handleRefreshRate} disabled={isRefreshingRate}>
            {isRefreshingRate ? 'Refreshing...' : 'Refresh Rate'}
          </button>
        </div>
      </div>

      <div className="profile-section">
        <h3><BellIcon width={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> Notifications</h3>
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Push Notifications</strong>
            <p style={{ color: 'hsl(215 20% 65%)', fontSize: '0.9rem' }}>Receive alerts about your spending</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={notifications} onChange={handleNotificationsToggle} />
            <span className="switch-slider" />
          </label>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Budget Alerts</strong>
            <p style={{ color: 'hsl(215 20% 65%)', fontSize: '0.9rem' }}>Get notified when you're close to budget limits</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={budgetAlerts} onChange={handleBudgetAlertsToggle} />
            <span className="switch-slider" />
          </label>
        </div>
      </div>

      <div className="profile-section">
        <h3><GlobeAltIcon width={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> About</h3>
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>BudgetBrain</strong>
            <p style={{ color: 'hsl(215 20% 65%)', fontSize: '0.9rem' }}>Version 1.0.0 - Your personal budget planner</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
