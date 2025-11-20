<?php
/**
 * Serviço de Administração - Up.Baloes
 * Gerencia todas as operações administrativas
 */

// Configurações de segurança
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Permitir requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir configurações
require_once __DIR__ . '/config.php';

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Método não permitido', 405);
}

try {
    // Obter dados da requisição
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        errorResponse('Dados JSON inválidos', 400);
    }
    
    $action = $input['action'] ?? '';
    
    // Verificar autenticação admin para ações que requerem
    $requiresAuth = ['get_users', 'get_dashboard_data', 'get_user', 'update_user', 
                     'create_decorator', 'approve_decorator', 'toggle_user_status', 
                     'delete_user', 'get_admin_profile', 'update_admin_profile', 
                     'update_admin_password', 'get_settings', 'update_settings'];
    
    if (in_array($action, $requiresAuth)) {
        if (!isset($_SESSION['admin_id'])) {
            errorResponse('Não autorizado. Faça login como administrador.', 401);
        }
    }
    
    switch ($action) {
        case 'get_users':
            handleGetUsers($input);
            break;
            
        case 'get_dashboard_data':
            handleGetDashboardData();
            break;
            
        case 'get_user':
            handleGetUser($input);
            break;
            
        case 'update_user':
            handleUpdateUser($input);
            break;
            
        case 'create_decorator':
            handleCreateDecorator($input);
            break;
            
        case 'approve_decorator':
            handleApproveDecorator($input);
            break;
            
        case 'toggle_user_status':
            handleToggleUserStatus($input);
            break;
            
        case 'delete_user':
            handleDeleteUser($input);
            break;
            
        case 'get_admin_profile':
            handleGetAdminProfile();
            break;
            
        case 'update_admin_profile':
            handleUpdateAdminProfile($input);
            break;
            
        case 'update_admin_password':
            handleUpdateAdminPassword($input);
            break;
            
        case 'get_settings':
            handleGetSettings();
            break;
            
        case 'update_settings':
            handleUpdateSettings($input);
            break;
            
        default:
            errorResponse('Ação não reconhecida: ' . $action, 400);
    }
    
} catch (Exception $e) {
    error_log('Erro em admin.php: ' . $e->getMessage());
    errorResponse('Erro interno do servidor: ' . $e->getMessage(), 500);
}

/**
 * Obter lista de usuários
 */
