<?php
/**
 * Página de Minhas Compras - Up.Baloes
 * Versão PHP dinâmica com contexto do decorador
 */

// Permitir carregamento em iframe do mesmo domínio (para preview)
header('X-Frame-Options: SAMEORIGIN');
// Definir Content-Type como HTML (não JSON)
header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/decorador-service.php';

// Função auxiliar para garantir URL base correta
function getCorrectBaseUrl() {
    global $urls;
    
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    
    // Lista de projetos conhecidos (priorizar Up.Bal-es)
    $knownProjects = ['Up.Bal-es', 'Up.BaloesV3', 'Up.Baloes'];
    
    // Tentar detectar do SCRIPT_NAME primeiro (mais confiável)
    $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
    if (preg_match('#^/([^/]+)#', $scriptName, $matches)) {
        $projectName = $matches[1];
        
        // Se detectou Up.BaloesV3, substituir por Up.Bal-es
        if ($projectName === 'Up.BaloesV3') {
            $base = $protocol . '://' . $host . '/Up.Bal-es/';
            $base = preg_replace('#([^:])//+#', '$1/', $base);
            return $base;
        }
        
        // Se for um projeto conhecido, usar ele (priorizar Up.Bal-es)
        if (in_array($projectName, $knownProjects)) {
            if ($projectName === 'Up.Bal-es') {
                $base = $protocol . '://' . $host . '/Up.Bal-es/';
                $base = preg_replace('#([^:])//+#', '$1/', $base);
                return $base;
            }
            $base = $protocol . '://' . $host . '/' . $projectName . '/';
            $base = preg_replace('#([^:])//+#', '$1/', $base);
            return $base;
        }
    }
    
    // Fallback padrão - sempre usar Up.Bal-es
    $base = $protocol . '://' . $host . '/Up.Bal-es/';
    return $base;
}

// Obter slug da URL
$slug = $_GET['slug'] ?? '';

// Se não houver slug, redirecionar para index
if (empty($slug)) {
    $baseUrl = getCorrectBaseUrl();
    header('Location: ' . $baseUrl . 'index.html');
    exit;
}

