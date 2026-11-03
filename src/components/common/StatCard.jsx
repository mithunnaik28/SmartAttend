import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'blue', // blue, emerald, amber, rose, indigo
  className = ''
}) {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50/70 text-blue-600',
      border: 'hover:border-blue-200',
    },
    emerald: {
      bg: 'bg-emerald-50/70 text-emerald-600',
      border: 'hover:border-emerald-200',
    },
    amber: {
      bg: 'bg-amber-50/70 text-amber-600',
      border: 'hover:border-amber-200',
    },
    rose: {
      bg: 'bg-rose-50/70 text-rose-600',
      border: 'hover:border-rose-200',
    },
    indigo: {
      bg: 'bg-indigo-50/70 text-indigo-600',
      border: 'hover:border-indigo-200',
    }
  };

  const scheme = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-elevated transition-all duration-200 ${scheme.border} ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide uppercase text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${scheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-medium ${
              trendDirection === 'up' ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trendDirection === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 leading-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}
