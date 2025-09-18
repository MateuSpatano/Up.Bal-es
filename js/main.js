// JavaScript principal para Up.Baloes
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos DOM
    const navbar = document.getElementById('navbar');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Variáveis de estado
    let isUserMenuOpen = false;
    let isMobileMenuOpen = false;

    // ========== FUNCIONALIDADES DA NAVBAR ==========
    
    // Efeito de scroll na navbar
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }

    // Adicionar listener de scroll
    window.addEventListener('scroll', handleNavbarScroll);

    // ========== DROPDOWN DO USUÁRIO ==========
    
    // Toggle do dropdown do usuário
    function toggleUserDropdown() {
        isUserMenuOpen = !isUserMenuOpen;
        
        if (isUserMenuOpen) {
            userDropdown.classList.add('show');
            // Fechar menu mobile se estiver aberto
            if (isMobileMenuOpen) {
                toggleMobileMenu();
            }
        } else {
            userDropdown.classList.remove('show');
        }
    }

    // Event listeners para o dropdown do usuário
    userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleUserDropdown();
    });

    // Fechar dropdown quando clicar fora
    document.addEventListener('click', function(e) {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            if (isUserMenuOpen) {
                toggleUserDropdown();
            }
        }
    });

    // ========== MENU MOBILE ==========
    
    // Toggle do menu mobile
    function toggleMobileMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
        
        if (isMobileMenuOpen) {
            mobileMenu.classList.add('show');
            mobileMenuBtn.innerHTML = '<i class="fas fa-times text-xl"></i>';
            // Fechar dropdown do usuário se estiver aberto
            if (isUserMenuOpen) {
                toggleUserDropdown();
            }
        } else {
            mobileMenu.classList.remove('show');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
        }
    }

    // Event listener para o botão do menu mobile
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMobileMenu();
    });

    // Fechar menu mobile quando clicar fora
    document.addEventListener('click', function(e) {
        if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
            if (isMobileMenuOpen) {
                toggleMobileMenu();
            }
        }
    });

    // ========== NAVEGAÇÃO SUAVE ==========
    
    // Função para scroll suave para seções
    function smoothScrollTo(targetId) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 80; // Considerando altura da navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // Adicionar event listeners para links de navegação
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            smoothScrollTo(targetId);
            
            // Fechar menu mobile após clicar em um link
            if (isMobileMenuOpen) {
                toggleMobileMenu();
            }
        });
    });

    // Adicionar event listeners para links do menu mobile
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            smoothScrollTo(targetId);
            toggleMobileMenu(); // Fechar menu mobile
        });
    });

    // ========== FUNCIONALIDADES DO CARRINHO ==========
    
    // Simular adicionar item ao carrinho
    function addToCart() {
        const cartBadge = document.querySelector('.cart-badge');
        if (cartBadge) {
            let currentCount = parseInt(cartBadge.textContent) || 0;
            cartBadge.textContent = currentCount + 1;
            
            // Efeito visual
            cartBadge.classList.add('animate-pulse');
            setTimeout(() => {
                cartBadge.classList.remove('animate-pulse');
            }, 1000);
        }
    }

    // ========== ANIMAÇÕES E EFEITOS ==========
    
    // Observador de interseção para animações
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observar elementos para animação
    document.querySelectorAll('.text-center, .grid > div').forEach(el => {
        observer.observe(el);
    });

    // ========== FUNCIONALIDADES DO USUÁRIO ==========
    
    // Simular login/logout
    function simulateLogin() {
        const userBtn = userMenuBtn.querySelector('span');
        if (userBtn) {
            userBtn.textContent = 'João Silva';
        }
        
        // Mostrar notificação
        showNotification('Login realizado com sucesso!', 'success');
    }

    async function simulateLogout() {
        // Usar a função global de logout
        if (typeof logout === 'function') {
            await logout();
        } else {
            // Fallback para logout local
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            const userBtn = userMenuBtn.querySelector('span');
            if (userBtn) {
                userBtn.textContent = 'Usuário';
            }
            showNotification('Logout realizado com sucesso!', 'info');
        }
    }

    // Adicionar event listeners para as opções do dropdown
    const loginLink = userDropdown.querySelector('a[href="#"]:first-child');
    const logoutLink = userDropdown.querySelector('a[href="#"]:last-child');
    const accountLink = userDropdown.querySelector('a[href="#"]:nth-child(2)');

    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Redirecionar para a tela de login
            window.location.href = 'pages/login.html';
            toggleUserDropdown();
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            simulateLogout();
            toggleUserDropdown();
        });
    }

    if (accountLink) {
        accountLink.addEventListener('click', function(e) {
            e.preventDefault();
            openAccountModal();
            toggleUserDropdown();
        });
    }

    // ========== SISTEMA DE NOTIFICAÇÕES ==========
    
    function showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        // Definir cores baseadas no tipo
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-black',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-${getIconForType(type)}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    function getIconForType(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    // ========== FUNCIONALIDADES DE PORTFÓLIO ==========
    
    // Simular carregamento de portfólio
    function loadPortfolio() {
        showNotification('Carregando portfólio...', 'info');
        
        // Simular delay de carregamento
        setTimeout(() => {
            showNotification('Portfólio carregado com sucesso!', 'success');
        }, 1500);
    }

    // ========== FUNCIONALIDADES DE CONTATO ==========
    
    function showContactInfo() {
        showNotification('Entre em contato: (11) 99999-9999', 'info');
    }

    // ========== INICIALIZAÇÃO ==========
    
    // Configurar event listeners adicionais
    document.querySelectorAll('a[href="#portfolio"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            loadPortfolio();
        });
    });

    document.querySelectorAll('a[href="#contatos"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showContactInfo();
        });
    });

    document.querySelectorAll('a[href="#carrinho"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            addToCart();
        });
    });

    // ========== UTILITÁRIOS ==========
    
    // Função para debounce (otimização de performance)
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Otimizar scroll com debounce
    const debouncedScroll = debounce(handleNavbarScroll, 10);
    window.removeEventListener('scroll', handleNavbarScroll);
    window.addEventListener('scroll', debouncedScroll);

    // ========== CONFIGURAÇÕES GLOBAIS ==========
    
    // Prevenir comportamento padrão de formulários
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    });

    // Configurar tooltips (se necessário)
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', function() {
            // Implementar tooltip se necessário
        });
    });

    // ========== FUNCIONALIDADES DO MODAL DE GERENCIAMENTO DE CONTA ==========
    
    // Elementos do modal
    const accountModal = document.getElementById('account-modal');
    const accountForm = document.getElementById('account-form');
    const closeAccountModal = document.getElementById('close-account-modal');
    const cancelAccountChanges = document.getElementById('cancel-account-changes');
    const saveAccountChanges = document.getElementById('save-account-changes');
    const accountModalOverlay = document.getElementById('account-modal-overlay');

    // Abrir modal de gerenciamento de conta
    function openAccountModal() {
        if (accountModal) {
            accountModal.classList.remove('hidden');
            accountModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevenir scroll da página
            
            // Carregar dados do usuário
            loadUserData();
            
            // Focar no primeiro campo
            setTimeout(() => {
                const firstInput = accountForm.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 300);
        }
    }

    // Fechar modal de gerenciamento de conta
    function closeAccountModalFunc() {
        if (accountModal) {
            accountModal.classList.add('hidden');
            accountModal.classList.remove('show');
            document.body.style.overflow = 'auto'; // Restaurar scroll da página
            
            // Limpar formulário
            resetAccountForm();
        }
    }

    // Carregar dados do usuário
    function loadUserData() {
        // Tentar carregar dados do localStorage primeiro
        let userData = null;
        try {
            const storedData = localStorage.getItem('userData');
            if (storedData) {
                userData = JSON.parse(storedData);
            }
        } catch (e) {
            console.warn('Erro ao carregar dados do localStorage:', e);
        }

        // Se não houver dados salvos, usar dados padrão
        if (!userData) {
            userData = {
                name: 'João Silva',
                email: 'joao@exemplo.com',
                phone: '(11) 99999-9999',
                address: 'Rua das Flores, 123',
                city: 'São Paulo',
                state: 'SP',
                zipcode: '01234-567'
            };
        }

        // Preencher campos
        document.getElementById('account-name').value = userData.name || '';
        document.getElementById('account-email').value = userData.email || '';
        document.getElementById('account-phone').value = userData.phone || '';
        document.getElementById('account-address').value = userData.address || '';
        document.getElementById('account-city').value = userData.city || '';
        document.getElementById('account-state').value = userData.state || '';
        document.getElementById('account-zipcode').value = userData.zipcode || '';
    }

    // Resetar formulário
    function resetAccountForm() {
        if (accountForm) {
            accountForm.reset();
            clearValidationMessages();
        }
    }

    // Event listeners para o modal
    if (closeAccountModal) {
        closeAccountModal.addEventListener('click', closeAccountModalFunc);
    }

    if (cancelAccountChanges) {
        cancelAccountChanges.addEventListener('click', closeAccountModalFunc);
    }

    if (accountModalOverlay) {
        accountModalOverlay.addEventListener('click', closeAccountModalFunc);
    }

    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && accountModal && accountModal.classList.contains('show')) {
            closeAccountModalFunc();
        }
    });

    // ========== VALIDAÇÕES DO FORMULÁRIO ==========
    
    // Validação de email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validação de telefone
    function validatePhone(phone) {
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return phoneRegex.test(phone);
    }

    // Validação de CEP
    function validateZipcode(zipcode) {
        const zipcodeRegex = /^\d{5}-?\d{3}$/;
        return zipcodeRegex.test(zipcode);
    }

    // Validação de senha
    function validatePassword(password) {
        if (password.length < 8) return { valid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
        if (!/(?=.*[a-zA-Z])/.test(password)) return { valid: false, message: 'Senha deve conter pelo menos uma letra' };
        if (!/(?=.*\d)/.test(password)) return { valid: false, message: 'Senha deve conter pelo menos um número' };
        return { valid: true, message: 'Senha válida' };
    }

    // Mostrar mensagem de erro
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('field-error');
            field.classList.remove('field-success');
            
            // Remover mensagem anterior
            const existingError = field.parentNode.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Adicionar nova mensagem
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
            field.parentNode.appendChild(errorDiv);
        }
    }

    // Mostrar mensagem de sucesso
    function showFieldSuccess(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('field-success');
            field.classList.remove('field-error');
            
            // Remover mensagem anterior
            const existingSuccess = field.parentNode.querySelector('.success-message');
            if (existingSuccess) {
                existingSuccess.remove();
            }
            
            // Adicionar nova mensagem
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.innerHTML = `<i class="fas fa-check-circle"></i>${message}`;
            field.parentNode.appendChild(successDiv);
        }
    }

    // Limpar mensagens de validação
    function clearFieldValidation(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.remove('field-error', 'field-success');
            const errorMessage = field.parentNode.querySelector('.error-message');
            const successMessage = field.parentNode.querySelector('.success-message');
            if (errorMessage) errorMessage.remove();
            if (successMessage) successMessage.remove();
        }
    }

    // Limpar todas as mensagens de validação
    function clearValidationMessages() {
        const fields = ['account-name', 'account-email', 'account-phone', 'account-address', 
                       'account-city', 'account-state', 'account-zipcode', 'account-current-password', 
                       'account-new-password', 'account-confirm-password'];
        fields.forEach(fieldId => clearFieldValidation(fieldId));
    }

    // Validação em tempo real
    function setupRealTimeValidation() {
        // Email
        const emailField = document.getElementById('account-email');
        if (emailField) {
            emailField.addEventListener('blur', function() {
                const email = this.value.trim();
                if (email && !validateEmail(email)) {
                    showFieldError('account-email', 'Email inválido');
                } else if (email) {
                    showFieldSuccess('account-email', 'Email válido');
                } else {
                    clearFieldValidation('account-email');
                }
            });
        }

        // Telefone
        const phoneField = document.getElementById('account-phone');
        if (phoneField) {
            phoneField.addEventListener('input', function() {
                // Formatar telefone automaticamente
                let value = this.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
                }
                if (value.length >= 10) {
                    value = value.substring(0, 10) + '-' + value.substring(10, 14);
                }
                this.value = value;
            });

            phoneField.addEventListener('blur', function() {
                const phone = this.value.trim();
                if (phone && !validatePhone(phone)) {
                    showFieldError('account-phone', 'Telefone inválido');
                } else if (phone) {
                    showFieldSuccess('account-phone', 'Telefone válido');
                } else {
                    clearFieldValidation('account-phone');
                }
            });
        }

        // CEP
        const zipcodeField = document.getElementById('account-zipcode');
        if (zipcodeField) {
            zipcodeField.addEventListener('input', function() {
                // Formatar CEP automaticamente
                let value = this.value.replace(/\D/g, '');
                if (value.length >= 5) {
                    value = value.substring(0, 5) + '-' + value.substring(5, 8);
                }
                this.value = value;
            });

            zipcodeField.addEventListener('blur', function() {
                const zipcode = this.value.trim();
                if (zipcode && !validateZipcode(zipcode)) {
                    showFieldError('account-zipcode', 'CEP inválido');
                } else if (zipcode) {
                    showFieldSuccess('account-zipcode', 'CEP válido');
                } else {
                    clearFieldValidation('account-zipcode');
                }
            });
        }

        // Nova senha
        const newPasswordField = document.getElementById('account-new-password');
        if (newPasswordField) {
            newPasswordField.addEventListener('input', function() {
                const password = this.value;
                const validation = validatePassword(password);
                
                if (password) {
                    if (validation.valid) {
                        showFieldSuccess('account-new-password', validation.message);
                    } else {
                        showFieldError('account-new-password', validation.message);
                    }
                } else {
                    clearFieldValidation('account-new-password');
                }
            });
        }

        // Confirmar senha
        const confirmPasswordField = document.getElementById('account-confirm-password');
        if (confirmPasswordField) {
            confirmPasswordField.addEventListener('blur', function() {
                const password = this.value;
                const newPassword = document.getElementById('account-new-password').value;
                
                if (password && newPassword) {
                    if (password === newPassword) {
                        showFieldSuccess('account-confirm-password', 'Senhas coincidem');
                    } else {
                        showFieldError('account-confirm-password', 'Senhas não coincidem');
                    }
                } else if (password) {
                    clearFieldValidation('account-confirm-password');
                }
            });
        }
    }

    // ========== TOGGLE DE VISIBILIDADE DE SENHA ==========
    
    function setupPasswordToggles() {
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', function() {
                const input = this.parentNode.querySelector('input');
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    // ========== SUBMISSÃO DO FORMULÁRIO ==========
    
    function setupFormSubmission() {
        if (accountForm) {
            accountForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Validar formulário
                if (!validateAccountForm()) {
                    return;
                }
                
                // Mostrar loading
                saveAccountChanges.classList.add('btn-loading');
                saveAccountChanges.disabled = true;
                
                try {
                    // Simular envio para o backend
                    await saveAccountData();
                    
                    showNotification('Dados atualizados com sucesso!', 'success');
                    closeAccountModalFunc();
                    
                } catch (error) {
                    showNotification('Erro ao salvar dados. Tente novamente.', 'error');
                    console.error('Erro ao salvar dados:', error);
                } finally {
                    // Remover loading
                    saveAccountChanges.classList.remove('btn-loading');
                    saveAccountChanges.disabled = false;
                }
            });
        }
    }

    // Validar formulário completo
    function validateAccountForm() {
        let isValid = true;
        
        // Limpar validações anteriores
        clearValidationMessages();
        
        // Validar campos obrigatórios
        const requiredFields = [
            { id: 'account-name', name: 'Nome' },
            { id: 'account-email', name: 'Email' }
        ];
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (!input.value.trim()) {
                showFieldError(field.id, `${field.name} é obrigatório`);
                isValid = false;
            }
        });
        
        // Validar email
        const email = document.getElementById('account-email').value.trim();
        if (email && !validateEmail(email)) {
            showFieldError('account-email', 'Email inválido');
            isValid = false;
        }
        
        // Validar telefone se preenchido
        const phone = document.getElementById('account-phone').value.trim();
        if (phone && !validatePhone(phone)) {
            showFieldError('account-phone', 'Telefone inválido');
            isValid = false;
        }
        
        // Validar CEP se preenchido
        const zipcode = document.getElementById('account-zipcode').value.trim();
        if (zipcode && !validateZipcode(zipcode)) {
            showFieldError('account-zipcode', 'CEP inválido');
            isValid = false;
        }
        
        // Validar senhas se preenchidas
        const newPassword = document.getElementById('account-new-password').value;
        const confirmPassword = document.getElementById('account-confirm-password').value;
        
        if (newPassword || confirmPassword) {
            if (newPassword) {
                const passwordValidation = validatePassword(newPassword);
                if (!passwordValidation.valid) {
                    showFieldError('account-new-password', passwordValidation.message);
                    isValid = false;
                }
            }
            
            if (confirmPassword && newPassword !== confirmPassword) {
                showFieldError('account-confirm-password', 'Senhas não coincidem');
                isValid = false;
            }
        }
        
        return isValid;
    }

    // Salvar dados da conta
    async function saveAccountData() {
        const formData = new FormData(accountForm);
        
        try {
            const response = await fetch('services/account.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Erro ao salvar dados');
            }
            
            if (!result.success) {
                throw new Error(result.message || 'Erro ao salvar dados');
            }
            
            // Atualizar dados do usuário na interface
            if (result.data) {
                updateUserInterface(result.data);
            }
            
            return result;
            
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            throw error;
        }
    }

    // Atualizar interface do usuário
    function updateUserInterface(userData) {
        // Atualizar nome do usuário na navbar
        const userBtn = userMenuBtn.querySelector('span');
        if (userBtn && userData.name) {
            userBtn.textContent = userData.name;
        }
        
        // Salvar dados no localStorage para persistência
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    // ========== INICIALIZAÇÃO DAS FUNCIONALIDADES ==========
    
    // Configurar validações em tempo real
    setupRealTimeValidation();
    
    // Configurar toggles de senha
    setupPasswordToggles();
    
    // Configurar submissão do formulário
    setupFormSubmission();

    console.log('Up.Baloes - Sistema carregado com sucesso!');
});

// ========== FUNÇÕES GLOBAIS ==========

// Função para adicionar item ao carrinho (pode ser chamada de outros scripts)
function addToCartGlobal(productId, productName) {
    console.log(`Adicionando ${productName} (ID: ${productId}) ao carrinho`);
    
    // Aqui você pode implementar a lógica real de adição ao carrinho
    // Por exemplo, fazer uma requisição AJAX para o backend
    
    // Por enquanto, apenas mostrar notificação
    if (typeof showNotification === 'function') {
        showNotification(`${productName} adicionado ao carrinho!`, 'success');
    }
}

// Função para fazer login (pode ser chamada de outros scripts)
function loginUser(email, password) {
    console.log(`Tentativa de login com email: ${email}`);
    
    // Aqui você pode implementar a lógica real de login
    // Por exemplo, fazer uma requisição AJAX para o backend
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, user: { name: 'João Silva', email: email } });
        }, 1000);
    });
}