<?php
/**
 * Serviço de Contatos - Up.Baloes
 * Endpoint para buscar informações de contato do decorador principal
 */

// Iniciar output buffering imediatamente
ob_start();

// Desabilitar exibição de erros na saída (mas logar)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Função para retornar resposta JSON de erro
function sendErrorResponse($message, $code = 500, $details = null) {
    ob_end_clean();
    if (!headers_sent()) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
    }
    
    $response = [
        'success' => false,
        'message' => $message
    ];
    
    if ($details !== null && (defined('ENVIRONMENT') && ENVIRONMENT === 'development')) {
        $response['details'] = $details;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

// Função para retornar resposta JSON de sucesso
function sendSuccessResponse($data) {
    ob_end_clean();
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
    }
    
    echo json_encode([
        'success' => true,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Verificar método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Método não permitido', 405);
}

// Tentar incluir config.php
try {
    $configPath = __DIR__ . '/config.php';
    if (!file_exists($configPath)) {
        sendErrorResponse('Arquivo de configuração não encontrado', 500, ['path' => $configPath]);
    }
    
    require_once $configPath;
} catch (Throwable $e) {
    sendErrorResponse(
        'Erro ao carregar configurações',
        500,
        ['error' => $e->getMessage(), 'file' => basename($e->getFile()), 'line' => $e->getLine()]
    );
}

// Limpar qualquer output do config.php
ob_clean();

// Verificar se $database_config existe
if (!isset($database_config)) {
    // Tentar obter do escopo global
    if (isset($GLOBALS['database_config'])) {
        $database_config = $GLOBALS['database_config'];
    } else {
        // Criar configuração padrão
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
            ]
        ];
    }
}

// Verificar se função getDatabaseConnection existe
if (!function_exists('getDatabaseConnection')) {
    sendErrorResponse(
        'Função getDatabaseConnection não encontrada',
        500,
        ['hint' => 'Verifique se config.php foi incluído corretamente']
    );
}

// Conectar ao banco de dados
try {
    $pdo = getDatabaseConnection($database_config);
} catch (Exception $e) {
    error_log('Erro de conexão com banco de dados: ' . $e->getMessage());
    sendErrorResponse(
        'Erro ao conectar ao banco de dados',
        500,
        defined('ENVIRONMENT') && ENVIRONMENT === 'development' ? ['error' => $e->getMessage()] : null
    );
}

// Buscar dados de contato
try {
    // Primeira tentativa: query completa
    $query = "
        SELECT 
            email,
            COALESCE(email_comunicacao, email) as email_comunicacao,
            COALESCE(whatsapp, telefone, '') as whatsapp,
            COALESCE(instagram, '') as instagram,
            COALESCE(telefone, '') as telefone,
            perfil
        FROM usuarios 
        WHERE (perfil = 'admin' OR perfil = 'decorator') 
        AND ativo = 1
        ORDER BY CASE WHEN perfil = 'admin' THEN 0 ELSE 1 END, created_at ASC 
        LIMIT 1
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $contact = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Se não encontrou, tentar query alternativa mais simples
    if (!$contact) {
        $queryAlt = "
            SELECT 
                email,
                email as email_comunicacao,
                COALESCE(whatsapp, telefone, '') as whatsapp,
                COALESCE(instagram, '') as instagram,
                COALESCE(telefone, '') as telefone
            FROM usuarios 
            WHERE perfil IN ('admin', 'decorator') 
            AND ativo = 1
            LIMIT 1
        ";
        
        $stmt = $pdo->prepare($queryAlt);
        $stmt->execute();
        $contact = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
} catch (PDOException $e) {
    error_log('Erro na query SQL: ' . $e->getMessage());
    error_log('Query: ' . ($query ?? 'não definida'));
    
    // Se a primeira query falhou, tentar query alternativa
    if (!isset($queryAlt)) {
        try {
            $queryAlt = "
                SELECT 
                    email,
                    email as email_comunicacao,
                    COALESCE(whatsapp, telefone, '') as whatsapp,
                    COALESCE(instagram, '') as instagram,
                    COALESCE(telefone, '') as telefone
                FROM usuarios 
                WHERE perfil IN ('admin', 'decorator') 
                AND ativo = 1
                LIMIT 1
            ";
            
            $stmt = $pdo->prepare($queryAlt);
            $stmt->execute();
            $contact = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e2) {
            error_log('Query alternativa também falhou: ' . $e2->getMessage());
            sendErrorResponse(
                'Erro ao buscar informações de contato',
                500,
                defined('ENVIRONMENT') && ENVIRONMENT === 'development' ? ['error' => $e2->getMessage()] : null
            );
        }
    } else {
        sendErrorResponse(
            'Erro ao buscar informações de contato',
            500,
            defined('ENVIRONMENT') && ENVIRONMENT === 'development' ? ['error' => $e->getMessage()] : null
        );
    }
}

// Se não encontrou nenhum contato, retornar valores vazios
if (!$contact) {
    sendSuccessResponse([
        'email' => '',
        'email_link' => '',
        'whatsapp' => '',
        'whatsapp_link' => '',
        'instagram' => '',
        'instagram_link' => ''
    ]);
}

// Preparar dados de resposta
$email = !empty($contact['email_comunicacao']) ? $contact['email_comunicacao'] : ($contact['email'] ?? '');
$whatsapp = $contact['whatsapp'] ?? $contact['telefone'] ?? '';
$instagram = $contact['instagram'] ?? '';

// Formatar WhatsApp para link
$whatsappLink = '';
if (!empty($whatsapp)) {
    $whatsappNumbers = preg_replace('/[^0-9]/', '', $whatsapp);
    if (!empty($whatsappNumbers)) {
        $whatsappLink = 'https://wa.me/' . $whatsappNumbers;
    }
}

// Formatar Instagram para link
$instagramLink = '';
if (!empty($instagram)) {
    if (strpos($instagram, 'http') === 0) {
        $instagramLink = $instagram;
    } else {
        $instagramHandle = ltrim($instagram, '@');
        if (!empty($instagramHandle)) {
            $instagramLink = 'https://instagram.com/' . $instagramHandle;
        }
    }
}

// Retornar resposta de sucesso
sendSuccessResponse([
    'email' => $email,
    'email_link' => !empty($email) ? 'mailto:' . $email : '',
    'whatsapp' => $whatsapp,
    'whatsapp_link' => $whatsappLink,
    'instagram' => $instagram,
    'instagram_link' => $instagramLink
]);
