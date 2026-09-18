require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const publicRoutes = require('./routes/public.routes');
const leadRoutes = require('./routes/lead.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/leads', leadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Client Lead Management System (Mini CRM API)'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found.' });
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Mini CRM Backend API running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
