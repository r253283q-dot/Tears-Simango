import React, { useState, useRef } from 'react';
import { Company, FeedbackItem, ChannelType } from '../../types';
import { Badge } from '../common/Badge';
import { BackButton } from '../common/BackButton';
import {
  Upload,
  FileSpreadsheet,
  Plus,
  Send,
  ListPlus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  FileText
} from 'lucide-react';

interface AnalyseSectionProps {
  company: Company;
  feedbackList: FeedbackItem[];
  onAddSingleFeedback: (text: string, channel: ChannelType, customerIdentifier?: string) => void;
  onAddBatchFeedback: (items: Array<{ text: string; channel: ChannelType; customerIdentifier?: string }>) => void;
  onDeleteFeedback: (id: string) => void;
  onUpdateFeedbackStatus: (id: string, status: FeedbackItem['status']) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AnalyseSection: React.FC<AnalyseSectionProps> = ({
  company,
  feedbackList,
  onAddSingleFeedback,
  onAddBatchFeedback,
  onDeleteFeedback,
  onUpdateFeedbackStatus,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'upload'>('single');

  // Single review form state
  const [singleText, setSingleText] = useState('');
  const [singleChannel, setSingleChannel] = useState<ChannelType>('WhatsApp');
  const [singleIdentifier, setSingleIdentifier] = useState('');
  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);

  // Batch paste state
  const [batchText, setBatchText] = useState('');
  const [batchChannel, setBatchChannel] = useState<ChannelType>('WhatsApp');
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  // CSV upload state
  const [dragActive, setDragActive] = useState(false);
  const [parsedCSVRows, setParsedCSVRows] = useState<Array<{ text: string; channel: ChannelType; identifier?: string }>>([]);
  const [uploadFileName, setUploadFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtering results table
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'All' | 'Positive' | 'Neutral' | 'Negative'>('All');
  const [languageFilter, setLanguageFilter] = useState<'All' | 'English' | 'Shona' | 'Ndebele' | 'Code-Mixed'>('All');
  const [channelFilter, setChannelFilter] = useState<'All' | ChannelType>('All');

  // Drill-down inspection state with Back button
  const [inspectingItem, setInspectingItem] = useState<FeedbackItem | null>(null);

  // Single review submission
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleText.trim()) return;

    setIsSubmittingSingle(true);
    try {
      onAddSingleFeedback(singleText.trim(), singleChannel, singleIdentifier.trim() || undefined);
      setSingleText('');
      setSingleIdentifier('');
      onShowToast('Saved', 'success');
    } catch {
      onShowToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSubmittingSingle(false);
    }
  };

