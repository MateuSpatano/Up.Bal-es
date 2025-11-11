<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RememberToken extends Model
{
    protected $table = 'remember_tokens';

    protected $fillable = [
        'user_id',
        'token',
        'expires_at',
        'is_admin',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_admin' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

