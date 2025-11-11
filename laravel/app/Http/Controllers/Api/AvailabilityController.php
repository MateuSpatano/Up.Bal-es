<?php

namespace App\Http\Controllers\Api;

use App\Models\DecoratorAvailability;
use App\Services\BudgetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AvailabilityController extends BaseApiController
{
    public function show()
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $availability = DecoratorAvailability::where('user_id', Auth::id())
            ->latest('updated_at')
            ->first();

        $data = $availability
            ? $this->formatAvailability($availability->toArray())
            : $this->defaultAvailability();

        return $this->success($data);
    }

    public function store(Request $request)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $validator = Validator::make($request->all(), [
            'available_days' => ['required', 'array', 'min:1'],
            'available_days.*' => ['string', Rule::in($this->allowedDays())],
            'time_schedules' => ['required', 'array', 'min:1'],
            'time_schedules.*.day' => ['required', 'string', Rule::in($this->allowedDays())],
            'time_schedules.*.start_time' => ['required', 'date_format:H:i'],
            'time_schedules.*.end_time' => ['required', 'date_format:H:i'],
            'service_intervals' => ['required', 'array', 'min:1'],
            'service_intervals.*.day' => ['required', 'string', Rule::in($this->allowedDays())],
            'service_intervals.*.interval' => ['required', 'integer', 'min:0', 'max:1440'],
            'service_intervals.*.unit' => ['required', Rule::in(['minutes', 'hours'])],
            'max_daily_services' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $validator->after(function ($validator) use ($request) {
            $schedules = $request->input('time_schedules', []);
            foreach ($schedules as $index => $schedule) {
                $start = $schedule['start_time'] ?? null;
                $end = $schedule['end_time'] ?? null;
                if ($start && $end && $start >= $end) {
                    $validator->errors()->add(
                        "time_schedules.{$index}.start_time",
                        'Horário de início deve ser anterior ao horário de término.'
                    );
                }
            }
        });

        $data = $validator->validate();

        $availability = DecoratorAvailability::updateOrCreate(
            ['user_id' => Auth::id()],
            [
                'available_days' => array_values(array_unique($data['available_days'])),
                'time_schedules' => $data['time_schedules'],
                'service_intervals' => $data['service_intervals'],
                'max_daily_services' => $data['max_daily_services'],
            ]
        );

        return $this->success(
            $this->formatAvailability($availability->toArray()),
            'Configurações de disponibilidade salvas com sucesso.'
        );
    }

    public function validateSlot(Request $request)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $data = $request->validate([
            'event_date' => ['required', 'date'],
            'event_time' => ['required', 'date_format:H:i'],
            'service_type' => [
                'nullable',
                Rule::in(['arco-tradicional', 'arco-desconstruido', 'escultura-balao', 'centro-mesa', 'baloes-piscina']),
            ],
        ]);

        $service = new BudgetService(Auth::user());
        $result = $service->validateAvailability(
            $data['event_date'],
            $data['event_time'],
            $data['service_type'] ?? 'arco-tradicional'
        );

        if (!$result['success']) {
            return $this->error($result['message'] ?? 'Horário indisponível.', 422);
        }

        return $this->success([
            'available' => true,
        ], $result['message'] ?? 'Horário disponível para agendamento.');
    }

    private function ensureDecorator()
    {
        $user = Auth::user();
        if (!$user || ($user->perfil ?? null) !== 'decorator') {
            return $this->error('Acesso negado.', 403);
        }

        return null;
    }

    private function allowedDays(): array
    {
        return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    }

    private function defaultAvailability(): array
    {
        return [
            'available_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            'time_schedules' => [
                ['day' => 'monday', 'start_time' => '08:00', 'end_time' => '18:00'],
                ['day' => 'tuesday', 'start_time' => '08:00', 'end_time' => '18:00'],
                ['day' => 'wednesday', 'start_time' => '08:00', 'end_time' => '18:00'],
                ['day' => 'thursday', 'start_time' => '08:00', 'end_time' => '18:00'],
                ['day' => 'friday', 'start_time' => '08:00', 'end_time' => '18:00'],
            ],
            'service_intervals' => [
                ['day' => 'monday', 'interval' => 1, 'unit' => 'hours'],
                ['day' => 'tuesday', 'interval' => 1, 'unit' => 'hours'],
                ['day' => 'wednesday', 'interval' => 1, 'unit' => 'hours'],
                ['day' => 'thursday', 'interval' => 1, 'unit' => 'hours'],
                ['day' => 'friday', 'interval' => 1, 'unit' => 'hours'],
            ],
            'max_daily_services' => 3,
        ];
    }

    /**
     * @param  array<string, mixed>  $availability
     * @return array<string, mixed>
     */
    private function formatAvailability(array $availability): array
    {
        return [
            'available_days' => $availability['available_days'] ?? [],
            'time_schedules' => $availability['time_schedules'] ?? [],
            'service_intervals' => $availability['service_intervals'] ?? [],
            'max_daily_services' => (int) ($availability['max_daily_services'] ?? 3),
        ];
    }
}

