import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import KandangPage from './components/KandangPage';
import TempatMakanPage from './components/TempatMakanPage';
import SapiPage from './components/SapiPage';
import PakanIdealPage from './components/PakanIdealPage';
import IntensitasMakanPage from './components/IntensitasMakanPage';
import RekapPerilakuPage from './components/RekapPerilakuPage';
import KeuanganProfitPage from './components/KeuanganProfitPage';
import LingkunganKandangPage from './components/LingkunganKandangPage';
import ProfilPage from './components/ProfilPage';
import DashboardMantriPage from './components/DashboardMantriPage';
import PemeriksaanKesehatanPage from './components/PemeriksaanKesehatanPage';
import FisiologisPage from './components/FisiologisPage';
import PerilakuPage from './components/PerilakuPage';
import PemberianPakanPage from './components/PemberianPakanPage';
import AdminPage from './components/AdminPage';
import ErrorBoundary from './components/ErrorBoundary';
import { ChevronRight } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title,
  message = 'Apakah Anda yakin ingin keluar?',
  confirmText = 'Ya',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
}) => {
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
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans" onClick={onCancel}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-[340px] w-full text-center max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">{title}</h3>}
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 py-1 leading-relaxed">
          {message || 'Apakah Anda yakin ingin keluar?'}
        </p>
        <div className="flex items-center justify-center gap-3 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer">
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

