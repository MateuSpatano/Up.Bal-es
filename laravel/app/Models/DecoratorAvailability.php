<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DecoratorAvailability extends Model
{
    protected $table = 'decorator_availability';

    protected $fillable = [
        'user_id',
        'available_days',
        'time_schedules',
        'service_intervals',
        'max_daily_services',
    ];

    protected $casts = [
        'available_days' => 'array',
        'time_schedules' => 'array',
        'service_intervals' => 'array',
        'max_daily_services' => 'integer',
    ];

    public function decorator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

