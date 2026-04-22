import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Shield, Lock, Mail, User, Key, Database, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";
import { motion } from 'framer-motion';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register, mockLogin, backendOnline } = useAuth();

  const getRoleDashboard = (r: string) => {
    switch (r) {
      case 'student': return '/student-dashboard';
      case 'doctor': return '/doctor-dashboard';
      case 'pharmacist': return '/pharmacy-dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/student-dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          navigate(getRoleDashboard(role));
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        const result = await register({
          name,
          email,
          password,
          role,
          universityId: universityId || undefined
        });
        if (result.success) {
          navigate(getRoleDashboard(role));
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    mockLogin(role);
    navigate(getRoleDashboard(role));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl grid md:grid-cols-2 gap-0 bg-linear-to-br from-slate-900 to-slate-800 rounded-md border-2 border-emerald-600 shadow-2xl shadow-emerald-900/20 overflow-hidden"
      >
        {/* Left Side - Security Branding */}
        <div className="bg-linear-to-br from-slate-950 to-slate-900 p-12 flex flex-col justify-center border-r border-slate-700">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10"
          >
            <div className="relative inline-block mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-600 blur-2xl"
              />
              <div className="relative bg-linear-to-br from-emerald-600 to-emerald-700 p-4 rounded-md border border-emerald-500 shadow-lg inline-block">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Shield className="w-12 h-12 text-white" />
                </motion.div>
              </div>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white mb-2 uppercase tracking-wider"
            >
              MEDICARE
            </motion.h2>
            <p className="text-sm text-emerald-400 uppercase tracking-widest font-semibold">Secure Access System</p>
          </motion.div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-white uppercase tracking-tight">Authorization Required</h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Access the medical command center with verified credentials and role-based clearance.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-md">
              <div className="bg-emerald-600/20 p-2 rounded-md mt-1 border border-emerald-600/50">
                <Lock className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-white uppercase tracking-wide text-sm">JWT Authentication</h4>
                <p className="text-sm text-slate-400 mb-0">Encrypted token-based session management</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-md">
              <div className="bg-emerald-600/20 p-2 rounded-md mt-1 border border-emerald-600/50">
                <Database className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-white uppercase tracking-wide text-sm">MongoDB Infrastructure</h4>
                <p className="text-sm text-slate-400 mb-0">Secure & scalable data architecture</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-md">
              <div className="bg-emerald-600/20 p-2 rounded-md mt-1 border border-emerald-600/50">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-white uppercase tracking-wide text-sm">Role-Based Access</h4>
                <p className="text-sm text-slate-400 mb-0">Hierarchical permission control system</p>
              </div>
            </div>
          </div>

          {/* Backend Status Indicator */}
          <div className={`mt-8 p-4 rounded-md border ${backendOnline ? 'bg-emerald-900/20 border-emerald-600' : 'bg-yellow-900/20 border-yellow-600'}`}>
            <div className="flex items-center gap-3">
              {backendOnline ? (
                <>
                  <Wifi className="w-5 h-5 text-emerald-500" />
                  <div>
                    <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Backend Connected</span>
                    <p className="text-xs text-slate-400 mb-0 mt-1">Express + MongoDB Operational</p>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-yellow-500" />
                  <div>
                    <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Demo Mode</span>
                    <p className="text-xs text-slate-400 mb-0 mt-1">Backend offline - using mock data</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-12 bg-slate-900/50">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-wide">
              {isLogin ? 'System Access' : 'New Registration'}
            </h2>
            <p className="text-slate-400">
              {isLogin 
                ? 'Enter your secure credentials to access the system' 
                : 'Register for system access (Admin approval required)'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-400 mb-0">{error}</p>
                {error.includes('Backend') && (
                  <button 
                    onClick={handleDemoAccess}
                    className="text-xs text-yellow-400 hover:text-yellow-300 mt-2 uppercase tracking-wider font-bold"
                  >
                    Continue in Demo Mode →
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
                <Lock className="w-4 h-4 inline mr-2" />
                Access Level
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['student', 'doctor', 'pharmacist', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-4 py-3 rounded-md border-2 transition-all uppercase text-sm font-bold tracking-wide ${
                      role === r
                        ? 'border-emerald-600 bg-emerald-600/20 text-emerald-400'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  placeholder="your.email@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-md focus:outline-none focus:border-emerald-600 text-white placeholder-slate-500 font-mono"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-md focus:outline-none focus:border-emerald-600 text-white placeholder-slate-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">
                    University ID
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="STU-2024-XXXX"
                      value={universityId}
                      onChange={(e) => setUniversityId(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-md focus:outline-none focus:border-emerald-600 text-white placeholder-slate-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Secure Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-md focus:outline-none focus:border-emerald-600 text-white placeholder-slate-500 font-mono"
                  required
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-emerald-600 bg-slate-800 border-slate-700 rounded focus:ring-emerald-600" />
                  <span className="text-sm text-slate-400 uppercase tracking-wide">Remember Session</span>
                </label>
                <button type="button" className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold">
                  Reset Access?
                </button>
              </div>
            )}

            {!isLogin && (
              <div className="p-3 bg-yellow-900/20 border border-yellow-600 rounded-md flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-400 mb-0">
                  Registration requires admin approval. Access will be granted within 24-48 hours.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-md hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold uppercase tracking-wider border border-emerald-500 shadow-lg hover:shadow-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : isLogin ? 'Access System' : 'Submit Registration'}
            </button>

            {/* Demo Mode Access */}
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full bg-slate-800 text-slate-300 py-3 rounded-md hover:bg-slate-700 transition-all font-bold uppercase tracking-wider border-2 border-slate-700 hover:border-yellow-600"
            >
              Demo Access ({role})
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-slate-400 hover:text-emerald-400 uppercase tracking-wide"
            >
              {isLogin ? "Need Access? " : "Already Registered? "}
              <span className="text-emerald-400 font-bold">
                {isLogin ? 'Request Registration' : 'System Login'}
              </span>
            </button>
          </div>

          <Link to="/" className="block text-center mt-6 text-sm text-slate-500 hover:text-slate-400 no-underline uppercase tracking-wider">
            ← Return to Main
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
