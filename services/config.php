<?php
/**
 * Configurações do sistema Up.Baloes
 * Centraliza todas as variáveis de ambiente e configurações do sistema
 */

// Carregar variáveis de ambiente se o arquivo .env existir
if (file_exists(__DIR__ . '/../.env')) {
    $autoloadPath = __DIR__ . '/../vendor/autoload.php';
    if (file_exists($autoloadPath)) {
        require_once $autoloadPath;
        
        // Verificar se a classe Dotenv existe antes de usar
        if (class_exists('Dotenv\Dotenv')) {
            try {
                $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
                $dotenv->load();
            } catch (Exception $e) {
                error_log('Erro ao carregar .env: ' . $e->getMessage());
            }
        } else {
            error_log('Aviso: Dotenv não encontrado. Execute: composer install');
        }
    } else {
        error_log('Aviso: vendor/autoload.php não encontrado. Execute: composer install');
    }
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
    'session_lifetime' => 3600, // 1 hora (1 * 60 * 60 = 3600 segundos)
    'remember_lifetime' => 2592000,
    'password_reset_lifetime' => 3600,
    'max_login_attempts' => 5,
    'lockout_duration' => 900,
];

// Configurações de email - Centralizadas
$email_config = [
    'smtp_host' => $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com',
    'smtp_port' => (int)($_ENV['SMTP_PORT'] ?? 587),
    'smtp_username' => trim($_ENV['SMTP_USERNAME'] ?? 'your-email@gmail.com'),
    'smtp_password' => trim($_ENV['SMTP_PASSWORD'] ?? 'your-app-password'), // Remove espaços extras
    'from_email' => trim($_ENV['SMTP_FROM_EMAIL'] ?? 'noreply@upbaloes.com'),
    'from_name' => trim($_ENV['SMTP_FROM_NAME'] ?? 'Up.Baloes System', '"') // Remove aspas se houver
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

// Função para garantir HTTPS em produção
function ensureHttps($url) {
    // Se estiver em desenvolvimento local, permitir HTTP
    if (ENVIRONMENT === 'development' || strpos($url, 'localhost') !== false || strpos($url, '127.0.0.1') !== false) {
        return $url;
    }
    
    // Em produção, forçar HTTPS
    if (strpos($url, 'http://') === 0) {
        return str_replace('http://', 'https://', $url);
    }
    
    // Se já for HTTPS ou protocolo relativo, retornar como está
    return $url;
}

// URLs do sistema - Centralizadas
// Detectar automaticamente a URL base do projeto
$baseUrl = $_ENV['BASE_URL'] ?? '';
if (empty($baseUrl)) {
    // Tentar detectar automaticamente
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    
    // Tentar detectar do SCRIPT_NAME primeiro (mais confiável)
    $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
    $requestUri = $_SERVER['REQUEST_URI'] ?? '';
    
    $projectName = null;
    $knownProjects = ['Up.Bal-es', 'Up.BaloesV3', 'Up.Baloes'];
    
    // 1. Tentar do SCRIPT_NAME primeiro (mais confiável)
    // Exemplo: /Up.Bal-es/services/config.php
    if (preg_match('#^/([^/]+)#', $scriptName, $matches)) {
        $firstSegment = $matches[1];
        // Verificar se é um projeto conhecido
        if (in_array($firstSegment, $knownProjects)) {
            $projectName = $firstSegment;
        } elseif (stripos($firstSegment, 'bal') !== false) {
            // Se contém "bal", pode ser válido mas verificar se não é um slug
            // Slugs geralmente não começam com "Up."
            if (strpos($firstSegment, 'Up.') === 0 || strpos($firstSegment, 'up.') === 0) {
                $projectName = $firstSegment;
            }
        }
    }
    
    // 2. Se não encontrou no SCRIPT_NAME, tentar do REQUEST_URI
    // Mas só se for um projeto conhecido (não um slug)
    if (!$projectName && preg_match('#^/([^/]+)#', $requestUri, $matches)) {
        $firstSegment = $matches[1];
        if (in_array($firstSegment, $knownProjects)) {
            $projectName = $firstSegment;
        }
    }
    
    // SEMPRE usar Up.Bal-es como padrão, mesmo se detectar Up.BaloesV3
    if ($projectName) {
        // Se detectou Up.BaloesV3 ou qualquer outro nome, sempre usar Up.Bal-es
        $projectName = 'Up.Bal-es';
        $baseUrl = $protocol . '://' . $host . '/' . $projectName . '/';
    } else {
        // Fallback padrão - sempre usar Up.Bal-es
        $baseUrl = $protocol . '://' . $host . '/Up.Bal-es/';
    }
    
    // Garantir que não há duplicação de caminho ou localhost
    $baseUrl = preg_replace('#([^:])//+#', '$1/', $baseUrl);
    // Remover qualquer duplicação de localhost
    $baseUrl = preg_replace('#localhost/localhost#', 'localhost', $baseUrl);
    $baseUrl = preg_replace('#(https?://localhost)/localhost#', '$1', $baseUrl);
}
$baseUrl = ensureHttps($baseUrl);

$urls = [
    'base' => $baseUrl,
    'login' => 'pages/login.html',
    'dashboard' => 'pages/dashboard.html',
    'reset_password' => 'pages/reset-password.html'
];

// Configurações JWT - Centralizadas
$jwt_config = [
    'secret' => $_ENV['JWT_SECRET'] ?? 'your_jwt_secret_key_here',
    'expiration' => (int)($_ENV['JWT_EXPIRATION'] ?? 3600) // 1 hora (1 * 60 * 60 = 3600 segundos)
];

// Configurações Google OAuth - Centralizadas
$google_config = [
    'client_id' => $_ENV['GOOGLE_CLIENT_ID'] ?? '',
    'client_secret' => $_ENV['GOOGLE_CLIENT_SECRET'] ?? '',
    'redirect_uri' => $_ENV['GOOGLE_REDIRECT_URI'] ?? $urls['base'] . 'services/google-callback.php'
];

// Inicializar sessão se ainda não estiver iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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

// Enviar email usando PHPMailer com SMTP (suporta Gmail, Hotmail/Outlook, etc)
function sendEmail($to, $subject, $htmlBody, $textBody = null) {
    global $email_config;
    
    // Verificar se PHPMailer está disponível e carregar autoload se necessário
    $autoloadPath = __DIR__ . '/../vendor/autoload.php';
    if (file_exists($autoloadPath)) {
        require_once $autoloadPath;
    }
    
    if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        error_log("PHPMailer não encontrado. Execute: composer install");
        return false;
    }
    
    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    
    try {
        // Configurações do servidor SMTP
        $mail->isSMTP();
        $mail->Host = $email_config['smtp_host'] ?? 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = $email_config['smtp_username'] ?? '';
        $mail->Password = $email_config['smtp_password'] ?? '';
        $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS; // TLS
        $mail->Port = $email_config['smtp_port'] ?? 587;
        $mail->CharSet = 'UTF-8';
        
        // Remover validação de certificado SSL em desenvolvimento (não recomendado em produção)
        if (ENVIRONMENT === 'development') {
            $mail->SMTPOptions = [
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ];
        }
        
        // Remetente
        $fromEmail = $email_config['from_email'] ?? 'noreply@upbaloes.com';
        $fromName = $email_config['from_name'] ?? 'Up.Baloes';
        $mail->setFrom($fromEmail, $fromName);
        
        // Destinatário
        $mail->addAddress($to);
        
        // Responder para
        $replyTo = $email_config['reply_to'] ?? $fromEmail;
        $mail->addReplyTo($replyTo, $fromName);
        
        // Conteúdo
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $htmlBody;
        
        // Versão texto plano (opcional)
        if ($textBody !== null && trim($textBody) !== '') {
            $mail->AltBody = $textBody;
        }
        
        // Enviar email
        $mail->send();
        return true;
        
    } catch (\PHPMailer\PHPMailer\Exception $e) {
        error_log("Erro ao enviar email para {$to}: {$mail->ErrorInfo}");
        return false;
    }
}

