function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();

  return function rateLimit(req, res, next) {
    const now = Date.now();
    const forwardedFor = req.headers['x-forwarded-for'];
    const key = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
      ?.split(',')[0]
      ?.trim()
      || req.ip
      || 'unknown';
    const current = hits.get(key);

    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
      return res.status(429).json({ msg: message });
    }

    return next();
  };
}

module.exports = createRateLimiter;
