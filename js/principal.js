// Sistema principal Up.Baloes
const CART_STORAGE_KEY = 'upbaloes_cart_items';
const PROJECT_SEGMENT_PATTERN = /up\.bal/i;

function getProjectBasePath() {
    if (typeof window === 'undefined') {
        return '/';
    }
    
    const segments = window.location.pathname.split('/').filter(Boolean);
    const projectIndex = segments.findIndex(segment => PROJECT_SEGMENT_PATTERN.test(segment));
    
    if (projectIndex >= 0) {
        return '/' + segments.slice(0, projectIndex + 1).join('/') + '/';
    }
    
    return '/';
}

function getProjectBaseUrl() {
    if (typeof window === 'undefined') {
        return '/';
    }
    
    return window.location.origin + getProjectBasePath();
}

const PROJECT_BASE_URL = getProjectBaseUrl();

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
        // Ignorar seletor inválido (# vazio ou apenas #)
        if (!targetId || targetId === '#' || targetId.length <= 1) {
            return;
        }
        
        try {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Considerando altura da navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        } catch (e) {
            // Ignorar erros de seletor inválido
            console.warn('Seletor inválido para scroll:', targetId);
        }
    }

    // Adicionar event listeners para links de navegação
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Ignorar links com IDs específicos que têm seus próprios handlers
            if (this.id === 'account-management-link' || 
                this.id === 'painel-admin-link' || 
                this.id === 'painel-decorador-link' ||
                this.id === 'minhas-compras-menu-item' ||
                this.id === 'logout-link') {
                return; // Deixar o handler específico tratar
            }
            
            const targetId = this.getAttribute('href');
            
            // Apenas interceptar links que são âncoras válidas (começam com # e têm mais de 1 caractere)
            // Links para outras páginas devem funcionar normalmente
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
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
            // Ignorar links com IDs específicos que têm seus próprios handlers
            if (this.id === 'account-management-link' || 
                this.id === 'painel-admin-link' || 
                this.id === 'painel-decorador-link' ||
                this.id === 'minhas-compras-menu-item' ||
                this.id === 'logout-link') {
                return; // Deixar o handler específico tratar
            }
            
            const targetId = this.getAttribute('href');
            
            // Apenas interceptar links que são âncoras válidas (começam com # e têm mais de 1 caractere)
            // Links para outras páginas devem funcionar normalmente
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
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
        const loginLink = document.getElementById('login-menu-item');
        const logoutLink = document.getElementById('logout-link');
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
                    if (logoutLink) {
                        logoutLink.classList.remove('hidden');
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
                    if (logoutLink) {
                        logoutLink.classList.add('hidden');
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
                const loginHref = loginLink.getAttribute('href') || `${PROJECT_BASE_URL}pages/login.html`;
                window.location.href = loginHref;
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
        
        // Preencher campo de senha atual com valor mascarado (sempre oculto, bloqueado, sem botão de olho)
        const currentPasswordField = document.getElementById('account-current-password');
        if (currentPasswordField) {
            currentPasswordField.value = '••••••••';
            currentPasswordField.type = 'password';
            currentPasswordField.setAttribute('readonly', 'readonly');
            currentPasswordField.setAttribute('disabled', 'disabled');
        }
    }

    // Resetar formulário
    function resetAccountForm() {
        if (accountForm) {
            accountForm.reset();
            clearValidationMessages();
            
            // Manter o campo de senha atual bloqueado com valor mascarado após reset
            const currentPasswordField = document.getElementById('account-current-password');
            if (currentPasswordField) {
                currentPasswordField.value = '••••••••';
                currentPasswordField.type = 'password';
                currentPasswordField.setAttribute('readonly', 'readonly');
                currentPasswordField.setAttribute('disabled', 'disabled');
            }
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
        // Função auxiliar para alternar visibilidade
        function togglePasswordVisibility(button, input) {
            if (!input) return;
            
            const icon = button.querySelector('i');
            if (!icon) return;
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                button.setAttribute('aria-label', 'Ocultar senha');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                button.setAttribute('aria-label', 'Mostrar senha');
            }
        }
        
        // Verificar se já existe um listener (para evitar duplicação)
        const processedButtons = new WeakSet();
        
        // Configurar botões com classe .toggle-password
        document.querySelectorAll('.toggle-password').forEach(button => {
            if (processedButtons.has(button)) return;
            
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Tentar encontrar o input pelo atributo data-target primeiro
                const targetId = this.getAttribute('data-target');
                let input = targetId ? document.getElementById(targetId) : null;
                
                // Se não encontrar, procurar o input no mesmo container
                if (!input) {
                    input = this.closest('.relative')?.querySelector('input[type="password"], input[type="text"]') ||
                           this.parentNode.querySelector('input[type="password"], input[type="text"]');
                }
                
                // Não permitir toggle no campo de senha atual (bloqueado)
                if (input && input.id !== 'account-current-password') {
                    togglePasswordVisibility(this, input);
                }
            });
            
            processedButtons.add(button);
        });
        
        // Configurar campo de senha atual (permitir edição quando necessário)
        const currentPasswordField = document.getElementById('account-current-password');
        const newPasswordField = document.getElementById('account-new-password');
        const confirmPasswordField = document.getElementById('account-confirm-password');
        
        if (currentPasswordField) {
            // Inicialmente, o campo está vazio e habilitado
            currentPasswordField.type = 'password';
            currentPasswordField.removeAttribute('readonly');
            currentPasswordField.removeAttribute('disabled');
            currentPasswordField.value = '';
            currentPasswordField.placeholder = 'Digite sua senha atual (obrigatório para alterar senha)';
            
            // Quando o usuário começar a digitar a nova senha, tornar a senha atual obrigatória
            if (newPasswordField) {
                newPasswordField.addEventListener('input', function() {
                    if (this.value.trim() && !currentPasswordField.value.trim()) {
                        currentPasswordField.required = true;
                        currentPasswordField.classList.add('border-red-300');
                    } else if (!this.value.trim()) {
                        currentPasswordField.required = false;
                        currentPasswordField.classList.remove('border-red-300');
                    }
                });
            }
        }
        
        // Configurar botões com classe .password-toggle (usado em reset-password.html e admin.html)
        document.querySelectorAll('.password-toggle').forEach(button => {
            if (processedButtons.has(button)) return;
            
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = this.getAttribute('data-target');
                const input = targetId ? document.getElementById(targetId) : null;
                
                if (input) {
                    togglePasswordVisibility(this, input);
                }
            });
            
            processedButtons.add(button);
        });
        
        // Configurar botões específicos por ID apenas se não tiverem listener próprio
        const specificToggles = [
            { buttonId: 'toggle-password', inputId: 'password' },
            { buttonId: 'toggle-admin-password', inputId: 'admin-password' },
            { buttonId: 'toggle-senha', inputId: 'senha' },
            { buttonId: 'toggle-confirmar-senha', inputId: 'confirmar-senha' }
        ];
        
        specificToggles.forEach(({ buttonId, inputId }) => {
            const button = document.getElementById(buttonId);
            const input = document.getElementById(inputId);
            
            // Só adicionar listener se o botão não tiver classe que já foi processada
            if (button && input && !button.classList.contains('toggle-password') && !button.classList.contains('password-toggle')) {
                if (processedButtons.has(button)) return;
                
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePasswordVisibility(this, input);
                });
                
                processedButtons.add(button);
            }
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
                    const result = await saveAccountData();
                    
                    if (result && result.success) {
                        showNotification(result.message || 'Dados atualizados com sucesso!', 'success');
                        closeAccountModalFunc();
                    } else {
                        const errorMsg = result?.message || 'Erro ao salvar dados. Tente novamente.';
                        showNotification(errorMsg, 'error');
                    }
                    
                } catch (error) {
                    console.error('Erro ao salvar dados:', error);
                    showNotification(error.message || 'Erro ao salvar dados. Tente novamente.', 'error');
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
        const currentPassword = document.getElementById('account-current-password').value;
        
        // Se o usuário está tentando mudar a senha, validar
        if (newPassword || confirmPassword) {
            // Senha atual é obrigatória quando há nova senha
            if (!currentPassword || currentPassword.trim() === '' || currentPassword === '••••••••') {
                showFieldError('account-current-password', 'Senha atual é obrigatória para alterar a senha');
                isValid = false;
            }
            
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
        
        // Remover campo de senha atual se estiver vazio ou mascarado
        const currentPassword = formData.get('current_password');
        if (!currentPassword || currentPassword.trim() === '' || currentPassword === '••••••••') {
            formData.delete('current_password');
        }
        
        // Remover campos de senha se não houver nova senha
        const newPassword = formData.get('new_password');
        if (!newPassword || newPassword.trim() === '') {
            formData.delete('new_password');
            formData.delete('confirm_password');
            formData.delete('current_password');
        }
        
        const accountEndpoint = `${PROJECT_BASE_URL}services/conta.php`;
        let response;
        let result;
        
        try {
            response = await fetch(accountEndpoint, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
        } catch (networkError) {
            console.error('Erro de rede ao salvar dados:', networkError);
            return { success: false, message: 'Erro de conexão. Verifique sua internet e tente novamente.' };
        }
        
        try {
            result = (typeof window !== 'undefined' && window.safeResponseJson) 
                ? await window.safeResponseJson(response, { success: false })
                : await response.json();
        } catch (parseError) {
            console.error('Erro ao interpretar resposta do servidor:', parseError);
            if (!response.ok) {
                return { success: false, message: 'Erro ao salvar dados. Servidor retornou uma resposta inválida.' };
            }
            // Se a resposta HTTP for OK, assumir sucesso genérico
            return { success: true, message: 'Dados atualizados com sucesso!' };
        }
        
        if (!response.ok || !result || result.success === false) {
            return {
                success: false,
                message: result?.message || 'Erro ao salvar dados. Tente novamente.'
            };
        }
        
        // Atualizar dados do usuário na interface
        if (result.data) {
            updateUserInterface(result.data);
        }
        
        // Limpar campos de senha após sucesso
        const newPasswordField = document.getElementById('account-new-password');
        const confirmPasswordField = document.getElementById('account-confirm-password');
        if (newPasswordField) newPasswordField.value = '';
        if (confirmPasswordField) confirmPasswordField.value = '';
        
        // Manter o campo de senha atual bloqueado com valor mascarado
        const currentPasswordField = document.getElementById('account-current-password');
        if (currentPasswordField) {
            currentPasswordField.value = '••••••••';
            currentPasswordField.type = 'password';
            currentPasswordField.setAttribute('readonly', 'readonly');
            currentPasswordField.setAttribute('disabled', 'disabled');
        }
        
        return result || { success: true, message: 'Dados atualizados com sucesso!' };
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

// Função para adicionar item do portfólio ao carrinho (usada nos cards da página inicial)
function addPortfolioItemToCart(button) {
    const card = button.closest('.portfolio-card');
    if (!card) {
        console.error('Card do portfólio não encontrado');
        return;
    }
    
    // Obter dados do card
    const itemData = {
        id: 'portfolio_' + (card.getAttribute('data-item-id') || Date.now()),
        name: card.getAttribute('data-item-title') || 'Item do Portfólio',
        description: card.getAttribute('data-item-description') || '',
        price: parseFloat(card.getAttribute('data-item-price')) || 0,
        service_type: card.getAttribute('data-item-type') || '',
        arc_size: card.getAttribute('data-item-arc-size') || '',
        image: card.getAttribute('data-item-image') || '',
        decorator_id: parseInt(card.getAttribute('data-decorator-id')) || null,
        decorador_id: parseInt(card.getAttribute('data-decorator-id')) || null,
        quantity: 1,
        tamanho_arco_m: card.getAttribute('data-item-arc-size') || null
    };
    
    // Usar a função global para adicionar ao carrinho
    if (typeof addToCartGlobal === 'function') {
        addToCartGlobal(
            itemData.id,
            itemData.name,
            itemData.quantity,
            itemData
        );
    } else if (typeof addItemToCartStorage === 'function') {
        addItemToCartStorage(itemData);
        
        // Disparar evento de atualização
        const items = getStoredCartItems();
        window.dispatchEvent(new CustomEvent('cart-items-updated', {
            detail: {
                items: items,
                total: getCartItemsTotal(items)
            }
        }));
        
        // Mostrar notificação
        if (typeof showNotification === 'function') {
            showNotification(`${itemData.name} adicionado ao carrinho!`, 'success');
        } else {
            alert(`${itemData.name} adicionado ao carrinho!`);
        }
    } else {
        // Fallback: usar localStorage diretamente
        const CART_STORAGE_KEY = 'upbaloes_cart_items';
        try {
            const storedItems = localStorage.getItem(CART_STORAGE_KEY);
            const items = storedItems ? JSON.parse(storedItems) : [];
            
            const existingIndex = items.findIndex(item => item.id === itemData.id);
            if (existingIndex >= 0) {
                items[existingIndex].quantity = (parseInt(items[existingIndex].quantity) || 1) + 1;
            } else {
                items.push(itemData);
            }
            
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
            window.dispatchEvent(new CustomEvent('cart-items-updated'));
            
            if (typeof showNotification === 'function') {
                showNotification(`${itemData.name} adicionado ao carrinho!`, 'success');
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

// Tornar função globalmente acessível
window.addPortfolioItemToCart = addPortfolioItemToCart;

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
    card.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-200 group portfolio-card';
    
    // Adicionar atributos de dados para o botão de adicionar ao carrinho
    card.setAttribute('data-item-id', service.id || '');
    card.setAttribute('data-item-type', service.type || '');
    card.setAttribute('data-item-title', service.title || 'Título do Serviço');
    card.setAttribute('data-item-description', service.description || '');
    card.setAttribute('data-item-price', service.price || '0');
    card.setAttribute('data-item-arc-size', service.arcSize || '');
    card.setAttribute('data-item-image', service.image || '');
    card.setAttribute('data-decorator-id', service.decorator_id || service.decorador_id || '');
    
    // Processar imagem de forma otimizada - corrigir caminho relativo
    let imageUrl = service.image || '';
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//') && !imageUrl.startsWith('data:')) {
        // Detectar se estamos na raiz ou em subpasta
        const currentPath = window.location.pathname;
        const isRoot = !currentPath.includes('/pages/') && !currentPath.includes('/services/') && 
                       (currentPath === '/' || currentPath.endsWith('/index.html') || currentPath.endsWith('/'));
        
        // Se o caminho começa com ../uploads/, remover ../ se estivermos na raiz
        if (imageUrl.startsWith('../uploads/')) {
            if (isRoot) {
                // Remover ../ se estivermos na raiz
                imageUrl = imageUrl.replace(/^\.\.\//, '');
            }
            // Se não estiver na raiz, manter ../uploads/
        } else if (imageUrl.startsWith('uploads/')) {
            // Se começa com uploads/ diretamente, está correto para a raiz
            // Se estivermos em subpasta, adicionar ../
            if (!isRoot) {
                imageUrl = '../' + imageUrl;
            }
        } else if (!imageUrl.startsWith('../') && !imageUrl.startsWith('/')) {
            // Se não começa com ../ ou /, adicionar ../ se necessário
            if (!isRoot) {
                imageUrl = '../' + imageUrl;
            }
        }
    }
    
    let imageHtml = '';
    if (imageUrl) {
        // Usar imagem otimizada com lazy loading
        imageHtml = `
            <img src="${escapeHtml(imageUrl)}" 
                 alt="${escapeHtml(service.title || 'Serviço')}" 
                 class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300 portfolio-image" 
                 loading="lazy"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center portfolio-image-placeholder" style="display:none;">
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
    
    // Função auxiliar para escapar HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
                    ${escapeHtml(service.type || 'Serviço')}
                </span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">${escapeHtml(service.title || 'Título do Serviço')}</h3>
            <p class="text-gray-600 text-sm mb-3 line-clamp-3">${escapeHtml(service.description || 'Descrição do serviço')}</p>
            ${service.arcSize ? `<p class="text-blue-600 text-sm mb-2"><i class="fas fa-ruler mr-1"></i>${escapeHtml(service.arcSize)}</p>` : ''}
            ${service.price ? `<p class="text-green-600 font-semibold mb-4">R$ ${parseFloat(service.price).toFixed(2).replace('.', ',')}</p>` : ''}
            <button onclick="addPortfolioItemToCart(this)" 
                    class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 add-to-cart-btn">
                <i class="fas fa-shopping-cart"></i>
                <span>Selecionar</span>
            </button>
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
        // Verificar se estamos em uma página dentro de /pages/ ou na raiz
        const basePath = window.location.pathname.includes('/pages/') ? '../services/contatos.php' : 'services/contatos.php';
        
        // Verificar se estamos na página do painel decorador (não carregar contatos lá)
        if (window.location.pathname.includes('painel-decorador')) {
            console.log('Página do painel decorador detectada, pulando carregamento de contatos');
            return;
        }
        
        const response = await fetch(basePath);
        
        if (!response.ok) {
            // Não lançar erro, apenas logar e continuar
            console.warn(`Erro ao carregar contatos: HTTP ${response.status}`);
            return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Resposta não é JSON:', text.substring(0, 200));
            throw new Error('Resposta do servidor não é JSON');
        }
        
        const result = (typeof window !== 'undefined' && window.safeResponseJson) 
            ? await window.safeResponseJson(response, { success: false })
            : await response.json();
        
        if (result && result.success && result.data) {
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
        // Não logar erro como crítico, apenas avisar (não deve bloquear a página)
        console.warn('Não foi possível carregar informações de contato:', error.message);
        // Em caso de erro, manter os textos "Carregando..." ou mostrar mensagem de erro
        const errorText = 'Não disponível';
        const elements = ['contact-email-text', 'contact-whatsapp-text', 'contact-instagram-text'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = errorText;
        });
    }
}

// Carregar contatos quando a página carregar (apenas se não estiver no painel decorador)
// Executar de forma assíncrona para não bloquear o carregamento da página
if (!window.location.pathname.includes('painel-decorador')) {
    // Aguardar um pouco para não interferir com o carregamento inicial
    setTimeout(() => {
        loadContactInfo().catch(error => {
            // Erro não crítico, apenas logar como aviso
            console.warn('Erro ao carregar contatos (não crítico):', error.message);
        });
    }, 1000);
}