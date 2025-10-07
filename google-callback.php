<?php
/**
 * Google OAuth 2.0 Callback Handler
 * Processa o retorno do Google após autenticação
 * IMPORTANTE: Só permite login para e-mails pré-cadastrados
 */

require_once __DIR__ . '/services/config.new.php';
require_once __DIR__ . '/services/auth_middleware.php';

// Iniciar sessão se ainda não foi iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Trocar código de autorização por access token
 */
function exchangeCodeForToken($code) {
    global $google_config;
    
    $tokenUrl = $google_config['token_url'];
    
    $postData = [
        'code' => $code,
        'client_id' => $google_config['client_id'],
        'client_secret' => $google_config['client_secret'],
        'redirect_uri' => $google_config['redirect_uri'],
        'grant_type' => 'authorization_code'
    ];
    
    $ch = curl_init($tokenUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        logError('Erro ao trocar código por token', ['response' => $response]);
        return null;
    }
    
    $data = json_decode($response, true);
    return $data['access_token'] ?? null;
}

/**
 * Obter informações do usuário do Google
 */
function getGoogleUserInfo($accessToken) {
    global $google_config;
    
    $userInfoUrl = $google_config['userinfo_url'];
    
    $ch = curl_init($userInfoUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $accessToken
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        logError('Erro ao obter informações do usuário do Google', ['response' => $response]);
        return null;
    }
    
    return json_decode($response, true);
}

/**
 * Verificar se o email do Google está cadastrado no sistema
 */
function checkGoogleEmailInDatabase($googleEmail) {
    global $database_config;
    
    try {
        $pdo = getDatabaseConnection($database_config);
        
        // Buscar usuário com este email Google cadastrado
        $stmt = $pdo->prepare("
            SELECT id, nome, email, perfil, ativo, aprovado_por_admin,
                   telefone, endereco, cidade, estado, cep, slug, google_email
            FROM usuarios 
            WHERE google_email = ? AND ativo = 1
        ");
        $stmt->execute([$googleEmail]);
        $user = $stmt->fetch();
        
        return $user ?: null;
        
    } catch (Exception $e) {
        logError('Erro ao verificar email do Google no banco de dados', ['error' => $e->getMessage()]);
        return null;
    }
}

/**
 * Redirecionar com mensagem de erro
 */
function redirectWithError($errorCode) {
    global $urls;
    header('Location: ' . $urls['login'] . '?error=' . $errorCode);
    exit;
}

/**
 * Redirecionar com sucesso (JWT no URL ou localStorage via JavaScript)
 */
function redirectWithSuccess($token, $userData) {
    global $urls;
    
    // Salvar token na sessão temporariamente
    $_SESSION['jwt_token'] = $token;
    $_SESSION['user_data'] = $userData;
    
    // Redirecionar baseado no perfil
    if ($userData['role'] === 'admin') {
        $redirectUrl = $urls['admin'];
    } elseif ($userData['role'] === 'decorator') {
        $redirectUrl = $urls['base'] . 'pages/painel-decorador.html';
    } else {
        $redirectUrl = $urls['dashboard'];
    }
    
    // Criar página HTML intermediária para salvar o token no localStorage
    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Autenticando...</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .loading {
                text-align: center;
                color: white;
            }
            .spinner {
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top: 4px solid white;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <div class="loading">
            <div class="spinner"></div>
            <h2>Autenticando com Google...</h2>
            <p>Redirecionando...</p>
        </div>
        
        <script>
            // Salvar token JWT e dados do usuário no localStorage
            const token = <?php echo json_encode($token); ?>;
            const userData = <?php echo json_encode($userData); ?>;
            
            localStorage.setItem('jwt_token', token);
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Redirecionar para a página apropriada
            setTimeout(function() {
                window.location.href = <?php echo json_encode($redirectUrl); ?>;
            }, 1000);
        </script>
    </body>
    </html>
    <?php
    exit;
}

// ====================================================================
// PROCESSAR CALLBACK DO GOOGLE
// ====================================================================

try {
    // Verificar se há um código de autorização
    if (!isset($_GET['code'])) {
        // Verificar se há erro retornado pelo Google
        if (isset($_GET['error'])) {
            logError('Erro no OAuth do Google', ['error' => $_GET['error']]);
            redirectWithError('google_auth_denied');
        }
        
        redirectWithError('google_auth_missing_code');
    }
    
    $code = $_GET['code'];
    
    // Trocar código por access token
    $accessToken = exchangeCodeForToken($code);
    
    if (!$accessToken) {
        redirectWithError('google_token_exchange_failed');
    }
    
    // Obter informações do usuário do Google
    $googleUser = getGoogleUserInfo($accessToken);
    
    if (!$googleUser || !isset($googleUser['email'])) {
        redirectWithError('google_userinfo_failed');
    }
    
    $googleEmail = $googleUser['email'];
    $googleName = $googleUser['name'] ?? '';
    $googlePicture = $googleUser['picture'] ?? '';
    
    // Verificar se o email do Google está cadastrado no sistema
    $user = checkGoogleEmailInDatabase($googleEmail);
    
    if (!$user) {
        // Email não está cadastrado - NÃO criar conta automaticamente
        logError('Tentativa de login com Google usando email não cadastrado', [
            'email' => $googleEmail,
            'name' => $googleName
        ]);
        redirectWithError('google_email_not_found');
    }
    
    // Verificar se é decorador e se está aprovado
    if ($user['perfil'] === 'decorator' && !$user['aprovado_por_admin']) {
        redirectWithError('decorator_not_approved');
    }
    
    // Preparar dados do usuário para o token JWT
    $userData = [
        'id' => $user['id'],
        'name' => $user['nome'],
        'email' => $user['email'],
        'role' => $user['perfil']
    ];
    
    // Gerar token JWT
    $token = generateJWT($userData);
    
    if (!$token) {
        redirectWithError('jwt_generation_failed');
    }
    
    // Registrar log de acesso
    try {
        $pdo = getDatabaseConnection($database_config);
        $stmt = $pdo->prepare("
            INSERT INTO access_logs (user_id, action, ip_address, user_agent, created_at) 
            VALUES (?, 'login_google', ?, ?, NOW())
        ");
        $stmt->execute([
            $user['id'],
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
    } catch (Exception $e) {
        logError('Erro ao registrar log de acesso do Google', ['error' => $e->getMessage()]);
    }
    
    // Redirecionar com sucesso
    redirectWithSuccess($token, $userData);
    
} catch (Exception $e) {
    logError('Erro inesperado no callback do Google', ['error' => $e->getMessage()]);
    redirectWithError('google_unexpected_error');
}
?>