function handleGetUsers($input) {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $search = $input['search'] ?? '';
        $type = $input['type'] ?? '';
        $status = $input['status'] ?? '';
        $page = max(1, intval($input['page'] ?? 1));
        $limit = max(1, min(100, intval($input['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;
        
        $where = [];
        $params = [];
        
        if (!empty($search)) {
            $where[] = "(nome LIKE ? OR email LIKE ?)";
            $searchParam = "%{$search}%";
            $params[] = $searchParam;
            $params[] = $searchParam;
        }
        
        if (!empty($type)) {
            $where[] = "perfil = ?";
            $params[] = $type;
        }
        
        if (!empty($status)) {
            if ($status === 'active') {
                $where[] = "ativo = 1";
            } elseif ($status === 'inactive') {
                $where[] = "ativo = 0";
            } elseif ($status === 'pending_approval') {
                $where[] = "perfil = 'decorator' AND aprovado_por_admin = 0";
            }
        }
        
        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        // Contar total
        $countSql = "SELECT COUNT(*) as total FROM usuarios {$whereClause}";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = $countStmt->fetch()['total'];
        
        // Buscar usuários
        $sql = "SELECT id, nome, email, perfil, ativo, aprovado_por_admin, created_at, slug 
                FROM usuarios 
                {$whereClause}
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?";
        
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatar resposta
        $formattedUsers = [];
        foreach ($users as $user) {
            $formattedUsers[] = [
                'id' => (int)$user['id'],
                'name' => $user['nome'],
                'email' => $user['email'],
                'type' => $user['perfil'],
                'status' => $user['ativo'] ? 'active' : 'inactive',
                'approved' => (bool)$user['aprovado_por_admin'],
                'created_at' => $user['created_at'],
                'url' => $user['perfil'] === 'decorator' && !empty($user['slug']) 
                    ? '/' . $user['slug'] 
                    : null
            ];
        }
        
        successResponse([
            'users' => $formattedUsers,
            'total' => (int)$total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]);
        
    } catch (Exception $e) {
        error_log('Erro ao buscar usuários: ' . $e->getMessage());
        errorResponse('Erro ao buscar usuários', 500);
    }
}

/**
 * Obter dados do dashboard
 */
function handleGetDashboardData() {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        // Contar clientes
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios WHERE perfil = 'client'");
        $totalClients = (int)$stmt->fetch()['total'];
        
        // Contar decoradores ativos
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios WHERE perfil = 'decorator' AND ativo = 1 AND aprovado_por_admin = 1");
        $activeDecorators = (int)$stmt->fetch()['total'];
        
        // Contar pedidos (se houver tabela de pedidos)
        $totalRequests = 0;
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM orcamentos");
            $totalRequests = (int)$stmt->fetch()['total'];
        } catch (PDOException $e) {
            // Tabela pode não existir ainda
        }
        
        // Contar serviços (decoradores)
        $totalServices = $activeDecorators;
        
        // Contar aprovações pendentes
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios WHERE perfil = 'decorator' AND aprovado_por_admin = 0");
        $pendingApprovals = (int)$stmt->fetch()['total'];
        
        // Atividades recentes (últimos 5 usuários criados)
        $stmt = $pdo->query("
            SELECT id, nome, email, perfil, created_at 
            FROM usuarios 
            ORDER BY created_at DESC 
            LIMIT 5
        ");
        $recentUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $activities = [];
        foreach ($recentUsers as $user) {
            $activities[] = [
                'type' => 'user_created',
                'message' => "Novo {$user['perfil']}: {$user['nome']}",
                'date' => $user['created_at']
            ];
        }
        
        successResponse([
            'total_clients' => $totalClients,
            'active_decorators' => $activeDecorators,
            'total_requests' => $totalRequests,
            'total_services' => $totalServices,
            'pending_approvals' => $pendingApprovals,
            'activities' => $activities
        ]);
        
    } catch (Exception $e) {
        error_log('Erro ao buscar dados do dashboard: ' . $e->getMessage());
        errorResponse('Erro ao buscar dados do dashboard', 500);
    }
}

/**
 * Obter usuário específico
 */
function handleGetUser($input) {
    try {
        $userId = intval($input['user_id'] ?? 0);
        if (!$userId) {
            errorResponse('ID do usuário é obrigatório', 400);
        }
        
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            errorResponse('Usuário não encontrado', 404);
        }
        
        successResponse($user);
        
    } catch (Exception $e) {
        error_log('Erro ao buscar usuário: ' . $e->getMessage());
        errorResponse('Erro ao buscar usuário', 500);
    }
}

/**
 * Atualizar usuário
 */
function handleUpdateUser($input) {
    try {
        $userId = intval($input['user_id'] ?? 0);
        if (!$userId) {
            errorResponse('ID do usuário é obrigatório', 400);
        }
        
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $updates = [];
        $params = [];
        
        $allowedFields = ['nome', 'email', 'telefone', 'endereco', 'cidade', 'estado', 'cep', 'ativo', 'aprovado_por_admin'];
        
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updates[] = "{$field} = ?";
                $params[] = $input[$field];
            }
        }
        
        if (empty($updates)) {
            errorResponse('Nenhum campo para atualizar', 400);
        }
        
        $params[] = $userId;
        $sql = "UPDATE usuarios SET " . implode(', ', $updates) . " WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        successResponse(null, 'Usuário atualizado com sucesso');
        
    } catch (Exception $e) {
        error_log('Erro ao atualizar usuário: ' . $e->getMessage());
        errorResponse('Erro ao atualizar usuário', 500);
    }
}

