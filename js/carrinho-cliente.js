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
    
    // Variáveis do calendário
    let currentCalendarDate = new Date();
    let availableDates = [];
    let currentDecoratorId = null;
    
    function openConfirmModal() {
        // Primeiro, restaurar dados previamente preenchidos (se houver)
        restoreFormData();
        
        // Depois, carregar dados do usuário se estiver logado (sem sobrescrever campos já preenchidos)
        loadUserData();
        
        // Preencher dados dos itens do carrinho se houver (sem sobrescrever campos já preenchidos)
        const items = getStoredCartItems();
        if (items.length > 0) {
            // Preencher tipo de serviço baseado no primeiro item (apenas se não estiver preenchido)
            const firstItem = items[0];
            const serviceTypeField = document.getElementById('modal-service-type');
            if (firstItem.service_type && !serviceTypeField.value) {
                serviceTypeField.value = firstItem.service_type;
            }
            const arcSizeField = document.getElementById('modal-arc-size');
            if (firstItem.tamanho_arco_m && !arcSizeField.value) {
                arcSizeField.value = firstItem.tamanho_arco_m;
            }
            
            // Obter decorador_id
            currentDecoratorId = firstItem.decorador_id || firstItem.decorator_id;
        }
        
        // Preencher dados dos orçamentos personalizados se houver (sem sobrescrever campos já preenchidos)
        const quotes = getStoredQuotes();
        if (quotes.length > 0) {
            const firstQuote = quotes[0];
            const serviceTypeField = document.getElementById('modal-service-type');
            if (firstQuote.service_type && !serviceTypeField.value) {
                serviceTypeField.value = firstQuote.service_type;
            }
            const arcSizeField = document.getElementById('modal-arc-size');
            if (firstQuote.tamanho_arco_m && !arcSizeField.value) {
                arcSizeField.value = firstQuote.tamanho_arco_m;
            }
            const descriptionField = document.getElementById('modal-description');
            if (firstQuote.description && !descriptionField.value) {
                descriptionField.value = firstQuote.description;
            }
            const notesField = document.getElementById('modal-notes');
            if (firstQuote.notes && !notesField.value) {
                notesField.value = firstQuote.notes;
            }
            const locationField = document.getElementById('modal-event-location');
            if (firstQuote.event_location && !locationField.value) {
                locationField.value = firstQuote.event_location;
            }
        }
        
        // Se não houver decorador_id, tentar buscar
        if (!currentDecoratorId) {
            getDefaultDecoratorId().then(id => {
                currentDecoratorId = id;
                initializeCalendar();
            });
        } else {
            initializeCalendar();
        }
        
        // Configurar salvamento automático dos dados do formulário
        setupFormAutoSave();
        
        confirmModal.classList.remove('hidden');
        confirmModal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
    
    function initializeCalendar() {
        if (!currentDecoratorId) {
            showCalendarError('Não foi possível identificar o decorador');
            return;
        }
        
        currentCalendarDate = new Date();
        renderCalendar();
        loadAvailableDates();
    }
    
    async function loadAvailableDates() {
        const loadingEl = document.getElementById('calendar-loading');
        const errorEl = document.getElementById('calendar-error');
        
        loadingEl.classList.remove('hidden');
        errorEl.classList.add('hidden');
        
        try {
            const startDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
            const endDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 3, 0);
            
            const response = await fetch('../services/disponibilidade.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_available_dates',
                    decorator_id: currentDecoratorId,
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: endDate.toISOString().split('T')[0]
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                availableDates = result.available_dates || [];
                renderCalendar();
            } else {
                throw new Error(result.message || 'Erro ao carregar datas disponíveis');
            }
        } catch (error) {
            console.error('Erro ao carregar datas disponíveis:', error);
            showCalendarError('Erro ao carregar disponibilidade. Tente novamente.');
        } finally {
            loadingEl.classList.add('hidden');
        }
    }
    
    function showCalendarError(message) {
        const errorEl = document.getElementById('calendar-error');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
    
    function renderCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const monthYearEl = document.getElementById('calendar-month-year');
        
        // Limpar dias do mês e células vazias (mantendo cabeçalho)
        const days = calendarGrid.querySelectorAll('.calendar-day, .calendar-day-empty');
        days.forEach(day => day.remove());
        
        // Atualizar título do mês
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        monthYearEl.textContent = `${monthNames[currentCalendarDate.getMonth()]} ${currentCalendarDate.getFullYear()}`;
        
        // Obter primeiro dia do mês e quantos dias tem o mês
        const firstDay = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
        const lastDay = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Adicionar células vazias para os dias antes do primeiro dia do mês
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day-empty';
            calendarGrid.appendChild(emptyCell);
        }
        
        // Adicionar dias do mês
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayCell = document.createElement('button');
            dayCell.type = 'button';
            dayCell.className = 'calendar-day p-2 rounded-lg text-sm transition-all';
            
            // Verificar se a data está disponível
            const isAvailable = availableDates.includes(dateStr);
            const isPast = date < today;
            const isToday = dateStr === today.toISOString().split('T')[0];
            
            if (isPast || !isAvailable) {
                dayCell.classList.add('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
                dayCell.disabled = true;
            } else {
                dayCell.classList.add('bg-white', 'text-gray-700', 'hover:bg-blue-100', 'hover:text-blue-700', 'border', 'border-gray-300');
                dayCell.addEventListener('click', () => selectDate(dateStr, dayCell));
            }
            
            if (isToday) {
                dayCell.classList.add('ring-2', 'ring-blue-500');
            }
            
            dayCell.textContent = day;
            calendarGrid.appendChild(dayCell);
        }
    }
    
    async function selectDate(dateStr, dayElement) {
        // Remover seleção anterior
        document.querySelectorAll('.calendar-day').forEach(el => {
            if (!el.disabled) {
                el.classList.remove('bg-blue-600', 'text-white');
                el.classList.add('bg-white', 'text-gray-700');
            }
        });
        
        // Marcar como selecionado
        dayElement.classList.remove('bg-white', 'text-gray-700', 'hover:bg-blue-100');
        dayElement.classList.add('bg-blue-600', 'text-white');
        
        // Atualizar campo oculto
        document.getElementById('modal-event-date').value = dateStr;
        document.getElementById('modal-event-date-hidden').value = dateStr;
        
        // Carregar horários disponíveis
        await loadAvailableTimes(dateStr);
    }
    
    async function loadAvailableTimes(dateStr) {
        const container = document.getElementById('available-times-container');
        const grid = document.getElementById('available-times-grid');
        const loadingEl = document.getElementById('times-loading');
        const errorEl = document.getElementById('times-error');
        
        container.classList.remove('hidden');
        grid.innerHTML = '';
        loadingEl.classList.remove('hidden');
        errorEl.classList.add('hidden');
        
        // Limpar seleção anterior
        document.getElementById('modal-event-time').value = '';
        
        try {
            const response = await fetch('../services/disponibilidade.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_available_times',
                    decorator_id: currentDecoratorId,
                    date: dateStr
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.available_times && result.available_times.length > 0) {
                result.available_times.forEach(time => {
                    const timeBtn = document.createElement('button');
                    timeBtn.type = 'button';
                    timeBtn.className = 'px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-blue-100 hover:text-blue-700 hover:border-blue-500 transition-all';
                    timeBtn.textContent = formatTime(time);
                    timeBtn.addEventListener('click', () => selectTime(time, timeBtn));
                    grid.appendChild(timeBtn);
                });
            } else {
                errorEl.textContent = 'Nenhum horário disponível para esta data';
                errorEl.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Erro ao carregar horários:', error);
            errorEl.textContent = 'Erro ao carregar horários disponíveis';
            errorEl.classList.remove('hidden');
        } finally {
            loadingEl.classList.add('hidden');
        }
    }
    
    function selectTime(timeStr, timeElement) {
        // Remover seleção anterior
        document.querySelectorAll('#available-times-grid button').forEach(btn => {
            btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
            btn.classList.add('bg-white', 'text-gray-700', 'border-gray-300');
        });
        
        // Marcar como selecionado
        timeElement.classList.remove('bg-white', 'text-gray-700', 'border-gray-300');
        timeElement.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
        
        // Atualizar campo oculto
        document.getElementById('modal-event-time').value = timeStr;
    }
    
    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        return `${hours}:${minutes}`;
    }
    
    // Configurar event listeners do calendário quando o DOM estiver pronto
    function setupCalendarListeners() {
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
                renderCalendar();
                loadAvailableDates();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
                renderCalendar();
                loadAvailableDates();
            });
        }
    }
    
    function closeConfirmModal() {
        // Salvar dados antes de fechar (para preservar na próxima abertura)
        saveFormData();
        
        confirmModal.classList.add('hidden');
        confirmModal.classList.remove('flex');
        document.body.style.overflow = 'auto';
        
        // Não resetar o formulário completamente - apenas limpar campos sensíveis
        // requestForm.reset(); // Comentado para preservar dados
        
        // Resetar apenas calendário e campos de data/hora
        document.getElementById('modal-event-date').value = '';
        document.getElementById('modal-event-date-hidden').value = '';
        document.getElementById('modal-event-time').value = '';
        
        // Resetar calendário
        currentCalendarDate = new Date();
        availableDates = [];
        currentDecoratorId = null;
        document.getElementById('available-times-container').classList.add('hidden');
        document.getElementById('calendar-error').classList.add('hidden');
    }
    
    function loadUserData() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const nameField = document.getElementById('modal-client-name');
            const emailField = document.getElementById('modal-client-email');
            const phoneField = document.getElementById('modal-client-phone');
            
            // Preencher apenas se o campo estiver vazio (preservar dados já preenchidos)
            if (userData.name && !nameField.value.trim()) {
                nameField.value = userData.name;
            }
            if (userData.email && !emailField.value.trim()) {
                emailField.value = userData.email;
            }
            if (userData.phone && !phoneField.value.trim()) {
                phoneField.value = userData.phone;
            }
        } catch (error) {
            console.warn('Erro ao carregar dados do usuário:', error);
        }
    }
    
    // Função para salvar dados do formulário no localStorage
    function saveFormData() {
        try {
            const formData = {
                client_name: document.getElementById('modal-client-name').value,
                client_email: document.getElementById('modal-client-email').value,
                client_phone: document.getElementById('modal-client-phone').value,
                event_location: document.getElementById('modal-event-location').value,
                service_type: document.getElementById('modal-service-type').value,
                tamanho_arco_m: document.getElementById('modal-arc-size').value,
                description: document.getElementById('modal-description').value,
                notes: document.getElementById('modal-notes').value,
                event_date: document.getElementById('modal-event-date').value,
                event_time: document.getElementById('modal-event-time').value
            };
            
            localStorage.setItem('upbaloes_confirm_form_data', JSON.stringify(formData));
        } catch (error) {
            console.warn('Erro ao salvar dados do formulário:', error);
        }
    }
    
    // Função para restaurar dados do formulário do localStorage
    function restoreFormData() {
        try {
            const savedData = localStorage.getItem('upbaloes_confirm_form_data');
            if (!savedData) return;
            
            const formData = JSON.parse(savedData);
            
            // Restaurar apenas campos que têm valor
            if (formData.client_name) {
                document.getElementById('modal-client-name').value = formData.client_name;
            }
            if (formData.client_email) {
                document.getElementById('modal-client-email').value = formData.client_email;
            }
            if (formData.client_phone) {
                document.getElementById('modal-client-phone').value = formData.client_phone;
            }
            if (formData.event_location) {
                document.getElementById('modal-event-location').value = formData.event_location;
            }
            if (formData.service_type) {
                document.getElementById('modal-service-type').value = formData.service_type;
            }
            if (formData.tamanho_arco_m) {
                document.getElementById('modal-arc-size').value = formData.tamanho_arco_m;
            }
            if (formData.description) {
                document.getElementById('modal-description').value = formData.description;
            }
            if (formData.notes) {
                document.getElementById('modal-notes').value = formData.notes;
            }
            // Data e hora serão restauradas quando o calendário for inicializado
        } catch (error) {
            console.warn('Erro ao restaurar dados do formulário:', error);
        }
    }
    
    // Configurar salvamento automático quando o usuário preencher os campos
    function setupFormAutoSave() {
        const fieldsToSave = [
            'modal-client-name',
            'modal-client-email',
            'modal-client-phone',
            'modal-event-location',
            'modal-service-type',
            'modal-arc-size',
            'modal-description',
            'modal-notes'
        ];
        
        fieldsToSave.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                // Remover listeners anteriores se existirem (usando uma flag)
                if (field.dataset.hasListener === 'true') {
                    return; // Já tem listener configurado
                }
                
                // Adicionar listeners
                field.addEventListener('input', saveFormData);
                field.addEventListener('change', saveFormData);
                field.dataset.hasListener = 'true';
            }
        });
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
                
                // Limpar carrinho e dados do formulário
                localStorage.removeItem(CART_STORAGE_KEY);
                localStorage.removeItem(QUOTES_STORAGE_KEY);
                localStorage.removeItem('upbaloes_confirm_form_data'); // Limpar dados salvos após envio bem-sucedido
                
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
        
        // Validar data selecionada
        const eventDate = document.getElementById('modal-event-date').value;
        if (!eventDate) {
            showNotification('Por favor, selecione uma data disponível', 'error');
            return false;
        }
        
        // Validar horário selecionado
        const eventTime = document.getElementById('modal-event-time').value;
        if (!eventTime) {
            showNotification('Por favor, selecione um horário disponível', 'error');
            return false;
        }
        
        // Validar tamanho do arco se o tipo de serviço requerer
        const serviceType = document.getElementById('modal-service-type').value;
        const arcSize = document.getElementById('modal-arc-size').value;
        
        if ((serviceType === 'arco-tradicional' || serviceType === 'arco-desconstruido') && !arcSize) {
            document.getElementById('modal-arc-size').classList.add('border-red-500');
            showNotification('Por favor, informe o tamanho do arco', 'error');
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
        setupCalendarListeners();
        
        console.log('Carrinho do Cliente - Sistema carregado com sucesso!');
    }
    
    init();
});

