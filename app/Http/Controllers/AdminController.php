<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Sapi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    /**
     * Get paginated list of users with database statistics.
     */
    public function listUsers(Request $request): JsonResponse
    {
        $query = User::whereIn('role', ['peternak', 'mantri']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        $sort = $request->query('sort', 'terbaru');
        if ($sort === 'terlama') {
            $query->orderBy('created_at', 'asc')->orderBy('id', 'asc');
        } elseif ($sort === 'az') {
            $query->orderBy('email', 'asc');
        } elseif ($sort === 'za') {
            $query->orderBy('email', 'desc');
        } else {
            $query->orderBy('created_at', 'desc')->orderBy('id', 'desc');
        }

        $limit  = min(max((int) $request->query('limit', 10), 1), 100);
        $offset = max((int) $request->query('offset', 0), 0);
        $total  = (clone $query)->count();
        $data   = (clone $query)->skip($offset)->take($limit)->get(['id', 'name', 'email', 'nomor_telepon', 'role', 'created_at']);

        // Aggregate statistics from database
        $peternakCount = User::where('role', 'peternak')->count();
        $mantriCount   = User::where('role', 'mantri')->count();
        $adminCount    = User::where('role', 'admin')->count();
        $cowCount      = Sapi::count();

        return response()->json([
            'data'   => $data,
            'total'  => $total,
            'limit'  => $limit,
            'offset' => $offset,
            'stats'  => [
                'total_users'    => $peternakCount + $mantriCount,
                'peternak_count' => $peternakCount,
                'mantri_count'   => $mantriCount,
                'admin_count'    => $adminCount,
                'cow_count'      => $cowCount,
            ]
        ]);
    }

    /**
     * Store a newly created user in database.
     */
    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'email'         => 'required|string|email|max:100|unique:users,email',
            'role'          => 'required|in:peternak,mantri',
            'password'      => 'required|string',
            'name'          => 'nullable|string|max:100',
            'nomor_telepon' => 'nullable|string|max:20',
        ], [
            'email.required'    => 'Email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'email.unique'      => 'Email sudah terdaftar di sistem.',
            'role.required'     => 'Role pengguna harus dipilih.',
            'role.in'           => 'Role hanya boleh Peternak atau Mantri.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $email = trim($validated['email']);
        $name  = !empty($validated['name']) ? trim($validated['name']) : explode('@', $email)[0];

        $user = User::create([
            'name'          => $name,
            'email'         => $email,
            'nomor_telepon' => $request->input('nomor_telepon'),
            'password'      => Hash::make($validated['password']),
            'role'          => $validated['role'],
        ]);

        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json(['message' => "Pengguna {$user->email} berhasil ditambahkan."]);
        }
        return redirect()->back()->with('success', "Pengguna {$user->email} berhasil ditambahkan.");
    }

    /**
     * Update user in database.
     */
    public function updateUser(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        if (auth()->id() === $user->id && $request->input('role') !== 'admin') {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['errors' => ['error' => 'Admin tidak dapat menurunkan role akun sendiri.']], 403);
            }
            return redirect()->back()->withErrors(['error' => 'Admin tidak dapat menurunkan role akun sendiri.']);
        }

        $validated = $request->validate([
            'email'         => 'required|string|email|max:100|unique:users,email,' . $user->id,
            'role'          => 'required|in:peternak,mantri,admin',
            'password'      => 'nullable|string',
            'name'          => 'nullable|string|max:100',
            'nomor_telepon' => 'nullable|string|max:20',
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email'    => 'Format email tidak valid.',
            'email.unique'   => 'Email sudah terdaftar di sistem.',
            'role.required'  => 'Role pengguna harus dipilih.',
            'role.in'        => 'Role tidak valid.',
        ]);

        $email = trim($validated['email']);
        $name  = !empty($validated['name']) ? trim($validated['name']) : explode('@', $email)[0];

        $user->name  = $name;
        $user->email = $email;
        $user->role  = $validated['role'];
        if ($request->has('nomor_telepon')) {
            $user->nomor_telepon = $request->input('nomor_telepon');
        }
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();

        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json(['message' => "Pengguna {$user->email} berhasil diperbarui."]);
        }
        return redirect()->back()->with('success', "Pengguna {$user->email} berhasil diperbarui.");
    }

    /**
     * Delete user from database.
     */
    public function destroyUser(Request $request, string $id)
    {
        $user = User::find($id);

        if (!$user) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['errors' => ['error' => 'Pengguna tidak ditemukan.']], 404);
            }
            return redirect()->back()->withErrors(['error' => 'Pengguna tidak ditemukan.']);
        }

        if ($user->role === 'admin' || auth()->id() === $user->id) {
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json(['errors' => ['error' => 'Akun admin utama tidak dapat dihapus.']], 403);
            }
            return redirect()->back()->withErrors(['error' => 'Akun admin utama tidak dapat dihapus.']);
        }

        $user->delete();

        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json(['message' => "Pengguna {$user->email} berhasil dihapus."]);
        }
        return redirect()->back()->with('success', "Pengguna {$user->email} berhasil dihapus.");
    }
}
