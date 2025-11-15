// JavaScript para página de solicitação de serviço do cliente
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos DOM
    const serviceTypeSelect = document.getElementById('service-type');
    const arcSizeContainer = document.getElementById('arc-size-container');
    const arcSizeInput = document.getElementById('arc-size');
    const form = document.getElementById('service-request-form');
    const submitBtn = document.getElementById('submit-request');
    const cancelBtn = document.getElementById('cancel-request');
    const imageInput = document.getElementById('inspiration-image');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const removeImageBtn = document.getElementById('remove-image');

    // ========== FUNCIONALIDADES DO CAMPO TAMANHO DO ARCO ==========
    
    // Campo de tamanho do arco agora é sempre obrigatório
    // Não há mais lógica condicional para mostrar/ocultar

    // ========== FUNCIONALIDADES DE UPLOAD DE IMAGEM ==========
    
    // Configurar upload de imagem
    function setupImageUpload() {
        if (imageInput) {
            imageInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    // Validar tipo de arquivo
                    if (!file.type.startsWith('image/')) {
                        showFieldError('inspiration-image', 'Por favor, selecione apenas arquivos de imagem');
                        return;
                    }
                    
                    // Validar tamanho do arquivo (máximo 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        showFieldError('inspiration-image', 'A imagem deve ter no máximo 5MB');
                        return;
                    }
                    
                    // Limpar erros anteriores
                    clearFieldValidation('inspiration-image');
                    
                    // Mostrar preview
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewImg.src = e.target.result;
                        imagePreview.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Configurar botão de remover imagem
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', function() {
                imageInput.value = '';
                imagePreview.classList.add('hidden');
                previewImg.src = '';
                clearFieldValidation('inspiration-image');
            });
        }
    }

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
    
    // Chave para armazenar orçamentos personalizados no localStorage
    const QUOTES_STORAGE_KEY = 'upbaloes_custom_quotes';
    
    // Função para obter orçamentos armazenados
    function getStoredQuotes() {
        try {
            const storedQuotes = localStorage.getItem(QUOTES_STORAGE_KEY);
            if (!storedQuotes) return [];
            const parsedQuotes = JSON.parse(storedQuotes);
            return Array.isArray(parsedQuotes) ? parsedQuotes : [];
        } catch (error) {
            console.warn('Erro ao carregar orçamentos:', error);
            return [];
        }
    }
    
    // Função para adicionar orçamento ao carrinho
    function addQuoteToCart(quoteData) {
        const quotes = getStoredQuotes();
        
        // Criar objeto de orçamento personalizado
        // Usando tanto os campos do banco quanto os campos esperados pelo carrinho
        const quote = {
            id: Date.now(), // ID temporário baseado em timestamp
            cliente: quoteData.client_name,
            email: quoteData.client_email,
            telefone: quoteData.client_phone || null,
            data_evento: quoteData.event_date,
            event_date: quoteData.event_date, // Para compatibilidade com o carrinho
            hora_evento: quoteData.event_time || '10:00',
            event_time: quoteData.event_time || '10:00', // Para compatibilidade com o carrinho
            local_evento: quoteData.event_location,
            event_location: quoteData.event_location, // Para compatibilidade com o carrinho
            tipo_servico: quoteData.service_type,
            service_type: quoteData.service_type, // Para compatibilidade com o carrinho
            descricao: quoteData.description || null,
            description: quoteData.description || null, // Para compatibilidade com o carrinho
            tamanho_arco_m: quoteData.tamanho_arco_m || null,
            observacoes: quoteData.notes || null,
            notes: quoteData.notes || null, // Para compatibilidade com o carrinho
            valor_estimado: 0, // O decorador definirá o valor
            estimated_value: 0, // Para compatibilidade com o carrinho
            status: 'pendente',
            created_via: 'client',
            imagem: quoteData.imagePath || null,
            imagePath: quoteData.imagePath || null, // Para compatibilidade com o carrinho
            created_at: new Date().toISOString()
        };
        
        // Adicionar à lista
        quotes.push(quote);
        
        // Salvar no localStorage
        localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
        
        return quote;
    }
    
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
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Adicionando ao carrinho...';
                
                try {
                    // Coletar dados do formulário
                    const formData = new FormData(form);
                    
                    // Preparar dados do orçamento
                    const quoteData = {
                        client_name: formData.get('client_name'),
                        client_email: formData.get('client_email'),
                        client_phone: formData.get('client_phone'),
                        event_date: formData.get('event_date'),
                        event_time: '10:00', // Hora padrão
                        event_location: formData.get('event_location'),
                        service_type: formData.get('service_type'),
                        description: formData.get('description'),
                        tamanho_arco_m: formData.get('tamanho_arco_m'),
                        notes: formData.get('notes')
                    };
                    
                    // Processar imagem se houver
                    const imageFile = formData.get('inspiration_image');
                    if (imageFile && imageFile.size > 0) {
                        // Converter imagem para base64 para armazenar no localStorage
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            quoteData.imagePath = e.target.result;
                            // Adicionar ao carrinho após processar a imagem
                            addQuoteToCart(quoteData);
                            
                            // Mostrar notificação de sucesso
                            showNotification('Orçamento adicionado ao carrinho com sucesso!', 'success');
                            
                            // Redirecionar para o carrinho após um breve delay
                            setTimeout(() => {
                                window.location.href = 'carrinho-cliente.html';
                            }, 1000);
                        };
                        reader.onerror = function() {
                            // Se houver erro ao processar imagem, adicionar sem imagem
                            addQuoteToCart(quoteData);
                            showNotification('Orçamento adicionado ao carrinho! (Imagem não pôde ser processada)', 'success');
                            setTimeout(() => {
                                window.location.href = 'carrinho-cliente.html';
                            }, 1000);
                        };
                        reader.readAsDataURL(imageFile);
                    } else {
                        // Adicionar ao carrinho sem imagem
                        addQuoteToCart(quoteData);
                        
                        // Mostrar notificação de sucesso
                        showNotification('Orçamento adicionado ao carrinho com sucesso!', 'success');
                        
                        // Redirecionar para o carrinho após um breve delay
                        setTimeout(() => {
                            window.location.href = 'carrinho-cliente.html';
                        }, 1000);
                    }
                    
                } catch (error) {
                    showNotification('Erro ao adicionar orçamento ao carrinho. Tente novamente.', 'error');
                    console.error('Erro ao adicionar orçamento:', error);
                    
                    // Remover loading em caso de erro
                    submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar Solicitação';
                }
            });
        }
    }

    // Enviar solicitação de serviço
    async function submitServiceRequest(formData) {
        try {
            // Adicionar campos adicionais ao FormData
            formData.append('action', 'create');
            formData.append('event_time', '10:00'); // Hora padrão
            formData.append('estimated_value', '0'); // Apenas o decorador define o valor
            formData.append('created_via', 'client'); // Indica que foi criado via fluxo do cliente
            
            const response = await fetch('../services/orcamentos.php', {
                method: 'POST',
                body: formData // Usar FormData diretamente para suportar upload de arquivo
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

    // ========== CARREGAR DADOS DO USUÁRIO LOGADO ==========
    
    // Função para carregar dados do usuário se estiver logado
    function loadUserDataIfLoggedIn() {
        try {
            // Verificar se o usuário está logado
            const userToken = localStorage.getItem('userToken');
            if (!userToken) {
                return; // Usuário não está logado
            }
            
            // Carregar dados do usuário
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            
            // Preencher campos com dados do usuário
            const nameField = document.getElementById('client-name');
            const emailField = document.getElementById('client-email');
            const phoneField = document.getElementById('client-phone');
            
            if (nameField && userData.name) {
                nameField.value = userData.name;
            }
            if (emailField && userData.email) {
                emailField.value = userData.email;
            }
            if (phoneField && userData.phone) {
                phoneField.value = userData.phone;
            }
        } catch (error) {
            console.warn('Erro ao carregar dados do usuário:', error);
        }
    }

    // ========== INICIALIZAÇÃO ==========
    
    // Configurar todas as funcionalidades
    function init() {
        setupRealTimeValidation();
        setupFormSubmission();
        setupCancelButton();
        setupImageUpload();
        
        // Carregar dados do usuário se estiver logado
        loadUserDataIfLoggedIn();
        
        console.log('Client Request - Sistema carregado com sucesso!');
    }

    // Inicializar
    init();
});
