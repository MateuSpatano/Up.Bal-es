<?php
/**
 * Serviço de Administração - Up.Baloes
 * Gerencia todas as operações administrativas
 * 
 * VERSÃO ULTRA-ROBUSTA - SEMPRE RETORNA JSON VÁLIDO
 */

// Iniciar output buffering para capturar qualquer saída indesejada
ob_start();

// Desabilitar exibição de erros na saída (mas manter logs)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Configurações de segurança e headers ANTES de qualquer saída
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Permitir requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit();
}

// Função para garantir resposta JSON válida sempre (chamada antes de qualquer saída)
function ensureJsonResponse($data, $statusCode = 200) {
    // Limpar qualquer output buffer anterior
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    
    // Garantir que $data seja um array
    if (!is_array($data)) {
        $data = ['success' => false, 'message' => 'Resposta inválida do servidor'];
    }
    
    // Garantir que sempre tenha success
    if (!isset($data['success'])) {
        $data['success'] = isset($data['message']) ? false : true;
    }
    
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
    // Se falhar o encode, retornar erro básico
    if ($json === false) {
        $json = json_encode([
            'success' => false,
            'message' => 'Erro ao processar resposta do servidor',
            'error' => json_last_error_msg()
        ], JSON_UNESCAPED_UNICODE);
    }
    
    echo $json;
    exit();
}

// Função de resposta de sucesso
function successResponse($data = null, $message = 'Sucesso') {
    $response = ['success' => true];
    if ($message && $message !== 'Sucesso') {
        $response['message'] = $message;
    }
    if ($data !== null) {
        $response['data'] = $data;
    }
    ensureJsonResponse($response, 200);
}

// Função de resposta de erro
function errorResponse($message, $code = 400) {
    ensureJsonResponse([
        'success' => false,
        'message' => $message
    ], $code);
}

// Tratamento de erros fatais - DEVE ser registrado ANTES de qualquer código que possa falhar
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        $errorMessage = $error['message'] ?? 'Erro desconhecido';
        $errorFile = $error['file'] ?? 'arquivo desconhecido';
        $errorLine = $error['line'] ?? 0;
        
        error_log('ERRO FATAL: ' . $errorMessage . ' em ' . $errorFile . ':' . $errorLine);
        
        // Retornar erro detalhado para debug
        ensureJsonResponse([
            'success' => false,
            'message' => 'Erro fatal no servidor',
            'error_type' => 'fatal_error',
            'error_details' => [
                'message' => $errorMessage,
                'file' => $errorFile,
                'line' => $errorLine,
                'type' => $error['type'] ?? 'unknown'
            ]
        ], 500);
    }
});

