const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Test route
app.post('/api/test-signup', async (req, res) => {
  try {
    console.log('Test signup request:', req.body);
    res.json({ message: 'Test endpoint working', data: req.body });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ message: 'Test failed', error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});