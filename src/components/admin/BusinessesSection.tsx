import React, { useState } from 'react';
import { Company } from '../../types';
import { Badge } from '../common/Badge';
import { BackButton } from '../common/BackButton';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';

interface BusinessesSectionProps {
  companies: Company[];
  onAddCompany: (company: Omit<Company, 'id' | 'dateRegistered' | 'feedbackCount' | 'userCount'>) => void;
  onUpdateCompany: (company: Company) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const BusinessesSection: React.FC<BusinessesSectionProps> = ({
  companies,
  onAddCompany,
  onUpdateCompany,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended' | 'Pending Review'>('All');
  const [sectorFilter, setSectorFilter] = useState<string>('All');

  // Inspection drill-down state
  const [inspectingCompany, setInspectingCompany] = useState<Company | null>(null);

  // New business modal/form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+263 ');
  const [newCity, setNewCity] = useState('Harare');

  const sectors = Array.from(new Set(companies.map(c => c.sector)));

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSector = sectorFilter === 'All' || c.sector === sectorFilter;

    return matchesSearch && matchesStatus && matchesSector;
  });

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    try {
      onAddCompany({
        name: newName.trim(),
        sector: newSector.trim() || 'General Commerce',
        email: newEmail.trim(),
        phone: newPhone.trim(),
        city: newCity.trim(),
        status: 'Active'
      });
      setShowAddModal(false);
      setNewName('');
      setNewSector('');
      setNewEmail('');
      setNewPhone('+263 ');
      onShowToast('Saved', 'success');
    } catch {
      onShowToast('Something went wrong. Please try again.', 'error');
    }
  };

  const handleToggleStatus = (company: Company) => {
    const nextStatus = company.status === 'Active' ? 'Suspended' : 'Active';
    const updated = { ...company, status: nextStatus as Company['status'] };
    onUpdateCompany(updated);
    if (inspectingCompany?.id === company.id) {
      setInspectingCompany(updated);
    }
    onShowToast('Saved', 'success');
  };

  // Secondary drill-down inspection view
  if (inspectingCompany) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => setInspectingCompany(null)} label="Back to Businesses Registry" />
            <h2 className="text-lg font-semibold text-slate-900">Tenant Profile: {inspectingCompany.name}</h2>
          </div>
          <Badge variant="status" value={inspectingCompany.status} />
        </div>

        <div className="bg-white border border-slate-200 rounded p-6 shadow-xs max-w-3xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Business Name</span>
              <div className="font-bold text-slate-900 text-sm">{inspectingCompany.name}</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Industry Sector</span>
              <div className="font-semibold text-slate-800 text-sm">{inspectingCompany.sector}</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Contact Email</span>
              <div className="font-semibold text-slate-800">{inspectingCompany.email}</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Telephone</span>
              <div className="font-semibold text-slate-800">{inspectingCompany.phone}</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <span className="text-slate-400 font-semibold uppercase">City & Location</span>
              <div className="font-semibold text-slate-800">{inspectingCompany.city}, Zimbabwe</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Onboarding Date</span>
              <div className="font-semibold text-slate-800">{inspectingCompany.dateRegistered}</div>
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded bg-slate-50 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-slate-900">Tenant Storage & Isolation Boundary</div>
              <div className="text-slate-500 mt-0.5">
                {inspectingCompany.feedbackCount} feedback records stored | {inspectingCompany.userCount} authorised users
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggleStatus(inspectingCompany)}
              className={`px-3 py-1.5 font-semibold rounded text-xs cursor-pointer ${
                inspectingCompany.status === 'Active'
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
              }`}
            >
              {inspectingCompany.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Registered Businesses</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enterprise tenant registry and corporate account lifecycle management
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Business</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by business name or email..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-2 py-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending Review">Pending Review</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Sector:</span>
              <select
                value={sectorFilter}
                onChange={e => setSectorFilter(e.target.value)}
                className="px-2 py-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-none"
              >
                <option value="All">All Sectors</option>
                {sectors.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Tenant Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">Showing {filteredCompanies.length} registered enterprises</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold tracking-wider">
                <th className="py-2.5 px-4">Business Name</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3">Contact Email</th>
                <th className="py-2.5 px-3">Headquarters</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Users</th>
                <th className="py-2.5 px-3">Feedback Count</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="py-3 px-3 text-slate-600">{c.sector}</td>
                  <td className="py-3 px-3 text-slate-600">{c.email}</td>
                  <td className="py-3 px-3 text-slate-600">{c.city}</td>
                  <td className="py-3 px-3">
                    <Badge variant="status" value={c.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{c.userCount}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{c.feedbackCount}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setInspectingCompany(c)}
                      className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline-offset-2 hover:underline"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Business Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Register New Commercial Business</h3>
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
                  placeholder="e.g. Nyaradzo Life Assurance"
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
                  placeholder="e.g. Financial Services / Telecommunications"
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="admin@company.co.zw"
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    placeholder="Harare / Bulawayo"
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
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
