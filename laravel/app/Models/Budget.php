<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Budget extends Model
{
    protected $table = 'orcamentos';

    protected $fillable = [
        'cliente',
        'email',
        'telefone',
        'data_evento',
        'hora_evento',
        'local_evento',
        'tipo_servico',
        'descricao',
        'valor_estimado',
        'observacoes',
        'status',
        'decorador_id',
        'created_via',
        'imagem',
        'tamanho_arco_m',
    ];

    protected $casts = [
        'data_evento' => 'date',
        'hora_evento' => 'datetime:H:i:s',
        'valor_estimado' => 'decimal:2',
        'tamanho_arco_m' => 'float',
    ];

    public function decorator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decorador_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(BudgetLog::class, 'budget_id');
    }

    public function projectCost(): HasOne
    {
        return $this->hasOne(ProjectCost::class, 'orcamento_id');
    }
}

