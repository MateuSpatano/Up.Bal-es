<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectCost extends Model
{
    protected $table = 'projeto_custos';

    protected $fillable = [
        'orcamento_id',
        'preco_venda',
        'custo_total_materiais',
        'custo_total_mao_de_obra',
        'custos_diversos',
        'custo_total_projeto',
        'lucro_real_liquido',
        'margem_lucro_percentual',
        'observacoes',
    ];

    protected $casts = [
        'preco_venda' => 'decimal:2',
        'custo_total_materiais' => 'decimal:2',
        'custo_total_mao_de_obra' => 'decimal:2',
        'custos_diversos' => 'decimal:2',
        'custo_total_projeto' => 'decimal:2',
        'lucro_real_liquido' => 'decimal:2',
        'margem_lucro_percentual' => 'decimal:2',
    ];

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class, 'orcamento_id');
    }
}

