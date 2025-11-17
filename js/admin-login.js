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
            // Chamada para o backend PHP
            const response = await adminLoginWithPHP(formData);
            
            if (response.success) {
                showMessage('Login administrativo realizado com sucesso! Redirecionando...', 'success');
                
                // Salvar dados do usuário
                localStorage.setItem('userToken', response.token || 'admin_logged_in');
                localStorage.setItem('userData', JSON.stringify(response.user));
                
                // Salvar dados se "lembrar" estiver marcado
                if (formData.remember) {
                    localStorage.setItem('rememberedAdminEmail', formData.email);
                    // Salvar senha criptografada
                    const encryptedPassword = encryptPassword(formData.password);
                    if (encryptedPassword) {
                        localStorage.setItem('rememberedAdminPassword', encryptedPassword);
                    }
                } else {
                    localStorage.removeItem('rememberedAdminEmail');
                    localStorage.removeItem('rememberedAdminPassword');
                }
                
                // Redirecionamento para área administrativa
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 2000);
                
            } else {
                // Se response.success for false, mostrar a mensagem do servidor
                showMessage(response.message || 'Erro ao fazer login. Verifique suas credenciais administrativas.', 'error');
            }
            
        } catch (error) {
            console.error('Erro no login administrativo:', error);
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

    // ========== INTEGRAÇÃO COM BACKEND PHP ==========
    
    // Função para integração real com PHP
    async function adminLoginWithPHP(formData) {
        try {
            const response = await fetch('../services/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'admin_login',
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

    // ========== INICIALIZAÇÃO ==========
    
    // Carregar email e senha lembrados se existirem
    const rememberedAdminEmail = localStorage.getItem('rememberedAdminEmail');
    const rememberedAdminPassword = localStorage.getItem('rememberedAdminPassword');
    
    if (rememberedAdminEmail) {
        adminEmailInput.value = rememberedAdminEmail;
        adminRememberCheckbox.checked = true;
        validateAdminEmail(adminEmailInput);
        
        // Carregar senha descriptografada se existir
        if (rememberedAdminPassword) {
            const decryptedPassword = decryptPassword(rememberedAdminPassword);
            if (decryptedPassword) {
                adminPasswordInput.value = decryptedPassword;
                validateAdminPassword(adminPasswordInput);
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
        // Chamar logout no backend
        const response = await fetch('../services/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'admin_logout'
            })
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
        localStorage.removeItem('rememberedAdminPassword');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        window.location.href = 'admin-login.html';
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
    if (!isAdminLoggedIn()) {
        window.location.href = 'admin-login.html';
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
                action: 'check_admin_auth'
            })
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
