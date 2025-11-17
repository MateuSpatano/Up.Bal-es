// Sistema principal Up.Baloes
const CART_STORAGE_KEY = 'upbaloes_cart_items';

function getStoredCartItems() {
    try {
        const storedItems = localStorage.getItem(CART_STORAGE_KEY);
        if (!storedItems) {
            return [];
        }

        const parsedItems = JSON.parse(storedItems);
        return Array.isArray(parsedItems) ? parsedItems : [];
    } catch (error) {
        console.warn('Erro ao carregar itens do carrinho:', error);
        return [];
    }
}

function getCartItemsTotal(items = getStoredCartItems()) {
    return items.reduce((total, item) => {
        const quantity = Number(item.quantity);
        return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
    }, 0);
}

function setStoredCartItems(items) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('cart-items-updated', {
            detail: {
                items,
                total: getCartItemsTotal(items)
            }
        }));
    } catch (error) {
        console.error('Erro ao salvar itens do carrinho:', error);
    }
}

function addItemToCartStorage(item) {
    const items = getStoredCartItems();
    const existingIndex = items.findIndex(cartItem => cartItem.id === item.id);

    if (existingIndex >= 0) {
        const currentQuantity = Number(items[existingIndex].quantity) || 0;
        const itemQuantity = Number(item.quantity) || 1;
        items[existingIndex] = {
            ...items[existingIndex],
            ...item,
            quantity: currentQuantity + itemQuantity
        };
    } else {
        items.push({
            ...item,
            quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1
        });
    }

    setStoredCartItems(items);
    return items;
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos DOM
    const navbar = document.getElementById('navbar');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Estado dos menus
    let isUserMenuOpen = false;
    let isMobileMenuOpen = false;

    // Efeito de scroll na navbar
    function handleNavbarScroll() {
        if (!navbar) {
            return;
        }

        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }

    if (navbar) {
        window.addEventListener('scroll', handleNavbarScroll);
    }

    // Toggle do dropdown do usuário
    function toggleUserDropdown() {
        if (!userDropdown) {
            return;
        }

        isUserMenuOpen = !isUserMenuOpen;
        
        if (isUserMenuOpen) {
            userDropdown.classList.add('show');
            if (isMobileMenuOpen) {
                toggleMobileMenu();
            }
        } else {
            userDropdown.classList.remove('show');
        }
    }

    // Event listeners para o dropdown do usuário
    if (userMenuBtn && userDropdown) {
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
    }

    // ========== MENU MOBILE ==========
    
    // Toggle do menu mobile
    function toggleMobileMenu() {
        if (!mobileMenu || !mobileMenuBtn) {
            return;
        }

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
    if (mobileMenuBtn && mobileMenu) {
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
    }

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
            const targetId = this.getAttribute('href');
            
            // Apenas interceptar links que são âncoras (começam com #)
            // Links para outras páginas devem funcionar normalmente
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(targetId);
                
                // Fechar menu mobile após clicar em um link
                if (isMobileMenuOpen) {
                    toggleMobileMenu();
                }
            }
            // Se não for âncora, deixar o navegador seguir o link normalmente
        });
    });

    // Adicionar event listeners para links do menu mobile
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Apenas interceptar links que são âncoras (começam com #)
            // Links para outras páginas devem funcionar normalmente
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(targetId);
                toggleMobileMenu(); // Fechar menu mobile
            }
            // Se não for âncora, deixar o navegador seguir o link normalmente
        });
    });

    // ========== FUNCIONALIDADES DO CARRINHO ==========

    const cartBadge = document.querySelector('.cart-badge');
    // Selecionar apenas links que apontam para #carrinho (não para a página do carrinho)
    const cartLinks = document.querySelectorAll('a[href="#carrinho"]');

    function updateCartBadgeUI(shouldAnimate = false) {
        if (!cartBadge) {
            return;
        }

        const totalItems = getCartItemsTotal();
        cartBadge.textContent = totalItems;

        if (shouldAnimate && totalItems > 0) {
            cartBadge.classList.add('animate-pulse');
            setTimeout(() => {
                cartBadge.classList.remove('animate-pulse');
            }, 1000);
        }
    }

    function notifyCartStatus() {
        const totalItems = getCartItemsTotal();
        if (totalItems > 0) {
            const suffix = totalItems === 1 ? 'item' : 'itens';
            showNotification(`Você possui ${totalItems} ${suffix} no carrinho.`, 'info');
        } else {
            showNotification('Nenhum produto selecionado no carrinho.', 'warning');
        }
    }

    // Apenas interceptar links que apontam para #carrinho (scroll na mesma página)
    // Links que apontam para pages/carrinho-cliente.html devem funcionar normalmente
    cartLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            notifyCartStatus();
        });
    });
    
    // Garantir que links para a página do carrinho funcionem corretamente
    const cartPageLinks = document.querySelectorAll('a[href*="carrinho-cliente.html"]');
    cartPageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Permitir navegação normal - não interceptar
            // Apenas atualizar badge se necessário
            updateCartBadgeUI();
        });
    });

    updateCartBadgeUI();

    window.addEventListener('cart-items-updated', function(event) {
        updateCartBadgeUI(true);
    });

    window.addEventListener('storage', function(event) {
        if (event.key === CART_STORAGE_KEY) {
            updateCartBadgeUI();
        }
    });

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
    
    function hydrateUserMenu() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            if (userData && userData.name && userMenuBtn) {
                const userBtn = userMenuBtn.querySelector('span');
                if (userBtn) {
                    userBtn.textContent = userData.name;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar informações do usuário:', error);
        }
    }

    async function simulateLogout() {
        // Usar a função global de logout
        if (typeof logout === 'function') {
            await logout();
        } else {
            // Fallback para logout local
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            if (userMenuBtn) {
                const userBtn = userMenuBtn.querySelector('span');
                if (userBtn) {
                    userBtn.textContent = 'Usuário';
                }
            }
            showNotification('Logout realizado com sucesso!', 'info');
        }
    }

    // Adicionar event listeners para as opções do dropdown
    if (userDropdown) {
        const loginLink = userDropdown.querySelector('a[href="pages/login.html"]:first-of-type');
        const logoutLink = Array.from(userDropdown.querySelectorAll('a')).find(a => a.querySelector('.fa-sign-out-alt'));
        const accountLink = document.getElementById('account-management-link');
        const minhasComprasLink = document.getElementById('minhas-compras-menu-item');
        const painelAdminLink = document.getElementById('painel-admin-link');
        const painelDecoradorLink = document.getElementById('painel-decorador-link');

        // Mostrar/ocultar opções do menu baseado no login e perfil
        function updateUserMenuVisibility() {
            try {
                const userToken = localStorage.getItem('userToken');
                const userDataStr = localStorage.getItem('userData');
                
                if (userToken && userDataStr) {
                    // Usuário logado
                    const userData = JSON.parse(userDataStr);
                    const userRole = userData?.role || userData?.perfil;
                    
                    // Mostrar "Minhas Compras" e ocultar "Login"
                    if (minhasComprasLink) {
                        minhasComprasLink.classList.remove('hidden');
                    }
                    if (loginLink) {
                        loginLink.classList.add('hidden');
                    }
                    
                    // Mostrar/ocultar links de painel baseado no perfil
                    if (userRole === 'admin') {
                        // Admin logado - mostrar "Painel Admin"
                        if (painelAdminLink) {
                            painelAdminLink.classList.remove('hidden');
                        }
                        if (painelDecoradorLink) {
                            painelDecoradorLink.classList.add('hidden');
                        }
                    } else if (userRole === 'decorator') {
                        // Decorador logado - mostrar "Painel Decorador"
                        if (painelDecoradorLink) {
                            painelDecoradorLink.classList.remove('hidden');
                        }
                        if (painelAdminLink) {
                            painelAdminLink.classList.add('hidden');
                        }
                    } else {
                        // Cliente ou outro perfil - ocultar ambos
                        if (painelAdminLink) {
                            painelAdminLink.classList.add('hidden');
                        }
                        if (painelDecoradorLink) {
                            painelDecoradorLink.classList.add('hidden');
                        }
                    }
                } else {
                    // Usuário não logado - ocultar tudo e mostrar apenas "Login"
                    if (minhasComprasLink) {
                        minhasComprasLink.classList.add('hidden');
                    }
                    if (loginLink) {
                        loginLink.classList.remove('hidden');
                    }
                    if (painelAdminLink) {
                        painelAdminLink.classList.add('hidden');
                    }
                    if (painelDecoradorLink) {
                        painelDecoradorLink.classList.add('hidden');
                    }
                }
            } catch (error) {
                console.warn('Erro ao atualizar visibilidade do menu:', error);
            }
        }

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
                // Atualizar visibilidade do menu após logout
                setTimeout(updateUserMenuVisibility, 100);
            });
        }

        if (accountLink) {
            accountLink.addEventListener('click', function(e) {
                e.preventDefault();
                toggleUserDropdown();
                
                // Verificar se o usuário está logado
                const userToken = localStorage.getItem('userToken');
                const userData = localStorage.getItem('userData');
                
                if (!userToken || !userData) {
                    // Usuário não logado - redirecionar para login
                    showNotification('Por favor, faça login para acessar a gestão de conta.', 'warning');
                    setTimeout(() => {
                        window.location.href = 'pages/login.html';
                    }, 1500);
                    return;
                }
                
                // Usuário logado - abrir modal
                openAccountModal();
            });
        }

        // Event listener para Painel Admin
        if (painelAdminLink) {
            painelAdminLink.addEventListener('click', function(e) {
                e.preventDefault();
                toggleUserDropdown();
                
                // Verificar se o usuário está logado como admin
                const userToken = localStorage.getItem('userToken');
                const userDataStr = localStorage.getItem('userData');
                
                if (!userToken || !userDataStr) {
                    showNotification('Por favor, faça login como administrador para acessar o painel.', 'warning');
                    setTimeout(() => {
                        window.location.href = 'pages/admin-login.html';
                    }, 1500);
                    return;
                }
                
                try {
                    const userData = JSON.parse(userDataStr);
                    const userRole = userData?.role || userData?.perfil;
                    
                    if (userRole === 'admin') {
                        // Redirecionar para o painel admin
                        window.location.href = 'pages/admin.html';
                    } else {
                        showNotification('Acesso negado. Apenas administradores podem acessar o painel admin.', 'error');
                        setTimeout(() => {
                            window.location.href = 'pages/admin-login.html';
                        }, 1500);
                    }
                } catch (error) {
                    console.error('Erro ao verificar perfil:', error);
                    showNotification('Erro ao verificar permissões. Tente fazer login novamente.', 'error');
                }
            });
        }

        // Event listener para Painel Decorador
        if (painelDecoradorLink) {
            painelDecoradorLink.addEventListener('click', function(e) {
                e.preventDefault();
                toggleUserDropdown();
                
                // Verificar se o usuário está logado como decorador
                const userToken = localStorage.getItem('userToken');
                const userDataStr = localStorage.getItem('userData');
                
                if (!userToken || !userDataStr) {
                    showNotification('Por favor, faça login como decorador para acessar o painel.', 'warning');
                    setTimeout(() => {
                        window.location.href = 'pages/login.html';
                    }, 1500);
                    return;
                }
                
                try {
                    const userData = JSON.parse(userDataStr);
                    const userRole = userData?.role || userData?.perfil;
                    
                    if (userRole === 'decorator') {
                        // Redirecionar para o painel do decorador
                        window.location.href = 'pages/painel-decorador.html';
                    } else {
                        showNotification('Acesso negado. Apenas decoradores podem acessar o painel.', 'error');
                        setTimeout(() => {
                            window.location.href = 'pages/login.html';
                        }, 1500);
                    }
                } catch (error) {
                    console.error('Erro ao verificar perfil:', error);
                    showNotification('Erro ao verificar permissões. Tente fazer login novamente.', 'error');
                }
            });
        }

        // Atualizar visibilidade do menu ao carregar
        updateUserMenuVisibility();
        
        // Escutar mudanças no localStorage para atualizar menu
        window.addEventListener('storage', function(e) {
            if (e.key === 'userToken' || e.key === 'userData') {
                updateUserMenuVisibility();
            }
        });
    }
    
    hydrateUserMenu();

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

    window.showNotification = showNotification;

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
        // Verificar novamente se está logado antes de abrir
        const userToken = localStorage.getItem('userToken');
        const userData = localStorage.getItem('userData');
        
        if (!userToken || !userData) {
            showNotification('Por favor, faça login para acessar a gestão de conta.', 'warning');
            return;
        }
        
        if (accountModal) {
            accountModal.classList.remove('hidden');
            accountModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevenir scroll da página
            
            // Carregar dados do usuário
            loadUserData();
            
            // Carregar foto de perfil se existir
            loadProfilePhoto();
            
            // Focar no primeiro campo
            setTimeout(() => {
                const firstInput = accountForm.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 300);
        }
    }
    
    // Carregar foto de perfil
    function loadProfilePhoto() {
        try {
            const storedPhoto = localStorage.getItem('userProfilePhoto');
            const photoElement = document.getElementById('account-profile-photo');
            if (storedPhoto && photoElement) {
                photoElement.src = storedPhoto;
            }
        } catch (e) {
            console.warn('Erro ao carregar foto de perfil:', e);
        }
    }
    
    // Configurar upload de foto
    function setupProfilePhotoUpload() {
        const photoInput = document.getElementById('account-photo-input');
        const photoElement = document.getElementById('account-profile-photo');
        const removePhotoBtn = document.getElementById('remove-profile-photo');
        const photoFeedback = document.getElementById('account-photo-feedback');
        
        if (photoInput) {
            photoInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                // Validar tipo de arquivo
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    if (photoFeedback) {
                        photoFeedback.textContent = 'Tipo de arquivo não permitido. Use apenas JPG, PNG, GIF ou WebP.';
                        photoFeedback.className = 'text-xs text-red-500';
                        photoFeedback.classList.remove('hidden');
                    }
                    return;
                }
                
                // Validar tamanho (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    if (photoFeedback) {
                        photoFeedback.textContent = 'Arquivo muito grande. Tamanho máximo: 5MB';
                        photoFeedback.className = 'text-xs text-red-500';
                        photoFeedback.classList.remove('hidden');
                    }
                    return;
                }
                
                // Ler e exibir preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (photoElement) {
                        photoElement.src = e.target.result;
                        // Salvar no localStorage temporariamente
                        localStorage.setItem('userProfilePhoto', e.target.result);
                    }
                    if (photoFeedback) {
                        photoFeedback.textContent = 'Foto carregada com sucesso!';
                        photoFeedback.className = 'text-xs text-green-500';
                        photoFeedback.classList.remove('hidden');
                        setTimeout(() => {
                            photoFeedback.classList.add('hidden');
                        }, 3000);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
        
        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', function() {
                if (photoElement) {
                    photoElement.src = '../Images/Logo System.jpeg'; // Foto padrão
                    localStorage.removeItem('userProfilePhoto');
                }
                if (photoInput) {
                    photoInput.value = '';
                }
                if (photoFeedback) {
                    photoFeedback.textContent = 'Foto removida';
                    photoFeedback.className = 'text-xs text-gray-500';
                    photoFeedback.classList.remove('hidden');
                    setTimeout(() => {
                        photoFeedback.classList.add('hidden');
                    }, 2000);
                }
            });
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

        // Se não houver dados salvos, inicializar com valores vazios
        if (!userData) {
            userData = {
                name: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                zipcode: ''
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
            const response = await fetch('services/conta.php', {
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
        if (userMenuBtn) {
            const userBtn = userMenuBtn.querySelector('span');
            if (userBtn && userData.name) {
                userBtn.textContent = userData.name;
            }
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
    setupProfilePhotoUpload();

    console.log('Up.Baloes - Sistema carregado com sucesso!');
});

// ========== FUNÇÕES GLOBAIS ==========

// Função para adicionar item ao carrinho (pode ser chamada de outros scripts)
function addToCartGlobal(productId, productName, quantity = 1, additionalData = {}) {
    const item = {
        id: productId,
        name: productName || 'Produto',
        quantity: Number(quantity) > 0 ? Number(quantity) : 1,
        ...additionalData
    };

    const updatedItems = addItemToCartStorage(item);
    const totalItems = getCartItemsTotal(updatedItems);

    if (typeof window.showNotification === 'function') {
        const suffix = totalItems === 1 ? 'item' : 'itens';
        window.showNotification(`${item.name} adicionado ao carrinho! Agora você possui ${totalItems} ${suffix}.`, 'success');
    } else {
        console.log(`${item.name} adicionado ao carrinho. Total de itens: ${totalItems}`);
    }

    return updatedItems;
}

// Função para fazer login (pode ser chamada de outros scripts)
function loginUser(email, password) {
    console.log(`Tentativa de login com email: ${email}`);
    
    // Aqui você pode implementar a lógica real de login
    // Por exemplo, fazer uma requisição AJAX para o backend
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const derivedName = (typeof email === 'string' && email.includes('@'))
                ? email.split('@')[0]
                : '';
            resolve({ success: true, user: { name: derivedName, email } });
        }, 1000);
    });
}

