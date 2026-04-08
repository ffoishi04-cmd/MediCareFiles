// ============================================================
// Notification Center Component
// Real-time notification system with bell icon dropdown
// ============================================================

import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Calendar, Pill, Ambulance, FileText, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  userId: string;
  role: string;
  message: string;
  type: 'appointment' | 'emergency' | 'prescription' | 'medicine' | 'system' | 'alert';
  status: 'unread' | 'read';
  timestamp: string;
  actionUrl?: string;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Mock notifications based on user role
  useEffect(() => {
    if (!user) return;

    const mockNotifications: Record<string, Notification[]> = {
      student: [
        {
          id: 'n1',
          userId: user.id,
          role: 'student',
          message: 'Your appointment with Dr. Sarah Johnson has been confirmed for Feb 10, 2026 at 10:00 AM',
          type: 'appointment',
          status: 'unread',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: 'n2',
          userId: user.id,
          role: 'student',
          message: 'New prescription ready for pickup at the pharmacy - Amoxicillin 500mg',
          type: 'prescription',
          status: 'unread',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: 'n3',
          userId: user.id,
          role: 'student',
          message: 'ML Health Analysis complete: Your symptom check results are available',
          type: 'system',
          status: 'read',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
      ],
      doctor: [
        {
          id: 'n1',
          userId: user.id,
          role: 'doctor',
          message: 'New appointment request from John Smith (STU-2024-1234) - Requires review',
          type: 'appointment',
          status: 'unread',
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        },
        {
          id: 'n2',
          userId: user.id,
          role: 'doctor',
          message: 'URGENT: Emergency case at Library Building - Chest Pain',
          type: 'emergency',
          status: 'unread',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          id: 'n3',
          userId: user.id,
          role: 'doctor',
          message: 'Prescription dispensed: Patient Emma Wilson received medication',
          type: 'prescription',
          status: 'read',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        },
      ],
      pharmacist: [
        {
          id: 'n1',
          userId: user.id,
          role: 'pharmacist',
          message: 'LOW STOCK ALERT: Paracetamol 500mg - Only 15 units remaining',
          type: 'medicine',
          status: 'unread',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: 'n2',
          userId: user.id,
          role: 'pharmacist',
          message: 'New prescription ready for dispensing from Dr. Sarah Johnson',
          type: 'prescription',
          status: 'unread',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
        {
          id: 'n3',
          userId: user.id,
          role: 'pharmacist',
          message: 'Inventory update: 3 medicines require restocking within 7 days',
          type: 'alert',
          status: 'read',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        },
      ],
      admin: [
        {
          id: 'n1',
          userId: user.id,
          role: 'admin',
          message: 'New user registration pending approval: Dr. Emily Clarke (Doctor)',
          type: 'system',
          status: 'unread',
          timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        },
        {
          id: 'n2',
          userId: user.id,
          role: 'admin',
          message: 'Emergency dispatch completed: AMB-002 returned to base',
          type: 'emergency',
          status: 'unread',
          timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        },
        {
          id: 'n3',
          userId: user.id,
          role: 'admin',
          message: 'System backup completed successfully - Database health: EXCELLENT',
          type: 'system',
          status: 'read',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        },
      ],
    };

    setNotifications(mockNotifications[user.role] || []);
  }, [user]);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, status: 'read' as const } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, status: 'read' as const }))
    );
    toast.success('All notifications marked as read');
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notification removed');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      case 'emergency':
        return <Ambulance className="w-4 h-4" />;
      case 'prescription':
        return <FileText className="w-4 h-4" />;
      case 'medicine':
        return <Pill className="w-4 h-4" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'text-blue-400 bg-blue-900/20 border-blue-600';
      case 'emergency':
        return 'text-red-400 bg-red-900/20 border-red-600';
      case 'prescription':
        return 'text-purple-400 bg-purple-900/20 border-purple-600';
      case 'medicine':
        return 'text-orange-400 bg-orange-900/20 border-orange-600';
      case 'alert':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-600';
      default:
        return 'text-emerald-400 bg-emerald-900/20 border-emerald-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-700"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-linear-to-br from-slate-900 to-slate-800 border-2 border-emerald-600 rounded-md shadow-2xl shadow-emerald-900/20 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b-2 border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wide m-0">Notifications</h3>
                <p className="text-xs text-slate-400 uppercase tracking-wider m-0">
                  {unreadCount} Unread Message{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark All Read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-0 uppercase tracking-wide text-sm font-semibold">
                    No Notifications
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-slate-800/50 transition-colors ${
                        notification.status === 'unread' ? 'bg-emerald-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-md border ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white mb-1 leading-snug">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-mono">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.status === 'unread' && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-emerald-400 hover:text-emerald-300 uppercase tracking-wider font-bold"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => clearNotification(notification.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t-2 border-slate-700 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-400 hover:text-emerald-400 uppercase tracking-wider font-bold"
              >
                Close Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}



