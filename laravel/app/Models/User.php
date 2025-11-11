<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The database table used by the model.
     */
    protected $table = 'usuarios';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nome',
        'email',
        'email_comunicacao',
        'telefone',
        'whatsapp',
        'cpf',
        'endereco',
        'cidade',
        'estado',
        'cep',
        'senha',
        'slug',
        'perfil',
        'ativo',
        'aprovado_por_admin',
        'bio',
        'especialidades',
        'portfolio_images',
        'redes_sociais',
        'is_active',
        'is_admin',
        'email_verified',
        'email_verification_token',
        'password_reset_token',
        'password_reset_expires',
        'last_login',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'senha',
        'password_reset_token',
        'password_reset_expires',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ativo' => 'boolean',
            'aprovado_por_admin' => 'boolean',
            'portfolio_images' => 'array',
            'redes_sociais' => 'array',
            'is_active' => 'boolean',
            'is_admin' => 'boolean',
            'email_verified' => 'boolean',
            'password_reset_expires' => 'datetime',
            'last_login' => 'datetime',
        ];
    }

    /**
     * Retrieve the password for the user.
     */
    public function getAuthPassword()
    {
        return $this->senha;
    }

    protected static function booted(): void
    {
        static::creating(function (self $user) {
            if (empty($user->slug) && !empty($user->nome)) {
                $user->slug = Str::slug($user->nome);
            }
        });
    }
}
