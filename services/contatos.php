<?php
/**
 * Serviço de Contatos - Up.Baloes
 * Endpoint para buscar informações de contato do decorador principal
 */

// Desabilitar exibição de erros para evitar HTML na resposta JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Configurar cabeçalhos para JSON ANTES de qualquer saída
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Verificar método da requisição
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar se é GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

try {
    // Incluir configuração do banco de dados
    require_once __DIR__ . '/config.php';

    // Verificar se $database_config está disponível
    if (!isset($database_config)) {
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

    // Conectar ao banco de dados
    $pdo = getDatabaseConnection($database_config);

    // Buscar dados de contato
    $stmt = $pdo->prepare("
        SELECT 
            email,
            COALESCE(email_comunicacao, email) as email_comunicacao,
            COALESCE(whatsapp, telefone, '') as whatsapp,
            COALESCE(instagram, '') as instagram,
            COALESCE(telefone, '') as telefone
        FROM usuarios 
        WHERE perfil IN ('admin', 'decorator') 
        AND ativo = 1
        ORDER BY perfil = 'admin' DESC, created_at ASC 
        LIMIT 1
    ");
    
    $stmt->execute();
    $contact = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Se não encontrou, retornar valores vazios
    if (!$contact) {
        echo json_encode([
            'success' => true,
            'data' => [
                'email' => '',
                'email_link' => '',
                'whatsapp' => '',
                'whatsapp_link' => '',
                'instagram' => '',
                'instagram_link' => ''
            ]
        ]);
        exit();
    }
    
    // Preparar dados de resposta
    $email = !empty($contact['email_comunicacao']) ? $contact['email_comunicacao'] : ($contact['email'] ?? '');
    $whatsapp = $contact['whatsapp'] ?? '';
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
    echo json_encode([
        'success' => true,
        'data' => [
            'email' => $email,
            'email_link' => !empty($email) ? 'mailto:' . $email : '',
            'whatsapp' => $whatsapp,
            'whatsapp_link' => $whatsappLink,
            'instagram' => $instagram,
            'instagram_link' => $instagramLink
        ]
    ]);
    
} catch (PDOException $e) {
    error_log('Erro PDO em contatos.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar informações de contato'
    ]);
    
} catch (Exception $e) {
    error_log('Erro Exception em contatos.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);
}
