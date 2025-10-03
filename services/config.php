<?php
/**
 * Arquivo de configuração para Up.Baloes
 * 
 * Este arquivo contém todas as configurações necessárias
 * para o funcionamento do sistema.
 */

// Configurações de ambiente
define('ENVIRONMENT', 'development'); // development, production

// Configurações de banco de dados MySQL
$database_config = [
    'host' => 'localhost',
    'dbname' => 'up_baloes',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'port' => 3306, // Porta padrão do MySQL
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        PDO::ATTR_PERSISTENT => false, // Desabilitar conexões persistentes para melhor performance
    ]
];

// Configurações de segurança
$security_config = [
    'session_name' => 'UPBALOES_SESSION',
    'session_lifetime' => 3600, // 1 hora
    'remember_lifetime' => 2592000, // 30 dias
    'password_reset_lifetime' => 3600, // 1 hora
    'max_login_attempts' => 5,
    'lockout_duration' => 900, // 15 minutos
];

// Configurações de email
$email_config = [
    'smtp_host' => 'smtp.gmail.com',
    'smtp_port' => 587,
    'smtp_username' => 'your-email@gmail.com',
    'smtp_password' => 'your-app-password',
    'from_email' => 'noreply@upbaloes.com',
    'from_name' => 'Up.Baloes System'
];

// Configurações de upload
$upload_config = [
    'max_file_size' => 5 * 1024 * 1024, // 5MB
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
    'default_ttl' => 3600, // 1 hora
    'path' => '../cache/'
];

// URLs do sistema
$urls = [
    'base' => 'http://localhost/Up.BaloesV3/',
    'login' => 'pages/login.html',
    'dashboard' => 'pages/dashboard.html',
    'reset_password' => 'pages/reset-password.html'
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

/**
 * Função para configurar headers CORS
 */
function setupCORS($cors_config) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array('*', $cors_config['allowed_origins']) || in_array($origin, $cors_config['allowed_origins'])) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header('Access-Control-Allow-Methods: ' . implode(', ', $cors_config['allowed_methods']));
    header('Access-Control-Allow-Headers: ' . implode(', ', $cors_config['allowed_headers']));
    header('Access-Control-Allow-Credentials: true');
}

/**
 * Função para conectar ao banco de dados
 */
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

/**
 * Função para log de erros
 */
function logError($message, $context = []) {
    $log_message = date('Y-m-d H:i:s') . ' - ' . $message;
    if (!empty($context)) {
        $log_message .= ' - Context: ' . json_encode($context);
    }
    $log_message .= PHP_EOL;
    
    file_put_contents('../logs/error.log', $log_message, FILE_APPEND | LOCK_EX);
}

/**
 * Função para sanitizar dados de entrada
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Função para validar email
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Função para gerar token seguro
 */
function generateSecureToken($length = 32) {
    return bin2hex(random_bytes($length));
}

/**
 * Função para hash de senha
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

/**
 * Função para verificar senha
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Função para resposta JSON padronizada
 */
function jsonResponse($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Função para resposta de erro
 */
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

/**
 * Função para resposta de sucesso
 */
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

// Inicializar configurações globais
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.name', $security_config['session_name']);
    ini_set('session.cookie_lifetime', $security_config['session_lifetime']);
    ini_set('session.cookie_secure', ENVIRONMENT === 'production');
    ini_set('session.cookie_httponly', true);
    session_start();
}

// Configurar timezone
date_default_timezone_set('America/Sao_Paulo');

// Configurar headers básicos
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Configurar CORS
setupCORS($cors_config);

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