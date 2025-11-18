<?php
/**
 * Serviço de Gerenciamento de Tickets de Suporte
 * Up.Baloes - Sistema de Gestão de Decoração com Balões
 */

// Configurações de CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Permitir requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configurações de sessão
session_start();

// Incluir configuração do banco de dados
require_once __DIR__ . '/config.php';

// Inicializar conexão com banco de dados
$pdo = getDatabaseConnection($database_config);

// Criar tabela se não existir
createSupportTicketsTable($pdo);

// Verificar método da requisição
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
        exit();
    }
    
    $action = $input['action'] ?? '';
    
    try {
        switch ($action) {
            case 'create':
                createTicket($pdo, $input);
                break;
                
            case 'list':
                listTickets($pdo, $input);
                break;
                
            case 'update_status':
                updateTicketStatus($pdo, $input);
                break;
                
            case 'delete':
                deleteTicket($pdo, $input);
                break;
                
            case 'get':
                getTicket($pdo, $input);
                break;
                
            default:
                throw new Exception('Ação não reconhecida');
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
}

/**
 * Criar tabela de tickets de suporte
 */
function createSupportTicketsTable($pdo) {
    try {
        $sql = "
            CREATE TABLE IF NOT EXISTS support_tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                attachment TEXT NULL,
                decorator_id INT NOT NULL,
                decorator_name VARCHAR(255) NOT NULL,
                decorator_email VARCHAR(255) NOT NULL,
                status ENUM('novo', 'em_analise', 'resolvido', 'cancelado') DEFAULT 'novo',
                admin_response TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_decorator_id (decorator_id),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at),
                FOREIGN KEY (decorator_id) REFERENCES usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ";
        
        $pdo->exec($sql);
    } catch (PDOException $e) {
        error_log('Erro ao criar tabela de tickets: ' . $e->getMessage());
    }
}

/**
 * Criar novo ticket
 */
function createTicket($pdo, $data) {
    // Validar dados obrigatórios
    if (empty($data['title'])) {
        throw new Exception('Título é obrigatório');
    }
    
    if (empty($data['description'])) {
        throw new Exception('Descrição é obrigatória');
    }
    
    // Obter ID do decorador da sessão ou dos dados
    $decoratorId = null;
    if (isset($_SESSION['user_id']) && $_SESSION['user_role'] === 'decorator') {
        $decoratorId = $_SESSION['user_id'];
    } elseif (isset($data['decorator_id'])) {
        $decoratorId = $data['decorator_id'];
    } else {
        throw new Exception('Decorador não identificado');
    }
    
    // Obter dados do decorador
    $stmt = $pdo->prepare("SELECT nome, email FROM usuarios WHERE id = ?");
    $stmt->execute([$decoratorId]);
    $decorator = $stmt->fetch();
    
    if (!$decorator) {
        throw new Exception('Decorador não encontrado');
    }
    
    // Inserir ticket
    $stmt = $pdo->prepare("
        INSERT INTO support_tickets (
            title, description, attachment, decorator_id, 
            decorator_name, decorator_email, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'novo')
    ");
    
    $stmt->execute([
        $data['title'],
        $data['description'],
        $data['attachment'] ?? null,
        $decoratorId,
        $data['decorator_name'] ?? $decorator['nome'],
        $data['decorator_email'] ?? $decorator['email']
    ]);
    
    $ticketId = $pdo->lastInsertId();
    
    // Buscar ticket criado
    $stmt = $pdo->prepare("SELECT * FROM support_tickets WHERE id = ?");
    $stmt->execute([$ticketId]);
    $ticket = $stmt->fetch();
    
    // Formatar resposta
    $ticket['created_at'] = $ticket['created_at'];
    $ticket['updated_at'] = $ticket['updated_at'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Ticket criado com sucesso',
        'ticket' => $ticket
    ]);
}

/**
 * Listar tickets
 */
function listTickets($pdo, $data) {
    // Verificar se é admin
    if (!isset($_SESSION['admin_id'])) {
        // Se não for admin, retornar apenas tickets do decorador logado
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('Não autorizado');
        }
        
        $stmt = $pdo->prepare("
            SELECT * FROM support_tickets 
            WHERE decorator_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$_SESSION['user_id']]);
    } else {
        // Admin vê todos os tickets
        $statusFilter = $data['status'] ?? null;
        
        if ($statusFilter) {
            $stmt = $pdo->prepare("
                SELECT * FROM support_tickets 
                WHERE status = ? 
                ORDER BY created_at DESC
            ");
            $stmt->execute([$statusFilter]);
        } else {
            $stmt = $pdo->prepare("
                SELECT * FROM support_tickets 
                ORDER BY created_at DESC
            ");
            $stmt->execute();
        }
    }
    
    $tickets = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'tickets' => $tickets,
        'count' => count($tickets)
    ]);
}

/**
 * Atualizar status do ticket
 */
function updateTicketStatus($pdo, $data) {
    // Verificar se é admin
    if (!isset($_SESSION['admin_id'])) {
        throw new Exception('Apenas administradores podem atualizar status');
    }
    
    if (empty($data['ticket_id'])) {
        throw new Exception('ID do ticket é obrigatório');
    }
    
    if (empty($data['status'])) {
        throw new Exception('Status é obrigatório');
    }
    
    $validStatuses = ['novo', 'em_analise', 'resolvido', 'cancelado'];
    if (!in_array($data['status'], $validStatuses)) {
        throw new Exception('Status inválido');
    }
    
    $stmt = $pdo->prepare("
        UPDATE support_tickets 
        SET status = ?, 
            admin_response = ?,
            updated_at = NOW()
        WHERE id = ?
    ");
    
    $stmt->execute([
        $data['status'],
        $data['admin_response'] ?? null,
        $data['ticket_id']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Status atualizado com sucesso'
    ]);
}

/**
 * Deletar ticket
 */
function deleteTicket($pdo, $data) {
    // Verificar se é admin
    if (!isset($_SESSION['admin_id'])) {
        throw new Exception('Apenas administradores podem deletar tickets');
    }
    
    if (empty($data['ticket_id'])) {
        throw new Exception('ID do ticket é obrigatório');
    }
    
    $stmt = $pdo->prepare("DELETE FROM support_tickets WHERE id = ?");
    $stmt->execute([$data['ticket_id']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Ticket deletado com sucesso'
    ]);
}

/**
 * Obter ticket específico
 */
function getTicket($pdo, $data) {
    if (empty($data['ticket_id'])) {
        throw new Exception('ID do ticket é obrigatório');
    }
    
    $stmt = $pdo->prepare("SELECT * FROM support_tickets WHERE id = ?");
    $stmt->execute([$data['ticket_id']]);
    $ticket = $stmt->fetch();
    
    if (!$ticket) {
        throw new Exception('Ticket não encontrado');
    }
    
    // Verificar permissão
    if (!isset($_SESSION['admin_id'])) {
        if (!isset($_SESSION['user_id']) || $ticket['decorator_id'] != $_SESSION['user_id']) {
            throw new Exception('Não autorizado');
        }
    }
    
    echo json_encode([
        'success' => true,
        'ticket' => $ticket
    ]);
}
?>

