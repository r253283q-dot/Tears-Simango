import React, { useState } from 'react';
import { AuditLogItem } from '../../types';
import { Activity, Search, Filter, ShieldAlert, CheckCircle, Info } from 'lucide-react';

interface SystemActivitySectionProps {
  auditLogs: AuditLogItem[];
}

export const SystemActivitySection: React.FC<SystemActivitySectionProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Success' | 'Warning' | 'Info'>('All');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchQuery === '' ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.companyName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Activity & Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit trail of authentication events, inference calls, tenant operations, and security modifications
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search action, actor email, or entity..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Log Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="p-1.5 border border-slate-300 rounded bg-white focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Warning">Warning</option>
            <option value="Info">Info</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recorded System Events</h2>
          <span className="text-xs text-slate-500">{filteredLogs.length} events found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold tracking-wider">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Actor & Role</th>
                <th className="py-2.5 px-3">Scope / Tenant</th>
                <th className="py-2.5 px-3">Details</th>
                <th className="py-2.5 px-3">Client IP</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {log.action}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800">{log.actorEmail}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{log.actorRole}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {log.companyName}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-sm truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded font-medium text-[10px] ${
                      log.status === 'Success'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : log.status === 'Warning'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
