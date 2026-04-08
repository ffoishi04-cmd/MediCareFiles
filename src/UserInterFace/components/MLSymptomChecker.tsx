// ============================================================
// ML Symptom Checker - Interactive Health Intelligence Panel
// Connects to Python Flask ML microservice via backend
// Falls back to client-side mock predictions when offline
// ============================================================

import { useState } from 'react';
import { Brain, AlertTriangle, Activity, X, Plus, Search, Loader2 } from 'lucide-react';

const AVAILABLE_SYMPTOMS = [
  'fever', 'headache', 'cough', 'sore throat', 'body ache',
  'nausea', 'vomiting', 'diarrhea', 'chest pain', 'difficulty breathing',
  'fatigue', 'skin rash', 'joint pain', 'dizziness', 'abdominal pain',
  'back pain', 'runny nose', 'sneezing', 'high blood pressure', 'insomnia'
];

interface PredictionResult {
  risk_level: string;
  confidence: number;
  predicted_condition: string;
  matched_symptoms: string[];
  differential_diagnoses: { condition: string; probability: number }[];
  recommendations: string[];
}

// Client-side fallback prediction for when backend is offline
function mockPredict(symptoms: string[]): PredictionResult {
  const conditions: Record<string, string[]> = {
    'Viral Infection': ['fever', 'headache', 'body ache', 'fatigue', 'cough'],
    'Common Cold': ['cough', 'runny nose', 'sneezing', 'sore throat'],
    'Migraine': ['headache', 'nausea', 'dizziness'],
    'Allergic Reaction': ['skin rash', 'sneezing', 'runny nose'],
    'Gastroenteritis': ['nausea', 'vomiting', 'diarrhea', 'abdominal pain'],
    'Anxiety Disorder': ['chest pain', 'difficulty breathing', 'insomnia', 'dizziness'],
    'Muscle Strain': ['back pain', 'body ache', 'joint pain']
  };

  let bestMatch = 'General Illness';
  let bestScore = 0;

  for (const [condition, condSymptoms] of Object.entries(conditions)) {
    const matchCount = symptoms.filter(s => condSymptoms.includes(s)).length;
    if (matchCount > bestScore) {
      bestScore = matchCount;
      bestMatch = condition;
    }
  }

  const hasHighRisk = symptoms.some(s => ['chest pain', 'difficulty breathing', 'high blood pressure'].includes(s));
  const riskLevel = hasHighRisk ? 'High' : symptoms.length >= 3 ? 'Medium' : 'Low';
  const confidence = Math.min(35 + (bestScore * 15) + (symptoms.length * 5), 92);

  return {
    risk_level: riskLevel,
    confidence,
    predicted_condition: bestMatch,
    matched_symptoms: symptoms,
    differential_diagnoses: [
      { condition: bestMatch, probability: confidence },
      { condition: 'General Illness', probability: Math.max(confidence - 20, 25) }
    ],
    recommendations: riskLevel === 'High'
      ? ['URGENT: Visit the medical center immediately.', 'Do not delay seeking professional help.']
      : riskLevel === 'Medium'
      ? ['Schedule an appointment within 24-48 hours.', 'Rest and stay hydrated.']
      : ['Monitor symptoms. If they persist, consult a doctor.', 'Maintain adequate rest.']
  };
}

