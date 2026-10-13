import React, { useState } from 'react';
import { Building2, ShieldCheck, ArrowRight, PlusCircle, ArrowLeft, Lock, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
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

interface WelcomeGatewayProps {
  initialStage?: 'select' | 'company-login' | 'company-register' | 'admin-login';
  onCompanyLogin: (identifier: string, pass: string) => { success: boolean; error?: string };
  onCompanyRegister: (data: {
    name: string;
    sector: string;
    email: string;
    username: string;
    password: string;
    phone: string;
    city: string;
    adminName: string;
  }) => void;
  onAdminLogin: (username: string, pass: string) => { success: boolean; error?: string };
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const WelcomeGateway: React.FC<WelcomeGatewayProps> = ({
  initialStage = 'select',
  onCompanyLogin,
  onCompanyRegister,
  onAdminLogin,
  onShowToast
}) => {
  // Navigation inside gateway: 'select' | 'company-login' | 'company-register' | 'admin-login'
  const [stage, setStage] = useState<'select' | 'company-login' | 'company-register' | 'admin-login'>(initialStage);

  // Company Login form state
  const [compIdentifier, setCompIdentifier] = useState('');
  const [compPassword, setCompPassword] = useState('');
  const [compError, setCompError] = useState('');
  const [isSubmittingComp, setIsSubmittingComp] = useState(false);

  // Company Register form state
  const [regName, setRegName] = useState('');
  const [regSector, setRegSector] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('+263');
  const [regCity, setRegCity] = useState('Harare');
  const [regAdminName, setRegAdminName] = useState('');
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [regGeneralError, setRegGeneralError] = useState('');
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // Admin Login form state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  // --- Handlers ---
  const handleCompanyLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompError('');
    if (!compIdentifier.trim() || !compPassword.trim()) {
      setCompError('Please enter your username and password.');
      return;
    }

    setIsSubmittingComp(true);
    const result = onCompanyLogin(compIdentifier.trim(), compPassword.trim());
    setIsSubmittingComp(false);

    if (result.success) {
      onShowToast('Signed in successfully. Opening your Dashboard.', 'success');
    } else {
      setCompError(result.error || 'Invalid company credentials.');
    }
  };

  const validateAllRegistrationFields = (): boolean => {
    const errors: Record<string, string> = {};

    const nameCheck = validateCompanyName(regName);
    if (!nameCheck.isValid) errors.name = nameCheck.error!;

    const sectorCheck = validateSector(regSector);
    if (!sectorCheck.isValid) errors.sector = sectorCheck.error!;

    const emailCheck = validateEmail(regEmail);
    if (!emailCheck.isValid) errors.email = emailCheck.error!;

    const phoneCheck = validatePhoneNumber(regPhone);
    if (!phoneCheck.isValid) errors.phone = phoneCheck.error!;

    const cityCheck = validateCity(regCity);
    if (!cityCheck.isValid) errors.city = cityCheck.error!;

    const adminNameCheck = validatePersonName(regAdminName, 'Lead Manager Name');
    if (!adminNameCheck.isValid) errors.adminName = adminNameCheck.error!;

    const usernameCheck = validateUsername(regUsername || regEmail.split('@')[0] || 'user');
    if (!usernameCheck.isValid) errors.username = usernameCheck.error!;

    const passCheck = validatePassword(regPassword);
    if (!passCheck.isValid) errors.password = passCheck.error!;

    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompanyRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegGeneralError('');

    if (!validateAllRegistrationFields()) {
      setRegGeneralError('Please correct the validation errors in the form.');
      onShowToast('Please fix the highlighted input errors.', 'error');
      return;
    }

    setIsSubmittingReg(true);
    try {
      onCompanyRegister({
        name: regName.trim(),
        sector: regSector.trim(),
        email: regEmail.trim(),
        username: regUsername.trim() || regEmail.split('@')[0],
        password: regPassword.trim(),
        phone: regPhone.trim(),
        city: regCity.trim(),
        adminName: regAdminName.trim(),
      });
      onShowToast('Company registered successfully. Welcome to your Dashboard.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setRegGeneralError(msg);
      onShowToast(msg, 'error');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setAdminError('Please enter administrator username and password.');
      return;
    }

    setIsSubmittingAdmin(true);
    const result = onAdminLogin(adminUsername.trim(), adminPassword.trim());
    setIsSubmittingAdmin(false);

    if (result.success) {
      onShowToast('Signed in to Platform Administration.', 'success');
    } else {
      setAdminError(result.error || 'Invalid administrator credentials.');
    }
  };

  // Helper for real-time phone input (only allows digits and optional leading +)
  const handlePhoneInputChange = (raw: string) => {
    // Keep optional leading + if present, and allow only digits
    let cleaned = '';
    if (raw.startsWith('+')) {
      cleaned = '+' + raw.slice(1).replace(/\D/g, '');
    } else {
      cleaned = raw.replace(/\D/g, '');
    }
    setRegPhone(cleaned);

    if (cleaned.length > 0) {
      const check = validatePhoneNumber(cleaned);
      setRegErrors(prev => ({
        ...prev,
        phone: check.isValid ? '' : check.error || ''
      }));
    } else {
      setRegErrors(prev => ({ ...prev, phone: 'Phone number is required.' }));
    }
  };

  // Helper for name input (rejects digits and punctuation)
  const handlePersonNameChange = (raw: string) => {
    setRegAdminName(raw);
    const check = validatePersonName(raw, 'Lead Manager Name');
    setRegErrors(prev => ({
      ...prev,
      adminName: check.isValid ? '' : check.error || ''
    }));
  };

  // Helper for email input
  const handleEmailChange = (raw: string) => {
    setRegEmail(raw);
    const check = validateEmail(raw);
    setRegErrors(prev => ({
      ...prev,
      email: check.isValid ? '' : check.error || ''
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Welcome Banner */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-200/80 rounded text-xs font-semibold text-slate-800">
          <span>Zimbabwe Sentiment Analytics Platform</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to Zimbabwe Customer Sentiment Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Real-time multilingual sentiment analytics engineered for Zimbabwean enterprises across English, chiShona, isiNdebele, and Code-Mixed communications.
        </p>
      </div>

      {/* STAGE 1: Portal Selection - Ask if Admin or Registered Company */}
      {stage === 'select' && (
        <div className="space-y-6">
          <div className="text-center border-b border-slate-200 pb-4">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Are you the Platform Administrator or a Registered Company?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your role below to authenticate with your username and password.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Option 1: Registered Company / SME */}
            <div className="bg-white border-2 border-slate-200 rounded-lg p-6 shadow-xs hover:border-teal-600 hover:shadow-md transition-all flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold">
                    <Building2 className="w-6 h-6 text-teal-700" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                    Business Portal
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Registered Company</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Log in to access your company dashboard with sentiment graphs, feedback classification, and insights. Your data is private and strictly isolated.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setStage('company-login'); setCompError(''); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-600 rounded transition-colors cursor-pointer shadow-xs"
                >
                  <span>Sign In as Company</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Option 2: Platform Administrator */}
            <div className="bg-white border-2 border-slate-200 rounded-lg p-6 shadow-xs hover:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6 text-slate-800" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    Administration
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Platform Administrator</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Sign in to manage registered companies, inspect individual tenant dashboards, delete companies or accounts, and view platform system benchmarks.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setStage('admin-login'); setAdminError(''); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer shadow-xs"
                >
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* New Company Registration Callout */}
          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800">Not registered yet?</div>
              <div className="text-xs text-slate-500">
                Register your business entity to begin tracking customer sentiment across Zimbabwe.
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setStage('company-register'); setRegGeneralError(''); setRegErrors({}); }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-teal-900 bg-teal-100 hover:bg-teal-200 border border-teal-300 rounded transition-colors cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-teal-800" />
              <span>Register New Company</span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: Company Login */}
      {stage === 'company-login' && (
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setStage('select')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Selection</span>
            </button>
            <span className="text-xs font-semibold text-teal-700">Registered Company</span>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">Company Sign In</h2>
          </div>

          {compError && (
            <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {compError}
            </div>
          )}

          <form onSubmit={handleCompanyLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Company Username
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={compIdentifier}
                  onChange={e => setCompIdentifier(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={compPassword}
                  onChange={e => setCompPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingComp}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                <span>Sign In & Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Not registered yet?</span>
              <button
                type="button"
                onClick={() => { setStage('company-register'); setRegGeneralError(''); setRegErrors({}); }}
                className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline-offset-2 hover:underline"
              >
                Register Your Business
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STAGE 3: Company Registration with Strict User Input Validation */}
      {stage === 'company-register' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setStage('select')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Selection</span>
            </button>
            <span className="text-xs font-semibold text-teal-700">New Registration</span>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">Register Business Entity</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your enterprise credentials to provision your dedicated sentiment intelligence dashboard.
            </p>
          </div>

          {regGeneralError && (
            <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {regGeneralError}
            </div>
          )}

          <form onSubmit={handleCompanyRegisterSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Name */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Business Name *
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={e => {
                      setRegName(e.target.value);
                      const chk = validateCompanyName(e.target.value);
                      setRegErrors(prev => ({ ...prev, name: chk.isValid ? '' : chk.error || '' }));
                    }}
                    className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none ${
                      regErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                    }`}
                    required
                  />
                </div>
                {regErrors.name && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{regErrors.name}</p>
                )}
              </div>

              {/* Commercial Sector */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Commercial Sector (Characters Only) *
                </label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={regSector}
                    onChange={e => {
                      setRegSector(e.target.value);
                      const chk = validateSector(e.target.value);
                      setRegErrors(prev => ({ ...prev, sector: chk.isValid ? '' : chk.error || '' }));
                    }}
                    className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none ${
                      regErrors.sector ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                    }`}
                    required
                  />
                </div>
                {regErrors.sector && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{regErrors.sector}</p>
                )}
              </div>

              {/* Corporate Email */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Corporate Email *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => handleEmailChange(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none ${
                      regErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                    }`}
                    required
                  />
                </div>
                {regErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{regErrors.email}</p>
                )}
              </div>

              {/* Telephone Contact (Numbers Only) */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Telephone Contact (Numbers Only) *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => handlePhoneInputChange(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none ${
                      regErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                    }`}
                    required
                  />
                </div>
                {regErrors.phone ? (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{regErrors.phone}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-0.5">Digits only (optional leading + allowed)</p>
                )}
              </div>

              {/* Headquarters City (Characters Only) */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Headquarters City (Characters Only) *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={regCity}
                    onChange={e => {
                      setRegCity(e.target.value);
                      const chk = validateCity(e.target.value);
                      setRegErrors(prev => ({ ...prev, city: chk.isValid ? '' : chk.error || '' }));
                    }}
                    className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none ${
                      regErrors.city ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                    }`}
                    required
                  />
                </div>
                {regErrors.city && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{regErrors.city}</p>
                )}
              </div>

              {/* Lead Manager Name (Characters Only) */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Lead Manager Name (Characters Only) *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={regAdminName}
                    onChange={e => handlePersonNameChange(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 border rounded focus:outline-none ${
                      regErrors.adminName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                    }`}
                    required
                  />
                </div>
                {regErrors.adminName && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{regErrors.adminName}</p>
                )}
              </div>

              {/* Account Username */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Account Username *
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={e => {
                    setRegUsername(e.target.value);
                    const chk = validateUsername(e.target.value);
                    setRegErrors(prev => ({ ...prev, username: chk.isValid ? '' : chk.error || '' }));
                  }}
                  className={`w-full p-2 border rounded focus:outline-none ${
                    regErrors.username ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                  }`}
                  required
                />
                {regErrors.username && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{regErrors.username}</p>
                )}
              </div>

              {/* Account Password */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Account Password *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => {
                    setRegPassword(e.target.value);
                    const chk = validatePassword(e.target.value);
                    setRegErrors(prev => ({ ...prev, password: chk.isValid ? '' : chk.error || '' }));
                  }}
                  className={`w-full p-2 border rounded focus:outline-none ${
                    regErrors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-slate-800'
                  }`}
                  required
                />
                {regErrors.password && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{regErrors.password}</p>
                )}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmittingReg}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                <span>Complete Registration & Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Already registered?</span>
              <button
                type="button"
                onClick={() => { setStage('company-login'); setCompError(''); }}
                className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline-offset-2 hover:underline"
              >
                Sign In Instead
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STAGE 4: Administrator Login */}
      {stage === 'admin-login' && (
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setStage('select')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Selection</span>
            </button>
            <span className="text-xs font-semibold text-slate-700">Platform Admin</span>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">Administrator Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authenticate with administrative credentials to access platform controls.
            </p>
          </div>

          {adminError && (
            <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {adminError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingAdmin}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                <span>Authenticate Platform Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500 space-y-0.5">
              <div>Default platform credentials:</div>
              <div className="font-mono text-slate-700">Username: admin | Password: admin123</div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
