<?php

return [
    'environment' => env('APP_ENV', 'development'),

    'security' => [
        'session_name' => env('SESSION_NAME', 'UPBALOES_SESSION'),
        'session_lifetime' => (int) env('SESSION_LIFETIME', 3600),
        'remember_lifetime' => (int) env('REMEMBER_LIFETIME', 60 * 24 * 30),
        'password_reset_lifetime' => (int) env('PASSWORD_RESET_LIFETIME', 3600),
        'max_login_attempts' => (int) env('MAX_LOGIN_ATTEMPTS', 5),
        'lockout_duration' => (int) env('LOCKOUT_DURATION', 900),
    ],

    'email' => [
        'from_email' => env('SMTP_FROM_EMAIL', 'noreply@upbaloes.com'),
        'from_name' => env('SMTP_FROM_NAME', 'Up.Baloes System'),
        'reply_to' => env('SMTP_REPLY_TO', env('SMTP_FROM_EMAIL', 'noreply@upbaloes.com')),
    ],

    'urls' => [
        'base' => rtrim(env('BASE_URL', config('app.url')), '/'),
        'login' => env('LOGIN_URL_PATH', '/login'),
        'dashboard' => env('DASHBOARD_URL_PATH', '/painel'),
        'reset_password' => env('RESET_PASSWORD_URL_PATH', '/reset-password'),
    ],

    'defaults' => [
        'decorator_id' => (int) env('DEFAULT_DECORATOR_ID', 1),
    ],
];

