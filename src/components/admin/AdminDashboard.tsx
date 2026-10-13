import React from 'react';
import { Company, UserProfile, AuditLogItem, FeedbackItem } from '../../types';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import {
  Building2,
  Users2,
  Database,
  Activity,
  ShieldCheck,
  Server,
  Cpu,
  Clock,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardProps {
  companies: Company[];
  users: UserProfile[];
  allFeedback: FeedbackItem[];
  auditLogs: AuditLogItem[];
  onNavigateToTab: (tab: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  companies,
  users,
  allFeedback,
  auditLogs,
  onNavigateToTab
}) => {
  const activeCompanies = companies.filter(c => c.status === 'Active').length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const totalFeedbackCount = allFeedback.length;
  const recentLogs = auditLogs.slice(0, 5);
  const recentRegistrations = companies.slice(-4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Administration Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Platform infrastructure, tenant registry, and cross-enterprise operational monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-teal-50 text-teal-800 border border-teal-200">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            Platform Services Operational
          </span>
        </div>
      </div>

      {/* Primary Platform Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Registered Businesses"
          value={companies.length}
          subtitle={`${activeCompanies} currently active tenants`}
          icon={Building2}
        />
        <StatCard
          title="Active System Users"
          value={users.length}
          subtitle={`${activeUsers} verified accounts`}
          icon={Users2}
        />
        <StatCard
          title="Total Analysed Records"
          value={totalFeedbackCount}
          subtitle="Processed across all tenants"
          icon={Database}
          variant="teal"
        />
        <StatCard
          title="Multilingual Inference Uptime"
          value="99.98%"
          subtitle="Inference latency ~38ms"
          icon={Server}
          variant="positive"
        />
      </div>

      {/* Row: Recent Tenant Registrations & System Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Businesses */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Registered Businesses</h2>
              <p className="text-xs text-slate-500">Recently onboarded commercial entities</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('Businesses')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentRegistrations.map(comp => (
              <div key={comp.id} className="p-3 border border-slate-200 rounded bg-slate-50/50 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{comp.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{comp.sector} | {comp.city}</div>
                </div>
                <div className="text-right">
                  <Badge variant="status" value={comp.status} size="sm" />
                  <div className="text-[10px] text-slate-400 mt-1">{comp.feedbackCount} feedback records</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent System Activity / Audit Feed */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent System Activity</h2>
              <p className="text-xs text-slate-500">Security and operational audit log</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('System Activity')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Audit Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentLogs.map(log => (
              <div key={log.id} className="p-3 border border-slate-200 rounded bg-slate-50/50 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                </div>
                <div className="text-[11px] text-slate-600 truncate">{log.details}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Actor: {log.actorEmail}</span>
                  <span>Scope: {log.companyName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Architecture & Engine Status */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900">Machine Learning & Linguistic Subsystems</h2>
          <p className="text-xs text-slate-500 mt-0.5">Status of Zimbabwean vernacular NLP engines</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 border border-slate-200 rounded bg-slate-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Supervised Baseline ML</span>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold text-[10px] border border-teal-200">Online</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              TF-IDF Linear Classifier trained on annotated regional corpora. Serves fast fallback inference for low-latency pipelines.
            </p>
          </div>

          <div className="p-4 border border-slate-200 rounded bg-slate-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Multilingual Transformer</span>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold text-[10px] border border-teal-200">Online</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Specialized linguistic encoder supporting Shona (chiShona), Ndebele (isiNdebele), and complex code-mixing switches.
            </p>
          </div>

          <div className="p-4 border border-slate-200 rounded bg-slate-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Tenant Data Isolation Engine</span>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold text-[10px] border border-teal-200">Enforced</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Strict multi-tenant security barrier ensuring zero cross-tenant leakage between competing commercial entities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