try {
    // Buscar dados do decorador
    $decoratorService = new DecoratorService($database_config);
    $result = $decoratorService->getDecoratorBySlug($slug);
    
    if (!$result['success']) {
        http_response_code(404);
        $baseUrl = getCorrectBaseUrl();
        ?>
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Decorador não encontrado - Up.Baloes</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50">
            <div class="min-h-screen flex items-center justify-center px-4">
                <div class="max-w-md w-full text-center">
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Decorador não encontrado</h1>
                    <p class="text-gray-600 mb-8">O decorador que você está procurando não foi encontrado.</p>
                    <a href="<?php echo $baseUrl; ?>index.html" 
                       class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                        Voltar para o Início
                    </a>
                </div>
            </div>
        </body>
        </html>
        <?php
        exit;
    }
    
    $data = $result['data'];
    $decorator = $data['decorator'];
    $customization = $data['customization'] ?? [];
    
    // Cores personalizadas
    $primaryColor = !empty($customization['primary_color']) && preg_match('/^#[0-9A-Fa-f]{6}$/', $customization['primary_color']) 
        ? $customization['primary_color'] : '#667eea';
    $secondaryColor = !empty($customization['secondary_color']) && preg_match('/^#[0-9A-Fa-f]{6}$/', $customization['secondary_color']) 
        ? $customization['secondary_color'] : '#764ba2';
    $accentColor = !empty($customization['accent_color']) && preg_match('/^#[0-9A-Fa-f]{6}$/', $customization['accent_color']) 
        ? $customization['accent_color'] : '#f59e0b';
    
    $decoratorId = $decorator['id'];
    $decoratorName = $decorator['name'] ?? $decorator['nome'] ?? 'Decorador';
    
    // Base URL para assets
    $baseUrl = getCorrectBaseUrl();
    
} catch (Exception $e) {
    error_log("Erro ao carregar página de minhas compras: " . $e->getMessage());
    http_response_code(500);
    $baseUrl = getCorrectBaseUrl();
    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erro - Up.Baloes</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen flex items-center justify-center px-4">
            <div class="max-w-md w-full text-center">
                <h1 class="text-3xl font-bold text-gray-900 mb-4">Erro ao carregar página</h1>
                <p class="text-gray-600 mb-8">Ocorreu um erro ao carregar a página. Tente novamente mais tarde.</p>
                <a href="<?php echo $baseUrl; ?>index.html" 
                   class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                    Voltar para o Início
                </a>
            </div>
        </body>
        </html>
    <?php
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minhas Compras - <?php echo htmlspecialchars($decoratorName); ?> - Up.Baloes</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="<?php echo $baseUrl; ?>Images/favicon.ico">
    <link rel="shortcut icon" type="image/x-icon" href="<?php echo $baseUrl; ?>Images/favicon.ico">
    <link rel="apple-touch-icon" href="<?php echo $baseUrl; ?>Images/favicon.ico">
    
    <!-- Font Awesome para ícones -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- TailwindCSS para estilos -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- CSS personalizado -->
    <link rel="stylesheet" href="<?php echo $baseUrl; ?>css/estilos.css">
    
    <style>
        :root {
            --primary-color: <?php echo $primaryColor; ?>;
            --secondary-color: <?php echo $secondaryColor; ?>;
            --accent-color: <?php echo $accentColor; ?>;
        }
        
        .btn-primary {
            background: var(--primary-color);
        }
        
        .btn-primary:hover {
            opacity: 0.9;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    
    <!-- Script de Proteção de Autenticação -->
    <script src="<?php echo $baseUrl; ?>js/auth-protection.js"></script>
    <script>
        // Proteger página de cliente contra navegação não autorizada
        (async function() {
            if (window.authProtection) {
                const isProtected = await window.authProtection.protectClientPage();
                if (isProtected) {
                    window.authProtection.protectBrowserNavigation('client');
                }
            }
        })();
    </script>
    
    <!-- Navbar -->
    <nav class="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo -->
                <div class="flex items-center space-x-3">
                    <a href="/<?php echo htmlspecialchars($slug); ?>" class="flex items-center space-x-3">
                        <div class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <img src="<?php echo $baseUrl; ?>Images/Logo System.jpeg" alt="Up.Baloes Logo" class="w-full h-full object-cover rounded-full">
                        </div>
                        <span class="text-xl font-bold text-gray-800">Up.Baloes</span>
                    </a>
                </div>
                
                <!-- Menu -->
                <div class="flex items-center space-x-4">
                    <a href="/<?php echo htmlspecialchars($slug); ?>" class="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-home mr-2"></i>Início
                    </a>
                    <a href="/<?php echo htmlspecialchars($slug); ?>/carrinho" class="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-shopping-cart mr-2"></i>Carrinho
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Conteúdo Principal -->
    <main class="py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-shopping-bag mr-3 text-blue-600"></i>Minhas Compras
                </h1>
                <p class="text-base sm:text-lg md:text-xl text-gray-600">
                    Acompanhe todas as suas solicitações de serviços
                </p>
            </div>

            <!-- Filtros -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div class="flex flex-col md:flex-row gap-4 items-center">
                    <label class="text-sm font-medium text-gray-700">Filtrar por status:</label>
                    <select id="status-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Todos</option>
                        <option value="pendente">Pendente</option>
                        <option value="aprovado">Confirmado</option>
                        <option value="recusado">Recusado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                    <button id="refresh-btn" class="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-sync-alt mr-2"></i>Atualizar
                    </button>
                </div>
            </div>

            <!-- Lista de Solicitações -->
            <div id="requests-container" class="space-y-4">
                <!-- Solicitações serão carregadas dinamicamente aqui -->
                <div id="loading-state" class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                    <p class="text-gray-600">Carregando suas solicitações...</p>
                </div>
                <div id="empty-state" class="text-center py-8 sm:py-12 hidden">
                    <i class="fas fa-inbox text-4xl sm:text-6xl text-gray-300 mb-3 sm:mb-4"></i>
                    <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Nenhuma solicitação encontrada</h3>
                    <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Você ainda não fez nenhuma solicitação de serviço.</p>
                    <a href="/<?php echo htmlspecialchars($slug); ?>#portfolio" class="inline-block px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-briefcase mr-2"></i>Ver Portfólio
                    </a>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal de Detalhes da Solicitação -->
    <div id="request-details-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden items-center justify-center p-2 sm:p-4">
        <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <!-- Header do Modal -->
            <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6 rounded-t-xl flex justify-between items-center">
                <h2 class="text-xl sm:text-2xl font-bold">
                    <i class="fas fa-info-circle mr-2"></i>Detalhes da Solicitação
                </h2>
                <button id="close-details-modal-btn" class="text-white hover:text-gray-200 transition-colors">
                    <i class="fas fa-times text-xl sm:text-2xl"></i>
                </button>
            </div>

            <!-- Conteúdo do Modal -->
            <div id="request-details-content" class="p-4 sm:p-6">
                <!-- Detalhes serão carregados dinamicamente aqui -->
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2025 Up.Baloes. Todos os direitos reservados.</p>
        </div>
    </footer>

    <!-- JavaScript -->
    <script src="<?php echo $baseUrl; ?>js/principal.js"></script>
    <script src="<?php echo $baseUrl; ?>js/minhas-compras.js"></script>
    <script>
        // Injetar decorator_id e slug no contexto global
        window.DECORATOR_ID = <?php echo json_encode($decoratorId); ?>;
        window.DECORATOR_SLUG = <?php echo json_encode($slug); ?>;
        window.BASE_URL = <?php echo json_encode($baseUrl); ?>;
        
        // Garantir que a proteção está ativa após carregar scripts
        document.addEventListener('DOMContentLoaded', function() {
            if (window.authProtection) {
                window.authProtection.protectBrowserNavigation('client');
            }
        });
    </script>
</body>
</html>

