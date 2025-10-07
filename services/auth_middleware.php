<?php
/**
 * Middleware de Autenticação JWT
 * Valida tokens JWT e protege rotas
 */

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;

require_once __DIR__ . '/config.new.php';

/**
 * Gerar token JWT para um usuário
 * 
 * @param array $userData Dados do usuário (id, nome, email, perfil)
 * @return string Token JWT gerado
 */
function generateJWT($userData) {
    global $jwt_config;
    
    $issuedAt = time();
    $expirationTime = $issuedAt + $jwt_config['expiration']; // 8 horas
    
    $payload = [
        'iat' => $issuedAt,              // Issued at: tempo de emissão
        'exp' => $expirationTime,        // Expire: tempo de expiração
        'iss' => $jwt_config['issuer'],  // Issuer: emissor do token
        'data' => [
            'user_id' => $userData['id'],
            'name' => $userData['name'],
            'email' => $userData['email'],
            'role' => $userData['role']
        ]
    ];
    
    try {
        $jwt = JWT::encode($payload, $jwt_config['secret'], $jwt_config['algorithm']);
        return $jwt;
    } catch (Exception $e) {
        logError('Erro ao gerar JWT: ' . $e->getMessage());
        return null;
    }
}

/**
 * Validar token JWT
 * 
 * @param string $token Token JWT a ser validado
 * @return array|null Dados do usuário se válido, null se inválido
 */
function validateJWT($token) {
    global $jwt_config;
    
    try {
        $decoded = JWT::decode($token, new Key($jwt_config['secret'], $jwt_config['algorithm']));
        return (array)$decoded->data;
    } catch (ExpiredException $e) {
        return ['error' => 'Token expirado', 'code' => 'TOKEN_EXPIRED'];
    } catch (Exception $e) {
        logError('Erro ao validar JWT: ' . $e->getMessage());
        return ['error' => 'Token inválido', 'code' => 'TOKEN_INVALID'];
    }
}

/**
 * Extrair token do cabeçalho Authorization
 * 
 * @return string|null Token extraído ou null se não encontrado
 */
function extractTokenFromHeader() {
    $headers = getallheaders();
    
    // Verificar header Authorization
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        
        // Formato esperado: "Bearer <token>"
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}

/**
 * Middleware: Requer autenticação JWT
 * Verifica se o usuário está autenticado via JWT
 * 
 * @param array $allowedRoles Array de perfis permitidos (opcional)
 * @return array Dados do usuário autenticado
 */
function requireAuth($allowedRoles = []) {
    // Extrair token do header
    $token = extractTokenFromHeader();
    
    if (!$token) {
        errorResponse('Token de autenticação não fornecido', 401, 'NO_TOKEN');
    }
    
    // Validar token
    $userData = validateJWT($token);
    
    if (isset($userData['error'])) {
        errorResponse($userData['error'], 401, $userData['code']);
    }
    
    // Verificar perfis permitidos
    if (!empty($allowedRoles) && !in_array($userData['role'], $allowedRoles)) {
        errorResponse('Você não tem permissão para acessar este recurso', 403, 'FORBIDDEN');
    }
    
    return $userData;
}

/**
 * Middleware: Requer autenticação de Admin
 * 
 * @return array Dados do usuário admin autenticado
 */
function requireAdminAuth() {
    return requireAuth(['admin']);
}

/**
 * Middleware: Requer autenticação de Decorador
 * 
 * @return array Dados do usuário decorador autenticado
 */
function requireDecoratorAuth() {
    return requireAuth(['decorator']);
}

/**
 * Middleware: Autenticação opcional
 * Retorna dados do usuário se autenticado, null caso contrário
 * 
 * @return array|null Dados do usuário ou null
 */
function optionalAuth() {
    $token = extractTokenFromHeader();
    
    if (!$token) {
        return null;
    }
    
    $userData = validateJWT($token);
    
    if (isset($userData['error'])) {
        return null;
    }
    
    return $userData;
}

/**
 * Verificar se o token precisa ser renovado (menos de 1 hora para expirar)
 * 
 * @param string $token Token JWT atual
 * @return bool True se precisa renovar, false caso contrário
 */
function shouldRefreshToken($token) {
    global $jwt_config;
    
    try {
        $decoded = JWT::decode($token, new Key($jwt_config['secret'], $jwt_config['algorithm']));
        $expiresAt = $decoded->exp;
        $now = time();
        
        // Renovar se faltar menos de 1 hora para expirar
        return ($expiresAt - $now) < 3600;
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Renovar token JWT
 * 
 * @param string $oldToken Token JWT antigo
 * @return string|null Novo token ou null se falhar
 */
function refreshJWT($oldToken) {
    $userData = validateJWT($oldToken);
    
    if (isset($userData['error'])) {
        return null;
    }
    
    return generateJWT([
        'id' => $userData['user_id'],
        'name' => $userData['name'],
        'email' => $userData['email'],
        'role' => $userData['role']
    ]);
}
?>




