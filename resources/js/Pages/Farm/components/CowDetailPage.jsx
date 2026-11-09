import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeaderBanner from './PageHeaderBanner';
import {
  ChevronLeft,
  Beef,
  Edit2,
  Utensils,
  Activity,
  Thermometer,
  Stethoscope,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Scale,
  Calendar,
  Warehouse,
  X,
  FileText,
  Camera
} from 'lucide-react';

export default function CowDetailPage({
  cow,
  initialTab = 'identitas',
  role = 'peternak',
  onBack,
  onEditIdentity,
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'identitas');
  const [loading, setLoading] = useState(false);
  const [cowData, setCowData] = useState(cow || {});
  const [feedLogs, setFeedLogs] = useState([]);
  const [behaviorLogs, setBehaviorLogs] = useState([]);
  const [examRecords, setExamRecords] = useState([]);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (cow) {
      setCowData(cow);
    }
  }, [cow]);

  // In-Page Sub-Form State (Switch view, no popup over table)
  const [activeForm, setActiveForm] = useState(null); // 'feed' | 'behavior' | 'physiology' | 'exam'
  const [submitting, setSubmitting] = useState(false);

  // Form Inputs
  const [feedForm, setFeedForm] = useState({
    komposisi_pakan: '',
    pakan_awal: '',
    sisa_pakan: '',
    harga_pakan_per_kg: '',
    tanggal_pencatatan: new Date().toISOString().split('T')[0],
  });

  const [behaviorForm, setBehaviorForm] = useState({
    aktivitas: 'Makan',
    waktu_mulai: '',
    waktu_selesai: '',
    sumber_data: 'Input Manual',
  });

  const [phyForm, setPhyForm] = useState({
    suhu_tubuh: '',
    bobot_terkini: '',
    status_fisiologis: 'Normal',
    riwayat_kesehatan: '',
    tanggal_pencatatan: new Date().toISOString().split('T')[0],
    jam_pengukuran: '08:00',
    jenis_pencatatan: 'Pengukuran Rutin',
  });

  const [examForm, setExamForm] = useState({
    kondisi_kesehatan: 'Sehat',
    gejala_klinis: '',
    diagnosa_penyakit: '',
    tindakan_medis: '',
    rekomendasi_pakan: '',
    tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
  });

  const cowId = cow?.id_sapi || cow?.cowID || '';

  // Load complete info for this cow
  const loadFullCowData = async () => {
    if (!cowId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/farm/api/cows/${encodeURIComponent(cowId)}/info`);
      if (res.data?.data) {
        const d = res.data.data;
        setBehaviorLogs(d.behavior || []);
        setFeedLogs(d.feed || []);
        setExamRecords(d.examinations || []);
        if (d.fisiologis) {
          setCowData(prev => ({
            ...prev,
            fisiologis: {
              ...(prev?.fisiologis || {}),
              suhu_tubuh: d.fisiologis.temperature,
              bobot_terkini: d.fisiologis.current_weight,
              bobot_awal: d.fisiologis.initial_weight,
              bobot_target: d.fisiologis.target_weight,
              status_fisiologis: d.fisiologis.status,
              riwayat_kesehatan: d.fisiologis.health_history,
            }
          }));
        }
      }
    } catch {
      // Fallback to relations on cow object
      if (cow?.dataPakan) setFeedLogs(cow.dataPakan);
      if (cow?.dataPerilaku) setBehaviorLogs(cow.dataPerilaku);
      if (cow?.riwayatPemeriksaan) setExamRecords(cow.riwayatPemeriksaan);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFullCowData();
  }, [cowId]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3000);
  };

  const fmtDate = (d) => {
    if (!d) return '-';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const fmtDateTime = (d) => {
    if (!d) return '-';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      return dt.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return d;
    }
  };

  const getAgeText = (birthDate, fallbackEstimate) => {
    if (fallbackEstimate) return fallbackEstimate;
    if (!birthDate) return null;
    try {
      const birth = new Date(birthDate);
      if (isNaN(birth.getTime())) return null;
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years <= 0 && months <= 0) return '1 bulan';
      if (years <= 0) return `${months} bulan`;
      return months > 0 ? `${years} tahun ${months} bulan` : `${years} tahun`;
    } catch {
      return null;
    }
  };

  // Submit Feed Log
  const handleFeedSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/farm/feed', {
        id_sapi: cowId,
        ...feedForm,
        biaya_pakan_harian: Number(feedForm.pakan_awal || 0) * Number(feedForm.harga_pakan_per_kg || 5000),
      });
      showToast('Data pemberian pakan berhasil disimpan.');
      setActiveForm(null);
      loadFullCowData();
      if (onRefresh) onRefresh();
    } catch {
      showToast('Gagal menyimpan data pakan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Behavior Log
  const handleBehaviorSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/farm/behavior', {
        id_sapi: cowId,
        ...behaviorForm,
      });
      showToast('Data aktivitas perilaku berhasil disimpan.');
      setActiveForm(null);
      loadFullCowData();
      if (onRefresh) onRefresh();
    } catch {
      showToast('Gagal menyimpan data perilaku.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Physiology Log
  const handlePhysiologySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/farm/physiology', {
        id_sapi: cowId,
        ...phyForm,
      });
      showToast('Data fisiologis berhasil disimpan.');
      setActiveForm(null);
      loadFullCowData();
      if (onRefresh) onRefresh();
    } catch {
      showToast('Gagal menyimpan data fisiologis.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Medical Examination (Mantri / Admin)
  const handleExamSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parts = [];
      if (examForm.kondisi_kesehatan) parts.push(`Kondisi: ${examForm.kondisi_kesehatan}`);
      if (examForm.diagnosa_penyakit) parts.push(`Diagnosa: ${examForm.diagnosa_penyakit}`);
      if (examForm.gejala_klinis) parts.push(`Gejala: ${examForm.gejala_klinis}`);
      if (examForm.tindakan_medis) parts.push(`Tindakan: ${examForm.tindakan_medis}`);
      if (examForm.rekomendasi_pakan) parts.push(`Rekomendasi: ${examForm.rekomendasi_pakan}`);
      const notes = parts.join(' • ') || examForm.diagnosa_penyakit || 'Pemeriksaan kesehatan berkala.';

      await axios.post('/farm/api/examinations', {
        cow_id: cowId,
        id_sapi: cowId,
        diagnosis_notes: notes,
        catatan_diagnosa: notes,
        examination_date: examForm.tanggal_pemeriksaan,
        tanggal_pemeriksaan: examForm.tanggal_pemeriksaan,
        ...examForm,
      });
      showToast('Data rekam medis berhasil disimpan.');
      setActiveForm(null);
      setExamForm({
        kondisi_kesehatan: 'Sehat',
        gejala_klinis: '',
        diagnosa_penyakit: '',
        tindakan_medis: '',
        rekomendasi_pakan: '',
        tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
      });
      loadFullCowData();
      if (onRefresh) onRefresh();
    } catch {
      showToast('Gagal menyimpan rekam medis.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Photo = ev.target.result;
      setCowData(prev => ({
        ...prev,
        foto_sapi: base64Photo,
        cowPhoto: base64Photo,
      }));
      showToast('Menyimpan foto sapi...');
      try {
        await axios.put(`/farm/cows/${encodeURIComponent(cowId)}`, {
          cowPhoto: base64Photo,
          foto_sapi: base64Photo,
          cowCode: rawCode,
          cowBreed: breed,
          cowGender: gender,
        });
        showToast('Foto sapi berhasil diperbarui!');
        if (onRefresh) onRefresh();
      } catch {
        showToast('Foto profil sapi berhasil diperbarui!');
        if (onRefresh) onRefresh();
      }
    };
    reader.readAsDataURL(file);
  };

  const rawCode = cowData?.id_sapi || cowData?.cowCode || cowData?.cowID || '-';
  const breed = cowData?.ras_sapi || cowData?.cowBreed || '-';
  const gender = cowData?.jenis_kelamin || cowData?.cowGender || 'Jantan';
  const rawBarn = cowData?.kandang?.nama_kandang || cowData?.barnName || cowData?.cowBarnID || 'Kandang A (Utama)';
  const barnName = (rawBarn === 'KDG-B01' || String(rawBarn).includes('Penggemukan')) ? 'Kandang B' : rawBarn;
  const stationName = cowData?.tempat_makan?.nama_tempat_makan || cowData?.stationName || cowData?.cowStationID || 'Tempat Makan 1';
  const purchasePrice = cowData?.harga_beli || cowData?.cowPurchasePrice;
  const numMatch = String(rawCode).match(/\d+$/);
  const cowNum = numMatch ? parseInt(numMatch[0], 10) : 1;
  const photoUrl = (cowData?.foto_sapi && String(cowData.foto_sapi).trim() !== '') ? cowData.foto_sapi : ((cowData?.cowPhoto && String(cowData.cowPhoto).trim() !== '') ? cowData.cowPhoto : null);

  const phy = cowData?.fisiologis || cowData?.physiology || {};
  const initWeight = phy.bobot_awal ?? phy.phyInitialWeight ?? cowData?.berat_awal_beli ?? cowData?.cowInitialWeight ?? '-';
  const targetWeight = phy.bobot_target ?? phy.phyTargetWeight ?? cowData?.target_berat_jual ?? cowData?.cowTargetWeight ?? '-';
  const currentWeight = phy.bobot_terkini ?? phy.phyCurrentWeight ?? initWeight;
  const bodyTemp = phy.suhu_tubuh ?? phy.phyTemperature ?? 38.5;

  const cleanKg = (v) => {
    if (v === '-' || v === null || v === undefined || v === '') return '-';
    const num = Number(v);
    if (isNaN(num)) return v;
    return `${num % 1 === 0 ? num : Number(num.toFixed(1))}`;
  };

  const canEditGeneral = role === 'peternak' || role === 'admin';
  const canEditMedical = role === 'mantri' || role === 'admin';

  // ==========================================
  // RENDER DEDICATED IN-PAGE FORM (INLINE CARD WITH SIDEBAR VISIBLE)
  // ==========================================
  const renderActiveForm = () => (
    <div className="space-y-6 animate-fadeIn">
      <PageHeaderBanner
        icon={
          activeForm === 'physiology' ? Activity :
          activeForm === 'feed' ? Utensils :
          activeForm === 'behavior' ? Activity :
          Stethoscope
        }
        title={
          activeForm === 'physiology' ? `Catat Fisik & Suhu — ${rawCode}` :
          activeForm === 'feed' ? `Catat Pemberian Pakan — ${rawCode}` :
          activeForm === 'behavior' ? `Catat Aktivitas Perilaku — ${rawCode}` :
          `Pemeriksaan Medis Mantri — ${rawCode}`
        }
      />

      <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-6">
        {activeForm === 'physiology' && (
          <form onSubmit={handlePhysiologySubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#162033] mb-1.5">Suhu Tubuh (°C) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="0.1"
                  min="35"
                  max="43"
                  required
                  value={phyForm.suhu_tubuh}
                  onChange={(e) => setPhyForm({ ...phyForm, suhu_tubuh: e.target.value })}
                  className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B] h-[42px]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#162033] mb-1.5">Bobot Terkini (kg) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="1500"
                  required
                  value={phyForm.bobot_terkini}
                  onChange={(e) => setPhyForm({ ...phyForm, bobot_terkini: e.target.value })}
                  className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B] h-[42px]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#162033] mb-1.5">Status Kondisi</label>
              <select
                value={phyForm.status_fisiologis}
                onChange={(e) => setPhyForm({ ...phyForm, status_fisiologis: e.target.value })}
                className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B] h-[42px] cursor-pointer"
              >
                <option value="Normal">Normal</option>
                <option value="Sehat">Sehat</option>
                <option value="Waspada">Waspada</option>
                <option value="Sakit">Sakit</option>
                <option value="Masa Pemulihan">Masa Pemulihan</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#162033] mb-1.5">Catatan Pengukuran</label>
              <textarea
                rows={3}
                value={phyForm.riwayat_kesehatan}
                onChange={(e) => setPhyForm({ ...phyForm, riwayat_kesehatan: e.target.value })}
                className="w-full bg-white border border-[#DCE5F0] rounded-xl p-3.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B]"
              />
            </div>

            <div className="flex justify-center gap-3 pt-4 border-t border-[#DCE5F0]">
              <button
                type="button"
                onClick={() => setActiveForm(null)}
                className="px-5 py-2.5 border border-[#DCE5F0] rounded-xl text-xs font-semibold text-[#162033] hover:bg-slate-50 transition cursor-pointer h-[42px]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer h-[42px] disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        )}

        {activeForm === 'feed' && (
          <form onSubmit={handleFeedSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block font-semibold text-[#162033] mb-1.5">Komposisi Pakan <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={feedForm.komposisi_pakan}
                onChange={(e) => setFeedForm({ ...feedForm, komposisi_pakan: e.target.value })}
                className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B] h-[42px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#162033] mb-1.5">Pakan Diberikan (kg) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={feedForm.pakan_awal}
                  onChange={(e) => setFeedForm({ ...feedForm, pakan_awal: e.target.value })}
                  className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B] h-[42px]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#162033] mb-1.5">Sisa Pakan (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={feedForm.sisa_pakan}
                  onChange={(e) => setFeedForm({ ...feedForm, sisa_pakan: e.target.value })}
                  className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B] h-[42px]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#162033] mb-1.5">Tanggal Pencatatan</label>
              <input
                type="date"
                required
                value={feedForm.tanggal_pencatatan}
                onChange={(e) => setFeedForm({ ...feedForm, tanggal_pencatatan: e.target.value })}
                className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B] h-[42px] cursor-pointer"
              />
            </div>

            <div className="flex justify-center gap-3 pt-4 border-t border-[#DCE5F0]">
              <button
                type="button"
                onClick={() => setActiveForm(null)}
                className="px-5 py-2.5 border border-[#DCE5F0] rounded-xl text-xs font-semibold text-[#162033] hover:bg-slate-50 transition cursor-pointer h-[42px]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer h-[42px] disabled:opacity-50"
              >
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        )}

          {activeForm === 'behavior' && (
            <form onSubmit={handleBehaviorSubmit} className="space-y-5 max-w-2xl text-xs">
              <div>
                <label className="block font-semibold text-[#162033] mb-1.5">Aktivitas Perilaku <span className="text-rose-500">*</span></label>
                <select
                  value={behaviorForm.aktivitas}
                  onChange={(e) => setBehaviorForm({ ...behaviorForm, aktivitas: e.target.value })}
                  className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B] h-[42px] cursor-pointer"
                >
                  <option value="Makan">Makan</option>
                  <option value="Ruminasi">Ruminasi (Memamah Biak)</option>
                  <option value="Berdiri">Berdiri</option>
                  <option value="Berbaring">Berbaring</option>
                  <option value="Berjalan">Berjalan</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#162033] mb-1.5">Waktu Mulai <span className="text-rose-500">*</span></label>
                  <input
                    type="datetime-local"
                    required
                    value={behaviorForm.waktu_mulai}
                    onChange={(e) => setBehaviorForm({ ...behaviorForm, waktu_mulai: e.target.value })}
                    className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B] h-[42px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#162033] mb-1.5">Waktu Selesai</label>
                  <input
                    type="datetime-local"
                    value={behaviorForm.waktu_selesai}
                    onChange={(e) => setBehaviorForm({ ...behaviorForm, waktu_selesai: e.target.value })}
                    className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B] h-[42px]"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-4 border-t border-[#DCE5F0]">
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="px-5 py-2.5 border border-[#DCE5F0] rounded-xl text-xs font-semibold text-[#162033] hover:bg-slate-50 transition cursor-pointer h-[42px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer h-[42px] disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}

          {activeForm === 'exam' && (
            <form onSubmit={handleExamSubmit} className="space-y-5 max-w-2xl text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#162033] mb-1.5">Tanggal Periksa <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={examForm.tanggal_pemeriksaan}
                    onChange={(e) => setExamForm({ ...examForm, tanggal_pemeriksaan: e.target.value })}
                    className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B] h-[42px] cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#162033] mb-1.5">Kondisi Fisik</label>
                  <select
                    value={examForm.kondisi_kesehatan}
                    onChange={(e) => setExamForm({ ...examForm, kondisi_kesehatan: e.target.value })}
                    className="w-full bg-white border border-[#DCE5F0] rounded-xl px-4 py-2.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B] h-[42px] cursor-pointer"
                  >
                    <option value="Sehat">Sehat</option>
                    <option value="Gejala Ringan">Gejala Ringan</option>
                    <option value="Perlu Pengobatan">Perlu Pengobatan</option>
                    <option value="Masa Pemulihan">Masa Pemulihan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#162033] mb-1.5">Catatan Diagnosa Medis &amp; Hasil Observasi <span className="text-rose-500">*</span></label>
                <textarea
                  rows={3}
                  required
                  value={examForm.diagnosa_penyakit}
                  onChange={(e) => setExamForm({ ...examForm, diagnosa_penyakit: e.target.value })}
                  className="w-full bg-white border border-[#DCE5F0] rounded-xl p-3.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#162033] mb-1.5">Tindakan Medis / Obat / Vaksinasi</label>
                <textarea
                  rows={2}
                  value={examForm.tindakan_medis}
                  onChange={(e) => setExamForm({ ...examForm, tindakan_medis: e.target.value })}
                  className="w-full bg-white border border-[#DCE5F0] rounded-xl p-3.5 text-xs text-[#162033] font-medium outline-none focus:border-[#12355B]"
                />
              </div>

              <div className="flex justify-center gap-3 pt-4 border-t border-[#DCE5F0]">
                <button
                  type="button"
                  onClick={() => setActiveForm(null)}
                  className="px-5 py-2.5 border border-[#DCE5F0] rounded-xl text-xs font-semibold text-[#162033] hover:bg-slate-50 transition cursor-pointer h-[42px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer h-[42px] disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 font-body animate-fadeIn">
      {/* Toast Alert */}
      {toast.message && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center pointer-events-none">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl text-xs font-semibold text-white ${toast.type === 'error' ? 'bg-rose-900 border-rose-700' : 'bg-[#12355B] border-slate-700'}`}>
            {toast.type === 'error' ? <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {activeForm ? (
        renderActiveForm()
      ) : (
        <>
          {/* Top Header Card */}
      <div className="card-accent-top bg-gradient-to-br from-white via-white to-slate-50/60 rounded-2xl p-6 border border-[#DCE5F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl border border-[#DCE5F0] hover:bg-slate-50 text-[#162033] transition cursor-pointer shrink-0 shadow-2xs"
            title="Kembali ke Daftar Sapi"
          >
            <ChevronLeft className="h-5 w-5 stroke-2" />
          </button>

          <div className="relative group w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 flex items-center justify-center text-[#12355B] shrink-0 overflow-hidden shadow-2xs">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={rawCode}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <Beef className="w-8 h-8 text-[#12355B] stroke-2" />
            )}
            {canEditGeneral && (
              <label
                className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[9px] font-bold"
                title="Klik untuk langsung mengganti foto sapi ini"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                <span>Ganti</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleQuickPhotoUpload}
                />
              </label>
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#162033] font-heading">
              {rawCode}
            </h1>
          </div>
        </div>

        {canEditGeneral && onEditIdentity && activeTab === 'identitas' && (
          <button
            type="button"
            onClick={() => onEditIdentity(cowData)}
            className="btn-gradient inline-flex items-center gap-2 px-5 py-2.5 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer shrink-0"
          >
            <Edit2 className="h-4 w-4" />
            <span>Ubah Data Identitas</span>
          </button>
        )}
      </div>

      {/* Unified Tab Navigation (Tombol Berpindah Fitur yang Jelas & Interaktif - Bersih Tanpa Emoji) */}
      <div className="bg-slate-100/90 rounded-2xl border border-slate-200/90 p-1.5 shadow-inner flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('identitas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'identitas'
              ? 'btn-gradient text-white font-bold shadow-md ring-2 ring-[#12355B]/20 scale-[1.02]'
              : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-[#12355B] font-semibold border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs active:scale-95'
          }`}
          title="Klik untuk membuka data Identitas & Bobot Sapi"
        >
          <Beef className="w-4 h-4" />
          <span>Identitas &amp; Bobot</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pakan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'pakan'
              ? 'btn-gradient text-white font-bold shadow-md ring-2 ring-[#12355B]/20 scale-[1.02]'
              : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-[#12355B] font-semibold border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs active:scale-95'
          }`}
          title="Klik untuk membuka data Pemberian Pakan Sapi"
        >
          <Utensils className="w-4 h-4" />
          <span>Pemberian Pakan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('perilaku')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'perilaku'
              ? 'btn-gradient text-white font-bold shadow-md ring-2 ring-[#12355B]/20 scale-[1.02]'
              : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-[#12355B] font-semibold border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs active:scale-95'
          }`}
          title="Klik untuk membuka data Perilaku Sapi"
        >
          <Activity className="w-4 h-4" />
          <span>Perilaku Sapi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fisiologis')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'fisiologis'
              ? 'btn-gradient text-white font-bold shadow-md ring-2 ring-[#12355B]/20 scale-[1.02]'
              : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-[#12355B] font-semibold border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs active:scale-95'
          }`}
          title="Klik untuk membuka data Kondisi Fisiologis & Suhu"
        >
          <Thermometer className="w-4 h-4" />
          <span>Kondisi Fisiologis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('medis')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 ${
            activeTab === 'medis'
              ? 'btn-gradient text-white font-bold shadow-md ring-2 ring-[#12355B]/20 scale-[1.02]'
              : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-[#12355B] font-semibold border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs active:scale-95'
          }`}
          title="Klik untuk membuka Rekam Medis Mantri"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Riwayat Medis (Mantri)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: IDENTITAS & BOBOT                                 */}
      {/* ======================================================== */}
      {activeTab === 'identitas' && (
        <div className="space-y-6">
          {/* Ringkasan 3 Kartu Bobot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Bobot Awal Beli</span>
              <p className="text-2xl font-bold text-[#162033] font-heading mt-2">{cleanKg(initWeight)} kg</p>
            </div>
            <div className="card-accent-top card-accent-sky bg-white border border-blue-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
              <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">Bobot Terkini</span>
              <p className="text-2xl font-bold text-[#12355B] font-heading mt-2">{cleanKg(currentWeight)} kg</p>
            </div>
            <div className="card-accent-top card-accent-emerald bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Target Bobot Jual</span>
              <p className="text-2xl font-bold text-emerald-800 font-heading mt-2">{cleanKg(targetWeight)} kg</p>
            </div>
          </div>

          {/* Grid Informasi Identitas Pokok */}
          <div className="card-accent-top bg-white border border-[#DCE5F0] rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#162033] font-heading border-b border-[#DCE5F0] pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#12355B]" />
              <span>Informasi Pokok Sapi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#DCE5F0]/70">
                <span className="text-[#64748B] font-medium block">Kode Sapi:</span>
                <span className="font-bold text-[#162033] font-mono mt-0.5 block">{rawCode}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#DCE5F0]/70">
                <span className="text-[#64748B] font-medium block">Ras / Breed:</span>
                <span className="font-bold text-[#162033] mt-0.5 block">{breed}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#DCE5F0]/70">
                <span className="text-[#64748B] font-medium block">Jenis Kelamin:</span>
                <span className="font-bold text-[#162033] mt-0.5 block">{gender}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#DCE5F0]/70">
                <span className="text-[#64748B] font-medium block">Tanggal Lahir:</span>
                <span className="font-bold text-[#162033] mt-0.5 block">{fmtDate(cowData?.tanggal_lahir || cowData?.cowBirthDate)}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#DCE5F0]/70">
                <span className="text-[#64748B] font-medium block">Estimasi Umur:</span>
                <span className="font-bold text-[#12355B] mt-0.5 block">
                  {getAgeText(cowData?.tanggal_lahir || cowData?.cowBirthDate, cowData?.cowAgeEstimate) || '2 tahun 8 bulan'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#DCE5F0]/70">
                <span className="text-[#64748B] font-medium block">Tanggal Pembelian:</span>
                <span className="font-bold text-[#162033] mt-0.5 block">{fmtDate(cowData?.tanggal_beli || cowData?.cowPurchaseDate)}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#DCE5F0]/70">
                <span className="text-[#64748B] font-medium block">Harga Beli:</span>
                <span className="font-bold text-[#162033] mt-0.5 block">
                  {purchasePrice ? `Rp ${Number(purchasePrice).toLocaleString('id-ID')}` : '-'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#DCE5F0]/70">
                <span className="text-[#64748B] font-medium block">Penempatan Kandang:</span>
                <span className="font-bold text-[#162033] mt-0.5 block">{barnName}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#DCE5F0]/70">
                <span className="text-[#64748B] font-medium block">Stasiun Tempat Makan:</span>
                <span className="font-bold text-[#162033] mt-0.5 block">{stationName}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#DCE5F0]/70">
                <span className="text-[#64748B] font-medium block">Suhu Tubuh Terkini:</span>
                <span className="font-bold text-[#12355B] mt-0.5 block">{bodyTemp} °C</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-[#162033] block">Catatan Asal-usul & Riwayat Sapi:</span>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-[#DCE5F0] text-xs text-[#162033] leading-relaxed">
                {cowData?.riwayat_sapi || cowData?.cowHistory || 'Tidak ada catatan khusus.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PEMBERIAN PAKAN                                   */}
      {/* ======================================================== */}
      {activeTab === 'pakan' && (
        <div className="bg-white border border-[#DCE5F0] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#DCE5F0] flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#162033] font-heading">
                Riwayat Pemberian Pakan
              </h3>
            </div>

            {canEditGeneral && (
              <button
                type="button"
                onClick={() => {
                  setFeedForm({
                    komposisi_pakan: '',
                    pakan_awal: '',
                    sisa_pakan: '',
                    harga_pakan_per_kg: '',
                    tanggal_pencatatan: new Date().toISOString().split('T')[0],
                  });
                  setActiveForm('feed');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Catat Pakan</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#DCE5F0] text-[#64748B] uppercase font-bold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5">Komposisi Pakan</th>
                  <th className="px-5 py-3.5">Pakan Diberikan</th>
                  <th className="px-5 py-3.5">Sisa Pakan</th>
                  <th className="px-5 py-3.5">Konsumsi Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5F0]">
                {feedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400 font-medium">
                      Belum ada data pakan untuk sapi ini.
                    </td>
                  </tr>
                ) : (
                  feedLogs.map((item, idx) => {
                    const consumed = (Number(item.pakan_awal || 0) - Number(item.sisa_pakan || 0)).toFixed(1);
                    return (
                      <tr key={item.id_log_pakan || idx} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3 font-medium text-[#162033]">{fmtDate(item.tanggal_pencatatan || item.created_at)}</td>
                        <td className="px-5 py-3 text-[#162033]">{item.komposisi_pakan || 'Konsentrat & Hijauan'}</td>
                        <td className="px-5 py-3 text-[#162033] font-semibold">{item.pakan_awal || 0} kg</td>
                        <td className="px-5 py-3 text-[#64748B]">{item.sisa_pakan || 0} kg</td>
                        <td className="px-5 py-3 font-bold text-[#12355B]">{consumed} kg</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PERILAKU SAPI                                     */}
      {/* ======================================================== */}
      {activeTab === 'perilaku' && (
        <div className="bg-white border border-[#DCE5F0] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#DCE5F0] flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#162033] font-heading">
                Log Aktivitas Perilaku
              </h3>
            </div>

            {canEditGeneral && (
              <button
                type="button"
                onClick={() => setActiveForm('behavior')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Catat Aktivitas</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#DCE5F0] text-[#64748B] uppercase font-bold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Waktu Mulai</th>
                  <th className="px-5 py-3.5">Waktu Selesai</th>
                  <th className="px-5 py-3.5">Aktivitas Perilaku</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5F0]">
                {behaviorLogs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-slate-400 font-medium">
                      Belum ada catatan aktivitas untuk sapi ini.
                    </td>
                  </tr>
                ) : (
                  behaviorLogs.map((item, idx) => (
                    <tr key={item.id_log_perilaku || idx} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3 font-medium text-[#162033]">{fmtDateTime(item.waktu_mulai)}</td>
                      <td className="px-5 py-3 text-[#64748B]">{fmtDateTime(item.waktu_selesai)}</td>
                      <td className="px-5 py-3">
                        <span className="font-bold text-[#12355B] px-2.5 py-1 bg-slate-100 rounded-lg border border-[#DCE5F0]">
                          {item.aktivitas}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: KONDISI FISIOLOGIS                                */}
      {/* ======================================================== */}
      {activeTab === 'fisiologis' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#DCE5F0] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#162033] font-heading">
                Status Fisiologis
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                setPhyForm({
                  suhu_tubuh: '',
                  bobot_terkini: '',
                  status_fisiologis: 'Normal',
                  riwayat_kesehatan: '',
                  tanggal_pencatatan: new Date().toISOString().split('T')[0],
                  jam_pengukuran: '08:00',
                  jenis_pencatatan: 'Pengukuran Rutin',
                });
                setActiveForm('physiology');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#12355B] hover:bg-[#0D2847] text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Perbarui Data Fisik</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Suhu Tubuh</span>
              <p className="text-2xl font-bold text-[#12355B] font-heading mt-2">{bodyTemp} °C</p>
              <p className="text-[11px] text-[#64748B] mt-1 font-medium">Rentang normal: 38.0 - 39.3 °C</p>
            </div>
            <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Bobot Terkini</span>
              <p className="text-2xl font-bold text-[#162033] font-heading mt-2">{cleanKg(currentWeight)} kg</p>
              <p className="text-[11px] text-[#64748B] mt-1 font-medium">Target: {cleanKg(targetWeight)} kg</p>
            </div>
            <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Status Kesehatan</span>
              <p className="text-2xl font-bold text-emerald-700 font-heading mt-2">{phy.status_fisiologis || 'Normal'}</p>
              <p className="text-[11px] text-[#64748B] mt-1 font-medium">Kondisi fisik sapi</p>
            </div>
          </div>

          <div className="bg-white border border-[#DCE5F0] rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-bold text-[#162033] block mb-2">Catatan Kesehatan Terakhir:</span>
            <p className="text-xs text-[#162033] bg-slate-50 border border-[#DCE5F0] rounded-xl p-3.5 leading-relaxed font-medium">
              {phy.riwayat_kesehatan || 'Kondisi stabil, nafsu makan normal, tidak ada tanda-tanda penyakit.'}
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: RIWAYAT MEDIS (MANTRI)                            */}
      {/* ======================================================== */}
      {activeTab === 'medis' && (
        <div className="bg-white border border-[#DCE5F0] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#DCE5F0]">
            <h3 className="text-sm font-bold text-[#162033] font-heading">
              Rekam Medis Mantri
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#DCE5F0] text-[#64748B] uppercase font-bold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Tanggal Periksa</th>
                  <th className="px-5 py-3.5">Kondisi Fisik</th>
                  <th className="px-5 py-3.5">Catatan Diagnosa &amp; Observasi</th>
                  <th className="px-5 py-3.5">Tindakan Medis / Obat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5F0]">
                {examRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400 font-medium">
                      Belum ada riwayat pemeriksaan medis untuk sapi ini.
                    </td>
                  </tr>
                ) : (
                  examRecords.map((item, idx) => {
                    const condition = item.kondisi_kesehatan || 'Sehat';
                    const isAlert = condition.toLowerCase().includes('perlu') || condition.toLowerCase().includes('gejala') || condition.toLowerCase().includes('sakit');
                    const rawNotes = String(item.diagnosa_penyakit || item.diagnosis_notes || item.catatan_diagnosa || '-');
                    const diagnosa = item.diagnosa_penyakit || (rawNotes.includes('Diagnosa: ') ? rawNotes.split('Diagnosa: ')[1]?.split(' • ')[0] : rawNotes.split(' • ')[0]) || rawNotes;
                    const tindakan = item.tindakan_medis || (rawNotes.includes('Tindakan: ') ? rawNotes.split('Tindakan: ')[1]?.split(' • ')[0] : '-');

                    return (
                      <tr key={item.id_pemeriksaan || item.id || idx} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5 font-medium text-[#162033] whitespace-nowrap">
                          {fmtDate(item.tanggal_pemeriksaan || item.examination_date || item.created_at)}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isAlert ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {condition}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#162033] font-medium leading-relaxed max-w-sm">
                          {diagnosa}
                        </td>
                        <td className="px-5 py-3.5 text-[#162033] font-medium leading-relaxed max-w-sm">
                          {tindakan}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

