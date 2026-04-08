// ============================================================
// System Health Dashboard - Backend & ML Service Testing
// Real-time connectivity and integration testing
// ============================================================

import { useState, useEffect } from 'react';
import { Database, Activity, Brain, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { checkBackendHealth, mlAPI } from '../services/api';
import { toast } from 'sonner';

interface HealthStatus {
  backend: boolean;
  database: boolean;
  ml: boolean;
}

export function SystemHealthDashboard() {
  const [health, setHealth] = useState<HealthStatus>({
    backend: false,
    database: false,
    ml: false,
  });
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const status = await checkBackendHealth();
      setHealth(status);
      setLastCheck(new Date());
      
      const allOnline = status.backend && status.database && status.ml;
      if (allOnline) {
        toast.success('All systems operational', {
          description: 'Backend, Database, and ML services are connected.',
        });
      } else {
        toast.warning('Some systems offline', {
          description: 'Check the status below for details.',
        });
      }
    } catch (error) {
      toast.error('Health check failed', {
        description: 'Unable to connect to backend services.',
      });
      setHealth({ backend: false, database: false, ml: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: boolean) => {
    if (status) {
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    }
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadge = (status: boolean) => {
    if (status) {
      return (
        <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-600 rounded-md text-xs font-bold uppercase tracking-wider">
          ONLINE
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-600 rounded-md text-xs font-bold uppercase tracking-wider">
        OFFLINE
      </span>
    );
  };

  return (
    <div className="bg-linear-to-br from-slate-900 to-slate-800 border-2 border-slate-700 rounded-md p-6">
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

      {lastCheck && (
        <p className="text-xs text-slate-500 mb-4 font-mono">
          Last checked: {lastCheck.toLocaleTimeString()}
        </p>
      )}

      <div className="space-y-4">
        {/* Backend API */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-bold text-white mb-0 uppercase tracking-wide">
                  Backend API Server
                </p>
                <p className="text-xs text-slate-400 mb-0">
                  Node.js + Express (Port 5000)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(health.backend)}
              {getStatusBadge(health.backend)}
            </div>
          </div>
          {health.backend && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <p className="text-xs text-emerald-400 mb-0 flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Authentication & API endpoints accessible
              </p>
            </div>
          )}
        </div>

        {/* MongoDB Database */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-bold text-white mb-0 uppercase tracking-wide">
                  MongoDB Database
                </p>
                <p className="text-xs text-slate-400 mb-0">
                  Data persistence layer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(health.database)}
              {getStatusBadge(health.database)}
            </div>
          </div>
          {health.database && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <p className="text-xs text-emerald-400 mb-0 flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Database connection established
              </p>
            </div>
          )}
        </div>

        {/* ML Service */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-bold text-white mb-0 uppercase tracking-wide">
                  ML Prediction Service
                </p>
                <p className="text-xs text-slate-400 mb-0">
                  Python Flask AI Engine
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(health.ml)}
              {getStatusBadge(health.ml)}
            </div>
          </div>
          {health.ml && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <p className="text-xs text-emerald-400 mb-0 flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Disease prediction models ready
              </p>
            </div>
          )}
        </div>

        {/* Overall Status */}
        <div className={`p-4 rounded-md border-2 ${
          health.backend && health.database && health.ml
            ? 'bg-emerald-900/20 border-emerald-600'
            : 'bg-yellow-900/20 border-yellow-600'
        }`}>
          <div className="flex items-start gap-3">
            {health.backend && health.database && health.ml ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-bold mb-1 uppercase tracking-wide ${
                health.backend && health.database && health.ml
                  ? 'text-emerald-400'
                  : 'text-yellow-400'
              }`}>
                {health.backend && health.database && health.ml
                  ? 'All Systems Operational'
                  : 'Demo Mode Active'}
              </p>
              <p className="text-xs text-slate-400 mb-0">
                {health.backend && health.database && health.ml
                  ? 'Full functionality available with real-time data synchronization'
                  : 'Application running with mock data. Start backend services for full functionality.'}
              </p>
            </div>
          </div>
        </div>

        {/* Connection Instructions */}
        {(!health.backend || !health.database || !health.ml) && (
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-md">
            <p className="text-xs font-bold text-white mb-2 uppercase tracking-wider">
              Quick Start Instructions:
            </p>
            <div className="space-y-2 text-xs text-slate-400 font-mono">
              <p className="mb-0">1. Backend: cd backend && npm install && npm start</p>
              <p className="mb-0">2. Database: Ensure MongoDB is running</p>
              <p className="mb-0">3. ML Service: cd ml-service && pip install -r requirements.txt && python app.py</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



