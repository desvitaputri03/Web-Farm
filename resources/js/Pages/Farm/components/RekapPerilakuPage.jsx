import React, { useState } from 'react';
import { Activity, Download, Search, CheckCircle2, Layers } from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';
import SortSelect from './SortSelect';

const INITIAL_BEHAVIOR_DATA = [
  { cowID: 'SP-2024-001', cowBreed: 'Brangus', makan: 4, ruminasi: 6, berjalan: 12, berdiri: 8, berbaring: 5 },
  { cowID: 'SP-2024-002', cowBreed: 'Brahman', makan: 5, ruminasi: 7, berjalan: 13, berdiri: 9, berbaring: 6 },
  { cowID: 'SP-2024-003', cowBreed: 'Angus', makan: 4, ruminasi: 8, berjalan: 14, berdiri: 10, berbaring: 5 },
  { cowID: 'SP-2024-004', cowBreed: 'Sapi Bali', makan: 5, ruminasi: 6, berjalan: 15, berdiri: 8, berbaring: 6 },
  { cowID: 'SP-2024-005', cowBreed: 'Limousin', makan: 4, ruminasi: 7, berjalan: 12, berdiri: 9, berbaring: 5 },
  { cowID: 'SP-2024-006', cowBreed: 'Simmental', makan: 5, ruminasi: 8, berjalan: 13, berdiri: 10, berbaring: 6 }
];

export default function RekapPerilakuPage({ isSubView = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('az');

  const totalActivities = INITIAL_BEHAVIOR_DATA.reduce((acc, c) => acc + (c.makan + c.ruminasi + c.berjalan + c.berdiri + c.berbaring), 0);
  const avgActivities = Math.round(totalActivities / INITIAL_BEHAVIOR_DATA.length);
  const avgRuminasi = (INITIAL_BEHAVIOR_DATA.reduce((acc, c) => acc + c.ruminasi, 0) / INITIAL_BEHAVIOR_DATA.length).toFixed(1);

  const filteredData = INITIAL_BEHAVIOR_DATA.filter((item, idx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const kode = `sapi ${idx + 1}`;
    return kode.includes(q) || item.cowBreed.toLowerCase().includes(q);
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
          icon={Activity}
          title="Rekap Perilaku Sapi"
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

      {/* 2. KPI Cards Khusus Rekap Perilaku */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-body">
        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Sapi</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#12355B]">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#162033] mt-2 font-heading">{INITIAL_BEHAVIOR_DATA.length} Ekor</p>
          <p className="text-[11px] text-slate-500 mt-1">Total Populasi Termonitor</p>
        </div>

        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rata-rata Aktivitas</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#12355B]">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#12355B] mt-2 font-heading">{avgActivities} kali/hari</p>
          <p className="text-[11px] text-slate-500 mt-1">Total Perilaku per Ekor</p>
        </div>

        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aktivitas Dominan</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#12355B]">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#162033] mt-2 font-heading">Berjalan</p>
          <p className="text-[11px] text-slate-500 mt-1">Mobilitas Tertinggi Harian</p>
        </div>

        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rata-rata Ruminasi</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#12355B] flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#12355B] mt-2 font-heading">{avgRuminasi} kali/hari</p>
          <p className="text-[11px] text-slate-500 mt-1">Proses Memamah Biak Baik</p>
        </div>
      </div>

      {/* 3. Toolbar Filter & Pencarian */}
      <div className="bg-white rounded-2xl p-5 border border-[#DCE5F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="text-base font-bold text-[#162033] font-heading shrink-0">
          Frekuensi &amp; Rekapitulasi Perilaku Harian Ternak (Berapa Kali)
        </h3>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ras sapi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 outline-none font-medium h-[42px]"
            />
          </div>
          <SortSelect value={sortBy} onChange={setSortBy} className="h-[42px]" />
        </div>
      </div>

      {/* 4. Tabel Data Rekap Perilaku */}
      <div className="bg-white border border-[#DCE5F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-body">
            <thead>
              <tr className="bg-slate-50/70 border-b border-[#DCE5F0] text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="px-4 py-3.5 text-center w-12">No.</th>
                <th className="px-4 py-3.5 text-left">Kode</th>
                <th className="px-4 py-3.5 text-left">Ras</th>
                <th className="px-4 py-3.5 text-center">Makan</th>
                <th className="px-4 py-3.5 text-center">Ruminasi</th>
                <th className="px-4 py-3.5 text-center">Berjalan</th>
                <th className="px-4 py-3.5 text-center font-bold text-[#12355B]">Berdiri</th>
                <th className="px-4 py-3.5 text-center">Berbaring</th>
                <th className="px-4 py-3.5 text-center font-bold text-[#12355B]">Total Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5F0] text-slate-700">
              {sortedData.map((b, idx) => {
                const total = b.makan + b.ruminasi + b.berjalan + b.berdiri + b.berbaring;
                return (
                  <tr key={b.cowID || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3.5">
                      <span className="bg-slate-100 text-[#162033] font-semibold text-xs px-2.5 py-1 rounded-md border border-[#DCE5F0]">
                        Sapi {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#162033]">{b.cowBreed}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-[#162033]">{b.makan} kali</td>
                    <td className="px-4 py-3.5 text-center font-medium text-[#64748B]">{b.ruminasi} kali</td>
                    <td className="px-4 py-3.5 text-center font-medium text-[#64748B]">{b.berjalan} kali</td>
                    <td className="px-4 py-3.5 text-center font-bold text-[#12355B]">{b.berdiri} kali</td>
                    <td className="px-4 py-3.5 text-center font-medium text-[#64748B]">{b.berbaring} kali</td>
                    <td className="px-4 py-3.5 text-center font-bold text-[#12355B] bg-slate-50/70">{total} kali / hari</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
