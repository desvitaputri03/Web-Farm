import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  PackageOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Scale,
  Clock,
  DollarSign,
  Droplets,
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
import PakanIdealPage from './PakanIdealPage';
import IntensitasMakanPage from './IntensitasMakanPage';
import { usePaginatedFetch, useDebouncedValue } from '../../../hooks/usePaginatedFetch';

const fmtDate = (dt) => {
  if (!dt) return '—';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return String(dt);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatRupiah = (val) => {
  return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
};

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

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => { if (onClose) onClose(); }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;
  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center pointer-events-none font-body">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl max-w-md ${isSuccess ? 'bg-[#12355B] text-white border-slate-700' : 'bg-rose-900 text-white border-rose-700'}`}>
        {isSuccess ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" /> : <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />}
        <span className="text-xs font-semibold flex-1 leading-snug">{message}</span>
        <button type="button" onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Data dummy awal konsisten untuk demo (Sapi 1, 2, 3)
const INITIAL_FEED_DUMMY = [
  {
    feedID: 1,
    feedCowID: 'SAPI-001',
    cowBreed: 'Limousin',
    cowNumber: 1,
    feedRecordDate: new Date().toISOString().split('T')[0],
    feedComposition: 'Konsentrat & Rumput Gajah',
    feedInitialFeed: 10.0,
    feedLeftoverFeed: 0.0,
    feedPricePerKg: 5000,
    feedDailyCost: 50000,
    sesi_makan_1_jam: '07:00',
    sesi_makan_1_durasi: 20,
    sesi_makan_1_pakan: 3.33,
    sesi_makan_2_jam: '12:00',
    sesi_makan_2_durasi: 15,
    sesi_makan_2_pakan: 3.33,
    sesi_makan_3_jam: '17:00',
    sesi_makan_3_durasi: 25,
    sesi_makan_3_pakan: 3.34,
    total_durasi_makan: 60,
    feedWaterQuality: 'Air Sumur Bersih (pH 7.1)',
    feedInitialWater: 40.0,
    feedLeftoverWater: 5.0,
    keterangan: 'Pemberian pakan teratur 3 sesi, nafsu makan tinggi.'
  },
  {
    feedID: 2,
    feedCowID: 'SAPI-002',
    cowBreed: 'Simmental',
    cowNumber: 2,
    feedRecordDate: new Date().toISOString().split('T')[0],
    feedComposition: 'Silase Jagung & Konsentrat',
    feedInitialFeed: 12.0,
    feedLeftoverFeed: 0.5,
    feedPricePerKg: 4800,
    feedDailyCost: 57600,
    sesi_makan_1_jam: '07:30',
    sesi_makan_1_durasi: 25,
    sesi_makan_1_pakan: 4.0,
    sesi_makan_2_jam: '12:30',
    sesi_makan_2_durasi: 20,
    sesi_makan_2_pakan: 4.0,
    sesi_makan_3_jam: '17:30',
    sesi_makan_3_durasi: 30,
    sesi_makan_3_pakan: 4.0,
    total_durasi_makan: 75,
    feedWaterQuality: 'Air Minum Bersih',
    feedInitialWater: 45.0,
    feedLeftoverWater: 6.0,
    keterangan: 'Porsi pakan ditambah untuk percepatan bobot.'
  },
  {
    feedID: 3,
    feedCowID: 'SAPI-003',
    cowBreed: 'Brahman',
    cowNumber: 3,
    feedRecordDate: new Date().toISOString().split('T')[0],
    feedComposition: 'Jerami Fermentasi & Konsentrat',
    feedInitialFeed: 9.0,
    feedLeftoverFeed: 0.2,
    feedPricePerKg: 5200,
    feedDailyCost: 46800,
    sesi_makan_1_jam: '07:00',
    sesi_makan_1_durasi: 20,
    sesi_makan_1_pakan: 3.0,
    sesi_makan_2_jam: '12:00',
    sesi_makan_2_durasi: 15,
    sesi_makan_2_pakan: 3.0,
    sesi_makan_3_jam: '17:00',
    sesi_makan_3_durasi: 25,
    sesi_makan_3_pakan: 3.0,
    total_durasi_makan: 60,
    feedWaterQuality: 'Air Sumur Bersih',
    feedInitialWater: 38.0,
    feedLeftoverWater: 4.0,
    keterangan: 'Pencernaan normal, makan lahap.'
  }
];

export default function PemberianPakanPage() {
  const [cows, setCows] = useState([]);
  const [localRows, setLocalRows] = useState(INITIAL_FEED_DUMMY);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery);
  const [sortBy, setSortBy] = useState('terbaru');
  const [selectedDate, setSelectedDate] = useState('');
  const [subTab, setSubTab] = useState('pemberian'); // 'pemberian' | 'ideal' | 'intensitas'
  
  // State Modal Form & Detail
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id_sapi: '',
    tanggal_pencatatan: '',
    komposisi_pakan: '',
    pakan_awal: '', // Kebutuhan pakan per hari (kg)
    harga_pakan_per_kg: '',
    biaya_pakan_harian: 0,
    sesi_makan_1_jam: '',
    sesi_makan_1_durasi: '',
    sesi_makan_1_pakan: '',
    sesi_makan_2_jam: '',
    sesi_makan_2_durasi: '',
    sesi_makan_2_pakan: '',
    sesi_makan_3_jam: '',
    sesi_makan_3_durasi: '',
    sesi_makan_3_pakan: '',
    total_durasi_makan: 0,
    kualitas_air: '',
    air_awal: '',
    sisa_air: '',
    keterangan: '',
  });

  const {
    data: paginatedFeed,
    total: totalFiltered,
    loading,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    refetch,
  } = usePaginatedFetch('/farm/api/feed', {
    search: debouncedSearch,
    filters: selectedDate ? { date: selectedDate } : {},
    sort: sortBy,
  });

  // Gabungkan data paginated dari backend atau fallback dummy
  const displayRows = useMemo(() => {
    if (Array.isArray(paginatedFeed) && paginatedFeed.length > 0) {
      return paginatedFeed;
    }
    return localRows.filter(r => {
      const q = debouncedSearch.trim().toLowerCase();
      if (!q) return true;
      const breed = (r.cowBreed || '').toLowerCase();
      const code = (r.feedCowID || '').toLowerCase();
      const num = `sapi ${r.cowNumber || ''}`.toLowerCase();
      return breed.includes(q) || code.includes(q) || num.includes(q);
    });
  }, [paginatedFeed, localRows, debouncedSearch]);

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
    if (detailRecord || isFormOpen || deleteId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [detailRecord, isFormOpen, deleteId]);

  // Handle otomatisasi perubahan input dan kalkulasi biaya pakan
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Hitung otomatis biaya pakan jika kebutuhan atau harga berubah
      if (field === 'pakan_awal' || field === 'harga_pakan_per_kg') {
        const kg = parseFloat(field === 'pakan_awal' ? value : prev.pakan_awal) || 0;
        const price = parseFloat(field === 'harga_pakan_per_kg' ? value : prev.harga_pakan_per_kg) || 0;
        updated.biaya_pakan_harian = Math.round(kg * price);

        // Jika user mengubah total pakan, bagi secara seimbang untuk 3 sesi makan
        if (field === 'pakan_awal') {
          const s1 = parseFloat((kg / 3).toFixed(2));
          const s2 = parseFloat((kg / 3).toFixed(2));
          const s3 = parseFloat((kg - (s1 + s2)).toFixed(2));
          updated.sesi_makan_1_pakan = s1;
          updated.sesi_makan_2_pakan = s2;
          updated.sesi_makan_3_pakan = s3;
        }
      }

      // Hitung otomatis total durasi makan 3 sesi
      if (field === 'sesi_makan_1_durasi' || field === 'sesi_makan_2_durasi' || field === 'sesi_makan_3_durasi') {
        const d1 = parseInt(field === 'sesi_makan_1_durasi' ? value : prev.sesi_makan_1_durasi, 10) || 0;
        const d2 = parseInt(field === 'sesi_makan_2_durasi' ? value : prev.sesi_makan_2_durasi, 10) || 0;
        const d3 = parseInt(field === 'sesi_makan_3_durasi' ? value : prev.sesi_makan_3_durasi, 10) || 0;
        updated.total_durasi_makan = d1 + d2 + d3;
      }

      return updated;
    });
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      id_sapi: '',
      tanggal_pencatatan: '',
      komposisi_pakan: '',
      pakan_awal: '',
      harga_pakan_per_kg: '',
      biaya_pakan_harian: 0,
      sesi_makan_1_jam: '',
      sesi_makan_1_durasi: '',
      sesi_makan_1_pakan: '',
      sesi_makan_2_jam: '',
      sesi_makan_2_durasi: '',
      sesi_makan_2_pakan: '',
      sesi_makan_3_jam: '',
      sesi_makan_3_durasi: '',
      sesi_makan_3_pakan: '',
      total_durasi_makan: 0,
      kualitas_air: '',
      air_awal: '',
      sisa_air: '',
      keterangan: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditId(record.feedID || record.id_log_pakan);
    const cowID = record.feedCowID || record.id_sapi || 'SAPI-001';
    setFormData({
      id_sapi: cowID,
      tanggal_pencatatan: record.feedRecordDate || record.tanggal_pencatatan || new Date().toISOString().split('T')[0],
      komposisi_pakan: record.feedComposition || record.komposisi_pakan || 'Konsentrat & Hijauan',
      pakan_awal: parseFloat(record.feedInitialFeed || record.pakan_awal || 10.0),
      harga_pakan_per_kg: parseFloat(record.feedPricePerKg || record.harga_pakan_per_kg || 5000),
      biaya_pakan_harian: parseFloat(record.feedDailyCost || record.biaya_pakan_harian || 50000),
      sesi_makan_1_jam: record.sesi_makan_1_jam || '07:00',
      sesi_makan_1_durasi: parseInt(record.sesi_makan_1_durasi || 20, 10),
      sesi_makan_1_pakan: parseFloat(record.sesi_makan_1_pakan || 3.33),
      sesi_makan_2_jam: record.sesi_makan_2_jam || '12:00',
      sesi_makan_2_durasi: parseInt(record.sesi_makan_2_durasi || 15, 10),
      sesi_makan_2_pakan: parseFloat(record.sesi_makan_2_pakan || 3.33),
      sesi_makan_3_jam: record.sesi_makan_3_jam || '17:00',
      sesi_makan_3_durasi: parseInt(record.sesi_makan_3_durasi || 25, 10),
      sesi_makan_3_pakan: parseFloat(record.sesi_makan_3_pakan || 3.34),
      total_durasi_makan: parseInt(record.total_durasi_makan || 60, 10),
      kualitas_air: record.feedWaterQuality || record.kualitas_air || 'Air Minum Bersih',
      air_awal: parseFloat(record.feedInitialWater || record.air_awal || 40.0),
      sisa_air: parseFloat(record.feedLeftoverWater || record.sisa_air || 5.0),
      keterangan: record.keterangan || record.feedNotes || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      id_sapi: formData.id_sapi,
      tanggal_pencatatan: formData.tanggal_pencatatan,
      komposisi_pakan: formData.komposisi_pakan,
      pakan_awal: parseFloat(formData.pakan_awal) || 10,
      harga_pakan_per_kg: parseFloat(formData.harga_pakan_per_kg) || 5000,
      biaya_pakan_harian: parseFloat(formData.biaya_pakan_harian) || 50000,
      sesi_makan_1_jam: formData.sesi_makan_1_jam,
      sesi_makan_1_durasi: parseInt(formData.sesi_makan_1_durasi, 10) || 20,
      sesi_makan_1_pakan: parseFloat(formData.sesi_makan_1_pakan) || 3.33,
      sesi_makan_2_jam: formData.sesi_makan_2_jam,
      sesi_makan_2_durasi: parseInt(formData.sesi_makan_2_durasi, 10) || 15,
      sesi_makan_2_pakan: parseFloat(formData.sesi_makan_2_pakan) || 3.33,
      sesi_makan_3_jam: formData.sesi_makan_3_jam,
      sesi_makan_3_durasi: parseInt(formData.sesi_makan_3_durasi, 10) || 25,
      sesi_makan_3_pakan: parseFloat(formData.sesi_makan_3_pakan) || 3.34,
      total_durasi_makan: parseInt(formData.total_durasi_makan, 10) || 60,
      kualitas_air: formData.kualitas_air,
      air_awal: parseFloat(formData.air_awal) || 40,
      sisa_air: parseFloat(formData.sisa_air) || 5,
      keterangan: formData.keterangan,
    };

    try {
      if (editId) {
        await axios.put(`/farm/feed/${editId}`, payload);
        setToast({ message: 'Catatan pakan berhasil diperbarui!', type: 'success' });
      } else {
        await axios.post('/farm/feed', payload);
        setToast({ message: 'Catatan pakan dan jadwal makan baru berhasil disimpan!', type: 'success' });
      }
      refetch();
    } catch {
      // Fallback update local state jika offline
      if (editId) {
        setLocalRows(prev => prev.map(r => (r.feedID === editId ? { ...r, ...payload } : r)));
        setToast({ message: 'Catatan pakan berhasil diperbarui!', type: 'success' });
      } else {
        const newRecord = {
          feedID: Date.now(),
          ...payload,
          cowBreed: cows.find(c => c.id_sapi === payload.id_sapi)?.ras_sapi || 'Limousin',
          cowNumber: cows.findIndex(c => c.id_sapi === payload.id_sapi) + 1 || 1
        };
        setLocalRows(prev => [newRecord, ...prev]);
        setToast({ message: 'Catatan pakan dan jadwal makan baru berhasil disimpan!', type: 'success' });
      }
    } finally {
      setSubmitting(false);
      setIsFormOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/farm/feed/${deleteId}`);
      setToast({ message: 'Catatan pakan berhasil dihapus!', type: 'success' });
      refetch();
    } catch {
      setLocalRows(prev => prev.filter(r => r.feedID !== deleteId && r.id_log_pakan !== deleteId));
      setToast({ message: 'Catatan pakan berhasil dihapus!', type: 'success' });
    } finally {
      setDeleteId(null);
    }
  };

  // Kalkulasi Ringkasan Rata-Rata KPI
  const avgKebutuhan = (displayRows.reduce((acc, r) => acc + (parseFloat(r.feedInitialFeed || r.pakan_awal) || 10), 0) / (displayRows.length || 1)).toFixed(1);
  const avgBiaya = Math.round(displayRows.reduce((acc, r) => acc + (parseFloat(r.feedDailyCost || r.biaya_pakan_harian) || 50000), 0) / (displayRows.length || 1));
  const avgDurasi = Math.round(displayRows.reduce((acc, r) => acc + (parseInt(r.total_durasi_makan, 10) || 60), 0) / (displayRows.length || 1));

  return (
    <div className="space-y-6 font-body">
      {/* Toast Alert */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* 1. Header Banner */}
      <PageHeaderBanner
        icon={PackageOpen}
        title={isFormOpen ? (editId ? 'Edit Catatan Pakan Sapi' : 'Form Kebutuhan Pakan & 3 Sesi Makan') : detailRecord ? 'Detail Kebutuhan & Jadwal Makan' : 'Kebutuhan Pakan & Jadwal Makan'}
        description="Pencatatan kebutuhan pakan harian, estimasi biaya pakan, dan pemantauan 3 sesi makan sapi."
        action={
          !isFormOpen && !detailRecord && subTab === 'pemberian' ? (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="bg-[#12355B] hover:bg-[#0D2847] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer h-[42px] shrink-0"
            >
              <Plus className="h-4 w-4 stroke-2" />
              <span>Catat Pakan Harian</span>
            </button>
          ) : null
        }
      />

      {/* Navigasi Tab Manajemen Pakan */}
      {!isFormOpen && !detailRecord && (
        <div className="flex items-center gap-2 border-b border-[#DCE5F0] pb-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubTab('pemberian')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'pemberian'
                ? 'bg-[#12355B] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#DCE5F0]'
            }`}
          >
            <PackageOpen className="h-4 w-4" />
            <span>Pencatatan Pakan Harian</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('ideal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'ideal'
                ? 'bg-[#12355B] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#DCE5F0]'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>Kebutuhan Pakan Ideal</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('intensitas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'intensitas'
                ? 'bg-[#12355B] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#DCE5F0]'
            }`}
          >
            <Utensils className="h-4 w-4" />
            <span>Intensitas Makan Sapi</span>
          </button>
        </div>
      )}

      {isFormOpen ? (
        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-5 animate-fadeIn font-body">
          <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
            {/* 1. Identitas Sapi & Tanggal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Pilih Sapi Target *</label>
                <select
                  value={formData.id_sapi}
                  onChange={(e) => handleInputChange('id_sapi', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-semibold focus:border-[#12355B] outline-none"
                  required
                >
                  <option value="">-- Pilih Sapi Target --</option>
                  {cows.map((c, i) => (
                    <option key={c.id_sapi || c.cowID || i} value={c.id_sapi || c.cowID}>
                      Sapi {i + 1} - {c.id_sapi || c.cowID} ({c.ras_sapi || c.cowBreed || 'Limousin'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Tanggal Pencatatan *</label>
                <input
                  type="date"
                  value={formData.tanggal_pencatatan}
                  onChange={(e) => handleInputChange('tanggal_pencatatan', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-semibold focus:border-[#12355B] outline-none"
                  required
                />
              </div>
            </div>

            {/* 2. Jenis Pakan, Kebutuhan kg, Harga/kg, dan Biaya Harian Otomatis */}
            <div className="bg-slate-50 border border-[#DCE5F0] rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#12355B] uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5" />
                Kebutuhan &amp; Biaya Pakan Harian
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-slate-600 font-semibold mb-1">Jenis / Komposisi Pakan</label>
                  <input
                    type="text"
                    value={formData.komposisi_pakan}
                    onChange={(e) => handleInputChange('komposisi_pakan', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-medium focus:border-[#12355B] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Kebutuhan Pakan (kg/hari) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.pakan_awal}
                    onChange={(e) => handleInputChange('pakan_awal', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-bold focus:border-[#12355B] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Harga Pakan per kg (Rp) *</label>
                  <input
                    type="number"
                    step="100"
                    value={formData.harga_pakan_per_kg}
                    onChange={(e) => handleInputChange('harga_pakan_per_kg', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-bold focus:border-[#12355B] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Biaya Pakan / Hari</label>
                  <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-extrabold flex items-center justify-between">
                    <span>{formatRupiah(formData.biaya_pakan_harian)}</span>
                    <span className="text-[10px] text-emerald-600 font-normal">kg × Rp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Tiga Sesi Makan Harian */}
            <div className="bg-slate-50 border border-[#DCE5F0] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#12355B] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Pencatatan Tiga Sesi Makan
                </h4>
                <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-[#DCE5F0]">
                  Total Durasi: {formData.total_durasi_makan} Menit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Sesi 1 */}
                <div className="bg-white border border-[#DCE5F0] rounded-xl p-3 space-y-2">
                  <span className="text-[11px] font-bold text-[#12355B] block">Sesi 1 (Pagi)</span>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jam Mulai</label>
                    <input
                      type="time"
                      value={formData.sesi_makan_1_jam}
                      onChange={(e) => handleInputChange('sesi_makan_1_jam', e.target.value)}
                      className="w-full px-2 py-1.5 border border-[#DCE5F0] rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Durasi (Menit)</label>
                    <input
                      type="number"
                      value={formData.sesi_makan_1_durasi}
                      onChange={(e) => handleInputChange('sesi_makan_1_durasi', e.target.value)}
                      className="w-full px-2 py-1.5 border border-[#DCE5F0] rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Pakan (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sesi_makan_1_pakan}
                      onChange={(e) => handleInputChange('sesi_makan_1_pakan', e.target.value)}
                      className="w-full px-2 py-1.5 border border-[#DCE5F0] rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Sesi 2 */}
                <div className="bg-white border border-[#DCE5F0] rounded-xl p-3 space-y-2">
                  <span className="text-[11px] font-bold text-[#12355B] block">Sesi 2 (Siang)</span>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jam Mulai</label>
                    <input
                      type="time"
                      value={formData.sesi_makan_2_jam}
                      onChange={(e) => handleInputChange('sesi_makan_2_jam', e.target.value)}
                      className="w-full px-2 py-1.5 border border-[#DCE5F0] rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Durasi (Menit)</label>
                    <input
                      type="number"
                      value={formData.sesi_makan_2_durasi}
                      onChange={(e) => handleInputChange('sesi_makan_2_durasi', e.target.value)}
                      className="w-full px-2 py-1.5 border border-[#DCE5F0] rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Pakan (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sesi_makan_2_pakan}
                      onChange={(e) => handleInputChange('sesi_makan_2_pakan', e.target.value)}
                      className="w-full px-2 py-1.5 border border-[#DCE5F0] rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Sesi 3 */}
                <div className="bg-white border border-[#DCE5F0] rounded-xl p-3 space-y-2">
                  <span className="text-[11px] font-bold text-[#12355B] block">Sesi 3 (Sore)</span>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jam Mulai</label>
                    <input
                      type="time"
                      value={formData.sesi_makan_3_jam}
                      onChange={(e) => handleInputChange('sesi_makan_3_jam', e.target.value)}
                      className="w-full px-2 py-1.5 border border-[#DCE5F0] rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Durasi (Menit)</label>
                    <input
                      type="number"
                      value={formData.sesi_makan_3_durasi}
                      onChange={(e) => handleInputChange('sesi_makan_3_durasi', e.target.value)}
                      className="w-full px-2 py-1.5 border border-[#DCE5F0] rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Pakan (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sesi_makan_3_pakan}
                      onChange={(e) => handleInputChange('sesi_makan_3_pakan', e.target.value)}
                      className="w-full px-2 py-1.5 border border-[#DCE5F0] rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Air Minum & Catatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kualitas &amp; Air Minum</label>
                <input
                  type="text"
                  value={formData.kualitas_air}
                  onChange={(e) => handleInputChange('kualitas_air', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Keterangan / Catatan Pemeliharaan</label>
                <input
                  type="text"
                  value={formData.keterangan}
                  onChange={(e) => handleInputChange('keterangan', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] font-medium"
                />
              </div>
            </div>

            {/* Action Buttons */}
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
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#12355B] hover:bg-[#0D2847] shadow-xs transition cursor-pointer disabled:opacity-50 h-[42px] min-w-[110px]"
              >
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      ) : detailRecord ? (
        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 shadow-xs max-w-lg mx-auto space-y-5 animate-fadeIn font-body">
          <div className="pb-3 border-b border-[#DCE5F0]">
            <h3 className="text-base font-bold text-[#162033] font-heading">
              Detail Kebutuhan &amp; Jadwal Makan
            </h3>
            <p className="text-xs text-[#64748B]">
              Tanggal: {fmtDate(detailRecord.feedRecordDate || detailRecord.tanggal_pencatatan || detailRecord.created_at)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 border border-[#DCE5F0] rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Kebutuhan Pakan</span>
              <span className="text-base font-bold text-[#12355B]">{detailRecord.feedInitialFeed || detailRecord.pakan_awal || 10} kg/hari</span>
            </div>
            <div className="bg-slate-50 border border-[#DCE5F0] rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Harga per kg</span>
              <span className="text-base font-bold text-slate-700">{formatRupiah(detailRecord.feedPricePerKg || detailRecord.harga_pakan_per_kg || 5000)}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 col-span-2">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">Biaya Pakan Harian (kg × harga)</span>
              <span className="text-lg font-extrabold text-emerald-800">{formatRupiah(detailRecord.feedDailyCost || detailRecord.biaya_pakan_harian || 50000)} / hari</span>
            </div>
          </div>

          {/* Rincian 3 Sesi Makan */}
          <div className="space-y-2 text-xs pt-2 border-t border-[#DCE5F0]">
            <h5 className="font-bold text-[#162033] mb-1">Rincian Tiga Sesi Makan:</h5>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">Sesi 1 (Pagi)</span>
                <span className="font-bold text-[#162033] block mt-0.5">{detailRecord.sesi_makan_1_jam || '07:00'}</span>
                <span className="text-[10px] text-slate-500">{detailRecord.sesi_makan_1_durasi || 20} mnt | {detailRecord.sesi_makan_1_pakan || 3.33} kg</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">Sesi 2 (Siang)</span>
                <span className="font-bold text-[#162033] block mt-0.5">{detailRecord.sesi_makan_2_jam || '12:00'}</span>
                <span className="text-[10px] text-slate-500">{detailRecord.sesi_makan_2_durasi || 15} mnt | {detailRecord.sesi_makan_2_pakan || 3.33} kg</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">Sesi 3 (Sore)</span>
                <span className="font-bold text-[#162033] block mt-0.5">{detailRecord.sesi_makan_3_jam || '17:00'}</span>
                <span className="text-[10px] text-slate-500">{detailRecord.sesi_makan_3_durasi || 25} mnt | {detailRecord.sesi_makan_3_pakan || 3.34} kg</span>
              </div>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 mt-2">
              <span className="text-slate-500 font-medium">Komposisi Pakan:</span>
              <span className="font-bold text-[#162033]">{detailRecord.feedComposition || detailRecord.komposisi_pakan || 'Konsentrat & Rumput Gajah'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Kualitas Air Minum:</span>
              <span className="font-bold text-[#162033]">{detailRecord.feedWaterQuality || detailRecord.kualitas_air || 'Air Minum Bersih'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Keterangan:</span>
              <span className="font-medium text-slate-700">{detailRecord.keterangan || detailRecord.feedNotes || 'Pencatatan normal harian.'}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center border-t border-[#DCE5F0]">
            <button
              type="button"
              onClick={() => setDetailRecord(null)}
              className="px-6 py-2.5 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              Kembali
            </button>
          </div>
        </div>
      ) : (
        <>
          {subTab === 'ideal' && <PakanIdealPage isSubView={true} />}
          {subTab === 'intensitas' && <IntensitasMakanPage isSubView={true} />}
          {subTab === 'pemberian' && (
            <>
      {/* 2. Ringkasan KPI Kebutuhan Pakan & Biaya */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-body">
        <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rata-rata Kebutuhan Pakan</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#12355B] flex items-center justify-center border border-blue-100 shadow-2xs">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#162033] mt-2 font-heading">{avgKebutuhan} kg/hari</p>
          <p className="text-[11px] text-slate-500 mt-1">Per ekor sapi / hari</p>
        </div>

        <div className="card-accent-top card-accent-sky bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimasi Biaya Pakan Harian</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shadow-2xs">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#12355B] mt-2 font-heading">{formatRupiah(avgBiaya)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Kebutuhan kg × Harga/kg</p>
        </div>

        <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Durasi Makan 3 Sesi</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shadow-2xs">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#162033] mt-2 font-heading">{avgDurasi} menit</p>
          <p className="text-[11px] text-slate-500 mt-1">Total durasi makan harian</p>
        </div>

        <div className="card-accent-top card-accent-emerald bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jadwal Pemberian</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-2xs">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">3 Sesi Teratur</p>
          <p className="text-[11px] text-slate-500 mt-1">Pagi, Siang, dan Sore</p>
        </div>
      </div>

      {/* 3. Toolbar & Tabel */}
      <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DCE5F0] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <h3 className="text-base font-bold text-[#162033] font-heading shrink-0 flex items-center gap-2">
            <span className="text-lg">🌾</span>
            <span>Daftar Catatan Pakan</span>
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
                placeholder="Cari sapi / ras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] focus:border-[#12355B] focus:ring-2 focus:ring-slate-500/10 outline-none transition-all h-[38px] font-medium"
              />
            </div>

            <SortSelect value={sortBy} onChange={setSortBy} className="h-[38px]" />
          </div>
        </div>

        {/* Tabel Data Pakan & Sesi Makan */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body">
            <thead>
              <tr className="bg-slate-50/70 border-b border-[#DCE5F0] text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="px-4 py-3.5 text-center w-12">No.</th>
                <th className="px-4 py-3.5 text-left">Sapi</th>
                <th className="px-4 py-3.5 text-left">Ras</th>
                <th className="px-4 py-3.5 text-left">Jenis Pakan</th>
                <th className="px-4 py-3.5 text-right font-bold text-[#12355B]">Kebutuhan / Hari</th>
                <th className="px-4 py-3.5 text-right">Harga / kg</th>
                <th className="px-4 py-3.5 text-right font-bold text-[#162033]">Biaya Pakan / Hari</th>
                <th className="px-4 py-3.5 text-center">Sesi 1 (Pagi)</th>
                <th className="px-4 py-3.5 text-center">Sesi 2 (Siang)</th>
                <th className="px-4 py-3.5 text-center">Sesi 3 (Sore)</th>
                <th className="px-4 py-3.5 text-center">Total Durasi</th>
                <th className="px-4 py-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr><td colSpan="12" className="text-center py-12 text-slate-400 text-xs font-semibold">Memuat catatan pakan sapi...</td></tr>
              ) : (displayRows.length > 0) ? (
                displayRows.map((record, idx) => {
                  const cowObj = record.sapi || record.cow || {};
                  const rawC = cowObj.cowID || cowObj.id_sapi || record.feedCowID || record.id_sapi || '';
                  const matchNum = String(rawC).match(/\d+$/);
                  const cowNum = record.cowNumber || (matchNum ? parseInt(matchNum[0], 10) : idx + 1);
                  const defaultBreeds = { 1: 'Limousin', 2: 'Simmental', 3: 'Brahman' };
                  const breed = cowObj.cowBreed || cowObj.ras_sapi || record.cowBreed || defaultBreeds[cowNum] || 'Limousin';

                  const kg = parseFloat(record.feedInitialFeed || record.pakan_awal || 10.0);
                  const price = parseFloat(record.feedPricePerKg || record.harga_pakan_per_kg || 5000);
                  const dailyCost = parseFloat(record.feedDailyCost || record.biaya_pakan_harian || (kg * price));

                  const s1Jam = record.sesi_makan_1_jam || '07:00';
                  const s1Dur = record.sesi_makan_1_durasi || 20;
                  const s2Jam = record.sesi_makan_2_jam || '12:00';
                  const s2Dur = record.sesi_makan_2_durasi || 15;
                  const s3Jam = record.sesi_makan_3_jam || '17:00';
                  const s3Dur = record.sesi_makan_3_durasi || 25;
                  const totalDur = record.total_durasi_makan || (s1Dur + s2Dur + s3Dur);

                  return (
                    <tr key={record.feedID || record.id_log_pakan || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="bg-slate-100 text-[#162033] font-semibold text-xs px-2.5 py-1 rounded-md border border-[#DCE5F0]">
                          Sapi {cowNum} ({rawC || `SAPI-00${cowNum}`})
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#162033]">{breed}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                        {record.feedComposition || record.komposisi_pakan || 'Konsentrat & Hijauan'}
                      </td>
                      <td className="px-4 py-3.5 text-[#12355B] font-bold text-xs text-right whitespace-nowrap">
                        {kg.toFixed(1)} kg
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-xs text-right whitespace-nowrap">
                        {formatRupiah(price)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#162033] text-xs text-right whitespace-nowrap">
                        {formatRupiah(dailyCost)}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {s1Jam} ({s1Dur} mnt)
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {s2Jam} ({s2Dur} mnt)
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {s3Jam} ({s3Dur} mnt)
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-[#12355B]">
                        {totalDur} menit
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
                            onClick={() => setDeleteId(record.feedID || record.id_log_pakan)}
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
                  <td colSpan="12" className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Info className="h-6 w-6 text-slate-300" />
                      <span className="text-xs font-semibold">Belum ada catatan pakan sapi.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalFiltered || displayRows.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
      </>
      )}
      </>
      )}

      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title="Hapus Catatan Pakan"
        message="Apakah Anda yakin ingin menghapus catatan pakan ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
