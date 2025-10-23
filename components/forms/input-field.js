/**
 * 🎯 Componente: Campo de Entrada
 * Campo de entrada reutilizável com validação
 */

function createInputField(containerId, options = {}) {
    // Configurações padrão
    const defaults = {
        type: 'text',
        name: '',
        id: '',
        label: '',
        placeholder: '',
        value: '',
        required: false,
        disabled: false,
        readonly: false,
        icon: null,
        iconPosition: 'left', // left, right
        size: 'medium', // small, medium, large
        variant: 'default', // default, filled, outlined
        validation: null,
        errorMessage: '',
        helpText: '',
        className: '',
        wrapperClassName: ''
    };
    
    // Mesclar opções
    const config = { ...defaults, ...options };
    
    // Gerar ID único se não fornecido
    const fieldId = config.id || `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Classes base
    const baseClasses = 'w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200';
    
    // Classes de tamanho
    const sizeClasses = {
        small: 'px-3 py-2 text-sm',
        medium: 'px-4 py-3 text-base',
        large: 'px-5 py-4 text-lg'
    };
    
    // Classes de variante
    const variantClasses = {
        default: 'bg-white',
        filled: 'bg-gray-50',
        outlined: 'bg-transparent border-2'
    };
    
    // Classes de estado
    const stateClasses = [
        config.disabled ? 'opacity-50 cursor-not-allowed' : '',
        config.readonly ? 'bg-gray-50' : ''
    ].filter(Boolean).join(' ');
    
    // Construir classes do input
    const inputClasses = [
        baseClasses,
        sizeClasses[config.size],
        variantClasses[config.variant],
        stateClasses,
        config.className
    ].filter(Boolean).join(' ');
    
    // Criar HTML do campo
    const fieldHTML = `
        <div class="space-y-2 ${config.wrapperClassName}">
            ${config.label ? `
                <label for="${fieldId}" class="block text-sm font-medium text-gray-700">
                    ${config.icon ? `<i class="${config.icon} mr-2 text-blue-600"></i>` : ''}
                    ${config.label}
                    ${config.required ? '<span class="text-red-500 ml-1">*</span>' : ''}
                </label>
            ` : ''}
            
            <div class="relative">
                ${config.icon && config.iconPosition === 'left' ? `
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="${config.icon} text-gray-400"></i>
                    </div>
                ` : ''}
                
                <input 
                    type="${config.type}"
                    id="${fieldId}"
                    name="${config.name}"
                    placeholder="${config.placeholder}"
                    value="${config.value}"
                    ${config.required ? 'required' : ''}
                    ${config.disabled ? 'disabled' : ''}
                    ${config.readonly ? 'readonly' : ''}
                    class="${inputClasses} ${config.icon && config.iconPosition === 'left' ? 'pl-10' : ''} ${config.icon && config.iconPosition === 'right' ? 'pr-10' : ''}"
                />
                
                ${config.icon && config.iconPosition === 'right' ? `
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <i class="${config.icon} text-gray-400"></i>
                    </div>
                ` : ''}
            </div>
            
            ${config.helpText ? `
                <p class="text-xs text-gray-500">
                    <i class="fas fa-info-circle mr-1"></i>
                    ${config.helpText}
                </p>
            ` : ''}
            
            <div id="${fieldId}-error" class="text-red-500 text-sm hidden">
                <i class="fas fa-exclamation-circle mr-1"></i>
                <span class="error-message"></span>
            </div>
        </div>
    `;
    
    // Inserir no container
    const container = document.getElementById(containerId);
    if (container) {
        container.insertAdjacentHTML('beforeend', fieldHTML);
    }
    
    // Obter referências dos elementos
    const input = document.getElementById(fieldId);
    const errorDiv = document.getElementById(`${fieldId}-error`);
    const errorMessage = errorDiv?.querySelector('.error-message');
    
    // Função para mostrar erro
    const showError = (message) => {
        if (errorDiv && errorMessage) {
            errorMessage.textContent = message;
            errorDiv.classList.remove('hidden');
            input.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
            input.classList.remove('border-gray-300', 'focus:ring-blue-500', 'focus:border-blue-500');
        }
    };
    
    // Função para limpar erro
    const clearError = () => {
        if (errorDiv) {
            errorDiv.classList.add('hidden');
            input.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
            input.classList.add('border-gray-300', 'focus:ring-blue-500', 'focus:border-blue-500');
        }
    };
    
    // Função para validar campo
    const validate = () => {
        const value = input.value.trim();
        
        // Validação obrigatória
        if (config.required && !value) {
            showError('Este campo é obrigatório');
            return false;
        }
        
        // Validação personalizada
        if (config.validation && value) {
            const validationResult = config.validation(value);
            if (validationResult !== true) {
                showError(validationResult);
                return false;
            }
        }
        
        clearError();
        return true;
    };
    
    // Event listeners
    if (input) {
        // Limpar erro ao digitar
        input.addEventListener('input', clearError);
        
        // Validar ao sair do campo
        input.addEventListener('blur', validate);
    }
    
    // Retornar objeto com métodos de controle
    return {
        input,
        getValue: () => input?.value || '',
        setValue: (value) => {
            if (input) input.value = value;
        },
        validate,
        showError,
        clearError,
        focus: () => input?.focus(),
        disable: () => {
            if (input) input.disabled = true;
        },
        enable: () => {
            if (input) input.disabled = false;
        },
        destroy: () => {
            if (input && input.parentNode) {
                input.parentNode.removeChild(input.parentNode);
            }
        }
    };
}

/**
 * Campo de email com validação
 */
function createEmailField(containerId, options = {}) {
    const emailValidation = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Email inválido';
    };
    
    return createInputField(containerId, {
        type: 'email',
        icon: 'fas fa-envelope',
        validation: emailValidation,
        ...options
    });
}

/**
 * Campo de senha com validação
 */
function createPasswordField(containerId, options = {}) {
    const passwordValidation = (value) => {
        if (value.length < 8) {
            return 'Senha deve ter pelo menos 8 caracteres';
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            return 'Senha deve conter letras maiúsculas, minúsculas e números';
        }
        return true;
    };
    
    return createInputField(containerId, {
        type: 'password',
        icon: 'fas fa-lock',
        validation: passwordValidation,
        ...options
    });
}

/**
 * Campo de telefone com máscara
 */
function createPhoneField(containerId, options = {}) {
    const phoneValidation = (value) => {
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return phoneRegex.test(value) || 'Telefone inválido';
    };
    
    const field = createInputField(containerId, {
        type: 'tel',
        icon: 'fas fa-phone',
        placeholder: '(11) 99999-9999',
        validation: phoneValidation,
        ...options
    });
    
    // Aplicar máscara de telefone
    if (field.input) {
        field.input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            }
            if (value.length >= 9) {
                value = value.slice(0, 9) + '-' + value.slice(9, 13);
            }
            e.target.value = value;
        });
    }
    
    return field;
}

// Exportar funções
export { 
    createInputField, 
    createEmailField, 
    createPasswordField, 
    createPhoneField 
};

// Para uso direto no HTML
window.createInputField = createInputField;
window.createEmailField = createEmailField;
window.createPasswordField = createPasswordField;
window.createPhoneField = createPhoneField;