export default function Index({ authUser }) {
  const role = authUser?.role || 'peternak';
  const userName = authUser?.name || '';
  const email = authUser?.email || '';
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const validModules = role === 'mantri'
    ? ['dashboard-mantri', 'sapi', 'pemeriksaan', 'profil']
    : role === 'admin'
      ? ['admin-overview', 'admin-users', 'admin-settings', 'dashboard', 'kandang', 'environment', 'tempat-makan', 'sapi', 'profil']
      : ['dashboard', 'kandang', 'environment', 'tempat-makan', 'sapi', 'profil'];

  const defaultModule = role === 'mantri' ? 'dashboard-mantri' : role === 'admin' ? 'admin-overview' : 'dashboard';

  const getInitialModule = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || params.get('module');
      if (['fisiologis', 'perilaku', 'pakan', 'riwayat-pemeriksaan', 'informasi-sapi', 'sapi-mantri'].includes(tab)) {
        return 'sapi';
      }
      if (['rep-financial', 'laporan', 'rep-feed', 'rep-intensity', 'rep-behavior'].includes(tab)) {
        return defaultModule;
      }
      if (tab && validModules.includes(tab)) {
        return tab;
      }
    }
    return defaultModule;
  };

  const [activeModule, setActiveModule] = useState(getInitialModule);
  const [examCowID, setExamCowID] = useState(null);

  const getBreadcrumb = () => {
    const rolePrefix = role === 'admin' ? 'Admin' : role === 'mantri' ? 'Mantri' : 'Peternak';
    const breadcrumbs = {
      'dashboard': [rolePrefix, 'Dashboard'],
      'admin-overview': [rolePrefix, 'Dashboard'],
      'admin-users': [rolePrefix, 'Kelola Pengguna'],
      'sapi': [rolePrefix, 'Data Sapi'],
      'kandang': [rolePrefix, 'Kandang & Fasilitas', 'Unit Kandang'],
      'tempat-makan': [rolePrefix, 'Kandang & Fasilitas', 'Tempat Makan'],
      'environment': [rolePrefix, 'Kandang & Fasilitas', 'Lingkungan Kandang'],
      'profil': [rolePrefix, 'Pengaturan Akun'],
      'admin-settings': [rolePrefix, 'Pengaturan Akun'],
      'dashboard-mantri': [rolePrefix, 'Dashboard Mantri'],
      'pemeriksaan': [rolePrefix, 'Layanan Medis', 'Pemeriksaan Kesehatan'],
    };
    return breadcrumbs[activeModule] || [rolePrefix, 'SIMANTRA'];
  };

  const getModuleTitle = () => {
    const titles = {
      'dashboard': 'Dashboard',
      'admin-overview': 'Dashboard',
      'admin-users': 'Pengguna',
      'kandang': 'Unit Kandang',
      'environment': 'Lingkungan Kandang',
      'tempat-makan': 'Tempat Makan',
      'sapi': 'Data Sapi',
      'profil': 'Pengaturan Akun',
      'admin-settings': 'Pengaturan Akun',
      'dashboard-mantri': 'Dashboard Mantri',
      'pemeriksaan': 'Pemeriksaan Kesehatan',
    };
    return titles[activeModule] || 'Sistem Peternakan Digital';
  };

  const getModuleSubtitle = () => {
    const subtitles = {
      'dashboard': 'Ringkasan kondisi peternakan dan ternak hari ini.',
      'admin-overview': 'Monitoring statistik pengguna dan aktivitas peternakan.',
      'admin-users': 'Kelola akun Peternak, Mantri Kesehatan, dan Admin sistem SIMANTRA.',
      'kandang': 'Informasi unit kandang, kapasitas, dan lokasi ternak.',
      'environment': 'Pencatatan kondisi lingkungan kandang (suhu, kelembaban, sirkulasi, sanitasi).',
      'tempat-makan': 'Kelola unit dan stasiun tempat makan ternak.',
      'sapi': 'Kelola data individu ternak sapi: identitas, pakan, perilaku, fisiologis, dan medis.',
      'profil': 'Pengaturan akun dan profil pengguna SIMANTRA.',
      'admin-settings': 'Ubah email, username, dan password akun Admin.',
      'dashboard-mantri': 'Ringkasan kondisi medis ternak dan diagnosa harian.',
      'pemeriksaan': 'Formulir pemeriksaan fisik dan diagnosa medis ternak.'
    };
    return subtitles[activeModule] || 'Sistem Pengelolaan Peternakan Digital SIMANTRA';
  };

  const navigateToModule = (newModule) => {
    if (!validModules.includes(newModule)) return;
    setActiveModule(newModule);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('tab') !== newModule) {
        url.searchParams.set('tab', newModule);
        window.history.pushState({ tab: newModule }, '', url.pathname + url.search);
      }
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleStartExam = (cowID) => {
    setExamCowID(cowID);
    setActiveModule('pemeriksaan');
  };

  const executeLogout = async () => {
    try {
      await axios.post(route('logout'));
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      localStorage.removeItem('token');
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveModule} />;
      case 'admin-overview':
        return <AdminPage view="overview" />;
      case 'admin-users':
        return <AdminPage view="users" />;
      case 'kandang':
        return <KandangPage readOnly={role === 'admin'} />;
      case 'environment':
        return <LingkunganKandangPage />;
      case 'tempat-makan':
        return <TempatMakanPage readOnly={role === 'admin'} />;
      case 'sapi':
      case 'informasi-sapi':
      case 'sapi-mantri':
        return <SapiPage role={role} onPeriksa={handleStartExam} />;
      case 'fisiologis':
      case 'fisiologis-sensor':
        return <FisiologisPage readOnly={role === 'admin' || role === 'mantri'} />;
      case 'perilaku':
      case 'monitoring':
        return <PerilakuPage readOnly={role === 'admin' || role === 'mantri'} />;
      case 'pakan':
        return <PemberianPakanPage readOnly={role === 'admin'} />;
      case 'riwayat-pemeriksaan':
        return <PemeriksaanKesehatanPage role={role} />;
      case 'rep-financial':
      case 'laporan':
        return <KeuanganProfitPage />;
      case 'rep-feed':
      case 'rep-consumption':
      case 'rep-weight':
        return <PakanIdealPage />;
      case 'rep-intensity':
        return <IntensitasMakanPage />;
      case 'rep-behavior':
        return <RekapPerilakuPage />;
      case 'profil':
      case 'admin-settings':
        return <ProfilPage userName={userName} role={role} email={email} />;
      case 'dashboard-mantri':
        return <DashboardMantriPage onPeriksa={handleStartExam} />;
      case 'pemeriksaan':
        return <PemeriksaanKesehatanPage initialCowID={examCowID} onBackToDashboard={() => {
          setExamCowID(null);
          setActiveModule(role === 'mantri' ? 'dashboard-mantri' : 'dashboard');
        }} />;
      default:
        return <DashboardPage onNavigate={setActiveModule} />;
    }
  };

  const breadcrumbItems = getBreadcrumb();

  return (
    <div className="flex bg-[#F4F7FB] text-[#162033] h-screen overflow-hidden font-body relative transition-colors duration-300">
      <Head title={`SIMANTRA — ${getModuleTitle()}`} />

      <Sidebar
        activeModule={activeModule}
        setActiveModule={(mod) => {
          setExamCowID(null);
          navigateToModule(mod);
        }}
        role={role}
        userName={userName}
        onLogout={handleLogout}
      />

      <div className="flex-1 pl-64 flex flex-col h-screen overflow-hidden min-w-0 bg-[#F4F7FB]">
        {/* Top Header Bar - Elegan dengan Breadcrumb & Tombol Pill Beranda */}
        <header className="h-14 bg-white/95 backdrop-blur-xs border-b border-[#DCE5F0] px-6 sm:px-8 flex items-center justify-between shrink-0 z-30 font-body">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] truncate">
              {breadcrumbItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-300">/</span>}
                  <span className={idx === breadcrumbItems.length - 1 ? 'text-[#162033] font-bold' : 'hover:text-[#12355B]'}>
                    {item}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <Link
            href="/"
            className="btn-gradient text-white text-xs font-bold px-4 sm:px-5 py-2 rounded-full inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer tracking-wider uppercase shrink-0"
            title="Kembali ke Landing Page Beranda"
          >
            <span>BERANDA</span>
            <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </Link>
        </header>

        <main className="farm-main-scroll flex-1 overflow-y-auto w-full p-6 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <ErrorBoundary key={activeModule}>
              {renderActiveModule()}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar?"
        confirmText="Logout"
        cancelText="Batal"
        onConfirm={executeLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
