import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  Search,
  ShieldAlert,
  CheckCircle,
  Stethoscope,
  Plus,
  FileText,
  X
} from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';
import SortSelect from './SortSelect';

export default function PemeriksaanKesehatanPage({ initialCowID = null, onBackToDashboard = null, role = 'mantri', isSubView = false }) {
  const [cows, setCows] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedCowId, setSelectedCowId] = useState(initialCowID || '');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [examinationDate, setExaminationDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [searchHistory, setSearchHistory] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = () => {
    setLoading(true);
    axios.get('/farm/api/cows?limit=100').then(res => {
      const list = res.data.data ?? [];
      setCows(list);
    }).catch(() => {});

    axios.get('/farm/api/examinations').then(res => {
      setExaminations(res.data.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedCowId) {
      setErrorMsg('Silakan pilih sapi terlebih dahulu.');
      return;
    }
    if (!diagnosisNotes.trim()) {
      setErrorMsg('Catatan diagnosa wajib diisi.');
      return;
    }

    setSubmitting(true);
    axios.post('/farm/api/examinations', {
      cow_id: selectedCowId,
      diagnosis_notes: diagnosisNotes,
      examination_date: examinationDate,
    }).then(() => {
      setSuccessMsg('Catatan diagnosa pemeriksaan berhasil disimpan!');
      setDiagnosisNotes('');
      setSelectedCowId('');
      setIsFormOpen(false);
      loadData();
    }).catch(err => {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan catatan pemeriksaan.');
    }).finally(() => setSubmitting(false));
  };

  const filteredExams = examinations.filter(ex => {
    if (!searchHistory.trim()) return true;
    const q = searchHistory.toLowerCase();
    const kode = (ex.kode_sapi || '').toLowerCase();
    const breed = (ex.breed || ex.sapi?.cowBreed || '').toLowerCase();
    const notes = (ex.catatan_diagnosa || ex.diagnosis_notes || '').toLowerCase();
    return kode.includes(q) || breed.includes(q) || notes.includes(q);
  }).sort((a, b) => {
    if (sortBy === 'terlama') {
      return new Date(a.tanggal_periksa || a.examination_date) - new Date(b.tanggal_periksa || b.examination_date);
    }
    return new Date(b.tanggal_periksa || b.examination_date) - new Date(a.tanggal_periksa || a.examination_date);
  });

  const pageTitle = role === 'mantri' ? 'Pemeriksaan Kesehatan' : 'Riwayat Kesehatan';

  return (
    <div className="space-y-6 font-body">
      {!isSubView && (
        <PageHeaderBanner
          icon={role === 'mantri' ? Stethoscope : FileText}
          title={isFormOpen ? 'Tambah Pemeriksaan Medis' : pageTitle}
          action={
            role === 'mantri' && !isFormOpen && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="bg-[#12355B] hover:bg-[#0D2847] text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer h-[42px]"
              >
                <Plus className="h-4 w-4 stroke-2" />
                <span>Tambah Pemeriksaan</span>
              </button>
            )
          }
        />
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 bg-slate-100 border border-[#DCE5F0] text-[#12355B] px-4 py-3 rounded-xl text-xs font-semibold">
          <CheckCircle className="h-4 w-4 shrink-0 text-[#12355B]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* MODE 1: FORM TAMBAH PEMERIKSAAN INLINE CARD */}
      {isFormOpen ? (
        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-4 font-body animate-fadeIn">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
                Pilih Sapi <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCowId}
                onChange={(e) => setSelectedCowId(e.target.value)}
                className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none cursor-pointer h-[42px]"
                required
              >
                <option value="">-- Pilih Sapi --</option>
                {cows.map((cow, index) => {
                  const rawID = cow.cowID;
                  const matchNum = String(rawID).match(/\d+$/);
                  const cowNum = matchNum ? parseInt(matchNum[0], 10) : (index + 1);
                  const cowCode = `Sapi ${cowNum}`;
                  const breed = cow.cowBreed || 'Tidak diketahui';

                  return (
                    <option key={cow.cowID} value={cow.cowID}>
                      {index + 1}. {cowCode} ({breed})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
                Catatan Diagnosa Medis <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={diagnosisNotes}
                onChange={(e) => setDiagnosisNotes(e.target.value)}
                className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] rounded-xl p-3.5 text-xs text-[#162033] font-medium outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
                Tanggal Periksa <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={examinationDate}
                onChange={(e) => setExaminationDate(e.target.value)}
                className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none cursor-pointer h-[42px]"
                required
              />
            </div>

            <div className="flex justify-center gap-3 pt-5 border-t border-[#DCE5F0]">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2.5 border border-[#DCE5F0] text-[#162033] text-xs font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer h-[42px] min-w-[110px]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer h-[42px] min-w-[110px]"
              >
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* MODE 2: TABEL RIWAYAT 4 KOLOM ONLY (TANPA TANGGAL INPUT) */
        <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#DCE5F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm sm:text-base font-bold text-[#162033] font-heading shrink-0 flex items-center gap-2">
              <span className="text-lg">🩺</span>
              <span>Daftar Riwayat Pemeriksaan Kesehatan</span>
            </h3>

            {/* Consistent Right Controls: Search Bar (Cari ras sapi...) + SortSelect */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  placeholder="Cari ras sapi..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] focus:border-[#12355B] outline-none font-medium h-[42px]"
                />
              </div>

              <SortSelect value={sortBy} onChange={setSortBy} className="h-[42px]" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-body">
              <thead>
                <tr className="bg-slate-50 border-b border-[#DCE5F0] text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-3.5 text-center w-12">No.</th>
                  <th className="px-4 py-3.5 text-left">Kode</th>
                  <th className="px-4 py-3.5 text-left">Ras</th>
                  <th className="px-4 py-3.5 text-left">Catatan Diagnosa</th>
                  <th className="px-4 py-3.5 text-center">Tanggal Periksa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-[#162033]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400 font-semibold">Memuat riwayat pemeriksaan...</td>
                  </tr>
                ) : filteredExams.length > 0 ? (
                  filteredExams.map((item, idx) => {
                    const rawID = item.cow_id || item.sapi?.cowID || '';
                    const numM = String(rawID).match(/\d+$/);
                    const cowNum = numM ? parseInt(numM[0], 10) : (idx + 1);
                    const kodeSapi = item.kode_sapi || `Sapi ${cowNum}`;
                    const breed = item.breed || item.sapi?.cowBreed || 'Brangus';

                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-[#12355B]">
                          <span className="bg-slate-100 border border-[#DCE5F0] px-2.5 py-1 rounded-md">
                            {kodeSapi}
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
                    <td colSpan="5" className="text-center py-10 text-slate-400">
                      <p className="text-xs font-semibold">Tidak ada riwayat pemeriksaan ditemukan.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
