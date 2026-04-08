// ============================================================
// Animated ML Disease Prediction Panel with Eye-Catching Effects
// Advanced AI-powered diagnostic assistant with smooth animations
// ============================================================

import { useState, useEffect } from 'react';
import { Brain, Activity, AlertTriangle, TrendingUp, CheckCircle, XCircle, Loader, Sparkles, Stethoscope, FileText, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mlAPI } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface PredictionResult {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  treatment: string;
  recommendations: string[];
  relatedSymptoms: string[];
  riskFactors: string[];
  nextSteps: string[];
}

export function AnimatedMLDiagnostic() {
  const { user } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);

  // Pulse effect on symptom selection
  useEffect(() => {
    if (selectedSymptoms.length > 0) {
      setPulseEffect(true);
      const timer = setTimeout(() => setPulseEffect(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedSymptoms.length]);

  const symptomCategories = {
    'Respiratory': [
      'Cough',
      'Difficulty Breathing',
      'Chest Pain',
      'Wheezing',
      'Shortness of Breath',
      'Runny Nose',
      'Sore Throat',
      'Sneezing',
    ],
    'Gastrointestinal': [
      'Nausea',
      'Vomiting',
      'Diarrhea',
      'Abdominal Pain',
      'Loss of Appetite',
      'Bloating',
      'Constipation',
      'Heartburn',
    ],
    'Neurological': [
      'Headache',
      'Dizziness',
      'Fatigue',
      'Confusion',
      'Memory Loss',
      'Sensitivity to Light',
      'Numbness',
      'Tingling',
    ],
    'Musculoskeletal': [
      'Joint Pain',
      'Muscle Weakness',
      'Back Pain',
      'Stiffness',
      'Swelling',
      'Muscle Aches',
      'Limited Movement',
      'Neck Stiffness',
    ],
    'Dermatological': [
      'Rash',
      'Itching',
      'Skin Discoloration',
      'Blisters',
      'Dry Skin',
      'Red Patches',
      'Hives',
      'Bruising',
    ],
    'General': [
      'Fever',
      'Chills',
      'Sweating',
      'Weight Loss',
      'Weakness',
      'Dehydration',
      'Loss of Taste or Smell',
      'Sleep Problems',
    ],
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev: string[]) =>
      prev.includes(symptom)
        ? prev.filter((s: string) => s !== symptom)
        : [...prev, symptom]
    );
    setAnalysisComplete(false);
    setPrediction(null);
  };

  const analyzeSymptomsEnhanced = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }

    setLoading(true);
    setAnalysisComplete(false);

    try {
      // Call backend ML service with CSV data
      const result = await mlAPI.predictDisease(selectedSymptoms);
      
      // Enhanced result with AI processing
      const enhancedResult: PredictionResult = {
        disease: result.disease || 'Unknown Condition',
        confidence: result.confidence || 0,
        severity: result.severity || determineSeverity(result.confidence, selectedSymptoms),
        description: result.description || 'No description available',
        treatment: result.treatment || 'Consult healthcare provider',
        recommendations: generateRecommendations(result.disease, result.treatment),
        relatedSymptoms: getRelatedSymptoms(result.disease),
        riskFactors: getRiskFactors(result.disease),
        nextSteps: getNextSteps(result.disease, user?.role || 'student'),
      };

      setPrediction(enhancedResult);
      setAnalysisComplete(true);
      
      toast.success('AI Analysis Complete', {
        description: `Diagnosis: ${enhancedResult.disease} (${Math.round(enhancedResult.confidence)}% confidence)`,
      });
    } catch (error: any) {
      // Fallback to mock prediction if backend is offline
      if (error.message === 'BACKEND_OFFLINE') {
        const mockResult = generateMockPrediction(selectedSymptoms);
        setPrediction(mockResult);
        setAnalysisComplete(true);
        toast.success('AI Analysis Complete (Demo Mode)', {
          description: `Diagnosis: ${mockResult.disease}`,
        });
      } else if (error.message === 'UNAUTHORIZED') {
        toast.error('Session expired', {
          description: 'Please logout and login again to continue using AI features.'
        });
      } else {
        toast.error('Analysis failed', {
          description: error.message || 'Please check your connection and try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const determineSeverity = (confidence: number, symptoms: string[]): 'low' | 'medium' | 'high' | 'critical' => {
    const criticalSymptoms = ['Difficulty Breathing', 'Chest Pain', 'Confusion', 'Severe Bleeding', 'Loss of Consciousness'];
    const hasCritical = symptoms.some(s => criticalSymptoms.includes(s));
    
    if (hasCritical) return 'critical';
    if (confidence > 80) return 'high';
    if (confidence > 60) return 'medium';
    return 'low';
  };

  const generateRecommendations = (disease: string, treatment: string): string[] => {
    const recommendations = [
      'Stay hydrated and get adequate rest',
      'Monitor symptoms closely for changes',
      treatment || 'Follow prescribed treatment plan',
    ];
    return recommendations;
  };

  const getRelatedSymptoms = (disease: string): string[] => {
    return ['Body aches', 'Mild fever', 'General discomfort'];
  };

  const getRiskFactors = (disease: string): string[] => {
    return ['Age factors', 'Environmental exposure', 'Previous medical history'];
  };

  const getNextSteps = (disease: string, role: string): string[] => {
    if (role === 'doctor') {
      return [
        'Review complete patient history',
        'Order diagnostic tests if necessary',
        'Prescribe appropriate medication',
        'Schedule follow-up appointment',
      ];
    }
    return [
      'Schedule appointment with healthcare provider',
      'Document symptom progression',
      'Follow recommended treatment plan',
      'Seek immediate care if symptoms worsen',
    ];
  };

  const generateMockPrediction = (symptoms: string[]): PredictionResult => {
    const diseases = [
      { name: 'Viral Infection', confidence: 85, severity: 'medium' as const, description: 'Common viral illness', treatment: 'Rest and fluids' },
      { name: 'Bacterial Infection', confidence: 78, severity: 'high' as const, description: 'Bacterial disease', treatment: 'Antibiotics' },
      { name: 'Allergic Reaction', confidence: 72, severity: 'low' as const, description: 'Allergic response', treatment: 'Antihistamines' },
    ];

    const selected = diseases[Math.floor(Math.random() * diseases.length)];
    
    return {
      disease: selected.name,
      confidence: selected.confidence,
      severity: selected.severity,
      description: selected.description,
      treatment: selected.treatment,
      recommendations: generateRecommendations(selected.name, selected.treatment),
      relatedSymptoms: getRelatedSymptoms(selected.name),
      riskFactors: getRiskFactors(selected.name),
      nextSteps: getNextSteps(selected.name, user?.role || 'student'),
    };
  };

  const getSeverityConfig = (severity: string) => {
    const configs = {
      low: { bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-600', glow: 'shadow-emerald-500/50' },
      medium: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border-yellow-600', glow: 'shadow-yellow-500/50' },
      high: { bg: 'bg-orange-900/30', text: 'text-orange-400', border: 'border-orange-600', glow: 'shadow-orange-500/50' },
      critical: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-600', glow: 'shadow-red-500/50' },
    };
    return configs[severity as keyof typeof configs] || configs.low;
  };

  const clearAnalysis = () => {
    setSelectedSymptoms([]);
    setPrediction(null);
    setAnalysisComplete(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-linear-to-br from-purple-900/30 via-slate-900 to-blue-900/30 border-2 border-purple-600 rounded-md p-6 shadow-2xl shadow-purple-900/20"
    >
      {/* Animated Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-purple-600 blur-lg opacity-50"></div>
            <div className="relative p-3 bg-linear-to-br from-purple-600 to-purple-700 rounded-md border border-purple-500">
              <Brain className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wider m-0 flex items-center gap-2">
              AI Diagnostic Assistant
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
              </motion.div>
            </h3>
            <p className="text-xs text-purple-300 uppercase tracking-widest font-semibold m-0">
              Powered by CSV-Trained RandomForest ML
            </p>
          </div>
        </div>
        {selectedSymptoms.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearAnalysis}
            className="text-xs text-slate-400 hover:text-red-400 uppercase tracking-wider font-bold transition-colors"
          >
            Reset
          </motion.button>
        )}
      </div>

      {/* Symptom Selection */}
      {!analysisComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white font-bold uppercase tracking-wider m-0">
              Select Symptoms
            </p>
            <motion.div
              animate={pulseEffect ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="px-3 py-1 bg-purple-600/30 text-purple-300 border border-purple-600 rounded-full text-xs font-bold"
            >
              {selectedSymptoms.length} Selected
            </motion.div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(symptomCategories).map(([category, symptoms]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  {category}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {symptoms.map((symptom, idx) => (
                    <motion.button
                      key={symptom}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all border-2 ${
                        selectedSymptoms.includes(symptom)
                          ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/50'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-purple-600 hover:text-purple-300'
                      }`}
                    >
                      {selectedSymptoms.includes(symptom) && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-block mr-1"
                        >
                          <CheckCircle className="w-3 h-3 inline" />
                        </motion.span>
                      )}
                      {symptom}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={analyzeSymptomsEnhanced}
            disabled={loading || selectedSymptoms.length === 0}
            className="w-full px-6 py-4 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-md hover:from-purple-700 hover:to-purple-800 transition-all font-bold uppercase tracking-wide flex items-center justify-center gap-2 border-2 border-purple-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader className="w-5 h-5" />
                </motion.div>
                Analyzing with AI...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Run AI Diagnosis
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Animated Prediction Results */}
      <AnimatePresence>
        {analysisComplete && prediction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Disease Identification with Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-5 rounded-md border-2 ${getSeverityConfig(prediction.severity).border} ${getSeverityConfig(prediction.severity).bg} shadow-lg ${getSeverityConfig(prediction.severity).glow}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                    AI Prediction
                  </p>
                  <motion.h4
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-white mb-2 uppercase tracking-wide"
                  >
                    {prediction.disease}
                  </motion.h4>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-slate-300 mb-3"
                  >
                    {prediction.description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2"
                  >
                    <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getSeverityConfig(prediction.severity).bg} ${getSeverityConfig(prediction.severity).text} border ${getSeverityConfig(prediction.severity).border}`}>
                      {prediction.severity} Severity
                    </span>
                  </motion.div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                    Confidence
                  </p>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="relative w-24 h-24"
                  >
                    <svg className="transform -rotate-90 w-24 h-24">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#334155"
                        strokeWidth="8"
                        fill="none"
                      />
                      <motion.circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#a855f7"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - prediction.confidence / 100) }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-2xl font-bold text-white font-mono"
                      >
                        {Math.round(prediction.confidence)}%
                      </motion.span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Treatment Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="p-4 bg-linear-to-br from-emerald-900/30 to-slate-800 border border-emerald-700 rounded-md"
            >
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Stethoscope className="w-5 h-5 text-emerald-500" />
                </motion.div>
                <p className="text-sm text-white font-bold uppercase tracking-wider m-0">
                  Treatment Plan
                </p>
              </div>
              <p className="text-sm text-slate-300">{prediction.treatment}</p>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="p-4 bg-slate-800/50 border border-blue-700 rounded-md"
            >
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-blue-500" />
                <p className="text-sm text-white font-bold uppercase tracking-wider m-0">
                  Recommendations
                </p>
              </div>
              <ul className="space-y-2">
                {prediction.recommendations.map((rec: string, idx: number) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex gap-3 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearAnalysis}
                className="flex-1 px-4 py-3 bg-slate-800 border-2 border-slate-700 text-white rounded-md hover:border-purple-600 transition-all font-bold uppercase tracking-wide"
              >
                New Analysis
              </motion.button>
              {user?.role !== 'student' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-md hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold uppercase tracking-wide border-2 border-emerald-500 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Create Record
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Badge with Pulse Animation */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-center gap-2"
      >
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold m-0">
          Trained on 90+ Diseases from CSV Dataset
        </p>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #7c3aed;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9333ea;
        }
      `}</style>
    </motion.div>
  );
}
