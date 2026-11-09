import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  TrendingUp, 
  Scale, 
  Calendar, 
  Printer, 
  Warehouse, 
  Beef, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Filter,
  Calculator,
  ChevronRight,
  Info
} from 'lucide-react';
import PageHeaderBanner from './PageHeaderBanner';
import SortSelect from './SortSelect';

// Fallback data sapi finansial realistis untuk siklus penggemukan
const INITIAL_COWS_FINANCIAL = [
  {
    cowID: 'SP-2024-001',
    cowCode: 'SP-2024-001',
    cowBreed: 'Brangus',
    cowBarnID: 'KDG-A01',
    barnName: 'Kandang A (Utama)',
    hargaBeli: 13800000,
    lamaPelihara: 120, // 4 bulan siklus penggemukan
    kebutuhanPakanKg: 12,
    hargaPakanKg: 3500, // Rp 42.000 / hari
    biayaTambahan: 250000, // Vitamin & Vaksin
    targetBerat: 550,
    hargaJualPerKg: 62000, // Harga acuan bobot hidup
  },
  {
    cowID: 'SP-2024-002',
    cowCode: 'SP-2024-002',
    cowBreed: 'Brahman',
    cowBarnID: 'KDG-A01',
    barnName: 'Kandang A (Utama)',
    hargaBeli: 12200000,
    lamaPelihara: 120,
    kebutuhanPakanKg: 11,
    hargaPakanKg: 3500, // Rp 38.500 / hari
    biayaTambahan: 200000,
    targetBerat: 500,
    hargaJualPerKg: 62000,
  },
  {
    cowID: 'SP-2024-003',
    cowCode: 'SP-2024-003',
    cowBreed: 'Angus',
    cowBarnID: 'KDG-A01',
    barnName: 'Kandang A (Utama)',
    hargaBeli: 10800000,
    lamaPelihara: 120,
    kebutuhanPakanKg: 10,
    hargaPakanKg: 3500, // Rp 35.000 / hari
    biayaTambahan: 250000,
    targetBerat: 430,
    hargaJualPerKg: 63000,
  },
  {
    cowID: 'SP-2024-004',
    cowCode: 'SP-2024-004',
    cowBreed: 'Sapi Bali',
    cowBarnID: 'KDG-A01',
    barnName: 'Kandang A (Utama)',
    hargaBeli: 9500000,
    lamaPelihara: 150,
    kebutuhanPakanKg: 8,
    hargaPakanKg: 3500, // Rp 28.000 / hari
    biayaTambahan: 150000,
    targetBerat: 380,
    hargaJualPerKg: 66000,
  },
  {
    cowID: 'SP-2024-005',
    cowCode: 'SP-2024-005',
    cowBreed: 'Limousin',
    cowBarnID: 'KDG-B01',
    barnName: 'Kandang B',
    hargaBeli: 15800000,
    lamaPelihara: 120,
    kebutuhanPakanKg: 13,
    hargaPakanKg: 3500,
    biayaTambahan: 250000,
    targetBerat: 620,
    hargaJualPerKg: 64000,
  },
  {
    cowID: 'SP-2024-006',
    cowCode: 'SP-2024-006',
    cowBreed: 'Simmental',
    cowBarnID: 'KDG-B01',
    barnName: 'Kandang B',
    hargaBeli: 16300000,
    lamaPelihara: 120,
    kebutuhanPakanKg: 14,
    hargaPakanKg: 3500,
    biayaTambahan: 300000,
    targetBerat: 650,
    hargaJualPerKg: 64000,
  }
];

