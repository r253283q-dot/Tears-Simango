import React from 'react';
import { SentimentType, PriorityLevel, LanguageType, ChannelType } from '../../types';

interface BadgeProps {
  variant: 'sentiment' | 'priority' | 'language' | 'channel' | 'status';
  value: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant, value, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (variant === 'sentiment') {
    const sentiment = value as SentimentType;
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (sentiment === 'Positive') {
      colorClass = 'bg-teal-50 text-teal-800 border-teal-200';
    } else if (sentiment === 'Negative') {
      colorClass = 'bg-rose-50 text-rose-800 border-rose-200';
    } else if (sentiment === 'Neutral') {
      colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    }

    return (
      <span className={`inline-flex items-center font-medium rounded border ${sizeClasses} ${colorClass}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          sentiment === 'Positive' ? 'bg-teal-600' :
          sentiment === 'Negative' ? 'bg-rose-600' : 'bg-slate-500'
        }`} />
        {value}
      </span>
    );
  }

  if (variant === 'priority') {
    const priority = value as PriorityLevel;
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (priority === 'High') {
      colorClass = 'bg-rose-50 text-rose-800 border-rose-300 font-semibold';
    } else if (priority === 'Medium') {
      colorClass = 'bg-amber-50 text-amber-800 border-amber-300';
    } else {
      colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    }

    return (
      <span className={`inline-flex items-center rounded border ${sizeClasses} ${colorClass}`}>
        {value}
      </span>
    );
  }

  if (variant === 'language') {
    const lang = value as LanguageType;
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (lang === 'Shona') {
      colorClass = 'bg-indigo-50 text-indigo-800 border-indigo-200';
    } else if (lang === 'Ndebele') {
      colorClass = 'bg-purple-50 text-purple-800 border-purple-200';
    } else if (lang === 'Code-Mixed') {
      colorClass = 'bg-cyan-50 text-cyan-900 border-cyan-200 font-medium';
    } else {
      colorClass = 'bg-sky-50 text-sky-800 border-sky-200';
    }

    return (
      <span className={`inline-flex items-center font-medium rounded border ${sizeClasses} ${colorClass}`}>
        {value}
      </span>
    );
  }

  if (variant === 'channel') {
    const ch = value as ChannelType;
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (ch === 'WhatsApp') {
      colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (ch === 'Facebook') {
      colorClass = 'bg-blue-50 text-blue-800 border-blue-200';
    } else if (ch === 'TikTok') {
      colorClass = 'bg-slate-900 text-white border-slate-900';
    } else if (ch === 'Instagram') {
      colorClass = 'bg-pink-50 text-pink-800 border-pink-200';
    } else if (ch === 'SMS') {
      colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
    }

    return (
      <span className={`inline-flex items-center rounded border ${sizeClasses} ${colorClass}`}>
        {value}
      </span>
    );
  }

  if (variant === 'status') {
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (value === 'Active' || value === 'Resolved') {
      colorClass = 'bg-teal-50 text-teal-800 border-teal-200';
    } else if (value === 'Pending' || value === 'Pending Review') {
      colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
    } else if (value === 'Suspended') {
      colorClass = 'bg-rose-50 text-rose-800 border-rose-200';
    } else if (value === 'Responded') {
      colorClass = 'bg-blue-50 text-blue-800 border-blue-200';
    }

    return (
      <span className={`inline-flex items-center font-medium rounded border ${sizeClasses} ${colorClass}`}>
        {value}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded border bg-slate-100 text-slate-700 border-slate-200 ${sizeClasses}`}>
      {value}
    </span>
  );
};
