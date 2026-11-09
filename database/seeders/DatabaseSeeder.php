<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Kandang;
use App\Models\Sapi;
use App\Models\Fisiologis;
use App\Models\LogPerilaku;
use App\Models\LogPakan;
use App\Models\TempatMakan;
use App\Models\RiwayatPemeriksaan;
use App\Models\LogKamera;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Nonaktifkan foreign key checks untuk pembersihan data lama secara aman
        if (DB::getDriverName() === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        }

        // Hapus data secara aman menggunakan delete()
        RiwayatPemeriksaan::query()->delete();
        LogKamera::query()->delete();
        LogPakan::query()->delete();
        LogPerilaku::query()->delete();
        Fisiologis::query()->delete();
        Sapi::query()->delete();
        TempatMakan::query()->delete();
        Kandang::query()->delete();
        User::query()->delete();

        if (DB::getDriverName() === 'mysql') {
            try { DB::statement('ALTER TABLE riwayat_pemeriksaan AUTO_INCREMENT = 1;'); } catch (\Throwable $e) {}
            try { DB::statement('ALTER TABLE log_kamera AUTO_INCREMENT = 1;'); } catch (\Throwable $e) {}
            try { DB::statement('ALTER TABLE log_pakan AUTO_INCREMENT = 1;'); } catch (\Throwable $e) {}
            try { DB::statement('ALTER TABLE log_perilaku AUTO_INCREMENT = 1;'); } catch (\Throwable $e) {}
            try { DB::statement('ALTER TABLE fisiologis AUTO_INCREMENT = 1;'); } catch (\Throwable $e) {}
            try { DB::statement('ALTER TABLE tempat_makan AUTO_INCREMENT = 1;'); } catch (\Throwable $e) {}
            try { DB::statement('ALTER TABLE users AUTO_INCREMENT = 1;'); } catch (\Throwable $e) {}
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        // 1. Akun Pengguna Standar SIMANTRA (Multiuser & Tanpa Nama Pribadi)
        $peternak = User::create([
            'name'          => 'Peternak',
            'email'         => 'peternak@farm.com',
            'nomor_telepon' => '081234567890',
            'role'          => 'peternak',
            'password'      => Hash::make('peternak123'),
        ]);

        User::create([
            'name'          => 'Mantri Ternak',
            'email'         => 'mantri@farm.com',
            'nomor_telepon' => '082198765432',
            'role'          => 'mantri',
            'password'      => Hash::make('mantri123'),
        ]);

        User::create([
            'name'          => 'Administrator',
            'email'         => 'admin@farm.com',
            'nomor_telepon' => '081122334455',
            'role'          => 'admin',
            'password'      => Hash::make('admin123'),
        ]);

        // 2. Data Unit Kandang Sapi (Kandang A & Kandang B)
        $barns = [
            [
                'id_kandang' => 'KDG-A01',
                'nama_kandang' => 'Kandang A (Utama)',
                'lokasi_kandang' => 'Sektor Utama',
                'kapasitas_kandang' => 10,
                'suhu_kandang' => 28.2,
                'kelembapan_kandang' => 72.0,
                'pencahayaan' => 220,
                'kecepatan_angin' => 1.1,
                'curah_hujan' => 0.0,
                'kondisi_lantai' => 'Bersih'
            ],
            [
                'id_kandang' => 'KDG-B01',
                'nama_kandang' => 'Kandang B',
                'lokasi_kandang' => 'Sektor Timur',
                'kapasitas_kandang' => 8,
                'suhu_kandang' => 27.8,
                'kelembapan_kandang' => 70.5,
                'pencahayaan' => 210,
                'kecepatan_angin' => 1.3,
                'curah_hujan' => 0.0,
                'kondisi_lantai' => 'Bersih'
            ]
        ];

        foreach ($barns as $barn) {
            Kandang::create($barn);
        }

        // 3. Data Stasiun Tempat Makan & Air Minum
        $stations = [
            ['kode_tempat_makan' => 'FS-001', 'nama_tempat_makan' => 'Tempat Makan Kandang Utama A (Pakan)', 'tipe_tempat_makan' => 'makan', 'lokasi_tempat_makan' => 'KDG-A01'],
            ['kode_tempat_makan' => 'FS-002', 'nama_tempat_makan' => 'Tempat Makan Kandang Utama B (Air Minum)', 'tipe_tempat_makan' => 'minum', 'lokasi_tempat_makan' => 'KDG-A01'],
        ];

        $createdStations = [];
        foreach ($stations as $st) {
            $created = TempatMakan::create($st);
            $createdStations[$st['kode_tempat_makan']] = $created;
        }

        // 4. Data 6 Ekor Sapi Utama (Terdistribusi di Kandang A & Kandang B)
        $cows = [
            ['cowID' => 'SP-2024-001', 'cowGender' => 'Jantan', 'cowBirthDate' => '2024-03-15', 'cowPurchaseDate' => '2025-01-15', 'cowMaintenanceStatus' => 'Dipelihara', 'cowInitialWeight' => 275.0, 'cowTargetWeight' => 550.0, 'cowBreed' => 'Brangus', 'cowHistory' => 'Beli bakalan dari peternak mitra, nafsu makan tinggi, vaksin PMK lengkap.', 'cowBarnID' => 'KDG-A01', 'cowOwnerID' => $peternak->id, 'cowPurchasePrice' => 13800000.00, 'cowStationID' => $createdStations['FS-001']->id_tempat_makan, 'foto_sapi' => '/images/cows/cow1.jpg'],
            ['cowID' => 'SP-2024-002', 'cowGender' => 'Jantan', 'cowBirthDate' => '2024-05-10', 'cowPurchaseDate' => '2025-02-01', 'cowMaintenanceStatus' => 'Dipelihara', 'cowInitialWeight' => 240.0, 'cowTargetWeight' => 500.0, 'cowBreed' => 'Brahman', 'cowHistory' => 'Beli bibit bakalan pilihan, punuk tegap, adaptasi lingkungan kandang sangat baik.', 'cowBarnID' => 'KDG-A01', 'cowOwnerID' => $peternak->id, 'cowPurchasePrice' => 12200000.00, 'cowStationID' => $createdStations['FS-001']->id_tempat_makan, 'foto_sapi' => '/images/cows/cow2.jpg'],
            ['cowID' => 'SP-2024-003', 'cowGender' => 'Betina', 'cowBirthDate' => '2024-07-20', 'cowPurchaseDate' => '2025-03-10', 'cowMaintenanceStatus' => 'Dipelihara', 'cowInitialWeight' => 210.0, 'cowTargetWeight' => 430.0, 'cowBreed' => 'Angus', 'cowHistory' => 'Beli bakalan bersertifikat karantina hewan dinas, bebas brucellosis.', 'cowBarnID' => 'KDG-A01', 'cowOwnerID' => $peternak->id, 'cowPurchasePrice' => 10800000.00, 'cowStationID' => $createdStations['FS-002']->id_tempat_makan, 'foto_sapi' => '/images/cows/cow3.jpg'],
            ['cowID' => 'SP-2024-004', 'cowGender' => 'Jantan', 'cowBirthDate' => '2024-10-05', 'cowPurchaseDate' => '2025-04-15', 'cowMaintenanceStatus' => 'Dipelihara', 'cowInitialWeight' => 185.0, 'cowTargetWeight' => 380.0, 'cowBreed' => 'Sapi Bali', 'cowHistory' => 'Bibit bakalan unggul, struktur tulang kompak dan persentase karkas tebal.', 'cowBarnID' => 'KDG-A01', 'cowOwnerID' => $peternak->id, 'cowPurchasePrice' => 9500000.00, 'cowStationID' => $createdStations['FS-002']->id_tempat_makan, 'foto_sapi' => '/images/cows/cow4.jpg'],
            ['cowID' => 'SP-2024-005', 'cowGender' => 'Jantan', 'cowBirthDate' => '2024-02-20', 'cowPurchaseDate' => '2024-12-01', 'cowMaintenanceStatus' => 'Dipelihara', 'cowInitialWeight' => 310.0, 'cowTargetWeight' => 620.0, 'cowBreed' => 'Limousin', 'cowHistory' => 'Beli bakalan berkualitas, kerangka dada lebar, nafsu makan pakan silase tinggi.', 'cowBarnID' => 'KDG-B01', 'cowOwnerID' => $peternak->id, 'cowPurchasePrice' => 15800000.00, 'cowStationID' => $createdStations['FS-001']->id_tempat_makan, 'foto_sapi' => '/images/cows/cow5.jpg'],
            ['cowID' => 'SP-2024-006', 'cowGender' => 'Jantan', 'cowBirthDate' => '2024-04-18', 'cowPurchaseDate' => '2025-01-05', 'cowMaintenanceStatus' => 'Dipelihara', 'cowInitialWeight' => 320.0, 'cowTargetWeight' => 650.0, 'cowBreed' => 'Simmental', 'cowHistory' => 'Hasil inseminasi buatan (IB) poskeswan, silangan super, pertumbuhan harian stabil.', 'cowBarnID' => 'KDG-B01', 'cowOwnerID' => $peternak->id, 'cowPurchasePrice' => 16300000.00, 'cowStationID' => $createdStations['FS-002']->id_tempat_makan, 'foto_sapi' => '/images/cows/cow6.jpg'],
        ];

        foreach ($cows as $c) {
            Sapi::create([
                'id_sapi' => $c['cowID'],
                'ras_sapi' => $c['cowBreed'],
                'jenis_kelamin' => $c['cowGender'],
                'tanggal_lahir' => $c['cowBirthDate'],
                'tanggal_beli' => $c['cowPurchaseDate'],
                'status_pemeliharaan' => $c['cowMaintenanceStatus'],
                'berat_awal_beli' => $c['cowInitialWeight'],
                'target_berat_jual' => $c['cowTargetWeight'],
                'harga_beli' => $c['cowPurchasePrice'],
                'foto_sapi' => $c['foto_sapi'],
                'id_kandang' => $c['cowBarnID'],
                'id_tempat_makan' => $c['cowStationID'],
                'id_pemilik' => $c['cowOwnerID'],
                'riwayat_sapi' => $c['cowHistory'],
            ]);
        }

        // 5. Data Rekam Fisiologis 6 Sapi (Riwayat Suhu & Penimbangan)
        $physiologies = [
            ['phyCowID' => 'SP-2024-001', 'phyStatus' => 'Sehat', 'phyInitialWeight' => 275.0, 'phyCurrentWeight' => 420.0, 'phyTargetWeight' => 550.0, 'phyTemperature' => 38.6, 'phyHealthHistory' => 'Vaksin PMK lengkap, rutin vitamin.', 'jam' => '07:30', 'jenis' => 'Penimbangan Berkala'],
            ['phyCowID' => 'SP-2024-002', 'phyStatus' => 'Sehat', 'phyInitialWeight' => 240.0, 'phyCurrentWeight' => 375.0, 'phyTargetWeight' => 500.0, 'phyTemperature' => 38.8, 'phyHealthHistory' => 'Pemeriksaan mantri: sehat, gerak aktif.', 'jam' => '07:45', 'jenis' => 'Penimbangan Berkala'],
            ['phyCowID' => 'SP-2024-003', 'phyStatus' => 'Sehat', 'phyInitialWeight' => 210.0, 'phyCurrentWeight' => 340.0, 'phyTargetWeight' => 430.0, 'phyTemperature' => 38.3, 'phyHealthHistory' => 'Fisik prima, nafsu makan konsentrat tinggi.', 'jam' => '08:00', 'jenis' => 'Penimbangan Berkala'],
            ['phyCowID' => 'SP-2024-004', 'phyStatus' => 'Sehat', 'phyInitialWeight' => 185.0, 'phyCurrentWeight' => 290.0, 'phyTargetWeight' => 380.0, 'phyTemperature' => 38.7, 'phyHealthHistory' => 'Sehat, rutin mineral blok dan hijauan.', 'jam' => '08:15', 'jenis' => 'Penimbangan Berkala'],
            ['phyCowID' => 'SP-2024-005', 'phyStatus' => 'Sehat', 'phyInitialWeight' => 310.0, 'phyCurrentWeight' => 465.0, 'phyTargetWeight' => 620.0, 'phyTemperature' => 38.5, 'phyHealthHistory' => 'Vaksin lengkap, kerangka dada tumbuh maksimal.', 'jam' => '08:30', 'jenis' => 'Penimbangan Berkala'],
            ['phyCowID' => 'SP-2024-006', 'phyStatus' => 'Sehat', 'phyInitialWeight' => 320.0, 'phyCurrentWeight' => 485.0, 'phyTargetWeight' => 650.0, 'phyTemperature' => 38.7, 'phyHealthHistory' => 'Vaksin LSD dan PMK beres, pertumbuhan super.', 'jam' => '08:45', 'jenis' => 'Penimbangan Berkala'],
        ];

        foreach ($physiologies as $p) {
            Fisiologis::create([
                'id_sapi' => $p['phyCowID'],
                'status_fisiologis' => $p['phyStatus'],
                'bobot_awal' => $p['phyInitialWeight'],
                'bobot_terkini' => $p['phyCurrentWeight'],
                'bobot_target' => $p['phyTargetWeight'],
                'suhu_tubuh' => $p['phyTemperature'],
                'riwayat_kesehatan' => $p['phyHealthHistory'],
                'tanggal_pencatatan' => now()->toDateString(),
                'jam_pengukuran' => $p['jam'],
                'jenis_pencatatan' => $p['jenis'],
            ]);
        }

        // 6. Log Perilaku Otomatis Sensor & Manual (14 Hari ke Belakang)
        $activities = ['Makan', 'Berjalan', 'Berdiri', 'Berbaring', 'Ruminasi'];
        foreach ($cows as $c) {
            for ($daysBack = 0; $daysBack < 14; $daysBack++) {
                $numLogs = rand(2, 4);
                for ($k = 0; $k < $numLogs; $k++) {
                    $startMins = rand(30, 700);
                    $duration = rand(15, 60);

                    LogPerilaku::create([
                        'id_sapi' => $c['cowID'],
                        'aktivitas' => $activities[array_rand($activities)],
                        'waktu_mulai' => now()->subDays($daysBack)->subMinutes($startMins + $duration)->toDateTimeString(),
                        'waktu_selesai' => now()->subDays($daysBack)->subMinutes($startMins)->toDateTimeString(),
                        'sumber_data' => 'Input Manual'
                    ]);
                }
            }
        }

        // 7. Log Asupan Pakan & 3 Sesi Makan (Pagi, Siang, Sore)
        $compositions = [
            'Rumput Gajah + Konsentrat Penggemukan',
            'Rumput Odot + Konsentrat Protein Tinggi',
            'Jerami Fermentasi + Ampas Tahu',
            'Rumput Lapangan + Suplemen Mineral',
            'Silase Jagung + Konsentrat Super'
        ];

        $cowWeights = [
            'SP-2024-001' => 42.0,
            'SP-2024-002' => 37.5,
            'SP-2024-003' => 34.0,
            'SP-2024-004' => 29.0,
            'SP-2024-005' => 46.5,
            'SP-2024-006' => 48.5,
        ];

        for ($daysBack = 0; $daysBack < 14; $daysBack++) {
            foreach ($cows as $idx => $c) {
                $ideal = $cowWeights[$c['cowID']] ?? 35.0;
                $consumed = round($ideal * (rand(90, 105) / 100), 1);
                $leftover = max(0, round($ideal - $consumed, 1));
                
                $pagiKg = round($consumed * 0.4, 1);
                $siangKg = round($consumed * 0.3, 1);
                $soreKg = round($consumed - $pagiKg - $siangKg, 1);

                $pagiDur = rand(40, 50);
                $siangDur = rand(30, 45);
                $soreDur = rand(35, 50);
                $totalDur = $pagiDur + $siangDur + $soreDur;
                $hargaPerKg = 1500;
                $biayaHarian = round($consumed * $hargaPerKg);

                LogPakan::create([
                    'id_sapi' => $c['cowID'],
                    'id_tempat_makan' => $c['cowStationID'],
                    'komposisi_pakan' => $compositions[$idx % count($compositions)],
                    'pakan_awal' => $ideal,
                    'sisa_pakan' => $leftover,
                    'frekuensi_makan' => 3,
                    'kualitas_air' => 'pH 7.2 | Bersih',
                    'air_awal' => 45.0,
                    'sisa_air' => 5.0,
                    'harga_pakan_per_kg' => $hargaPerKg,
                    'biaya_pakan_harian' => $biayaHarian,
                    'tanggal_pencatatan' => now()->subDays($daysBack)->toDateString(),
                    'sesi_makan_1_jam' => '07:00',
                    'sesi_makan_1_durasi' => $pagiDur,
                    'sesi_makan_1_pakan' => $pagiKg,
                    'sesi_makan_2_jam' => '12:30',
                    'sesi_makan_2_durasi' => $siangDur,
                    'sesi_makan_2_pakan' => $siangKg,
                    'sesi_makan_3_jam' => '17:00',
                    'sesi_makan_3_durasi' => $soreDur,
                    'sesi_makan_3_pakan' => $soreKg,
                    'total_durasi_makan' => $totalDur,
                    'created_at' => now()->subDays($daysBack)->subHours(rand(1, 8))->addMinutes($idx * 10),
                    'updated_at' => now()->subDays($daysBack)->subHours(rand(1, 8))->addMinutes($idx * 10),
                ]);
            }
        }

        // 8. Catatan Riwayat Pemeriksaan Kesehatan Mantri
        $examNotes = [
            'Suhu tubuh normal (38.5°C), nafsu makan sangat baik, rumen bergerak aktif.',
            'Pemeriksaan rutin mantri: mata jernih, bulu bersih dan mengkilap, fisik prima.',
            'Vaksinasi booster PMK & vitamin B-Kompleks selesai diberikan, kondisi sehat.',
            'Observasi berkala: pertumbuhan bobot sesuai target, tidak ada tanda kembung.',
            'Pemberian obat cacing berkala, feses normal, pencernaan sehat sempurna.',
            'Pemeriksaan pasca-laktasi/reproduksi: kondisi ambing dan postur sangat baik.'
        ];

        foreach ($cows as $idx => $c) {
            RiwayatPemeriksaan::create([
                'id_sapi' => $c['cowID'],
                'catatan_diagnosa' => $examNotes[$idx % count($examNotes)],
                'tanggal_pemeriksaan' => now()->subDays($idx * 2)->toDateString(),
                'waktu_input' => now()->subDays($idx * 2)->toDateTimeString(),
            ]);
        }
    }
}
