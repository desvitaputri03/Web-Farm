<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BehaviorLog;
use Illuminate\Http\Request;

class BehaviorLogsController extends Controller
{
    public function index(Request $request)
    {
        $query = BehaviorLog::query();
        if ($request->has('cow_id')) {
            $query->where('id_sapi', $request->input('cow_id'));
        }
        if ($request->has('start_date')) {
            $query->whereDate('waktu_mulai', '>=', $request->input('start_date'));
        }
        if ($request->has('end_date')) {
            $query->whereDate('waktu_mulai', '<=', $request->input('end_date'));
        }
        $data = $query->orderBy('waktu_mulai', 'desc')->get();
        return response()->json(['status' => 'success', 'total' => $data->count(), 'data' => $data]);
    }

    public function show($id)
    {
        $data = BehaviorLog::find($id);
        if (!$data) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $data]);
    }
}
