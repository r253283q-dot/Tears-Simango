import React, { useState } from 'react';
import { Company, FeedbackItem } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { Badge } from '../common/Badge';
import { Calendar, Filter, TrendingUp, TrendingDown, Clock, ArrowUpRight } from 'lucide-react';

interface TrendsSectionProps {
  company: Company;
  feedbackList: FeedbackItem[];
  onNavigateToAnalyse: () => void;
}

export const TrendsSection: React.FC<TrendsSectionProps> = ({
  company,
  feedbackList,
  onNavigateToAnalyse
}) => {
  const [timeWindow, setTimeWindow] = useState<'7d' | '30d' | 'all'>('30d');

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

  // Filter feedback by chosen time window
  const now = new Date();
  const filteredByTime = feedbackList.filter(item => {
    if (timeWindow === 'all') return true;
    const itemDate = new Date(item.timestamp);
    const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
    if (timeWindow === '7d') return diffDays <= 7;
    if (timeWindow === '30d') return diffDays <= 30;
    return true;
  });

  // Aggregate by weekly or daily buckets
  // Let's create aggregated date buckets (e.g. past 5 periods)
  const buckets: Record<string, { positive: number; neutral: number; negative: number; responseRequired: number; total: number }> = {};

  filteredByTime.forEach(item => {
    const d = new Date(item.timestamp);
    const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
    if (!buckets[dateKey]) {
      buckets[dateKey] = { positive: 0, neutral: 0, negative: 0, responseRequired: 0, total: 0 };
    }
    buckets[dateKey].total++;
    if (item.sentiment === 'Positive') buckets[dateKey].positive++;
    if (item.sentiment === 'Neutral') buckets[dateKey].neutral++;
    if (item.sentiment === 'Negative') buckets[dateKey].negative++;
    if (item.responseRequired) buckets[dateKey].responseRequired++;
  });

  const sortedDates = Object.keys(buckets).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Aggregate Complaint Categories over time
  const complaintsByTime: Record<string, number> = {};
  filteredByTime.filter(f => f.sentiment === 'Negative').forEach(f => {
    complaintsByTime[f.issue] = (complaintsByTime[f.issue] || 0) + 1;
  });

  // Aggregate Channels over time
  const channelVolume: Record<string, { total: number; negative: number }> = {};
  filteredByTime.forEach(f => {
    if (!channelVolume[f.channel]) {
      channelVolume[f.channel] = { total: 0, negative: 0 };
    }
    channelVolume[f.channel].total++;
    if (f.sentiment === 'Negative') channelVolume[f.channel].negative++;
  });

  return (
    <div className="space-y-6">
      {/* Header and Time Window Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sentiment Trends</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Temporal patterns and channel health progression for {company.name}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setTimeWindow('7d')}
            className={`px-3 py-1 font-medium rounded transition-colors cursor-pointer ${
              timeWindow === '7d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeWindow('30d')}
            className={`px-3 py-1 font-medium rounded transition-colors cursor-pointer ${
              timeWindow === '30d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeWindow('all')}
            className={`px-3 py-1 font-medium rounded transition-colors cursor-pointer ${
              timeWindow === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Sentiment Over Time Visualization */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Sentiment Distribution Over Time</h2>
            <p className="text-xs text-slate-500">Volume distribution across recorded feedback dates</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-teal-700">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              Positive
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Neutral
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              Negative
            </span>
          </div>
        </div>

        {sortedDates.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">
            No chronological data points available in the selected window.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {sortedDates.map(dateKey => {
                const b = buckets[dateKey];
                const posWidth = Math.round((b.positive / b.total) * 100);
                const neuWidth = Math.round((b.neutral / b.total) * 100);
                const negWidth = Math.round((b.negative / b.total) * 100);

                return (
                  <div key={dateKey} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{dateKey}</span>
                      <span className="text-slate-500">
                        {b.total} records ({b.positive} pos, {b.neutral} neu, {b.negative} neg)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded overflow-hidden flex">
                      <div className="bg-teal-600 h-full" style={{ width: `${posWidth}%` }} />
                      <div className="bg-slate-400 h-full" style={{ width: `${neuWidth}%` }} />
                      <div className="bg-rose-600 h-full" style={{ width: `${negWidth}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Row: Channel Quality Comparison & Temporal Complaints Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Health and Escalation Frequency */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">Platform Performance & Escalations</h2>
            <p className="text-xs text-slate-500 mt-0.5">Negative proportion by communication channel</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                  <th className="py-2">Platform</th>
                  <th className="py-2">Volume</th>
                  <th className="py-2">Complaints</th>
                  <th className="py-2 text-right">Escalation Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(channelVolume).map(([channel, stats]) => {
                  const negPct = Math.round((stats.negative / stats.total) * 100);
                  return (
                    <tr key={channel}>
                      <td className="py-2.5 font-medium text-slate-800">{channel}</td>
                      <td className="py-2.5 text-slate-600">{stats.total}</td>
                      <td className="py-2.5 text-slate-600">{stats.negative}</td>
                      <td className="py-2.5 text-right">
                        <span className={`font-semibold ${negPct > 40 ? 'text-rose-700' : 'text-slate-700'}`}>
                          {negPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Temporal Complaint Breakdown Table */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">Incident Category Velocity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Frequency of negative events in selected timeframe</p>
          </div>

          {Object.keys(complaintsByTime).length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">
              No complaint incidents registered in this timeframe.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(complaintsByTime).map(([issue, count]) => (
                <div key={issue} className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-medium text-slate-800">{issue}</span>
                  <span className="px-2 py-0.5 rounded font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {count} events
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
