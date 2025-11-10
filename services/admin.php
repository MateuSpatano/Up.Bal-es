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
require_once __DIR__ . '/config.php';

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
            
        case 'get_user':
            getUser($input);
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
            
        case 'get_page_customization':
            getPageCustomization($input);
            break;
            
        case 'save_page_customization':
            savePageCustomization($input);
            break;
        
        case 'get_admin_profile':
            getAdminProfile();
            break;
        
        case 'update_admin_profile':
            updateAdminProfile($input);
            break;
        
        case 'change_admin_password':
            changeAdminPassword($input);
            break;
            
        default:
            errorResponse('Ação não reconhecida', 400);
    }
    
} catch (Exception $e) {
    errorResponse($e->getMessage(), 500);
}

/**
 * Obter dados de um usuário específico
 */
function getUser($input) {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $userId = $input['user_id'] ?? 0;
        if (!$userId) {
            errorResponse('ID do usuário é obrigatório', 400);
        }
        
        // Buscar dados completos do usuário
        $stmt = $pdo->prepare("
            SELECT 
                id, nome, email, telefone, whatsapp, instagram, email_comunicacao,
                perfil, ativo, aprovado_por_admin, created_at
            FROM usuarios 
            WHERE id = ?
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            errorResponse('Usuário não encontrado', 404);
        }
        
        // Formatar dados para resposta
        $userData = [
            'id' => $user['id'],
            'name' => $user['nome'],
            'email' => $user['email'],
            'phone' => $user['telefone'],
            'whatsapp' => $user['whatsapp'],
            'instagram' => $user['instagram'],
            'email_comunicacao' => $user['email_comunicacao'],
            'type' => $user['perfil'] === 'decorator' ? 'decorator' : 'client',
            'status' => $user['ativo'] ? 'active' : 'inactive',
            'approved' => $user['aprovado_por_admin'] ? true : false,
            'created_at' => $user['created_at']
        ];
        
        successResponse($userData, 'Dados do usuário carregados');
        
    } catch (PDOException $e) {
        error_log("Erro ao buscar usuário: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
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
            SELECT id, nome, email, telefone, whatsapp, instagram, email_comunicacao,
                   perfil, ativo, aprovado_por_admin, created_at, cidade, estado
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
            $user['name'] = $user['nome'];
            $user['phone'] = $user['telefone'] ?? '';
            $user['whatsapp'] = $user['whatsapp'] ?? '';
            $user['instagram'] = $user['instagram'] ?? '';
            $user['email_comunicacao'] = $user['email_comunicacao'] ?? '';
            $user['type'] = $user['perfil'] === 'decorator' ? 'decorator' : 'client';
            $user['status'] = $user['ativo'] ? 'active' : 'inactive';
            
            // Status especial para decoradores não aprovados
            if ($user['perfil'] === 'decorator' && !$user['aprovado_por_admin']) {
                $user['status'] = 'pending_approval';
            }
            
            unset($user['nome']);
            unset($user['telefone']);
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
        
        // Verificar se email já existe
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$input['email']]);
        if ($stmt->fetch()) {
            errorResponse('Este email já está cadastrado', 400);
        }
        
        // Gerar slug único
        $slug = generateSlug($input['name']);
        
        // Hash da senha
        $passwordHash = hashPassword($input['password']);
        
        // Inserir decorador
        $stmt = $pdo->prepare("
            INSERT INTO usuarios (
                nome, email, senha, telefone, endereco, slug, perfil, 
                ativo, aprovado_por_admin, created_at, whatsapp, email_comunicacao
            ) VALUES (
                :nome, :email, :senha, :telefone, :endereco, :slug, 'decorator',
                1, 1, NOW(), :whatsapp, :email_comunicacao
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
            'email_comunicacao' => sanitizeInput($input['communication_email'])
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
        
        if (isset($input['whatsapp'])) {
            $updateFields[] = "whatsapp = ?";
            $params[] = sanitizeInput($input['whatsapp']);
        }
        
        if (isset($input['instagram'])) {
            $updateFields[] = "instagram = ?";
            $params[] = sanitizeInput($input['instagram']);
        }
        
        if (isset($input['email_comunicacao'])) {
            // Validar email se fornecido
            if (!empty($input['email_comunicacao']) && !validateEmail($input['email_comunicacao'])) {
                errorResponse('Email de comunicação inválido', 400);
            }
            $updateFields[] = "email_comunicacao = ?";
            $params[] = !empty($input['email_comunicacao']) ? sanitizeInput($input['email_comunicacao']) : null;
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
 * Obter personalização da página pública
 */
function getPageCustomization($input) {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $decoratorId = $input['decorator_id'] ?? 0;
        if (!$decoratorId) {
            errorResponse('ID do decorador é obrigatório', 400);
        }
        
        // Verificar se decorador existe
        $stmt = $pdo->prepare("SELECT id, nome FROM usuarios WHERE id = ? AND perfil = 'decorator'");
        $stmt->execute([$decoratorId]);
        $decorator = $stmt->fetch();
        
        if (!$decorator) {
            errorResponse('Decorador não encontrado', 404);
        }
        
        // Buscar personalização
        $stmt = $pdo->prepare("
            SELECT * FROM decorator_page_customization 
            WHERE decorator_id = ?
        ");
        $stmt->execute([$decoratorId]);
        $customization = $stmt->fetch();
        
        // Buscar dados de contato do decorador
        $stmt = $pdo->prepare("
            SELECT email_comunicacao, whatsapp, instagram 
            FROM usuarios 
            WHERE id = ?
        ");
        $stmt->execute([$decoratorId]);
        $contactData = $stmt->fetch();
        
        if (!$customization) {
            // Retornar estrutura vazia se não houver personalização, mas incluir dados de contato
            $response = [
                'page_title' => '',
                'page_description' => '',
                'welcome_text' => '',
                'cover_image_url' => '',
                'primary_color' => '#667eea',
                'secondary_color' => '#764ba2',
                'accent_color' => '#f59e0b',
                'social_media' => json_encode([
                    'facebook' => '',
                    'instagram' => '',
                    'whatsapp' => '',
                    'youtube' => ''
                ]),
                'meta_title' => '',
                'meta_description' => '',
                'meta_keywords' => '',
                'contact_email' => $contactData['email_comunicacao'] ?? '',
                'contact_whatsapp' => $contactData['whatsapp'] ?? '',
                'contact_instagram' => $contactData['instagram'] ?? ''
            ];
            successResponse($response, 'Nenhuma personalização encontrada');
        } else {
            // Adicionar dados de contato à resposta
            $customization['contact_email'] = $contactData['email_comunicacao'] ?? '';
            $customization['contact_whatsapp'] = $contactData['whatsapp'] ?? '';
            $customization['contact_instagram'] = $contactData['instagram'] ?? '';
            successResponse($customization, 'Configurações carregadas');
        }
        
    } catch (PDOException $e) {
        error_log("Erro ao carregar personalização: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Salvar personalização da página pública
 */
function savePageCustomization($input) {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $decoratorId = $input['decorator_id'] ?? 0;
        if (!$decoratorId) {
            errorResponse('ID do decorador é obrigatório', 400);
        }
        
        // Verificar se decorador existe
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ? AND perfil = 'decorator'");
        $stmt->execute([$decoratorId]);
        if (!$stmt->fetch()) {
            errorResponse('Decorador não encontrado', 404);
        }
        
        // Validar dados obrigatórios
        if (empty($input['page_title']) || empty($input['page_description'])) {
            errorResponse('Título e descrição são obrigatórios', 400);
        }
        
        // Verificar se já existe personalização
        $stmt = $pdo->prepare("SELECT id FROM decorator_page_customization WHERE decorator_id = ?");
        $stmt->execute([$decoratorId]);
        $exists = $stmt->fetch();
        
        // Atualizar campos de contato na tabela usuarios se fornecidos
        if (isset($input['contact_email']) || isset($input['contact_whatsapp']) || isset($input['contact_instagram'])) {
            $updateUserFields = [];
            $updateUserParams = [];
            
            if (isset($input['contact_email']) && !empty($input['contact_email'])) {
                if (!validateEmail($input['contact_email'])) {
                    errorResponse('Email de comunicação inválido', 400);
                }
                $updateUserFields[] = "email_comunicacao = ?";
                $updateUserParams[] = sanitizeInput($input['contact_email']);
            }
            
            if (isset($input['contact_whatsapp']) && !empty($input['contact_whatsapp'])) {
                $updateUserFields[] = "whatsapp = ?";
                $updateUserParams[] = sanitizeInput($input['contact_whatsapp']);
            }
            
            if (isset($input['contact_instagram']) && !empty($input['contact_instagram'])) {
                $updateUserFields[] = "instagram = ?";
                $updateUserParams[] = sanitizeInput($input['contact_instagram']);
            }
            
            if (!empty($updateUserFields)) {
                $updateUserFields[] = "updated_at = NOW()";
                $updateUserParams[] = $decoratorId;
                
                $updateUserQuery = "UPDATE usuarios SET " . implode(', ', $updateUserFields) . " WHERE id = ?";
                $updateUserStmt = $pdo->prepare($updateUserQuery);
                $updateUserStmt->execute($updateUserParams);
            }
        }
        
        if ($exists) {
            // Atualizar
            $stmt = $pdo->prepare("
                UPDATE decorator_page_customization SET
                    page_title = ?,
                    page_description = ?,
                    welcome_text = ?,
                    cover_image_url = ?,
                    primary_color = ?,
                    secondary_color = ?,
                    accent_color = ?,
                    social_media = ?,
                    meta_title = ?,
                    meta_description = ?,
                    meta_keywords = ?,
                    updated_at = NOW()
                WHERE decorator_id = ?
            ");
            
            $stmt->execute([
                sanitizeInput($input['page_title']),
                sanitizeInput($input['page_description']),
                !empty($input['welcome_text']) ? sanitizeInput($input['welcome_text']) : null,
                !empty($input['cover_image_url']) ? sanitizeInput($input['cover_image_url']) : null,
                !empty($input['primary_color']) ? sanitizeInput($input['primary_color']) : '#667eea',
                !empty($input['secondary_color']) ? sanitizeInput($input['secondary_color']) : '#764ba2',
                !empty($input['accent_color']) ? sanitizeInput($input['accent_color']) : '#f59e0b',
                !empty($input['social_media']) ? $input['social_media'] : null,
                !empty($input['meta_title']) ? sanitizeInput($input['meta_title']) : null,
                !empty($input['meta_description']) ? sanitizeInput($input['meta_description']) : null,
                !empty($input['meta_keywords']) ? sanitizeInput($input['meta_keywords']) : null,
                $decoratorId
            ]);
        } else {
            // Inserir
            $stmt = $pdo->prepare("
                INSERT INTO decorator_page_customization (
                    decorator_id, page_title, page_description, welcome_text,
                    cover_image_url, primary_color, secondary_color, accent_color,
                    social_media, meta_title, meta_description, meta_keywords,
                    is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
            ");
            
            $stmt->execute([
                $decoratorId,
                sanitizeInput($input['page_title']),
                sanitizeInput($input['page_description']),
                !empty($input['welcome_text']) ? sanitizeInput($input['welcome_text']) : null,
                !empty($input['cover_image_url']) ? sanitizeInput($input['cover_image_url']) : null,
                !empty($input['primary_color']) ? sanitizeInput($input['primary_color']) : '#667eea',
                !empty($input['secondary_color']) ? sanitizeInput($input['secondary_color']) : '#764ba2',
                !empty($input['accent_color']) ? sanitizeInput($input['accent_color']) : '#f59e0b',
                !empty($input['social_media']) ? $input['social_media'] : null,
                !empty($input['meta_title']) ? sanitizeInput($input['meta_title']) : null,
                !empty($input['meta_description']) ? sanitizeInput($input['meta_description']) : null,
                !empty($input['meta_keywords']) ? sanitizeInput($input['meta_keywords']) : null
            ]);
        }
        
        // Log da ação
        logAdminAction($_SESSION['admin_id'], 'save_page_customization', $decoratorId, $pdo);
        
        successResponse(null, 'Personalização salva com sucesso!');
        
    } catch (PDOException $e) {
        error_log("Erro ao salvar personalização: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
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

/**
 * Obter dados do perfil do administrador logado
 */
function getAdminProfile() {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $adminId = $_SESSION['admin_id'] ?? null;
        if (!$adminId) {
            errorResponse('Administrador não autenticado', 401);
        }
        
        $stmt = $pdo->prepare("
            SELECT 
                id,
                nome,
                email,
                telefone,
                whatsapp,
                instagram,
                email_comunicacao,
                bio,
                foto_perfil,
                created_at,
                updated_at
            FROM usuarios
            WHERE id = ? AND perfil = 'admin'
            LIMIT 1
        ");
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch();
        
        if (!$admin) {
            errorResponse('Perfil administrativo não encontrado', 404);
        }
        
        $profile = [
            'id' => (int)$admin['id'],
            'name' => $admin['nome'],
            'email' => $admin['email'],
            'phone' => $admin['telefone'],
            'whatsapp' => $admin['whatsapp'],
            'instagram' => $admin['instagram'],
            'communication_email' => $admin['email_comunicacao'],
            'bio' => $admin['bio'],
            'profile_photo' => $admin['foto_perfil'],
            'created_at' => $admin['created_at'],
            'updated_at' => $admin['updated_at']
        ];
        
        successResponse($profile, 'Perfil administrativo carregado');
    } catch (PDOException $e) {
        error_log("Erro ao obter perfil do admin: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Atualizar informações do perfil do administrador
 */
function updateAdminProfile($input) {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $adminId = $_SESSION['admin_id'] ?? null;
        if (!$adminId) {
            errorResponse('Administrador não autenticado', 401);
        }
        
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $whatsapp = trim($input['whatsapp'] ?? '');
        $instagram = trim($input['instagram'] ?? '');
        $communicationEmail = trim($input['communication_email'] ?? '');
        $bio = trim($input['bio'] ?? '');
        $profileImage = $input['profile_image'] ?? null;
        $removeImage = !empty($input['remove_profile_image']);
        
        if (empty($name)) {
            errorResponse('Nome é obrigatório', 400);
        }
        
        if (empty($email) || !validateEmail($email)) {
            errorResponse('Email inválido', 400);
        }
        
        if (!empty($communicationEmail) && !validateEmail($communicationEmail)) {
            errorResponse('Email de comunicação inválido', 400);
        }
        
        // Verificar se email já está em uso por outro usuário
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
        $stmt->execute([$email, $adminId]);
        if ($stmt->fetch()) {
            errorResponse('Este email já está em uso por outro usuário', 400);
        }
        
        // Buscar dados atuais para manipular arquivo de imagem
        $stmt = $pdo->prepare("SELECT foto_perfil FROM usuarios WHERE id = ?");
        $stmt->execute([$adminId]);
        $currentData = $stmt->fetch();
        $currentPhoto = $currentData['foto_perfil'] ?? null;
        $newPhotoPath = $currentPhoto;
        
        if ($profileImage) {
            $newPhotoPath = saveAdminProfileImage($profileImage, $currentPhoto, $adminId);
        } elseif ($removeImage && $currentPhoto) {
            removeStoredFile($currentPhoto);
            $newPhotoPath = null;
        }
        
        $updateFields = [
            'nome' => sanitizeInput($name),
            'email' => sanitizeInput($email),
            'telefone' => !empty($phone) ? sanitizeInput($phone) : null,
            'whatsapp' => !empty($whatsapp) ? sanitizeInput($whatsapp) : null,
            'instagram' => !empty($instagram) ? sanitizeInput($instagram) : null,
            'email_comunicacao' => !empty($communicationEmail) ? sanitizeInput($communicationEmail) : null,
            'bio' => !empty($bio) ? $bio : null,
            'foto_perfil' => $newPhotoPath,
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $setClause = [];
        $params = [];
        
        foreach ($updateFields as $column => $value) {
            $setClause[] = "{$column} = ?";
            $params[] = $value;
        }
        
        $params[] = $adminId;
        
        $sql = "UPDATE usuarios SET " . implode(', ', $setClause) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        logAdminAction($adminId, 'update_admin_profile', $adminId, $pdo);
        
        $response = [
            'name' => $updateFields['nome'],
            'email' => $updateFields['email'],
            'phone' => $updateFields['telefone'],
            'whatsapp' => $updateFields['whatsapp'],
            'instagram' => $updateFields['instagram'],
            'communication_email' => $updateFields['email_comunicacao'],
            'bio' => $updateFields['bio'],
            'profile_photo' => $updateFields['foto_perfil']
        ];
        
        successResponse($response, 'Perfil atualizado com sucesso!');
    } catch (PDOException $e) {
        error_log("Erro ao atualizar perfil do admin: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Alterar senha do administrador
 */
function changeAdminPassword($input) {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $adminId = $_SESSION['admin_id'] ?? null;
        if (!$adminId) {
            errorResponse('Administrador não autenticado', 401);
        }
        
        $currentPassword = $input['current_password'] ?? '';
        $newPassword = $input['new_password'] ?? '';
        $confirmPassword = $input['confirm_password'] ?? '';
        
        if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
            errorResponse('Todos os campos de senha são obrigatórios', 400);
        }
        
        if ($newPassword !== $confirmPassword) {
            errorResponse('A confirmação de senha não confere', 400);
        }
        
        if (strlen($newPassword) < 8) {
            errorResponse('A nova senha deve ter ao menos 8 caracteres', 400);
        }
        
        if (!preg_match('/[A-Za-z]/', $newPassword) || !preg_match('/\d/', $newPassword)) {
            errorResponse('A nova senha deve conter letras e números', 400);
        }
        
        $stmt = $pdo->prepare("SELECT senha FROM usuarios WHERE id = ? AND perfil = 'admin'");
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch();
        
        if (!$admin || !password_verify($currentPassword, $admin['senha'])) {
            errorResponse('Senha atual incorreta', 400);
        }
        
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE usuarios SET senha = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$hashedPassword, $adminId]);
        
        logAdminAction($adminId, 'change_admin_password', $adminId, $pdo);
        
        successResponse(null, 'Senha atualizada com sucesso!');
    } catch (PDOException $e) {
        error_log("Erro ao alterar senha do admin: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Salvar imagem de perfil do administrador
 */
function saveAdminProfileImage($base64Image, $currentPhoto, $adminId) {
    if (strpos($base64Image, 'base64,') === false) {
        errorResponse('Formato de imagem inválido', 400);
    }
    
    [$meta, $data] = explode('base64,', $base64Image);
    $data = str_replace(' ', '+', $data);
    $binaryData = base64_decode($data, true);
    
    if ($binaryData === false) {
        errorResponse('Não foi possível processar a imagem enviada', 400);
    }
    
    $allowedMime = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp'
    ];
    
    $mimeType = null;
    if (preg_match('/^data:(image\/[a-zA-Z0-9.+-]+);/', $meta, $matches)) {
        $mimeType = strtolower($matches[1]);
    }
    
    if (!$mimeType || !isset($allowedMime[$mimeType])) {
        errorResponse('Tipo de imagem não suportado. Utilize JPG, PNG, GIF ou WebP', 400);
    }
    
    $extension = $allowedMime[$mimeType];
    $uploadDir = __DIR__ . '/../uploads/admin/';
    
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $filename = 'admin_' . $adminId . '_' . time() . '.' . $extension;
    $fullPath = $uploadDir . $filename;
    
    if (file_put_contents($fullPath, $binaryData) === false) {
        errorResponse('Erro ao salvar imagem de perfil', 500);
    }
    
    // Remover imagem anterior
    if ($currentPhoto) {
        removeStoredFile($currentPhoto);
    }
    
    return 'uploads/admin/' . $filename;
}

/**
 * Remover arquivo armazenado anteriormente
 */
function removeStoredFile($relativePath) {
    $filePath = realpath(__DIR__ . '/../' . ltrim($relativePath, '/'));
    if ($filePath && file_exists($filePath) && strpos($filePath, realpath(__DIR__ . '/..')) === 0) {
        @unlink($filePath);
    }
}
?>
