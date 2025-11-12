<?php
/**
 * Serviço de Gerenciamento de Datas Bloqueadas
 * Up.Baloes - Sistema de Gestão de Decoração com Balões
 */

// Incluir configuração do banco de dados
require_once __DIR__ . '/config.php';

// Inicializar conexão com banco de dados
$pdo = getDatabaseConnection($database_config);

// Configurar cabeçalhos para JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Verificar método da requisição
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

// Obter dados da requisição
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit();
}

$action = $input['action'] ?? '';

try {
    switch ($action) {
        case 'add':
            addBlockedDate($input);
            break;
            
        case 'list':
            listBlockedDates();
            break;
            
        case 'remove':
            removeBlockedDate($input);
            break;
            
        case 'check':
            checkBlockedDate($input);
            break;
            
        default:
            throw new Exception('Ação não reconhecida');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * Adicionar data bloqueada
 */
function addBlockedDate($data) {
    global $pdo;
    
    // Validar dados obrigatórios
    if (empty($data['blocked_date'])) {
        throw new Exception('Data bloqueada é obrigatória');
    }
    
    $userId = getCurrentUserId();
    $blockedDate = $data['blocked_date'];
    $reason = $data['reason'] ?? 'Data bloqueada pelo decorador';
    $isRecurring = isset($data['is_recurring']) ? (bool)$data['is_recurring'] : false;
    
    // Validar formato da data
    if (!validateDate($blockedDate)) {
        throw new Exception('Formato de data inválido');
    }
    
    // Verificar se a data não é no passado
    if (strtotime($blockedDate) < strtotime(date('Y-m-d'))) {
        throw new Exception('Não é possível bloquear datas no passado');
    }
    
    // Iniciar transação
    $pdo->beginTransaction();
    
    try {
        // Verificar se a data já está bloqueada
        $stmt = $pdo->prepare("SELECT id FROM decorator_blocked_dates WHERE user_id = ? AND blocked_date = ?");
        $stmt->execute([$userId, $blockedDate]);
        
        if ($stmt->fetch()) {
            throw new Exception('Esta data já está bloqueada');
        }
        
        // Inserir nova data bloqueada
        $stmt = $pdo->prepare("
            INSERT INTO decorator_blocked_dates (user_id, blocked_date, reason, is_recurring, created_at, updated_at) 
            VALUES (?, ?, ?, ?, NOW(), NOW())
        ");
        
        $stmt->execute([$userId, $blockedDate, $reason, $isRecurring]);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Data bloqueada com sucesso',
            'data' => [
                'id' => $pdo->lastInsertId(),
                'blocked_date' => $blockedDate,
                'reason' => $reason,
                'is_recurring' => $isRecurring
            ]
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

/**
 * Listar datas bloqueadas
 */
function listBlockedDates() {
    global $pdo;
    
    $userId = getCurrentUserId();
    
    $stmt = $pdo->prepare("
        SELECT id, blocked_date, reason, is_recurring, created_at, updated_at
        FROM decorator_blocked_dates 
        WHERE user_id = ? 
        ORDER BY blocked_date ASC
    ");
    
    $stmt->execute([$userId]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Processar datas recorrentes para o próximo ano
    $processedResults = [];
    foreach ($results as $row) {
        $processedResults[] = $row;
        
        // Se for recorrente, adicionar para o próximo ano
        if ($row['is_recurring']) {
            $nextYear = date('Y', strtotime($row['blocked_date'])) + 1;
            $nextYearDate = date('Y-m-d', strtotime($nextYear . '-' . date('m-d', strtotime($row['blocked_date']))));
            
            // Só adicionar se for no futuro
            if (strtotime($nextYearDate) > strtotime(date('Y-m-d'))) {
                $processedResults[] = [
                    'id' => $row['id'] . '_recurring',
                    'blocked_date' => $nextYearDate,
                    'reason' => $row['reason'] . ' (Recorrente)',
                    'is_recurring' => true,
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $processedResults
    ]);
}

/**
 * Remover data bloqueada
 */
function removeBlockedDate($data) {
    global $pdo;
    
    if (empty($data['id'])) {
        throw new Exception('ID da data bloqueada é obrigatório');
    }
    
    $userId = getCurrentUserId();
    $blockedDateId = $data['id'];
    
    // Verificar se a data bloqueada pertence ao usuário
    $stmt = $pdo->prepare("SELECT id FROM decorator_blocked_dates WHERE id = ? AND user_id = ?");
    $stmt->execute([$blockedDateId, $userId]);
    
    if (!$stmt->fetch()) {
        throw new Exception('Data bloqueada não encontrada ou não pertence ao usuário');
    }
    
    // Remover data bloqueada
    $stmt = $pdo->prepare("DELETE FROM decorator_blocked_dates WHERE id = ? AND user_id = ?");
    $stmt->execute([$blockedDateId, $userId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Data bloqueada removida com sucesso'
    ]);
}

/**
 * Verificar se uma data está bloqueada
 */
function checkBlockedDate($data) {
    global $pdo;
    
    if (empty($data['date'])) {
        throw new Exception('Data para verificação é obrigatória');
    }
    
    $userId = getCurrentUserId();
    $checkDate = $data['date'];
    
    if (!validateDate($checkDate)) {
        throw new Exception('Formato de data inválido');
    }
    
    // Verificar se a data está bloqueada (incluindo datas recorrentes)
    $stmt = $pdo->prepare("
        SELECT id, reason, is_recurring
        FROM decorator_blocked_dates 
        WHERE user_id = ? 
        AND (
            blocked_date = ? 
            OR (is_recurring = 1 AND DATE_FORMAT(blocked_date, '%m-%d') = DATE_FORMAT(?, '%m-%d'))
        )
    ");
    
    $stmt->execute([$userId, $checkDate, $checkDate]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'blocked' => true,
            'reason' => $result['reason'],
            'is_recurring' => $result['is_recurring']
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'blocked' => false
        ]);
    }
}

/**
 * Validar formato de data
 */
function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

/**
 * Obter ID do usuário atual
 */
function getCurrentUserId() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (isset($_SESSION['user_id'])) {
        return (int) $_SESSION['user_id'];
    }
    
    // Se não houver sessão, retornar erro
    throw new Exception('Usuário não autenticado');
}

/**
 * Criar tabela de datas bloqueadas se não existir
 */
function createBlockedDatesTable() {
    global $pdo;
    
    $sql = "
        CREATE TABLE IF NOT EXISTS decorator_blocked_dates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            blocked_date DATE NOT NULL,
            reason VARCHAR(255) DEFAULT 'Data bloqueada pelo decorador',
            is_recurring BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_blocked_date (blocked_date),
            UNIQUE KEY unique_user_blocked_date (user_id, blocked_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    $pdo->exec($sql);
}

// Criar tabela se não existir
createBlockedDatesTable();
?>