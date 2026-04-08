import { Link } from 'react-router';
import { Shield, Database, Lock, Activity, Calendar, Pill, Ambulance, Brain, FileText, Users } from 'lucide-react';

export function LandingPage() {
  const features = [
    {
      icon: FileText,
      title: 'Secure Digital Medical Records',
      description: 'MongoDB-powered encrypted health records with military-grade security'
    },
    {
      icon: Lock,
      title: 'Role-Based Access Control',
      description: 'Hierarchical authentication system with strict permission management'
    },
    {
      icon: Pill,
      title: 'Pharmacy & Inventory Command',
      description: 'Real-time medicine tracking with predictive restocking intelligence'
    },
    {
      icon: Ambulance,
      title: 'Emergency & Ambulance Dispatch',
      description: 'Mission-critical emergency response coordination system'
    },
    {
      icon: Brain,
      title: 'ML-Powered Health Intelligence',
      description: 'AI-assisted diagnostics and predictive health risk assessment'
    },
    {
      icon: Database,
      title: 'Scalable Data Infrastructure',
      description: 'MongoDB database architecture for reliable healthcare data management'
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex justify-between items-center mb-20 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600 blur-xl opacity-50"></div>
              <div className="relative bg-linear-to-br from-emerald-600 to-emerald-700 p-3 rounded-md border border-emerald-500 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="border-l-2 border-slate-700 pl-4">
              <h1 className="text-2xl font-bold text-white m-0 tracking-wider">MediCare</h1>
              <p className="text-xs text-emerald-400 m-0 uppercase tracking-widest font-semibold">Medical Command System</p>
            </div>
          </div>
          <Link 
            to="/login" 
            className="px-8 py-3 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-md hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold uppercase tracking-wider text-sm border border-emerald-500 shadow-lg hover:shadow-emerald-900/50 no-underline"
          >
            Secure Login
          </Link>
        </nav>

        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <div className="inline-flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm border border-emerald-600 px-6 py-3 rounded-md mb-8">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Classified Access Required</span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
            BAUET<br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-emerald-600">
              MEDICAL CENTER MANAGEMENT SYSTEM
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            A healthcare command platform featuring AI-powered intelligence.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              to="/login" 
              className="px-10 py-4 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-md hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold text-lg shadow-2xl hover:shadow-emerald-900/50 border border-emerald-500 uppercase tracking-wide no-underline"
            >
              Access System
            </Link>
            <button className="px-10 py-4 bg-slate-800 text-white border-2 border-slate-700 rounded-md hover:border-emerald-600 hover:bg-slate-800/80 transition-all font-bold text-lg uppercase tracking-wide">
              Learn More
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-24">
          <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-8 text-center hover:border-emerald-600 transition-all">
            <div className="text-5xl font-bold text-emerald-500 mb-2 font-mono">5000+</div>
            <p className="text-slate-400 mb-0 uppercase tracking-wider text-sm font-semibold">Active Personel</p>
          </div>
          <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-8 text-center hover:border-emerald-600 transition-all">
            <div className="text-5xl font-bold text-emerald-500 mb-2 font-mono">1</div>
            <p className="text-slate-400 mb-0 uppercase tracking-wider text-sm font-semibold">Medical Officers</p>
          </div>
          <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-8 text-center hover:border-emerald-600 transition-all">
            <div className="text-5xl font-bold text-emerald-500 mb-2 font-mono">24/7</div>
            <p className="text-slate-400 mb-0 uppercase tracking-wider text-sm font-semibold">Emergency Ready</p>
          </div>
          <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-8 text-center hover:border-emerald-600 transition-all">
            <div className="text-5xl font-bold text-emerald-500 mb-2 font-mono">98%</div>
            <p className="text-slate-400 mb-0 uppercase tracking-wider text-sm font-semibold">Mission Success</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">CORE SYSTEMS</h2>
            <div className="w-24 h-1 bg-linear-to-r from-transparent via-emerald-500 to-transparent mx-auto mb-6"></div>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              AI Powered Intelligence meets healthcare excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-8 hover:border-emerald-600 transition-all group"
              >
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-emerald-600 blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative bg-slate-800 w-16 h-16 rounded-md flex items-center justify-center border border-slate-700 group-hover:border-emerald-600 transition-colors">
                    <feature.icon className="w-8 h-8 text-emerald-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide">{feature.title}</h3>
                <p className="text-slate-400 mb-0 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Access Section */}
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-md border-2 border-emerald-600 shadow-2xl shadow-emerald-900/20 p-12 text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-emerald-500" />
            <h2 className="text-4xl font-bold text-white m-0 tracking-tight">SECURE ACCESS CONTROL</h2>
          </div>
          <p className="text-lg mb-10 text-slate-400 max-w-3xl mx-auto">
            Hierarchical role-based authentication with encrypted credentials and session management
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-md p-6 border border-slate-700 hover:border-emerald-600 transition-all">
              <div className="text-3xl font-bold text-emerald-500 mb-2 font-mono">STUDENT</div>
              <p className="text-sm text-slate-400 mb-0 uppercase tracking-wide">Personel Access</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-md p-6 border border-slate-700 hover:border-emerald-600 transition-all">
              <div className="text-3xl font-bold text-emerald-500 mb-2 font-mono">DOCTOR</div>
              <p className="text-sm text-slate-400 mb-0 uppercase tracking-wide">Medical Officer</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-md p-6 border border-slate-700 hover:border-emerald-600 transition-all">
              <div className="text-3xl font-bold text-emerald-500 mb-2 font-mono">PHARMACIST</div>
              <p className="text-sm text-slate-400 mb-0 uppercase tracking-wide">Inventory Control</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-md p-6 border border-slate-700 hover:border-emerald-600 transition-all">
              <div className="text-3xl font-bold text-emerald-500 mb-2 font-mono">ADMIN</div>
              <p className="text-sm text-slate-400 mb-0 uppercase tracking-wide">Command Center</p>
            </div>
          </div>
        </div>



        {/* Footer */}
        <footer className="text-center py-8 border-t border-slate-800">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-emerald-500" />
            <span className="font-bold text-white uppercase tracking-wider text-lg">MEDICARE</span>
          </div>
          <p className="text-sm text-slate-400 mb-0">
            © 2026 MediCare - BAUET Medical Center Management System
          </p>
          <p className="text-xs text-slate-500 mt-2 mb-0 uppercase tracking-wider">
            18th Batch | Computer Science and Engineering Department
          </p>
        </footer>
      </div>
    </div>
  );
}

