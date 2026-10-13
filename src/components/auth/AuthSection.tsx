import React, { useState } from 'react';
import { Building2, Lock, Mail, User, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthSectionProps {
  initialMode?: 'login' | 'register';
  onLogin: (usernameOrEmail: string, password: string) => { success: boolean; error?: string };
  onRegister: (data: {
    name: string;
    sector: string;
    email: string;
    username: string;
    password: string;
    phone: string;
    city: string;
    adminName: string;
  }) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthSection: React.FC<AuthSectionProps> = ({
  initialMode = 'login',
  onLogin,
  onRegister,
  onShowToast
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Register form state
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+263 ');
  const [city, setCity] = useState('Harare');
  const [adminName, setAdminName] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both your username and password.');
      return;
    }

    setIsSubmittingLogin(true);
    const result = onLogin(loginIdentifier.trim(), loginPassword.trim());
    setIsSubmittingLogin(false);

    if (result.success) {
      onShowToast('Signed in successfully.', 'success');
    } else {
      setLoginError(result.error || 'Invalid credentials. Please verify your details.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (!companyName.trim() || !email.trim() || !password.trim() || !adminName.trim()) {
      setRegisterError('Please fill in all mandatory enterprise fields.');
      return;
    }

    setIsSubmittingRegister(true);
    try {
      onRegister({
        name: companyName.trim(),
        sector: sector.trim() || 'General Commerce',
        email: email.trim(),
        username: username.trim() || email.split('@')[0],
        password: password.trim(),
        phone: phone.trim(),
        city: city.trim(),
        adminName: adminName.trim(),
      });
      onShowToast('Company workspace registered and signed in.', 'success');
    } catch (err: any) {
      setRegisterError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmittingRegister(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-6">
      {/* Outer Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Header Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => { setMode('login'); setLoginError(''); }}
            className={`flex-1 py-3 text-xs font-semibold cursor-pointer text-center transition-colors border-r border-slate-200 ${
              mode === 'login'
                ? 'bg-white text-slate-900 border-b-2 border-b-teal-600'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            Company Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setRegisterError(''); }}
            className={`flex-1 py-3 text-xs font-semibold cursor-pointer text-center transition-colors ${
              mode === 'register'
                ? 'bg-white text-slate-900 border-b-2 border-b-teal-600'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            Register New Business
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <div className="text-sm font-bold text-slate-900">Sign In to Company Workspace</div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your enterprise username or corporate email and password to access your isolated sentiment data.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. manager@yourcompany.co.zw or username"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingLogin}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Don't have a business account?</span>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setRegisterError(''); }}
                  className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline-offset-2 hover:underline"
                >
                  Register Business
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <div className="text-sm font-bold text-slate-900">Register New Company Account</div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Provision an isolated sentiment repository protected with secure authentication credentials.
                </p>
              </div>

              {registerError && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                  {registerError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commercial Sector</label>
                  <input
                    type="text"
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Desired Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Secure Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telephone Contact</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Headquarters City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Manager Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingRegister}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span>Register Business & Log In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Already registered your business?</span>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setLoginError(''); }}
                  className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline-offset-2 hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
