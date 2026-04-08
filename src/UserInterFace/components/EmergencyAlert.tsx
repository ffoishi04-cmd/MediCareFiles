// ============================================================
// Emergency Alert Button - Floating Pulse Button
// Visible on all dashboards for emergency dispatch
// ============================================================

import { useState } from 'react';
import { Ambulance, Phone, MapPin, AlertCircle, X, User, Droplet } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { ambulanceAPI } from '../services/api';

export function EmergencyAlert() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    emergencyType: '',
    description: '',
    contact: '',
  });

  const emergencyTypes = [
    'Chest Pain',
    'Difficulty Breathing',
    'Severe Injury',
    'Unconscious',
    'Allergic Reaction',
    'Seizure',
    'Bleeding',
    'Fall/Fracture',
    'Mental Health Crisis',
    'Other Critical',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Attempt to send to backend
      await ambulanceAPI.requestEmergency({
        studentId: user?.universityId || 'N/A',
        patientName: user?.name || 'Unknown',
        location: formData.location,
        emergencyType: formData.emergencyType,
        description: formData.description,
        contact: formData.contact || user?.email,
        priority: 'High',
      });

      // Success toast with siren animation
      toast.success('🚨 EMERGENCY DISPATCH REQUESTED', {
        description: 'Emergency services have been notified. Help is on the way!',
        duration: 8000,
      });

      // Close modal and reset
      setIsModalOpen(false);
      setFormData({ location: '', emergencyType: '', description: '', contact: '' });
    } catch (error: any) {
      // Even if backend is offline, show confirmation (mock mode)
      if (error.message === 'BACKEND_OFFLINE') {
        toast.success('🚨 EMERGENCY ALERT SENT (DEMO)', {
          description: 'In production, emergency services would be dispatched immediately.',
          duration: 8000,
        });
        setIsModalOpen(false);
        setFormData({ location: '', emergencyType: '', description: '', contact: '' });
      } else {
        toast.error('Failed to send emergency request. Please call 911 directly.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Emergency Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-linear-to-br from-red-600 to-red-700 text-white rounded-full shadow-2xl hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center border-2 border-red-500 group"
        style={{
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      >
        <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-75"></div>
        <Ambulance className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform" />
      </button>

      {/* Emergency Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-linear-to-br from-slate-900 to-slate-800 border-2 border-red-600 rounded-md shadow-2xl shadow-red-900/50 overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-red-900 to-red-800 p-6 border-b-2 border-red-600">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-md">
                      <Ambulance className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white uppercase tracking-wider m-0">
                      Emergency Request
                    </h2>
                  </div>
                  <p className="text-red-100 text-sm uppercase tracking-wide font-semibold">
                    Immediate Medical Assistance Required
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-red-200 transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-red-900/30 border-b-2 border-red-800 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-300 mb-1 font-bold">
                    For life-threatening emergencies, call 911 immediately
                  </p>
                  <p className="text-xs text-red-400 mb-0">
                    This form dispatches campus ambulance services. Response time: 3-5 minutes.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-md p-4">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-400">Name:</span>
                    <span className="text-white font-bold">{user?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-red-500" />
                    <span className="text-slate-400">Blood Group:</span>
                    <span className="text-white font-bold">O+</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Emergency Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Library Building, 3rd Floor"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-md focus:outline-none focus:border-red-600 text-white placeholder-slate-500"
                  required
                />
              </div>

              {/* Emergency Type */}
              <div>
                <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Emergency Type *
                </label>
                <select
                  value={formData.emergencyType}
                  onChange={(e) => setFormData({ ...formData, emergencyType: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-md focus:outline-none focus:border-red-600 text-white"
                  required
                >
                  <option value="">Select emergency type...</option>
                  {emergencyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  placeholder="Provide additional details about the emergency..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-md focus:outline-none focus:border-red-600 text-white placeholder-slate-500 resize-none"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Contact Number *
                </label>
                <input
                  type="tel"
                  placeholder="+1 234-567-8900"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-md focus:outline-none focus:border-red-600 text-white placeholder-slate-500 font-mono"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t-2 border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-slate-800 border-2 border-slate-700 text-white rounded-md hover:border-slate-600 transition-all font-bold uppercase tracking-wide"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-md hover:from-red-700 hover:to-red-800 transition-all font-bold uppercase tracking-wide border-2 border-red-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Dispatching...'
                  ) : (
                    <>
                      <Ambulance className="w-5 h-5" />
                      Request Ambulance
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pulse Animation CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
          }
        }
      `}</style>
    </>
  );
}



