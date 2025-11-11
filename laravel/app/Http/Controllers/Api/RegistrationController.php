<?php

namespace App\Http\Controllers\Api;

use App\Models\AccessLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RegistrationController extends BaseApiController
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'nome' => 'required|string|min:2|max:100',
            'email' => 'required|email:rfc,dns|max:100',
            'senha' => 'required|string|min:6',
            'telefone' => 'nullable|string|max:20',
            'endereco' => 'nullable|string|max:255',
            'cidade' => 'nullable|string|max:100',
            'estado' => 'nullable|string|size:2',
            'cep' => 'nullable|string|max:10',
        ]);

        if (!$this->canRegisterFromIp($request->ip())) {
            return $this->error('Muitas tentativas de cadastro. Tente novamente em 24 horas.', Response::HTTP_TOO_MANY_REQUESTS);
        }

        $emailExists = User::where('email', $data['email'])->exists();
        if ($emailExists) {
            return $this->error('Este email já está cadastrado no sistema.', Response::HTTP_BAD_REQUEST);
        }

        $slug = $this->generateUniqueSlug($data['nome']);

        $user = null;

        DB::transaction(function () use (&$user, $data, $slug, $request) {
            $user = User::create([
                'nome' => $data['nome'],
                'email' => $data['email'],
                'senha' => Hash::make($data['senha']),
                'telefone' => $data['telefone'] ?? null,
                'endereco' => $data['endereco'] ?? null,
                'cidade' => $data['cidade'] ?? null,
                'estado' => $data['estado'] ?? null,
                'cep' => $data['cep'] ?? null,
                'slug' => $slug,
                'perfil' => 'user',
                'ativo' => true,
                'aprovado_por_admin' => true,
            ]);

            AccessLog::create([
                'user_id' => $user->id,
                'action' => 'cadastro',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);
        });

        return $this->success([
            'user_id' => $user->id,
            'slug' => $user->slug,
        ], 'Conta criada com sucesso!');
    }

    public function checkEmail(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email:rfc,dns|max:100',
        ]);

        $exists = User::where('email', $data['email'])->exists();

        return $this->success([
            'disponivel' => !$exists,
        ], $exists ? 'Email já cadastrado' : 'Email disponível');
    }

    private function canRegisterFromIp(?string $ip): bool
    {
        if (empty($ip)) {
            return true;
        }

        return AccessLog::where('action', 'cadastro')
            ->where('ip_address', $ip)
            ->where('created_at', '>=', now()->subDay())
            ->count() < 5;
    }

    private function generateUniqueSlug(string $nome): string
    {
        $baseSlug = Str::slug($nome);
        $slug = $baseSlug;
        $counter = 1;

        while (empty($slug) || User::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}

