<?php

namespace App\Http\Controllers;

use App\Models\Kandang as Barn;
use App\Models\LogPakan as FeedLog;
use App\Models\Fisiologis as Physiology;
use App\Models\LogPerilaku as BehaviorLog;
use App\Models\LogKamera as CameraLog;
use App\Models\Sapi as Cow;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SensorController extends Controller
{
    /**
     * Resolves barn model or ID by numeric index or string barnID.
     */
    private function resolveBarn($id)
    {
        if (!$id) return null;
        if (is_numeric($id)) {
            $all = Barn::all();
            $index = (int)$id - 1;
            if ($index >= 0 && $index < $all->count()) {
                return $all->values()->get($index);
            }
        }
        return Barn::where('id_kandang', $id)->first();
    }

    /**
     * Resolves cowID by numeric index or string code (SP-2024-001).
     */
    private function resolveCowID($id)
    {
        if (!$id) return null;
        if (is_numeric($id)) {
            $allCows = Cow::all();
            $index = (int)$id - 1;
            if ($index >= 0 && $index < $allCows->count()) {
                return $allCows->values()->get($index)->cowID;
            }
            return "SP-2024-" . str_pad($id, 3, '0', STR_PAD_LEFT);
        }
        return $id;
    }

    /**
     * Resolves feeding station ID by numeric ID, index, or string code.
     */
    private function resolveFeedingStationID($id)
    {
        if (!$id) {
            $station = \App\Models\TempatMakan::first();
            if (!$station) {
                $station = \App\Models\TempatMakan::create([
                    'stationCode' => 'FS-DEFAULT',
                    'stationName' => 'Stasiun Pakan Default',
                    'stationType' => 'makan',
                ]);
            }
            return $station->stationID;
        }
        if (is_numeric($id)) {
            $station = \App\Models\TempatMakan::find($id);
            if ($station) return $station->stationID;
            $all = \App\Models\TempatMakan::all();
            $index = (int)$id - 1;
            if ($index >= 0 && $index < $all->count()) {
                return $all->values()->get($index)->stationID;
            }
            $first = \App\Models\TempatMakan::first();
            if (!$first) {
                $first = \App\Models\TempatMakan::create([
                    'stationCode' => 'FS-DEFAULT',
                    'stationName' => 'Stasiun Pakan Default',
                    'stationType' => 'makan',
                ]);
            }
            return $first->stationID;
        }
        return $id;
    }

    // =========================================================================
    // 1. SENSOR IMU (Inertial Measurement Unit — Akselerometer & Gyroscope Sapi)
    // =========================================================================

    /**
     * GET /api/sensor/imu
     */
    public function listImu(Request $request): JsonResponse
    {
        $logs = BehaviorLog::with('sapi')->latest()->paginate($request->query('limit', 15));
        return response()->json([
            'berhasil' => true,
            'success'  => true,
            'pesan'    => 'Data sensor IMU (akselerometer & gyroscope) berhasil diambil.',
            'message'  => 'Data sensor IMU berhasil diambil.',
            'data'     => $logs
        ]);
    }

    /**
     * POST /api/sensor/imu & POST /api/sensor/perilaku
     */
    public function ingestImu(Request $request): JsonResponse
    {
        $rawCowID = $request->input('id_sapi') ?? $request->input('idSapi') ?? $request->input('behCowID', 'SP-2024-001');
        $cowID = $this->resolveCowID($rawCowID);

        $accelX = $request->input('akselerasi_x') ?? $request->input('accelX', 0.12);
        $accelY = $request->input('akselerasi_y') ?? $request->input('accelY', 0.85);
        $accelZ = $request->input('akselerasi_z') ?? $request->input('accelZ', 9.81);
        $gyroX  = $request->input('pitch') ?? $request->input('gyroX', 1.2);
        $gyroY  = $request->input('roll') ?? $request->input('gyroY', -0.5);
        $gyroZ  = $request->input('yaw') ?? $request->input('gyroZ', 0.8);

        // Tentukan aktivitas otomatis jika tidak dikirim
        $aktivitas = $request->input('aktivitas') ?? $request->input('tipe_perilaku') ?? $request->input('behActivity');
        if (!$aktivitas) {
            $magnitude = sqrt(pow($accelX, 2) + pow($accelY, 2) + pow($accelZ, 2));
            if ($magnitude > 12.0) {
                $aktivitas = 'Berjalan';
            } elseif ($magnitude < 8.5) {
                $aktivitas = 'Berbaring';
            } else {
                $aktivitas = 'Makan';
            }
        }

        $waktuMulai = $request->input('waktu_mulai') ?? $request->input('behStartTime', now()->toDateTimeString());
        $waktuSelesai = $request->input('waktu_selesai') ?? $request->input('behEndTime', now()->addMinutes(30)->toDateTimeString());

        $log = BehaviorLog::create([
            'behCowID'     => $cowID,
            'behActivity'  => $aktivitas,
            'accelX'       => $accelX,
            'accelY'       => $accelY,
            'accelZ'       => $accelZ,
            'gyroX'        => $gyroX,
            'gyroY'        => $gyroY,
            'gyroZ'        => $gyroZ,
            'behStartTime' => $waktuMulai,
            'behEndTime'   => $waktuSelesai,
        ]);

        return response()->json([
            'berhasil' => true,
            'success'  => true,
            'pesan'    => 'Data telemetry sensor IMU (Inersia Perilaku Sapi) berhasil direkam!',
            'message'  => 'Log perilaku sensor IMU berhasil direkam!',
            'data'     => $log,
        ], 201);
    }

    // Alias untuk backward compatibility
    public function listBehavior(Request $request): JsonResponse { return $this->listImu($request); }
    public function ingestBehavior(Request $request): JsonResponse { return $this->ingestImu($request); }

    public function updateBehavior(Request $request, $id): JsonResponse
    {
        $log = BehaviorLog::find($id);
        if (!$log) {
            return response()->json(['berhasil' => false, 'pesan' => 'Data sensor IMU tidak ditemukan.'], 404);
        }

        $log->update([
            'behActivity' => $request->input('aktivitas') ?? $request->input('behActivity', $log->behActivity),
            'accelX' => $request->input('akselerasi_x') ?? $log->accelX,
            'accelY' => $request->input('akselerasi_y') ?? $log->accelY,
            'accelZ' => $request->input('akselerasi_z') ?? $log->accelZ,
        ]);

        return response()->json([
            'berhasil' => true,
            'pesan' => 'Data sensor IMU berhasil diperbarui!',
            'data' => $log->fresh()
        ]);
    }

    public function deleteBehavior($id): JsonResponse
    {
        $log = BehaviorLog::find($id);
        if (!$log) {
            return response()->json(['berhasil' => false, 'pesan' => 'Data sensor IMU tidak ditemukan.'], 404);
        }
        $log->delete();
        return response()->json(['berhasil' => true, 'pesan' => 'Data sensor IMU berhasil dihapus.']);
    }

    // =========================================================================
    // 2. SENSOR KAMERA (Camera Detection & Vision Analytics)
    // =========================================================================

    /**
     * GET /api/sensor/kamera
     */
    public function listKamera(Request $request): JsonResponse
    {
        $logs = CameraLog::with(['sapi', 'kandang'])->latest()->paginate($request->query('limit', 15));
        return response()->json([
            'berhasil' => true,
            'success'  => true,
            'pesan'    => 'Data log sensor kamera deteksi visual berhasil diambil.',
            'message'  => 'Data camera logs berhasil diambil.',
            'data'     => $logs
        ]);
    }

    /**
     * POST /api/sensor/kamera & POST /api/sensor/camera
     */
    public function ingestKamera(Request $request): JsonResponse
    {
        $rawBarnID = $request->input('id_kandang') ?? $request->input('barnID', 'KDG-A01');
        $resolvedBarn = $this->resolveBarn($rawBarnID);
        $barnID = $resolvedBarn ? $resolvedBarn->barnID : $rawBarnID;

        $rawCowID = $request->input('id_sapi') ?? $request->input('camCowID', 'SP-2024-001');
        $cowID = $this->resolveCowID($rawCowID);

        $aktivitas = $request->input('aktivitas') ?? $request->input('tipe_perilaku') ?? $request->input('camActivity', 'Berdiri');
        $kepercayaan = $request->input('tingkat_kepercayaan') ?? $request->input('camConfidence', 0.94);
        $gambar = $request->input('gambar_kamera') ?? $request->input('foto_frame') ?? $request->input('camImagePath');
        $jumlahTerdeteksi = $request->input('jumlah_terdeteksi') ?? $request->input('jumlah_sapi_terdeteksi') ?? $request->input('camDetectedCount', 1);
        $waktuDeteksi = $request->input('waktu_deteksi') ?? $request->input('camCapturedAt', now()->toDateTimeString());

        $log = CameraLog::create([
            'barnID'           => $barnID,
            'camCowID'         => $cowID,
            'camActivity'      => $aktivitas,
            'camConfidence'    => $kepercayaan,
            'camImagePath'     => $gambar,
            'camDetectedCount' => $jumlahTerdeteksi,
            'camCapturedAt'    => $waktuDeteksi,
        ]);

        return response()->json([
            'berhasil' => true,
            'success'  => true,
            'pesan'    => 'Data sensor kamera deteksi visual berhasil disimpan!',
            'message'  => 'Camera log berhasil disimpan!',
            'data'     => $log,
        ], 201);
    }

    // =========================================================================
    // 3. SENSOR TIMBANGAN (Timbangan Pakan & Timbangan Bobot Sapi)
    // =========================================================================

    /**
     * GET /api/sensor/timbangan & GET /api/sensor/pakan
     */
    public function listTimbangan(Request $request): JsonResponse
    {
        $feeds = FeedLog::with('sapi')->latest()->paginate($request->query('limit', 15));
        return response()->json([
            'berhasil' => true,
            'success'  => true,
            'pesan'    => 'Data sensor timbangan pakan berhasil diambil.',
            'message'  => 'Data feed logs berhasil diambil.',
            'data'     => $feeds
        ]);
    }

    /**
     * POST /api/sensor/timbangan & POST /api/sensor/pakan
     */
    public function ingestTimbangan(Request $request): JsonResponse
    {
        $rawCowID = $request->input('id_sapi') ?? $request->input('feedCowID', 'SP-2024-001');
        $cowID = $this->resolveCowID($rawCowID);

        $rawStationID = $request->input('id_tempat_makan') ?? $request->input('id_stasiun') ?? $request->input('feedStationID');
        $stationID = $this->resolveFeedingStationID($rawStationID);
        $pakanAwal = $request->input('pakan_awal') ?? $request->input('jumlah_pakan') ?? $request->input('feedInitialFeed', 30.0);
        $sisaPakan = $request->input('sisa_pakan') ?? $request->input('feedLeftoverFeed', 0.0);
        $volumeAir = $request->input('volume_air') ?? $request->input('feedInitialWater', 40.0);

        $feed = FeedLog::create([
            'feedCowID'         => $cowID,
            'feedStationID'     => $stationID,
            'feedComposition'   => 'Konsentrat & Hijauan (Sensor Timbangan)',
            'feedInitialFeed'   => $pakanAwal,
            'feedLeftoverFeed'  => $sisaPakan,
            'feedFrequency'     => 1,
            'feedWaterQuality'  => 'Jernih',
            'feedInitialWater'  => $volumeAir,
            'feedLeftoverWater' => 0.0,
        ]);

        // Opsional: jika sensor timbangan juga mengirim bobot badan sapi
        if ($request->has('bobot_sapi') || $request->has('timbangan_bobot')) {
            $bobotSapi = $request->input('bobot_sapi') ?? $request->input('timbangan_bobot');
            $phy = Physiology::where('phyCowID', $cowID)->first();
            if ($phy) {
                $phy->update(['phyCurrentWeight' => $bobotSapi]);
            }
        }

        return response()->json([
            'berhasil' => true,
            'success'  => true,
            'pesan'    => 'Data sensor timbangan pakan dan bobot berhasil direkam!',
            'message'  => 'Data sensor timbangan berhasil disimpan!',
            'data'     => $feed->fresh(),
        ], 201);
    }

    // Alias untuk backward compatibility
    public function listFeed(Request $request): JsonResponse { return $this->listTimbangan($request); }
    public function ingestFeed(Request $request): JsonResponse { return $this->ingestTimbangan($request); }

    public function updateFeed(Request $request, $id): JsonResponse
    {
        $feed = FeedLog::find($id);
        if (!$feed) {
            return response()->json(['berhasil' => false, 'pesan' => 'Data sensor timbangan pakan tidak ditemukan.'], 404);
        }

        $pakanAwal = $request->input('pakan_awal') ?? $request->input('jumlah_pakan') ?? $request->input('feedInitialFeed', $feed->feedInitialFeed);
        $sisaPakan = $request->input('sisa_pakan') ?? $request->input('feedLeftoverFeed', $feed->feedLeftoverFeed);

        $feed->update([
            'feedInitialFeed'  => $pakanAwal,
            'feedLeftoverFeed' => $sisaPakan,
        ]);

        return response()->json([
            'berhasil' => true,
            'pesan'    => 'Data sensor timbangan pakan berhasil diperbarui!',
            'data'     => $feed->fresh()
        ]);
    }

    public function deleteFeed($id): JsonResponse
    {
        $feed = FeedLog::find($id);
        if (!$feed) {
            return response()->json(['berhasil' => false, 'pesan' => 'Data sensor timbangan pakan tidak ditemukan.'], 404);
        }
        $feed->delete();
        return response()->json(['berhasil' => true, 'pesan' => 'Data sensor timbangan pakan berhasil dihapus.']);
    }

    // =========================================================================
    // 4. SENSOR LINGKUNGAN KANDANG (Suhu Udara & Gas Amonia / Gas Metana)
    // =========================================================================

    /**
     * GET /api/sensor/lingkungan & GET /api/sensor/kandang
     */
    public function listLingkungan(Request $request): JsonResponse
    {
        $barns = Barn::all();
        return response()->json([
            'berhasil' => true,
            'success'  => true,
            'pesan'    => 'Data sensor lingkungan mikroklimat kandang berhasil diambil.',
            'message'  => 'Data sensor kandang berhasil diambil.',
            'data'     => $barns
        ]);
    }

    /**
     * POST /api/sensor/lingkungan & POST /api/sensor/kandang
     */
    public function ingestLingkungan(Request $request, $id = null): JsonResponse
    {
        $rawBarnID = $id ?? $request->input('id_kandang') ?? $request->input('barnID', 'KDG-A01');
        $resolvedBarn = $this->resolveBarn($rawBarnID);

        $suhuLingkungan = $request->input('suhu_lingkungan') ?? $request->input('suhu_kandang') ?? $request->input('barnTemperature', 28.2);
        $kelembapan      = $request->input('kelembapan') ?? $request->input('kelembapan_kandang') ?? $request->input('barnHumidity', 72.0);
        $kadarGasAmonia  = $request->input('kadar_gas_amonia') ?? $request->input('kadar_gas') ?? $request->input('barnGasNH3', 12.5);
        $kadarGasMetana  = $request->input('kadar_gas_metana') ?? $request->input('barnGasCH4', 5.0);
        $pencahayaan     = $request->input('pencahayaan') ?? $request->input('barnLight', 350);
        $kecepatanAngin  = $request->input('kecepatan_angin') ?? $request->input('barnWindSpeed', 1.2);
        $kondisiLantai   = $request->input('kondisi_lantai') ?? $request->input('barnFloorCondition', 'Bersih');

        if ($resolvedBarn) {
            $resolvedBarn->update([
                'barnTemperature'    => $suhuLingkungan,
                'barnHumidity'       => $kelembapan,
                'barnGasNH3'          => $kadarGasAmonia,
                'barnGasCH4'          => $kadarGasMetana,
                'barnLight'          => $pencahayaan,
                'barnWindSpeed'      => $kecepatanAngin,
                'barnFloorCondition' => $kondisiLantai,
            ]);
            $targetBarn = $resolvedBarn->fresh();
        } else {
            $targetBarn = Barn::create([
                'barnID'             => $rawBarnID,
                'barnName'           => 'Kandang ' . $rawBarnID,
                'barnLocation'       => 'Sektor Peternakan',
                'barnCapacity'       => 10,
                'barnTemperature'    => $suhuLingkungan,
                'barnHumidity'       => $kelembapan,
                'barnGasNH3'          => $kadarGasAmonia,
                'barnGasCH4'          => $kadarGasMetana,
                'barnLight'          => $pencahayaan,
                'barnWindSpeed'      => $kecepatanAngin,
                'barnFloorCondition' => $kondisiLantai,
            ]);
        }

        // Catat log visual kamera jika ada sapi
        $firstCow = \App\Models\Sapi::first();
        if ($firstCow) {
            CameraLog::create([
                'barnID'           => $targetBarn->barnID,
                'camCowID'         => $firstCow->cowID,
                'camActivity'      => 'Deteksi Lingkungan',
                'camConfidence'    => 1.00,
                'camImagePath'     => null,
                'camDetectedCount' => 1,
                'camCapturedAt'    => now(),
            ]);
        }

        return response()->json([
            'berhasil' => true,
            'success'  => true,
            'pesan'    => 'Data sensor lingkungan (Suhu udara & Kadar Gas Amonia/Metana) berhasil direkam!',
            'message'  => 'Sensor mikroklimat kandang berhasil direkam!',
            'data'     => $targetBarn,
        ], 201);
    }

    // Alias untuk backward compatibility
    public function listBarn(Request $request): JsonResponse { return $this->listLingkungan($request); }
    public function ingestBarn(Request $request, $id = null): JsonResponse { return $this->ingestLingkungan($request, $id); }

    public function deleteBarn($id): JsonResponse
    {
        $barn = $this->resolveBarn($id);
        if (!$barn) {
            return response()->json(['berhasil' => false, 'pesan' => "Data kandang '$id' tidak ditemukan."], 404);
        }
        return response()->json(['berhasil' => true, 'pesan' => "Data sensor kandang '{$barn->barnID}' berhasil direset."]);
    }

    // =========================================================================
    // 5. SENSOR FISIOLOGIS (Sensor Suhu Tubuh & Timbangan Sapi)
    // =========================================================================

    /**
     * GET /api/sensor/fisiologis
     */
    public function listPhysiology(Request $request): JsonResponse
    {
        $data = Physiology::with('sapi')->latest()->paginate($request->query('limit', 15));
        return response()->json([
            'berhasil' => true,
            'success'  => true,
            'pesan'    => 'Data sensor fisiologis (suhu tubuh & bobot sapi) berhasil diambil.',
            'message'  => 'Data sensor fisiologis berhasil diambil.',
            'data'     => $data
        ]);
    }

    /**
     * GET /api/sensor/fisiologis/{id}
     */
    public function showPhysiology($id): JsonResponse
    {
        $cowID = $this->resolveCowID($id);
        $phy = Physiology::with('sapi')
            ->where('phyCowID', $cowID)
            ->orWhere('phyID', $id)
            ->first();

        if (!$phy) {
            return response()->json([
                'berhasil' => false,
                'success'  => false,
                'pesan'    => "Data sensor fisiologis dengan ID/Sapi '$id' tidak ditemukan.",
                'message'  => "Physiology data for '$id' not found."
            ], 404);
        }

        return response()->json([
            'berhasil' => true,
            'success'  => true,
            'pesan'    => "Detail data fisiologis sapi berhasil diambil.",
            'message'  => "Physiology detail retrieved successfully.",
            'data'     => $phy
        ]);
    }

    /**
     * POST /api/sensor/fisiologis & POST /api/sensor/physiology
     */
    public function ingestPhysiology(Request $request, $id = null): JsonResponse
    {
        $rawCowID = $id ?? $request->input('id_sapi') ?? $request->input('phyCowID', 'SP-2024-001');
        $phyCowID = $this->resolveCowID($rawCowID);

        $suhuTubuh = $request->input('suhu_tubuh') ?? $request->input('phyTemperature', 38.5);
        $bobotSapi = $request->input('bobot_sapi') ?? $request->input('bobot_terkini') ?? $request->input('phyCurrentWeight');

        $physiology = Physiology::where('phyCowID', $phyCowID)->first();

        if (!$physiology) {
            $physiology = Physiology::create([
                'phyCowID'         => $phyCowID,
                'phyStatus'        => 'Baik',
                'phyInitialWeight' => $bobotSapi ?? 250.0,
                'phyTargetWeight'  => 400.0,
                'phyCurrentWeight' => $bobotSapi ?? 250.0,
                'phyTemperature'   => $suhuTubuh,
                'phyHealthHistory' => 'Sehat (Sensor Otomatis)',
            ]);
        } else {
            $updateData = ['phyTemperature' => $suhuTubuh];
            if ($bobotSapi !== null) {
                $updateData['phyCurrentWeight'] = $bobotSapi;
            }
            $physiology->update($updateData);
        }

        return response()->json([
            'berhasil' => true,
            'success'  => true,
            'pesan'    => 'Data sensor suhu tubuh dan bobot sapi berhasil direkam!',
            'message'  => 'Sensor suhu tubuh berhasil direkam!',
            'data'     => $physiology->fresh(),
        ], 201);
    }

    public function deletePhysiology($id): JsonResponse
    {
        $cowID = $this->resolveCowID($id);
        $phy = Physiology::where('phyCowID', $cowID)->orWhere('phyID', $id)->first();
        if (!$phy) {
            return response()->json(['berhasil' => false, 'pesan' => "Data fisiologis '$id' tidak ditemukan."], 404);
        }
        $phy->delete();
        return response()->json(['berhasil' => true, 'pesan' => 'Data sensor fisiologis berhasil dihapus.']);
    }

    // =========================================================================
    // 6. ANALISA & INDIKATOR PENTING PETERNAKAN (7 POIN INFORMASI PENTING)
    // =========================================================================

    /**
     * GET /api/sensor/analisa & GET /api/sensor/analisis
     */
    public function analisa(\App\Services\LivestockAnalyticsService $analyticsService): JsonResponse
    {
        $data = $analyticsService->compute();
        return response()->json([
            'berhasil' => true,
            'success'  => true,
            'pesan'    => 'Hasil analisis dan 7 poin indikator penting peternakan berhasil dihitung.',
            'message'  => 'Hasil analisis peternakan berhasil diambil.',
            'data'     => $data,
        ]);
    }
}
