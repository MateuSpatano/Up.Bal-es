<?php
/**
 * View de Login - Up.Baloes
 * Mantém identidade visual padrão, mas captura contexto do decorador
 */

// Capturar slug da URL
$slug = $_GET['slug'] ?? '';

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

$baseUrl = getCorrectBaseUrl();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Up.Baloes</title>
    
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
    <link rel="stylesheet" href="<?php echo $baseUrl; ?>css/login.css">
    <link rel="stylesheet" href="<?php echo $baseUrl; ?>css/login-fixes.css">
    
    <!-- Injetar slug no JavaScript para uso posterior -->
    <script>
        const contextSlug = "<?php echo htmlspecialchars($slug ?? '', ENT_QUOTES, 'UTF-8'); ?>";
    </script>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen overflow-y-auto overflow-x-hidden">
    
    <!-- Fundo Animado com Balões -->
    <div id="animated-background" class="fixed inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-20"></div>
        
        <!-- Balões Animados -->
        <div class="balloon balloon-1">
            <div class="balloon-body">🎈</div>
            <div class="balloon-string"></div>
        </div>
        <div class="balloon balloon-2">
            <div class="balloon-body">🎈</div>
            <div class="balloon-string"></div>
        </div>
        <div class="balloon balloon-3">
            <div class="balloon-body">🎈</div>
            <div class="balloon-string"></div>
        </div>
        <div class="balloon balloon-4">
            <div class="balloon-body">🎈</div>
            <div class="balloon-string"></div>
        </div>
        <div class="balloon balloon-5">
            <div class="balloon-body">🎈</div>
            <div class="balloon-string"></div>
        </div>
        <div class="balloon balloon-6">
            <div class="balloon-body">🎈</div>
            <div class="balloon-string"></div>
        </div>
        
        <!-- Nuvens -->
        <div class="cloud cloud-1">☁️</div>
        <div class="cloud cloud-2">☁️</div>
        <div class="cloud cloud-3">☁️</div>
    </div>

    <!-- Container Principal -->
    <div class="relative z-10 flex items-center justify-center min-h-screen px-3 sm:px-4 lg:px-8 py-6 sm:py-8 md:py-12">
        
        <!-- Card de Login -->
        <div class="w-full max-w-[90%] sm:max-w-md md:max-w-lg space-y-4 sm:space-y-6 md:space-y-8">
            
            <!-- Header -->
            <div class="text-center">
                <div class="mx-auto h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl mb-3 sm:mb-4 md:mb-5 logo-container">
                    <img src="<?php echo $baseUrl; ?>Images/Logo System.jpeg" alt="Up.Baloes Logo" class="w-full h-full object-cover rounded-full logo-image">
                </div>
                <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">Up.Baloes</h2>
                <p class="text-sm sm:text-base lg:text-lg text-gray-600">Faça login em sua conta</p>
            </div>

            <!-- Formulário de Login -->
            <form id="login-form" class="mt-4 sm:mt-6 md:mt-8 space-y-3 sm:space-y-4 md:space-y-5 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-7 lg:p-8 border border-white/20">
                
                <!-- Campo de Email -->
                <div class="space-y-1 sm:space-y-2">
                    <label for="email" class="block text-xs sm:text-sm font-medium text-gray-700">
                        <i class="fas fa-envelope mr-1 sm:mr-2 text-blue-500"></i>Email
                    </label>
                    <div class="relative">
                        <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            autocomplete="email" 
                            required 
                            class="appearance-none relative block w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 text-sm sm:text-base border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200"
                            placeholder="seu@email.com"
                        >
                        <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                            <i class="fas fa-envelope text-gray-400 text-sm sm:text-base"></i>
                        </div>
                    </div>
                </div>

                <!-- Campo de Senha -->
                <div class="space-y-1 sm:space-y-2">
                    <label for="password" class="block text-xs sm:text-sm font-medium text-gray-700">
                        <i class="fas fa-lock mr-1 sm:mr-2 text-blue-500"></i>Senha
                    </label>
                    <div class="relative">
                        <input 
                            id="password" 
                            name="password" 
                            type="password" 
                            autocomplete="current-password" 
                            required 
                            class="appearance-none relative block w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200"
                            placeholder="Digite sua senha"
                        >
                        <div class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                            <i class="fas fa-lock text-gray-400 text-sm sm:text-base"></i>
                        </div>
                        <button 
                            type="button" 
                            id="toggle-password" 
                            class="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                        >
                            <i class="fas fa-eye text-gray-400 hover:text-blue-500 transition-colors duration-200 text-sm sm:text-base"></i>
                        </button>
                    </div>
                </div>

                <!-- Opções Adicionais -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div class="flex items-center">
                        <input 
                            id="remember-me" 
                            name="remember-me" 
                            type="checkbox" 
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                        >
                        <label for="remember-me" class="ml-2 block text-xs sm:text-sm text-gray-700">
                            Lembrar minhas credenciais
                        </label>
                    </div>

                    <div class="text-xs sm:text-sm">
                        <a href="#forgot-password" id="forgot-password-link" class="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                            <i class="fas fa-key mr-1"></i>Esqueci minha senha
                        </a>
                    </div>
                </div>

                <!-- Botão de Login -->
                <div>
                    <button 
                        type="submit" 
                        id="login-btn"
                        class="group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <i class="fas fa-sign-in-alt text-blue-300 group-hover:text-blue-200 transition-colors duration-200 text-sm sm:text-base"></i>
                        </span>
                        <span id="login-btn-text">Entrar</span>
                        <div id="login-spinner" class="hidden ml-2">
                            <div class="spinner"></div>
                        </div>
                    </button>
                </div>

                <!-- Divider -->
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">Ou</span>
                    </div>
                </div>

                <!-- Botão de Cadastro -->
                <div>
                    <?php if (!empty($slug)): ?>
                        <a 
                            href="<?php echo $baseUrl . htmlspecialchars($slug); ?>/cadastro"
                            class="group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                    <?php else: ?>
                        <a 
                            href="<?php echo $baseUrl; ?>pages/cadastro.html"
                            class="group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                    <?php endif; ?>
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <i class="fas fa-user-plus text-green-300 group-hover:text-green-200 transition-colors duration-200 text-sm sm:text-base"></i>
                        </span>
                        Criar Nova Conta
                    </a>
                </div>

                <!-- Botão de Login Administrativo -->
                <div>
                    <a 
                        href="<?php echo $baseUrl; ?>pages/admin-login.html"
                        class="group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-gray-300 text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <i class="fas fa-crown text-gray-400 group-hover:text-gray-600 transition-colors duration-200 text-sm sm:text-base"></i>
                        </span>
                        Área Administrativa
                    </a>
                </div>

                <!-- Botão de Voltar -->
                <div>
                    <?php if (!empty($slug)): ?>
                        <a 
                            href="/<?php echo htmlspecialchars($slug); ?>"
                            class="group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-gray-300 text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-md"
                        >
                    <?php else: ?>
                        <a 
                            href="<?php echo $baseUrl; ?>index.html"
                            class="group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-gray-300 text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-md"
                        >
                    <?php endif; ?>
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <i class="fas fa-arrow-left text-gray-400 group-hover:text-gray-600 transition-colors duration-200 text-sm sm:text-base"></i>
                        </span>
                        Voltar ao Início
                    </a>
                </div>

                <!-- Mensagens de Erro/Sucesso -->
                <div id="message-container" class="hidden">
                    <div id="message" class="rounded-lg p-4 text-sm font-medium"></div>
                </div>
            </form>

            <!-- Footer -->
            <div class="text-center text-xs sm:text-sm text-gray-500">
                <p>&copy; 2025 Up.Baloes. Todos os direitos reservados.</p>
            </div>
        </div>
    </div>

    <!-- Modal de Esqueci Minha Senha -->
    <div id="forgot-password-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden p-4">
        <div class="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-sm sm:w-96 shadow-lg rounded-2xl bg-white">
            <div class="mt-3">
                <!-- Header do Modal -->
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-base sm:text-lg font-medium text-gray-900">
                        <i class="fas fa-key mr-2 text-blue-500"></i>Recuperar Senha
                    </h3>
                    <button id="close-forgot-modal" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <i class="fas fa-times text-lg sm:text-xl"></i>
                    </button>
                </div>

                <!-- Conteúdo do Modal -->
                <div class="mb-4">
                    <p class="text-xs sm:text-sm text-gray-600 mb-4">
                        Digite seu email para receber instruções de recuperação de senha.
                    </p>
                    <input 
                        type="email" 
                        id="forgot-email" 
                        placeholder="seu@email.com"
                        class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                </div>

                <!-- Botões do Modal -->
                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button 
                        id="send-reset-email"
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                    >
                        <i class="fas fa-paper-plane mr-2"></i>Enviar
                    </button>
                    <button 
                        id="cancel-forgot"
                        class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- JavaScript -->
    <script src="<?php echo $baseUrl; ?>js/json-utils.js"></script>
    <script src="<?php echo $baseUrl; ?>js/principal.js"></script>
    <script src="<?php echo $baseUrl; ?>js/login.js"></script>
</body>
</html>

