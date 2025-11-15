<?php
/**
 * Serviço de gerenciamento do portfólio dos decoradores
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Método não permitido', 405);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id'])) {
    errorResponse('Usuário não autenticado', 401);
}

$decoratorId = (int) $_SESSION['user_id'];

// Capturar dados da requisição (JSON ou multipart/form-data)
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$input = [];

if (stripos($contentType, 'application/json') !== false) {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?? [];
} else {
    $input = $_POST;
}

$action = $input['action'] ?? '';

try {
    $pdo = getDatabaseConnection($database_config);

    switch ($action) {
        case 'list_portfolio_items':
            listPortfolioItems($pdo, $decoratorId);
            break;

        case 'get_portfolio_item':
            getPortfolioItem($pdo, $decoratorId, $input);
            break;

        case 'create_portfolio_item':
            createPortfolioItem($pdo, $decoratorId, $input, $_FILES);
            break;

        case 'update_portfolio_item':
            updatePortfolioItem($pdo, $decoratorId, $input, $_FILES);
            break;

        case 'delete_portfolio_item':
            deletePortfolioItem($pdo, $decoratorId, $input);
            break;

        case 'clear_portfolio':
            clearPortfolio($pdo, $decoratorId);
            break;

        default:
            errorResponse('Ação não reconhecida', 400);
    }
} catch (Exception $e) {
    error_log('Erro no serviço de portfólio: ' . $e->getMessage());
    errorResponse('Erro interno do servidor', 500);
}

/**
 * Listar itens do portfólio do decorador
 */
