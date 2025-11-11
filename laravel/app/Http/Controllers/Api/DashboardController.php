<?php

namespace App\Http\Controllers\Api;

use App\Models\Budget;
use App\Services\DecoratorDashboardService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends BaseApiController
{
    public function summary(Request $request)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        $from = isset($validated['date_from'])
            ? Carbon::parse($validated['date_from'])->startOfDay()
            : Carbon::now()->startOfMonth();

        $to = isset($validated['date_to'])
            ? Carbon::parse($validated['date_to'])->endOfDay()
            : Carbon::now()->endOfMonth();

        if ($from->greaterThan($to)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        $service = new DecoratorDashboardService(Auth::user());

        return $this->success(
            $service->summary($from, $to),
            'Resumo do dashboard carregado com sucesso.'
        );
    }

    public function projects()
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $service = new DecoratorDashboardService(Auth::user());

        return $this->success(
            ['projects' => $service->projects()],
            'Projetos carregados com sucesso.'
        );
    }

    public function showProject(Budget $budget)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        if ($budget->decorador_id !== Auth::id()) {
            return $this->error('Projeto não encontrado.', 404);
        }

        $service = new DecoratorDashboardService(Auth::user());

        return $this->success(
            ['project' => $service->projectDetails($budget)],
            'Detalhes do projeto carregados com sucesso.'
        );
    }

    public function saveProjectCosts(Request $request, Budget $budget)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        if ($budget->decorador_id !== Auth::id()) {
            return $this->error('Projeto não encontrado.', 404);
        }

        $data = $request->validate([
            'custo_total_materiais' => ['required', 'numeric', 'min:0'],
            'custo_total_mao_de_obra' => ['required', 'numeric', 'min:0'],
            'custos_diversos' => ['required', 'numeric', 'min:0'],
            'observacoes' => ['nullable', 'string'],
        ]);

        $service = new DecoratorDashboardService(Auth::user());
        $project = $service->saveProjectCosts($budget, $data);

        return $this->success(
            ['project' => $project],
            'Custos do projeto salvos com sucesso.'
        );
    }

    private function ensureDecorator()
    {
        $user = Auth::user();
        if (!$user || ($user->perfil ?? null) !== 'decorator') {
            return $this->error('Acesso negado.', 403);
        }

        return null;
    }
}

