import React from 'react';

export default function PageHeaderBanner({ icon: Icon, title, description, action, badge }) {
  return (
    <div className="card-accent-top bg-gradient-to-br from-white via-white to-slate-50/60 rounded-2xl p-5 sm:p-6 text-[#162033] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#DCE5F0] mb-6 font-body transition-all hover:shadow-sm">
      <div className="flex items-center gap-3.5 sm:gap-4">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100/80 flex items-center justify-center text-[#12355B] shrink-0 shadow-2xs">
            <Icon className="w-6 h-6 text-[#12355B] stroke-2" />
          </div>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#162033] tracking-tight font-heading">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        {badge && (
          <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-3.5 py-1.5 text-emerald-800 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-800 font-body">
              {badge}
            </span>
          </div>
        )}
        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
