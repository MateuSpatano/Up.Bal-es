<?php
/**
 * Serviço de Contatos - Up.Baloes
 * Endpoint para buscar informações de contato do decorador principal
 */

// Configurações de segurança
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Incluir configurações
require_once __DIR__ . '/config.php';

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
    $pdo = getDatabaseConnection($database_config);

    // Buscar dados de contato do primeiro decorador ativo (ou admin)
    // Usar campos que sabemos que existem na tabela
    $stmt = $pdo->prepare("
        SELECT 
            email,
            email_comunicacao,
            whatsapp,
            instagram,
            telefone,
            perfil
        FROM usuarios 
        WHERE (perfil = 'admin' OR perfil = 'decorator') 
        AND ativo = 1
        ORDER BY CASE WHEN perfil = 'admin' THEN 0 ELSE 1 END, created_at ASC 
        LIMIT 1
    ");
    
    $stmt->execute();
    $contact = $stmt->fetch();
    
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
    error_log('Erro ao buscar contatos: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    http_response_code(500);
    
    // Em desenvolvimento, retornar mais detalhes do erro
    $errorMessage = 'Erro ao buscar informações de contato';
    if (defined('ENVIRONMENT') && ENVIRONMENT === 'development') {
        $errorMessage .= ': ' . $e->getMessage();
    }
    
    echo json_encode([
        'success' => false,
        'message' => $errorMessage
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log('Erro geral ao buscar contatos: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    http_response_code(500);
    
    // Em desenvolvimento, retornar mais detalhes do erro
    $errorMessage = 'Erro interno do servidor';
    if (defined('ENVIRONMENT') && ENVIRONMENT === 'development') {
        $errorMessage .= ': ' . $e->getMessage();
    }
    
    echo json_encode([
        'success' => false,
        'message' => $errorMessage
    ], JSON_UNESCAPED_UNICODE);
}












