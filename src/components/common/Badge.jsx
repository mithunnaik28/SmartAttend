import React from 'react';

export default function Badge({
  children,
  variant = 'default', // default, success, danger, warning, brand, purple, gray
  size = 'md', // sm, md
  className = '',
  dot = false
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    brand: 'bg-brand-50 text-brand-700 border-brand-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    gray: 'bg-gray-100 text-gray-600 border-gray-200'
  };

  const dotColors = {
    default: 'bg-slate-400',
    success: 'bg-emerald-500',
    danger: 'bg-rose-500',
    warning: 'bg-amber-500',
    brand: 'bg-brand-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-400'
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`} />}
      {children}
    </span>
  );
}
