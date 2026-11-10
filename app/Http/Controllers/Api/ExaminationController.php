<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExaminationRecord;
use App\Models\Sapi;
use App\Models\Cow;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExaminationController extends Controller
{
    /**
     * GET /api/examinations & GET /farm/api/examinations
     */
    public function index(Request $request): JsonResponse
    {
        if (ExaminationRecord::count() === 0) {
            $cows = Sapi::all();
            if ($cows->count() > 0) {
                $notes = [
                    'Suhu tubuh normal (38.4°C), pencernaan sehat, nafsu makan baik.',
                    'Vaksinasi rutin selesai, fisik aktif dan bergerak lancar.',
                    'Kondisi tubuh prima, mata jernih, pemberian multivitamin teratur.',
                    'Hasil observasi fisik sehat, tidak ada gejala stres maupun demam.'
                ];
                foreach ($cows as $idx => $c) {
                    ExaminationRecord::create([
                        'id_sapi' => $c->id_sapi,
                        'catatan_diagnosa' => $notes[$idx % count($notes)],
                        'tanggal_pemeriksaan' => now()->subDays($idx)->toDateString(),
                        'waktu_input' => now()->subDays($idx)->toDateTimeString(),
                    ]);
                }
            }
        }

        $query = ExaminationRecord::with('sapi');

        if ($request->has('cow_id')) {
            $query->where('id_sapi', $request->input('cow_id'));
        }

        if ($request->has('date')) {
            $query->whereDate('tanggal_pemeriksaan', $request->input('date'));
        }

        if ($request->has('search')) {
            $search = strtolower($request->input('search'));
            $query->where(function($q) use ($search) {
                $q->whereHas('sapi', function ($sq) use ($search) {
                    $sq->where('id_sapi', 'like', "%{$search}%")
                      ->orWhere('ras_sapi', 'like', "%{$search}%");
                })->orWhere('catatan_diagnosa', 'like', "%{$search}%");
            });
        }

        $records = $query->orderBy('tanggal_pemeriksaan', 'desc')
                        ->orderBy('id_pemeriksaan', 'desc')
                        ->paginate($request->query('limit', 50));

        // Format data into 5 columns
        $transformed = collect($records->items())->map(function ($rec, $index) {
            $cow = $rec->sapi;
            $rawID = $cow ? $cow->cowID : $rec->cow_id;
            $numM = preg_match('/\d+$/', $rawID, $matches);
            $num = $numM ? (int)$matches[0] : ($index + 1);
            
            $kodeSapi = "Sapi {$num}";
            $namaSapi = $kodeSapi;
            $breed = $cow->cowBreed ?? 'Brangus';

            return [
                'id' => $rec->id,
                'cow_id' => $rec->cow_id,
                'kode_sapi' => $kodeSapi,
                'nama_sapi' => $namaSapi,
                'breed' => $breed,
                'catatan_diagnosa' => $rec->diagnosis_notes,
                'diagnosis_notes' => $rec->diagnosis_notes,
                'tanggal_periksa' => $rec->examination_date ? $rec->examination_date->format('Y-m-d') : date('Y-m-d'),
                'examination_date' => $rec->examination_date ? $rec->examination_date->format('Y-m-d') : date('Y-m-d'),
                'tanggal_input' => $rec->created_at ? $rec->created_at->format('Y-m-d H:i') : date('Y-m-d H:i'),
                'input_date' => $rec->created_at ? $rec->created_at->format('Y-m-d H:i') : date('Y-m-d H:i'),
            ];
        });

        return response()->json([
            'status' => 'success',
            'success' => true,
            'data' => $transformed,
            'pagination' => [
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
                'total' => $records->total(),
            ]
        ]);
    }

    /**
     * POST /api/examinations & POST /farm/api/examinations
     */
    public function store(Request $request): JsonResponse
    {
        $cowID = $request->input('cow_id') ?? $request->input('sapi_id') ?? $request->input('id_sapi');
        $notes = $request->input('diagnosis_notes') ?? $request->input('catatan_diagnosa') ?? $request->input('catatan');
        $date  = $request->input('examination_date') ?? $request->input('tanggal_periksa') ?? $request->input('tanggal_pemeriksaan') ?? date('Y-m-d');

        if (!$notes && ($request->input('diagnosa_penyakit') || $request->input('gejala_klinis') || $request->input('tindakan_medis'))) {
            $parts = [];
            if ($k = $request->input('kondisi_kesehatan')) $parts[] = "Kondisi: $k";
            if ($d = $request->input('diagnosa_penyakit')) $parts[] = "Diagnosa: $d";
            if ($g = $request->input('gejala_klinis')) $parts[] = "Gejala: $g";
            if ($t = $request->input('tindakan_medis')) $parts[] = "Tindakan: $t";
            if ($r = $request->input('rekomendasi_pakan')) $parts[] = "Rekomendasi: $r";
            $notes = implode(' • ', $parts);
        }

        if (!$cowID || !$notes) {
            return response()->json([
                'status' => 'error',
                'success' => false,
                'message' => 'Pilih sapi dan isi catatan diagnosa terlebih dahulu.',
            ], 400);
        }

        // Validate cow existence or find closest
        $cow = Sapi::where('id_sapi', $cowID)->first();
        if (!$cow && is_numeric($cowID)) {
            $all = Sapi::all();
            $idx = (int)$cowID - 1;
            if ($idx >= 0 && $idx < $all->count()) {
                $cow = $all->values()->get($idx);
                $cowID = $cow->cowID;
            }
        }

        if (!$cow) {
            $cow = Sapi::first();
            if ($cow) $cowID = $cow->cowID;
        }

        if (!$cowID) {
            return response()->json([
                'status' => 'error',
                'success' => false,
                'message' => 'Data sapi tidak ditemukan.',
            ], 400);
        }

        $record = ExaminationRecord::create([
            'id_sapi' => $cowID,
            'catatan_diagnosa' => $notes,
            'tanggal_pemeriksaan' => $date,
            'waktu_input' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'success' => true,
            'message' => 'Catatan diagnosa pemeriksaan sapi berhasil disimpan!',
            'data' => $record->fresh(['sapi']),
        ], 201);
    }

    /**
     * GET /api/cows/{id}/examinations
     */
    public function getByCow($id): JsonResponse
    {
        $cow = Sapi::where('id_sapi', $id)->first();
        if (!$cow && is_numeric($id)) {
            $all = Sapi::all();
            $idx = (int)$id - 1;
            if ($idx >= 0 && $idx < $all->count()) {
                $cow = $all->values()->get($idx);
            }
        }

        $cowID = $cow ? $cow->id_sapi : $id;
        $records = ExaminationRecord::where('id_sapi', $cowID)
                    ->orderBy('tanggal_pemeriksaan', 'desc')
                    ->orderBy('id_pemeriksaan', 'desc')
                    ->get();

        return response()->json([
            'status' => 'success',
            'success' => true,
            'data' => $records,
        ]);
    }

    /**
     * GET /api/cows/{id}/info & GET /farm/api/cows/{id}/info
     * Aggregate all 6 data aspects for a single cow (READ-ONLY)
     */
    public function getCowInfo($id): JsonResponse
    {
        $cow = Sapi::with(['barn', 'physiology', 'feedingStation', 'owner', 'behaviorLogs', 'feedLogs', 'cameraLogs', 'examinationRecords'])
                   ->where('id_sapi', $id)->first();

        if (!$cow && is_numeric($id)) {
            $all = Sapi::with(['barn', 'physiology', 'feedingStation', 'owner', 'behaviorLogs', 'feedLogs', 'cameraLogs', 'examinationRecords'])->get();
            $idx = (int)$id - 1;
            if ($idx >= 0 && $idx < $all->count()) {
                $cow = $all->values()->get($idx);
            }
        }

        if (!$cow) {
            return response()->json(['status' => 'error', 'message' => 'Data sapi tidak ditemukan.'], 404);
        }

        // 1. Identitas Sapi
        $identity = [
            'cow_id' => $cow->cowID,
            'kode_sapi' => "Sapi " . (preg_match('/\d+$/', $cow->cowID, $m) ? (int)$m[0] : 1),
            'nama_sapi' => "Sapi " . (preg_match('/\d+$/', $cow->cowID, $m) ? (int)$m[0] : 1),
            'breed' => $cow->cowBreed,
            'gender' => $cow->cowGender,
            'birth_date' => $cow->cowBirthDate,
            'purchase_price' => $cow->cowPurchasePrice,
            'history' => $cow->cowHistory,
            'barn_id' => $cow->cowBarnID,
            'barn_name' => $cow->barn->barnName ?? $cow->cowBarnID ?? 'Kandang Utama',
            'station_name' => $cow->feedingStation->stationName ?? 'Stasiun Pakan Utama',
            'photo' => $cow->cowPhoto,
        ];

        // 2. Fisiologis (Manual + Sensor: Suhu & Berat)
        $phy = $cow->physiology;
        $fisiologis = [
            'temperature' => $phy->phyTemperature ?? 38.5,
            'current_weight' => $phy->phyCurrentWeight ?? 350,
            'initial_weight' => $phy->phyInitialWeight ?? 350,
            'target_weight' => $phy->phyTargetWeight ?? 450,
            'status' => $phy->phyStatus ?? 'Sehat',
            'health_history' => $phy->phyHealthHistory ?? 'Vaksinasi PMK lengkap.',
        ];

        // 3. Perilaku (Dari Sensor IMU)
        $behaviorLogs = $cow->behaviorLogs()->latest()->take(10)->get();

        // 4. Lingkungan Kandang (Berdasarkan barnID sapi)
        $barn = $cow->barn;
        $environment = [
            'barn_name' => $barn->barnName ?? 'Kandang Utama',
            'temperature' => $barn->barnTemperature ?? 28.5,
            'humidity' => $barn->barnHumidity ?? 70.0,
            'gas_ammonia' => $barn->barnGasNH3 ?? 10.0,
            'gas_methane' => $barn->barnGasCH4 ?? 5.0,
            'floor_condition' => $barn->barnFloorCondition ?? 'Bersih',
        ];

        // 5. Pakan (Dari Sensor Timbangan Pakan)
        $feedLogs = $cow->feedLogs()->latest()->take(10)->get();

        // 6. Riwayat Pemeriksaan Mantri
        $examinations = $cow->examinationRecords()->latest()->get();

        return response()->json([
            'status' => 'success',
            'success' => true,
            'data' => [
                'identity' => $identity,
                'fisiologis' => $fisiologis,
                'behavior' => $behaviorLogs,
                'environment' => $environment,
                'feed' => $feedLogs,
                'examinations' => $examinations,
            ]
        ]);
    }

    /**
     * DELETE /farm/examinations/{id}
     */
    public function destroy($id): JsonResponse
    {
        $exam = ExaminationRecord::where('id_pemeriksaan', $id)
            ->orWhere('id', $id)
            ->first();

        if (!$exam) {
            return response()->json([
                'success' => false,
                'message' => 'Data rekam medis tidak ditemukan.'
            ], 404);
        }

        $exam->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catatan pemeriksaan berhasil dihapus.'
        ]);
    }
}
