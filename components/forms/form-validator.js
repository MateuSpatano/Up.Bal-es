/**
 * 🎯 Componente: Validador de Formulário
 * Sistema de validação reutilizável para formulários
 */

class FormValidator {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.options = {
            showErrors: true,
            highlightFields: true,
            validateOnSubmit: true,
            validateOnBlur: true,
            validateOnInput: false,
            ...options
        };
        
        this.rules = {};
        this.errors = {};
        this.isValid = true;
        
        this.init();
    }
    
    init() {
        if (!this.form) {
            console.error('Formulário não encontrado:', formId);
            return;
        }
        
        // Event listeners
        if (this.options.validateOnSubmit) {
            this.form.addEventListener('submit', (e) => {
                if (!this.validateForm()) {
                    e.preventDefault();
                }
            });
        }
        
        if (this.options.validateOnBlur) {
            this.form.addEventListener('blur', (e) => {
                if (e.target.matches('input, select, textarea')) {
                    this.validateField(e.target.name);
                }
            }, true);
        }
        
        if (this.options.validateOnInput) {
            this.form.addEventListener('input', (e) => {
                if (e.target.matches('input, select, textarea')) {
                    this.clearFieldError(e.target.name);
                }
            });
        }
    }
    
    /**
     * Adicionar regra de validação
     */
    addRule(fieldName, rule, message) {
        if (!this.rules[fieldName]) {
            this.rules[fieldName] = [];
        }
        
        this.rules[fieldName].push({
            rule,
            message
        });
    }
    
    /**
     * Validar campo específico
     */
    validateField(fieldName) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return true;
        
        const value = field.value.trim();
        const fieldRules = this.rules[fieldName] || [];
        
        for (const { rule, message } of fieldRules) {
            if (!rule(value)) {
                this.setFieldError(fieldName, message);
                return false;
            }
        }
        
        this.clearFieldError(fieldName);
        return true;
    }
    
    /**
     * Validar formulário completo
     */
    validateForm() {
        this.isValid = true;
        this.errors = {};
        
        // Limpar erros anteriores
        this.clearAllErrors();
        
        // Validar cada campo
        Object.keys(this.rules).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                this.isValid = false;
            }
        });
        
        return this.isValid;
    }
    
    /**
     * Definir erro de campo
     */
    setFieldError(fieldName, message) {
        this.errors[fieldName] = message;
        
        if (this.options.showErrors) {
            this.showFieldError(fieldName, message);
        }
        
        if (this.options.highlightFields) {
            this.highlightField(fieldName, true);
        }
    }
    
    /**
     * Limpar erro de campo
     */
    clearFieldError(fieldName) {
        delete this.errors[fieldName];
        
        if (this.options.showErrors) {
            this.hideFieldError(fieldName);
        }
        
        if (this.options.highlightFields) {
            this.highlightField(fieldName, false);
        }
    }
    
    /**
     * Mostrar erro de campo
     */
    showFieldError(fieldName, message) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;
        
        // Remover erro anterior
        this.hideFieldError(fieldName);
        
        // Criar elemento de erro
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error text-red-500 text-sm mt-1';
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i>${message}`;
        errorElement.setAttribute('data-field', fieldName);
        
        // Inserir após o campo
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    
    /**
     * Esconder erro de campo
     */
    hideFieldError(fieldName) {
        const errorElement = this.form.querySelector(`[data-field="${fieldName}"].field-error`);
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    /**
     * Destacar campo
     */
    highlightField(fieldName, hasError) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;
        
        if (hasError) {
            field.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
            field.classList.remove('border-gray-300', 'focus:ring-blue-500', 'focus:border-blue-500');
        } else {
            field.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
            field.classList.add('border-gray-300', 'focus:ring-blue-500', 'focus:border-blue-500');
        }
    }
    
    /**
     * Limpar todos os erros
     */
    clearAllErrors() {
        const errorElements = this.form.querySelectorAll('.field-error');
        errorElements.forEach(element => element.remove());
        
        // Limpar destaque dos campos
        const fields = this.form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
            field.classList.add('border-gray-300', 'focus:ring-blue-500', 'focus:border-blue-500');
        });
    }
    
    /**
     * Obter dados do formulário
     */
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }
    
    /**
     * Definir dados do formulário
     */
    setFormData(data) {
        Object.entries(data).forEach(([key, value]) => {
            const field = this.form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = value;
            }
        });
    }
    
    /**
     * Resetar formulário
     */
    reset() {
        this.form.reset();
        this.clearAllErrors();
        this.errors = {};
        this.isValid = true;
    }
}

/**
 * Regras de validação predefinidas
 */
const ValidationRules = {
    required: (value) => value.trim() !== '',
    
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },
    
    minLength: (min) => (value) => value.length >= min,
    
    maxLength: (max) => (value) => value.length <= max,
    
    min: (min) => (value) => parseFloat(value) >= min,
    
    max: (max) => (value) => parseFloat(value) <= max,
    
    pattern: (regex) => (value) => regex.test(value),
    
    phone: (value) => {
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return phoneRegex.test(value);
    },
    
    cpf: (value) => {
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        return cpfRegex.test(value);
    },
    
    cnpj: (value) => {
        const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
        return cnpjRegex.test(value);
    },
    
    password: (value) => {
        return value.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value);
    },
    
    url: (value) => {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    },
    
    date: (value) => {
        const date = new Date(value);
        return date instanceof Date && !isNaN(date);
    },
    
    time: (value) => {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(value);
    }
};

/**
 * Criar validador com configurações comuns
 */
function createFormValidator(formId, options = {}) {
    return new FormValidator(formId, options);
}

/**
 * Validador para formulário de login
 */
function createLoginValidator(formId) {
    const validator = new FormValidator(formId);
    
    validator.addRule('email', ValidationRules.required, 'Email é obrigatório');
    validator.addRule('email', ValidationRules.email, 'Email inválido');
    validator.addRule('password', ValidationRules.required, 'Senha é obrigatória');
    
    return validator;
}

/**
 * Validador para formulário de cadastro
 */
function createRegisterValidator(formId) {
    const validator = new FormValidator(formId);
    
    validator.addRule('nome', ValidationRules.required, 'Nome é obrigatório');
    validator.addRule('nome', ValidationRules.minLength(2), 'Nome deve ter pelo menos 2 caracteres');
    validator.addRule('email', ValidationRules.required, 'Email é obrigatório');
    validator.addRule('email', ValidationRules.email, 'Email inválido');
    validator.addRule('senha', ValidationRules.required, 'Senha é obrigatória');
    validator.addRule('senha', ValidationRules.password, 'Senha deve ter pelo menos 8 caracteres, com letras maiúsculas, minúsculas e números');
    validator.addRule('confirmar_senha', ValidationRules.required, 'Confirmação de senha é obrigatória');
    
    // Validação personalizada para confirmação de senha
    validator.addRule('confirmar_senha', (value) => {
        const senha = validator.form.querySelector('[name="senha"]').value;
        return value === senha;
    }, 'Senhas não coincidem');
    
    return validator;
}

// Exportar classes e funções
export { 
    FormValidator, 
    ValidationRules, 
    createFormValidator, 
    createLoginValidator, 
    createRegisterValidator 
};

// Para uso direto no HTML
window.FormValidator = FormValidator;
window.ValidationRules = ValidationRules;
window.createFormValidator = createFormValidator;
window.createLoginValidator = createLoginValidator;
window.createRegisterValidator = createRegisterValidator;
