// ============================================================
// Appointment Model - Medical Appointment Scheduling
// ============================================================

const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  time: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
    default: 'Scheduled'
  },
  symptoms: {
    type: String,
    default: ''
  },
  diagnosis: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  followUpDate: {
    type: Date,
    default: null
  },
  mlPrediction: {
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High', ''], default: '' },
    confidence: { type: Number, default: 0 },
    predictedCondition: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Index for efficient queries
AppointmentSchema.index({ patient: 1, date: -1 });
AppointmentSchema.index({ doctor: 1, date: -1 });
AppointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