// TRY-CATCH GLOBAL para capturar QUALQUER erro
try {
    // Incluir configurações
    try {
        require_once __DIR__ . '/config.php';
    } catch (Exception $e) {
        error_log('Erro ao carregar config.php: ' . $e->getMessage());
        errorResponse('Erro de configuração do servidor', 500);
    } catch (Error $e) {
        error_log('Erro fatal ao carregar config.php: ' . $e->getMessage());
        errorResponse('Erro fatal de configuração', 500);
    }
    
    // Iniciar sessão com tratamento de erro
    try {
        if (session_status() === PHP_SESSION_NONE) {
            // Usar o mesmo nome de sessão do config.php
            if (isset($GLOBALS['security_config']['session_name'])) {
                ini_set('session.name', $GLOBALS['security_config']['session_name']);
            }
            session_start();
        }
    } catch (Exception $e) {
        error_log('Erro ao iniciar sessão: ' . $e->getMessage());
        errorResponse('Erro ao iniciar sessão', 500);
    } catch (Error $e) {
        error_log('Erro fatal ao iniciar sessão: ' . $e->getMessage());
        errorResponse('Erro fatal ao iniciar sessão', 500);
    }
    
    // Verificar método HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        errorResponse('Método não permitido. Use POST.', 405);
    }
    
    // Obter e validar dados da requisição
    $rawInput = file_get_contents('php://input');
    
    if (empty($rawInput)) {
        errorResponse('Dados da requisição estão vazios', 400);
    }
    
    $input = json_decode($rawInput, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('Erro ao decodificar JSON: ' . json_last_error_msg());
        error_log('Input recebido (primeiros 500 chars): ' . substr($rawInput, 0, 500));
        errorResponse('Dados JSON inválidos: ' . json_last_error_msg(), 400);
    }
    
    if (!is_array($input)) {
        errorResponse('Dados da requisição devem ser um objeto JSON', 400);
    }
    
    $action = $input['action'] ?? '';
    
    if (empty($action)) {
        errorResponse('Ação não especificada', 400);
    }
    
    // Função para verificar autenticação admin de forma robusta
    function checkAdminAuth() {
        // Verificar múltiplas formas de autenticação
        $isAdmin = false;
        $adminId = null;
        
        // Forma 1: admin_id na sessão
        if (isset($_SESSION['admin_id']) && !empty($_SESSION['admin_id'])) {
            $isAdmin = true;
            $adminId = $_SESSION['admin_id'];
        }
        // Forma 2: user_role admin na sessão
        elseif (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin' && isset($_SESSION['user_id'])) {
            $isAdmin = true;
            $adminId = $_SESSION['user_id'];
            $_SESSION['admin_id'] = $adminId; // Sincronizar
        }
        // Forma 3: Verificar no banco se user_id tem perfil admin
        elseif (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
            try {
                $pdo = getDatabaseConnection($GLOBALS['database_config']);
                $stmt = $pdo->prepare("SELECT id, perfil FROM usuarios WHERE id = ? AND perfil = 'admin'");
                $stmt->execute([$_SESSION['user_id']]);
                $user = $stmt->fetch();
                
                if ($user) {
                    $isAdmin = true;
                    $adminId = $user['id'];
                    $_SESSION['admin_id'] = $adminId;
                    $_SESSION['admin_role'] = 'admin';
                }
            } catch (Exception $e) {
                error_log('Erro ao verificar admin no banco: ' . $e->getMessage());
            } catch (Error $e) {
                error_log('Erro fatal ao verificar admin no banco: ' . $e->getMessage());
            }
        }
        
        if (!$isAdmin) {
            $sessionInfo = [
                'session_id' => session_id(),
                'has_admin_id' => isset($_SESSION['admin_id']),
                'has_user_id' => isset($_SESSION['user_id']),
                'user_role' => $_SESSION['user_role'] ?? 'não definido'
            ];
            error_log('Tentativa de acesso não autorizado. Info: ' . json_encode($sessionInfo));
            errorResponse('Não autorizado. Faça login como administrador.', 401);
        }
        
        return $adminId;
    }
    
    // Verificar autenticação admin para ações que requerem
    $requiresAuth = ['get_users', 'get_dashboard_data', 'get_user', 'update_user', 
                     'create_decorator', 'approve_decorator', 'toggle_user_status', 
                     'delete_user', 'get_admin_profile', 'update_admin_profile', 
                     'update_admin_password', 'get_settings', 'update_settings'];
    
    if (in_array($action, $requiresAuth)) {
        try {
            checkAdminAuth();
        } catch (Exception $e) {
            // Já foi tratado em checkAdminAuth, mas garantir que não continue
            exit();
        } catch (Error $e) {
            error_log('Erro fatal em checkAdminAuth: ' . $e->getMessage());
            errorResponse('Erro fatal na autenticação', 500);
        }
    }
    
    // Processar ação com try-catch individual
    try {
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
        
    } catch (PDOException $e) {
        error_log('Erro PDO na ação ' . $action . ': ' . $e->getMessage());
        errorResponse('Erro ao conectar com o banco de dados', 500);
    } catch (Exception $e) {
        error_log('Erro ao processar ação ' . $action . ': ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        errorResponse('Erro ao processar ação: ' . $e->getMessage(), 500);
    } catch (Error $e) {
        error_log('Erro fatal ao processar ação ' . $action . ': ' . $e->getMessage());
        error_log('Stack trace: ' . $e->getTraceAsString());
        errorResponse('Erro fatal no servidor', 500);
    }
    
} catch (Exception $e) {
    error_log('Erro global não capturado: ' . $e->getMessage());
    errorResponse('Erro interno do servidor', 500);
} catch (Error $e) {
    error_log('Erro fatal global não capturado: ' . $e->getMessage());
    errorResponse('Erro fatal no servidor', 500);
}

