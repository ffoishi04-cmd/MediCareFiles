import { Activity, Menu, Bell, LogOut } from 'lucide-react';
import { Link } from 'react-router';

interface HeaderProps {
  userRole?: string;
  userName?: string;
}

export function Header({ userRole, userName }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <Link to="/" className="no-underline">
                <h1 className="text-xl font-bold text-gray-900 m-0">MediCare</h1>
              </Link>
              <p className="text-xs text-gray-500 m-0">BAUET Medical Center</p>
            </div>
          </div>

          {userName && (
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 m-0">{userName}</p>
                  <p className="text-xs text-gray-500 m-0">{userRole}</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{userName.charAt(0)}</span>
                </div>
              </div>

              <Link to="/login" className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors no-underline">
                <LogOut className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
