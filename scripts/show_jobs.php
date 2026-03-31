<?php

// Minimal helper to dump recent jobs.
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$jobs = App\Models\Job::orderBy('posted_at', 'desc')
    ->take(5)
    ->get(['title', 'company', 'source', 'job_url']);

echo json_encode($jobs, JSON_PRETTY_PRINT) . PHP_EOL;
