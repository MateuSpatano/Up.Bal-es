<?php

namespace App\Services;

use App\Models\AccessLog;
use App\Models\Budget;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

class AccountService
{
    public function __construct(private readonly User $user)
    {
    }

    /**
     * @return array<string, mixed>
     */
    public function getProfile(): array
    {
        $user = $this->user->refresh();

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->nome,
                'email' => $user->email,
                'phone' => $user->telefone,
                'address' => $user->endereco,
                'city' => $user->cidade,
                'state' => $user->estado,
                'zipcode' => $user->cep,
                'slug' => $user->slug,
                'bio' => $user->bio,
                'especialidades' => $user->especialidades ?? [],
                'redes_sociais' => $user->redes_sociais ?? [],
                'photo' => $user->foto_perfil ? asset($user->foto_perfil) : null,
                'photo_path' => $user->foto_perfil,
                'is_active' => (bool) $user->is_active,
                'created_at' => optional($user->created_at)->toDateString(),
            ],
            'stats' => [
                'total_orcamentos' => Budget::where('decorador_id', $user->id)->count(),
                'member_since' => optional($user->created_at)->format('M Y'),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function update(array $data): array
    {
        $user = $this->user->refresh();

        $user->nome = $data['name'];
        $user->email = $data['email'];
        $user->telefone = $data['phone'] ?? null;
        $user->endereco = $data['address'] ?? null;
        $user->cidade = $data['city'] ?? null;
        $user->estado = $data['state'] ?? null;
        $user->cep = $data['zipcode'] ?? null;

        if (!empty($data['new_password'])) {
            $user->senha = Hash::make($data['new_password']);
        }

        $user->save();

        AccessLog::create([
            'user_id' => $user->id,
            'action' => 'account_updated',
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);

        return [
            'name' => $user->nome,
            'email' => $user->email,
            'phone' => $user->telefone,
            'address' => $user->endereco,
            'city' => $user->cidade,
            'state' => $user->estado,
            'zipcode' => $user->cep,
        ];
    }

    /**
     * @return array<string, string|null>
     */
    public function updatePhoto(UploadedFile $file): array
    {
        if (!$file->isValid()) {
            throw new \RuntimeException('Arquivo inválido.');
        }

        if ($file->getSize() > 5 * 1024 * 1024) {
            throw new \RuntimeException('Arquivo muito grande. Tamanho máximo: 5MB');
        }

        $allowedMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
        if (!in_array($file->getMimeType(), $allowedMime, true)) {
            throw new \RuntimeException('Tipo de arquivo não permitido. Use apenas JPG, PNG, GIF ou WebP');
        }

        $directory = public_path('uploads/profile_photos');
        if (!is_dir($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $fileName = 'profile_' . $this->user->id . '_' . uniqid('', true) . '.' . $file->getClientOriginalExtension();
        $file->move($directory, $fileName);

        if ($this->user->foto_perfil) {
            $this->deletePhoto($this->user->foto_perfil);
        }

        $relativePath = 'uploads/profile_photos/' . $fileName;
        $this->user->foto_perfil = $relativePath;
        $this->user->save();

        return [
            'photo' => asset($relativePath),
            'photo_path' => $relativePath,
        ];
    }

    public function changePassword(string $current, string $new, string $confirm): void
    {
        if ($new !== $confirm) {
            throw new \RuntimeException('As senhas não coincidem.');
        }

        if (!Hash::check($current, $this->user->senha)) {
            throw new \RuntimeException('Senha atual incorreta.');
        }

        $this->user->senha = Hash::make($new);
        $this->user->save();
    }

    private function deletePhoto(string $relativePath): void
    {
        $fullPath = public_path($relativePath);
        if (File::exists($fullPath)) {
            File::delete($fullPath);
        }
    }
}