function listPortfolioItems(PDO $pdo, int $decoratorId): void {
    $stmt = $pdo->prepare("
        SELECT 
            id,
            service_type,
            title,
            description,
            price,
            arc_size,
            image_path,
            display_order,
            is_featured,
            is_active,
            created_at,
            updated_at
        FROM decorator_portfolio_items
        WHERE decorator_id = ? AND is_active = 1
        ORDER BY display_order DESC, created_at DESC
    ");
    $stmt->execute([$decoratorId]);
    $items = $stmt->fetchAll();

    $normalized = array_map('normalizePortfolioRow', $items);

    successResponse([
        'items' => $normalized,
        'total' => count($normalized)
    ], 'Portfólio carregado com sucesso.');
}

/**
 * Obter item específico do portfólio
 */
function getPortfolioItem(PDO $pdo, int $decoratorId, array $input): void {
    $itemId = (int) ($input['id'] ?? 0);

    if ($itemId <= 0) {
        errorResponse('ID do item é obrigatório.', 400);
    }

    $item = fetchPortfolioItem($pdo, $decoratorId, $itemId);

    successResponse([
        'item' => normalizePortfolioRow($item)
    ], 'Item carregado com sucesso.');
}

/**
 * Criar novo item do portfólio
 */
function createPortfolioItem(PDO $pdo, int $decoratorId, array $input, array $files): void {
    $type = trim($input['type'] ?? '');
    $title = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $price = normalizeDecimal($input['price'] ?? null);
    $arcSize = trim($input['arcSize'] ?? '');

    if ($type === '' || $title === '') {
        errorResponse('Tipo e título do serviço são obrigatórios.', 400);
    }

    $imagePath = handlePortfolioImageUpload($decoratorId, $files['image'] ?? null);
    $displayOrder = nextPortfolioOrder($pdo, $decoratorId);

    $stmt = $pdo->prepare("
        INSERT INTO decorator_portfolio_items (
            decorator_id,
            service_type,
            title,
            description,
            price,
            arc_size,
            image_path,
            display_order,
            is_featured,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            :decorator_id,
            :service_type,
            :title,
            :description,
            :price,
            :arc_size,
            :image_path,
            :display_order,
            0,
            1,
            NOW(),
            NOW()
        )
    ");

    $stmt->execute([
        'decorator_id' => $decoratorId,
        'service_type' => sanitizeInput($type),
        'title' => sanitizeInput($title),
        'description' => $description !== '' ? sanitizeInput($description) : null,
        'price' => $price,
        'arc_size' => $arcSize !== '' ? sanitizeInput($arcSize) : null,
        'image_path' => $imagePath,
        'display_order' => $displayOrder
    ]);

    $itemId = (int) $pdo->lastInsertId();
    $item = fetchPortfolioItem($pdo, $decoratorId, $itemId);

    successResponse([
        'item' => normalizePortfolioRow($item)
    ], 'Serviço adicionado ao portfólio com sucesso!');
}

/**
 * Atualizar item do portfólio
 */
function updatePortfolioItem(PDO $pdo, int $decoratorId, array $input, array $files): void {
    $itemId = (int) ($input['id'] ?? 0);

    if ($itemId <= 0) {
        errorResponse('ID do item é obrigatório.', 400);
    }

    $existing = fetchPortfolioItem($pdo, $decoratorId, $itemId);

    $type = trim($input['type'] ?? $existing['service_type']);
    $title = trim($input['title'] ?? $existing['title']);
    $description = trim($input['description'] ?? '');
    $price = array_key_exists('price', $input)
        ? normalizeDecimal($input['price'])
        : $existing['price'];
    $arcSize = trim($input['arcSize'] ?? ($existing['arc_size'] ?? ''));

    if ($type === '' || $title === '') {
        errorResponse('Tipo e título do serviço são obrigatórios.', 400);
    }

    $newImagePath = handlePortfolioImageUpload($decoratorId, $files['image'] ?? null, $existing['image_path'] ?? null);

    $stmt = $pdo->prepare("
        UPDATE decorator_portfolio_items
        SET
            service_type = :service_type,
            title = :title,
            description = :description,
            price = :price,
            arc_size = :arc_size,
            image_path = :image_path,
            updated_at = NOW()
        WHERE id = :id AND decorator_id = :decorator_id
    ");

    $stmt->execute([
        'service_type' => sanitizeInput($type),
        'title' => sanitizeInput($title),
        'description' => $description !== '' ? sanitizeInput($description) : null,
        'price' => $price,
        'arc_size' => $arcSize !== '' ? sanitizeInput($arcSize) : null,
        'image_path' => $newImagePath,
        'id' => $itemId,
        'decorator_id' => $decoratorId
    ]);

    $updated = fetchPortfolioItem($pdo, $decoratorId, $itemId);

    successResponse([
        'item' => normalizePortfolioRow($updated)
    ], 'Serviço atualizado com sucesso!');
}

/**
 * Excluir item do portfólio
 */
function deletePortfolioItem(PDO $pdo, int $decoratorId, array $input): void {
    $itemId = (int) ($input['id'] ?? 0);

    if ($itemId <= 0) {
        errorResponse('ID do item é obrigatório.', 400);
    }

    $item = fetchPortfolioItem($pdo, $decoratorId, $itemId);

    $stmt = $pdo->prepare("
        DELETE FROM decorator_portfolio_items
        WHERE id = ? AND decorator_id = ?
    ");
    $stmt->execute([$itemId, $decoratorId]);

    if (!empty($item['image_path'])) {
        deletePortfolioImage($item['image_path']);
    }

    successResponse(null, 'Serviço removido do portfólio.');
}

/**
 * Limpar portfólio do decorador
 */
function clearPortfolio(PDO $pdo, int $decoratorId): void {
    $stmt = $pdo->prepare("
        SELECT image_path
        FROM decorator_portfolio_items
        WHERE decorator_id = ?
    ");
    $stmt->execute([$decoratorId]);
    $images = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $deleteStmt = $pdo->prepare("
        DELETE FROM decorator_portfolio_items
        WHERE decorator_id = ?
    ");
    $deleteStmt->execute([$decoratorId]);

    foreach ($images as $path) {
        if ($path) {
            deletePortfolioImage($path);
        }
    }

    successResponse(null, 'Portfólio removido com sucesso.');
}

/**
 * Buscar item garantindo que pertença ao decorador
 */
function fetchPortfolioItem(PDO $pdo, int $decoratorId, int $itemId): array {
    $stmt = $pdo->prepare("
        SELECT 
            id,
            decorator_id,
            service_type,
            title,
            description,
            price,
            arc_size,
            image_path,
            display_order,
            is_featured,
            is_active,
            created_at,
            updated_at
        FROM decorator_portfolio_items
        WHERE id = ? AND decorator_id = ?
        LIMIT 1
    ");
    $stmt->execute([$itemId, $decoratorId]);
    $item = $stmt->fetch();

    if (!$item) {
        errorResponse('Item não encontrado.', 404);
    }

    return $item;
}

/**
 * Normalizar registro do banco para a resposta
 */
function normalizePortfolioRow(array $row): array {
    $relativeImage = null;
    if (!empty($row['image_path'])) {
        $relativeImage = '../' . ltrim($row['image_path'], '/');
    }

    return [
        'id' => (int) $row['id'],
        'type' => $row['service_type'],
        'title' => $row['title'],
        'description' => $row['description'] ?? '',
        'price' => $row['price'] !== null ? (float) $row['price'] : null,
        'arcSize' => $row['arc_size'] ?? '',
        'image' => $relativeImage,
        'image_path' => $row['image_path'],
        'display_order' => (int) ($row['display_order'] ?? 0),
        'is_featured' => (int) ($row['is_featured'] ?? 0),
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at']
    ];
}

/**
 * Calcular próximo display_order
 */
function nextPortfolioOrder(PDO $pdo, int $decoratorId): int {
    $stmt = $pdo->prepare("
        SELECT COALESCE(MAX(display_order), 0) + 1
        FROM decorator_portfolio_items
        WHERE decorator_id = ?
    ");
    $stmt->execute([$decoratorId]);
    return (int) $stmt->fetchColumn();
}

/**
 * Normalizar valores decimais (aceita vírgula)
 */
function normalizeDecimal($value) {
    if ($value === null || $value === '') {
        return null;
    }

    $clean = str_replace(['.', ','], ['', '.'], (string) $value);
    if (!is_numeric($clean)) {
        return null;
    }

    return number_format((float) $clean, 2, '.', '');
}

/**
 * Processar upload da imagem do portfólio
 */
function handlePortfolioImageUpload(int $decoratorId, ?array $file, ?string $existingPath = null): ?string {
    if (!$file || !isset($file['error']) || $file['error'] === UPLOAD_ERR_NO_FILE) {
        return $existingPath;
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        errorResponse('Não foi possível enviar a imagem. Código de erro: ' . $file['error'], 400);
    }

    if ($file['size'] > 5 * 1024 * 1024) {
        errorResponse('Imagem excede o tamanho máximo de 5MB.', 400);
    }

    $allowedMime = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp'
    ];

    $detectedMime = mime_content_type($file['tmp_name']);
    if (!$detectedMime || !array_key_exists($detectedMime, $allowedMime)) {
        errorResponse('Formato de imagem não suportado. Use JPG, PNG, GIF ou WebP.', 400);
    }

    $uploadDir = realpath(__DIR__ . '/../uploads');
    if (!$uploadDir) {
        $uploadDir = __DIR__ . '/../uploads';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
    }

    $portfolioDir = $uploadDir . '/portfolio';
    if (!is_dir($portfolioDir)) {
        mkdir($portfolioDir, 0755, true);
    }

    $extension = $allowedMime[$detectedMime];
    $filename = 'portfolio_' . $decoratorId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
    $destination = $portfolioDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        errorResponse('Não foi possível salvar a imagem enviada.', 500);
    }

    if ($existingPath && $existingPath !== $filename) {
        deletePortfolioImage($existingPath);
    }

    return 'uploads/portfolio/' . $filename;
}

/**
 * Remover imagem armazenada
 */
function deletePortfolioImage(string $relativePath): void {
    $basePath = realpath(__DIR__ . '/..');
    $filePath = realpath(__DIR__ . '/../' . ltrim($relativePath, '/'));

    if ($filePath && strpos($filePath, $basePath) === 0 && file_exists($filePath)) {
        @unlink($filePath);
    }
}