/**
 * Obter lista de usuários
 */
function handleGetUsers($input) {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $search = trim($input['search'] ?? '');
        $type = trim($input['type'] ?? '');
        $status = trim($input['status'] ?? '');
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
        $totalResult = $countStmt->fetch();
        $total = (int)($totalResult['total'] ?? 0);
        
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
                'id' => (int)($user['id'] ?? 0),
                'name' => $user['nome'] ?? '',
                'email' => $user['email'] ?? '',
                'type' => $user['perfil'] ?? '',
                'status' => ($user['ativo'] ?? 0) ? 'active' : 'inactive',
                'approved' => (bool)($user['aprovado_por_admin'] ?? false),
                'created_at' => $user['created_at'] ?? date('Y-m-d H:i:s'),
                'url' => ($user['perfil'] ?? '') === 'decorator' && !empty($user['slug'] ?? '') 
                    ? '/' . $user['slug'] 
                    : null
            ];
        }
        
        successResponse([
            'users' => $formattedUsers,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $limit > 0 ? ceil($total / $limit) : 0
        ]);
        
    } catch (PDOException $e) {
        error_log('Erro PDO ao buscar usuários: ' . $e->getMessage());
        errorResponse('Erro ao conectar com o banco de dados: ' . $e->getMessage(), 500);
    } catch (Exception $e) {
        error_log('Erro ao buscar usuários: ' . $e->getMessage());
        errorResponse('Erro ao buscar usuários: ' . $e->getMessage(), 500);
    } catch (Error $e) {
        error_log('Erro fatal ao buscar usuários: ' . $e->getMessage());
        errorResponse('Erro fatal ao buscar usuários', 500);
    }
}

/**
 * Obter dados do dashboard
 */
