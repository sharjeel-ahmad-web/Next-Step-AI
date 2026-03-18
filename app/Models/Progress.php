<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Progress extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'progress';

    protected $fillable = [
        'user_id',
        'roadmap_id',
        'completed_nodes',
        'videos_watched',
        'passed_quizzes',
        'status',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'completed_nodes' => 'array',
        'videos_watched'  => 'array',
        'passed_quizzes'  => 'array',
        'started_at'      => 'datetime',
        'completed_at'    => 'datetime',
    ];
}
