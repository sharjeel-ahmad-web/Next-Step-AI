<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Roadmap;
use App\Models\Certificate;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * GET /api/admin/users
     */
    public function getUsers(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $perPage = (int) $request->query('per_page', 20);
        $search  = $request->query('search', '');

        $query = User::query();
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data'  => $users->items(),
            'total' => $users->total(),
            'page'  => $users->currentPage(),
            'pages' => $users->lastPage(),
        ]);
    }

    /**
     * DELETE /api/admin/users/{id}
     */
    public function deleteUser(Request $request, $id)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot delete admin user'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * PATCH /api/admin/users/{id}/role
     */
    public function updateRole(Request $request, $id)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'role' => 'required|string|in:user,admin'
        ]);

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => 'User role updated', 'user' => $user]);
    }

    /**
     * GET /api/admin/stats
     */
    public function getStats(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'total_users'        => User::count(),
            'total_roadmaps'     => Roadmap::count(),
            'total_certificates' => Certificate::count(),
            'active_today'       => User::where('updated_at', '>=', now()->startOfDay())->count(),
        ]);
    }

    /**
     * DELETE /api/admin/certificates/{id}
     */
    public function deleteCertificate(Request $request, $id)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $cert = Certificate::find($id);
        if (!$cert) {
            return response()->json(['message' => 'Certificate not found'], 404);
        }

        $cert->delete();
        return response()->json(['message' => 'Certificate deleted']);
    }
}
