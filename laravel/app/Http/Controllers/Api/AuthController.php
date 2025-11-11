<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function login(Request $request): Response
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember' => 'sometimes|boolean',
        ]);

        $user = DB::table('usuarios')
            ->where('email', $data['email'])
            ->where('ativo', 1)
            ->first();

        if (!$user || !Hash::check($data['password'], $user->senha)) {
            return $this->errorResponse('Email ou senha incorretos', Response::HTTP_UNAUTHORIZED);
        }

        if ($user->perfil === 'decorator' && (int) $user->aprovado_por_admin !== 1) {
            return $this->errorResponse(
                'Sua conta de decorador ainda não foi aprovada pelo administrador. Aguarde a aprovação.',
                Response::HTTP_FORBIDDEN
            );
        }

        $this->authenticateUser((int) $user->id, $request);
        $this->logAccess((int) $user->id, 'login', $request);

        $response = $this->successResponse($this->formatUserData($user), 'Login realizado com sucesso!');

        if (!empty($data['remember']) && $data['remember']) {
            $cookie = $this->createRememberCookie((int) $user->id, false);
            $response->headers->setCookie($cookie);
        }

        return $response;
    }

    public function adminLogin(Request $request): Response
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember' => 'sometimes|boolean',
        ]);

        $admin = DB::table('usuarios')
            ->where('email', $data['email'])
            ->where('perfil', 'admin')
            ->where('ativo', 1)
            ->first();

        if (!$admin || !Hash::check($data['password'], $admin->senha)) {
            return $this->errorResponse('Credenciais administrativas incorretas', Response::HTTP_UNAUTHORIZED);
        }

        $this->authenticateUser((int) $admin->id, $request, true);
        $this->logAccess((int) $admin->id, 'admin_login', $request);

        $response = $this->successResponse(
            $this->formatUserData($admin, true),
            'Login administrativo realizado com sucesso!'
        );

        if (!empty($data['remember']) && $data['remember']) {
            $cookie = $this->createRememberCookie((int) $admin->id, true);
            $response->headers->setCookie($cookie);
        }

        return $response;
    }

    public function logout(Request $request): Response
    {
        $response = $this->successResponse(null, 'Logout realizado com sucesso!');

        if (Auth::check()) {
            $this->logAccess(Auth::id(), 'logout', $request);
        }

        $this->destroySession($request);

        $rememberToken = $request->cookie('remember_token');
        if ($rememberToken) {
            $this->deleteRememberToken($rememberToken, false);
            $response->headers->setCookie(Cookie::forget('remember_token'));
        }

        return $response;
    }

    public function adminLogout(Request $request): Response
    {
        $response = $this->successResponse(null, 'Logout administrativo realizado com sucesso!');

        if (Auth::check()) {
            $this->logAccess(Auth::id(), 'admin_logout', $request);
        }

        $this->destroySession($request);

        $rememberToken = $request->cookie('admin_remember_token');
        if ($rememberToken) {
            $this->deleteRememberToken($rememberToken, true);
            $response->headers->setCookie(Cookie::forget('admin_remember_token'));
        }

        return $response;
    }

    public function checkAuth(Request $request): Response
    {
        $this->ensureRememberAuthenticated($request);

        if (!Auth::check()) {
            return $this->errorResponse('Usuário não autenticado', Response::HTTP_UNAUTHORIZED);
        }

        /** @var User $user */
        $user = Auth::user();

        return $this->successResponse([
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->nome,
            'role' => $user->perfil,
        ], 'Usuário autenticado');
    }

    public function checkAdminAuth(Request $request): Response
    {
        $this->ensureRememberAuthenticated($request, true);

        if (!Auth::check() || Auth::user()->perfil !== 'admin') {
            return $this->errorResponse('Administrador não autenticado', Response::HTTP_UNAUTHORIZED);
        }

        /** @var User $user */
        $user = Auth::user();

        return $this->successResponse([
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->nome,
            'role' => 'admin',
        ], 'Administrador autenticado');
    }

    public function requestPasswordReset(Request $request): Response
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        /** @var object|null $user */
        $user = DB::table('usuarios')
            ->where('email', $data['email'])
            ->where('ativo', 1)
            ->first();

        if (!$user) {
            return $this->successResponse(null, 'Se o email estiver cadastrado, você receberá instruções de recuperação.');
        }

        $token = Str::random(64);
        $expiresAt = Carbon::now()->addSeconds($this->passwordResetLifetime());

        DB::table('password_reset_tokens')->where('user_id', $user->id)->delete();

        DB::table('password_reset_tokens')->insert([
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => $expiresAt,
            'created_at' => Carbon::now(),
        ]);

        $this->cleanupExpiredResetTokens();

        $resetLink = $this->buildResetLink($token);
        $subject = 'Recuperação de senha - Up.Baloes';
        $userName = $user->nome ?? 'usuário';

        $htmlBody = view('emails.password-reset', [
            'name' => $userName,
            'resetLink' => $resetLink,
            'lifetime' => (int) ($this->passwordResetLifetime() / 60),
        ])->render();

        $textBody = "Olá {$userName},\n\nRecebemos uma solicitação para redefinir sua senha no Up.Baloes.\n\n"
            . "Acesse o link abaixo para criar uma nova senha (válido por "
            . (int) ($this->passwordResetLifetime() / 60)
            . " minutos):\n{$resetLink}\n\n"
            . "Se você não solicitou a alteração, ignore este email.\n\nEquipe Up.Baloes";

        try {
            Mail::send([], [], function ($message) use ($data, $subject, $htmlBody, $textBody) {
                $message->to($data['email'])
                    ->subject($subject)
                    ->setBody($htmlBody, 'text/html')
                    ->addPart($textBody, 'text/plain')
                    ->from(
                        config('upbaloes.email.from_email'),
                        config('upbaloes.email.from_name')
                    )
                    ->replyTo(
                        config('upbaloes.email.reply_to'),
                        config('upbaloes.email.from_name')
                    );
            });
        } catch (\Throwable $exception) {
            report($exception);
        }

        return $this->successResponse(null, 'Se o email estiver cadastrado, você receberá instruções de recuperação.');
    }

    public function validateResetToken(Request $request): Response
    {
        $data = $request->validate([
            'token' => 'required|string',
        ]);

        $this->cleanupExpiredResetTokens();

        $record = DB::table('password_reset_tokens as prt')
            ->join('usuarios as u', 'u.id', '=', 'prt.user_id')
            ->select('prt.token', 'prt.expires_at', 'u.email', 'u.nome')
            ->where('prt.token', $data['token'])
            ->first();

        if (!$record) {
            return $this->errorResponse('Token inválido ou expirado.', Response::HTTP_BAD_REQUEST);
        }

        if (Carbon::parse($record->expires_at)->isPast()) {
            DB::table('password_reset_tokens')->where('token', $data['token'])->delete();
            return $this->errorResponse('Token expirado. Solicite uma nova recuperação.', Response::HTTP_BAD_REQUEST);
        }

        return $this->successResponse([
            'email' => $record->email,
            'name' => $record->nome,
            'expires_at' => $record->expires_at,
        ], 'Token válido.');
    }

    public function setNewPassword(Request $request): Response
    {
        $data = $request->validate([
            'token' => 'required|string',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Za-z]/',
                'regex:/\d/',
            ],
            'confirm_password' => 'required|same:password',
        ], [
            'password.regex' => 'A nova senha deve conter letras e números.',
        ]);

        $this->cleanupExpiredResetTokens();

        $record = DB::table('password_reset_tokens as prt')
            ->join('usuarios as u', 'u.id', '=', 'prt.user_id')
            ->select('prt.user_id', 'prt.expires_at')
            ->where('prt.token', $data['token'])
            ->first();

        if (!$record) {
            return $this->errorResponse('Token inválido ou expirado.', Response::HTTP_BAD_REQUEST);
        }

        if (Carbon::parse($record->expires_at)->isPast()) {
            DB::table('password_reset_tokens')->where('token', $data['token'])->delete();
            return $this->errorResponse('Token expirado. Solicite uma nova recuperação.', Response::HTTP_BAD_REQUEST);
        }

        DB::transaction(function () use ($record, $data, $request) {
            DB::table('usuarios')
                ->where('id', $record->user_id)
                ->update([
                    'senha' => Hash::make($data['password']),
                    'updated_at' => Carbon::now(),
                ]);

            DB::table('password_reset_tokens')
                ->where('user_id', $record->user_id)
                ->delete();

            $this->logAccess((int) $record->user_id, 'password_reset', $request);
        });

        return $this->successResponse(null, 'Senha redefinida com sucesso! Você já pode fazer login.');
    }

    private function authenticateUser(int $userId, Request $request, bool $isAdmin = false): void
    {
        Auth::loginUsingId($userId);
        $request->session()->put($isAdmin ? 'admin_role' : 'user_role', $isAdmin ? 'admin' : Auth::user()->perfil);
        $request->session()->put('login_time', Carbon::now()->timestamp);
        $request->session()->regenerate();
    }

    private function destroySession(Request $request): void
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }

    private function createRememberCookie(int $userId, bool $isAdmin): \Symfony\Component\HttpFoundation\Cookie
    {
        $token = Str::random(64);
        $expiresAt = Carbon::now()->addSeconds($this->rememberLifetime());

        DB::table('remember_tokens')->insert([
            'user_id' => $userId,
            'token' => $token,
            'expires_at' => $expiresAt,
            'is_admin' => $isAdmin ? 1 : 0,
            'created_at' => Carbon::now(),
        ]);

        $cookieName = $isAdmin ? 'admin_remember_token' : 'remember_token';

        return Cookie::make(
            $cookieName,
            $token,
            (int) ($this->rememberLifetime() / 60),
            '/',
            null,
            app()->environment('production'),
            true,
            false,
            Cookie::SAMESITE_LAX
        );
    }

    private function deleteRememberToken(string $token, bool $isAdmin): void
    {
        DB::table('remember_tokens')
            ->where('token', $token)
            ->where('is_admin', $isAdmin ? 1 : 0)
            ->delete();
    }

    private function ensureRememberAuthenticated(Request $request, bool $adminOnly = false): void
    {
        if (!Auth::check() && !$adminOnly) {
            $token = $request->cookie('remember_token');
            if ($token) {
                $this->authenticateUsingRememberToken($token, false, $request);
            }
        }

        if ((!Auth::check() || Auth::user()?->perfil !== 'admin') && $request->hasCookie('admin_remember_token')) {
            $token = $request->cookie('admin_remember_token');
            $this->authenticateUsingRememberToken($token, true, $request);
        }
    }

    private function authenticateUsingRememberToken(string $token, bool $isAdmin, Request $request): void
    {
        $record = DB::table('remember_tokens as rt')
            ->join('usuarios as u', 'u.id', '=', 'rt.user_id')
            ->select('rt.user_id', 'rt.expires_at', 'u.perfil')
            ->where('rt.token', $token)
            ->where('rt.is_admin', $isAdmin ? 1 : 0)
            ->first();

        if (!$record) {
            return;
        }

        if (Carbon::parse($record->expires_at)->isPast()) {
            $this->deleteRememberToken($token, $isAdmin);
            return;
        }

        if ($isAdmin && $record->perfil !== 'admin') {
            return;
        }

        $this->authenticateUser((int) $record->user_id, $request, $isAdmin);
    }

    private function logAccess(int $userId, string $action, Request $request): void
    {
        try {
            DB::table('access_logs')->insert([
                'user_id' => $userId,
                'action' => $action,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => Carbon::now(),
            ]);
        } catch (\Throwable $exception) {
            report($exception);
        }
    }

    private function cleanupExpiredResetTokens(): void
    {
        DB::table('password_reset_tokens')
            ->where('expires_at', '<', Carbon::now())
            ->delete();
    }

    private function buildResetLink(string $token): string
    {
        $base = config('upbaloes.urls.base');
        $path = ltrim(config('upbaloes.urls.reset_password'), '/');

        return rtrim($base, '/') . '/' . $path . '?token=' . urlencode($token);
    }

    private function rememberLifetime(): int
    {
        return (int) config('upbaloes.security.remember_lifetime', 60 * 60 * 24 * 30);
    }

    private function passwordResetLifetime(): int
    {
        return (int) config('upbaloes.security.password_reset_lifetime', 3600);
    }

    private function successResponse(mixed $data = null, string $message = 'Operação realizada com sucesso.'): Response
    {
        $payload = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $payload['data'] = $data;
        }

        return response()->json($payload);
    }

    private function errorResponse(string $message, int $status = Response::HTTP_BAD_REQUEST, ?string $code = null): Response
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($code !== null) {
            $payload['code'] = $code;
        }

        return response()->json($payload, $status);
    }

    private function formatUserData(object $user, bool $isAdmin = false): array
    {
        return [
            'id' => $user->id,
            'name' => $user->nome,
            'email' => $user->email,
            'role' => $isAdmin ? 'admin' : $user->perfil,
            'phone' => $user->telefone ?? null,
            'address' => $user->endereco ?? null,
            'city' => $user->cidade ?? null,
            'state' => $user->estado ?? null,
            'zipcode' => $user->cep ?? null,
            'slug' => $user->slug ?? null,
        ];
    }
}

