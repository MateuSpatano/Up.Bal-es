<?php
/**
 * Página do Decorador - Up.Baloes
 * Template mestre baseado no index.html para páginas públicas de decoradores
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
    $requestUri = $_SERVER['REQUEST_URI'] ?? '';
    $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
    
    // Lista de projetos conhecidos (priorizar Up.Bal-es)
    $knownProjects = ['Up.Bal-es', 'Up.BaloesV3', 'Up.Baloes'];
    
    // 1. Tentar detectar do REQUEST_URI primeiro
    // Exemplo: /Up.Bal-es/mateus-rian-da-silva-teixeira
    if (preg_match('#^/([^/]+)#', $requestUri, $matches)) {
        $firstSegment = $matches[1];
        // Verificar se é um nome de projeto conhecido
        if (in_array($firstSegment, $knownProjects)) {
            $base = $protocol . '://' . $host . '/' . $firstSegment . '/';
            $base = preg_replace('#([^:])//+#', '$1/', $base);
            error_log("Base URL detectada do REQUEST_URI (projeto conhecido): $base");
            return $base;
        }
    }
    
    // 2. Tentar do SCRIPT_NAME (mais confiável quando acessado via rewrite)
    // Exemplo: /Up.Bal-es/services/pagina-decorador.php
    if (preg_match('#^/([^/]+)#', $scriptName, $matches)) {
        $projectName = $matches[1];
        
        // PRIMEIRO: Se detectou Up.BaloesV3, substituir por Up.Bal-es
        if ($projectName === 'Up.BaloesV3') {
            $base = $protocol . '://' . $host . '/Up.Bal-es/';
            $base = preg_replace('#([^:])//+#', '$1/', $base);
            error_log("Base URL corrigida de Up.BaloesV3 para Up.Bal-es (SCRIPT_NAME): $base");
            return $base;
        }
        
        // Se for um projeto conhecido, usar ele (priorizar Up.Bal-es)
        if (in_array($projectName, $knownProjects)) {
            // Se for Up.Bal-es, usar diretamente
            if ($projectName === 'Up.Bal-es') {
                $base = $protocol . '://' . $host . '/Up.Bal-es/';
                $base = preg_replace('#([^:])//+#', '$1/', $base);
                error_log("Base URL detectada do SCRIPT_NAME (Up.Bal-es): $base");
                return $base;
            }
            // Se for outro projeto conhecido, também usar
            $base = $protocol . '://' . $host . '/' . $projectName . '/';
            $base = preg_replace('#([^:])//+#', '$1/', $base);
            error_log("Base URL detectada do SCRIPT_NAME (projeto conhecido): $base");
            return $base;
        }
    }
    
    // 3. Verificar se $urls está configurado e usar ele (mas validar e corrigir)
    if (isset($urls) && !empty($urls['base'])) {
        $base = rtrim($urls['base'], '/') . '/';
        
        // Se contém Up.BaloesV3, substituir por Up.Bal-es
        if (strpos($base, 'Up.BaloesV3') !== false) {
            $base = str_replace('Up.BaloesV3', 'Up.Bal-es', $base);
            $base = preg_replace('#([^:])//+#', '$1/', $base);
            error_log("Base URL corrigida de \$urls['base'] (Up.BaloesV3 -> Up.Bal-es): $base");
            return $base;
        }
        
        // Verificar se contém um projeto conhecido
        foreach ($knownProjects as $project) {
            if (strpos($base, $project) !== false) {
                $base = preg_replace('#([^:])//+#', '$1/', $base);
                error_log("Base URL usando \$urls['base']: $base");
                return $base;
            }
        }
        // Se não contém projeto conhecido, pode estar errado - usar fallback
    }
    
    // 4. Último fallback - sempre usar Up.Bal-es
    $base = $protocol . '://' . $host . '/Up.Bal-es/';
    error_log("Base URL usando fallback padrão (Up.Bal-es): $base");
    return $base;
}

// Obter slug da URL
$slug = $_GET['slug'] ?? '';

// Log detalhado para debug
error_log("=== PÁGINA DECORADOR ===");
error_log("REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'N/A'));
error_log("SCRIPT_NAME: " . ($_SERVER['SCRIPT_NAME'] ?? 'N/A'));
error_log("QUERY_STRING: " . ($_SERVER['QUERY_STRING'] ?? 'N/A'));
error_log("GET params: " . json_encode($_GET));
error_log("Slug recebido: " . $slug);
error_log("HTTP_REFERER: " . ($_SERVER['HTTP_REFERER'] ?? 'N/A'));

if (empty($slug)) {
    error_log("Slug vazio, redirecionando para index");
    // Detectar base URL automaticamente
    $baseUrl = getCorrectBaseUrl();
    header('Location: ' . $baseUrl . 'index.html');
    exit;
}

try {
    // Verificar se é uma requisição de preview (vem de iframe do painel)
    $isPreview = isset($_GET['preview']) || 
                 (isset($_SERVER['HTTP_REFERER']) && strpos($_SERVER['HTTP_REFERER'], 'painel-decorador') !== false) ||
                 (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest');
    
    error_log("Acesso à página - Slug: $slug, IsPreview: " . ($isPreview ? 'sim' : 'não'));
    
    // Se for preview, buscar decorador sem filtros de aprovação
    if ($isPreview) {
        error_log("Modo PREVIEW ativado - buscando decorador sem filtros de aprovação");
        $pdo = getDatabaseConnection($database_config);
        
        // Buscar decorador pelo slug (sem filtros de ativo/aprovado)
        // Remover colunas que podem não existir: whatsapp, instagram
        $stmt = $pdo->prepare("
            SELECT 
                id, nome as name, email, 
                COALESCE(email_comunicacao, email) as communication_email,
                telefone, slug, bio, especialidades,
                perfil, ativo, aprovado_por_admin, redes_sociais
            FROM usuarios 
            WHERE slug = ? AND perfil = 'decorator'
        ");
        $stmt->execute([$slug]);
        $decorator = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($decorator) {
            error_log("Decorador encontrado no modo preview - ID: {$decorator['id']}, Nome: {$decorator['name']}, Ativo: {$decorator['ativo']}, Aprovado: {$decorator['aprovado_por_admin']}");
            
            // Buscar customização (buscar a mais recente, independente de is_active para preview)
            $stmt = $pdo->prepare("
                SELECT 
                    page_title, page_description, welcome_text, cover_image_url,
                    primary_color, secondary_color, accent_color,
                    services_config, social_media,
                    meta_title, meta_description, meta_keywords,
                    show_contact_section, show_services_section, show_portfolio_section
                FROM decorator_page_customization
                WHERE decorator_id = ?
                ORDER BY updated_at DESC, created_at DESC
                LIMIT 1
            ");
            $stmt->execute([$decorator['id']]);
            $customization = $stmt->fetch(PDO::FETCH_ASSOC);
            
            error_log("Customização encontrada no preview - Decorator ID: {$decorator['id']}, Customização: " . json_encode($customization));
            
            // Se não houver customização, criar uma padrão
            if (!$customization) {
                error_log("Nenhuma customização encontrada para decorator ID {$decorator['id']}, usando valores padrão");
                $customization = [
                    'page_title' => null,
                    'page_description' => null,
                    'welcome_text' => null,
                    'cover_image_url' => null,
                    'primary_color' => '#667eea',
                    'secondary_color' => '#764ba2',
                    'accent_color' => '#f59e0b',
                    'services_config' => null,
                    'social_media' => null,
                    'meta_title' => null,
                    'meta_description' => null,
                    'meta_keywords' => null,
                    'show_contact_section' => true,
                    'show_services_section' => true,
                    'show_portfolio_section' => true
                ];
            } else {
                error_log("Customização encontrada - Título: {$customization['page_title']}, Cor Primária: {$customization['primary_color']}, Cor Secundária: {$customization['secondary_color']}, Cor Destaque: {$customization['accent_color']}");
            }
            
            // Processar JSON fields
            if (!empty($customization['services_config'])) {
                $servicesConfig = json_decode($customization['services_config'], true);
                $customization['services'] = $servicesConfig ?: [];
            } else {
                $customization['services'] = [];
            }
            
            if (!empty($customization['social_media'])) {
                $socialMedia = json_decode($customization['social_media'], true);
                $customization['social_media'] = $socialMedia ?: [];
            } else {
                $customization['social_media'] = [];
            }
            
            // Buscar itens do portfólio (mesmo que não estejam ativos)
            $stmt = $pdo->prepare("
                SELECT 
                    id, service_type, title, description, price,
                    arc_size, image_path, display_order,
                    is_featured, is_active
                FROM decorator_portfolio_items
                WHERE decorator_id = ?
                ORDER BY display_order ASC, created_at DESC
            ");
            $stmt->execute([$decorator['id']]);
            $portfolio = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Processar caminhos das imagens
            $baseUrl = getCorrectBaseUrl();
            foreach ($portfolio as &$item) {
                if (!empty($item['image_path'])) {
                    $item['image_url'] = $baseUrl . ltrim($item['image_path'], '/');
                } else {
                    $item['image_url'] = null;
                }
            }
            unset($item);
            
            // Criar resultado compatível
            $result = [
                'success' => true,
                'data' => [
                    'decorator' => $decorator,
                    'customization' => $customization,
                    'services' => $customization['services'] ?? [],
                    'portfolio' => $portfolio
                ]
            ];
        } else {
            error_log("Nenhum decorador encontrado com slug: $slug");
            $result = ['success' => false, 'message' => 'Decorador não encontrado'];
        }
    } else {
        // Busca normal (público) - requer aprovação e estar ativo
        error_log("Modo PÚBLICO - buscando decorador com filtros de aprovação");
        $decoratorService = new DecoratorService($database_config);
        $result = $decoratorService->getDecoratorBySlug($slug);
    }
    
    error_log("Resultado da busca: " . json_encode($result));
    
    if (!$result['success']) {
        error_log("Decorador não encontrado ou inativo: " . $slug);
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
                    <div class="mb-8">
                        <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Decorador não encontrado</h1>
                    <p class="text-gray-600 mb-8">
                        O decorador que você está procurando não foi encontrado ou está aguardando aprovação.
                    </p>
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
    
    // Decorador encontrado e ativo
    if (!isset($result['data']) || empty($result['data'])) {
        throw new Exception('Dados do decorador não encontrados no resultado');
    }
    
    $data = $result['data'];
    
    if (!isset($data['decorator']) || empty($data['decorator'])) {
        throw new Exception('Informações do decorador não encontradas');
    }
    
    $decorator = $data['decorator'];
    $customization = $data['customization'] ?? [];
    $services = $data['services'] ?? [];
    $portfolio = $data['portfolio'] ?? [];
    
    $decoratorName = $decorator['name'] ?? $decorator['nome'] ?? 'Decorador';
    error_log("Decorador carregado com sucesso: " . $decoratorName);
    
    // Configurações da página
    // Garantir que os valores sejam aplicados corretamente
    $pageTitle = !empty($customization['page_title']) ? htmlspecialchars($customization['page_title']) : ('Bem-vindo à ' . htmlspecialchars($decoratorName));
    $pageDesc = !empty($customization['page_description']) ? htmlspecialchars($customization['page_description']) : 'Decoração profissional com balões';
    $welcomeText = !empty($customization['welcome_text']) ? $customization['welcome_text'] : '';
    // Sempre usar imagem de capa padrão (não usar cover_image_url personalizada)
    $coverImage = '';
    
    // Cores personalizadas - garantir que sejam válidas
    $primaryColor = !empty($customization['primary_color']) && preg_match('/^#[0-9A-Fa-f]{6}$/', $customization['primary_color']) 
        ? $customization['primary_color'] : '#667eea';
    $secondaryColor = !empty($customization['secondary_color']) && preg_match('/^#[0-9A-Fa-f]{6}$/', $customization['secondary_color']) 
        ? $customization['secondary_color'] : '#764ba2';
    $accentColor = !empty($customization['accent_color']) && preg_match('/^#[0-9A-Fa-f]{6}$/', $customization['accent_color']) 
        ? $customization['accent_color'] : '#f59e0b';
    
    error_log("Personalizações aplicadas - Título: $pageTitle, Cor Primária: $primaryColor, Cor Secundária: $secondaryColor, Cor Destaque: $accentColor");
    
    // Redes sociais
    $socialMedia = [];
    if (isset($customization['social_media'])) {
        if (is_string($customization['social_media'])) {
            $socialMedia = json_decode($customization['social_media'], true) ?: [];
        } elseif (is_array($customization['social_media'])) {
            $socialMedia = $customization['social_media'];
        }
    }
    
    // Contato
    $contactEmail = $decorator['communication_email'] ?? $decorator['email'] ?? '';
    
    // WhatsApp e Instagram podem estar em redes_sociais (JSON) ou não existir como colunas separadas
    $redesSociais = [];
    if (!empty($decorator['redes_sociais'])) {
        if (is_string($decorator['redes_sociais'])) {
            $redesSociais = json_decode($decorator['redes_sociais'], true) ?: [];
        } elseif (is_array($decorator['redes_sociais'])) {
            $redesSociais = $decorator['redes_sociais'];
        }
    }
    
    // Tentar obter WhatsApp e Instagram de várias fontes
    $contactWhatsapp = $decorator['whatsapp'] ?? $redesSociais['whatsapp'] ?? $socialMedia['whatsapp'] ?? '';
    $contactInstagram = $decorator['instagram'] ?? $redesSociais['instagram'] ?? $socialMedia['instagram'] ?? '';
    
    // Base URL para assets - usar função auxiliar para garantir correção
    $baseUrl = getCorrectBaseUrl();
    error_log("Base URL final usada na página do decorador: $baseUrl");
    
} catch (Exception $e) {
    error_log("Erro ao carregar página do decorador: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    error_log("File: " . $e->getFile() . " Line: " . $e->getLine());
    
    http_response_code(500);
    
    // Garantir que $baseUrl está disponível usando função auxiliar
    $baseUrl = getCorrectBaseUrl();
    
    // Em desenvolvimento, mostrar mais detalhes do erro
    $showDetails = (defined('ENVIRONMENT') && ENVIRONMENT === 'development');
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
                <?php if ($showDetails): ?>
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
                        <p class="text-sm text-red-800"><strong>Erro:</strong> <?php echo htmlspecialchars($e->getMessage()); ?></p>
                        <p class="text-xs text-red-600 mt-2"><strong>Arquivo:</strong> <?php echo htmlspecialchars($e->getFile()); ?></p>
                        <p class="text-xs text-red-600"><strong>Linha:</strong> <?php echo $e->getLine(); ?></p>
                    </div>
                <?php endif; ?>
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
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?> - Up.Baloes</title>
    <meta name="description" content="<?php echo $pageDesc; ?>">
    <?php if (!empty($customization['meta_title'])): ?>
        <meta property="og:title" content="<?php echo htmlspecialchars($customization['meta_title']); ?>">
    <?php endif; ?>
    <?php if (!empty($customization['meta_description'])): ?>
        <meta property="og:description" content="<?php echo htmlspecialchars($customization['meta_description']); ?>">
    <?php endif; ?>
    <?php if (!empty($customization['meta_keywords'])): ?>
        <meta name="keywords" content="<?php echo htmlspecialchars($customization['meta_keywords']); ?>">
    <?php endif; ?>
    
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
        
        .decorator-hero {
            background: linear-gradient(135deg, <?php echo $primaryColor; ?> 0%, <?php echo $secondaryColor; ?> 100%);
        }
        
        .btn-primary {
            background: var(--primary-color);
        }
        
        .btn-primary:hover {
            opacity: 0.9;
        }
        
        .nav-link {
            color: #374151;
        }
        
        .nav-link:hover {
            color: var(--primary-color);
        }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    
    <!-- Navbar Fixa -->
    <nav id="navbar" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-18 sm:h-20">
                
                <!-- Logo do Sistema -->
                <div class="flex items-center space-x-3">
                    <div class="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg logo-container">
                        <img src="<?php echo $baseUrl; ?>Images/Logo System.jpeg" alt="Up.Baloes Logo" class="w-full h-full object-cover rounded-full logo-image">
                    </div>
                    <span class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 hidden sm:block">Up.Baloes</span>
                </div>

                <!-- Menu de Navegação -->
                <div class="hidden md:flex items-center space-x-8">
                    <a href="#inicio" class="nav-link text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-home mr-2"></i>Início
                    </a>
                    <?php if (!empty($portfolio)): ?>
                    <a href="#portfolio" class="nav-link text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-briefcase mr-2"></i>Portfólio
                    </a>
                    <?php endif; ?>
                    <a href="#contatos" class="nav-link text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-phone mr-2"></i>Contatos
                    </a>
                    <a href="<?php echo $baseUrl; ?>pages/carrinho-cliente.html" class="nav-link text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium relative">
                        <i class="fas fa-shopping-cart mr-2"></i>Carrinho
                        <span class="cart-badge absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
                    </a>
                </div>

                <!-- Menu Mobile -->
                <div class="md:hidden">
                    <button id="mobile-menu-btn" class="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>

                <!-- Menu do Usuário -->
                <div class="relative">
                    <button id="user-menu-btn" class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 bg-gray-100 hover:bg-gray-200 rounded-full p-2">
                        <i class="fas fa-user text-lg"></i>
                        <span class="hidden sm:block font-medium">Usuário</span>
                        <i class="fas fa-chevron-down text-sm"></i>
                    </button>

                    <!-- Dropdown do Usuário -->
                    <div id="user-dropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible transition-all duration-200 transform translate-y-2">
                        <div class="py-2">
                            <a href="<?php echo $baseUrl; ?>pages/login.html?return=<?php echo urlencode($_SERVER['REQUEST_URI']); ?>" id="login-menu-item" class="dropdown-item flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
                                <i class="fas fa-sign-in-alt mr-3"></i>Login
                            </a>
                            <a href="<?php echo $baseUrl; ?>pages/minhas-compras.html" id="minhas-compras-menu-item" class="dropdown-item flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 hidden">
                                <i class="fas fa-shopping-bag mr-3"></i>Minhas Compras
                            </a>
                            <a href="#" id="painel-admin-link" class="dropdown-item flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 hidden">
                                <i class="fas fa-tachometer-alt mr-3"></i>Painel Admin
                            </a>
                            <a href="#" id="painel-decorador-link" class="dropdown-item flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 hidden">
                                <i class="fas fa-palette mr-3"></i>Painel Decorador
                            </a>
                            <a href="#" id="account-management-link" class="dropdown-item flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
                                <i class="fas fa-user-cog mr-3"></i>Gestão de Conta
                            </a>
                            <a href="<?php echo $baseUrl; ?>pages/admin-login.html" class="dropdown-item flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">
                                <i class="fas fa-crown mr-3"></i>Área Administrativa
                            </a>
                            <hr class="my-1 border-gray-200">
                            <a href="#" id="logout-link" class="dropdown-item flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200 hidden">
                                <i class="fas fa-sign-out-alt mr-3"></i>Logout
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Menu Mobile Expandido -->
        <div id="mobile-menu" class="md:hidden bg-white border-t border-gray-200 opacity-0 invisible transition-all duration-200">
            <div class="px-4 py-3 space-y-2">
                <a href="#inicio" class="mobile-nav-link block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded-lg">
                    <i class="fas fa-home mr-3"></i>Início
                </a>
                <?php if (!empty($portfolio)): ?>
                <a href="#portfolio" class="mobile-nav-link block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded-lg">
                    <i class="fas fa-briefcase mr-3"></i>Portfólio
                </a>
                <?php endif; ?>
                <a href="#contatos" class="mobile-nav-link block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded-lg">
                    <i class="fas fa-phone mr-3"></i>Contatos
                </a>
                <a href="<?php echo $baseUrl; ?>pages/carrinho-cliente.html" class="mobile-nav-link block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded-lg">
                    <i class="fas fa-shopping-cart mr-3"></i>Carrinho
                </a>
            </div>
        </div>
    </nav>

    <!-- Conteúdo Principal -->
    <main class="pt-18 sm:pt-20">
        <!-- Hero Section -->
        <section id="inicio" class="relative decorator-hero text-white py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center">
                    <h1 class="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                        <?php echo $pageTitle; ?>
                    </h1>
                    <p class="text-xl md:text-2xl mb-8 text-blue-100 animate-fade-in-delay">
                        <?php echo $pageDesc; ?>
                    </p>
                    <?php if ($welcomeText): ?>
                        <p class="text-lg max-w-3xl mx-auto opacity-90 mb-8">
                            <?php echo nl2br(htmlspecialchars($welcomeText)); ?>
                        </p>
                    <?php endif; ?>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
                        <a href="<?php echo $baseUrl; ?>pages/solicitacao-cliente.html?decorador=<?php echo urlencode($slug); ?>" 
                           class="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg inline-block text-center">
                            <i class="fas fa-gift mr-2"></i>Solicitar Serviço
                        </a>
                        <a href="<?php echo $baseUrl; ?>pages/cadastro.html?return=<?php echo urlencode($_SERVER['REQUEST_URI']); ?>" 
                           class="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg inline-block text-center">
                            <i class="fas fa-user-plus mr-2"></i>Criar Conta
                        </a>
                        <a href="<?php echo $baseUrl; ?>pages/login.html?return=<?php echo urlencode($_SERVER['REQUEST_URI']); ?>" 
                           class="border-2 border-white hover:bg-white hover:text-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 inline-block text-center">
                            <i class="fas fa-sign-in-alt mr-2"></i>Fazer Login
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- Seção de Serviços -->
        <?php if (!empty($services)): ?>
        <section id="servicos" class="py-20 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Nossos Serviços
                    </h2>
                    <p class="text-xl text-gray-600">
                        Conheça os serviços que oferecemos para tornar seu evento especial
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <?php foreach ($services as $service): ?>
                    <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        <?php if (!empty($service['icon'])): ?>
                        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background: var(--primary-color);">
                            <i class="<?php echo htmlspecialchars($service['icon']); ?> text-white text-2xl"></i>
                        </div>
                        <?php endif; ?>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3"><?php echo htmlspecialchars($service['title']); ?></h3>
                        <p class="text-gray-600 mb-4"><?php echo htmlspecialchars($service['description']); ?></p>
                        <?php if (!empty($service['price'])): ?>
                            <p class="text-lg font-bold" style="color: var(--primary-color);">
                                A partir de R$ <?php echo number_format($service['price'], 2, ',', '.'); ?>
                            </p>
                        <?php endif; ?>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>
        <?php endif; ?>

        <!-- Seção de Portfólio -->
        <?php if (!empty($portfolio)): ?>
        <section id="portfolio" class="py-20 bg-gray-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Nosso Portfólio
                    </h2>
                    <p class="text-xl text-gray-600">
                        Conheça alguns dos nossos trabalhos e serviços especializados
                    </p>
                </div>

                <!-- Grid de Portfólio -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <?php foreach ($portfolio as $item): ?>
                    <div class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition portfolio-card" 
                         data-item-id="<?php echo htmlspecialchars($item['id']); ?>"
                         data-item-type="<?php echo htmlspecialchars($item['service_type']); ?>"
                         data-item-title="<?php echo htmlspecialchars($item['title']); ?>"
                         data-item-description="<?php echo htmlspecialchars($item['description'] ?? ''); ?>"
                         data-item-price="<?php echo htmlspecialchars($item['price'] ?? '0'); ?>"
                         data-item-arc-size="<?php echo htmlspecialchars($item['arc_size'] ?? ''); ?>"
                         data-item-image="<?php echo htmlspecialchars($item['image_url'] ?? ''); ?>"
                         data-decorator-id="<?php echo htmlspecialchars($decorator['id']); ?>">
                        <div class="relative">
                            <?php if (!empty($item['image_url'])): ?>
                                <img src="<?php echo htmlspecialchars($item['image_url']); ?>" 
                                     alt="<?php echo htmlspecialchars($item['title']); ?>"
                                     class="w-full h-64 object-cover portfolio-image"
                                     onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div class="w-full h-64 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center portfolio-image-placeholder" style="display:none;">
                                    <i class="fas fa-image text-4xl text-gray-400"></i>
                                </div>
                            <?php else: ?>
                                <div class="w-full h-64 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                    <i class="fas fa-image text-4xl text-gray-400"></i>
                                </div>
                            <?php endif; ?>
                        </div>
                        
                        <div class="p-6">
                            <h3 class="text-xl font-bold mb-2"><?php echo htmlspecialchars($item['title']); ?></h3>
                            
                            <?php if (!empty($item['description'])): ?>
                                <p class="text-gray-600 mb-3 text-sm line-clamp-2"><?php echo htmlspecialchars($item['description']); ?></p>
                            <?php endif; ?>
                            
                            <?php if (!empty($item['price'])): ?>
                                <p class="text-lg font-bold mb-4" style="color: var(--primary-color);">
                                    R$ <?php echo number_format($item['price'], 2, ',', '.'); ?>
                                </p>
                            <?php endif; ?>
                            
                            <button onclick="addPortfolioItemToCart(this)" 
                                    class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 add-to-cart-btn">
                                <i class="fas fa-shopping-cart"></i>
                                <span>Selecionar</span>
                            </button>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>
        <?php endif; ?>

        <!-- Seção de Contatos -->
        <section id="contatos" class="py-20 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 relative overflow-hidden">
            <!-- Decoração de fundo -->
            <div class="absolute inset-0 opacity-20">
                <div class="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div class="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style="animation-delay: 2s;"></div>
                <div class="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style="animation-delay: 4s;"></div>
            </div>
            
            <!-- Padrão de pontos decorativo -->
            <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
            
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div class="text-center mb-16">
                    <div class="inline-block mb-4">
                        <span class="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                            <i class="fas fa-phone-alt mr-2"></i>Contato
                        </span>
                    </div>
                    <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">
                        Entre em Contato
                    </h2>
                    <p class="text-xl text-gray-300 max-w-2xl mx-auto">
                        Fale conosco através dos nossos canais de comunicação. Estamos prontos para ajudar você!
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    <!-- Email -->
                    <?php if ($contactEmail): ?>
                    <div class="group relative">
                        <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                        <div class="relative bg-white rounded-2xl p-8 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-2 border border-gray-200">
                            <div class="flex flex-col items-center text-center">
                                <div class="relative mb-6">
                                    <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition duration-300"></div>
                                    <div class="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition duration-300">
                                        <i class="fas fa-envelope text-white text-3xl"></i>
                                    </div>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800 mb-2">E-mail</h3>
                                <p class="text-sm text-gray-500 mb-4">Envie sua mensagem</p>
                                <a href="mailto:<?php echo htmlspecialchars($contactEmail); ?>" 
                                   class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg text-blue-700 hover:text-blue-900 font-medium transition-all duration-300 transform hover:scale-105 w-full break-all">
                                    <i class="fas fa-envelope mr-2"></i>
                                    <span class="text-sm"><?php echo htmlspecialchars($contactEmail); ?></span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>
                    
                    <!-- WhatsApp -->
                    <?php if ($contactWhatsapp): ?>
                    <div class="group relative">
                        <div class="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                        <div class="relative bg-white rounded-2xl p-8 shadow-2xl hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-2 border border-gray-200">
                            <div class="flex flex-col items-center text-center">
                                <div class="relative mb-6">
                                    <div class="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition duration-300"></div>
                                    <div class="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition duration-300">
                                        <i class="fab fa-whatsapp text-white text-3xl"></i>
                                    </div>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800 mb-2">WhatsApp</h3>
                                <p class="text-sm text-gray-500 mb-4">Conversa rápida</p>
                                <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $contactWhatsapp); ?>" 
                                   target="_blank"
                                   class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg text-green-700 hover:text-green-900 font-medium transition-all duration-300 transform hover:scale-105 w-full">
                                    <i class="fab fa-whatsapp mr-2 text-lg"></i>
                                    <span class="text-sm"><?php echo htmlspecialchars($contactWhatsapp); ?></span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>
                    
                    <!-- Instagram -->
                    <?php if ($contactInstagram || !empty($socialMedia['instagram'])): ?>
                    <div class="group relative">
                        <div class="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                        <div class="relative bg-white rounded-2xl p-8 shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 transform hover:-translate-y-2 border border-gray-200">
                            <div class="flex flex-col items-center text-center">
                                <div class="relative mb-6">
                                    <div class="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition duration-300"></div>
                                    <div class="relative w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition duration-300">
                                        <i class="fab fa-instagram text-white text-3xl"></i>
                                    </div>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800 mb-2">Instagram</h3>
                                <p class="text-sm text-gray-500 mb-4">Siga-nos</p>
                                <?php 
                                $instagramUrl = $contactInstagram ?: ($socialMedia['instagram'] ?? '');
                                if ($instagramUrl): 
                                ?>
                                <a href="<?php echo htmlspecialchars($instagramUrl); ?>" 
                                   target="_blank"
                                   class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 hover:from-pink-100 hover:via-purple-100 hover:to-pink-100 rounded-lg text-pink-700 hover:text-pink-900 font-medium transition-all duration-300 transform hover:scale-105 w-full">
                                    <i class="fab fa-instagram mr-2 text-lg"></i>
                                    <span class="text-sm">@<?php echo htmlspecialchars(str_replace(['https://instagram.com/', 'https://www.instagram.com/', '@'], '', $instagramUrl)); ?></span>
                                </a>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </section>
    </main>

    <!-- Modal de Gerenciamento de Conta -->
    <div id="account-modal" class="fixed inset-0 z-50 hidden overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <!-- Overlay -->
            <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" id="account-modal-overlay"></div>

            <!-- Modal Content -->
            <div class="inline-block w-full max-w-2xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <!-- Header -->
                <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <i class="fas fa-user-cog text-white text-lg"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-semibold text-white">Gerenciar Conta</h3>
                                <p class="text-blue-100 text-sm">Atualize suas informações pessoais</p>
                            </div>
                        </div>
                        <button id="close-account-modal" class="text-white hover:text-gray-200 transition-colors duration-200">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Form -->
                <form id="account-form" class="p-6 space-y-6">
                    <!-- Foto de Perfil (Sempre Logo System.jpeg - Não editável) -->
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">
                            <i class="fas fa-image mr-2 text-blue-600"></i>Logo do Sistema
                        </label>
                        <div class="flex items-center space-x-4">
                            <div class="relative">
                                <img id="account-profile-photo" src="<?php echo $baseUrl; ?>Images/Logo System.jpeg" alt="Logo Up.Baloes" 
                                     class="w-20 h-20 rounded-full object-cover border-4 border-blue-200 shadow-md">
                            </div>
                            <div class="flex-1">
                                <p class="text-sm text-gray-600">Logo padrão do sistema Up.Baloes</p>
                                <p class="mt-1 text-xs text-gray-500">Esta imagem não pode ser alterada</p>
                            </div>
                        </div>
                    </div>

                    <!-- Nome -->
                    <div class="space-y-2">
                        <label for="account-name" class="block text-sm font-medium text-gray-700">
                            <i class="fas fa-user mr-2 text-blue-600"></i>Nome Completo
                        </label>
                        <input type="text" id="account-name" name="name" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                               placeholder="Digite seu nome completo">
                    </div>

                    <!-- Email -->
                    <div class="space-y-2">
                        <label for="account-email" class="block text-sm font-medium text-gray-700">
                            <i class="fas fa-envelope mr-2 text-blue-600"></i>Email
                        </label>
                        <input type="email" id="account-email" name="email" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                               placeholder="Digite seu email">
                    </div>

                    <!-- Telefone -->
                    <div class="space-y-2">
                        <label for="account-phone" class="block text-sm font-medium text-gray-700">
                            <i class="fas fa-phone mr-2 text-blue-600"></i>Telefone
                        </label>
                        <input type="tel" id="account-phone" name="phone"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                               placeholder="(11) 99999-9999">
                    </div>

                    <!-- Endereço -->
                    <div class="space-y-2">
                        <label for="account-address" class="block text-sm font-medium text-gray-700">
                            <i class="fas fa-map-marker-alt mr-2 text-blue-600"></i>Endereço
                        </label>
                        <textarea id="account-address" name="address" rows="3"
                                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                  placeholder="Digite seu endereço completo"></textarea>
                    </div>

                    <!-- Cidade e Estado -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label for="account-city" class="block text-sm font-medium text-gray-700">
                                <i class="fas fa-city mr-2 text-blue-600"></i>Cidade
                            </label>
                            <input type="text" id="account-city" name="city"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                   placeholder="Sua cidade">
                        </div>
                        <div class="space-y-2">
                            <label for="account-state" class="block text-sm font-medium text-gray-700">
                                <i class="fas fa-map mr-2 text-blue-600"></i>Estado
                            </label>
                            <select id="account-state" name="state"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                                <option value="">Selecione o estado</option>
                                <option value="AC">Acre</option>
                                <option value="AL">Alagoas</option>
                                <option value="AP">Amapá</option>
                                <option value="AM">Amazonas</option>
                                <option value="BA">Bahia</option>
                                <option value="CE">Ceará</option>
                                <option value="DF">Distrito Federal</option>
                                <option value="ES">Espírito Santo</option>
                                <option value="GO">Goiás</option>
                                <option value="MA">Maranhão</option>
                                <option value="MT">Mato Grosso</option>
                                <option value="MS">Mato Grosso do Sul</option>
                                <option value="MG">Minas Gerais</option>
                                <option value="PA">Pará</option>
                                <option value="PB">Paraíba</option>
                                <option value="PR">Paraná</option>
                                <option value="PE">Pernambuco</option>
                                <option value="PI">Piauí</option>
                                <option value="RJ">Rio de Janeiro</option>
                                <option value="RN">Rio Grande do Norte</option>
                                <option value="RS">Rio Grande do Sul</option>
                                <option value="RO">Rondônia</option>
                                <option value="RR">Roraima</option>
                                <option value="SC">Santa Catarina</option>
                                <option value="SP">São Paulo</option>
                                <option value="SE">Sergipe</option>
                                <option value="TO">Tocantins</option>
                            </select>
                        </div>
                    </div>

                    <!-- CEP -->
                    <div class="space-y-2">
                        <label for="account-zipcode" class="block text-sm font-medium text-gray-700">
                            <i class="fas fa-mail-bulk mr-2 text-blue-600"></i>CEP
                        </label>
                        <input type="text" id="account-zipcode" name="zipcode"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                               placeholder="00000-000" maxlength="9">
                    </div>

                    <!-- Senha Atual -->
                    <div class="space-y-2">
                        <label for="account-current-password" class="block text-sm font-medium text-gray-700">
                            <i class="fas fa-lock mr-2 text-blue-600"></i>Senha Atual
                        </label>
                        <div class="relative">
                            <input type="password" id="account-current-password" name="current_password"
                                   class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                   placeholder="Digite sua senha atual">
                            <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 toggle-password">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Nova Senha -->
                    <div class="space-y-2">
                        <label for="account-new-password" class="block text-sm font-medium text-gray-700">
                            <i class="fas fa-key mr-2 text-blue-600"></i>Nova Senha
                        </label>
                        <div class="relative">
                            <input type="password" id="account-new-password" name="new_password"
                                   class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                   placeholder="Digite sua nova senha">
                            <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 toggle-password">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="text-xs text-gray-500">
                            <i class="fas fa-info-circle mr-1"></i>
                            Mínimo de 8 caracteres, com letras e números
                        </div>
                    </div>

                    <!-- Confirmar Nova Senha -->
                    <div class="space-y-2">
                        <label for="account-confirm-password" class="block text-sm font-medium text-gray-700">
                            <i class="fas fa-check-circle mr-2 text-blue-600"></i>Confirmar Nova Senha
                        </label>
                        <div class="relative">
                            <input type="password" id="account-confirm-password" name="confirm_password"
                                   class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                   placeholder="Confirme sua nova senha">
                            <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 toggle-password">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Botões -->
                    <div class="flex flex-col sm:flex-row gap-3 pt-4">
                        <button type="button" id="cancel-account-changes" 
                                class="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200">
                            <i class="fas fa-times mr-2"></i>Cancelar
                        </button>
                        <button type="submit" id="save-account-changes"
                                class="flex-1 px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                            <i class="fas fa-save mr-2"></i>Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2025 Up.Baloes. Todos os direitos reservados.</p>
        </div>
    </footer>
    
    <!-- JavaScript -->
    <script src="<?php echo $baseUrl; ?>js/json-utils.js"></script>
    <script src="<?php echo $baseUrl; ?>js/principal.js"></script>
    <script>
        // Função para adicionar item do portfólio ao carrinho
        function addPortfolioItemToCart(button) {
            const card = button.closest('.portfolio-card');
            if (!card) {
                console.error('Card do portfólio não encontrado');
                return;
            }
            
            // Obter dados do card
            const itemData = {
                id: 'portfolio_' + card.getAttribute('data-item-id'), // Prefixo para evitar conflitos
                name: card.getAttribute('data-item-title'),
                description: card.getAttribute('data-item-description'),
                price: parseFloat(card.getAttribute('data-item-price')) || 0,
                service_type: card.getAttribute('data-item-type'),
                arc_size: card.getAttribute('data-item-arc-size'),
                image: card.getAttribute('data-item-image'),
                decorator_id: parseInt(card.getAttribute('data-decorator-id')),
                decorador_id: parseInt(card.getAttribute('data-decorator-id')), // Para compatibilidade
                quantity: 1,
                tamanho_arco_m: card.getAttribute('data-item-arc-size') || null
            };
            
            // Aguardar o carregamento do principal.js se necessário
            function addToCart() {
                // Tentar usar addToCartGlobal primeiro (função mais completa)
                if (typeof window.addToCartGlobal === 'function') {
                    window.addToCartGlobal(
                        itemData.id,
                        itemData.name,
                        itemData.quantity,
                        itemData
                    );
                } else if (typeof window.addItemToCartStorage === 'function') {
                    // Usar função do principal.js
                    window.addItemToCartStorage(itemData);
                    
                    // Disparar evento de atualização do carrinho
                    if (typeof window.getStoredCartItems === 'function' && typeof window.getCartItemsTotal === 'function') {
                        const items = window.getStoredCartItems();
                        window.dispatchEvent(new CustomEvent('cart-items-updated', {
                            detail: {
                                items: items,
                                total: window.getCartItemsTotal(items)
                            }
                        }));
                    } else {
                        window.dispatchEvent(new CustomEvent('cart-items-updated'));
                    }
                    
                    // Mostrar notificação
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(`${itemData.name} adicionado ao carrinho!`, 'success');
                    } else {
                        alert(`${itemData.name} adicionado ao carrinho!`);
                    }
                } else {
                    // Fallback: usar localStorage diretamente
                    const CART_STORAGE_KEY = 'upbaloes_cart_items';
                    try {
                        const storedItems = localStorage.getItem(CART_STORAGE_KEY);
                        const items = storedItems ? JSON.parse(storedItems) : [];
                        
                        // Verificar se o item já existe no carrinho
                        const existingIndex = items.findIndex(item => item.id === itemData.id);
                        if (existingIndex >= 0) {
                            // Incrementar quantidade
                            items[existingIndex].quantity = (parseInt(items[existingIndex].quantity) || 1) + 1;
                        } else {
                            // Adicionar novo item
                            items.push(itemData);
                        }
                        
                        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
                        
                        // Disparar evento de atualização
                        window.dispatchEvent(new CustomEvent('cart-items-updated'));
                        
                        // Mostrar notificação
                        if (typeof window.showNotification === 'function') {
                            window.showNotification(`${itemData.name} adicionado ao carrinho!`, 'success');
                        } else {
                            alert(`${itemData.name} adicionado ao carrinho!`);
                        }
                    } catch (error) {
                        console.error('Erro ao adicionar item ao carrinho:', error);
                        alert('Erro ao adicionar item ao carrinho. Tente novamente.');
                        return;
                    }
                }
                
                // Feedback visual no botão
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i><span>Adicionado!</span>';
                button.classList.add('bg-green-600', 'hover:bg-green-700');
                button.classList.remove('from-blue-600', 'to-indigo-600', 'hover:from-blue-700', 'hover:to-indigo-700');
                button.disabled = true;
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.classList.remove('bg-green-600', 'hover:bg-green-700');
                    button.classList.add('from-blue-600', 'to-indigo-600', 'hover:from-blue-700', 'hover:to-indigo-700');
                    button.disabled = false;
                }, 2000);
            }
            
            // Aguardar um pouco para garantir que o principal.js carregou
            if (typeof window.addToCartGlobal === 'function' || typeof window.addItemToCartStorage === 'function') {
                addToCart();
            } else {
                // Aguardar até 2 segundos para o script carregar
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    if (typeof window.addToCartGlobal === 'function' || typeof window.addItemToCartStorage === 'function' || attempts >= 20) {
                        clearInterval(checkInterval);
                        addToCart();
                    }
                }, 100);
            }
        }
        
        // Tornar função globalmente acessível
        window.addPortfolioItemToCart = addPortfolioItemToCart;
        
        // Garantir que a foto de perfil sempre seja a Logo System.jpeg (não editável)
        (function() {
            const profilePhoto = document.getElementById('account-profile-photo');
            if (profilePhoto) {
                // Sempre usar a logo padrão, ignorando localStorage
                const baseUrl = '<?php echo $baseUrl; ?>';
                const defaultLogo = baseUrl + 'Images/Logo System.jpeg';
                
                // Remover qualquer foto salva no localStorage para esta página
                try {
                    localStorage.removeItem('userProfilePhoto');
                } catch(e) {
                    // Ignorar erros de localStorage
                }
                
                // Garantir que a imagem sempre seja a logo padrão
                profilePhoto.src = defaultLogo;
            }
        })();
        
        // Menu mobile toggle
        document.addEventListener('DOMContentLoaded', function() {
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            
            if (mobileMenuBtn && mobileMenu) {
                mobileMenuBtn.addEventListener('click', function() {
                    mobileMenu.classList.toggle('opacity-0');
                    mobileMenu.classList.toggle('invisible');
                });
            }
            
            // Smooth scroll para links de navegação
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        // Fechar menu mobile se estiver aberto
                        if (mobileMenu && !mobileMenu.classList.contains('opacity-0')) {
                            mobileMenu.classList.add('opacity-0', 'invisible');
                        }
                    }
                });
            });
        });
    </script>
</body>
</html>