// ========== FUNCIONALIDADES DO PORTFÓLIO ==========

// Carregar portfólio na página inicial (otimizado)
function loadHomepagePortfolio() {
    const portfolioGrid = document.getElementById('homepage-portfolio-grid');
    const emptyPortfolio = document.getElementById('homepage-empty-portfolio');
    
    if (!portfolioGrid || !emptyPortfolio) return;
    
    // Verificar se há atualizações recentes
    const lastUpdate = localStorage.getItem('homepage_portfolio_updated');
    const currentTime = Date.now();
    
    // Carregar dados do portfólio do localStorage
    const savedPortfolio = localStorage.getItem('homepage_portfolio');
    let portfolioServices = [];
    
    if (savedPortfolio) {
        try {
            portfolioServices = JSON.parse(savedPortfolio);
        } catch (error) {
            console.error('Erro ao carregar portfólio:', error);
            portfolioServices = [];
        }
    }
    
    // Renderizar portfólio
    if (portfolioServices.length === 0) {
        portfolioGrid.innerHTML = '';
        emptyPortfolio.classList.remove('hidden');
        return;
    }
    
    emptyPortfolio.classList.add('hidden');
    
    // Limpar grid anterior
    portfolioGrid.innerHTML = '';
    
    // Mostrar apenas os primeiros 8 serviços
    const servicesToShow = portfolioServices.slice(0, 8);
    
    // Usar fragmento para melhor performance
    const fragment = document.createDocumentFragment();
    
    servicesToShow.forEach(service => {
        const serviceCard = createHomepageServiceCard(service);
        fragment.appendChild(serviceCard);
    });
    
    // Adicionar todos os cards de uma vez
    portfolioGrid.appendChild(fragment);
    
    // Log de atualização
    if (lastUpdate) {
        const timeSinceUpdate = currentTime - parseInt(lastUpdate);
        console.log(`Portfólio carregado - última atualização há ${Math.round(timeSinceUpdate / 1000)}s`);
    }
}

