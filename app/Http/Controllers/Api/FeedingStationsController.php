<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeedingStation;
use Illuminate\Http\Request;

class FeedingStationsController extends Controller
{
    public function index(Request $request)
    {
        $query = FeedingStation::with('barn');
        if ($request->has('location')) $query->where('lokasi_tempat_makan', $request->input('location'));
        if ($request->has('type')) $query->where('tipe_tempat_makan', $request->input('type'));
        $data = $query->get();
        return response()->json(['status' => 'success', 'total' => $data->count(), 'data' => $data]);
    }

    public function show($id)
    {
        $data = FeedingStation::with('barn')->where('id_tempat_makan', $id)->first() ?? FeedingStation::where('kode_tempat_makan', $id)->first();
        if (!$data) {
            return response()->json(['status' => 'error', 'message' => 'Data stasiun pakan tidak ditemukan'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $data]);
    }
}
