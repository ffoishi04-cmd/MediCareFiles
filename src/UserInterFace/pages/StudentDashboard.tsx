import { useState, useEffect } from 'react';
import { CommandHeader } from '../components/CommandHeader';
import { CommandStatCard } from '../components/CommandStatCard';
import { MLCommandCard } from '../components/MLCommandCard';
import { AnimatedMLDiagnostic } from '../components/AnimatedMLDiagnostic';
import { EmergencyAlert } from '../components/EmergencyAlert';
import { Calendar, FileText, Phone, Clock, User, Droplet, GraduationCap, MapPin, Shield, AlertCircle, Activity, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI, prescriptionsAPI, mlAPI } from '../services/api';
import { toast } from 'sonner';

interface AppointmentData {
  _id: string;
  doctor: { name: string; department?: string };
  date: string;
  time: string;
  status: string;
}

interface PrescriptionData {
  _id: string;
  doctor: { name: string };
  createdAt: string;
  medications: Array<{ medicine: { name: string }; dosage: string; duration: string }>;
}

export function StudentDashboard() {
  const { user } = useAuth();
  const displayName = user?.name || 'Loading...';
  const displayId = user?.universityId || 'N/A';
  const displayDept = user?.department || 'N/A';

  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [healthRisk, setHealthRisk] = useState<{ riskLevel: 'low' | 'medium' | 'high'; prediction: string; confidence: number; details: string }>({
    riskLevel: 'low',
    prediction: 'Analyzing...',
    confidence: 0,
    details: 'Loading health analysis...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch appointments
        const aptRes = await appointmentsAPI.getAll({ limit: 5 });
        if (aptRes.success) setAppointments(aptRes.data);

        // Fetch prescriptions
        const presRes = await prescriptionsAPI.getAll({ limit: 5 });
        if (presRes.success) setPrescriptions(presRes.data);

        // Analyze Health Risk based on recent prescriptions' diagnoses (simulated history)
        // In a real scenario, we'd fetch actual medical history.
        const riskRes = await mlAPI.predictHealthRisk([], []); // Empty for now, relying on fallback
        if (riskRes.success && riskRes.data) {
           const data = riskRes.data;
           setHealthRisk({
             riskLevel: data.risk_level?.toLowerCase() || 'low',
             prediction: `${data.risk_level} Risk Assessment`,
             confidence: data.confidence || 85,
             details: data.details || 'Analysis complete based on available data.'
           });
        }
      } catch (error: any) {
        toast.error('Failed to load dashboard data: ' + error.message);
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

  const getActivePrescriptionCount = () => {
     // A rough estimate: prescriptions created in the last 14 days
     const twoWeeksAgo = new Date();
     twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
     return prescriptions.filter(p => new Date(p.createdAt) >= twoWeeksAgo).length;
  };

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
      <CommandHeader userRole="STUDENT" userName={displayName} />
      <EmergencyAlert />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Identity Card */}
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-md border-2 border-emerald-600 shadow-2xl shadow-emerald-900/20 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-600 blur-xl opacity-40"></div>
                <div className="relative w-28 h-28 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-md flex items-center justify-center border-2 border-emerald-500">
                  <User className="w-14 h-14 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-3xl font-bold text-white m-0 uppercase tracking-wider">{displayName}</h2>
                  <div className="px-3 py-1 bg-emerald-900/30 border border-emerald-600 rounded text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    VERIFIED
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-400 text-sm uppercase tracking-wide">Student ID: <span className="text-white font-bold font-mono">{displayId}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-red-500" />
                    <span className="text-slate-400 text-sm uppercase tracking-wide">Blood Group: <span className="text-white font-bold">{user?.bloodGroup || 'O+'}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-400 text-sm uppercase tracking-wide">Department: <span className="text-white font-bold">{displayDept}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-400 text-sm uppercase tracking-wide">Contact: <span className="text-white font-bold">+1 234-567-8900</span></span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Status</p>
              <p className="text-xl font-bold text-emerald-400 mb-0 font-mono">ACTIVE</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CommandStatCard 
            title="Total Appointments" 
            value={appointments.length.toString()} 
            icon={Calendar}
            iconColor="text-emerald-500"
            glowColor="emerald"
          />
          <CommandStatCard 
            title="Active Prescriptions" 
            value={getActivePrescriptionCount().toString()} 
            icon={FileText}
            iconColor="text-blue-500"
            glowColor="blue"
          />
          <CommandStatCard 
            title="Emergency Contacts" 
            value="3" 
            icon={Phone}
            iconColor="text-red-500"
            glowColor="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mission Actions */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wide">Quick Access Commands</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex flex-col items-center gap-3 p-6 border-2 border-emerald-600 bg-emerald-900/20 rounded-md hover:bg-emerald-900/30 transition-all group">
                  <Calendar className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white uppercase tracking-wide text-sm">Book Appointment</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-6 border-2 border-blue-600 bg-blue-900/20 rounded-md hover:bg-blue-900/30 transition-all group">
                  <FileText className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white uppercase tracking-wide text-sm">View Records</span>
                </button>
                <Link to="/ambulance" className="flex flex-col items-center gap-3 p-6 border-2 border-red-600 bg-red-900/20 rounded-md hover:bg-red-900/30 transition-all group no-underline">
                  <Phone className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white uppercase tracking-wide text-sm">Emergency Alert</span>
                </Link>
              </div>
            </div>

            {/* Scheduled Appointments */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Recent Appointments</h3>
                <button className="text-sm text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                    <p className="text-slate-400 italic">No recent appointments.</p>
                ) : appointments.map((apt) => (
                  <div key={apt._id} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-md hover:border-emerald-600 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-md flex items-center justify-center border border-emerald-500">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1 uppercase tracking-wide text-sm">{apt.doctor?.name || 'Unassigned'}</h4>
                        <p className="text-sm text-slate-400 mb-0">{apt.doctor?.department || 'General'}</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="font-mono">{formatDate(apt.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">{apt.time}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                      apt.status === 'Confirmed' || apt.status === 'Completed'
                        ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-600' 
                        : apt.status === 'Cancelled' ? 'bg-red-900/30 text-red-400 border border-red-600'
                        : 'bg-yellow-900/30 text-yellow-400 border border-yellow-600'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Prescriptions */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Medical Prescriptions</h3>
                <button className="text-sm text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider">
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                {prescriptions.length === 0 ? (
                    <p className="text-slate-400 italic">No prescriptions found.</p>
                ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Date</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Prescribed By</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Medications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((rx) => (
                      <tr key={rx._id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-slate-400 font-mono text-sm">{formatDate(rx.createdAt)}</td>
                        <td className="py-3 px-4 text-slate-400">{rx.doctor?.name}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {rx.medications.map((m: any, i: number) => (
                            <div key={i} className="text-sm mb-1">
                                <span className="text-white font-bold">{m.medicine?.name || 'Unknown'}</span> - {m.dosage} ({m.duration})
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* ML Interactive Diagnostic Assistant - Animated */}
            <AnimatedMLDiagnostic />

            {/* ML Health Intelligence */}
            <MLCommandCard
              title="Health Risk Assessment"
              prediction={healthRisk.prediction}
              confidence={healthRisk.confidence}
              riskLevel={healthRisk.riskLevel}
              details={healthRisk.details}
            />

            {/* Emergency Command Center */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Emergency Command</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-600 rounded-md hover:bg-red-900/30 transition-colors cursor-pointer" onClick={() => toast.error('Calling 911...')}>
                  <div className="bg-red-600 p-2 rounded-md">
                    <Phone className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-0 uppercase tracking-wide">Emergency Hotline</p>
                    <p className="text-sm text-slate-400 mb-0 font-mono">911 / +1 800-MEDICAL</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-900/20 border border-emerald-600 rounded-md hover:bg-emerald-900/30 transition-colors cursor-pointer">
                  <div className="bg-emerald-600 p-2 rounded-md">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-0 uppercase tracking-wide">Medical Center</p>
                    <p className="text-sm text-slate-400 mb-0 font-mono">+1 234-567-8900</p>
                  </div>
                </div>
                <Link to="/ambulance" className="flex items-center gap-3 p-3 bg-orange-900/20 border border-orange-600 rounded-md hover:bg-orange-900/30 transition-colors no-underline">
                  <div className="bg-orange-600 p-2 rounded-md">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-0 uppercase tracking-wide">Ambulance Dispatch</p>
                    <p className="text-sm text-orange-400 mb-0 font-bold">Request Now →</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Medical Advisory */}
            <div className="bg-linear-to-br from-blue-900/30 to-emerald-900/30 border border-emerald-600 rounded-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-emerald-500" />
                <h4 className="text-lg font-bold text-white uppercase tracking-wide">Health Advisory</h4>
              </div>
              <p className="text-sm text-slate-300 mb-0 leading-relaxed">
                Maintain proper hydration by consuming at least 8 glasses of water daily to support immune system function and overall health.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}