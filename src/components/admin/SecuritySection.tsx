import React, { useState } from 'react';
import { Shield, Lock, EyeOff, CheckCircle2, AlertTriangle, KeyRound, Server } from 'lucide-react';

interface SecuritySectionProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ onShowToast }) => {
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [tlsOnly, setTlsOnly] = useState(true);
  const [ipRestricted, setIpRestricted] = useState(false);
  const [rateLimitPerMin, setRateLimitPerMin] = useState('120');

  const handleSaveSecuritySettings = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Saved', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Security & Governance</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Access perimeter controls, compliance policies, and cryptographic isolation policies
        </p>
      </div>

      {/* Security Posture Summary */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-slate-900">Security Architecture Status</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded font-semibold text-xs bg-teal-50 text-teal-800 border border-teal-200">
            Enterprise Grade (Zero Secret Exposure Policy)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 border border-slate-200 rounded bg-slate-50/50 space-y-1.5">
            <div className="font-semibold text-slate-800">Credential Concealment</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              No API keys, token secrets, or database passwords are ever exposed over client telemetry or browser storage.
            </p>
          </div>

          <div className="p-4 border border-slate-200 rounded bg-slate-50/50 space-y-1.5">
            <div className="font-semibold text-slate-800">Tenant Data Isolation</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Strict cryptographic tenant keys prevent cross-tenant queries between competing SMEs and financial institutions.
            </p>
          </div>

          <div className="p-4 border border-slate-200 rounded bg-slate-50/50 space-y-1.5">
            <div className="font-semibold text-slate-800">Audit Logging</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Tamper-evident audit trail capturing every authenticated actor interaction and inference event.
            </p>
          </div>
        </div>
      </div>

      {/* Security Policy Form */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-xs max-w-2xl space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900">System Security Parameters</h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure authentication and traffic boundaries</p>
        </div>

        <form onSubmit={handleSaveSecuritySettings} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Inactivity Session Timeout (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              value={sessionTimeout}
              onChange={e => setSessionTimeout(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              API Rate Limit Per Client (Requests / Minute)
            </label>
            <input
              type="number"
              min="10"
              max="1000"
              value={rateLimitPerMin}
              onChange={e => setRateLimitPerMin(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mfaEnforced}
                onChange={e => setMfaEnforced(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-0"
              />
              <span className="font-medium text-slate-800">
                Enforce Multi-Factor Authentication (MFA) for Administrative Roles
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tlsOnly}
                onChange={e => setTlsOnly(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-0"
              />
              <span className="font-medium text-slate-800">
                Require Strict TLS 1.3 Encryption for all Inbound Webhooks
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ipRestricted}
                onChange={e => setIpRestricted(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-0"
              />
              <span className="font-medium text-slate-800">
                Restrict Platform Administration to Designated Corporate IP Ranges
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-xs text-white bg-slate-900 rounded hover:bg-slate-800 cursor-pointer"
            >
              Update Security Policies
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
