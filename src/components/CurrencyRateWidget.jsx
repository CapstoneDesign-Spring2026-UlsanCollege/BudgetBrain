import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import {
  BASE_CURRENCY,
  SUPPORTED_CURRENCIES,
  fetchLiveExchangeRate,
  getSelectedCurrency,
} from '../helpers';

const CurrencyRateWidget = () => {
  const [displayCurrency, setDisplayCurrency] = useState(getSelectedCurrency());
  const [rateCurrency, setRateCurrency] = useState(
    localStorage.getItem('budgetbrain-live-rate-currency') || getSelectedCurrency()
  );
  const [rate, setRate] = useState(Number(localStorage.getItem('budgetbrain-live-rate')) || 1);
  const [updatedAt, setUpdatedAt] = useState(localStorage.getItem('budgetbrain-live-rate-updated'));
  const [provider, setProvider] = useState(localStorage.getItem('budgetbrain-live-rate-provider'));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const syncFromStorage = () => {
    setDisplayCurrency(getSelectedCurrency());
  };

  useEffect(() => {
    const handleCurrencyChange = () => syncFromStorage();
    window.addEventListener('budgetbrain-currency-change', handleCurrencyChange);
    return () => window.removeEventListener('budgetbrain-currency-change', handleCurrencyChange);
  }, []);

  const updateRate = async (nextCurrency, showToast = true) => {
    setIsRefreshing(true);
    try {
      const payload = await fetchLiveExchangeRate(nextCurrency);
      localStorage.setItem('budgetbrain-live-rate-currency', payload.to);
      localStorage.setItem('budgetbrain-live-rate', String(payload.rate));
      localStorage.setItem('budgetbrain-live-rate-updated', new Date(payload.fetchedAt || Date.now()).toISOString());
      localStorage.setItem('budgetbrain-live-rate-provider', payload.provider || 'Exchange rate provider');
      setRateCurrency(payload.to);
      setRate(payload.rate);
      setUpdatedAt(localStorage.getItem('budgetbrain-live-rate-updated'));
      setProvider(payload.provider);
      if (showToast) toast.success(`Live rate checked for ${payload.to}`);
    } catch (err) {
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
        <span className="currency-kicker">Live Currency Rate</span>
        <strong>1 {BASE_CURRENCY} = {rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {rateCurrency}</strong>
        <small>
          Displaying app amounts in {displayCurrency}. Rate lookup does not change display currency.
          {' '}Updated {updatedLabel}
          {provider && rateCurrency !== BASE_CURRENCY ? ` by ${provider}` : ''}
        </small>
      </div>

      <div className="currency-dashboard-controls">
        <select
          value={rateCurrency}
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
          onClick={() => updateRate(rateCurrency)}
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
