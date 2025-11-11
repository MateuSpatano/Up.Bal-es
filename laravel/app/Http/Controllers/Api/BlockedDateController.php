<?php

namespace App\Http\Controllers\Api;

use App\Models\DecoratorBlockedDate;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BlockedDateController extends BaseApiController
{
    public function index()
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $dates = DecoratorBlockedDate::where('user_id', Auth::id())
            ->orderBy('blocked_date')
            ->get()
            ->map(fn ($date) => $this->transformBlockedDate($date))
            ->flatMap(function ($date) {
                $collection = collect([$date]);

                if ($date['is_recurring']) {
                    $nextYearDate = Carbon::parse($date['blocked_date'])->addYear();

                    if ($nextYearDate->isFuture()) {
                        $collection->push([
                            'id' => $date['id'] . '_recurring',
                            'blocked_date' => $nextYearDate->toDateString(),
                            'reason' => $date['reason'] . ' (Recorrente)',
                            'is_recurring' => true,
                            'created_at' => $date['created_at'],
                            'updated_at' => $date['updated_at'],
                        ]);
                    }
                }

                return $collection;
            })
            ->values();

    return $this->success($dates->all());
    }

    public function store(Request $request)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $data = $request->validate([
            'blocked_date' => ['required', 'date'],
            'reason' => ['nullable', 'string', 'max:255'],
            'is_recurring' => ['nullable', 'boolean'],
        ]);

        $date = Carbon::parse($data['blocked_date'])->startOfDay();

        if ($date->isPast()) {
            return $this->error('Não é possível bloquear datas no passado.', 422);
        }

        $exists = DecoratorBlockedDate::where('user_id', Auth::id())
            ->whereDate('blocked_date', $date->toDateString())
            ->exists();

        if ($exists) {
            return $this->error('Esta data já está bloqueada.', 422);
        }

        $blockedDate = DecoratorBlockedDate::create([
            'user_id' => Auth::id(),
            'blocked_date' => $date->toDateString(),
            'reason' => $data['reason'] ?? 'Data bloqueada pelo decorador',
            'is_recurring' => (bool) ($data['is_recurring'] ?? false),
        ]);

        return $this->success(
            $this->transformBlockedDate($blockedDate),
            'Data bloqueada com sucesso.'
        );
    }

    public function destroy(DecoratorBlockedDate $blockedDate)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        if ($blockedDate->user_id !== Auth::id()) {
            return $this->error('Data bloqueada não encontrada.', 404);
        }

        $blockedDate->delete();

        return $this->success(null, 'Data desbloqueada com sucesso.');
    }

    public function check(Request $request)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $data = $request->validate([
            'date' => ['required', 'date'],
        ]);

        $date = Carbon::parse($data['date'])->toDateString();

        $blocked = DecoratorBlockedDate::where('user_id', Auth::id())
            ->where(function ($query) use ($date) {
                $query->whereDate('blocked_date', $date)
                    ->orWhere(function ($subQuery) use ($date) {
                        $subQuery->where('is_recurring', true)
                            ->whereRaw("DATE_FORMAT(blocked_date, '%m-%d') = DATE_FORMAT(?, '%m-%d')", [$date]);
                    });
            })
            ->exists();

        return $this->success(['blocked' => $blocked]);
    }

    private function transformBlockedDate(DecoratorBlockedDate $blockedDate): array
    {
        return [
            'id' => (string) $blockedDate->id,
            'blocked_date' => Carbon::parse($blockedDate->blocked_date)->toDateString(),
            'reason' => $blockedDate->reason,
            'is_recurring' => (bool) $blockedDate->is_recurring,
            'created_at' => optional($blockedDate->created_at)->toDateTimeString(),
            'updated_at' => optional($blockedDate->updated_at)->toDateTimeString(),
        ];
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