// Criar card de serviço para a página inicial (otimizado)
function createHomepageServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-200 group';
    
    // Processar imagem de forma otimizada
    let imageHtml = '';
    if (service.image) {
        // Usar imagem otimizada com lazy loading
        imageHtml = `
            <img src="${service.image}" 
                 alt="${service.title || 'Serviço'}" 
                 class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300" 
                 loading="lazy"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center" style="display:none;">
                <i class="fas fa-image text-4xl text-purple-400"></i>
            </div>
        `;
    } else {
        imageHtml = `
            <div class="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <i class="fas fa-image text-4xl text-purple-400"></i>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="relative overflow-hidden">
            <div class="aspect-w-16 aspect-h-12 bg-gray-200 rounded-t-lg overflow-hidden">
                ${imageHtml}
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <i class="fas fa-eye text-white text-2xl"></i>
                </div>
            </div>
        </div>
        <div class="p-4">
            <div class="mb-2">
                <span class="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                    ${service.type || 'Serviço'}
                </span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">${service.title || 'Título do Serviço'}</h3>
            <p class="text-gray-600 text-sm mb-3 line-clamp-3">${service.description || 'Descrição do serviço'}</p>
            ${service.arcSize ? `<p class="text-blue-600 text-sm mb-2"><i class="fas fa-ruler mr-1"></i>${service.arcSize}</p>` : ''}
            ${service.price ? `<p class="text-green-600 font-semibold">R$ ${parseFloat(service.price).toFixed(2)}</p>` : ''}
        </div>
    `;
    
    return card;
}

