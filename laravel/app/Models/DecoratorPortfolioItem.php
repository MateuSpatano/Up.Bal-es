<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DecoratorPortfolioItem extends Model
{
    protected $table = 'decorator_portfolio_items';

    protected $fillable = [
        'decorator_id',
        'service_type',
        'title',
        'description',
        'price',
        'arc_size',
        'image_path',
        'display_order',
        'is_featured',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'display_order' => 'integer',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function decorator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decorator_id');
    }
}

