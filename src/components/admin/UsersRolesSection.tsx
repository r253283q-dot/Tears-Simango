import React, { useState } from 'react';
import { UserProfile, UserRole, Company } from '../../types';
import { Badge } from '../common/Badge';
import { Users2, Plus, ShieldCheck, Key, CheckCircle2, UserCheck, Shield } from 'lucide-react';

interface UsersRolesSectionProps {
  users: UserProfile[];
  companies: Company[];
  onAddUser: (user: Omit<UserProfile, 'id' | 'lastActive'>) => void;
  onUpdateUser: (user: UserProfile) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const UsersRolesSection: React.FC<UsersRolesSectionProps> = ({
  users,
  companies,
  onAddUser,
  onUpdateUser,
  onShowToast
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Analyst');
  const [newCompanyId, setNewCompanyId] = useState<string>(companies[0]?.id || '');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    try {
      onAddUser({
        name: newName.trim(),
        email: newEmail.trim(),
        role: newRole,
        companyId: newCompanyId,
        status: 'Active'
      });
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewRole('Analyst');
      onShowToast('Saved', 'success');
    } catch {
      onShowToast('Something went wrong. Please try again.', 'error');
    }
  };

  const handleRoleChange = (user: UserProfile, role: UserRole) => {
    const updated = { ...user, role };
    onUpdateUser(updated);
    onShowToast('Saved', 'success');
  };

  const handleStatusToggle = (user: UserProfile) => {
    const nextStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    const updated = { ...user, status: nextStatus as UserProfile['status'] };
    onUpdateUser(updated);
    onShowToast('Saved', 'success');
  };

  const rolePermissions: Array<{ permission: string; admin: boolean; manager: boolean; analyst: boolean }> = [
    { permission: 'View Feedback & Sentiment Dashboard', admin: true, manager: true, analyst: true },
    { permission: 'Execute Single & Batch Analyses', admin: true, manager: true, analyst: true },
    { permission: 'Generate & Export Intelligence Reports', admin: true, manager: true, analyst: true },
    { permission: 'Manage Company Profile & Integrations', admin: true, manager: true, analyst: false },
    { permission: 'Provision Company Team Members', admin: true, manager: true, analyst: false },
    { permission: 'Platform Multi-Tenant Administration', admin: true, manager: false, analyst: false },
    { permission: 'Inspect Model Weights & NLP Benchmarks', admin: true, manager: false, analyst: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Users & Access Control</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based access control (RBAC), tenant assignment, and identity administration
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Platform Users Directory</h2>
          <span className="text-xs text-slate-500">{users.length} registered accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold tracking-wider">
                <th className="py-2.5 px-4">User Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Assigned Tenant</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Last Active</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const comp = companies.find(c => c.id === u.companyId);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {u.role === 'Admin' ? 'Platform Global' : comp?.name || u.companyId}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u, e.target.value as UserRole)}
                        className="p-1 border border-slate-300 rounded text-xs bg-white focus:outline-none"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Analyst">Analyst</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="status" value={u.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">{u.lastActive}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(u)}
                        className={`text-xs font-semibold cursor-pointer underline-offset-2 hover:underline ${
                          u.status === 'Active' ? 'text-rose-700 hover:text-rose-900' : 'text-teal-700 hover:text-teal-900'
                        }`}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900">Role-Based Access Control (RBAC) Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">Defined capabilities per user permission level</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                <th className="py-2.5">Platform Capability</th>
                <th className="py-2.5 text-center">Admin</th>
                <th className="py-2.5 text-center">Manager</th>
                <th className="py-2.5 text-center">Analyst</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rolePermissions.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 font-medium text-slate-800">{row.permission}</td>
                  <td className="py-2.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                      row.admin ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {row.admin ? 'Allowed' : 'Restricted'}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                      row.manager ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {row.manager ? 'Allowed' : 'Restricted'}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                      row.analyst ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {row.analyst ? 'Allowed' : 'Restricted'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Provision User Account</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Memory Sibanda"
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="memory@company.co.zw"
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Tenant</label>
                <select
                  value={newCompanyId}
                  onChange={e => setNewCompanyId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800 bg-white"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">System Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800 bg-white"
                >
                  <option value="Analyst">Analyst (Insights & Feedback Ingestion)</option>
                  <option value="Manager">Manager (Reports, Channels & Ingestion)</option>
                  <option value="Admin">Admin (Full Cross-Tenant Management)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 cursor-pointer"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
