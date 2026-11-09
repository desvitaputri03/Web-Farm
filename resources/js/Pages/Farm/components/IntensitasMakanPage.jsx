import React, { useState } from 'react';
import { Utensils, Download, Search, CheckCircle2, Layers, Activity } from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';
import SortSelect from './SortSelect';

const INITIAL_INTENSITY_DATA = [
  { cowID: 'SP-2024-001', cowBreed: 'Brangus', station: 'Tempat Makan 1 (Sektor A)', frequency: 4 },
  { cowID: 'SP-2024-002', cowBreed: 'Brahman', station: 'Tempat Makan 2 (Sektor B)', frequency: 3 },
  { cowID: 'SP-2024-003', cowBreed: 'Angus', station: 'Tempat Makan 1 (Sektor A)', frequency: 4 },
  { cowID: 'SP-2024-004', cowBreed: 'Sapi Bali', station: 'Tempat Makan 2 (Sektor B)', frequency: 3 },
  { cowID: 'SP-2024-005', cowBreed: 'Limousin', station: 'Tempat Makan 1 (Sektor A)', frequency: 4 },
  { cowID: 'SP-2024-006', cowBreed: 'Simmental', station: 'Tempat Makan 2 (Sektor B)', frequency: 3 }
];

export default function IntensitasMakanPage({ isSubView = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('az');

  const totalAccess = INITIAL_INTENSITY_DATA.reduce((acc, c) => acc + c.frequency, 0);
  const avgAccess = (totalAccess / INITIAL_INTENSITY_DATA.length).toFixed(1);

  const filteredData = INITIAL_INTENSITY_DATA.filter((item, idx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const kode = `sapi ${idx + 1}`;
    return kode.includes(q) || item.cowBreed.toLowerCase().includes(q) || item.station.toLowerCase().includes(q);
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'az') return a.cowBreed.localeCompare(b.cowBreed);
    if (sortBy === 'za') return b.cowBreed.localeCompare(a.cowBreed);
    return 0;
  });

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-body">
      {/* 1. Header Banner */}
      {!isSubView && (
        <PageHeaderBanner
          icon={Utensils}
          title="Intensitas Makan Sapi"
          action={
            <button
              type="button"
              onClick={handleExport}
              className="bg-[#12355B] hover:bg-[#0D2847] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer h-[42px] shrink-0"
            >
              <Download className="h-4 w-4 stroke-2" />
              <span>Ekspor</span>
            </button>
          }
        />
      )}

      {/* 2. KPI Cards Khusus Intensitas Makan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-body">
        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Sapi</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#12355B]">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#162033] mt-2 font-heading">{INITIAL_INTENSITY_DATA.length} Ekor</p>
          <p className="text-[11px] text-slate-500 mt-1">Total Populasi Aktif</p>
        </div>

        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stasiun Aktif</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#12355B]">
              <Utensils className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#12355B] mt-2 font-heading">2 Unit</p>
          <p className="text-[11px] text-slate-500 mt-1">Tempat Makan Otomatis</p>
        </div>

        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rata-rata Akses</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#12355B]">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#162033] mt-2 font-heading">{avgAccess} kali/hari</p>
          <p className="text-[11px] text-slate-500 mt-1">Frekuensi Akses per Ekor</p>
        </div>

        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Kunjungan</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#12355B] flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#12355B] mt-2 font-heading">{totalAccess} kali/hari</p>
          <p className="text-[11px] text-slate-500 mt-1">Akumulasi Interaksi Pakan</p>
        </div>
      </div>

      {/* 3. Toolbar Filter & Pencarian */}
      <div className="bg-white rounded-2xl p-5 border border-[#DCE5F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="text-base font-bold text-[#162033] font-heading shrink-0">
          Intensitas &amp; Frekuensi Akses Tempat Makan Ternak
        </h3>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ras atau tempat makan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 outline-none font-medium h-[42px]"
            />
          </div>
          <SortSelect value={sortBy} onChange={setSortBy} className="h-[42px]" />
        </div>
      </div>

      {/* 4. Tabel Data Intensitas Makan */}
      <div className="bg-white border border-[#DCE5F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-body">
            <thead>
              <tr className="bg-slate-50/70 border-b border-[#DCE5F0] text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="px-4 py-3.5 text-center w-12">No.</th>
                <th className="px-4 py-3.5 text-left">Kode</th>
                <th className="px-4 py-3.5 text-left">Ras</th>
                <th className="px-4 py-3.5 text-left">Stasiun Tempat Makan</th>
                <th className="px-4 py-3.5 text-center font-bold text-[#12355B]">Frekuensi Akses Harian</th>
                <th className="px-4 py-3.5 text-center">Status Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5F0] text-slate-700">
              {sortedData.map((f, idx) => (
                <tr key={f.cowID || idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-3.5">
                    <span className="bg-slate-100 text-[#162033] font-semibold text-xs px-2.5 py-1 rounded-md border border-[#DCE5F0]">
                      Sapi {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-[#162033]">{f.cowBreed}</td>
                  <td className="px-4 py-3.5 font-medium text-[#162033]">
                    {f.station}
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-[#12355B]">
                    {f.frequency} kali / hari
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold border bg-blue-50 text-[#12355B] border-blue-200">
                      Aktif &amp; Teratur
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
