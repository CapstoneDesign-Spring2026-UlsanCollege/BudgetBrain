import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import {
  BASE_CURRENCY,
  SUPPORTED_CURRENCIES,
  getExchangeRate,
  getSelectedCurrency,
  refreshExchangeRate,
} from '../helpers';

const CurrencyRateWidget = () => {
  const [currency, setCurrency] = useState(getSelectedCurrency());
  const [rate, setRate] = useState(getExchangeRate());
  const [updatedAt, setUpdatedAt] = useState(localStorage.getItem('budgetbrain-exchange-updated'));
  const [provider, setProvider] = useState(localStorage.getItem('budgetbrain-exchange-provider'));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const syncFromStorage = () => {
    setCurrency(getSelectedCurrency());
    setRate(getExchangeRate());
    setUpdatedAt(localStorage.getItem('budgetbrain-exchange-updated'));
    setProvider(localStorage.getItem('budgetbrain-exchange-provider'));
  };

  useEffect(() => {
    const handleCurrencyChange = () => syncFromStorage();
    window.addEventListener('budgetbrain-currency-change', handleCurrencyChange);
    return () => window.removeEventListener('budgetbrain-currency-change', handleCurrencyChange);
  }, []);

  const updateRate = async (nextCurrency, showToast = true) => {
    setIsRefreshing(true);
    try {
      const payload = await refreshExchangeRate(nextCurrency);
      setCurrency(payload.to);
      setRate(payload.rate);
      setUpdatedAt(localStorage.getItem('budgetbrain-exchange-updated'));
      setProvider(payload.provider);
      if (showToast) toast.success(`Display currency set to ${payload.to}`);
    } catch (err) {
      syncFromStorage();
      toast.error(err.userMessage || 'Could not refresh exchange rate');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCurrencyChange = (event) => {
    updateRate(event.target.value);
  };

  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'not refreshed yet';

  return (
    <section className="currency-dashboard-bar" aria-label="Live currency exchange">
      <div className="currency-dashboard-copy">
        <span className="currency-kicker">Display Currency</span>
        <strong>1 {BASE_CURRENCY} = {rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {currency}</strong>
        <small>
          Change the selector to update all displayed amounts. Updated {updatedLabel}
          {provider && currency !== BASE_CURRENCY ? ` by ${provider}` : ''}
        </small>
      </div>

      <div className="currency-dashboard-controls">
        <select
          value={currency}
          onChange={handleCurrencyChange}
          className="settings-select currency-dashboard-select"
          disabled={isRefreshing}
        >
          {SUPPORTED_CURRENCIES.map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn--outline currency-refresh-btn"
          onClick={() => updateRate(currency)}
          disabled={isRefreshing}
        >
          <ArrowPathIcon width={18} />
          <span>{isRefreshing ? 'Refreshing' : 'Refresh'}</span>
        </button>
      </div>
    </section>
  );
};

export default CurrencyRateWidget;
