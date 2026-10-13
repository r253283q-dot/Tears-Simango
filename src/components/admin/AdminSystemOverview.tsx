import React from 'react';
import { Company, FeedbackItem, UserProfile, AuditLogItem } from '../../types';
import { StatCard } from '../common/StatCard';
import { MODEL_BENCHMARKS } from '../../services/storage';
import { Building2, Users2, Database, Server, ShieldCheck, Activity } from 'lucide-react';

interface AdminSystemOverviewProps {
  companies: Company[];
  users: UserProfile[];
  allFeedback: FeedbackItem[];
  auditLogs: AuditLogItem[];
}

export const AdminSystemOverview: React.FC<AdminSystemOverviewProps> = ({
  companies,
  users,
  allFeedback,
  auditLogs
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Platform infrastructure, multilingual linguistic benchmarks, and system health status
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded text-xs font-semibold text-teal-800">
          <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
          <span>All Services Operational</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Registered Companies"
          value={companies.length}
          subtitle="Active corporate workspaces"
          icon={Building2}
        />
        <StatCard
          title="Total User Accounts"
          value={users.length}
          subtitle="Provisioned credentials"
          icon={Users2}
        />
        <StatCard
          title="Analysed Feedback"
          value={allFeedback.length}
          subtitle="Multilingual records stored"
          icon={Database}
          variant="teal"
        />
        <StatCard
          title="Inference Latency"
          value="38ms"
          subtitle="Local multilingual model"
          icon={Server}
          variant="positive"
        />
      </div>

      {/* Multilingual Benchmark Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Multilingual Model Evaluation Benchmarks</h2>
            <p className="text-xs text-slate-500 mt-0.5">Empirical metrics on Zimbabwean language holdout corpora</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold tracking-wider">
                <th className="py-2.5 px-4">Language Register</th>
                <th className="py-2.5 px-3">Corpus Size</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3 text-right">Inference Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {MODEL_BENCHMARKS.map(bm => (
                <tr key={bm.language} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900">{bm.language}</td>
                  <td className="py-3 px-3 text-slate-600">{bm.datasetSize.toLocaleString()} tokens</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{bm.accuracy}%</td>
                  <td className="py-3 px-3 text-slate-700">{bm.precision}</td>
                  <td className="py-3 px-3 text-slate-700">{bm.recall}</td>
                  <td className="py-3 px-3 font-semibold text-teal-700">{bm.f1Score}</td>
                  <td className="py-3 px-3 text-right text-slate-600">{bm.latencyMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent System Activity Preview */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent Platform Activity & Audit Feed</h2>
          <span className="text-xs text-slate-400">Past events</span>
        </div>

        <div className="space-y-2.5">
          {auditLogs.slice(0, 6).map(log => (
            <div key={log.id} className="p-3 border border-slate-100 rounded bg-slate-50/60 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-900">{log.action}</div>
                <div className="text-[11px] text-slate-600">{log.details}</div>
                <div className="text-[10px] text-slate-400">Actor: {log.actorEmail} ({log.actorRole}) | Scope: {log.companyName}</div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
