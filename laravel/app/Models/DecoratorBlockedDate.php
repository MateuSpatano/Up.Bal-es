<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DecoratorBlockedDate extends Model
{
    protected $table = 'decorator_blocked_dates';

    protected $fillable = [
        'user_id',
        'blocked_date',
        'reason',
        'is_recurring',
    ];

    protected $casts = [
        'blocked_date' => 'date',
        'is_recurring' => 'boolean',
    ];

    public function decorator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

