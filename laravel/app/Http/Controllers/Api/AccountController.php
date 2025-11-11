<?php

namespace App\Http\Controllers\Api;

use App\Services\AccountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AccountController extends BaseApiController
{
    public function show()
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $service = new AccountService(Auth::user());

        return $this->success($service->getProfile());
    }

    public function update(Request $request)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        if ($request->has('confirm_password') && !$request->has('new_password_confirmation')) {
            $request->merge(['new_password_confirmation' => $request->input('confirm_password')]);
        }

        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => [
                'required',
                'string',
                'email',
                'max:150',
                Rule::unique('usuarios', 'email')->ignore($user->id),
            ],
            'phone' => ['nullable', 'regex:/^\(\d{2}\)\s?\d{4,5}-\d{4}$/'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'size:2'],
            'zipcode' => ['nullable', 'regex:/^\d{5}-?\d{3}$/'],
            'current_password' => ['required_with:new_password'],
            'new_password' => [
                'nullable',
                'string',
                'min:8',
                'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/',
                'confirmed',
            ],
        ], [
            'phone.regex' => 'Formato de telefone inválido.',
            'zipcode.regex' => 'Formato de CEP inválido.',
            'new_password.regex' => 'Nova senha deve conter pelo menos uma letra e um número.',
            'new_password.confirmed' => 'Confirmação de senha não confere.',
            'current_password.required_with' => 'Senha atual é obrigatória para alterar a senha.',
        ]);

        if (!empty($validated['new_password']) && !Hash::check($validated['current_password'], $user->senha)) {
            return $this->error('Senha atual incorreta.', 422);
        }

        $service = new AccountService($user);

        try {
            $data = $service->update($validated);
        } catch (\Throwable $exception) {
            report($exception);
            return $this->error('Não foi possível atualizar a conta.', 500);
        }

        return $this->success([
            'data' => $data,
        ], 'Dados atualizados com sucesso!');
    }

    public function updatePhoto(Request $request)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $request->validate([
            'profile_photo' => ['required', 'file', 'image', 'max:5120'],
        ]);

        $service = new AccountService(Auth::user());

        try {
            $data = $service->updatePhoto($request->file('profile_photo'));
        } catch (\Throwable $exception) {
            report($exception);
            return $this->error($exception->getMessage(), 422);
        }

        return $this->success($data, 'Foto de perfil atualizada com sucesso!');
    }

    public function changePassword(Request $request)
    {
        if ($response = $this->ensureDecorator()) {
            return $response;
        }

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => [
                'required',
                'string',
                'min:8',
                'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/',
            ],
            'confirm_password' => ['required', 'same:new_password'],
        ], [
            'new_password.regex' => 'A nova senha deve conter pelo menos uma letra e um número.',
            'confirm_password.same' => 'As senhas não coincidem.',
        ]);

        if (!Hash::check($validated['current_password'], Auth::user()->senha)) {
            return $this->error('Senha atual incorreta.', 422);
        }

        $service = new AccountService(Auth::user());
        $service->changePassword(
            $validated['current_password'],
            $validated['new_password'],
            $validated['confirm_password']
        );

        return $this->success(null, 'Senha alterada com sucesso!');
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

