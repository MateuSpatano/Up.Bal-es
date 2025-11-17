<?php
/**
 * Página do Decorador - Up.Baloes
 * Template dinâmico estilo "YouTube Channel"
 */

// Incluir configurações
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/decorador.php';

// --- CORREÇÃO DE CAMINHOS (CRUCIAL PARA O ESTILO FUNCIONAR) ---
// 1. Detecta o diretório do script atual
$scriptDir = dirname($_SERVER['SCRIPT_NAME']); 
// 2. Remove '/services' para encontrar a raiz do projeto
$baseUrl = str_replace('/services', '', $scriptDir); 
// 3. Garante que a URL termina com uma barra
$baseUrl = rtrim($baseUrl, '/') . '/'; 
// ---------------------------------------------------------------

// Obter slug da URL
$slug = $_GET['slug'] ?? '';

if (empty($slug)) {
    header('Location: ' . $baseUrl . 'index.html');
    exit;
}

// Buscar dados do decorador
try {
    $decoratorService = new DecoratorService($database_config);
    $result = $decoratorService->getDecoratorBySlug($slug);
    
    if (!$result['success']) {
        http_response_code(404);
        echo '<!DOCTYPE html><html><head><title>Não Encontrado</title></head>
              <body style="font-family:sans-serif; text-align:center; padding:50px;">
              <h1>Decorador não encontrado</h1>
              <p>O perfil que você procura não existe ou está inativo.</p>
              <a href="'.$baseUrl.'index.html">Voltar ao início</a>
              </body></html>';
        exit;
    }
    
    $decoratorData = $result['data'];
    $decorator = $decoratorData['decorator'];
    $services = $decoratorData['services'] ?? [];
    $portfolio = $decoratorData['portfolio'] ?? [];
    $customization = $decoratorData['customization'] ?? null;
    
    // Configurar variáveis visuais
    $hasCustomization = $customization && !empty($customization['page_title']);
    $decoratorName = $decorator['name'] ?? $decorator['nome'] ?? 'Decorador';
    
    // Definir cores e textos
    $pageConfig = [
        'page_title' => $hasCustomization ? $customization['page_title'] : 'Bem-vindo à ' . $decoratorName . '!',
        'page_description' => $hasCustomization ? $customization['page_description'] : 'Decoração profissional com balões para eventos.',
        'primary_color' => $hasCustomization ? ($customization['primary_color'] ?? '#667eea') : '#667eea',
        'secondary_color' => $hasCustomization ? ($customization['secondary_color'] ?? '#764ba2') : '#764ba2',
        'cover_image_url' => $hasCustomization ? ($customization['cover_image_url'] ?? null) : null,
        'welcome_text' => $hasCustomization ? ($customization['welcome_text'] ?? null) : null
    ];
    
    // Contatos
    $contactWhatsapp = $decorator['whatsapp'] ?? $decorator['phone'] ?? '';
    $contactEmail = $decorator['communication_email'] ?? $decorator['email_comunicacao'] ?? '';

} catch (Exception $e) {
    http_response_code(500);
    echo 'Erro interno ao carregar perfil.';
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($decoratorName); ?> - Up.Baloes</title>
    
    <link rel="icon" type="image/x-icon" href="<?php echo $baseUrl; ?>Images/favicon.ico">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="<?php echo $baseUrl; ?>css/estilos.css">
    
    <style>
        :root {
            --primary-color: <?php echo htmlspecialchars($pageConfig['primary_color']); ?>;
            --secondary-color: <?php echo htmlspecialchars($pageConfig['secondary_color']); ?>;
        }
        .decorator-hero {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            <?php 
            if (!empty($pageConfig['cover_image_url'])) {
                $coverImage = htmlspecialchars($pageConfig['cover_image_url'], ENT_QUOTES);
                echo "background-image: url('{$coverImage}');\n";
                echo "background-size: cover;\n";
                echo "background-position: center;\n";
                echo "background-blend-mode: overlay;\n";
            }
            ?>
        }
        .portfolio-item:hover { transform: scale(1.02); transition: transform 0.3s; }
    </style>
</head>
<body class="bg-gray-50">
    
    <nav id="navbar" class="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20 items-center">
                <a href="<?php echo $baseUrl; ?>index.html" class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden shadow-lg">
                         <img src="<?php echo $baseUrl; ?>Images/Logo System.jpeg" alt="Logo" class="w-full h-full object-cover">
                    </div>
                    <span class="text-xl font-bold text-gray-800">Up.Baloes</span>
                </a>
                
                <div class="hidden md:flex space-x-8">
                    <a href="#inicio" class="text-gray-700 hover:text-blue-600 font-medium">Início</a>
                    <a href="#portfolio" class="text-gray-700 hover:text-blue-600 font-medium">Portfólio</a>
                    <a href="#contatos" class="text-gray-700 hover:text-blue-600 font-medium">Contato</a>
                    <a href="<?php echo $baseUrl; ?>pages/solicitacao-cliente.html" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        Solicitar Orçamento
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <section id="inicio" class="decorator-hero text-white pt-32 pb-20">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                <?php echo htmlspecialchars($pageConfig['page_title']); ?>
            </h1>
            <p class="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-delay">
                <?php echo htmlspecialchars($pageConfig['page_description']); ?>
            </p>
            <?php if ($pageConfig['welcome_text']): ?>
            <p class="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                <?php echo nl2br(htmlspecialchars($pageConfig['welcome_text'])); ?>
            </p>
            <?php endif; ?>
            <div class="flex justify-center gap-4">
                <a href="<?php echo $baseUrl; ?>pages/solicitacao-cliente.html" class="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition shadow-lg transform hover:scale-105">
                    Fazer Pedido Agora
                </a>
            </div>
        </div>
    </section>

    <?php if (!empty($services)): ?>
    <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">Nossos Serviços</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <?php foreach ($services as $service): ?>
                <div class="p-6 border rounded-xl hover:shadow-lg transition bg-gray-50 group">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-200 transition">
                        <i class="<?php echo htmlspecialchars($service['icon'] ?? 'fas fa-star'); ?> text-blue-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-center mb-2 text-gray-800"><?php echo htmlspecialchars($service['title'] ?? 'Serviço'); ?></h3>
                    <p class="text-gray-600 text-center text-sm"><?php echo htmlspecialchars($service['description'] ?? ''); ?></p>
                    <?php if (!empty($service['price'])): ?>
                    <p class="text-center mt-4 text-green-600 font-bold text-lg">
                        R$ <?php echo number_format($service['price'], 2, ',', '.'); ?>
                    </p>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <section id="portfolio" class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">Portfólio</h2>
            <?php if (!empty($portfolio)): ?>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <?php foreach ($portfolio as $item): ?>
                    <div class="bg-white rounded-lg overflow-hidden shadow-md portfolio-item cursor-pointer">
                        <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
                            <?php 
                            $imgUrl = $item['imagem_url'] ?? $item['image_url'] ?? null;
                            if (!empty($imgUrl)): 
                                $imgSrc = $imgUrl;
                                if (strpos($imgSrc, 'http') !== 0 && strpos($imgSrc, '/') !== 0) {
                                    $imgSrc = $baseUrl . $imgSrc;
                                }
                            ?>
                                <img src="<?php echo htmlspecialchars($imgSrc); ?>" alt="<?php echo htmlspecialchars($item['titulo'] ?? 'Portfólio'); ?>" class="w-full h-full object-cover hover:scale-110 transition duration-500">
                            <?php else: ?>
                                <i class="fas fa-image text-4xl text-gray-400"></i>
                            <?php endif; ?>
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold text-gray-800 text-lg mb-1"><?php echo htmlspecialchars($item['titulo'] ?? 'Trabalho'); ?></h3>
                            <p class="text-gray-500 text-sm line-clamp-2"><?php echo htmlspecialchars($item['description'] ?? ''); ?></p>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <div class="text-center text-gray-500 py-12">
                    <i class="fas fa-images text-4xl mb-4 text-gray-300"></i>
                    <p>Este decorador ainda não publicou fotos no portfólio.</p>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <footer id="contatos" class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <h2 class="text-2xl font-bold mb-8">Entre em Contato</h2>
            <div class="flex flex-wrap justify-center gap-8 mb-10">
                <?php if ($contactWhatsapp): ?>
                <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $contactWhatsapp); ?>" target="_blank" class="hover:text-green-400 flex items-center gap-2 bg-gray-800 px-6 py-3 rounded-full transition hover:bg-gray-700">
                    <i class="fab fa-whatsapp text-2xl"></i> <span>WhatsApp</span>
                </a>
                <?php endif; ?>
                
                <?php if ($contactEmail): ?>
                <a href="mailto:<?php echo htmlspecialchars($contactEmail); ?>" class="hover:text-blue-400 flex items-center gap-2 bg-gray-800 px-6 py-3 rounded-full transition hover:bg-gray-700">
                    <i class="fas fa-envelope text-2xl"></i> <span>Email</span>
                </a>
                <?php endif; ?>
            </div>
            <div class="border-t border-gray-800 pt-8 text-gray-400 text-sm">
                <p>&copy; 2025 Up.Baloes - Plataforma para Decoradores</p>
                <p class="mt-2">Perfil oficial de: <strong><?php echo htmlspecialchars($decoratorName); ?></strong></p>
            </div>
        </div>
    </footer>

    <script src="<?php echo $baseUrl; ?>js/principal.js"></script>
</body>
</html>