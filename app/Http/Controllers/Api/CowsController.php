<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cow;
use Illuminate\Http\Request;

class CowsController extends Controller
{
    public function index(Request $request)
    {
        $query = Cow::with(['barn', 'physiology', 'feedingStation', 'owner']);
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

    public function show($id)
    {
        $data = Cow::with(['barn', 'physiology', 'feedingStation', 'owner', 'behaviorLogs', 'feedLogs', 'cameraLogs'])
                   ->where('id_sapi', $id)->first() ?? Cow::find($id);
        if (!$data) {
            return response()->json(['status' => 'error', 'message' => 'Data sapi tidak ditemukan'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $data]);
    }
}
