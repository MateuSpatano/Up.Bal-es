<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\ProjectCost;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class DecoratorDashboardService
{
    public function __construct(private readonly User $decorator)
    {
    }

    /**
     * @return array<string, mixed>
     */
    public function summary(Carbon $from, Carbon $to): array
    {
        return [
            'kpis' => $this->buildKpis($from, $to),
            'series' => $this->buildChartSeries(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function projects(): array
    {
        return Budget::with('projectCost')
            ->where('decorador_id', $this->decorator->id)
            ->where('status', 'aprovado')
            ->orderByDesc('data_evento')
            ->limit(20)
            ->get()
            ->map(fn (Budget $budget) => $this->formatProjectListItem($budget))
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function projectDetails(Budget $budget): array
    {
        $budget->load('projectCost');

        return $this->formatProjectDetails($budget);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function saveProjectCosts(Budget $budget, array $payload): array
    {
        $materials = (float) ($payload['custo_total_materiais'] ?? 0);
        $labor = (float) ($payload['custo_total_mao_de_obra'] ?? 0);
        $others = (float) ($payload['custos_diversos'] ?? 0);
        $observacoes = $payload['observacoes'] ?? null;

        $precoVenda = (float) ($budget->valor_estimado ?? 0);
        $custoTotal = round($materials + $labor + $others, 2);
        $lucroLiquido = round($precoVenda - $custoTotal, 2);
        $margem = $precoVenda > 0 ? round(($lucroLiquido / $precoVenda) * 100, 2) : 0.0;

        ProjectCost::updateOrCreate(
            ['orcamento_id' => $budget->id],
            [
                'preco_venda' => $precoVenda,
                'custo_total_materiais' => $materials,
                'custo_total_mao_de_obra' => $labor,
                'custos_diversos' => $others,
                'custo_total_projeto' => $custoTotal,
                'lucro_real_liquido' => $lucroLiquido,
                'margem_lucro_percentual' => $margem,
                'observacoes' => $observacoes,
            ]
        );

        $budget->load('projectCost');

        return $this->formatProjectDetails($budget);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildKpis(Carbon $from, Carbon $to): array
    {
        $baseQuery = Budget::where('decorador_id', $this->decorator->id)
            ->whereBetween('data_evento', [$from->toDateString(), $to->toDateString()]);

        $festasTotal = (clone $baseQuery)->count();

        $festasSolicitadasClientes = (clone $baseQuery)
            ->where('created_via', 'client')
            ->count();

        $festasCriadasDecorador = (clone $baseQuery)
            ->where(function (Builder $query) {
                $query->where('created_via', 'decorator')
                    ->orWhereNull('created_via');
            })
            ->count();

        $receitaRecebida = (clone $baseQuery)
            ->where('status', 'aprovado')
            ->sum('valor_estimado');

        $lucroTotalMes = ProjectCost::whereHas('budget', function (Builder $query) use ($from, $to) {
            $query->where('decorador_id', $this->decorator->id)
                ->whereBetween('data_evento', [$from->toDateString(), $to->toDateString()]);
        })->sum('lucro_real_liquido');

        $margemMediaLucro = ProjectCost::whereHas('budget', function (Builder $query) use ($from, $to) {
            $query->where('decorador_id', $this->decorator->id)
                ->whereBetween('data_evento', [$from->toDateString(), $to->toDateString()]);
        })->avg('margem_lucro_percentual') ?? 0;

        return [
            'festas_total' => (int) $festasTotal,
            'festas_solicitadas_clientes' => (int) $festasSolicitadasClientes,
            'festas_criadas_decorador' => (int) $festasCriadasDecorador,
            'receita_recebida' => (float) $receitaRecebida,
            'lucro_total_mes' => (float) $lucroTotalMes,
            'margem_media_lucro' => (float) $margemMediaLucro,
        ];
    }

    /**
     * @return array<string, array<int, array<string, int|string>>>
     */
    private function buildChartSeries(): array
    {
        return [
            'festas_por_mes_12m' => $this->festasPorMes(),
            'festas_por_ano_5a' => $this->festasPorAno(),
        ];
    }

    /**
     * @return array<int, array<string, int|string>>
     */
    private function festasPorMes(): array
    {
        $start = Carbon::now()->startOfMonth()->subMonths(11);
        $rawData = Budget::selectRaw("DATE_FORMAT(data_evento, '%Y-%m') as period, COUNT(*) as total")
            ->where('decorador_id', $this->decorator->id)
            ->where('data_evento', '>=', $start->toDateString())
            ->groupBy('period')
            ->orderBy('period')
            ->pluck('total', 'period');

        return $this->buildMonthlySeries($start, $rawData);
    }

    /**
     * @return array<int, array<string, int>>
     */
    private function festasPorAno(): array
    {
        $startYear = (int) Carbon::now()->subYears(4)->format('Y');
        $rawData = Budget::selectRaw('YEAR(data_evento) as period, COUNT(*) as total')
            ->where('decorador_id', $this->decorator->id)
            ->where('data_evento', '>=', Carbon::create($startYear)->startOfYear()->toDateString())
            ->groupBy('period')
            ->orderBy('period')
            ->pluck('total', 'period');

        return collect(range($startYear, $startYear + 4))
            ->map(fn (int $year) => [
                'ano' => $year,
                'total' => (int) ($rawData[$year] ?? 0),
            ])
            ->all();
    }

    /**
     * @param  \Illuminate\Support\Collection<string, int|string>  $rawData
     * @return array<int, array<string, int|string>>
     */
    private function buildMonthlySeries(Carbon $start, Collection $rawData): array
    {
        return collect(range(0, 11))
            ->map(function (int $offset) use ($start, $rawData) {
                $month = $start->copy()->addMonths($offset)->format('Y-m');

                return [
                    'mes' => $month,
                    'total' => (int) ($rawData[$month] ?? 0),
                ];
            })
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function formatProjectListItem(Budget $budget): array
    {
        $cost = $budget->projectCost;

        return [
            'id' => $budget->id,
            'cliente' => $budget->cliente,
            'email' => $budget->email,
            'data_evento' => optional($budget->data_evento)->toDateString(),
            'tipo_servico' => $budget->tipo_servico,
            'valor_estimado' => (float) ($budget->valor_estimado ?? 0),
            'local_evento' => $budget->local_evento,
            'descricao' => $budget->descricao,
            'custos_lancados' => $cost !== null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatProjectDetails(Budget $budget): array
    {
        $cost = $budget->projectCost;

        return [
            'id' => $budget->id,
            'cliente' => $budget->cliente,
            'valor_estimado' => (float) ($budget->valor_estimado ?? 0),
            'data_evento' => optional($budget->data_evento)->toDateString(),
            'tipo_servico' => $budget->tipo_servico,
            'local_evento' => $budget->local_evento,
            'descricao' => $budget->descricao,
            'custo_total_materiais' => (float) ($cost->custo_total_materiais ?? 0),
            'custo_total_mao_de_obra' => (float) ($cost->custo_total_mao_de_obra ?? 0),
            'custos_diversos' => (float) ($cost->custos_diversos ?? 0),
            'custo_total_projeto' => (float) ($cost->custo_total_projeto ?? 0),
            'lucro_real_liquido' => (float) ($cost->lucro_real_liquido ?? 0),
            'margem_lucro_percentual' => (float) ($cost->margem_lucro_percentual ?? 0),
            'observacoes' => $cost->observacoes ?? null,
            'created_at' => optional($cost?->created_at)->toDateTimeString(),
            'updated_at' => optional($cost?->updated_at)->toDateTimeString(),
        ];
    }
}

