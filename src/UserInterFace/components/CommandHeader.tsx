import {
  Shield,
  Database,
  LogOut,
  Lock,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { NotificationCenter } from "./NotificationCenter";

interface CommandHeaderProps {
  userRole?: string;
  userName?: string;
}

export function CommandHeader({
  userRole,
  userName,
}: CommandHeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-emerald-600 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600 blur-lg opacity-50"></div>
              <div className="relative bg-linear-to-br from-emerald-600 to-emerald-700 p-3 rounded-md border border-emerald-500">
                <Shield className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="border-l-2 border-slate-700 pl-4">
              <Link to="/" className="no-underline">
                <h1 className="text-2xl font-bold text-white m-0 tracking-wider">
                  MEDICARE
                </h1>
              </Link>
              <p className="text-xs text-emerald-400 uppercase tracking-widest m-0 font-semibold">
                Secure Access System
              </p>
            </div>
          </div>

          {userName && (
            <div className="flex items-center gap-4">
              {/* MongoDB Indicator */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md">
                <Database className="w-4 h-4 text-emerald-500" />
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-400 font-mono">
                    CONNECTED
                  </span>
                </div>
              </div>

              {/* Notifications */}
              <NotificationCenter />

              {/* User Badge */}
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 border border-slate-700 rounded-md">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <div className="text-right">
                    <p className="text-sm font-bold text-white m-0 uppercase tracking-wide">
                      {userName}
                    </p>
                    <p className="text-xs text-emerald-400 m-0 uppercase tracking-wider">
                      {userRole}
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-md flex items-center justify-center border border-emerald-500">
                  <span className="text-white font-bold text-lg">
                    {userName.charAt(0)}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-red-900"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
