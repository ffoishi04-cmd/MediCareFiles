import { Brain, Activity, AlertTriangle } from 'lucide-react';

interface MLCommandCardProps {
  title: string;
  prediction: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  details?: string;
}

export function MLCommandCard({ 
  title, 
  prediction, 
  confidence, 
  riskLevel,
  details 
}: MLCommandCardProps) {
  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'low':
        return { 
          bg: 'bg-emerald-900/30', 
          text: 'text-emerald-400', 
          border: 'border-emerald-600',
          label: 'LOW RISK',
          barColor: 'bg-emerald-500'
        };
      case 'medium':
        return { 
          bg: 'bg-yellow-900/30', 
          text: 'text-yellow-400', 
          border: 'border-yellow-600',
          label: 'MEDIUM RISK',
          barColor: 'bg-yellow-500'
        };
      case 'high':
        return { 
          bg: 'bg-red-900/30', 
          text: 'text-red-400', 
          border: 'border-red-600',
          label: 'HIGH RISK',
          barColor: 'bg-red-500'
        };
    }
  };

  const config = getRiskConfig();

  return (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6 shadow-lg">
      <div className="flex items-start gap-3 mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-600 blur-lg opacity-40"></div>
          <div className="relative bg-slate-800 p-2 rounded-md border border-purple-600">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1 uppercase tracking-wide">{title}</h4>
          <p className="text-xs text-purple-400 uppercase tracking-widest mb-0 font-semibold">AI-Assisted Insight</p>
        </div>
      </div>

      <div className={`${config.bg} ${config.border} border-2 rounded-md p-4 mb-4`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prediction</span>
          <span className={`text-xs font-bold ${config.text} uppercase tracking-wider px-2 py-1 ${config.bg} rounded border ${config.border}`}>
            {config.label}
          </span>
        </div>
        <p className="text-base font-bold text-white mb-0 uppercase">{prediction}</p>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Confidence Level</span>
            <span className="text-sm font-bold text-white font-mono">{confidence}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-sm h-2 border border-slate-700">
            <div 
              className={`${config.barColor} h-full rounded-sm transition-all shadow-lg`}
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>

        {details && (
          <div className="flex items-start gap-2 pt-3 border-t border-slate-700">
            <AlertTriangle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-400 mb-0 leading-relaxed">{details}</p>
          </div>
        )}

        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-500 italic mb-0">
            * Decision Support Only - Based on Historical Data
          </p>
        </div>
      </div>
    </div>
  );
}

