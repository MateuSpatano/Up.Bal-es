<?php

namespace App\Http\Controllers\Api;

use App\Models\AccessLog;
use App\Models\DecoratorPageCustomization;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminController extends BaseApiController
{
    public function getUsers(Request $request)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $page = max((int) $request->input('page', 1), 1);
        $limit = (int) $request->input('limit', 20);
        $limit = max(1, min($limit, 100));
        $search = trim((string) $request->input('search', ''));
        $type = trim((string) $request->input('type', ''));
        $status = trim((string) $request->input('status', ''));

        $query = User::query();

        if ($type === 'client') {
            $query->where('perfil', 'user');
        } elseif ($type === 'decorator') {
            $query->where('perfil', 'decorator');
        }

        if ($status === 'active') {
            $query->where('ativo', true);
        } elseif ($status === 'inactive') {
            $query->where('ativo', false);
        } elseif ($status === 'pending_approval') {
            $query->where('perfil', 'decorator')
                ->where('aprovado_por_admin', false);
        }

        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner->where('nome', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        $total = (clone $query)->count();
        $totalPages = (int) ceil($total / $limit);
        $page = min($page, max($totalPages, 1));

        $users = $query->orderByDesc('created_at')
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->nome,
                    'email' => $user->email,
                    'phone' => $user->telefone,
                    'whatsapp' => $user->whatsapp,
                    'instagram' => $user->instagram,
                    'email_comunicacao' => $user->email_comunicacao,
                    'type' => $user->perfil === 'decorator' ? 'decorator' : 'client',
                    'status' => $this->resolveUserStatus($user),
                    'created_at' => optional($user->created_at)->toIso8601String(),
                    'url' => $user->perfil === 'decorator' ? $this->buildDecoratorUrl($user->slug) : null,
                    'slug' => $user->slug,
                ];
            })
            ->values();

        return $this->success([
            'users' => $users,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'items_per_page' => $limit,
                'total_items' => $total,
            ],
        ]);
    }

    public function getUser(Request $request)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $data = $request->validate([
            'user_id' => 'required|integer|exists:usuarios,id',
        ]);

        $user = User::findOrFail($data['user_id']);

        return $this->success([
            'id' => $user->id,
            'name' => $user->nome,
            'email' => $user->email,
            'phone' => $user->telefone,
            'whatsapp' => $user->whatsapp,
            'instagram' => $user->instagram,
            'email_comunicacao' => $user->email_comunicacao,
            'status' => $this->resolveUserStatus($user),
            'type' => $user->perfil === 'decorator' ? 'decorator' : 'client',
            'approved' => (bool) $user->aprovado_por_admin,
            'slug' => $user->slug,
        ], 'Dados do usuário carregados');
    }

    public function updateUser(Request $request)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $data = $request->validate([
            'id' => 'required|integer|exists:usuarios,id',
            'name' => 'required|string|min:2|max:100',
            'email' => [
                'required',
                'email:rfc,dns',
                'max:100',
                Rule::unique('usuarios', 'email')->ignore($request->input('id')),
            ],
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'instagram' => 'nullable|string|max:255',
            'email_comunicacao' => 'nullable|email:rfc,dns|max:100',
            'status' => 'required|string|in:active,inactive,pending_approval',
            'aprovado_por_admin' => 'nullable|boolean',
        ]);

        /** @var User $user */
        $user = User::findOrFail($data['id']);

        $user->nome = $data['name'];
        $user->email = $data['email'];
        $user->telefone = $data['phone'] ?? null;
        $user->whatsapp = $data['whatsapp'] ?? null;
        $user->instagram = $data['instagram'] ?? null;
        $user->email_comunicacao = $data['email_comunicacao'] ?? null;

        if ($data['status'] === 'inactive') {
            $user->ativo = false;
        } else {
            $user->ativo = true;
        }

        if ($user->perfil === 'decorator') {
            if (array_key_exists('aprovado_por_admin', $data)) {
                $user->aprovado_por_admin = (bool) $data['aprovado_por_admin'];
            }

            if ($data['status'] === 'pending_approval') {
                $user->aprovado_por_admin = false;
                $user->ativo = false;
            }
        }

        $user->save();

        return $this->success(null, 'Usuário atualizado com sucesso!');
    }

    public function approveDecorator(Request $request)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $data = $request->validate([
            'user_id' => 'required|integer|exists:usuarios,id',
            'approved' => 'required|boolean',
        ]);

        /** @var User $user */
        $user = User::findOrFail($data['user_id']);

        if ($user->perfil !== 'decorator') {
            return $this->error('Usuário informado não é um decorador.', 400);
        }

        $user->aprovado_por_admin = $data['approved'];
        $user->ativo = $data['approved'];
        $user->save();

        return $this->success(null, $data['approved'] ? 'Decorador aprovado com sucesso!' : 'Decorador marcado como não aprovado.');
    }

    public function dashboard(Request $request)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $totalClients = User::where('perfil', 'user')->count();
        $activeDecorators = User::where('perfil', 'decorator')
            ->where('ativo', true)
            ->where('aprovado_por_admin', true)
            ->count();

        $totalRequests = DB::table('orcamentos')->count();
        $totalServices = DB::table('decorator_portfolio_items')->count();
        $pendingApprovals = User::where('perfil', 'decorator')
            ->where('aprovado_por_admin', false)
            ->count();

        $activities = AccessLog::orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function (AccessLog $log) {
                return [
                    'type' => $this->resolveActivityType($log->action),
                    'action' => ucfirst(str_replace('_', ' ', $log->action)),
                    'user' => optional($log->user)->nome ?? 'Sistema',
                    'time' => optional($log->created_at)->diffForHumans(),
                ];
            })
            ->values();

        return $this->success([
            'total_clients' => $totalClients,
            'active_decorators' => $activeDecorators,
            'total_requests' => $totalRequests,
            'total_services' => $totalServices,
            'pending_approvals' => $pendingApprovals,
            'activities' => $activities,
        ], 'Dados do dashboard carregados');
    }

    public function getPageCustomization(Request $request)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $data = $request->validate([
            'decorator_id' => 'required|integer|exists:usuarios,id',
        ]);

        /** @var User $decorator */
        $decorator = User::where('perfil', 'decorator')->findOrFail($data['decorator_id']);

        /** @var DecoratorPageCustomization|null $customization */
        $customization = DecoratorPageCustomization::where('decorator_id', $decorator->id)->first();

        if (!$customization) {
            return $this->success([
                'page_title' => '',
                'page_description' => '',
                'welcome_text' => '',
                'cover_image_url' => '',
                'primary_color' => '#667eea',
                'secondary_color' => '#764ba2',
                'accent_color' => '#f59e0b',
                'social_media' => [
                    'facebook' => '',
                    'instagram' => '',
                    'whatsapp' => '',
                    'youtube' => '',
                ],
                'meta_title' => '',
                'meta_description' => '',
                'meta_keywords' => '',
                'contact_email' => $decorator->email_comunicacao ?? '',
                'contact_whatsapp' => $decorator->whatsapp ?? '',
                'contact_instagram' => $decorator->instagram ?? '',
            ], 'Nenhuma personalização encontrada');
        }

        return $this->success([
            'page_title' => $customization->page_title,
            'page_description' => $customization->page_description,
            'welcome_text' => $customization->welcome_text,
            'cover_image_url' => $customization->cover_image_url,
            'primary_color' => $customization->primary_color,
            'secondary_color' => $customization->secondary_color,
            'accent_color' => $customization->accent_color,
            'social_media' => $customization->social_media,
            'meta_title' => $customization->meta_title,
            'meta_description' => $customization->meta_description,
            'meta_keywords' => $customization->meta_keywords,
            'contact_email' => $decorator->email_comunicacao ?? '',
            'contact_whatsapp' => $decorator->whatsapp ?? '',
            'contact_instagram' => $decorator->instagram ?? '',
        ], 'Configurações carregadas');
    }

    public function savePageCustomization(Request $request)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validator = Validator::make($request->all(), [
            'decorator_id' => 'required|integer|exists:usuarios,id',
            'page_title' => 'required|string|max:255',
            'page_description' => 'required|string',
            'welcome_text' => 'nullable|string',
            'cover_image_url' => 'nullable|url|max:500',
            'primary_color' => 'nullable|string|size:7',
            'secondary_color' => 'nullable|string|size:7',
            'accent_color' => 'nullable|string|size:7',
            'social_media' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string|max:500',
            'contact_email' => 'nullable|email:rfc,dns|max:100',
            'contact_whatsapp' => 'nullable|string|max:20',
            'contact_instagram' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        $data = $validator->validated();

        /** @var User $decorator */
        $decorator = User::where('perfil', 'decorator')->findOrFail($data['decorator_id']);

        $socialMedia = [];
        if (!empty($data['social_media'])) {
            $socialMedia = json_decode($data['social_media'], true) ?: [];
        }

        $customization = DecoratorPageCustomization::updateOrCreate(
            ['decorator_id' => $decorator->id],
            [
                'page_title' => $data['page_title'],
                'page_description' => $data['page_description'],
                'welcome_text' => $data['welcome_text'] ?? null,
                'cover_image_url' => $data['cover_image_url'] ?? null,
                'primary_color' => $data['primary_color'] ?? '#667eea',
                'secondary_color' => $data['secondary_color'] ?? '#764ba2',
                'accent_color' => $data['accent_color'] ?? '#f59e0b',
                'social_media' => $socialMedia ?: null,
                'meta_title' => $data['meta_title'] ?? null,
                'meta_description' => $data['meta_description'] ?? null,
                'meta_keywords' => $data['meta_keywords'] ?? null,
                'is_active' => true,
            ]
        );

        $decorator->email_comunicacao = $data['contact_email'] ?? $decorator->email_comunicacao;
        $decorator->whatsapp = $data['contact_whatsapp'] ?? $decorator->whatsapp;
        $decorator->instagram = $data['contact_instagram'] ?? $decorator->instagram;
        $decorator->save();

        $this->logAccess(auth()->id(), 'save_page_customization', $request);

        return $this->success(null, 'Personalização salva com sucesso!');
    }

    public function createDecorator(Request $request)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $data = $request->validate([
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email:rfc,dns|max:100|unique:usuarios,email',
            'communication_email' => 'nullable|email:rfc,dns|max:100|unique:usuarios,email_comunicacao',
            'cpf' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'instagram' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'password' => 'required|string|min:8|max:100',
        ]);

        $slug = $this->generateUniqueSlug($data['name']);

        $decorator = new User();
        $decorator->nome = $data['name'];
        $decorator->email = $data['email'];
        $decorator->email_comunicacao = $data['communication_email'] ?? $data['email'];
        $decorator->telefone = $data['phone'] ?? null;
        $decorator->whatsapp = $data['whatsapp'] ?? null;
        $decorator->instagram = $data['instagram'] ?? null;
        $decorator->cpf = $data['cpf'] ?? null;
        $decorator->endereco = $data['address'] ?? null;
        $decorator->cidade = $data['city'] ?? null;
        $decorator->estado = $data['state'] ?? null;
        $decorator->perfil = 'decorator';
        $decorator->slug = $slug;
        $decorator->senha = Hash::make($data['password']);
        $decorator->ativo = true;
        $decorator->aprovado_por_admin = true;
        $decorator->is_active = true;
        $decorator->save();

        $this->logAccess(auth()->id(), 'create_decorator', $request);

        return $this->success([
            'id' => $decorator->id,
            'name' => $decorator->nome,
            'email' => $decorator->email,
            'communication_email' => $decorator->email_comunicacao,
            'whatsapp' => $decorator->whatsapp,
            'slug' => $decorator->slug,
            'url' => $this->buildDecoratorUrl($decorator->slug),
        ], 'Decorador criado com sucesso!');
    }

    public function getAdminProfile(Request $request)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        /** @var User $admin */
        $admin = $request->user();

        return $this->success([
            'id' => $admin->id,
            'name' => $admin->nome,
            'email' => $admin->email,
            'phone' => $admin->telefone,
            'whatsapp' => $admin->whatsapp,
            'instagram' => $admin->instagram,
            'communication_email' => $admin->email_comunicacao,
            'bio' => $admin->bio,
            'profile_photo' => $admin->foto_perfil,
            'profile_photo_url' => $admin->foto_perfil ? asset($admin->foto_perfil) : null,
        ], 'Perfil administrativo carregado');
    }

    public function updateAdminProfile(Request $request)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $data = $request->validate([
            'name' => 'required|string|min:2|max:100',
            'email' => [
                'required',
                'email:rfc,dns',
                'max:100',
                Rule::unique('usuarios', 'email')->ignore($request->user()->id),
            ],
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'instagram' => 'nullable|string|max:255',
            'communication_email' => [
                'nullable',
                'email:rfc,dns',
                'max:100',
                Rule::unique('usuarios', 'email_comunicacao')->ignore($request->user()->id),
            ],
            'bio' => 'nullable|string|max:500',
            'profile_photo' => 'nullable|string',
            'remove_photo' => 'nullable|boolean',
        ]);

        /** @var User $admin */
        $admin = $request->user();

        $admin->nome = $data['name'];
        $admin->email = $data['email'];
        $admin->telefone = $data['phone'] ?? null;
        $admin->whatsapp = $data['whatsapp'] ?? null;
        $admin->instagram = $data['instagram'] ?? null;
        $admin->email_comunicacao = $data['communication_email'] ?? null;
        $admin->bio = $data['bio'] ?? null;

        if (!empty($data['profile_photo'])) {
            $admin->foto_perfil = $this->storeProfilePhoto($data['profile_photo'], $admin->foto_perfil, $admin->id);
        } elseif (!empty($data['remove_photo']) && $admin->foto_perfil) {
            $this->deletePhoto($admin->foto_perfil);
            $admin->foto_perfil = null;
        }

        $admin->save();

        $this->logAccess($admin->id, 'update_admin_profile', $request);

        return $this->success([
            'name' => $admin->nome,
            'email' => $admin->email,
            'phone' => $admin->telefone,
            'whatsapp' => $admin->whatsapp,
            'instagram' => $admin->instagram,
            'communication_email' => $admin->email_comunicacao,
            'bio' => $admin->bio,
            'profile_photo' => $admin->foto_perfil,
            'profile_photo_url' => $admin->foto_perfil ? asset($admin->foto_perfil) : null,
        ], 'Perfil atualizado com sucesso!');
    }

    public function changeAdminPassword(Request $request)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        /** @var User $admin */
        $admin = $request->user();

        if (!Hash::check($data['current_password'], $admin->senha)) {
            return $this->error('Senha atual incorreta.', 422);
        }

        $admin->senha = Hash::make($data['new_password']);
        $admin->save();

        $this->logAccess($admin->id, 'change_admin_password', $request);

        return $this->success(null, 'Senha atualizada com sucesso!');
    }

    private function resolveUserStatus(User $user): string
    {
        if ($user->perfil === 'decorator' && !$user->aprovado_por_admin) {
            return 'pending_approval';
        }

        return $user->ativo ? 'active' : 'inactive';
    }

    private function buildDecoratorUrl(?string $slug): ?string
    {
        if (empty($slug)) {
            return null;
        }

        $base = rtrim(config('upbaloes.urls.base') ?? config('app.url'), '/');
        return $base . '/decorador/' . urlencode($slug);
    }

    private function resolveActivityType(string $action): string
    {
        return match ($action) {
            'login', 'admin_login', 'save_page_customization', 'create_budget', 'update_user' => 'success',
            'admin_logout', 'logout' => 'info',
            default => 'info',
        };
    }

    private function logAccess(?int $userId, string $action, Request $request): void
    {
        AccessLog::create([
            'user_id' => $userId,
            'action' => $action,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);
    }

    private function ensureAdmin(Request $request)
    {
        $user = auth()->user();

        if (!$user || $user->perfil !== 'admin') {
            $this->logAccess($user?->id, 'admin_access_denied', $request);
            return $this->error('Acesso negado.', 403);
        }

        return null;
    }

    private function generateUniqueSlug(string $name): string
    {
        $baseSlug = Str::slug($name);

        if ($baseSlug === '') {
            $baseSlug = 'decorador';
        }

        $slug = $baseSlug;
        $suffix = 1;

        while (User::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $suffix;
            $suffix++;
        }

        return $slug;
    }

    private function storeProfilePhoto(string $dataUri, ?string $existingPath, int $userId): string
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $dataUri, $matches) !== 1) {
            throw new \RuntimeException('Imagem inválida.');
        }

        $extension = strtolower($matches[1]);
        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
            throw new \RuntimeException('Formato de imagem não suportado.');
        }

        $data = substr($dataUri, strpos($dataUri, ',') + 1);
        $binary = base64_decode($data, true);

        if ($binary === false) {
            throw new \RuntimeException('Não foi possível decodificar a imagem.');
        }

        $directory = public_path('uploads/profile_photos');
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $fileName = 'admin_' . $userId . '_' . uniqid('', true) . '.' . ($extension === 'jpg' ? 'jpg' : $extension);
        $filePath = $directory . '/' . $fileName;

        file_put_contents($filePath, $binary);

        if ($existingPath) {
            $this->deletePhoto($existingPath);
        }

        return 'uploads/profile_photos/' . $fileName;
    }

    private function deletePhoto(?string $relativePath): void
    {
        if (!$relativePath) {
            return;
        }

        $fullPath = public_path($relativePath);
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }
}

