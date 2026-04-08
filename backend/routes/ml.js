// ============================================================
// ML Integration Routes - Health Intelligence API
// Connects to Python Flask ML microservice
// ============================================================

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

router.use(protect);

// -----------------------------------------------------------
// POST /api/ml/predict - Get ML health risk prediction
// -----------------------------------------------------------
router.post('/predict', async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of symptoms'
      });
    }

    // Call Python ML microservice
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/ml/predict`, {
      symptoms
    }, {
      timeout: 10000 // 10 second timeout
    });

    res.json({
      success: true,
      message: 'ML prediction generated successfully',
      data: {
        ...mlResponse.data,
        disclaimer: 'This is an AI-assisted prediction for decision support only. Always consult a qualified medical professional.'
      }
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        error: 'ML service is currently unavailable',
        fallback: { risk_level: 'Unknown', confidence: 0 }
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// POST /api/ml/predict-health-risk - Get ML risk assessment
// -----------------------------------------------------------
router.post('/predict-health-risk', async (req, res) => {
  try {
    const { symptoms, history } = req.body;
    
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/ml/predict-health-risk`, {
      symptoms: symptoms || [],
      history: history || []
    }, { timeout: 10000 });

    res.json({
      success: true,
      data: mlResponse.data
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        error: 'ML service is currently unavailable',
        fallback: { risk_level: 'LOW', confidence: 50, message: 'Service offline' }
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// POST /api/ml/medicine-demand - Get demand forecasting
// -----------------------------------------------------------
router.post('/medicine-demand', async (req, res) => {
  try {
    const { medicine_name, history_usage } = req.body;
    
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/ml/medicine-demand`, {
      medicine_name,
      history_usage
    }, { timeout: 10000 });

    res.json({
      success: true,
      data: mlResponse.data
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        error: 'ML service is currently unavailable',
        fallback: { medicine: medicine_name, predicted_demand: 'UNKNOWN', confidence: 0 }
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// GET /api/ml/health-check - Check ML service status
// -----------------------------------------------------------
router.get('/health-check', async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/ml/health`, { timeout: 5000 });
    res.json({
      success: true,
      mlService: 'OPERATIONAL',
      data: response.data
    });
  } catch (error) {
    res.json({
      success: false,
      mlService: 'OFFLINE',
      error: 'ML service is not responding'
    });
  }
});

// -----------------------------------------------------------
// POST /api/ml/analyze-trends - Analyze health trends (Admin)
// -----------------------------------------------------------
router.post('/analyze-trends', async (req, res) => {
  try {
    const { data_type, period } = req.body;

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/ml/analyze-trends`, {
      data_type: data_type || 'appointments',
      period: period || '30days'
    }, {
      timeout: 15000
    });

    res.json({
      success: true,
      data: mlResponse.data
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'ML service is currently unavailable'
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
