import React from 'react';
import { ChevronDown } from 'lucide-react';

const SortSelect = ({ value, onChange, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-36 appearance-none bg-white border border-[#DCE5F0] text-[#162033] text-xs font-semibold pl-3.5 pr-8 py-2.5 rounded-xl h-[42px] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition cursor-pointer"
        title="Urutkan data"
      >
        <option value="terbaru">Terbaru</option>
        <option value="terlama">Terlama</option>
        <option value="az">A-Z</option>
        <option value="za">Z-A</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
    </div>
  );
};

export default SortSelect;
