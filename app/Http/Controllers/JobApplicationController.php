<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Http\Request;

class JobApplicationController extends Controller
{
    /**
     * POST /api/jobs/{id}/apply
     */
    public function apply(Request $request, string $id)
    {
        $data = $request->validate([
            'cover_note' => 'nullable|string|max:4000',
            'resume_url' => 'nullable|url|max:2048',
        ]);

        $job = Job::find($id);
        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }

        $existing = JobApplication::where('job_id', $id)->where('user_id', (string) $request->user()->_id)->first();
        if ($existing) {
            return response()->json(['message' => 'Already applied'], 400);
        }

        $app = JobApplication::create([
            'job_id' => $id,
            'user_id' => (string) $request->user()->_id,
            'cover_note' => $data['cover_note'] ?? '',
            'resume_url' => $data['resume_url'] ?? null,
            'status' => 'applied',
            'applied_at' => now(),
        ]);

        return response()->json($app, 201);
    }

    /**
     * GET /api/job-applications  (current user)
     */
    public function myApplications(Request $request)
    {
        $apps = JobApplication::where('user_id', (string) $request->user()->_id)
            ->orderBy('applied_at', 'desc')
            ->get();

        return response()->json($apps);
    }
}
