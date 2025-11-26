<?php
/**
 * Serviço de Contatos - Up.Baloes
 * Endpoint para buscar informações de contato do decorador principal
 */

// Habilitar exibição de erros em desenvolvimento
error_reporting(E_ALL);
ini_set('display_errors', 0); // Não exibir erros diretamente, mas logar
ini_set('log_errors', 1);

// Incluir configurações primeiro (antes de qualquer header)
// Usar output buffering para evitar problemas com headers
ob_start();

try {
    require_once __DIR__ . '/config.php';
} catch (Throwable $e) {
    ob_end_clean();
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao carregar configurações: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Limpar qualquer saída do config.php
ob_end_clean();

// Configurações de segurança (após incluir config.php)
// Definir headers apenas se ainda não foram enviados
if (!headers_sent()) {
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
}

// Verificar se é uma requisição GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

try {
    // Verificar se $database_config está disponível
    if (!isset($database_config)) {
        // Se não estiver disponível, tentar obter do escopo global ou recriar
        if (isset($GLOBALS['database_config'])) {
            $database_config = $GLOBALS['database_config'];
        } else {
            // Recriar configuração se necessário
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
    
    // Verificar se a função getDatabaseConnection existe
    if (!function_exists('getDatabaseConnection')) {
        throw new Exception('Função getDatabaseConnection não encontrada. Verifique se config.php foi incluído corretamente.');
    }
    
    // Conectar ao banco de dados usando função centralizada
    try {
        $pdo = getDatabaseConnection($database_config);
    } catch (Exception $e) {
        error_log('Erro de conexão com banco de dados: ' . $e->getMessage());
        throw new Exception('Erro ao conectar ao banco de dados. Verifique as configurações.');
    }

    // Buscar dados de contato do primeiro decorador ativo (ou admin)
    // Usar campos que sabemos que existem na tabela
    // Query simplificada para evitar problemas com campos que podem não existir
    try {
        $stmt = $pdo->prepare("
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
        ");
        
        $stmt->execute();
        $contact = $stmt->fetch();
    } catch (PDOException $e) {
        error_log('Erro na query SQL de contatos: ' . $e->getMessage());
        // Tentar query mais simples sem campos opcionais
        try {
            $stmt = $pdo->prepare("
                SELECT 
                    email,
                    email as email_comunicacao,
                    COALESCE(whatsapp, telefone, '') as whatsapp,
                    COALESCE(instagram, '') as instagram,
                    COALESCE(telefone, '') as telefone,
                    perfil
                FROM usuarios 
                WHERE perfil IN ('admin', 'decorator') 
                AND ativo = 1
                ORDER BY perfil = 'admin' DESC, created_at ASC 
                LIMIT 1
            ");
            $stmt->execute();
            $contact = $stmt->fetch();
        } catch (PDOException $e2) {
            error_log('Erro na query alternativa de contatos: ' . $e2->getMessage());
            throw new Exception('Erro ao executar consulta no banco de dados: ' . $e2->getMessage());
        }
    }
    
    if (!$contact) {
        // Se não encontrar, retornar valores padrão vazios
        echo json_encode([
            'success' => true,
            'data' => [
                'email' => '',
                'whatsapp' => '',
                'instagram' => ''
            ]
        ]);
        exit;
    }
    
    // Preparar dados de resposta
    $email = !empty($contact['email_comunicacao']) ? $contact['email_comunicacao'] : $contact['email'];
    $whatsapp = $contact['whatsapp'] ?? $contact['telefone'] ?? '';
    $instagram = $contact['instagram'] ?? '';
    
    // Formatar WhatsApp para link
    $whatsappLink = '';
    if (!empty($whatsapp)) {
        $whatsappNumbers = preg_replace('/[^0-9]/', '', $whatsapp);
        $whatsappLink = 'https://wa.me/' . $whatsappNumbers;
    }
    
    // Formatar Instagram para link
    $instagramLink = '';
    if (!empty($instagram)) {
        // Se já começar com http, usar direto, senão adicionar https://instagram.com/
        if (strpos($instagram, 'http') === 0) {
            $instagramLink = $instagram;
        } else {
            // Remover @ se houver
            $instagramHandle = ltrim($instagram, '@');
            $instagramLink = 'https://instagram.com/' . $instagramHandle;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'email' => $email,
            'email_link' => 'mailto:' . $email,
            'whatsapp' => $whatsapp,
            'whatsapp_link' => $whatsappLink,
            'instagram' => $instagram,
            'instagram_link' => $instagramLink
        ]
    ]);
    
} catch (PDOException $e) {
    error_log('Erro ao buscar contatos (PDOException): ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    error_log('Código do erro: ' . $e->getCode());
    
    // Garantir que os headers estão corretos
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    
    // Em desenvolvimento, retornar mais detalhes do erro
    $errorMessage = 'Erro ao buscar informações de contato';
    $errorDetails = [];
    
    if (defined('ENVIRONMENT') && ENVIRONMENT === 'development') {
        $errorMessage .= ': ' . $e->getMessage();
        $errorDetails = [
            'code' => $e->getCode(),
            'file' => basename($e->getFile()),
            'line' => $e->getLine()
        ];
    }
    
    $response = [
        'success' => false,
        'message' => $errorMessage
    ];
    
    if (!empty($errorDetails)) {
        $response['details'] = $errorDetails;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('Erro geral ao buscar contatos (Exception): ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    
    // Garantir que os headers estão corretos
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    
    // Em desenvolvimento, retornar mais detalhes do erro
    $errorMessage = 'Erro interno do servidor';
    $errorDetails = [];
    
    if (defined('ENVIRONMENT') && ENVIRONMENT === 'development') {
        $errorMessage .= ': ' . $e->getMessage();
        $errorDetails = [
            'file' => basename($e->getFile()),
            'line' => $e->getLine()
        ];
    }
    
    $response = [
        'success' => false,
        'message' => $errorMessage
    ];
    
    if (!empty($errorDetails)) {
        $response['details'] = $errorDetails;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log('Erro fatal ao buscar contatos (Throwable): ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    
    // Garantir que os headers estão corretos
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    
    $errorMessage = 'Erro fatal no servidor';
    if (defined('ENVIRONMENT') && ENVIRONMENT === 'development') {
        $errorMessage .= ': ' . $e->getMessage();
    }
    
    echo json_encode([
        'success' => false,
        'message' => $errorMessage
    ], JSON_UNESCAPED_UNICODE);
}












