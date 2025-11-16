<?php
/**
 * Página do Decorador - Up.Baloes
 * 
 * Esta página é carregada quando alguém acessa www.upbaloes.com/{slug}
 * e exibe as informações do decorador correspondente usando o mesmo template da página inicial.
 */

// Incluir configurações
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/decorador.php';

// Obter slug da URL
$slug = $_GET['slug'] ?? '';

if (empty($slug)) {
    // Redirecionar para página inicial se não houver slug
    header('Location: /index.html');
    exit;
}

// Buscar dados do decorador
try {
    // Log para debug (apenas em desenvolvimento)
    if (defined('ENVIRONMENT') && ENVIRONMENT === 'development') {
        error_log("Tentando buscar decorador com slug: {$slug}");
    }
    
    $decoratorService = new DecoratorService($database_config);
    $result = $decoratorService->getDecoratorBySlug($slug);
    
    // Log resultado (apenas em desenvolvimento)
    if (defined('ENVIRONMENT') && ENVIRONMENT === 'development') {
        error_log("Resultado da busca: " . json_encode(['success' => $result['success'] ?? false, 'message' => $result['message'] ?? '']));
    }
    
    if (!$result['success']) {
        // Decorador não encontrado - retornar 404
        http_response_code(404);
        $message = $result['message'] ?? 'O decorador solicitado não foi encontrado.';
        echo '<!DOCTYPE html><html><head><title>Decorador não encontrado</title></head><body><h1>404 - Decorador não encontrado</h1><p>' . htmlspecialchars($message) . '</p><p>Slug: ' . htmlspecialchars($slug) . '</p><a href="/index.html">Voltar para a página inicial</a></body></html>';
        exit;
    }
    
    $decoratorData = $result['data'];
    
    // Verificar estrutura de dados
    if (!isset($decoratorData['decorator'])) {
        error_log('Estrutura de dados inválida: ' . json_encode($decoratorData));
        http_response_code(404);
        echo '<!DOCTYPE html><html><head><title>Erro ao carregar decorador</title></head><body><h1>404 - Erro ao carregar decorador</h1><p>Estrutura de dados inválida.</p><a href="/index.html">Voltar para a página inicial</a></body></html>';
        exit;
    }
    
    $decorator = $decoratorData['decorator'];
    $services = $decoratorData['services'] ?? [];
    $portfolio = $decoratorData['portfolio'] ?? [];
    $customization = $decoratorData['customization'] ?? null;
    
    // Verificar se há personalização configurada
    $hasCustomization = $customization && !empty($customization['page_title']);
    
    // Obter nome do decorador (pode vir como 'name' ou 'nome')
    $decoratorName = $decorator['name'] ?? $decorator['nome'] ?? 'Decorador';
    
    // Configuração da página - usar dados do banco ou valores padrão
    $pageConfig = [
        'page_title' => $hasCustomization ? $customization['page_title'] : 'Bem-vindo à ' . $decoratorName . '!',
        'page_description' => $hasCustomization ? $customization['page_description'] : 'Decoração profissional com balões para eventos.',
        'welcome_text' => $hasCustomization ? ($customization['welcome_text'] ?? null) : null,
        'cover_image_url' => $hasCustomization ? ($customization['cover_image_url'] ?? null) : null,
        'primary_color' => $hasCustomization ? ($customization['primary_color'] ?? '#667eea') : '#667eea',
        'secondary_color' => $hasCustomization ? ($customization['secondary_color'] ?? '#764ba2') : '#764ba2',
        'accent_color' => $hasCustomization ? ($customization['accent_color'] ?? '#f59e0b') : '#f59e0b',
        'social_media' => $hasCustomization && $customization['social_media'] ? json_decode($customization['social_media'], true) : [
            'whatsapp' => $decorator['whatsapp'] ?? $decorator['phone'] ?? $decorator['telefone'] ?? '',
            'instagram' => $decorator['instagram'] ?? '',
            'facebook' => '',
            'youtube' => ''
        ],
        'meta_title' => $hasCustomization ? ($customization['meta_title'] ?? $decoratorName . ' - Up.Baloes') : $decoratorName . ' - Decoração com Balões | Up.Baloes',
        'meta_description' => $hasCustomization ? ($customization['meta_description'] ?? 'Conheça ' . $decoratorName) : 'Decoração profissional com balões para eventos.',
        'meta_keywords' => $hasCustomization ? ($customization['meta_keywords'] ?? 'decorador, festas, balões') : 'decorador, festas, balões'
    ];
    
    // Preparar dados de contato
    $contactEmail = $decorator['communication_email'] ?? $decorator['email_comunicacao'] ?? $decorator['email'] ?? '';
    $contactWhatsapp = $decorator['whatsapp'] ?? $decorator['phone'] ?? $decorator['telefone'] ?? '';
    $contactInstagram = $decorator['instagram'] ?? '';
    
} catch (Exception $e) {
    // Erro interno - retornar 404
    error_log('Erro ao carregar decorador: ' . $e->getMessage());
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><title>Erro ao carregar decorador</title></head><body><h1>404 - Erro ao carregar decorador</h1><p>Ocorreu um erro ao carregar a página do decorador.</p><a href="/index.html">Voltar para a página inicial</a></body></html>';
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageConfig['meta_title']); ?></title>
    
    <!-- Meta tags para SEO -->
    <meta name="description" content="<?php echo htmlspecialchars($pageConfig['meta_description']); ?>">
    <meta name="keywords" content="<?php echo htmlspecialchars($pageConfig['meta_keywords']); ?>">
    
    <!-- Open Graph para redes sociais -->
    <meta property="og:title" content="<?php echo htmlspecialchars($pageConfig['meta_title']); ?>">
    <meta property="og:description" content="<?php echo htmlspecialchars($pageConfig['meta_description']); ?>">
    <meta property="og:type" content="profile">
    <meta property="og:url" content="https://www.upbaloes.com/<?php echo htmlspecialchars($slug); ?>">
    <?php if ($pageConfig['cover_image_url']): ?>
    <meta property="og:image" content="<?php echo htmlspecialchars($pageConfig['cover_image_url']); ?>">
    <?php endif; ?>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/Images/favicon.ico">
    <link rel="shortcut icon" type="image/x-icon" href="/Images/favicon.ico">
    <link rel="apple-touch-icon" href="/Images/favicon.ico">
    
    <!-- Font Awesome para ícones -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- TailwindCSS para estilos -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- CSS personalizado -->
    <link rel="stylesheet" href="/css/estilos.css">
    
    <style>
        :root {
            --primary-color: <?php echo htmlspecialchars($pageConfig['primary_color']); ?>;
            --secondary-color: <?php echo htmlspecialchars($pageConfig['secondary_color']); ?>;
            --accent-color: <?php echo htmlspecialchars($pageConfig['accent_color']); ?>;
        }
        .decorator-hero {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            <?php if (!empty($pageConfig['cover_image_url'])): ?>
            background-image: url('<?php echo htmlspecialchars($pageConfig['cover_image_url']); ?>');
            background-size: cover;
            background-position: center;
            background-blend-mode: overlay;
            <?php endif; ?>
        }
        .service-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .service-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .portfolio-item {
            transition: transform 0.3s ease;
        }
        .portfolio-item:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    
    <!-- Navbar Fixa (mesma estrutura da index.html) -->
    <nav id="navbar" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-18 sm:h-20">
                
                <!-- Logo do Sistema -->
                <div class="flex items-center space-x-3">
                    <a href="/index.html" class="flex items-center space-x-3">
                        <div class="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg logo-container">
                            <img src="/Images/Logo System.jpeg" alt="Up.Baloes Logo" class="w-full h-full object-cover rounded-full logo-image">
                        </div>
                        <span class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 hidden sm:block">Up.Baloes</span>
                    </a>
                </div>

                <!-- Menu de Navegação -->
                <div class="hidden md:flex items-center space-x-8">
                    <a href="/index.html" class="nav-link text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-home mr-2"></i>Início
                    </a>
                    <a href="#portfolio" class="nav-link text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-briefcase mr-2"></i>Portfólio
                    </a>
                    <a href="#contatos" class="nav-link text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-phone mr-2"></i>Contatos
                    </a>
                    <a href="/pages/solicitacao-cliente.html" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium">
                        <i class="fas fa-gift mr-2"></i>Solicitar Serviço
                    </a>
                </div>

                <!-- Menu Mobile -->
                <div class="md:hidden">
                    <button id="mobile-menu-btn" class="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Menu Mobile Expandido -->
        <div id="mobile-menu" class="md:hidden bg-white border-t border-gray-200 opacity-0 invisible transition-all duration-200">
            <div class="px-4 py-3 space-y-2">
                <a href="/index.html" class="mobile-nav-link block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded-lg">
                    <i class="fas fa-home mr-3"></i>Início
                </a>
                <a href="#portfolio" class="mobile-nav-link block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded-lg">
                    <i class="fas fa-briefcase mr-3"></i>Portfólio
                </a>
                <a href="#contatos" class="mobile-nav-link block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded-lg">
                    <i class="fas fa-phone mr-3"></i>Contatos
                </a>
                <a href="/pages/solicitacao-cliente.html" class="mobile-nav-link block px-3 py-2 bg-blue-600 text-white rounded-lg">
                    <i class="fas fa-gift mr-3"></i>Solicitar Serviço
                </a>
            </div>
        </div>
    </nav>

    <!-- Conteúdo Principal -->
    <main class="pt-18 sm:pt-20">
        <!-- Hero Section (personalizado para o decorador) -->
        <section id="inicio" class="decorator-hero text-white py-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center">
                    <h1 class="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                        <?php echo htmlspecialchars($pageConfig['page_title']); ?>
                    </h1>
                    <p class="text-xl md:text-2xl mb-8 text-blue-100 animate-fade-in-delay">
                        <?php echo htmlspecialchars($pageConfig['page_description']); ?>
                    </p>
                    <?php if ($pageConfig['welcome_text']): ?>
                    <p class="text-lg md:text-xl mb-8 text-blue-200 animate-fade-in-delay-2 max-w-3xl mx-auto">
                        <?php echo nl2br(htmlspecialchars($pageConfig['welcome_text'])); ?>
                    </p>
                    <?php endif; ?>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
                        <a href="/pages/solicitacao-cliente.html" class="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg inline-block text-center">
                            <i class="fas fa-gift mr-2"></i>Solicitar Serviço
                        </a>
                        <a href="#contatos" class="border-2 border-white hover:bg-white hover:text-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 inline-block text-center">
                            <i class="fas fa-phone mr-2"></i>Entre em Contato
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- Seção de Recursos/Serviços -->
        <?php if (!empty($services)): ?>
        <section class="py-20 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Nossos Serviços
                    </h2>
                    <p class="text-xl text-gray-600">
                        Conheça os serviços especializados que oferecemos
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <?php foreach ($services as $service): ?>
                    <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <?php if (!empty($service['icon'])): ?>
                            <i class="<?php echo htmlspecialchars($service['icon']); ?> text-white text-2xl"></i>
                            <?php else: ?>
                            <i class="fas fa-gift text-white text-2xl"></i>
                            <?php endif; ?>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3"><?php echo htmlspecialchars($service['title'] ?? $service['nome'] ?? 'Serviço'); ?></h3>
                        <p class="text-gray-600"><?php echo htmlspecialchars($service['description'] ?? $service['descricao'] ?? ''); ?></p>
                        <?php if (!empty($service['price'])): ?>
                        <p class="text-2xl font-bold text-blue-600 mt-4">
                            R$ <?php echo number_format($service['price'], 2, ',', '.'); ?>
                        </p>
                        <?php endif; ?>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>
        <?php endif; ?>

        <!-- Seção de Portfólio -->
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

                <?php if (!empty($portfolio)): ?>
                <!-- Grid de Portfólio -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <?php foreach ($portfolio as $item): ?>
                    <div class="portfolio-item bg-white rounded-xl shadow-lg overflow-hidden">
                        <?php if (!empty($item['imagem_url'])): ?>
                        <img src="<?php echo htmlspecialchars($item['imagem_url']); ?>" 
                             alt="<?php echo htmlspecialchars($item['titulo'] ?? 'Portfólio'); ?>" 
                             class="w-full h-48 object-cover">
                        <?php else: ?>
                        <div class="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                            <i class="fas fa-image text-white text-4xl"></i>
                        </div>
                        <?php endif; ?>
                        <div class="p-4">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                <?php echo htmlspecialchars($item['titulo'] ?? 'Trabalho'); ?>
                            </h3>
                            <p class="text-gray-600 text-sm">
                                <?php echo htmlspecialchars($item['descricao'] ?? ''); ?>
                            </p>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php else: ?>
                <!-- Estado Vazio -->
                <div class="text-center py-12">
                    <div class="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-briefcase text-4xl text-purple-600"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Portfólio em construção</h3>
                    <p class="text-gray-600 mb-6">Em breve você poderá ver nossos trabalhos aqui</p>
                </div>
                <?php endif; ?>
            </div>
        </section>

        <!-- Seção de Contatos (mesma estrutura da index.html) -->
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
                    <?php if (!empty($contactEmail)): ?>
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
                                <a href="mailto:<?php echo htmlspecialchars($contactEmail); ?>" class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg text-blue-700 hover:text-blue-900 font-medium transition-all duration-300 transform hover:scale-105 w-full break-all">
                                    <i class="fas fa-envelope mr-2"></i>
                                    <span class="text-sm"><?php echo htmlspecialchars($contactEmail); ?></span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>
                    
                    <!-- WhatsApp -->
                    <?php if (!empty($contactWhatsapp)): ?>
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
                                <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $contactWhatsapp); ?>" target="_blank" class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg text-green-700 hover:text-green-900 font-medium transition-all duration-300 transform hover:scale-105 w-full">
                                    <i class="fab fa-whatsapp mr-2 text-lg"></i>
                                    <span class="text-sm"><?php echo htmlspecialchars($contactWhatsapp); ?></span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>
                    
                    <!-- Instagram -->
                    <?php if (!empty($contactInstagram)): ?>
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
                                <a href="<?php echo htmlspecialchars(strpos($contactInstagram, 'http') === 0 ? $contactInstagram : 'https://instagram.com/' . ltrim($contactInstagram, '@')); ?>" target="_blank" class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 hover:from-pink-100 hover:via-purple-100 hover:to-pink-100 rounded-lg text-pink-700 hover:text-pink-900 font-medium transition-all duration-300 transform hover:scale-105 w-full">
                                    <i class="fab fa-instagram mr-2 text-lg"></i>
                                    <span class="text-sm"><?php echo htmlspecialchars($contactInstagram); ?></span>
                                </a>
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
            <div class="flex items-center justify-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <img src="/Images/Logo System.jpeg" alt="Up.Baloes Logo" class="w-full h-full object-cover rounded-full">
                </div>
                <span class="text-xl font-bold">Up.Baloes</span>
            </div>
            <p>&copy; 2025 Up.Baloes. Todos os direitos reservados.</p>
            <p class="text-gray-400 text-sm mt-2">
                Decorador: <?php echo htmlspecialchars($decoratorName); ?>
            </p>
        </div>
    </footer>

    <!-- JavaScript -->
    <script src="/js/principal.js"></script>
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
            
            // Animar elementos quando entram na tela
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);
            
            // Observar elementos para animação
            document.querySelectorAll('.service-card, .portfolio-item').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        });
    </script>
</body>
</html>
