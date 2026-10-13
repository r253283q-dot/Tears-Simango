import React, { useState } from 'react';
import { Sliders, Save, Server, Globe, Database, HardDrive } from 'lucide-react';

interface SystemSettingsSectionProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SystemSettingsSection: React.FC<SystemSettingsSectionProps> = ({ onShowToast }) => {
  const [appName, setAppName] = useState('Zimbabwe Customer Sentiment Intelligence');
  const [timezone, setTimezone] = useState('Africa/Harare (CAT, UTC+2)');
  const [dataRetentionDays, setDataRetentionDays] = useState('365');
  const [maxBatchUploadSize, setMaxBatchUploadSize] = useState('5000');
  const [autoPurgeResolved, setAutoPurgeResolved] = useState(false);
  const [enableWebhookSync, setEnableWebhookSync] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Saved', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Global platform parameters, localization, and ingestion constraints
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded p-6 shadow-xs max-w-2xl space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900">Platform Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">Global operational defaults</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Application Title</label>
            <input
              type="text"
              value={appName}
              onChange={e => setAppName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Platform Timezone</label>
            <input
              type="text"
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800 bg-slate-50"
              readOnly
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Data Retention Period (Days)
              </label>
              <input
                type="number"
                value={dataRetentionDays}
                onChange={e => setDataRetentionDays(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Max Batch Rows Per CSV
              </label>
              <input
                type="number"
                value={maxBatchUploadSize}
                onChange={e => setMaxBatchUploadSize(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableWebhookSync}
                onChange={e => setEnableWebhookSync(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-0"
              />
              <span className="font-medium text-slate-800">
                Allow Asynchronous Real-Time Webhook Ingestion for WhatsApp Business API
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPurgeResolved}
                onChange={e => setAutoPurgeResolved(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-0"
              />
              <span className="font-medium text-slate-800">
                Archive Resolved Feedback Items Older Than 180 Days
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-xs text-white bg-slate-900 rounded hover:bg-slate-800 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