// Inicializar portfólio na página inicial (com sincronização em tempo real)
function initHomepagePortfolio() {
    loadHomepagePortfolio();
    
    // Recarregar portfólio quando a página ganhar foco
    window.addEventListener('focus', loadHomepagePortfolio);
    
    // Escutar eventos customizados de atualização do portfólio
    window.addEventListener('portfolioUpdated', function(event) {
        console.log('Portfólio atualizado via evento customizado');
        loadHomepagePortfolio();
    });
    
    // Escutar mensagens via BroadcastChannel para comunicação entre abas
    if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('portfolio_updates');
        channel.addEventListener('message', function(event) {
            if (event.data.type === 'portfolio_updated') {
                console.log('Portfólio atualizado via BroadcastChannel');
                loadHomepagePortfolio();
            }
        });
    }
    
    // Recarregar portfólio a cada 10 segundos (reduzido para melhor performance)
    setInterval(loadHomepagePortfolio, 10000);
    
    // Escutar mudanças no localStorage (fallback para navegadores mais antigos)
    window.addEventListener('storage', function(event) {
        if (event.key === 'homepage_portfolio' || event.key === 'homepage_portfolio_updated') {
            console.log('Portfólio atualizado via localStorage');
            loadHomepagePortfolio();
        }
    });
}

