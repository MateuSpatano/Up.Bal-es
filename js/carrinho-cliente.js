// JavaScript para página do carrinho do cliente
document.addEventListener('DOMContentLoaded', function() {
    
    const CART_STORAGE_KEY = 'upbaloes_cart_items';
    const QUOTES_STORAGE_KEY = 'upbaloes_custom_quotes';
    
    // Elementos DOM
    const portfolioItemsList = document.getElementById('portfolio-items-list');
    const emptyPortfolioItems = document.getElementById('empty-portfolio-items');
    const customQuotesList = document.getElementById('custom-quotes-list');
    const emptyCustomQuotes = document.getElementById('empty-custom-quotes');
    const totalItemsSpan = document.getElementById('total-items');
    const subtotalSpan = document.getElementById('subtotal');
    const totalPriceSpan = document.getElementById('total-price');
    const confirmRequestBtn = document.getElementById('confirm-request-btn');
    const confirmModal = document.getElementById('confirm-request-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const requestForm = document.getElementById('request-form');
    const submitRequestBtn = document.getElementById('submit-request-btn');
    
    // ========== FUNÇÕES DE CARREGAMENTO ==========
    
    function getStoredCartItems() {
        try {
            const storedItems = localStorage.getItem(CART_STORAGE_KEY);
            if (!storedItems) return [];
            const parsedItems = JSON.parse(storedItems);
            return Array.isArray(parsedItems) ? parsedItems : [];
        } catch (error) {
            console.warn('Erro ao carregar itens do carrinho:', error);
            return [];
        }
    }
    
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
    
    // ========== RENDERIZAÇÃO DE ITENS ==========
    
    function renderPortfolioItems() {
        const items = getStoredCartItems();
        
        if (items.length === 0) {
            portfolioItemsList.innerHTML = '';
            emptyPortfolioItems.classList.remove('hidden');
            return;
        }
        
        emptyPortfolioItems.classList.add('hidden');
        portfolioItemsList.innerHTML = '';
        
        items.forEach((item, index) => {
            const itemCard = createPortfolioItemCard(item, index);
            portfolioItemsList.appendChild(itemCard);
        });
    }
    
    function createPortfolioItemCard(item, index) {
        const card = document.createElement('div');
        card.className = 'bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow';
        
        const price = parseFloat(item.price || 0);
        const quantity = parseInt(item.quantity || 1);
        const itemTotal = price * quantity;
        
        card.innerHTML = `
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex-1 min-w-0">
                            <h3 class="text-base sm:text-lg font-semibold text-gray-800 break-words">${escapeHtml(item.name || 'Item sem nome')}</h3>
                            ${item.description ? `<p class="text-xs sm:text-sm text-gray-600 mt-1 break-words">${escapeHtml(item.description)}</p>` : ''}
                        </div>
                        <button onclick="removePortfolioItem(${index})" 
                                class="text-red-600 hover:text-red-800 transition-colors ml-2 sm:ml-4 flex-shrink-0"
                                title="Remover item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-4">
                        <div class="flex items-center gap-2">
                            <label class="text-xs sm:text-sm text-gray-700 whitespace-nowrap">Quantidade:</label>
                            <div class="flex items-center border border-gray-300 rounded-lg">
                                <button onclick="decreaseQuantity(${index})" 
                                        class="px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-200 transition-colors">
                                    <i class="fas fa-minus text-xs"></i>
                                </button>
                                <input type="number" 
                                       value="${quantity}" 
                                       min="1"
                                       onchange="updateQuantity(${index}, this.value)"
                                       class="w-12 sm:w-16 px-1 sm:px-2 py-1 text-center border-0 focus:ring-0 focus:outline-none text-sm">
                                <button onclick="increaseQuantity(${index})" 
                                        class="px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-200 transition-colors">
                                    <i class="fas fa-plus text-xs"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="text-left sm:text-right">
                            <p class="text-xs sm:text-sm text-gray-600">Valor unitário:</p>
                            <p class="text-base sm:text-lg font-semibold text-green-600">R$ ${formatPrice(price)}</p>
                        </div>
                        
                        <div class="text-left sm:text-right sm:ml-auto">
                            <p class="text-xs sm:text-sm text-gray-600">Total:</p>
                            <p class="text-lg sm:text-xl font-bold text-blue-600">R$ ${formatPrice(itemTotal)}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }
    
    function renderCustomQuotes() {
        const quotes = getStoredQuotes();
        
        if (quotes.length === 0) {
            customQuotesList.innerHTML = '';
            emptyCustomQuotes.classList.remove('hidden');
            return;
        }
        
        emptyCustomQuotes.classList.add('hidden');
        customQuotesList.innerHTML = '';
        
        quotes.forEach((quote, index) => {
            const quoteCard = createQuoteCard(quote, index);
            customQuotesList.appendChild(quoteCard);
        });
    }
    
    function createQuoteCard(quote, index) {
        const card = document.createElement('div');
        card.className = 'bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow';
        
        const price = parseFloat(quote.estimated_value || 0);
        
        card.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-800">Orçamento Personalizado #${quote.id || index + 1}</h3>
                    ${quote.description ? `<p class="text-sm text-gray-600 mt-1">${escapeHtml(quote.description)}</p>` : ''}
                    <div class="mt-2 text-sm text-gray-600">
                        ${quote.event_date ? `<p><i class="fas fa-calendar mr-2"></i>Data: ${formatDate(quote.event_date)}</p>` : ''}
                        ${quote.event_location ? `<p><i class="fas fa-map-marker-alt mr-2"></i>Local: ${escapeHtml(quote.event_location)}</p>` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-4 ml-4">
                    <div class="text-right">
                        <p class="text-sm text-gray-600">Valor:</p>
                        <p class="text-xl font-bold text-green-600">R$ ${formatPrice(price)}</p>
                    </div>
                    <button onclick="removeQuote(${index})" 
                            class="text-red-600 hover:text-red-800 transition-colors"
                            title="Remover orçamento">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // ========== FUNÇÕES DE MANIPULAÇÃO ==========
    
    window.removePortfolioItem = function(index) {
        const items = getStoredCartItems();
        if (index >= 0 && index < items.length) {
            items.splice(index, 1);
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
            renderPortfolioItems();
            updateSummary();
        }
    };
    
    window.increaseQuantity = function(index) {
        const items = getStoredCartItems();
        if (index >= 0 && index < items.length) {
            items[index].quantity = (parseInt(items[index].quantity) || 1) + 1;
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
            renderPortfolioItems();
            updateSummary();
        }
    };
    
    window.decreaseQuantity = function(index) {
        const items = getStoredCartItems();
        if (index >= 0 && index < items.length) {
            const currentQty = parseInt(items[index].quantity) || 1;
            if (currentQty > 1) {
                items[index].quantity = currentQty - 1;
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
                renderPortfolioItems();
                updateSummary();
            }
        }
    };
    
    window.updateQuantity = function(index, value) {
        const items = getStoredCartItems();
        if (index >= 0 && index < items.length) {
            const qty = parseInt(value) || 1;
            if (qty > 0) {
                items[index].quantity = qty;
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
                renderPortfolioItems();
                updateSummary();
            }
        }
    };
    
    window.removeQuote = function(index) {
        const quotes = getStoredQuotes();
        if (index >= 0 && index < quotes.length) {
            quotes.splice(index, 1);
            localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
            renderCustomQuotes();
            updateSummary();
        }
    };
    
    // ========== ATUALIZAÇÃO DE RESUMO ==========
    
    function updateSummary() {
        const items = getStoredCartItems();
        const quotes = getStoredQuotes();
        
        let totalItems = 0;
        let subtotal = 0;
        
        // Calcular itens do portfólio
        items.forEach(item => {
            const quantity = parseInt(item.quantity) || 1;
            const price = parseFloat(item.price || 0);
            totalItems += quantity;
            subtotal += price * quantity;
        });
        
        // Calcular orçamentos personalizados
        quotes.forEach(quote => {
            const price = parseFloat(quote.estimated_value || 0);
            subtotal += price;
            totalItems += 1; // Cada orçamento conta como 1 item
        });
        
        // Atualizar UI
        totalItemsSpan.textContent = totalItems;
        subtotalSpan.textContent = formatPrice(subtotal);
        totalPriceSpan.textContent = formatPrice(subtotal);
        
        // Habilitar/desabilitar botão de confirmar
        confirmRequestBtn.disabled = totalItems === 0;
    }
    
    // ========== MODAL DE CONFIRMAÇÃO ==========
    
    function openConfirmModal() {
        // Carregar dados do usuário se estiver logado
        loadUserData();
        
        // Preencher dados dos itens do carrinho se houver
        const items = getStoredCartItems();
        if (items.length > 0) {
            // Preencher tipo de serviço baseado no primeiro item
            const firstItem = items[0];
            if (firstItem.service_type) {
                document.getElementById('modal-service-type').value = firstItem.service_type;
            }
            if (firstItem.tamanho_arco_m) {
                document.getElementById('modal-arc-size').value = firstItem.tamanho_arco_m;
            }
        }
        
        confirmModal.classList.remove('hidden');
        confirmModal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
    
    function closeConfirmModal() {
        confirmModal.classList.add('hidden');
        confirmModal.classList.remove('flex');
        document.body.style.overflow = 'auto';
        requestForm.reset();
    }
    
    function loadUserData() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            if (userData.name) {
                document.getElementById('modal-client-name').value = userData.name;
            }
            if (userData.email) {
                document.getElementById('modal-client-email').value = userData.email;
            }
            if (userData.phone) {
                document.getElementById('modal-client-phone').value = userData.phone;
            }
        } catch (error) {
            console.warn('Erro ao carregar dados do usuário:', error);
        }
    }
    
    // ========== SUBMISSÃO DO FORMULÁRIO ==========
    
    function setupFormSubmission() {
        requestForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validar formulário
            if (!validateForm()) {
                showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
                return;
            }
            
            // Mostrar loading
            submitRequestBtn.disabled = true;
            submitRequestBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
            
            try {
                await submitRequest();
                showNotification('Solicitação enviada com sucesso!', 'success');
                
                // Limpar carrinho
                localStorage.removeItem(CART_STORAGE_KEY);
                localStorage.removeItem(QUOTES_STORAGE_KEY);
                
                // Fechar modal e redirecionar
                closeConfirmModal();
                setTimeout(() => {
                    window.location.href = 'minhas-compras.html';
                }, 1500);
                
            } catch (error) {
                showNotification('Erro ao enviar solicitação. Tente novamente.', 'error');
                console.error('Erro ao enviar solicitação:', error);
            } finally {
                submitRequestBtn.disabled = false;
                submitRequestBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar Solicitação';
            }
        });
    }
    
    async function submitRequest() {
        const formData = new FormData(requestForm);
        const items = getStoredCartItems();
        const quotes = getStoredQuotes();
        
        // Obter decorador_id do primeiro item (assumindo que todos os itens são do mesmo decorador)
        let decoradorId = null;
        if (items.length > 0) {
            // Tentar obter decorador_id do primeiro item
            decoradorId = items[0].decorador_id || items[0].decorator_id;
        }
        
        // Se não houver decorador_id, buscar o primeiro decorador disponível
        if (!decoradorId) {
            decoradorId = await getDefaultDecoratorId();
        }
        
        if (!decoradorId) {
            throw new Error('Não foi possível identificar o decorador. Tente novamente.');
        }
        
        // Preparar dados para envio
        const requestData = {
            action: 'create',
            client: formData.get('client_name'),
            email: formData.get('client_email'),
            phone: formData.get('client_phone') || null,
            event_date: formData.get('event_date'),
            event_time: formData.get('event_time'),
            event_location: formData.get('event_location'),
            service_type: formData.get('service_type'),
            description: formData.get('description') || null,
            notes: formData.get('notes') || null,
            tamanho_arco_m: formData.get('tamanho_arco_m') || null,
            estimated_value: calculateTotalValue(),
            decorador_id: decoradorId,
            created_via: 'client',
            cart_items: items,
            custom_quotes: quotes
        };
        
        const response = await fetch('../services/orcamentos.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Erro ao enviar solicitação');
        }
        
        return result;
    }
    
    async function getDefaultDecoratorId() {
        try {
            // Buscar o primeiro decorador ativo através do serviço de usuários
            const response = await fetch('../services/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_first_decorator'
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.decorator_id) {
                    return result.decorator_id;
                }
            }
            
            // Fallback: usar ID 1 se não encontrar
            return 1;
        } catch (error) {
            console.warn('Erro ao buscar decorador padrão:', error);
            return 1; // Fallback
        }
    }
    
    function calculateTotalValue() {
        const items = getStoredCartItems();
        const quotes = getStoredQuotes();
        
        let total = 0;
        
        items.forEach(item => {
            const quantity = parseInt(item.quantity) || 1;
            const price = parseFloat(item.price || 0);
            total += price * quantity;
        });
        
        quotes.forEach(quote => {
            total += parseFloat(quote.estimated_value || 0);
        });
        
        return total;
    }
    
    function validateForm() {
        const requiredFields = [
            'modal-client-name',
            'modal-client-email',
            'modal-event-date',
            'modal-event-time',
            'modal-event-location',
            'modal-service-type'
        ];
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                field?.classList.add('border-red-500');
                return false;
            }
            field.classList.remove('border-red-500');
        }
        
        // Validar tamanho do arco se o tipo de serviço requerer
        const serviceType = document.getElementById('modal-service-type').value;
        const arcSize = document.getElementById('modal-arc-size').value;
        
        if ((serviceType === 'arco-tradicional' || serviceType === 'arco-desconstruido') && !arcSize) {
            document.getElementById('modal-arc-size').classList.add('border-red-500');
            return false;
        }
        
        return true;
    }
    
    // ========== EVENT LISTENERS ==========
    
    confirmRequestBtn.addEventListener('click', openConfirmModal);
    closeModalBtn.addEventListener('click', closeConfirmModal);
    cancelModalBtn.addEventListener('click', closeConfirmModal);
    
    // Fechar modal ao clicar fora
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            closeConfirmModal();
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !confirmModal.classList.contains('hidden')) {
            closeConfirmModal();
        }
    });
    
    // Validação em tempo real
    document.getElementById('modal-service-type')?.addEventListener('change', function() {
        const serviceType = this.value;
        const arcSizeContainer = document.getElementById('modal-arc-size-container');
        const arcSizeInput = document.getElementById('modal-arc-size');
        
        if (serviceType === 'arco-tradicional' || serviceType === 'arco-desconstruido') {
            arcSizeContainer.style.display = 'block';
            arcSizeInput.required = true;
        } else {
            arcSizeContainer.style.display = 'none';
            arcSizeInput.required = false;
            arcSizeInput.value = '';
        }
    });
    
    // ========== UTILITÁRIOS ==========
    
    function formatPrice(value) {
        return parseFloat(value || 0).toFixed(2).replace('.', ',');
    }
    
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    // ========== INICIALIZAÇÃO ==========
    
    function init() {
        renderPortfolioItems();
        renderCustomQuotes();
        updateSummary();
        setupFormSubmission();
        
        console.log('Carrinho do Cliente - Sistema carregado com sucesso!');
    }
    
    init();
});

