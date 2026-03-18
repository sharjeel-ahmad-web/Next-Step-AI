<?php

namespace App\Providers;

use App\Services\PracticeTaskService;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;
use App\Models\PersonalAccessToken;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(PracticeTaskService::class, fn () => new PracticeTaskService());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Use our custom MongoDB-backed PersonalAccessToken model
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
    }
}
