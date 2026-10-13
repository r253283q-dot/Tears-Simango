import React, { useState } from 'react';
import { UserProfile, Company, UserRole } from '../../types';
import { Badge } from '../common/Badge';
import { validatePersonName, validateEmail } from '../../utils/validation';
import { Users2, Trash2, Search, Plus, AlertTriangle } from 'lucide-react';

interface AdminUsersSectionProps {
  users: UserProfile[];
  companies: Company[];
  onDeleteUser: (id: string) => void;
  onAddUser: (user: Omit<UserProfile, 'id' | 'lastActive'>) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminUsersSection: React.FC<AdminUsersSectionProps> = ({
  users,
  companies,
  onDeleteUser,
  onAddUser,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Analyst');
  const [newCompanyId, setNewCompanyId] = useState(companies[0]?.id || '');

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    try {
      onDeleteUser(userToDelete.id);
      setUserToDelete(null);
      onShowToast('User account deleted.', 'info');
    } catch {
      onShowToast('Something went wrong. Please try again.', 'error');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const nameChk = validatePersonName(newName, 'User Name');
    if (!nameChk.isValid) {
      onShowToast(nameChk.error || 'Name must contain characters only.', 'error');
      return;
    }
    const emailChk = validateEmail(newEmail);
    if (!emailChk.isValid) {
      onShowToast(emailChk.error || 'Invalid email address.', 'error');
      return;
    }

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
      onShowToast('User provisioned successfully.', 'success');
    } catch {
      onShowToast('Something went wrong. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">User Accounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authenticated enterprise accounts across all company workspaces
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision User</span>
        </button>
      </div>

      {/* Search and Summary */}
      <div className="bg-white border border-slate-200 rounded p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
          />
        </div>

        <div className="text-slate-500">
          Total Accounts: <span className="font-semibold text-slate-800">{users.length}</span> users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">User Accounts Directory</h2>
          <span className="text-xs text-slate-400">Manage user access or remove accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold tracking-wider">
                <th className="py-2.5 px-4">User Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Assigned Company</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Last Active</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => {
                const comp = companies.find(c => c.id === u.companyId);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{u.email}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {comp?.name || 'Platform Administrator'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="status" value={u.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">{u.lastActive}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setUserToDelete(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Delete Account</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Confirm Account Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete user account <span className="font-bold text-slate-900">{userToDelete.email}</span> ({userToDelete.name})?
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
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
                <label className="block font-semibold text-slate-700 mb-1">Assigned Company</label>
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
                <label className="block font-semibold text-slate-700 mb-1">User Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800 bg-white"
                >
                  <option value="Analyst">Analyst</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
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
