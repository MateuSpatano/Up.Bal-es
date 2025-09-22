// JavaScript para o Dashboard do Decorador - Up.Baloes
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== ELEMENTOS DOM ==========
    
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const logoutBtn = document.getElementById('logout-btn');
    const navItems = document.querySelectorAll('.nav-item');
    const moduleContents = document.querySelectorAll('.module-content');
    const pageTitle = document.getElementById('page-title');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    
    // Modal de gerenciamento de conta
    const accountModal = document.getElementById('account-modal');
    const openAccountModal = document.getElementById('open-account-modal');
    const closeAccountModal = document.getElementById('close-account-modal');
    const cancelAccountChanges = document.getElementById('cancel-account-changes');
    const accountForm = document.getElementById('account-form');
    const saveAccountChanges = document.getElementById('save-account-changes');
    const accountModalOverlay = document.getElementById('account-modal-overlay');

    // Elementos do painel gerencial
    const floatingAddBtn = document.getElementById('floating-add-btn');
    const createBudgetModal = document.getElementById('create-budget-modal');
    const closeCreateBudgetModal = document.getElementById('close-create-budget-modal');
    const cancelCreateBudget = document.getElementById('cancel-create-budget');
    const createBudgetForm = document.getElementById('create-budget-form');
    const saveCreateBudget = document.getElementById('save-create-budget');
    const createBudgetModalOverlay = document.getElementById('create-budget-modal-overlay');

    // Modal de detalhes do orçamento
    const budgetDetailsModal = document.getElementById('budget-details-modal');
    const closeBudgetDetailsModal = document.getElementById('close-budget-details-modal');
    const budgetDetailsContent = document.getElementById('budget-details-content');
    const budgetDetailsModalOverlay = document.getElementById('budget-details-modal-overlay');

    // Elementos de visualização
    const viewListBtn = document.getElementById('view-list-btn');
    const viewCalendarBtn = document.getElementById('view-calendar-btn');
    const listView = document.getElementById('list-view');
    const calendarView = document.getElementById('calendar-view');
    const calendar = document.getElementById('calendar');

    // Contadores
    const totalCount = document.getElementById('total-count');

    // Container de orçamentos
    const allBudgets = document.getElementById('all-budgets');

    // ========== VARIÁVEIS DE ESTADO ==========
    
    let isSidebarOpen = false;
    let currentModule = 'dashboard';
    let budgets = [];
    let filteredBudgets = [];
    let currentFilters = {};
    let calendarInstance = null;
    let currentView = 'list';

    // ========== INICIALIZAÇÃO ==========
    
    // Carregar dados do usuário
    loadUserData();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar navegação
    setupNavigation();
    
    // Configurar modal de conta
    setupAccountModal();
    
    // Configurar modais de orçamento
    setupBudgetModals();
    
    // Configurar visualizações
    setupViewControls();
    
    // Mostrar módulo inicial
    showModule('painel-gerencial');

    // ========== FUNCIONALIDADES DO SIDEBAR ==========
    
    function setupEventListeners() {
        // Toggle do sidebar mobile
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleSidebar);
        }
        
        // Fechar sidebar mobile
        if (closeSidebar) {
            closeSidebar.addEventListener('click', closeSidebarMobile);
        }
        
        // Overlay do sidebar mobile
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', closeSidebarMobile);
        }
        
        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        // Fechar sidebar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isSidebarOpen) {
                closeSidebarMobile();
            }
        });
        
        // Redimensionar janela
        window.addEventListener('resize', handleResize);
    }
    
    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
        
        if (isSidebarOpen) {
            openSidebarMobile();
        } else {
            closeSidebarMobile();
        }
    }
    
    function openSidebarMobile() {
        if (sidebar) {
            sidebar.classList.add('show');
            sidebarOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            isSidebarOpen = true;
        }
    }
    
    function closeSidebarMobile() {
        if (sidebar) {
            sidebar.classList.remove('show');
            sidebarOverlay.classList.add('hidden');
            document.body.style.overflow = 'auto';
            isSidebarOpen = false;
        }
    }
    
    function handleResize() {
        // Fechar sidebar mobile em telas grandes
        if (window.innerWidth >= 1024 && isSidebarOpen) {
            closeSidebarMobile();
        }
    }

    // ========== NAVEGAÇÃO ENTRE MÓDULOS ==========
    
    function setupNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                const module = this.getAttribute('data-module');
                if (module) {
                    showModule(module);
                    updateActiveNavItem(this);
                    closeSidebarMobile();
                }
            });
        });
    }
    
    function showModule(moduleName) {
        // Ocultar todos os módulos
        moduleContents.forEach(module => {
            module.classList.add('hidden');
        });
        
        // Mostrar módulo selecionado
        const targetModule = document.getElementById(`${moduleName}-module`);
        if (targetModule) {
            targetModule.classList.remove('hidden');
            targetModule.classList.add('content-enter');
        }
        
        // Atualizar título da página
        updatePageTitle(moduleName);
        
        // Atualizar estado atual
        currentModule = moduleName;
        
        // Simular carregamento de dados do módulo
        loadModuleData(moduleName);
    }
    
    function updateActiveNavItem(activeItem) {
        // Remover classe active de todos os itens
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Adicionar classe active ao item selecionado
        activeItem.classList.add('active');
    }
    
    function updatePageTitle(moduleName) {
        const titles = {
            'painel-gerencial': 'Painel Gerencial',
            'portfolio': 'Portfólio',
            'agenda': 'Gerenciar Agenda',
            'dashboard': 'Dashboard',
            'account': 'Gerenciar Conta'
        };
        
        if (pageTitle && titles[moduleName]) {
            pageTitle.textContent = titles[moduleName];
        }
    }
    
    function loadModuleData(moduleName) {
        // Simular carregamento de dados específicos do módulo
        console.log(`Carregando dados do módulo: ${moduleName}`);
        
        // Aqui você pode implementar carregamento real de dados
        // Por exemplo, fazer requisições AJAX para o backend
        
        switch (moduleName) {
            case 'painel-gerencial':
                loadPainelGerencialData();
                break;
            case 'portfolio':
                loadPortfolioData();
                break;
            case 'agenda':
                loadAgendaData();
                break;
            case 'dashboard':
                loadDashboardData();
                break;
            case 'account':
                loadAccountData();
                break;
        }
    }

    // ========== CARREGAMENTO DE DADOS DOS MÓDULOS ==========
    
    function loadDashboardData() {
        // Simular carregamento de dados do dashboard
        console.log('Carregando dados do dashboard...');
        
        // Aqui você pode implementar carregamento real de estatísticas
        // Por exemplo, eventos do dia, receita mensal, etc.
    }
    
    function loadPainelGerencialData() {
        console.log('Carregando dados do painel gerencial...');
        
        // Configurar funcionalidades do painel gerencial
        setupPainelGerencialFeatures();
        
        // Carregar orçamentos
        loadBudgets();
    }
    
    function setupPainelGerencialFeatures() {
        // Botões de visualização
        const viewListBtn = document.getElementById('view-list-btn');
        const viewCalendarBtn = document.getElementById('view-calendar-btn');
        const listView = document.getElementById('list-view');
        const calendarView = document.getElementById('calendar-view');
        
        // Botão de lista
        if (viewListBtn) {
            viewListBtn.addEventListener('click', function() {
                // Ativar botão de lista
                viewListBtn.classList.remove('bg-gray-200', 'text-gray-700');
                viewListBtn.classList.add('bg-blue-600', 'text-white');
                
                // Desativar botão de calendário
                viewCalendarBtn.classList.remove('bg-blue-600', 'text-white');
                viewCalendarBtn.classList.add('bg-gray-200', 'text-gray-700');
                
                // Mostrar lista, ocultar calendário
                if (listView) listView.classList.remove('hidden');
                if (calendarView) calendarView.classList.add('hidden');
            });
        }
        
        // Botão de calendário
        if (viewCalendarBtn) {
            viewCalendarBtn.addEventListener('click', function() {
                // Ativar botão de calendário
                viewCalendarBtn.classList.remove('bg-gray-200', 'text-gray-700');
                viewCalendarBtn.classList.add('bg-blue-600', 'text-white');
                
                // Desativar botão de lista
                viewListBtn.classList.remove('bg-blue-600', 'text-white');
                viewListBtn.classList.add('bg-gray-200', 'text-gray-700');
                
                // Mostrar calendário, ocultar lista
                if (calendarView) calendarView.classList.remove('hidden');
                if (listView) listView.classList.add('hidden');
            });
        }
        
        // Filtros
        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', function() {
                applyFilters();
            });
        }
        
        // Botão de limpar filtros
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', function() {
                clearFilters();
            });
        }
        
        // Busca em tempo real por cliente
        const clientFilter = document.getElementById('client-filter');
        if (clientFilter) {
            let searchTimeout;
            clientFilter.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    applyFilters();
                }, 300); // Aguarda 300ms após parar de digitar
            });
        }
        
        // Botão de limpar filtros rápido
        const clearFiltersQuickBtn = document.getElementById('clear-filters-quick');
        if (clearFiltersQuickBtn) {
            clearFiltersQuickBtn.addEventListener('click', function() {
                clearFilters();
            });
        }
    }
    
    async function loadBudgets() {
        try {
            const response = await fetch('../services/budgets.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'list'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                budgets = result.budgets || [];
                updateBudgetsDisplay();
                console.log('Orçamentos carregados:', budgets);
            } else {
                showNotification('Erro ao carregar orçamentos: ' + result.message, 'error');
                // Usar dados de exemplo em caso de erro
                loadSampleBudgets();
            }
        } catch (error) {
            console.error('Erro ao carregar orçamentos:', error);
            showNotification('Erro de conexão. Usando dados de exemplo.', 'warning');
            // Usar dados de exemplo em caso de erro
            loadSampleBudgets();
        }
    }
    
    function loadSampleBudgets() {
        // Dados de exemplo para demonstração
        budgets = [
            {
                id: 1,
                client: 'Maria Silva',
                email: 'maria@email.com',
                phone: '(11) 99999-9999',
                event_date: '2024-12-15',
                event_time: '14:00',
                event_location: 'Rua das Flores, 123',
                service_type: 'arco-tradicional',
                description: 'Decoração de aniversário infantil com tema de super-heróis',
                estimated_value: 500.00,
                notes: 'Cliente prefere cores vibrantes',
                status: 'pendente',
                created_at: '2024-12-01T10:00:00Z'
            },
            {
                id: 2,
                client: 'João Santos',
                email: 'joao@email.com',
                phone: '(11) 88888-8888',
                event_date: '2024-12-20',
                event_time: '16:00',
                event_location: 'Salão de Festas Central',
                service_type: 'arco-desconstruido',
                description: 'Decoração de casamento com tema romântico',
                estimated_value: 1200.00,
                notes: 'Cerimônia ao ar livre',
                status: 'aprovado',
                created_at: '2024-11-28T14:30:00Z'
            },
            {
                id: 3,
                client: 'Ana Costa',
                email: 'ana@email.com',
                phone: '(11) 77777-7777',
                event_date: '2024-12-18',
                event_time: '19:00',
                event_location: 'Faculdade Central',
                service_type: 'escultura-balao',
                description: 'Decoração de formatura com tema acadêmico',
                estimated_value: 800.00,
                notes: 'Evento noturno, iluminação especial',
                status: 'recusado',
                created_at: '2024-11-30T09:15:00Z'
            },
            {
                id: 4,
                client: 'Carlos Oliveira',
                email: 'carlos@email.com',
                phone: '(11) 66666-6666',
                event_date: '2024-12-25',
                event_time: '20:00',
                event_location: 'Casa de Eventos',
                service_type: 'centro-mesa',
                description: 'Decoração natalina para festa de família',
                estimated_value: 300.00,
                notes: 'Cliente cancelou por mudança de planos',
                status: 'cancelado',
                created_at: '2024-11-25T16:45:00Z'
            },
            {
                id: 5,
                client: 'Patricia Santos',
                email: 'patricia@email.com',
                phone: '(11) 55555-5555',
                event_date: '2024-12-30',
                event_time: '15:00',
                event_location: 'Salão de Festas',
                service_type: 'baloes-piscina',
                description: 'Decoração para festa de Ano Novo',
                estimated_value: 600.00,
                notes: 'Festa temática dourada',
                status: 'aprovado',
                created_at: '2024-12-01T11:20:00Z'
            }
        ];
        
        updateBudgetsDisplay();
    }
    
    function applyFilters() {
        const statusFilter = document.getElementById('status-filter');
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        const clientFilter = document.getElementById('client-filter');
        
        const filters = {
            status: statusFilter ? statusFilter.value : '',
            dateFrom: dateFrom ? dateFrom.value : '',
            dateTo: dateTo ? dateTo.value : '',
            client: clientFilter ? clientFilter.value.toLowerCase().trim() : ''
        };
        
        console.log('Aplicando filtros:', filters);
        
        // Armazenar filtros atuais globalmente
        currentFilters = filters;
        
        // Destacar campos com filtros ativos
        highlightActiveFilters(filters);
        
        // Mostrar indicador de filtros ativos
        updateActiveFiltersIndicator(filters);
        
        // Filtrar orçamentos
        filteredBudgets = filterBudgets(budgets, filters);
        
        // Atualizar exibição
        updateFilteredBudgetsDisplay(filteredBudgets);
        
        // Atualizar calendário se estiver visível
        updateCalendarDisplay();
        
        // Se estiver na visualização de calendário, aplicar redirecionamento automático
        if (currentView === 'calendar') {
            setTimeout(() => {
                scrollToFilteredEvents();
            }, 500);
        }
        
        const message = filteredBudgets.length > 0 
            ? `Filtros aplicados! ${filteredBudgets.length} orçamento(s) encontrado(s).`
            : 'Nenhum orçamento encontrado com os filtros aplicados.';
        showNotification(message, filteredBudgets.length > 0 ? 'success' : 'warning');
    }
    
    function highlightActiveFilters(filters) {
        // Remover destaque de todos os campos
        const allFilterInputs = document.querySelectorAll('#status-filter, #date-from, #date-to, #client-filter');
        allFilterInputs.forEach(input => {
            input.classList.remove('filter-active');
        });
        
        // Destacar campos com valores
        if (filters.status && document.getElementById('status-filter')) {
            document.getElementById('status-filter').classList.add('filter-active');
        }
        if (filters.dateFrom && document.getElementById('date-from')) {
            document.getElementById('date-from').classList.add('filter-active');
        }
        if (filters.dateTo && document.getElementById('date-to')) {
            document.getElementById('date-to').classList.add('filter-active');
        }
        if (filters.client && document.getElementById('client-filter')) {
            document.getElementById('client-filter').classList.add('filter-active');
        }
    }
    
    function updateActiveFiltersIndicator(filters) {
        const indicator = document.getElementById('active-filters-indicator');
        const filtersText = document.getElementById('active-filters-text');
        
        if (!indicator || !filtersText) return;
        
        const activeFilters = [];
        
        if (filters.status) {
            const statusLabels = {
                'pendente': 'Pendentes',
                'aprovado': 'Aprovados',
                'recusado': 'Recusados',
                'cancelado': 'Cancelados',
                'enviado': 'Enviados'
            };
            activeFilters.push(`Status: ${statusLabels[filters.status] || filters.status}`);
        }
        
        if (filters.dateFrom || filters.dateTo) {
            let dateRange = '';
            if (filters.dateFrom && filters.dateTo) {
                dateRange = `Período: ${formatDateForDisplay(filters.dateFrom)} - ${formatDateForDisplay(filters.dateTo)}`;
            } else if (filters.dateFrom) {
                dateRange = `A partir de: ${formatDateForDisplay(filters.dateFrom)}`;
            } else if (filters.dateTo) {
                dateRange = `Até: ${formatDateForDisplay(filters.dateTo)}`;
            }
            activeFilters.push(dateRange);
        }
        
        if (filters.client) {
            activeFilters.push(`Cliente: "${filters.client}"`);
        }
        
        if (activeFilters.length > 0) {
            filtersText.textContent = activeFilters.join(' • ');
            indicator.classList.remove('hidden');
        } else {
            indicator.classList.add('hidden');
        }
    }
    
    function formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    function filterBudgets(budgetsList, filters) {
        return budgetsList.filter(budget => {
            // Filtro por status
            if (filters.status && budget.status !== filters.status) {
                return false;
            }
            
            // Filtro por período (data do evento)
            if (filters.dateFrom || filters.dateTo) {
                const eventDate = new Date(budget.event_date);
                const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
                const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
                
                if (fromDate && eventDate < fromDate) {
                    return false;
                }
                
                if (toDate && eventDate > toDate) {
                    return false;
                }
            }
            
            // Filtro por nome do cliente
            if (filters.client && !budget.client.toLowerCase().includes(filters.client)) {
                return false;
            }
            
            return true;
        });
    }
    
    function updateFilteredBudgetsDisplay(filteredBudgets) {
        // Atualizar contador
        if (totalCount) {
            totalCount.textContent = filteredBudgets.length;
        }
        
        // Renderizar orçamentos filtrados
        renderAllBudgets(filteredBudgets, allBudgets);
    }
    
    function updateCalendarDisplay() {
        // Atualizar calendário se estiver visível
        if (calendarInstance && currentView === 'calendar') {
            calendarInstance.removeAllEvents();
            const events = getCalendarEvents();
            calendarInstance.addEventSource(events);
            
            // Mostrar mensagem se não há eventos devido aos filtros
            if (events.length === 0 && Object.keys(currentFilters).length > 0 && Object.values(currentFilters).some(value => value !== '')) {
                showCalendarNoEventsMessage();
            } else {
                hideCalendarNoEventsMessage();
            }
            
            // Reaplicar estilos após atualização
            setTimeout(() => {
                applyCalendarStyles();
                // Implementar redirecionamento automático para eventos filtrados
                scrollToFilteredEvents();
            }, 100);
        }
    }
    
    function showCalendarNoEventsMessage() {
        // Remover mensagem existente se houver
        hideCalendarNoEventsMessage();
        
        // Criar mensagem
        const messageDiv = document.createElement('div');
        messageDiv.id = 'calendar-no-events-message';
        messageDiv.className = 'absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10';
        messageDiv.innerHTML = `
            <div class="text-center p-6">
                <i class="fas fa-filter text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-600 mb-2">Nenhum evento encontrado</h3>
                <p class="text-gray-500 mb-4">Os filtros aplicados não retornaram nenhum evento para exibir.</p>
                <button onclick="clearFilters()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-times mr-2"></i>Limpar Filtros
                </button>
            </div>
        `;
        
        // Adicionar mensagem ao calendário
        const calendarContainer = document.getElementById('calendar');
        if (calendarContainer) {
            calendarContainer.style.position = 'relative';
            calendarContainer.appendChild(messageDiv);
        }
    }
    
    function hideCalendarNoEventsMessage() {
        const messageDiv = document.getElementById('calendar-no-events-message');
        if (messageDiv) {
            messageDiv.remove();
        }
    }
    
    function scrollToFilteredEvents() {
        // Verificar se há filtros ativos
        const hasActiveFilters = Object.keys(currentFilters).length > 0 && 
                                Object.values(currentFilters).some(value => value !== '');
        
        if (!hasActiveFilters || !calendarInstance) {
            return;
        }
        
        const events = getCalendarEvents();
        if (events.length === 0) {
            return;
        }
        
        let targetEvent = null;
        
        // Estratégia diferente baseada no tipo de filtro
        if (currentFilters.dateFrom || currentFilters.dateTo) {
            // Para filtros de data, usar a data mais próxima do período filtrado
            const today = new Date();
            let closestEvent = null;
            let closestDistance = Infinity;
            
            events.forEach(event => {
                const eventDate = new Date(event.start);
                const distance = Math.abs(eventDate - today);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEvent = event;
                }
            });
            targetEvent = closestEvent;
        } else if (currentFilters.client) {
            // Para filtro de cliente, usar o primeiro evento encontrado
            targetEvent = events[0];
        } else if (currentFilters.status) {
            // Para filtro de status, usar o primeiro evento encontrado
            targetEvent = events[0];
        } else {
            // Fallback: usar o evento mais próximo da data atual
            const today = new Date();
            let closestEvent = null;
            let closestDistance = Infinity;
            
            events.forEach(event => {
                const eventDate = new Date(event.start);
                const distance = Math.abs(eventDate - today);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEvent = event;
                }
            });
            targetEvent = closestEvent;
        }
        
        if (targetEvent) {
            // Navegar para a data do evento
            calendarInstance.gotoDate(targetEvent.start);
            
            // Destacar o evento após um pequeno delay para garantir que foi renderizado
            setTimeout(() => {
                highlightFilteredEvent(targetEvent.id);
            }, 300);
        }
    }
    
    function highlightFilteredEvent(eventId) {
        // Remover destaque anterior se existir
        removeEventHighlights();
        
        // Aguardar um pouco para garantir que o evento foi renderizado
        setTimeout(() => {
            // Encontrar o elemento do evento no DOM usando diferentes seletores
            let eventElement = null;
            
            // Tentar encontrar por data-event-id
            eventElement = document.querySelector(`[data-event-id="${eventId}"]`);
            
            // Se não encontrou, tentar encontrar pelo título do evento
            if (!eventElement) {
                const events = getCalendarEvents();
                const targetEvent = events.find(e => e.id === eventId);
                if (targetEvent) {
                    const fcEvents = document.querySelectorAll('.fc-event');
                    fcEvents.forEach(fcEvent => {
                        const eventTitle = fcEvent.querySelector('.fc-event-title');
                        if (eventTitle && eventTitle.textContent.includes(targetEvent.title.split(' - ')[0])) {
                            eventElement = fcEvent;
                        }
                    });
                }
            }
            
            // Se ainda não encontrou, tentar encontrar qualquer evento FC próximo
            if (!eventElement) {
                const fcEvents = document.querySelectorAll('.fc-event');
                if (fcEvents.length > 0) {
                    // Usar o primeiro evento como fallback
                    eventElement = fcEvents[0];
                }
            }
            
            if (eventElement) {
                // Aplicar destaque visual
                eventElement.classList.add('filtered-event-highlight');
                
                // Adicionar animação de pulso
                eventElement.style.animation = 'pulseHighlight 2s ease-in-out 3';
                
                // Scroll suave para o evento se necessário
                eventElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',
                    inline: 'center'
                });
                
                // Remover o destaque após a animação
                setTimeout(() => {
                    eventElement.classList.remove('filtered-event-highlight');
                    eventElement.style.animation = '';
                }, 6000); // 3 repetições de 2s cada
            }
        }, 100);
    }
    
    function removeEventHighlights() {
        const highlightedEvents = document.querySelectorAll('.filtered-event-highlight');
        highlightedEvents.forEach(event => {
            event.classList.remove('filtered-event-highlight');
            event.style.animation = '';
        });
    }
    
    function clearFilters() {
        // Limpar campos de filtro
        const statusFilter = document.getElementById('status-filter');
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        const clientFilter = document.getElementById('client-filter');
        
        if (statusFilter) statusFilter.value = '';
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        if (clientFilter) clientFilter.value = '';
        
        // Limpar filtros globais
        currentFilters = {};
        filteredBudgets = [];
        
        // Remover destaques visuais dos campos de filtro
        const allFilterInputs = document.querySelectorAll('#status-filter, #date-from, #date-to, #client-filter');
        allFilterInputs.forEach(input => {
            input.classList.remove('filter-active');
        });
        
        // Remover destaques dos eventos no calendário
        removeEventHighlights();
        
        // Esconder indicador de filtros ativos
        const indicator = document.getElementById('active-filters-indicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
        
        // Mostrar todos os orçamentos
        updateBudgetsDisplay();
        
        // Esconder mensagem do calendário
        hideCalendarNoEventsMessage();
        
        // Atualizar calendário se estiver visível
        updateCalendarDisplay();
        
        showNotification('Filtros limpos!', 'info');
    }
    
    function loadPortfolioData() {
        // Simular carregamento de dados do portfólio
        console.log('Carregando dados do portfólio...');
        
        // Aqui você pode implementar carregamento de projetos
        // Por exemplo, fotos, descrições, etc.
    }
    
    function loadAgendaData() {
        // Simular carregamento de dados da agenda
        console.log('Carregando dados da agenda...');
        
        // Aqui você pode implementar carregamento de eventos
        // Por exemplo, compromissos, entregas, etc.
    }
    
    function loadAccountData() {
        // Simular carregamento de dados da conta
        console.log('Carregando dados da conta...');
        
        // Aqui você pode implementar carregamento de dados do usuário
        // Por exemplo, informações pessoais, configurações, etc.
    }

    // ========== DADOS DO USUÁRIO ==========
    
    function loadUserData() {
        // Tentar carregar dados do localStorage
        let userData = null;
        try {
            const storedData = localStorage.getItem('userData');
            if (storedData) {
                userData = JSON.parse(storedData);
            }
        } catch (e) {
            console.warn('Erro ao carregar dados do localStorage:', e);
        }
        
        // Se não houver dados salvos, usar dados padrão
        if (!userData) {
            userData = {
                name: 'João Silva',
                email: 'joao@decorador.com',
                phone: '(11) 99999-9999',
                address: 'Rua das Flores, 123',
                city: 'São Paulo',
                state: 'SP',
                zipcode: '01234-567'
            };
        }
        
        // Atualizar interface
        updateUserInterface(userData);
    }
    
    function updateUserInterface(userData) {
        if (userName && userData.name) {
            userName.textContent = userData.name;
        }
        
        if (userEmail && userData.email) {
            userEmail.textContent = userData.email;
        }
        
        // Salvar dados no localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    // ========== MODAL DE GERENCIAMENTO DE CONTA ==========
    
    function setupAccountModal() {
        // Abrir modal
        if (openAccountModal) {
            openAccountModal.addEventListener('click', function(e) {
                e.preventDefault();
                openAccountModalFunc();
            });
        }
        
        // Fechar modal
        if (closeAccountModal) {
            closeAccountModal.addEventListener('click', closeAccountModalFunc);
        }
        
        if (cancelAccountChanges) {
            cancelAccountChanges.addEventListener('click', closeAccountModalFunc);
        }
        
        if (accountModalOverlay) {
            accountModalOverlay.addEventListener('click', closeAccountModalFunc);
        }
        
        // Fechar modal com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && accountModal && accountModal.classList.contains('show')) {
                closeAccountModalFunc();
            }
        });
        
        // Submissão do formulário
        if (accountForm) {
            accountForm.addEventListener('submit', handleAccountFormSubmit);
        }
    }
    
    function openAccountModalFunc() {
        if (accountModal) {
            accountModal.classList.remove('hidden');
            accountModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Carregar dados do usuário no formulário
            loadUserDataIntoForm();
            
            // Focar no primeiro campo
            setTimeout(() => {
                const firstInput = accountForm.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 300);
        }
    }
    
    function closeAccountModalFunc() {
        if (accountModal) {
            accountModal.classList.add('hidden');
            accountModal.classList.remove('show');
            document.body.style.overflow = 'auto';
            
            // Limpar formulário
            if (accountForm) {
                accountForm.reset();
            }
        }
    }
    
    function loadUserDataIntoForm() {
        // Carregar dados do localStorage
        let userData = null;
        try {
            const storedData = localStorage.getItem('userData');
            if (storedData) {
                userData = JSON.parse(storedData);
            }
        } catch (e) {
            console.warn('Erro ao carregar dados do localStorage:', e);
        }
        
        if (userData) {
            // Preencher campos
            const fields = {
                'account-name': userData.name || '',
                'account-email': userData.email || '',
                'account-phone': userData.phone || '',
                'account-address': userData.address || '',
                'account-city': userData.city || '',
                'account-state': userData.state || '',
                'account-zipcode': userData.zipcode || ''
            };
            
            Object.entries(fields).forEach(([fieldId, value]) => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.value = value;
                }
            });
        }
    }
    
    async function handleAccountFormSubmit(e) {
        e.preventDefault();
        
        // Validar formulário
        if (!validateAccountForm()) {
            return;
        }
        
        // Mostrar loading
        if (saveAccountChanges) {
            saveAccountChanges.classList.add('btn-loading');
            saveAccountChanges.disabled = true;
        }
        
        try {
            // Simular envio para o backend
            await saveAccountData();
            
            showNotification('Dados atualizados com sucesso!', 'success');
            closeAccountModalFunc();
            
        } catch (error) {
            showNotification('Erro ao salvar dados. Tente novamente.', 'error');
            console.error('Erro ao salvar dados:', error);
        } finally {
            // Remover loading
            if (saveAccountChanges) {
                saveAccountChanges.classList.remove('btn-loading');
                saveAccountChanges.disabled = false;
            }
        }
    }
    
    function validateAccountForm() {
        // Validação básica
        const name = document.getElementById('account-name');
        const email = document.getElementById('account-email');
        
        if (!name || !name.value.trim()) {
            showNotification('Nome é obrigatório', 'error');
            return false;
        }
        
        if (!email || !email.value.trim()) {
            showNotification('Email é obrigatório', 'error');
            return false;
        }
        
        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            showNotification('Email inválido', 'error');
            return false;
        }
        
        return true;
    }
    
    async function saveAccountData() {
        const formData = new FormData(accountForm);
        
        try {
            const response = await fetch('../services/account.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Erro ao salvar dados');
            }
            
            if (!result.success) {
                throw new Error(result.message || 'Erro ao salvar dados');
            }
            
            // Atualizar dados do usuário na interface
            if (result.data) {
                updateUserInterface(result.data);
            }
            
            return result;
            
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            throw error;
        }
    }

    // ========== CONFIGURAÇÃO DOS MODAIS DE ORÇAMENTO ==========
    
    function setupBudgetModals() {
        // Botão flutuante de +
        if (floatingAddBtn) {
            floatingAddBtn.addEventListener('click', openCreateBudgetModal);
        }
        
        // Modal de criação de orçamento
        if (closeCreateBudgetModal) {
            closeCreateBudgetModal.addEventListener('click', closeCreateBudgetModalFunc);
        }
        
        if (cancelCreateBudget) {
            cancelCreateBudget.addEventListener('click', closeCreateBudgetModalFunc);
        }
        
        if (createBudgetModalOverlay) {
            createBudgetModalOverlay.addEventListener('click', closeCreateBudgetModalFunc);
        }
        
        // Submissão do formulário de criação
        if (createBudgetForm) {
            createBudgetForm.addEventListener('submit', handleCreateBudgetSubmit);
        }
        
        // Modal de detalhes do orçamento
        if (closeBudgetDetailsModal) {
            closeBudgetDetailsModal.addEventListener('click', closeBudgetDetailsModalFunc);
        }
        
        if (budgetDetailsModalOverlay) {
            budgetDetailsModalOverlay.addEventListener('click', closeBudgetDetailsModalFunc);
        }
        
        // Fechar modais com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (createBudgetModal && createBudgetModal.classList.contains('show')) {
                    closeCreateBudgetModalFunc();
                }
                if (budgetDetailsModal && budgetDetailsModal.classList.contains('show')) {
                    closeBudgetDetailsModalFunc();
                }
            }
        });
    }
    
    function openCreateBudgetModal() {
        if (createBudgetModal) {
            createBudgetModal.classList.remove('hidden');
            createBudgetModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focar no primeiro campo
            setTimeout(() => {
                const firstInput = createBudgetForm.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 300);
        }
    }
    
    function closeCreateBudgetModalFunc() {
        if (createBudgetModal) {
            createBudgetModal.classList.add('hidden');
            createBudgetModal.classList.remove('show');
            document.body.style.overflow = 'auto';
            
            // Limpar formulário
            if (createBudgetForm) {
                createBudgetForm.reset();
            }
        }
    }
    
    function closeBudgetDetailsModalFunc() {
        if (budgetDetailsModal) {
            budgetDetailsModal.classList.add('hidden');
            budgetDetailsModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }
    
    async function handleCreateBudgetSubmit(e) {
        e.preventDefault();
        
        // Validar formulário
        if (!validateCreateBudgetForm()) {
            return;
        }
        
        // Mostrar loading
        if (saveCreateBudget) {
            saveCreateBudget.classList.add('btn-loading');
            saveCreateBudget.disabled = true;
        }
        
        try {
            const formData = new FormData(createBudgetForm);
            const budgetData = Object.fromEntries(formData.entries());
            
            // Converter valor estimado para número
            budgetData.estimated_value = parseFloat(budgetData.estimated_value) || 0;
            
            // Enviar para o servidor
            const response = await fetch('../services/budgets.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'create',
                    ...budgetData
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Orçamento criado com sucesso!', 'success');
                closeCreateBudgetModalFunc();
                
                // Recarregar orçamentos
                await loadBudgets();
            } else {
                showNotification('Erro ao criar orçamento: ' + result.message, 'error');
            }
            
        } catch (error) {
            showNotification('Erro de conexão. Tente novamente.', 'error');
            console.error('Erro ao criar orçamento:', error);
        } finally {
            // Remover loading
            if (saveCreateBudget) {
                saveCreateBudget.classList.remove('btn-loading');
                saveCreateBudget.disabled = false;
            }
        }
    }
    
    function validateCreateBudgetForm() {
        const client = document.getElementById('budget-client');
        const email = document.getElementById('budget-email');
        const eventDate = document.getElementById('budget-event-date');
        const eventTime = document.getElementById('budget-event-time');
        const eventLocation = document.getElementById('budget-event-location');
        const serviceType = document.getElementById('budget-service-type');
        
        if (!client || !client.value.trim()) {
            showNotification('Nome do cliente é obrigatório', 'error');
            return false;
        }
        
        if (!email || !email.value.trim()) {
            showNotification('Email é obrigatório', 'error');
            return false;
        }
        
        if (!eventDate || !eventDate.value) {
            showNotification('Data do evento é obrigatória', 'error');
            return false;
        }
        
        if (!eventTime || !eventTime.value) {
            showNotification('Hora do evento é obrigatória', 'error');
            return false;
        }
        
        if (!eventLocation || !eventLocation.value.trim()) {
            showNotification('Local do evento é obrigatório', 'error');
            return false;
        }
        
        if (!eventType || !eventType.value) {
            showNotification('Tipo de serviço é obrigatório', 'error');
            return false;
        }
        
        // Validar data não pode ser no passado
        const eventDateTime = new Date(eventDate.value + 'T' + eventTime.value);
        if (eventDateTime < new Date()) {
            showNotification('Data do evento não pode ser no passado', 'error');
            return false;
        }
        
        return true;
    }

    // ========== MODAL DE EDIÇÃO DE ORÇAMENTO ==========
    
    function openEditBudgetModal(budget) {
        // Criar modal de edição se não existir
        if (!document.getElementById('edit-budget-modal')) {
            createEditBudgetModal();
        }
        
        const editModal = document.getElementById('edit-budget-modal');
        const editForm = document.getElementById('edit-budget-form');
        
        if (editModal && editForm) {
            // Preencher formulário com dados do orçamento
            fillEditForm(budget);
            
            // Mostrar modal
            editModal.classList.remove('hidden');
            editModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focar no primeiro campo
            setTimeout(() => {
                const firstInput = editForm.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 300);
        }
    }
    
    function createEditBudgetModal() {
        const modalHTML = `
            <div id="edit-budget-modal" class="fixed inset-0 z-50 hidden overflow-y-auto">
                <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <!-- Overlay -->
                    <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" id="edit-budget-modal-overlay"></div>

                    <!-- Modal Content -->
                    <div class="inline-block w-full max-w-4xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                        <!-- Header -->
                        <div class="bg-gradient-to-r from-yellow-600 to-orange-700 px-6 py-4">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                        <i class="fas fa-edit text-white text-lg"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-xl font-semibold text-white">Editar Orçamento</h3>
                                        <p class="text-yellow-100 text-sm">Atualize os dados do orçamento</p>
                                    </div>
                                </div>
                                <button id="close-edit-budget-modal" class="text-white hover:text-gray-200 transition-colors duration-200">
                                    <i class="fas fa-times text-xl"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Form -->
                        <form id="edit-budget-form" class="p-6 space-y-6">
                            <input type="hidden" id="edit-budget-id" name="id">
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Cliente -->
                                <div class="space-y-2">
                                    <label for="edit-budget-client" class="block text-sm font-medium text-gray-700">
                                        <i class="fas fa-user mr-2 text-yellow-600"></i>Cliente
                                    </label>
                                    <input type="text" id="edit-budget-client" name="client" required
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                                           placeholder="Nome do cliente">
                                </div>

                                <!-- Email do Cliente -->
                                <div class="space-y-2">
                                    <label for="edit-budget-email" class="block text-sm font-medium text-gray-700">
                                        <i class="fas fa-envelope mr-2 text-yellow-600"></i>Email
                                    </label>
                                    <input type="email" id="edit-budget-email" name="email" required
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                                           placeholder="email@cliente.com">
                                </div>

                                <!-- Telefone -->
                                <div class="space-y-2">
                                    <label for="edit-budget-phone" class="block text-sm font-medium text-gray-700">
                                        <i class="fas fa-phone mr-2 text-yellow-600"></i>Telefone
                                    </label>
                                    <input type="tel" id="edit-budget-phone" name="phone"
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                                           placeholder="(11) 99999-9999">
                                </div>

                                <!-- Data do Evento -->
                                <div class="space-y-2">
                                    <label for="edit-budget-event-date" class="block text-sm font-medium text-gray-700">
                                        <i class="fas fa-calendar mr-2 text-yellow-600"></i>Data do Evento
                                    </label>
                                    <input type="date" id="edit-budget-event-date" name="event_date" required
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200">
                                </div>

                                <!-- Hora do Evento -->
                                <div class="space-y-2">
                                    <label for="edit-budget-event-time" class="block text-sm font-medium text-gray-700">
                                        <i class="fas fa-clock mr-2 text-yellow-600"></i>Hora do Evento
                                    </label>
                                    <input type="time" id="edit-budget-event-time" name="event_time" required
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200">
                                </div>

                                <!-- Local do Evento -->
                                <div class="space-y-2">
                                    <label for="edit-budget-event-location" class="block text-sm font-medium text-gray-700">
                                        <i class="fas fa-map-marker-alt mr-2 text-yellow-600"></i>Local do Evento
                                    </label>
                                    <input type="text" id="edit-budget-event-location" name="event_location" required
                                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                                           placeholder="Endereço do evento">
                                </div>
                            </div>

                            <!-- Tipo de Serviço -->
                            <div class="space-y-2">
                                <label for="edit-budget-service-type" class="block text-sm font-medium text-gray-700">
                                    <i class="fas fa-gift mr-2 text-yellow-600"></i>Tipo de Serviço
                                </label>
                                <select id="edit-budget-service-type" name="service_type" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200">
                                    <option value="">Selecione o tipo de serviço</option>
                                    <option value="arco-tradicional">Arco-Tradicional</option>
                                    <option value="arco-desconstruido">Arco-Desconstruído</option>
                                    <option value="escultura-balao">Escultura de Balão</option>
                                    <option value="centro-mesa">Centro de Mesa</option>
                                    <option value="baloes-piscina">Balões na Piscina</option>
                                </select>
                            </div>

                            <!-- Descrição do Evento -->
                            <div class="space-y-2">
                                <label for="edit-budget-description" class="block text-sm font-medium text-gray-700">
                                    <i class="fas fa-align-left mr-2 text-yellow-600"></i>Descrição do Evento
                                </label>
                                <textarea id="edit-budget-description" name="description" rows="4"
                                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none"
                                          placeholder="Descreva os detalhes do evento e decoração desejada"></textarea>
                            </div>

                            <!-- Valor Estimado -->
                            <div class="space-y-2">
                                <label for="edit-budget-estimated-value" class="block text-sm font-medium text-gray-700">
                                    <i class="fas fa-dollar-sign mr-2 text-yellow-600"></i>Valor Estimado
                                </label>
                                <input type="number" id="edit-budget-estimated-value" name="estimated_value" step="0.01" min="0"
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                                       placeholder="0.00">
                            </div>

                            <!-- Observações -->
                            <div class="space-y-2">
                                <label for="edit-budget-notes" class="block text-sm font-medium text-gray-700">
                                    <i class="fas fa-sticky-note mr-2 text-yellow-600"></i>Observações
                                </label>
                                <textarea id="edit-budget-notes" name="notes" rows="3"
                                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none"
                                          placeholder="Observações adicionais"></textarea>
                            </div>

                            <!-- Botões -->
                            <div class="flex flex-col sm:flex-row gap-3 pt-4">
                                <button type="button" id="cancel-edit-budget" 
                                        class="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200">
                                    <i class="fas fa-times mr-2"></i>Cancelar
                                </button>
                                <button type="submit" id="save-edit-budget"
                                        class="flex-1 px-6 py-3 text-white bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                                    <i class="fas fa-save mr-2"></i>Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Inserir modal no DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Configurar event listeners
        setupEditBudgetModalEvents();
    }
    
    function setupEditBudgetModalEvents() {
        const editModal = document.getElementById('edit-budget-modal');
        const closeEditModal = document.getElementById('close-edit-budget-modal');
        const cancelEditBudget = document.getElementById('cancel-edit-budget');
        const editForm = document.getElementById('edit-budget-form');
        const saveEditBudget = document.getElementById('save-edit-budget');
        const editModalOverlay = document.getElementById('edit-budget-modal-overlay');
        
        // Fechar modal
        if (closeEditModal) {
            closeEditModal.addEventListener('click', closeEditBudgetModalFunc);
        }
        
        if (cancelEditBudget) {
            cancelEditBudget.addEventListener('click', closeEditBudgetModalFunc);
        }
        
        if (editModalOverlay) {
            editModalOverlay.addEventListener('click', closeEditBudgetModalFunc);
        }
        
        // Submissão do formulário
        if (editForm) {
            editForm.addEventListener('submit', handleEditBudgetSubmit);
        }
        
        // Fechar modal com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && editModal && editModal.classList.contains('show')) {
                closeEditBudgetModalFunc();
            }
        });
    }
    
    function closeEditBudgetModalFunc() {
        const editModal = document.getElementById('edit-budget-modal');
        const saveEditBudget = document.getElementById('save-edit-budget');
        
        if (editModal) {
            editModal.classList.add('hidden');
            editModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
        
        // Resetar estado do botão ao fechar o modal
        if (saveEditBudget) {
            saveEditBudget.disabled = true;
            saveEditBudget.classList.add('opacity-50', 'cursor-not-allowed');
            saveEditBudget.classList.remove('opacity-100', 'cursor-pointer');
        }
        
        // Limpar valores originais
        window.originalEditValues = null;
    }
    
    function fillEditForm(budget) {
        // Preencher campos do formulário
        const fields = {
            'edit-budget-id': budget.id,
            'edit-budget-client': budget.client,
            'edit-budget-email': budget.email,
            'edit-budget-phone': budget.phone || '',
            'edit-budget-event-date': budget.event_date,
            'edit-budget-event-time': budget.event_time,
            'edit-budget-event-location': budget.event_location,
            'edit-budget-service-type': budget.service_type,
            'edit-budget-description': budget.description || '',
            'edit-budget-estimated-value': budget.estimated_value || 0,
            'edit-budget-notes': budget.notes || ''
        };
        
        // Armazenar valores originais para comparação
        window.originalEditValues = { ...fields };
        
        Object.entries(fields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = value;
            }
        });
        
        // Configurar detecção de mudanças
        setupEditFormChangeDetection();
    }
    
    function setupEditFormChangeDetection() {
        const editForm = document.getElementById('edit-budget-form');
        const saveEditBudget = document.getElementById('save-edit-budget');
        
        if (!editForm || !saveEditBudget) return;
        
        // Inicialmente desabilitar o botão
        saveEditBudget.disabled = true;
        saveEditBudget.classList.add('opacity-50', 'cursor-not-allowed');
        
        // Adicionar event listeners para todos os campos do formulário
        const formFields = editForm.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            field.addEventListener('input', checkForChanges);
            field.addEventListener('change', checkForChanges);
        });
    }
    
    function checkForChanges() {
        const saveEditBudget = document.getElementById('save-edit-budget');
        if (!saveEditBudget || !window.originalEditValues) return;
        
        const editForm = document.getElementById('edit-budget-form');
        const currentValues = {};
        
        // Coletar valores atuais
        const fields = {
            'edit-budget-client': 'client',
            'edit-budget-email': 'email',
            'edit-budget-phone': 'phone',
            'edit-budget-event-date': 'event_date',
            'edit-budget-event-time': 'event_time',
            'edit-budget-event-location': 'event_location',
            'edit-budget-service-type': 'service_type',
            'edit-budget-description': 'description',
            'edit-budget-estimated-value': 'estimated_value',
            'edit-budget-notes': 'notes'
        };
        
        Object.entries(fields).forEach(([fieldId, key]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                currentValues[fieldId] = field.value || '';
            }
        });
        
        // Comparar valores atuais com os originais
        let hasChanges = false;
        Object.keys(window.originalEditValues).forEach(key => {
            if (key !== 'edit-budget-id' && currentValues[key] !== window.originalEditValues[key]) {
                hasChanges = true;
            }
        });
        
        // Habilitar/desabilitar botão baseado nas mudanças
        if (hasChanges) {
            saveEditBudget.disabled = false;
            saveEditBudget.classList.remove('opacity-50', 'cursor-not-allowed');
            saveEditBudget.classList.add('opacity-100', 'cursor-pointer');
        } else {
            saveEditBudget.disabled = true;
            saveEditBudget.classList.add('opacity-50', 'cursor-not-allowed');
            saveEditBudget.classList.remove('opacity-100', 'cursor-pointer');
        }
    }
    
    async function handleEditBudgetSubmit(e) {
        e.preventDefault();
        
        // Validar formulário
        if (!validateEditBudgetForm()) {
            return;
        }
        
        // Mostrar loading
        const saveEditBudget = document.getElementById('save-edit-budget');
        if (saveEditBudget) {
            saveEditBudget.classList.add('btn-loading');
            saveEditBudget.disabled = true;
        }
        
        try {
            const formData = new FormData(e.target);
            const budgetData = Object.fromEntries(formData.entries());
            const budgetId = budgetData.id;
            
            // Converter valor estimado para número
            budgetData.estimated_value = parseFloat(budgetData.estimated_value) || 0;
            
            // Remover ID dos dados de atualização
            delete budgetData.id;
            
            // Enviar para o servidor
            const response = await fetch('../services/budgets.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'update',
                    id: budgetId,
                    ...budgetData
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Orçamento atualizado com sucesso!', 'success');
                
                // Resetar estado do botão após salvamento bem-sucedido
                if (saveEditBudget) {
                    saveEditBudget.disabled = true;
                    saveEditBudget.classList.add('opacity-50', 'cursor-not-allowed');
                    saveEditBudget.classList.remove('opacity-100', 'cursor-pointer');
                }
                
                // Limpar valores originais
                window.originalEditValues = null;
                
                closeEditBudgetModalFunc();
                
                // Recarregar orçamentos
                await loadBudgets();
            } else {
                showNotification('Erro ao atualizar orçamento: ' + result.message, 'error');
            }
            
        } catch (error) {
            showNotification('Erro de conexão. Tente novamente.', 'error');
            console.error('Erro ao atualizar orçamento:', error);
        } finally {
            // Remover loading
            if (saveEditBudget) {
                saveEditBudget.classList.remove('btn-loading');
                // Só reabilitar se não foi salvo com sucesso
                if (saveEditBudget.disabled) {
                    saveEditBudget.disabled = false;
                }
            }
        }
    }
    
    function validateEditBudgetForm() {
        const client = document.getElementById('edit-budget-client');
        const email = document.getElementById('edit-budget-email');
        const eventDate = document.getElementById('edit-budget-event-date');
        const eventTime = document.getElementById('edit-budget-event-time');
        const eventLocation = document.getElementById('edit-budget-event-location');
        const serviceType = document.getElementById('edit-budget-service-type');
        
        if (!client || !client.value.trim()) {
            showNotification('Nome do cliente é obrigatório', 'error');
            return false;
        }
        
        if (!email || !email.value.trim()) {
            showNotification('Email é obrigatório', 'error');
            return false;
        }
        
        if (!eventDate || !eventDate.value) {
            showNotification('Data do evento é obrigatória', 'error');
            return false;
        }
        
        if (!eventTime || !eventTime.value) {
            showNotification('Hora do evento é obrigatória', 'error');
            return false;
        }
        
        if (!eventLocation || !eventLocation.value.trim()) {
            showNotification('Local do evento é obrigatório', 'error');
            return false;
        }
        
        if (!eventType || !eventType.value) {
            showNotification('Tipo de serviço é obrigatório', 'error');
            return false;
        }
        
        // Validar data não pode ser no passado
        const eventDateTime = new Date(eventDate.value + 'T' + eventTime.value);
        if (eventDateTime < new Date()) {
            showNotification('Data do evento não pode ser no passado', 'error');
            return false;
        }
        
        return true;
    }

    // ========== CONFIGURAÇÃO DAS VISUALIZAÇÕES ==========
    
    function setupViewControls() {
        // Botão de lista
        if (viewListBtn) {
            viewListBtn.addEventListener('click', function() {
                switchToView('list');
            });
        }
        
        // Botão de calendário
        if (viewCalendarBtn) {
            viewCalendarBtn.addEventListener('click', function() {
                switchToView('calendar');
            });
        }
    }
    
    function switchToView(view) {
        currentView = view;
        
        if (view === 'list') {
            // Ativar botão de lista
            viewListBtn.classList.remove('bg-gray-200', 'text-gray-700');
            viewListBtn.classList.add('bg-blue-600', 'text-white');
            
            // Desativar botão de calendário
            viewCalendarBtn.classList.remove('bg-blue-600', 'text-white');
            viewCalendarBtn.classList.add('bg-gray-200', 'text-gray-700');
            
            // Mostrar lista, ocultar calendário
            if (listView) listView.classList.remove('hidden');
            if (calendarView) calendarView.classList.add('hidden');
            
        } else if (view === 'calendar') {
            // Ativar botão de calendário
            viewCalendarBtn.classList.remove('bg-gray-200', 'text-gray-700');
            viewCalendarBtn.classList.add('bg-blue-600', 'text-white');
            
            // Desativar botão de lista
            viewListBtn.classList.remove('bg-blue-600', 'text-white');
            viewListBtn.classList.add('bg-gray-200', 'text-gray-700');
            
            // Mostrar calendário, ocultar lista
            if (calendarView) calendarView.classList.remove('hidden');
            if (listView) listView.classList.add('hidden');
            
            // Inicializar calendário se ainda não foi inicializado
            if (!calendarInstance) {
                initializeCalendar();
            } else {
                // Atualizar calendário com filtros atuais
                updateCalendarDisplay();
            }
            
            // Se há filtros ativos, aplicar redirecionamento automático
            const hasActiveFilters = Object.keys(currentFilters).length > 0 && 
                                    Object.values(currentFilters).some(value => value !== '');
            if (hasActiveFilters) {
                setTimeout(() => {
                    scrollToFilteredEvents();
                }, 800);
            }
        }
    }
    
    function initializeCalendar() {
        if (!calendar) return;
        
        calendarInstance = new FullCalendar.Calendar(calendar, {
            initialView: 'dayGridMonth',
            locale: 'pt-br',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            buttonText: {
                today: 'Hoje',
                dayGridMonth: 'Mês',
                timeGridWeek: 'Semana',
                timeGridDay: 'Dia'
            },
            dayHeaderFormat: { weekday: 'short' },
            dayHeaderContent: function(arg) {
                const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                return diasSemana[arg.date.getDay()];
            },
            monthNames: [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ],
            monthNamesShort: [
                'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
            ],
            dayNames: [
                'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
                'Quinta-feira', 'Sexta-feira', 'Sábado'
            ],
            dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
            weekNumbers: false,
            weekNumberFormat: { week: 'numeric' },
            firstDay: 1, // Segunda-feira como primeiro dia da semana
            events: getCalendarEvents(),
            eventClick: function(info) {
                showBudgetDetails(info.event.extendedProps.budgetId);
            },
            eventDidMount: function(info) {
                // Adicionar classes CSS baseadas no status
                const status = info.event.extendedProps.status;
                if (status === 'pendente') {
                    info.el.classList.add('event-pending');
                } else if (status === 'aprovado') {
                    info.el.classList.add('event-approved');
                } else if (status === 'recusado') {
                    info.el.classList.add('event-rejected');
                } else if (status === 'cancelado') {
                    info.el.classList.add('event-cancelled');
                }
            }
        });
        
        calendarInstance.render();
        
        // Aplicar estilos personalizados após renderização
        setTimeout(() => {
            applyCalendarStyles();
        }, 100);
    }
    
    function applyCalendarStyles() {
        // Aplicar estilos aos botões do calendário
        const buttons = document.querySelectorAll('#calendar .fc-button');
        buttons.forEach(button => {
            button.style.backgroundColor = '#3b82f6';
            button.style.borderColor = '#3b82f6';
            button.style.color = 'white';
            button.style.border = '1px solid #3b82f6';
        });
        
        // Aplicar estilos aos botões ativos
        const activeButtons = document.querySelectorAll('#calendar .fc-button-active');
        activeButtons.forEach(button => {
            button.style.backgroundColor = '#1d4ed8';
            button.style.borderColor = '#1d4ed8';
            button.style.color = 'white';
        });
        
        // Aplicar estilos aos ícones
        const icons = document.querySelectorAll('#calendar .fc-icon');
        icons.forEach(icon => {
            icon.style.color = 'white';
        });
    }
    
    function getCalendarEvents() {
        // Usar orçamentos filtrados se houver filtros aplicados, senão usar todos os orçamentos
        const budgetsToUse = filteredBudgets.length > 0 ? filteredBudgets : budgets;
        
        // Se não há orçamentos para mostrar, retornar array vazio
        if (budgetsToUse.length === 0) {
            return [];
        }
        
        return budgetsToUse.map(budget => ({
            id: budget.id,
            title: `${budget.client} - ${getServiceTypeLabel(budget.service_type)}`,
            start: budget.event_date + 'T' + budget.event_time,
            backgroundColor: getEventColor(budget.status),
            borderColor: getEventColor(budget.status),
            textColor: '#ffffff',
            extendedProps: {
                budgetId: budget.id,
                status: budget.status,
                client: budget.client,
                location: budget.event_location,
                description: budget.description
            }
        }));
    }
    
    function getServiceTypeLabel(type) {
        const labels = {
            'arco-tradicional': 'Arco-Tradicional',
            'arco-desconstruido': 'Arco-Desconstruído',
            'escultura-balao': 'Escultura de Balão',
            'centro-mesa': 'Centro de Mesa',
            'baloes-piscina': 'Balões na Piscina'
        };
        return labels[type] || 'Serviço';
    }
    
    function getEventColor(status) {
        const colors = {
            'pendente': '#f59e0b',
            'aprovado': '#10b981',
            'recusado': '#ef4444',
            'cancelado': '#6b7280',
            'enviado': '#3b82f6'
        };
        return colors[status] || '#6b7280';
    }

    // ========== GERENCIAMENTO DE ORÇAMENTOS ==========
    
    function updateBudgetsDisplay() {
        // Se há filtros aplicados, usar orçamentos filtrados
        if (Object.keys(currentFilters).length > 0 && Object.values(currentFilters).some(value => value !== '')) {
            // Reaplicar filtros
            filteredBudgets = filterBudgets(budgets, currentFilters);
            updateFilteredBudgetsDisplay(filteredBudgets);
        } else {
            // Sem filtros, mostrar todos os orçamentos
            filteredBudgets = [];
            if (totalCount) totalCount.textContent = budgets.length;
            renderAllBudgets(budgets, allBudgets);
        }
        
        // Atualizar calendário
        updateCalendarDisplay();
    }
    
    function renderAllBudgets(budgetsList, container) {
        if (!container) return;
        
        if (budgetsList.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-2"></i>
                    <p>Nenhum orçamento encontrado</p>
                </div>
            `;
            return;
        }
        
        // Ordenar orçamentos por data de criação (mais recentes primeiro)
        const sortedBudgets = [...budgetsList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        container.innerHTML = sortedBudgets.map(budget => `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 relative">
                <!-- Marcador visual de status -->
                <div class="absolute left-0 top-0 w-1 h-full ${getStatusIndicatorClass(budget.status)} rounded-l-lg"></div>
                
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex-1 ml-2">
                        <div class="flex items-center space-x-3 mb-2">
                            <span class="px-2 py-1 ${getStatusClass(budget.status)} text-xs font-medium rounded-full flex items-center">
                                <i class="fas ${getStatusIcon(budget.status)} mr-1"></i>
                                ${getStatusLabel(budget.status)}
                            </span>
                            <span class="text-sm text-gray-500">#${budget.id}</span>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800">${getServiceTypeLabel(budget.service_type)}</h3>
                        <p class="text-gray-600 text-sm">Cliente: ${budget.client}</p>
                        <p class="text-gray-600 text-sm">Data: ${formatDate(budget.event_date)} - ${budget.event_time}</p>
                        <p class="text-gray-600 text-sm">Local: ${budget.event_location}</p>
                        ${budget.estimated_value > 0 ? `<p class="text-gray-600 text-sm">Valor: R$ ${budget.estimated_value.toFixed(2)}</p>` : ''}
                    </div>
                    <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 lg:mt-0">
                        <button onclick="showBudgetDetails(${budget.id})" class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors">
                            <i class="fas fa-eye mr-1"></i>Ver Detalhes
                        </button>
                        <button onclick="editBudget(${budget.id})" class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded hover:bg-yellow-200 transition-colors">
                            <i class="fas fa-edit mr-1"></i>Editar
                        </button>
                        <div class="relative inline-block">
                            <button onclick="toggleStatusDropdown(${budget.id})" class="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded hover:bg-gray-200 transition-colors flex items-center">
                                <i class="fas fa-cog mr-1"></i>Status
                                <i class="fas fa-chevron-down ml-1 text-xs"></i>
                            </button>
                            <div id="status-dropdown-${budget.id}" class="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 hidden">
                                <div class="py-1">
                                    <button onclick="changeBudgetStatus(${budget.id}, 'aprovado')" class="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                                        <i class="fas fa-check mr-2"></i>Aprovar
                                    </button>
                                    <button onclick="changeBudgetStatus(${budget.id}, 'recusado')" class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                                        <i class="fas fa-times mr-2"></i>Recusar
                                    </button>
                                    <button onclick="changeBudgetStatus(${budget.id}, 'cancelado')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        <i class="fas fa-ban mr-2"></i>Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    function getStatusClass(status) {
        const classes = {
            'pendente': 'bg-yellow-100 text-yellow-800',
            'aprovado': 'bg-green-100 text-green-800',
            'recusado': 'bg-red-100 text-red-800',
            'cancelado': 'bg-gray-100 text-gray-800',
            'enviado': 'bg-blue-100 text-blue-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }
    
    function getStatusLabel(status) {
        const labels = {
            'pendente': 'Pendente',
            'aprovado': 'Aprovado',
            'recusado': 'Recusado',
            'cancelado': 'Cancelado',
            'enviado': 'Enviado'
        };
        return labels[status] || 'Desconhecido';
    }
    
    function getStatusIcon(status) {
        const icons = {
            'pendente': 'fa-clock',
            'aprovado': 'fa-check-circle',
            'recusado': 'fa-times-circle',
            'cancelado': 'fa-ban',
            'enviado': 'fa-paper-plane'
        };
        return icons[status] || 'fa-question-circle';
    }
    
    function getStatusIndicatorClass(status) {
        const classes = {
            'pendente': 'bg-yellow-500',
            'aprovado': 'bg-green-500',
            'recusado': 'bg-red-500',
            'cancelado': 'bg-gray-500',
            'enviado': 'bg-blue-500'
        };
        return classes[status] || 'bg-gray-500';
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    // Funções para controle do dropdown de status
    window.toggleStatusDropdown = function(budgetId) {
        // Fechar todos os outros dropdowns
        document.querySelectorAll('[id^="status-dropdown-"]').forEach(dropdown => {
            if (dropdown.id !== `status-dropdown-${budgetId}`) {
                dropdown.classList.add('hidden');
            }
        });
        
        // Toggle do dropdown atual
        const dropdown = document.getElementById(`status-dropdown-${budgetId}`);
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    };
    
    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', function(e) {
        if (!e.target.closest('[onclick*="toggleStatusDropdown"]') && !e.target.closest('[id^="status-dropdown-"]')) {
            document.querySelectorAll('[id^="status-dropdown-"]').forEach(dropdown => {
                dropdown.classList.add('hidden');
            });
        }
    });
    
    window.changeBudgetStatus = async function(budgetId, newStatus) {
        if (confirm(`Tem certeza que deseja alterar o status para "${getStatusLabel(newStatus)}"?`)) {
            try {
                const response = await fetch('../services/budgets.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'changeStatus',
                        id: budgetId,
                        status: newStatus
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification(`Status alterado para "${getStatusLabel(newStatus)}" com sucesso!`, 'success');
                    await loadBudgets(); // Recarregar orçamentos
                } else {
                    showNotification('Erro ao alterar status: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Erro de conexão. Tente novamente.', 'error');
                console.error('Erro ao alterar status:', error);
            }
        }
    };

    // Funções globais para os botões de ação
    window.showBudgetDetails = function(budgetId) {
        const budget = budgets.find(b => b.id == budgetId);
        if (!budget) return;
        
        const content = `
            <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-2">Informações do Cliente</h4>
                        <p class="text-sm text-gray-600"><strong>Nome:</strong> ${budget.client}</p>
                        <p class="text-sm text-gray-600"><strong>Email:</strong> ${budget.email}</p>
                        <p class="text-sm text-gray-600"><strong>Telefone:</strong> ${budget.phone || 'Não informado'}</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-2">Informações do Evento</h4>
                        <p class="text-sm text-gray-600"><strong>Data:</strong> ${formatDate(budget.event_date)}</p>
                        <p class="text-sm text-gray-600"><strong>Hora:</strong> ${budget.event_time}</p>
                        <p class="text-sm text-gray-600"><strong>Local:</strong> ${budget.event_location}</p>
                        <p class="text-sm text-gray-600"><strong>Tipo:</strong> ${getServiceTypeLabel(budget.service_type)}</p>
                    </div>
                </div>
                
                ${budget.description ? `
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-2">Descrição</h4>
                        <p class="text-sm text-gray-600">${budget.description}</p>
                    </div>
                ` : ''}
                
                ${budget.estimated_value > 0 ? `
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-2">Valor Estimado</h4>
                        <p class="text-lg font-bold text-green-600">R$ ${budget.estimated_value.toFixed(2)}</p>
                    </div>
                ` : ''}
                
                ${budget.notes ? `
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-2">Observações</h4>
                        <p class="text-sm text-gray-600">${budget.notes}</p>
                    </div>
                ` : ''}
                
                <div class="flex items-center space-x-2">
                    <span class="px-2 py-1 ${getStatusClass(budget.status)} text-xs font-medium rounded-full">
                        ${getStatusLabel(budget.status)}
                    </span>
                    <span class="text-xs text-gray-500">Criado em: ${formatDate(budget.created_at)}</span>
                </div>
            </div>
        `;
        
        if (budgetDetailsContent) {
            budgetDetailsContent.innerHTML = content;
        }
        
        if (budgetDetailsModal) {
            budgetDetailsModal.classList.remove('hidden');
            budgetDetailsModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };
    
    window.editBudget = function(budgetId) {
        const budget = budgets.find(b => b.id == budgetId);
        if (!budget) {
            showNotification('Orçamento não encontrado', 'error');
            return;
        }
        
        openEditBudgetModal(budget);
    };
    
    window.approveBudget = async function(budgetId) {
        if (confirm('Tem certeza que deseja aprovar este orçamento?')) {
            try {
                const response = await fetch('../services/budgets.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'approve',
                        id: budgetId
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Orçamento aprovado com sucesso!', 'success');
                    await loadBudgets(); // Recarregar orçamentos
                } else {
                    showNotification('Erro ao aprovar orçamento: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Erro de conexão. Tente novamente.', 'error');
                console.error('Erro ao aprovar orçamento:', error);
            }
        }
    };
    
    window.rejectBudget = async function(budgetId) {
        if (confirm('Tem certeza que deseja recusar este orçamento?')) {
            try {
                const response = await fetch('../services/budgets.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'reject',
                        id: budgetId
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Orçamento recusado', 'info');
                    await loadBudgets(); // Recarregar orçamentos
                } else {
                    showNotification('Erro ao recusar orçamento: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Erro de conexão. Tente novamente.', 'error');
                console.error('Erro ao recusar orçamento:', error);
            }
        }
    };

    // ========== LOGOUT ==========
    
    function handleLogout() {
        // Confirmar logout
        if (confirm('Tem certeza que deseja sair?')) {
            // Limpar dados locais
            localStorage.removeItem('userData');
            localStorage.removeItem('userToken');
            
            // Redirecionar para login
            window.location.href = '../pages/login.html';
        }
    }

    // ========== SISTEMA DE NOTIFICAÇÕES ==========
    
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
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
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

    // ========== UTILITÁRIOS ==========
    
    // Função para debounce (otimização de performance)
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Otimizar resize com debounce
    const debouncedResize = debounce(handleResize, 100);
    window.removeEventListener('resize', handleResize);
    window.addEventListener('resize', debouncedResize);

    // ========== DROPDOWNS DO HEADER ==========
    
    // Elementos dos dropdowns
    const notificationsBtn = document.getElementById('notifications-btn');
    const notificationsDropdown = document.getElementById('notifications-dropdown');
    const notificationsList = document.getElementById('notifications-list');
    const notificationCount = document.getElementById('notification-count');
    const viewAllBudgetsBtn = document.getElementById('view-all-budgets');
    
    const userBtn = document.getElementById('user-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const manageAccountBtn = document.getElementById('manage-account-btn');
    const logoutHeaderBtn = document.getElementById('logout-header-btn');
    
    // Estado dos dropdowns
    let notificationsOpen = false;
    let userDropdownOpen = false;
    
    // ========== DROPDOWN DE NOTIFICAÇÕES ==========
    
    // Toggle dropdown de notificações
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNotificationsDropdown();
        });
    }
    
    // Carregar notificações
    function loadNotifications() {
        if (!notificationsList) return;
        
        // Mostrar loading
        notificationsList.innerHTML = `
            <div class="notifications-loading">
                <i class="fas fa-spinner"></i>
                <p>Carregando notificações...</p>
            </div>
        `;
        
        // Fazer requisição para buscar orçamentos recentes
        fetch('../services/budgets.php?action=recent')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayNotifications(data.budgets);
                    updateNotificationCount(data.count);
                } else {
                    showNotificationError(data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao carregar notificações:', error);
                showNotificationError('Erro ao carregar notificações');
            });
    }
    
    // Exibir notificações
    function displayNotifications(budgets) {
        if (!notificationsList) return;
        
        if (budgets.length === 0) {
            notificationsList.innerHTML = `
                <div class="notifications-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>Nenhum orçamento recente</p>
                </div>
            `;
            return;
        }
        
        const notificationsHTML = budgets.map(budget => `
            <div class="notification-item" data-budget-id="${budget.id}">
                <div class="notification-content">
                    <div class="notification-client">${budget.client}</div>
                    <div class="notification-date">${budget.time_ago}</div>
                    <div class="notification-status ${budget.status}">
                        <i class="fas fa-circle"></i>
                        ${getStatusText(budget.status)}
                    </div>
                </div>
            </div>
        `).join('');
        
        notificationsList.innerHTML = notificationsHTML;
        
        // Adicionar event listeners para os itens
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const budgetId = item.dataset.budgetId;
                openBudgetDetails(budgetId);
                closeNotificationsDropdown();
            });
        });
    }
    
    // Exibir erro nas notificações
    function showNotificationError(message) {
        if (!notificationsList) return;
        
        notificationsList.innerHTML = `
            <div class="notifications-empty">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
    
    // Atualizar contador de notificações
    function updateNotificationCount(count) {
        if (!notificationCount) return;
        
        notificationCount.textContent = count;
        notificationCount.style.display = count > 0 ? 'flex' : 'none';
    }
    
    // Obter texto do status
    function getStatusText(status) {
        const statusMap = {
            'pendente': 'Pendente',
            'aprovado': 'Aprovado',
            'recusado': 'Recusado',
            'cancelado': 'Cancelado',
            'enviado': 'Enviado'
        };
        return statusMap[status] || status;
    }
    
    // Toggle dropdown de notificações
    function toggleNotificationsDropdown() {
        if (notificationsOpen) {
            closeNotificationsDropdown();
        } else {
            openNotificationsDropdown();
        }
    }
    
    // Abrir dropdown de notificações
    function openNotificationsDropdown() {
        if (!notificationsDropdown) return;
        
        // Fechar dropdown do usuário se estiver aberto
        closeUserDropdown();
        
        notificationsDropdown.classList.add('show');
        notificationsOpen = true;
        
        // Carregar notificações se ainda não foram carregadas
        if (notificationsList.children.length === 0) {
            loadNotifications();
        }
    }
    
    // Fechar dropdown de notificações
    function closeNotificationsDropdown() {
        if (!notificationsDropdown) return;
        
        notificationsDropdown.classList.remove('show');
        notificationsOpen = false;
    }
    
    // ========== DROPDOWN DO USUÁRIO ==========
    
    // Toggle dropdown do usuário
    if (userBtn) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleUserDropdown();
        });
    }
    
    // Toggle dropdown do usuário
    function toggleUserDropdown() {
        if (userDropdownOpen) {
            closeUserDropdown();
        } else {
            openUserDropdown();
        }
    }
    
    // Abrir dropdown do usuário
    function openUserDropdown() {
        if (!userDropdown) return;
        
        // Fechar dropdown de notificações se estiver aberto
        closeNotificationsDropdown();
        
        userDropdown.classList.add('show');
        userDropdownOpen = true;
    }
    
    // Fechar dropdown do usuário
    function closeUserDropdown() {
        if (!userDropdown) return;
        
        userDropdown.classList.remove('show');
        userDropdownOpen = false;
    }
    
    // ========== AÇÕES DOS DROPDOWNS ==========
    
    // Gerenciar conta
    if (manageAccountBtn) {
        manageAccountBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeUserDropdown();
            // Usar a funcionalidade existente de gerenciar conta
            if (openAccountModal) {
                openAccountModal.click();
            }
        });
    }
    
    // Logout do header
    if (logoutHeaderBtn) {
        logoutHeaderBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeUserDropdown();
            // Usar a funcionalidade existente de logout
            if (logoutBtn) {
                logoutBtn.click();
            }
        });
    }
    
    // Ver todos os orçamentos
    if (viewAllBudgetsBtn) {
        viewAllBudgetsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeNotificationsDropdown();
            // Navegar para o painel gerencial
            if (document.querySelector('[data-module="painel-gerencial"]')) {
                document.querySelector('[data-module="painel-gerencial"]').click();
            }
        });
    }
    
    // ========== FECHAR DROPDOWNS AO CLICAR FORA ==========
    
    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
        if (notificationsOpen && !notificationsBtn.contains(e.target) && !notificationsDropdown.contains(e.target)) {
            closeNotificationsDropdown();
        }
        
        if (userDropdownOpen && !userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            closeUserDropdown();
        }
    });
    
    // Fechar dropdowns ao pressionar ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeNotificationsDropdown();
            closeUserDropdown();
        }
    });

    console.log('Dashboard do Decorador - Sistema carregado com sucesso!');
});