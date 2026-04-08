import { CommandHeader } from '../components/CommandHeader';
import { CommandStatCard } from '../components/CommandStatCard';
import { EmergencyAlert } from '../components/EmergencyAlert';
import { SystemHealthDashboard } from '../components/SystemHealthDashboard';
import { AnimatedMLDiagnostic } from '../components/AnimatedMLDiagnostic';
import { Users, Calendar, Package, Activity, TrendingUp, UserPlus, Settings, Database, Shield, Loader2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, appointmentsAPI, medicinesAPI } from '../services/api';
import { toast } from 'sonner';

export function AdminDashboard() {
  const { user } = useAuth();
  const displayName = user?.name || 'Admin User';

  const [stats, setStats] = useState({ users: 0, appointments: 0, medicines: 0, activeSessions: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Still using mock data for complex charts for now until specialized backend analytical endpoints are built
  const monthlyPatientData = [
    { month: 'JAN', patients: 420, appointments: 380 },
    { month: 'FEB', patients: 520, appointments: 480 },
    { month: 'MAR', patients: 480, appointments: 450 },
    { month: 'APR', patients: 590, appointments: 540 },
    { month: 'MAY', patients: 650, appointments: 610 },
    { month: 'JUN', patients: 720, appointments: 680 },
  ];

  const diseaseTrendData = [
    { disease: 'Viral Infection', count: 145 },
    { disease: 'Allergies', count: 98 },
    { disease: 'Headache', count: 87 },
    { disease: 'Digestive', count: 76 },
    { disease: 'Skin Conditions', count: 54 },
  ];

  const departmentData = [
    { name: 'Computer Science', value: 320 },
    { name: 'Engineering', value: 280 },
    { name: 'Business', value: 190 },
    { name: 'Medicine', value: 240 },
    { name: 'Arts', value: 150 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch users
        const usersRes = await usersAPI.getAll();
        const usersCount = usersRes.success ? (usersRes.data.data?.length || usersRes.data.length || 0) : 0;
        
        let usersData = usersRes.success ? (usersRes.data.data || usersRes.data) : [];
        // Sort to get recent users
        const recent = usersData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

        // Fetch appointments
        const aptsRes = await appointmentsAPI.getAll({});
        const aptsCount = aptsRes.success ? (aptsRes.data.data?.length || aptsRes.data.length || 0) : 0;

        // Fetch medicines
        const medsRes = await medicinesAPI.getAll();
        const medsCount = medsRes.success ? (medsRes.data.data?.length || medsRes.data.length || 0) : 0;

        setStats({
           users: usersCount,
           appointments: aptsCount,
           medicines: medsCount,
           activeSessions: Math.floor(Math.random() * 50) + 10 // Simulating active sessions
        });
        
        setRecentUsers(recent);

      } catch (error: any) {
        toast.error('Failed to load admin dashboard data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
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
      <CommandHeader userRole="SYSTEM ADMINISTRATOR" userName={displayName} />
      <EmergencyAlert />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Command Brief */}
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-md border-2 border-emerald-600 shadow-2xl shadow-emerald-900/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-8 h-8 text-emerald-500" />
                <h2 className="text-3xl font-bold text-white m-0 uppercase tracking-wider">System Command Center</h2>
              </div>
              <p className="text-emerald-400 text-lg uppercase tracking-wide font-semibold">Central Administration | Access Control | Data Intelligence</p>
            </div>
            <div className="items-center gap-4 hidden sm:flex">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-600 rounded-md">
                <Database className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-0">MongoDB</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-400 font-bold">OPERATIONAL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <CommandStatCard 
            title="Total Users" 
            value={stats.users.toString()} 
            icon={Users}
            iconColor="text-emerald-500"
            glowColor="emerald"
          />
          <CommandStatCard 
            title="Appointments" 
            value={stats.appointments.toString()} 
            icon={Calendar}
            iconColor="text-blue-500"
            glowColor="blue"
          />
          <CommandStatCard 
            title="Medicines" 
            value={stats.medicines.toString()} 
            icon={Package}
            iconColor="text-purple-500"
            glowColor="purple"
          />
          <CommandStatCard 
            title="Active Sessions" 
            value={stats.activeSessions.toString()} 
            icon={Activity}
            iconColor="text-orange-500"
            glowColor="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Monthly Intelligence Report */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Monthly Patient Load Analysis</h3>
                <p className="text-sm text-slate-400 uppercase tracking-wider">Patient Visits vs Scheduled Appointments (Historical Simulation)</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyPatientData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Line 
                    type="monotone" 
                    dataKey="patients" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="TOTAL PATIENTS"
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="appointments" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="APPOINTMENTS"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Disease Trend Intelligence */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Disease Trend Analysis</h3>
                <p className="text-sm text-slate-400 uppercase tracking-wider">Most Common Diagnoses - Last 30 Days</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={diseaseTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="disease" stroke="#94a3b8" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* User Access Log */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Recent User Registrations</h3>
                <button className="text-sm text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider">
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-700">
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Name</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Role</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Email</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Joined</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u: any) => (
                      <tr key={u._id || Math.random()} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-bold text-white">{u.name}</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold text-sm">{u.role}</td>
                        <td className="py-3 px-4 text-slate-400">{u.email}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-sm">{formatDate(u.createdAt)}</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-600 rounded-md text-xs font-bold uppercase tracking-wider">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* ML Predictive Intelligence */}
            <div className="bg-linear-to-br from-purple-900/30 to-blue-900/30 border-2 border-purple-600 rounded-md p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <h4 className="text-lg font-bold text-white uppercase tracking-wide">ML Predictive Analytics</h4>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-md p-4 border border-purple-700">
                  <p className="text-sm text-purple-300 mb-1 uppercase tracking-wider font-semibold">Next Month Load</p>
                  <p className="text-3xl font-bold mb-0 text-white font-mono">↑ 15%</p>
                  <p className="text-xs text-purple-400 mt-1 uppercase tracking-wide">Predicted Increase</p>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-md p-4 border border-purple-700">
                  <p className="text-sm text-purple-300 mb-1 uppercase tracking-wider font-semibold">Peak Hours</p>
                  <p className="text-3xl font-bold mb-0 text-white font-mono">10 AM - 2 PM</p>
                  <p className="text-xs text-purple-400 mt-1 uppercase tracking-wide">Busiest Time Slots</p>
                </div>
              </div>
            </div>

            {/* Department Distribution */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Department Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string, percent: number }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry: { name: string; value: number }, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* System Commands */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">System Commands</h4>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-900/30 text-emerald-400 border border-emerald-600 rounded-md hover:bg-emerald-900/40 transition-all font-bold text-sm uppercase tracking-wide">
                  <UserPlus className="w-5 h-5" />
                  Add User
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-900/30 text-blue-400 border border-blue-600 rounded-md hover:bg-blue-900/40 transition-all font-bold text-sm uppercase tracking-wide">
                  <Settings className="w-5 h-5" />
                  System Config
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-900/30 text-purple-400 border border-purple-600 rounded-md hover:bg-purple-900/40 transition-all font-bold text-sm uppercase tracking-wide">
                  <Activity className="w-5 h-5" />
                  View Logs
                </button>
              </div>
            </div>

            {/* ML Predictive Diagnostics - Animated */}
            <AnimatedMLDiagnostic />

            {/* System Health Monitor - Real Backend Testing */}
            <SystemHealthDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}