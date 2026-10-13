import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon?: LucideIcon;
  variant?: 'default' | 'positive' | 'negative' | 'warning' | 'teal';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = 'default'
}) => {
  let borderClass = 'border-slate-200';
  let iconBgClass = 'bg-slate-100 text-slate-700';

  if (variant === 'positive') {
    borderClass = 'border-slate-200 border-l-4 border-l-teal-600';
    iconBgClass = 'bg-teal-50 text-teal-700';
  } else if (variant === 'negative') {
    borderClass = 'border-slate-200 border-l-4 border-l-rose-600';
    iconBgClass = 'bg-rose-50 text-rose-700';
  } else if (variant === 'warning') {
    borderClass = 'border-slate-200 border-l-4 border-l-amber-500';
    iconBgClass = 'bg-amber-50 text-amber-700';
  } else if (variant === 'teal') {
    borderClass = 'border-slate-200 border-l-4 border-l-slate-800';
    iconBgClass = 'bg-slate-100 text-slate-800';
  }

  return (
    <div className={`bg-white rounded border ${borderClass} p-5 shadow-xs`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded ${iconBgClass}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.isNeutral
                ? 'text-slate-500'
                : trend.isPositive
                ? 'text-teal-700'
                : 'text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
