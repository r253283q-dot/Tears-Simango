import React from 'react';
import {
  UserPlus,
  LayoutDashboard,
  SearchCode,
  Lightbulb,
  TrendingUp,
  FileText,
  UserCog,
  Building,
  Users2,
  Activity,
  ChevronRight,
  Lock
} from 'lucide-react';

export type CustomerPage = 'Registration' | 'Dashboard' | 'Analyse' | 'Insights' | 'Trends' | 'Reports' | 'Account';
export type AdminPage = 'Companies' | 'User Accounts' | 'System Overview';

interface SidebarProps {
  currentPortal: 'customer' | 'admin';
  customerPage: CustomerPage;
  adminPage: AdminPage;
  onCustomerPageChange: (page: CustomerPage) => void;
  onAdminPageChange: (page: AdminPage) => void;
  unreadCount?: number;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPortal,
  customerPage,
  adminPage,
  onCustomerPageChange,
  onAdminPageChange,
  unreadCount = 0,
  isAuthenticated,
  isAdminAuthenticated
}) => {
  const customerNavItems: Array<{ id: CustomerPage; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'Registration', label: 'Registration', icon: UserPlus },
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Analyse', label: 'Analyse', icon: SearchCode },
    { id: 'Insights', label: 'Insights', icon: Lightbulb },
    { id: 'Trends', label: 'Trends', icon: TrendingUp },
    { id: 'Reports', label: 'Reports', icon: FileText },
    { id: 'Account', label: 'Account', icon: UserCog },
  ];

  const adminNavItems: Array<{ id: AdminPage; label: string; icon: React.ComponentType<{ className?: string }> }> = isAdminAuthenticated
    ? [
        { id: 'Companies', label: 'Companies', icon: Building },
        { id: 'User Accounts', label: 'User Accounts', icon: Users2 },
        { id: 'System Overview', label: 'System Overview', icon: Activity },
      ]
    : [
        { id: 'Companies', label: 'Admin Login', icon: Lock },
      ];

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6">
      <div>
        <div className="px-6 mb-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {currentPortal === 'customer' ? 'Company Portal' : 'Admin Portal'}
          </div>
        </div>

        <nav className="space-y-1 px-3">
          {currentPortal === 'customer' ? (
            customerNavItems.map(item => {
              const Icon = item.icon;
              const isActive = customerPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onCustomerPageChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'Dashboard' && unreadCount > 0 && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-teal-500 text-slate-950' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            adminNavItems.map(item => {
              const Icon = item.icon;
              const isActive = adminPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onAdminPageChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-400" />}
                </button>
              );
            })
          )}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="px-5 text-xs text-slate-500">
        <div className="p-3 bg-white border border-slate-200 rounded space-y-1">
          <div className="font-semibold text-slate-800 text-[11px]">
            Security Status
          </div>
          <div className="text-[11px] text-slate-500">
            {currentPortal === 'customer'
              ? isAuthenticated ? 'Authenticated Session' : 'Login Required'
              : isAdminAuthenticated ? 'Admin Authenticated' : 'Admin Locked'}
          </div>
        </div>
      </div>
    </aside>
  );
};
