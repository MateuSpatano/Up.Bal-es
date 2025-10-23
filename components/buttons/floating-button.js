/**
 * 🎯 Componente: Botão Flutuante
 * Botão flutuante contextual do sistema
 */

function createFloatingButton(containerId, options = {}) {
    // Configurações padrão
    const defaults = {
        icon: 'fas fa-plus',
        size: 'medium', // small, medium, large
        position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
        color: 'blue', // blue, green, red, yellow, purple
        tooltip: '',
        onClick: null,
        visible: true,
        className: '',
        id: 'floating-add-btn'
    };
    
    // Mesclar opções
    const config = { ...defaults, ...options };
    
    // Classes base
    const baseClasses = 'fixed z-40 flex items-center justify-center text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200';
    
    // Classes de tamanho
    const sizeClasses = {
        small: 'w-12 h-12 text-lg',
        medium: 'w-14 h-14 text-xl',
        large: 'w-16 h-16 text-2xl'
    };
    
    // Classes de posição
    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6'
    };
    
    // Classes de cor
    const colorClasses = {
        blue: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
        green: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
        red: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700',
        yellow: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700',
        purple: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700'
    };
    
    // Classes de visibilidade
    const visibilityClasses = config.visible ? '' : 'hidden';
    
    // Construir classes
    const classes = [
        baseClasses,
        sizeClasses[config.size],
        positionClasses[config.position],
        colorClasses[config.color],
        visibilityClasses,
        config.className
    ].filter(Boolean).join(' ');
    
    // Criar elemento
    const button = document.createElement('button');
    button.id = config.id;
    button.className = classes;
    button.innerHTML = `<i class="${config.icon}"></i>`;
    
    // Tooltip
    if (config.tooltip) {
        button.setAttribute('title', config.tooltip);
        button.setAttribute('data-tooltip', config.tooltip);
    }
    
    // Event listener
    if (config.onClick) {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            config.onClick(e);
        });
    }
    
    // Inserir no container
    const container = document.getElementById(containerId);
    if (container) {
        container.appendChild(button);
    } else {
        // Se não encontrar container, adicionar ao body
        document.body.appendChild(button);
    }
    
    // Retornar elemento para manipulação
    return button;
}

/**
 * Atualizar visibilidade do botão
 */
function toggleFloatingButton(buttonId, visible = null) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    if (visible === null) {
        // Toggle
        button.classList.toggle('hidden');
    } else {
        // Definir visibilidade
        if (visible) {
            button.classList.remove('hidden');
        } else {
            button.classList.add('hidden');
        }
    }
}

/**
 * Atualizar posição do botão
 */
function updateFloatingButtonPosition(buttonId, position) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6'
    };
    
    // Remover classes de posição antigas
    Object.values(positionClasses).forEach(cls => {
        button.classList.remove(...cls.split(' '));
    });
    
    // Adicionar nova posição
    if (positionClasses[position]) {
        button.classList.add(...positionClasses[position].split(' '));
    }
}

/**
 * Atualizar ícone do botão
 */
function updateFloatingButtonIcon(buttonId, icon) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    const iconElement = button.querySelector('i');
    if (iconElement) {
        iconElement.className = icon;
    }
}

/**
 * Remover botão flutuante
 */
function removeFloatingButton(buttonId) {
    const button = document.getElementById(buttonId);
    if (button && button.parentNode) {
        button.parentNode.removeChild(button);
    }
}

// Exportar funções
export { 
    createFloatingButton, 
    toggleFloatingButton, 
    updateFloatingButtonPosition,
    updateFloatingButtonIcon,
    removeFloatingButton 
};

// Para uso direto no HTML
window.createFloatingButton = createFloatingButton;
window.toggleFloatingButton = toggleFloatingButton;
window.updateFloatingButtonPosition = updateFloatingButtonPosition;
window.updateFloatingButtonIcon = updateFloatingButtonIcon;
window.removeFloatingButton = removeFloatingButton;