/**
 * Criar decorador
 */
function handleCreateDecorator($input) {
    // Implementar criação de decorador
    errorResponse('Funcionalidade em desenvolvimento', 501);
}

/**
 * Aprovar decorador
 */
function handleApproveDecorator($input) {
    try {
        $userId = intval($input['user_id'] ?? 0);
        $approved = isset($input['approved']) ? (bool)$input['approved'] : true;
        
        if (!$userId) {
            errorResponse('ID do usuário é obrigatório', 400);
        }
        
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        $stmt = $pdo->prepare("UPDATE usuarios SET aprovado_por_admin = ? WHERE id = ?");
        $stmt->execute([$approved ? 1 : 0, $userId]);
        
        successResponse(null, $approved ? 'Decorador aprovado com sucesso' : 'Aprovação removida');
        
    } catch (Exception $e) {
        error_log('Erro ao aprovar decorador: ' . $e->getMessage());
        errorResponse('Erro ao aprovar decorador', 500);
    }
}

/**
 * Alternar status do usuário
 */
function handleToggleUserStatus($input) {
    try {
        $userId = intval($input['user_id'] ?? 0);
        if (!$userId) {
            errorResponse('ID do usuário é obrigatório', 400);
        }
        
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        // Buscar status atual
        $stmt = $pdo->prepare("SELECT ativo FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            errorResponse('Usuário não encontrado', 404);
        }
        
        $newStatus = $user['ativo'] ? 0 : 1;
        $stmt = $pdo->prepare("UPDATE usuarios SET ativo = ? WHERE id = ?");
        $stmt->execute([$newStatus, $userId]);
        
        successResponse(null, 'Status atualizado com sucesso');
        
    } catch (Exception $e) {
        error_log('Erro ao alterar status: ' . $e->getMessage());
        errorResponse('Erro ao alterar status', 500);
    }
}

/**
 * Deletar usuário
 */
function handleDeleteUser($input) {
    try {
        $userId = intval($input['user_id'] ?? 0);
        if (!$userId) {
            errorResponse('ID do usuário é obrigatório', 400);
        }
        
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        
        successResponse(null, 'Usuário deletado com sucesso');
        
    } catch (Exception $e) {
        error_log('Erro ao deletar usuário: ' . $e->getMessage());
        errorResponse('Erro ao deletar usuário', 500);
    }
}

/**
 * Obter perfil do admin
 */
function handleGetAdminProfile() {
    try {
        $adminId = $_SESSION['admin_id'];
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $stmt = $pdo->prepare("SELECT id, nome, email FROM usuarios WHERE id = ? AND perfil = 'admin'");
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$admin) {
            errorResponse('Admin não encontrado', 404);
        }
        
        successResponse($admin);
        
    } catch (Exception $e) {
        error_log('Erro ao buscar perfil admin: ' . $e->getMessage());
        errorResponse('Erro ao buscar perfil', 500);
    }
}

/**
 * Atualizar perfil do admin
 */
function handleUpdateAdminProfile($input) {
    errorResponse('Funcionalidade em desenvolvimento', 501);
}

/**
 * Atualizar senha do admin
 */
function handleUpdateAdminPassword($input) {
    errorResponse('Funcionalidade em desenvolvimento', 501);
}

/**
 * Obter configurações
 */
function handleGetSettings() {
    errorResponse('Funcionalidade em desenvolvimento', 501);
}

/**
 * Atualizar configurações
 */
function handleUpdateSettings($input) {
    errorResponse('Funcionalidade em desenvolvimento', 501);
}

/**
 * Funções auxiliares de resposta
 */
function successResponse($data = null, $message = 'Sucesso') {
    $response = ['success' => true, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

function errorResponse($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// Incluir funções auxiliares do arquivo original se existirem
if (function_exists('createDefaultPageCustomization')) {
    // Funções já estão disponíveis
}
