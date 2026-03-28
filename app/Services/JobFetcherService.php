<?php

namespace App\Services;

use App\Models\Job;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JobFetcherService
{
    public function __construct(
        protected CompanyLocationService $companyLocationService,
        protected JobMatchingService $jobMatchingService
    ) {
    }

    /**
     * Fetch jobs for a user from multiple free providers.
     */
    public function fetchAndStoreForUser(User $user, ?string $locationText = null): array
    {
        $domain   = $user->domain ?? '';
        $skills   = $user->skills ?? [];
        $location = $user->location ?? null;

        $jobs = collect()
            ->merge($this->fetchFromJSearch($domain, $skills, $location, $locationText))
            ->merge($this->fetchFromArbeitnow($domain, $skills))
            ->merge($this->fetchFromAdzuna($domain, $skills, $location, $locationText))
            ->merge($this->fetchFromLinkedInSerpApi($domain, $skills, $location, $locationText))
            ->merge($this->fetchFromIndeedSerpApi($domain, $skills, $location, $locationText));

        // keep only very recent jobs (48h) where posted_at known or default now
        $recentThreshold = now()->subDays(2);
        $jobs = $jobs->filter(function (array $job) use ($recentThreshold) {
            $posted = $job['posted_at'] ?? null;
            return !$posted || $posted >= $recentThreshold;
        });

        $saved = [];
        foreach ($jobs as $job) {
            $saved[] = $this->storeJob($job, $user);
        }

        return array_filter($saved);
    }

    protected function storeJob(array $data, User $user): ?Job
    {
        if (empty($data['title']) || empty($data['company'])) {
            return null;
        }

        $matchScore = $this->jobMatchingService->score(
            $user->skills ?? [],
            $user->domain ?? null,
            $data['skills'] ?? [],
            $data['title'] ?? ''
        );

        // Avoid duplicates by URL or title+company
        $existing = Job::where('job_url', $data['job_url'] ?? '')
            ->orWhere(function ($q) use ($data) {
                $q->where('title', $data['title'] ?? '')
                  ->where('company', $data['company'] ?? '');
            })
            ->first();

        $geo = null;
        if (!empty($data['company'])) {
            $geo = $this->companyLocationService->geocode($data['company']);
        }

        $payload = array_merge($data, [
            'user_id'    => (string) $user->_id,
            'match_score'=> $matchScore,
            'lat'        => $data['lat'] ?? ($geo['lat'] ?? null),
            'lng'        => $data['lng'] ?? ($geo['lng'] ?? null),
            'location'   => $data['location'] ?? ($geo ? ['address' => $geo['address']] : null),
            'posted_at'  => $data['posted_at'] ?? now(),
        ]);

        if ($existing) {
            $existing->fill($payload)->save();
            return $existing;
        }

        return Job::create($payload);
    }

    // ------------------ Providers ------------------ //

    protected function fetchFromJSearch(string $domain, array $skills, ?array $location, ?string $locationText): array
    {
        $apiKey = env('JSEARCH_API_KEY');
        if (!$apiKey) {
            return [];
        }

        try {
            $query = trim($domain . ' ' . implode(' ', $skills));
            $params = [
                'query' => $query ?: 'graduate',
                'page' => 1,
                'num_pages' => 1,
                'date_posted' => 'month',
                'location' => $locationText ?: $this->formatLocationText($location),
            ];

            $response = Http::withHeaders([
                'X-RapidAPI-Key' => $apiKey,
                'X-RapidAPI-Host' => 'jsearch.p.rapidapi.com',
            ])->get('https://jsearch.p.rapidapi.com/search', $params);

            if ($response->failed()) {
                Log::warning('JSearch fetch failed', ['body' => $response->body()]);
                return [];
            }

            return collect($response->json('data', []))
                ->map(function ($item) {
                    return [
                        'title' => $item['job_title'] ?? '',
                        'company' => $item['employer_name'] ?? '',
                        'description' => $item['job_description'] ?? '',
                        'skills' => $item['job_required_skills'] ?? [],
                        'location' => [
                            'city' => $item['job_city'] ?? '',
                            'country' => $item['job_country'] ?? '',
                        ],
                        'lat' => $item['job_latitude'] ?? null,
                        'lng' => $item['job_longitude'] ?? null,
                        'source' => 'jsearch',
                        'posted_at' => $this->parseDate($item['job_posted_at_datetime_utc'] ?? null),
                        'job_url' => $item['job_apply_link'] ?? '',
                        'domain' => $item['job_title'] ?? '',
                    ];
                })
                ->all();
        } catch (\Throwable $e) {
            Log::warning('JSearch fetch exception', ['error' => $e->getMessage()]);
            return [];
        }
    }

    protected function fetchFromArbeitnow(string $domain, array $skills): array
    {
        try {
            $response = Http::timeout(10)->get('https://api.arbeitnow.com/jobs', [
                'query' => $domain ?: implode(' ', $skills),
            ]);

            if ($response->failed()) {
                return [];
            }

            return collect($response->json('data', []))->map(function ($item) {
                return [
                    'title' => $item['title'] ?? '',
                    'company' => $item['company'] ?? '',
                    'description' => strip_tags($item['description'] ?? ''),
                    'skills' => [],
                    'location' => [
                        'city' => $item['location'] ?? '',
                    ],
                    'source' => 'arbeitnow',
                    'posted_at' => $this->parseDate($item['created_at'] ?? null),
                    'job_url' => $item['url'] ?? '',
                    'domain' => $item['title'] ?? '',
                ];
            })->all();
        } catch (\Throwable $e) {
            Log::warning('Arbeitnow fetch failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    protected function fetchFromAdzuna(string $domain, array $skills, ?array $location, ?string $locationText): array
    {
        $appId  = env('ADZUNA_APP_ID');
        $appKey = env('ADZUNA_APP_KEY');
        if (!$appId || !$appKey) {
            return [];
        }

        $what = trim($domain . ' ' . implode(' ', $skills)) ?: 'graduate';
        $where = $locationText ?: $this->formatLocationText($location);

        $country = env('ADZUNA_COUNTRY', 'us');
        $url = "https://api.adzuna.com/v1/api/jobs/{$country}/search/1";
        try {
            $response = Http::get($url, [
                'app_id' => $appId,
                'app_key' => $appKey,
                'results_per_page' => 20,
                'what' => $what,
                'where' => $where,
                'max_days_old' => 2,
                'sort_by' => 'date',
            ]);

            if ($response->failed()) {
                Log::warning('Adzuna fetch failed', ['body' => $response->body()]);
                return [];
            }

            return collect($response->json('results', []))->map(function ($item) {
                return [
                    'title' => $item['title'] ?? '',
                    'company' => data_get($item, 'company.display_name', ''),
                    'description' => $item['description'] ?? '',
                    'skills' => [],
                    'location' => [
                        'city' => data_get($item, 'location.display_name'),
                    ],
                    'lat' => data_get($item, 'latitude'),
                    'lng' => data_get($item, 'longitude'),
                    'source' => 'adzuna',
                    'posted_at' => $this->parseDate($item['created'] ?? null),
                    'job_url' => $item['redirect_url'] ?? '',
                    'domain' => $item['title'] ?? '',
                ];
            })->all();
        } catch (\Throwable $e) {
            Log::warning('Adzuna fetch exception', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * LinkedIn via SerpAPI (engine=linkedin_jobs)
     * Note: requires SERPAPI_KEY. Location should be city/state for best results.
     */
    protected function fetchFromLinkedInSerpApi(string $domain, array $skills, ?array $location, ?string $locationText): array
    {
        $apiKey = env('SERPAPI_KEY');
        if (!$apiKey) {
            return [];
        }

        $keywords = trim($domain . ' ' . implode(' ', $skills)) ?: 'graduate';
        $params = [
            'engine' => 'linkedin_jobs',
            'keywords' => $keywords,
            'location' => $locationText ?: $this->formatLocationText($location),
            'api_key' => $apiKey,
            'start' => 0,
        ];

        try {
            $response = Http::get('https://serpapi.com/search.json', $params);
            if ($response->failed()) {
                Log::warning('SerpAPI LinkedIn fetch failed', ['body' => $response->body()]);
                return [];
            }

            return collect($response->json('jobs_results', []))->map(function ($item) {
                return [
                    'title' => $item['title'] ?? '',
                    'company' => $item['company_name'] ?? '',
                    'description' => $item['description'] ?? '',
                    'skills' => [],
                    'location' => [
                        'city' => $item['location'] ?? '',
                    ],
                    'lat' => data_get($item, 'detected_extensions.latitude'),
                    'lng' => data_get($item, 'detected_extensions.longitude'),
                    'source' => 'linkedin',
                    'posted_at' => $this->parseDate($item['posted_at'] ?? null),
                    'job_url' => $item['link'] ?? '',
                    'domain' => $item['title'] ?? '',
                ];
            })->all();
        } catch (\Throwable $e) {
            Log::warning('SerpAPI LinkedIn exception', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Indeed via SerpAPI (engine=indeed)
     */
    protected function fetchFromIndeedSerpApi(string $domain, array $skills, ?array $location, ?string $locationText): array
    {
        $apiKey = env('SERPAPI_KEY');
        if (!$apiKey) {
            return [];
        }

        $keywords = trim($domain . ' ' . implode(' ', $skills)) ?: 'graduate';
        $params = [
            'engine' => 'indeed',
            'q' => $keywords,
            'l' => $locationText ?: $this->formatLocationText($location),
            'fromage' => 2, // last 48h
            'api_key' => $apiKey,
        ];

        try {
            $response = Http::get('https://serpapi.com/search.json', $params);
            if ($response->failed()) {
                Log::warning('SerpAPI Indeed fetch failed', ['body' => $response->body()]);
                return [];
            }

            return collect($response->json('jobs_results', []))->map(function ($item) {
                return [
                    'title' => $item['title'] ?? '',
                    'company' => $item['company_name'] ?? '',
                    'description' => $item['description'] ?? '',
                    'skills' => [],
                    'location' => [
                        'city' => $item['location'] ?? '',
                    ],
                    'source' => 'indeed',
                    'posted_at' => $this->parseDate($item['detected_extensions']['posted_at'] ?? null),
                    'job_url' => $item['link'] ?? '',
                    'domain' => $item['title'] ?? '',
                ];
            })->all();
        } catch (\Throwable $e) {
            Log::warning('SerpAPI Indeed exception', ['error' => $e->getMessage()]);
            return [];
        }
    }

    protected function formatLocationText(?array $location): string
    {
        if (!$location) {
            return '';
        }
        $lat = $location['lat'] ?? null;
        $lng = $location['lng'] ?? null;
        return ($lat && $lng) ? "{$lat},{$lng}" : '';
    }

    protected function parseDate(?string $date): ?Carbon
    {
        if (!$date) {
            return null;
        }

        try {
            return Carbon::parse($date);
        } catch (\Throwable) {
            return null;
        }
    }
}
