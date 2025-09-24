<?php
/**
 * Página do Decorador - Up.Baloes
 * 
 * Esta página é carregada quando alguém acessa www.upbaloes.com/{slug}
 * e exibe as informações do decorador correspondente.
 */

// Incluir configurações
require_once 'services/config.php';
require_once 'services/decorador.php';

// Obter slug da URL
$slug = $_GET['slug'] ?? '';

if (empty($slug)) {
    // Redirecionar para página inicial se não houver slug
    header('Location: index.html');
    exit;
}

// Buscar dados do decorador
try {
    $decoratorService = new DecoratorService($database_config);
    $result = $decoratorService->getDecoratorBySlug($slug);
    
    if (!$result['success']) {
        // Decorador não encontrado - redirecionar para página 404
        header('Location: decorador-nao-encontrado.html');
        exit;
    }
    
    $decoratorData = $result['data'];
    $decorator = $decoratorData['decorator'];
    $services = $decoratorData['services'];
    $portfolio = $decoratorData['portfolio'];
    
} catch (Exception $e) {
    // Erro interno - redirecionar para página 404
    error_log('Erro ao carregar decorador: ' . $e->getMessage());
    header('Location: decorator-not-found.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($decorator['nome']); ?> - Up.Baloes</title>
    
    <!-- Meta tags para SEO -->
    <meta name="description" content="Conheça <?php echo htmlspecialchars($decorator['nome']); ?>, decorador especializado em festas com balões. Serviços personalizados para seus eventos especiais.">
    <meta name="keywords" content="decorador, festas, balões, <?php echo htmlspecialchars($decorator['cidade']); ?>, eventos">
    
    <!-- Open Graph para redes sociais -->
    <meta property="og:title" content="<?php echo htmlspecialchars($decorator['nome']); ?> - Up.Baloes">
    <meta property="og:description" content="Conheça <?php echo htmlspecialchars($decorator['nome']); ?>, decorador especializado em festas com balões.">
    <meta property="og:type" content="profile">
    <meta property="og:url" content="https://www.upbaloes.com/<?php echo htmlspecialchars($slug); ?>">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="Images/favicon.ico">
    <link rel="shortcut icon" type="image/x-icon" href="Images/favicon.ico">
    <link rel="apple-touch-icon" href="Images/favicon.ico">
    
    <!-- Font Awesome para ícones -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- TailwindCSS para estilos -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- CSS personalizado -->
    <link rel="stylesheet" href="css/estilos.css">
    
    <style>
        .decorator-hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
<body class="bg-gray-50">
    
    <!-- Navbar -->
    <nav class="bg-white shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo -->
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <img src="Images/Logo System.jpeg" alt="Up.Baloes Logo" class="w-full h-full object-cover rounded-full">
                    </div>
                    <span class="text-xl font-bold text-gray-800">Up.Baloes</span>
                </div>
                
                <!-- Menu -->
                <div class="flex items-center space-x-4">
                    <a href="index.html" class="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                        <i class="fas fa-home mr-2"></i>Início
                    </a>
                    <a href="pages/client-request.html" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                        <i class="fas fa-gift mr-2"></i>Solicitar Serviço
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="decorator-hero text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <div class="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-user-tie text-6xl text-white"></i>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold mb-4">
                    <?php echo htmlspecialchars($decorator['nome']); ?>
                </h1>
                <p class="text-xl text-blue-100 mb-6">
                    Decorador Especializado em Festas com Balões
                </p>
                <?php if (!empty($decorator['cidade'])): ?>
                <p class="text-lg text-blue-200">
                    <i class="fas fa-map-marker-alt mr-2"></i>
                    <?php echo htmlspecialchars($decorator['cidade']); ?>
                    <?php if (!empty($decorator['estado'])): ?>
                        - <?php echo htmlspecialchars($decorator['estado']); ?>
                    <?php endif; ?>
                </p>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Informações de Contato -->
    <section class="py-12 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Email -->
                <div class="text-center p-6 bg-gray-50 rounded-xl">
                    <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-envelope text-white text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Email</h3>
                    <p class="text-gray-600"><?php echo htmlspecialchars($decorator['email']); ?></p>
                </div>
                
                <!-- Telefone -->
                <div class="text-center p-6 bg-gray-50 rounded-xl">
                    <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-phone text-white text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Telefone</h3>
                    <p class="text-gray-600"><?php echo htmlspecialchars($decorator['telefone']); ?></p>
                </div>
                
                <!-- Localização -->
                <div class="text-center p-6 bg-gray-50 rounded-xl">
                    <div class="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-map-marker-alt text-white text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Localização</h3>
                    <p class="text-gray-600">
                        <?php 
                        $location = [];
                        if (!empty($decorator['cidade'])) $location[] = $decorator['cidade'];
                        if (!empty($decorator['estado'])) $location[] = $decorator['estado'];
                        echo htmlspecialchars(implode(' - ', $location));
                        ?>
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Serviços -->
    <?php if (!empty($services)): ?>
    <section class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    Nossos Serviços
                </h2>
                <p class="text-xl text-gray-600">
                    Conheça os serviços especializados que oferecemos
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <?php foreach ($services as $service): ?>
                <div class="service-card bg-white p-6 rounded-xl shadow-lg">
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-gift text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3 text-center">
                        <?php echo htmlspecialchars($service['nome']); ?>
                    </h3>
                    <p class="text-gray-600 mb-4 text-center">
                        <?php echo htmlspecialchars($service['descricao']); ?>
                    </p>
                    <?php if (!empty($service['preco_base'])): ?>
                    <div class="text-center">
                        <span class="text-2xl font-bold text-blue-600">
                            R$ <?php echo number_format($service['preco_base'], 2, ',', '.'); ?>
                        </span>
                    </div>
                    <?php endif; ?>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <!-- Portfólio -->
    <?php if (!empty($portfolio)): ?>
    <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    Nosso Portfólio
                </h2>
                <p class="text-xl text-gray-600">
                    Veja alguns dos nossos trabalhos realizados
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <?php foreach ($portfolio as $item): ?>
                <div class="portfolio-item bg-white rounded-xl shadow-lg overflow-hidden">
                    <?php if (!empty($item['imagem_url'])): ?>
                    <img src="<?php echo htmlspecialchars($item['imagem_url']); ?>" 
                         alt="<?php echo htmlspecialchars($item['titulo']); ?>" 
                         class="w-full h-48 object-cover">
                    <?php else: ?>
                    <div class="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <i class="fas fa-image text-white text-4xl"></i>
                    </div>
                    <?php endif; ?>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">
                            <?php echo htmlspecialchars($item['titulo']); ?>
                        </h3>
                        <p class="text-gray-600 mb-4">
                            <?php echo htmlspecialchars($item['descricao']); ?>
                        </p>
                        <?php if (!empty($item['data_evento'])): ?>
                        <p class="text-sm text-gray-500">
                            <i class="fas fa-calendar mr-2"></i>
                            <?php echo date('d/m/Y', strtotime($item['data_evento'])); ?>
                        </p>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <!-- Call to Action -->
    <section class="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">
                Pronto para fazer sua festa inesquecível?
            </h2>
            <p class="text-xl text-blue-100 mb-8">
                Entre em contato conosco e vamos criar algo especial para você!
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="pages/client-request.html" 
                   class="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg inline-flex items-center justify-center">
                    <i class="fas fa-gift mr-2"></i>
                    Solicitar Orçamento
                </a>
                <a href="tel:<?php echo htmlspecialchars($decorator['telefone']); ?>" 
                   class="border-2 border-white hover:bg-white hover:text-blue-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 inline-flex items-center justify-center">
                    <i class="fas fa-phone mr-2"></i>
                    Ligar Agora
                </a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="flex items-center justify-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <img src="Images/Logo System.jpeg" alt="Up.Baloes Logo" class="w-full h-full object-cover rounded-full">
                </div>
                <span class="text-xl font-bold">Up.Baloes</span>
            </div>
            <p>&copy; 2024 Up.Baloes. Todos os direitos reservados.</p>
            <p class="text-gray-400 text-sm mt-2">
                Decorador: <?php echo htmlspecialchars($decorator['nome']); ?>
            </p>
        </div>
    </footer>

    <!-- JavaScript -->
    <script>
        // Adicionar funcionalidades interativas se necessário
        document.addEventListener('DOMContentLoaded', function() {
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