function handleGetDashboardData() {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        // Inicializar valores padrão
        $totalClients = 0;
        $activeDecorators = 0;
        $totalRequests = 0;
        $totalServices = 0;
        $pendingApprovals = 0;
        $activities = [];
        
        // Contar clientes
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios WHERE perfil = 'client'");
            $result = $stmt->fetch();
            $totalClients = (int)($result['total'] ?? 0);
        } catch (PDOException $e) {
            error_log('Erro ao contar clientes: ' . $e->getMessage());
        }
        
        // Contar decoradores ativos
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios WHERE perfil = 'decorator' AND ativo = 1 AND aprovado_por_admin = 1");
            $result = $stmt->fetch();
            $activeDecorators = (int)($result['total'] ?? 0);
        } catch (PDOException $e) {
            error_log('Erro ao contar decoradores: ' . $e->getMessage());
        }
        
        // Contar pedidos (se houver tabela de pedidos)
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM orcamentos");
            $result = $stmt->fetch();
            $totalRequests = (int)($result['total'] ?? 0);
        } catch (PDOException $e) {
            // Tabela pode não existir ainda - não é crítico
        }
        
        // Contar serviços (decoradores)
        $totalServices = $activeDecorators;
        
        // Contar aprovações pendentes
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios WHERE perfil = 'decorator' AND aprovado_por_admin = 0");
            $result = $stmt->fetch();
            $pendingApprovals = (int)($result['total'] ?? 0);
        } catch (PDOException $e) {
            error_log('Erro ao contar aprovações pendentes: ' . $e->getMessage());
        }
        
        // Atividades recentes (últimos 5 usuários criados)
        try {
            $stmt = $pdo->query("
                SELECT id, nome, email, perfil, created_at 
                FROM usuarios 
                ORDER BY created_at DESC 
                LIMIT 5
            ");
            $recentUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($recentUsers as $user) {
                $activities[] = [
                    'type' => 'user_created',
                    'message' => "Novo " . ($user['perfil'] ?? 'usuário') . ": " . ($user['nome'] ?? ''),
                    'date' => $user['created_at'] ?? date('Y-m-d H:i:s')
                ];
            }
        } catch (PDOException $e) {
            error_log('Erro ao buscar atividades: ' . $e->getMessage());
        }
        
        successResponse([
            'total_clients' => $totalClients,
            'active_decorators' => $activeDecorators,
            'total_requests' => $totalRequests,
            'total_services' => $totalServices,
            'pending_approvals' => $pendingApprovals,
            'activities' => $activities
        ]);
        
    } catch (PDOException $e) {
        error_log('Erro PDO ao buscar dados do dashboard: ' . $e->getMessage());
        errorResponse('Erro ao conectar com o banco de dados', 500);
    } catch (Exception $e) {
        error_log('Erro ao buscar dados do dashboard: ' . $e->getMessage());
        errorResponse('Erro ao buscar dados do dashboard: ' . $e->getMessage(), 500);
    } catch (Error $e) {
        error_log('Erro fatal ao buscar dados do dashboard: ' . $e->getMessage());
        errorResponse('Erro fatal ao buscar dados do dashboard', 500);
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
        
    } catch (PDOException $e) {
        error_log('Erro PDO ao buscar usuário: ' . $e->getMessage());
        errorResponse('Erro ao conectar com o banco de dados', 500);
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
        
    } catch (PDOException $e) {
        error_log('Erro PDO ao atualizar usuário: ' . $e->getMessage());
        errorResponse('Erro ao conectar com o banco de dados', 500);
    } catch (Exception $e) {
        error_log('Erro ao atualizar usuário: ' . $e->getMessage());
        errorResponse('Erro ao atualizar usuário', 500);
    }
}

/**
 * Criar decorador
 */
