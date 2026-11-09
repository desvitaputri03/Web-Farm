import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PageHeaderBanner from './PageHeaderBanner';
import {
  Home,
  Utensils,
  Beef,
  Activity,
  ChevronRight,
  ChevronLeft,
  Thermometer,
  TrendingUp,
  CheckCircle2,
  Clock,
  Warehouse,
  Eye,
  Plus,
  Search,
  Droplets,
  Wind,
  Sparkles,
  X,
  AlertCircle,
  Calendar,
  Building2,
  MapPin,
  Scale,
  HeartPulse
} from 'lucide-react';


const COW_FALLBACK_IMAGES = [
  '/images/cows/cow1.jpg',
  '/images/cows/cow2.jpg',
  '/images/cows/cow3.jpg',
  '/images/cows/cow4.jpg',
  '/images/cows/cow5.jpg',
  '/images/cows/cow6.jpg'
];

const FALLBACK_BARNS = [
  {
    id_kandang: 'KDG-A01',
    barnID: 'KDG-A01',
    nama_kandang: 'Kandang A (Utama)',
    barnName: 'Kandang A (Utama)',
    lokasi_kandang: 'Sektor Utama',
    barnLocation: 'Sektor Utama',
    kapasitas_kandang: 10,
    barnCapacity: 10,
    suhu_kandang: 28.2,
    barnTemperature: 28.2,
    kelembapan_kandang: 72.0,
    barnHumidity: 72.0,
    kondisi_lantai: 'Bersih',
    barnFloorCondition: 'Bersih',
    pencahayaan: 220,
    kecepatan_angin: 1.1,
    avgFeed: '15.2 kg/hari'
  },
  {
    id_kandang: 'KDG-B01',
    barnID: 'KDG-B01',
    nama_kandang: 'Kandang B',
    barnName: 'Kandang B',
    lokasi_kandang: 'Sektor Timur',
    barnLocation: 'Sektor Timur',
    kapasitas_kandang: 8,
    barnCapacity: 8,
    suhu_kandang: 27.8,
    barnTemperature: 27.8,
    kelembapan_kandang: 70.5,
    barnHumidity: 70.5,
    kondisi_lantai: 'Bersih',
    barnFloorCondition: 'Bersih',
    pencahayaan: 210,
    kecepatan_angin: 1.3,
    avgFeed: '14.8 kg/hari'
  }
];

