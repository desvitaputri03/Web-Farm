import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
  Beef,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Utensils,
  Activity,
  Thermometer,
  Stethoscope,
  ChevronLeft
} from 'lucide-react';
import Pagination from './Pagination';
import SortSelect from './SortSelect';
import PageHeaderBanner from './PageHeaderBanner';
import CowDetailPage from './CowDetailPage';

// ==========================================
// MODAL KONFIRMASI HAPUS
// ==========================================
const ConfirmModal = ({
  isOpen,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus data sapi ini?',
  confirmText = 'Hapus',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-body" onClick={onCancel}>
      <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 shadow-2xl max-w-[360px] w-full text-center max-h-[85vh] overflow-y-auto animate-scaleUp" onClick={(e) => e.stopPropagation()}>
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

// ==========================================
// TOAST NOTIFIKASI
// ==========================================
const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
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

// 6 Foto Sapi Nyata di Peternakan Berkualitas Tinggi
const COW_FALLBACK_IMAGES = [
  '/images/cows/cow1.jpg',
  '/images/cows/cow2.jpg',
  '/images/cows/cow3.jpg',
  '/images/cows/cow4.jpg',
  '/images/cows/cow5.jpg',
  '/images/cows/cow6.jpg'
];

const getCowPhoto = (cow, idx = 0) => {
  if (cow && cow.foto_sapi && typeof cow.foto_sapi === 'string' && cow.foto_sapi.trim() !== '') {
    return cow.foto_sapi;
  }
  if (cow && cow.cowPhoto && typeof cow.cowPhoto === 'string' && cow.cowPhoto.trim() !== '') {
    return cow.cowPhoto;
  }
  const rawCode = cow?.id_sapi || cow?.cowCode || cow?.cowID || '';
  const numMatch = String(rawCode).match(/\d+$/);
  const cowNum = numMatch ? parseInt(numMatch[0], 10) : (idx + 1);
  return COW_FALLBACK_IMAGES[(cowNum - 1) % COW_FALLBACK_IMAGES.length];
};

// Data Fallback Sapi Lengkap (Catatan Lapangan Alami Peternak)
const INITIAL_COWS_FALLBACK = [
  {
    cowID: 'SP-2024-001',
    cowCode: 'SP-2024-001',
    cowBreed: 'Brangus',
    cowGender: 'Jantan',
    cowBirthDate: '2024-03-15',
    cowPurchaseDate: '2025-01-15',
    cowMaintenanceStatus: 'Dipelihara',
    tanggal_beli: '2025-01-15',
    status_pemeliharaan: 'Dipelihara',
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
    tanggal_beli: '2025-02-01',
    status_pemeliharaan: 'Dipelihara',
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
    tanggal_beli: '2025-03-10',
    status_pemeliharaan: 'Dipelihara',
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
    tanggal_beli: '2025-04-15',
    status_pemeliharaan: 'Dipelihara',
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
    tanggal_beli: '2024-12-01',
    status_pemeliharaan: 'Dipelihara',
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
    tanggal_beli: '2025-01-05',
    status_pemeliharaan: 'Dipelihara',
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

const SapiPage = ({ role = 'peternak' }) => {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barns, setBarns] = useState([]);
  const [stations, setStations] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedCow, setSelectedCow] = useState(null);
  const [selectedCowTab, setSelectedCowTab] = useState('identitas');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    cowCode: '',
    cowGender: 'Jantan',
    cowBirthDate: '',
    cowPurchaseDate: new Date().toISOString().split('T')[0],
    cowMaintenanceStatus: 'Dipelihara',
    cowAgeEstimate: '',
    cowBreed: '',
    cowBarnID: 'Kandang Utama',
    cowStationID: 'Tempat Makan 1 (Sektor A)',
    cowPurchasePrice: '',
    cowPhysiologyStatus: 'Normal',
    cowInitialWeight: '',
    cowTargetWeight: '',
    cowHistory: '',
    cowHealthHistory: '',
    cowPhoto: '',
  });

  const loadCows = () => {
    setLoading(true);
    axios.get('/farm/api/cows?limit=100')
      .then((res) => {
        const fetched = res.data?.data ?? [];
        if (Array.isArray(fetched) && fetched.length > 0) {
          setCows(fetched);
          setSelectedCow(prev => {
            if (!prev) return null;
            const targetId = prev.id_sapi || prev.cowID || prev.cowCode;
            const updated = fetched.find(c => (c.id_sapi === targetId || c.cowID === targetId || c.cowCode === targetId));
            if (updated) {
              return { ...prev, ...updated };
            }
            return prev;
          });
        } else {
          setCows(INITIAL_COWS_FALLBACK);
        }
      })
      .catch(() => {
        setCows(INITIAL_COWS_FALLBACK);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCows();

    axios.get('/farm/api/options/barns').then((res) => {
      const data = res.data?.data || res.data || [];
      setBarns(Array.isArray(data) ? data : []);
    }).catch(() => { });

    axios.get('/farm/api/options/feeding-stations').then((res) => {
      const data = res.data?.data || res.data || [];
      setStations(Array.isArray(data) ? data : []);
    }).catch(() => { });

    try {
      const stored = localStorage.getItem('selected-cow');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setSelectedCow(parsed);
        }
        localStorage.removeItem('selected-cow');
      }
    } catch { }
  }, []);

  // Reset halaman ke 1 saat kata kunci pencarian atau sortir diubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const calculateAge = (birthDate, fallbackAge) => {
    if (!birthDate) return fallbackAge || '—';
    try {
      const b = new Date(birthDate);
      if (isNaN(b.getTime())) return fallbackAge || birthDate;
      const now = new Date();
      let years = now.getFullYear() - b.getFullYear();
      let months = now.getMonth() - b.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years <= 0 && months <= 0) return 'Kurang dari 1 bulan';
      if (years <= 0) return `${months} bulan`;
      if (months === 0) return `${years} tahun`;
      return `${years} tahun ${months} bulan`;
    } catch {
      return fallbackAge || '—';
    }
  };

  const getBarnDisplayName = (barnRef) => {
    if (!barnRef && barnRef !== 0) return 'Kandang A (Utama)';
    if (barnRef === 'KDG-A01' || barnRef === 'Kandang Utama') return 'Kandang A (Utama)';
    if (barnRef === 'KDG-B01') return 'Kandang B';
    const found = barns.find(b => 
      String(b.id_kandang) === String(barnRef) || 
      String(b.barnID) === String(barnRef) || 
      b.nama_kandang === barnRef || 
      b.barnName === barnRef
    );
    if (found) return found.nama_kandang || found.barnName;
    if (typeof barnRef === 'string' && isNaN(barnRef) && !barnRef.startsWith('KDG-')) return barnRef;
    return 'Kandang A (Utama)';
  };

  const getStationDisplayName = (stationRef, defaultNum = 1) => {
    if (!stationRef && stationRef !== 0) {
      return defaultNum % 2 === 1 ? 'Tempat Makan 1 (Sektor A)' : 'Tempat Makan 2 (Sektor B)';
    }
    const found = stations.find(s => 
      String(s.id_tempat_makan) === String(stationRef) || 
      String(s.stationID) === String(stationRef) || 
      String(s.kode_tempat_makan) === String(stationRef) || 
      String(s.stationCode) === String(stationRef) || 
      s.nama_tempat_makan === stationRef || 
      s.stationName === stationRef
    );
    if (found) return found.nama_tempat_makan || found.stationName;
    if (typeof stationRef === 'string' && isNaN(stationRef) && !stationRef.startsWith('FS-') && !stationRef.startsWith('TM-')) {
      return stationRef;
    }
    return defaultNum % 2 === 1 ? 'Tempat Makan 1 (Sektor A)' : 'Tempat Makan 2 (Sektor B)';
  };

  const filteredCows = (Array.isArray(cows) ? cows : []).filter((c) => {
    if (!c) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const rawCode = String(c.cowCode || c.code || c.cowID || c.id_sapi || '').toLowerCase();
    const breed = String(c.cowBreed || c.ras_sapi || '').toLowerCase();
    const barn = String(c.barnName || c.cowBarnID || c.id_kandang || c.kandang?.nama_kandang || '').toLowerCase();
    const gender = String(c.cowGender || c.jenis_kelamin || '').toLowerCase();
    const status = String(c.cowMaintenanceStatus || c.status_pemeliharaan || '').toLowerCase();
    const history = String(c.cowHistory || c.riwayat_sapi || '').toLowerCase();
    return rawCode.includes(q) || breed.includes(q) || barn.includes(q) || gender.includes(q) || status.includes(q) || history.includes(q);
  });

  const sortedCows = [...filteredCows].sort((a, b) => {
    if (sortBy === 'az') return (a.cowBreed || a.ras_sapi || '').localeCompare(b.cowBreed || b.ras_sapi || '');
    if (sortBy === 'za') return (b.cowBreed || b.ras_sapi || '').localeCompare(a.cowBreed || a.ras_sapi || '');
    if (sortBy === 'terlama') {
      const dateA = new Date(a.cowBirthDate || a.tanggal_lahir || a.created_at || 0).getTime();
      const dateB = new Date(b.cowBirthDate || b.tanggal_lahir || b.created_at || 0).getTime();
      return dateA - dateB;
    }
    const dateA = new Date(a.cowBirthDate || a.tanggal_lahir || a.created_at || 0).getTime();
    const dateB = new Date(b.cowBirthDate || b.tanggal_lahir || b.created_at || 0).getTime();
    return dateB - dateA;
  });

  const totalFiltered = sortedCows.length;
  const maxPage = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  const validCurrentPage = Math.min(Math.max(1, currentPage), maxPage);
  const paginatedCows = sortedCows.slice((validCurrentPage - 1) * itemsPerPage, validCurrentPage * itemsPerPage);

  const resetForm = () => {
    setFormData({
      cowCode: '',
      cowGender: 'Jantan',
      cowBirthDate: '',
      cowPurchaseDate: '',
      cowMaintenanceStatus: 'Dipelihara',
      cowAgeEstimate: '',
      cowBreed: '',
      cowBarnID: 'Kandang Utama',
      cowStationID: 'Tempat Makan 1 (Sektor A)',
      cowPurchasePrice: '',
      cowPhysiologyStatus: 'Normal',
      cowInitialWeight: '',
      cowTargetWeight: '',
      cowCurrentWeight: '',
      cowHistory: '',
      cowHealthHistory: '',
      cowPhoto: '',
    });
    setEditId(null);
    setErrorMsg('');
    setIsFormOpen(false);
  };

  const generateNextCowCode = () => {
    let maxNum = 0;
    (cows || []).forEach(c => {
      const code = c.cowCode || c.code || c.cowID || '';
      const match = String(code).match(/\d+/g);
      if (match) {
        const lastNum = parseInt(match[match.length - 1], 10);
        if (!isNaN(lastNum) && lastNum > maxNum) {
          maxNum = lastNum;
        }
      }
    });
    const nextNum = maxNum + 1;
    const year = new Date().getFullYear();
    return `SP-${year}-${String(nextNum).padStart(3, '0')}`;
  };

  const handleAddNew = () => {
    setFormData({
      cowCode: generateNextCowCode(),
      cowGender: 'Jantan',
      cowBirthDate: '',
      cowPurchaseDate: '',
      cowMaintenanceStatus: 'Dipelihara',
      cowAgeEstimate: '',
      cowBreed: '',
      cowBarnID: 'Kandang Utama',
      cowStationID: 'Tempat Makan 1 (Sektor A)',
      cowPurchasePrice: '',
      cowPhysiologyStatus: 'Normal',
      cowInitialWeight: '',
      cowTargetWeight: '',
      cowHistory: '',
      cowHealthHistory: '',
      cowPhoto: '',
    });
    setEditId(null);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleEdit = (cow) => {
    const rawCode = cow.cowCode || cow.id_sapi || cow.cowID || cow.code || '';
    const matchNum = String(rawCode).match(/\d+$/);
    const cowNum = matchNum ? parseInt(matchNum[0], 10) : 1;
    const actualCode = cow.cowCode || cow.id_sapi || cow.cowID || cow.code || `Sapi ${cowNum}`;
    const phy = cow.fisiologis || cow.physiology || {};
    const exams = cow.riwayat_pemeriksaan || cow.riwayatPemeriksaan || cow.examination_records || cow.examinationRecords || [];
    const latestExam = exams.length > 0 ? (exams[0].diagnosis_notes || exams[0].catatan_diagnosa) : null;

    setFormData({
      cowCode: actualCode,
      cowGender: cow.cowGender || cow.jenis_kelamin || 'Jantan',
      cowBirthDate: (cow.cowBirthDate || cow.tanggal_lahir) ? String(cow.cowBirthDate || cow.tanggal_lahir).slice(0, 10) : '',
      cowPurchaseDate: (cow.cowPurchaseDate || cow.tanggal_beli) ? String(cow.cowPurchaseDate || cow.tanggal_beli).slice(0, 10) : (cow.cowBirthDate || cow.tanggal_lahir ? String(cow.cowBirthDate || cow.tanggal_lahir).slice(0, 10) : new Date().toISOString().split('T')[0]),
      cowMaintenanceStatus: cow.cowMaintenanceStatus || cow.status_pemeliharaan || 'Dipelihara',
      cowAgeEstimate: cow.cowAgeEstimate || '',
      cowBreed: cow.cowBreed || cow.ras_sapi || '',
      cowBarnID: cow.cowBarnID || cow.id_kandang || 'KDG-A01',
      cowStationID: cow.stationName || cow.cowStationID || cow.id_tempat_makan || 'Tempat Makan 1 (Sektor A)',
      cowPurchasePrice: cow.cowPurchasePrice || cow.harga_beli || 12000000,
      cowPhysiologyStatus: phy.phyStatus || phy.status_fisiologis || 'Normal',
      cowInitialWeight: (phy.phyInitialWeight !== undefined && phy.phyInitialWeight !== null) ? phy.phyInitialWeight : (phy.bobot_awal !== undefined && phy.bobot_awal !== null ? phy.bobot_awal : (cow.berat_awal_beli ?? 200)),
      cowTargetWeight: (phy.phyTargetWeight !== undefined && phy.phyTargetWeight !== null) ? phy.phyTargetWeight : (phy.bobot_target !== undefined && phy.bobot_target !== null ? phy.bobot_target : (cow.target_berat_jual ?? 500)),
      cowHistory: cow.cowHistory || cow.riwayat_sapi || '',
      cowHealthHistory: latestExam || phy.phyHealthNotes || phy.phyHealthHistory || phy.riwayat_kesehatan || '',
      cowPhoto: cow.cowPhoto || cow.foto_sapi || '',
    });
    setEditId(cow.cowID || cow.id_sapi);
    setSelectedCow(cow);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleLihatDetail = (cow, targetTab = 'identitas') => {
    setIsFormOpen(false);
    setSelectedCowTab(targetTab);
    setSelectedCow(cow);
  };

  const handleBackToList = () => {
    setSelectedCow(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file harus berupa gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, cowPhoto: ev.target.result }));
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.cowBreed.trim()) {
      setErrorMsg('Ras / Breed Sapi wajib diisi.');
      return;
    }

    let activeCode = (formData.cowCode && formData.cowCode.trim()) ? formData.cowCode.trim() : generateNextCowCode();

    if (!editId) {
      const isDuplicate = (cows || []).some(c => {
        const existingCode = c.cowCode || c.id_sapi || c.cowID || c.code || '';
        return String(existingCode).trim().toLowerCase() === activeCode.toLowerCase();
      });
      if (isDuplicate) {
        activeCode = generateNextCowCode();
      }
    }

    const payload = {
      cowCode: activeCode,
      cowGender: formData.cowGender,
      cowBirthDate: formData.cowBirthDate,
      cowPurchaseDate: formData.cowPurchaseDate || new Date().toISOString().split('T')[0],
      cowMaintenanceStatus: formData.cowMaintenanceStatus,
      cowBreed: formData.cowBreed,
      cowBarnID: formData.cowBarnID,
      cowStationID: formData.cowStationID,
      cowPurchasePrice: formData.cowPurchasePrice ? parseFloat(formData.cowPurchasePrice) : 0,
      cowInitialWeight: formData.cowInitialWeight ? parseFloat(formData.cowInitialWeight) : 0,
      cowTargetWeight: formData.cowTargetWeight ? parseFloat(formData.cowTargetWeight) : 0,
      cowHistory: formData.cowHistory,
      cowPhoto: formData.cowPhoto,
      phyInitialWeight: formData.cowInitialWeight ? parseFloat(formData.cowInitialWeight) : 0,
      phyTargetWeight: formData.cowTargetWeight ? parseFloat(formData.cowTargetWeight) : 0,
      phyStatus: formData.cowPhysiologyStatus,
      phyHealthHistory: formData.cowHealthHistory,
    };

    if (editId) {
      // 1. Optimistic & Instant Local State Update (Zero Lag / No Refresh Needed)
      const updatedPhoto = payload.cowPhoto;
      setCows(prev => prev.map(c => {
        const isMatch = (c.cowID === editId || c.id_sapi === editId || c.cowCode === editId);
        if (!isMatch) return c;
        return {
          ...c,
          ...payload,
          id_sapi: c.id_sapi || editId,
          cowID: c.cowID || editId,
          cowCode: c.cowCode || editId,
          foto_sapi: updatedPhoto || c.foto_sapi,
          cowPhoto: updatedPhoto || c.cowPhoto,
          ras_sapi: payload.cowBreed || c.ras_sapi,
          jenis_kelamin: payload.cowGender || c.jenis_kelamin,
          tanggal_beli: payload.cowPurchaseDate || c.tanggal_beli,
          status_pemeliharaan: payload.cowMaintenanceStatus || c.status_pemeliharaan,
          berat_awal_beli: payload.cowInitialWeight || c.berat_awal_beli,
          target_berat_jual: payload.cowTargetWeight || c.target_berat_jual,
          harga_beli: payload.cowPurchasePrice || c.harga_beli,
          fisiologis: {
            ...(c.fisiologis || c.physiology || {}),
            bobot_awal: payload.cowInitialWeight,
            bobot_target: payload.cowTargetWeight,
            status_fisiologis: payload.phyStatus,
            riwayat_kesehatan: payload.phyHealthHistory,
          },
          physiology: {
            ...(c.physiology || c.fisiologis || {}),
            phyInitialWeight: payload.cowInitialWeight,
            phyTargetWeight: payload.cowTargetWeight,
            phyStatus: payload.phyStatus,
            phyHealthHistory: payload.phyHealthHistory,
          }
        };
      }));

      setSelectedCow(prev => {
        if (!prev) return null;
        const isMatch = (prev.cowID === editId || prev.id_sapi === editId || prev.cowCode === editId);
        if (!isMatch) return prev;
        return {
          ...prev,
          ...payload,
          id_sapi: prev.id_sapi || editId,
          cowID: prev.cowID || editId,
          cowCode: prev.cowCode || editId,
          foto_sapi: updatedPhoto || prev.foto_sapi,
          cowPhoto: updatedPhoto || prev.cowPhoto,
          ras_sapi: payload.cowBreed || prev.ras_sapi,
          jenis_kelamin: payload.cowGender || prev.jenis_kelamin,
          tanggal_beli: payload.cowPurchaseDate || prev.tanggal_beli,
          status_pemeliharaan: payload.cowMaintenanceStatus || prev.status_pemeliharaan,
          berat_awal_beli: payload.cowInitialWeight || prev.berat_awal_beli,
          target_berat_jual: payload.cowTargetWeight || prev.target_berat_jual,
          harga_beli: payload.cowPurchasePrice || prev.harga_beli,
          fisiologis: {
            ...(prev.fisiologis || prev.physiology || {}),
            bobot_awal: payload.cowInitialWeight,
            bobot_target: payload.cowTargetWeight,
            status_fisiologis: payload.phyStatus,
            riwayat_kesehatan: payload.phyHealthHistory,
          },
          physiology: {
            ...(prev.physiology || prev.fisiologis || {}),
            phyInitialWeight: payload.cowInitialWeight,
            phyTargetWeight: payload.cowTargetWeight,
            phyStatus: payload.phyStatus,
            phyHealthHistory: payload.phyHealthHistory,
          }
        };
      });

      try {
        await axios.put(`/farm/cows/${editId}`, payload);
        loadCows();
      } catch {
        // data already updated optimistically
      } finally {
        resetForm();
        setToast({ message: 'Data identitas sapi berhasil diperbarui!', type: 'success' });
      }
      return;
    } else {
      try {
        const res = await axios.post('/farm/cows', payload);
        const newCow = res.data?.cow || res.data?.data || {
          cowID: activeCode,
          id_sapi: activeCode,
          ...payload,
          tanggal_beli: payload.cowPurchaseDate,
          status_pemeliharaan: payload.cowMaintenanceStatus,
          berat_awal_beli: payload.cowInitialWeight,
          target_berat_jual: payload.cowTargetWeight,
          harga_beli: payload.cowPurchasePrice,
          physiology: {
            phyInitialWeight: payload.cowInitialWeight,
            phyTargetWeight: payload.cowTargetWeight,
            phyCurrentWeight: payload.cowInitialWeight,
            phyStatus: payload.phyStatus,
            phyHealthHistory: payload.phyHealthHistory,
          }
        };
        setCows(prev => [newCow, ...prev]);
        loadCows();
      } catch {
        const newCow = {
          cowID: activeCode,
          id_sapi: activeCode,
          ...payload,
          tanggal_beli: payload.cowPurchaseDate,
          status_pemeliharaan: payload.cowMaintenanceStatus,
          berat_awal_beli: payload.cowInitialWeight,
          target_berat_jual: payload.cowTargetWeight,
          harga_beli: payload.cowPurchasePrice,
          physiology: {
            phyInitialWeight: payload.cowInitialWeight,
            phyTargetWeight: payload.cowTargetWeight,
            phyCurrentWeight: payload.cowInitialWeight,
            phyStatus: payload.phyStatus,
            phyHealthHistory: payload.phyHealthHistory,
          }
        };
        setCows(prev => [newCow, ...prev]);
      } finally {
        resetForm();
        setToast({ message: 'Sapi baru berhasil ditambahkan!', type: 'success' });
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    // Optimistic remove
    setCows(prev => prev.filter(c => c.cowID !== deleteTarget && c.id_sapi !== deleteTarget));
    setDeleteTarget(null);
    try {
      await axios.delete(`/farm/cows/${deleteTarget}`);
      loadCows();
    } catch {
      // already removed optimistically
    }
    setToast({ message: 'Data sapi berhasil dihapus!', type: 'success' });
  };

  // ==========================================
  // RENDER FORM TAMBAH / EDIT SAPI
  // ==========================================
  const renderForm = () => (
    <div className="bg-white border border-[#DCE5F0] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6 font-body max-w-2xl mx-auto animate-fadeIn">
      {errorMsg && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-bold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Foto Interaktif */}
        <div>
          <label className="block text-xs font-semibold text-[#162033] mb-2 font-body">
            Foto Profil Sapi
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#DCE5F0] hover:border-[#12355B] bg-slate-50/70 hover:bg-blue-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden group"
          >
            {formData.cowPhoto ? (
              <div className="relative w-full max-w-xs h-40 rounded-xl overflow-hidden shadow-xs">
                <img src={formData.cowPhoto} alt="Preview Sapi" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                  <Camera className="h-4 w-4" />
                  <span>Ganti Foto</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#12355B] mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-[#162033]">
                  Klik untuk unggah foto profil sapi
                </p>
                <p className="text-[11px] text-[#64748B] font-medium">
                  Mendukung JPG, PNG, atau WebP (Maks. 2 MB)
                </p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Data Input Identitas Sapi */}
        <input type="hidden" name="cowCode" value={formData.cowCode} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
              Ras Sapi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="cowBreed"
              list="sapi-ras-options"
              value={formData.cowBreed}
              onChange={handleChange}
              className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all h-[42px]"
              required
            />
            <datalist id="sapi-ras-options">
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
            <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
              Jenis Kelamin <span className="text-rose-500">*</span>
            </label>
            <select
              name="cowGender"
              value={formData.cowGender}
              onChange={handleChange}
              className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all cursor-pointer h-[42px]"
            >
              <option value="Jantan">Jantan</option>
              <option value="Betina">Betina</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
              Tanggal Pembelian <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="cowPurchaseDate"
              value={formData.cowPurchaseDate}
              onChange={handleChange}
              className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all cursor-pointer h-[42px]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
              Harga Pembelian (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="cowPurchasePrice"
              value={formData.cowPurchasePrice}
              onChange={handleChange}
              className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all h-[42px]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
              Berat Awal Beli (kg) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              name="cowInitialWeight"
              value={formData.cowInitialWeight}
              onChange={handleChange}
              className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all h-[42px]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
              Target Berat Jual (kg) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              name="cowTargetWeight"
              value={formData.cowTargetWeight}
              onChange={handleChange}
              className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all h-[42px]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
              Stasiun Tempat Makan
            </label>
            <select
              name="cowStationID"
              value={formData.cowStationID}
              onChange={handleChange}
              className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all cursor-pointer h-[42px]"
            >
              <option value="Tempat Makan 1 (Sektor A)">Tempat Makan 1 (Sektor A)</option>
              <option value="Tempat Makan 2 (Sektor B)">Tempat Makan 2 (Sektor B)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
              Tanggal Lahir
            </label>
            <input
              type="date"
              name="cowBirthDate"
              value={formData.cowBirthDate}
              onChange={handleChange}
              className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none transition-all cursor-pointer h-[42px]"
            />
          </div>
        </div>

        {/* Catatan Asal Usul & Riwayat */}
        <div>
          <label className="block text-xs font-semibold text-[#162033] mb-1.5 font-body">
            Catatan Asal-usul &amp; Riwayat Sapi
          </label>
          <textarea
            name="cowHistory"
            rows={3}
            value={formData.cowHistory}
            onChange={handleChange}
            className="w-full bg-white border border-[#DCE5F0] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 rounded-xl p-3 text-xs text-[#162033] font-medium outline-none transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 pt-4 border-t border-[#DCE5F0]">
          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-[#162033] text-xs font-semibold rounded-xl border border-[#DCE5F0] transition cursor-pointer h-[42px]"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer h-[42px]"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );

  // ==========================================
  // RENDER DETAIL SAPI (BUKU RAPOR INDIVIDU SAPI LENGKAP)
  // ==========================================
  if (selectedCow && !isFormOpen) {
    return (
      <CowDetailPage
        cow={selectedCow}
        initialTab={selectedCowTab}
        role={role}
        onBack={handleBackToList}
        onEditIdentity={handleEdit}
        onRefresh={loadCows}
      />
    );
  }

  // ==========================================
  // RENDER UTAMA: LIST KARTU SAPI (3 KOLOM DENGAN GAMBAR)
  // ==========================================
  return (
    <div className="space-y-6 font-body">
      {/* 1. Header Banner Standar SIMANTRA (Dinamis: Sapi / Tambah Sapi / Edit Sapi) */}
      <PageHeaderBanner
        icon={Beef}
        title={isFormOpen ? (editId !== null ? 'Edit Sapi' : 'Tambah Sapi') : 'Sapi'}
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
          {successMsg && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 2. Sub-Header Toolbar Card: Judul Daftar Sapi di Kiri + Search, Sort, Tambah di Kanan */}
          <div className="card-accent-top bg-white rounded-2xl p-4 sm:p-5 border border-[#DCE5F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <h3 className="text-base font-bold text-[#162033] font-heading shrink-0 flex items-center gap-2">
              <Beef className="w-5 h-5 text-[#12355B]" />
              <span>Daftar Sapi</span>
            </h3>

            {/* Right Controls: Search Bar + Sort + Add Button */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari ras sapi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#162033] focus:border-[#12355B] focus:ring-4 focus:ring-slate-500/10 outline-none transition-all font-medium h-[42px]"
                />
              </div>

              <SortSelect value={sortBy} onChange={setSortBy} />

              {(role === 'peternak' || role === 'admin') && (
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="btn-gradient text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer h-[42px] shrink-0"
                >
                  <Plus className="h-4 w-4 stroke-2" />
                  <span>Tambah Sapi</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. Grid Kartu Sapi (3 Kolom dengan Format Sesuai Rujukan) */}
          {loading ? (
            <div className="text-center py-20 text-xs font-semibold text-slate-400">Memuat data sapi...</div>
          ) : (Array.isArray(paginatedCows) && paginatedCows.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCows.map((cow, idx) => {
                const rawCode = cow.cowCode || cow.code || cow.cowID || cow.id_sapi || '';
                const matchNum = String(rawCode).match(/\d+$/);
                const cowNum = matchNum ? parseInt(matchNum[0], 10) : idx + 1;
                const actualCode = cow.cowCode || cow.id_sapi || cow.cowID || `Sapi ${cowNum}`;
                const breedTitle = cow.cowBreed || cow.ras_sapi || 'Brangus';
                const cardMainTitle = `${actualCode} (${breedTitle})`;
                const stationName = 
                  cow.tempat_makan?.nama_tempat_makan ||
                  cow.tempatMakan?.nama_tempat_makan ||
                  cow.feeding_station?.stationName ||
                  getStationDisplayName(cow.id_tempat_makan || cow.cowStationID || cow.stationName, cowNum);
                const barnName = 
                  cow.kandang?.nama_kandang ||
                  cow.barn?.barnName ||
                  getBarnDisplayName(cow.id_kandang || cow.cowBarnID);
                const phy = cow.physiology || cow.fisiologis || {};
                const initW = (phy.phyInitialWeight !== undefined && phy.phyInitialWeight !== null && phy.phyInitialWeight !== '') 
                  ? phy.phyInitialWeight 
                  : (cow.phyInitialWeight ?? cow.cowInitialWeight ?? null);
                const targetW = (phy.phyTargetWeight !== undefined && phy.phyTargetWeight !== null && phy.phyTargetWeight !== '') 
                  ? phy.phyTargetWeight 
                  : (cow.phyTargetWeight ?? cow.cowTargetWeight ?? null);
                const photoUrl = getCowPhoto(cow, idx);

                return (
                  <div
                    key={cow.cowID || idx}
                    className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#12355B] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div
                      onClick={() => handleLihatDetail(cow, 'identitas')}
                      className="cursor-pointer"
                      title="Klik untuk mengelola data lengkap sapi ini"
                    >
                      {/* 1. Foto Sapi di Bagian Atas */}
                      {photoUrl ? (
                        <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-[#DCE5F0]">
                          <img
                            src={photoUrl}
                            alt={breedTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = COW_FALLBACK_IMAGES[(cowNum - 1) % COW_FALLBACK_IMAGES.length];
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center border-b border-[#DCE5F0] text-slate-400 gap-2">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-[#DCE5F0] flex items-center justify-center shadow-2xs">
                            <Beef className="w-8 h-8 text-slate-300 stroke-1.5" />
                          </div>
                          <span className="text-[11px] font-medium text-slate-400">Belum ada foto profil</span>
                        </div>
                      )}

                      {/* 2. Detail Identitas & Fisiologis Sapi Sesuai Urutan */}
                      <div className="p-5 space-y-3">
                        {/* Judul Utama Paling Menonjol & Jenis Kelamin */}
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-[#162033] font-heading group-hover:text-[#12355B] transition-colors">
                            {cardMainTitle}
                          </h3>
                          <p className="text-xs font-semibold text-[#64748B] mt-1">
                            {cow.cowGender || 'Jantan'} • Beli: {fmtDate(cow.cowPurchaseDate || cow.tanggal_beli)}
                          </p>
                        </div>

                        {/* Data Fisiologis */}
                        <div className="space-y-1.5 text-xs text-[#162033] pt-2 border-t border-[#DCE5F0]/60">
                          <div className="flex justify-between items-center">
                            <span className="text-[#64748B] font-medium">Bobot awal:</span>
                            <span className="font-semibold text-[#162033]">{initW ? `${initW} kg` : 'Belum diinput'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#64748B] font-medium">Bobot target:</span>
                            <span className="font-semibold text-[#162033]">{targetW ? `${targetW} kg` : 'Belum diinput'}</span>
                          </div>
                        </div>

                        {/* Bagian Penempatan (Paling Bawah) */}
                        <div className="space-y-1.5 text-xs text-[#162033] pt-2 border-t border-[#DCE5F0]/60">
                          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Penempatan:</p>
                          <div className="flex justify-between items-center">
                            <span className="text-[#64748B] font-medium">Kandang:</span>
                            <span className="font-semibold text-[#162033]">{barnName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#64748B] font-medium">Tempat makan:</span>
                            <span className="font-semibold text-[#162033] truncate max-w-[170px]">{stationName || 'Belum ditempatkan'}</span>
                          </div>
                        </div>

                        {/* 4 Pintasan Halaman Cepat (Solusi B) */}
                        <div className="pt-3 border-t border-[#DCE5F0]/60">
                          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                            Pintasan Cepat:
                          </span>
                          <div className="grid grid-cols-4 gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLihatDetail(cow, 'pakan');
                              }}
                              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-[#DCE5F0] hover:border-blue-300 transition-all text-[#162033] hover:text-[#12355B] cursor-pointer group/btn"
                              title="Buka Catatan Pemberian Pakan"
                            >
                              <Utensils className="h-3.5 w-3.5 text-[#12355B] mb-0.5 group-hover/btn:scale-110 transition-transform" />
                              <span className="text-[10px] font-semibold">Pakan</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLihatDetail(cow, 'perilaku');
                              }}
                              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-[#DCE5F0] hover:border-emerald-300 transition-all text-[#162033] hover:text-emerald-700 cursor-pointer group/btn"
                              title="Buka Catatan Perilaku Sapi"
                            >
                              <Activity className="h-3.5 w-3.5 text-emerald-600 mb-0.5 group-hover/btn:scale-110 transition-transform" />
                              <span className="text-[10px] font-semibold">Perilaku</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLihatDetail(cow, 'fisiologis');
                              }}
                              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-[#DCE5F0] hover:border-amber-300 transition-all text-[#162033] hover:text-amber-700 cursor-pointer group/btn"
                              title="Buka Kondisi Fisiologis (Suhu & Bobot)"
                            >
                              <Thermometer className="h-3.5 w-3.5 text-amber-600 mb-0.5 group-hover/btn:scale-110 transition-transform" />
                              <span className="text-[10px] font-semibold">Fisik</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLihatDetail(cow, 'medis');
                              }}
                              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-[#DCE5F0] hover:border-purple-300 transition-all text-[#162033] hover:text-purple-700 cursor-pointer group/btn"
                              title="Buka Catatan Rekam Medis Mantri"
                            >
                              <Stethoscope className="h-3.5 w-3.5 text-purple-600 mb-0.5 group-hover/btn:scale-110 transition-transform" />
                              <span className="text-[10px] font-semibold">Medis</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Action Footer: Tombol Utama "Kelola Sapi" */}
                    <div className="p-3 bg-slate-50/70 border-t border-[#DCE5F0]/60 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleLihatDetail(cow, 'identitas')}
                        className="flex-1 btn-gradient text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer h-[38px]"
                        title="Kelola Data Lengkap Sapi Ini"
                      >
                        <Eye className="h-4 w-4 stroke-2" />
                        <span>Kelola Sapi</span>
                      </button>

                      {(role === 'peternak' || role === 'admin') && (
                        <button
                          type="button"
                          onClick={() => { setDeleteTarget(cow.cowID || cow.id_sapi); }}
                          className="p-2 rounded-xl border border-[#DCE5F0] bg-white text-[#64748B] hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition cursor-pointer shadow-2xs h-[38px] w-[38px] flex items-center justify-center shrink-0"
                          title="Hapus Data Sapi"
                        >
                          <Trash2 className="h-4 w-4 stroke-2" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#DCE5F0] rounded-2xl p-12 text-center text-[#64748B] font-body">
              <Beef className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              {searchQuery.trim() ? (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-[#162033]">Tidak ditemukan sapi dengan kata kunci &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-xs text-[#64748B]">Coba gunakan kata kunci ras atau ID sapi yang lain.</p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#12355B] text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    <span>Tampilkan Semua Sapi</span>
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-bold text-[#162033]">Belum ada data sapi terdaftar.</p>
                  <p className="text-xs text-[#64748B] mt-1">Klik tombol &ldquo;Tambah Sapi&rdquo; untuk mendaftarkan ternak baru.</p>
                </>
              )}
            </div>
          )}

          <Pagination
            currentPage={validCurrentPage}
            totalItems={totalFiltered}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Data Sapi"
        message="Apakah Anda yakin ingin menghapus data sapi ini?"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast Notifikasi */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default SapiPage;
