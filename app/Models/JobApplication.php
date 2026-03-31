<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class JobApplication extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'job_applications';

    protected $fillable = [
        'job_id',
        'user_id',
        'cover_note',
        'resume_url',
        'status',
        'applied_at',
    ];

    protected $casts = [
        'applied_at' => 'datetime',
    ];
}
