/**
 * 🎯 Componentes Reutilizáveis - Up.Baloes
 * Arquivo principal para importar todos os componentes
 */

// ========== BUTTONS ==========
export { 
    createPrimaryButton, 
    updatePrimaryButton, 
    removePrimaryButton 
} from './buttons/primary-button.js';

export { 
    createFloatingButton, 
    toggleFloatingButton, 
    updateFloatingButtonPosition,
    updateFloatingButtonIcon,
    removeFloatingButton 
} from './buttons/floating-button.js';

// ========== MODALS ==========
export { 
    createConfirmationModal, 
    showConfirmation, 
    showSuccess, 
    showError, 
    showWarning 
} from './modals/confirmation-modal.js';

// ========== FORMS ==========
export { 
    createInputField, 
    createEmailField, 
    createPasswordField, 
    createPhoneField 
} from './forms/input-field.js';

export { 
    FormValidator, 
    ValidationRules, 
    createFormValidator, 
    createLoginValidator, 
    createRegisterValidator 
} from './forms/form-validator.js';

// ========== CARDS ==========
export { 
    createInfoCard, 
    createMetricCard, 
    createServiceCard, 
    createBudgetCard 
} from './cards/info-card.js';

// ========== LAYOUT ==========
export { createSidebar } from './layout/sidebar.js';

// ========== UTILITÁRIOS ==========

/**
 * Inicializar todos os componentes
 */
function initializeComponents() {
    console.log('🧩 Componentes Up.Baloes inicializados!');
    
    // Configurar tooltips globais
    setupGlobalTooltips();
    
    // Configurar notificações globais
    setupGlobalNotifications();
    
    // Configurar validações globais
    setupGlobalValidations();
}

/**
 * Configurar tooltips globais
 */
function setupGlobalTooltips() {
    // Adicionar tooltips a elementos com data-tooltip
    document.addEventListener('mouseenter', (e) => {
        if (e.target.hasAttribute('data-tooltip')) {
            const tooltip = e.target.getAttribute('data-tooltip');
            showTooltip(e.target, tooltip);
        }
    }, true);
    
    document.addEventListener('mouseleave', (e) => {
        if (e.target.hasAttribute('data-tooltip')) {
            hideTooltip();
        }
    }, true);
}

/**
 * Mostrar tooltip
 */
function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.id = 'global-tooltip';
    tooltip.className = 'absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg';
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
}

/**
 * Esconder tooltip
 */
function hideTooltip() {
    const tooltip = document.getElementById('global-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

/**
 * Configurar notificações globais
 */
function setupGlobalNotifications() {
    // Container de notificações
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
    }
}

/**
 * Configurar validações globais
 */
function setupGlobalValidations() {
    // Validação automática de formulários com classe 'auto-validate'
    document.addEventListener('submit', (e) => {
        const form = e.target;
        if (form.classList.contains('auto-validate')) {
            const validator = new FormValidator(form.id);
            if (!validator.validateForm()) {
                e.preventDefault();
            }
        }
    });
}

/**
 * Utilitários globais
 */
const Utils = {
    /**
     * Debounce function
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function
     */
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Gerar ID único
     */
    generateId: (prefix = 'id') => {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    /**
     * Formatar data
     */
    formatDate: (date, format = 'dd/mm/yyyy') => {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        
        return format
            .replace('dd', day)
            .replace('mm', month)
            .replace('yyyy', year);
    },
    
    /**
     * Formatar moeda
     */
    formatCurrency: (value, currency = 'BRL') => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency
        }).format(value);
    },
    
    /**
     * Copiar para clipboard
     */
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Erro ao copiar para clipboard:', err);
            return false;
        }
    },
    
    /**
     * Scroll suave para elemento
     */
    scrollToElement: (element, offset = 0) => {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (target) {
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
};

// Exportar utilitários
export { Utils };

// Inicializar componentes quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
    initializeComponents();
}

// Para uso direto no HTML
window.Utils = Utils;
window.initializeComponents = initializeComponents;
