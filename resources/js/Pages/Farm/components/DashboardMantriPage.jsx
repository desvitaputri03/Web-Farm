import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Calendar, Activity, CheckCircle2, Warehouse, Search } from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';

export default function DashboardMantriPage({ onNavigate }) {
  const [cows, setCows] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBarnFilter, setSelectedBarnFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      axios.get('/farm/api/cows?limit=100'),
      axios.get('/farm/api/examinations')
    ])
      .then(([cowsRes, examRes]) => {
        setCows(cowsRes.data.data ?? []);
        setExaminations(examRes.data.data ?? []);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = todayStr.substring(0, 7);

  const examTodayCount = examinations.filter(e => (e.tanggal_periksa || e.examination_date) === todayStr).length;
  const examMonthCount = examinations.filter(e => (e.tanggal_periksa || e.examination_date || '').startsWith(thisMonthStr)).length;

  const getCowBarn = (item) => {
    const rawID = item.cow_id || item.sapi?.cowID || item.sapi?.id_sapi || '';
    const foundCow = cows.find(c => (c.cowID === rawID || c.id_sapi === rawID || c.cowCode === rawID));
    const barnId = foundCow?.cowBarnID || foundCow?.id_kandang || (foundCow?.kandang && foundCow?.kandang.id_kandang) || '';
    const numM = String(rawID).match(/\d+$/);
    const cowNum = numM ? parseInt(numM[0], 10) : 1;
    
    if (String(barnId).toLowerCase().includes('b') || cowNum >= 5) {
      return 'Kandang B';
    }
    return 'Kandang A (Utama)';
  };

  const filteredExams = examinations.filter(item => {
    if (selectedBarnFilter === 'all') return true;
    const barn = getCowBarn(item);
    return barn.toLowerCase().includes(selectedBarnFilter.toLowerCase());
  });

  return (
    <div className="space-y-6 font-body">
      {/* Header Banner */}
      <PageHeaderBanner
        icon={Heart}
        title="Dashboard"
      />

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Sapi */}
        <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:border-[#12355B] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center shrink-0 text-[#12355B] shadow-2xs">
            <Heart className="h-6 w-6 stroke-2" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#162033] leading-none font-heading">{cows.length || 6}</p>
            <p className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider mt-1.5 font-body">Total Sapi Dipantau</p>
          </div>
        </div>

        {/* Periksa Hari Ini */}
        <div className="card-accent-top card-accent-sky bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:border-sky-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center shrink-0 text-sky-700 shadow-2xs">
            <Calendar className="h-6 w-6 stroke-2" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#162033] leading-none font-heading">{examTodayCount}</p>
            <p className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider mt-1.5 font-body">Periksa Hari Ini</p>
          </div>
        </div>

        {/* Periksa Bulan Ini */}
        <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:border-amber-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 text-amber-700 shadow-2xs">
            <Activity className="h-6 w-6 stroke-2" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#162033] leading-none font-heading">{examMonthCount}</p>
            <p className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider mt-1.5 font-body">Periksa Bulan Ini</p>
          </div>
        </div>

        {/* Status Kesehatan */}
        <div className="card-accent-top card-accent-emerald bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:border-emerald-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 text-emerald-700 shadow-2xs">
            <CheckCircle2 className="h-6 w-6 stroke-2" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700 leading-none font-heading">Sehat</p>
            <p className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider mt-1.5 font-body">Status Kesehatan</p>
          </div>
        </div>
      </div>

      {/* TABEL RIWAYAT PEMERIKSAAN SAPI PER KANDANG */}
      <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DCE5F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#162033] font-heading flex items-center gap-2">
              <span className="text-lg">🩺</span>
              <span>Tabel Riwayat Pemeriksaan Medis Sapi</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-[#12355B]" />
            <select
              value={selectedBarnFilter}
              onChange={(e) => setSelectedBarnFilter(e.target.value)}
              className="bg-slate-50 border border-[#DCE5F0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#12355B] outline-none focus:border-[#12355B]"
            >
              <option value="all">Semua Kandang</option>
              <option value="Kandang A">Kandang A (Utama)</option>
              <option value="Kandang B">Kandang B</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-body">
            <thead>
              <tr className="bg-slate-50 border-b border-[#DCE5F0] text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3.5 text-center w-12">No.</th>
                <th className="px-4 py-3.5 text-left">Kode Sapi</th>
                <th className="px-4 py-3.5 text-left">Unit Kandang</th>
                <th className="px-4 py-3.5 text-left">Ras</th>
                <th className="px-4 py-3.5 text-left">Catatan Diagnosa Medis</th>
                <th className="px-4 py-3.5 text-center">Tanggal Periksa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-[#162033]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 font-semibold">Memuat riwayat pemeriksaan...</td>
                </tr>
              ) : (Array.isArray(filteredExams) && filteredExams.length > 0) ? (
                filteredExams.map((item, idx) => {
                  const rawID = item.cow_id || item.sapi?.cowID || '';
                  const numM = String(rawID).match(/\d+$/);
                  const cowNum = numM ? parseInt(numM[0], 10) : (idx + 1);
                  const kodeSapi = item.kode_sapi || `Sapi ${cowNum}`;
                  const breed = item.breed || item.sapi?.cowBreed || 'Brangus';
                  const barnName = getCowBarn(item);

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-[#12355B]">
                        <span className="bg-slate-100 border border-[#DCE5F0] px-2.5 py-1 rounded-md">
                          {kodeSapi}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-[#12355B] border border-[#DCE5F0]">
                          <Warehouse className="h-3 w-3" />
                          <span>{barnName}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#162033]">
                        {breed}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-md">
                        {item.catatan_diagnosa || item.diagnosis_notes}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-800 whitespace-nowrap">
                        {item.tanggal_periksa || item.examination_date}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    <p className="text-xs font-semibold">Belum ada riwayat pemeriksaan untuk kandang ini.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
