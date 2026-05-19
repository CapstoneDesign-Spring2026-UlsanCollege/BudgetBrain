const express = require('express');
const router = express.Router();
const {
  cleanString,
  handleServerError,
  sendError,
} = require('../utils/http');

const SUPPORTED_CURRENCIES = ['NPR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD', 'KRW', 'INR'];
const CACHE_TTL_MS = 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
const rateCache = new Map();

function normalizeCurrency(value) {
  return cleanString(value).toUpperCase();
}

function isSupportedCurrency(value) {
  return SUPPORTED_CURRENCIES.includes(value);
}

function getProviderUrl(base) {
  const template = process.env.EXCHANGE_RATE_API_URL || 'https://open.er-api.com/v6/latest/{base}';
  return template.replace('{base}', encodeURIComponent(base));
}

async function fetchRates(base) {
  const cached = rateCache.get(base);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { ...cached, cached: true };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(getProviderUrl(base), { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Exchange rate provider returned ${response.status}`);
    }

    const data = await response.json();
    if (data.result !== 'success' || !data.rates || typeof data.rates !== 'object') {
      throw new Error('Exchange rate provider returned an invalid response');
    }

    const nextCache = {
      base,
      rates: data.rates,
      provider: 'ExchangeRate-API Open Access',
      providerUrl: 'https://www.exchangerate-api.com/docs/free',
      terms: 'Attribution required by provider.',
      providerUpdatedAt: data.time_last_update_utc || null,
      fetchedAt: Date.now(),
    };
    rateCache.set(base, nextCache);
    return { ...nextCache, cached: false };
  } finally {
    clearTimeout(timeout);
  }
}

router.get('/currencies', (req, res) => {
  res.json({
    baseCurrency: 'NPR',
    currencies: SUPPORTED_CURRENCIES,
    provider: 'ExchangeRate-API Open Access',
    providerUrl: 'https://www.exchangerate-api.com/docs/free',
  });
});

router.get('/rate', async (req, res) => {
  const from = normalizeCurrency(req.query.from || 'NPR');
  const to = normalizeCurrency(req.query.to || 'NPR');

  if (!isSupportedCurrency(from)) return sendError(res, 400, 'Base currency is not supported.');
  if (!isSupportedCurrency(to)) return sendError(res, 400, 'Target currency is not supported.');

  if (from === to) {
    return res.json({
      from,
      to,
      rate: 1,
      cached: true,
      provider: 'Local identity conversion',
      providerUrl: null,
      providerUpdatedAt: null,
      fetchedAt: Date.now(),
    });
  }

  try {
    const data = await fetchRates(from);
    const rate = data.rates[to];
    if (!Number.isFinite(rate)) {
      return sendError(res, 404, 'Exchange rate is not available for that currency.');
    }

    res.json({
      from,
      to,
      rate,
      cached: data.cached,
      provider: data.provider,
      providerUrl: data.providerUrl,
      providerUpdatedAt: data.providerUpdatedAt,
      fetchedAt: data.fetchedAt,
    });
  } catch (err) {
    const cached = rateCache.get(from);
    const cachedRate = cached?.rates?.[to];
    if (Number.isFinite(cachedRate)) {
      return res.json({
        from,
        to,
        rate: cachedRate,
        cached: true,
        stale: true,
        provider: cached.provider,
        providerUrl: cached.providerUrl,
        providerUpdatedAt: cached.providerUpdatedAt,
        fetchedAt: cached.fetchedAt,
      });
    }

    handleServerError(res, err, 'Exchange rate service is unavailable.');
  }
});

module.exports = router;
module.exports._internals = {
  CACHE_TTL_MS,
  SUPPORTED_CURRENCIES,
  isSupportedCurrency,
  normalizeCurrency,
};
