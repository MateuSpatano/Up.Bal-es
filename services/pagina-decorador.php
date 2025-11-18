<?php
/**
 * Página do Decorador - Up.Baloes
 * Template mestre baseado no index.html para páginas públicas de decoradores
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/decorador-service.php';

// Obter slug da URL
$slug = $_GET['slug'] ?? '';

// Log para debug
error_log("Tentando acessar decorador com slug: " . $slug);

if (empty($slug)) {
    error_log("Slug vazio, redirecionando para index");
    // Detectar base URL automaticamente
    $baseUrl = rtrim($urls['base'] ?? '', '/') . '/';
    header('Location: ' . $baseUrl . 'index.html');
    exit;
}

try {
    $decoratorService = new DecoratorService($database_config);
    $result = $decoratorService->getDecoratorBySlug($slug);
    
    error_log("Resultado da busca: " . json_encode($result));
    
    if (!$result['success']) {
        error_log("Decorador não encontrado ou inativo: " . $slug);
        http_response_code(404);
        $baseUrl = rtrim($urls['base'] ?? '', '/') . '/';
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
    $data = $result['data'];
    $decorator = $data['decorator'];
    $customization = $data['customization'];
    $services = $data['services'] ?? [];
    $portfolio = $data['portfolio'] ?? [];
    
    error_log("Decorador carregado com sucesso: " . $decorator['name']);
    
    // Configurações da página
    $pageTitle = htmlspecialchars($customization['page_title'] ?? 'Bem-vindo à ' . $decorator['name']);
    $pageDesc = htmlspecialchars($customization['page_description'] ?? 'Decoração profissional com balões');
    $welcomeText = $customization['welcome_text'] ?? '';
    $coverImage = $customization['cover_image_url'] ?? '';
    
    // Cores personalizadas
    $primaryColor = $customization['primary_color'] ?? '#667eea';
    $secondaryColor = $customization['secondary_color'] ?? '#764ba2';
    $accentColor = $customization['accent_color'] ?? '#f59e0b';
    
    // Redes sociais
    $socialMedia = is_string($customization['social_media']) ? json_decode($customization['social_media'], true) : ($customization['social_media'] ?? []);
    
    // Contato
    $contactEmail = $decorator['communication_email'] ?? $decorator['email'];
    $contactWhatsapp = $decorator['whatsapp'] ?? '';
    $contactInstagram = $decorator['instagram'] ?? ($socialMedia['instagram'] ?? '');
    
    // Base URL para assets (usar a configuração do config.php)
    $baseUrl = rtrim($urls['base'] ?? '', '/') . '/';
    
} catch (Exception $e) {
    error_log("Erro ao carregar página do decorador: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    $baseUrl = rtrim($urls['base'] ?? '', '/') . '/';
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
                    <a href="<?php echo $baseUrl; ?>index.html" class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 hidden sm:block">Up.Baloes</a>
                </div>

                <!-- Menu de Navegação -->
                <div class="hidden md:flex items-center space-x-8">
                    <a href="#inicio" class="nav-link text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-home mr-2"></i>Início
                    </a>
                    <?php if (!empty($services)): ?>
                    <a href="#servicos" class="nav-link text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-briefcase mr-2"></i>Serviços
                    </a>
                    <?php endif; ?>
                    <?php if (!empty($portfolio)): ?>
                    <a href="#portfolio" class="nav-link text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-images mr-2"></i>Portfólio
                    </a>
                    <?php endif; ?>
                    <a href="#contatos" class="nav-link text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-phone mr-2"></i>Contatos
                    </a>
                </div>

                <!-- Menu Mobile -->
                <div class="md:hidden">
                    <button id="mobile-menu-btn" class="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>

                <!-- Botão de Solicitar Orçamento -->
                <div class="flex items-center gap-4">
                    <?php if ($contactWhatsapp): ?>
                        <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $contactWhatsapp); ?>" 
                           target="_blank"
                           class="hidden sm:flex items-center gap-2 text-gray-700 hover:text-green-600 transition">
                            <i class="fab fa-whatsapp text-xl"></i>
                            <span><?php echo htmlspecialchars($contactWhatsapp); ?></span>
                        </a>
                    <?php endif; ?>
                    
                    <a href="<?php echo $baseUrl; ?>pages/solicitacao-cliente.html?decorador=<?php echo urlencode($slug); ?>" 
                       class="btn-primary text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg transition">
                        <i class="fas fa-gift mr-2"></i>Solicitar Orçamento
                    </a>
                </div>
            </div>
        </div>

        <!-- Menu Mobile Expandido -->
        <div id="mobile-menu" class="md:hidden bg-white border-t border-gray-200 opacity-0 invisible transition-all duration-200">
            <div class="px-4 py-3 space-y-2">
                <a href="#inicio" class="mobile-nav-link block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded-lg">
                    <i class="fas fa-home mr-3"></i>Início
                </a>
                <?php if (!empty($services)): ?>
                <a href="#servicos" class="mobile-nav-link block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded-lg">
                    <i class="fas fa-briefcase mr-3"></i>Serviços
                </a>
                <?php endif; ?>
                <?php if (!empty($portfolio)): ?>
                <a href="#portfolio" class="mobile-nav-link block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded-lg">
                    <i class="fas fa-images mr-3"></i>Portfólio
                </a>
                <?php endif; ?>
                <a href="#contatos" class="mobile-nav-link block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded-lg">
                    <i class="fas fa-phone mr-3"></i>Contatos
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
                        <?php if ($contactWhatsapp): ?>
                        <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $contactWhatsapp); ?>" 
                           target="_blank"
                           class="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg inline-block text-center">
                            <i class="fab fa-whatsapp mr-2"></i>Falar no WhatsApp
                        </a>
                        <?php endif; ?>
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
                    <div class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                        <?php if (!empty($item['image_url'])): ?>
                            <img src="<?php echo htmlspecialchars($item['image_url']); ?>" 
                                 alt="<?php echo htmlspecialchars($item['title']); ?>"
                                 class="w-full h-64 object-cover">
                        <?php else: ?>
                            <div class="w-full h-64 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                <i class="fas fa-image text-4xl text-gray-400"></i>
                            </div>
                        <?php endif; ?>
                        
                        <div class="p-6">
                            <h3 class="text-xl font-bold mb-2"><?php echo htmlspecialchars($item['title']); ?></h3>
                            
                            <?php if (!empty($item['description'])): ?>
                                <p class="text-gray-600 mb-3"><?php echo htmlspecialchars($item['description']); ?></p>
                            <?php endif; ?>
                            
                            <?php if (!empty($item['price'])): ?>
                                <p class="text-lg font-bold" style="color: var(--primary-color);">
                                    R$ <?php echo number_format($item['price'], 2, ',', '.'); ?>
                                </p>
                            <?php endif; ?>
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

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; <?php echo date('Y'); ?> <?php echo htmlspecialchars($decorator['name']); ?>. Todos os direitos reservados.</p>
            <p class="text-sm text-gray-400 mt-2">Desenvolvido com <i class="fas fa-heart text-red-500"></i> por Up.Baloes</p>
        </div>
    </footer>
    
    <script src="<?php echo $baseUrl; ?>js/principal.js"></script>
    <script>
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
