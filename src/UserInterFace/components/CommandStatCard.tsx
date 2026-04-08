import { LucideIcon } from 'lucide-react';

interface CommandStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  iconColor?: string;
  glowColor?: string;
}

export function CommandStatCard({ 
  title, 
  value, 
  icon: Icon, 
  subtitle,
  iconColor = 'text-emerald-500',
  glowColor = 'emerald'
}: CommandStatCardProps) {
  return (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6 hover:border-emerald-600 transition-all shadow-lg hover:shadow-emerald-900/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold">{title}</p>
          <h3 className="text-4xl font-bold text-white mb-0 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-sm text-emerald-400 mt-2 mb-0 font-semibold">{subtitle}</p>
          )}
        </div>
        <div className="relative">
          <div className={`absolute inset-0 bg-${glowColor}-600 blur-xl opacity-30`}></div>
          <div className={`relative bg-slate-800 p-3 rounded-md border border-slate-700`}>
            <Icon className={`w-7 h-7 ${iconColor}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

