import React from 'react';
import {
  LayoutDashboard,
  Beef,
  Warehouse,
  Utensils,
  PackageOpen,
  Stethoscope,
  Activity,
  Thermometer,
  Scale,
  DollarSign,
  FileText,
  LogOut,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const PETERNAK_SECTIONS = [
  {
    category: 'UTAMA',
    items: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { id: 'sapi', name: 'Data Sapi', icon: Beef }
    ]
  },
  {
    category: 'KANDANG & FASILITAS',
    items: [
      { id: 'kandang', name: 'Unit Kandang', icon: Warehouse },
      { id: 'tempat-makan', name: 'Tempat Makan', icon: Utensils },
      { id: 'environment', name: 'Lingkungan Kandang', icon: Thermometer }
    ]
  }
];

const MANTRI_SECTIONS = [
  {
    category: 'UTAMA',
    items: [
      { id: 'dashboard-mantri', name: 'Dashboard', icon: LayoutDashboard },
      { id: 'sapi', name: 'Data Sapi', icon: Beef }
    ]
  },
  {
    category: 'LAYANAN MEDIS',
    items: [
      { id: 'pemeriksaan', name: 'Pemeriksaan Medis', icon: Stethoscope }
    ]
  }
];

const ADMIN_SECTIONS = [
  {
    category: 'UTAMA',
    items: [
      { id: 'admin-overview', name: 'Dashboard', icon: LayoutDashboard },
      { id: 'sapi', name: 'Data Sapi', icon: Beef }
    ]
  },
  {
    category: 'KANDANG & FASILITAS',
    items: [
      { id: 'kandang', name: 'Unit Kandang', icon: Warehouse },
      { id: 'tempat-makan', name: 'Tempat Makan', icon: Utensils },
      { id: 'environment', name: 'Lingkungan Kandang', icon: Thermometer }
    ]
  },
  {
    category: 'PENGGUNA',
    items: [
      { id: 'admin-users', name: 'Kelola Pengguna', icon: LayoutDashboard }
    ]
  }
];

export default function Sidebar({ activeModule, setActiveModule, role = 'peternak', userName = '', onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const defaultDashboard = role === 'mantri' ? 'dashboard-mantri' : role === 'admin' ? 'admin-overview' : 'dashboard';
  const sectionsToRender = role === 'mantri' ? MANTRI_SECTIONS : role === 'admin' ? ADMIN_SECTIONS : PETERNAK_SECTIONS;
  const panelSubtitle = role === 'admin' ? 'PANEL ADMIN' : role === 'mantri' ? 'PANEL MANTRI' : 'PANEL PETERNAK';

  const handleNav = (mod) => {
    setActiveModule(mod);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <aside className="w-64 bg-gradient-to-b from-[#0D2847] via-[#12355B] to-[#0A223B] border-r border-[#0D2847] flex flex-col h-full shadow-2xl z-30 font-body text-white">
      {/* SIMANTRA Brand Header */}
      <div className="p-5 border-b border-white/10 bg-black/20">
        <button
          type="button"
          onClick={() => handleNav(defaultDashboard)}
          className="w-full text-left cursor-pointer group flex flex-col justify-center"
          title="SIMANTRA Sistem Manajemen Peternakan Sapi"
        >
          <h1 className="text-2xl font-black text-white tracking-wider leading-none uppercase font-['Playfair_Display',serif] group-hover:text-blue-200 transition-colors">
            SIMANTRA<span className="text-emerald-400">.</span>
          </h1>
          <span className="text-[11px] font-semibold text-blue-200/80 tracking-wider uppercase block mt-1 font-body">
            {panelSubtitle}
          </span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
        {sectionsToRender.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {sec.category && sec.category.trim() !== '' && (
              <div className="px-3 text-[10px] font-bold tracking-wider text-blue-200/60 uppercase py-1 font-body">
                {sec.category}
              </div>
            )}
            {sec.items.map((item) => {
              const isActive = activeModule === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${isActive
                      ? 'bg-white text-[#12355B] font-bold shadow-md relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:bg-gradient-to-b before:from-[#2563EB] before:to-emerald-500 before:rounded-r transform translate-x-0.5'
                      : 'text-slate-200/90 font-medium hover:bg-white/10 hover:text-white hover:translate-x-0.5'
                    }`}
                >
                  {Icon && (
                    <Icon
                      className={`h-4 w-4 shrink-0 stroke-[2.2] ${isActive ? 'text-[#12355B]' : 'text-blue-200/80 group-hover:text-white'
                        }`}
                    />
                  )}
                  <span className="text-xs tracking-normal truncate">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Settings + Logout at Bottom */}
      <div className="p-3 border-t border-white/10 bg-black/20 space-y-2">
        <button
          type="button"
          onClick={() => handleNav(role === 'admin' ? 'admin-settings' : 'profil')}
          className={`w-full text-white border text-xs font-bold rounded-xl px-3.5 py-2.5 flex items-center gap-3 transition-all cursor-pointer shadow-xs font-body ${activeModule === 'admin-settings' || activeModule === 'profil'
              ? 'bg-white/20 border-white/30 shadow-inner'
              : 'bg-white/10 hover:bg-white/20 border-white/15'
            }`}
          title="Pengaturan Akun"
        >
          <Settings className="h-4 w-4 shrink-0 text-white stroke-[2.2]" />
          <span>Setting</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold rounded-xl px-3.5 py-2.5 flex items-center gap-3 transition-all cursor-pointer shadow-xs font-body"
          title="Logout"
        >
          <LogOut className="h-4 w-4 shrink-0 stroke-[2.2]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Tombol hamburger - hanya tampil di mobile */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-3.5 left-4 z-40 md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-[#12355B] text-white shadow-lg"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar desktop - selalu tampil di md ke atas */}
      <div className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:z-30">
        {sidebarContent}
      </div>

      {/* Sidebar mobile - drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay gelap */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer panel */}
          <div className="relative w-64 h-full flex flex-col z-10">
            {/* Tombol tutup */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Tutup menu"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
