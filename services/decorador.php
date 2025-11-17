<?php
/**
 * Handler de URL para Página Pública do Decorador
 * Processa requisições diretas via slug (ex: /nome-decorador)
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/decorador-service.php';

// Obter slug da URL
$slug = $_GET['slug'] ?? '';

// Log para debug
error_log("Tentando acessar decorador com slug: " . $slug);

if (empty($slug)) {
    error_log("Slug vazio, redirecionando para index");
    header('Location: ' . rtrim($urls['base'], '/') . '/index.html');
    exit;
}

try {
    $decoratorService = new DecoratorService($database_config);
    $result = $decoratorService->getDecoratorBySlug($slug);
    
    error_log("Resultado da busca: " . json_encode($result));
    
    if (!$result['success']) {
        error_log("Decorador não encontrado ou inativo: " . $slug);
        http_response_code(404);
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
                    <a href="<?php echo rtrim($urls['base'], '/'); ?>/index.html" 
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
    $socialMedia = $customization['social_media'] ?? [];
    
    // Contato
    $contactEmail = $decorator['communication_email'] ?? $decorator['email'];
    $contactWhatsapp = $decorator['whatsapp'];
    $contactInstagram = $decorator['instagram'] ?? '';
    
    // Base URL para assets
    $baseUrl = rtrim($urls['base'], '/') . '/';
    
} catch (Exception $e) {
    error_log("Erro ao carregar página do decorador: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
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
                <a href="<?php echo rtrim($urls['base'], '/'); ?>/index.html" 
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
    <link rel="icon" type="image/x-icon" href="<?php echo $baseUrl; ?>Images/favicon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
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
    </style>
</head>
<body class="bg-gray-50">
    <!-- Navegação -->
    <nav class="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                <a href="<?php echo $baseUrl; ?>index.html" class="flex items-center gap-3">
                    <img src="<?php echo $baseUrl; ?>Images/Logo System.jpeg" 
                         alt="Up.Baloes" 
                         class="w-12 h-12 rounded-full object-cover">
                    <span class="font-bold text-xl text-gray-900">Up.Baloes</span>
                </a>
                
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
                        Solicitar Orçamento
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="decorator-hero text-white pt-32 pb-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h1 class="text-4xl md:text-5xl font-bold mb-6"><?php echo $pageTitle; ?></h1>
                <p class="text-xl md:text-2xl mb-8 opacity-90"><?php echo $pageDesc; ?></p>
                
                <?php if ($welcomeText): ?>
                    <p class="text-lg max-w-3xl mx-auto opacity-80">
                        <?php echo nl2br(htmlspecialchars($welcomeText)); ?>
                    </p>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Serviços -->
    <?php if (!empty($services)): ?>
    <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-center mb-12">Nossos Serviços</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <?php foreach ($services as $service): ?>
                    <div class="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition">
                        <?php if (!empty($service['icon'])): ?>
                            <div class="text-4xl mb-4" style="color: var(--accent-color);">
                                <i class="<?php echo htmlspecialchars($service['icon']); ?>"></i>
                            </div>
                        <?php endif; ?>
                        
                        <h3 class="text-xl font-bold mb-3"><?php echo htmlspecialchars($service['title']); ?></h3>
                        <p class="text-gray-600 mb-4"><?php echo htmlspecialchars($service['description']); ?></p>
                        
                        <?php if ($service['price']): ?>
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

    <!-- Portfólio -->
    <?php if (!empty($portfolio)): ?>
    <section class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-center mb-12">Nosso Portfólio</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <?php foreach ($portfolio as $item): ?>
                    <div class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                        <?php if (!empty($item['image_url'])): ?>
                            <img src="<?php echo htmlspecialchars($item['image_url']); ?>" 
                                 alt="<?php echo htmlspecialchars($item['title']); ?>"
                                 class="w-full h-64 object-cover">
                        <?php endif; ?>
                        
                        <div class="p-6">
                            <h3 class="text-xl font-bold mb-2"><?php echo htmlspecialchars($item['title']); ?></h3>
                            
                            <?php if (!empty($item['description'])): ?>
                                <p class="text-gray-600 mb-3"><?php echo htmlspecialchars($item['description']); ?></p>
                            <?php endif; ?>
                            
                            <?php if ($item['price']): ?>
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

    <!-- Contato -->
    <section class="py-16 bg-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold mb-8">Entre em Contato</h2>
            
            <div class="flex flex-col sm:flex-row justify-center gap-6 mb-8">
                <?php if ($contactWhatsapp): ?>
                    <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $contactWhatsapp); ?>" 
                       target="_blank"
                       class="flex items-center justify-center gap-3 bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 transition">
                        <i class="fab fa-whatsapp text-2xl"></i>
                        <span class="font-medium">WhatsApp</span>
                    </a>
                <?php endif; ?>
                
                <?php if ($contactEmail): ?>
                    <a href="mailto:<?php echo htmlspecialchars($contactEmail); ?>" 
                       class="flex items-center justify-center gap-3 bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 transition">
                        <i class="fas fa-envelope text-2xl"></i>
                        <span class="font-medium">E-mail</span>
                    </a>
                <?php endif; ?>
            </div>
            
            <?php if (!empty($socialMedia)): ?>
                <div class="flex justify-center gap-4">
                    <?php if (!empty($socialMedia['instagram'])): ?>
                        <a href="<?php echo htmlspecialchars($socialMedia['instagram']); ?>" 
                           target="_blank"
                           class="text-3xl text-gray-600 hover:text-pink-600 transition">
                            <i class="fab fa-instagram"></i>
                        </a>
                    <?php endif; ?>
                    
                    <?php if (!empty($socialMedia['facebook'])): ?>
                        <a href="<?php echo htmlspecialchars($socialMedia['facebook']); ?>" 
                           target="_blank"
                           class="text-3xl text-gray-600 hover:text-blue-600 transition">
                            <i class="fab fa-facebook"></i>
                        </a>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; <?php echo date('Y'); ?> <?php echo htmlspecialchars($decorator['name']); ?>. Todos os direitos reservados.</p>
            <p class="text-sm text-gray-400 mt-2">Desenvolvido com <i class="fas fa-heart text-red-500"></i> por Up.Baloes</p>
        </div>
    </footer>
</body>
</html>