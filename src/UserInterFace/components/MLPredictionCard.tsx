import { Brain, TrendingUp, AlertCircle } from 'lucide-react';

interface MLPredictionCardProps {
  title: string;
  prediction: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  details?: string;
}

export function MLPredictionCard({ 
  title, 
  prediction, 
  confidence, 
  riskLevel,
  details 
}: MLPredictionCardProps) {
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
    }
  };

  const colors = getRiskColor();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Brain className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-500 mb-0">ML-Powered Analysis</p>
        </div>
      </div>

      <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${colors.text}`}>Prediction</span>
          <span className={`text-xs font-semibold ${colors.text} uppercase`}>{riskLevel} Risk</span>
        </div>
        <p className="text-base font-semibold text-gray-900 mb-0">{prediction}</p>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Confidence Level</span>
            <span className="text-sm font-semibold text-gray-900">{confidence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>

        {details && (
          <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
            <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 mb-0">{details}</p>
          </div>
        )}
      </div>
    </div>
  );
}
