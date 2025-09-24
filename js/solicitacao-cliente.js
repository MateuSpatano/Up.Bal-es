// JavaScript para página de solicitação de serviço do cliente
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos DOM
    const serviceTypeSelect = document.getElementById('service-type');
    const arcSizeContainer = document.getElementById('arc-size-container');
    const arcSizeInput = document.getElementById('arc-size');
    const form = document.getElementById('service-request-form');
    const submitBtn = document.getElementById('submit-request');
    const cancelBtn = document.getElementById('cancel-request');

    // ========== FUNCIONALIDADES DO CAMPO TAMANHO DO ARCO ==========
    
    // Campo de tamanho do arco agora é sempre obrigatório
    // Não há mais lógica condicional para mostrar/ocultar

    // ========== VALIDAÇÕES ==========
    
    // Validação do tamanho do arco
    function validateArcSize() {
        const value = parseFloat(arcSizeInput.value);
        const isValid = value >= 0.5 && value <= 30;
        
        if (!arcSizeInput.value) {
            showFieldError('arc-size', 'Tamanho do arco é obrigatório');
            return false;
        } else if (!isValid) {
            showFieldError('arc-size', 'Tamanho deve estar entre 0.5 e 30 metros');
            return false;
        } else {
            showFieldSuccess('arc-size', 'Tamanho válido');
            return true;
        }
    }

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

    // Validação de data
    function validateDate(date) {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
    }

    // ========== FUNCIONALIDADES DE VALIDAÇÃO EM TEMPO REAL ==========
    
    // Configurar validação em tempo real
    function setupRealTimeValidation() {
        // Email
        const emailField = document.getElementById('client-email');
        if (emailField) {
            emailField.addEventListener('blur', function() {
                const email = this.value.trim();
                if (email && !validateEmail(email)) {
                    showFieldError('client-email', 'Email inválido');
                } else if (email) {
                    showFieldSuccess('client-email', 'Email válido');
                } else {
                    clearFieldValidation('client-email');
                }
            });
        }

        // Telefone
        const phoneField = document.getElementById('client-phone');
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
                    showFieldError('client-phone', 'Telefone inválido');
                } else if (phone) {
                    showFieldSuccess('client-phone', 'Telefone válido');
                } else {
                    clearFieldValidation('client-phone');
                }
            });
        }

        // Data do evento
        const dateField = document.getElementById('event-date');
        if (dateField) {
            dateField.addEventListener('change', function() {
                const date = this.value;
                if (date && !validateDate(date)) {
                    showFieldError('event-date', 'Data deve ser hoje ou no futuro');
                } else if (date) {
                    showFieldSuccess('event-date', 'Data válida');
                } else {
                    clearFieldValidation('event-date');
                }
            });
        }

        // Tamanho do arco
        if (arcSizeInput) {
            arcSizeInput.addEventListener('blur', validateArcSize);
            arcSizeInput.addEventListener('input', function() {
                // Limpar validação anterior
                clearFieldValidation('arc-size');
            });
        }
    }

    // ========== FUNCIONALIDADES DE VALIDAÇÃO VISUAL ==========
    
    // Mostrar erro no campo
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('border-red-500', 'focus:ring-red-500');
            field.classList.remove('border-gray-300', 'focus:ring-blue-500', 'focus:ring-purple-500');
            
            // Remover mensagem anterior
            const existingError = field.parentNode.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Adicionar nova mensagem
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message text-red-500 text-sm mt-1';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i>${message}`;
            field.parentNode.appendChild(errorDiv);
        }
    }

    // Mostrar sucesso no campo
    function showFieldSuccess(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('border-green-500', 'focus:ring-green-500');
            field.classList.remove('border-red-500', 'focus:ring-red-500');
            
            // Remover mensagem anterior
            const existingSuccess = field.parentNode.querySelector('.success-message');
            if (existingSuccess) {
                existingSuccess.remove();
            }
            
            // Adicionar nova mensagem
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message text-green-500 text-sm mt-1';
            successDiv.innerHTML = `<i class="fas fa-check-circle mr-1"></i>${message}`;
            field.parentNode.appendChild(successDiv);
        }
    }

    // Limpar validação do campo
    function clearFieldValidation(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.remove('border-red-500', 'border-green-500', 'focus:ring-red-500', 'focus:ring-green-500');
            field.classList.add('border-gray-300');
            
            const errorMessage = field.parentNode.querySelector('.error-message');
            const successMessage = field.parentNode.querySelector('.success-message');
            if (errorMessage) errorMessage.remove();
            if (successMessage) successMessage.remove();
        }
    }

    // ========== VALIDAÇÃO DO FORMULÁRIO ==========
    
    // Validar formulário completo
    function validateForm() {
        let isValid = true;
        
        // Limpar validações anteriores
        clearAllValidations();
        
        // Validar campos obrigatórios
        const requiredFields = [
            { id: 'client-name', name: 'Nome' },
            { id: 'client-email', name: 'Email' },
            { id: 'service-type', name: 'Tipo de Serviço' },
            { id: 'event-date', name: 'Data do Evento' },
            { id: 'event-location', name: 'Local do Evento' },
            { id: 'arc-size', name: 'Tamanho do Arco' }
        ];
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (!input.value.trim()) {
                showFieldError(field.id, `${field.name} é obrigatório`);
                isValid = false;
            }
        });
        
        // Validar email
        const email = document.getElementById('client-email').value.trim();
        if (email && !validateEmail(email)) {
            showFieldError('client-email', 'Email inválido');
            isValid = false;
        }
        
        // Validar telefone se preenchido
        const phone = document.getElementById('client-phone').value.trim();
        if (phone && !validatePhone(phone)) {
            showFieldError('client-phone', 'Telefone inválido');
            isValid = false;
        }
        
        // Validar data
        const date = document.getElementById('event-date').value;
        if (date && !validateDate(date)) {
            showFieldError('event-date', 'Data deve ser hoje ou no futuro');
            isValid = false;
        }
        
        // Validar tamanho do arco se necessário
        if (!validateArcSize()) {
            isValid = false;
        }
        
        return isValid;
    }

    // Limpar todas as validações
    function clearAllValidations() {
        const fields = ['client-name', 'client-email', 'client-phone', 'service-type', 
                       'event-date', 'event-location', 'arc-size'];
        fields.forEach(fieldId => clearFieldValidation(fieldId));
    }

    // ========== SUBMISSÃO DO FORMULÁRIO ==========
    
    // Configurar submissão do formulário
    function setupFormSubmission() {
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Validar formulário
                if (!validateForm()) {
                    showNotification('Por favor, corrija os erros no formulário', 'error');
                    return;
                }
                
                // Mostrar loading
                submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
                
                try {
                    // Preparar dados
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    
                    // Enviar solicitação
                    await submitServiceRequest(data);
                    
                    showNotification('Solicitação enviada com sucesso! Entraremos em contato em breve.', 'success');
                    form.reset();
                    clearAllValidations();
                    
                } catch (error) {
                    showNotification('Erro ao enviar solicitação. Tente novamente.', 'error');
                    console.error('Erro ao enviar solicitação:', error);
                } finally {
                    // Remover loading
                    submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar Solicitação';
                }
            });
        }
    }

    // Enviar solicitação de serviço
    async function submitServiceRequest(data) {
        try {
            const response = await fetch('../services/orcamentos.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'create',
                    client: data.client_name,
                    email: data.client_email,
                    phone: data.client_phone,
                    event_date: data.event_date,
                    event_time: '10:00', // Hora padrão
                    event_location: data.event_location,
                    service_type: data.service_type,
                    description: data.description,
                    estimated_value: 0, // Apenas o decorador define o valor
                    notes: data.notes,
                    tamanho_arco_m: data.tamanho_arco_m,
                    created_via: 'client' // Indica que foi criado via fluxo do cliente
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Erro ao enviar solicitação');
            }
            
            if (!result.success) {
                throw new Error(result.message || 'Erro ao enviar solicitação');
            }
            
            return result;
            
        } catch (error) {
            console.error('Erro ao enviar solicitação:', error);
            throw error;
        }
    }

    // ========== FUNCIONALIDADES DE NOTIFICAÇÃO ==========
    
    // Mostrar notificação
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
        
        // Remover após 5 segundos
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    function getIconForType(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    // ========== FUNCIONALIDADES DE CANCELAMENTO ==========
    
    // Configurar botão de cancelar
    function setupCancelButton() {
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                if (confirm('Tem certeza que deseja cancelar? Todos os dados preenchidos serão perdidos.')) {
                    // Redirecionar para a tela inicial
                    window.location.href = '../index.html';
                }
            });
        }
    }

    // ========== INICIALIZAÇÃO ==========
    
    // Configurar todas as funcionalidades
    function init() {
        setupRealTimeValidation();
        setupFormSubmission();
        setupCancelButton();
        
        console.log('Client Request - Sistema carregado com sucesso!');
    }

    // Inicializar
    init();
});
