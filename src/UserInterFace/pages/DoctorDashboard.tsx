import { useState, useEffect } from 'react';
import { CommandHeader } from '../components/CommandHeader';
import { CommandStatCard } from '../components/CommandStatCard';
import { MLCommandCard } from '../components/MLCommandCard';
import { AnimatedMLDiagnostic } from '../components/AnimatedMLDiagnostic';
import { EmergencyAlert } from '../components/EmergencyAlert';
import { Calendar, Users, FileText, Clock, User, Activity, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from "../../contexts/AuthContext";
import { appointmentsAPI, mlAPI } from "../../services/api";
import { toast } from 'sonner';

interface AppointmentData {
  _id: string;
  patient: { name: string; universityId?: string; department?: string; bloodGroup?: string; age?: number };
  date: string;
  time: string;
  status: string;
  symptoms?: string;
  diagnosis?: string;
  notes?: string;
  followUpDate?: string;
}

export function DoctorDashboard() {
  const { user } = useAuth();
  const displayName = user?.name || 'Loading...';
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [diseaseProbability, setDiseaseProbability] = useState<{ riskLevel: 'low' | 'medium' | 'high'; prediction: string; confidence: number; details: string }>({
    riskLevel: 'low',
    prediction: 'Analyzing...',
    confidence: 0,
    details: 'Loading diagnostic analysis...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch appointments
        const aptRes = await appointmentsAPI.getAll({ limit: 10 });
        if (aptRes.success) {
            setAppointments(aptRes.data || []);
        }

        // ML Diagnostic Analysis (Simulated for upcoming appointments)
        const diagRes = await mlAPI.predictHealthRisk([], []); // Fallback forecast
        if (diagRes.success && diagRes.data) {
           const data = diagRes.data;
           setDiseaseProbability({
             riskLevel: data.trend === 'increasing' ? 'high' : (data.risk_level?.toLowerCase() as 'low' | 'medium' | 'high' || 'medium'),
             prediction: `${data.prediction || data.risk_level} Pattern Detected`,
             confidence: data.confidence || 82,
             details: data.details || 'Analysis complete based on preliminary symptoms.'
           });
        }
      } catch (error: any) {
         toast.error('Failed to load doctor data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date).toDateString();
      const today = new Date().toDateString();
      return aptDate === today;
  });

  const getStatusConfig = (status: string) => {
      switch (status) {
          case 'Completed': return 'bg-emerald-900/30 text-emerald-400 border border-emerald-600';
          case 'In Progress': return 'bg-blue-900/30 text-blue-400 border border-blue-600';
          case 'Cancelled': return 'bg-red-900/30 text-red-400 border border-red-600';
          default: return 'bg-slate-700 text-slate-300 border border-slate-600';
      }
  };

  const patientRecords = appointments.filter(apt => apt.status === 'Completed' || apt.status === 'In Progress');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
         <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
         <span className="text-emerald-400 font-mono tracking-widest uppercase">Initializing Interface...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      <CommandHeader userRole="MEDICAL OFFICER" userName={displayName} />
      <EmergencyAlert />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Command Brief */}
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-md border-2 border-emerald-600 shadow-2xl shadow-emerald-900/20 p-8 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-emerald-500" />
            <h2 className="text-3xl font-bold text-white m-0 uppercase tracking-wider">Medical Command Dashboard</h2>
          </div>
          <p className="text-emerald-400 text-lg uppercase tracking-wide font-semibold">{todayAppointments.length} Missions Scheduled | Priority Operations Active</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <CommandStatCard 
            title="Today's Missions" 
            value={todayAppointments.length.toString()} 
            icon={Calendar}
            iconColor="text-emerald-500"
            glowColor="emerald"
          />
          <CommandStatCard 
            title="Total Patients" 
            value="156" 
            icon={Users}
            iconColor="text-blue-500"
            glowColor="blue"
          />
          <CommandStatCard 
            title="Prescriptions Issued" 
            value="89" 
            icon={FileText}
            iconColor="text-purple-500"
            glowColor="purple"
          />
          <CommandStatCard 
            title="Avg. Consultation" 
            value="25 MIN" 
            icon={Clock}
            iconColor="text-orange-500"
            glowColor="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mission Schedule */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wide">Today's Mission Schedule</h3>
              <div className="space-y-4">
                {todayAppointments.length === 0 ? (
                    <p className="text-slate-400 italic">No missions scheduled for today.</p>
                ) : (
                todayAppointments.map((apt) => (
                  <div 
                    key={apt._id} 
                    className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-md hover:border-emerald-600 transition-all cursor-pointer"
                    onClick={() => setSelectedPatient(apt._id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-md flex items-center justify-center border border-emerald-500">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1 uppercase tracking-wide text-sm">{apt.patient?.name || 'Unknown Patient'}</h4>
                        <p className="text-sm text-slate-400 mb-0 font-mono">ID: {apt.patient?.universityId || 'N/A'} • {apt.patient?.department || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-mono">{apt.time}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusConfig(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                      <button className="px-4 py-2 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-md hover:from-emerald-700 hover:to-emerald-800 transition-all text-sm font-bold uppercase tracking-wide border border-emerald-500">
                        Access
                      </button>
                    </div>
                  </div>
                )))}
              </div>
            </div>

            {/* Patient Medical Records */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wide">Recent Consultations</h3>
              <div className="space-y-6">
                {patientRecords.length === 0 ? (
                    <p className="text-slate-400 italic">No recent consultations on record.</p>
                ) : (
                patientRecords.map((apt) => (
                  <div key={apt._id} className="p-5 bg-slate-800/50 border border-slate-700 rounded-md">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-white text-lg mb-1 uppercase tracking-wide">{apt.patient?.name || 'Unknown Patient'}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-400 font-mono">
                          <span>AGE: {apt.patient?.age || 'N/A'}</span>
                          <span>•</span>
                          <span>BLOOD: {apt.patient?.bloodGroup || 'N/A'}</span>
                          <span>•</span>
                          <span>{apt.patient?.department?.toUpperCase() || 'N/A'}</span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">VISIT: {formatDate(apt.date)}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Symptoms</p>
                        <p className="text-sm text-white mb-0">{apt.symptoms || 'None recorded'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Diagnosis</p>
                        <p className="text-sm text-white mb-0">{apt.diagnosis || 'Pending diagnosis'}</p>
                      </div>
                    </div>
                  </div>
                )))}
              </div>
            </div>

            {/* Digital Prescription Command */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wide">Digital Prescription Panel</h3>
              <form className="space-y-4" onSubmit={(e: React.FormEvent) => { e.preventDefault(); toast.success('Prescription issued successfully'); }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Patient Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:border-emerald-600 text-white"
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Student ID</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:border-emerald-600 text-white font-mono"
                      placeholder="STU-2024-XXXX"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Diagnosis</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:border-emerald-600 text-white"
                    placeholder="Enter diagnosis"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Medications</label>
                  <textarea 
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:border-emerald-600 text-white"
                    rows={3}
                    placeholder="List medications with dosage and instructions"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Duration</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:border-emerald-600 text-white"
                      placeholder="e.g., 7 days"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Follow-up Date</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:border-emerald-600 text-white"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-linear-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-md hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold uppercase tracking-wider border border-emerald-500"
                >
                  Issue Prescription
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* ML Diagnostic Decision Support - Animated */}
            <AnimatedMLDiagnostic />

            {/* ML Intelligence Report */}
            <MLCommandCard
              title="Disease Probability Analysis"
              prediction={diseaseProbability.prediction}
              confidence={diseaseProbability.confidence}
              riskLevel={diseaseProbability.riskLevel}
              details={diseaseProbability.details}
            />

            {/* Weekly Activity */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Weekly Activity</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Consultations</span>
                    <span className="text-lg font-bold text-white font-mono">{appointments.length}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-sm h-2 border border-slate-700">
                    <div className="bg-emerald-600 h-full rounded-sm" style={{ width: `${Math.min((appointments.length / 50) * 100, 100)}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Prescriptions</span>
                    <span className="text-lg font-bold text-white font-mono">18</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-sm h-2 border border-slate-700">
                    <div className="bg-blue-600 h-full rounded-sm" style={{ width: '60%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Follow-ups</span>
                    <span className="text-lg font-bold text-white font-mono">12</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-sm h-2 border border-slate-700">
                    <div className="bg-purple-600 h-full rounded-sm" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Alerts */}
            <div className="bg-linear-to-br from-red-900/30 to-red-900/20 border-2 border-red-600 rounded-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h4 className="text-lg font-bold text-white uppercase tracking-wide">Priority Alerts</h4>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-900/50 border border-red-700 rounded-md">
                  <p className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Critical Patient</p>
                  <p className="text-xs text-slate-400 mb-0">Patient #2156 requires immediate attention</p>
                </div>
                <div className="p-3 bg-slate-900/50 border border-red-700 rounded-md">
                  <p className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Lab Results Ready</p>
                  <p className="text-xs text-slate-400 mb-0">3 lab reports pending review</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}