<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeedLog;
use Illuminate\Http\Request;

class FeedLogsController extends Controller
{
    public function index(Request $request)
    {
        $query = FeedLog::with(['cow', 'feedingStation']);
        if ($request->has('cow_id')) $query->where('id_sapi', $request->input('cow_id'));
        if ($request->has('station_id')) $query->where('id_tempat_makan', $request->input('station_id'));
        if ($request->has('date')) $query->whereDate('created_at', $request->input('date'));
        $data = $query->orderBy('created_at', 'desc')->get();
        return response()->json(['status' => 'success', 'total' => $data->count(), 'data' => $data]);
    }

    public function show($id)
    {
        $data = FeedLog::with(['cow', 'feedingStation'])->find($id);
        if (!$data) {
            return response()->json(['status' => 'error', 'message' => 'Data log pakan tidak ditemukan'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $data]);
    }
}