  // Batch paste submission
  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = batchText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 5);

    if (lines.length === 0) return;

    setIsSubmittingBatch(true);
    try {
      const items = lines.map((text, idx) => ({
        text,
        channel: batchChannel,
        customerIdentifier: `Batch Item #${idx + 1}`
      }));
      onAddBatchFeedback(items);
      setBatchText('');
      onShowToast('Saved', 'success');
    } catch {
      onShowToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  // CSV parsing
  const handleCSVFile = (file: File) => {
    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (!content) return;

      const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        onShowToast('File appears empty or missing rows.', 'error');
        return;
      }

      // Check header or parse lines
      const rows: Array<{ text: string; channel: ChannelType; identifier?: string }> = [];
      const dataLines = lines.slice(1); // skip header line

      dataLines.forEach((line, index) => {
        // Simple comma split handling quotes
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/^"|"$/g, '').trim());
        const textVal = parts[0] || '';
        const channelVal = (parts[1] as ChannelType) || 'CSV / Excel';
        const idVal = parts[2] || `Row #${index + 1}`;

        if (textVal.length > 3) {
          rows.push({
            text: textVal,
            channel: ['WhatsApp', 'Facebook', 'TikTok', 'Instagram', 'SMS', 'CSV / Excel'].includes(channelVal)
              ? channelVal
              : 'CSV / Excel',
            identifier: idVal
          });
        }
      });

      setParsedCSVRows(rows);
    };
    reader.readAsText(file);
  };

  const handleImportParsedCSV = () => {
    if (parsedCSVRows.length === 0) return;
    try {
      onAddBatchFeedback(parsedCSVRows);
      setParsedCSVRows([]);
      setUploadFileName('');
      onShowToast('Saved', 'success');
    } catch {
      onShowToast('Something went wrong. Please try again.', 'error');
    }
  };

  // Filtered feedback list
  const filteredList = feedbackList.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerInsight.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.customerIdentifier && item.customerIdentifier.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSentiment = sentimentFilter === 'All' || item.sentiment === sentimentFilter;
    const matchesLanguage = languageFilter === 'All' || item.language === languageFilter;
    const matchesChannel = channelFilter === 'All' || item.channel === channelFilter;

    return matchesSearch && matchesSentiment && matchesLanguage && matchesChannel;
  });

  // Drill-down inspection view
  if (inspectingItem) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => setInspectingItem(null)} label="Back to Analysis Records" />
            <h2 className="text-lg font-semibold text-slate-900">Analysed Feedback Record</h2>
          </div>
          <Badge variant="status" value={inspectingItem.status} />
        </div>

        <div className="bg-white border border-slate-200 rounded p-6 shadow-xs max-w-3xl space-y-6">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Original Feedback Text</div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-slate-900 text-sm leading-relaxed font-sans">
              "{inspectingItem.text}"
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100">
            <div>
              <div className="text-xs text-slate-500 mb-1">Sentiment</div>
              <Badge variant="sentiment" value={inspectingItem.sentiment} />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Language</div>
              <Badge variant="language" value={inspectingItem.language} />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Priority</div>
              <Badge variant="priority" value={inspectingItem.priority} />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Channel</div>
              <Badge variant="channel" value={inspectingItem.channel} />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Primary Issue / Complaint</div>
            <div className="text-sm font-semibold text-slate-900">{inspectingItem.issue}</div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Customer Insight</div>
            <div className="text-sm text-slate-800 bg-teal-50/60 border border-teal-100 rounded p-3">
              {inspectingItem.customerInsight}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <div className="text-slate-500">
              Identifier: <span className="font-medium text-slate-700">{inspectingItem.customerIdentifier || 'Anonymous'}</span>
              <span className="mx-2 text-slate-300">|</span>
              Logged: {new Date(inspectingItem.timestamp).toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onDeleteFeedback(inspectingItem.id);
                  setInspectingItem(null);
                  onShowToast('Feedback record removed.', 'info');
                }}
                className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded cursor-pointer"
              >
                Delete Record
              </button>
              {inspectingItem.status !== 'Resolved' && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateFeedbackStatus(inspectingItem.id, 'Resolved');
                    setInspectingItem(prev => prev ? { ...prev, status: 'Resolved' } : null);
                    onShowToast('Saved', 'success');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded cursor-pointer"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Analyse Feedback</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Process customer feedback across English, Shona, Ndebele, and Code-Mixed Zimbabwean communication
        </p>
      </div>

      {/* Ingestion Methods Tabs */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold cursor-pointer border-r border-slate-200 transition-colors ${
              activeTab === 'single'
                ? 'bg-white text-slate-900 border-b-2 border-b-teal-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            <span>Single Feedback</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold cursor-pointer border-r border-slate-200 transition-colors ${
              activeTab === 'batch'
                ? 'bg-white text-slate-900 border-b-2 border-b-teal-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5 text-teal-600" />
            <span>Batch Paste</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 border-b-2 border-b-teal-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-teal-600" />
            <span>CSV / Excel Upload</span>
          </button>
        </div>

        {/* Tab 1: Single Review */}
        {activeTab === 'single' && (
          <form onSubmit={handleSingleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="single-feedback-text" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Feedback Text
              </label>
              <textarea
                id="single-feedback-text"
                rows={3}
                value={singleText}
                onChange={e => setSingleText(e.target.value)}
                placeholder="Paste or type customer message in English, Shona, Ndebele, or Code-Mixed..."
                className="w-full text-sm p-3 bg-white border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="single-feedback-channel" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Source Channel
                </label>
                <select
                  id="single-feedback-channel"
                  value={singleChannel}
                  onChange={e => setSingleChannel(e.target.value as ChannelType)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="SMS">SMS</option>
                  <option value="CSV / Excel">Direct Customer Contact</option>
                </select>
              </div>

              <div>
                <label htmlFor="single-customer-id" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Customer Identifier (Optional)
                </label>
                <input
                  id="single-customer-id"
                  type="text"
                  value={singleIdentifier}
                  onChange={e => setSingleIdentifier(e.target.value)}
                  placeholder="e.g. +263 77 123 4567 or handle"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Automatic language detection, sentiment, issue classification and priority tagging.
              </span>
              <button
                type="submit"
                disabled={isSubmittingSingle || !singleText.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Analyse & Save</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Batch Paste */}
        {activeTab === 'batch' && (
          <form onSubmit={handleBatchSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="batch-feedback-text" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Pasted Customer Reviews (One review per line)
              </label>
              <textarea
                id="batch-feedback-text"
                rows={6}
                value={batchText}
                onChange={e => setBatchText(e.target.value)}
                placeholder="Enter multiple reviews, one per line:&#10;EcoCash deduction completed but token haasati auya&#10;Siyabonga kakhulu for fast delivery yesterday&#10;Inverter is working very well stereki"
                className="w-full text-sm p-3 bg-white border border-slate-300 rounded font-mono text-xs focus:border-slate-800 focus:outline-none"
                required
              />
            </div>

            <div className="max-w-xs">
              <label htmlFor="batch-feedback-channel" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Channel
              </label>
              <select
                id="batch-feedback-channel"
                value={batchChannel}
                onChange={e => setBatchChannel(e.target.value as ChannelType)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram</option>
                <option value="SMS">SMS</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Each non-empty line will be analysed and saved to the company repository.
              </span>
              <button
                type="submit"
                disabled={isSubmittingBatch || !batchText.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>Process Batch</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: CSV/Excel Upload */}
        {activeTab === 'upload' && (
          <div className="p-6 space-y-4">
            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={e => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleCSVFile(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded p-8 text-center transition-colors cursor-pointer ${
                dragActive ? 'border-teal-600 bg-teal-50/40' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleCSVFile(e.target.files[0]);
                  }
                }}
              />
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-[1.5]" />
              <div className="text-sm font-semibold text-slate-800">
                {uploadFileName ? uploadFileName : 'Select CSV or Drop File Here'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                CSV format: Feedback Text, Channel, Customer Identifier
              </p>
            </div>

            {parsedCSVRows.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-800">
                    Parsed Preview: {parsedCSVRows.length} Feedback Records Ready
                  </div>
                  <button
                    type="button"
                    onClick={handleImportParsedCSV}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded cursor-pointer"
                  >
                    Commit & Save All Records
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto divide-y divide-slate-200 text-xs text-slate-700 bg-white border border-slate-200 rounded">
                  {parsedCSVRows.slice(0, 5).map((row, idx) => (
                    <div key={idx} className="p-2 flex items-center justify-between gap-4">
                      <span className="truncate max-w-md">{row.text}</span>
                      <span className="text-slate-400 shrink-0 font-medium">{row.channel}</span>
                    </div>
                  ))}
                  {parsedCSVRows.length > 5 && (
                    <div className="p-2 text-center text-slate-400 text-[11px] font-medium bg-slate-50">
                      + {parsedCSVRows.length - 5} more records
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search feedback or insight..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Sentiment:</span>
              <select
                value={sentimentFilter}
                onChange={e => setSentimentFilter(e.target.value as any)}
                className="px-2 py-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-none"
              >
                <option value="All">All Sentiments</option>
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Language:</span>
              <select
                value={languageFilter}
                onChange={e => setLanguageFilter(e.target.value as any)}
                className="px-2 py-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-none"
              >
                <option value="All">All Languages</option>
                <option value="English">English</option>
                <option value="Shona">Shona</option>
                <option value="Ndebele">Ndebele</option>
                <option value="Code-Mixed">Code-Mixed</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Channel:</span>
              <select
                value={channelFilter}
                onChange={e => setChannelFilter(e.target.value as any)}
                className="px-2 py-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-none"
              >
                <option value="All">All Channels</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram</option>
                <option value="SMS">SMS</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Analysed Feedback Records Table */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Analysed Feedback Records</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredList.length} of {feedbackList.length} total company records
            </p>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No feedback records match the current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold tracking-wider">
                  <th className="py-2.5 px-4">Feedback</th>
                  <th className="py-2.5 px-3">Sentiment</th>
                  <th className="py-2.5 px-3">Complaint / Issue</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Customer Insight</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 max-w-xs truncate text-slate-900 font-medium" title={item.text}>
                      {item.text}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="sentiment" value={item.sentiment} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {item.issue}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="priority" value={item.priority} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="language" value={item.language} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="channel" value={item.channel} size="sm" />
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-600" title={item.customerInsight}>
                      {item.customerInsight}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectingItem(item)}
                        className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline-offset-2 hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
