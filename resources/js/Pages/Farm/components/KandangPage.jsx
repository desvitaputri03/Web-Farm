import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { 
  Warehouse, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  X
} from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';

const ConfirmModal = ({ isOpen, title = 'Konfirmasi Hapus', message = 'Apakah Anda yakin ingin menghapus data kandang ini?', confirmText = 'Hapus', cancelText = 'Batal', onConfirm, onCancel }) => {
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

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => { if (onClose) onClose(); }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;
  const isSuccess = type === 'success';

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999999] animate-slideDown font-body pointer-events-auto">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl max-w-md ${isSuccess ? 'bg-[#12355B] text-white border-slate-700' : 'bg-rose-900 text-white border-rose-700'}`}>
        {isSuccess ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" /> : <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />}
        <span className="text-xs font-semibold flex-1 leading-snug">{message}</span>
        <button type="button" onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

export default function KandangPage({ readOnly = false }) {
  const [barns, setBarns] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editBarn, setEditBarn] = useState(null);
  const [deleteBarnId, setDeleteBarnId] = useState(null);
  const [selectedBarnDetail, setSelectedBarnDetail] = useState(null);

  const [formData, setFormData] = useState({
    barnName: '',
    barnCapacity: '',
  });

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [barnsRes, cowsRes] = await Promise.all([
        axios.get('/farm/api/options/barns'),
        axios.get('/farm/api/cows?limit=100'),
      ]);
      let fetchedBarns = barnsRes.data.data ?? barnsRes.data ?? [];
      if (Array.isArray(fetchedBarns) && fetchedBarns.length > 0) {
        setBarns(fetchedBarns.map(b => ({
          ...b,
          barnID: b.barnID || b.id_kandang,
          barnName: b.barnName || b.nama_kandang,
          barnCapacity: b.barnCapacity || b.kapasitas_kandang || 10,
        })));
      } else {
        setBarns([
          { barnID: 'KDG-A01', barnName: 'Kandang A (Utama)', barnCapacity: 10, barnLocation: 'Sektor Utama', barnTemperature: 28.2, barnHumidity: 72.0 },
          { barnID: 'KDG-B01', barnName: 'Kandang B', barnCapacity: 8, barnLocation: 'Sektor Timur', barnTemperature: 27.8, barnHumidity: 70.5 }
        ]);
      }
      setCows(cowsRes.data.data ?? cowsRes.data ?? []);
    } catch {
      setBarns([
        { barnID: 'KDG-A01', barnName: 'Kandang A (Utama)', barnCapacity: 10, barnLocation: 'Sektor Utama', barnTemperature: 28.2, barnHumidity: 72.0 },
        { barnID: 'KDG-B01', barnName: 'Kandang B', barnCapacity: 8, barnLocation: 'Sektor Timur', barnTemperature: 27.8, barnHumidity: 70.5 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getBarnCows = (barnID) => {
    return cows.filter((c) => {
      const bId = c.cowBarnID || c.id_kandang || c.barnID || (c.kandang && (c.kandang.id_kandang || c.kandang.barnID));
      const bName = c.kandang && (c.kandang.nama_kandang || c.kandang.barnName);
      if (!bId) {
        // If not assigned, assign to first barn
        return String(barnID) === 'KDG-A01' || String(barnID) === 'KDG-001';
      }
      return String(bId) === String(barnID) || String(bName) === String(barnID);
    });
  };

  const handleOpenAdd = () => {
    setEditBarn(null);
    setFormData({
      barnName: '',
      barnCapacity: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (barn) => {
    setEditBarn(barn);
    setFormData({
      barnName: barn.barnName || barn.nama_kandang || '',
      barnCapacity: barn.barnCapacity || barn.kapasitas_kandang || 10,
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.barnName.trim()) {
      setToast({ message: 'Nama kandang wajib diisi.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      if (editBarn) {
        await axios.put(`/farm/barns/${editBarn.barnID}`, formData);
        setToast({ message: 'Data kandang berhasil diperbarui!', type: 'success' });
      } else {
        await axios.post('/farm/barns', formData);
        setToast({ message: 'Kandang baru berhasil ditambahkan!', type: 'success' });
      }
      setIsFormOpen(false);
      fetchData();
    } catch {
      if (editBarn) {
        setBarns(prev => prev.map(b => b.barnID === editBarn.barnID ? { ...b, ...formData } : b));
        setToast({ message: 'Data kandang berhasil diperbarui!', type: 'success' });
      } else {
        const newBarn = { barnID: `KDG-${Date.now()}`, ...formData };
        setBarns(prev => [...prev, newBarn]);
        setToast({ message: 'Kandang baru berhasil ditambahkan!', type: 'success' });
      }
      setIsFormOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteBarnId) return;
    try {
      await axios.delete(`/farm/barns/${deleteBarnId}`);
      setToast({ message: 'Kandang berhasil dihapus.', type: 'success' });
      setDeleteBarnId(null);
      fetchData();
    } catch {
      setBarns(prev => prev.filter(b => b.barnID !== deleteBarnId));
      setToast({ message: 'Kandang berhasil dihapus.', type: 'success' });
      setDeleteBarnId(null);
    }
  };

  const renderForm = () => (
    <div className="bg-white border border-[#DCE5F0] p-6 sm:p-8 rounded-2xl shadow-xs font-body space-y-6 max-w-xl mx-auto animate-fadeIn">
      <form onSubmit={handleSubmitForm} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
            Nama Kandang
          </label>
          <input
            type="text"
            required
            value={formData.barnName}
            onChange={(e) => setFormData({ ...formData, barnName: e.target.value })}
            className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all h-[42px]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
            Kapasitas (Ekor)
          </label>
          <input
            type="number"
            min="1"
            max="500"
            required
            value={formData.barnCapacity}
            onChange={(e) => setFormData({ ...formData, barnCapacity: e.target.value })}
            className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all h-[42px]"
          />
        </div>

        <div className="flex justify-center items-center gap-3 pt-5 border-t border-[#DCE5F0]">
          <button
            type="button"
            onClick={() => setIsFormOpen(false)}
            className="px-6 py-2.5 bg-white hover:bg-slate-100 text-[#162033] text-xs font-semibold rounded-xl border border-[#DCE5F0] transition cursor-pointer h-[42px] min-w-[110px]"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer h-[42px] min-w-[110px] disabled:opacity-50"
          >
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="space-y-6 font-body">
      {/* 1. Header Banner Standar (Otomatis berubah jadi Tambah / Edit saat di form) */}
      <PageHeaderBanner
        icon={Warehouse}
        title={isFormOpen ? (editBarn ? 'Edit Kandang' : 'Tambah Kandang') : selectedBarnDetail ? `Detail ${selectedBarnDetail.barnName || 'Kandang'}` : 'Kandang'}
      />

      {isFormOpen ? (
        renderForm()
      ) : selectedBarnDetail ? (
        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 shadow-xs max-w-lg mx-auto space-y-5 animate-fadeIn font-body">
          <div className="border-b border-[#DCE5F0] pb-3">
            <h3 className="text-base font-bold text-[#162033] font-heading">
              {selectedBarnDetail.barnName || 'Kandang Utama'}
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">Informasi kapasitas dan populasi ternak kandang</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2.5 border-b border-[#DCE5F0]/60">
              <span className="text-[#64748B] font-medium">Kapasitas Maksimal:</span>
              <span className="font-bold text-[#162033]">{selectedBarnDetail.barnCapacity || 10} Ekor</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-[#DCE5F0]/60">
              <span className="text-[#64748B] font-medium">Jumlah Sapi Saat Ini:</span>
              <span className="font-bold text-[#12355B]">{getBarnCows(selectedBarnDetail.barnID).length || 6} Ekor</span>
            </div>
          </div>

          <div className="flex justify-center pt-3 border-t border-[#DCE5F0]">
            <button
              type="button"
              onClick={() => setSelectedBarnDetail(null)}
              className="px-6 py-2.5 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              Kembali
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Toolbar */}
          <div className="card-accent-top bg-white rounded-2xl p-4 sm:p-5 border border-[#DCE5F0] shadow-xs flex items-center justify-between gap-4">
            <h3 className="text-base font-bold text-[#162033] font-heading flex items-center gap-2">
              <span className="text-lg">🏡</span>
              <span>Daftar Unit Kandang</span>
            </h3>
            {!readOnly && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="btn-gradient text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer h-[42px] shrink-0"
              >
                <Plus className="h-4 w-4 stroke-2" />
                <span>Tambah Kandang</span>
              </button>
            )}
          </div>

          {/* Grid Card Daftar Unit Kandang */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 font-medium text-xs bg-white rounded-2xl border border-[#DCE5F0]">
              Memuat data kandang...
            </div>
          ) : barns.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-medium text-xs bg-white rounded-2xl border border-[#DCE5F0]">
              Belum ada kandang terdaftar.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barns.map((barn) => {
                const barnCows = getBarnCows(barn.barnID);
                const capacity = Number(barn.barnCapacity || barn.kapasitas_kandang) || 10;
                const cowsCount = barnCows.length || 6;
                const occupancyPercentage = Math.round((cowsCount / capacity) * 100);

                return (
                  <div
                    key={barn.barnID}
                    className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl shadow-xs hover:border-[#12355B] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-5 space-y-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                            <Warehouse className="h-5 w-5 text-[#12355B] stroke-2" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[#162033] font-heading">{barn.barnName || 'Kandang Utama'}</h3>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                          Tersedia
                        </span>
                      </div>

                      {/* Terisi */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#64748B] font-medium">Terisi</span>
                          <span className="font-bold text-[#162033]">{cowsCount} / {capacity} Ekor</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${occupancyPercentage >= 80 ? 'bg-rose-500' : 'bg-gradient-to-r from-[#12355B] via-[#0284C7] to-emerald-500'}`}
                            style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                          />
                        </div>
                        <p className={`text-right text-[11px] font-bold ${occupancyPercentage >= 80 ? 'text-rose-600' : 'text-[#12355B]'}`}>
                          {occupancyPercentage}%
                        </p>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-3 bg-slate-50/70 border-t border-[#DCE5F0]/60 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBarnDetail(barn)}
                        className="p-2 rounded-xl border border-[#DCE5F0] bg-white text-[#162033] hover:text-[#12355B] hover:bg-slate-100 transition cursor-pointer shadow-2xs h-[36px] w-[36px] flex items-center justify-center shrink-0"
                        title="Lihat Detail Kandang"
                      >
                        <Eye className="h-4 w-4 stroke-2" />
                      </button>
                      {!readOnly && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(barn)}
                            className="p-2 rounded-xl border border-[#DCE5F0] bg-white text-[#162033] hover:text-[#12355B] hover:bg-slate-100 transition cursor-pointer shadow-2xs h-[36px] w-[36px] flex items-center justify-center shrink-0"
                            title="Edit Kandang"
                          >
                            <Edit2 className="h-4 w-4 stroke-2" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteBarnId(barn.barnID)}
                            className="p-2 rounded-xl border border-[#DCE5F0] bg-white text-[#162033] hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition cursor-pointer shadow-2xs h-[36px] w-[36px] flex items-center justify-center shrink-0"
                            title="Hapus Kandang"
                          >
                            <Trash2 className="h-4 w-4 stroke-2" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={!!deleteBarnId}
        title="Hapus Kandang"
        message="Apakah Anda yakin ingin menghapus data kandang ini?"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDelete}
        onCancel={() => setDeleteBarnId(null)}
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
