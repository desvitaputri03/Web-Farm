import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, AlertCircle, CheckCircle2, X, Eye, EyeOff } from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  React.useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => { if (onClose) onClose(); }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center pointer-events-none font-body">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl max-w-sm ${isSuccess ? 'bg-[#12355B] text-white border-slate-700 shadow-slate-950/30' : 'bg-rose-900/90 text-white border-rose-700 shadow-rose-950/30'} backdrop-blur-md`}>
        {isSuccess ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" /> : <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />}
        <span className="text-xs font-bold flex-1 leading-snug">{message}</span>
        <button type="button" onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

const ProfilPage = ({ userName = '', role = 'peternak', email = '' }) => {
  const defaultEmail = email || (role === 'peternak' ? 'peternak@farm.com' : role === 'admin' ? 'admin@farm.com' : 'mantri@farm.com');

  const [formData, setFormData] = useState({
    email: defaultEmail,
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleReset = () => {
    setFormData({ email: defaultEmail, password: '', password_confirmation: '' });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (formData.password && formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: ['Konfirmasi password tidak cocok.'] });
      return;
    }

    setLoading(true);
    try {
      const payload = { email: formData.email };
      if (formData.password) {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }
      await axios.patch('/profile', payload);
      setToast({ message: 'Akun berhasil diperbarui!', type: 'success' });
      setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setToast({ message: 'Gagal menyimpan perubahan. Silakan coba lagi.', type: 'danger' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-body max-w-2xl mx-auto">
      <PageHeaderBanner icon={ShieldCheck} title="Pengaturan Akun" />

      <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-6 md:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm font-bold text-[#162033] font-heading border-b border-[#DCE5F0] pb-3 flex items-center gap-2">
            <span>🔐</span>
            <span>Ubah Email &amp; Password</span>
          </p>

          {errors.general && (
            <div className="bg-slate-100 text-[#12355B] border border-slate-300 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#12355B]" />
              <span>{errors.general[0]}</span>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#162033] block">Alamat Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition"
              required
            />
            {errors.email && <p className="text-[11px] text-[#12355B] mt-1 font-semibold">{errors.email[0]}</p>}
          </div>

          {/* Password Baru */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#162033] block">
              Password Baru{' '}
              <span className="text-slate-400 font-normal">(kosongkan jika tidak ingin diubah)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 pr-10 text-xs text-[#162033] font-medium outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#12355B] transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-[#12355B] mt-1 font-semibold">{errors.password[0]}</p>}
          </div>

          {/* Konfirmasi Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#162033] block">Konfirmasi Password Baru</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 pr-10 text-xs text-[#162033] font-medium outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#12355B] transition cursor-pointer"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="text-[11px] text-[#12355B] mt-1 font-semibold">{errors.password_confirmation[0]}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCE5F0]">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl border border-[#DCE5F0] text-xs font-semibold text-[#162033] hover:bg-slate-50 transition cursor-pointer"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient px-6 py-2.5 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default ProfilPage;
