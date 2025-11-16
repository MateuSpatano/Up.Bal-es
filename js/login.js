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
                
                // Salvar dados do usuário
                localStorage.setItem('userToken', response.token || 'logged_in');
                localStorage.setItem('userData', JSON.stringify(response.user));
                
                // Salvar dados se "lembrar" estiver marcado
                if (formData.remember) {
                    localStorage.setItem('rememberedEmail', formData.email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                
                // Redirecionamento baseado no role do usuário
                setTimeout(() => {
                    if (response.user && response.user.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else if (response.user && response.user.role === 'decorator') {
                        window.location.href = 'painel-decorador.html';
                    } else {
                        window.location.href = '../index.html';
                    }
                }, 2000);
                
            } else {
                showMessage(response.message || 'Erro ao fazer login. Verifique suas credenciais.', 'error');
            }
            
        } catch (error) {
            console.error('Erro no login:', error);
            showMessage('Erro de conexão. Tente novamente.', 'error');
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
    
    // Carregar email lembrado se existir
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberCheckbox.checked = true;
        validateEmail(emailInput);
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