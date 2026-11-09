<?php

namespace App\Http\Controllers;

use App\Models\Cow;
use App\Models\Sapi;
use App\Models\Barn;
use App\Models\Kandang;
use App\Models\Physiology;
use App\Models\Fisiologis;
use App\Models\BehaviorLog;
use App\Models\LogPerilaku;
use App\Models\DataPerilaku;
use App\Models\FeedLog;
use App\Models\LogPakan;
use App\Models\FeedingStation;
use App\Models\TempatMakan;
use App\Models\CameraLog;
use App\Models\LogKamera;
use App\Models\ExaminationRecord;
use App\Models\RiwayatPemeriksaan;
use App\Models\User;
use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class FarmController extends Controller
{
    /**
     * Display the main farm dashboard page.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Farm/Index', [
            'authUser' => $request->user(),
            'auth' => [
                'user' => $request->user(),
            ],
        ]);
    }

    /**
     * Helper to return standard paginated JSON response.
     */
    private function paginatedResponse($query, Request $request): JsonResponse
    {
        $limit  = min(max((int) $request->query('limit', 10), 1), 100);
        $offset = max((int) $request->query('offset', 0), 0);
        $total  = (clone $query)->count();
        $data   = (clone $query)->skip($offset)->take($limit)->get();

        return response()->json([
            'data'   => $data,
            'total'  => $total,
            'limit'  => $limit,
            'offset' => $offset,
        ]);
    }

    /**
     * Apply sorting rules to a query.
     */
    private function applySort(
        Request $request,
        Builder $query,
        string $timeColumn,
        string $azColumn
    ): void {
        $sort = $request->query('sort', 'terbaru');

        switch ($sort) {
            case 'terlama':
                $query->orderBy($timeColumn, 'asc');
                break;
            case 'az':
                $query->orderBy($azColumn, 'asc');
                break;
            case 'za':
                $query->orderBy($azColumn, 'desc');
                break;
            default:
                $query->orderBy($timeColumn, 'desc');
        }
    }

    public function listCows(Request $request): JsonResponse
    {
        $query = Cow::with([
            'kandang',
            'pemilik',
            'fisiologis',
            'tempatMakan',
            'dataPerilaku' => function ($q) {
                $q->latest('waktu_mulai')->latest('created_at')->take(20);
            },
            'dataPakan' => function ($q) {
                $q->latest('tanggal_pencatatan')->latest('created_at')->take(20);
            },
            'riwayatPemeriksaan' => function ($q) {
                $q->latest('tanggal_pemeriksaan')->latest('created_at');
            }
        ]);

        // Pembatasan hak akses: Peternak hanya dapat melihat sapi miliknya sendiri
        if ($request->user() && $request->user()->role === 'peternak') {
            $query->where('id_pemilik', $request->user()->id);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('id_sapi', 'like', "%{$search}%")
                    ->orWhere('ras_sapi', 'like', "%{$search}%")
                    ->orWhere('riwayat_sapi', 'like', "%{$search}%");
            });
        }

        if ($breed = $request->query('breed')) {
            $query->where('ras_sapi', $breed);
        }

        if ($gender = $request->query('gender')) {
            $query->where('jenis_kelamin', $gender);
        }

        $this->applySort($request, $query, 'created_at', 'ras_sapi');

        return $this->paginatedResponse($query, $request);
    }

    public function listCowBreeds(): JsonResponse
    {
        $breeds = Cow::whereNotNull('ras_sapi')
            ->where('ras_sapi', '!=', '')
            ->distinct()
            ->orderBy('ras_sapi')
            ->pluck('ras_sapi');

        return response()->json($breeds);
    }

    public function listPhysiology(Request $request): JsonResponse
    {
        $query = Physiology::with('sapi');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('id_sapi', 'like', "%{$search}%")
                    ->orWhere('status_fisiologis', 'like', "%{$search}%")
                    ->orWhereHas('sapi', function ($sq) use ($search) {
                        $sq->where('ras_sapi', 'like', "%{$search}%");
                    });
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status_fisiologis', $status);
        }

        if ($date = $request->query('date')) {
            $query->where(function ($dq) use ($date) {
                $dq->whereDate('tanggal_pencatatan', $date)
                   ->orWhereDate('created_at', $date);
            });
        }

        $this->applySort($request, $query, 'created_at', 'id_sapi');

        return $this->paginatedResponse($query, $request);
    }

    public function listBehavior(Request $request): JsonResponse
    {
        $query = BehaviorLog::with('sapi');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('id_sapi', 'like', "%{$search}%")
                    ->orWhere('aktivitas', 'like', "%{$search}%")
                    ->orWhereHas('sapi', function ($sq) use ($search) {
                        $sq->where('ras_sapi', 'like', "%{$search}%")
                           ->orWhere('id_sapi', 'like', "%{$search}%");
                    });
            });
        }

        if ($activity = $request->query('activity')) {
            $query->where('aktivitas', $activity);
        }

        if ($date = $request->query('date')) {
            $query->where(function ($dq) use ($date) {
                $dq->whereDate('waktu_mulai', $date)
                   ->orWhereDate('created_at', $date);
            });
        }

        $this->applySort($request, $query, 'waktu_mulai', 'aktivitas');

        return $this->paginatedResponse($query, $request);
    }

    public function listBarns(Request $request): JsonResponse
    {
        $query = Barn::with(['sapi', 'kamera']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_kandang', 'like', "%{$search}%")
                    ->orWhere('lokasi_kandang', 'like', "%{$search}%");
            });
        }

        $this->applySort($request, $query, 'created_at', 'nama_kandang');

        return $this->paginatedResponse($query, $request);
    }

    public function listFeed(Request $request): JsonResponse
    {
        $query = FeedLog::with(['sapi', 'tempatMakan']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('id_sapi', 'like', "%{$search}%")
                    ->orWhere('komposisi_pakan', 'like', "%{$search}%")
                    ->orWhereHas('sapi', function ($sq) use ($search) {
                        $sq->where('ras_sapi', 'like', "%{$search}%")
                           ->orWhere('id_sapi', 'like', "%{$search}%");
                    });
            });
        }

        if ($date = $request->query('date')) {
            $query->where(function ($dq) use ($date) {
                $dq->whereDate('tanggal_pencatatan', $date)
                   ->orWhereDate('created_at', $date);
            });
        }

        $this->applySort($request, $query, 'created_at', 'id_sapi');

        return $this->paginatedResponse($query, $request);
    }

    public function listFeedingStations(Request $request): JsonResponse
    {
        $query = FeedingStation::with('kandang');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_tempat_makan', 'like', "%{$search}%")
                    ->orWhere('tipe_tempat_makan', 'like', "%{$search}%");
            });
        }

        $this->applySort($request, $query, 'created_at', 'nama_tempat_makan');

        return $this->paginatedResponse($query, $request);
    }

    public function listOptionsCows(): JsonResponse
    {
        $cows = Cow::with([
            'kandang',
            'fisiologis',
            'behaviorLogs' => fn($q) => $q->orderByDesc('waktu_mulai')->orderByDesc('created_at'),
            'dataPerilaku' => fn($q) => $q->orderByDesc('waktu_mulai')->orderByDesc('created_at')
        ])->get();
        return response()->json(['data' => $cows]);
    }

    public function optionCows(): JsonResponse
    {
        return $this->listOptionsCows();
    }

    public function listOptionsBarns(): JsonResponse
    {
        $barns = Barn::all();
        return response()->json(['data' => $barns]);
    }

    public function optionBarns(): JsonResponse
    {
        return $this->listOptionsBarns();
    }

    public function listOptionsOwners(): JsonResponse
    {
        $owners = \App\Models\User::where('role', 'peternak')->get(['id', 'name', 'email']);
        return response()->json(['data' => $owners]);
    }

    public function listOptionsFeedingStations(): JsonResponse
    {
        $stations = FeedingStation::with('kandang')->get();
        return response()->json(['data' => $stations]);
    }

    public function optionStations(): JsonResponse
    {
        return $this->listOptionsFeedingStations();
    }

    public function dashboardStats(Request $request): JsonResponse
    {
        $dateParam   = $request->query('date');
        $cows        = Cow::with(['fisiologis', 'physiology', 'tempatMakan', 'feedingStation', 'kandang'])->get();
        $barnsQuery  = Barn::with(['sapi.fisiologis', 'sapi.physiology', 'sapi.tempatMakan', 'sapi.feedingStation'])->get();
        $physiology  = Physiology::all();
        $behavior    = BehaviorLog::all();
        $feed        = FeedLog::all();
        $today       = $dateParam ? \Carbon\Carbon::parse($dateParam)->toDateString() : now()->toDateString();

        $avgCowTemp = $physiology->avg('suhu_tubuh');
        $avgBarnTemp = $barnsQuery->avg('suhu_kandang') ? round($barnsQuery->avg('suhu_kandang'), 1) : 28.2;
        $avgBarnHumidity = $barnsQuery->avg('kelembapan_kandang') ? round($barnsQuery->avg('kelembapan_kandang'), 1) : 72.0;

        $totalFeedConsumed = $feed->sum('jumlah_pakan');
        $totalWaterConsumed = 45.0;

        $eatCountToday = $behavior->filter(
            fn ($b) => $b->aktivitas === 'Makan' && $b->waktu_mulai && \Carbon\Carbon::parse($b->waktu_mulai)->toDateString() === $today
        )->count();

        $activitiesToday = $behavior->filter(
            fn ($b) => $b->waktu_mulai && \Carbon\Carbon::parse($b->waktu_mulai)->toDateString() === $today
        )->count();

        $abnormalCount = $physiology->filter(
            fn ($p) => ($p->suhu_tubuh ?? 0) > 39.5 || ($p->suhu_tubuh ?? 0) < 37.5
        )->count();

        $dirtyBarns = $barnsQuery->filter(fn($b) => strtolower($b->kondisi_lantai ?? '') === 'kotor')->count();

        $recentBehavior = BehaviorLog::with('sapi')->orderByDesc('waktu_mulai')->take(5)->get();

        $barnsData = $barnsQuery->map(function ($barn) {
            $barnCows = $barn->sapi ?? collect();
            $cowTemps = $barnCows->map(fn($c) => optional($c->fisiologis)->suhu_tubuh ?? optional($c->physiology)->phyTemperature)->filter();
            $cowWeights = $barnCows->map(fn($c) => optional($c->fisiologis)->bobot_terkini ?? optional($c->physiology)->phyCurrentWeight)->filter();

            return [
                'id_kandang'          => $barn->id_kandang,
                'barnID'              => $barn->id_kandang,
                'nama_kandang'        => $barn->nama_kandang,
                'barnName'            => $barn->nama_kandang,
                'lokasi_kandang'      => $barn->lokasi_kandang,
                'barnLocation'        => $barn->lokasi_kandang,
                'kapasitas_kandang'   => $barn->kapasitas_kandang ?? 10,
                'barnCapacity'        => $barn->kapasitas_kandang ?? 10,
                'suhu_kandang'        => $barn->suhu_kandang ?? 28.2,
                'barnTemperature'     => $barn->suhu_kandang ?? 28.2,
                'kelembapan_kandang'  => $barn->kelembapan_kandang ?? 72.0,
                'barnHumidity'        => $barn->kelembapan_kandang ?? 72.0,
                'kondisi_lantai'      => $barn->kondisi_lantai ?? 'Bersih',
                'barnFloorCondition'  => $barn->kondisi_lantai ?? 'Bersih',
                'pencahayaan'         => $barn->pencahayaan ?? 220,
                'kecepatan_angin'     => $barn->kecepatan_angin ?? 1.1,
                'totalCows'           => $barnCows->count(),
                'total_sapi'          => $barnCows->count(),
                'avgCowTemp'          => $cowTemps->count() > 0 ? round($cowTemps->avg(), 1) : null,
                'avgWeight'           => $cowWeights->count() > 0 ? round($cowWeights->avg(), 1) : null,
                'cows'                => $barnCows,
            ];
        });

        return response()->json([
            'totalCows'          => $cows->count(),
            'maleCows'           => $cows->where('jenis_kelamin', 'Jantan')->count(),
            'femaleCows'         => $cows->where('jenis_kelamin', 'Betina')->count(),
            'totalBarns'         => $barnsData->count(),
            'avgCowTemp'         => $avgCowTemp ? round($avgCowTemp, 1) : null,
            'avgBarnTemp'        => $avgBarnTemp,
            'avgBarnHumidity'    => $avgBarnHumidity,
            'totalFeedConsumed'  => round($totalFeedConsumed, 1),
            'totalWaterConsumed' => round($totalWaterConsumed, 1),
            'eatCountToday'      => $eatCountToday,
            'activitiesToday'    => $activitiesToday,
            'abnormalCount'      => $abnormalCount,
            'dirtyBarns'         => $dirtyBarns,
            'recentBehavior'     => $recentBehavior,
            'barns'              => $barnsData,
            'cows'               => $cows,
            'analytics'          => (new \App\Services\LivestockAnalyticsService())->compute($dateParam),
        ]);
    }

    // ==========================================
    // MODUL 1: DATA IDENTITAS SAPI
    // ==========================================
    private function processCowPhoto(Request $request, ?string $existingPhoto = null): ?string
    {
        $file = $request->file('foto_sapi') ?? $request->file('cowPhoto');
        if ($file && $file->isValid()) {
            $path = $file->store('cows', 'public');
            return '/storage/' . $path;
        }

        $photoInput = $request->input('cowPhoto') ?? $request->input('foto_sapi');
        if (!empty($photoInput) && is_string($photoInput)) {
            if (str_starts_with($photoInput, 'data:image/')) {
                try {
                    preg_match('/data:image\/(?<type>\w+);base64,(?<data>.+)/i', $photoInput, $matches);
                    if (!empty($matches['data'])) {
                        $image = base64_decode($matches['data']);
                        $type = strtolower($matches['type']) === 'png' ? 'png' : 'jpg';
                        $filename = 'cows/' . Str::random(25) . '.' . $type;
                        Storage::disk('public')->put($filename, $image);
                        return '/storage/' . $filename;
                    }
                } catch (\Throwable $e) {
                    return $photoInput;
                }
            }
            return $photoInput;
        }

        return $existingPhoto;
    }

    public function storeCow(Request $request)
    {
        if ($request->user() && !in_array($request->user()->role, ['peternak', 'admin'])) {
            return redirect()->back()->withErrors(['akses' => 'Akses ditolak: Hanya Peternak atau Admin yang dapat mendaftarkan sapi baru.']);
        }

        $gender = $request->input('cowGender', $request->input('jenis_kelamin', $request->input('jenis_kelamin_sapi', 'Jantan')));
        $birthDate = $request->input('cowBirthDate', $request->input('tanggal_lahir', $request->input('tanggal_lahir_sapi')));
        $breed = $request->input('cowBreed', $request->input('ras_sapi'));
        $history = $request->input('cowHistory', $request->input('riwayat_sapi'));
        $photo = $this->processCowPhoto($request);
        $barnID = $request->input('cowBarnID', $request->input('id_kandang'));
        $ownerID = $request->input('cowOwnerID', $request->input('id_pemilik'));
        $price = $request->input('cowPurchasePrice', $request->input('harga_beli', $request->input('harga_beli_sapi')));
        $stationID = $request->input('cowStationID', $request->input('id_tempat_makan'));

        // Resolve barnID safely
        if ($barnID) {
            $barnObj = Kandang::where('id_kandang', $barnID)->orWhere('nama_kandang', $barnID)->first();
            if ($barnObj) {
                $barnID = $barnObj->id_kandang;
            } else {
                $defaultBarn = Kandang::first();
                $barnID = $defaultBarn ? $defaultBarn->id_kandang : $barnID;
            }
        } else {
            $defaultBarn = Kandang::first();
            $barnID = $defaultBarn ? $defaultBarn->id_kandang : 'KDG-A01';
        }

        // Resolve stationID safely
        if ($stationID) {
            if (is_numeric($stationID)) {
                $stationObj = TempatMakan::find($stationID);
            } else {
                $stationObj = TempatMakan::where('kode_tempat_makan', $stationID)
                    ->orWhere('nama_tempat_makan', 'like', "%{$stationID}%")
                    ->first();
            }
            $stationID = $stationObj ? $stationObj->id_tempat_makan : null;
        } else {
            $defaultStation = TempatMakan::first();
            $stationID = $defaultStation ? $defaultStation->id_tempat_makan : null;
        }

        $requestedCode = $request->input('cowCode', $request->input('id_sapi', $request->input('kode_sapi')));
        if (!empty($requestedCode) && trim($requestedCode) !== '' && !Sapi::where('id_sapi', strtoupper(trim($requestedCode)))->exists()) {
            $cowID = strtoupper(trim($requestedCode));
        } else {
            $year = date('Y');
            $count = Sapi::count() + 1;
            do {
                $cowID = 'SP-' . $year . '-' . str_pad((string)$count, 3, '0', STR_PAD_LEFT);
                $count++;
            } while (Sapi::where('id_sapi', $cowID)->exists());
        }

        if ($request->user() && $request->user()->role === 'peternak') {
            $ownerID = $request->user()->id;
        }

        $purchaseDate = $request->input('cowPurchaseDate', $request->input('tanggal_beli', $birthDate));
        $maintenanceStatus = $request->input('cowMaintenanceStatus', $request->input('status_pemeliharaan', 'Dipelihara'));
        $initWeight = $request->input('cowInitialWeight', $request->input('bobot_awal', $request->input('berat_awal_beli', 200)));
        $targetWeight = $request->input('cowTargetWeight', $request->input('bobot_target', $request->input('target_berat_jual', 500)));

        Sapi::create([
            'id_sapi' => $cowID,
            'ras_sapi' => $breed,
            'jenis_kelamin' => $gender,
            'tanggal_lahir' => $birthDate ?: null,
            'tanggal_beli' => $purchaseDate ?: null,
            'harga_beli' => ($price !== null && $price !== '') ? (float) $price : null,
            'berat_awal_beli' => ($initWeight !== null && $initWeight !== '') ? (float) $initWeight : 200,
            'target_berat_jual' => ($targetWeight !== null && $targetWeight !== '') ? (float) $targetWeight : 500,
            'status_pemeliharaan' => $maintenanceStatus ?: 'Dipelihara',
            'id_kandang' => $barnID,
            'id_tempat_makan' => $stationID,
            'id_pemilik' => $ownerID,
            'foto_sapi' => $photo,
            'riwayat_sapi' => $history ?: null,
        ]);

        $phyStatus = $request->input('cowPhysiologyStatus', $request->input('status_fisiologis', 'Normal'));
        $healthHistory = $request->input('cowHealthHistory', $request->input('riwayat_kesehatan'));

        Fisiologis::create([
            'id_sapi' => $cowID,
            'status_fisiologis' => $phyStatus ?: 'Normal',
            'bobot_awal' => ($initWeight !== null && $initWeight !== '') ? (float) $initWeight : null,
            'bobot_target' => ($targetWeight !== null && $targetWeight !== '') ? (float) $targetWeight : null,
            'bobot_terkini' => ($initWeight !== null && $initWeight !== '') ? (float) $initWeight : null,
            'suhu_tubuh' => 38.5,
            'riwayat_kesehatan' => $healthHistory ?: null,
            'tanggal_pencatatan' => $purchaseDate ?: now()->toDateString(),
            'jam_pengukuran' => '08:00',
            'jenis_pencatatan' => 'Berat Awal Pembelian',
        ]);

        return redirect()->back()->with('success', "Data sapi baru ({$cowID}) berhasil disimpan!");
    }

    public function updateCow(Request $request, string $id)
    {
        if ($request->user() && !in_array($request->user()->role, ['peternak', 'admin'])) {
            return redirect()->back()->withErrors(['akses' => 'Akses ditolak: Hanya Peternak atau Admin yang dapat memperbarui data sapi.']);
        }

        $cow = Sapi::where('id_sapi', $id)->first() ?? Sapi::find($id);
        if (!$cow) {
            return redirect()->back()->withErrors(['error' => 'Data sapi tidak ditemukan.']);
        }

        // Validasi hak akses: Peternak hanya dapat memperbarui sapi miliknya sendiri
        if ($request->user() && $request->user()->role === 'peternak' && $cow->id_pemilik && $cow->id_pemilik != $request->user()->id) {
            return redirect()->back()->withErrors(['akses' => 'Akses ditolak: Anda hanya dapat memperbarui data sapi milik Anda sendiri.']);
        }

        $gender = $request->input('cowGender', $request->input('jenis_kelamin', $request->input('jenis_kelamin_sapi', $cow->jenis_kelamin)));
        $birthDate = $request->input('cowBirthDate', $request->input('tanggal_lahir', $request->input('tanggal_lahir_sapi', $cow->tanggal_lahir)));
        $purchaseDate = $request->input('cowPurchaseDate', $request->input('tanggal_beli', $cow->tanggal_beli ?? $birthDate));
        $maintenanceStatus = $request->input('cowMaintenanceStatus', $request->input('status_pemeliharaan', $cow->status_pemeliharaan ?? 'Dipelihara'));
        $breed = $request->input('cowBreed', $request->input('ras_sapi', $cow->ras_sapi));
        $history = $request->input('cowHistory', $request->input('riwayat_sapi', $cow->riwayat_sapi));
        $photo = $this->processCowPhoto($request, $cow->foto_sapi);
        $barnID = $request->input('cowBarnID', $request->input('id_kandang', $cow->id_kandang));
        $ownerID = $request->input('cowOwnerID', $request->input('id_pemilik', $cow->id_pemilik));
        $price = $request->input('cowPurchasePrice', $request->input('harga_beli', $request->input('harga_beli_sapi', $cow->harga_beli)));
        $stationID = $request->input('cowStationID', $request->input('id_tempat_makan', $cow->id_tempat_makan));
        $initWeight = $request->input('cowInitialWeight', $request->input('bobot_awal', $request->input('berat_awal_beli', $cow->berat_awal_beli ?? 200)));
        $targetWeight = $request->input('cowTargetWeight', $request->input('bobot_target', $request->input('target_berat_jual', $cow->target_berat_jual ?? 500)));

        if ($barnID) {
            $barnObj = Kandang::where('id_kandang', $barnID)->orWhere('nama_kandang', $barnID)->first();
            if ($barnObj) {
                $barnID = $barnObj->id_kandang;
            }
        }

        if ($stationID) {
            if (is_numeric($stationID)) {
                $stationObj = TempatMakan::find($stationID);
            } else {
                $stationObj = TempatMakan::where('kode_tempat_makan', $stationID)
                    ->orWhere('nama_tempat_makan', 'like', "%{$stationID}%")
                    ->first();
            }
            $stationID = $stationObj ? $stationObj->id_tempat_makan : $cow->id_tempat_makan;
        }

        if ($request->user() && $request->user()->role === 'peternak') {
            $ownerID = $request->user()->id;
        }

        $cow->update([
            'ras_sapi' => $breed,
            'jenis_kelamin' => $gender,
            'tanggal_lahir' => $birthDate ?: null,
            'tanggal_beli' => $purchaseDate ?: null,
            'harga_beli' => ($price !== null && $price !== '') ? (float) $price : null,
            'berat_awal_beli' => ($initWeight !== null && $initWeight !== '') ? (float) $initWeight : 200,
            'target_berat_jual' => ($targetWeight !== null && $targetWeight !== '') ? (float) $targetWeight : 500,
            'status_pemeliharaan' => $maintenanceStatus ?: 'Dipelihara',
            'id_kandang' => $barnID,
            'id_tempat_makan' => $stationID,
            'id_pemilik' => $ownerID,
            'foto_sapi' => $photo,
            'riwayat_sapi' => $history ?: null,
        ]);

        $phyStatus = $request->input('cowPhysiologyStatus', $request->input('status_fisiologis'));
        $initWeight = $request->input('cowInitialWeight', $request->input('bobot_awal'));
        $targetWeight = $request->input('cowTargetWeight', $request->input('bobot_target'));
        $healthHistory = $request->input('cowHealthHistory', $request->input('riwayat_kesehatan'));

        $phy = Fisiologis::where('id_sapi', $cow->id_sapi)->first();
        if ($phy) {
            $phyUpdates = [];
            if ($phyStatus !== null) $phyUpdates['status_fisiologis'] = $phyStatus;
            if ($initWeight !== null && $initWeight !== '') $phyUpdates['bobot_awal'] = (float) $initWeight;
            if ($targetWeight !== null && $targetWeight !== '') $phyUpdates['bobot_target'] = (float) $targetWeight;
            if ($healthHistory !== null) $phyUpdates['riwayat_kesehatan'] = $healthHistory;
            if (!empty($phyUpdates)) {
                $phy->update($phyUpdates);
            }
        } else {
            Fisiologis::create([
                'id_sapi' => $cow->id_sapi,
                'status_fisiologis' => $phyStatus ?: 'Normal',
                'bobot_awal' => ($initWeight !== null && $initWeight !== '') ? (float) $initWeight : null,
                'bobot_target' => ($targetWeight !== null && $targetWeight !== '') ? (float) $targetWeight : null,
                'bobot_terkini' => ($initWeight !== null && $initWeight !== '') ? (float) $initWeight : null,
                'suhu_tubuh' => 38.5,
                'riwayat_kesehatan' => $healthHistory ?: null,
            ]);
        }

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'message' => 'Data sapi berhasil diperbarui!',
                'photo' => $photo,
                'data' => $cow->fresh(['kandang', 'fisiologis', 'tempatMakan']),
            ]);
        }

        return redirect()->back()->with('success', 'Data sapi berhasil diperbarui!');
    }

    public function destroyCow(Request $request, string $id)
    {
        if ($request->user() && !in_array($request->user()->role, ['peternak', 'admin'])) {
            $msg = 'Akses ditolak: Hanya Peternak atau Admin yang dapat menghapus data sapi.';
            if ($request->wantsJson() && !$request->header('X-Inertia')) {
                return response()->json(['success' => false, 'message' => $msg], 403);
            }
            return redirect()->back()->withErrors(['akses' => $msg]);
        }

        $cow = Sapi::where('id_sapi', $id)->first() ?? Sapi::find($id);
        if (!$cow) {
            $msg = 'Data sapi tidak ditemukan.';
            if ($request->wantsJson() && !$request->header('X-Inertia')) {
                return response()->json(['success' => false, 'message' => $msg], 404);
            }
            return redirect()->back()->withErrors(['error' => $msg]);
        }

        // Validasi hak akses: Peternak hanya dapat menghapus sapi miliknya sendiri
        if ($request->user() && $request->user()->role === 'peternak' && $cow->id_pemilik && $cow->id_pemilik != $request->user()->id) {
            $msg = 'Akses ditolak: Anda hanya dapat menghapus data sapi milik Anda sendiri.';
            if ($request->wantsJson() && !$request->header('X-Inertia')) {
                return response()->json(['success' => false, 'message' => $msg], 403);
            }
            return redirect()->back()->withErrors(['akses' => $msg]);
        }

        $cow->fisiologis()?->delete();
        $cow->dataPerilaku()?->delete();
        $cow->dataPakan()?->delete();
        $cow->delete();

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(['success' => true, 'message' => 'Data sapi berhasil dihapus!']);
        }

        return redirect()->back()->with('success', 'Data sapi berhasil dihapus!');
    }

    // ==========================================
    // MODUL 2: FISIOLOGIS (SUHU & PENIMBANGAN BERAT MANUAL)
    // ==========================================
    public function storePhysiology(Request $request)
    {
        $validated = $request->validate([
            'phyCowID'          => 'nullable|string',
            'id_sapi'           => 'nullable|string',
            'phyStatus'         => 'nullable|string',
            'status_fisiologis' => 'nullable|string',
            'phyInitialWeight'  => 'nullable|numeric',
            'bobot_awal'        => 'nullable|numeric',
            'phyCurrentWeight'  => 'nullable|numeric',
            'bobot_terkini'     => 'nullable|numeric',
            'phyTargetWeight'   => 'nullable|numeric',
            'bobot_target'      => 'nullable|numeric',
            'phyTemperature'    => 'nullable|numeric',
            'suhu_tubuh'        => 'nullable|numeric',
            'phyHealthHistory'  => 'nullable|string',
            'phyHealthNotes'    => 'nullable|string',
            'riwayat_kesehatan' => 'nullable|string',
            'tanggal_pencatatan'=> 'nullable|date',
            'phyRecordDate'     => 'nullable|date',
            'jam_pengukuran'    => 'nullable|string',
            'phyRecordTime'     => 'nullable|string',
            'jenis_pencatatan'  => 'nullable|string',
            'phyRecordType'     => 'nullable|string',
        ]);

        $cowID = $validated['id_sapi'] ?? $validated['phyCowID'] ?? $request->input('id_sapi', $request->input('phyCowID'));
        $healthHistory = $request->input('riwayat_kesehatan', $request->input('phyHealthHistory', $request->input('phyHealthNotes')));
        $status = $validated['status_fisiologis'] ?? $validated['phyStatus'] ?? 'Normal';
        $recordDate = $request->input('tanggal_pencatatan', $request->input('phyRecordDate', now()->toDateString()));
        $recordTime = $request->input('jam_pengukuran', $request->input('phyRecordTime', now()->format('H:i')));
        $recordType = $request->input('jenis_pencatatan', $request->input('phyRecordType', 'Penimbangan Berkala'));

        $phy = Fisiologis::create([
            'id_sapi'            => $cowID,
            'status_fisiologis'  => $status ?: 'Normal',
            'bobot_awal'         => $request->input('bobot_awal', $request->input('phyInitialWeight')),
            'bobot_terkini'      => $request->input('bobot_terkini', $request->input('phyCurrentWeight', 250)),
            'bobot_target'       => $request->input('bobot_target', $request->input('phyTargetWeight', 500)),
            'suhu_tubuh'         => $request->input('suhu_tubuh', $request->input('phyTemperature', 38.5)),
            'riwayat_kesehatan'  => $healthHistory ?? null,
            'tanggal_pencatatan' => $recordDate,
            'jam_pengukuran'     => $recordTime,
            'jenis_pencatatan'   => $recordType,
        ]);

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(['success' => true, 'message' => 'Data kondisi fisiologis berhasil dicatat!', 'data' => $phy]);
        }

        return redirect()->back()->with('success', 'Data kondisi fisiologis berhasil disimpan!');
    }

    public function updatePhysiology(Request $request, string $id)
    {
        $phy = Fisiologis::where('id_fisiologis', $id)->first() ?? Fisiologis::where('id_sapi', $id)->firstOrFail();
        $healthHistory = $request->input('riwayat_kesehatan', $request->input('phyHealthHistory', $request->input('phyHealthNotes')));
        
        $data = array_filter([
            'status_fisiologis'  => $request->input('status_fisiologis', $request->input('phyStatus')),
            'bobot_awal'         => $request->input('bobot_awal', $request->input('phyInitialWeight')),
            'bobot_terkini'      => $request->input('bobot_terkini', $request->input('phyCurrentWeight')),
            'bobot_target'       => $request->input('bobot_target', $request->input('phyTargetWeight')),
            'suhu_tubuh'         => $request->input('suhu_tubuh', $request->input('phyTemperature')),
            'tanggal_pencatatan' => $request->input('tanggal_pencatatan', $request->input('phyRecordDate')),
            'jam_pengukuran'     => $request->input('jam_pengukuran', $request->input('phyRecordTime')),
            'jenis_pencatatan'   => $request->input('jenis_pencatatan', $request->input('phyRecordType')),
        ], fn($v) => $v !== null && $v !== '');

        if ($healthHistory !== null) {
            $data['riwayat_kesehatan'] = $healthHistory;
        }

        $phy->update($data);

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(['success' => true, 'message' => 'Data fisiologis berhasil diperbarui!', 'data' => $phy]);
        }

        return redirect()->back()->with('success', 'Data fisiologis berhasil diperbarui!');
    }

    public function destroyPhysiology(Request $request, string $id)
    {
        $phy = Fisiologis::where('id_fisiologis', $id)->first() ?? Fisiologis::where('id_sapi', $id)->first();
        if ($phy) $phy->delete();

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(['success' => true, 'message' => 'Data fisiologis berhasil dihapus!']);
        }

        return redirect()->back()->with('success', 'Data fisiologis berhasil dihapus!');
    }

    // ==========================================
    // MODUL 3: PERILAKU
    // ==========================================
    public function storeBehavior(Request $request)
    {
        $cowID = $request->input('id_sapi', $request->input('behCowID'));
        $activity = $request->input('aktivitas', $request->input('behActivity'));
        $startTime = $request->input('waktu_mulai', $request->input('behStartTime'));
        $endTime = $request->input('waktu_selesai', $request->input('behEndTime'));
        $source = $request->input('sumber_data', $request->input('behSource', 'Input Manual'));

        LogPerilaku::create([
            'id_sapi' => $cowID,
            'aktivitas' => $activity,
            'waktu_mulai' => $startTime,
            'waktu_selesai' => $endTime ?: now(),
            'sumber_data' => $source
        ]);

        return redirect()->back()->with('success', 'Data pemantauan perilaku berhasil disimpan!');
    }

    public function updateBehavior(Request $request, string $id)
    {
        $beh = LogPerilaku::where('id_log_perilaku', $id)->firstOrFail();
        $beh->update([
            'id_sapi' => $request->input('id_sapi', $request->input('behCowID', $beh->id_sapi)),
            'aktivitas' => $request->input('aktivitas', $request->input('behActivity', $beh->aktivitas)),
            'waktu_mulai' => $request->input('waktu_mulai', $request->input('behStartTime', $beh->waktu_mulai)),
            'waktu_selesai' => $request->input('waktu_selesai', $request->input('behEndTime', $beh->waktu_selesai)),
        ]);
        return redirect()->back()->with('success', 'Data perilaku berhasil diperbarui!');
    }

    public function destroyBehavior(Request $request, string $id)
    {
        $beh = LogPerilaku::where('id_log_perilaku', $id)->first();
        if ($beh) $beh->delete();
        return redirect()->back()->with('success', 'Data perilaku berhasil dihapus!');
    }

    // ==========================================
    // MODUL 4: KANDANG
    // ==========================================
    public function storeBarn(Request $request)
    {
        $validated = $request->validate([
            'barnID'              => 'nullable|string|max:50',
            'id_kandang'          => 'nullable|string|max:50',
            'barnName'            => 'nullable|string|max:100',
            'nama_kandang'        => 'nullable|string|max:100',
            'barnLocation'        => 'nullable|string|max:255',
            'lokasi_kandang'      => 'nullable|string|max:255',
            'barnCapacity'        => 'nullable|integer|min:1',
            'kapasitas_kandang'   => 'nullable|integer|min:1',
            'barnTemperature'     => 'nullable|numeric',
            'suhu_kandang'        => 'nullable|numeric',
            'barnHumidity'        => 'nullable|numeric',
            'kelembapan_kandang'  => 'nullable|numeric',
            'barnFloorCondition'  => 'nullable|string',
            'kondisi_lantai'      => 'nullable|string',
        ]);

        $barnID = $validated['id_kandang'] ?? $validated['barnID'] ?? null;
        $barnName = $validated['nama_kandang'] ?? $validated['barnName'] ?? 'Kandang Utama';
        $barnLoc = $validated['lokasi_kandang'] ?? $validated['barnLocation'] ?? null;
        $barnCap = $validated['kapasitas_kandang'] ?? $validated['barnCapacity'] ?? 10;
        $barnTemp = $validated['suhu_kandang'] ?? $validated['barnTemperature'] ?? null;
        $barnHum = $validated['kelembapan_kandang'] ?? $validated['barnHumidity'] ?? null;
        $barnFloor = $validated['kondisi_lantai'] ?? $validated['barnFloorCondition'] ?? 'Bersih';

        if (empty($barnID)) {
            $count = Kandang::count() + 1;
            do {
                $barnID = 'KDG-' . str_pad((string)$count, 3, '0', STR_PAD_LEFT);
                $count++;
            } while (Kandang::where('id_kandang', $barnID)->exists());
        }

        Kandang::create([
            'id_kandang' => $barnID,
            'nama_kandang' => $barnName,
            'lokasi_kandang' => $barnLoc,
            'kapasitas_kandang' => $barnCap,
            'suhu_kandang' => $barnTemp,
            'kelembapan_kandang' => $barnHum,
            'kondisi_lantai' => $barnFloor
        ]);

        return redirect()->back()->with('success', 'Data kandang berhasil ditambahkan!');
    }

    public function updateBarn(Request $request, string $id)
    {
        $barn = Kandang::where('id_kandang', $id)->orWhere('nama_kandang', $id)->first() ?? Kandang::first();
        if (!$barn) {
            return redirect()->back()->withErrors(['error' => 'Data kandang tidak ditemukan.']);
        }

        $barn->update(array_filter([
            'nama_kandang' => $request->input('nama_kandang', $request->input('barnName')),
            'lokasi_kandang' => $request->input('lokasi_kandang', $request->input('barnLocation')),
            'kapasitas_kandang' => $request->input('kapasitas_kandang', $request->input('barnCapacity')),
            'suhu_kandang' => $request->input('suhu_kandang', $request->input('barnTemperature')),
            'kelembapan_kandang' => $request->input('kelembapan_kandang', $request->input('barnHumidity')),
            'pencahayaan' => $request->input('pencahayaan', $request->input('barnLight')),
            'kecepatan_angin' => $request->input('kecepatan_angin', $request->input('barnWindSpeed')),
            'curah_hujan' => $request->input('curah_hujan', $request->input('barnRainfall')),
            'kondisi_lantai' => $request->input('kondisi_lantai', $request->input('barnFloorCondition')),
        ], fn($v) => $v !== null && $v !== ''));

        return redirect()->back()->with('success', 'Catatan kondisi lingkungan kandang berhasil diperbarui!');
    }

    public function destroyBarn(Request $request, string $id)
    {
        $barn = Kandang::where('id_kandang', $id)->first();
        if ($barn) {
            $cowsCount = Sapi::where('id_kandang', $id)
                ->orWhere('id_kandang', $barn->nama_kandang)
                ->count();

            if ($cowsCount > 0) {
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'status' => 'error',
                        'message' => "Kandang tidak dapat dihapus karena masih terisi {$cowsCount} ekor sapi!"
                    ], 422);
                }
                return redirect()->back()->with('error', "Kandang tidak dapat dihapus karena masih terisi {$cowsCount} ekor sapi!");
            }

            $barn->delete();
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['status' => 'success', 'message' => 'Data kandang berhasil dihapus!']);
        }
        return redirect()->back()->with('success', 'Data kandang berhasil dihapus!');
    }

    // ==========================================
    // MODUL 5: PAKAN (KEBUTUHAN PAKAN & 3 SESI MAKAN)
    // ==========================================
    public function storeFeed(Request $request)
    {
        $cowID = $request->input('id_sapi', $request->input('feedCowID'));
        $stationID = $request->input('id_tempat_makan', $request->input('feedStationID'));
        $composition = $request->input('komposisi_pakan', $request->input('feedComposition', 'Konsentrat & Hijauan'));
        $initFeed = (float) $request->input('pakan_awal', $request->input('feedInitialFeed', 10));
        $leftoverFeed = (float) $request->input('sisa_pakan', $request->input('feedLeftoverFeed', 0));
        $frequency = (int) $request->input('frekuensi_makan', $request->input('feedFrequency', 3));
        $waterQuality = $request->input('kualitas_air', $request->input('feedWaterQuality', 'Baik'));
        $initWater = (float) $request->input('air_awal', $request->input('feedInitialWater', 40));
        $leftoverWater = (float) $request->input('sisa_air', $request->input('feedLeftoverWater', 5));
        
        $pricePerKg = (float) $request->input('harga_pakan_per_kg', $request->input('feedPricePerKg', 5000));
        $dailyCost = (float) $request->input('biaya_pakan_harian', $request->input('feedDailyCost', $initFeed * $pricePerKg));
        $recordDate = $request->input('tanggal_pencatatan', $request->input('feedRecordDate', now()->toDateString()));

        $sesi1Jam = $request->input('sesi_makan_1_jam', '07:00');
        $sesi1Dur = (int) $request->input('sesi_makan_1_durasi', 20);
        $sesi1Pak = (float) $request->input('sesi_makan_1_pakan', round($initFeed / 3, 2));

        $sesi2Jam = $request->input('sesi_makan_2_jam', '12:00');
        $sesi2Dur = (int) $request->input('sesi_makan_2_durasi', 15);
        $sesi2Pak = (float) $request->input('sesi_makan_2_pakan', round($initFeed / 3, 2));

        $sesi3Jam = $request->input('sesi_makan_3_jam', '17:00');
        $sesi3Dur = (int) $request->input('sesi_makan_3_durasi', 25);
        $sesi3Pak = (float) $request->input('sesi_makan_3_pakan', round($initFeed - ($sesi1Pak + $sesi2Pak), 2));

        $totalDur = (int) $request->input('total_durasi_makan', $sesi1Dur + $sesi2Dur + $sesi3Dur);
        $notes = $request->input('keterangan', $request->input('feedNotes'));

        $log = LogPakan::create([
            'id_sapi'            => $cowID,
            'id_tempat_makan'    => $stationID,
            'komposisi_pakan'    => $composition,
            'pakan_awal'         => $initFeed,
            'sisa_pakan'         => $leftoverFeed,
            'frekuensi_makan'    => $frequency,
            'kualitas_air'       => $waterQuality,
            'air_awal'           => $initWater,
            'sisa_air'           => $leftoverWater,
            'harga_pakan_per_kg' => $pricePerKg,
            'biaya_pakan_harian' => $dailyCost,
            'tanggal_pencatatan' => $recordDate,
            'sesi_makan_1_jam'   => $sesi1Jam,
            'sesi_makan_1_durasi'=> $sesi1Dur,
            'sesi_makan_1_pakan' => $sesi1Pak,
            'sesi_makan_2_jam'   => $sesi2Jam,
            'sesi_makan_2_durasi'=> $sesi2Dur,
            'sesi_makan_2_pakan' => $sesi2Pak,
            'sesi_makan_3_jam'   => $sesi3Jam,
            'sesi_makan_3_durasi'=> $sesi3Dur,
            'sesi_makan_3_pakan' => $sesi3Pak,
            'total_durasi_makan' => $totalDur,
            'keterangan'         => $notes,
        ]);

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(['success' => true, 'message' => 'Catatan pakan dan jadwal makan berhasil disimpan!', 'data' => $log]);
        }

        return redirect()->back()->with('success', 'Catatan pemberian pakan berhasil disimpan!');
    }

    public function updateFeed(Request $request, string $id)
    {
        $feed = LogPakan::where('id_log_pakan', $id)->firstOrFail();
        $feed->update(array_filter([
            'id_sapi'            => $request->input('id_sapi', $request->input('feedCowID')),
            'id_tempat_makan'    => $request->input('id_tempat_makan', $request->input('feedStationID')),
            'komposisi_pakan'    => $request->input('komposisi_pakan', $request->input('feedComposition')),
            'pakan_awal'         => $request->input('pakan_awal', $request->input('feedInitialFeed')),
            'sisa_pakan'         => $request->input('sisa_pakan', $request->input('feedLeftoverFeed')),
            'frekuensi_makan'    => $request->input('frekuensi_makan', $request->input('feedFrequency')),
            'harga_pakan_per_kg' => $request->input('harga_pakan_per_kg', $request->input('feedPricePerKg')),
            'biaya_pakan_harian' => $request->input('biaya_pakan_harian', $request->input('feedDailyCost')),
            'tanggal_pencatatan' => $request->input('tanggal_pencatatan', $request->input('feedRecordDate')),
            'sesi_makan_1_jam'   => $request->input('sesi_makan_1_jam'),
            'sesi_makan_1_durasi'=> $request->input('sesi_makan_1_durasi'),
            'sesi_makan_1_pakan' => $request->input('sesi_makan_1_pakan'),
            'sesi_makan_2_jam'   => $request->input('sesi_makan_2_jam'),
            'sesi_makan_2_durasi'=> $request->input('sesi_makan_2_durasi'),
            'sesi_makan_2_pakan' => $request->input('sesi_makan_2_pakan'),
            'sesi_makan_3_jam'   => $request->input('sesi_makan_3_jam'),
            'sesi_makan_3_durasi'=> $request->input('sesi_makan_3_durasi'),
            'sesi_makan_3_pakan' => $request->input('sesi_makan_3_pakan'),
            'total_durasi_makan' => $request->input('total_durasi_makan'),
            'keterangan'         => $request->input('keterangan', $request->input('feedNotes')),
        ], fn($v) => $v !== null && $v !== ''));

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(['success' => true, 'message' => 'Data pakan berhasil diperbarui!', 'data' => $feed]);
        }

        return redirect()->back()->with('success', 'Data pakan berhasil diperbarui!');
    }

    public function destroyFeed(Request $request, string $id)
    {
        $feed = LogPakan::where('id_log_pakan', $id)->first();
        if ($feed) $feed->delete();

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(['success' => true, 'message' => 'Data pakan berhasil dihapus!']);
        }

        return redirect()->back()->with('success', 'Data pakan berhasil dihapus!');
    }

    // ==========================================
    // MODUL 6: TEMPAT MAKAN
    // ==========================================
    public function storeFeedingStation(Request $request)
    {
        $stationCode = $request->input('kode_tempat_makan', $request->input('stationCode'));
        $stationName = $request->input('nama_tempat_makan', $request->input('stationName', 'Tempat Makan Utama'));
        $stationType = $request->input('tipe_tempat_makan', $request->input('stationType', 'makan'));
        $stationLoc = $request->input('lokasi_tempat_makan', $request->input('stationLocation'));

        if (empty($stationCode)) {
            $count = TempatMakan::count() + 1;
            do {
                $stationCode = 'TM-' . str_pad((string)$count, 3, '0', STR_PAD_LEFT);
                $count++;
            } while (TempatMakan::where('kode_tempat_makan', $stationCode)->exists());
        }

        if ($stationType === 'kombinasi') {
            $stationType = 'campur';
        }

        TempatMakan::create([
            'kode_tempat_makan' => $stationCode,
            'nama_tempat_makan' => $stationName,
            'tipe_tempat_makan' => $stationType,
            'lokasi_tempat_makan' => $stationLoc
        ]);

        return redirect()->back()->with('success', 'Stasiun tempat makan berhasil ditambahkan!');
    }

    public function updateFeedingStation(Request $request, string $id)
    {
        $station = TempatMakan::where('id_tempat_makan', $id)->firstOrFail();
        $stationType = $request->input('tipe_tempat_makan', $request->input('stationType', $station->tipe_tempat_makan));
        if ($stationType === 'kombinasi') {
            $stationType = 'campur';
        }

        $station->update([
            'kode_tempat_makan' => $request->input('kode_tempat_makan', $request->input('stationCode', $station->kode_tempat_makan)),
            'nama_tempat_makan' => $request->input('nama_tempat_makan', $request->input('stationName', $station->nama_tempat_makan)),
            'tipe_tempat_makan' => $stationType,
            'lokasi_tempat_makan' => $request->input('lokasi_tempat_makan', $request->input('stationLocation', $station->lokasi_tempat_makan)),
        ]);

        return redirect()->back()->with('success', 'Data tempat makan berhasil diperbarui!');
    }

    public function destroyFeedingStation(Request $request, string $id)
    {
        $station = TempatMakan::where('id_tempat_makan', $id)->first();
        if ($station) $station->delete();
        return redirect()->back()->with('success', 'Data tempat makan berhasil dihapus!');
    }
}
