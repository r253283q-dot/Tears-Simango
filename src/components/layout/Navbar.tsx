import React from 'react';
import { Company, UserProfile } from '../../types';
import { Building2, ShieldCheck, User, LogOut, LogIn } from 'lucide-react';

interface NavbarProps {
  currentPortal: 'customer' | 'admin';
  onPortalChange: (portal: 'customer' | 'admin') => void;
  activeCompany: Company | null;
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  onLogout: () => void;
  onNavigateToAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPortal,
  onPortalChange,
  activeCompany,
  currentUser,
  isAuthenticated,
  onLogout,
  onNavigateToAuth
}) => {
  const isAdmin = currentUser?.role === 'Admin';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Platform Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-teal-600 flex items-center justify-center font-bold text-white text-sm tracking-wide">
            ZC
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-white leading-none">
              Zimbabwe Customer Sentiment Intelligence
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Enterprise Multilingual Feedback Intelligence
            </div>
          </div>
        </div>

        {/* Right: Active Context & Authentication */}
        <div className="flex items-center gap-3">
          {/* If Authenticated: Portal Switcher only shown for Admin */}
          {isAuthenticated && isAdmin && (
            <div className="flex items-center bg-slate-800 p-0.5 rounded border border-slate-700 text-xs font-medium">
              <button
                type="button"
                onClick={() => onPortalChange('admin')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                  currentPortal === 'admin'
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Admin Portal</span>
              </button>
              <button
                type="button"
                onClick={() => onPortalChange('customer')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  currentPortal === 'customer'
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Company View
              </button>
            </div>
          )}

          {/* If Authenticated Company User: Show Locked Company Portal Badge */}
          {isAuthenticated && !isAdmin && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-semibold text-teal-300">Company Portal:</span>
              <span className="font-medium max-w-[150px] truncate">
                {activeCompany ? activeCompany.name : 'Dedicated Workspace'}
              </span>
            </div>
          )}

          {/* User Badge or Sign In button */}
          {isAuthenticated && currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300">
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-medium hidden md:inline">{currentUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-semibold">
                  {currentUser.role}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Sign out of workspace"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-900 rounded text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onNavigateToAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
