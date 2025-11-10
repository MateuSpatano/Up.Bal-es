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
    // Conectar ao banco de dados
    $pdo = new PDO(
        "mysql:host={$database_config['host']};dbname={$database_config['dbname']};charset=utf8mb4",
        $database_config['username'],
        $database_config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );

    // Buscar dados de contato do primeiro decorador ativo (ou admin)
    // Por padrão, buscar o primeiro decorador ativo ou admin
    $stmt = $pdo->prepare("
        SELECT 
            email,
            email_comunicacao,
            whatsapp,
            instagram,
            telefone
        FROM usuarios 
        WHERE (is_admin = 1 OR perfil = 'decorator') 
        AND is_active = 1 
        ORDER BY is_admin DESC, created_at ASC 
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
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar informações de contato'
    ]);
} catch (Exception $e) {
    error_log('Erro geral ao buscar contatos: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);
}







