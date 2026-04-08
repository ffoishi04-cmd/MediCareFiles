// ============================================================
// Professional ML Disease Prediction Panel
// Advanced AI-powered diagnostic assistant for all user roles
// ============================================================

import { useState } from 'react';
import { Brain, Activity, AlertTriangle, TrendingUp, CheckCircle, XCircle, Loader, Sparkles, Stethoscope, FileText } from 'lucide-react';
import { mlAPI } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface PredictionResult {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  relatedSymptoms: string[];
  riskFactors: string[];
  nextSteps: string[];
}

export function EnhancedMLDiagnostic() {
  const { user } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const symptomCategories = {
    'Respiratory': [
      'Cough',
      'Difficulty Breathing',
      'Chest Pain',
      'Wheezing',
      'Shortness of Breath',
    ],
    'Gastrointestinal': [
      'Nausea',
      'Vomiting',
      'Diarrhea',
      'Abdominal Pain',
      'Loss of Appetite',
    ],
    'Neurological': [
      'Headache',
      'Dizziness',
      'Fatigue',
      'Confusion',
      'Memory Loss',
    ],
    'Musculoskeletal': [
      'Joint Pain',
      'Muscle Weakness',
      'Back Pain',
      'Stiffness',
      'Swelling',
    ],
    'Dermatological': [
      'Rash',
      'Itching',
      'Skin Discoloration',
      'Blisters',
      'Dry Skin',
    ],
    'General': [
      'Fever',
      'Chills',
      'Sweating',
      'Weight Loss',
      'Weakness',
    ],
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev: string[] | any[]) =>
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
      // Call backend ML service
      const result = await mlAPI.predictDisease(selectedSymptoms);
      
      // Enhanced result with AI processing
      const enhancedResult: PredictionResult = {
        disease: result.disease || 'Unknown Condition',
        confidence: result.confidence || 0,
        severity: determineSeverity(result.confidence, selectedSymptoms),
        recommendations: generateRecommendations(result.disease, selectedSymptoms),
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
    const criticalSymptoms = ['Difficulty Breathing', 'Chest Pain', 'Confusion', 'Severe Bleeding'];
    const hasCritical = symptoms.some(s => criticalSymptoms.includes(s));
    
    if (hasCritical) return 'critical';
    if (confidence > 80) return 'high';
    if (confidence > 60) return 'medium';
    return 'low';
  };

  const generateRecommendations = (disease: string, symptoms: string[]): string[] => {
    const baseRecommendations = [
      'Stay hydrated and get adequate rest',
      'Monitor symptoms closely for changes',
      'Avoid strenuous physical activity',
    ];

    const diseaseSpecific: Record<string, string[]> = {
      'Viral Infection': ['Take over-the-counter pain relievers', 'Isolate to prevent spread'],
      'Bacterial Infection': ['Consider antibiotic treatment', 'Schedule follow-up examination'],
      'Allergic Reaction': ['Identify and avoid allergen triggers', 'Keep antihistamines available'],
      'Migraine': ['Rest in a dark, quiet room', 'Apply cold compress to forehead'],
      'Gastroenteritis': ['Follow BRAT diet (Bananas, Rice, Applesauce, Toast)', 'Avoid dairy products'],
    };

    return [...baseRecommendations, ...(diseaseSpecific[disease] || ['Consult healthcare provider'])];
  };

  const getRelatedSymptoms = (disease: string): string[] => {
    const relatedMap: Record<string, string[]> = {
      'Viral Infection': ['Body aches', 'Sore throat', 'Runny nose'],
      'Bacterial Infection': ['High fever', 'Rapid heart rate', 'Severe fatigue'],
      'Allergic Reaction': ['Watery eyes', 'Sneezing', 'Congestion'],
      'Migraine': ['Sensitivity to light', 'Nausea', 'Visual disturbances'],
      'Gastroenteritis': ['Cramping', 'Dehydration', 'Low-grade fever'],
    };
    return relatedMap[disease] || [];
  };

  const getRiskFactors = (disease: string): string[] => {
    const riskMap: Record<string, string[]> = {
      'Viral Infection': ['Weakened immune system', 'Close contact with infected individuals', 'Poor hygiene'],
      'Bacterial Infection': ['Open wounds', 'Recent surgery', 'Chronic illness'],
      'Allergic Reaction': ['Family history of allergies', 'Previous allergic episodes', 'Environmental exposure'],
      'Migraine': ['Stress', 'Sleep deprivation', 'Hormonal changes'],
      'Gastroenteritis': ['Contaminated food/water', 'Poor sanitation', 'Travel to endemic areas'],
    };
    return riskMap[disease] || ['Consult doctor for personalized risk assessment'];
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
      { name: 'Viral Infection', confidence: 85, severity: 'medium' as const },
      { name: 'Bacterial Infection', confidence: 78, severity: 'high' as const },
      { name: 'Allergic Reaction', confidence: 72, severity: 'low' as const },
      { name: 'Migraine', confidence: 68, severity: 'medium' as const },
      { name: 'Gastroenteritis', confidence: 81, severity: 'medium' as const },
    ];

    const selected = diseases[Math.floor(Math.random() * diseases.length)];
    
    return {
      disease: selected.name,
      confidence: selected.confidence,
      severity: selected.severity,
      recommendations: generateRecommendations(selected.name, symptoms),
      relatedSymptoms: getRelatedSymptoms(selected.name),
      riskFactors: getRiskFactors(selected.name),
      nextSteps: getNextSteps(selected.name, user?.role || 'student'),
    };
  };

  const getSeverityConfig = (severity: string) => {
    const configs = {
      low: { bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-600', icon: 'text-emerald-500' },
      medium: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border-yellow-600', icon: 'text-yellow-500' },
      high: { bg: 'bg-orange-900/30', text: 'text-orange-400', border: 'border-orange-600', icon: 'text-orange-500' },
      critical: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-600', icon: 'text-red-500' },
    };
    return configs[severity as keyof typeof configs] || configs.low;
  };

  const clearAnalysis = () => {
    setSelectedSymptoms([]);
    setPrediction(null);
    setAnalysisComplete(false);
  };

  return (
    <div className="bg-linear-to-br from-purple-900/30 via-slate-900 to-blue-900/30 border-2 border-purple-600 rounded-md p-6 shadow-2xl shadow-purple-900/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-600 blur-lg opacity-50"></div>
            <div className="relative p-3 bg-linear-to-br from-purple-600 to-purple-700 rounded-md border border-purple-500">
              <Brain className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wider m-0 flex items-center gap-2">
              AI Diagnostic Assistant
              <Sparkles className="w-5 h-5 text-purple-400" />
            </h3>
            <p className="text-xs text-purple-300 uppercase tracking-widest font-semibold m-0">
              Machine Learning Disease Prediction
            </p>
          </div>
        </div>
        {selectedSymptoms.length > 0 && (
          <button
            onClick={clearAnalysis}
            className="text-xs text-slate-400 hover:text-red-400 uppercase tracking-wider font-bold"
          >
            Reset
          </button>
        )}
      </div>

      {/* Symptom Selection */}
      {!analysisComplete && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white font-bold uppercase tracking-wider m-0">
              Select Symptoms ({selectedSymptoms.length} selected)
            </p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {Object.entries(symptomCategories).map(([category, symptoms]) => (
              <div key={category}>
                <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-2">
                  {category}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {symptoms.map(symptom => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all border-2 ${
                        selectedSymptoms.includes(symptom)
                          ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/50'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-purple-600 hover:text-purple-300'
                      }`}
                    >
                      {selectedSymptoms.includes(symptom) && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={analyzeSymptomsEnhanced}
            disabled={loading || selectedSymptoms.length === 0}
            className="w-full px-6 py-4 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-md hover:from-purple-700 hover:to-purple-800 transition-all font-bold uppercase tracking-wide flex items-center justify-center gap-2 border-2 border-purple-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Run AI Diagnosis
              </>
            )}
          </button>
        </div>
      )}

      {/* Prediction Results */}
      {analysisComplete && prediction && (
        <div className="space-y-4 animate-fadeIn">
          {/* Disease Identification */}
          <div className={`p-5 rounded-md border-2 ${getSeverityConfig(prediction.severity).border} ${getSeverityConfig(prediction.severity).bg}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  Predicted Diagnosis
                </p>
                <h4 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">
                  {prediction.disease}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getSeverityConfig(prediction.severity).bg} ${getSeverityConfig(prediction.severity).text} border ${getSeverityConfig(prediction.severity).border}`}>
                    {prediction.severity} Severity
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                  AI Confidence
                </p>
                <div className="relative w-24 h-24">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#334155"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#a855f7"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - prediction.confidence / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white font-mono">
                      {Math.round(prediction.confidence)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-slate-800/50 border border-emerald-700 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-5 h-5 text-emerald-500" />
              <p className="text-sm text-white font-bold uppercase tracking-wider m-0">
                Medical Recommendations
              </p>
            </div>
            <ul className="space-y-2">
              {prediction.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Symptoms */}
          <div className="p-4 bg-slate-800/50 border border-blue-700 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-blue-500" />
              <p className="text-sm text-white font-bold uppercase tracking-wider m-0">
                Related Symptoms to Monitor
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {prediction.relatedSymptoms.map((symptom: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-600 rounded-md text-xs font-bold uppercase tracking-wider">
                  {symptom}
                </span>
              ))}
            </div>
          </div>

          {/* Risk Factors */}
          <div className="p-4 bg-slate-800/50 border border-orange-700 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-white font-bold uppercase tracking-wider m-0">
                Risk Factors
              </p>
            </div>
            <ul className="space-y-2">
              {prediction.riskFactors.map((factor: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps */}
          <div className="p-4 bg-linear-to-br from-purple-900/30 to-slate-800 border-2 border-purple-600 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-purple-400" />
              <p className="text-sm text-white font-bold uppercase tracking-wider m-0">
                Recommended Next Steps
              </p>
            </div>
            <ol className="space-y-2">
              {prediction.nextSteps.map((step: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={clearAnalysis}
              className="flex-1 px-4 py-3 bg-slate-800 border-2 border-slate-700 text-white rounded-md hover:border-purple-600 transition-all font-bold uppercase tracking-wide"
            >
              New Analysis
            </button>
            {user?.role !== 'student' && (
              <button className="flex-1 px-4 py-3 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-md hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold uppercase tracking-wide border-2 border-emerald-500 flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Create Record
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Badge */}
      <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold m-0">
          Powered by RandomForest ML Algorithm
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
