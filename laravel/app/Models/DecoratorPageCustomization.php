<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DecoratorPageCustomization extends Model
{
    protected $table = 'decorator_page_customization';

    protected $fillable = [
        'decorator_id',
        'page_title',
        'page_description',
        'welcome_text',
        'cover_image_url',
        'primary_color',
        'secondary_color',
        'accent_color',
        'services_config',
        'social_media',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'show_contact_section',
        'show_services_section',
        'show_portfolio_section',
        'is_active',
    ];

    protected $casts = [
        'services_config' => 'array',
        'social_media' => 'array',
        'show_contact_section' => 'boolean',
        'show_services_section' => 'boolean',
        'show_portfolio_section' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function decorator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decorator_id');
    }
}