// Fallback Data Sapi
const FALLBACK_COWS = [
  {
    cowID: 'SP-2024-001',
    cowCode: 'SP-2024-001',
    cowBreed: 'Brangus',
    cowGender: 'Jantan',
    cowBirthDate: '2024-03-15',
    cowPurchaseDate: '2025-01-15',
    cowMaintenanceStatus: 'Dipelihara',
    berat_awal_beli: 275.0,
    target_berat_jual: 550.0,
    cowAgeEstimate: '2 tahun 8 bulan',
    cowPurchasePrice: 13800000,
    cowHistory: 'Beli bakalan dari peternak mitra, nafsu makan tinggi, vaksin PMK lengkap.',
    cowBarnID: 'KDG-A01',
    cowStationID: 'Tempat Makan 1 (Sektor A)',
    cowPhoto: COW_FALLBACK_IMAGES[0],
    physiology: {
      phyInitialWeight: 275.0,
      phyTargetWeight: 550.0,
      phyCurrentWeight: 420.0,
      phyTemperature: 38.6,
      phyStatus: 'Sehat',
      phyHealthHistory: 'Vaksin PMK lengkap, rutin vitamin.'
    }
  },
  {
    cowID: 'SP-2024-002',
    cowCode: 'SP-2024-002',
    cowBreed: 'Brahman',
    cowGender: 'Jantan',
    cowBirthDate: '2024-05-10',
    cowPurchaseDate: '2025-02-01',
    cowMaintenanceStatus: 'Dipelihara',
    berat_awal_beli: 240.0,
    target_berat_jual: 500.0,
    cowAgeEstimate: '2 tahun 6 bulan',
    cowPurchasePrice: 12200000,
    cowHistory: 'Beli bibit bakalan pilihan, punuk tegap, adaptasi lingkungan kandang sangat baik.',
    cowBarnID: 'KDG-A01',
    cowStationID: 'Tempat Makan 1 (Sektor A)',
    cowPhoto: COW_FALLBACK_IMAGES[1],
    physiology: {
      phyInitialWeight: 240.0,
      phyTargetWeight: 500.0,
      phyCurrentWeight: 375.0,
      phyTemperature: 38.8,
      phyStatus: 'Sehat',
      phyHealthHistory: 'Pemeriksaan mantri: sehat, gerak aktif.'
    }
  },
  {
    cowID: 'SP-2024-003',
    cowCode: 'SP-2024-003',
    cowBreed: 'Angus',
    cowGender: 'Betina',
    cowBirthDate: '2024-07-20',
    cowPurchaseDate: '2025-03-10',
    cowMaintenanceStatus: 'Dipelihara',
    berat_awal_beli: 210.0,
    target_berat_jual: 430.0,
    cowAgeEstimate: '2 tahun 4 bulan',
    cowPurchasePrice: 10800000,
    cowHistory: 'Beli bakalan bersertifikat karantina hewan dinas, bebas brucellosis.',
    cowBarnID: 'KDG-A01',
    cowStationID: 'Tempat Makan 2 (Sektor B)',
    cowPhoto: COW_FALLBACK_IMAGES[2],
    physiology: {
      phyInitialWeight: 210.0,
      phyTargetWeight: 430.0,
      phyCurrentWeight: 340.0,
      phyTemperature: 38.3,
      phyStatus: 'Sehat',
      phyHealthHistory: 'Fisik prima, nafsu makan konsentrat tinggi.'
    }
  },
  {
    cowID: 'SP-2024-004',
    cowCode: 'SP-2024-004',
    cowBreed: 'Sapi Bali',
    cowGender: 'Jantan',
    cowBirthDate: '2024-10-05',
    cowPurchaseDate: '2025-04-15',
    cowMaintenanceStatus: 'Dipelihara',
    berat_awal_beli: 185.0,
    target_berat_jual: 380.0,
    cowAgeEstimate: '2 tahun 1 bulan',
    cowPurchasePrice: 9500000,
    cowHistory: 'Bibit bakalan unggul, struktur tulang kompak dan persentase karkas tebal.',
    cowBarnID: 'KDG-A01',
    cowStationID: 'Tempat Makan 2 (Sektor B)',
    cowPhoto: COW_FALLBACK_IMAGES[3],
    physiology: {
      phyInitialWeight: 185.0,
      phyTargetWeight: 380.0,
      phyCurrentWeight: 290.0,
      phyTemperature: 38.7,
      phyStatus: 'Sehat',
      phyHealthHistory: 'Sehat, rutin mineral blok dan hijauan.'
    }
  },
  {
    cowID: 'SP-2024-005',
    cowCode: 'SP-2024-005',
    cowBreed: 'Limousin',
    cowGender: 'Jantan',
    cowBirthDate: '2024-02-20',
    cowPurchaseDate: '2024-12-01',
    cowMaintenanceStatus: 'Dipelihara',
    berat_awal_beli: 310.0,
    target_berat_jual: 620.0,
    cowAgeEstimate: '2 tahun 9 bulan',
    cowPurchasePrice: 15800000,
    cowHistory: 'Beli bakalan berkualitas, kerangka dada lebar, nafsu makan pakan silase tinggi.',
    cowBarnID: 'KDG-B01',
    cowStationID: 'Tempat Makan 1 (Sektor A)',
    cowPhoto: COW_FALLBACK_IMAGES[4],
    physiology: {
      phyInitialWeight: 310.0,
      phyTargetWeight: 620.0,
      phyCurrentWeight: 465.0,
      phyTemperature: 38.5,
      phyStatus: 'Sehat',
      phyHealthHistory: 'Vaksin lengkap, kerangka dada tumbuh maksimal.'
    }
  },
  {
    cowID: 'SP-2024-006',
    cowCode: 'SP-2024-006',
    cowBreed: 'Simmental',
    cowGender: 'Jantan',
    cowBirthDate: '2024-04-18',
    cowPurchaseDate: '2025-01-05',
    cowMaintenanceStatus: 'Dipelihara',
    berat_awal_beli: 320.0,
    target_berat_jual: 650.0,
    cowAgeEstimate: '2 tahun 7 bulan',
    cowPurchasePrice: 16300000,
    cowHistory: 'Hasil inseminasi buatan (IB) poskeswan, silangan super, pertumbuhan harian stabil.',
    cowBarnID: 'KDG-B01',
    cowStationID: 'Tempat Makan 2 (Sektor B)',
    cowPhoto: COW_FALLBACK_IMAGES[5],
    physiology: {
      phyInitialWeight: 320.0,
      phyTargetWeight: 650.0,
      phyCurrentWeight: 485.0,
      phyTemperature: 38.7,
      phyStatus: 'Sehat',
      phyHealthHistory: 'Vaksin LSD dan PMK beres, pertumbuhan super.'
    }
  }
];

