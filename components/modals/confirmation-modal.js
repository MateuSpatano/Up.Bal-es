/**
 * 🎯 Componente: Modal de Confirmação
 * Modal reutilizável para confirmações e alertas
 */

function createConfirmationModal(options = {}) {
    // Configurações padrão
    const defaults = {
        title: 'Confirmar Ação',
        message: 'Tem certeza que deseja continuar?',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        confirmColor: 'red', // blue, green, red, yellow, purple
        cancelColor: 'gray',
        icon: 'fas fa-question-circle',
        onConfirm: null,
        onCancel: null,
        showCancel: true,
        closable: true,
        id: 'confirmation-modal'
    };
    
    // Mesclar opções
    const config = { ...defaults, ...options };
    
    // Gerar ID único se não fornecido
    const modalId = config.id + '-' + Date.now();
    
    // Classes de cor para botões
    const buttonColors = {
        blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        yellow: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
        gray: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
    };
    
    // Criar HTML do modal
    const modalHTML = `
        <div id="${modalId}" class="fixed inset-0 z-50 hidden overflow-y-auto">
            <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <!-- Overlay -->
                <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" id="${modalId}-overlay"></div>

                <!-- Modal Content -->
                <div class="inline-block w-full max-w-md p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <i class="${config.icon} text-gray-600 text-lg"></i>
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800">${config.title}</h3>
                                </div>
                            </div>
                            ${config.closable ? `
                                <button id="${modalId}-close" class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                                    <i class="fas fa-times text-xl"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="px-6 py-6">
                        <p class="text-gray-700 text-center">${config.message}</p>
                    </div>

                    <!-- Footer -->
                    <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div class="flex flex-col sm:flex-row gap-3">
                            ${config.showCancel ? `
                                <button id="${modalId}-cancel" 
                                        class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200">
                                    <i class="fas fa-times mr-2"></i>${config.cancelText}
                                </button>
                            ` : ''}
                            <button id="${modalId}-confirm" 
                                    class="flex-1 px-4 py-2 text-white ${buttonColors[config.confirmColor]} rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                                <i class="fas fa-check mr-2"></i>${config.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Inserir modal no DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Obter referências dos elementos
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById(`${modalId}-overlay`);
    const closeBtn = document.getElementById(`${modalId}-close`);
    const cancelBtn = document.getElementById(`${modalId}-cancel`);
    const confirmBtn = document.getElementById(`${modalId}-confirm`);
    
    // Função para fechar modal
    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Remover modal do DOM após animação
        setTimeout(() => {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    };
    
    // Função para abrir modal
    const openModal = () => {
        modal.classList.remove('hidden');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };
    
    // Event listeners
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (config.onCancel) {
                config.onCancel();
            }
            closeModal();
        });
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if (config.onConfirm) {
                config.onConfirm();
            }
            closeModal();
        });
    }
    
    // Abrir modal automaticamente
    openModal();
    
    // Retornar objeto com métodos de controle
    return {
        modal,
        open: openModal,
        close: closeModal,
        destroy: () => {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }
    };
}

/**
 * Modal de confirmação simples
 */
function showConfirmation(title, message, onConfirm, onCancel = null) {
    return createConfirmationModal({
        title,
        message,
        onConfirm,
        onCancel,
        confirmColor: 'red'
    });
}

/**
 * Modal de sucesso
 */
function showSuccess(title, message, onConfirm = null) {
    return createConfirmationModal({
        title,
        message,
        confirmText: 'OK',
        showCancel: false,
        confirmColor: 'green',
        icon: 'fas fa-check-circle',
        onConfirm: onConfirm || (() => {})
    });
}

/**
 * Modal de erro
 */
function showError(title, message, onConfirm = null) {
    return createConfirmationModal({
        title,
        message,
        confirmText: 'OK',
        showCancel: false,
        confirmColor: 'red',
        icon: 'fas fa-exclamation-circle',
        onConfirm: onConfirm || (() => {})
    });
}

/**
 * Modal de aviso
 */
function showWarning(title, message, onConfirm, onCancel = null) {
    return createConfirmationModal({
        title,
        message,
        onConfirm,
        onCancel,
        confirmColor: 'yellow',
        icon: 'fas fa-exclamation-triangle'
    });
}

// Exportar funções
export { 
    createConfirmationModal, 
    showConfirmation, 
    showSuccess, 
    showError, 
    showWarning 
};

// Para uso direto no HTML
window.createConfirmationModal = createConfirmationModal;
window.showConfirmation = showConfirmation;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
