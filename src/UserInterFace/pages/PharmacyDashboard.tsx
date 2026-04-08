import { useState, useEffect } from 'react';
import { CommandHeader } from '../components/CommandHeader';
import { CommandStatCard } from '../components/CommandStatCard';
import { MLCommandCard } from '../components/MLCommandCard';
import { AnimatedMLDiagnostic } from '../components/AnimatedMLDiagnostic';
import { EmergencyAlert } from '../components/EmergencyAlert';
import { Package, AlertTriangle, TrendingUp, Activity, Search, Database, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { medicinesAPI, mlAPI } from '../services/api';
import { toast } from 'sonner';

interface MedicineData {
  _id: string;
  name: string;
  category: string;
  stock: number;
  reorderLevel: number;
  expiryDate: string;
}

export function PharmacyDashboard() {
  const { user } = useAuth();
  const displayName = user?.name || 'Loading...';
  const [searchTerm, setSearchTerm] = useState('');
  
  const [inventory, setInventory] = useState<MedicineData[]>([]);
  const [demandForecast, setDemandForecast] = useState<{ riskLevel: 'low' | 'medium' | 'high'; prediction: string; confidence: number; details: string }>({
    riskLevel: 'low',
    prediction: 'Analyzing...',
    confidence: 0,
    details: 'Loading demand analysis...'
  });
  const [loading, setLoading] = useState(true);

  // Mock distribution history for now as backend distribution log endpoint might not exist yet
  const distributionHistory: any[] = [
    { id: 1, medicine: 'Amoxicillin 500mg', patient: 'John Smith', studentId: 'STU-2024-1234', quantity: 21, date: '2026-02-08', prescribedBy: 'Dr. Johnson' },
    { id: 2, medicine: 'Paracetamol 500mg', patient: 'Emma Wilson', studentId: 'STU-2024-2156', quantity: 10, date: '2026-02-08', prescribedBy: 'Dr. Chen' },
    { id: 3, medicine: 'Cetirizine 10mg', patient: 'Michael Brown', studentId: 'STU-2024-3421', quantity: 14, date: '2026-02-07', prescribedBy: 'Dr. Johnson' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const medRes = await medicinesAPI.getAll();
        if (medRes.success) {
            setInventory(medRes.data.data || medRes.data);
        }

        // ML Demand Forecast
        const forecastRes = await mlAPI.predictMedicineDemand('General', []); // Fallback forecast
        if (forecastRes.success && forecastRes.data) {
           const data = forecastRes.data;
           setDemandForecast({
             riskLevel: data.trend === 'increasing' ? 'high' : 'low',
             prediction: `${data.prediction} Demand Forecasting`,
             confidence: data.confidence || 80,
             details: data.details || 'Analysis complete based on historical distribution.'
           });
        }
      } catch (error: any) {
         toast.error('Failed to load pharmacy data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStockStatusConfig = (stock: number, reorderLevel: number) => {
    if (stock <= 0) {
        return { label: 'Out of Stock', bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-600' };
    } else if (stock <= reorderLevel) {
        return { label: 'Critical', bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-600' };
    } else if (stock <= reorderLevel * 1.5) {
        return { label: 'Low Stock', bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border-yellow-600' };
    }
    return { label: 'In Stock', bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-600' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const filteredInventory = inventory.filter((item: MedicineData) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter((item: MedicineData) => item.stock <= item.reorderLevel * 1.5).slice(0, 3);
  const expiringItems = inventory.filter((item: MedicineData) => {
    const expiryDate = new Date(item.expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow;
  }).length;

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
      <CommandHeader userRole="PHARMACY OFFICER" userName={displayName} />
      <EmergencyAlert />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Command Brief */}
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-md border-2 border-emerald-600 shadow-2xl shadow-emerald-900/20 p-8 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-8 h-8 text-emerald-500" />
            <h2 className="text-3xl font-bold text-white m-0 uppercase tracking-wider">Pharmacy Operations Command</h2>
          </div>
          <p className="text-emerald-400 text-lg uppercase tracking-wide font-semibold">Inventory Management | Distribution Control | Supply Intelligence</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <CommandStatCard 
            title="Total Medicines" 
            value={inventory.length.toString()} 
            icon={Package}
            iconColor="text-emerald-500"
            glowColor="emerald"
          />
          <CommandStatCard 
            title="Low Stock Items" 
            value={lowStockItems.length.toString()} 
            icon={AlertTriangle}
            iconColor="text-yellow-500"
            glowColor="yellow"
          />
          <CommandStatCard 
            title="Distributed Today" 
            value="15" 
            icon={TrendingUp}
            iconColor="text-blue-500"
            glowColor="blue"
          />
          <CommandStatCard 
            title="Expiring Soon" 
            value={expiringItems.toString()} 
            icon={Activity}
            iconColor="text-red-500"
            glowColor="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Medicine Inventory Command */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Medicine Inventory</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:border-emerald-600 w-64 text-white placeholder-slate-500"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {filteredInventory.length === 0 ? (
                    <p className="text-slate-400 italic">No inventory matched query.</p>
                ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-700">
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Medicine</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Category</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Stock</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Expiry</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Status</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item: MedicineData) => {
                      const config = getStockStatusConfig(item.stock, item.reorderLevel);
                      return (
                        <tr key={item._id} className="border-b border-slate-800 hover:bg-slate-800/50">
                          <td className="py-3 px-4 font-bold text-white">{item.name}</td>
                          <td className="py-3 px-4 text-slate-400 text-sm">{item.category}</td>
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-bold text-white font-mono">{item.stock}</span>
                              <span className="text-xs text-slate-500 ml-1">/ {item.reorderLevel}</span>
                            </div>
                            <div className="w-24 bg-slate-800 rounded-sm h-1.5 mt-1 border border-slate-700">
                              <div 
                                className={`h-full rounded-sm ${
                                  item.stock < item.reorderLevel ? 'bg-red-600' : 'bg-emerald-600'
                                }`}
                                style={{ width: `${Math.min((item.stock / item.reorderLevel) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-sm font-mono">{formatDate(item.expiryDate)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${config.bg} ${config.text} border ${config.border}`}>
                              {config.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button className="text-emerald-400 hover:text-emerald-300 text-sm font-bold uppercase tracking-wide">
                              Update
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                )}
              </div>
            </div>

            {/* Distribution Log */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Distribution History</h3>
                <button className="text-sm text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider">
                  View All
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-700">
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Medicine</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Patient</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">ID</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Qty</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Date</th>
                      <th className="text-left py-3 px-4 font-bold text-slate-400 uppercase tracking-wider text-xs">Officer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributionHistory.map((item: { id: number; medicine: string; patient: string; studentId: string; quantity: number; date: string; prescribedBy: string }) => (
                      <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-bold text-white">{item.medicine}</td>
                        <td className="py-3 px-4 text-slate-400">{item.patient}</td>
                        <td className="py-3 px-4 text-slate-400 text-sm font-mono">{item.studentId}</td>
                        <td className="py-3 px-4 text-white font-bold font-mono">{item.quantity}</td>
                        <td className="py-3 px-4 text-slate-400 text-sm font-mono">{item.date}</td>
                        <td className="py-3 px-4 text-slate-400">{item.prescribedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* ML Demand Forecasting - Animated */}
            <AnimatedMLDiagnostic />

            {/* ML Intelligence */}
            <MLCommandCard
              title="Demand Forecast Intelligence"
              prediction={demandForecast.prediction}
              confidence={demandForecast.confidence}
              riskLevel={demandForecast.riskLevel}
              details={demandForecast.details}
            />

            {/* Critical Alerts */}
            {lowStockItems.length > 0 && (
            <div className="bg-linear-to-br from-red-900/30 to-red-900/20 border-2 border-red-600 rounded-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h4 className="text-lg font-bold text-white uppercase tracking-wide">Critical Alerts</h4>
              </div>
              <div className="space-y-3">
                {lowStockItems.slice(0, 2).map((item: MedicineData) => (
                <div key={item._id} className="p-3 bg-slate-900/50 border border-red-700 rounded-md">
                  <p className="text-sm font-bold text-white mb-1 uppercase tracking-wide">{item.name} - Critical</p>
                  <p className="text-xs text-slate-400 mb-2 font-mono">Only {item.stock} units remaining</p>
                  <button className="text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-wider">
                    Reorder Now →
                  </button>
                </div>
                ))}
              </div>
            </div>
            )}

            {/* Command Actions */}
            <div className="bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-md p-6">
              <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wide">Quick Commands</h4>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-md hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold text-sm uppercase tracking-wide border border-emerald-500">
                  Add Medicine
                </button>
                <button className="w-full px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-sm uppercase tracking-wide border border-blue-500">
                  Process Distribution
                </button>
                <button className="w-full px-4 py-3 border-2 border-slate-700 text-white rounded-md hover:border-emerald-600 transition-all font-bold text-sm uppercase tracking-wide">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}