export function MLSymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const filteredSymptoms = AVAILABLE_SYMPTOMS.filter(
    s => s.includes(searchTerm.toLowerCase()) && !selectedSymptoms.includes(s)
  );

  const addSymptom = (symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
    setSearchTerm('');
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) return;
    setLoading(true);
    setPrediction(null);

    try {
      const response = await fetch('http://localhost:5000/api/ml/predict', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('medicare_token') || ''}`
        },
        body: JSON.stringify({ symptoms: selectedSymptoms })
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setPrediction(data.data || data);
      setIsOffline(false);
    } catch {
      // Fallback to client-side prediction
      await new Promise(r => setTimeout(r, 800));
      setPrediction(mockPredict(selectedSymptoms));
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const getRiskConfig = (level: string) => {
    switch (level) {
      case 'High': return { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-600', bar: 'bg-red-500' };
      case 'Medium': return { bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border-yellow-600', bar: 'bg-yellow-500' };
      default: return { bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-600', bar: 'bg-emerald-500' };
    }
  };

  return (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-600 blur-lg opacity-40"></div>
          <div className="relative bg-slate-800 p-2 rounded-md border border-purple-600">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1 uppercase tracking-wide">ML Health Analyzer</h4>
          <p className="text-xs text-purple-400 uppercase tracking-widest mb-0 font-semibold">
            {isOffline ? 'Client-Side Mode' : 'Flask ML Service'}
          </p>
        </div>
      </div>

      {/* Symptom Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:border-purple-600 text-white placeholder-slate-500 text-sm"
          />
        </div>
        {searchTerm && (
          <div className="mt-2 max-h-32 overflow-y-auto bg-slate-800 border border-slate-700 rounded-md">
            {filteredSymptoms.map(s => (
              <button
                key={s}
                onClick={() => addSymptom(s)}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 capitalize"
              >
                <Plus className="w-3 h-3 text-emerald-500" /> {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Symptom Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {AVAILABLE_SYMPTOMS.slice(0, 8).filter(s => !selectedSymptoms.includes(s)).map(s => (
          <button
            key={s}
            onClick={() => addSymptom(s)}
            className="px-2 py-1 text-xs border border-slate-700 bg-slate-800/50 text-slate-400 rounded hover:border-purple-600 hover:text-purple-400 transition-colors capitalize"
          >
            + {s}
          </button>
        ))}
      </div>

      {/* Selected Symptoms */}
      {selectedSymptoms.length > 0 && (
        <div className="mb-4 p-3 bg-slate-800/50 border border-slate-700 rounded-md">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Selected Symptoms ({selectedSymptoms.length})</p>
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map(s => (
              <span key={s} className="px-2 py-1 text-xs bg-purple-900/30 text-purple-400 border border-purple-600 rounded-md flex items-center gap-1 capitalize">
                {s}
                <button onClick={() => removeSymptom(s)} className="hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handlePredict}
        disabled={selectedSymptoms.length === 0 || loading}
        className="w-full px-4 py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-md hover:from-purple-700 hover:to-purple-800 transition-all font-bold text-sm uppercase tracking-wide border border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4" />
            Analyze Symptoms
          </>
        )}
      </button>

      {/* Prediction Results */}
      {prediction && (
        <div className="space-y-4">
          {/* Risk Level */}
          {(() => {
            const config = getRiskConfig(prediction.risk_level);
            return (
              <div className={`${config.bg} ${config.border} border-2 rounded-md p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prediction</span>
                  <span className={`text-xs font-bold ${config.text} uppercase tracking-wider px-2 py-1 ${config.bg} rounded border ${config.border}`}>
                    {prediction.risk_level} RISK
                  </span>
                </div>
                <p className="text-base font-bold text-white mb-0 uppercase">{prediction.predicted_condition}</p>
              </div>
            );
          })()}

          {/* Confidence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Confidence</span>
              <span className="text-sm font-bold text-white font-mono">{prediction.confidence}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-sm h-2 border border-slate-700">
              <div
                className={`${getRiskConfig(prediction.risk_level).bar} h-full rounded-sm transition-all`}
                style={{ width: `${prediction.confidence}%` }}
              ></div>
            </div>
          </div>

          {/* Differential Diagnoses */}
          {prediction.differential_diagnoses && prediction.differential_diagnoses.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Differential Diagnoses</p>
              {prediction.differential_diagnoses.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <span className="text-xs text-slate-300">{d.condition}</span>
                  <span className="text-xs font-mono text-slate-400">{d.probability}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {prediction.recommendations && (
            <div className="pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">Recommendations</p>
              {prediction.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 mb-1">
                  <Activity className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-300 mb-0">{r}</p>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="pt-2 border-t border-slate-700">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-500 italic mb-0">
                * Decision Support Only. {isOffline ? 'Client-side prediction (backend offline).' : 'ML service prediction.'} Always consult a medical professional.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

