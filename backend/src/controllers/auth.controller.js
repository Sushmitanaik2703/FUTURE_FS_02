const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbAsync } = require('../config/database');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await dbAsync.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const secret = process.env.JWT_SECRET || 'super-secret-mini-crm-key-2026';
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during authentication.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await dbAsync.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(444).json({ success: false, error: 'User not found.' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error fetching user profile.' });
  }
};

module.exports = { login, getMe };
