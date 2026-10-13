import React, { useState } from 'react';
import { Company, FeedbackItem } from '../../types';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { BackButton } from '../common/BackButton';
import {
  MessageSquare,
  ThumbsUp,
  Minus,
  ThumbsDown,
  AlertTriangle,
  HeartPulse,
  ChevronRight,
  TrendingUp,
  BarChart2,
  PieChart
} from 'lucide-react';

interface CustomerDashboardProps {
  company: Company | null;
  feedbackList: FeedbackItem[];
  onNavigateToAnalyse: () => void;
  onNavigateToRegistration?: () => void;
  onSelectFeedbackDetail?: (item: FeedbackItem) => void;
  onUpdateFeedbackStatus: (id: string, status: FeedbackItem['status']) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  company,
  feedbackList,
  onNavigateToAnalyse,
  onNavigateToRegistration,
  onUpdateFeedbackStatus,
}) => {
  const [selectedIssueDetail, setSelectedIssueDetail] = useState<FeedbackItem | null>(null);

  if (!company) {
    return (
      <div className="py-8">
        <EmptyState
          title="No company registered yet."
          description="Register your business to begin analysing customer feedback."
          actionLabel="Register Business"
          onAction={onNavigateToRegistration || onNavigateToAnalyse}
        />
      </div>
    );
  }

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

  // Calculate Metrics
  const total = feedbackList.length;
  const positive = feedbackList.filter(f => f.sentiment === 'Positive').length;
  const neutral = feedbackList.filter(f => f.sentiment === 'Neutral').length;
  const negative = feedbackList.filter(f => f.sentiment === 'Negative').length;
  const responseRequired = feedbackList.filter(f => f.responseRequired && f.status !== 'Resolved').length;

  const posPct = Math.round((positive / total) * 100) || 0;
  const neuPct = Math.round((neutral / total) * 100) || 0;
  const negPct = Math.round((negative / total) * 100) || 0;

  // Sentiment Health Score (0 - 100)
  const healthScore = Math.round(
    ((positive * 100) + (neutral * 50) + (negative * 0)) / (total || 1)
  );

  let healthStatus = 'Stable';
  let healthVariant: 'positive' | 'warning' | 'negative' = 'positive';
  if (healthScore >= 75) {
    healthStatus = 'Healthy';
    healthVariant = 'positive';
  } else if (healthScore >= 50) {
    healthStatus = 'Moderate';
    healthVariant = 'warning';
  } else {
    healthStatus = 'Requires Attention';
    healthVariant = 'negative';
  }

  // Language Breakdown
  const languageCounts = {
    English: feedbackList.filter(f => f.language === 'English').length,
    Shona: feedbackList.filter(f => f.language === 'Shona').length,
    Ndebele: feedbackList.filter(f => f.language === 'Ndebele').length,
    'Code-Mixed': feedbackList.filter(f => f.language === 'Code-Mixed').length,
  };

  // Platform Breakdown
  const channelCounts: Record<string, number> = {
    WhatsApp: 0,
    Facebook: 0,
    SMS: 0,
    Instagram: 0,
    TikTok: 0,
  };
  feedbackList.forEach(f => {
    channelCounts[f.channel] = (channelCounts[f.channel] || 0) + 1;
  });

  // Complaint Areas
  const complaintCounts: Record<string, number> = {};
  feedbackList.filter(f => f.sentiment === 'Negative' || f.priority === 'High').forEach(f => {
    complaintCounts[f.issue] = (complaintCounts[f.issue] || 0) + 1;
  });

  const topComplaints = Object.entries(complaintCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Time Series Data for Line/Area Graph (last 7 days or chronological buckets)
  const timeBuckets: Record<string, { date: string; positive: number; negative: number; neutral: number; total: number }> = {};
  feedbackList.forEach(f => {
    const d = new Date(f.timestamp).toISOString().split('T')[0];
    if (!timeBuckets[d]) {
      timeBuckets[d] = { date: d, positive: 0, negative: 0, neutral: 0, total: 0 };
    }
    timeBuckets[d].total++;
    if (f.sentiment === 'Positive') timeBuckets[d].positive++;
    if (f.sentiment === 'Negative') timeBuckets[d].negative++;
    if (f.sentiment === 'Neutral') timeBuckets[d].neutral++;
  });

  const sortedTimePoints = Object.values(timeBuckets)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  // Secondary drill-down inspection view
  if (selectedIssueDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => setSelectedIssueDetail(null)} label="Back to Dashboard" />
            <h2 className="text-lg font-semibold text-slate-900">Feedback Record Details</h2>
          </div>
          <Badge variant="status" value={selectedIssueDetail.status} />
        </div>

        <div className="bg-white border border-slate-200 rounded p-6 shadow-xs max-w-3xl space-y-6">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer Feedback Text</div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded text-slate-800 text-sm leading-relaxed">
              "{selectedIssueDetail.text}"
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100">
            <div>
              <div className="text-xs text-slate-500 mb-1">Sentiment</div>
              <Badge variant="sentiment" value={selectedIssueDetail.sentiment} />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Language</div>
              <Badge variant="language" value={selectedIssueDetail.language} />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Priority</div>
              <Badge variant="priority" value={selectedIssueDetail.priority} />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Channel</div>
              <Badge variant="channel" value={selectedIssueDetail.channel} />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Primary Issue Area</div>
            <div className="text-sm font-medium text-slate-900">{selectedIssueDetail.issue}</div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Operational Customer Insight</div>
            <div className="text-sm text-slate-700 bg-teal-50/60 border border-teal-100 rounded p-3">
              {selectedIssueDetail.customerInsight}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Identifier: <span className="font-medium text-slate-700">{selectedIssueDetail.customerIdentifier || 'Anonymous'}</span> | Date: {new Date(selectedIssueDetail.timestamp).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              {selectedIssueDetail.status !== 'Resolved' && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateFeedbackStatus(selectedIssueDetail.id, 'Resolved');
                    setSelectedIssueDetail(prev => prev ? { ...prev, status: 'Resolved' } : null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 rounded hover:bg-teal-700 cursor-pointer"
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

  // Calculate SVG donut coordinates
  // Circle circumference with r=40 is ~251.32
  const c = 2 * Math.PI * 40;
  const strokePositive = (posPct / 100) * c;
  const strokeNeutral = (neuPct / 100) * c;
  const strokeNegative = (negPct / 100) * c;

  const offsetPositive = 0;
  const offsetNeutral = -strokePositive;
  const offsetNegative = -(strokePositive + strokeNeutral);

  // SVG Line Chart Max Calculation
  const maxTimeVol = Math.max(...sortedTimePoints.map(p => p.total), 5);
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  const getX = (index: number) => {
    if (sortedTimePoints.length <= 1) return chartWidth / 2;
    return paddingX + (index * (chartWidth - 2 * paddingX)) / (sortedTimePoints.length - 1);
  };

  const getY = (val: number) => {
    return chartHeight - paddingY - (val / maxTimeVol) * (chartHeight - 2 * paddingY);
  };

  // Generate SVG path points
  const posPathPoints = sortedTimePoints.map((p, i) => `${getX(i)},${getY(p.positive)}`).join(' ');
  const negPathPoints = sortedTimePoints.map((p, i) => `${getX(i)},${getY(p.negative)}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational sentiment intelligence for <span className="font-semibold text-slate-700">{company.name}</span> ({company.sector})
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToAnalyse}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Analyse New Feedback</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Feedback"
          value={total}
          subtitle="All recorded feedback"
          icon={MessageSquare}
        />
        <StatCard
          title="Positive"
          value={positive}
          subtitle={`${posPct}% of total`}
          variant="positive"
          icon={ThumbsUp}
        />
        <StatCard
          title="Neutral"
          value={neutral}
          subtitle={`${neuPct}% of total`}
          icon={Minus}
        />
        <StatCard
          title="Negative"
          value={negative}
          subtitle={`${negPct}% of total`}
          variant="negative"
          icon={ThumbsDown}
        />
        <StatCard
          title="Action Required"
          value={responseRequired}
          subtitle="Pending customer items"
          variant="warning"
          icon={AlertTriangle}
        />
        <StatCard
          title="Sentiment Health"
          value={`${healthScore}/100`}
          subtitle={healthStatus}
          variant={healthVariant}
          icon={HeartPulse}
        />
      </div>

      {/* Visual Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph 1: Sentiment Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Sentiment Distribution Graph</h2>
            <span className="text-xs text-slate-400">Proportional Share</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            {/* SVG Donut */}
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-100 fill-none"
                  strokeWidth="12"
                />
                {/* Positive (Teal) */}
                {positive > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-teal-600 fill-none"
                    strokeWidth="12"
                    strokeDasharray={`${strokePositive} ${c}`}
                    strokeDashoffset={offsetPositive}
                  />
                )}
                {/* Neutral (Slate) */}
                {neutral > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-400 fill-none"
                    strokeWidth="12"
                    strokeDasharray={`${strokeNeutral} ${c}`}
                    strokeDashoffset={offsetNeutral}
                  />
                )}
                {/* Negative (Rose) */}
                {negative > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-rose-600 fill-none"
                    strokeWidth="12"
                    strokeDasharray={`${strokeNegative} ${c}`}
                    strokeDashoffset={offsetNegative}
                  />
                )}
              </svg>
              {/* Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-slate-900 leading-none">{healthScore}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mt-0.5">Health</span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-2.5 text-xs w-full max-w-[180px]">
              <div className="flex items-center justify-between p-2 rounded bg-teal-50/60 border border-teal-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  <span className="font-semibold text-slate-800">Positive</span>
                </div>
                <span className="font-bold text-teal-800">{positive} ({posPct}%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="font-semibold text-slate-800">Neutral</span>
                </div>
                <span className="font-bold text-slate-700">{neutral} ({neuPct}%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-rose-50/60 border border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span className="font-semibold text-slate-800">Negative</span>
                </div>
                <span className="font-bold text-rose-800">{negative} ({negPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graph 2: Sentiment Timeline Area & Line Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Sentiment Trajectory Graph</h2>
              <p className="text-xs text-slate-500">Timeline tracking of customer polarity</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-teal-700">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                Positive
              </span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                Negative
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            {sortedTimePoints.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No temporal points recorded yet.
              </div>
            ) : (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44">
                {/* Horizontal Grid lines */}
                <line x1={paddingX} y1={getY(0)} x2={chartWidth - paddingX} y2={getY(0)} className="stroke-slate-200 stroke-1" />
                <line x1={paddingX} y1={getY(maxTimeVol / 2)} x2={chartWidth - paddingX} y2={getY(maxTimeVol / 2)} className="stroke-slate-100 stroke-1 stroke-dasharray-2" />
                <line x1={paddingX} y1={getY(maxTimeVol)} x2={chartWidth - paddingX} y2={getY(maxTimeVol)} className="stroke-slate-100 stroke-1 stroke-dasharray-2" />

                {/* Positive Line */}
                {sortedTimePoints.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="2.5"
                    points={posPathPoints}
                  />
                )}

                {/* Negative Line */}
                {sortedTimePoints.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#e11d48"
                    strokeWidth="2.5"
                    points={negPathPoints}
                  />
                )}

                {/* Data Points */}
                {sortedTimePoints.map((p, idx) => (
                  <g key={idx}>
                    {/* Positive circle */}
                    <circle
                      cx={getX(idx)}
                      cy={getY(p.positive)}
                      r="4"
                      className="fill-teal-600 stroke-white stroke-2"
                    />
                    {/* Negative circle */}
                    <circle
                      cx={getX(idx)}
                      cy={getY(p.negative)}
                      r="4"
                      className="fill-rose-600 stroke-white stroke-2"
                    />
                    {/* Date label */}
                    <text
                      x={getX(idx)}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      className="text-[9px] fill-slate-400 font-sans"
                    >
                      {p.date.substring(5)}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 of Visual Graphs: Complaints Bar Chart & Channel Column Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 3: Complaints Frequency Horizontal Bar Graph */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Complaint Areas Bar Graph</h2>
            <span className="text-xs text-slate-400">By Incident Frequency</span>
          </div>

          {topComplaints.length === 0 ? (
            <div className="text-xs text-slate-500 py-8 text-center">
              No negative or priority complaints recorded.
            </div>
          ) : (
            <div className="space-y-3.5 pt-1">
              {topComplaints.map(([category, count]) => {
                const maxCount = topComplaints[0]?.[1] || 1;
                const barWidth = Math.round((count / maxCount) * 100);

                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{category}</span>
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {count} incidents
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(8, barWidth)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Graph 4: Communication Channels Column Graph */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Communication Channels Volume</h2>
            <span className="text-xs text-slate-400">Feedback Origin</span>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-2 items-end h-44">
            {Object.entries(channelCounts).map(([ch, cnt]) => {
              const maxCh = Math.max(...Object.values(channelCounts), 1);
              const barHeightPct = Math.round((cnt / maxCh) * 100);

              return (
                <div key={ch} className="flex flex-col items-center justify-end h-full gap-2">
                  <span className="text-[11px] font-bold text-slate-800">{cnt}</span>
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t h-28 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-slate-800 rounded-t transition-all duration-300"
                      style={{ height: `${Math.max(6, barHeightPct)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">
                    {ch}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Language Distribution Stacked Segment */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900">Multilingual Ingestion Profile</h2>
          <span className="text-xs text-slate-400">English, chiShona, isiNdebele, Code-Mixed</span>
        </div>

        {/* Stacked Segment Bar */}
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
          {Object.entries(languageCounts).map(([lang, cnt]) => {
            const pct = Math.round((cnt / (total || 1)) * 100);
            if (pct <= 0) return null;
            let bgClass = 'bg-sky-600';
            if (lang === 'Shona') bgClass = 'bg-indigo-600';
            if (lang === 'Ndebele') bgClass = 'bg-purple-600';
            if (lang === 'Code-Mixed') bgClass = 'bg-teal-600';

            return (
              <div
                key={lang}
                className={`${bgClass} h-full`}
                style={{ width: `${pct}%` }}
                title={`${lang}: ${pct}%`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          {Object.entries(languageCounts).map(([lang, cnt]) => {
            const pct = Math.round((cnt / (total || 1)) * 100);
            let dotClass = 'bg-sky-600';
            if (lang === 'Shona') dotClass = 'bg-indigo-600';
            if (lang === 'Ndebele') dotClass = 'bg-purple-600';
            if (lang === 'Code-Mixed') dotClass = 'bg-teal-600';

            return (
              <div key={lang} className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                <span className={`w-2.5 h-2.5 rounded-full ${dotClass} shrink-0`} />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{lang}</div>
                  <div className="text-[10px] text-slate-500">{cnt} records ({pct}%)</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
