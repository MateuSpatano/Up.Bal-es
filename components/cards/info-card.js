/**
 * 🎯 Componente: Card de Informações
 * Card reutilizável para exibir informações
 */

function createInfoCard(containerId, options = {}) {
    // Configurações padrão
    const defaults = {
        title: '',
        subtitle: '',
        content: '',
        icon: null,
        iconColor: 'blue', // blue, green, red, yellow, purple, gray
        image: null,
        imageAlt: '',
        actions: [],
        variant: 'default', // default, elevated, outlined, filled
        size: 'medium', // small, medium, large
        hover: true,
        clickable: false,
        onClick: null,
        className: '',
        id: null
    };
    
    // Mesclar opções
    const config = { ...defaults, ...options };
    
    // Gerar ID único se não fornecido
    const cardId = config.id || `info-card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Classes base
    const baseClasses = 'bg-white rounded-lg shadow-md transition-all duration-300';
    
    // Classes de variante
    const variantClasses = {
        default: 'shadow-md',
        elevated: 'shadow-lg hover:shadow-xl',
        outlined: 'border-2 border-gray-200 shadow-none',
        filled: 'bg-gray-50 shadow-none'
    };
    
    // Classes de tamanho
    const sizeClasses = {
        small: 'p-4',
        medium: 'p-6',
        large: 'p-8'
    };
    
    // Classes de hover
    const hoverClasses = config.hover ? 'hover:shadow-lg transform hover:scale-105' : '';
    
    // Classes de clique
    const clickableClasses = config.clickable ? 'cursor-pointer' : '';
    
    // Classes de cor do ícone
    const iconColorClasses = {
        blue: 'text-blue-600 bg-blue-100',
        green: 'text-green-600 bg-green-100',
        red: 'text-red-600 bg-red-100',
        yellow: 'text-yellow-600 bg-yellow-100',
        purple: 'text-purple-600 bg-purple-100',
        gray: 'text-gray-600 bg-gray-100'
    };
    
    // Construir classes
    const classes = [
        baseClasses,
        variantClasses[config.variant],
        sizeClasses[config.size],
        hoverClasses,
        clickableClasses,
        config.className
    ].filter(Boolean).join(' ');
    
    // Criar HTML do card
    const cardHTML = `
        <div id="${cardId}" class="${classes}">
            ${config.image ? `
                <div class="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    <img src="${config.image}" alt="${config.imageAlt}" class="w-full h-full object-cover">
                </div>
            ` : ''}
            
            <div class="flex items-start space-x-4">
                ${config.icon ? `
                    <div class="flex-shrink-0">
                        <div class="w-12 h-12 rounded-lg flex items-center justify-center ${iconColorClasses[config.iconColor]}">
                            <i class="${config.icon} text-lg"></i>
                        </div>
                    </div>
                ` : ''}
                
                <div class="flex-1 min-w-0">
                    ${config.title ? `
                        <h3 class="text-lg font-semibold text-gray-900 mb-1">${config.title}</h3>
                    ` : ''}
                    
                    ${config.subtitle ? `
                        <p class="text-sm text-gray-600 mb-2">${config.subtitle}</p>
                    ` : ''}
                    
                    ${config.content ? `
                        <div class="text-gray-700">
                            ${config.content}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            ${config.actions.length > 0 ? `
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="flex flex-wrap gap-2">
                        ${config.actions.map(action => `
                            <button 
                                class="px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${action.variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                                onclick="${action.onClick || ''}"
                            >
                                ${action.icon ? `<i class="${action.icon} mr-1"></i>` : ''}
                                ${action.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Inserir no container
    const container = document.getElementById(containerId);
    if (container) {
        container.insertAdjacentHTML('beforeend', cardHTML);
    }
    
    // Obter referência do card
    const card = document.getElementById(cardId);
    
    // Event listener para clique
    if (config.onClick && card) {
        card.addEventListener('click', (e) => {
            // Não executar se clicou em um botão de ação
            if (!e.target.closest('button')) {
                config.onClick(e);
            }
        });
    }
    
    // Retornar objeto com métodos de controle
    return {
        card,
        updateTitle: (title) => {
            const titleElement = card?.querySelector('h3');
            if (titleElement) {
                titleElement.textContent = title;
            }
        },
        updateSubtitle: (subtitle) => {
            const subtitleElement = card?.querySelector('p');
            if (subtitleElement) {
                subtitleElement.textContent = subtitle;
            }
        },
        updateContent: (content) => {
            const contentElement = card?.querySelector('.text-gray-700');
            if (contentElement) {
                contentElement.innerHTML = content;
            }
        },
        updateIcon: (icon, color = config.iconColor) => {
            const iconElement = card?.querySelector('.w-12.h-12 i');
            if (iconElement) {
                iconElement.className = icon;
                const iconContainer = iconElement.parentElement;
                if (iconContainer) {
                    iconContainer.className = `w-12 h-12 rounded-lg flex items-center justify-center ${iconColorClasses[color]}`;
                }
            }
        },
        addAction: (action) => {
            const actionsContainer = card?.querySelector('.flex.flex-wrap.gap-2');
            if (actionsContainer) {
                const buttonHTML = `
                    <button 
                        class="px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${action.variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                        onclick="${action.onClick || ''}"
                    >
                        ${action.icon ? `<i class="${action.icon} mr-1"></i>` : ''}
                        ${action.text}
                    </button>
                `;
                actionsContainer.insertAdjacentHTML('beforeend', buttonHTML);
            }
        },
        remove: () => {
            if (card && card.parentNode) {
                card.parentNode.removeChild(card);
            }
        }
    };
}

/**
 * Card de métrica
 */
function createMetricCard(containerId, options = {}) {
    return createInfoCard(containerId, {
        variant: 'elevated',
        size: 'small',
        iconColor: 'blue',
        ...options
    });
}

/**
 * Card de serviço
 */
function createServiceCard(containerId, options = {}) {
    return createInfoCard(containerId, {
        variant: 'outlined',
        hover: true,
        clickable: true,
        ...options
    });
}

/**
 * Card de orçamento
 */
function createBudgetCard(containerId, options = {}) {
    return createInfoCard(containerId, {
        variant: 'default',
        iconColor: 'green',
        ...options
    });
}

// Exportar funções
export { 
    createInfoCard, 
    createMetricCard, 
    createServiceCard, 
    createBudgetCard 
};

// Para uso direto no HTML
window.createInfoCard = createInfoCard;
window.createMetricCard = createMetricCard;
window.createServiceCard = createServiceCard;
window.createBudgetCard = createBudgetCard;
