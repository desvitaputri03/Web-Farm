import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { router } from '@inertiajs/react';
import {
  Thermometer,
  Scale,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Search,
  AlertCircle,
  CheckCircle2,
  Info,
  Calendar,
  Clock,
  Activity,
  FileText
} from 'lucide-react';
import Pagination from './Pagination';
import SortSelect from './SortSelect';
import PageHeaderBanner from './PageHeaderBanner';
import PemeriksaanKesehatanPage from './PemeriksaanKesehatanPage';
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
      <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 shadow-2xl max-w-[360px] w-full text-center max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="text-sm font-bold text-[#162033] font-heading mb-2">{title}</h3>}
        <p className="text-xs font-medium text-[#64748B] py-1 leading-relaxed">
          {message}
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

const fmtDate = (dt) => {
  if (!dt) return '—';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return String(dt);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Data dummy awal konsisten untuk demo riwayat suhu & penimbangan sapi
const INITIAL_PHY_DUMMY = [
  {
    phyID: 1,
    phyCowID: 'SAPI-001',
    cowNumber: 1,
    cowBreed: 'Limousin',
    phyTemperature: 38.5,
    phyCurrentWeight: 350,
    phyInitialWeight: 200,
    phyTargetWeight: 500,
    phyStatus: 'Normal',
    phyRecordDate: new Date().toISOString().split('T')[0],
    phyRecordTime: '08:00',
    phyRecordType: 'Pengukuran Suhu Rutin',
    phyHealthHistory: 'Suhu stabil di pagi hari, kondisi aktif dan sehat.'
  },
  {
    phyID: 2,
    phyCowID: 'SAPI-001',
    cowNumber: 1,
    cowBreed: 'Limousin',
    phyTemperature: 38.7,
    phyCurrentWeight: 350,
    phyInitialWeight: 200,
    phyTargetWeight: 500,
    phyStatus: 'Normal',
    phyRecordDate: new Date().toISOString().split('T')[0],
    phyRecordTime: '16:00',
    phyRecordType: 'Pengukuran Suhu Rutin',
    phyHealthHistory: 'Pengukuran suhu sore hari setelah makan ketiga.'
  },
  {
    phyID: 3,
    phyCowID: 'SAPI-001',
    cowNumber: 1,
    cowBreed: 'Limousin',
    phyTemperature: 38.4,
    phyCurrentWeight: 350,
    phyInitialWeight: 200,
    phyTargetWeight: 500,
    phyStatus: 'Normal',
    phyRecordDate: '2026-10-01',
    phyRecordTime: '09:00',
    phyRecordType: 'Penimbangan Berkala',
    phyHealthHistory: 'Penimbangan awal bulan, kenaikan bobot mencapai 150 kg dari saat beli.'
  },
  {
    phyID: 4,
    phyCowID: 'SAPI-002',
    cowNumber: 2,
    cowBreed: 'Simmental',
    phyTemperature: 38.6,
    phyCurrentWeight: 380,
    phyInitialWeight: 220,
    phyTargetWeight: 550,
    phyStatus: 'Normal',
    phyRecordDate: new Date().toISOString().split('T')[0],
    phyRecordTime: '08:30',
    phyRecordType: 'Penimbangan Berkala',
    phyHealthHistory: 'Pertumbuhan bobot sangat cepat, nafsu makan tinggi.'
  },
  {
    phyID: 5,
    phyCowID: 'SAPI-003',
    cowNumber: 3,
    cowBreed: 'Brahman',
    phyTemperature: 38.3,
    phyCurrentWeight: 310,
    phyInitialWeight: 190,
    phyTargetWeight: 450,
    phyStatus: 'Normal',
    phyRecordDate: new Date().toISOString().split('T')[0],
    phyRecordTime: '08:15',
    phyRecordType: 'Pengukuran Suhu Rutin',
    phyHealthHistory: 'Kondisi fisik prima, suhu normal.'
  }
];

export default function FisiologisPage({ readOnly = false }) {
  const [cows, setCows] = useState([]);
  const [localRows, setLocalRows] = useState(INITIAL_PHY_DUMMY);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery);
  const [sortBy, setSortBy] = useState('terbaru');
  const [deleteId, setDeleteId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [subTab, setSubTab] = useState('fisiologis'); // 'fisiologis' | 'medis'
  const [detailRecord, setDetailRecord] = useState(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('suhu'); // 'suhu' | 'berat'
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id_sapi: '',
    tanggal_pencatatan: '',
    jam_pengukuran: '',
    jenis_pencatatan: 'Pengukuran Suhu Rutin',
    suhu_tubuh: '',
    bobot_terkini: '',
    bobot_awal: '',
    bobot_target: '',
    status_fisiologis: 'Normal',
    riwayat_kesehatan: '',
  });

  const {
    data: paginatedPhysiology,
    total: totalFiltered,
    loading,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    refetch,
  } = usePaginatedFetch('/farm/api/physiology', {
    search: debouncedSearch,
    filters: selectedDate ? { date: selectedDate } : {},
    sort: sortBy,
  });

  const displayPhyRows = useMemo(() => {
    if (Array.isArray(paginatedPhysiology) && paginatedPhysiology.length > 0) {
      return paginatedPhysiology;
    }
    return localRows.filter(r => {
      const q = debouncedSearch.trim().toLowerCase();
      if (!q) return true;
      const breed = (r.cowBreed || '').toLowerCase();
      const code = (r.phyCowID || r.id_sapi || '').toLowerCase();
      const type = (r.phyRecordType || r.jenis_pencatatan || '').toLowerCase();
      const num = `sapi ${r.cowNumber || ''}`.toLowerCase();
      return breed.includes(q) || code.includes(q) || type.includes(q) || num.includes(q);
    });
  }, [paginatedPhysiology, localRows, debouncedSearch]);

  useEffect(() => {
    axios.get('/farm/api/options/cows')
      .then(res => {
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
      })
      .catch(() => {
        setCows([
          { id_sapi: 'SAPI-001', cowID: 'SAPI-001', ras_sapi: 'Limousin', cowBreed: 'Limousin', cowNumber: 1 },
          { id_sapi: 'SAPI-002', cowID: 'SAPI-002', ras_sapi: 'Simmental', cowBreed: 'Simmental', cowNumber: 2 },
          { id_sapi: 'SAPI-003', cowID: 'SAPI-003', ras_sapi: 'Brahman', cowBreed: 'Brahman', cowNumber: 3 },
        ]);
      });
  }, []);

  useEffect(() => {
    if (isFormOpen || detailRecord || deleteId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFormOpen, detailRecord, deleteId]);

  const handleOpenAddSuhu = () => {
    setEditId(null);
    setFormMode('suhu');
    setFormData({
      id_sapi: '',
      tanggal_pencatatan: '',
      jam_pengukuran: '',
      jenis_pencatatan: 'Pengukuran Suhu Rutin',
      suhu_tubuh: '',
      bobot_terkini: '',
      bobot_awal: '',
      bobot_target: '',
      status_fisiologis: 'Normal',
      riwayat_kesehatan: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenAddBerat = () => {
    setEditId(null);
    setFormMode('berat');
    setFormData({
      id_sapi: '',
      tanggal_pencatatan: '',
      jam_pengukuran: '',
      jenis_pencatatan: 'Penimbangan Berkala',
      suhu_tubuh: '',
      bobot_terkini: '',
      bobot_awal: '',
      bobot_target: '',
      status_fisiologis: 'Normal',
      riwayat_kesehatan: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditId(record.phyID || record.id_fisiologis);
    const cowID = record.phyCowID || record.id_sapi || 'SAPI-001';
    const recType = record.phyRecordType || record.jenis_pencatatan || 'Pengukuran Suhu Rutin';
    setFormMode(recType.includes('Suhu') ? 'suhu' : 'berat');

    setFormData({
      id_sapi: cowID,
      tanggal_pencatatan: record.phyRecordDate || record.tanggal_pencatatan || new Date().toISOString().split('T')[0],
      jam_pengukuran: record.phyRecordTime || record.jam_pengukuran || '08:00',
      jenis_pencatatan: recType,
      suhu_tubuh: parseFloat(record.phyTemperature || record.suhu_tubuh || 38.5),
      bobot_terkini: parseFloat(record.phyCurrentWeight || record.bobot_terkini || 350),
      bobot_awal: parseFloat(record.phyInitialWeight || record.bobot_awal || 200),
      bobot_target: parseFloat(record.phyTargetWeight || record.bobot_target || 500),
      status_fisiologis: record.phyStatus || record.status_fisiologis || 'Normal',
      riwayat_kesehatan: record.phyHealthHistory || record.riwayat_kesehatan || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      id_sapi: formData.id_sapi,
      tanggal_pencatatan: formData.tanggal_pencatatan || new Date().toISOString().split('T')[0],
      jam_pengukuran: formData.jam_pengukuran || '08:00',
      jenis_pencatatan: formData.jenis_pencatatan,
      suhu_tubuh: parseFloat(formData.suhu_tubuh) || 38.5,
      bobot_terkini: parseFloat(formData.bobot_terkini) || 350,
      bobot_awal: parseFloat(formData.bobot_awal) || 200,
      bobot_target: parseFloat(formData.bobot_target) || 500,
      status_fisiologis: formData.status_fisiologis || 'Normal',
      riwayat_kesehatan: formData.riwayat_kesehatan || 'Pengukuran manual.',
    };

    try {
      if (editId) {
        await axios.put(`/farm/physiology/${editId}`, payload);
        setToast({ message: 'Catatan kondisi fisiologis berhasil diperbarui!', type: 'success' });
      } else {
        await axios.post('/farm/physiology', payload);
        setToast({ message: 'Pengukuran baru berhasil dicatat dalam riwayat!', type: 'success' });
      }
      refetch();
    } catch {
      // Local fallback jika offline
      if (editId) {
        setLocalRows(prev => prev.map(r => ((r.phyID === editId || r.id_fisiologis === editId) ? { ...r, ...payload } : r)));
        setToast({ message: 'Catatan berhasil diperbarui!', type: 'success' });
      } else {
        const cowMatch = cows.find(c => c.id_sapi === payload.id_sapi || c.cowID === payload.id_sapi);
        const newRecord = {
          phyID: Date.now(),
          ...payload,
          phyCowID: payload.id_sapi,
          cowBreed: cowMatch?.ras_sapi || cowMatch?.cowBreed || 'Limousin',
          cowNumber: cows.findIndex(c => c.id_sapi === payload.id_sapi) + 1 || 1,
          phyTemperature: payload.suhu_tubuh,
          phyCurrentWeight: payload.bobot_terkini,
          phyRecordDate: payload.tanggal_pencatatan,
          phyRecordTime: payload.jam_pengukuran,
          phyRecordType: payload.jenis_pencatatan,
          phyStatus: payload.status_fisiologis,
        };
        setLocalRows(prev => [newRecord, ...prev]);
        setToast({ message: 'Pengukuran baru berhasil dicatat dalam riwayat!', type: 'success' });
      }
    } finally {
      setSubmitting(false);
      setIsFormOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/farm/physiology/${deleteId}`);
      setToast({ message: 'Data pengukuran berhasil dihapus!', type: 'success' });
      refetch();
    } catch {
      setLocalRows(prev => prev.filter(r => r.phyID !== deleteId && r.id_fisiologis !== deleteId));
      setToast({ message: 'Data pengukuran berhasil dihapus!', type: 'success' });
    } finally {
      setDeleteId(null);
    }
  };

  // Kalkulasi Rata-rata KPI
  const avgTemp = (displayPhyRows.reduce((acc, r) => acc + (parseFloat(r.phyTemperature || r.suhu_tubuh) || 38.5), 0) / (displayPhyRows.length || 1)).toFixed(1);
  const avgWeight = Math.round(displayPhyRows.reduce((acc, r) => acc + (parseFloat(r.phyCurrentWeight || r.bobot_terkini) || 350), 0) / (displayPhyRows.length || 1));

  return (
    <div className="space-y-6 font-body">
      {/* Toast Alert */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Hapus Data Pengukuran"
        message="Apakah Anda yakin ingin menghapus data pengukuran ini dari riwayat?"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

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

      {/* 1. Header Banner dengan 2 Tombol Tindakan */}
      <PageHeaderBanner
        icon={Thermometer}
        title={isFormOpen ? (editId ? 'Ubah Catatan Pengukuran' : formMode === 'suhu' ? 'Catat Suhu Tubuh Sapi' : 'Catat Penimbangan Berat Badan Sapi') : detailRecord ? 'Detail Riwayat Pengukuran' : 'Kondisi Fisiologis, Suhu & Bobot Sapi'}
        description="Pencatatan berkala suhu tubuh (°C), waktu pengukuran, dan penimbangan berat badan sapi."
        action={
          !isFormOpen && !detailRecord && subTab === 'fisiologis' ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddSuhu}
                className="btn-gradient text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer h-[42px] shrink-0"
              >
                <Thermometer className="h-4 w-4 stroke-2" />
                <span>Catat Suhu Tubuh</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAddBerat}
                className="bg-white hover:bg-slate-50 text-[#12355B] border border-[#DCE5F0] hover:border-[#12355B]/40 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer h-[42px] shrink-0"
              >
                <Scale className="h-4 w-4 stroke-2 text-[#12355B]" />
                <span>Catat Berat Badan</span>
              </button>
            </div>
          ) : null
        }
      />

      {/* Navigasi Tab Manajemen Fisiologis & Medis */}
      {!isFormOpen && !detailRecord && (
        <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 flex items-center gap-2 overflow-x-auto shadow-inner">
          <button
            type="button"
            onClick={() => setSubTab('fisiologis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              subTab === 'fisiologis'
                ? 'btn-gradient text-white shadow-xs'
                : 'bg-white text-slate-700 hover:text-[#12355B] hover:bg-slate-50 border border-slate-200 shadow-2xs'
            }`}
          >
            <Thermometer className="h-4 w-4" />
            <span>Suhu Tubuh &amp; Bobot Badan</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('medis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              subTab === 'medis'
                ? 'btn-gradient text-white shadow-xs'
                : 'bg-white text-slate-700 hover:text-[#12355B] hover:bg-slate-50 border border-slate-200 shadow-2xs'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Riwayat Pemeriksaan Medis (Mantri)</span>
          </button>
        </div>
      )}

      {isFormOpen ? (
        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-5 animate-fadeIn">
          <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
            {/* 1. Pilih Sapi, Tanggal, Jam */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-slate-600 font-bold mb-1">Pilih Sapi yang Diukur *</label>
                <select
                  value={formData.id_sapi}
                  onChange={(e) => setFormData({ ...formData, id_sapi: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-semibold focus:border-[#12355B] outline-none"
                  required
                >
                  <option value="">-- Pilih Sapi yang Diukur --</option>
                  {cows.map((c, i) => (
                    <option key={c.id_sapi || c.cowID || i} value={c.id_sapi || c.cowID}>
                      Sapi {i + 1} - {c.id_sapi || c.cowID} ({c.ras_sapi || c.cowBreed || 'Limousin'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tanggal Pengukuran *</label>
                <input
                  type="date"
                  value={formData.tanggal_pencatatan}
                  onChange={(e) => setFormData({ ...formData, tanggal_pencatatan: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Jam Pengukuran *</label>
                <input
                  type="time"
                  value={formData.jam_pengukuran}
                  onChange={(e) => setFormData({ ...formData, jam_pengukuran: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Jenis Pencatatan</label>
                <select
                  value={formData.jenis_pencatatan}
                  onChange={(e) => setFormData({ ...formData, jenis_pencatatan: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-semibold"
                >
                  <option value="Pengukuran Suhu Rutin">Pengukuran Suhu Rutin</option>
                  <option value="Penimbangan Berkala">Penimbangan Berkala</option>
                  <option value="Berat Awal Pembelian">Berat Awal Pembelian</option>
                  <option value="Berat Saat Penjualan">Berat Saat Penjualan</option>
                </select>
              </div>
            </div>

            {/* 2. Nilai Pengukuran Suhu & Berat Badan */}
            <div className="bg-slate-50 border border-[#DCE5F0] rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#12355B] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                Hasil Pengukuran Lapangan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Suhu Tubuh (°C) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.suhu_tubuh}
                    onChange={(e) => setFormData({ ...formData, suhu_tubuh: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs font-bold text-[#12355B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Berat Badan Terkini (kg) *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.bobot_terkini}
                    onChange={(e) => setFormData({ ...formData, bobot_terkini: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs font-bold text-[#162033]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Target Berat Jual (kg)</label>
                  <input
                    type="number"
                    step="5"
                    value={formData.bobot_target}
                    onChange={(e) => setFormData({ ...formData, bobot_target: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs font-bold text-[#162033]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Status Kesehatan & Keterangan */}
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Status Kesehatan Sapi</label>
                <select
                  value={formData.status_fisiologis}
                  onChange={(e) => setFormData({ ...formData, status_fisiologis: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-semibold"
                >
                  <option value="Normal">Normal (Sehat & Aktif)</option>
                  <option value="Waspada">Waspada (Nafsu Makan Turun)</option>
                  <option value="Demam">Demam / Butuh Perawatan Mantri</option>
                  <option value="Pemulihan">Masa Pemulihan</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Keterangan / Catatan Pengukuran</label>
                <textarea
                  rows="2"
                  value={formData.riwayat_kesehatan}
                  onChange={(e) => setFormData({ ...formData, riwayat_kesehatan: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-medium"
                ></textarea>
              </div>
            </div>

            {/* Tombol Simpan / Batal */}
            <div className="pt-3 border-t border-[#DCE5F0] flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-[#DCE5F0] text-xs font-semibold text-[#162033] hover:bg-slate-50 transition cursor-pointer h-[42px] min-w-[110px]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-gradient px-6 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-50 h-[42px] min-w-[110px]"
              >
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      ) : detailRecord ? (
        <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-5 animate-fadeIn font-body">
          <div className="pb-3 border-b border-[#DCE5F0]">
            <h3 className="text-base font-bold text-[#162033] font-heading">
              Detail Riwayat Pengukuran
            </h3>
            <p className="text-xs text-[#64748B]">
              Waktu: {fmtDate(detailRecord.phyRecordDate || detailRecord.tanggal_pencatatan || detailRecord.created_at)} pukul {detailRecord.phyRecordTime || detailRecord.jam_pengukuran || '08:00'} WIB
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 border border-[#DCE5F0] rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Suhu Tubuh</span>
              <span className="text-base font-bold text-[#12355B]">{detailRecord.phyTemperature || detailRecord.suhu_tubuh || 38.5} °C</span>
            </div>
            <div className="bg-slate-50 border border-[#DCE5F0] rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Berat Badan</span>
              <span className="text-base font-bold text-slate-800">{detailRecord.phyCurrentWeight || detailRecord.bobot_terkini || 350} kg</span>
            </div>
            <div className="bg-slate-50 border border-[#DCE5F0] rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Status Fisiologis</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                {detailRecord.phyStatus || detailRecord.status_fisiologis || 'Normal'}
              </span>
            </div>
            <div className="bg-slate-50 border border-[#DCE5F0] rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Jenis Pencatatan</span>
              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                {detailRecord.phyRecordType || detailRecord.jenis_pencatatan || 'Pengukuran Rutin'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Catatan Pengukuran</span>
            <p className="text-slate-700 font-semibold bg-slate-50 p-3 rounded-xl border border-[#DCE5F0] leading-relaxed text-xs">
              {detailRecord.phyHealthHistory || detailRecord.riwayat_kesehatan || 'Kondisi stabil, pemeriksaan normal.'}
            </p>
          </div>

          <div className="pt-2 flex justify-center border-t border-[#DCE5F0]">
            <button
              type="button"
              onClick={() => setDetailRecord(null)}
              className="btn-gradient px-6 py-2.5 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              Kembali
            </button>
          </div>
        </div>
      ) : (
        <>
          {subTab === 'medis' && <PemeriksaanKesehatanPage isSubView={true} role="peternak" />}

          {subTab === 'fisiologis' && (
            <>
      {/* 2. Ringkasan KPI Kondisi Fisiologis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-body">
        <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rata-rata Suhu Tubuh</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
              <Thermometer className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#162033] mt-2 font-heading">{avgTemp} °C</p>
          <p className="text-[11px] text-slate-500 mt-1">Rentang normal: 38.0 - 39.3 °C</p>
        </div>

        <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rata-rata Berat Terkini</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#12355B] mt-2 font-heading">{avgWeight} kg</p>
          <p className="text-[11px] text-slate-500 mt-1">Penimbangan berkala sapi</p>
        </div>

        <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Riwayat Catatan</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#162033] mt-2 font-heading">{displayPhyRows.length} Riwayat</p>
          <p className="text-[11px] text-slate-500 mt-1">Riwayat pengukuran fisik sapi</p>
        </div>

        <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status Pemeriksaan</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">Aktif Terpantau</p>
          <p className="text-[11px] text-slate-500 mt-1">Pemeriksaan berkala peternak</p>
        </div>
      </div>

      {/* 3. Toolbar & Tabel Riwayat Fisiologis */}
      <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DCE5F0] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <h3 className="text-base font-bold text-[#162033] font-heading shrink-0 flex items-center gap-2">
            <span>🌡️</span>
            <span>Riwayat Pengukuran Suhu &amp; Penimbangan Berat Sapi</span>
          </h3>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 bg-white border border-[#DCE5F0] rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold h-[38px] shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TANGGAL:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  title="Reset tanggal"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-48 h-[38px]">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari sapi / catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] focus:border-[#12355B] focus:ring-2 focus:ring-slate-500/10 outline-none transition-all h-[38px] font-medium"
              />
            </div>

            <SortSelect value={sortBy} onChange={setSortBy} className="h-[38px]" />
          </div>
        </div>

        {/* Tabel Riwayat Pengukuran */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-[#DCE5F0] text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="px-4 py-3.5 text-center w-12">No.</th>
                <th className="px-4 py-3.5 text-left">Sapi</th>
                <th className="px-4 py-3.5 text-left">Ras</th>
                <th className="px-4 py-3.5 text-center">Waktu Pengukuran</th>
                <th className="px-4 py-3.5 text-left">Jenis Pencatatan</th>
                <th className="px-4 py-3.5 text-right font-bold text-[#12355B]">Suhu Tubuh</th>
                <th className="px-4 py-3.5 text-right font-bold text-[#162033]">Berat Terkini</th>
                <th className="px-4 py-3.5 text-right">Target Berat</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-left">Keterangan / Riwayat</th>
                <th className="px-4 py-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="11" className="text-center py-12 text-slate-400 font-semibold">Memuat riwayat kondisi fisiologis...</td></tr>
              ) : (displayPhyRows.length > 0) ? (
                displayPhyRows.map((record, idx) => {
                  const cowObj = record.sapi || record.cow || {};
                  const rawC = cowObj.cowID || cowObj.id_sapi || record.phyCowID || record.id_sapi || '';
                  const matchNum = String(rawC).match(/\d+$/);
                  const cowNum = record.cowNumber || (matchNum ? parseInt(matchNum[0], 10) : idx + 1);
                  const breed = cowObj.cowBreed || cowObj.ras_sapi || record.cowBreed || 'Limousin';

                  const tgl = fmtDate(record.phyRecordDate || record.tanggal_pencatatan || record.created_at);
                  const jam = record.phyRecordTime || record.jam_pengukuran || '08:00';
                  const temp = parseFloat(record.phyTemperature || record.suhu_tubuh || 38.5).toFixed(1);
                  const weight = parseFloat(record.phyCurrentWeight || record.bobot_terkini || 350).toFixed(1);
                  const targetWeight = parseFloat(record.phyTargetWeight || record.bobot_target || 500).toFixed(1);
                  const recType = record.phyRecordType || record.jenis_pencatatan || 'Pengukuran Suhu Rutin';
                  const status = record.phyStatus || record.status_fisiologis || 'Normal';

                  const isNormalTemp = parseFloat(temp) >= 38.0 && parseFloat(temp) <= 39.3;

                  return (
                    <tr key={record.phyID || record.id_fisiologis || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="bg-slate-100 text-[#162033] font-semibold text-xs px-2.5 py-1 rounded-md border border-[#DCE5F0]">
                          Sapi {cowNum} ({rawC || `SAPI-00${cowNum}`})
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#162033]">{breed}</td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="font-semibold text-slate-700 block">{tgl}</span>
                        <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" /> {jam} WIB
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-700">
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${recType.includes('Suhu') ? 'bg-cyan-50 text-cyan-800 border-cyan-200' : 'bg-blue-50 text-[#12355B] border-blue-200'}`}>
                          {recType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span className={`font-extrabold text-xs px-2 py-0.5 rounded-lg ${isNormalTemp ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                          {temp} °C
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#162033] text-right whitespace-nowrap">
                        {weight} kg
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-right whitespace-nowrap">
                        {targetWeight} kg
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate" title={record.phyHealthHistory || record.riwayat_kesehatan}>
                        {record.phyHealthHistory || record.riwayat_kesehatan || 'Kondisi stabil.'}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailRecord(record)}
                            className="p-1.5 rounded-lg border border-[#DCE5F0] bg-white text-[#162033] hover:text-[#12355B] hover:bg-slate-50 transition cursor-pointer"
                            title="Lihat Detail"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(record)}
                            className="p-1.5 rounded-lg border border-[#DCE5F0] bg-white text-[#162033] hover:text-[#12355B] hover:bg-slate-50 transition cursor-pointer"
                            title="Edit Data"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(record.phyID || record.id_fisiologis)}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                            title="Hapus Data"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Info className="h-6 w-6 text-slate-300" />
                      <span className="text-xs font-semibold">Belum ada riwayat pengukuran suhu / berat.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalFiltered || displayPhyRows.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
      </>
      )}
      </>
      )}
    </div>
  );
}
