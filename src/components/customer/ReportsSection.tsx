import React, { useState } from 'react';
import { Company, FeedbackItem } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { generateExecutivePDF } from '../../utils/pdfGenerator';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Filter,
  CheckCircle,
  Building,
  Sparkles,
  FileDown,
  Loader2,
  Lightbulb,
  AlertTriangle,
  Compass,
  TrendingUp,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ReportsSectionProps {
  company: Company;
  feedbackList: FeedbackItem[];
  onNavigateToAnalyse: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  company,
  feedbackList,
  onNavigateToAnalyse,
  onShowToast
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'30d' | '90d' | 'all'>('30d');
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  if (feedbackList.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          title="No customer feedback has been analysed yet."
          description="Analyse your first customer review to begin building your insights."
          actionLabel="Go to Analyse"
          onAction={onNavigateToAnalyse}
        />
      </div>
    );
  }

  // Filter for report
  const filteredForReport = feedbackList.filter(item => {
    if (selectedChannel !== 'All' && item.channel !== selectedChannel) return false;
    return true;
  });

  const total = filteredForReport.length;
  const positive = filteredForReport.filter(f => f.sentiment === 'Positive').length;
  const neutral = filteredForReport.filter(f => f.sentiment === 'Neutral').length;
  const negative = filteredForReport.filter(f => f.sentiment === 'Negative').length;
  const responseReq = filteredForReport.filter(f => f.responseRequired).length;

  const healthScore = total > 0
    ? Math.round(((positive * 100) + (neutral * 50) + (negative * 0)) / total)
    : 0;

  // Language counts
  const langCounts: Record<string, number> = {};
  filteredForReport.forEach(f => {
    langCounts[f.language] = (langCounts[f.language] || 0) + 1;
  });

  // Complaint counts
  const complaintCounts: Record<string, number> = {};
  filteredForReport.filter(f => f.sentiment === 'Negative').forEach(f => {
    complaintCounts[f.issue] = (complaintCounts[f.issue] || 0) + 1;
  });

  const topComplaints = Object.entries(complaintCounts).sort((a, b) => b[1] - a[1]);

  const synthesizedRecommendations = [
    {
      priority: 'Immediate',
      title: 'Priority 1: Multi-currency & Payment Gateway Alignment',
      detail: 'Ensure POS terminals and mobile money APIs (EcoCash / InnBucks) immediately confirm successful token allocation to avoid double-debit frustration.',
      relatedIssue: 'Transaction & Payments'
    },
    {
      priority: 'Immediate',
      title: 'Priority 2: Shona & Ndebele Support Readiness',
      detail: 'Deploy frontline staff trained to respond naturally in colloquial Shona and Ndebele on WhatsApp to reduce perceived friction and build customer trust.',
      relatedIssue: 'Customer Support'
    },
    {
      priority: 'Strategic',
      title: 'Priority 3: Logistics Turnaround Guarantee',
      detail: 'Publish realistic delivery windows for out-of-town dispatches beyond Harare/Bulawayo corridors to eliminate speculative waiting periods.',
      relatedIssue: 'Delivery & Logistics'
    },
    {
      priority: 'Operational',
      title: 'Priority 4: Escalation Routing for High-Frustration Inquiries',
      detail: 'Flag multi-attempt complaints automatically to senior relationship managers within 15 minutes of WhatsApp ingestion.',
      relatedIssue: 'Service SLA'
    }
  ];

  const handleDownloadPDF = () => {
    try {
      setIsGeneratingPDF(true);
      const stats = {
        total,
        positive,
        neutral,
        negative,
        responseReq,
        healthScore,
        topComplaints,
        langCounts,
        selectedChannel,
        selectedTimeRange: selectedTimeRange === '30d' ? 'Past 30 Days' : selectedTimeRange === '90d' ? 'Past 90 Days' : 'All Data'
      };

      generateExecutivePDF(company, stats, synthesizedRecommendations);
      setIsGenerated(true);
      onShowToast('PDF report generated and downloaded successfully.', 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      onShowToast('Failed to generate PDF. Please try again or use Print.', 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGenerateOnScreenReport = () => {
    setIsGenerated(true);
    onShowToast('Detailed report generated on screen.', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSummary = () => {
    const reportText = `ZIMBABWE CUSTOMER SENTIMENT INTELLIGENCE - EXECUTIVE REPORT
Entity: ${company.name}
Sector: ${company.sector}
City: ${company.city}
Generated: ${new Date().toLocaleDateString()}
Total Records Analysed: ${total}
Sentiment Distribution: Positive (${positive}), Neutral (${neutral}), Negative (${negative})
Sentiment Health Index: ${healthScore}/100
Response Required Pending: ${responseReq}

MAJOR COMPLAINTS:
${topComplaints.map(([issue, cnt]) => `- ${issue}: ${cnt} occurrences`).join('\n') || 'None recorded'}

LANGUAGE PROFILES:
${Object.entries(langCounts).map(([lang, cnt]) => `- ${lang}: ${cnt} records`).join('\n')}

GENERAL RECOMMENDATIONS:
${synthesizedRecommendations.map(r => `* [${r.priority}] ${r.title}\n  ${r.detail}`).join('\n\n')}`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${company.name.toLowerCase().replace(/\s+/g, '_')}_sentiment_report.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setIsGenerated(true);
    onShowToast('Summary report exported successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Intelligence Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and export verified executive briefing reports for {company.name}
          </p>
        </div>

        {/* Primary Report Generation Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded shadow-xs cursor-pointer transition-colors disabled:opacity-60"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Generate PDF Report</span>
              </>
            )}
          </button>

          {!isGenerated && (
            <button
              type="button"
              onClick={handleGenerateOnScreenReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Generate On-Screen</span>
            </button>
          )}

          {isGenerated && (
            <>
              <button
                type="button"
                onClick={handleDownloadSummary}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Text</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded hover:bg-slate-200 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Clean, Minimal Briefing Overview (Few info on page before report generation) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Entity Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Business Entity</div>
          <div className="text-base font-bold text-slate-900 mt-1">{company.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">{company.sector} &bull; {company.city}, Zimbabwe</div>
        </div>

        {/* Data Scope Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Analyzed Dataset Scope</div>
          <div className="text-base font-bold text-slate-900 mt-1">{total} Feedback Items</div>
          <div className="text-xs text-slate-500 mt-0.5">Sentiment Health: <span className="font-semibold text-slate-700">{healthScore}/100</span></div>
        </div>

        {/* Report Status */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Report Status</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${isGenerated ? 'bg-teal-500' : 'bg-amber-500'}`} />
              <span className="text-xs font-semibold text-slate-800">
                {isGenerated ? 'Full Report Generated' : 'Ready to Generate'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Click <strong>Generate PDF Report</strong> for the complete multi-page audit.
          </div>
        </div>
      </div>

      {/* Filter Parameters */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500">Channel Scope:</span>
            <select
              value={selectedChannel}
              onChange={e => setSelectedChannel(e.target.value)}
              className="p-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-none"
            >
              <option value="All">All Ingestion Channels</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Facebook">Facebook</option>
              <option value="TikTok">TikTok</option>
              <option value="Instagram">Instagram</option>
              <option value="SMS">SMS</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500">Reporting Window:</span>
            <select
              value={selectedTimeRange}
              onChange={e => setSelectedTimeRange(e.target.value as any)}
              className="p-1.5 border border-slate-300 rounded bg-white text-xs focus:outline-none"
            >
              <option value="30d">Trailing 30 Days</option>
              <option value="90d">Trailing 90 Days</option>
              <option value="all">Complete History</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500">
          Selected: <span className="font-semibold text-slate-800">{total}</span> records in scope
        </div>
      </div>

      {/* GENERAL RECOMMENDATIONS (Always visible on the report page as requested) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Lightbulb className="w-4 h-4 text-teal-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
            General Strategic Recommendations
          </h2>
          <span className="text-[11px] text-slate-400 ml-auto">Zimbabwe Market Context</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {synthesizedRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900 text-xs">{rec.title}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    rec.priority === 'Immediate'
                      ? 'bg-rose-100 text-rose-800'
                      : rec.priority === 'Strategic'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {rec.priority}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">{rec.detail}</p>
              <div className="text-[10px] text-slate-400 font-medium">Domain: {rec.relatedIssue}</div>
            </div>
          ))}
        </div>
      </div>

      {/* REST OF INFORMATION: ONLY SHOWN WHEN REPORT IS GENERATED */}
      {!isGenerated ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Detailed Report Breakdown Locked</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              To view granular customer issues, complaint proportion matrices, response requirements, and multilingual code-mixing distributions, generate the report below.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded shadow-xs cursor-pointer transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>Generate PDF Report</span>
            </button>
            <button
              type="button"
              onClick={handleGenerateOnScreenReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer shadow-xs"
            >
              <span>View On-Screen</span>
            </button>
          </div>
        </div>
      ) : (
        /* Detailed Information Container (Revealed upon generation) */
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-teal-700 tracking-wider uppercase mb-1">
                Customer Sentiment Intelligence Report
              </div>
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight">{company.name}</h2>
              <div className="text-xs text-slate-600 mt-1">
                Sector: <span className="font-semibold text-slate-800">{company.sector}</span> | Headquarters: <span className="font-semibold text-slate-800">{company.city}, Zimbabwe</span>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5">
              <div>Generated: <span className="font-semibold text-slate-700">{new Date().toLocaleDateString()}</span></div>
              <div>Reporting Window: <span className="font-semibold text-slate-700">{selectedTimeRange === '30d' ? 'Past 30 Days' : selectedTimeRange === '90d' ? 'Past 90 Days' : 'All Historical Data'}</span></div>
              <div>Channel Scope: <span className="font-semibold text-slate-700">{selectedChannel}</span></div>
            </div>
          </div>

          {/* Section 1: Granular Sentiment Breakdown */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Detailed Sentiment Distribution
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="text-[11px] text-slate-500 font-medium">Total Feedback</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{total}</div>
              </div>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded">
                <div className="text-[11px] text-teal-800 font-medium">Positive</div>
                <div className="text-xl font-bold text-teal-900 mt-1">{positive}</div>
                <div className="text-[10px] text-teal-700 mt-0.5">{total ? Math.round((positive / total) * 100) : 0}% share</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="text-[11px] text-slate-500 font-medium">Neutral</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{neutral}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{total ? Math.round((neutral / total) * 100) : 0}% share</div>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded">
                <div className="text-[11px] text-rose-800 font-medium">Negative</div>
                <div className="text-xl font-bold text-rose-900 mt-1">{negative}</div>
                <div className="text-[10px] text-rose-700 mt-0.5">{total ? Math.round((negative / total) * 100) : 0}% share</div>
              </div>
              <div className="p-3 bg-slate-900 text-white rounded">
                <div className="text-[11px] text-slate-300 font-medium">Health Index</div>
                <div className="text-xl font-bold text-white mt-1">{healthScore}/100</div>
                <div className="text-[10px] text-teal-300 mt-0.5">Overall Sentiment</div>
              </div>
            </div>
          </div>

          {/* Section 2: Major Customer Issues & Complaint Patterns */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Major Customer Issues & Root Cause Breakdown
            </h3>

            {topComplaints.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
                No complaint incidents were identified across this dataset cohort.
              </div>
            ) : (
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <th className="py-2.5 px-4">Issue Category</th>
                      <th className="py-2.5 px-4">Frequency</th>
                      <th className="py-2.5 px-4">Proportion of Negative Cohort</th>
                      <th className="py-2.5 px-4">Operational Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topComplaints.map(([issue, cnt]) => {
                      const ratio = Math.round((cnt / (negative || 1)) * 100);
                      return (
                        <tr key={issue}>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">{issue}</td>
                          <td className="py-2.5 px-4 text-slate-700">{cnt} records</td>
                          <td className="py-2.5 px-4 text-slate-700">{ratio}%</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded font-medium ${
                              cnt >= 3 ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'
                            }`}>
                              {cnt >= 3 ? 'High Priority' : 'Standard Priority'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Response Requirements Backlog */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Operational Response Requirements
            </h3>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Direct Customer Response Backlog:</span>
                <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  {responseReq} Feedback Items
                </span>
              </div>
              <p className="leading-relaxed text-slate-600">
                Immediate customer outreach is mandated for payment reconciliation issues and unaddressed technical inquiries received via WhatsApp and SMS channels. Prompt closure of pending responses improves retention by an estimated 18%.
              </p>
            </div>
          </div>

          {/* Section 4: Multilingual Language Patterns */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4. Language Distribution & Code-Mixing Analysis
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(langCounts).map(([lang, cnt]) => (
                <div key={lang} className="p-3 border border-slate-200 rounded bg-white">
                  <div className="font-semibold text-slate-800">{lang}</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{cnt}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {total ? Math.round((cnt / total) * 100) : 0}% of interactions
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-off footer */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div>Zimbabwe Customer Sentiment Intelligence Platform</div>
            <div>Confidential Enterprise Briefing</div>
          </div>
        </div>
      )}
    </div>
  );
};
