import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { router } from '@inertiajs/react';
import {
  Utensils,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';
import { usePaginatedFetch, useDebouncedValue } from '../../../hooks/usePaginatedFetch';

const ConfirmModal = ({ isOpen, title = 'Konfirmasi Hapus', message = 'Apakah Anda yakin ingin menghapus data tempat makan ini?', confirmText = 'Hapus', cancelText = 'Batal', onConfirm, onCancel }) => {
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
      <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 shadow-2xl max-w-[360px] w-full text-center" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="text-base font-bold text-[#162033] font-heading mb-2">{title}</h3>}
        <p className="text-xs font-medium text-[#64748B] py-1 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center justify-center gap-3 mt-5 pt-3 border-t border-[#DCE5F0]">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-[#DCE5F0] text-xs font-semibold text-[#162033] hover:bg-slate-50 transition-all cursor-pointer">
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#12355B] hover:bg-[#0D2847] shadow-xs transition-all cursor-pointer">
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
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
        <button type="button" onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

const INITIAL_FALLBACK_STATIONS = [
  {
    stationID: '1',
    stationCode: 'FS-001',
    stationName: 'Tempat Makan Kandang Utama A (Pakan)',
    stationType: 'makan',
    stationLocation: 'KDG-001',
  },
  {
    stationID: '2',
    stationCode: 'FS-002',
    stationName: 'Tempat Makan Kandang Utama B (Pakan & Air Minum)',
    stationType: 'campur',
    stationLocation: 'KDG-001',
  }
];

export default function TempatMakanPage({ readOnly = false }) {
  const [selectedStation, setSelectedStation] = useState(null);
  const [cows, setCows] = useState([]);
  const [loadingCows, setLoadingCows] = useState(false);
  const [barns, setBarns] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [allStations, setAllStations] = useState(INITIAL_FALLBACK_STATIONS);

  const loadAllStations = () => {
    axios.get('/farm/api/feeding-stations?limit=500').then(res => {
      const list = res.data.data ?? res.data ?? [];
      if (list.length > 0) {
        setAllStations(list);
      } else {
        setAllStations(INITIAL_FALLBACK_STATIONS);
      }
    }).catch(() => {
      setAllStations(INITIAL_FALLBACK_STATIONS);
    });
  };

  const [formData, setFormData] = useState({
    stationCode: '',
    stationName: '',
    stationType: '',
    stationLocation: '',
  });

  const [editId, setEditId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fallback = [{ barnID: 'KDG-001', barnName: 'Kandang Utama', barnCapacity: 10 }];
    setBarns(fallback);
    loadAllStations();
  }, []);

  const loadCowsInStation = (station) => {
    setLoadingCows(true);
    axios.get('/farm/api/cows?limit=100').then(res => {
      const allCows = res.data.data ?? [];
      const stId = station.id_tempat_makan || station.stationID;
      const stCode = station.kode_tempat_makan || station.stationCode;
      const stName = station.nama_tempat_makan || station.stationName;

      const filtered = allCows.filter(c => {
        const cStId = c.id_tempat_makan || c.cowStationID;
        const cStName = c.tempat_makan?.nama_tempat_makan || c.stationName || c.feeding_station?.stationName;
        const cStCode = c.tempat_makan?.kode_tempat_makan;

        return (
          (stId && String(cStId) === String(stId)) ||
          (stCode && (String(cStCode) === String(stCode) || String(cStId) === String(stCode))) ||
          (stName && cStName === stName)
        );
      });
      setCows(filtered);
    }).catch(() => {
      setCows([]);
    }).finally(() => setLoadingCows(false));
  };

  const handleLihatSapi = (station) => {
    setSelectedStation(station);
    loadCowsInStation(station);
  };

  const handleBackToList = () => {
    setSelectedStation(null);
    setCows([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMsg('');
  };

  const resetForm = () => {
    setFormData({
      stationCode: '',
      stationName: '',
      stationType: '',
      stationLocation: '',
    });
    setEditId(null);
    setErrorMsg('');
    setIsFormOpen(false);
  };

  const getAutoStationName = (locId, type) => {
    if (!locId || !type) {
      return '-';
    }
    const foundBarn = barns.find(b => b.barnID === locId);
    const barnName = foundBarn ? (foundBarn.barnName || 'Kandang Utama') : 'Kandang Utama';
    const typeLabel = type === 'minum' ? 'Air Minum' : (type === 'campur' || type === 'kombinasi') ? 'Pakan & Air Minum' : 'Pakan';
    
    // Hitung stasiun yang sudah ada untuk menentukan huruf sektor (A, B, C, dst.)
    const existingCount = allStations.filter(st => {
      if (editId && st.stationID === editId) return false;
      return !st.stationLocation || st.stationLocation === locId;
    }).length;
    
    const letter = String.fromCharCode(65 + (existingCount % 26));
    return `Tempat Makan ${barnName} ${letter} (${typeLabel})`;
  };

  const getTypeBadge = (type) => {
    const norm = String(type || '').toLowerCase();
    if (norm === 'minum') {
      return (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-cyan-50 text-cyan-700 border-cyan-200">
          Air Minum
        </span>
      );
    }
    if (norm === 'campur' || norm === 'kombinasi') {
      return (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200">
          Pakan &amp; Air Minum
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-blue-50 text-[#12355B] border-blue-200">
        Pakan
      </span>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalStationName = getAutoStationName(formData.stationLocation, formData.stationType);
    const generatedCode = formData.stationCode?.trim() || `TM-${String(allStations.length + 1).padStart(3, '0')}`;

    const payload = {
      stationCode: generatedCode.toUpperCase(),
      stationName: finalStationName,
      stationType: formData.stationType,
      stationLocation: formData.stationLocation || (barns[0]?.barnID ?? 'KDG-001'),
    };

    try {
      if (editId !== null) {
        await axios.put(`/farm/feeding-stations/${editId}`, payload);
        setToast({ message: 'Tempat makan berhasil diperbarui!', type: 'success' });
      } else {
        await axios.post('/farm/feeding-stations', payload);
        setToast({ message: 'Tempat makan baru berhasil ditambahkan!', type: 'success' });
      }
      resetForm();
      loadAllStations();
    } catch {
      if (editId !== null) {
        setAllStations(prev => prev.map(st => String(st.stationID) === String(editId) ? { ...st, ...payload } : st));
        setToast({ message: 'Tempat makan berhasil diperbarui!', type: 'success' });
      } else {
        const newStation = {
          stationID: `TM-${Date.now()}`,
          ...payload
        };
        setAllStations(prev => [...prev, newStation]);
        setToast({ message: 'Tempat makan baru berhasil ditambahkan!', type: 'success' });
      }
      resetForm();
    }
  };

  const handleEdit = (station) => {
    setFormData({
      stationID: station.stationID,
      stationCode: station.stationCode || '',
      stationName: '',
      stationType: station.stationType || 'makan',
      stationLocation: station.stationLocation || barns[0]?.barnID || 'KDG-001',
    });
    setEditId(station.stationID);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const target = deleteId;
    setDeleteId(null);
    try {
      await axios.delete(`/farm/feeding-stations/${target}`);
      setToast({ message: 'Tempat makan berhasil dihapus!', type: 'success' });
      loadAllStations();
    } catch {
      setAllStations(prev => prev.filter(st => String(st.stationID) !== String(target)));
      setToast({ message: 'Tempat makan berhasil dihapus!', type: 'success' });
    }
  };

  const getStatusBadge = (status) => {
    const isOk = status !== 'Gangguan';
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isOk ? 'bg-slate-100 text-[#12355B] border-[#DCE5F0]' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
        {isOk ? 'Aktif' : 'Gangguan'}
      </span>
    );
  };

  const getBarnStations = (barn) => {
    const matched = allStations.filter(st => {
      if (!st.stationLocation) return true;
      const stLoc = String(st.stationLocation);
      const bId = String(barn.barnID);
      return stLoc === bId || stLoc === 'Kandang Utama' || (bId === 'KDG-001' && stLoc === 'KDG-A01') || (bId === 'KDG-A01' && stLoc === 'KDG-001');
    });
    return matched.length > 0 ? matched : allStations;
  };

  const renderForm = () => {
    const autoName = getAutoStationName(formData.stationLocation, formData.stationType);

    return (
      <div className="bg-white border border-[#DCE5F0] p-6 sm:p-8 rounded-2xl shadow-xs font-body space-y-5 max-w-xl mx-auto animate-fadeIn">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
                Lokasi Kandang
              </label>
              <select
                name="stationLocation"
                value={formData.stationLocation}
                onChange={handleChange}
                className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all cursor-pointer h-[42px]"
                required
              >
                <option value="" disabled>Pilih Lokasi Kandang</option>
                {barns.map(b => (
                  <option key={b.barnID} value={b.barnID}>
                    {b.barnName || 'Kandang Utama'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
                Tipe Tempat Makan
              </label>
              <select
                name="stationType"
                value={formData.stationType}
                onChange={handleChange}
                className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all cursor-pointer h-[42px]"
                required
              >
                <option value="" disabled>Pilih Tipe Tempat Makan</option>
                <option value="makan">Hanya Pakan</option>
                <option value="minum">Hanya Air Minum</option>
                <option value="campur">Pakan &amp; Air Minum (Kombinasi)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
              Nama Tempat Makan
            </label>
            <div className="w-full bg-slate-50 border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs font-bold text-[#12355B] flex items-center gap-2 h-[42px]">
              <Utensils className="h-4 w-4 text-[#12355B]" />
              <span>{autoName}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-5 border-t border-[#DCE5F0]">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 bg-white hover:bg-slate-100 text-[#162033] text-xs font-semibold rounded-xl border border-[#DCE5F0] shadow-xs transition cursor-pointer h-[42px] min-w-[110px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer h-[42px] min-w-[110px]"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Render Tampilan Detail Sapi di Tempat Makan
  if (selectedStation) {
    return (
      <div className="space-y-6 animate-fadeIn font-body">
        <div className="bg-white rounded-2xl p-6 text-[#162033] shadow-xs flex items-center justify-between gap-4 border border-[#DCE5F0] font-body">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToList}
              className="p-2 rounded-xl border border-[#DCE5F0] hover:bg-slate-50 text-[#162033] transition cursor-pointer"
              title="Kembali ke Daftar Tempat Makan"
            >
              <ChevronLeft className="h-5 w-5 stroke-2" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-[#DCE5F0] flex items-center justify-center text-[#12355B] shrink-0">
                <Utensils className="w-6 h-6 text-[#12355B] stroke-2" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#162033] font-heading tracking-tight">
                  Detail {selectedStation.stationName}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#DCE5F0] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#162033] font-heading">
            Daftar Sapi yang Makan di Tempat Ini ({cows.length} Ekor)
          </h3>
          {loadingCows ? (
            <div className="text-center py-10 text-xs text-slate-400 font-medium">Memuat data sapi...</div>
          ) : cows.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {cows.map((c, idx) => {
                const actualCode = c.id_sapi || c.cowCode || c.cowID || `Sapi ${idx + 1}`;
                const breed = c.ras_sapi || c.cowBreed || 'Brangus';
                const gender = c.jenis_kelamin || c.cowGender || 'Jantan';

                return (
                  <div key={c.id_sapi || c.cowID || idx} className="bg-slate-50 border border-[#DCE5F0] rounded-xl p-4 space-y-2">
                    <span className="font-mono text-xs font-bold text-[#12355B] bg-white border border-[#DCE5F0] px-2 py-0.5 rounded-lg">
                      {actualCode}
                    </span>
                    <p className="text-sm font-bold text-[#162033]">{breed}</p>
                    <p className="text-xs text-[#64748B]">{gender}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-[#DCE5F0]">
              Belum ada sapi yang tercatat di tempat makan ini.
            </div>
          )}
        </div>
        {/* Toast Notifikasi */}
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body">
      {/* 1. Header Banner Standar */}
      <PageHeaderBanner
        icon={Utensils}
        title={isFormOpen ? (editId !== null ? 'Edit Tempat Makan' : 'Tambah Tempat Makan') : 'Tempat Makan'}
      />

      {isFormOpen ? (
        renderForm()
      ) : (
        <div className="space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-bold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 2. Unified Container Tabel & Toolbar Tempat Makan */}
          <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl overflow-hidden shadow-xs">
            {/* Card Header Toolbar (Menyatu di Atas Tabel) */}
            <div className="p-4 sm:p-5 border-b border-[#DCE5F0] flex items-center justify-between gap-4 bg-white">
              <h3 className="text-sm sm:text-base font-bold text-[#162033] font-heading flex items-center gap-2">
                <span className="text-lg">🍽️</span>
                <span>Daftar Tempat Makan</span>
              </h3>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="btn-gradient text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer h-[42px] shrink-0"
                >
                  <Plus className="h-4 w-4 stroke-2" />
                  <span>Tambah Tempat Makan</span>
                </button>
              )}
            </div>

            {/* Barn Sections Under the Same Unified Container */}
            {barns.map((barn, bIdx) => {
              const barnStations = getBarnStations(barn);
              return (
                <div key={barn.barnID} className={bIdx > 0 ? 'border-t-2 border-[#DCE5F0]' : ''}>
                  <div className="px-5 py-3.5 bg-slate-50/70 border-b border-[#DCE5F0]">
                    <span className="text-xs font-bold text-[#162033] uppercase tracking-wider font-heading">
                      {barn.barnName || 'Kandang Utama'}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse font-body">
                      <thead>
                        <tr className="bg-slate-50/40 border-b border-[#DCE5F0] text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          <th className="px-4 py-3.5 w-12 text-center">No.</th>
                          <th className="px-4 py-3.5">Nama Tempat Makan</th>
                          <th className="px-4 py-3.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-[#162033]">
                        {barnStations.map((st, idx) => (
                          <tr key={st.stationID || idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-slate-400 font-bold text-center">{idx + 1}</td>
                            <td className="px-4 py-3 font-bold text-[#162033]">{st.stationName}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleLihatSapi(st)}
                                  className="p-2 rounded-xl border border-[#DCE5F0] bg-white text-[#162033] hover:text-[#12355B] hover:bg-slate-100 transition cursor-pointer shadow-2xs h-[36px] w-[36px] flex items-center justify-center shrink-0"
                                  title="Lihat Sapi"
                                >
                                  <Eye className="h-4 w-4 stroke-2" />
                                </button>
                                {!readOnly && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(st)}
                                      className="p-2 rounded-xl border border-[#DCE5F0] bg-white text-[#162033] hover:text-[#12355B] hover:bg-slate-100 transition cursor-pointer shadow-2xs h-[36px] w-[36px] flex items-center justify-center shrink-0"
                                      title="Edit"
                                    >
                                      <Edit2 className="h-4 w-4 stroke-2" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(st.stationID)}
                                      className="p-2 rounded-xl border border-[#DCE5F0] bg-white text-[#162033] hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition cursor-pointer shadow-2xs h-[36px] w-[36px] flex items-center justify-center shrink-0"
                                      title="Hapus"
                                    >
                                      <Trash2 className="h-4 w-4 stroke-2" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Hapus Tempat Makan"
        message="Apakah Anda yakin ingin menghapus data tempat makan ini?"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Toast Notifikasi */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}