// Inicializar portfólio quando a página carregar
initHomepagePortfolio();

// ========== FUNCIONALIDADES DE CONTATOS ==========

// Carregar informações de contato
async function loadContactInfo() {
    try {
        const response = await fetch('services/contatos.php');
        const result = await response.json();
        
        if (result.success && result.data) {
            const contactData = result.data;
            
            // Atualizar email
            const emailElement = document.getElementById('contact-email');
            const emailText = document.getElementById('contact-email-text');
            if (emailElement && emailText) {
                if (contactData.email) {
                    emailElement.href = contactData.email_link || 'mailto:' + contactData.email;
                    emailText.textContent = contactData.email;
                } else {
                    emailText.textContent = 'Não disponível';
                    emailElement.style.pointerEvents = 'none';
                    emailElement.style.opacity = '0.5';
                }
            }
            
            // Atualizar WhatsApp
            const whatsappElement = document.getElementById('contact-whatsapp');
            const whatsappText = document.getElementById('contact-whatsapp-text');
            if (whatsappElement && whatsappText) {
                if (contactData.whatsapp) {
                    whatsappElement.href = contactData.whatsapp_link || '#';
                    whatsappText.textContent = contactData.whatsapp;
                } else {
                    whatsappText.textContent = 'Não disponível';
                    whatsappElement.style.pointerEvents = 'none';
                    whatsappElement.style.opacity = '0.5';
                }
            }
            
            // Atualizar Instagram
            const instagramElement = document.getElementById('contact-instagram');
            const instagramText = document.getElementById('contact-instagram-text');
            if (instagramElement && instagramText) {
                if (contactData.instagram) {
                    instagramElement.href = contactData.instagram_link || '#';
                    // Remover @ se houver e mostrar apenas o handle
                    const instagramHandle = contactData.instagram.replace(/^@/, '');
                    instagramText.textContent = '@' + instagramHandle;
                } else {
                    instagramText.textContent = 'Não disponível';
                    instagramElement.style.pointerEvents = 'none';
                    instagramElement.style.opacity = '0.5';
                }
            }
        } else {
            // Se não houver dados, mostrar mensagem
            console.warn('Nenhuma informação de contato disponível');
        }
    } catch (error) {
        console.error('Erro ao carregar informações de contato:', error);
        // Em caso de erro, manter os textos "Carregando..." ou mostrar mensagem de erro
        const errorText = 'Erro ao carregar';
        const elements = ['contact-email-text', 'contact-whatsapp-text', 'contact-instagram-text'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = errorText;
        });
    }
}

// Carregar contatos quando a página carregar
loadContactInfo();