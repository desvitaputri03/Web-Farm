<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Physiology;
use Illuminate\Http\Request;

class PhysiologiesController extends Controller
{
    public function index(Request $request)
    {
        $query = Physiology::with('cow');
        if ($request->has('cow_id')) $query->where('id_sapi', $request->input('cow_id'));
        $data = $query->get();
        return response()->json(['status' => 'success', 'total' => $data->count(), 'data' => $data]);
    }

    public function show($id)
    {
        $data = Physiology::with('cow')->where('id_fisiologis', $id)->first() ?? Physiology::where('id_sapi', $id)->first();
        if (!$data) {
            return response()->json(['status' => 'error', 'message' => 'Data fisiologis tidak ditemukan'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $data]);
    }
}
