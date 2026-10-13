import React, { useState } from 'react';
import { Building2, ArrowRight, Phone, Mail, MapPin, Briefcase, User, Lock } from 'lucide-react';
import {
  validatePhoneNumber,
  validateEmail,
  validatePersonName,
  validateCity,
  validateSector,
  validateCompanyName,
  validateUsername,
  validatePassword
} from '../../utils/validation';

interface RegistrationSectionProps {
  onRegisterCompany: (data: {
    name: string;
    sector: string;
    email: string;
    username: string;
    password: string;
    phone: string;
    city: string;
    adminName: string;
  }) => void;
  onNavigateToDashboard: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({
  onRegisterCompany,
  onNavigateToDashboard,
  onShowToast
}) => {
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+263');
  const [city, setCity] = useState('Harare');
  const [adminName, setAdminName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateAll = (): boolean => {
    const errs: Record<string, string> = {};

    const nameCheck = validateCompanyName(name);
    if (!nameCheck.isValid) errs.name = nameCheck.error!;

    const sectorCheck = validateSector(sector);
    if (!sectorCheck.isValid) errs.sector = sectorCheck.error!;

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) errs.email = emailCheck.error!;

    const phoneCheck = validatePhoneNumber(phone);
    if (!phoneCheck.isValid) errs.phone = phoneCheck.error!;

    const cityCheck = validateCity(city);
    if (!cityCheck.isValid) errs.city = cityCheck.error!;

    const adminNameCheck = validatePersonName(adminName, 'Lead Manager Name');
    if (!adminNameCheck.isValid) errs.adminName = adminNameCheck.error!;

    const userCheck = validateUsername(username || email.split('@')[0] || 'user');
    if (!userCheck.isValid) errs.username = userCheck.error!;

    const passCheck = validatePassword(password);
    if (!passCheck.isValid) errs.password = passCheck.error!;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePhoneChange = (raw: string) => {
    let cleaned = '';
    if (raw.startsWith('+')) {
      cleaned = '+' + raw.slice(1).replace(/\D/g, '');
    } else {
      cleaned = raw.replace(/\D/g, '');
    }
    setPhone(cleaned);

    if (cleaned.length > 0) {
      const chk = validatePhoneNumber(cleaned);
      setErrors(prev => ({ ...prev, phone: chk.isValid ? '' : chk.error || '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      onShowToast('Please fix the highlighted input validation errors.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      onRegisterCompany({
        name: name.trim(),
        sector: sector.trim(),
        email: email.trim(),
        username: username.trim() || email.split('@')[0],
        password: password.trim(),
        phone: phone.trim(),
        city: city.trim(),
        adminName: adminName.trim(),
      });
      setName('');
      setSector('');
      setEmail('');
      setUsername('');
      setPassword('');
      setPhone('+263');
      setAdminName('');
      setErrors({});
      onShowToast('Company registered successfully. Welcome to your Dashboard.', 'success');
      onNavigateToDashboard();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      onShowToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Company Registration</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Register a business entity to begin analysing customer feedback across English, Shona, and Ndebele channels
        </p>
      </div>

      {/* Registration Form */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900">Business Registration Form</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict validation enforced: names and sectors must contain characters only; phone numbers must contain numbers only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Business Name */}
            <div>
              <label htmlFor="reg-company-name" className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Business Name *
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  id="reg-company-name"
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    const chk = validateCompanyName(e.target.value);
                    setErrors(prev => ({ ...prev, name: chk.isValid ? '' : chk.error || '' }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none ${
                    errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                  }`}
                  required
                />
              </div>
              {errors.name && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.name}</p>}
            </div>

            {/* Commercial Sector (Characters Only) */}
            <div>
              <label htmlFor="reg-sector" className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Commercial Sector (Characters Only) *
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  id="reg-sector"
                  type="text"
                  value={sector}
                  onChange={e => {
                    setSector(e.target.value);
                    const chk = validateSector(e.target.value);
                    setErrors(prev => ({ ...prev, sector: chk.isValid ? '' : chk.error || '' }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none ${
                    errors.sector ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                  }`}
                  required
                />
              </div>
              {errors.sector && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.sector}</p>}
            </div>

            {/* Corporate Email */}
            <div>
              <label htmlFor="reg-email" className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Corporate Email *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    const chk = validateEmail(e.target.value);
                    setErrors(prev => ({ ...prev, email: chk.isValid ? '' : chk.error || '' }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none ${
                    errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                  }`}
                  required
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.email}</p>}
            </div>

            {/* Telephone Contact (Numbers Only) */}
            <div>
              <label htmlFor="reg-phone" className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Telephone Contact (Numbers Only) *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none ${
                    errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                  }`}
                  required
                />
              </div>
              {errors.phone ? (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.phone}</p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-0.5">Numbers only (optional leading + allowed)</p>
              )}
            </div>

            {/* Headquarters City (Characters Only) */}
            <div>
              <label htmlFor="reg-city" className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Headquarters City (Characters Only) *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  id="reg-city"
                  type="text"
                  value={city}
                  onChange={e => {
                    setCity(e.target.value);
                    const chk = validateCity(e.target.value);
                    setErrors(prev => ({ ...prev, city: chk.isValid ? '' : chk.error || '' }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none ${
                    errors.city ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                  }`}
                  required
                />
              </div>
              {errors.city && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.city}</p>}
            </div>

            {/* Lead Manager / Account Owner (Characters Only) */}
            <div>
              <label htmlFor="reg-admin-name" className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Lead Manager / Account Owner (Characters Only) *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  id="reg-admin-name"
                  type="text"
                  value={adminName}
                  onChange={e => {
                    setAdminName(e.target.value);
                    const chk = validatePersonName(e.target.value, 'Lead Manager Name');
                    setErrors(prev => ({ ...prev, adminName: chk.isValid ? '' : chk.error || '' }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none ${
                    errors.adminName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                  }`}
                  required
                />
              </div>
              {errors.adminName && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.adminName}</p>}
            </div>

            {/* Account Username */}
            <div>
              <label htmlFor="reg-username" className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Account Username *
              </label>
              <input
                id="reg-username"
                type="text"
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  const chk = validateUsername(e.target.value);
                  setErrors(prev => ({ ...prev, username: chk.isValid ? '' : chk.error || '' }));
                }}
                className={`w-full p-2 border rounded focus:outline-none ${
                  errors.username ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                }`}
                required
              />
              {errors.username && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.username}</p>}
            </div>

            {/* Account Password */}
            <div>
              <label htmlFor="reg-password" className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Account Password *
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    const chk = validatePassword(e.target.value);
                    setErrors(prev => ({ ...prev, password: chk.isValid ? '' : chk.error || '' }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none ${
                    errors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                  }`}
                  required
                />
              </div>
              {errors.password && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.password}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              Instantly provisions isolated data repository and multilingual classifier.
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>Register & Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
