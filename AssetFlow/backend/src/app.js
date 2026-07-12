const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes  = require('./features/auth/auth.routes');
const assetRoutes = require('./features/assets/asset.routes');

app.use('/api/auth',   authRoutes);
app.use('/api/assets', assetRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'AssetFlow API is running' });
});

// Catch-all unhandled routes
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  next(err);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