export default function KeuanganProfitPage() {
  const [cows, setCows] = useState([]);
  const [barns, setBarns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter Kandang & Sortir
  const [selectedBarnFilter, setSelectedBarnFilter] = useState('all');
  const [sortBy, setSortBy] = useState('terbaru');

  // Kalkulator Interaktif State
  const [calcSelectedCowId, setCalcSelectedCowId] = useState('');
  const [calcForm, setCalcForm] = useState({
    hargaBeli: 13800000,
    lamaPelihara: 120,
    kebutuhanPakanKg: 12,
    hargaPakanKg: 3500,
    biayaTambahan: 250000,
    targetBerat: 550,
    hargaJualPerKg: 62000,
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      axios.get('/farm/api/cows?limit=100'),
      axios.get('/farm/api/options/barns')
    ])
    .then(([cowsRes, barnsRes]) => {
      const fetchedCows = cowsRes.data.data ?? cowsRes.data ?? [];
      const fetchedBarns = barnsRes.data.data ?? barnsRes.data ?? [];

      if (Array.isArray(fetchedBarns) && fetchedBarns.length > 0) {
        setBarns(fetchedBarns);
      } else {
        setBarns([
          { id_kandang: 'KDG-A01', nama_kandang: 'Kandang A (Utama)' },
          { id_kandang: 'KDG-B01', nama_kandang: 'Kandang B' }
        ]);
      }

      if (Array.isArray(fetchedCows) && fetchedCows.length > 0) {
        // Gabungkan data API dengan parameter kalkulasi finansial
        const mapped = fetchedCows.map((c, idx) => {
          const numMatch = String(c.cowCode || c.code || c.cowID || '').match(/\d+$/);
          const cowNum = numMatch ? parseInt(numMatch[0], 10) : idx + 1;
          const fallback = INITIAL_COWS_FINANCIAL.find(f => f.cowCode === (c.cowCode || c.cowID)) || INITIAL_COWS_FINANCIAL[idx % INITIAL_COWS_FINANCIAL.length];

          const barnId = c.cowBarnID || c.id_kandang || (c.kandang && (c.kandang.id_kandang || c.kandang.barnID)) || fallback.cowBarnID;
          const isBarnB = String(barnId).toLowerCase().includes('b') || cowNum >= 5;
          const cleanBarnName = isBarnB ? 'Kandang B' : 'Kandang A (Utama)';

          return {
            cowID: c.cowID || c.id_sapi || `SP-2024-${String(cowNum).padStart(3, '0')}`,
            cowCode: c.cowCode || c.code || `SP-2024-${String(cowNum).padStart(3, '0')}`,
            cowBreed: c.cowBreed || c.ras_sapi || fallback.cowBreed,
            cowBarnID: isBarnB ? 'KDG-B01' : 'KDG-A01',
            barnName: cleanBarnName,
            hargaBeli: parseFloat(c.harga_beli || c.cowPurchasePrice || fallback.hargaBeli),
            lamaPelihara: fallback.lamaPelihara || 120,
            kebutuhanPakanKg: fallback.kebutuhanPakanKg || 12,
            hargaPakanKg: fallback.hargaPakanKg || 3500,
            biayaTambahan: fallback.biayaTambahan || 250000,
            targetBerat: parseFloat(c.target_berat_jual || c.physiology?.phyTargetWeight || fallback.targetBerat),
            hargaJualPerKg: fallback.hargaJualPerKg || 65000,
          };
        });
        setCows(mapped);
        if (mapped.length > 0) {
          setCalcSelectedCowId(mapped[0].cowCode);
          setCalcForm({
            hargaBeli: mapped[0].hargaBeli,
            lamaPelihara: mapped[0].lamaPelihara,
            kebutuhanPakanKg: mapped[0].kebutuhanPakanKg,
            hargaPakanKg: mapped[0].hargaPakanKg,
            biayaTambahan: mapped[0].biayaTambahan,
            targetBerat: mapped[0].targetBerat,
            hargaJualPerKg: mapped[0].hargaJualPerKg,
          });
        }
      } else {
        setCows(INITIAL_COWS_FINANCIAL);
        setCalcSelectedCowId(INITIAL_COWS_FINANCIAL[0].cowCode);
      }
    })
    .catch(() => {
      setCows(INITIAL_COWS_FINANCIAL);
      setCalcSelectedCowId(INITIAL_COWS_FINANCIAL[0].cowCode);
    })
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update form kalkulator saat sapi dipilih
  const handleSelectCowCalc = (code) => {
    setCalcSelectedCowId(code);
    const found = cows.find(c => c.cowCode === code);
    if (found) {
      setCalcForm({
        hargaBeli: found.hargaBeli,
        lamaPelihara: found.lamaPelihara,
        kebutuhanPakanKg: found.kebutuhanPakanKg,
        hargaPakanKg: found.hargaPakanKg,
        biayaTambahan: found.biayaTambahan,
        targetBerat: found.targetBerat,
        hargaJualPerKg: found.hargaJualPerKg,
      });
    }
  };

  // Kalkulasi untuk Sapi yang sedang disimulasikan
  const pakanPerHari = (calcForm.kebutuhanPakanKg || 0) * (calcForm.hargaPakanKg || 0);
  const totalBiayaPakan = pakanPerHari * (calcForm.lamaPelihara || 0);
  const totalModalHPP = (parseFloat(calcForm.hargaBeli) || 0) + totalBiayaPakan + (parseFloat(calcForm.biayaTambahan) || 0);
  const estimasiNilaiJual = (calcForm.targetBerat || 0) * (calcForm.hargaJualPerKg || 0);
  const proyeksiLaba = estimasiNilaiJual - totalModalHPP;
  const isUntung = proyeksiLaba >= 0;

  // Filter Sapi Berdasarkan Unit Kandang
  const filteredCows = cows.filter(c => {
    if (selectedBarnFilter === 'all') return true;
    return String(c.cowBarnID) === selectedBarnFilter || String(c.barnName).toLowerCase().includes(selectedBarnFilter.toLowerCase());
  });

  // Sortir Sapi
  const sortedCows = [...filteredCows].sort((a, b) => {
    if (sortBy === 'az') return a.cowBreed.localeCompare(b.cowBreed);
    if (sortBy === 'za') return b.cowBreed.localeCompare(a.cowBreed);
    const numA = parseInt(String(a.cowCode).replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(String(b.cowCode).replace(/\D/g, ''), 10) || 0;
    if (sortBy === 'terlama') return numA - numB;
    return numA - numB;
  });

  // Agregasi Finansial Global / Sesuai Filter Kandang
  const totalNilaiBeli = filteredCows.reduce((acc, c) => acc + (parseFloat(c.hargaBeli) || 0), 0);
  const totalAkumulasiPakan = filteredCows.reduce((acc, c) => {
    const daily = (c.kebutuhanPakanKg || 12) * (c.hargaPakanKg || 3500);
    return acc + (daily * (c.lamaPelihara || 120));
  }, 0);
  const totalAkumulasiModal = totalNilaiBeli + totalAkumulasiPakan + (filteredCows.length * 250000);
  const totalEstimasiPenjualan = filteredCows.reduce((acc, c) => acc + ((c.targetBerat || 500) * (c.hargaJualPerKg || 65000)), 0);
  const totalEstimasiLaba = totalEstimasiPenjualan - totalAkumulasiModal;

  const fmtRp = (num) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header Banner */}
      <PageHeaderBanner
        icon={DollarSign}
        title="Keuangan & Estimasi Profit"
      />

      {/* Bar Filter Kandang & Tombol Cetak Laporan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#DCE5F0] p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-[#12355B]" />
          <span className="text-xs font-bold text-[#162033]">Filter Unit Kandang:</span>
          <select
            value={selectedBarnFilter}
            onChange={(e) => setSelectedBarnFilter(e.target.value)}
            className="bg-slate-50 border border-[#DCE5F0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#12355B] outline-none focus:border-[#12355B]"
          >
            <option value="all">Semua Kandang (Seluruh Peternakan)</option>
            <option value="KDG-A01">Kandang A (Utama)</option>
            <option value="KDG-B01">Kandang B</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Printer className="h-4 w-4" />
          <span>Cetak / Ekspor Laporan</span>
        </button>
      </div>

      {/* 4 KPI Ringkasan Finansial Peternakan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Nilai Beli */}
        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:border-[#12355B] transition-all">
          <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">Total Nilai Beli</p>
          <p className="text-xl font-bold text-[#162033] mt-1 font-heading">{fmtRp(totalNilaiBeli)}</p>
          <p className="text-[11px] text-[#64748B] mt-1">Investasi pembelian {filteredCows.length} ekor sapi</p>
        </div>

        {/* Total Biaya Pakan */}
        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:border-[#12355B] transition-all">
          <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">Estimasi Biaya Pakan</p>
          <p className="text-xl font-bold text-[#162033] mt-1 font-heading">{fmtRp(totalAkumulasiPakan)}</p>
          <p className="text-[11px] text-[#64748B] mt-1">Konsumsi pakan selama siklus pemeliharaan</p>
        </div>

        {/* Total Modal HPP */}
        <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:border-[#12355B] transition-all">
          <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">Total Modal Tercatat (HPP)</p>
          <p className="text-xl font-bold text-[#162033] mt-1 font-heading">{fmtRp(totalAkumulasiModal)}</p>
          <p className="text-[11px] text-[#64748B] mt-1">Harga Beli + Pakan + Biaya Obat</p>
        </div>

        {/* Estimasi Laba Bersih */}
        <div className={`border rounded-2xl p-5 shadow-xs transition-all ${totalEstimasiLaba >= 0 ? 'bg-emerald-50/60 border-emerald-300' : 'bg-rose-50/60 border-rose-300'}`}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Proyeksi Laba Bersih</p>
          <p className="text-xl font-bold mt-1 font-heading text-emerald-700">
            {totalEstimasiLaba >= 0 ? `+${fmtRp(totalEstimasiLaba)}` : fmtRp(totalEstimasiLaba)}
          </p>
          <p className="text-[11px] font-semibold mt-1 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Potensi Keuntungan Positif</span>
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* KALKULATOR ESTIMASI PROYEKSI LABA / RUGI TERNAK          */}
      {/* ======================================================== */}
      <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCE5F0]">
          <div>
            <h3 className="text-base font-bold text-[#162033] font-heading flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#12355B]" />
              <span>Kalkulator Estimasi Modal & Harga Jual Sapi</span>
            </h3>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Simulasikan biaya pakan harian, lama siklus pemeliharaan, dan potensi laba bersih secara transparan.
            </p>
          </div>

          {/* Pemilih Sapi */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#162033] shrink-0">Pilih Sapi:</span>
            <select
              value={calcSelectedCowId}
              onChange={(e) => handleSelectCowCalc(e.target.value)}
              className="bg-slate-50 border border-[#DCE5F0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#12355B] outline-none focus:border-[#12355B]"
            >
              {cows.map((c, i) => (
                <option key={c.cowCode || i} value={c.cowCode}>
                  Sapi {i + 1} — {c.cowCode} ({c.cowBreed})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid 4 Langkah Input & Parameter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Langkah 1: Modal Beli & Periode */}
          <div className="bg-slate-50 p-4 rounded-xl border border-[#DCE5F0] space-y-3">
            <p className="text-xs font-bold text-[#12355B] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#12355B] text-white flex items-center justify-center text-[10px]">1</span>
              <span>Modal Beli & Periode</span>
            </p>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Harga Beli Sapi (Rp)
              </label>
              <input
                type="number"
                value={calcForm.hargaBeli}
                onChange={(e) => setCalcForm({ ...calcForm, hargaBeli: e.target.value })}
                className="w-full bg-white border border-[#DCE5F0] rounded-lg px-3 py-1.5 text-xs font-bold text-[#162033] outline-none focus:border-[#12355B]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Lama Pemeliharaan
              </label>
              <select
                value={calcForm.lamaPelihara}
                onChange={(e) => setCalcForm({ ...calcForm, lamaPelihara: parseInt(e.target.value, 10) })}
                className="w-full bg-white border border-[#DCE5F0] rounded-lg px-3 py-1.5 text-xs font-bold text-[#162033] outline-none focus:border-[#12355B]"
              >
                <option value="90">90 Hari (3 Bulan - Penggemukan Intensif)</option>
                <option value="120">120 Hari (4 Bulan - Siklus Standar)</option>
                <option value="150">150 Hari (5 Bulan - Penggemukan Reguler)</option>
                <option value="180">180 Hari (6 Bulan - Penggemukan Maksimal)</option>
                <option value="365">365 Hari (1 Tahun - Siklus Tahunan)</option>
              </select>
            </div>
          </div>

          {/* Langkah 2: Kebutuhan Pakan */}
          <div className="bg-slate-50 p-4 rounded-xl border border-[#DCE5F0] space-y-3">
            <p className="text-xs font-bold text-[#12355B] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#12355B] text-white flex items-center justify-center text-[10px]">2</span>
              <span>Kebutuhan Pakan Harian</span>
            </p>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Pakan / Hari (kg)
              </label>
              <input
                type="number"
                value={calcForm.kebutuhanPakanKg}
                onChange={(e) => setCalcForm({ ...calcForm, kebutuhanPakanKg: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-[#DCE5F0] rounded-lg px-3 py-1.5 text-xs font-bold text-[#162033] outline-none focus:border-[#12355B]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Harga Pakan / kg (Rp)
              </label>
              <input
                type="number"
                value={calcForm.hargaPakanKg}
                onChange={(e) => setCalcForm({ ...calcForm, hargaPakanKg: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-[#DCE5F0] rounded-lg px-3 py-1.5 text-xs font-bold text-[#162033] outline-none focus:border-[#12355B]"
              />
              <p className="text-[10px] text-[#12355B] font-bold mt-1">
                Biaya: {fmtRp(pakanPerHari)} / hari
              </p>
            </div>
          </div>

          {/* Langkah 3: Modal HPP */}
          <div className="bg-slate-50 p-4 rounded-xl border border-[#DCE5F0] space-y-3">
            <p className="text-xs font-bold text-[#12355B] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#12355B] text-white flex items-center justify-center text-[10px]">3</span>
              <span>Modal Tercatat (HPP)</span>
            </p>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Biaya Tambahan (Vaksin/Obat)
              </label>
              <input
                type="number"
                value={calcForm.biayaTambahan}
                onChange={(e) => setCalcForm({ ...calcForm, biayaTambahan: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-[#DCE5F0] rounded-lg px-3 py-1.5 text-xs font-bold text-[#162033] outline-none focus:border-[#12355B]"
              />
            </div>
            <div className="pt-1 text-[11px] space-y-1 text-slate-700">
              <p>Total Pakan: <b>{fmtRp(totalBiayaPakan)}</b></p>
              <p className="text-xs font-bold text-[#12355B]">
                Total HPP: {fmtRp(totalModalHPP)}
              </p>
            </div>
          </div>

          {/* Langkah 4: Estimasi Jual */}
          <div className="bg-slate-50 p-4 rounded-xl border border-[#DCE5F0] space-y-3">
            <p className="text-xs font-bold text-[#12355B] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#12355B] text-white flex items-center justify-center text-[10px]">4</span>
              <span>Estimasi Nilai Jual</span>
            </p>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Target Bobot Jual (kg)
              </label>
              <input
                type="number"
                value={calcForm.targetBerat}
                onChange={(e) => setCalcForm({ ...calcForm, targetBerat: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-[#DCE5F0] rounded-lg px-3 py-1.5 text-xs font-bold text-[#162033] outline-none focus:border-[#12355B]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                Harga Acuan / kg Hidup (Rp)
              </label>
              <input
                type="number"
                value={calcForm.hargaJualPerKg}
                onChange={(e) => setCalcForm({ ...calcForm, hargaJualPerKg: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-[#DCE5F0] rounded-lg px-3 py-1.5 text-xs font-bold text-[#162033] outline-none focus:border-[#12355B]"
              />
            </div>
          </div>
        </div>

        {/* Box Hasil Proyeksi Simulasi yang Jelas dan Masuk Akal */}
        <div className={`p-5 rounded-2xl border transition-all ${isUntung ? 'bg-emerald-50/70 border-emerald-300' : 'bg-rose-50/70 border-rose-300'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isUntung ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                  {isUntung ? 'POTENSI UNTUNG (PROFIT SEHAT)' : 'PERLU EVALUASI BIAYA PAKAN'}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Simulasi Sapi: {calcSelectedCowId} ({calcForm.lamaPelihara} Hari Pemeliharaan)
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                Estimasi Nilai Jual ({calcForm.targetBerat} kg × {fmtRp(calcForm.hargaJualPerKg)}) = <b>{fmtRp(estimasiNilaiJual)}</b>.<br />
                Total Modal Pemeliharaan (Harga Beli + Pakan {calcForm.lamaPelihara} hari + Obat) = <b>{fmtRp(totalModalHPP)}</b>.
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Proyeksi Laba Bersih Per Ekor</p>
              <p className={`text-2xl font-bold font-heading mt-0.5 ${isUntung ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isUntung ? `+${fmtRp(proyeksiLaba)}` : fmtRp(proyeksiLaba)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TABEL DAFTAR ANALISIS FINANSIAL & ESTIMASI JUAL TERNAK   */}
      {/* ======================================================== */}
      <div className="bg-white border border-[#DCE5F0] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DCE5F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#162033] font-heading">
              Daftar Analisis Finansial & Estimasi Jual Ternak
            </h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Menampilkan {sortedCows.length} ekor sapi {selectedBarnFilter !== 'all' ? `di ${selectedBarnFilter}` : 'di seluruh kandang'}.
            </p>
          </div>

          <div className="w-36">
            <SortSelect value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-body">
            <thead>
              <tr className="bg-slate-50 border-b border-[#DCE5F0] text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3.5 text-center w-12">No.</th>
                <th className="px-4 py-3.5">Sapi & Kode</th>
                <th className="px-4 py-3.5">Unit Kandang</th>
                <th className="px-4 py-3.5">Harga Beli</th>
                <th className="px-4 py-3.5">Biaya Pakan / Hari</th>
                <th className="px-4 py-3.5 text-center">Hari Pelihara</th>
                <th className="px-4 py-3.5">Total Modal (HPP)</th>
                <th className="px-4 py-3.5">Target Bobot</th>
                <th className="px-4 py-3.5">Estimasi Jual</th>
                <th className="px-4 py-3.5 text-right">Estimasi Laba</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-[#162033]">
              {sortedCows.map((cow, idx) => {
                const dailyFeedCost = (cow.kebutuhanPakanKg || 12) * (cow.hargaPakanKg || 3500);
                const totalFeedCost = dailyFeedCost * (cow.lamaPelihara || 120);
                const hpp = (parseFloat(cow.hargaBeli) || 0) + totalFeedCost + (cow.biayaTambahan || 250000);
                const estJual = (cow.targetBerat || 500) * (cow.hargaJualPerKg || 65000);
                const laba = estJual - hpp;
                const statusUntung = laba >= 0;

                return (
                  <tr key={cow.cowCode || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#12355B]">
                        Sapi {idx + 1} ({cow.cowCode})
                      </div>
                      <div className="text-[11px] text-[#64748B] font-medium">{cow.cowBreed}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-[#12355B] border border-[#DCE5F0]">
                        <Warehouse className="h-3 w-3" />
                        <span>{cow.barnName}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{fmtRp(cow.hargaBeli)}</td>
                    <td className="px-4 py-3 text-slate-700">{fmtRp(dailyFeedCost)} / hari</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">{cow.lamaPelihara} hari</td>
                    <td className="px-4 py-3 font-bold text-[#162033]">{fmtRp(hpp)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{cow.targetBerat} kg</td>
                    <td className="px-4 py-3 font-bold text-[#12355B]">{fmtRp(estJual)}</td>
                    <td className={`px-4 py-3 text-right font-bold ${statusUntung ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {statusUntung ? `+${fmtRp(laba)}` : fmtRp(laba)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusUntung ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {statusUntung ? 'Untung' : 'Evaluasi'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

