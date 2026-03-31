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
        return $this->lookup($company, ['company' => $company]);
    }

    /**
     * Resolve a free-form place string (e.g. city, state, country) to lat/lng.
     */
    public function geocodePlace(string $place): ?array
    {
        return $this->lookup($place, ['place' => $place]);
    }

    /**
     * Shared Nominatim lookup helper.
     */
    protected function lookup(string $query, array $context): ?array
    {
        try {
            $response = Http::timeout(8)->get('https://nominatim.openstreetmap.org/search', [
                'q' => $query,
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
                'address' => $item['display_name'] ?? $query,
            ];
        } catch (\Throwable $e) {
            Log::warning('Geocode failed', array_merge($context, ['error' => $e->getMessage()]));
            return null;
        }
    }
}
