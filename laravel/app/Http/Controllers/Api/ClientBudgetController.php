<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Services\BudgetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ClientBudgetController extends BaseApiController
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_name' => ['required', 'string', 'max:100'],
            'client_email' => ['required', 'string', 'email', 'max:150'],
            'client_phone' => ['nullable', 'regex:/^\(\d{2}\)\s?\d{4,5}-\d{4}$/'],
            'event_date' => ['required', 'date', 'after_or_equal:today'],
            'event_time' => ['nullable', 'date_format:H:i'],
            'event_location' => ['required', 'string', 'max:255'],
            'service_type' => ['required', Rule::in(['arco-tradicional', 'arco-desconstruido', 'escultura-balao', 'centro-mesa', 'baloes-piscina'])],
            'description' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'tamanho_arco_m' => ['required', 'numeric', 'between:0.5,30'],
            'decorator_id' => ['nullable', 'integer', 'exists:usuarios,id'],
            'inspiration_image' => ['nullable', 'file', 'image', 'max:5120'],
        ], [
            'client_phone.regex' => 'Telefone inválido. Use o formato (XX) XXXXX-XXXX.',
            'event_date.after_or_equal' => 'A data do evento deve ser hoje ou no futuro.',
            'tamanho_arco_m.between' => 'Tamanho do arco deve estar entre 0.5 e 30 metros.',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        $data = $validator->validated();

        $decoratorId = $data['decorator_id'] ?? Config::get('upbaloes.defaults.decorator_id', 1);
        $decorator = User::where('id', $decoratorId)
            ->where('perfil', 'decorator')
            ->first();

        if (!$decorator) {
            return $this->error('Não foi possível identificar o decorador responsável por esta solicitação.', 422);
        }

        $payload = [
            'client' => $data['client_name'],
            'email' => $data['client_email'],
            'phone' => $data['client_phone'] ?? null,
            'event_date' => $data['event_date'],
            'event_time' => $data['event_time'] ?? '10:00',
            'event_location' => $data['event_location'],
            'service_type' => $data['service_type'],
            'description' => $data['description'] ?? null,
            'estimated_value' => $request->input('estimated_value', 0),
            'notes' => $data['notes'] ?? null,
            'tamanho_arco_m' => $data['tamanho_arco_m'],
        ];

        $service = new BudgetService($decorator);
        $result = $service->create(
            $payload,
            $request->file('inspiration_image'),
            'client'
        );

        if (!$result['success']) {
            return $this->error($result['message'] ?? 'Não foi possível registrar sua solicitação.', 422);
        }

        return $this->success(
            [
                'budget' => $result['budget'] ?? null,
            ],
            'Solicitação enviada com sucesso! Um decorador entrará em contato em breve.'
        );
    }
}