// Resposta JSON padronizada (apenas se não existir)
if (!function_exists('jsonResponse')) {
    function jsonResponse($data, $status_code = 200) {
        http_response_code($status_code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Resposta de erro (apenas se não existir)
if (!function_exists('errorResponse')) {
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
}

// Resposta de sucesso (apenas se não existir)
if (!function_exists('successResponse')) {
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
}

// Inicializar configurações globais (apenas se não for CLI)
if (php_sapi_name() !== 'cli' && session_status() === PHP_SESSION_NONE) {
    ini_set('session.name', $security_config['session_name']);
    ini_set('session.cookie_lifetime', $security_config['session_lifetime']);
    ini_set('session.gc_maxlifetime', $security_config['session_lifetime']); // Tempo de vida dos dados da sessão no servidor
    ini_set('session.cookie_secure', ENVIRONMENT === 'production');
    ini_set('session.cookie_httponly', true);
    session_start();
}

// Configurar timezone
date_default_timezone_set('America/Sao_Paulo');

// Configurar headers básicos (apenas se não for CLI)
if (php_sapi_name() !== 'cli') {
    // Não definir Content-Type aqui, deixar cada arquivo definir conforme necessário
    // header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    // X-Frame-Options será definido por cada arquivo conforme necessário
    // Páginas públicas podem usar SAMEORIGIN, APIs podem usar DENY
    header('X-XSS-Protection: 1; mode=block');
    
    // Configurar CORS
    setupCORS($cors_config);
}

// Criar diretórios necessários se não existirem
$directories = [
    '../logs/',
    '../uploads/',
    '../temp/'
];

foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}
?>