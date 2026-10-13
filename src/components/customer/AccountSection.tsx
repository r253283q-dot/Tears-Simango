import React, { useState } from 'react';
import { Company, UserProfile } from '../../types';
import { Badge } from '../common/Badge';
import {
  validatePhoneNumber,
  validateEmail,
  validateCity,
  validateSector,
  validateCompanyName
} from '../../utils/validation';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Users,
  Shield,
  Save,
  Radio,
  Share2
} from 'lucide-react';

interface AccountSectionProps {
  company: Company;
  users: UserProfile[];
  onUpdateCompany: (company: Company) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  company,
  users,
  onUpdateCompany,
  onShowToast
}) => {
  const [name, setName] = useState(company.name);
  const [sector, setSector] = useState(company.sector);
  const [email, setEmail] = useState(company.email);
  const [phone, setPhone] = useState(company.phone);
  const [city, setCity] = useState(company.city);
  const [isSaving, setIsSaving] = useState(false);

  // Channels state
  const [channels, setChannels] = useState([
    { name: 'WhatsApp Business API', connected: true, identifier: '+263 77 100 2000' },
    { name: 'Facebook Page & Messenger', connected: true, identifier: `@${company.name.toLowerCase().replace(/[^a-z]/g, '')}` },
    { name: 'SMS Shortcode & Virtual Number', connected: true, identifier: 'Econet & NetOne Gateway' },
    { name: 'Instagram Direct & Comments', connected: false, identifier: 'Not Configured' },
    { name: 'TikTok Creator Marketplace', connected: false, identifier: 'Not Configured' }
  ]);

  const companyUsers = users.filter(u => u.companyId === company.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const nameChk = validateCompanyName(name);
    if (!nameChk.isValid) {
      onShowToast(nameChk.error || 'Invalid business name.', 'error');
      return;
    }
    const sectorChk = validateSector(sector);
    if (!sectorChk.isValid) {
      onShowToast(sectorChk.error || 'Invalid commercial sector.', 'error');
      return;
    }
    const emailChk = validateEmail(email);
    if (!emailChk.isValid) {
      onShowToast(emailChk.error || 'Invalid email address.', 'error');
      return;
    }
    const phoneChk = validatePhoneNumber(phone);
    if (!phoneChk.isValid) {
      onShowToast(phoneChk.error || 'Phone number must contain numbers only.', 'error');
      return;
    }
    const cityChk = validateCity(city);
    if (!cityChk.isValid) {
      onShowToast(cityChk.error || 'Invalid city name.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const updated: Company = {
        ...company,
        name: name.trim(),
        sector: sector.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim()
      };
      onUpdateCompany(updated);
      onShowToast('Company profile updated successfully.', 'success');
    } catch {
      onShowToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account & Entity Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enterprise settings, communication channels, and team permissions for {company.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Entity Information Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">Registered Business Information</h2>
            <p className="text-xs text-slate-500 mt-0.5">Verified company profile registered on the intelligence platform</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Business Name
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="company-sector" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Commercial Sector
                </label>
                <input
                  id="company-sector"
                  type="text"
                  value={sector}
                  onChange={e => setSector(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="company-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Contact Email
                </label>
                <input
                  id="company-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="company-phone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Telephone Contact
                </label>
                <input
                  id="company-phone"
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="company-city" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Headquarters / City
                </label>
                <input
                  id="company-city"
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Registration Date
                </span>
                <div className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-600 font-mono">
                  {company.dateRegistered}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Connected Channels & Status */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold text-slate-900">Communication Channels</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ingestion gateways linked to this account</p>
            </div>

            <div className="space-y-3">
              {channels.map((ch, idx) => (
                <div key={idx} className="p-3 border border-slate-200 rounded flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{ch.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{ch.identifier}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-medium text-[10px] ${
                    ch.connected
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {ch.connected ? 'Active' : 'Disconnected'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members List */}
          <div className="bg-white border border-slate-200 rounded p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Company Users</h2>
                <p className="text-xs text-slate-500 mt-0.5">Authorised access for this business tenant</p>
              </div>
              <span className="text-xs font-semibold text-slate-700">{companyUsers.length} Users</span>
            </div>

            <div className="space-y-2.5">
              {companyUsers.map(user => (
                <div key={user.id} className="p-2.5 border border-slate-100 rounded bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-500">{user.email}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold text-[10px]">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
