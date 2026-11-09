import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Activity,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar,
  Layers,
  Utensils
} from 'lucide-react';
import Pagination from './Pagination';
import SortSelect from './SortSelect';
import PageHeaderBanner from './PageHeaderBanner';
import RekapPerilakuPage from './RekapPerilakuPage';
import { usePaginatedFetch, useDebouncedValue } from '../../../hooks/usePaginatedFetch';

const ConfirmModal = ({ isOpen, title = 'Konfirmasi Hapus', message = 'Apakah Anda yakin ingin menghapus data ini?', confirmText = 'Hapus', cancelText = 'Batal', onConfirm, onCancel }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-body" onClick={onCancel}>
      <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 shadow-2xl max-w-[340px] w-full text-center max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="text-sm font-bold text-[#162033] font-heading mb-2">{title}</h3>}
        <p className="text-xs font-medium text-[#64748B] py-1 leading-relaxed">
          {message || 'Apakah Anda yakin ingin menghapus data ini?'}
        </p>
        <div className="flex items-center justify-center gap-3 mt-5 pt-3 border-t border-[#DCE5F0]">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-[#DCE5F0] text-xs font-semibold text-[#162033] hover:bg-slate-50 transition-all cursor-pointer">
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-all cursor-pointer">
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const INITIAL_BEHAVIOR_DUMMY = [
  {
    behID: 1,
    behCowID: 'SAPI-001',
    cowNumber: 1,
    cowBreed: 'Limousin',
    behActivity: 'Makan',
    behStartTime: `${new Date().toISOString().split('T')[0]} 07:00:00`,
    behEndTime: `${new Date().toISOString().split('T')[0]} 07:25:00`,
    durationMinutes: 25,
    behNotes: 'Makan sesi pagi dengan lahap.'
  },
  {
    behID: 2,
    behCowID: 'SAPI-001',
    cowNumber: 1,
    cowBreed: 'Limousin',
    behActivity: 'Ruminasi',
    behStartTime: `${new Date().toISOString().split('T')[0]} 09:00:00`,
    behEndTime: `${new Date().toISOString().split('T')[0]} 09:45:00`,
    durationMinutes: 45,
    behNotes: 'Ruminasi santai di dalam kandang utama.'
  },
  {
    behID: 3,
    behCowID: 'SAPI-002',
    cowNumber: 2,
    cowBreed: 'Simmental',
    behActivity: 'Makan',
    behStartTime: `${new Date().toISOString().split('T')[0]} 07:30:00`,
    behEndTime: `${new Date().toISOString().split('T')[0]} 07:55:00`,
    durationMinutes: 25,
    behNotes: 'Makan konsentrat porsi penuh.'
  },
  {
    behID: 4,
    behCowID: 'SAPI-003',
    cowNumber: 3,
    cowBreed: 'Brahman',
    behActivity: 'Berbaring',
    behStartTime: `${new Date().toISOString().split('T')[0]} 10:00:00`,
    behEndTime: `${new Date().toISOString().split('T')[0]} 11:30:00`,
    durationMinutes: 90,
    behNotes: 'Istirahat di lantai kandang bersih.'
  }
];

export default function PerilakuPage({ readOnly = false }) {
  const [cows, setCows] = useState([]);
  const [localRows, setLocalRows] = useState(INITIAL_BEHAVIOR_DUMMY);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery);
  const [filterActivity, setFilterActivity] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');
  const [selectedDate, setSelectedDate] = useState('');
  const [subTab, setSubTab] = useState('catat'); // 'catat' | 'rekap'

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id_sapi: '',
    aktivitas: '',
    tanggal: '',
    jam_mulai: '',
    durasi_menit: '',
    keterangan: ''
  });

  const {
    data: paginatedBehavior,
    total: totalFiltered,
    loading,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    refetch,
  } = usePaginatedFetch('/farm/api/behavior', {
    search: debouncedSearch,
    sort: sortBy,
    filters: {
      ...(selectedDate ? { date: selectedDate } : {}),
      ...(filterActivity ? { activity: filterActivity } : {}),
    },
  });

  const displayBehaviorRows = useMemo(() => {
    if (Array.isArray(paginatedBehavior) && paginatedBehavior.length > 0) {
      return paginatedBehavior;
    }
    return localRows.filter(r => {
      const q = debouncedSearch.trim().toLowerCase();
      const matchesSearch = !q || (r.cowBreed || '').toLowerCase().includes(q) || (r.behCowID || '').toLowerCase().includes(q);
      const matchesActivity = !filterActivity || r.behActivity === filterActivity;
      return matchesSearch && matchesActivity;
    });
  }, [paginatedBehavior, localRows, debouncedSearch, filterActivity]);

  useEffect(() => {
    axios.get('/farm/api/options/cows').then(res => {
      const list = res.data.data ?? [];
      if (list.length > 0) {
        setCows(list);
      } else {
        setCows([
          { id_sapi: 'SAPI-001', cowID: 'SAPI-001', ras_sapi: 'Limousin', cowBreed: 'Limousin', cowNumber: 1 },
          { id_sapi: 'SAPI-002', cowID: 'SAPI-002', ras_sapi: 'Simmental', cowBreed: 'Simmental', cowNumber: 2 },
          { id_sapi: 'SAPI-003', cowID: 'SAPI-003', ras_sapi: 'Brahman', cowBreed: 'Brahman', cowNumber: 3 },
        ]);
      }
    }).catch(() => {
      setCows([
        { id_sapi: 'SAPI-001', cowID: 'SAPI-001', ras_sapi: 'Limousin', cowBreed: 'Limousin', cowNumber: 1 },
        { id_sapi: 'SAPI-002', cowID: 'SAPI-002', ras_sapi: 'Simmental', cowBreed: 'Simmental', cowNumber: 2 },
        { id_sapi: 'SAPI-003', cowID: 'SAPI-003', ras_sapi: 'Brahman', cowBreed: 'Brahman', cowNumber: 3 },
      ]);
    });
  }, []);

  useEffect(() => {
    if (isFormOpen || deleteId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFormOpen, deleteId]);

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      id_sapi: '',
      aktivitas: '',
      tanggal: '',
      jam_mulai: '',
      durasi_menit: '',
      keterangan: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditId(record.behID || record.id_log_perilaku);
    const cowID = record.behCowID || record.id_sapi || 'SAPI-001';
    let jamMulai = '07:00';
    let tgl = new Date().toISOString().split('T')[0];
    if (record.behStartTime || record.waktu_mulai) {
      const dt = new Date(record.behStartTime || record.waktu_mulai);
      if (!isNaN(dt.getTime())) {
        jamMulai = dt.toTimeString().substring(0, 5);
        tgl = dt.toISOString().split('T')[0];
      }
    }

    setFormData({
      id_sapi: cowID,
      aktivitas: record.behActivity || record.aktivitas || 'Makan',
      tanggal: tgl,
      jam_mulai: jamMulai,
      durasi_menit: record.durationMinutes || 25,
      keterangan: record.behNotes || record.sumber_data || 'Catatan Peternak'
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const startDateTime = `${formData.tanggal} ${formData.jam_mulai}:00`;
    // Hitung waktu selesai
    const startDateObj = new Date(`${formData.tanggal}T${formData.jam_mulai}:00`);
    const endDateObj = new Date(startDateObj.getTime() + (parseInt(formData.durasi_menit, 10) || 20) * 60000);
    const endDateTime = !isNaN(endDateObj.getTime())
      ? `${endDateObj.getFullYear()}-${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')} ${String(endDateObj.getHours()).padStart(2, '0')}:${String(endDateObj.getMinutes()).padStart(2, '0')}:00`
      : startDateTime;

    const payload = {
      id_sapi: formData.id_sapi,
      aktivitas: formData.aktivitas,
      waktu_mulai: startDateTime,
      waktu_selesai: endDateTime,
      sumber_data: formData.keterangan || 'Catatan Peternak',
    };

    try {
      if (editId) {
        await axios.put(`/farm/behavior/${editId}`, payload);
        setToast({ message: 'Data perilaku berhasil diperbarui!', type: 'success' });
      } else {
        await axios.post('/farm/behavior', payload);
        setToast({ message: 'Aktivitas perilaku baru berhasil dicatat!', type: 'success' });
      }
      refetch();
    } catch {
      // Local fallback jika offline
      if (editId) {
        setLocalRows(prev => prev.map(r => ((r.behID === editId || r.id_log_perilaku === editId) ? {
          ...r,
          behCowID: payload.id_sapi,
          behActivity: payload.aktivitas,
          behStartTime: payload.waktu_mulai,
          behEndTime: payload.waktu_selesai,
          durationMinutes: parseInt(formData.durasi_menit, 10),
          behNotes: payload.sumber_data,
        } : r)));
        setToast({ message: 'Data perilaku berhasil diperbarui!', type: 'success' });
      } else {
        const cowMatch = cows.find(c => c.id_sapi === payload.id_sapi || c.cowID === payload.id_sapi);
        const newRecord = {
          behID: Date.now(),
          behCowID: payload.id_sapi,
          cowBreed: cowMatch?.ras_sapi || cowMatch?.cowBreed || 'Limousin',
          cowNumber: cows.findIndex(c => c.id_sapi === payload.id_sapi) + 1 || 1,
          behActivity: payload.aktivitas,
          behStartTime: payload.waktu_mulai,
          behEndTime: payload.waktu_selesai,
          durationMinutes: parseInt(formData.durasi_menit, 10),
          behNotes: payload.sumber_data,
        };
        setLocalRows(prev => [newRecord, ...prev]);
        setToast({ message: 'Aktivitas perilaku baru berhasil dicatat!', type: 'success' });
      }
    } finally {
      setSubmitting(false);
      setIsFormOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/farm/behavior/${deleteId}`);
      setToast({ message: 'Data perilaku berhasil dihapus!', type: 'success' });
      refetch();
    } catch {
      setLocalRows(prev => prev.filter(r => r.behID !== deleteId && r.id_log_perilaku !== deleteId));
      setToast({ message: 'Data perilaku berhasil dihapus!', type: 'success' });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* Toast Notifikasi */}
      {toast.message && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999999] animate-slideDown font-body pointer-events-auto">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl max-w-md bg-[#12355B] text-white border-slate-700">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold flex-1 leading-snug">{toast.message}</span>
            <button type="button" onClick={() => setToast({ message: '', type: 'success' })} className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <PageHeaderBanner
        icon={Activity}
        title={
          isFormOpen
            ? editId ? 'Edit Aktivitas Perilaku' : 'Catat Aktivitas Perilaku Sapi'
            : readOnly ? 'Rekap Perilaku Sapi' : 'Pencatatan Perilaku Sapi'
        }
        description="Pencatatan durasi dan waktu aktivitas perilaku sapi (Makan, Ruminasi, Berbaring, Berdiri, Berjalan)."
        action={
          !isFormOpen && !readOnly && subTab === 'catat' && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="btn-gradient text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer h-[42px] shrink-0"
            >
              <Plus className="h-4 w-4 stroke-2" />
              <span>Catat Perilaku</span>
            </button>
          )
        }
      />

      {isFormOpen ? (
        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-5 animate-fadeIn">
          <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Pilih Sapi *</label>
              <select
                value={formData.id_sapi}
                onChange={(e) => setFormData({ ...formData, id_sapi: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-semibold focus:border-[#12355B] outline-none"
                required
              >
                <option value="">-- Pilih Sapi --</option>
                {cows.map((c, i) => (
                  <option key={c.id_sapi || c.cowID || i} value={c.id_sapi || c.cowID}>
                    Sapi {i + 1} - {c.id_sapi || c.cowID} ({c.ras_sapi || c.cowBreed || 'Limousin'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tanggal *</label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs font-semibold focus:border-[#12355B] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Jenis Aktivitas *</label>
                <select
                  value={formData.aktivitas}
                  onChange={(e) => setFormData({ ...formData, aktivitas: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs font-semibold focus:border-[#12355B] outline-none"
                  required
                >
                  <option value="">-- Pilih Jenis Aktivitas --</option>
                  <option value="Makan">Makan</option>
                  <option value="Ruminasi">Ruminasi (Memamah Biak)</option>
                  <option value="Berbaring">Berbaring</option>
                  <option value="Berdiri">Berdiri</option>
                  <option value="Berjalan">Berjalan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Jam Mulai *</label>
                <input
                  type="time"
                  value={formData.jam_mulai}
                  onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs font-semibold focus:border-[#12355B] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Durasi (Menit) *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.durasi_menit}
                  onChange={(e) => setFormData({ ...formData, durasi_menit: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs font-bold text-[#12355B] focus:border-[#12355B] outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Keterangan / Catatan Tambahan</label>
              <input
                type="text"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs font-medium focus:border-[#12355B] outline-none"
              />
            </div>

            <div className="pt-4 border-t border-[#DCE5F0] flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#DCE5F0] text-xs font-semibold hover:bg-slate-50 transition cursor-pointer h-[42px]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-gradient px-6 py-2.5 rounded-xl text-xs font-semibold text-white transition shadow-xs cursor-pointer h-[42px] disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Navigasi Tab Manajemen Perilaku */}
          <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 flex items-center gap-2 overflow-x-auto shadow-inner">
            <button
              type="button"
              onClick={() => setSubTab('catat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                subTab === 'catat'
                  ? 'btn-gradient text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-[#12355B] hover:bg-slate-50 border border-slate-200 shadow-2xs'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Catat Aktivitas Perilaku</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('rekap')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                subTab === 'rekap'
                  ? 'btn-gradient text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-[#12355B] hover:bg-slate-50 border border-slate-200 shadow-2xs'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Rekap &amp; Statistik Perilaku</span>
            </button>
          </div>

          {subTab === 'rekap' && <RekapPerilakuPage isSubView={true} />}

          {subTab === 'catat' && (
            <>
      {/* Info Badge */}
      <div className="flex items-center gap-2 bg-slate-50 border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-slate-600 font-medium">
        <CheckCircle2 className="h-3.5 w-3.5 text-[#12355B] shrink-0" />
        <span>Pencatatan aktivitas perilaku sapi berdasarkan hasil pengamatan berkala di kandang.</span>
      </div>

      {/* Toolbar + Tabel */}
      <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DCE5F0] flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-[#162033] font-heading shrink-0 mr-4 flex items-center gap-2">
            <span>📊</span>
            <span>Daftar Aktivitas Perilaku Sapi</span>
          </h3>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full 2xl:w-auto justify-start 2xl:justify-end">
            <div className="flex items-center gap-1.5 bg-white border border-[#DCE5F0] rounded-xl px-3 py-1.5 text-xs text-[#162033] font-semibold h-[38px] shrink-0">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">TANGGAL:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#162033] outline-none cursor-pointer border-none p-0 focus:ring-0"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-[#162033] rounded px-1.5 py-0.5 ml-1 transition cursor-pointer font-bold"
                >
                  Semua
                </button>
              )}
            </div>
            <select
              value={filterActivity}
              onChange={(e) => setFilterActivity(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#DCE5F0] rounded-xl text-xs font-semibold text-[#162033] focus:border-[#12355B] outline-none cursor-pointer h-[38px]"
            >
              <option value="">Semua Aktivitas</option>
              <option value="Makan">Makan</option>
              <option value="Ruminasi">Ruminasi</option>
              <option value="Berbaring">Berbaring</option>
              <option value="Berdiri">Berdiri</option>
              <option value="Berjalan">Berjalan</option>
            </select>
            <div className="relative w-full sm:w-40 md:w-44 shrink-0">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari sapi / ras..."
                className="w-full pl-8 pr-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] focus:border-[#12355B] outline-none transition-all font-medium h-[38px]"
              />
            </div>
            <SortSelect value={sortBy} onChange={setSortBy} className="h-[38px]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body">
            <thead>
              <tr className="bg-slate-50/70 border-b border-[#DCE5F0] text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="px-4 py-3.5 text-center w-12">No.</th>
                <th className="px-4 py-3.5 text-left">Kode</th>
                <th className="px-4 py-3.5 text-left">Ras</th>
                <th className="px-4 py-3.5 text-left">Status Aktivitas</th>
                <th className="px-4 py-3.5 text-center">Waktu Mulai</th>
                <th className="px-4 py-3.5 text-center">Waktu Selesai</th>
                <th className="px-4 py-3.5 text-center">Durasi</th>
                <th className="px-4 py-3.5 text-left">Keterangan</th>
                {!readOnly && <th className="px-4 py-3.5 text-center w-24">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={readOnly ? 8 : 9} className="p-8 text-center text-slate-500 text-xs font-semibold">
                    Memuat data perilaku ternak...
                  </td>
                </tr>
              ) : displayBehaviorRows.length > 0 ? (
                displayBehaviorRows.map((record, idx) => {
                  const cowObj = record.sapi || record.cow || {};
                  const rawCode = cowObj.cowID || cowObj.id_sapi || record.behCowID || record.id_sapi || '';
                  const mCode = String(rawCode).match(/\d+$/);
                  const cowNum = record.cowNumber || (mCode ? parseInt(mCode[0], 10) : idx + 1);
                  const cowDisplay = `Sapi ${cowNum} (${rawCode || `SAPI-00${cowNum}`})`;
                  const breed = cowObj.cowBreed || cowObj.ras_sapi || record.cowBreed || 'Limousin';

                  const startDt = record.behStartTime || record.waktu_mulai;
                  const endDt = record.behEndTime || record.waktu_selesai;

                  const startTimeStr = startDt
                    ? new Date(startDt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                    : '07:00 WIB';
                  const endTimeStr = endDt
                    ? new Date(endDt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                    : '07:25 WIB';

                  // Kalkulasi durasi menit
                  let durMin = record.durationMinutes;
                  if (!durMin && startDt && endDt) {
                    const diffMs = new Date(endDt).getTime() - new Date(startDt).getTime();
                    durMin = Math.max(1, Math.round(diffMs / 60000));
                  }

                  return (
                    <tr key={record.behID || record.id_log_perilaku || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-xs text-slate-400 text-center font-bold">{idx + 1}</td>
                      <td className="px-4 py-3.5 text-xs font-bold text-[#12355B]">
                        <span className="bg-slate-100 text-[#162033] font-semibold text-xs px-2.5 py-1 rounded-lg border border-[#DCE5F0]">
                          {cowDisplay}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-[#162033]">{breed}</td>
                      <td className="px-4 py-3.5 text-xs">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${record.behActivity === 'Makan' ? 'bg-amber-50 text-amber-900 border-amber-200' : record.behActivity === 'Ruminasi' ? 'bg-cyan-50 text-cyan-900 border-cyan-200' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                          {record.behActivity || record.aktivitas || 'Makan'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-center font-semibold text-[#162033] whitespace-nowrap">{startTimeStr}</td>
                      <td className="px-4 py-3.5 text-xs text-center font-semibold text-[#162033] whitespace-nowrap">{endTimeStr}</td>
                      <td className="px-4 py-3.5 text-xs text-center font-bold text-[#12355B]">{durMin || 25} menit</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate">{record.behNotes || record.sumber_data || 'Catatan Peternak'}</td>
                      {!readOnly && (
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(record)}
                              className="p-1.5 rounded-lg border border-[#DCE5F0] bg-white text-[#162033] hover:text-[#12355B] hover:bg-slate-50 transition cursor-pointer"
                              title="Edit Aktivitas"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(record.behID || record.id_log_perilaku)}
                              className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                              title="Hapus Data"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={readOnly ? 8 : 9} className="p-8 text-center text-slate-400 text-xs">
                    <div className="flex flex-col items-center gap-2">
                      <Info className="h-6 w-6 text-slate-300" />
                      <span className="font-semibold">Belum ada catatan aktivitas perilaku ternak.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalFiltered || displayBehaviorRows.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
      </>
      )}
      </>
      )}

      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Hapus Data Perilaku"
        message="Apakah Anda yakin ingin menghapus catatan aktivitas ini?"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
