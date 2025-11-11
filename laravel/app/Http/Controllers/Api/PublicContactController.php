<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;

class PublicContactController extends BaseApiController
{
    public function show(Request $request)
    {
        $validated = $request->validate([
            'decorator_id' => ['nullable', 'integer', 'exists:usuarios,id'],
            'slug' => ['nullable', 'string'],
        ]);

        $query = User::query()
            ->where('is_active', true)
            ->select([
                'id',
                'nome',
                'email',
                'email_comunicacao',
                'telefone',
                'whatsapp',
                'instagram',
            ]);

        if (!empty($validated['slug'])) {
            $query->where('slug', $validated['slug']);
        } elseif (!empty($validated['decorator_id'])) {
            $query->where('id', $validated['decorator_id']);
        } else {
            $query->where(function ($subQuery) {
                $subQuery->where('is_admin', true)
                    ->orWhere('perfil', 'decorator');
            })
                ->orderByDesc('is_admin')
                ->orderBy('created_at');
        }

        $user = $query->first();

        if (!$user) {
            return $this->success([
                'email' => '',
                'email_link' => '',
                'whatsapp' => '',
                'whatsapp_link' => '',
                'instagram' => '',
                'instagram_link' => '',
            ], 'Nenhum contato disponível.');
        }

        $email = $user->email_comunicacao ?: $user->email ?: '';
        $whatsapp = $user->whatsapp ?: $user->telefone ?: '';
        $instagram = $user->instagram ?: '';

        return $this->success([
            'email' => $email,
            'email_link' => $email ? 'mailto:' . $email : '',
            'whatsapp' => $whatsapp,
            'whatsapp_link' => $this->buildWhatsappLink($whatsapp),
            'instagram' => $instagram,
            'instagram_link' => $this->buildInstagramLink($instagram),
        ], 'Informações de contato carregadas com sucesso.');
    }

    private function buildWhatsappLink(?string $phone): string
    {
        if (!$phone) {
            return '';
        }

        $numbers = preg_replace('/\D+/', '', $phone);

        return $numbers !== '' ? 'https://wa.me/' . $numbers : '';
    }

    private function buildInstagramLink(?string $handle): string
    {
        if (!$handle) {
            return '';
        }

        $trimmed = ltrim($handle, '@');

        if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            return $trimmed;
        }

        return 'https://instagram.com/' . $trimmed;
    }
}

