<?php
/**
 * Página do Decorador - Up.Baloes
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/decorador-service.php';

// --- CORREÇÃO DE CAMINHOS AUTOMÁTICA ---
$scriptDir = dirname($_SERVER['SCRIPT_NAME']); 
$baseUrl = str_replace('/services', '', $scriptDir); 
$baseUrl = rtrim($baseUrl, '/') . '/'; 
// ---------------------------------------

$slug = $_GET['slug'] ?? '';

if (empty($slug)) {
    header('Location: ' . $baseUrl . 'index.html');
    exit;
}

try {
    $decoratorService = new DecoratorService($database_config);
    $result = $decoratorService->getDecoratorBySlug($slug);
    
    if (!$result['success']) {
        http_response_code(404);
        echo "<h1>Decorador não encontrado ou aguardando aprovação.</h1>";
        exit;
    }
    
    $data = $result['data'];
    $decorator = $data['decorator'];
    $customization = $data['customization'];
    
    // Configuração visual segura
    $pageTitle = $customization['page_title'] ?? 'Bem-vindo à ' . $decorator['name'];
    $pageDesc = $customization['page_description'] ?? 'Decoração com balões';
    $primaryColor = $customization['primary_color'] ?? '#667eea';
    $secondaryColor = $customization['secondary_color'] ?? '#764ba2';
    
} catch (Exception $e) {
    die("Erro interno");
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle); ?></title>
    <link rel="icon" type="image/x-icon" href="<?php echo $baseUrl; ?>Images/favicon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="<?php echo $baseUrl; ?>css/estilos.css">
    <style>
        .decorator-hero {
            background: linear-gradient(135deg, <?php echo $primaryColor; ?> 0%, <?php echo $secondaryColor; ?> 100%);
        }
    </style>
</head>
<body>
    <nav class="fixed top-0 w-full z-50 bg-white/95 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
            <a href="<?php echo $baseUrl; ?>index.html" class="flex items-center gap-2 font-bold text-xl">
                <img src="<?php echo $baseUrl; ?>Images/Logo System.jpeg" class="w-10 h-10 rounded-full">
                Up.Baloes
            </a>
            <a href="<?php echo $baseUrl; ?>pages/solicitacao-cliente.html" class="bg-blue-600 text-white px-4 py-2 rounded-lg">
                Solicitar Orçamento
            </a>
        </div>
    </nav>

    <section class="decorator-hero text-white pt-32 pb-20 text-center px-4">
        <h1 class="text-4xl font-bold mb-4"><?php echo htmlspecialchars($pageTitle); ?></h1>
        <p class="text-xl opacity-90"><?php echo htmlspecialchars($pageDesc); ?></p>
    </section>

    <script src="<?php echo $baseUrl; ?>js/principal.js"></script>
</body>
</html>