// Sistema de login Up.Baloes
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos do formulário
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const rememberCheckbox = document.getElementById('remember-me');
    const loginBtn = document.getElementById('login-btn');
    const loginBtnText = document.getElementById('login-btn-text');
    const loginSpinner = document.getElementById('login-spinner');
    const messageContainer = document.getElementById('message-container');
    const message = document.getElementById('message');
    
    // Elementos do modal de recuperação de senha
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const closeForgotModal = document.getElementById('close-forgot-modal');
    const cancelForgot = document.getElementById('cancel-forgot');
    const sendResetEmail = document.getElementById('send-reset-email');
    const forgotEmailInput = document.getElementById('forgot-email');

    // Regex e estado dos campos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isPasswordVisible = false;
    let isLoading = false;
    
    // ========== FUNÇÕES DE CRIPTOGRAFIA ==========
    // Chave simples para criptografia básica (não é totalmente segura, mas melhor que texto plano)
    const ENCRYPTION_KEY = 'upbaloes_remember_key_2025';
    
    /**
     * Criptografar senha antes de salvar
     * Usa uma criptografia simples com base64 e chave
     */
    function encryptPassword(password) {
        try {
            // Criar uma string combinando senha + chave
            const combined = password + ENCRYPTION_KEY;
            // Converter para base64
            return btoa(combined);
        } catch (error) {
            console.error('Erro ao criptografar senha:', error);
            return null;
        }
    }
    
    /**
     * Descriptografar senha salva
     */
    function decryptPassword(encryptedPassword) {
        try {
            // Decodificar base64
            const decoded = atob(encryptedPassword);
            // Remover a chave
            return decoded.replace(ENCRYPTION_KEY, '');
        } catch (error) {
            console.error('Erro ao descriptografar senha:', error);
            return null;
        }
    }

    // Toggle de visibilidade da senha
    togglePasswordBtn.addEventListener('click', function() {
        isPasswordVisible = !isPasswordVisible;
        
        if (isPasswordVisible) {
            passwordInput.type = 'text';
            togglePasswordBtn.innerHTML = '<i class="fas fa-eye-slash text-gray-400 hover:text-blue-500 transition-colors duration-200"></i>';
        } else {
            passwordInput.type = 'password';
            togglePasswordBtn.innerHTML = '<i class="fas fa-eye text-gray-400 hover:text-blue-500 transition-colors duration-200"></i>';
        }
    });

    // Validação em tempo real do email
    emailInput.addEventListener('input', function() {
        validateEmail(this);
    });

    // Validação em tempo real da senha
    passwordInput.addEventListener('input', function() {
        validatePassword(this);
    });

    // Função de validação de email
    function isValidEmailValue(value) {
        return emailRegex.test(value.trim());
    }
    
    function validateEmail(input) {
        const email = input.value.trim();
        
        if (email === '') {
            removeValidationClasses(input);
            return false;
        }
        
        if (isValidEmailValue(email)) {
            addValidationClass(input, 'success');
            return true;
        } else {
            addValidationClass(input, 'error');
            return false;
        }
    }

    // Função de validação de senha
    function validatePassword(input) {
        const password = input.value;
        
        if (password === '') {
            removeValidationClasses(input);
            return false;
        }
        
        if (password.length >= 6) {
            addValidationClass(input, 'success');
            return true;
        } else {
            addValidationClass(input, 'error');
            return false;
        }
    }

    // Funções de validação visual
    function addValidationClass(input, type) {
        input.classList.remove('input-error', 'input-success');
        input.classList.add(`input-${type}`);
    }

    function removeValidationClasses(input) {
        input.classList.remove('input-error', 'input-success');
    }

    // ========== SUBMISSÃO DO FORMULÁRIO ==========
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isLoading) return;
        
        // Validação dos campos
        const isEmailValid = validateEmail(emailInput);
        const isPasswordValid = validatePassword(passwordInput);
        
        if (!isEmailValid || !isPasswordValid) {
            showMessage('Por favor, preencha todos os campos corretamente.', 'error');
            return;
        }
        
        // Dados do formulário
        const formData = {
            email: emailInput.value.trim(),
            password: passwordInput.value,
            remember: rememberCheckbox.checked
        };
        
        // Iniciar loading
        setLoadingState(true);
        
        try {
            // Chamada para o backend PHP
            const response = await loginWithPHP(formData);
            
            if (response.success) {
                showMessage('Login realizado com sucesso! Redirecionando...', 'success');
                
                // Salvar dados do usuário (usar response.user ou response.data como fallback)
                const userData = response.user || response.data || {};
                localStorage.setItem('userToken', response.token || 'logged_in');
                localStorage.setItem('userData', JSON.stringify(userData));
                
                // Salvar dados se "lembrar" estiver marcado
                if (formData.remember) {
                    localStorage.setItem('rememberedEmail', formData.email);
                    // Salvar senha criptografada
                    const encryptedPassword = encryptPassword(formData.password);
                    if (encryptedPassword) {
                        localStorage.setItem('rememberedPassword', encryptedPassword);
                    }
                } else {
                    localStorage.removeItem('rememberedEmail');
                    localStorage.removeItem('rememberedPassword');
                }
                
                // Verificar se há parâmetro de retorno na URL
                const urlParams = new URLSearchParams(window.location.search);
                const returnUrl = urlParams.get('return');
                
                // Redirecionamento baseado no role do usuário ou URL de retorno
                setTimeout(() => {
                    // Se houver URL de retorno, redirecionar para ela
                    if (returnUrl) {
                        window.location.href = decodeURIComponent(returnUrl);
                    } else {
                        const userRole = (response.user && response.user.role) || (response.data && response.data.role);
                        
                        if (userRole === 'admin') {
                            window.location.href = 'admin.html';
                        } else if (userRole === 'decorator') {
                            window.location.href = 'painel-decorador.html';
                        } else {
                            // Cliente ou qualquer outro perfil vai para a página inicial
                            window.location.href = '../index.html';
                        }
                    }
                }, 2000);
                
            } else {
                // Se response.success for false, mostrar a mensagem do servidor
                showMessage(response.message || 'Erro ao fazer login. Verifique suas credenciais.', 'error');
            }
            
        } catch (error) {
            console.error('Erro no login:', error);
            // Verificar se o erro tem uma mensagem específica
            const errorMessage = error.message || 'Erro de conexão. Tente novamente.';
            // Se a mensagem não for sobre conexão, usar ela, senão usar mensagem genérica
            if (errorMessage.includes('conexão') || errorMessage.includes('connection') || errorMessage.includes('network')) {
                showMessage('Erro de conexão. Tente novamente.', 'error');
            } else {
                showMessage(errorMessage, 'error');
            }
        } finally {
            setLoadingState(false);
        }
    });

    // ========== FUNCIONALIDADES DO MODAL DE RECUPERAÇÃO ==========
    
    // Abrir modal de recuperação de senha
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.classList.remove('hidden');
        forgotEmailInput.focus();
    });

    // Fechar modal
    function closeModal() {
        forgotPasswordModal.classList.add('hidden');
        forgotEmailInput.value = '';
    }

    closeForgotModal.addEventListener('click', closeModal);
    cancelForgot.addEventListener('click', closeModal);

    // Fechar modal clicando fora
    forgotPasswordModal.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            closeModal();
        }
    });

    // Enviar email de recuperação
    sendResetEmail.addEventListener('click', async function() {
        const email = forgotEmailInput.value.trim();
        
        if (!email) {
            showMessage('Por favor, digite seu email.', 'error');
            return;
        }
        
        if (!isValidEmailValue(email)) {
            showMessage('Por favor, digite um email válido.', 'error');
            return;
        }
        
        sendResetEmail.disabled = true;
        const originalSendText = sendResetEmail.innerHTML;
        sendResetEmail.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
        
        try {
            // Chamada para o backend PHP
            const response = await resetPasswordWithPHP(email);
            
            if (response.success) {
                showMessage(response.message || 'Se o email estiver cadastrado, você receberá instruções de recuperação.', 'success');
                closeModal();
            } else {
                showMessage(response.message || 'Erro ao enviar email. Tente novamente.', 'error');
            }
            
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            showMessage('Erro de conexão. Tente novamente.', 'error');
        } finally {
            sendResetEmail.disabled = false;
            sendResetEmail.innerHTML = originalSendText;
        }
    });

    // ========== FUNÇÕES AUXILIARES ==========
    
    // Definir estado de loading
    function setLoadingState(loading) {
        isLoading = loading;
        
        if (loading) {
            loginBtn.disabled = true;
            loginBtnText.classList.add('hidden');
            loginSpinner.classList.remove('hidden');
            loginBtn.classList.add('opacity-75', 'cursor-not-allowed');
        } else {
            loginBtn.disabled = false;
            loginBtnText.classList.remove('hidden');
            loginSpinner.classList.add('hidden');
            loginBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    }

    // Mostrar mensagem
    function showMessage(text, type) {
        message.textContent = text;
        messageContainer.className = 'block';
        message.className = `rounded-lg p-4 text-sm font-medium message-${type}`;
        
        // Auto-hide após 5 segundos
        setTimeout(() => {
            messageContainer.classList.add('hidden');
        }, 5000);
    }

    // ========== INICIALIZAÇÃO ==========
    
    // Carregar email e senha lembrados se existirem
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberCheckbox.checked = true;
        validateEmail(emailInput);
        
        // Carregar senha descriptografada se existir
        if (rememberedPassword) {
            const decryptedPassword = decryptPassword(rememberedPassword);
            if (decryptedPassword) {
                passwordInput.value = decryptedPassword;
                validatePassword(passwordInput);
            }
        }
    }

    // Adicionar efeitos visuais
    addVisualEffects();

    // ========== EFEITOS VISUAIS ==========
    
    function addVisualEffects() {
        // Efeito de partículas
        createParticles();
        
        // Animação de entrada do formulário
        loginForm.classList.add('fade-in-up');
        
        // Efeito de ripple nos botões
        document.querySelectorAll('button').forEach(button => {
            button.classList.add('ripple-effect');
        });
    }

    // Criar partículas animadas
    function createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        document.getElementById('animated-background').appendChild(particlesContainer);
        
        // Criar partículas
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                createParticle(particlesContainer);
            }, i * 200);
        }
        
        // Continuar criando partículas
        setInterval(() => {
            createParticle(particlesContainer);
        }, 3000);
    }

    function createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        
        container.appendChild(particle);
        
        // Remover partícula após animação
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 8000);
    }

    // ========== INTEGRAÇÃO COM BACKEND PHP ==========
    
    // Função para integração real com PHP
    async function loginWithPHP(formData) {
        try {
            const response = await fetch('../services/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login',
                    email: formData.email,
                    password: formData.password,
                    remember: formData.remember
                })
            });
            
            // Tentar ler o JSON mesmo se a resposta não for ok
            let result;
            try {
                result = await response.json();
            } catch (e) {
                // Se não conseguir ler JSON, lançar erro de conexão
                throw new Error('Erro de conexão. Tente novamente.');
            }
            
            // Se a resposta não for ok, mas temos uma mensagem de erro, retornar o resultado
            // para que o código acima possa tratar a mensagem
            if (!response.ok) {
                // Se for erro 401 (não autorizado), retornar o resultado com a mensagem do servidor
                if (response.status === 401 || response.status === 403) {
                    return result; // Retornar para que a mensagem seja exibida
                }
                // Para outros erros HTTP, lançar exceção
                throw new Error(result.message || 'Erro ao fazer login. Tente novamente.');
            }
            
            return result;
            
        } catch (error) {
            console.error('Erro na requisição:', error);
            // Se já tiver mensagem, lançar com ela, senão lançar erro genérico
            throw error;
        }
    }
    
    async function resetPasswordWithPHP(email) {
        try {
            const response = await fetch('../services/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'reset_password',
                    email: email
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    // Função para verificar autenticação
    async function checkAuth() {
        try {
            const response = await fetch('../services/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'check_auth'
                })
            });
            
            if (!response.ok) {
                return { success: false };
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            return { success: false };
        }
    }

    console.log('Login page loaded successfully!');
});

