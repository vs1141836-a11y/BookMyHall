const ipRequestMap = new Map();

// Rate limiter middleware
export const rateLimiter = (limit = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();

    if (!ipRequestMap.has(ip)) {
      ipRequestMap.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    const data = ipRequestMap.get(ip);

    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      ipRequestMap.set(ip, data);
      return next();
    }

    data.count += 1;
    ipRequestMap.set(ip, data);

    if (data.count > limit) {
      return res.status(429).json({
        success: false,
        message: `Too many requests from this IP. Please try again after ${Math.ceil((data.resetTime - now) / 1000)} seconds.`,
      });
    }

    next();
  };
};
