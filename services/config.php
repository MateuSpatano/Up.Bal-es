<?php
/**
 * Configurações do sistema Up.Baloes
 * Centraliza todas as variáveis de ambiente e configurações do sistema
 */

// Carregar variáveis de ambiente se o arquivo .env existir
if (file_exists(__DIR__ . '/../.env')) {
    require_once __DIR__ . '/../vendor/autoload.php';
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
}

// Ambiente (development ou production)
define('ENVIRONMENT', $_ENV['ENVIRONMENT'] ?? 'development');

// Configurações do banco de dados MySQL - Centralizadas
$database_config = [
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'dbname' => $_ENV['DB_NAME'] ?? 'up_baloes',
    'username' => $_ENV['DB_USER'] ?? 'root',
    'password' => $_ENV['DB_PASS'] ?? '',
    'charset' => 'utf8mb4',
    'port' => (int)($_ENV['DB_PORT'] ?? 3306),
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_PERSISTENT => false,
    ]
];

// Adicionar MYSQL_ATTR_INIT_COMMAND apenas se pdo_mysql estiver disponível
if (defined('PDO::MYSQL_ATTR_INIT_COMMAND')) {
    $database_config['options'][PDO::MYSQL_ATTR_INIT_COMMAND] = "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci";
}

// Configurações de segurança
$security_config = [
    'session_name' => 'UPBALOES_SESSION',
    'session_lifetime' => 3600,
    'remember_lifetime' => 2592000,
    'password_reset_lifetime' => 3600,
    'max_login_attempts' => 5,
    'lockout_duration' => 900,
];

// Configurações de email - Centralizadas
$email_config = [
    'smtp_host' => $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com',
    'smtp_port' => (int)($_ENV['SMTP_PORT'] ?? 587),
    'smtp_username' => $_ENV['SMTP_USERNAME'] ?? 'your-email@gmail.com',
    'smtp_password' => $_ENV['SMTP_PASSWORD'] ?? 'your-app-password',
    'from_email' => $_ENV['SMTP_FROM_EMAIL'] ?? 'noreply@upbaloes.com',
    'from_name' => $_ENV['SMTP_FROM_NAME'] ?? 'Up.Baloes System'
];

// Configurações de upload
$upload_config = [
    'max_file_size' => 5 * 1024 * 1024,
    'allowed_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    'upload_path' => '../uploads/',
    'temp_path' => '../temp/'
];

// Configurações de paginação
$pagination_config = [
    'default_limit' => 20,
    'max_limit' => 100
];

// Configurações de cache
$cache_config = [
    'enabled' => true,
    'default_ttl' => 3600,
    'path' => '../cache/'
];

// URLs do sistema - Centralizadas
$urls = [
    'base' => $_ENV['BASE_URL'] ?? 'http://localhost/Up.BaloesV3/',
    'login' => 'pages/login.html',
    'dashboard' => 'pages/dashboard.html',
    'reset_password' => 'pages/reset-password.html'
];

// Configurações JWT - Centralizadas
$jwt_config = [
    'secret' => $_ENV['JWT_SECRET'] ?? 'your_jwt_secret_key_here',
    'expiration' => (int)($_ENV['JWT_EXPIRATION'] ?? 28800)
];

// Configurações Google OAuth - Centralizadas
$google_config = [
    'client_id' => $_ENV['GOOGLE_CLIENT_ID'] ?? '',
    'client_secret' => $_ENV['GOOGLE_CLIENT_SECRET'] ?? '',
    'redirect_uri' => $_ENV['GOOGLE_REDIRECT_URI'] ?? $urls['base'] . 'services/google-callback.php'
];

// Configurações de desenvolvimento
if (ENVIRONMENT === 'development') {
    // Mostrar erros em desenvolvimento
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    
    // Configurações de CORS mais permissivas
    $cors_config = [
        'allowed_origins' => ['*'],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With']
    ];
} else {
    // Configurações de produção
    error_reporting(0);
    ini_set('display_errors', 0);
    
    $cors_config = [
        'allowed_origins' => ['https://yourdomain.com'],
        'allowed_methods' => ['GET', 'POST'],
        'allowed_headers' => ['Content-Type', 'Authorization']
    ];
}

