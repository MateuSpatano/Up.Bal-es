<?php
/**
 * API de Autenticação com JWT
 * Endpoint para login de usuários com geração de token JWT
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Tratar requisições OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../services/config.new.php';
require_once __DIR__ . '/../services/auth_middleware.php';

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
    
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    
    // Validações
    if (empty($email) || empty($password)) {
        errorResponse('Email e senha são obrigatórios', 400);
    }
    
    if (!validateEmail($email)) {
        errorResponse('Email inválido', 400);
    }
    
    // Conectar ao banco de dados
    $pdo = getDatabaseConnection($database_config);
    
    // Buscar usuário no banco
    $stmt = $pdo->prepare("
        SELECT id, nome, email, senha, perfil, ativo, aprovado_por_admin,
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
    
    // Verificar se é decorador e se está aprovado
    if ($user['perfil'] === 'decorator' && !$user['aprovado_por_admin']) {
        errorResponse('Sua conta de decorador ainda não foi aprovada pelo administrador. Aguarde a aprovação.', 403);
    }
    
    // Preparar dados do usuário para o token
    $userData = [
        'id' => $user['id'],
        'name' => $user['nome'],
        'email' => $user['email'],
        'role' => $user['perfil']
    ];
    
    // Gerar token JWT
    $token = generateJWT($userData);
    
    if (!$token) {
        errorResponse('Erro ao gerar token de autenticação', 500);
    }
    
    // Log de acesso
    try {
        $stmt = $pdo->prepare("
            INSERT INTO access_logs (user_id, action, ip_address, user_agent, created_at) 
            VALUES (?, 'login_jwt', ?, ?, NOW())
        ");
        $stmt->execute([
            $user['id'],
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
    } catch (Exception $e) {
        logError('Erro ao registrar log de acesso: ' . $e->getMessage());
    }
    
    // Preparar resposta completa
    $response = [
        'success' => true,
        'message' => 'Login realizado com sucesso!',
        'token' => $token,
        'user' => [
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
        ]
    ];
    
    jsonResponse($response, 200);
    
} catch (PDOException $e) {
    logError('Erro no login JWT: ' . $e->getMessage());
    errorResponse('Erro interno do servidor', 500);
} catch (Exception $e) {
    logError('Erro inesperado no login JWT: ' . $e->getMessage());
    errorResponse($e->getMessage(), 500);
}
?>




