<?php
/**
 * API para fornecer configurações do Google OAuth
 * Retorna apenas dados não sensíveis necessários para o frontend
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Tratar requisições OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../services/config.new.php';

// Verificar método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Método não permitido', 405);
}

// Retornar apenas as configurações necessárias para o frontend
// NUNCA retorne o client_secret
$response = [
    'client_id' => $google_config['client_id'] ?? '',
    'redirect_uri' => $google_config['redirect_uri'] ?? '',
    'configured' => !empty($google_config['client_id']) && !empty($google_config['client_secret'])
];

jsonResponse($response, 200);
?>


