<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sapi;
use App\Models\Kandang;
use App\Models\Fisiologis;
use App\Models\LogPerilaku;
use App\Models\TempatMakan;
use App\Models\LogPakan;
use App\Models\LogKamera;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ApiController extends Controller
{
    // =========================================================================
    // 1. DATA KANDANG & MIKROKLIMAT (CRUD)
    // =========================================================================

    public function barns(Request $request, $id = null)
    {
        if ($id) {
            $data = Kandang::with('cows')->where('barnID', $id)->first() ?? Kandang::find($id);
            if (!$data) return response()->json(['status' => 'error', 'message' => 'Data kandang tidak ditemukan'], 404);
            return response()->json(['status' => 'success', 'data' => $data]);
        }

        $query = Kandang::query();
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('barnID', 'like', "%{$search}%")
                  ->orWhere('barnName', 'like', "%{$search}%")
                  ->orWhere('barnLocation', 'like', "%{$search}%");
            });
        }
        $data = $query->get();
        return response()->json(['status' => 'success', 'total' => $data->count(), 'data' => $data]);
    }

    public function storeBarn(Request $request)
    {
        $request->merge([
            'barnID' => $request->input('id_kandang') ?? $request->input('idKandang') ?? $request->input('id') ?? $request->input('barnID'),
            'barnName' => $request->input('nama_kandang') ?? $request->input('namaKandang') ?? $request->input('nama') ?? $request->input('barnName'),
            'barnLocation' => $request->input('lokasi_kandang') ?? $request->input('lokasiKandang') ?? $request->input('lokasi') ?? $request->input('barnLocation'),
            'barnCapacity' => $request->input('kapasitas_kandang') ?? $request->input('kapasitasKandang') ?? $request->input('kapasitas') ?? $request->input('barnCapacity'),
            'barnTemperature' => $request->input('suhu_kandang') ?? $request->input('suhuKandang') ?? $request->input('suhu') ?? $request->input('barnTemperature'),
            'barnHumidity' => $request->input('kelembapan_kandang') ?? $request->input('kelembapan') ?? $request->input('kelembaban') ?? $request->input('barnHumidity'),
            'barnLight' => $request->input('intensitas_cahaya') ?? $request->input('cahaya') ?? $request->input('barnLight') ?? 300,
            'barnWindSpeed' => $request->input('kecepatan_angin') ?? $request->input('barnWindSpeed') ?? 1.0,
            'barnRainfall' => $request->input('curah_hujan') ?? $request->input('barnRainfall') ?? 0.0,
            'barnFloorCondition' => $request->input('kondisi_lantai') ?? $request->input('barnFloorCondition') ?? 'Bersih',
        ]);

        $validated = $request->validate([
            'barnID' => 'required|string|unique:barns,barnID',
            'barnName' => 'required|string',
            'barnLocation' => 'nullable|string',
            'barnCapacity' => 'nullable|integer',
            'barnTemperature' => 'nullable|numeric',
            'barnHumidity' => 'nullable|numeric',
            'barnLight' => 'nullable|numeric',
            'barnWindSpeed' => 'nullable|numeric',
            'barnRainfall' => 'nullable|numeric',
            'barnFloorCondition' => 'nullable|string',
        ]);

        $barn = Kandang::create($validated);
        return response()->json(['status' => 'success', 'message' => 'Data kandang berhasil ditambahkan', 'data' => $barn], 201);
    }

    public function updateBarn(Request $request, $id)
    {
        $barn = Kandang::where('barnID', $id)->first() ?? Kandang::find($id);
        if (!$barn) return response()->json(['status' => 'error', 'message' => 'Data kandang tidak ditemukan'], 404);

        $request->merge([
            'barnName' => $request->input('nama_kandang') ?? $request->input('namaKandang') ?? $request->input('nama') ?? $request->input('barnName', $barn->barnName),
            'barnLocation' => $request->input('lokasi_kandang') ?? $request->input('lokasiKandang') ?? $request->input('lokasi') ?? $request->input('barnLocation', $barn->barnLocation),
            'barnCapacity' => $request->input('kapasitas_kandang') ?? $request->input('kapasitasKandang') ?? $request->input('kapasitas') ?? $request->input('barnCapacity', $barn->barnCapacity),
            'barnTemperature' => $request->input('suhu_kandang') ?? $request->input('suhuKandang') ?? $request->input('suhu') ?? $request->input('barnTemperature', $barn->barnTemperature),
            'barnHumidity' => $request->input('kelembapan_kandang') ?? $request->input('kelembapan') ?? $request->input('kelembaban') ?? $request->input('barnHumidity', $barn->barnHumidity),
            'barnLight' => $request->input('intensitas_cahaya') ?? $request->input('cahaya') ?? $request->input('barnLight', $barn->barnLight),
            'barnWindSpeed' => $request->input('kecepatan_angin') ?? $request->input('barnWindSpeed', $barn->barnWindSpeed),
            'barnRainfall' => $request->input('curah_hujan') ?? $request->input('barnRainfall', $barn->barnRainfall),
            'barnFloorCondition' => $request->input('kondisi_lantai') ?? $request->input('barnFloorCondition', $barn->barnFloorCondition),
        ]);

        $validated = $request->validate([
            'barnName' => 'sometimes|string',
            'barnLocation' => 'nullable|string',
            'barnCapacity' => 'nullable|integer',
            'barnTemperature' => 'nullable|numeric',
            'barnHumidity' => 'nullable|numeric',
            'barnLight' => 'nullable|numeric',
            'barnWindSpeed' => 'nullable|numeric',
            'barnRainfall' => 'nullable|numeric',
            'barnFloorCondition' => 'nullable|string',
        ]);

        $barn->update($validated);
        return response()->json(['status' => 'success', 'message' => 'Data kandang berhasil diperbarui', 'data' => $barn]);
    }

    public function destroyBarn($id)
    {
        $barn = Kandang::where('barnID', $id)->first() ?? Kandang::find($id);
        if (!$barn) return response()->json(['status' => 'error', 'message' => 'Data kandang tidak ditemukan'], 404);

        $barn->delete();
        return response()->json(['status' => 'success', 'message' => 'Data kandang berhasil dihapus']);
    }

    // =========================================================================
    // 2. DATA SAPI (CRUD)
    // =========================================================================

    public function cows(Request $request, $id = null)
    {
        if ($id) {
            $data = Sapi::with(['barn', 'physiology', 'feedingStation', 'owner', 'behaviorLogs', 'feedLogs', 'cameraLogs'])
                       ->where('id_sapi', $id)->first() ?? Sapi::find($id);
            if (!$data) return response()->json(['status' => 'error', 'message' => 'Data sapi tidak ditemukan'], 404);
            return response()->json(['status' => 'success', 'data' => $data]);
        }

        $query = Sapi::with(['barn', 'physiology', 'feedingStation', 'owner']);
        if ($request->has('barn_id')) $query->where('id_kandang', $request->input('barn_id'));
        if ($request->has('breed')) $query->where('ras_sapi', 'like', "%{$request->input('breed')}%");
        if ($request->has('gender')) $query->where('jenis_kelamin', $request->input('gender'));
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('id_sapi', 'like', "%{$search}%")->orWhere('ras_sapi', 'like', "%{$search}%");
            });
        }
        $data = $query->get();
        return response()->json(['status' => 'success', 'total' => $data->count(), 'data' => $data]);
    }

    public function storeCow(Request $request)
    {
        $request->merge([
            'cowID' => $request->input('id_sapi') ?? $request->input('idSapi') ?? $request->input('id') ?? $request->input('cowID'),
            'cowGender' => $request->input('jenis_kelamin') ?? $request->input('gender') ?? $request->input('cowGender'),
            'cowBirthDate' => $request->input('tanggal_lahir') ?? $request->input('tglLahir') ?? $request->input('tgl_lahir') ?? $request->input('cowBirthDate'),
            'cowBreed' => $request->input('ras_sapi') ?? $request->input('ras') ?? $request->input('jenis_sapi') ?? $request->input('jenis') ?? $request->input('cowBreed'),
            'cowHistory' => $request->input('riwayat_sapi') ?? $request->input('riwayat') ?? $request->input('catatan') ?? $request->input('cowHistory'),
            'cowPurchasePrice' => $request->input('harga_beli') ?? $request->input('hargaBeli') ?? $request->input('harga') ?? $request->input('cowPurchasePrice') ?? 12000000,
            'cowBarnID' => $request->input('id_kandang') ?? $request->input('idKandang') ?? $request->input('kandang_id') ?? $request->input('cowBarnID'),
            'cowOwnerID' => $request->input('id_pemilik') ?? $request->input('pemilik_id') ?? $request->input('cowOwnerID'),
            'cowStationID' => $request->input('id_stasiun') ?? $request->input('stasiun_id') ?? $request->input('cowStationID'),
        ]);

        $validated = $request->validate([
            'cowID' => 'required|string|unique:cows,cowID',
            'cowGender' => 'required|in:Jantan,Betina',
            'cowBirthDate' => 'required|date',
            'cowBreed' => 'required|string',
            'cowHistory' => 'nullable|string',
            'cowPurchasePrice' => 'nullable|numeric',
            'cowBarnID' => 'required|exists:barns,barnID',
            'cowOwnerID' => 'nullable|exists:users,id',
            'cowStationID' => 'nullable|exists:feeding_stations,stationID',
        ]);

        $cow = Sapi::create($validated);
        return response()->json(['status' => 'success', 'message' => 'Data sapi berhasil ditambahkan', 'data' => $cow], 201);
    }

    public function updateCow(Request $request, $id)
    {
        $cow = Sapi::where('id_sapi', $id)->first() ?? Sapi::find($id);
        if (!$cow) return response()->json(['status' => 'error', 'message' => 'Data sapi tidak ditemukan'], 404);

        $request->merge([
            'cowGender' => $request->input('jenis_kelamin') ?? $request->input('gender') ?? $request->input('cowGender', $cow->cowGender),
            'cowBirthDate' => $request->input('tanggal_lahir') ?? $request->input('tglLahir') ?? $request->input('tgl_lahir') ?? $request->input('cowBirthDate', $cow->cowBirthDate),
            'cowBreed' => $request->input('ras_sapi') ?? $request->input('ras') ?? $request->input('jenis_sapi') ?? $request->input('jenis') ?? $request->input('cowBreed', $cow->cowBreed),
            'cowHistory' => $request->input('riwayat_sapi') ?? $request->input('riwayat') ?? $request->input('catatan') ?? $request->input('cowHistory', $cow->cowHistory),
            'cowPurchasePrice' => $request->input('harga_beli') ?? $request->input('hargaBeli') ?? $request->input('harga') ?? $request->input('cowPurchasePrice', $cow->cowPurchasePrice),
            'cowBarnID' => $request->input('id_kandang') ?? $request->input('idKandang') ?? $request->input('kandang_id') ?? $request->input('cowBarnID', $cow->cowBarnID),
        ]);

        $validated = $request->validate([
            'cowGender' => 'sometimes|in:Jantan,Betina',
            'cowBirthDate' => 'sometimes|date',
            'cowBreed' => 'sometimes|string',
            'cowHistory' => 'nullable|string',
            'cowPurchasePrice' => 'nullable|numeric',
            'cowBarnID' => 'sometimes|exists:barns,barnID',
            'cowOwnerID' => 'nullable|exists:users,id',
            'cowStationID' => 'nullable|exists:feeding_stations,stationID',
        ]);

        $cow->update($validated);
        return response()->json(['status' => 'success', 'message' => 'Data sapi berhasil diperbarui', 'data' => $cow]);
    }

    public function destroyCow($id)
    {
        $cow = Sapi::where('id_sapi', $id)->first() ?? Sapi::find($id);
        if (!$cow) return response()->json(['status' => 'error', 'message' => 'Data sapi tidak ditemukan'], 404);

        $cow->delete();
        return response()->json(['status' => 'success', 'message' => 'Data sapi berhasil dihapus']);
    }

    // =========================================================================
    // 3. DATA FISIOLOGIS SAPI (CRUD)
    // =========================================================================

    public function physiologies(Request $request, $id = null)
    {
        if ($id) {
            $data = Fisiologis::with('cow')->where('id_fisiologis', $id)->orWhere('id_sapi', $id)->first();
            if (!$data) return response()->json(['status' => 'error', 'message' => 'Data fisiologis tidak ditemukan'], 404);
            return response()->json(['status' => 'success', 'data' => $data]);
        }

        $query = Fisiologis::with('cow');
        if ($request->has('cow_id')) $query->where('phyCowID', $request->input('cow_id'));
        $data = $query->get();
        return response()->json(['status' => 'success', 'total' => $data->count(), 'data' => $data]);
    }

    public function storePhysiology(Request $request)
    {
        $request->merge([
            'phyCowID' => $request->input('id_sapi') ?? $request->input('idSapi') ?? $request->input('sapi_id') ?? $request->input('phyCowID'),
            'phyStatus' => $request->input('status_kesehatan') ?? $request->input('status') ?? $request->input('phyStatus'),
            'phyInitialWeight' => $request->input('berat_awal') ?? $request->input('bobot_awal') ?? $request->input('phyInitialWeight'),
            'phyTargetWeight' => $request->input('berat_target') ?? $request->input('bobot_target') ?? $request->input('target_bobot') ?? $request->input('phyTargetWeight'),
            'phyMeasuredInitialWeight' => $request->input('berat_ukur_awal') ?? $request->input('bobot_ukur_awal') ?? $request->input('phyMeasuredInitialWeight'),
            'phyCurrentWeight' => $request->input('berat_saat_ini') ?? $request->input('bobot_saat_ini') ?? $request->input('berat_sekarang') ?? $request->input('phyCurrentWeight'),
            'phyTemperature' => $request->input('suhu_tubuh') ?? $request->input('suhu') ?? $request->input('phyTemperature'),
            'phyHealthHistory' => $request->input('catatan_kesehatan') ?? $request->input('riwayat_kesehatan') ?? $request->input('phyHealthHistory'),
        ]);

        $validated = $request->validate([
            'phyCowID' => 'required|exists:cows,cowID',
            'phyStatus' => 'required|string',
            'phyInitialWeight' => 'required|numeric',
            'phyTargetWeight' => 'required|numeric',
            'phyMeasuredInitialWeight' => 'nullable|numeric',
            'phyCurrentWeight' => 'required|numeric',
            'phyTemperature' => 'required|numeric',
            'phyHealthHistory' => 'nullable|string',
        ]);

        $phy = Fisiologis::create($validated);
        return response()->json(['status' => 'success', 'message' => 'Data fisiologis berhasil ditambahkan', 'data' => $phy], 201);
    }

    public function updatePhysiology(Request $request, $id)
    {
        $phy = Fisiologis::where('phyID', $id)->orWhere('phyCowID', $id)->first();
        if (!$phy) return response()->json(['status' => 'error', 'message' => 'Data fisiologis tidak ditemukan'], 404);

        $request->merge([
            'phyStatus' => $request->input('status_kesehatan') ?? $request->input('status') ?? $request->input('phyStatus', $phy->phyStatus),
            'phyInitialWeight' => $request->input('berat_awal') ?? $request->input('bobot_awal') ?? $request->input('phyInitialWeight', $phy->phyInitialWeight),
            'phyTargetWeight' => $request->input('berat_target') ?? $request->input('bobot_target') ?? $request->input('target_bobot') ?? $request->input('phyTargetWeight', $phy->phyTargetWeight),
            'phyMeasuredInitialWeight' => $request->input('berat_ukur_awal') ?? $request->input('bobot_ukur_awal') ?? $request->input('phyMeasuredInitialWeight', $phy->phyMeasuredInitialWeight),
            'phyCurrentWeight' => $request->input('berat_saat_ini') ?? $request->input('bobot_saat_ini') ?? $request->input('berat_sekarang') ?? $request->input('phyCurrentWeight', $phy->phyCurrentWeight),
            'phyTemperature' => $request->input('suhu_tubuh') ?? $request->input('suhu') ?? $request->input('phyTemperature', $phy->phyTemperature),
            'phyHealthHistory' => $request->input('catatan_kesehatan') ?? $request->input('riwayat_kesehatan') ?? $request->input('phyHealthHistory', $phy->phyHealthHistory),
        ]);

        $validated = $request->validate([
            'phyStatus' => 'sometimes|string',
            'phyInitialWeight' => 'sometimes|numeric',
            'phyTargetWeight' => 'sometimes|numeric',
            'phyMeasuredInitialWeight' => 'nullable|numeric',
            'phyCurrentWeight' => 'sometimes|numeric',
            'phyTemperature' => 'sometimes|numeric',
            'phyHealthHistory' => 'nullable|string',
        ]);

        $phy->update($validated);
        return response()->json(['status' => 'success', 'message' => 'Data fisiologis berhasil diperbarui', 'data' => $phy]);
    }

    public function destroyPhysiology($id)
    {
        $phy = Fisiologis::where('phyID', $id)->orWhere('phyCowID', $id)->first();
        if (!$phy) return response()->json(['status' => 'error', 'message' => 'Data fisiologis tidak ditemukan'], 404);

        $phy->delete();
        return response()->json(['status' => 'success', 'message' => 'Data fisiologis berhasil dihapus']);
    }

    // =========================================================================
    // 4. LOG PERILAKU SAPI (CRUD)
    // =========================================================================

    public function behaviorLogs(Request $request, $id = null)
    {
        if ($id) {
            $data = LogPerilaku::with('cow')->find($id);
            if (!$data) return response()->json(['status' => 'error', 'message' => 'Data log perilaku tidak ditemukan'], 404);
            return response()->json(['status' => 'success', 'data' => $data]);
        }

        $query = LogPerilaku::with('cow');
        if ($request->has('cow_id')) $query->where('behCowID', $request->input('cow_id'));
        if ($request->has('activity')) $query->where('behActivity', $request->input('activity'));
        if ($request->has('start_date')) $query->whereDate('behStartTime', '>=', $request->input('start_date'));
        if ($request->has('end_date')) $query->whereDate('behStartTime', '<=', $request->input('end_date'));
        $data = $query->orderBy('behStartTime', 'desc')->get();
        return response()->json(['status' => 'success', 'total' => $data->count(), 'data' => $data]);
    }

    public function storeBehaviorLog(Request $request)
    {
        $request->merge([
            'behCowID' => $request->input('id_sapi') ?? $request->input('idSapi') ?? $request->input('sapi_id') ?? $request->input('behCowID'),
            'behActivity' => $request->input('aktivitas') ?? $request->input('kegiatan') ?? $request->input('behActivity'),
            'behStartTime' => $request->input('waktu_mulai') ?? $request->input('waktuMulai') ?? $request->input('jam_mulai') ?? $request->input('behStartTime'),
            'behEndTime' => $request->input('waktu_selesai') ?? $request->input('waktuSelesai') ?? $request->input('jam_selesai') ?? $request->input('behEndTime'),
            'behSource' => $request->input('sumber_data') ?? $request->input('sumber') ?? $request->input('behSource') ?? 'Input Manual',
        ]);

        $validated = $request->validate([
            'behCowID' => 'required|exists:cows,cowID',
            'behActivity' => 'required|in:Makan,Ruminasi,Berjalan,Berdiri,Berbaring',
            'behStartTime' => 'required|date',
            'behEndTime' => 'nullable|date',
            'behSource' => 'nullable|string',
        ]);

        $log = LogPerilaku::create($validated);
        return response()->json(['status' => 'success', 'message' => 'Log perilaku berhasil ditambahkan', 'data' => $log], 201);
    }

    public function updateBehaviorLog(Request $request, $id)
    {
        $log = LogPerilaku::find($id);
        if (!$log) return response()->json(['status' => 'error', 'message' => 'Log perilaku tidak ditemukan'], 404);

        $request->merge([
            'behActivity' => $request->input('aktivitas') ?? $request->input('kegiatan') ?? $request->input('behActivity', $log->behActivity),
            'behStartTime' => $request->input('waktu_mulai') ?? $request->input('waktuMulai') ?? $request->input('jam_mulai') ?? $request->input('behStartTime', $log->behStartTime),
            'behEndTime' => $request->input('waktu_selesai') ?? $request->input('waktuSelesai') ?? $request->input('jam_selesai') ?? $request->input('behEndTime', $log->behEndTime),
            'behSource' => $request->input('sumber_data') ?? $request->input('sumber') ?? $request->input('behSource', $log->behSource),
        ]);

        $validated = $request->validate([
            'behActivity' => 'sometimes|in:Makan,Ruminasi,Berjalan,Berdiri,Berbaring',
            'behStartTime' => 'sometimes|date',
            'behEndTime' => 'nullable|date',
            'behSource' => 'nullable|string',
        ]);

        $log->update($validated);
        return response()->json(['status' => 'success', 'message' => 'Log perilaku berhasil diperbarui', 'data' => $log]);
    }

    public function destroyBehaviorLog($id)
    {
        $log = LogPerilaku::find($id);
        if (!$log) return response()->json(['status' => 'error', 'message' => 'Log perilaku tidak ditemukan'], 404);

        $log->delete();
        return response()->json(['status' => 'success', 'message' => 'Log perilaku berhasil dihapus']);
    }

    // =========================================================================
    // 5. STASIUN TEMPAT MAKAN (CRUD)
    // =========================================================================

    public function feedingStations(Request $request, $id = null)
    {
        if ($id) {
            $data = TempatMakan::where('stationID', $id)->orWhere('stationCode', $id)->first();
            if (!$data) return response()->json(['status' => 'error', 'message' => 'Data stasiun pakan tidak ditemukan'], 404);
            return response()->json(['status' => 'success', 'data' => $data]);
        }

        $query = TempatMakan::query();
        if ($request->has('location')) $query->where('stationLocation', $request->input('location'));
        if ($request->has('type')) $query->where('stationType', $request->input('type'));
        $data = $query->get();
        return response()->json(['status' => 'success', 'total' => $data->count(), 'data' => $data]);
    }

    public function storeFeedingStation(Request $request)
    {
        $request->merge([
            'stationCode' => $request->input('kode_stasiun') ?? $request->input('kodeStasiun') ?? $request->input('kode') ?? $request->input('stationCode'),
            'stationName' => $request->input('nama_stasiun') ?? $request->input('namaStasiun') ?? $request->input('nama') ?? $request->input('stationName'),
            'stationType' => $request->input('tipe_stasiun') ?? $request->input('tipeStasiun') ?? $request->input('tipe') ?? $request->input('jenis') ?? $request->input('stationType'),
            'stationLocation' => $request->input('lokasi_stasiun') ?? $request->input('lokasiStasiun') ?? $request->input('lokasi') ?? $request->input('stationLocation'),
        ]);

        $validated = $request->validate([
            'stationCode' => 'required|string|unique:feeding_stations,stationCode',
            'stationName' => 'nullable|string',
            'stationType' => 'required|in:makan,minum,campur',
            'stationLocation' => 'nullable|string',
        ]);

        $station = TempatMakan::create($validated);
        return response()->json(['status' => 'success', 'message' => 'Stasiun pakan berhasil ditambahkan', 'data' => $station], 201);
    }

    public function updateFeedingStation(Request $request, $id)
    {
        $station = TempatMakan::where('stationID', $id)->orWhere('stationCode', $id)->first();
        if (!$station) return response()->json(['status' => 'error', 'message' => 'Stasiun pakan tidak ditemukan'], 404);

        $request->merge([
            'stationName' => $request->input('nama_stasiun') ?? $request->input('namaStasiun') ?? $request->input('nama') ?? $request->input('stationName', $station->stationName),
            'stationType' => $request->input('tipe_stasiun') ?? $request->input('tipeStasiun') ?? $request->input('tipe') ?? $request->input('jenis') ?? $request->input('stationType', $station->stationType),
            'stationLocation' => $request->input('lokasi_stasiun') ?? $request->input('lokasiStasiun') ?? $request->input('lokasi') ?? $request->input('stationLocation', $station->stationLocation),
        ]);

        $validated = $request->validate([
            'stationName' => 'nullable|string',
            'stationType' => 'sometimes|in:makan,minum,campur',
            'stationLocation' => 'nullable|string',
        ]);

        $station->update($validated);
        return response()->json(['status' => 'success', 'message' => 'Stasiun pakan berhasil diperbarui', 'data' => $station]);
    }

    public function destroyFeedingStation($id)
    {
        $station = TempatMakan::where('stationID', $id)->orWhere('stationCode', $id)->first();
        if (!$station) return response()->json(['status' => 'error', 'message' => 'Stasiun pakan tidak ditemukan'], 404);

        $station->delete();
        return response()->json(['status' => 'success', 'message' => 'Stasiun pakan berhasil dihapus']);
    }

    // =========================================================================
    // 6. LOG PEMBERIAN PAKAN & AIR (CRUD)
    // =========================================================================

    public function feedLogs(Request $request, $id = null)
    {
        if ($id) {
            $data = LogPakan::with(['cow', 'feedingStation'])->find($id);
            if (!$data) return response()->json(['status' => 'error', 'message' => 'Data log pakan tidak ditemukan'], 404);
            return response()->json(['status' => 'success', 'data' => $data]);
        }

        $query = LogPakan::with(['cow', 'feedingStation']);
        if ($request->has('cow_id')) $query->where('feedCowID', $request->input('cow_id'));
        if ($request->has('station_id')) $query->where('feedStationID', $request->input('station_id'));
        if ($request->has('date')) $query->whereDate('created_at', $request->input('date'));
        $data = $query->orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 'success', 'total' => $data->count(), 'data' => $data]);
    }

    public function storeFeedLog(Request $request)
    {
        $request->merge([
            'feedCowID' => $request->input('id_sapi') ?? $request->input('idSapi') ?? $request->input('sapi_id') ?? $request->input('feedCowID'),
            'feedStationID' => $request->input('id_stasiun') ?? $request->input('idStasiun') ?? $request->input('stasiun_id') ?? $request->input('feedStationID'),
            'feedComposition' => $request->input('komposisi_pakan') ?? $request->input('komposisi') ?? $request->input('jenis_pakan') ?? $request->input('feedComposition'),
            'feedInitialFeed' => $request->input('pakan_awal') ?? $request->input('pakanAwal') ?? $request->input('feedInitialFeed'),
            'feedLeftoverFeed' => $request->input('sisa_pakan') ?? $request->input('sisaPakan') ?? $request->input('feedLeftoverFeed'),
            'feedFrequency' => $request->input('frekuensi') ?? $request->input('jumlah_makan') ?? $request->input('feedFrequency'),
            'feedWaterQuality' => $request->input('kualitas_air') ?? $request->input('air_kualitas') ?? $request->input('feedWaterQuality'),
            'feedInitialWater' => $request->input('air_awal') ?? $request->input('feedInitialWater'),
            'feedLeftoverWater' => $request->input('sisa_air') ?? $request->input('feedLeftoverWater'),
        ]);

        $validated = $request->validate([
            'feedCowID' => 'required|exists:cows,cowID',
            'feedStationID' => 'nullable|exists:feeding_stations,stationID',
            'feedComposition' => 'required|string',
            'feedInitialFeed' => 'required|numeric',
            'feedLeftoverFeed' => 'required|numeric',
            'feedFrequency' => 'required|integer',
            'feedWaterQuality' => 'required|string',
            'feedInitialWater' => 'required|numeric',
            'feedLeftoverWater' => 'required|numeric',
        ]);

        $log = LogPakan::create($validated);
        return response()->json(['status' => 'success', 'message' => 'Log pakan berhasil ditambahkan', 'data' => $log], 201);
    }

    public function updateFeedLog(Request $request, $id)
    {
        $log = LogPakan::find($id);
        if (!$log) return response()->json(['status' => 'error', 'message' => 'Log pakan tidak ditemukan'], 404);

        $request->merge([
            'feedComposition' => $request->input('komposisi_pakan') ?? $request->input('komposisi') ?? $request->input('jenis_pakan') ?? $request->input('feedComposition', $log->feedComposition),
            'feedInitialFeed' => $request->input('pakan_awal') ?? $request->input('pakanAwal') ?? $request->input('feedInitialFeed', $log->feedInitialFeed),
            'feedLeftoverFeed' => $request->input('sisa_pakan') ?? $request->input('sisaPakan') ?? $request->input('feedLeftoverFeed', $log->feedLeftoverFeed),
            'feedFrequency' => $request->input('frekuensi') ?? $request->input('jumlah_makan') ?? $request->input('feedFrequency', $log->feedFrequency),
            'feedWaterQuality' => $request->input('kualitas_air') ?? $request->input('air_kualitas') ?? $request->input('feedWaterQuality', $log->feedWaterQuality),
            'feedInitialWater' => $request->input('air_awal') ?? $request->input('feedInitialWater', $log->feedInitialWater),
            'feedLeftoverWater' => $request->input('sisa_air') ?? $request->input('feedLeftoverWater', $log->feedLeftoverWater),
        ]);

        $validated = $request->validate([
            'feedComposition' => 'sometimes|string',
            'feedInitialFeed' => 'sometimes|numeric',
            'feedLeftoverFeed' => 'sometimes|numeric',
            'feedFrequency' => 'sometimes|integer',
            'feedWaterQuality' => 'sometimes|string',
            'feedInitialWater' => 'sometimes|numeric',
            'feedLeftoverWater' => 'sometimes|numeric',
        ]);

        $log->update($validated);
        return response()->json(['status' => 'success', 'message' => 'Log pakan berhasil diperbarui', 'data' => $log]);
    }

    public function destroyFeedLog($id)
    {
        $log = LogPakan::find($id);
        if (!$log) return response()->json(['status' => 'error', 'message' => 'Log pakan tidak ditemukan'], 404);

        $log->delete();
        return response()->json(['status' => 'success', 'message' => 'Log pakan berhasil dihapus']);
    }

    // =========================================================================
    // 7. LOG DETEKSI KAMERA (CRUD)
    // =========================================================================

    public function cameraLogs(Request $request, $id = null)
    {
        if ($id) {
            $data = LogKamera::with('cow')->find($id);
            if (!$data) return response()->json(['status' => 'error', 'message' => 'Data log kamera tidak ditemukan'], 404);
            return response()->json(['status' => 'success', 'data' => $data]);
        }

        $query = LogKamera::with('cow');
        if ($request->has('cow_id')) $query->where('camCowID', $request->input('cow_id'));
        if ($request->has('activity')) $query->where('camActivity', $request->input('activity'));
        if ($request->has('date')) $query->whereDate('camCapturedAt', $request->input('date'));
        $data = $query->orderBy('camCapturedAt', 'desc')->get();
        return response()->json(['status' => 'success', 'total' => $data->count(), 'data' => $data]);
    }

    public function storeCameraLog(Request $request)
    {
        $validated = $request->validate([
            'camCowID' => 'required|exists:cows,cowID',
            'camActivity' => 'required|string',
            'camConfidence' => 'required|numeric',
            'camImagePath' => 'nullable|string',
            'camCapturedAt' => 'required|date',
        ]);

        $log = LogKamera::create($validated);
        return response()->json(['status' => 'success', 'message' => 'Log kamera berhasil ditambahkan', 'data' => $log], 201);
    }

    public function updateCameraLog(Request $request, $id)
    {
        $log = LogKamera::find($id);
        if (!$log) return response()->json(['status' => 'error', 'message' => 'Log kamera tidak ditemukan'], 404);

        $validated = $request->validate([
            'camActivity' => 'sometimes|string',
            'camConfidence' => 'sometimes|numeric',
            'camImagePath' => 'nullable|string',
            'camCapturedAt' => 'sometimes|date',
        ]);

        $log->update($validated);
        return response()->json(['status' => 'success', 'message' => 'Log kamera berhasil diperbarui', 'data' => $log]);
    }

    public function destroyCameraLog($id)
    {
        $log = LogKamera::find($id);
        if (!$log) return response()->json(['status' => 'error', 'message' => 'Log kamera tidak ditemukan'], 404);

        $log->delete();
        return response()->json(['status' => 'success', 'message' => 'Log kamera berhasil dihapus']);
    }

    // =========================================================================
    // 8. ENDPOINT ANALITIK ("INFORMASI PENTING")
    // =========================================================================

    public function feedIdeal(Request $request, $cow_id = null)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $cowsQuery = Sapi::with(['physiology', 'feedLogs' => function($q) use ($date) {
            $q->whereDate('created_at', $date);
        }]);

        if ($cow_id) $cowsQuery->where('id_sapi', $cow_id);
        $cows = $cowsQuery->get();

        $result = $cows->map(function($cow) {
            $currentWeight = $cow->physiology->phyCurrentWeight ?? 350;
            $idealFeedDailyKg = round($currentWeight * 0.10, 2);
            $totalFeedGrams = $cow->feedLogs->sum(fn($log) => $log->feedInitialFeed - $log->feedLeftoverFeed);
            $consumedKg = round($totalFeedGrams / 1000, 2);
            $status = $consumedKg >= $idealFeedDailyKg ? 'Sesuai' : ($consumedKg > 0 ? 'Kurang dari Ideal' : 'Belum Ada Data');

            return [
                'cowID' => $cow->cowID,
                'cowBreed' => $cow->cowBreed,
                'currentWeightKg' => (float)$currentWeight,
                'idealFeedDailyKg' => (float)$idealFeedDailyKg,
                'consumedTodayKg' => (float)$consumedKg,
                'status' => $status,
            ];
        });

        return response()->json(['status' => 'success', 'date' => $date, 'data' => $cow_id ? $result->first() : $result]);
    }

    public function feedIntensity(Request $request, $cow_id = null)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $cowsQuery = Sapi::withCount(['feedLogs' => function($q) use ($date) {
            $q->whereDate('created_at', $date);
        }]);

        if ($cow_id) $cowsQuery->where('id_sapi', $cow_id);
        $cows = $cowsQuery->get();

        $result = $cows->map(fn($cow) => [
            'cowID' => $cow->cowID,
            'cowBreed' => $cow->cowBreed,
            'feedInteractionsCount' => $cow->feed_logs_count,
        ]);

        return response()->json(['status' => 'success', 'date' => $date, 'data' => $cow_id ? $result->first() : $result]);
    }

    public function behaviorSummary(Request $request, $cow_id = null)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $cowsQuery = Sapi::with(['behaviorLogs' => function($q) use ($date) {
            $q->whereDate('waktu_mulai', $date);
        }]);

        if ($cow_id) $cowsQuery->where('id_sapi', $cow_id);
        $cows = $cowsQuery->get();

        $result = $cows->map(function($cow) {
            $logs = $cow->behaviorLogs;
            return [
                'cowID' => $cow->cowID,
                'cowBreed' => $cow->cowBreed,
                'makanCount' => $logs->where('behActivity', 'Makan')->count(),
                'ruminasiCount' => $logs->where('behActivity', 'Ruminasi')->count(),
                'berjalanCount' => $logs->where('behActivity', 'Berjalan')->count(),
                'berdiriCount' => $logs->where('behActivity', 'Berdiri')->count(),
                'berbaringCount' => $logs->where('behActivity', 'Berbaring')->count(),
                'totalActivities' => $logs->count(),
            ];
        });

        return response()->json(['status' => 'success', 'date' => $date, 'data' => $cow_id ? $result->first() : $result]);
    }

    public function feedTotal(Request $request)
    {
        $physiologies = Fisiologis::all();
        $totalWeight = $physiologies->sum('phyCurrentWeight');
        $totalIdealDailyKg = round($totalWeight * 0.10, 2);

        return response()->json([
            'status' => 'success',
            'totalCowsCount' => $physiologies->count(),
            'totalPopulationWeightKg' => (float)$totalWeight,
            'totalIdealDailyFeedRequirementKg' => (float)$totalIdealDailyKg,
        ]);
    }

    public function feedCost(Request $request)
    {
        $pricePerKg = (float)$request->input('price_per_kg', 3500);
        $physiologies = Fisiologis::all();
        $totalWeight = $physiologies->sum('phyCurrentWeight');
        $totalIdealDailyKg = $totalWeight * 0.10;

        $dailyCost = round($totalIdealDailyKg * $pricePerKg);
        $weeklyCost = $dailyCost * 7;
        $monthlyCost = $dailyCost * 30;

        return response()->json([
            'status' => 'success',
            'estimatedPricePerKg' => $pricePerKg,
            'totalIdealDailyKg' => round($totalIdealDailyKg, 2),
            'dailyCostRupiah' => $dailyCost,
            'weeklyCostRupiah' => $weeklyCost,
            'monthlyCostRupiah' => $monthlyCost,
        ]);
    }

    public function weightChange(Request $request, $cow_id = null)
    {
        $physQuery = Fisiologis::with('cow');
        if ($cow_id) $physQuery->where('phyCowID', $cow_id);
        $list = $physQuery->get();

        $result = $list->map(function($p) {
            $init = $p->phyMeasuredInitialWeight ?? $p->phyInitialWeight ?? 250;
            $curr = $p->phyCurrentWeight ?? 350;
            $target = $p->phyTargetWeight ?? 500;
            $weightGain = round($curr - $init, 2);

            return [
                'cowID' => $p->phyCowID,
                'cowBreed' => $p->cow->cowBreed ?? 'Biasa',
                'initialWeightKg' => (float)$init,
                'currentWeightKg' => (float)$curr,
                'targetWeightKg' => (float)$target,
                'weightGainKg' => (float)$weightGain,
                'status' => $curr >= $target ? 'Target Tercapai' : 'Proses Penggemukan'
            ];
        });

        return response()->json(['status' => 'success', 'data' => $cow_id ? $result->first() : $result]);
    }

    public function profit(Request $request, $cow_id = null)
    {
        $marketPricePerKg = (float)$request->input('market_price_per_kg', 75000);
        $cowsQuery = Sapi::with(['physiology', 'feedLogs']);
        if ($cow_id) $cowsQuery->where('id_sapi', $cow_id);
        $cows = $cowsQuery->get();

        $result = $cows->map(function($cow) use ($marketPricePerKg) {
            $purchasePrice = (float)($cow->cowPurchasePrice ?? 12000000);
            $currWeight = (float)($cow->physiology->phyCurrentWeight ?? 350);
            $totalFeedKg = $cow->feedLogs->sum(fn($f) => ($f->feedInitialFeed - $f->feedLeftoverFeed) / 1000);
            $feedCost = round($totalFeedKg * 3500);
            $hpp = $purchasePrice + $feedCost;
            $estimatedMarketValue = round($currWeight * $marketPricePerKg);
            $profit = $estimatedMarketValue - $hpp;

            return [
                'cowID' => $cow->cowID,
                'cowBreed' => $cow->cowBreed,
                'purchasePriceRupiah' => $purchasePrice,
                'feedCostRupiah' => $feedCost,
                'hppRupiah' => $hpp,
                'currentWeightKg' => $currWeight,
                'estimatedMarketValueRupiah' => $estimatedMarketValue,
                'estimatedNetProfitRupiah' => $profit,
                'isProfitable' => $profit >= 0,
            ];
        });

        return response()->json([
            'status' => 'success',
            'marketPricePerKgSetting' => $marketPricePerKg,
            'data' => $cow_id ? $result->first() : $result
        ]);
    }
}
