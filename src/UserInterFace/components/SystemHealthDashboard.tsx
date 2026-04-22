import { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Activity,
  Brain,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { checkBackendHealth } from '../services/api';
import { toast } from 'sonner';

interface HealthStatus {
  backend: boolean;
  database: boolean;
  ml: boolean;
}

const initialState: HealthStatus = {
  backend: false,
  database: false,
  ml: false,
};

export function SystemHealthDashboard() {
  const [health, setHealth] = useState<HealthStatus>(initialState);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);

    try {
      const status = await checkBackendHealth();

      // Ensure fallback values (avoid undefined issues)
      const safeStatus: HealthStatus = {
        backend: !!status?.backend,
        database: !!status?.database,
        ml: !!status?.ml,
      };

      setHealth(safeStatus);
      setLastCheck(new Date());

      const allOnline =
        safeStatus.backend && safeStatus.database && safeStatus.ml;

      if (allOnline) {
        toast.success('All systems operational', {
          description: 'Backend, Database, and ML services are connected.',
        });
      } else {
        toast.warning('Some systems offline', {
          description: 'Check individual service status below.',
        });
      }
    } catch (error) {
      console.error('Health check error:', error);

      toast.error('Health check failed', {
        description: 'Unable to reach backend services.',
      });

      setHealth(initialState);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const runHealthCheck = async () => {
      if (isMounted) await checkHealth();
    };

    runHealthCheck();

    const interval = setInterval(runHealthCheck, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [checkHealth]);

  const getStatusIcon = (status: boolean) =>
    status ? (
      <CheckCircle className="w-5 h-5 text-emerald-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );

  const getStatusBadge = (status: boolean) => (
    <span
      className={`px-3 py-1 border rounded-md text-xs font-bold uppercase tracking-wider ${
        status
          ? 'bg-emerald-900/30 text-emerald-400 border-emerald-600'
          : 'bg-red-900/30 text-red-400 border-red-600'
      }`}
    >
      {status ? 'ONLINE' : 'OFFLINE'}
    </span>
  );

  const allSystemsOnline =
    health.backend && health.database && health.ml;

  return (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 border-2 border-slate-700 rounded-md p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-500" />
          <h3 className="text-xl font-bold text-white uppercase tracking-wide m-0">
            System Health Monitor
          </h3>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 text-emerald-400 border border-emerald-600 rounded-md hover:bg-emerald-900/40 transition-all font-bold text-sm uppercase tracking-wide disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {/* Last Check */}
      {lastCheck && (
        <p className="text-xs text-slate-500 mb-4 font-mono">
          Last checked: {lastCheck.toLocaleTimeString()}
        </p>
      )}

      <div className="space-y-4">
        
        {/* Service Card Component */}
        {[
          {
            name: 'Backend API Server',
            desc: 'Node.js + Express (Port 5000)',
            icon: <Database className="w-5 h-5 text-blue-500" />,
            status: health.backend,
            successText: 'API endpoints reachable',
          },
          {
            name: 'MongoDB Database',
            desc: 'Data persistence layer',
            icon: <Database className="w-5 h-5 text-emerald-500" />,
            status: health.database,
            successText: 'Database connected',
          },
          {
            name: 'ML Prediction Service',
            desc: 'Python Flask AI Engine',
            icon: <Brain className="w-5 h-5 text-purple-500" />,
            status: health.ml,
            successText: 'ML models responding',
          },
        ].map((service, i) => (
          <div
            key={i}
            className="p-4 bg-slate-800/50 border border-slate-700 rounded-md"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {service.icon}
                <div>
                  <p className="text-sm font-bold text-white uppercase">
                    {service.name}
                  </p>
                  <p className="text-xs text-slate-400">{service.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                {getStatusBadge(service.status)}
              </div>
            </div>

            {service.status && (
              <p className="text-xs text-emerald-400 mt-2">
                ✔ {service.successText}
              </p>
            )}
          </div>
        ))}

        {/* Overall Status */}
        <div
          className={`p-4 rounded-md border-2 ${
            allSystemsOnline
              ? 'bg-emerald-900/20 border-emerald-600'
              : 'bg-yellow-900/20 border-yellow-600'
          }`}
        >
          <div className="flex items-start gap-3">
            {allSystemsOnline ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}

            <div>
              <p
                className={`text-sm font-bold uppercase ${
                  allSystemsOnline
                    ? 'text-emerald-400'
                    : 'text-yellow-400'
                }`}
              >
                {allSystemsOnline
                  ? 'All Systems Operational'
                  : 'Demo Mode Active'}
              </p>

              <p className="text-xs text-slate-400">
                {allSystemsOnline
                  ? 'Real-time services fully connected'
                  : 'Running with mock data. Start backend services.'}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {!allSystemsOnline && (
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-md text-xs font-mono text-slate-400">
            <p>1. Backend → cd backend && npm start</p>
            <p>2. MongoDB → start mongod</p>
            <p>3. ML → cd ml-service && python app.py</p>
          </div>
        )}
      </div>
    </div>
  );
}