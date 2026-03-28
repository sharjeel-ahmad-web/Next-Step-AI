<?php

namespace App\Services;

use App\Models\Job;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class JobNotificationService
{
    public function notifyNewJobs(User $user, array $jobs): void
    {
        if (empty($jobs) || empty($user->email)) {
            return;
        }

        $lines = array_map(function (Job $job) {
            return "{$job->title} at {$job->company}" . ($job->match_score ? " ({$job->match_score}% match)" : '');
        }, $jobs);

        $subject = 'New jobs near you';
        $body = "Hi {$user->name},\n\nWe found " . count($jobs) . " new jobs for you:\n- " . implode("\n- ", $lines) . "\n\nLog in to apply.";

        Mail::raw($body, function ($message) use ($user, $subject) {
            $message->to($user->email)->subject($subject);
        });
    }
}
