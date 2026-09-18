const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. Authentication token required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-mini-crm-key-2026');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token.' });
  }
};

module.exports = { authenticateToken };
