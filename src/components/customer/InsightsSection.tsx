import React, { useState } from 'react';
import { Company, FeedbackItem } from '../../types';
import { Badge } from '../common/Badge';
import { BackButton } from '../common/BackButton';
import { EmptyState } from '../common/EmptyState';
import {
  Lightbulb,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  BarChart3,
  Layers,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';

interface InsightsSectionProps {
  company: Company;
  feedbackList: FeedbackItem[];
  onNavigateToAnalyse: () => void;
  onUpdateFeedbackStatus: (id: string, status: FeedbackItem['status']) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface CategorySummary {
  issue: string;
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  netScore: number;
  samplePositive?: string;
  sampleNegative?: string;
  recommendation: {
    priority: 'Immediate' | 'Medium-term' | 'Strategic';
    title: string;
    action: string;
    rationale: string;
  };
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({
  company,
  feedbackList,
  onNavigateToAnalyse,
  onUpdateFeedbackStatus,
  onShowToast
}) => {
  const [drillDownCategory, setDrillDownCategory] = useState<string | null>(null);
  const [selectedGraphCategory, setSelectedGraphCategory] = useState<string | null>(null);
  const [graphFilter, setGraphFilter] = useState<'all' | 'complaints' | 'positive'>('all');

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

  // Aggregate by issue categories across ALL reviews
  const issueMap: Record<string, FeedbackItem[]> = {};
  feedbackList.forEach(f => {
    const key = f.issue || 'General Service';
    if (!issueMap[key]) issueMap[key] = [];
    issueMap[key].push(f);
  });

  // Built-in Zimbabwean contextual recommendation logic per issue category
  const buildRecommendation = (
    issue: string,
    positiveCount: number,
    negativeCount: number,
    totalCount: number
  ): CategorySummary['recommendation'] => {
    if (issue === 'Transaction & Payments') {
      return {
        priority: negativeCount > 0 ? 'Immediate' : 'Medium-term',
        title: 'Automate Mobile Money & POS Webhook Settlements',
        action: 'Implement real-time API callbacks for EcoCash, InnBucks, and Zimswitch POS payments to auto-credit accounts and eliminate double-debit reconciliation friction.',
        rationale: `${negativeCount} of ${totalCount} reviews report delays in payment confirmation and account activation tokens.`
      };
    }
    if (issue === 'Customer Support') {
      return {
        priority: negativeCount > 0 ? 'Immediate' : 'Medium-term',
        title: 'Establish WhatsApp SLAs & Colloquial Routing',
        action: 'Deploy frontline support workflows with sub-15 minute SLA response targets and native Shona & Ndebele language handling to build customer trust.',
        rationale: `${negativeCount} complaints flagged unresponsiveness or prolonged hold times on digital channels.`
      };
    }
    if (issue === 'Pricing & Tariffs') {
      return {
        priority: 'Medium-term',
        title: 'Publish Transparent Dual-Currency Exchange Matrices',
        action: 'Display clear, updated daily USD vs ZiG interbank exchange rates at checkouts and on statements to remove conversion disputes.',
        rationale: `${totalCount} customer interactions referenced pricing transparency and currency conversion doubts.`
      };
    }
    if (issue === 'Delivery & Logistics') {
      return {
        priority: 'Medium-term',
        title: 'Introduce Inter-City SMS Dispatch Notifications',
        action: 'Automate courier dispatch tracking alerts for regional shipments outside Harare and Bulawayo to reassure expectant customers.',
        rationale: `${negativeCount} reviews expressed uncertainty regarding regional shipment delivery timelines.`
      };
    }
    if (issue === 'Network & Infrastructure' || issue === 'Network & Systems') {
      return {
        priority: 'Immediate',
        title: 'Deploy Redundant Offline Transaction Caching',
        action: 'Enable offline transaction capture with auto-retry during power shedding or localized mobile data downtime.',
        rationale: `${negativeCount} users experienced service interruptions during critical transactions.`
      };
    }
    if (issue === 'Product Quality') {
      return {
        priority: positiveCount >= negativeCount ? 'Strategic' : 'Immediate',
        title: 'Amplify Verified Quality & Warranty Assurance',
        action: positiveCount >= negativeCount
          ? 'Harness glowing reviews on product durability as customer advocacy testimonials in regional promotional campaigns.'
          : 'Conduct supplier batch audits and review warranty claim turnaround periods to resolve reliability concerns.',
        rationale: `${positiveCount} customers commended reliability, while ${negativeCount} highlighted warranty issues.`
      };
    }

    // Default tailored recommendation
    return {
      priority: negativeCount > positiveCount ? 'Immediate' : 'Strategic',
      title: `Operational Optimization for ${issue}`,
      action: `Establish continuous review audits and standardize response guidelines for ${issue.toLowerCase()} feedback cohorts.`,
      rationale: `${totalCount} customer touchpoints recorded under this operational domain.`
    };
  };

  const categorySummaries: CategorySummary[] = Object.entries(issueMap).map(([issue, items]) => {
    const total = items.length;
    const positive = items.filter(i => i.sentiment === 'Positive').length;
    const neutral = items.filter(i => i.sentiment === 'Neutral').length;
    const negative = items.filter(i => i.sentiment === 'Negative').length;
    const samplePos = items.find(i => i.sentiment === 'Positive')?.text;
    const sampleNeg = items.find(i => i.sentiment === 'Negative')?.text;

    return {
      issue,
      total,
      positive,
      neutral,
      negative,
      positivePct: Math.round((positive / total) * 100),
      neutralPct: Math.round((neutral / total) * 100),
      negativePct: Math.round((negative / total) * 100),
      netScore: Math.round(((positive - negative) / total) * 100),
      samplePositive: samplePos,
      sampleNegative: sampleNeg,
      recommendation: buildRecommendation(issue, positive, negative, total)
    };
  });

  // Sort categories by total feedback volume descending
  categorySummaries.sort((a, b) => b.total - a.total);

  // Filter for graph view if requested
  const displayedCategories = categorySummaries.filter(cat => {
    if (graphFilter === 'complaints') return cat.negative > 0;
    if (graphFilter === 'positive') return cat.positive > 0;
    return true;
  });

  const totalReviews = feedbackList.length;
  const totalPositive = feedbackList.filter(f => f.sentiment === 'Positive').length;
  const totalNegative = feedbackList.filter(f => f.sentiment === 'Negative').length;
  const totalNeutral = feedbackList.filter(f => f.sentiment === 'Neutral').length;
  const netSatisfaction = Math.round(((totalPositive - totalNegative) / totalReviews) * 100);

  // Highest volume issue requiring urgent intervention
  const highestComplaintCategory = [...categorySummaries]
    .sort((a, b) => b.negative - a.negative)[0];

  // Active category for detail focus (defaults to first or selected)
  const activeFocusCategory = selectedGraphCategory
    ? categorySummaries.find(c => c.issue === selectedGraphCategory) || categorySummaries[0]
    : highestComplaintCategory || categorySummaries[0];

  // Drill-down secondary view
  if (drillDownCategory) {
    const categoryFeedback = feedbackList.filter(f => f.issue === drillDownCategory);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => setDrillDownCategory(null)} label="Back to Insights & Recommendations" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{drillDownCategory} Reviews & Analysis</h2>
              <p className="text-xs text-slate-500">Root cause evidence and feedback breakdown for {drillDownCategory}</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            {categoryFeedback.length} Feedback Records
          </span>
        </div>

        <div className="space-y-4">
          {categoryFeedback.map(item => (
            <div key={item.id} className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm text-slate-900 font-medium">"{item.text}"</div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="sentiment" value={item.sentiment} size="sm" />
                  <Badge variant="priority" value={item.priority} size="sm" />
                  <Badge variant="language" value={item.language} size="sm" />
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Operational Assessment: </span>
                {item.customerInsight}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>Channel: {item.channel} | Customer: {item.customerIdentifier || 'Anonymous'}</span>
                {item.status !== 'Resolved' && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateFeedbackStatus(item.id, 'Resolved');
                      onShowToast('Marked feedback as resolved', 'success');
                    }}
                    className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Maximum feedback count in any single category for bar width scaling
  const maxCategoryCount = Math.max(...categorySummaries.map(c => c.total), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Insights & Recommendations</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Unified review synthesis graph with data-grounded business recommendations for {company.name}
        </p>
      </div>

      {/* Top Level Strategic Pulse */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Reviews Summarised</div>
          <div className="text-xl font-bold text-slate-950 mt-1">{totalReviews}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across {categorySummaries.length} issue areas</div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Net Sentiment Score</div>
          <div className={`text-xl font-bold mt-1 ${netSatisfaction >= 0 ? 'text-teal-700' : 'text-rose-700'}`}>
            {netSatisfaction >= 0 ? `+${netSatisfaction}%` : `${netSatisfaction}%`}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{totalPositive} positive vs {totalNegative} negative</div>
        </div>

        <div className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded shadow-xs">
          <div className="text-[11px] font-semibold text-rose-800">Primary Friction Area</div>
          <div className="text-sm font-bold text-rose-950 truncate mt-1">
            {highestComplaintCategory?.issue || 'None'}
          </div>
          <div className="text-[10px] text-rose-700 mt-0.5">
            {highestComplaintCategory?.negative || 0} negative reviews flagged
          </div>
        </div>

        <div className="p-3.5 bg-teal-50/50 border border-teal-200/80 rounded shadow-xs">
          <div className="text-[11px] font-semibold text-teal-800">Key Recommended Action</div>
          <div className="text-xs font-bold text-teal-950 line-clamp-1 mt-1">
            {activeFocusCategory?.recommendation.title}
          </div>
          <div className="text-[10px] text-teal-700 mt-0.5">
            Priority: {activeFocusCategory?.recommendation.priority}
          </div>
        </div>
      </div>

      {/* THE SINGLE GRAPH: Summarising Reviews with Integrated Recommendations */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {/* Graph Header with Mode Filter */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-teal-400 rounded">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Review Summary & Recommendation Graph
              </h2>
              <p className="text-[11px] text-slate-500">
                Single executive graph summarizing review sentiment distribution alongside direct business recommendations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">View Scope:</span>
            <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setGraphFilter('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                  graphFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Reviews ({totalReviews})
              </button>
              <button
                type="button"
                onClick={() => setGraphFilter('complaints')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                  graphFilter === 'complaints'
                    ? 'bg-white text-rose-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Friction Drivers ({totalNegative})
              </button>
              <button
                type="button"
                onClick={() => setGraphFilter('positive')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                  graphFilter === 'positive'
                    ? 'bg-white text-teal-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Satisfaction Themes ({totalPositive})
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-600">Review Sentiment Mix:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-teal-600 inline-block"></span>
              <span className="text-slate-700">Positive ({totalPositive})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-400 inline-block"></span>
              <span className="text-slate-700">Neutral ({totalNeutral})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-600 inline-block"></span>
              <span className="text-slate-700">Negative ({totalNegative})</span>
            </div>
          </div>
          <span className="text-slate-400 italic">Click any category bar to inspect recommendations & evidence</span>
        </div>

        {/* The Graph Canvas / Visual Rows */}
        <div className="p-5 space-y-4">
          {displayedCategories.map((cat) => {
            const isSelected = activeFocusCategory?.issue === cat.issue;
            const barWidthPercent = Math.max(Math.round((cat.total / maxCategoryCount) * 100), 12);

            return (
              <div
                key={cat.issue}
                onClick={() => setSelectedGraphCategory(cat.issue)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50/70 shadow-xs ring-1 ring-slate-900/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/30'
                }`}
              >
                {/* Category Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{cat.issue}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {cat.total} {cat.total === 1 ? 'Review' : 'Reviews'}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        Focused
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-teal-700 font-medium">+{cat.positive} pos</span>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-600 font-medium">{cat.neutral} neu</span>
                    <span className="text-slate-400">/</span>
                    <span className="text-rose-700 font-medium">-{cat.negative} neg</span>
                    <span className={`font-bold ml-1 px-1.5 py-0.5 rounded text-[10px] ${
                      cat.netScore >= 0 ? 'bg-teal-50 text-teal-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {cat.netScore >= 0 ? `+${cat.netScore}% Net` : `${cat.netScore}% Net`}
                    </span>
                  </div>
                </div>

                {/* Single Segmented Bar for the category reviews */}
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex shadow-inner">
                  {cat.positive > 0 && (
                    <div
                      style={{ width: `${(cat.positive / cat.total) * 100}%` }}
                      className="bg-teal-600 h-full transition-all duration-300 relative group flex items-center justify-center"
                      title={`${cat.positive} Positive Reviews (${cat.positivePct}%)`}
                    />
                  )}
                  {cat.neutral > 0 && (
                    <div
                      style={{ width: `${(cat.neutral / cat.total) * 100}%` }}
                      className="bg-slate-400 h-full transition-all duration-300 relative group flex items-center justify-center"
                      title={`${cat.neutral} Neutral Reviews (${cat.neutralPct}%)`}
                    />
                  )}
                  {cat.negative > 0 && (
                    <div
                      style={{ width: `${(cat.negative / cat.total) * 100}%` }}
                      className="bg-rose-600 h-full transition-all duration-300 relative group flex items-center justify-center"
                      title={`${cat.negative} Negative Reviews (${cat.negativePct}%)`}
                    />
                  )}
                </div>

                {/* Direct recommendation preview linked under the bar */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Lightbulb className={`w-3.5 h-3.5 shrink-0 ${
                      cat.recommendation.priority === 'Immediate' ? 'text-rose-600' : 'text-teal-600'
                    }`} />
                    <span className="font-semibold text-slate-900">
                      Recommendation: {cat.recommendation.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      cat.recommendation.priority === 'Immediate'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : cat.recommendation.priority === 'Medium-term'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-teal-100 text-teal-800 border border-teal-200'
                    }`}>
                      {cat.recommendation.priority}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDrillDownCategory(cat.issue);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-950 cursor-pointer"
                    >
                      <span>Drill Down ({cat.total})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* INTEGRATED EXECUTIVE RECOMMENDATION SPOTLIGHT */}
        {activeFocusCategory && (
          <div className="bg-slate-900 text-white p-6 border-t border-slate-800">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-400 text-slate-950">
                    {activeFocusCategory.recommendation.priority} Strategic Directive
                  </span>
                  <span className="text-xs text-slate-400">
                    Derived from {activeFocusCategory.total} reviews in {activeFocusCategory.issue}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {activeFocusCategory.recommendation.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeFocusCategory.recommendation.action}
                </p>

                <div className="text-[11px] text-teal-300 bg-slate-800/80 p-2.5 rounded border border-slate-700/60 mt-2">
                  <span className="font-semibold text-white">Review Evidence: </span>
                  {activeFocusCategory.recommendation.rationale}
                </div>
              </div>

              {/* Sample Voice & Action Button */}
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 md:w-80 shrink-0 space-y-3">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Customer Voice Example
                </div>

                {activeFocusCategory.sampleNegative ? (
                  <p className="text-xs text-rose-200 italic line-clamp-3">
                    "{activeFocusCategory.sampleNegative}"
                  </p>
                ) : activeFocusCategory.samplePositive ? (
                  <p className="text-xs text-teal-200 italic line-clamp-3">
                    "{activeFocusCategory.samplePositive}"
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    No verbatim feedback text available.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setDrillDownCategory(activeFocusCategory.issue)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded cursor-pointer transition-colors"
                >
                  <span>Examine All {activeFocusCategory.issue} Feedback</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actionable Recommendations Master List */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-slate-900">All Strategic Action Priorities</h2>
          </div>
          <span className="text-xs text-slate-400">
            {categorySummaries.length} total operational roadmaps
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categorySummaries.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedGraphCategory(cat.issue)}
              className="p-4 rounded border border-slate-200 bg-slate-50/60 space-y-2 hover:border-slate-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">{cat.recommendation.title}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  cat.recommendation.priority === 'Immediate'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-teal-100 text-teal-800 border border-teal-200'
                }`}>
                  {cat.recommendation.priority}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{cat.recommendation.action}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50">
                <span>Domain: <strong className="text-slate-600">{cat.issue}</strong></span>
                <span className="text-slate-500 font-medium">{cat.total} reviews backing</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