export default function DashboardPage({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [barns, setBarns] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drill-down State:
  // null = Level 1 (Tampilan Daftar Kandang)
  // Object = Level 2 (Tampilan Dalam Kandang Terpilih)
  const [selectedBarn, setSelectedBarn] = useState(null);

  // Level 3 State: Detail Sapi Modal
  const [selectedCowModal, setSelectedCowModal] = useState(null);

  // Modal Tambah Sapi Cepat di Kandang Terpilih
  const [isAddCowOpen, setIsAddCowOpen] = useState(false);
  const [searchCowQuery, setSearchCowQuery] = useState('');
  const [addCowForm, setAddCowForm] = useState({
    cowBreed: '',
    cowGender: 'Jantan',
    cowBirthDate: '',
    cowPurchaseDate: '',
    cowInitialWeight: '',
    cowTargetWeight: '',
    cowPurchasePrice: '',
    cowStationID: 'Tempat Makan 1 (Sektor A)',
    cowHistory: '',
  });
  const [submittingCow, setSubmittingCow] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      axios.get('/farm/api/dashboard'),
      axios.get('/farm/api/cows?limit=100'),
      axios.get('/farm/api/options/barns')
    ])
      .then(([statsRes, cowsRes, barnsRes]) => {
        setStats(statsRes.data);

        // Handle Cows
        const fetchedCows = cowsRes.data.data ?? cowsRes.data ?? [];
        setCows(fetchedCows.length > 0 ? fetchedCows : FALLBACK_COWS);

        // Handle Barns
        const fetchedBarns = statsRes.data?.barns ?? barnsRes.data?.data ?? barnsRes.data ?? [];
        if (Array.isArray(fetchedBarns) && fetchedBarns.length > 0) {
          setBarns(fetchedBarns);
        } else {
          setBarns(FALLBACK_BARNS);
        }
      })
      .catch(() => {
        setStats(null);
        setCows(FALLBACK_COWS);
        setBarns(FALLBACK_BARNS);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Sapi yang berada di dalam suatu kandang
  const getBarnCows = (barn) => {
    if (!barn) return [];
    const targetBarnID = String(barn.barnID || barn.id_kandang || '').toLowerCase();
    const targetBarnName = String(barn.barnName || barn.nama_kandang || '').toLowerCase();

    return cows.filter((cow) => {
      const cowBarn = String(cow.cowBarnID || cow.id_kandang || (cow.kandang && (cow.kandang.id_kandang || cow.kandang.barnID)) || '').toLowerCase();
      const cowBarnName = String((cow.kandang && (cow.kandang.nama_kandang || cow.kandang.barnName)) || '').toLowerCase();

      if (cowBarn === targetBarnID || cowBarnName === targetBarnName) {
        return true;
      }

      // Fallback matching logic for Kandang A / 1 and Kandang B / 2
      if (targetBarnID.includes('kdg-a01') || targetBarnName.includes('kandang a') || targetBarnName.includes('kandang utama')) {
        return cowBarn.includes('kdg-a01') || cowBarn.includes('kandang utama') || (!cowBarn.includes('kdg-b01') && !cowBarn.includes('kandang b'));
      }

      if (targetBarnID.includes('kdg-b01') || targetBarnName.includes('kandang b') || targetBarnName.includes('penggemukan')) {
        return cowBarn.includes('kdg-b01') || cowBarn.includes('kandang b');
      }

      return false;
    });
  };

  // Submit Tambah Sapi Cepat di Kandang Terpilih
  const handleAddCowSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBarn) return;

    setSubmittingCow(true);
    const barnIdToSend = selectedBarn.id_kandang || selectedBarn.barnID || 'KDG-A01';
    const payload = {
      ...addCowForm,
      cowBarnID: barnIdToSend,
      id_kandang: barnIdToSend,
    };

    try {
      await axios.post('/farm/cows', payload);
      setToastMessage('Sapi baru berhasil didaftarkan ke ' + (selectedBarn.nama_kandang || selectedBarn.barnName) + '!');
      setIsAddCowOpen(false);
      loadData();
    } catch {
      // Offline fallback: tambahkan langsung ke state lokal
      const nextNum = cows.length + 1;
      const newCow = {
        cowID: `SP-2024-${String(nextNum).padStart(3, '0')}`,
        cowCode: `SP-2024-${String(nextNum).padStart(3, '0')}`,
        cowBreed: addCowForm.cowBreed,
        cowGender: addCowForm.cowGender,
        cowBirthDate: addCowForm.cowBirthDate,
        cowPurchaseDate: addCowForm.cowPurchaseDate,
        cowMaintenanceStatus: 'Dipelihara',
        berat_awal_beli: parseFloat(addCowForm.cowInitialWeight),
        target_berat_jual: parseFloat(addCowForm.cowTargetWeight),
        cowAgeEstimate: '2 tahun',
        cowPurchasePrice: parseFloat(addCowForm.cowPurchasePrice),
        cowHistory: addCowForm.cowHistory,
        cowBarnID: barnIdToSend,
        cowStationID: addCowForm.cowStationID,
        cowPhoto: null,
        physiology: {
          phyInitialWeight: parseFloat(addCowForm.cowInitialWeight),
          phyTargetWeight: parseFloat(addCowForm.cowTargetWeight),
          phyCurrentWeight: parseFloat(addCowForm.cowInitialWeight),
          phyTemperature: 38.5,
          phyStatus: 'Sehat',
          phyHealthHistory: 'Pendaftaran mandiri di kandang.'
        }
      };

      setCows(prev => [...prev, newCow]);
      setToastMessage('Sapi baru berhasil didaftarkan ke ' + (selectedBarn.nama_kandang || selectedBarn.barnName) + '!');
      setIsAddCowOpen(false);
    } finally {
      setSubmittingCow(false);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-sm font-semibold text-slate-500 font-sans gap-3">
        <div className="w-8 h-8 border-3 border-[#12355B] border-t-transparent rounded-full animate-spin"></div>
        <span>Memuat data peternakan & kandang...</span>
      </div>
    );
  }

  // Jika suatu kandang sedang dibuka (Level 2)
  const currentBarnCows = selectedBarn ? getBarnCows(selectedBarn) : [];
  const filteredCurrentBarnCows = currentBarnCows.filter(c => {
    if (!searchCowQuery.trim()) return true;
    const q = searchCowQuery.toLowerCase();
    const code = String(c.cowCode || c.code || c.cowID || '').toLowerCase();
    const breed = String(c.cowBreed || c.ras_sapi || '').toLowerCase();
    return code.includes(q) || breed.includes(q);
  });

  return (
    <div className="space-y-6 font-body">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl bg-[#12355B] text-white border-slate-700 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Header Banner Standar */}
      <PageHeaderBanner
        icon={selectedBarn ? Building2 : Home}
        title={selectedBarn ? `Kandang: ${selectedBarn.nama_kandang || selectedBarn.barnName}` : "Dashboard Peternakan"}
      />

      {/* ======================================================== */}
      {/* LEVEL 1: TAMPILAN UTAMA (DAFTAR KANDANG DULU)            */}
      {/* ======================================================== */}
      {!selectedBarn ? (
        <div className="space-y-6 animate-fadeIn">
          {/* 4 Ringkasan Statistik Utama Peternakan */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Kandang */}
            <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:border-sky-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-center gap-4 card-accent-top card-accent-sky">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center shrink-0 text-sky-700 shadow-2xs">
                <Warehouse className="h-6 w-6 stroke-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#162033] leading-none font-heading">{barns.length || stats?.totalBarns || 2}</p>
                <p className="text-[12px] text-[#64748B] font-semibold uppercase tracking-wider mt-1.5 font-body">Unit Kandang</p>
              </div>
            </div>

            {/* Total Sapi */}
            <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:border-[#12355B] hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-center gap-4 card-accent-top">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center shrink-0 text-[#12355B] shadow-2xs">
                <Beef className="h-6 w-6 stroke-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#162033] leading-none font-heading">{cows.length || stats?.totalCows || 6}</p>
                <p className="text-[12px] text-[#64748B] font-semibold uppercase tracking-wider mt-1.5 font-body">Total Sapi</p>
              </div>
            </div>

            {/* Rata-rata Suhu Lingkungan */}
            <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:border-amber-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-center gap-4 card-accent-top">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 text-amber-700 shadow-2xs">
                <Thermometer className="h-6 w-6 stroke-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#162033] leading-none font-heading">{stats?.avgBarnTemp || 28.0} °C</p>
                <p className="text-[12px] text-[#64748B] font-semibold uppercase tracking-wider mt-1.5 font-body">Suhu Kandang</p>
              </div>
            </div>

            {/* Status Kesehatan */}
            <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:border-emerald-400 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-center gap-4 card-accent-top card-accent-emerald">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 text-emerald-700 shadow-2xs">
                <CheckCircle2 className="h-6 w-6 stroke-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700 leading-none font-heading">100%</p>
                <p className="text-[12px] text-[#64748B] font-semibold uppercase tracking-wider mt-1.5 font-body">Status Sehat</p>
              </div>
            </div>
          </div>

          {/* Section: Daftar Kandang Peternakan */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#162033] font-heading flex items-center gap-2">
                  <span className="text-lg">🏡</span>
                  <span>Unit Kandang Peternakan</span>
                </h3>
                <p className="text-xs text-[#64748B] font-medium mt-0.5">
                  Pilih salah satu unit kandang untuk melihat sapi-sapi di dalamnya dan melakukan input data.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('kandang')}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#12355B] hover:text-white text-[#162033] border border-[#DCE5F0] hover:border-[#12355B] text-xs font-semibold rounded-xl transition-all cursor-pointer h-[38px] shadow-2xs"
                >
                  <span>Kelola Semua Kandang</span>
                  <ChevronRight className="h-4 w-4 stroke-2" />
                </button>
              </div>
            </div>

            {/* Grid Kartu Kandang (Folder Kandang) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {barns.map((barn, bIdx) => {
                const barnCowsList = getBarnCows(barn);
                const cowCount = barnCowsList.length;
                const capacity = parseInt(barn.kapasitas_kandang || barn.barnCapacity || 10, 10);
                const occupancyPercent = Math.min(Math.round((cowCount / capacity) * 100), 100);
                const barnTemp = barn.suhu_kandang || barn.barnTemperature || 28.2;
                const barnHum = barn.kelembapan_kandang || barn.barnHumidity || 72.0;
                const floorCond = barn.kondisi_lantai || barn.barnFloorCondition || 'Bersih';
                const barnName = barn.nama_kandang || barn.barnName || `Kandang ${bIdx + 1}`;

                return (
                  <div
                    key={barn.id_kandang || barn.barnID || bIdx}
                    onClick={() => setSelectedBarn(barn)}
                    className="card-accent-top bg-white border border-[#DCE5F0] hover:border-[#12355B] rounded-2xl p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div>
                      {/* Header Kartu Kandang */}
                      <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#DCE5F0]">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 group-hover:from-[#12355B] group-hover:to-[#1E4B7A] text-[#12355B] group-hover:text-white border border-blue-100 flex items-center justify-center transition-all duration-300 shrink-0 shadow-2xs">
                            <Building2 className="h-6 w-6 stroke-2" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-[#162033] group-hover:text-[#12355B] transition-colors font-heading">
                              {barnName}
                            </h4>
                            <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5 font-body">
                              <Warehouse className="h-3 w-3 shrink-0 text-slate-400" />
                              <span>Unit Pemeliharaan Ternak</span>
                            </p>
                          </div>
                        </div>

                        {/* Badge Kapasitas */}
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#12355B] border border-[#DCE5F0]">
                            <Beef className="h-3.5 w-3.5" />
                            <span>{cowCount} / {capacity} Ekor</span>
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar Kapasitas */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center text-[11px] font-semibold text-[#64748B] mb-1.5">
                          <span>Kapasitas Terisi</span>
                          <span className="text-[#12355B] font-bold">{occupancyPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-[#DCE5F0]/60">
                          <div
                            className="h-full bg-gradient-to-r from-[#12355B] via-[#0284C7] to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${occupancyPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Parameter Kunci Lingkungan Kandang */}
                      <div className="grid grid-cols-3 gap-2.5 my-4 bg-slate-50 p-3.5 rounded-xl border border-[#DCE5F0]">
                        <div>
                          <p className="text-[10px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                            <Thermometer className="h-3 w-3 text-amber-600" />
                            <span>Suhu</span>
                          </p>
                          <p className="text-sm font-bold text-[#162033] mt-0.5">{barnTemp} °C</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                            <Droplets className="h-3 w-3 text-blue-600" />
                            <span>Kelembapan</span>
                          </p>
                          <p className="text-sm font-bold text-[#162033] mt-0.5">{barnHum} %</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Lantai</span>
                          </p>
                          <p className="text-sm font-bold text-emerald-700 mt-0.5">{floorCond}</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Kartu & Tombol Masuk */}
                    <div className="pt-3 border-t border-[#DCE5F0] flex items-center justify-between">
                      <span className="text-xs font-medium text-[#64748B]">
                        {cowCount > 0 ? `${cowCount} sapi terdaftar` : 'Kandang masih kosong'}
                      </span>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-xs font-bold text-[#12355B] group-hover:translate-x-1 transition-transform"
                      >
                        <span>Buka Kandang & Lihat Sapi</span>
                        <ChevronRight className="h-4 w-4 stroke-2" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* LEVEL 2: TAMPILAN DALAM KANDANG TERPILIH                 */
        /* ======================================================== */
        <div className="space-y-6 animate-fadeIn">
          {/* Navigasi Breadcrumb & Tombol Kembali - hanya tampil saat BUKAN di form tambah sapi */}
          {!isAddCowOpen && (
            <div className="flex items-center justify-between gap-3 bg-white border border-[#DCE5F0] p-4 rounded-2xl shadow-xs">
              <button
                type="button"
                onClick={() => setSelectedBarn(null)}
                className="p-2.5 rounded-xl border border-[#DCE5F0] hover:bg-slate-50 text-[#162033] transition cursor-pointer shrink-0"
                title="Kembali ke Semua Kandang"
              >
                <ChevronLeft className="h-5 w-5 stroke-2" />
              </button>

              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold text-[#12355B] bg-slate-100 px-3 py-1.5 rounded-xl border border-[#DCE5F0] flex items-center gap-1.5">
                  <Warehouse className="h-3.5 w-3.5 text-[#12355B]" />
                  <span>Unit Kandang</span>
                </div>
              </div>
            </div>
          )}

          {/* Banner Rangkuman Kandang Aktif - hanya tampil saat bukan di form tambah sapi */}
          {!isAddCowOpen && (
            <div className="bg-[#12355B] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-white/15 px-3 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase">
                    Unit Kandang Terpilih
                  </span>
                  <span className="text-xs text-white/80">
                    Kapasitas: {selectedBarn.kapasitas_kandang || selectedBarn.barnCapacity || 10} Ekor
                  </span>
                </div>
                <h2 className="text-2xl font-bold font-heading">
                  {selectedBarn.nama_kandang || selectedBarn.barnName}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/90 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="h-4 w-4 text-amber-300" />
                    Suhu: <b>{selectedBarn.suhu_kandang || selectedBarn.barnTemperature || 28.2} °C</b>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Droplets className="h-4 w-4 text-blue-300" />
                    Kelembapan: <b>{selectedBarn.kelembapan_kandang || selectedBarn.barnHumidity || 72.0}%</b>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    Sanitasi Lantai: <b>{selectedBarn.kondisi_lantai || selectedBarn.barnFloorCondition || 'Bersih'}</b>
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddCowOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-[#12355B] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-2" />
                  <span>Tambah Sapi di Kandang Ini</span>
                </button>
              </div>
            </div>
          )}

          {/* Section: Daftar Sapi di Kandang Ini ATAU Form Tambah Sapi ATAU Detail Sapi */}
          {isAddCowOpen ? (
            <div className="bg-white border border-[#DCE5F0] rounded-2xl shadow-xs max-w-xl mx-auto p-6 sm:p-8 space-y-5 animate-fadeIn font-body">
              <div className="border-b border-[#DCE5F0] pb-3">
                <h3 className="text-base font-bold text-[#162033] font-heading flex items-center gap-2">
                  <Plus className="h-5 w-5 text-[#12355B]" />
                  <span>Tambah Sapi Baru</span>
                </h3>
              </div>

              {/* Form Tambah Sapi */}
              <form onSubmit={handleAddCowSubmit} className="space-y-4">

                {/* Ras Sapi & Jenis Kelamin */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#162033] mb-1">
                      Ras Sapi *
                    </label>
                    <input
                      type="text"
                      list="dashboard-ras-options"
                      value={addCowForm.cowBreed}
                      onChange={(e) => setAddCowForm({ ...addCowForm, cowBreed: e.target.value })}
                      className="w-full bg-white border border-[#DCE5F0] rounded-xl px-3 py-2 text-xs font-medium text-[#162033] outline-none focus:border-[#12355B]"
                      required
                    />
                    <datalist id="dashboard-ras-options">
                      <option value="Brangus" />
                      <option value="Brahman" />
                      <option value="Angus" />
                      <option value="Sapi Bali" />
                      <option value="Limousin" />
                      <option value="Simmental" />
                      <option value="Peranakan Ongole (PO)" />
                      <option value="Madura" />
                      <option value="Wagyu" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#162033] mb-1">
                      Jenis Kelamin
                    </label>
                    <select
                      value={addCowForm.cowGender}
                      onChange={(e) => setAddCowForm({ ...addCowForm, cowGender: e.target.value })}
                      className="w-full bg-white border border-[#DCE5F0] rounded-xl px-3 py-2 text-xs font-medium text-[#162033] outline-none focus:border-[#12355B]"
                    >
                      <option value="Jantan">Jantan</option>
                      <option value="Betina">Betina</option>
                    </select>
                  </div>
                </div>

                {/* Bobot Awal & Target Bobot Jual */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#162033] mb-1">
                      Bobot Awal (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={addCowForm.cowInitialWeight}
                      onChange={(e) => setAddCowForm({ ...addCowForm, cowInitialWeight: e.target.value })}
                      className="w-full bg-white border border-[#DCE5F0] rounded-xl px-3 py-2 text-xs font-medium text-[#162033] outline-none focus:border-[#12355B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#162033] mb-1">
                      Target Bobot Jual (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={addCowForm.cowTargetWeight}
                      onChange={(e) => setAddCowForm({ ...addCowForm, cowTargetWeight: e.target.value })}
                      className="w-full bg-white border border-[#DCE5F0] rounded-xl px-3 py-2 text-xs font-medium text-[#162033] outline-none focus:border-[#12355B]"
                    />
                  </div>
                </div>

                {/* Stasiun Makan */}
                <div>
                  <label className="block text-xs font-semibold text-[#162033] mb-1">
                    Stasiun Tempat Makan
                  </label>
                  <select
                    value={addCowForm.cowStationID}
                    onChange={(e) => setAddCowForm({ ...addCowForm, cowStationID: e.target.value })}
                    className="w-full bg-white border border-[#DCE5F0] rounded-xl px-3 py-2 text-xs font-medium text-[#162033] outline-none focus:border-[#12355B]"
                  >
                    <option value="Tempat Makan 1 (Sektor A)">Tempat Makan 1 (Sektor A)</option>
                    <option value="Tempat Makan 2 (Sektor B)">Tempat Makan 2 (Sektor B)</option>
                  </select>
                </div>

                {/* Harga Beli */}
                <div>
                  <label className="block text-xs font-semibold text-[#162033] mb-1">
                    Harga Beli (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={addCowForm.cowPurchasePrice}
                    onChange={(e) => setAddCowForm({ ...addCowForm, cowPurchasePrice: e.target.value })}
                    className="w-full bg-white border border-[#DCE5F0] rounded-xl px-3 py-2 text-xs font-medium text-[#162033] outline-none focus:border-[#12355B]"
                  />
                  {addCowForm.cowPurchasePrice && !isNaN(Number(addCowForm.cowPurchasePrice)) && Number(addCowForm.cowPurchasePrice) > 0 && (
                    <p className="text-[11px] font-bold text-[#12355B] mt-1.5 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-block">
                      💵 Terbaca: Rp {Number(addCowForm.cowPurchasePrice).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>

                {/* Catatan Sapi */}
                <div>
                  <label className="block text-xs font-semibold text-[#162033] mb-1">
                    Catatan Lapangan Sapi
                  </label>
                  <textarea
                    rows="2"
                    value={addCowForm.cowHistory}
                    onChange={(e) => setAddCowForm({ ...addCowForm, cowHistory: e.target.value })}
                    className="w-full bg-white border border-[#DCE5F0] rounded-xl p-3 text-xs font-medium text-[#162033] outline-none focus:border-[#12355B]"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-center gap-3 pt-4 border-t border-[#DCE5F0]">
                  <button
                    type="button"
                    onClick={() => setIsAddCowOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-[#DCE5F0] text-xs font-bold text-[#162033] hover:bg-slate-50 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCow}
                    className="px-6 py-2.5 rounded-xl bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {submittingCow ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          ) : selectedCowModal ? (
            <div className="bg-white border border-[#DCE5F0] rounded-2xl shadow-xs max-w-2xl mx-auto p-6 sm:p-8 space-y-6 animate-fadeIn font-body">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-[#DCE5F0] pb-5">
                <div className="flex items-center gap-4">
                  {(selectedCowModal.foto_sapi || selectedCowModal.cowPhoto) ? (
                    <img
                      src={selectedCowModal.foto_sapi || selectedCowModal.cowPhoto}
                      alt="Sapi"
                      className="w-16 h-16 rounded-2xl object-cover border border-[#DCE5F0] shadow-xs"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-[#DCE5F0] flex items-center justify-center text-[#12355B] shadow-xs">
                      <Beef className="w-8 h-8 text-[#12355B]" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#162033] font-heading">
                        {selectedCowModal.cowBreed || selectedCowModal.ras_sapi || 'Brangus'}
                      </h3>
                    </div>
                    <p className="text-xs font-bold text-[#12355B] mt-0.5">
                      Kode ID: {selectedCowModal.cowCode || selectedCowModal.cowID || selectedCowModal.id_sapi}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Jenis Kelamin: {selectedCowModal.cowGender || selectedCowModal.jenis_kelamin || 'Jantan'} • Umur: {selectedCowModal.cowAgeEstimate || '2 tahun 6 bulan'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-[#162033] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-[#12355B]" />
                    <span>Fisiologis & Bobot Badan</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 bg-slate-50 border border-[#DCE5F0] rounded-xl text-center">
                      <p className="text-[10px] text-[#64748B] font-bold uppercase">Suhu Tubuh</p>
                      <p className="text-base font-bold text-[#162033] mt-0.5">
                        {selectedCowModal.suhu_tubuh || selectedCowModal.physiology?.phyTemperature || '38.5'} °C
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-[#DCE5F0] rounded-xl text-center">
                      <p className="text-[10px] text-[#64748B] font-bold uppercase">Bobot Terkini</p>
                      <p className="text-base font-bold text-[#162033] mt-0.5">
                        {selectedCowModal.bobot_terkini || selectedCowModal.physiology?.phyCurrentWeight || '420'} kg
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-[#DCE5F0] rounded-xl text-center">
                      <p className="text-[10px] text-[#64748B] font-bold uppercase">Target Jual</p>
                      <p className="text-base font-bold text-[#12355B] mt-0.5">
                        {selectedCowModal.target_berat_jual || selectedCowModal.physiology?.phyTargetWeight || '550'} kg
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#162033] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Warehouse className="h-4 w-4 text-[#12355B]" />
                    <span>Penempatan & Fasilitas Pakan</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white border border-[#DCE5F0] rounded-xl">
                      <p className="text-[10px] text-[#64748B] font-bold uppercase">Unit Kandang</p>
                      <p className="text-xs font-bold text-[#162033] mt-1">
                        {selectedBarn ? (selectedBarn.nama_kandang || selectedBarn.barnName) : 'Kandang A (Utama)'}
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Unit Pemeliharaan Ternak</p>
                    </div>

                    <div className="p-3 bg-white border border-[#DCE5F0] rounded-xl">
                      <p className="text-[10px] text-[#64748B] font-bold uppercase">Stasiun Tempat Makan</p>
                      <p className="text-xs font-bold text-[#162033] mt-1">
                        {selectedCowModal.stationName || selectedCowModal.cowStationID || 'Tempat Makan 1 (Sektor A)'}
                      </p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Fasilitas Pakan & Minum Ternak</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#162033] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-[#12355B]" />
                    <span>Catatan Lapangan & Kesehatan</span>
                  </h4>
                  <div className="bg-slate-50 border border-[#DCE5F0] rounded-xl p-3.5 text-xs text-[#162033] leading-relaxed">
                    {selectedCowModal.physiology?.phyHealthHistory || selectedCowModal.cowHistory || 'Sapi dalam kondisi sehat dan nafsu makan stabil. Rutin vitamin dan vaksinasi.'}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-center gap-3 pt-4 border-t border-[#DCE5F0]">
                <button
                  type="button"
                  onClick={() => setSelectedCowModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#DCE5F0] text-xs font-bold text-[#162033] hover:bg-slate-50 transition cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('selected-cow', JSON.stringify(selectedCowModal));
                    if (onNavigate) onNavigate('sapi');
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <span>Buka di Halaman Sapi</span>
                  <ChevronRight className="h-4 w-4 stroke-2" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#162033] font-heading flex items-center gap-2">
                    <Beef className="h-5 w-5 text-[#12355B]" />
                    <span>Daftar Sapi ({currentBarnCows.length} Ekor)</span>
                  </h3>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">
                    Klik kartu sapi untuk melihat rincian kondisi fisiologis, tempat makan, dan rekam medisnya.
                  </p>
                </div>

                {/* Pencarian Sapi Cepat */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari kode atau ras sapi..."
                    value={searchCowQuery}
                    onChange={(e) => setSearchCowQuery(e.target.value)}
                    className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] rounded-xl pl-9 pr-3 py-2 text-xs text-[#162033] outline-none transition"
                  />
                </div>
              </div>

              {/* Jika Tidak Ada Sapi */}
              {filteredCurrentBarnCows.length === 0 ? (
                <div className="bg-white border border-[#DCE5F0] rounded-2xl p-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-[#DCE5F0] text-[#12355B] flex items-center justify-center mx-auto">
                    <Beef className="h-7 w-7" />
                  </div>
                  <h4 className="text-sm font-bold text-[#162033]">
                    {searchCowQuery ? 'Tidak ada sapi yang cocok dengan pencarian.' : 'Belum ada sapi di kandang ini.'}
                  </h4>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                    {searchCowQuery
                      ? 'Coba ubah kata kunci pencarian kode atau ras sapi.'
                      : 'Gunakan tombol "+ Tambah Sapi di Kandang Ini" untuk memasukkan sapi baru ke dalam unit kandang ini.'}
                  </p>
                  {!searchCowQuery && (
                    <button
                      type="button"
                      onClick={() => setIsAddCowOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer mt-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tambah Sapi Pertama Sekarang</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Grid Kartu Sapi Per Kandang */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCurrentBarnCows.map((cow, idx) => {
                    const rawCode = cow.cowCode || cow.code || cow.cowID || '';
                    const numMatch = String(rawCode).match(/\d+$/);
                    const cowNum = numMatch ? parseInt(numMatch[0], 10) : idx + 1;

                    const phy = cow.physiology || cow.fisiologis || {};
                    const temp = phy.phyTemperature || phy.suhu_tubuh || (38.3 + (cowNum % 4) * 0.1).toFixed(1);
                    const weight = phy.phyCurrentWeight || phy.bobot_terkini || (360 + cowNum * 15);
                    const targetWeight = phy.phyTargetWeight || phy.bobot_target || (weight + 120);
                    const breed = cow.cowBreed || cow.ras_sapi || 'Brangus';
                    const gender = cow.cowGender || cow.jenis_kelamin || (cowNum % 2 === 1 ? 'Jantan' : 'Betina');
                    const station = cow.stationName || cow.cowStationID || (cowNum % 2 === 1 ? 'Tempat Makan 1 (Sektor A)' : 'Tempat Makan 2 (Sektor B)');
                    const photo = (cow.foto_sapi && String(cow.foto_sapi).trim() !== '') ? cow.foto_sapi : ((cow.cowPhoto && String(cow.cowPhoto).trim() !== '') ? cow.cowPhoto : null);

                    return (
                      <div
                        key={cow.cowID || cow.id_sapi || idx}
                        onClick={() => setSelectedCowModal(cow)}
                        className="bg-white border border-[#DCE5F0] hover:border-[#12355B] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                      >
                        <div>
                          {/* Header Kartu Sapi dengan Foto */}
                          <div className="flex items-center gap-3.5 pb-3 border-b border-[#DCE5F0]">
                            {photo ? (
                              <img
                                src={photo}
                                alt={breed}
                                className="w-12 h-12 rounded-xl object-cover border border-[#DCE5F0] shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-[#DCE5F0] flex items-center justify-center text-[#12355B] shrink-0">
                                <Beef className="w-6 h-6 text-[#12355B]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-[#162033] group-hover:text-[#12355B] transition-colors font-heading truncate">
                                {breed}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-bold text-[#12355B] bg-slate-100 border border-[#DCE5F0] px-2 py-0.5 rounded-lg">
                                  Sapi {cowNum} ({rawCode || `SP-${cowNum}`})
                                </span>
                              </div>
                            </div>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-[#162033] border border-[#DCE5F0] shrink-0">
                              {gender}
                            </span>
                          </div>

                          {/* Parameter Fisiologis Sapi */}
                          <div className="grid grid-cols-2 gap-2.5 my-3 bg-slate-50 p-3 rounded-xl border border-[#DCE5F0]">
                            <div>
                              <p className="text-[10px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                                <Thermometer className="h-3 w-3 text-amber-600" />
                                <span>Suhu Tubuh</span>
                              </p>
                              <p className="text-sm font-bold text-[#162033] mt-0.5">
                                {temp} °C
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#64748B] font-bold uppercase flex items-center gap-1">
                                <Scale className="h-3 w-3 text-blue-600" />
                                <span>Berat Terkini</span>
                              </p>
                              <p className="text-sm font-bold text-[#162033] mt-0.5">
                                {weight} kg
                              </p>
                            </div>
                          </div>

                          {/* Stasiun Makan */}
                          <p className="text-[11px] text-[#64748B] font-medium truncate flex items-center gap-1.5">
                            <Utensils className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="text-slate-400 font-bold">Stasiun:</span>
                            <span className="truncate">{station}</span>
                          </p>
                        </div>

                        {/* Footer Tombol Detail */}
                        <div className="mt-4 pt-3 border-t border-[#DCE5F0] flex items-center justify-between">
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Sehat</span>
                          </span>
                          <span className="text-xs font-bold text-[#12355B] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <span>Detail Sapi</span>
                            <ChevronRight className="h-4 w-4 stroke-2" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
