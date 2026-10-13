import React, { useState } from 'react';
import { Company, FeedbackItem } from '../../types';
import { Badge } from '../common/Badge';
import { BackButton } from '../common/BackButton';
import { CustomerDashboard } from '../customer/CustomerDashboard';
import {
  validatePhoneNumber,
  validateEmail,
  validateCity,
  validateSector,
  validateCompanyName
} from '../../utils/validation';
import {
  Building2,
  Trash2,
  Eye,
  Plus,
  Search,
  AlertTriangle,
  Users2,
  Database
} from 'lucide-react';

interface AdminCompaniesSectionProps {
  companies: Company[];
  allFeedback: FeedbackItem[];
  onDeleteCompany: (id: string) => void;
  onAddCompany: (data: Omit<Company, 'id' | 'dateRegistered' | 'feedbackCount' | 'userCount'>) => void;
  onUpdateFeedbackStatus: (id: string, status: FeedbackItem['status']) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminCompaniesSection: React.FC<AdminCompaniesSectionProps> = ({
  companies,
  allFeedback,
  onDeleteCompany,
  onAddCompany,
  onUpdateFeedbackStatus,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingCompanyDashboard, setViewingCompanyDashboard] = useState<Company | null>(null);

  // Deletion Confirmation Modal State
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  // Add Company Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+263 ');
  const [newCity, setNewCity] = useState('Harare');

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmDeleteCompany = () => {
    if (!companyToDelete) return;
    try {
      onDeleteCompany(companyToDelete.id);
      if (viewingCompanyDashboard?.id === companyToDelete.id) {
        setViewingCompanyDashboard(null);
      }
      setCompanyToDelete(null);
      onShowToast('Company and associated records deleted.', 'info');
    } catch {
      onShowToast('Something went wrong. Please try again.', 'error');
    }
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const nameChk = validateCompanyName(newName);
    if (!nameChk.isValid) {
      onShowToast(nameChk.error || 'Invalid company name.', 'error');
      return;
    }
    const sectorChk = validateSector(newSector);
    if (!sectorChk.isValid) {
      onShowToast(sectorChk.error || 'Invalid commercial sector.', 'error');
      return;
    }
    const emailChk = validateEmail(newEmail);
    if (!emailChk.isValid) {
      onShowToast(emailChk.error || 'Invalid email address.', 'error');
      return;
    }
    const phoneChk = validatePhoneNumber(newPhone);
    if (!phoneChk.isValid) {
      onShowToast(phoneChk.error || 'Phone number must contain numbers only.', 'error');
      return;
    }
    const cityChk = validateCity(newCity);
    if (!cityChk.isValid) {
      onShowToast(cityChk.error || 'Invalid city name.', 'error');
      return;
    }

    try {
      onAddCompany({
        name: newName.trim(),
        sector: newSector.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        city: newCity.trim(),
        status: 'Active'
      });
      setShowAddModal(false);
      setNewName('');
      setNewSector('');
      setNewEmail('');
      setNewPhone('+263');
      setNewCity('Harare');
      onShowToast('New company registered successfully.', 'success');
    } catch {
      onShowToast('Something went wrong. Please try again.', 'error');
    }
  };

  // If Admin clicked "View Dashboard" for a specific company:
  if (viewingCompanyDashboard) {
    const companyFeedback = allFeedback.filter(f => f.companyId === viewingCompanyDashboard.id);

    return (
      <div className="space-y-6">
        {/* Administrator Inspector Header */}
        <div className="bg-slate-900 text-white p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton
              onClick={() => setViewingCompanyDashboard(null)}
              label="Back to Registered Companies"
              className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:text-white"
            />
            <div>
              <div className="text-xs text-teal-400 font-semibold uppercase tracking-wider">
                Administrator View Mode
              </div>
              <div className="text-base font-bold text-white">
                Dashboard for: {viewingCompanyDashboard.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300">
              Sector: <span className="font-semibold text-white">{viewingCompanyDashboard.sector}</span> | City: <span className="font-semibold text-white">{viewingCompanyDashboard.city}</span>
            </span>
            <button
              type="button"
              onClick={() => setCompanyToDelete(viewingCompanyDashboard)}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer"
            >
              Delete Company
            </button>
          </div>
        </div>

        {/* The Exact Company Dashboard with Full SVG Graphs */}
        <CustomerDashboard
          company={viewingCompanyDashboard}
          feedbackList={companyFeedback}
          onNavigateToAnalyse={() => {}}
          onUpdateFeedbackStatus={onUpdateFeedbackStatus}
        />

        {/* Modal for Deletion if triggered while viewing dashboard */}
        {companyToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-base font-bold text-slate-900">Confirm Company Deletion</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-900">{companyToDelete.name}</span>?
                This will permanently remove the company entity, all associated customer feedback records, and all linked user accounts.
              </p>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompanyToDelete(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteCompany}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Registered Companies</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any business to inspect their live customer sentiment dashboard or manage account status
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register Company</span>
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
            placeholder="Search by company name, sector, or city..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
          />
        </div>

        <div className="text-slate-500">
          Total Registered: <span className="font-semibold text-slate-800">{companies.length}</span> enterprises
        </div>
      </div>

      {/* Companies List Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Companies Registry</h2>
          <span className="text-xs text-slate-400">Click "View Dashboard" to inspect company intelligence</span>
        </div>

        {companies.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="text-sm font-semibold text-slate-800 mb-1">No companies registered yet.</div>
            <p className="text-slate-500 mb-4">Register your first commercial entity to begin monitoring customer sentiment.</p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 cursor-pointer"
            >
              Register First Business
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold tracking-wider">
                  <th className="py-2.5 px-4">Business Name</th>
                  <th className="py-2.5 px-3">Commercial Sector</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Contact Email</th>
                  <th className="py-2.5 px-3">Feedback Records</th>
                  <th className="py-2.5 px-3">Users</th>
                  <th className="py-2.5 px-3">Registered</th>
                  <th className="py-2.5 px-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompanies.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <button
                        type="button"
                        onClick={() => setViewingCompanyDashboard(c)}
                        className="text-left font-bold text-slate-900 hover:text-teal-700 cursor-pointer underline-offset-2 hover:underline"
                      >
                        {c.name}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{c.sector}</td>
                    <td className="py-3 px-3 text-slate-600">{c.city}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{c.email}</td>
                    <td className="py-3 px-3 text-slate-700 font-bold">{c.feedbackCount}</td>
                    <td className="py-3 px-3 text-slate-600">{c.userCount}</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">{c.dateRegistered}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingCompanyDashboard(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-teal-600" />
                          <span>View Dashboard</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCompanyToDelete(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Deleting Company */}
      {companyToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Confirm Company Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">{companyToDelete.name}</span>?
              This will permanently delete this company profile, all its analysed feedback records, and any linked accounts.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCompanyToDelete(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCompany}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Register New Commercial Entity</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Zimbabwe Battery Logistics"
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Commercial Sector</label>
                <input
                  type="text"
                  value={newSector}
                  onChange={e => setNewSector(e.target.value)}
                  placeholder="e.g. Clean Energy, FMCG, Courier"
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="contact@company.co.zw"
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telephone Contact (Numbers Only)</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={e => {
                      const raw = e.target.value;
                      const cleaned = raw.startsWith('+') ? '+' + raw.slice(1).replace(/\D/g, '') : raw.replace(/\D/g, '');
                      setNewPhone(cleaned);
                    }}
                    placeholder="+263771234567"
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Headquarters City (Characters Only)</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={e => setNewCity(e.target.value)}
                  placeholder="Harare / Bulawayo"
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                  required
                />
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
                  Save Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
