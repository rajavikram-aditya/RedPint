const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./src/config/db');

const app = express();

// --------------- Middleware ---------------
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:8080')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server / REST tools without origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// --------------- Routes ---------------
const authRoutes = require('./src/routes/auth.routes');
const donorRoutes = require('./src/routes/donor.routes');
const hospitalRoutes = require('./src/routes/hospital.routes');
const adminRoutes = require('./src/routes/admin.routes');
const bloodRequestRoutes = require('./src/routes/bloodRequest.routes');
const matchRoutes = require('./src/routes/match.routes');
const donationRoutes = require('./src/routes/donation.routes');
const hospitalStockRoutes = require('./src/routes/hospitalStock.routes');
const driveRoutes = require('./src/routes/drive.routes');
const notificationRoutes = require('./src/routes/notification.routes');

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/hospital-stock', hospitalStockRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/notifications', notificationRoutes);

// --------------- Health check ---------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------- Error handler ---------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// --------------- Start ---------------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🩸 RedPint API running on port ${PORT}`);
  });
});
