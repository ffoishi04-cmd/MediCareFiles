// ============================================================
// MediCare Backend Server - University Medical Center System
// Node.js + Express + MongoDB + JWT Authentication
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// -----------------------------------------------------------
// Middleware Configuration
// -----------------------------------------------------------
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// -----------------------------------------------------------
// MongoDB Connection
// -----------------------------------------------------------
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`\n  [DATABASE] MongoDB Connected: ${conn.connection.host}`);
    console.log(`  [DATABASE] Database: ${conn.connection.name}`);
    console.log(`  [DATABASE] Status: OPERATIONAL\n`);
  } catch (error) {
    console.error(`  [DATABASE] Connection Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// -----------------------------------------------------------
// Import Routes
// -----------------------------------------------------------
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes = require('./routes/prescriptions');
const medicineRoutes = require('./routes/medicines');
const ambulanceRoutes = require('./routes/ambulances');
const studentRoutes = require('./routes/students');
const mlRoutes = require('./routes/ml');

// -----------------------------------------------------------
// Route Registration
// -----------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/ml', mlRoutes);

// -----------------------------------------------------------
// Health Check Endpoint
// -----------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    system: 'MediCare Medical Command System',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    version: '1.0.0'
  });
});

// -----------------------------------------------------------
// Global Error Handler
// -----------------------------------------------------------
app.use((err, req, res, next) => {
  console.error(`  [ERROR] ${err.message}`);
  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// -----------------------------------------------------------
// 404 Handler
// -----------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// -----------------------------------------------------------
// Start Server
// -----------------------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n  =============================================');
  console.log('   MEDICARE - Medical Command System Backend');
  console.log('  =============================================');
  console.log(`  [SERVER]  Running on port ${PORT}`);
  console.log(`  [MODE]    ${process.env.NODE_ENV || 'development'}`);
  console.log(`  [ML]      Service URL: ${process.env.ML_SERVICE_URL}`);
  console.log('  =============================================\n');
});

module.exports = app;
