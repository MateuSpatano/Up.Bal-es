<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\BudgetLog;
use App\Models\DecoratorAvailability;
use App\Models\DecoratorBlockedDate;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class BudgetService
{
    private const ARC_SERVICE_TYPES = ['arco-tradicional', 'arco-desconstruido'];
    private const VALID_STATUS = ['pendente', 'aprovado', 'recusado', 'cancelado', 'enviado'];

    public function __construct(private readonly User $decorator)
    {
    }

    /**
     * List budgets for the current decorator.
     *
     * @param  array<string, mixed>  $filters
     * @return array<int, array<string, mixed>>
     */
    public function list(array $filters = []): array
    {
        $query = Budget::where('decorador_id', $this->decorator->id);

        if (!empty($filters['status']) && in_array($filters['status'], self::VALID_STATUS, true)) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['client'])) {
            $query->where('cliente', 'like', '%' . $filters['client'] . '%');
        }

        if (!empty($filters['period'])) {
            $this->applyPeriodFilter($query, $filters['period']);
        }

        return $query->orderByDesc('created_at')
            ->get()
            ->map(fn (Budget $budget) => $this->transform($budget))
            ->all();
    }

    /**
     * Create a new budget.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?UploadedFile $image = null, string $createdVia = 'decorator'): array
    {
        $validation = $this->validateArcSize($data['service_type'], $data['tamanho_arco_m'] ?? null);
        if (!$validation['success']) {
            return $validation;
        }

        $eventTime = $this->normalizeTime($data['event_time']);

        $availabilityCheck = $this->validateAvailability(
            $data['event_date'],
            $eventTime,
            $data['service_type']
        );
        if (!$availabilityCheck['success']) {
            return $availabilityCheck;
        }

        $imagePath = null;
        if ($image) {
            $upload = $this->storeImage($image);
            if (!$upload['success']) {
                return $upload;
            }
            $imagePath = $upload['path'];
        }

        $budget = new Budget();
        $budget->cliente = $data['client'];
        $budget->email = $data['email'];
        $budget->telefone = $data['phone'] ?? null;
        $budget->data_evento = $data['event_date'];
        $budget->hora_evento = $eventTime;
        $budget->local_evento = $data['event_location'];
        $budget->tipo_servico = $data['service_type'];
        $budget->descricao = $data['description'] ?? null;
        $budget->valor_estimado = $data['estimated_value'] ?? 0;
        $budget->observacoes = $data['notes'] ?? null;
        $budget->status = 'pendente';
        $budget->decorador_id = $this->decorator->id;
        $budget->created_via = $createdVia;
        $budget->imagem = $imagePath;
        $budget->tamanho_arco_m = $data['tamanho_arco_m'] ?? null;
        $budget->save();

        $this->logAction($budget, 'create_budget');

        return [
            'success' => true,
            'message' => 'Orçamento criado com sucesso!',
            'budget' => $this->transform($budget),
        ];
    }

    /**
     * Update an existing budget.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Budget $budget, array $data): array
    {
        if ($budget->decorador_id !== $this->decorator->id) {
            return [
                'success' => false,
                'message' => 'Orçamento não encontrado.',
            ];
        }

        if (isset($data['service_type']) || isset($data['tamanho_arco_m'])) {
            $serviceType = $data['service_type'] ?? $budget->tipo_servico;
            $arcSize = $data['tamanho_arco_m'] ?? $budget->tamanho_arco_m;
            $validation = $this->validateArcSize($serviceType, $arcSize);
            if (!$validation['success']) {
                return $validation;
            }
        }

        if (isset($data['event_date']) || isset($data['event_time'])) {
            $eventDate = $data['event_date'] ?? $budget->data_evento->toDateString();
            $eventTime = isset($data['event_time'])
                ? $this->normalizeTime($data['event_time'])
                : $budget->hora_evento;
            $serviceType = $data['service_type'] ?? $budget->tipo_servico;

            $availabilityCheck = $this->validateAvailability(
                $eventDate,
                $eventTime,
                $serviceType,
                $budget->id
            );
            if (!$availabilityCheck['success']) {
                return $availabilityCheck;
            }
        }

        $budget->cliente = $data['client'] ?? $budget->cliente;
        $budget->email = $data['email'] ?? $budget->email;
        $budget->telefone = $data['phone'] ?? $budget->telefone;
        $budget->data_evento = $data['event_date'] ?? $budget->data_evento;
        $budget->hora_evento = isset($data['event_time'])
            ? $this->normalizeTime($data['event_time'])
            : $budget->hora_evento;
        $budget->local_evento = $data['event_location'] ?? $budget->local_evento;
        $budget->tipo_servico = $data['service_type'] ?? $budget->tipo_servico;
        $budget->descricao = $data['description'] ?? $budget->descricao;
        $budget->valor_estimado = $data['estimated_value'] ?? $budget->valor_estimado;
        $budget->observacoes = $data['notes'] ?? $budget->observacoes;
        $budget->tamanho_arco_m = $data['tamanho_arco_m'] ?? $budget->tamanho_arco_m;
        $budget->save();

        $this->logAction($budget, 'update_budget');

        return [
            'success' => true,
            'message' => 'Orçamento atualizado com sucesso!',
            'budget' => $this->transform($budget),
        ];
    }

    public function changeStatus(Budget $budget, string $status): array
    {
        if ($budget->decorador_id !== $this->decorator->id) {
            return [
                'success' => false,
                'message' => 'Orçamento não encontrado.',
            ];
        }

        if (!in_array($status, self::VALID_STATUS, true)) {
            return [
                'success' => false,
                'message' => 'Status inválido.',
            ];
        }

        $budget->status = $status;
        $budget->save();

        $this->logAction($budget, 'change_status_' . $status);

        return [
            'success' => true,
            'message' => 'Status atualizado com sucesso!',
            'budget' => $this->transform($budget),
        ];
    }

    public function sendEmail(Budget $budget, ?string $customMessage, string $budgetUrl): array
    {
        if ($budget->decorador_id !== $this->decorator->id) {
            return [
                'success' => false,
                'message' => 'Orçamento não encontrado.',
            ];
        }

        $data = $this->transform($budget);

        try {
            Mail::send('emails.budget', [
                'budget' => $data,
                'budgetUrl' => $budgetUrl,
                'customMessage' => $customMessage,
                'serviceTypeLabel' => $this->getServiceTypeLabel($budget->tipo_servico),
            ], function ($message) use ($budget) {
                $message->to($budget->email, $budget->cliente)
                    ->subject('Seu Orçamento de Decoração com Balões - Up.Baloes');

                if ($replyTo = $this->decorator->email_comunicacao ?? $this->decorator->email) {
                    $message->replyTo($replyTo, $this->decorator->nome ?? 'Up.Baloes');
                }
            });
        } catch (\Throwable $exception) {
            report($exception);

            return [
                'success' => false,
                'message' => 'Falha ao enviar e-mail. Tente novamente mais tarde.',
            ];
        }

        $this->logAction($budget, 'send_email');

        return [
            'success' => true,
            'message' => 'E-mail enviado com sucesso!',
        ];
    }

    /**
     * @return array{success: bool, budgets?: array<int, array<string, mixed>>, count?: int, message?: string}
     */
    public function recent(int $limit = 10): array
    {
        $budgets = Budget::where('decorador_id', $this->decorator->id)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function (Budget $budget) {
                $data = $this->transform($budget);
                $data['formatted_date'] = Carbon::parse($budget->created_at)->format('d/m/Y H:i');
                $data['time_ago'] = $this->getTimeAgo($budget->created_at);
                return $data;
            })
            ->all();

        return [
            'success' => true,
            'budgets' => $budgets,
            'count' => count($budgets),
        ];
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<Budget>  $query
     */
    private function applyPeriodFilter($query, string $period): void
    {
        $now = Carbon::now();
        switch ($period) {
            case 'hoje':
                $query->whereDate('data_evento', $now->toDateString());
                break;
            case 'semana':
                $query->whereBetween('data_evento', [$now->clone()->subDays(7)->toDateString(), $now->toDateString()]);
                break;
            case 'mes':
                $query->whereMonth('data_evento', $now->month)
                    ->whereYear('data_evento', $now->year);
                break;
        }
    }

    private function validateArcSize(string $serviceType, $arcSize): array
    {
        if (in_array($serviceType, self::ARC_SERVICE_TYPES, true)) {
            if ($arcSize === null || $arcSize === '' || !is_numeric($arcSize)) {
                return [
                    'success' => false,
                    'message' => 'Tamanho do arco é obrigatório para este tipo de serviço',
                ];
            }

            $arcSize = (float) $arcSize;
            if ($arcSize < 0.5 || $arcSize > 30) {
                return [
                    'success' => false,
                    'message' => 'Tamanho do arco deve estar entre 0.5 e 30 metros',
                ];
            }

            if (floor($arcSize * 10) != $arcSize * 10) {
                return [
                    'success' => false,
                    'message' => 'Tamanho do arco deve ter no máximo 1 casa decimal',
                ];
            }
        } else {
            if (!empty($arcSize)) {
                return [
                    'success' => false,
                    'message' => 'Tamanho do arco não é necessário para este tipo de serviço',
                ];
            }
        }

        return ['success' => true];
    }

    public function validateAvailability(string $eventDate, string $eventTime, string $serviceType, ?int $ignoreBudgetId = null): array
    {
        $eventTime = $this->normalizeTime($eventTime);

        $availability = DecoratorAvailability::where('user_id', $this->decorator->id)
            ->latest('updated_at')
            ->first();

        if (!$availability) {
            return ['success' => true];
        }

        $date = Carbon::parse($eventDate);
        if ($this->isDateBlocked($date)) {
            return [
                'success' => false,
                'message' => 'Esta data está bloqueada para atendimento',
            ];
        }

        $dayKey = strtolower($date->englishDayOfWeek);

        $availableDays = collect($availability->available_days ?? []);
        if ($availableDays->isNotEmpty() && !$availableDays->contains($dayKey)) {
            return [
                'success' => false,
                'message' => 'Não há atendimento neste dia da semana',
            ];
        }

        $timeSchedules = collect($availability->time_schedules ?? []);
        if ($timeSchedules->isNotEmpty()) {
            $isWithinSchedule = $timeSchedules->contains(function ($schedule) use ($eventTime, $dayKey) {
                if (($schedule['day'] ?? '') !== $dayKey) {
                    return false;
                }

                return $eventTime >= ($schedule['start_time'] ?? '00:00')
                    && $eventTime <= ($schedule['end_time'] ?? '23:59');
            });

            if (!$isWithinSchedule) {
                return [
                    'success' => false,
                    'message' => 'Horário fora do período de atendimento',
                ];
            }
        }

        $maxDailyServices = $availability->max_daily_services ?? 3;
        if ($maxDailyServices > 0) {
            $dailyCount = Budget::where('decorador_id', $this->decorator->id)
                ->whereDate('data_evento', $date->toDateString())
                ->whereIn('status', ['aprovado', 'pendente'])
                ->when($ignoreBudgetId, fn ($query) => $query->where('id', '!=', $ignoreBudgetId))
                ->count();

            if ($dailyCount >= $maxDailyServices) {
                return [
                    'success' => false,
                    'message' => "Limite de {$maxDailyServices} serviços por dia atingido",
                ];
            }
        }

        $serviceIntervals = collect($availability->service_intervals ?? []);
        $dayInterval = $serviceIntervals->first(function ($interval) use ($dayKey) {
            return ($interval['day'] ?? null) === $dayKey;
        });

        if ($dayInterval && (($dayInterval['interval'] ?? 0) > 0)) {
            $intervalValue = (int) $dayInterval['interval'];
            $unit = ($dayInterval['unit'] ?? 'minutes') === 'hours' ? 'hours' : 'minutes';
            $intervalMinutes = $unit === 'hours' ? $intervalValue * 60 : $intervalValue;
            $eventDateTime = Carbon::parse("{$eventDate} {$eventTime}");

            $existingTimes = Budget::where('decorador_id', $this->decorator->id)
                ->whereDate('data_evento', $date->toDateString())
                ->whereIn('status', ['aprovado', 'pendente'])
                ->when($ignoreBudgetId, fn ($query) => $query->where('id', '!=', $ignoreBudgetId))
                ->orderBy('hora_evento')
                ->pluck('hora_evento');

            foreach ($existingTimes as $existingTime) {
                $existingDateTime = Carbon::parse("{$eventDate} {$existingTime}");
                $diffMinutes = abs($existingDateTime->diffInMinutes($eventDateTime));

                if ($diffMinutes < $intervalMinutes) {
                    $unitLabel = $unit === 'hours' ? 'hora(s)' : 'minuto(s)';
                    return [
                        'success' => false,
                        'message' => "Intervalo mínimo de {$intervalValue} {$unitLabel} entre serviços não respeitado",
                    ];
                }
            }
        }

        return ['success' => true];
    }

    private function isDateBlocked(Carbon $date): bool
    {
        return DecoratorBlockedDate::where('user_id', $this->decorator->id)
            ->where(function ($query) use ($date) {
                $query->whereDate('blocked_date', $date->toDateString())
                    ->orWhere(function ($subQuery) use ($date) {
                        $subQuery->where('is_recurring', true)
                            ->whereRaw("DATE_FORMAT(blocked_date, '%m-%d') = ?", [$date->format('m-d')]);
                    });
            })
            ->exists();
    }

    /**
     * Store inspiration image.
     *
     * @return array{success: bool, path?: string, message?: string}
     */
    private function storeImage(UploadedFile $file): array
    {
        if (!$file->isValid()) {
            return [
                'success' => false,
                'message' => 'Arquivo inválido.',
            ];
        }

        $allowedMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedMime, true)) {
            return [
                'success' => false,
                'message' => 'Tipo de arquivo não permitido. Use apenas JPG, PNG, GIF ou WebP',
            ];
        }

        if ($file->getSize() > 5 * 1024 * 1024) {
            return [
                'success' => false,
                'message' => 'Arquivo muito grande. Tamanho máximo: 5MB',
            ];
        }

        $directory = public_path('uploads/inspiration_images');
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $fileName = uniqid('inspiration_', true) . '.' . $file->getClientOriginalExtension();
        $file->move($directory, $fileName);

        return [
            'success' => true,
            'path' => 'uploads/inspiration_images/' . $fileName,
        ];
    }

    private function transform(Budget $budget): array
    {
        return [
            'id' => $budget->id,
            'client' => $budget->cliente,
            'email' => $budget->email,
            'phone' => $budget->telefone,
            'event_date' => optional($budget->data_evento)->toDateString(),
            'event_time' => $budget->hora_evento,
            'event_location' => $budget->local_evento,
            'service_type' => $budget->tipo_servico,
            'description' => $budget->descricao,
            'estimated_value' => (float) $budget->valor_estimado,
            'notes' => $budget->observacoes,
            'status' => $budget->status,
            'image' => $budget->imagem,
            'tamanho_arco_m' => $budget->tamanho_arco_m !== null ? (float) $budget->tamanho_arco_m : null,
            'created_at' => optional($budget->created_at)->toDateTimeString(),
            'updated_at' => optional($budget->updated_at)->toDateTimeString(),
        ];
    }

    private function logAction(Budget $budget, string $action): void
    {
        BudgetLog::create([
            'budget_id' => $budget->id,
            'action' => $action,
            'user_id' => $this->decorator->id,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'created_at' => now(),
        ]);
    }

    private function getTimeAgo($dateTime): string
    {
        $time = Carbon::parse($dateTime);
        $diffInSeconds = now()->diffInSeconds($time);

        return match (true) {
            $diffInSeconds < 60 => 'agora mesmo',
            $diffInSeconds < 3600 => floor($diffInSeconds / 60) . ' min atrás',
            $diffInSeconds < 86400 => floor($diffInSeconds / 3600) . ' h atrás',
            $diffInSeconds < 2592000 => floor($diffInSeconds / 86400) . ' dias atrás',
            $diffInSeconds < 31536000 => floor($diffInSeconds / 2592000) . ' meses atrás',
            default => floor($diffInSeconds / 31536000) . ' anos atrás',
        };
    }

    private function getServiceTypeLabel(string $serviceType): string
    {
        return [
            'arco-tradicional' => 'Arco Tradicional',
            'arco-desconstruido' => 'Arco Desconstruído',
            'escultura-balao' => 'Escultura de Balão',
            'centro-mesa' => 'Centro de Mesa',
            'baloes-piscina' => 'Balões na Piscina',
        ][$serviceType] ?? Str::title(str_replace('-', ' ', $serviceType));
    }

    private function normalizeTime(string $time): string
    {
        return strlen($time) === 5 ? $time . ':00' : $time;
    }
}

