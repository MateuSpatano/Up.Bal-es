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
require_once __DIR__ . '/config.php';

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
            
        case 'validate_reset_token':
            validateResetToken($input);
            break;
        
        case 'set_new_password':
            setNewPassword($input);
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
        
        // Remover tokens anteriores do usuário
        $stmt = $pdo->prepare("DELETE FROM password_reset_tokens WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        
        // Salvar token no banco
        $stmt = $pdo->prepare("
            INSERT INTO password_reset_tokens (user_id, token, expires_at) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$user['id'], $token, $expires_at]);
        
        cleanupExpiredResetTokens($pdo);
        
        $baseUrl = rtrim($GLOBALS['urls']['base'] ?? '', '/');
        $resetPath = 'pages/reset-password.html';
        $separator = substr($baseUrl, -1) === '/' ? '' : '/';
        $resetLink = $baseUrl . $separator . $resetPath . '?token=' . urlencode($token);
        
        $subject = 'Recuperação de senha - Up.Baloes';
        $userName = $user['nome'] ?? 'usuário';
        $htmlBody = "
            <p>Olá {$userName},</p>
            <p>Recebemos uma solicitação para redefinir sua senha do sistema Up.Baloes.</p>
            <p>Para criar uma nova senha, clique no botão abaixo:</p>
            <p style=\"margin: 24px 0;\">
                <a href=\"{$resetLink}\" style=\"display:inline-block;padding:12px 24px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;\">Redefinir minha senha</a>
            </p>
            <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
            <p style=\"word-break:break-all;\"><a href=\"{$resetLink}\" target=\"_blank\">{$resetLink}</a></p>
            <p>Este link é válido por " . ($GLOBALS['security_config']['password_reset_lifetime'] / 60) . " minutos.</p>
            <p>Se você não solicitou a alteração de senha, ignore este email.</p>
            <p>Atenciosamente,<br>Equipe Up.Baloes</p>
        ";
        
        $textBody = "Olá {$userName},\n\nRecebemos uma solicitação para redefinir sua senha no Up.Baloes.\n\nAcesse o link abaixo para criar uma nova senha (válido por " . ($GLOBALS['security_config']['password_reset_lifetime'] / 60) . " minutos):\n{$resetLink}\n\nSe você não solicitou a alteração, ignore este email.\n\nEquipe Up.Baloes";
        
        $emailSent = sendEmail($email, $subject, $htmlBody, $textBody);
        
        if (!$emailSent) {
            error_log("Falha ao enviar email de recuperação para {$email}");
        }
        
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

/**
 * Validar token de recuperação de senha
 */
function validateResetToken($input) {
    $token = trim($input['token'] ?? '');
    
    if (empty($token)) {
        errorResponse('Token de recuperação inválido.', 400);
    }
    
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        cleanupExpiredResetTokens($pdo);
        
        $stmt = $pdo->prepare("
            SELECT prt.user_id, prt.expires_at, u.email, u.nome
            FROM password_reset_tokens prt
            INNER JOIN usuarios u ON u.id = prt.user_id
            WHERE prt.token = ?
            LIMIT 1
        ");
        $stmt->execute([$token]);
        $data = $stmt->fetch();
        
        if (!$data) {
            errorResponse('Token inválido ou expirado.', 400);
        }
        
        if (strtotime($data['expires_at']) < time()) {
            $stmt = $pdo->prepare("DELETE FROM password_reset_tokens WHERE token = ?");
            $stmt->execute([$token]);
            errorResponse('Token expirado. Solicite uma nova recuperação.', 400);
        }
        
        successResponse([
            'email' => $data['email'],
            'name' => $data['nome'],
            'expires_at' => $data['expires_at']
        ], 'Token válido.');
        
    } catch (PDOException $e) {
        error_log("Erro ao validar token de recuperação: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Definir nova senha utilizando token válido
 */
function setNewPassword($input) {
    $token = trim($input['token'] ?? '');
    $password = $input['password'] ?? '';
    $confirmPassword = $input['confirm_password'] ?? '';
    
    if (empty($token)) {
        errorResponse('Token de recuperação inválido.', 400);
    }
    
    if (empty($password) || empty($confirmPassword)) {
        errorResponse('Informe a nova senha e a confirmação.', 400);
    }
    
    if ($password !== $confirmPassword) {
        errorResponse('As senhas informadas não coincidem.', 400);
    }
    
    if (strlen($password) < 8) {
        errorResponse('A nova senha deve ter pelo menos 8 caracteres.', 400);
    }
    
    if (!preg_match('/[A-Za-z]/', $password) || !preg_match('/\d/', $password)) {
        errorResponse('A nova senha deve conter letras e números.', 400);
    }
    
    try {
        $pdo = getDatabaseConnection($GLOBALS['database_config']);
        
        cleanupExpiredResetTokens($pdo);
        
        $stmt = $pdo->prepare("
            SELECT prt.user_id, prt.expires_at, u.email
            FROM password_reset_tokens prt
            INNER JOIN usuarios u ON u.id = prt.user_id
            WHERE prt.token = ?
            LIMIT 1
        ");
        $stmt->execute([$token]);
        $data = $stmt->fetch();
        
        if (!$data) {
            errorResponse('Token inválido ou expirado.', 400);
        }
        
        if (strtotime($data['expires_at']) < time()) {
            $stmt = $pdo->prepare("DELETE FROM password_reset_tokens WHERE token = ?");
            $stmt->execute([$token]);
            errorResponse('Token expirado. Solicite uma nova recuperação.', 400);
        }
        
        $hashedPassword = hashPassword($password);
        
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("UPDATE usuarios SET senha = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$hashedPassword, $data['user_id']]);
        
        $stmt = $pdo->prepare("DELETE FROM password_reset_tokens WHERE user_id = ?");
        $stmt->execute([$data['user_id']]);
        
        $pdo->commit();
        
        logAccess($data['user_id'], 'password_reset', $pdo);
        
        successResponse(null, 'Senha redefinida com sucesso! Você já pode fazer login.');
        
    } catch (PDOException $e) {
        if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Erro ao redefinir senha: " . $e->getMessage());
        errorResponse('Erro interno do servidor', 500);
    }
}

/**
 * Remover tokens expirados de recuperação
 */
function cleanupExpiredResetTokens($pdo) {
    try {
        $stmt = $pdo->prepare("DELETE FROM password_reset_tokens WHERE expires_at < NOW()");
        $stmt->execute();
    } catch (Exception $e) {
        error_log("Erro ao limpar tokens expirados: " . $e->getMessage());
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








