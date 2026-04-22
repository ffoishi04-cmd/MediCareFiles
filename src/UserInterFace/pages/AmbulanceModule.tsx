import { useState, useEffect } from 'react';
import { CommandHeader } from '../components/CommandHeader';
import { CommandStatCard } from '../components/CommandStatCard';
import { Ambulance, MapPin, Phone, Clock, User, Activity, AlertCircle, Navigation, Shield, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { ambulanceAPI } from "../../services/api";
import { toast } from 'sonner';

export function AmbulanceModule() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const res = await ambulanceAPI.getAll();
      if (res.success) {
        setAmbulances(res.data);
      }
    } catch (error: any) {
      toast.error('Failed to load ambulances: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const handleEmergencyRequest = async () => {
    try {
      const res = await ambulanceAPI.requestEmergency({
        location: 'Campus Area',
        emergencyType: 'Medical Emergency',
        priority: 'High'
      });
      if (res.success) {
        toast.success(`Emergency request accepted. Unit ${res.data.assignedUnit || 'dispatched'}.`);
        fetchAmbulances();
      } else {
        toast.error(res.error || 'Failed to dispatch ambulance.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to request emergency services');
    }
  };

  const completeMission = async (id: string) => {
    try {
      const res = await ambulanceAPI.completeMission(id);
      if (res.success) {
        toast.success(`Mission completed for unit.`);
        fetchAmbulances();
      }
    } catch (error: any) {
      toast.error('Failed to complete mission: ' + error.message);
    }
  };

  const dispatchManually = async (id: string) => {
    try {
      const res = await ambulanceAPI.dispatch(id, {
         patient: 'Emergency Dispatch',
         pickup: 'Campus Location',
         emergencyType: 'Code Red',
         priority: 'High'
      });
      if (res.success) {
        toast.success('Ambulance dispatched manually.');
        fetchAmbulances();
      }
    } catch (error: any) {
      toast.error('Failed to dispatch unit: ' + error.message);
    }
  };

  // Generate emergency requests from active missions
  const emergencyRequests = ambulances
    .filter(a => a.status === 'On Mission')
    .map(amb => ({
      id: amb._id || Math.random(),
      patient: amb.currentMission?.patient || 'Unknown Patient',
      studentId: amb.currentMission?.studentId || 'N/A',
      location: amb.currentMission?.pickup || 'Unknown Location',
      emergency: amb.currentMission?.emergencyType || 'Medical Emergency',
      time: new Date(amb.currentMission?.dispatchedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Dispatched',
      contact: amb.driver?.contact || 'N/A',
      priority: amb.currentMission?.priority || 'Medium',
      assignedTo: amb.vehicleId,
      ambulanceId: amb._id 
    }));

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Available':
        return { bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-600', icon: 'text-emerald-500' };
      case 'On Mission':
        return { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-600', icon: 'text-blue-500' };
      case 'Maintenance':
        return { bg: 'bg-slate-700', text: 'text-slate-300', border: 'border-slate-600', icon: 'text-slate-500' };
      default:
        return { bg: 'bg-slate-700', text: 'text-slate-300', border: 'border-slate-600', icon: 'text-slate-500' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'High':
        return { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-600', badge: 'bg-red-600' };
      case 'Medium':
        return { bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border-yellow-600', badge: 'bg-yellow-600' };
      case 'Low':
        return { bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-600', badge: 'bg-emerald-600' };
      default:
        return { bg: 'bg-slate-700', text: 'text-slate-300', border: 'border-slate-600', badge: 'bg-slate-600' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
         <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
         <span className="text-red-400 font-mono tracking-widest uppercase">Initializing Emergency Systems...</span>
      </div>
    );
  }

  const availableCount = ambulances.filter(a => a.status === 'Available').length;
  const missionCount = ambulances.filter(a => a.status === 'On Mission').length;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      <CommandHeader userRole="EMERGENCY SERVICES" userName="Admin Command" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Command Banner */}
        <div className="bg-linear-to-r from-red-900 via-red-800 to-red-900 rounded-md border-2 border-red-600 shadow-2xl shadow-red-900/30 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Ambulance className="w-10 h-10 text-white" />
                <h2 className="text-3xl font-bold text-white m-0 uppercase tracking-wider">Emergency Dispatch Command</h2>
              </div>
              <p className="text-red-100 text-lg mb-4 uppercase tracking-wide font-semibold">24/7 Emergency Response | Medical Transportation | Critical Care</p>
              <button onClick={handleEmergencyRequest} className="px-6 py-3 bg-white text-red-600 rounded-md hover:bg-red-50 transition-colors font-bold flex items-center gap-2 uppercase tracking-wide border-2 border-white">
                <Phone className="w-5 h-5" />
                Request Emergency Dispatch
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-md p-6 text-center">
              <p className="text-red-100 text-sm mb-1 uppercase tracking-widest font-semibold">Emergency Hotline</p>
              <p className="text-5xl font-bold mb-0 text-white font-mono">911</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <CommandStatCard 
            title="Available Units" 
            value={availableCount.toString()} 
            icon={Ambulance}
            iconColor="text-emerald-500"
            glowColor="emerald"
          />
          <CommandStatCard 
            title="On Mission" 
            value={missionCount.toString()} 
            icon={Activity}
            iconColor="text-blue-500"
            glowColor="blue"
          />
          <CommandStatCard 
            title="Active Requests" 
            value={emergencyRequests.length.toString()} 
            icon={AlertCircle}
            iconColor="text-red-500"
            glowColor="red"
          />
          <CommandStatCard 
            title="Avg. Response Time" 
            value="4.5 MIN" 
            icon={Clock}
            iconColor="text-orange-500"
            glowColor="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Fleet Status */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wide">Ambulance Fleet Status</h3>
              <div className="grid grid-cols-1 gap-4">
                {ambulances.map((amb: any) => {
                      const config = getStatusConfig(amb.status);
                      const lastServiceStr = amb.lastServiceDate ? new Date(amb.lastServiceDate).toLocaleDateString() : 'Unknown';
                      
                      return (
                        <div 
                          key={amb._id}
                          className={`p-5 bg-slate-800/50 border-2 ${config.border} rounded-md`}
                        >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-md ${config.bg} border ${config.border}`}>
                            <Ambulance className={`w-6 h-6 ${config.icon}`} />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-lg mb-1 uppercase tracking-wider font-mono">{amb.vehicleId}</h4>
                            <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${config.bg} ${config.text} border ${config.border}`}>
                              {amb.status}
                            </span>
                          </div>
                        </div>
                        {amb.status === 'Available' && (
                          <button onClick={() => dispatchManually(amb._id)} className="px-4 py-2 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-md hover:from-emerald-700 hover:to-emerald-800 transition-all text-sm font-bold uppercase tracking-wide border border-emerald-500">
                            Dispatch
                          </button>
                        )}
                        {amb.status === 'On Mission' && (
                          <button onClick={() => completeMission(amb._id)} className="px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-bold uppercase tracking-wide border border-blue-500">
                            Complete Mission
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-slate-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0 uppercase tracking-wider font-semibold">Driver</p>
                            <p className="text-sm font-bold text-white mb-0">{amb.driver?.name || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-slate-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0 uppercase tracking-wider font-semibold">Contact</p>
                            <p className="text-sm font-bold text-white mb-0 font-mono">{amb.driver?.contact || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0 uppercase tracking-wider font-semibold">Location</p>
                            <p className="text-sm font-bold text-white mb-0">{amb.currentLocation || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-slate-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0 uppercase tracking-wider font-semibold">Last Service</p>
                            <p className="text-sm font-bold text-white mb-0 font-mono">{lastServiceStr}</p>
                          </div>
                        </div>
                      </div>

                      {amb.currentMission && amb.status === 'On Mission' && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <div className="flex items-center gap-2 text-blue-400">
                            <Activity className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wide">Active Mission: {amb.currentMission.patient || 'Unknown'} - {amb.currentMission.pickup || 'Unknown Location'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {ambulances.length === 0 && (
                  <p className="text-slate-400 italic">No ambulances available in fleet.</p>
                )}
              </div>
            </div>

            {/* Emergency Request Queue */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Active Missions View</h3>
                <span className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-600 rounded-md text-sm font-bold uppercase tracking-wider">
                  {emergencyRequests.length} ACTIVE
                </span>
              </div>

              <div className="space-y-4">
                {emergencyRequests.map((req: any) => {
                  const config = getPriorityConfig(req.priority);
                  return (
                    <div 
                      key={req.id}
                      className={`p-5 rounded-md border-2 ${config.border} ${config.bg}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-white text-lg uppercase tracking-wide">{req.patient}</h4>
                            <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white ${config.badge}`}>
                              {req.priority} PRIORITY
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mb-0 font-mono">ID: {req.studentId}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-900/30 text-blue-400 border border-blue-600`}>
                            {req.status}
                          </span>
                          <p className="text-xs text-slate-500 mt-2 mb-0 font-mono">{req.time}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0 uppercase tracking-wider font-semibold">Emergency Type</p>
                            <p className="text-sm font-bold text-white mb-0">{req.emergency}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0 uppercase tracking-wider font-semibold">Location</p>
                            <p className="text-sm font-bold text-white mb-0">{req.location}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0 uppercase tracking-wider font-semibold">Contact</p>
                            <p className="text-sm font-bold text-white mb-0 font-mono">{req.contact}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Ambulance className="w-4 h-4 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500 mb-0 uppercase tracking-wider font-semibold">Assigned Unit</p>
                            <p className="text-sm font-bold text-blue-400 mb-0 font-mono">{req.assignedTo}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                         <button onClick={() => completeMission(req.ambulanceId)} className="flex-1 px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 border border-blue-500">
                           <Navigation className="w-4 h-4" />
                           Complete Unit Mission
                         </button>
                      </div>
                    </div>
                  );
                })}
                {emergencyRequests.length === 0 && (
                   <p className="text-slate-400 italic">No active missions or emergency requests.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emergency Commands */}
            <div className="bg-linear-to-br from-red-900/30 to-red-900/20 border-2 border-red-600 rounded-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-red-500" />
                <h4 className="text-lg font-bold text-white uppercase tracking-wide">Emergency Commands</h4>
              </div>
              <div className="space-y-3">
                <button onClick={handleEmergencyRequest} className="w-full px-4 py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-md hover:from-red-700 hover:to-red-800 transition-all font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 border border-red-500">
                  <Phone className="w-5 h-5" />
                  Request Unit (Simulate)
                </button>
                <button className="w-full px-4 py-3 bg-linear-to-r from-orange-600 to-orange-700 text-white rounded-md hover:from-orange-700 hover:to-orange-800 transition-all font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 border border-orange-500">
                  <AlertCircle className="w-5 h-5" />
                  Broadcast Alert
                </button>
                <button className="w-full px-4 py-3 border-2 border-red-700 text-white rounded-md hover:bg-red-900/30 transition-all font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Campus Map
                </button>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Emergency Contacts</h4>
              <div className="space-y-3">
                <div className="p-3 bg-red-900/20 border border-red-600 rounded-md">
                  <p className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Emergency Services</p>
                  <p className="text-2xl font-bold text-red-400 mb-0 font-mono">911</p>
                </div>
                <div className="p-3 bg-emerald-900/20 border border-emerald-600 rounded-md">
                  <p className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Medical Center</p>
                  <p className="text-sm text-slate-300 mb-0 font-mono">+1 234-567-8900</p>
                </div>
                <div className="p-3 bg-blue-900/20 border border-blue-600 rounded-md">
                  <p className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Campus Security</p>
                  <p className="text-sm text-slate-300 mb-0 font-mono">+1 234-567-8999</p>
                </div>
                <div className="p-3 bg-purple-900/20 border border-purple-600 rounded-md">
                  <p className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Mental Health</p>
                  <p className="text-sm text-slate-300 mb-0 font-mono">+1 800-273-8255</p>
                </div>
              </div>
            </div>

            {/* Response Statistics */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Today's Statistics</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Responses</span>
                    <span className="text-lg font-bold text-white font-mono">12</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-sm h-2 border border-slate-700">
                    <div className="bg-emerald-600 h-full rounded-sm" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Avg Response</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">4.5 MIN</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-sm h-2 border border-slate-700">
                    <div className="bg-emerald-600 h-full rounded-sm" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Success Rate</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">100%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-sm h-2 border border-slate-700">
                    <div className="bg-emerald-600 h-full rounded-sm" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <Link to="/admin-dashboard" className="block w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-md hover:border-emerald-600 transition-all font-bold text-sm text-center no-underline uppercase tracking-wide">
              ← Return to Command
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
