/**
 * 🎯 Componente: Botão Primário
 * Botão principal do sistema com estilos padronizados
 */

function createPrimaryButton(containerId, options = {}) {
    // Configurações padrão
    const defaults = {
        text: 'Botão',
        icon: null,
        size: 'medium', // small, medium, large
        variant: 'blue', // blue, green, red, yellow, purple
        disabled: false,
        loading: false,
        onClick: null,
        className: '',
        id: null
    };
    
    // Mesclar opções
    const config = { ...defaults, ...options };
    
    // Classes base
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // Classes de tamanho
    const sizeClasses = {
        small: 'px-3 py-2 text-sm',
        medium: 'px-4 py-2 text-base',
        large: 'px-6 py-3 text-lg'
    };
    
    // Classes de variante
    const variantClasses = {
        blue: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white focus:ring-blue-500',
        green: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white focus:ring-green-500',
        red: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white focus:ring-red-500',
        yellow: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white focus:ring-yellow-500',
        purple: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white focus:ring-purple-500'
    };
    
    // Classes de estado
    const stateClasses = config.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    const loadingClasses = config.loading ? 'btn-loading' : '';
    
    // Construir classes
    const classes = [
        baseClasses,
        sizeClasses[config.size],
        variantClasses[config.variant],
        stateClasses,
        loadingClasses,
        config.className
    ].filter(Boolean).join(' ');
    
    // Criar elemento
    const button = document.createElement('button');
    button.className = classes;
    button.disabled = config.disabled || config.loading;
    
    if (config.id) {
        button.id = config.id;
    }
    
    // Conteúdo do botão
    let content = '';
    
    if (config.loading) {
        content = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Carregando...
        `;
    } else {
        content = config.text;
        if (config.icon) {
            content = `<i class="${config.icon} mr-2"></i>${content}`;
        }
    }
    
    button.innerHTML = content;
    
    // Event listener
    if (config.onClick && !config.disabled && !config.loading) {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            config.onClick(e);
        });
    }
    
    // Inserir no container
    const container = document.getElementById(containerId);
    if (container) {
        container.appendChild(button);
    }
    
    // Retornar elemento para manipulação
    return button;
}

/**
 * Atualizar estado do botão
 */
function updatePrimaryButton(buttonId, updates = {}) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    // Atualizar propriedades
    if (updates.disabled !== undefined) {
        button.disabled = updates.disabled;
    }
    
    if (updates.loading !== undefined) {
        if (updates.loading) {
            button.classList.add('btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    }
    
    if (updates.text !== undefined) {
        const icon = button.querySelector('i');
        if (icon) {
            button.innerHTML = `<i class="${icon.className} mr-2"></i>${updates.text}`;
        } else {
            button.innerHTML = updates.text;
        }
    }
}

/**
 * Remover botão
 */
function removePrimaryButton(buttonId) {
    const button = document.getElementById(buttonId);
    if (button && button.parentNode) {
        button.parentNode.removeChild(button);
    }
}

// Exportar funções
export { 
    createPrimaryButton, 
    updatePrimaryButton, 
    removePrimaryButton 
};

// Para uso direto no HTML
window.createPrimaryButton = createPrimaryButton;
window.updatePrimaryButton = updatePrimaryButton;
window.removePrimaryButton = removePrimaryButton;
