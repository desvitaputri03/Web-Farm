<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barn;
use Illuminate\Http\Request;

class BarnsController extends Controller
{
    public function index(Request $request)
    {
        $query = Barn::query();
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('id_kandang', 'like', "%{$search}%")
                  ->orWhere('nama_kandang', 'like', "%{$search}%")
                  ->orWhere('lokasi_kandang', 'like', "%{$search}%");
            });
        }
        $data = $query->get();
        return response()->json(['status' => 'success', 'total' => $data->count(), 'data' => $data]);
    }

    public function show($id)
    {
        $data = Barn::with('cows')->where('id_kandang', $id)->first() ?? Barn::find($id);
        if (!$data) {
            return response()->json(['status' => 'error', 'message' => 'Data kandang tidak ditemukan'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $data]);
    }
}
