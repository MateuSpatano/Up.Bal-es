<?php
/**
 * Handler de URL para Página Pública do Decorador
 * Processa requisições diretas via slug (ex: /nome-decorador)
 * Também processa ações POST para gerenciamento de personalização
 */

// Desabilitar exibição de erros para evitar HTML na resposta JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/decorador-service.php';

// Verificar se é uma requisição POST para ações de API
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Configurar cabeçalhos para JSON
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    // Verificar método OPTIONS (CORS preflight)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
    
    try {
        // Obter dados da requisição
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['action'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Ação não especificada']);
            exit();
        }
        
        $action = $input['action'];
        
        // Inicializar sessão para autenticação
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Obter conexão com banco de dados
        $pdo = getDatabaseConnection($database_config);
        
        // Obter ID do usuário da sessão (método principal)
        $userId = $_SESSION['user_id'] ?? null;
        
        // Log para debug
        error_log("Decorador API - Action: $action, Session user_id: " . ($userId ?? 'null'));
        error_log("Decorador API - Session data: " . json_encode($_SESSION));
        
        // Se não houver na sessão, tentar obter do input (fallback)
        if (!$userId && isset($input['user_id'])) {
            $userId = intval($input['user_id']);
            error_log("Decorador API - Using user_id from input: $userId");
        }
        
        switch ($action) {
            case 'get_my_page_customization':
                if (!$userId) {
                    error_log("Decorador API - Authentication failed: No user_id found");
                    http_response_code(401);
                    echo json_encode([
                        'success' => false, 
                        'message' => 'Usuário não autenticado. Faça login novamente.',
                        'debug' => [
                            'session_user_id' => $_SESSION['user_id'] ?? null,
                            'input_user_id' => $input['user_id'] ?? null
                        ]
                    ]);
                    exit();
                }
                
                error_log("Decorador API - Loading customization for user_id: $userId");
                        
                        // Buscar customização do decorador
                        $stmt = $pdo->prepare("
                    SELECT 
                        page_title, page_description, welcome_text, cover_image_url,
                        primary_color, secondary_color, accent_color,
                        services_config, social_media,
                        meta_title, meta_description, meta_keywords,
                        show_contact_section, show_services_section, show_portfolio_section
                    FROM decorator_page_customization
                    WHERE decorator_id = ? AND is_active = 1
                ");
                
                $stmt->execute([$userId]);
                $customization = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$customization) {
                    // Retornar valores padrão se não houver customização
                    $customization = [
                        'page_title' => '',
                        'page_description' => '',
                        'welcome_text' => '',
                        'cover_image_url' => '',
                        'primary_color' => '#667eea',
                        'secondary_color' => '#764ba2',
                        'accent_color' => '#f59e0b',
                        'services_config' => null,
                        'social_media' => '{}',
                        'meta_title' => '',
                        'meta_description' => '',
                        'meta_keywords' => ''
                    ];
                } else {
                    // Processar campos JSON
                    if (is_string($customization['social_media'])) {
                        $customization['social_media'] = json_decode($customization['social_media'], true) ?: [];
                    }
                    // Adicionar campos de contato vazios se não existirem
                    $customization['contact_email'] = $customization['contact_email'] ?? '';
                    $customization['contact_whatsapp'] = $customization['contact_whatsapp'] ?? '';
                    $customization['contact_instagram'] = $customization['contact_instagram'] ?? '';
                }
                
                echo json_encode([
                    'success' => true,
                    'data' => $customization
                ]);
                exit();
                
            case 'save_my_page_customization':
                if (!$userId) {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
                    exit();
                }
                
                // Preparar dados de customização
                $socialMedia = [
                    'facebook' => $input['social_facebook'] ?? '',
                    'instagram' => $input['social_instagram'] ?? '',
                    'whatsapp' => $input['social_whatsapp'] ?? '',
                    'youtube' => $input['social_youtube'] ?? ''
                ];
                
                // Verificar se já existe customização
                $stmt = $pdo->prepare("
                    SELECT id FROM decorator_page_customization 
                    WHERE decorator_id = ? AND is_active = 1
                ");
                $stmt->execute([$userId]);
                $existing = $stmt->fetch();
                
                if ($existing) {
                    // Atualizar existente (sem campos contact_* que não existem na tabela)
                    $stmt = $pdo->prepare("
                        UPDATE decorator_page_customization SET
                            page_title = ?,
                            page_description = ?,
                            welcome_text = ?,
                            cover_image_url = ?,
                            primary_color = ?,
                            secondary_color = ?,
                            accent_color = ?,
                            social_media = ?,
                            meta_title = ?,
                            meta_description = ?,
                            meta_keywords = ?,
                            updated_at = NOW()
                        WHERE decorator_id = ? AND is_active = 1
                    ");
                    
                    $stmt->execute([
                        $input['page_title'] ?? '',
                        $input['page_description'] ?? '',
                        $input['welcome_text'] ?? '',
                        $input['cover_image_url'] ?? '',
                        $input['primary_color'] ?? '#667eea',
                        $input['secondary_color'] ?? '#764ba2',
                        $input['accent_color'] ?? '#f59e0b',
                        json_encode($socialMedia),
                        $input['meta_title'] ?? '',
                        $input['meta_description'] ?? '',
                        $input['meta_keywords'] ?? '',
                        $userId
                    ]);
                } else {
                    // Criar nova customização (sem campos contact_* que não existem na tabela)
                    $stmt = $pdo->prepare("
                        INSERT INTO decorator_page_customization (
                            decorator_id, page_title, page_description, welcome_text,
                            cover_image_url, primary_color, secondary_color, accent_color,
                            social_media, meta_title, meta_description, meta_keywords,
                            is_active, created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
                    ");
                    
                    $stmt->execute([
                        $userId,
                        $input['page_title'] ?? '',
                        $input['page_description'] ?? '',
                        $input['welcome_text'] ?? '',
                        $input['cover_image_url'] ?? '',
                        $input['primary_color'] ?? '#667eea',
                        $input['secondary_color'] ?? '#764ba2',
                        $input['accent_color'] ?? '#f59e0b',
                        json_encode($socialMedia),
                        $input['meta_title'] ?? '',
                        $input['meta_description'] ?? '',
                        $input['meta_keywords'] ?? ''
                    ]);
                }
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Personalização salva com sucesso!'
                ]);
                exit();
                
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Ação não reconhecida']);
                exit();
        }
        
    } catch (Exception $e) {
        error_log("Erro ao processar ação POST: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao processar requisição: ' . $e->getMessage()
        ]);
        exit();
    }
}

// Processar requisição GET normal (página pública do decorador)
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
                            
                            <?php if ($item['price']): ?>
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
    </script>
</body>
</html>