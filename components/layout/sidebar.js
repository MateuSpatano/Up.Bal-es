/**
 * 🎯 Componente: Sidebar
 * Sidebar reutilizável para navegação
 */

function createSidebar(containerId, options = {}) {
    // Configurações padrão
    const defaults = {
        title: 'Menu',
        logo: null,
        logoText: '',
        items: [],
        user: null,
        collapsible: true,
        collapsed: false,
        position: 'left', // left, right
        variant: 'default', // default, dark, light
        size: 'medium', // small, medium, large
        className: '',
        id: 'sidebar'
    };
    
    // Mesclar opções
    const config = { ...defaults, ...options };
    
    // Gerar ID único se não fornecido
    const sidebarId = config.id + '-' + Date.now();
    
    // Classes base
    const baseClasses = 'fixed top-0 h-full bg-white shadow-lg transition-all duration-300 z-40';
    
    // Classes de posição
    const positionClasses = {
        left: 'left-0',
        right: 'right-0'
    };
    
    // Classes de variante
    const variantClasses = {
        default: 'bg-white text-gray-800',
        dark: 'bg-gray-800 text-white',
        light: 'bg-gray-50 text-gray-700'
    };
    
    // Classes de tamanho
    const sizeClasses = {
        small: 'w-64',
        medium: 'w-72',
        large: 'w-80'
    };
    
    // Classes de estado
    const stateClasses = config.collapsed ? 'w-16' : sizeClasses[config.size];
    
    // Construir classes
    const classes = [
        baseClasses,
        positionClasses[config.position],
        variantClasses[config.variant],
        stateClasses,
        config.className
    ].filter(Boolean).join(' ');
    
    // Criar HTML da sidebar
    const sidebarHTML = `
        <div id="${sidebarId}" class="${classes}">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
                ${config.collapsed ? '' : `
                    <div class="flex items-center space-x-3">
                        ${config.logo ? `
                            <img src="${config.logo}" alt="Logo" class="w-8 h-8 rounded">
                        ` : ''}
                        <span class="text-lg font-semibold">${config.logoText || config.title}</span>
                    </div>
                `}
                
                ${config.collapsible ? `
                    <button id="${sidebarId}-toggle" class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <i class="fas fa-bars text-lg"></i>
                    </button>
                ` : ''}
            </div>
            
            <!-- Navigation -->
            <nav class="flex-1 p-4">
                <ul class="space-y-2">
                    ${config.items.map(item => `
                        <li>
                            <a href="${item.href || '#'}" 
                               class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${item.active ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}"
                               data-module="${item.module || ''}"
                            >
                                <i class="${item.icon} text-lg"></i>
                                ${config.collapsed ? '' : `<span>${item.text}</span>`}
                                ${item.badge ? `
                                    <span class="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                        ${item.badge}
                                    </span>
                                ` : ''}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </nav>
            
            <!-- User Section -->
            ${config.user ? `
                <div class="p-4 border-t border-gray-200">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            ${config.user.avatar ? `
                                <img src="${config.user.avatar}" alt="Avatar" class="w-8 h-8 rounded-full">
                            ` : `
                                <i class="fas fa-user text-gray-600"></i>
                            `}
                        </div>
                        ${config.collapsed ? '' : `
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900 truncate">${config.user.name}</p>
                                <p class="text-xs text-gray-500 truncate">${config.user.email}</p>
                            </div>
                        `}
                    </div>
                </div>
            ` : ''}
        </div>
        
        <!-- Overlay -->
        <div id="${sidebarId}-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-30 hidden"></div>
    `;
    
    // Inserir no container
    const container = document.getElementById(containerId);
    if (container) {
        container.insertAdjacentHTML('beforeend', sidebarHTML);
    } else {
        // Se não encontrar container, adicionar ao body
        document.body.insertAdjacentHTML('beforeend', sidebarHTML);
    }
    
    // Obter referências dos elementos
    const sidebar = document.getElementById(sidebarId);
    const toggleBtn = document.getElementById(`${sidebarId}-toggle`);
    const overlay = document.getElementById(`${sidebarId}-overlay`);
    const navLinks = sidebar?.querySelectorAll('a[data-module]');
    
    // Estado da sidebar
    let isCollapsed = config.collapsed;
    
    // Função para alternar sidebar
    const toggleSidebar = () => {
        isCollapsed = !isCollapsed;
        
        if (isCollapsed) {
            sidebar.classList.remove(sizeClasses[config.size]);
            sidebar.classList.add('w-16');
            overlay.classList.add('hidden');
        } else {
            sidebar.classList.remove('w-16');
            sidebar.classList.add(sizeClasses[config.size]);
            if (window.innerWidth < 768) {
                overlay.classList.remove('hidden');
            }
        }
    };
    
    // Função para abrir sidebar
    const openSidebar = () => {
        sidebar.classList.remove('w-16');
        sidebar.classList.add(sizeClasses[config.size]);
        isCollapsed = false;
        
        if (window.innerWidth < 768) {
            overlay.classList.remove('hidden');
        }
    };
    
    // Função para fechar sidebar
    const closeSidebar = () => {
        if (window.innerWidth < 768) {
            sidebar.classList.remove(sizeClasses[config.size]);
            sidebar.classList.add('w-16');
            overlay.classList.add('hidden');
            isCollapsed = true;
        }
    };
    
    // Event listeners
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    
    // Event listeners para links de navegação
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const module = link.getAttribute('data-module');
                if (module) {
                    e.preventDefault();
                    
                    // Remover classe active de todos os links
                    navLinks.forEach(l => l.classList.remove('bg-blue-100', 'text-blue-700'));
                    
                    // Adicionar classe active ao link clicado
                    link.classList.add('bg-blue-100', 'text-blue-700');
                    
                    // Fechar sidebar em mobile
                    if (window.innerWidth < 768) {
                        closeSidebar();
                    }
                    
                    // Disparar evento customizado
                    const event = new CustomEvent('sidebarNavigation', {
                        detail: { module, link }
                    });
                    document.dispatchEvent(event);
                }
            });
        });
    }
    
    // Responsividade
    const handleResize = () => {
        if (window.innerWidth >= 768) {
            overlay.classList.add('hidden');
            if (!isCollapsed) {
                sidebar.classList.remove('w-16');
                sidebar.classList.add(sizeClasses[config.size]);
            }
        }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Retornar objeto com métodos de controle
    return {
        sidebar,
        toggle: toggleSidebar,
        open: openSidebar,
        close: closeSidebar,
        isCollapsed: () => isCollapsed,
        updateUser: (userData) => {
            if (config.user) {
                const userSection = sidebar.querySelector('.p-4.border-t');
                if (userSection) {
                    userSection.innerHTML = `
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                ${userData.avatar ? `
                                    <img src="${userData.avatar}" alt="Avatar" class="w-8 h-8 rounded-full">
                                ` : `
                                    <i class="fas fa-user text-gray-600"></i>
                                `}
                            </div>
                            ${isCollapsed ? '' : `
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900 truncate">${userData.name}</p>
                                    <p class="text-xs text-gray-500 truncate">${userData.email}</p>
                                </div>
                            `}
                        </div>
                    `;
                }
            }
        },
        updateItems: (newItems) => {
            const nav = sidebar.querySelector('nav ul');
            if (nav) {
                nav.innerHTML = newItems.map(item => `
                    <li>
                        <a href="${item.href || '#'}" 
                           class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${item.active ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}"
                           data-module="${item.module || ''}"
                        >
                            <i class="${item.icon} text-lg"></i>
                            ${isCollapsed ? '' : `<span>${item.text}</span>`}
                            ${item.badge ? `
                                <span class="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                    ${item.badge}
                                </span>
                            ` : ''}
                        </a>
                    </li>
                `).join('');
            }
        },
        destroy: () => {
            if (sidebar && sidebar.parentNode) {
                sidebar.parentNode.removeChild(sidebar);
            }
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            window.removeEventListener('resize', handleResize);
        }
    };
}

// Exportar função
export { createSidebar };

// Para uso direto no HTML
window.createSidebar = createSidebar;