// Função auxiliar para mostrar mensagens (caso não esteja definida no escopo global)
function showMessage(text, type) {
    const messageContainer = document.getElementById('message-container');
    const message = document.getElementById('message');
    
    if (messageContainer && message) {
        message.textContent = text;
        messageContainer.className = 'block';
        message.className = `rounded-lg p-4 text-sm font-medium message-${type}`;
        
        // Auto-hide após 5 segundos
        setTimeout(() => {
            messageContainer.classList.add('hidden');
        }, 5000);
    }
}

// ========== FUNÇÕES GLOBAIS ==========

// Função para logout (pode ser chamada de outras páginas)
async function logout() {
    try {
        // Chamar logout no backend
        const response = await fetch('../services/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'logout'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(result.message);
        }
    } catch (error) {
        console.error('Erro no logout:', error);
    } finally {
        // Limpar dados locais
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        
        // Limpar proteção de navegação
        if (window.authProtection) {
            window.authProtection.clearProtection();
        }
        
        // Redirecionar para login
        window.location.replace('pages/login.html');
    }
}

// Função para verificar se usuário está logado
function isLoggedIn() {
    return localStorage.getItem('userToken') !== null;
}

// Função para obter dados do usuário logado
function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// Função para redirecionar se não estiver logado
async function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'pages/login.html';
        return false;
    }
    
    // Verificar se a sessão ainda é válida no backend
    try {
        const response = await fetch('../services/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'check_auth'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (!result.success) {
                // Sessão expirou
                logout();
                return false;
            }
            return true;
        } else {
            logout();
            return false;
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Em caso de erro, permitir acesso mas logar o erro
        return true;
    }
}