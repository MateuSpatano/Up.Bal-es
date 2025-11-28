<?php
/**
 * Página de Solicitação - Up.Baloes
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
    error_log("Erro ao carregar página de solicitação: " . $e->getMessage());
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
    <title>Solicitar Serviço - <?php echo htmlspecialchars($decoratorName); ?> - Up.Baloes</title>
    
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
    
    <!-- Navbar -->
    <nav class="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo -->
                <div class="flex items-center space-x-3">
                    <a href="<?php echo $baseUrl . htmlspecialchars($slug); ?>" class="flex items-center space-x-3">
                        <div class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <img src="<?php echo $baseUrl; ?>Images/Logo System.jpeg" alt="Up.Baloes Logo" class="w-full h-full object-cover rounded-full">
                        </div>
                        <span class="text-xl font-bold text-gray-800">Up.Baloes</span>
                    </a>
                </div>
                
                <!-- Menu -->
                <div class="flex items-center space-x-4">
                    <a href="<?php echo $baseUrl . htmlspecialchars($slug); ?>" class="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-home mr-2"></i>Início
                    </a>
                    <a href="<?php echo $baseUrl . htmlspecialchars($slug); ?>/carrinho" class="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-shopping-cart mr-2"></i>Carrinho
                    </a>
                    <a href="<?php echo $baseUrl . htmlspecialchars($slug); ?>/login" class="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-user-cog mr-2"></i>Minha Conta
                    </a>
                    <a href="<?php echo $baseUrl . htmlspecialchars($slug); ?>/login" class="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">
                        <i class="fas fa-sign-in-alt mr-2"></i>Login
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Conteúdo Principal -->
    <main class="py-12">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-800 mb-4">
                    Solicitar Serviço
                </h1>
                <p class="text-xl text-gray-600">
                    Preencha o formulário abaixo para solicitar seu serviço de decoração com balões
                </p>
            </div>

            <!-- Formulário -->
            <div class="bg-white rounded-xl shadow-lg p-8">
                <form id="service-request-form" class="space-y-6">
                    <!-- Campo hidden com decorator_id -->
                    <input type="hidden" id="decorator-id" name="decorator_id" value="<?php echo htmlspecialchars($decoratorId); ?>">
                    <input type="hidden" id="decorator-slug" name="decorator_slug" value="<?php echo htmlspecialchars($slug); ?>">
                    
                    <!-- Dados do Cliente -->
                    <div class="border-b border-gray-200 pb-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-user mr-2 text-blue-600"></i>
                            Dados do Cliente
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Nome -->
                            <div class="space-y-2">
                                <label for="client-name" class="block text-sm font-medium text-gray-700">
                                    Nome Completo *
                                </label>
                                <input type="text" id="client-name" name="client_name" required
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                       placeholder="Seu nome completo">
                            </div>

                            <!-- Email -->
                            <div class="space-y-2">
                                <label for="client-email" class="block text-sm font-medium text-gray-700">
                                    Email *
                                </label>
                                <input type="email" id="client-email" name="client_email" required
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                       placeholder="seu@email.com">
                            </div>

                            <!-- Telefone -->
                            <div class="space-y-2">
                                <label for="client-phone" class="block text-sm font-medium text-gray-700">
                                    Telefone
                                </label>
                                <input type="tel" id="client-phone" name="client_phone"
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                       placeholder="(11) 99999-9999">
                            </div>

                            <!-- Data do Evento -->
                            <div class="space-y-2">
                                <label for="event-date" class="block text-sm font-medium text-gray-700">
                                    Data do Evento *
                                </label>
                                <input type="date" id="event-date" name="event_date" required
                                       min="<?php echo date('Y-m-d'); ?>"
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                            </div>
                        </div>
                    </div>

                    <!-- Dados do Serviço -->
                    <div class="border-b border-gray-200 pb-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-gift mr-2 text-purple-600"></i>
                            Dados do Serviço
                        </h3>
                        
                        <!-- Tipo de Serviço -->
                        <div class="space-y-2 mb-6">
                            <label for="service-type" class="block text-sm font-medium text-gray-700">
                                Tipo de Serviço *
                            </label>
                            <select id="service-type" name="service_type" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200">
                                <option value="">Selecione o tipo de serviço</option>
                                <option value="arco-tradicional">Arco-Tradicional</option>
                                <option value="arco-desconstruido">Arco-Desconstruído</option>
                                <option value="escultura-balao">Escultura de Balão</option>
                                <option value="centro-mesa">Centro de Mesa</option>
                                <option value="baloes-piscina">Balões na Piscina</option>
                            </select>
                        </div>

                        <!-- Tamanho do Arco -->
                        <div class="space-y-2 mb-6">
                            <label for="arc-size" class="block text-sm font-medium text-gray-700">
                                <i class="fas fa-ruler mr-2 text-purple-600"></i>Tamanho do Arco (metros) *
                            </label>
                            <input type="number" id="arc-size" name="tamanho_arco_m" step="0.1" min="0.5" max="30" required
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                   placeholder="Ex: 2.5">
                            <div class="text-xs text-gray-500">
                                <i class="fas fa-info-circle mr-1"></i>
                                Informe o tamanho do arco em metros (entre 0.5 e 30 metros)
                            </div>
                        </div>

                        <!-- Local do Evento -->
                        <div class="space-y-2 mb-6">
                            <label for="event-location" class="block text-sm font-medium text-gray-700">
                                Local do Evento *
                            </label>
                            <input type="text" id="event-location" name="event_location" required
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                   placeholder="Endereço completo do evento">
                        </div>

                        <!-- Descrição -->
                        <div class="space-y-2 mb-6">
                            <label for="description" class="block text-sm font-medium text-gray-700">
                                Descrição do Evento
                            </label>
                            <textarea id="description" name="description" rows="4"
                                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                                      placeholder="Descreva os detalhes do seu evento e decoração desejada..."></textarea>
                        </div>

                        <!-- Imagem de Inspiração -->
                        <div class="space-y-2 mb-6">
                            <label for="inspiration-image" class="block text-sm font-medium text-gray-700">
                                <i class="fas fa-image mr-2 text-purple-600"></i>Imagem de Inspiração
                            </label>
                            <div class="relative">
                                <input type="file" id="inspiration-image" name="inspiration_image" accept="image/*"
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100">
                                <div class="text-xs text-gray-500 mt-1">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    Envie uma imagem que inspire a decoração desejada (opcional)
                                </div>
                            </div>
                            <!-- Preview da imagem -->
                            <div id="image-preview" class="hidden mt-3">
                                <img id="preview-img" src="" alt="Preview" class="max-w-xs max-h-48 rounded-lg shadow-md">
                                <button type="button" id="remove-image" class="mt-2 text-red-600 hover:text-red-800 text-sm">
                                    <i class="fas fa-trash mr-1"></i>Remover imagem
                                </button>
                            </div>
                        </div>

                    </div>

                    <!-- Observações -->
                    <div class="space-y-2">
                        <label for="notes" class="block text-sm font-medium text-gray-700">
                            Observações Adicionais
                        </label>
                        <textarea id="notes" name="notes" rows="3"
                                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                  placeholder="Alguma informação adicional que gostaria de compartilhar..."></textarea>
                    </div>

                    <!-- Botões -->
                    <div class="flex flex-col sm:flex-row gap-4 pt-6">
                        <button type="button" id="cancel-request" 
                                class="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200">
                            <i class="fas fa-times mr-2"></i>Cancelar
                        </button>
                        <button type="submit" id="submit-request"
                                class="flex-1 px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                            <i class="fas fa-paper-plane mr-2"></i>Enviar Solicitação
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2025 Up.Baloes. Todos os direitos reservados.</p>
        </div>
    </footer>

    <!-- JavaScript -->
    <script src="<?php echo $baseUrl; ?>js/principal.js"></script>
    <script src="<?php echo $baseUrl; ?>js/solicitacao-cliente.js"></script>
    <script>
        // Injetar decorator_id e slug no contexto global
        window.DECORATOR_ID = <?php echo json_encode($decoratorId); ?>;
        window.DECORATOR_SLUG = <?php echo json_encode($slug); ?>;
        window.BASE_URL = <?php echo json_encode($baseUrl); ?>;
    </script>
</body>
</html>

