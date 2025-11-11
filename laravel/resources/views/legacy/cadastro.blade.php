<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro - Up.Baloes</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ asset('images/favicon.ico') }}">
    <link rel="shortcut icon" type="image/x-icon" href="{{ asset('images/favicon.ico') }}">
    <link rel="apple-touch-icon" href="{{ asset('images/favicon.ico') }}">
    
    <!-- Font Awesome para ícones -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- TailwindCSS para estilos -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- CSS personalizado -->
    <link rel="stylesheet" href="{{ asset('css/estilos.css') }}">
    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    
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
    <div class="relative z-10 flex items-center justify-center min-h-screen px-2 sm:px-4 lg:px-8 py-8 sm:py-12 scroll-transparent">
        
        <!-- Card de Cadastro -->
        <div class="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl space-y-4 sm:space-y-6">
            
            <!-- Header -->
            <div class="text-center">
                <div class="mx-auto h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl mb-3 sm:mb-4 md:mb-5 logo-container">
                    <img src="{{ asset('images/Logo System.jpeg') }}" alt="Up.Baloes Logo" class="w-full h-full object-cover rounded-full logo-image">
                </div>
                <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">Up.Baloes</h2>
                <p class="text-sm sm:text-base lg:text-lg text-gray-600">Crie sua conta</p>
            </div>

            <!-- Formulário de Cadastro -->
            <form id="cadastro-form" class="mt-4 sm:mt-6 space-y-3 sm:space-y-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8 border border-white/20">
                
                <!-- Nome Completo -->
                <div class="space-y-1">
                    <label for="nome" class="block text-xs sm:text-sm font-medium text-gray-700">
                        <i class="fas fa-user mr-1 text-blue-500 sm:mr-2"></i>Nome Completo
                    </label>
                    <div class="relative">
                        <input 
                            id="nome" 
                            name="nome" 
                            type="text" 
                            autocomplete="name" 
                            required 
                            class="appearance-none relative block w-full px-3 py-2.5 pl-10 text-sm border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200 sm:px-4 sm:py-3 sm:pl-12 sm:text-base"
                            placeholder="Digite seu nome completo"
                        >
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none sm:pl-4">
                            <i class="fas fa-user text-gray-400 text-sm"></i>
                        </div>
                    </div>
                </div>

                <!-- Campo de Email -->
                <div class="space-y-1">
                    <label for="email" class="block text-xs sm:text-sm font-medium text-gray-700">
                        <i class="fas fa-envelope mr-1 text-blue-500 sm:mr-2"></i>Email
                    </label>
                    <div class="relative">
                        <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            autocomplete="email" 
                            required 
                            class="appearance-none relative block w-full px-3 py-2.5 pl-10 text-sm border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200 sm:px-4 sm:py-3 sm:pl-12 sm:text-base"
                            placeholder="seu@email.com"
                        >
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none sm:pl-4">
                            <i class="fas fa-envelope text-gray-400 text-sm"></i>
                        </div>
                    </div>
                </div>

                <!-- Telefone -->
                <div class="space-y-1">
                    <label for="telefone" class="block text-xs sm:text-sm font-medium text-gray-700">
                        <i class="fas fa-phone mr-1 text-blue-500 sm:mr-2"></i>Telefone
                    </label>
                    <div class="relative">
                        <input 
                            id="telefone" 
                            name="telefone" 
                            type="tel" 
                            autocomplete="tel" 
                            class="appearance-none relative block w-full px-3 py-2.5 pl-10 text-sm border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200 sm:px-4 sm:py-3 sm:pl-12 sm:text-base"
                            placeholder="(11) 99999-9999"
                        >
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none sm:pl-4">
                            <i class="fas fa-phone text-gray-400 text-sm"></i>
                        </div>
                    </div>
                </div>

                <!-- Endereço -->
                <div class="space-y-1">
                    <label for="endereco" class="block text-xs sm:text-sm font-medium text-gray-700">
                        <i class="fas fa-map-marker-alt mr-1 text-blue-500 sm:mr-2"></i>Endereço
                    </label>
                    <div class="relative">
                        <textarea 
                            id="endereco" 
                            name="endereco" 
                            rows="2"
                            class="appearance-none relative block w-full px-3 py-2.5 pl-10 text-sm border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200 resize-none sm:px-4 sm:py-3 sm:pl-12 sm:text-base"
                            placeholder="Digite seu endereço completo"
                        ></textarea>
                        <div class="absolute top-3 left-0 pl-3 flex items-start pointer-events-none sm:pl-4">
                            <i class="fas fa-map-marker-alt text-gray-400 text-sm"></i>
                        </div>
                    </div>
                </div>

                <!-- Cidade e Estado -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div class="space-y-1">
                        <label for="cidade" class="block text-xs sm:text-sm font-medium text-gray-700">
                            <i class="fas fa-city mr-1 text-blue-500 sm:mr-2"></i>Cidade
                        </label>
                        <div class="relative">
                            <input 
                                id="cidade" 
                                name="cidade" 
                                type="text" 
                                class="appearance-none relative block w-full px-3 py-2.5 pl-10 text-sm border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200 sm:px-4 sm:py-3 sm:pl-12 sm:text-base"
                                placeholder="Sua cidade"
                            >
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none sm:pl-4">
                                <i class="fas fa-city text-gray-400 text-sm"></i>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-1">
                        <label for="estado" class="block text-xs sm:text-sm font-medium text-gray-700">
                            <i class="fas fa-map mr-1 text-blue-500 sm:mr-2"></i>Estado
                        </label>
                        <div class="relative">
                            <select 
                                id="estado" 
                                name="estado" 
                                class="appearance-none relative block w-full px-3 py-2.5 pl-10 text-sm border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200 sm:px-4 sm:py-3 sm:pl-12 sm:text-base"
                            >
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
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none sm:pl-4">
                                <i class="fas fa-map text-gray-400 text-sm"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CEP -->
                <div class="space-y-1">
                    <label for="cep" class="block text-xs sm:text-sm font-medium text-gray-700">
                        <i class="fas fa-mail-bulk mr-1 text-blue-500 sm:mr-2"></i>CEP
                    </label>
                    <div class="relative">
                        <input 
                            id="cep" 
                            name="cep" 
                            type="text" 
                            maxlength="9"
                            class="appearance-none relative block w-full px-3 py-2.5 pl-10 text-sm border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200 sm:px-4 sm:py-3 sm:pl-12 sm:text-base"
                            placeholder="00000-000"
                        >
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none sm:pl-4">
                            <i class="fas fa-mail-bulk text-gray-400 text-sm"></i>
                        </div>
                    </div>
                </div>

                <!-- Campo de Senha -->
                <div class="space-y-1">
                    <label for="senha" class="block text-xs sm:text-sm font-medium text-gray-700">
                        <i class="fas fa-lock mr-1 text-blue-500 sm:mr-2"></i>Senha
                    </label>
                    <div class="relative">
                        <input 
                            id="senha" 
                            name="senha" 
                            type="password" 
                            autocomplete="new-password" 
                            required 
                            class="appearance-none relative block w-full px-3 py-2.5 pl-10 pr-10 text-sm border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200 sm:px-4 sm:py-3 sm:pl-12 sm:pr-12 sm:text-base"
                            placeholder="Digite sua senha"
                        >
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none sm:pl-4">
                            <i class="fas fa-lock text-gray-400 text-sm"></i>
                        </div>
                        <button 
                            type="button" 
                            id="toggle-senha" 
                            class="absolute inset-y-0 right-0 pr-3 flex items-center sm:pr-4"
                        >
                            <i class="fas fa-eye text-gray-400 hover:text-blue-500 transition-colors duration-200 text-sm"></i>
                        </button>
                    </div>
                </div>

                <!-- Confirmar Senha -->
                <div class="space-y-1">
                    <label for="confirmar-senha" class="block text-xs sm:text-sm font-medium text-gray-700">
                        <i class="fas fa-check-circle mr-1 text-blue-500 sm:mr-2"></i>Confirmar Senha
                    </label>
                    <div class="relative">
                        <input 
                            id="confirmar-senha" 
                            name="confirmar-senha" 
                            type="password" 
                            autocomplete="new-password" 
                            required 
                            class="appearance-none relative block w-full px-3 py-2.5 pl-10 pr-10 text-sm border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-all duration-200 sm:px-4 sm:py-3 sm:pl-12 sm:pr-12 sm:text-base"
                            placeholder="Confirme sua senha"
                        >
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none sm:pl-4">
                            <i class="fas fa-check-circle text-gray-400 text-sm"></i>
                        </div>
                        <button 
                            type="button" 
                            id="toggle-confirmar-senha" 
                            class="absolute inset-y-0 right-0 pr-3 flex items-center sm:pr-4"
                        >
                            <i class="fas fa-eye text-gray-400 hover:text-blue-500 transition-colors duration-200 text-sm"></i>
                        </button>
                    </div>
                </div>

                <!-- Termos e Condições -->
                <div class="flex items-start">
                    <div class="flex items-center h-5">
                        <input 
                            id="aceitar-termos" 
                            name="aceitar-termos" 
                            type="checkbox" 
                            required
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                        >
                    </div>
                    <div class="ml-3 text-sm">
                        <label for="aceitar-termos" class="text-gray-700">
                            Eu aceito os <a href="#" class="text-blue-600 hover:text-blue-500 transition-colors duration-200">termos e condições</a> e a <a href="#" class="text-blue-600 hover:text-blue-500 transition-colors duration-200">política de privacidade</a>
                        </label>
                    </div>
                </div>

                <!-- Botão de Cadastro -->
                <div>
                    <button 
                        type="submit" 
                        id="cadastro-btn"
                        class="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105 shadow-lg sm:py-3 sm:text-base"
                    >
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <i class="fas fa-user-plus text-green-300 group-hover:text-green-200 transition-colors duration-200 text-sm"></i>
                        </span>
                        <span id="cadastro-btn-text">Criar Conta</span>
                        <div id="cadastro-spinner" class="hidden ml-2">
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

                <!-- Botão de Voltar para Login -->
                <div>
                    <a 
                        href="{{ route('login') }}"
                        class="group relative w-full flex justify-center py-2.5 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-md sm:py-3 sm:text-base"
                    >
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <i class="fas fa-sign-in-alt text-gray-400 group-hover:text-gray-600 transition-colors duration-200 text-sm"></i>
                        </span>
                        Já tenho uma conta
                    </a>
                </div>

                <!-- Mensagens de Erro/Sucesso -->
                <div id="message-container" class="hidden">
                    <div id="message" class="rounded-lg p-4 text-sm font-medium"></div>
                </div>
            </form>

            <!-- Footer -->
            <div class="text-center text-xs sm:text-sm text-gray-500">
                <p>&copy; 2024 Up.Baloes. Todos os direitos reservados.</p>
            </div>
        </div>
    </div>

    <!-- JavaScript -->
    <script src="{{ asset('js/principal.js') }}"></script>
    <script src="{{ asset('js/cadastro.js') }}"></script>
</body>
</html>
