<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\JobFetcherService;
use App\Services\JobNotificationService;
use Illuminate\Console\Command;

class FetchJobsCommand extends Command
{
    protected $signature = 'jobs:fetch';
    protected $description = 'Fetch latest jobs for all users and notify them';

    public function __construct(
        protected JobFetcherService $jobFetcherService,
        protected JobNotificationService $jobNotificationService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $users = User::whereNotNull('email')->get();
        foreach ($users as $user) {
            $jobs = $this->jobFetcherService->fetchAndStoreForUser($user);
            $this->jobNotificationService->notifyNewJobs($user, $jobs);
            $this->info("Fetched " . count($jobs) . " jobs for {$user->email}");
        }

        // Cleanup outdated jobs (older than 30 days)
        \App\Models\Job::where('posted_at', '<', now()->subDays(30))->delete();

        return Command::SUCCESS;
    }
}