// Configurar headers CORS
function setupCORS($cors_config) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array('*', $cors_config['allowed_origins']) || in_array($origin, $cors_config['allowed_origins'])) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header('Access-Control-Allow-Methods: ' . implode(', ', $cors_config['allowed_methods']));
    header('Access-Control-Allow-Headers: ' . implode(', ', $cors_config['allowed_headers']));
    header('Access-Control-Allow-Credentials: true');
}

// Conectar ao banco de dados MySQL
function getDatabaseConnection($config) {
    try {
        $port = $config['port'] ?? 3306;
        $dsn = "mysql:host={$config['host']};port={$port};dbname={$config['dbname']};charset={$config['charset']}";
        $pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);
        return $pdo;
    } catch (PDOException $e) {
        if (ENVIRONMENT === 'development') {
            throw new Exception('Erro de conexão com o banco de dados MySQL: ' . $e->getMessage());
        } else {
            throw new Exception('Erro interno do servidor.');
        }
    }
}

// Log de erros do sistema
function logError($message, $context = []) {
    $log_message = date('Y-m-d H:i:s') . ' - ' . $message;
    if (!empty($context)) {
        $log_message .= ' - Context: ' . json_encode($context);
    }
    $log_message .= PHP_EOL;
    
    file_put_contents('../logs/error.log', $log_message, FILE_APPEND | LOCK_EX);
}

// Sanitizar dados de entrada
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Validar formato de email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Gerar token seguro
function generateSecureToken($length = 32) {
    return bin2hex(random_bytes($length));
}

// Hash de senha
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Verificar senha
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Enviar email simples (HTML) utilizando as configurações definidas
function sendEmail($to, $subject, $htmlBody, $textBody = null) {
    global $email_config;
    
    $fromEmail = $email_config['from_email'] ?? 'noreply@upbaloes.com';
    $fromName = $email_config['from_name'] ?? 'Up.Baloes';
    $replyTo = $email_config['reply_to'] ?? $fromEmail;
    
    $encodedSubject = mb_encode_mimeheader($subject, 'UTF-8');
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . mb_encode_mimeheader($fromName, 'UTF-8') . " <{$fromEmail}>",
        'Reply-To: ' . $replyTo,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    $body = $htmlBody;
    if ($textBody !== null && trim($textBody) !== '') {
        $body .= "<br><br><pre style=\"font-family: 'Segoe UI', Arial, sans-serif; color: #6B7280;\">" . htmlspecialchars($textBody) . '</pre>';
    }
    
    $result = @mail($to, $encodedSubject, $body, implode("\r\n", $headers));
    
    if (!$result) {
        error_log("Falha ao enviar email para {$to} com assunto '{$subject}'");
    }
    
    return $result;
}

// Resposta JSON padronizada
function jsonResponse($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Resposta de erro
function errorResponse($message, $status_code = 400, $code = null) {
    $response = [
        'success' => false,
        'message' => $message
    ];
    
    if ($code !== null) {
        $response['code'] = $code;
    }
    
    jsonResponse($response, $status_code);
}

// Resposta de sucesso
function successResponse($data = null, $message = 'Operação realizada com sucesso.') {
    $response = [
        'success' => true,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    jsonResponse($response);
}

// Inicializar configurações globais (apenas se não for CLI)
if (php_sapi_name() !== 'cli' && session_status() === PHP_SESSION_NONE) {
    ini_set('session.name', $security_config['session_name']);
    ini_set('session.cookie_lifetime', $security_config['session_lifetime']);
    ini_set('session.cookie_secure', ENVIRONMENT === 'production');
    ini_set('session.cookie_httponly', true);
    session_start();
}

// Configurar timezone
date_default_timezone_set('America/Sao_Paulo');

// Configurar headers básicos (apenas se não for CLI)
if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    
    // Configurar CORS
    setupCORS($cors_config);
}

// Criar diretórios necessários se não existirem
$directories = [
    '../logs/',
    '../cache/',
    '../uploads/',
    '../temp/'
];

foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}
?>