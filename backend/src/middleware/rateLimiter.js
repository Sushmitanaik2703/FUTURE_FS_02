const rateLimit = require('express-rate-limit');

// Rate limiter for public contact form submissions: 5 requests per 15 minutes per IP
const publicContactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 contact submissions per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many form submissions from this IP address. Please try again after 15 minutes.'
  }
});

module.exports = { publicContactLimiter };
