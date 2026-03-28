<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CompanyLocationService
{
    /**
    * Resolve company name to lat/lng using OpenStreetMap Nominatim.
    */
    public function geocode(string $company): ?array
    {
        try {
            $response = Http::timeout(8)->get('https://nominatim.openstreetmap.org/search', [
                'q' => $company,
                'format' => 'json',
                'limit' => 1,
            ]);

            if ($response->failed()) {
                return null;
            }

            $item = $response->json()[0] ?? null;
            if (!$item) {
                return null;
            }

            return [
                'lat' => (float) ($item['lat'] ?? 0),
                'lng' => (float) ($item['lon'] ?? 0),
                'address' => $item['display_name'] ?? $company,
            ];
        } catch (\Throwable $e) {
            Log::warning('Company geocode failed', ['error' => $e->getMessage(), 'company' => $company]);
            return null;
        }
    }
}
