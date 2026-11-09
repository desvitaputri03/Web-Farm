<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CameraLog;
use Illuminate\Http\Request;

class CameraLogsController extends Controller
{
    public function index(Request $request)
    {
        $query = CameraLog::with('cow');
        if ($request->has('cow_id')) $query->where('id_sapi', $request->input('cow_id'));
        if ($request->has('activity')) $query->where('aktivitas', $request->input('activity'));
        if ($request->has('start_date')) $query->whereDate('waktu_deteksi', '>=', $request->input('start_date'));
        if ($request->has('end_date')) $query->whereDate('waktu_deteksi', '<=', $request->input('end_date'));
        $data = $query->orderBy('waktu_deteksi', 'desc')->get();
        return response()->json(['status' => 'success', 'total' => $data->count(), 'data' => $data]);
    }

    public function show($id)
    {
        $data = CameraLog::with('cow')->find($id);
        if (!$data) {
            return response()->json(['status' => 'error', 'message' => 'Data log kamera tidak ditemukan'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $data]);
    }
}
