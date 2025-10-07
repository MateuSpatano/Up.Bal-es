<?php
/**
 * Sistema Centralizado de Login - Up.Baloes
 * Gerencia login para todos os perfis: clientes, decoradores e admin
 */

// Configurações de segurança
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Incluir configurações
require_once 'config.php';

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
    
    switch ($action) {
        case 'login':
            handleLogin($input);
            break;
            
        case 'admin_login':
            handleAdminLogin($input);
            break;
            
        case 'logout':
            handleLogout();
            break;
            
        case 'admin_logout':
            handleAdminLogout();
            break;
            
        case 'check_auth':
            checkAuthentication();
            break;
            
        case 'check_admin_auth':
            checkAdminAuthentication();
            break;
            
        case 'reset_password':
            handlePasswordReset($input);
            break;
            
        default:
            errorResponse('Ação não reconhecida', 400);
    }
    
} catch (Exception $e) {
    errorResponse($e->getMessage(), 500);
}

/**
 * Processar login geral (clientes e decoradores)
 */
function handleLogin($input) {
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $remember = $input['remember'] ?? false;
    
    // Validações
    if (empty($email) || empty($password)) {
        errorResponse('Email e senha são obrigatórios', 400);
    }
    
    if (!validateEmail($email)) {
        errorResponse('Email inválido', 400);
    }
    
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        // Buscar usuário no banco
        $stmt = $pdo->prepare("
            SELECT id, nome, email, senha, perfil, ativo, created_at, 
                   telefone, endereco, cidade, estado, cep, slug
            FROM usuarios 
            WHERE email = ? AND ativo = 1
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            errorResponse('Email ou senha incorretos', 401);
        }
        
        // Verificar senha
        if (!password_verify($password, $user['senha'])) {
            errorResponse('Email ou senha incorretos', 401);
        }
        
        // Verificar se é decorador e se está aprovado pelo admin
        if ($user['perfil'] === 'decorator') {
            $stmt = $pdo->prepare("
                SELECT aprovado_por_admin FROM usuarios 
                WHERE id = ? AND aprovado_por_admin = 1
            ");
            $stmt->execute([$user['id']]);
            $isApproved = $stmt->fetch();
            
            if (!$isApproved) {
                errorResponse('Sua conta de decorador ainda não foi aprovada pelo administrador. Aguarde a aprovação.', 403);
            }
        }
        
        // Criar sessão
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['nome'];
        $_SESSION['user_role'] = $user['perfil'];
        $_SESSION['login_time'] = time();
        
        // Se "lembrar" estiver marcado, criar cookie
        if ($remember) {
            $token = generateSecureToken(32);
            setcookie('remember_token', $token, time() + $GLOBALS['security_config']['remember_lifetime'], '/', '', false, true);
            
            // Salvar token no banco
            $stmt = $pdo->prepare("
                INSERT INTO remember_tokens (user_id, token, expires_at) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([
                $user['id'], 
                $token, 
                date('Y-m-d H:i:s', time() + $GLOBALS['security_config']['remember_lifetime'])
            ]);
        }
        
        // Log de acesso
        logAccess($user['id'], 'login', $pdo);
        
        // Preparar resposta
        $userData = [
            'id' => $user['id'],
            'name' => $user['nome'],
            'email' => $user['email'],
            'role' => $user['perfil'],
            'phone' => $user['telefone'],
            'address' => $user['endereco'],
            'city' => $user['cidade'],
            'state' => $user['estado'],
            'zipcode' => $user['cep'],
            'slug' => $user['slug']
        ];
        
        successResponse($userData, 'Login realizado com sucesso!');
        
    } catch (PDOException $e) {
        error_log("Erro no login: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Processar login administrativo
 */
function handleAdminLogin($input) {
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $remember = $input['remember'] ?? false;
    
    // Validações
    if (empty($email) || empty($password)) {
        errorResponse('Email e senha são obrigatórios', 400);
    }
    
    if (!validateEmail($email)) {
        errorResponse('Email inválido', 400);
    }
    
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        // Buscar admin no banco
        $stmt = $pdo->prepare("
            SELECT id, nome, email, senha, perfil, ativo, created_at
            FROM usuarios 
            WHERE email = ? AND perfil = 'admin' AND ativo = 1
        ");
        $stmt->execute([$email]);
        $admin = $stmt->fetch();
        
        if (!$admin) {
            errorResponse('Credenciais administrativas incorretas', 401);
        }
        
        // Verificar senha
        if (!password_verify($password, $admin['senha'])) {
            errorResponse('Credenciais administrativas incorretas', 401);
        }
        
        // Criar sessão administrativa
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_email'] = $admin['email'];
        $_SESSION['admin_name'] = $admin['nome'];
        $_SESSION['admin_role'] = 'admin';
        $_SESSION['admin_login_time'] = time();
        
        // Se "lembrar" estiver marcado, criar cookie
        if ($remember) {
            $token = generateSecureToken(32);
            setcookie('admin_remember_token', $token, time() + $GLOBALS['security_config']['remember_lifetime'], '/', '', false, true);
            
            // Salvar token no banco
            $stmt = $pdo->prepare("
                INSERT INTO remember_tokens (user_id, token, expires_at, is_admin) 
                VALUES (?, ?, ?, 1)
            ");
            $stmt->execute([
                $admin['id'], 
                $token, 
                date('Y-m-d H:i:s', time() + $GLOBALS['security_config']['remember_lifetime'])
            ]);
        }
        
        // Log de acesso
        logAccess($admin['id'], 'admin_login', $pdo);
        
        // Preparar resposta
        $adminData = [
            'id' => $admin['id'],
            'name' => $admin['nome'],
            'email' => $admin['email'],
            'role' => 'admin'
        ];
        
        successResponse($adminData, 'Login administrativo realizado com sucesso!');
        
    } catch (PDOException $e) {
        error_log("Erro no login administrativo: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Processar logout
 */
function handleLogout() {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        if (isset($_SESSION['user_id'])) {
            // Log de logout
            logAccess($_SESSION['user_id'], 'logout', $pdo);
        }
        
        // Limpar sessão
        session_unset();
        session_destroy();
        
        // Limpar cookies de "lembrar"
        if (isset($_COOKIE['remember_token'])) {
            setcookie('remember_token', '', time() - 3600, '/');
        }
        
        successResponse(null, 'Logout realizado com sucesso!');
        
    } catch (Exception $e) {
        error_log("Erro no logout: " . $e->getMessage());
        successResponse(null, 'Logout realizado com sucesso!');
    }
}

/**
 * Processar logout administrativo
 */
function handleAdminLogout() {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        if (isset($_SESSION['admin_id'])) {
            // Log de logout
            logAccess($_SESSION['admin_id'], 'admin_logout', $pdo);
        }
        
        // Limpar sessão administrativa
        unset($_SESSION['admin_id']);
        unset($_SESSION['admin_email']);
        unset($_SESSION['admin_name']);
        unset($_SESSION['admin_role']);
        unset($_SESSION['admin_login_time']);
        
        // Limpar cookies de "lembrar"
        if (isset($_COOKIE['admin_remember_token'])) {
            setcookie('admin_remember_token', '', time() - 3600, '/');
        }
        
        successResponse(null, 'Logout administrativo realizado com sucesso!');
        
    } catch (Exception $e) {
        error_log("Erro no logout administrativo: " . $e->getMessage());
        successResponse(null, 'Logout administrativo realizado com sucesso!');
    }
}

/**
 * Verificar autenticação geral
 */
function checkAuthentication() {
    if (isset($_SESSION['user_id']) && isset($_SESSION['user_role'])) {
        $userData = [
            'id' => $_SESSION['user_id'],
            'email' => $_SESSION['user_email'],
            'name' => $_SESSION['user_name'],
            'role' => $_SESSION['user_role']
        ];
        successResponse($userData, 'Usuário autenticado');
    } else {
        errorResponse('Usuário não autenticado', 401);
    }
}

/**
 * Verificar autenticação administrativa
 */
function checkAdminAuthentication() {
    if (isset($_SESSION['admin_id']) && isset($_SESSION['admin_role'])) {
        $adminData = [
            'id' => $_SESSION['admin_id'],
            'email' => $_SESSION['admin_email'],
            'name' => $_SESSION['admin_name'],
            'role' => $_SESSION['admin_role']
        ];
        successResponse($adminData, 'Administrador autenticado');
    } else {
        errorResponse('Administrador não autenticado', 401);
    }
}

/**
 * Processar recuperação de senha
 */
function handlePasswordReset($input) {
    $email = trim($input['email'] ?? '');
    
    if (empty($email)) {
        errorResponse('Email é obrigatório', 400);
    }
    
    if (!validateEmail($email)) {
        errorResponse('Email inválido', 400);
    }
    
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        // Verificar se o email existe
        $stmt = $pdo->prepare("SELECT id, nome FROM usuarios WHERE email = ? AND ativo = 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            // Por segurança, não revelar se o email existe ou não
            successResponse(null, 'Se o email estiver cadastrado, você receberá instruções de recuperação.');
            return;
        }
        
        // Gerar token de recuperação
        $token = generateSecureToken(32);
        $expires_at = date('Y-m-d H:i:s', time() + $GLOBALS['security_config']['password_reset_lifetime']);
        
        // Salvar token no banco
        $stmt = $pdo->prepare("
            INSERT INTO password_reset_tokens (user_id, token, expires_at) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$user['id'], $token, $expires_at]);
        
        // Aqui você enviaria o email com o token
        // Por enquanto, apenas logamos
        error_log("Token de recuperação gerado para {$email}: {$token}");
        
        successResponse(null, 'Se o email estiver cadastrado, você receberá instruções de recuperação.');
        
    } catch (PDOException $e) {
        error_log("Erro na recuperação de senha: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Log de acesso
 */
function logAccess($userId, $action, $pdo) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO access_logs (user_id, action, ip_address, user_agent, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $userId,
            $action,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
    } catch (Exception $e) {
        error_log("Erro ao registrar log de acesso: " . $e->getMessage());
    }
}

/**
 * Verificar token de "lembrar"
 */
function checkRememberToken($token, $isAdmin = false) {
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        $stmt = $pdo->prepare("
            SELECT rt.user_id, u.nome, u.email, u.perfil
            FROM remember_tokens rt
            JOIN usuarios u ON rt.user_id = u.id
            WHERE rt.token = ? AND rt.expires_at > NOW() AND rt.is_admin = ?
        ");
        $stmt->execute([$token, $isAdmin ? 1 : 0]);
        $result = $stmt->fetch();
        
        if ($result) {
            // Atualizar sessão
            if ($isAdmin) {
                $_SESSION['admin_id'] = $result['user_id'];
                $_SESSION['admin_email'] = $result['email'];
                $_SESSION['admin_name'] = $result['nome'];
                $_SESSION['admin_role'] = 'admin';
            } else {
                $_SESSION['user_id'] = $result['user_id'];
                $_SESSION['user_email'] = $result['email'];
                $_SESSION['user_name'] = $result['nome'];
                $_SESSION['user_role'] = $result['perfil'];
            }
            
            return true;
        }
        
        return false;
        
    } catch (Exception $e) {
        error_log("Erro ao verificar token de lembrar: " . $e->getMessage());
        return false;
    }
}

// Verificar tokens de "lembrar" na inicialização
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar token de usuário comum
if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_token'])) {
    checkRememberToken($_COOKIE['remember_token'], false);
}

// Verificar token de admin
if (!isset($_SESSION['admin_id']) && isset($_COOKIE['admin_remember_token'])) {
    checkRememberToken($_COOKIE['admin_remember_token'], true);
}
?>

