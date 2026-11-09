import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  Activity,
  Beef,
  BriefcaseMedical,
  CheckCircle2,
  Warehouse,
  Utensils,
  Thermometer,
  FileText,
  Radio,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  ChevronRight
} from 'lucide-react';

export default function Landing({ auth }) {
  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#162033] font-body antialiased flex flex-col justify-between">
      <Head>
        <title>SIMANTRA — Sistem Manajemen Peternakan Sapi Terintegrasi</title>
        <meta name="description" content="SIMANTRA - Sistem Informasi Manajemen Peternakan Sapi Terpadu untuk Peternak, Mantri, dan Admin." />
      </Head>

      {/* Header Navigation */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#DCE5F0] sticky top-0 z-50 py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo Brand SIMANTRA */}
          <Link href="/" className="group flex flex-col">
            <span className="text-2xl sm:text-3xl font-black text-[#12355B] tracking-wider leading-none transition-colors uppercase font-brand">
              SIMANTRA
            </span>
            <span className="text-[9.5px] font-semibold text-[#64748B] tracking-widest mt-1 uppercase font-body">
              PORTAL INTERNAL TERNAK
            </span>
          </Link>

          {/* CTA Login Button Navy */}
          <div>
            {auth?.user ? (
              <Link
                href={route('dashboard')}
                className="btn-gradient text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-xs hover:shadow-md transition-all inline-flex items-center gap-1.5 uppercase tracking-wider"
              >
                <span>DASHBOARD</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={route('login')}
                className="btn-gradient text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-xs hover:shadow-md transition-all inline-flex items-center gap-1.5 uppercase tracking-wider"
              >
                <span>LOGIN</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* HERO SECTION */}
        <section id="beranda" className="relative pt-4 pb-8 lg:pt-6 lg:pb-12 overflow-hidden flex items-center bg-[#F4F7FB] min-h-[calc(100vh-64px)]">

          {/* 1. Top Decorative Fluid Navy Wave SVG */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[350px] pointer-events-none opacity-80 transition-transform duration-1000 ease-out hover:scale-105">
            <svg viewBox="0 0 500 300" className="w-full h-full">
              <path
                d="M 150 0 C 250 80, 380 20, 500 120 L 500 0 Z"
                fill="#12355B"
                className="opacity-90"
              />
              <path
                d="M 100 0 C 220 110, 340 50, 500 180 L 500 0 Z"
                fill="#1E4E7E"
                className="opacity-30"
              />
            </svg>
          </div>

          {/* 2. Center Diagonal S-Curve Organic Wave SVG */}
          <div className="absolute top-0 right-0 w-full lg:w-3/5 h-full pointer-events-none z-0">
            <svg viewBox="0 0 600 600" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M 220 0 C 120 180, 280 340, 160 600 L 600 600 L 600 0 Z"
                fill="#12355B"
                className="opacity-95"
              />
              <path
                d="M 180 0 C 80 190, 240 370, 120 600 L 600 600 L 600 0 Z"
                fill="#1E4E7E"
                className="opacity-30"
              />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full my-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

              {/* Left Content Column */}
              <div className="lg:col-span-6 space-y-5">
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold leading-[1.15] tracking-tight text-[#162033] mb-2 font-heading">
                    <span className="block text-[#162033] pb-1">
                      Sistem Manajemen
                    </span>
                    <span className="block bg-gradient-to-r from-[#12355B] via-[#0284C7] to-emerald-600 bg-clip-text text-transparent">
                      Peternakan Sapi Terintegrasi
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base lg:text-lg text-[#64748B] font-normal leading-relaxed mt-3 max-w-xl font-body">
                    Solusi digital serba praktis untuk memantau kesehatan sapi, pemakaian pakan harian, dan kondisi kandang secara otomatis serta teratur.
                  </p>
                </div>

                {/* 3 Kartu Ringkas Fitur Hero */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1 font-body">
                  <div className="card-accent-top flex items-center gap-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#DCE5F0] shadow-2xs hover:border-[#12355B] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-[#12355B] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform">
                      <Radio className="w-5 h-5 stroke-2" />
                    </div>
                    <div>
                      <h2 className="text-xs sm:text-sm font-bold text-[#162033] leading-tight group-hover:text-[#12355B] transition-colors">
                        Monitoring
                      </h2>
                      <p className="text-[11px] text-[#64748B] font-medium leading-tight mt-0.5">
                        Kondisi &amp; perilaku
                      </p>
                    </div>
                  </div>

                  <div className="card-accent-top card-accent-sky flex items-center gap-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#DCE5F0] shadow-2xs hover:border-sky-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 text-sky-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform">
                      <Beef className="w-5 h-5 stroke-2" />
                    </div>
                    <div>
                      <h2 className="text-xs sm:text-sm font-bold text-[#162033] leading-tight group-hover:text-[#12355B] transition-colors">
                        Manajemen Sapi
                      </h2>
                      <p className="text-[11px] text-[#64748B] font-medium leading-tight mt-0.5">
                        Data sapi &amp; pakan
                      </p>
                    </div>
                  </div>

                  <div className="card-accent-top card-accent-emerald flex items-center gap-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#DCE5F0] shadow-2xs hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform">
                      <BriefcaseMedical className="w-5 h-5 stroke-2" />
                    </div>
                    <div>
                      <h2 className="text-xs sm:text-sm font-bold text-[#162033] leading-tight group-hover:text-[#12355B] transition-colors">
                        Riwayat Medis
                      </h2>
                      <p className="text-[11px] text-[#64748B] font-medium leading-tight mt-0.5">
                        Diagnosa mantri
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column Showcase Photo */}
              <div className="lg:col-span-6 relative mt-4 lg:mt-0 h-full z-10">

                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900/10 group border-2 border-white/80">
                  <img
                    src="/images/cows_barn_real.jpg"
                    alt="Peternakan Sapi SIMANTRA"
                    className="w-full h-[360px] sm:h-[420px] lg:h-[450px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Soft Left White Gradient Overlay */}
                  <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#F4F7FB]/90 via-[#F4F7FB]/40 to-transparent pointer-events-none" />

                  {/* Bottom-Right Organic Navy Wave Accent */}
                  <div className="absolute bottom-0 right-0 w-64 sm:w-72 h-24 sm:h-28 bg-[#12355B] rounded-tl-[120px] opacity-95 pointer-events-none shadow-lg transform group-hover:scale-105 transition-transform duration-500" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3 KARTU PERAN (TANPA JUDUL HAK AKSES PENGGUNA) */}
        <section id="hak-akses" className="py-10 md:py-14 bg-white border-t border-[#DCE5F0]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-body">
              {/* Role 1: Peternak */}
              <div className="card-accent-top bg-white p-6 rounded-2xl border border-[#DCE5F0] shadow-2xs hover:shadow-lg hover:border-[#12355B] hover:-translate-y-1 transition-all duration-300 space-y-3 group">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-[#12355B] rounded-xl flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                  <UserCheck className="w-5.5 h-5.5 stroke-2" />
                </div>
                <div>
                  <h3 className="font-bold text-[#162033] text-base group-hover:text-[#12355B] transition-colors font-heading flex items-center gap-2">
                    <span>👨‍🌾</span>
                    <span>Peternak</span>
                  </h3>
                  <span className="text-[11px] text-[#12355B] font-semibold block mt-0.5 uppercase tracking-wider">Operasional Harian</span>
                </div>
                <p className="text-xs text-[#64748B] font-normal leading-relaxed">
                  Pencatatan data sapi, jadwal pakan, pengawasan kandang, dan rangkuman performa ternak.
                </p>
              </div>

              {/* Role 2: Mantri */}
              <div className="card-accent-top card-accent-emerald bg-white p-6 rounded-2xl border border-[#DCE5F0] shadow-2xs hover:shadow-lg hover:border-emerald-500 hover:-translate-y-1 transition-all duration-300 space-y-3 group">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-5.5 h-5.5 stroke-2" />
                </div>
                <div>
                  <h3 className="font-bold text-[#162033] text-base group-hover:text-emerald-700 transition-colors font-heading flex items-center gap-2">
                    <span>🩺</span>
                    <span>Mantri Ternak</span>
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5 uppercase tracking-wider">Layanan Kesehatan</span>
                </div>
                <p className="text-xs text-[#64748B] font-normal leading-relaxed">
                  Pemeriksaan fisik harian, penanganan sapi sakit, dan pencatatan diagnosa medis.
                </p>
              </div>

              {/* Role 3: Admin */}
              <div className="card-accent-top card-accent-sky bg-white p-6 rounded-2xl border border-[#DCE5F0] shadow-2xs hover:shadow-lg hover:border-sky-500 hover:-translate-y-1 transition-all duration-300 space-y-3 group">
                <div className="w-11 h-11 bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 text-sky-700 rounded-xl flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5.5 h-5.5 stroke-2" />
                </div>
                <div>
                  <h3 className="font-bold text-[#162033] text-base group-hover:text-sky-700 transition-colors font-heading flex items-center gap-2">
                    <span>🛡️</span>
                    <span>Administrator</span>
                  </h3>
                  <span className="text-[11px] text-sky-700 font-semibold block mt-0.5 uppercase tracking-wider">Manajemen Sistem</span>
                </div>
                <p className="text-xs text-[#64748B] font-normal leading-relaxed">
                  Pengaturan akun pengguna, otorisasi hak akses peran, dan rekapitulasi laporan.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER NAVY */}
      <footer className="relative mt-8 font-body">
        {/* Soft Organic Wave SVG Navy */}
        <div className="w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-12 sm:h-16"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,50 L1200,120 L0,120 Z"
              className="fill-[#12355B]"
            ></path>
          </svg>
        </div>

        {/* Solid Navy Footer Bar */}
        <div className="bg-[#12355B] text-white py-6 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="font-black tracking-wider text-sm font-brand">SIMANTRA</span>
              <span className="text-slate-300 text-[11px]">— Sistem Manajemen Peternakan Sapi Terintegrasi</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              &copy; 2026 SIMANTRA. Portal Internal Khusus Admin, Peternak, dan Mantri.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
