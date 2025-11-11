// Sistema de Login Administrativo Up.Baloes
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos do formulário
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminEmailInput = document.getElementById('admin-email');
    const adminPasswordInput = document.getElementById('admin-password');
    const toggleAdminPasswordBtn = document.getElementById('toggle-admin-password');
    const adminRememberCheckbox = document.getElementById('admin-remember');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminLoginBtnText = document.getElementById('admin-login-btn-text');
    const adminLoginSpinner = document.getElementById('admin-login-spinner');
    const messageContainer = document.getElementById('message-container');
    const message = document.getElementById('message');
    
    // Estado dos campos
    let isPasswordVisible = false;
    let isLoading = false;

    const API_BASE = window.UpBaloesApiBase || `${window.location.origin}/api/auth`;
    const ROUTES = Object.assign({
        adminDashboard: '/admin/painel',
        adminLogin: '/admin/login',
        login: '/login',
    }, window.UpBaloesRoutes || {});

    window.UpBaloesApiBase = API_BASE;
    window.UpBaloesRoutes = ROUTES;

    // Toggle de visibilidade da senha
    toggleAdminPasswordBtn.addEventListener('click', function() {
        isPasswordVisible = !isPasswordVisible;
        
        if (isPasswordVisible) {
            adminPasswordInput.type = 'text';
            toggleAdminPasswordBtn.innerHTML = '<i class="fas fa-eye-slash text-gray-400 hover:text-blue-500 transition-colors duration-200"></i>';
        } else {
            adminPasswordInput.type = 'password';
            toggleAdminPasswordBtn.innerHTML = '<i class="fas fa-eye text-gray-400 hover:text-blue-500 transition-colors duration-200"></i>';
        }
    });

    // Validação em tempo real do email
    adminEmailInput.addEventListener('input', function() {
        validateAdminEmail(this);
    });

    // Validação em tempo real da senha
    adminPasswordInput.addEventListener('input', function() {
        validateAdminPassword(this);
    });

    // Função de validação de email
    function validateAdminEmail(input) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email === '') {
            removeValidationClasses(input);
            return false;
        }
        
        if (emailRegex.test(email)) {
            addValidationClass(input, 'success');
            return true;
        } else {
            addValidationClass(input, 'error');
            return false;
        }
    }

    // Função de validação de senha
    function validateAdminPassword(input) {
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
    
    adminLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isLoading) return;
        
        // Validação dos campos
        const isEmailValid = validateAdminEmail(adminEmailInput);
        const isPasswordValid = validateAdminPassword(adminPasswordInput);
        
        if (!isEmailValid || !isPasswordValid) {
            showMessage('Por favor, preencha todos os campos corretamente.', 'error');
            return;
        }
        
        // Dados do formulário
        const formData = {
            email: adminEmailInput.value.trim(),
            password: adminPasswordInput.value,
            remember: adminRememberCheckbox.checked
        };
        
        // Iniciar loading
        setLoadingState(true);
        
        try {
            const response = await adminLoginWithApi(formData);
            
            if (response.success) {
                showMessage(response.message || 'Login administrativo realizado com sucesso! Redirecionando...', 'success');
                
                const userData = response.data || {};

                localStorage.setItem('userToken', 'session');
                localStorage.setItem('userData', JSON.stringify(userData));
                
                if (formData.remember) {
                    localStorage.setItem('rememberedAdminEmail', formData.email);
                } else {
                    localStorage.removeItem('rememberedAdminEmail');
                }
                
                setTimeout(() => {
                    window.location.href = ROUTES.adminDashboard || '/admin/painel';
                }, 1200);
                
            } else {
                showMessage(response.message || 'Erro ao fazer login. Verifique suas credenciais administrativas.', 'error');
            }
            
        } catch (error) {
            console.error('Erro no login administrativo:', error);
            showMessage('Erro de conexão. Tente novamente.', 'error');
        } finally {
            setLoadingState(false);
        }
    });

    // ========== FUNÇÕES AUXILIARES ==========
    
    // Definir estado de loading
    function setLoadingState(loading) {
        isLoading = loading;
        
        if (loading) {
            adminLoginBtn.disabled = true;
            adminLoginBtnText.classList.add('hidden');
            adminLoginSpinner.classList.remove('hidden');
            adminLoginBtn.classList.add('opacity-75', 'cursor-not-allowed');
        } else {
            adminLoginBtn.disabled = false;
            adminLoginBtnText.classList.remove('hidden');
            adminLoginSpinner.classList.add('hidden');
            adminLoginBtn.classList.remove('opacity-75', 'cursor-not-allowed');
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

    // ========== INTEGRAÇÃO COM BACKEND LARAVEL ==========
    
    async function adminLoginWithApi(formData) {
        try {
            const response = await fetch(`${API_BASE}/admin-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    // ========== INICIALIZAÇÃO ==========
    
    // Carregar email lembrado se existir
    const rememberedAdminEmail = localStorage.getItem('rememberedAdminEmail');
    if (rememberedAdminEmail) {
        adminEmailInput.value = rememberedAdminEmail;
        adminRememberCheckbox.checked = true;
        validateAdminEmail(adminEmailInput);
    }

    // Adicionar efeitos visuais
    addVisualEffects();

    // ========== EFEITOS VISUAIS ==========
    
    function addVisualEffects() {
        // Efeito de partículas
        createParticles();
        
        // Animação de entrada do formulário
        adminLoginForm.classList.add('fade-in-up');
        
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
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                createParticle(particlesContainer);
            }, i * 300);
        }
        
        // Continuar criando partículas
        setInterval(() => {
            createParticle(particlesContainer);
        }, 4000);
    }

    function createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
        
        container.appendChild(particle);
        
        // Remover partícula após animação
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 10000);
    }

    console.log('Admin login page loaded successfully!');
});

// ========== FUNÇÕES GLOBAIS ==========

// Função para logout administrativo (pode ser chamada de outras páginas)
async function adminLogout() {
    try {
        const apiBase = window.UpBaloesApiBase || `${window.location.origin}/api/auth`;
        const routes = window.UpBaloesRoutes || { adminLogin: '/admin/login' };

        const response = await fetch(`${apiBase}/admin-logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(result.message);
        }
    } catch (error) {
        console.error('Erro no logout administrativo:', error);
    } finally {
        // Limpar dados locais
        localStorage.removeItem('rememberedAdminEmail');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        window.location.href = routes.adminLogin || '/admin/login';
    }
}

// Função para verificar se usuário admin está logado
function isAdminLoggedIn() {
    const userData = localStorage.getItem('userData');
    if (!userData) return false;
    
    try {
        const user = JSON.parse(userData);
        return user.role === 'admin';
    } catch (e) {
        return false;
    }
}

// Função para obter dados do usuário admin logado
function getCurrentAdmin() {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    
    try {
        const user = JSON.parse(userData);
        return user.role === 'admin' ? user : null;
    } catch (e) {
        return null;
    }
}

// Função para redirecionar se não for admin
async function requireAdminAuth() {
    const apiBase = window.UpBaloesApiBase || `${window.location.origin}/api/auth`;
    const routes = window.UpBaloesRoutes || { adminLogin: '/admin/login' };

    if (!isAdminLoggedIn()) {
        window.location.href = routes.adminLogin || '/admin/login';
        return false;
    }
    
    // Verificar se a sessão ainda é válida no backend
    try {
        const response = await fetch(`${apiBase}/check-admin`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include',
        });
        
        if (response.ok) {
            const result = await response.json();
            if (!result.success) {
                // Sessão expirou
                adminLogout();
                return false;
            }
            return true;
        } else {
            adminLogout();
            return false;
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação administrativa:', error);
        // Em caso de erro, permitir acesso mas logar o erro
        return true;
    }
}
