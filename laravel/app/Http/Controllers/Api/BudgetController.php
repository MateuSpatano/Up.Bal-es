<?php

namespace App\Http\Controllers\Api;

use App\Models\Budget;
use App\Services\BudgetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class BudgetController extends BaseApiController
{
    public function list(Request $request)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $filters = $request->validate([
            'status' => [
                'nullable',
                Rule::in(['pendente', 'aprovado', 'recusado', 'cancelado', 'enviado']),
            ],
            'client' => 'nullable|string|max:100',
            'period' => [
                'nullable',
                Rule::in(['hoje', 'semana', 'mes']),
            ],
        ]);

        $service = $this->service();
        $budgets = $service->list($filters);

        return $this->success([
            'budgets' => $budgets,
        ]);
    }

    public function store(Request $request)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $data = $request->validate([
            'client' => 'required|string|max:100',
            'email' => 'required|email:rfc,dns|max:100',
            'phone' => 'nullable|string|max:20',
            'event_date' => 'required|date',
            'event_time' => 'required|date_format:H:i',
            'event_location' => 'required|string|max:255',
            'service_type' => [
                'required',
                Rule::in(['arco-tradicional', 'arco-desconstruido', 'escultura-balao', 'centro-mesa', 'baloes-piscina']),
            ],
            'description' => 'nullable|string',
            'estimated_value' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'tamanho_arco_m' => 'nullable|numeric|min:0.5|max:30',
            'created_via' => [
                'nullable',
                Rule::in(['decorator', 'client']),
            ],
            'inspiration_image' => 'nullable|image|max:5120',
        ]);

        $service = $this->service();
        $result = $service->create(
            $data,
            $request->file('inspiration_image'),
            $data['created_via'] ?? 'decorator'
        );

        if (!$result['success']) {
            return $this->error($result['message'] ?? 'Erro ao criar orçamento.');
        }

        return $this->success($result['budget'] ?? null, $result['message'] ?? 'Orçamento criado com sucesso!');
    }

    public function update(Request $request, Budget $budget)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $data = $request->validate([
            'client' => 'nullable|string|max:100',
            'email' => 'nullable|email:rfc,dns|max:100',
            'phone' => 'nullable|string|max:20',
            'event_date' => 'nullable|date',
            'event_time' => 'nullable|date_format:H:i',
            'event_location' => 'nullable|string|max:255',
            'service_type' => [
                'nullable',
                Rule::in(['arco-tradicional', 'arco-desconstruido', 'escultura-balao', 'centro-mesa', 'baloes-piscina']),
            ],
            'description' => 'nullable|string',
            'estimated_value' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'tamanho_arco_m' => 'nullable|numeric|min:0.5|max:30',
        ]);

        $service = $this->service();
        $result = $service->update($budget, $data);

        if (!$result['success']) {
            return $this->error($result['message'] ?? 'Erro ao atualizar orçamento.');
        }

        return $this->success($result['budget'] ?? null, $result['message'] ?? 'Orçamento atualizado com sucesso!');
    }

    public function changeStatus(Request $request, Budget $budget)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $data = $request->validate([
            'status' => [
                'required',
                Rule::in(['pendente', 'aprovado', 'recusado', 'cancelado', 'enviado']),
            ],
        ]);

        $service = $this->service();
        $result = $service->changeStatus($budget, $data['status']);

        if (!$result['success']) {
            return $this->error($result['message'] ?? 'Erro ao alterar status.');
        }

        return $this->success($result['budget'] ?? null, $result['message'] ?? 'Status atualizado com sucesso!');
    }

    public function sendEmail(Request $request, Budget $budget)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $data = $request->validate([
            'custom_message' => 'nullable|string',
        ]);

        $budgetUrl = url('/painel-decorador') . '?view=budget&id=' . $budget->id;

        $service = $this->service();
        $result = $service->sendEmail($budget, $data['custom_message'] ?? null, $budgetUrl);

        if (!$result['success']) {
            return $this->error($result['message'] ?? 'Erro ao enviar e-mail.');
        }

        return $this->success(null, $result['message'] ?? 'E-mail enviado com sucesso!');
    }

    public function recent()
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $service = $this->service();
        $result = $service->recent();

        if (!$result['success']) {
            return $this->error($result['message'] ?? 'Erro ao carregar notificações.');
        }

        return $this->success([
            'budgets' => $result['budgets'] ?? [],
            'count' => $result['count'] ?? 0,
        ]);
    }

    private function ensureDecorator()
    {
        $user = Auth::user();
        if (!$user || ($user->perfil ?? null) !== 'decorator') {
            return $this->error('Acesso negado.', 403);
        }

        return null;
    }

    private function service(): BudgetService
    {
        return new BudgetService(Auth::user());
    }
}

