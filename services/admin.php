<?php
/**
 * Serviço de Administração - Up.Baloes
 * Gerencia usuários, aprovação de decoradores e outras funções administrativas
 */

// Configurações de segurança
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Incluir configurações
require_once 'config.php';

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Método não permitido', 405);
}

// Verificar se o usuário está logado como admin
session_start();
if (!isset($_SESSION['admin_id']) || $_SESSION['admin_role'] !== 'admin') {
    errorResponse('Acesso negado. Apenas administradores podem acessar esta área.', 403);
}

try {
    // Obter dados da requisição
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        errorResponse('Dados JSON inválidos', 400);
    }
    
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'get_users':
            getUsers($input);
            break;
            
        case 'create_decorator':
            createDecorator($input);
            break;
            
        case 'update_user':
            updateUser($input);
            break;
            
        case 'approve_decorator':
            approveDecorator($input);
            break;
            
        case 'get_dashboard_data':
            getDashboardData();
            break;
            
        default:
            errorResponse('Ação não reconhecida', 400);
    }
    
} catch (Exception $e) {
    errorResponse($e->getMessage(), 500);
}

/**
 * Obter lista de usuários
 */
function getUsers($input) {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $page = $input['page'] ?? 1;
        $limit = $input['limit'] ?? 20;
        $search = $input['search'] ?? '';
        $typeFilter = $input['type'] ?? '';
        $statusFilter = $input['status'] ?? '';
        
        $offset = ($page - 1) * $limit;
        
        // Construir query
        $whereConditions = ['1=1'];
        $params = [];
        
        // Filtro de busca
        if (!empty($search)) {
            $whereConditions[] = "(nome LIKE ? OR email LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }
        
        // Filtro de tipo
        if (!empty($typeFilter)) {
            if ($typeFilter === 'client') {
                $whereConditions[] = "perfil = 'user'";
            } elseif ($typeFilter === 'decorator') {
                $whereConditions[] = "perfil = 'decorator'";
            }
        }
        
        // Filtro de status
        if (!empty($statusFilter)) {
            switch ($statusFilter) {
                case 'active':
                    $whereConditions[] = "ativo = 1";
                    break;
                case 'inactive':
                    $whereConditions[] = "ativo = 0";
                    break;
                case 'pending_approval':
                    $whereConditions[] = "perfil = 'decorator' AND aprovado_por_admin = 0";
                    break;
            }
        }
        
        $whereClause = implode(' AND ', $whereConditions);
        
        // Contar total
        $countQuery = "SELECT COUNT(*) as total FROM usuarios WHERE {$whereClause}";
        $stmt = $pdo->prepare($countQuery);
        $stmt->execute($params);
        $total = $stmt->fetch()['total'];
        
        // Buscar usuários
        $query = "
            SELECT id, nome, email, telefone, perfil, ativo, aprovado_por_admin, 
                   created_at, cidade, estado
            FROM usuarios 
            WHERE {$whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ";
        
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $users = $stmt->fetchAll();
        
        // Processar dados
        foreach ($users as &$user) {
            $user['type'] = $user['perfil'] === 'decorator' ? 'decorator' : 'client';
            $user['status'] = $user['ativo'] ? 'active' : 'inactive';
            
            // Status especial para decoradores não aprovados
            if ($user['perfil'] === 'decorator' && !$user['aprovado_por_admin']) {
                $user['status'] = 'pending_approval';
            }
            
            unset($user['perfil']);
            unset($user['ativo']);
        }
        
        $result = [
            'users' => $users,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => ceil($total / $limit),
                'total_items' => $total,
                'items_per_page' => $limit
            ]
        ];
        
        successResponse($result, 'Usuários carregados com sucesso');
        
    } catch (PDOException $e) {
        error_log("Erro ao carregar usuários: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Criar conta de decorador
 */
function createDecorator($input) {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        // Validar dados obrigatórios
        $requiredFields = ['name', 'email', 'password', 'cpf', 'phone', 'whatsapp', 'communication_email', 'address'];
        foreach ($requiredFields as $field) {
            if (empty($input[$field])) {
                errorResponse("Campo {$field} é obrigatório", 400);
            }
        }
        
        // Validar email
        if (!validateEmail($input['email'])) {
            errorResponse('Email inválido', 400);
        }
        
        // Validar email de comunicação
        if (!validateEmail($input['communication_email'])) {
            errorResponse('Email de comunicação inválido', 400);
        }
        
        // Validar email do Google se fornecido
        if (!empty($input['google_email']) && !validateEmail($input['google_email'])) {
            errorResponse('Email do Google inválido', 400);
        }
        
        // Verificar se email já existe
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$input['email']]);
        if ($stmt->fetch()) {
            errorResponse('Este email já está cadastrado', 400);
        }
        
        // Verificar se email do Google já existe (se fornecido)
        if (!empty($input['google_email'])) {
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE google_email = ?");
            $stmt->execute([$input['google_email']]);
            if ($stmt->fetch()) {
                errorResponse('Este email do Google já está cadastrado', 400);
            }
        }
        
        // Gerar slug único
        $slug = generateSlug($input['name']);
        
        // Hash da senha
        $passwordHash = hashPassword($input['password']);
        
        // Inserir decorador
        $stmt = $pdo->prepare("
            INSERT INTO usuarios (
                nome, email, senha, telefone, endereco, slug, perfil, 
                ativo, aprovado_por_admin, created_at, whatsapp, email_comunicacao, google_email
            ) VALUES (
                :nome, :email, :senha, :telefone, :endereco, :slug, 'decorator',
                1, 1, NOW(), :whatsapp, :email_comunicacao, :google_email
            )
        ");
        
        $params = [
            'nome' => sanitizeInput($input['name']),
            'email' => sanitizeInput($input['email']),
            'senha' => $passwordHash,
            'telefone' => sanitizeInput($input['phone']),
            'endereco' => sanitizeInput($input['address']),
            'slug' => $slug,
            'whatsapp' => sanitizeInput($input['whatsapp']),
            'email_comunicacao' => sanitizeInput($input['communication_email']),
            'google_email' => !empty($input['google_email']) ? sanitizeInput($input['google_email']) : null
        ];
        
        $stmt->execute($params);
        
        $decoratorId = $pdo->lastInsertId();
        
        // Log da criação
        logAdminAction($_SESSION['admin_id'], 'create_decorator', $decoratorId, $pdo);
        
        successResponse(['id' => $decoratorId], 'Decorador criado com sucesso!');
        
    } catch (PDOException $e) {
        error_log("Erro ao criar decorador: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Atualizar usuário
 */
function updateUser($input) {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $userId = $input['id'] ?? 0;
        if (!$userId) {
            errorResponse('ID do usuário é obrigatório', 400);
        }
        
        // Verificar se usuário existe
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            errorResponse('Usuário não encontrado', 404);
        }
        
        // Preparar campos para atualização
        $updateFields = [];
        $params = [];
        
        if (isset($input['name'])) {
            $updateFields[] = "nome = ?";
            $params[] = sanitizeInput($input['name']);
        }
        
        if (isset($input['email'])) {
            if (!validateEmail($input['email'])) {
                errorResponse('Email inválido', 400);
            }
            
            // Verificar se email já existe para outro usuário
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
            $stmt->execute([$input['email'], $userId]);
            if ($stmt->fetch()) {
                errorResponse('Este email já está em uso', 400);
            }
            
            $updateFields[] = "email = ?";
            $params[] = sanitizeInput($input['email']);
        }
        
        if (isset($input['phone'])) {
            $updateFields[] = "telefone = ?";
            $params[] = sanitizeInput($input['phone']);
        }
        
        if (isset($input['status'])) {
            $status = $input['status'] === 'active' ? 1 : 0;
            $updateFields[] = "ativo = ?";
            $params[] = $status;
        }
        
        if (isset($input['aprovado_por_admin']) && $user['perfil'] === 'decorator') {
            $approved = $input['aprovado_por_admin'] ? 1 : 0;
            $updateFields[] = "aprovado_por_admin = ?";
            $params[] = $approved;
        }
        
        // Atualizar email do Google (se fornecido e usuário for decorador)
        if (isset($input['google_email']) && $user['perfil'] === 'decorator') {
            if (!empty($input['google_email'])) {
                if (!validateEmail($input['google_email'])) {
                    errorResponse('Email do Google inválido', 400);
                }
                
                // Verificar se email do Google já existe para outro usuário
                $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE google_email = ? AND id != ?");
                $stmt->execute([$input['google_email'], $userId]);
                if ($stmt->fetch()) {
                    errorResponse('Este email do Google já está em uso', 400);
                }
            }
            
            $updateFields[] = "google_email = ?";
            $params[] = !empty($input['google_email']) ? sanitizeInput($input['google_email']) : null;
        }
        
        if (empty($updateFields)) {
            errorResponse('Nenhum campo para atualizar', 400);
        }
        
        $updateFields[] = "updated_at = NOW()";
        $params[] = $userId;
        
        // Executar atualização
        $query = "UPDATE usuarios SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        
        // Log da atualização
        logAdminAction($_SESSION['admin_id'], 'update_user', $userId, $pdo);
        
        successResponse(null, 'Usuário atualizado com sucesso!');
        
    } catch (PDOException $e) {
        error_log("Erro ao atualizar usuário: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Aprovar decorador
 */
function approveDecorator($input) {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $userId = $input['user_id'] ?? 0;
        $approved = $input['approved'] ?? false;
        
        if (!$userId) {
            errorResponse('ID do usuário é obrigatório', 400);
        }
        
        // Verificar se é um decorador
        $stmt = $pdo->prepare("SELECT perfil FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user || $user['perfil'] !== 'decorator') {
            errorResponse('Usuário não é um decorador', 400);
        }
        
        // Atualizar status de aprovação
        $stmt = $pdo->prepare("
            UPDATE usuarios 
            SET aprovado_por_admin = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$approved ? 1 : 0, $userId]);
        
        // Log da aprovação
        $action = $approved ? 'approve_decorator' : 'disapprove_decorator';
        logAdminAction($_SESSION['admin_id'], $action, $userId, $pdo);
        
        $message = $approved ? 'Decorador aprovado com sucesso!' : 'Aprovação do decorador removida!';
        successResponse(null, $message);
        
    } catch (PDOException $e) {
        error_log("Erro ao aprovar decorador: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Obter dados do dashboard
 */
function getDashboardData() {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        // Total de clientes
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM usuarios WHERE perfil = 'user' AND ativo = 1");
        $stmt->execute();
        $totalClients = $stmt->fetch()['total'];
        
        // Total de decoradores ativos
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM usuarios WHERE perfil = 'decorator' AND ativo = 1 AND aprovado_por_admin = 1");
        $stmt->execute();
        $activeDecorators = $stmt->fetch()['total'];
        
        // Total de solicitações (simulado)
        $totalRequests = 0; // Implementar quando tiver tabela de solicitações
        
        // Total de serviços (simulado)
        $totalServices = 0; // Implementar quando tiver tabela de serviços
        
        // Decoradores aguardando aprovação
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM usuarios WHERE perfil = 'decorator' AND aprovado_por_admin = 0");
        $stmt->execute();
        $pendingApprovals = $stmt->fetch()['total'];
        
        $data = [
            'total_clients' => $totalClients,
            'active_decorators' => $activeDecorators,
            'total_requests' => $totalRequests,
            'total_services' => $totalServices,
            'pending_approvals' => $pendingApprovals
        ];
        
        successResponse($data, 'Dados do dashboard carregados');
        
    } catch (PDOException $e) {
        error_log("Erro ao carregar dados do dashboard: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Gerar slug único
 */
function generateSlug($name) {
    $slug = strtolower(trim($name));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');
    
    // Adicionar número se necessário para garantir unicidade
    $baseSlug = $slug;
    $counter = 1;
    
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        while (true) {
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE slug = ?");
            $stmt->execute([$slug]);
            
            if (!$stmt->fetch()) {
                break;
            }
            
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
    } catch (Exception $e) {
        // Em caso de erro, retornar slug com timestamp
        $slug = $baseSlug . '-' . time();
    }
    
    return $slug;
}

/**
 * Log de ações administrativas
 */
function logAdminAction($adminId, $action, $targetId, $pdo) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO access_logs (user_id, action, ip_address, user_agent, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $adminId,
            $action,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
    } catch (Exception $e) {
        error_log("Erro ao registrar log administrativo: " . $e->getMessage());
    }
}
?>
