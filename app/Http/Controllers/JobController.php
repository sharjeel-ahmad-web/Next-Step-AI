<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Services\JobFetcherService;
use App\Services\JobMatchingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JobController extends Controller
{
    public function __construct(
        protected JobFetcherService $jobFetcherService,
        protected JobMatchingService $jobMatchingService
    ) {
    }

    /**
     * GET /api/jobs
     */
    public function index(Request $request)
    {
        $userId = (string) $request->user()->_id;
        $query = Job::query()->where(function ($q) use ($userId) {
            $q->where('visibility', 'public')
              ->orWhere('user_id', $userId)
              ->orWhereNull('visibility');
        });

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('company', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        if ($request->filled('source')) {
            $query->where('source', $request->query('source'));
        }

        if ($request->filled('min_match')) {
            $query->where('match_score', '>=', (int) $request->query('min_match'));
        }

        if ($request->filled('max_age_days')) {
            $query->where('posted_at', '>=', now()->subDays((int) $request->query('max_age_days')));
        }

        if ($request->boolean('manual_only')) {
            $query->where('is_manual', true);
        }

        if ($request->filled('location_text')) {
            $loc = $request->query('location_text');
            $query->where('location->city', 'like', "%{$loc}%");
        }

        $jobs = $query->orderBy('posted_at', 'desc')->limit(80)->get();

        return response()->json($jobs);
    }

    /**
     * GET /api/jobs/nearby
     */
    public function nearby(Request $request)
    {
        $user = $request->user();
        $location = $user->location;

        if (!$location) {
            return response()->json(['message' => 'Location missing'], 400);
        }

        $jobs = Job::where('user_id', (string) $user->_id)
            ->whereNotNull('lat')
            ->whereNotNull('lng')
            ->get()
            ->filter(function (Job $job) use ($location) {
                $distance = $this->distanceKm($location['lat'], $location['lng'], $job->lat, $job->lng);
                return $distance <= 50; // 50km radius
            })
            ->values();

        return response()->json([
            'user_location' => $location,
            'jobs' => $jobs,
        ]);
    }

    /**
     * POST /api/jobs/fetch
     */
    public function fetch(Request $request)
    {
        $user = $request->user();
        $locationText = $request->input('location_text');
        $jobs = $this->jobFetcherService->fetchAndStoreForUser($user, $locationText);

        return response()->json([
            'fetched' => count($jobs),
            'jobs' => $jobs,
        ]);
    }

    /**
     * POST /api/jobs  - manual listing
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'description' => 'required|string',
            'skills' => 'nullable|array',
            'location_text' => 'required|string|max:255',
            'job_url' => 'nullable|url|max:2048',
            'domain' => 'nullable|string|max:255',
            'visibility' => 'nullable|string|in:public,private',
        ]);

        $job = Job::create([
            'title' => $data['title'],
            'company' => $data['company'],
            'description' => $data['description'],
            'skills' => $data['skills'] ?? [],
            'location' => ['city' => $data['location_text']],
            'source' => 'internal',
            'posted_at' => now(),
            'job_url' => $data['job_url'] ?? null,
            'domain' => $data['domain'] ?? $data['title'],
            'user_id' => (string) $request->user()->_id,
            'is_manual' => true,
            'visibility' => $data['visibility'] ?? 'public',
        ]);

        return response()->json($job, 201);
    }

    protected function distanceKm(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }
}
