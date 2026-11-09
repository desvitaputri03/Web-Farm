import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Users,
  Shield,
  UserCog,
  Lock,
  User,
  Mail,
  Beef,
  Home
} from 'lucide-react';
import Pagination from './Pagination';
import PageHeaderBanner from './PageHeaderBanner';
import { usePaginatedFetch } from '../../../hooks/usePaginatedFetch';

const ROLE_LABELS = {
  peternak: { label: 'Peternak', icon: UserCog },
  mantri: { label: 'Mantri', icon: Shield },
  admin: { label: 'Admin', icon: Lock },
};

const ConfirmModal = ({ isOpen, title = 'Konfirmasi Hapus', message = 'Apakah Anda yakin ingin menghapus data ini?', confirmText = 'Hapus', cancelText = 'Batal', onConfirm, onCancel }) => {
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
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl max-w-md ${isSuccess ? 'bg-[#12355B] text-white border-slate-700 shadow-slate-950/30' : 'bg-rose-900 text-white border-rose-700 shadow-rose-950/30'} backdrop-blur-md`}>
        {isSuccess ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" /> : <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />}
        <span className="text-xs font-semibold flex-1 leading-snug">{message}</span>
        <button type="button" onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors cursor-pointer"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

const AdminPage = ({ view = 'overview' }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nomor_telepon: '',    password: '',
    role: 'peternak',
  });

  const {
    data: users,
    total,
    stats,
    loading,
    currentPage,
    itemsPerPage,
    setCurrentPage,
    setItemsPerPage,
    refetch,
  } = usePaginatedFetch('/admin/users');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMsg('');
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', nomor_telepon: '', password: '', role: 'peternak' });
    setEditId(null);
    setIsFormOpen(false);
    setErrorMsg('');
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      nomor_telepon: user.nomor_telepon || '',
      password: '',
      role: user.role || 'peternak',
    });
    setEditId(user.id);
    setIsFormOpen(true);
  };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!formData.email.trim()) {
        setErrorMsg('Email wajib diisi.');
        return;
      }

      if (!editId && !formData.password.trim()) {
        setErrorMsg('Password wajib diisi untuk pengguna baru.');
        return;
      }

      const payload = { ...formData };
      if (!payload.name) {
        payload.name = payload.email.split('@')[0];
      }
      if (editId && !payload.password) {
        delete payload.password;
      }

      if (editId) {
        // Toast langsung muncul, lalu simpan ke server background
        resetForm();
        setToast({ message: 'Data pengguna berhasil diperbarui!', type: 'success' });
        axios.put(route('admin.users.update', editId), payload).then(() => refetch()).catch((err) => {
          const errs = err.response?.data?.errors || {};
          const msg = Object.values(errs)[0] || 'Gagal memperbarui data pengguna.';
          setErrorMsg(msg);
          setToast({ message: msg, type: 'danger' });
        });
      } else {
        // Toast langsung muncul, lalu simpan ke server background
        resetForm();
        setToast({ message: 'Pengguna baru berhasil ditambahkan!', type: 'success' });
        axios.post(route('admin.users.store'), payload).then(() => refetch()).catch((err) => {
          const errs = err.response?.data?.errors || {};
          const msg = Object.values(errs)[0] || 'Gagal menambahkan pengguna baru.';
          setErrorMsg(msg);
          setToast({ message: msg, type: 'danger' });
        });
      }
    };

      const confirmDelete = async () => {
        if (!deleteId) return;
        try {
          await axios.delete(route('admin.users.destroy', deleteId));
          setDeleteId(null);
          refetch();
          setToast({ message: 'Data pengguna berhasil dihapus.', type: 'success' });
        } catch (err) {
          setDeleteId(null);
          const errs = err.response?.data?.errors || {};
          const msg = Object.values(errs)[0] || 'Gagal menghapus pengguna.';
          setToast({ message: msg, type: 'danger' });
        }
      };

      if (view === 'overview') {
        return (
          <div className="space-y-6 font-body">
            {/* Clean Navy Header Card */}
            <PageHeaderBanner
              icon={Users}
              title="Dashboard"
            />

            {/* Total Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#DCE5F0] p-5 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-[#DCE5F0] text-[#12355B] flex items-center justify-center font-bold">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Pengguna</p>
                    <p className="text-xl font-bold text-[#162033] font-heading">{stats?.total_users ?? total ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#DCE5F0] p-5 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-[#DCE5F0] text-[#12355B] flex items-center justify-center font-bold">
                    <Beef className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Sapi</p>
                    <p className="text-xl font-bold text-[#162033] font-heading">{stats?.cow_count ?? 6} Ekor</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#DCE5F0] p-5 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-[#DCE5F0] text-[#12355B] flex items-center justify-center font-bold">
                    <UserCog className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Peternak</p>
                    <p className="text-xl font-bold text-[#162033] font-heading">{stats?.peternak_count ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#DCE5F0] p-5 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-[#DCE5F0] text-[#12355B] flex items-center justify-center font-bold">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Mantri</p>
                    <p className="text-xl font-bold text-[#162033] font-heading">{stats?.mantri_count ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RINGKASAN DATA SAPI TERSEBAR DI UNIT KANDANG */}
            <div className="bg-white rounded-3xl p-6 border border-[#DCE5F0] shadow-sm space-y-4 font-body">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#162033] font-heading">Ringkasan Data Sapi Per Kandang</h3>
                <span className="text-xs font-bold text-[#12355B] bg-slate-100 border border-[#DCE5F0] px-3 py-1 rounded-full">
                  2 Unit Kandang
                </span>
              </div>

              <div className="border border-[#DCE5F0] rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#DCE5F0] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="px-5 py-4">Kode Sapi</th>
                      <th className="px-5 py-4">Unit Kandang</th>
                      <th className="px-5 py-4">Ras</th>
                      <th className="px-5 py-4">Suhu Tubuh</th>
                      <th className="px-5 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5F0] text-xs text-[#162033] font-medium font-body">
                    <tr className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-[#12355B]">Sapi 1 (SP-2024-001)</td>
                      <td className="px-5 py-4 font-bold text-slate-700">Kandang A (Utama)</td>
                      <td className="px-5 py-4 font-medium text-[#64748B]">Brangus</td>
                      <td className="px-5 py-4 font-bold text-[#162033]">38.6 °C</td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold border border-emerald-200">Sehat</span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-[#12355B]">Sapi 2 (SP-2024-002)</td>
                      <td className="px-5 py-4 font-bold text-slate-700">Kandang A (Utama)</td>
                      <td className="px-5 py-4 font-medium text-[#64748B]">Brahman</td>
                      <td className="px-5 py-4 font-bold text-[#162033]">38.8 °C</td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold border border-emerald-200">Sehat</span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-[#12355B]">Sapi 3 (SP-2024-003)</td>
                      <td className="px-5 py-4 font-bold text-slate-700">Kandang A (Utama)</td>
                      <td className="px-5 py-4 font-medium text-[#64748B]">Angus</td>
                      <td className="px-5 py-4 font-bold text-[#162033]">38.3 °C</td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold border border-emerald-200">Sehat</span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-[#12355B]">Sapi 4 (SP-2024-004)</td>
                      <td className="px-5 py-4 font-bold text-slate-700">Kandang A (Utama)</td>
                      <td className="px-5 py-4 font-medium text-[#64748B]">Sapi Bali</td>
                      <td className="px-5 py-4 font-bold text-[#162033]">38.7 °C</td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold border border-emerald-200">Sehat</span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-[#12355B]">Sapi 5 (SP-2024-005)</td>
                      <td className="px-5 py-4 font-bold text-slate-700">Kandang B</td>
                      <td className="px-5 py-4 font-medium text-[#64748B]">Limousin</td>
                      <td className="px-5 py-4 font-bold text-[#162033]">38.5 °C</td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold border border-emerald-200">Sehat</span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-[#12355B]">Sapi 6 (SP-2024-006)</td>
                      <td className="px-5 py-4 font-bold text-slate-700">Kandang B</td>
                      <td className="px-5 py-4 font-medium text-[#64748B]">Simmental</td>
                      <td className="px-5 py-4 font-bold text-[#162033]">38.7 °C</td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold border border-emerald-200">Sehat</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-6 font-body">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

          {/* Clean Navy Header Card */}
          <PageHeaderBanner
            icon={Users}
            title={isFormOpen ? (editId ? 'Edit Pengguna' : 'Tambah Pengguna') : 'Pengguna'}
          />

          {isFormOpen ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE5F0] shadow-xs space-y-4 max-w-xl mx-auto font-body animate-fadeIn">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto font-body">
                <div>
                  <label className="block text-xs font-semibold text-[#162033] mb-1">Nama Pengguna <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    maxLength={100}
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#162033] mb-1">Email <span className="text-rose-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    maxLength={100}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#162033] mb-1">Role <span className="text-rose-500">*</span></label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B] cursor-pointer"
                  >
                    <option value="peternak">Peternak</option>
                    <option value="mantri">Mantri</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#162033] mb-1">
                    Password {!editId && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B]"
                  />
                </div>

                <div className="flex justify-center gap-3 pt-5 border-t border-[#DCE5F0]">
                  <button type="button" onClick={resetForm} className="px-6 py-2.5 bg-white hover:bg-slate-100 text-[#162033] text-xs font-semibold rounded-xl border border-[#DCE5F0] transition cursor-pointer h-[42px] min-w-[110px]">
                    Batal
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer h-[42px] min-w-[110px]">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card-accent-top bg-white rounded-2xl p-6 border border-[#DCE5F0] shadow-sm space-y-6">
              {/* Card Title */}
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#DCE5F0]/60">
                <h3 className="text-base font-bold text-[#162033] font-heading flex items-center gap-2">
                  <span className="text-lg">🛡️</span>
                  <span>Kelola Akun Pengguna</span>
                </h3>
                <button
                  type="button"
                  onClick={() => { resetForm(); setIsFormOpen(true); }}
                  className="btn-gradient text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer h-[38px] shrink-0"
                >
                  <Plus className="h-4 w-4 stroke-2" />
                  <span>Tambah Pengguna</span>
                </button>
              </div>

              {/* Tabel Data Pengguna */}
              <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                      <th className="px-6 py-4">Pengguna</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="text-center py-10 text-slate-400">Memuat data pengguna...</td>
                      </tr>
                    ) : Array.isArray(users) && users.length > 0 ? (
                      users.map((u) => {
                        const roleConfig = ROLE_LABELS[u.role] || { label: u.role, icon: User };
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-bold text-[#162033] text-xs font-heading">{u.name || '—'}</p>
                                <p className="text-[11px] text-[#64748B] font-body">{u.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border bg-slate-100 text-[#162033] border-[#DCE5F0]">
                                {roleConfig.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(u)}
                                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-[#162033] transition-all cursor-pointer border border-[#DCE5F0]"
                                  title="Edit Data"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteId(u.id)}
                                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-[#162033] transition-all cursor-pointer border border-[#DCE5F0]"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-10 text-slate-400">Belum ada pengguna terdaftar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalItems={total}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}

          <ConfirmModal
            isOpen={deleteId !== null}
            title="Konfirmasi Hapus Pengguna"
            message="Apakah Anda yakin ingin menghapus pengguna ini?"
            confirmText="Hapus Pengguna"
            cancelText="Batal"
            onConfirm={confirmDelete}
            onCancel={() => setDeleteId(null)}
          />
        </div>
      );
    };

    export default AdminPage;
