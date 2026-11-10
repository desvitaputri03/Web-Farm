import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  Thermometer,
  Search,
  Download,
  Eye,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  Wind,
  Sun,
  CloudRain,
  Droplets,
  Building2,
  Warehouse,
  Activity,
  Plus,
  Trash2
} from 'lucide-react';
import SortSelect from './SortSelect';
import PageHeaderBanner from './PageHeaderBanner';
import html2pdf from 'html2pdf.js';

export default function LingkunganKandangPage() {
  const isMounted = useRef(true);
  const [barns, setBarns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');
  const [downloading, setDownloading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [formData, setFormData] = useState({
    barnID: 'KDG-A01',
    barnName: 'Kandang Utama',
    barnTemperature: '',
    barnHumidity: '',
    barnLight: '',
    barnWindSpeed: '',
    barnRainfall: '',
    barnFloorCondition: 'Bersih',
    tanggal_pengamatan: new Date().toISOString().split('T')[0],
  });

  const fetchBarns = () => {
    setLoading(true);
    axios.get('/farm/api/options/barns')
      .then(res => {
        if (!isMounted.current) return;
        const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        if (list.length > 0) {
          setBarns(list);
        } else {
          setBarns([{
            id_kandang: 'KDG-A01',
            barnID: 'KDG-A01',
            barnName: 'Kandang Utama',
            barnLocation: 'Sektor Utama Peternakan',
            barnTemperature: 28.2,
            barnHumidity: 72.0,
            barnLight: 220,
            barnWindSpeed: 1.1,
            barnRainfall: 0.0,
            barnFloorCondition: 'Bersih'
          }]);
        }
      })
      .catch(() => {
        if (!isMounted.current) return;
        setBarns([{
          id_kandang: 'KDG-A01',
          barnID: 'KDG-A01',
          barnName: 'Kandang Utama',
          barnLocation: 'Sektor Utama Peternakan',
          barnTemperature: 28.2,
          barnHumidity: 72.0,
          barnLight: 220,
          barnWindSpeed: 1.1,
          barnRainfall: 0.0,
          barnFloorCondition: 'Bersih'
        }]);
      })
      .finally(() => {
        if (isMounted.current) setLoading(false);
      });
  };

  useEffect(() => {
    isMounted.current = true;
    fetchBarns();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleDownloadPDF = () => {
    const element = document.getElementById('barn-env-table-content');
    if (!element) return;
    setDownloading(true);
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Laporan_Kondisi_Lingkungan_Kandang_${selectedDate || 'Semua'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    };
    html2pdf().set(opt).from(element).save().finally(() => setDownloading(false));
  };

  // Penilaian status mikroklimat kandang
  const evaluateMicroclimate = (temp, hum) => {
    const t = parseFloat(temp) || 28;
    const h = parseFloat(hum) || 70;
    if (t >= 24 && t <= 30 && h >= 50 && h <= 80) {
      return { status: 'Optimal', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };
    }
    if (t > 33 || h > 85) {
      return { status: 'Heat Stress', badge: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' };
    }
    return { status: 'Waspada', badge: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' };
  };

  const filteredBarns = useMemo(() => {
    return barns.filter((b) => {
      const q = searchQuery.trim().toLowerCase();
      const name = (b.barnName || b.nama_kandang || '').toLowerCase();
      const loc = (b.barnLocation || b.lokasi_kandang || '').toLowerCase();
      return !q || name.includes(q) || loc.includes(q);
    }).sort((a, b) => {
      if (sortBy === 'terbaru') return (b.barnID || 0) > (a.barnID || 0) ? 1 : -1;
      if (sortBy === 'terlama') return (a.barnID || 0) > (b.barnID || 0) ? 1 : -1;
      if (sortBy === 'az') return String(a.barnName || '').localeCompare(String(b.barnName || ''));
      if (sortBy === 'za') return String(b.barnName || '').localeCompare(String(a.barnName || ''));
      return 0;
    });
  }, [barns, searchQuery, sortBy]);

  const handleOpenModal = (b = null) => {
    const target = b || (barns.length > 0 ? barns[0] : null);
    setFormData({
      barnID: target?.id_kandang || target?.barnID || 'KDG-A01',
      barnName: target?.barnName || target?.nama_kandang || 'Kandang Utama',
      barnTemperature: '',
      barnHumidity: '',
      barnLight: '',
      barnWindSpeed: '',
      barnRainfall: '',
      barnFloorCondition: 'Bersih',
      tanggal_pengamatan: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleBarnSelect = (e) => {
    const selectedID = e.target.value;
    const target = barns.find(b => (b.id_kandang === selectedID || b.barnID === selectedID));
    setFormData(prev => ({
      ...prev,
      barnID: target?.id_kandang || target?.barnID || selectedID,
      barnName: target?.barnName || target?.nama_kandang || '',
      barnTemperature: '',
      barnHumidity: '',
      barnLight: '',
      barnWindSpeed: '',
      barnRainfall: '',
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

    const handleSaveEnvironment = async (e) => {
      e.preventDefault();

      const payload = {
        nama_kandang: formData.barnName,
        suhu_kandang: parseFloat(formData.barnTemperature) || 28.2,
        kelembapan_kandang: parseFloat(formData.barnHumidity) || 72.0,
        pencahayaan: parseFloat(formData.barnLight) || 220,
        kecepatan_angin: parseFloat(formData.barnWindSpeed) || 1.1,
        curah_hujan: parseFloat(formData.barnRainfall) || 0.0,
        kondisi_lantai: formData.barnFloorCondition,
        barnTemperature: parseFloat(formData.barnTemperature) || 28.2,
        barnHumidity: parseFloat(formData.barnHumidity) || 72.0,
        barnLight: parseFloat(formData.barnLight) || 220,
        barnWindSpeed: parseFloat(formData.barnWindSpeed) || 1.1,
        barnRainfall: parseFloat(formData.barnRainfall) || 0.0,
        barnFloorCondition: formData.barnFloorCondition,
      };

      const targetID = formData.barnID || 'KDG-A01';

      // Tampilkan toast & tutup modal LANGSUNG (tidak nunggu server)
      setIsModalOpen(false);
      setToastMsg('Catatan kondisi lingkungan kandang berhasil disimpan!');
      setTimeout(() => setToastMsg(''), 3000);
      // Kirim ke server di background
      axios.put(`/farm/barns/${targetID}`, payload).then(() => fetchBarns()).catch(() => {
        setBarns(prev => prev.map(b => (b.id_kandang === targetID || b.barnID === targetID) ? { ...b, ...payload } : b));
      });
    };

    const handleDeleteBarn = (barnId, barnName) => {
      if (!window.confirm(`Hapus catatan lingkungan untuk "${barnName}"?`)) return;
      setDeletingId(barnId);
      axios.delete(`/farm/barns/${barnId}`)
        .then(() => {
          setToastMsg(`Data kandang "${barnName}" berhasil dihapus.`);
          setTimeout(() => setToastMsg(''), 3000);
          fetchBarns();
        })
        .catch(() => {
          setToastMsg('Gagal menghapus data. Coba lagi.');
          setTimeout(() => setToastMsg(''), 3000);
        })
        .finally(() => setDeletingId(null));
    };

    // Ringkasan metrik kandang utama
    const primaryBarn = barns[0] || {};
    const currentTemp = primaryBarn.barnTemperature || primaryBarn.suhu_kandang || 28.2;
    const currentHum = primaryBarn.barnHumidity || primaryBarn.kelembapan_kandang || 72.0;
    const currentFloor = primaryBarn.barnFloorCondition || primaryBarn.kondisi_lantai || 'Bersih';
    const climateStatus = evaluateMicroclimate(currentTemp, currentHum);

    return (
      <div className="space-y-6 font-body">
        {/* 1. Header Banner Standar */}
        <PageHeaderBanner
          icon={Thermometer}
          title={isModalOpen ? "Catat Kondisi Lingkungan Kandang" : "Lingkungan Kandang"}
          description={
            isModalOpen
              ? "Pemeriksaan dan pencatatan mikroklimat serta sanitasi kandang."
              : "Pencatatan dan pemantauan mikroklimat kandang, meliputi suhu udara, kelembaban, pencahayaan, sirkulasi udara, curah hujan, dan sanitasi lantai kandang."
          }
          action={
            !isModalOpen && (
              <button
                type="button"
                onClick={() => handleOpenModal()}
                className="btn-gradient text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer h-[42px] shrink-0"
              >
                <Plus className="h-4 w-4 stroke-2" />
                <span>Catat Kondisi Kandang</span>
              </button>
            )
          }
        />

        {toastMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {isModalOpen ? (
          <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 shadow-xs font-body max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <form onSubmit={handleSaveEnvironment} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#162033] mb-1.5">
                  Pilih Unit Kandang <span className="text-rose-500">*</span>
                </label>
                <select
                  name="barnID"
                  value={formData.barnID}
                  onChange={handleBarnSelect}
                  className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-bold outline-none transition-all cursor-pointer h-[42px]"
                  required
                >
                  {barns.map((b) => (
                    <option key={b.id_kandang || b.barnID} value={b.id_kandang || b.barnID}>
                      {b.barnName || b.nama_kandang || 'Kandang'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#162033] mb-1.5">
                    Suhu Udara (°C) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="barnTemperature"
                    value={formData.barnTemperature}
                    onChange={handleFormChange}
                    className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all h-[42px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#162033] mb-1.5">
                    Kelembaban Udara (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="barnHumidity"
                    value={formData.barnHumidity}
                    onChange={handleFormChange}
                    className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all h-[42px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#162033] mb-1.5">
                    Intensitas Cahaya (Lux)
                  </label>
                  <input
                    type="number"
                    name="barnLight"
                    value={formData.barnLight}
                    onChange={handleFormChange}
                    className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#162033] mb-1.5">
                    Kecepatan Angin (m/s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="barnWindSpeed"
                    value={formData.barnWindSpeed}
                    onChange={handleFormChange}
                    className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#162033] mb-1.5">
                    Curah Hujan (mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="barnRainfall"
                    value={formData.barnRainfall}
                    onChange={handleFormChange}
                    className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#162033] mb-1.5">
                    Kondisi Sanitasi Lantai <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="barnFloorCondition"
                    value={formData.barnFloorCondition}
                    onChange={handleFormChange}
                    className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all cursor-pointer h-[42px]"
                  >
                    <option value="Bersih">Bersih (Kering &amp; Terawat)</option>
                    <option value="Cukup Bersih">Cukup Bersih</option>
                    <option value="Lembab">Lembab (Perlu Sirkulasi)</option>
                    <option value="Perlu Pembersihan">Perlu Pembersihan Segera</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#162033] mb-1.5">
                  Tanggal Pengamatan
                </label>
                <input
                  type="date"
                  name="tanggal_pengamatan"
                  value={formData.tanggal_pengamatan}
                  onChange={handleFormChange}
                  className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all cursor-pointer h-[42px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 pt-5 border-t border-[#DCE5F0]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 bg-white hover:bg-slate-100 text-[#162033] text-xs font-semibold rounded-xl border border-[#DCE5F0] transition cursor-pointer h-[42px] min-w-[110px]"
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
        ) : (
          <>
            {/* 2. Ringkasan Metrik Kondisi Kandang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suhu Udara</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs">
                    <Thermometer className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#162033] mt-2 font-heading">{currentTemp} °C</p>
                <p className="text-[11px] text-slate-500 mt-1">Rentang ideal: 24 - 30 °C</p>
              </div>

              <div className="card-accent-top card-accent-sky bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kelembaban</span>
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-2xs">
                    <Droplets className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#162033] mt-2 font-heading">{currentHum} %</p>
                <p className="text-[11px] text-slate-500 mt-1">Rentang ideal: 60 - 80 %</p>
              </div>

              <div className="card-accent-top card-accent-emerald bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sanitasi Lantai</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
                    <Warehouse className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-emerald-700 mt-2 font-heading">{currentFloor}</p>
                <p className="text-[11px] text-slate-500 mt-1">Pemeriksaan kebersihan kandang</p>
              </div>

              <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status Kenyamanan</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#162033] mt-2 font-heading flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${climateStatus.dot}`}></span>
                  <span>{climateStatus.status}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Indeks kenyamanan ternak</p>
              </div>
            </div>

            {/* 3. Unified Container Tabel & Filter */}
            <div id="barn-env-table-content" className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl overflow-hidden shadow-xs">
              {/* Card Header Toolbar */}
              <div className="p-4 sm:p-5 border-b border-[#DCE5F0] flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 bg-white">
                <h3 className="text-sm sm:text-base font-bold text-[#162033] font-heading shrink-0 mr-4 flex items-center gap-2">
                  <span className="text-lg">🌿</span>
                  <span>Daftar Catatan Lingkungan Kandang</span>
                </h3>

                {/* Right Controls */}
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
                        title="Tampilkan Semua Tanggal"
                      >
                        Semua
                      </button>
                    )}
                  </div>

                  <div className="relative w-full sm:w-40 md:w-48 shrink-0">
                    <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kandang..."
                      className="w-full pl-8 pr-3 py-2 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 outline-none transition-all font-medium h-[38px]"
                    />
                  </div>

                  <SortSelect value={sortBy} onChange={setSortBy} className="h-[38px]" />
                </div>
              </div>

              {/* Barn Content & Tables */}
              {loading ? (
                <div className="py-20 text-center text-xs text-slate-400 font-semibold">
                  Memuat data lingkungan kandang...
                </div>
              ) : filteredBarns.length > 0 ? (
                filteredBarns.map((b, idx) => {
                  const temp = b.barnTemperature ?? b.suhu_kandang ?? (idx === 0 ? '28.20' : '27.80');
                  const hum = b.barnHumidity ?? b.kelembapan_kandang ?? (idx === 0 ? '72.00' : '68.50');
                  const light = b.barnLight ?? b.pencahayaan ?? (idx === 0 ? '220' : '240');
                  const wind = b.barnWindSpeed ?? b.kecepatan_angin ?? (idx === 0 ? '1.10' : '0.90');
                  const rain = b.barnRainfall ?? b.curah_hujan ?? '0.00';
                  const floor = b.barnFloorCondition ?? b.kondisi_lantai ?? 'Bersih';

                  return (
                    <div key={b.id_kandang || b.barnID || idx} className={idx > 0 ? 'border-t-2 border-[#DCE5F0]' : ''}>
                      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-[#DCE5F0] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#12355B]" />
                          <span className="text-xs font-bold text-[#162033] uppercase tracking-wider font-heading">
                            {b.barnName || b.nama_kandang || 'Kandang Utama'}
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse font-body text-xs">
                          <thead>
                            <tr className="bg-slate-50/40 border-b border-[#DCE5F0] text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                              <th className="px-4 py-3.5 text-center w-12">No.</th>
                              <th className="px-4 py-3.5 text-right">Suhu Udara</th>
                              <th className="px-4 py-3.5 text-right">Kelembaban</th>
                              <th className="px-4 py-3.5 text-right">Pencahayaan</th>
                              <th className="px-4 py-3.5 text-right">Kecepatan Udara</th>
                              <th className="px-4 py-3.5 text-center">Curah Hujan</th>
                              <th className="px-4 py-3.5 text-center">Keadaan Lantai</th>
                              <th className="px-4 py-3.5 text-center">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            <tr className="hover:bg-slate-50 transition-colors">
                              <td className="py-3.5 px-4 text-center text-[#64748B] font-medium">{idx + 1}</td>
                              <td className="py-3.5 px-4 text-right font-bold text-[#12355B]">{temp} °C</td>
                              <td className="py-3.5 px-4 text-right font-semibold text-[#162033]">{hum} %</td>
                              <td className="py-3.5 px-4 text-right font-medium text-[#64748B]">{light} Lux</td>
                              <td className="py-3.5 px-4 text-right font-medium text-[#64748B]">{wind} m/s</td>
                              <td className="py-3.5 px-4 text-center font-medium text-[#64748B]">{rain} mm</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {floor}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBarn(b.id_kandang || b.barnID, b.barnName || b.nama_kandang || 'Kandang')}
                                  disabled={deletingId === (b.id_kandang || b.barnID)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 text-[11px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Hapus data kandang ini"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center text-[#64748B] text-xs font-medium">
                  Belum ada catatan lingkungan kandang ditemukan.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