function handleCreateDecorator($input) {
    try {
        // Validar campos obrigatórios
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        
        if (empty($name) || strlen($name) < 2) {
            errorResponse('Nome deve ter pelo menos 2 caracteres', 400);
        }
        
        if (empty($email) || !validateEmail($email)) {
            errorResponse('Email inválido', 400);
        }
        
        if (empty($password) || strlen($password) < 6) {
            errorResponse('Senha deve ter pelo menos 6 caracteres', 400);
        }
        
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        // Verificar se email já existe
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            errorResponse('Este email já está cadastrado no sistema', 400);
        }
        
        // Gerar slug único
        $slug = gerarSlugUnico($pdo, $name);
        
        // Hash da senha
        $senhaHash = hashPassword($password);
        
        // Preparar dados para inserção
        $telefone = !empty($input['phone']) ? sanitizeInput(trim($input['phone'])) : null;
        $whatsapp = !empty($input['whatsapp']) ? sanitizeInput(trim($input['whatsapp'])) : null;
        $endereco = !empty($input['address']) ? sanitizeInput(trim($input['address'])) : null;
        
        // Inserir decorador no banco (campos básicos que sabemos que existem)
        // Se whatsapp ou cpf não existirem na tabela, serão ignorados pelo MySQL
        $stmt = $pdo->prepare("
            INSERT INTO usuarios (
                nome, email, senha, telefone, endereco,
                slug, perfil, ativo, aprovado_por_admin, created_at
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, 'decorator', 1, 1, NOW()
            )
        ");
        
        $stmt->execute([
            sanitizeInput($name),
            sanitizeInput($email),
            $senhaHash,
            $telefone,
            $endereco,
            $slug
        ]);
        
        $userId = $pdo->lastInsertId();
        
        // Se whatsapp foi fornecido, atualizar em uma query separada (caso a coluna exista)
        if (!empty($whatsapp)) {
            try {
                $updateStmt = $pdo->prepare("UPDATE usuarios SET whatsapp = ? WHERE id = ?");
                $updateStmt->execute([sanitizeInput($whatsapp), $userId]);
            } catch (PDOException $e) {
                // Coluna whatsapp pode não existir - não é crítico
                error_log('Aviso: Não foi possível atualizar whatsapp: ' . $e->getMessage());
            }
        }
        
        // Buscar dados do decorador criado
        $stmt = $pdo->prepare("SELECT id, nome, email, telefone, whatsapp, slug, created_at FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $decorator = $stmt->fetch(PDO::FETCH_ASSOC);
        
        successResponse([
            'id' => (int)$decorator['id'],
            'name' => $decorator['nome'],
            'email' => $decorator['email'],
            'phone' => $decorator['telefone'] ?? null,
            'whatsapp' => $decorator['whatsapp'] ?? null,
            'slug' => $decorator['slug'] ?? null,
            'url' => !empty($decorator['slug']) ? '/' . $decorator['slug'] : null,
            'created_at' => $decorator['created_at']
        ], 'Decorador criado com sucesso');
        
    } catch (PDOException $e) {
        error_log('Erro PDO ao criar decorador: ' . $e->getMessage());
        errorResponse('Erro ao conectar com o banco de dados: ' . $e->getMessage(), 500);
    } catch (Exception $e) {
        error_log('Erro ao criar decorador: ' . $e->getMessage());
        errorResponse('Erro ao criar decorador: ' . $e->getMessage(), 500);
    } catch (Error $e) {
        error_log('Erro fatal ao criar decorador: ' . $e->getMessage());
        errorResponse('Erro fatal ao criar decorador', 500);
    }
}

/**
 * Gerar slug único para usuário
 */
function gerarSlugUnico($pdo, $nome) {
    // Converter nome para slug
    $slug = strtolower(trim($nome));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');
    
    // Verificar se slug já existe e adicionar número se necessário
    $originalSlug = $slug;
    $counter = 1;
    
    while (slugExiste($pdo, $slug)) {
        $slug = $originalSlug . '-' . $counter;
        $counter++;
    }
    
    return $slug;
}

/**
 * Verificar se slug já existe
 */
function slugExiste($pdo, $slug) {
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE slug = ?");
    $stmt->execute([$slug]);
    return $stmt->fetch() !== false;
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
        
    } catch (PDOException $e) {
        error_log('Erro PDO ao aprovar decorador: ' . $e->getMessage());
        errorResponse('Erro ao conectar com o banco de dados', 500);
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
        
    } catch (PDOException $e) {
        error_log('Erro PDO ao alterar status: ' . $e->getMessage());
        errorResponse('Erro ao conectar com o banco de dados', 500);
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
        
    } catch (PDOException $e) {
        error_log('Erro PDO ao deletar usuário: ' . $e->getMessage());
        errorResponse('Erro ao conectar com o banco de dados', 500);
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
        $adminId = $_SESSION['admin_id'] ?? checkAdminAuth();
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $stmt = $pdo->prepare("SELECT id, nome, email FROM usuarios WHERE id = ? AND perfil = 'admin'");
        $stmt->execute([$adminId]);
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$admin) {
            errorResponse('Admin não encontrado', 404);
        }
        
        successResponse($admin);
        
    } catch (PDOException $e) {
        error_log('Erro PDO ao buscar perfil admin: ' . $e->getMessage());
        errorResponse('Erro ao conectar com o banco de dados', 500);
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
