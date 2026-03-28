<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Job extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'jobs';

    protected $fillable = [
        'title',
        'company',
        'description',
        'skills',
        'location',
        'lat',
        'lng',
        'source',
        'posted_at',
        'job_url',
        'domain',
        'user_id',
        'match_score',
        'is_manual',
        'visibility',
    ];

    protected $casts = [
        'skills'    => 'array',
        'location'  => 'array',
        'posted_at' => 'datetime',
        'is_manual' => 'boolean',
    ];
}
