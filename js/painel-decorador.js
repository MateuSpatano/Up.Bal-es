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
    
    // Elementos do campo de tamanho do arco
    const budgetServiceType = document.getElementById('budget-service-type');
    const budgetArcSizeContainer = document.getElementById('budget-arc-size-container');
    const budgetArcSize = document.getElementById('budget-arc-size');
    
    // Elementos do upload de imagem
    const budgetImageInput = document.getElementById('budget-inspiration-image');
    const budgetImagePreview = document.getElementById('budget-image-preview');
    const budgetPreviewImg = document.getElementById('budget-preview-img');
    const budgetRemoveImageBtn = document.getElementById('budget-remove-image');

    // Elementos do modal de envio de orçamento
    const sendBudgetModal = document.getElementById('send-budget-modal');
    const closeSendBudgetModal = document.getElementById('close-send-budget-modal');
    const cancelSendBudget = document.getElementById('cancel-send-budget');
    const confirmSendBudget = document.getElementById('confirm-send-budget');
    const sendBudgetModalOverlay = document.getElementById('send-budget-modal-overlay');
    const sendBudgetInfo = document.getElementById('send-budget-info');
    const customMessageSection = document.getElementById('custom-message-section');
    const customMessage = document.getElementById('custom-message');

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
    let budgetSortOrder = 'desc'; // 'desc' para mais recentes primeiro, 'asc' para mais antigos primeiro
    let currentView = 'list';
    let currentSendBudget = null;
    let selectedSendMethod = null;

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
    
    // Configurar modal de envio
    setupSendBudgetModal();
    
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
        
        // Event listeners do dashboard
        setupDashboardEventListeners();
    }
    
    function setupDashboardEventListeners() {
        // Botão de aplicar filtros do dashboard
        const applyDashboardFiltersBtn = document.getElementById('apply-dashboard-filters');
        if (applyDashboardFiltersBtn) {
            applyDashboardFiltersBtn.addEventListener('click', function() {
                loadDashboardKPIs();
            });
        }
        
        // Botão de tentar novamente em caso de erro
        const retryDashboardBtn = document.getElementById('retry-dashboard');
        if (retryDashboardBtn) {
            retryDashboardBtn.addEventListener('click', function() {
                loadDashboardKPIs();
            });
        }
        
        // Atualizar dashboard quando as datas mudarem
        const dateFromInput = document.getElementById('dashboard-date-from');
        const dateToInput = document.getElementById('dashboard-date-to');
        
        if (dateFromInput) {
            dateFromInput.addEventListener('change', function() {
                // Validar se ambas as datas estão preenchidas
                if (dateToInput && dateToInput.value) {
                    loadDashboardKPIs();
                }
            });
        }
        
        if (dateToInput) {
            dateToInput.addEventListener('change', function() {
                // Validar se ambas as datas estão preenchidas
                if (dateFromInput && dateFromInput.value) {
                    loadDashboardKPIs();
                }
            });
        }
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
        
        // Controlar visibilidade do botão flutuante
        toggleFloatingButton(moduleName);
        
        // Simular carregamento de dados do módulo
        loadModuleData(moduleName);
    }
    
    function toggleFloatingButton(moduleName) {
        const floatingBtn = document.getElementById('floating-add-btn');
        if (!floatingBtn) return;
        
        // Ocultar botão no módulo de agenda
        if (moduleName === 'agenda') {
            floatingBtn.style.display = 'none';
        } else {
            floatingBtn.style.display = 'flex';
        }
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
        console.log('Carregando dados do dashboard...');
        
        // Definir período padrão (mês atual)
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        // Definir valores padrão dos filtros
        document.getElementById('dashboard-date-from').value = firstDay.toISOString().split('T')[0];
        document.getElementById('dashboard-date-to').value = lastDay.toISOString().split('T')[0];
        
        // Carregar dados do dashboard
        loadDashboardKPIs();
    }
    
    // ========== FUNCIONALIDADES DO DASHBOARD ==========
    
    let dashboardCharts = {
        festasMes: null,
        festasAno: null
    };
    
    function loadDashboardKPIs() {
        const dateFrom = document.getElementById('dashboard-date-from').value;
        const dateTo = document.getElementById('dashboard-date-to').value;
        
        if (!dateFrom || !dateTo) {
            showDashboardError('Por favor, selecione as datas inicial e final.');
            return;
        }
        
        showDashboardLoading();
        
        fetch('../services/painel.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getData',
                date_from: dateFrom,
                date_to: dateTo
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateKPIs(data.kpis);
                updateCharts(data.series);
                hideDashboardLoading();
            } else {
                showDashboardError(data.message || 'Erro ao carregar dados do dashboard.');
            }
        })
        .catch(error => {
            console.error('Erro ao carregar dashboard:', error);
            showDashboardError('Erro de conexão. Verifique sua internet e tente novamente.');
        });
    }
    
    function updateKPIs(kpis) {
        // Atualizar total de festas
        document.getElementById('kpi-festas-total').textContent = kpis.festas_total || 0;
        
        // Atualizar festas solicitadas por clientes
        document.getElementById('kpi-festas-clientes').textContent = kpis.festas_solicitadas_clientes || 0;
        
        // Atualizar festas criadas pelo decorador
        document.getElementById('kpi-festas-decorador').textContent = kpis.festas_criadas_decorador || 0;
        
        // Atualizar receita recebida
        const receita = kpis.receita_recebida || 0;
        document.getElementById('kpi-receita-recebida').textContent = formatCurrency(receita);
        
        // Atualizar período nos cards
        const dateFrom = document.getElementById('dashboard-date-from').value;
        const dateTo = document.getElementById('dashboard-date-to').value;
        const periodText = formatPeriodText(dateFrom, dateTo);
        document.getElementById('kpi-festas-total-period').textContent = periodText;
    }
    
    function updateCharts(series) {
        // Atualizar gráfico de festas por mês
        updateFestasPorMesChart(series.festas_por_mes_12m || []);
        
        // Atualizar gráfico de festas por ano
        updateFestasPorAnoChart(series.festas_por_ano_5a || []);
    }
    
    function updateFestasPorMesChart(data) {
        const ctx = document.getElementById('chart-festas-mes').getContext('2d');
        
        // Destruir gráfico anterior se existir
        if (dashboardCharts.festasMes) {
            dashboardCharts.festasMes.destroy();
        }
        
        const labels = data.map(item => {
            const [year, month] = item.mes.split('-');
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                              'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            return `${monthNames[parseInt(month) - 1]}/${year.slice(-2)}`;
        });
        
        const values = data.map(item => item.total);
        
        dashboardCharts.festasMes = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Festas',
                    data: values,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    function updateFestasPorAnoChart(data) {
        const ctx = document.getElementById('chart-festas-ano').getContext('2d');
        
        // Destruir gráfico anterior se existir
        if (dashboardCharts.festasAno) {
            dashboardCharts.festasAno.destroy();
        }
        
        const labels = data.map(item => item.ano.toString());
        const values = data.map(item => item.total);
        
        dashboardCharts.festasAno = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Festas',
                    data: values,
                    backgroundColor: 'rgba(147, 51, 234, 0.1)',
                    borderColor: 'rgba(147, 51, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    function showDashboardLoading() {
        document.getElementById('dashboard-loading').classList.remove('hidden');
        document.getElementById('dashboard-error').classList.add('hidden');
    }
    
    function hideDashboardLoading() {
        document.getElementById('dashboard-loading').classList.add('hidden');
    }
    
    function showDashboardError(message) {
        document.getElementById('dashboard-loading').classList.add('hidden');
        document.getElementById('dashboard-error').classList.remove('hidden');
        document.getElementById('dashboard-error-message').textContent = message;
    }
    
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
    
    function formatPeriodText(dateFrom, dateTo) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        
        const fromStr = from.toLocaleDateString('pt-BR');
        const toStr = to.toLocaleDateString('pt-BR');
        
        if (fromStr === toStr) {
            return `em ${fromStr}`;
        } else {
            return `de ${fromStr} a ${toStr}`;
        }
    }
    
    function loadPainelGerencialData() {
        console.log('Carregando dados do painel gerencial...');
        
        // Configurar funcionalidades do painel gerencial
        setupPainelGerencialFeatures();
        
        // Inicializar display do botão de ordenação
        updateSortButtonDisplay();
        
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
        
        // Botão de ordenação de orçamentos
        const sortBudgetsBtn = document.getElementById('sort-budgets-btn');
        if (sortBudgetsBtn) {
            sortBudgetsBtn.addEventListener('click', function() {
                toggleBudgetSortOrder();
            });
        }
    }
    
    async function loadBudgets() {
        try {
            const response = await fetch('../services/orcamentos.php', {
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
        console.log('Carregando dados do portfólio...');
        
        // Garantir que o portfólio esteja inicializado
        if (typeof loadPortfolioServices === 'function') {
            loadPortfolioServices();
        }
        
        // Renderizar serviços se já existirem
        if (typeof renderPortfolioServices === 'function' && portfolioServices && portfolioServices.length > 0) {
            renderPortfolioServices();
        }
    }
    
    function loadAgendaData() {
        console.log('Carregando dados da agenda...');
        
        // Configurar funcionalidades da agenda
        setupAgendaFeatures();
        
        // Carregar configurações de disponibilidade
        loadAvailabilitySettings();
        
        // Inicializar calendário da agenda
        initializeAgendaCalendar();
    }
    
    function loadAccountData() {
        // Redirecionar para a página de gerenciamento de conta do decorador
        console.log('Redirecionando para página de conta...');
        window.location.href = 'login.html';
    }
    
    // ========== FUNCIONALIDADES DA AGENDA ==========
    
    function setupAgendaFeatures() {
        // Formulário de disponibilidade
        const availabilityForm = document.getElementById('availability-form');
        const addTimeScheduleBtn = document.getElementById('add-time-schedule');
        const resetAvailabilityBtn = document.getElementById('reset-availability');
        const saveAvailabilityBtn = document.getElementById('save-availability');
        
        // Adicionar horário
        if (addTimeScheduleBtn) {
            addTimeScheduleBtn.addEventListener('click', addTimeSchedule);
        }
        
        // Resetar configurações
        if (resetAvailabilityBtn) {
            resetAvailabilityBtn.addEventListener('click', resetAvailabilitySettings);
        }
        
        // Salvar configurações
        if (availabilityForm) {
            availabilityForm.addEventListener('submit', handleAvailabilitySubmit);
        }
        
        // Configurar checkboxes dos dias da semana
        setupDayCheckboxes();
        
        // Inicializar intervalos padrão se não houver nenhum
        initializeDefaultIntervals();
        
        // Adicionar event listener alternativo para o botão de adicionar intervalo
        setupIntervalButtonListener();
        
        // Configurar funcionalidades de datas bloqueadas
        setupBlockedDatesFeatures();
    }
    
    function setupDayCheckboxes() {
        const dayCheckboxes = document.querySelectorAll('.availability-day-checkbox');
        dayCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const dayItem = this.closest('.availability-day-item');
                if (this.checked) {
                    dayItem.classList.add('selected');
                } else {
                    dayItem.classList.remove('selected');
                }
            });
        });
    }
    
    function addTimeSchedule() {
        const container = document.getElementById('time-schedules-container');
        if (!container) return;
        
        const scheduleId = 'schedule_' + Date.now();
        const scheduleHTML = `
            <div class="time-schedule-item" data-schedule-id="${scheduleId}">
                <div class="time-schedule-header">
                    <div class="time-schedule-title">
                        <i class="fas fa-clock"></i>
                        Horário de Atendimento
                    </div>
                    <div class="time-schedule-actions">
                        <button type="button" class="time-schedule-action-btn edit-schedule-btn" onclick="editTimeSchedule('${scheduleId}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="time-schedule-action-btn delete-schedule-btn" onclick="deleteTimeSchedule('${scheduleId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="time-schedule-fields">
                    <div class="time-schedule-field">
                        <label>Dia da Semana</label>
                        <select name="schedule_day" required>
                            <option value="">Selecione o dia</option>
                            <option value="monday">Segunda-feira</option>
                            <option value="tuesday">Terça-feira</option>
                            <option value="wednesday">Quarta-feira</option>
                            <option value="thursday">Quinta-feira</option>
                            <option value="friday">Sexta-feira</option>
                            <option value="saturday">Sábado</option>
                            <option value="sunday">Domingo</option>
                        </select>
                    </div>
                    <div class="time-schedule-field">
                        <label>Horário de Início</label>
                        <input type="time" name="start_time" required>
                    </div>
                    <div class="time-schedule-field">
                        <label>Horário de Fim</label>
                        <input type="time" name="end_time" required>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', scheduleHTML);
        
        // Scroll para o novo item
        const newItem = container.querySelector(`[data-schedule-id="${scheduleId}"]`);
        if (newItem) {
            newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    function editTimeSchedule(scheduleId) {
        const scheduleItem = document.querySelector(`[data-schedule-id="${scheduleId}"]`);
        if (!scheduleItem) return;
        
        // Implementar edição inline ou modal
        console.log('Editando horário:', scheduleId);
    }
    
    function deleteTimeSchedule(scheduleId) {
        if (confirm('Tem certeza que deseja excluir este horário?')) {
            const scheduleItem = document.querySelector(`[data-schedule-id="${scheduleId}"]`);
            if (scheduleItem) {
                scheduleItem.remove();
            }
        }
    }
    
    function resetAvailabilitySettings() {
        if (confirm('Tem certeza que deseja resetar todas as configurações de disponibilidade?')) {
            // Resetar checkboxes dos dias
            const dayCheckboxes = document.querySelectorAll('.availability-day-checkbox');
            dayCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                const dayItem = checkbox.closest('.availability-day-item');
                dayItem.classList.remove('selected');
            });
            
            // Limpar horários
            const timeContainer = document.getElementById('time-schedules-container');
            if (timeContainer) {
                timeContainer.innerHTML = '';
            }
            
            // Limpar intervalos
            const intervalContainer = document.getElementById('service-intervals-container');
            if (intervalContainer) {
                intervalContainer.innerHTML = '';
            }
            
            // Resetar máximo de serviços
            const maxDailyServices = document.getElementById('max-daily-services');
            if (maxDailyServices) maxDailyServices.value = '3';
            
            showNotification('Configurações resetadas!', 'info');
        }
    }
    
    async function handleAvailabilitySubmit(e) {
        e.preventDefault();
        
        // Validar formulário
        if (!validateAvailabilityForm()) {
            return;
        }
        
        // Mostrar loading
        const saveBtn = document.getElementById('save-availability');
        if (saveBtn) {
            saveBtn.classList.add('btn-loading');
            saveBtn.disabled = true;
        }
        
        try {
            // Coletar dados do formulário
            const formData = new FormData(e.target);
            const availabilityData = collectAvailabilityData(formData);
            
            // Salvar configurações
            await saveAvailabilitySettings(availabilityData);
            
            showNotification('Configurações de disponibilidade salvas com sucesso!', 'success');
            
        } catch (error) {
            showNotification('Erro ao salvar configurações. Tente novamente.', 'error');
            console.error('Erro ao salvar disponibilidade:', error);
        } finally {
            // Remover loading
            if (saveBtn) {
                saveBtn.classList.remove('btn-loading');
                saveBtn.disabled = false;
            }
        }
    }
    
    function validateAvailabilityForm() {
        // Verificar se pelo menos um dia foi selecionado
        const selectedDays = document.querySelectorAll('.availability-day-checkbox:checked');
        if (selectedDays.length === 0) {
            showNotification('Selecione pelo menos um dia da semana', 'error');
            return false;
        }
        
        // Verificar se há pelo menos um horário configurado
        const timeSchedules = document.querySelectorAll('.time-schedule-item');
        if (timeSchedules.length === 0) {
            showNotification('Adicione pelo menos um horário de atendimento', 'error');
            return false;
        }
        
        // Validar horários
        let hasValidSchedule = false;
        timeSchedules.forEach(schedule => {
            const day = schedule.querySelector('select[name="schedule_day"]');
            const startTime = schedule.querySelector('input[name="start_time"]');
            const endTime = schedule.querySelector('input[name="end_time"]');
            
            if (day && day.value && startTime && startTime.value && endTime && endTime.value) {
                if (startTime.value < endTime.value) {
                    hasValidSchedule = true;
                } else {
                    showNotification('Horário de início deve ser anterior ao horário de fim', 'error');
                    return false;
                }
            }
        });
        
        if (!hasValidSchedule) {
            showNotification('Configure pelo menos um horário válido', 'error');
            return false;
        }
        
        // Verificar se há pelo menos um intervalo configurado
        const serviceIntervals = document.querySelectorAll('.service-interval-item');
        if (serviceIntervals.length === 0) {
            showNotification('Configure pelo menos um intervalo entre serviços', 'error');
            return false;
        }
        
        // Validar intervalos
        let hasValidInterval = false;
        serviceIntervals.forEach(interval => {
            const day = interval.querySelector('select[name="interval_day"]');
            const intervalValue = interval.querySelector('input[name="interval_value"]');
            const unit = interval.querySelector('select[name="interval_unit"]');
            
            if (day && day.value && intervalValue && intervalValue.value && unit && unit.value) {
                const value = parseInt(intervalValue.value);
                if (value >= 0) {
                    hasValidInterval = true;
                } else {
                    showNotification('Intervalo deve ser maior ou igual a zero', 'error');
                    return false;
                }
            }
        });
        
        if (!hasValidInterval) {
            showNotification('Configure pelo menos um intervalo válido', 'error');
            return false;
        }
        
        return true;
    }
    
    function collectAvailabilityData(formData) {
        const data = {
            available_days: [],
            time_schedules: [],
            service_intervals: [],
            max_daily_services: parseInt(formData.get('max_daily_services')) || 3
        };
        
        // Coletar dias selecionados
        const selectedDays = document.querySelectorAll('.availability-day-checkbox:checked');
        selectedDays.forEach(checkbox => {
            data.available_days.push(checkbox.value);
        });
        
        // Coletar horários
        const timeSchedules = document.querySelectorAll('.time-schedule-item');
        timeSchedules.forEach(schedule => {
            const day = schedule.querySelector('select[name="schedule_day"]');
            const startTime = schedule.querySelector('input[name="start_time"]');
            const endTime = schedule.querySelector('input[name="end_time"]');
            
            if (day && day.value && startTime && startTime.value && endTime && endTime.value) {
                data.time_schedules.push({
                    day: day.value,
                    start_time: startTime.value,
                    end_time: endTime.value
                });
            }
        });
        
        // Coletar intervalos por dia
        const serviceIntervals = document.querySelectorAll('.service-interval-item');
        serviceIntervals.forEach(interval => {
            const day = interval.querySelector('select[name="interval_day"]');
            const intervalValue = interval.querySelector('input[name="interval_value"]');
            const unit = interval.querySelector('select[name="interval_unit"]');
            
            if (day && day.value && intervalValue && intervalValue.value && unit && unit.value) {
                data.service_intervals.push({
                    day: day.value,
                    interval: parseInt(intervalValue.value),
                    unit: unit.value
                });
            }
        });
        
        return data;
    }
    
    async function saveAvailabilitySettings(data) {
        try {
            const response = await fetch('../services/disponibilidade.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'save',
                    ...data
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Erro ao salvar configurações');
            }
            
            if (!result.success) {
                throw new Error(result.message || 'Erro ao salvar configurações');
            }
            
            // Salvar no localStorage como backup
            localStorage.setItem('availabilitySettings', JSON.stringify(data));
            
            return result;
            
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            throw error;
        }
    }
    
    async function loadAvailabilitySettings() {
        try {
            // Tentar carregar do servidor
            const response = await fetch('../services/disponibilidade.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'load'
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
                populateAvailabilityForm(result.data);
                return;
            }
        } catch (error) {
            console.warn('Erro ao carregar do servidor, tentando localStorage:', error);
        }
        
        // Fallback para localStorage
        try {
            const storedData = localStorage.getItem('availabilitySettings');
            if (storedData) {
                const data = JSON.parse(storedData);
                populateAvailabilityForm(data);
            }
        } catch (error) {
            console.warn('Erro ao carregar do localStorage:', error);
        }
    }
    
    function populateAvailabilityForm(data) {
        // Preencher dias selecionados
        if (data.available_days) {
            data.available_days.forEach(day => {
                const checkbox = document.querySelector(`input[name="available_days"][value="${day}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    const dayItem = checkbox.closest('.availability-day-item');
                    dayItem.classList.add('selected');
                }
            });
        }
        
        // Preencher horários
        if (data.time_schedules && data.time_schedules.length > 0) {
            const container = document.getElementById('time-schedules-container');
            if (container) {
                container.innerHTML = '';
                
                data.time_schedules.forEach(schedule => {
                    const scheduleId = 'schedule_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    const scheduleHTML = `
                        <div class="time-schedule-item" data-schedule-id="${scheduleId}">
                            <div class="time-schedule-header">
                                <div class="time-schedule-title">
                                    <i class="fas fa-clock"></i>
                                    Horário de Atendimento
                                </div>
                                <div class="time-schedule-actions">
                                    <button type="button" class="time-schedule-action-btn edit-schedule-btn" onclick="editTimeSchedule('${scheduleId}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button type="button" class="time-schedule-action-btn delete-schedule-btn" onclick="deleteTimeSchedule('${scheduleId}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="time-schedule-fields">
                                <div class="time-schedule-field">
                                    <label>Dia da Semana</label>
                                    <select name="schedule_day" required>
                                        <option value="">Selecione o dia</option>
                                        <option value="monday" ${schedule.day === 'monday' ? 'selected' : ''}>Segunda-feira</option>
                                        <option value="tuesday" ${schedule.day === 'tuesday' ? 'selected' : ''}>Terça-feira</option>
                                        <option value="wednesday" ${schedule.day === 'wednesday' ? 'selected' : ''}>Quarta-feira</option>
                                        <option value="thursday" ${schedule.day === 'thursday' ? 'selected' : ''}>Quinta-feira</option>
                                        <option value="friday" ${schedule.day === 'friday' ? 'selected' : ''}>Sexta-feira</option>
                                        <option value="saturday" ${schedule.day === 'saturday' ? 'selected' : ''}>Sábado</option>
                                        <option value="sunday" ${schedule.day === 'sunday' ? 'selected' : ''}>Domingo</option>
                                    </select>
                                </div>
                                <div class="time-schedule-field">
                                    <label>Horário de Início</label>
                                    <input type="time" name="start_time" value="${schedule.start_time}" required>
                                </div>
                                <div class="time-schedule-field">
                                    <label>Horário de Fim</label>
                                    <input type="time" name="end_time" value="${schedule.end_time}" required>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    container.insertAdjacentHTML('beforeend', scheduleHTML);
                });
            }
        }
        
        // Preencher intervalos por dia
        if (data.service_intervals && data.service_intervals.length > 0) {
            const container = document.getElementById('service-intervals-container');
            if (container) {
                container.innerHTML = '';
                
                data.service_intervals.forEach(interval => {
                    const intervalId = 'interval_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    const intervalHTML = `
                        <div class="service-interval-item bg-white rounded-lg p-4 mb-4 border border-gray-200" data-interval-id="${intervalId}">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Dia da Semana</label>
                                    <select name="interval_day" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                                        <option value="">Selecione o dia</option>
                                        <option value="monday" ${interval.day === 'monday' ? 'selected' : ''}>Segunda-feira</option>
                                        <option value="tuesday" ${interval.day === 'tuesday' ? 'selected' : ''}>Terça-feira</option>
                                        <option value="wednesday" ${interval.day === 'wednesday' ? 'selected' : ''}>Quarta-feira</option>
                                        <option value="thursday" ${interval.day === 'thursday' ? 'selected' : ''}>Quinta-feira</option>
                                        <option value="friday" ${interval.day === 'friday' ? 'selected' : ''}>Sexta-feira</option>
                                        <option value="saturday" ${interval.day === 'saturday' ? 'selected' : ''}>Sábado</option>
                                        <option value="sunday" ${interval.day === 'sunday' ? 'selected' : ''}>Domingo</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Intervalo</label>
                                    <input type="number" name="interval_value" value="${interval.interval}" min="0" max="24" required 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                                    <select name="interval_unit" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                                        <option value="hours" ${interval.unit === 'hours' ? 'selected' : ''}>Horas</option>
                                        <option value="minutes" ${interval.unit === 'minutes' ? 'selected' : ''}>Minutos</option>
                                    </select>
                                </div>
                            </div>
                            <button type="button" onclick="removeServiceInterval('${intervalId}')" class="mt-2 text-red-600 hover:text-red-800 text-sm">
                                <i class="fas fa-trash mr-1"></i>Remover
                            </button>
                        </div>
                    `;
                    
                    container.insertAdjacentHTML('beforeend', intervalHTML);
                });
            }
        }
        
        if (data.max_daily_services) {
            const maxDailyServices = document.getElementById('max-daily-services');
            if (maxDailyServices) maxDailyServices.value = data.max_daily_services;
        }
    }
    
    function initializeAgendaCalendar() {
        const calendarElement = document.getElementById('agenda-calendar');
        if (!calendarElement) return;
        
        // Inicializar calendário da agenda (similar ao calendário principal)
        // Por enquanto, apenas um placeholder
        calendarElement.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-calendar-alt text-4xl mb-4"></i>
                <p>Calendário da agenda será implementado aqui</p>
            </div>
        `;
    }
    
    // ========== FUNCIONALIDADES DE DATAS BLOQUEADAS ==========
    
    function setupBlockedDatesFeatures() {
        // Formulário de datas bloqueadas
        const blockedDateForm = document.getElementById('blocked-date-form');
        
        if (blockedDateForm) {
            blockedDateForm.addEventListener('submit', handleBlockedDateSubmit);
        }
        
        // Carregar datas bloqueadas
        loadBlockedDates();
    }
    
    async function handleBlockedDateSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const blockedDateData = {
            blocked_date: formData.get('blocked_date'),
            reason: formData.get('reason') || 'Data bloqueada pelo decorador',
            is_recurring: formData.has('is_recurring')
        };
        
        // Validar dados
        if (!blockedDateData.blocked_date) {
            showNotification('Data é obrigatória', 'error');
            return;
        }
        
        // Mostrar loading
        const submitBtn = document.getElementById('add-blocked-date-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Bloqueando...';
        }
        
        try {
            await addBlockedDate(blockedDateData);
            showNotification('Data bloqueada com sucesso!', 'success');
            
            // Limpar formulário
            e.target.reset();
            
            // Recarregar lista
            await loadBlockedDates();
            
        } catch (error) {
            showNotification('Erro ao bloquear data: ' + error.message, 'error');
        } finally {
            // Remover loading
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-ban mr-2"></i>Bloquear Data';
            }
        }
    }
    
    async function addBlockedDate(data) {
        try {
            const response = await fetch('../services/datas-bloqueadas.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'add',
                    ...data
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Erro ao bloquear data');
            }
            
            if (!result.success) {
                throw new Error(result.message || 'Erro ao bloquear data');
            }
            
            return result;
            
        } catch (error) {
            console.error('Erro ao bloquear data:', error);
            throw error;
        }
    }
    
    async function loadBlockedDates() {
        try {
            const response = await fetch('../services/datas-bloqueadas.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'list'
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
                renderBlockedDates(result.data);
            } else {
                renderBlockedDates([]);
            }
            
        } catch (error) {
            console.error('Erro ao carregar datas bloqueadas:', error);
            renderBlockedDates([]);
        }
    }
    
    function renderBlockedDates(blockedDates) {
        const listContainer = document.getElementById('blocked-dates-list');
        const noDatesMessage = document.getElementById('no-blocked-dates');
        
        if (!listContainer || !noDatesMessage) return;
        
        if (blockedDates.length === 0) {
            listContainer.innerHTML = '';
            noDatesMessage.classList.remove('hidden');
            return;
        }
        
        noDatesMessage.classList.add('hidden');
        
        const datesHTML = blockedDates.map(date => {
            const formattedDate = formatDateForDisplay(date.blocked_date);
            const isRecurring = date.is_recurring;
            const recurringClass = isRecurring ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
            const recurringIcon = isRecurring ? '<i class="fas fa-repeat text-yellow-600 mr-1"></i>' : '';
            
            return `
                <div class="blocked-date-item ${recurringClass} border rounded-lg p-4" data-date-id="${date.id}">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-ban text-red-600"></i>
                            </div>
                            <div>
                                <h5 class="font-medium text-gray-800">${formattedDate}</h5>
                                <p class="text-sm text-gray-600">${date.reason}</p>
                                ${isRecurring ? '<span class="text-xs text-yellow-600 font-medium">Recorrente</span>' : ''}
                            </div>
                        </div>
                        <button onclick="removeBlockedDate('${date.id}')" 
                                class="text-red-600 hover:text-red-800 transition-colors duration-200">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        listContainer.innerHTML = datesHTML;
    }
    
    async function removeBlockedDate(dateId) {
        if (!confirm('Tem certeza que deseja desbloquear esta data?')) {
            return;
        }
        
        try {
            const response = await fetch('../services/datas-bloqueadas.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'remove',
                    id: dateId
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Data desbloqueada com sucesso!', 'success');
                await loadBlockedDates();
            } else {
                throw new Error(result.message || 'Erro ao desbloquear data');
            }
            
        } catch (error) {
            showNotification('Erro ao desbloquear data: ' + error.message, 'error');
        }
    }
    
    function formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    async function checkIfDateIsBlocked(date) {
        try {
            const response = await fetch('../services/datas-bloqueadas.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'check',
                    date: date
                })
            });
            
            const result = await response.json();
            return result.blocked || false;
            
        } catch (error) {
            console.error('Erro ao verificar data bloqueada:', error);
            return false;
        }
    }
    
    // Funções globais para os botões de ação
    window.editTimeSchedule = editTimeSchedule;
    window.deleteTimeSchedule = deleteTimeSchedule;
    window.removeServiceInterval = removeServiceInterval;
    window.addServiceInterval = addServiceInterval;
    window.removeBlockedDate = removeBlockedDate;
    
    // Funções para gerenciar intervalos de serviços
    function addServiceInterval() {
        const container = document.getElementById('service-intervals-container');
        if (!container) {
            console.error('Container service-intervals-container não encontrado');
            return;
        }
        
        const intervalId = 'interval_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const intervalHTML = `
            <div class="service-interval-item bg-white rounded-lg p-4 mb-4 border border-gray-200" data-interval-id="${intervalId}">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Dia da Semana</label>
                        <select name="interval_day" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                            <option value="">Selecione o dia</option>
                            <option value="monday">Segunda-feira</option>
                            <option value="tuesday">Terça-feira</option>
                            <option value="wednesday">Quarta-feira</option>
                            <option value="thursday">Quinta-feira</option>
                            <option value="friday">Sexta-feira</option>
                            <option value="saturday">Sábado</option>
                            <option value="sunday">Domingo</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Intervalo</label>
                        <input type="number" name="interval_value" value="1" min="0" max="24" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                        <select name="interval_unit" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                            <option value="hours">Horas</option>
                            <option value="minutes">Minutos</option>
                        </select>
                    </div>
                </div>
                <button type="button" onclick="removeServiceInterval('${intervalId}')" class="mt-2 text-red-600 hover:text-red-800 text-sm">
                    <i class="fas fa-trash mr-1"></i>Remover
                </button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', intervalHTML);
        
        // Scroll para o novo item
        const newItem = container.querySelector(`[data-interval-id="${intervalId}"]`);
        if (newItem) {
            newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    function removeServiceInterval(intervalId) {
        if (confirm('Tem certeza que deseja remover este intervalo?')) {
            const intervalItem = document.querySelector(`[data-interval-id="${intervalId}"]`);
            if (intervalItem) {
                intervalItem.remove();
            }
        }
    }
    
    function initializeDefaultIntervals() {
        const container = document.getElementById('service-intervals-container');
        if (!container) return;
        
        // Verificar se já existem intervalos
        const existingIntervals = container.querySelectorAll('.service-interval-item');
        if (existingIntervals.length === 0) {
            // Adicionar um intervalo padrão
            addServiceInterval();
        }
    }
    
    function setupIntervalButtonListener() {
        // Aguardar um pouco para garantir que o DOM está carregado
        setTimeout(() => {
            const addIntervalBtn = document.getElementById('add-interval-btn');
            
            if (addIntervalBtn) {
                // Adicionar event listener
                addIntervalBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    addServiceInterval();
                });
            } else {
                // Tentar novamente após mais tempo se o módulo ainda não foi carregado
                setTimeout(setupIntervalButtonListener, 1000);
            }
        }, 500);
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
                whatsapp: '(11) 99999-9999',
                communication_email: 'comunicacao@decorador.com',
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
            const response = await fetch('../services/conta.php', {
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
        // Botão flutuante de + - funcionalidade contextual
        if (floatingAddBtn) {
            floatingAddBtn.addEventListener('click', function() {
                // Verificar qual módulo está ativo
                if (currentModule === 'portfolio') {
                    // Se estiver no módulo de portfólio, abrir modal de adicionar serviço
                    if (typeof openAddServiceModal === 'function') {
                        openAddServiceModal();
                    }
                } else {
                    // Se estiver em outros módulos, abrir modal de orçamento
                    openCreateBudgetModal();
                }
            });
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
        
        // Configurar campo de tamanho do arco
        setupArcSizeField();
        
        // Configurar upload de imagem
        setupBudgetImageUpload();
        
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
                // Resetar campo de tamanho do arco
                toggleArcSizeField();
                // Limpar preview da imagem
                if (budgetImagePreview) {
                    budgetImagePreview.classList.add('hidden');
                }
                if (budgetPreviewImg) {
                    budgetPreviewImg.src = '';
                }
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
            
            // Adicionar campos adicionais ao FormData
            formData.append('action', 'create');
            formData.append('created_via', 'decorator'); // Indica que foi criado pelo decorador
            
            // Converter valor estimado para número
            const estimatedValue = formData.get('estimated_value');
            if (estimatedValue) {
                formData.set('estimated_value', parseFloat(estimatedValue) || 0);
            }
            
            // Converter tamanho do arco para número se preenchido
            const arcSize = formData.get('tamanho_arco_m');
            if (arcSize) {
                formData.set('tamanho_arco_m', parseFloat(arcSize));
            }
            
            // Enviar para o servidor
            const response = await fetch('../services/orcamentos.php', {
                method: 'POST',
                body: formData // Usar FormData diretamente para suportar upload de arquivo
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
    
    // ========== FUNCIONALIDADES DO CAMPO TAMANHO DO ARCO ==========
    
    // Função para controlar visibilidade do campo de tamanho do arco
    function toggleArcSizeField() {
        if (!budgetServiceType || !budgetArcSizeContainer || !budgetArcSize) return;
        
        const selectedType = budgetServiceType.value;
        const isArcType = selectedType === 'arco-tradicional' || selectedType === 'arco-desconstruido';
        
        if (isArcType) {
            budgetArcSizeContainer.classList.remove('hidden');
            budgetArcSize.required = true;
        } else {
            budgetArcSizeContainer.classList.add('hidden');
            budgetArcSize.required = false;
            budgetArcSize.value = ''; // Limpar valor quando ocultar
        }
    }
    
    // Configurar campo de tamanho do arco
    function setupArcSizeField() {
        if (budgetServiceType) {
            budgetServiceType.addEventListener('change', toggleArcSizeField);
        }
        
        // Inicializar estado do campo
        toggleArcSizeField();
    }

    // ========== FUNCIONALIDADES DE UPLOAD DE IMAGEM ==========
    
    function setupBudgetImageUpload() {
        if (budgetImageInput) {
            budgetImageInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    // Validar tipo de arquivo
                    if (!file.type.startsWith('image/')) {
                        showNotification('Por favor, selecione apenas arquivos de imagem', 'error');
                        return;
                    }
                    
                    // Validar tamanho do arquivo (máximo 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        showNotification('A imagem deve ter no máximo 5MB', 'error');
                        return;
                    }
                    
                    // Mostrar preview
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        budgetPreviewImg.src = e.target.result;
                        budgetImagePreview.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Configurar botão de remover imagem
        if (budgetRemoveImageBtn) {
            budgetRemoveImageBtn.addEventListener('click', function() {
                budgetImageInput.value = '';
                budgetImagePreview.classList.add('hidden');
                budgetPreviewImg.src = '';
            });
        }
    }

    // ========== FUNCIONALIDADES DO MODAL DE ENVIO ==========
    
    function setupSendBudgetModal() {
        // Fechar modal
        if (closeSendBudgetModal) {
            closeSendBudgetModal.addEventListener('click', closeSendBudgetModalFunc);
        }
        
        if (cancelSendBudget) {
            cancelSendBudget.addEventListener('click', closeSendBudgetModalFunc);
        }
        
        if (sendBudgetModalOverlay) {
            sendBudgetModalOverlay.addEventListener('click', closeSendBudgetModalFunc);
        }
        
        // Confirmar envio
        if (confirmSendBudget) {
            confirmSendBudget.addEventListener('click', handleSendBudget);
        }
        
        // Fechar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sendBudgetModal && !sendBudgetModal.classList.contains('hidden')) {
                closeSendBudgetModalFunc();
            }
        });
    }
    
    function openSendBudgetModal(budgetId) {
        // Encontrar o orçamento
        const budget = budgets.find(b => b.id == budgetId);
        if (!budget) {
            showNotification('Orçamento não encontrado', 'error');
            return;
        }
        
        currentSendBudget = budget;
        selectedSendMethod = null;
        
        // Atualizar informações do orçamento
        updateSendBudgetInfo(budget);
        
        // Resetar seleção
        resetSendMethodSelection();
        
        // Mostrar modal
        if (sendBudgetModal) {
            sendBudgetModal.classList.remove('hidden');
            sendBudgetModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeSendBudgetModalFunc() {
        if (sendBudgetModal) {
            sendBudgetModal.classList.add('hidden');
            sendBudgetModal.classList.remove('show');
            document.body.style.overflow = 'auto';
            
            // Resetar estado
            currentSendBudget = null;
            selectedSendMethod = null;
            resetSendMethodSelection();
        }
    }
    
    function updateSendBudgetInfo(budget) {
        if (!sendBudgetInfo) return;
        
        sendBudgetInfo.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-600"><strong>Cliente:</strong> ${budget.client}</p>
                    <p class="text-sm text-gray-600"><strong>E-mail:</strong> ${budget.email}</p>
                    <p class="text-sm text-gray-600"><strong>Telefone:</strong> ${budget.phone || 'Não informado'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-600"><strong>Serviço:</strong> ${getServiceTypeLabel(budget.service_type)}</p>
                    <p class="text-sm text-gray-600"><strong>Data:</strong> ${formatDate(budget.event_date)} - ${budget.event_time}</p>
                    <p class="text-sm text-gray-600"><strong>Valor:</strong> R$ ${budget.estimated_value.toFixed(2)}</p>
                </div>
            </div>
        `;
    }
    
    function selectSendMethod(method) {
        selectedSendMethod = method;
        
        // Atualizar visual dos radio buttons
        resetSendMethodSelection();
        
        if (method === 'email') {
            document.getElementById('email-radio').classList.add('border-green-500');
            document.getElementById('email-radio-selected').classList.remove('hidden');
            customMessageSection.classList.remove('hidden');
        } else if (method === 'whatsapp') {
            document.getElementById('whatsapp-radio').classList.add('border-green-500');
            document.getElementById('whatsapp-radio-selected').classList.remove('hidden');
            customMessageSection.classList.add('hidden');
        }
        
        // Habilitar botão de confirmação
        if (confirmSendBudget) {
            confirmSendBudget.disabled = false;
        }
    }
    
    function resetSendMethodSelection() {
        // Resetar radio buttons
        document.getElementById('email-radio').classList.remove('border-green-500');
        document.getElementById('whatsapp-radio').classList.remove('border-green-500');
        document.getElementById('email-radio-selected').classList.add('hidden');
        document.getElementById('whatsapp-radio-selected').classList.add('hidden');
        
        // Desabilitar botão de confirmação
        if (confirmSendBudget) {
            confirmSendBudget.disabled = true;
        }
        
        // Ocultar seção de mensagem personalizada
        customMessageSection.classList.add('hidden');
    }
    
    async function handleSendBudget() {
        if (!currentSendBudget || !selectedSendMethod) {
            showNotification('Selecione um método de envio', 'error');
            return;
        }
        
        // Mostrar loading
        if (confirmSendBudget) {
            confirmSendBudget.classList.add('btn-loading');
            confirmSendBudget.disabled = true;
        }
        
        try {
            if (selectedSendMethod === 'email') {
                await sendBudgetByEmail();
            } else if (selectedSendMethod === 'whatsapp') {
                await sendBudgetByWhatsApp();
            }
        } catch (error) {
            showNotification('Erro ao enviar orçamento: ' + error.message, 'error');
        } finally {
            // Remover loading
            if (confirmSendBudget) {
                confirmSendBudget.classList.remove('btn-loading');
                confirmSendBudget.disabled = false;
            }
        }
    }
    
    async function sendBudgetByEmail() {
        const customMessageText = customMessage ? customMessage.value.trim() : '';
        
        const response = await fetch('../services/orcamentos.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'send_email',
                budget_id: currentSendBudget.id,
                custom_message: customMessageText
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Orçamento enviado por e-mail com sucesso!', 'success');
            closeSendBudgetModalFunc();
            
            // Atualizar status do orçamento para "enviado"
            await changeBudgetStatus(currentSendBudget.id, 'enviado');
        } else {
            throw new Error(result.message || 'Erro ao enviar e-mail');
        }
    }
    
    async function sendBudgetByWhatsApp() {
        // Obter dados do decorador
        let userData = null;
        try {
            const storedData = localStorage.getItem('userData');
            if (storedData) {
                userData = JSON.parse(storedData);
            }
        } catch (e) {
            console.warn('Erro ao carregar dados do usuário:', e);
        }
        
        if (!userData || !userData.whatsapp) {
            showNotification('Dados do WhatsApp do decorador não encontrados. Verifique o perfil.', 'error');
            return;
        }
        
        // Gerar link para visualização do orçamento
        const budgetUrl = `${window.location.origin}/pages/painel-decorador.html?view=budget&id=${currentSendBudget.id}`;
        
        // Mensagem para WhatsApp
        const message = `Olá ${currentSendBudget.client}! 

Seu orçamento de decoração com balões está pronto! 🎈

📋 *Detalhes do Serviço:*
• Serviço: ${getServiceTypeLabel(currentSendBudget.service_type)}
• Data: ${formatDate(currentSendBudget.event_date)} às ${currentSendBudget.event_time}
• Local: ${currentSendBudget.event_location}
• Valor: R$ ${currentSendBudget.estimated_value.toFixed(2)}

🔗 *Visualizar orçamento completo:* ${budgetUrl}

Qualquer dúvida, estou à disposição! 😊`;

        // Abrir WhatsApp Web/App usando o número do decorador
        const whatsappUrl = `https://wa.me/${userData.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        showNotification('WhatsApp aberto com a mensagem do orçamento!', 'success');
        closeSendBudgetModalFunc();
        
        // Atualizar status do orçamento para "enviado"
        await changeBudgetStatus(currentSendBudget.id, 'enviado');
    }
    
    // Validar tamanho do arco
    function validateArcSize() {
        if (!budgetArcSize) return true;
        
        const value = parseFloat(budgetArcSize.value);
        const isValid = value >= 0.5 && value <= 30;
        
        if (budgetArcSize.value && !isValid) {
            showFieldError('budget-arc-size', 'Tamanho deve estar entre 0.5 e 30 metros');
            return false;
        } else if (budgetArcSize.required && !budgetArcSize.value) {
            showFieldError('budget-arc-size', 'Tamanho do arco é obrigatório para este tipo de serviço');
            return false;
        }
        
        return true;
    }
    
    function validateCreateBudgetForm() {
        const client = document.getElementById('budget-client');
        const email = document.getElementById('budget-email');
        const eventDate = document.getElementById('budget-event-date');
        const eventTime = document.getElementById('budget-event-time');
        const eventLocation = document.getElementById('budget-event-location');
        const serviceType = document.getElementById('budget-service-type');
        
        // Validar tamanho do arco
        if (!validateArcSize()) {
            return false;
        }
        
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

                            <!-- Tamanho do Arco -->
                            <div class="space-y-2">
                                <label for="edit-budget-arc-size" class="block text-sm font-medium text-gray-700">
                                    <i class="fas fa-ruler mr-2 text-yellow-600"></i>Tamanho do Arco (metros)
                                </label>
                                <input type="number" id="edit-budget-arc-size" name="tamanho_arco_m" step="0.1" min="0.5" max="30"
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                                       placeholder="Ex: 2.5">
                                <div class="text-xs text-gray-500">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    Informe o tamanho do arco em metros (entre 0.5 e 30 metros)
                                </div>
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
            'edit-budget-arc-size': budget.tamanho_arco_m || '',
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
            'edit-budget-arc-size': 'tamanho_arco_m',
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
            
            // Converter tamanho do arco para número se preenchido
            if (budgetData.tamanho_arco_m) {
                budgetData.tamanho_arco_m = parseFloat(budgetData.tamanho_arco_m);
            }
            
            // Remover ID dos dados de atualização
            delete budgetData.id;
            
            // Enviar para o servidor
            const response = await fetch('../services/orcamentos.php', {
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
    
    function toggleBudgetSortOrder() {
        // Alternar entre 'desc' (mais recentes primeiro) e 'asc' (mais antigos primeiro)
        budgetSortOrder = budgetSortOrder === 'desc' ? 'asc' : 'desc';
        
        // Atualizar ícone e texto do botão
        updateSortButtonDisplay();
        
        // Recarregar a exibição dos orçamentos com a nova ordenação
        updateBudgetsDisplay();
        
        // Mostrar notificação
        const sortText = budgetSortOrder === 'desc' ? 'mais recentes primeiro' : 'mais antigos primeiro';
        showNotification(`Orçamentos ordenados pelos ${sortText}`, 'info');
    }
    
    function updateSortButtonDisplay() {
        const sortIcon = document.getElementById('sort-icon');
        const sortText = document.getElementById('sort-text');
        
        if (sortIcon && sortText) {
            if (budgetSortOrder === 'desc') {
                sortIcon.className = 'fas fa-sort-amount-down mr-2';
                sortText.textContent = 'Mais Recentes';
            } else {
                sortIcon.className = 'fas fa-sort-amount-up mr-2';
                sortText.textContent = 'Mais Antigos';
            }
        }
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
        
        // Ordenar orçamentos por data de criação conforme a configuração
        const sortedBudgets = [...budgetsList].sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return budgetSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        
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
                        ${budget.tamanho_arco_m ? `<p class="text-gray-600 text-sm">Tamanho do Arco: ${budget.tamanho_arco_m}m</p>` : ''}
                        ${budget.estimated_value > 0 ? `<p class="text-gray-600 text-sm">Valor: R$ ${budget.estimated_value.toFixed(2)}</p>` : ''}
                    </div>
                    <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 lg:mt-0">
                        <button onclick="showBudgetDetails(${budget.id})" class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors">
                            <i class="fas fa-eye mr-1"></i>Ver Detalhes
                        </button>
                        <button onclick="editBudget(${budget.id})" class="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded hover:bg-yellow-200 transition-colors">
                            <i class="fas fa-edit mr-1"></i>Editar
                        </button>
                        <button onclick="openSendBudgetModal(${budget.id})" class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded hover:bg-green-200 transition-colors">
                            <i class="fas fa-paper-plane mr-1"></i>Enviar
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
                const response = await fetch('../services/orcamentos.php', {
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
                ${budget.image ? `
                    <div class="mb-6">
                        <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                            <i class="fas fa-image mr-2 text-blue-600"></i>Imagem de Inspiração
                        </h4>
                        <div class="relative bg-gray-50 rounded-lg p-4">
                            <img src="../${budget.image}" alt="Imagem de inspiração do orçamento" 
                                 class="w-full max-w-lg mx-auto rounded-lg shadow-md object-cover cursor-pointer hover:shadow-lg transition-shadow duration-200" 
                                 style="max-height: 400px;"
                                 onclick="openImageModal('${budget.image}')"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                            <div class="text-center text-gray-500 text-sm hidden">
                                <i class="fas fa-exclamation-triangle mr-1"></i>
                                Erro ao carregar imagem
                            </div>
                        </div>
                    </div>
                ` : ''}
                
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
                        ${budget.tamanho_arco_m ? `<p class="text-sm text-gray-600"><strong>Tamanho do Arco:</strong> ${budget.tamanho_arco_m}m</p>` : ''}
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
        
        // Configurar evento do botão de impressão
        const printBtn = document.getElementById('print-budget-btn');
        if (printBtn) {
            printBtn.onclick = () => printBudget(budget);
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
                const response = await fetch('../services/orcamentos.php', {
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
                const response = await fetch('../services/orcamentos.php', {
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
            window.location.href = 'login.html';
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
        fetch('../services/orcamentos.php?action=recent')
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
            // Redirecionar para a página de gerenciamento de conta do decorador
            window.location.href = 'login.html';
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

    // ========== FUNCIONALIDADES DO PORTFÓLIO ==========
    
    // Elementos do portfólio
    const addServiceBtn = document.getElementById('add-service-btn');
    const addFirstServiceBtn = document.getElementById('add-first-service-btn');
    const serviceModal = document.getElementById('service-modal');
    const closeServiceModal = document.getElementById('close-service-modal');
    const cancelService = document.getElementById('cancel-service');
    const serviceModalOverlay = document.getElementById('service-modal-overlay');
    const serviceForm = document.getElementById('service-form');
    const saveService = document.getElementById('save-service');
    const servicesGrid = document.getElementById('services-grid');
    const emptyPortfolio = document.getElementById('empty-portfolio');
    const deleteServiceModal = document.getElementById('delete-service-modal');
    const cancelDeleteService = document.getElementById('cancel-delete-service');
    const confirmDeleteService = document.getElementById('confirm-delete-service');
    const deleteServiceModalOverlay = document.getElementById('delete-service-modal-overlay');
    
    // Elementos do editor de imagem
    const imageEditorModal = document.getElementById('image-editor-modal');
    const closeImageEditorModal = document.getElementById('close-image-editor-modal');
    const imageEditorModalOverlay = document.getElementById('image-editor-modal-overlay');
    const imageEditorCanvas = document.getElementById('image-editor-canvas');
    const cancelImageEdit = document.getElementById('cancel-image-edit');
    const applyImageEdit = document.getElementById('apply-image-edit');
    const openImageEditorBtn = document.getElementById('open-image-editor');
    const editImageBtn = document.getElementById('edit-image-btn');
    
    // Elementos de notificação toast
    const toastContainer = document.getElementById('toast-container');
    
    
    // Variáveis do portfólio
    let portfolioServices = [];
    let editingServiceId = null;
    let deletingServiceId = null;
    
    // Variáveis do editor de imagem
    let currentEditingImage = null;
    let originalImageData = null;
    let imageEditorState = {
        zoom: 100,
        position: { x: 0, y: 0 },
        rotation: 0,
        flipHorizontal: false,
        cropRatio: null,
        canvasWidth: 400,
        canvasHeight: 300
    };
    
    // ========== SISTEMA DE NOTIFICAÇÕES TOAST ==========
    
    // Função para mostrar notificação toast
    function showToast(type, title, message, duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="toast-icon ${icons[type]}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
            <div class="toast-progress" style="width: 100%; animation: toast-progress ${duration}ms linear;"></div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Mostrar toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto-remover após duração especificada
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        return toast;
    }
    
    // Funções de conveniência para diferentes tipos de toast
    function showSuccessToast(title, message, duration) {
        return showToast('success', title, message, duration);
    }
    
    function showErrorToast(title, message, duration) {
        return showToast('error', title, message, duration);
    }
    
    function showWarningToast(title, message, duration) {
        return showToast('warning', title, message, duration);
    }
    
    function showInfoToast(title, message, duration) {
        return showToast('info', title, message, duration);
    }
    
    // Carregar serviços do portfólio
    function loadPortfolioServices() {
        // Tentar carregar serviços existentes do localStorage
        const savedServices = localStorage.getItem('portfolio_services');
        
        if (savedServices) {
            try {
                portfolioServices = JSON.parse(savedServices);
            } catch (error) {
                console.error('Erro ao carregar serviços salvos:', error);
                portfolioServices = [];
            }
        } else {
            // Se não há serviços salvos, criar alguns de exemplo
            portfolioServices = [
                {
                    id: 'demo-1',
                    type: 'Arco Tradicional',
                    title: 'Arco de Balões para Aniversário',
                    description: 'Arco tradicional com balões coloridos perfeito para aniversários e comemorações.',
                    price: '150.00',
                    arcSize: '3m de altura',
                    image: null
                },
                {
                    id: 'demo-2',
                    type: 'Centro de Mesa',
                    title: 'Centro de Mesa Elegante',
                    description: 'Centro de mesa com balões e decoração elegante para eventos especiais.',
                    price: '80.00',
                    arcSize: null,
                    image: null
                },
                {
                    id: 'demo-3',
                    type: 'Escultura de Balão',
                    title: 'Escultura de Personagem',
                    description: 'Escultura personalizada de personagens em balões para festas temáticas.',
                    price: '200.00',
                    arcSize: '1.5m de altura',
                    image: null
                }
            ];
            
            savePortfolioServices();
        }
        
        renderPortfolioServices();
    }
    
    // Salvar serviços do portfólio
    function savePortfolioServices() {
        localStorage.setItem('portfolio_services', JSON.stringify(portfolioServices));
        // Atualizar portfólio na página inicial
        updateHomepagePortfolio();
    }
    
    // Renderizar serviços do portfólio (otimizado)
    async function renderPortfolioServices() {
        if (portfolioServices.length === 0) {
            servicesGrid.innerHTML = '';
            emptyPortfolio.classList.remove('hidden');
            return;
        }
        
        emptyPortfolio.classList.add('hidden');
        servicesGrid.innerHTML = '';
        
        // Criar fragmento para melhor performance
        const fragment = document.createDocumentFragment();
        
        // Processar serviços em lotes para melhor performance
        const batchSize = 4;
        const batches = [];
        
        for (let i = 0; i < portfolioServices.length; i += batchSize) {
            batches.push(portfolioServices.slice(i, i + batchSize));
        }
        
        // Processar cada lote
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];
            
            // Mostrar progresso apenas no primeiro lote
            if (batchIndex === 0) {
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'col-span-full flex justify-center items-center py-4';
                loadingDiv.innerHTML = `
                    <div class="flex items-center space-x-2 text-gray-600">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Carregando serviços...</span>
                    </div>
                `;
                servicesGrid.appendChild(loadingDiv);
            }
            
            // Processar lote em paralelo
            const batchPromises = batch.map(async (service) => {
                try {
                    return await createServiceCard(service);
                } catch (error) {
                    console.error('Erro ao criar card do serviço:', error);
                    return createFallbackCard(service);
                }
            });
            
            // Aguardar lote ser processado
            const batchCards = await Promise.all(batchPromises);
            
            // Remover loading se for o primeiro lote
            if (batchIndex === 0) {
                const loadingDiv = servicesGrid.querySelector('.fa-spinner');
                if (loadingDiv) {
                    loadingDiv.parentElement.parentElement.remove();
                }
            }
            
            // Adicionar cards ao fragmento
            batchCards.forEach(card => {
                if (card) {
                    fragment.appendChild(card);
                }
            });
            
            // Adicionar fragmento ao DOM em lotes para melhor performance
            servicesGrid.appendChild(fragment.cloneNode(true));
            
            // Pequena pausa entre lotes para não bloquear a UI
            if (batchIndex < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
    }
    
    // Função auxiliar para criar card de fallback
    function createFallbackCard(service) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md border border-gray-200 p-4';
        card.innerHTML = `
            <div class="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                <i class="fas fa-image text-4xl text-purple-400"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">${service.title || 'Serviço'}</h3>
            <p class="text-gray-600 text-sm mb-3">${service.description || 'Descrição não disponível'}</p>
            ${service.arcSize ? `<p class="text-blue-600 text-sm mb-2"><i class="fas fa-ruler mr-1"></i>${service.arcSize}</p>` : ''}
            <div class="flex justify-between items-center">
                <span class="text-green-600 font-semibold">R$ ${parseFloat(service.price || 0).toFixed(2)}</span>
                <div class="flex space-x-2">
                    <button onclick="editService('${service.id}')" class="text-blue-600 hover:text-blue-800">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteService('${service.id}')" class="text-red-600 hover:text-red-800">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        return card;
    }
    
    // Função otimizada para redimensionar imagem automaticamente mantendo proporção
    function createResponsiveImage(imageSrc, altText, containerClass = 'w-full h-48') {
        return new Promise((resolve) => {
            // Cache de imagens processadas para evitar reprocessamento
            const cacheKey = `processed_${btoa(imageSrc)}_${window.innerWidth}`;
            const cached = sessionStorage.getItem(cacheKey);
            
            if (cached) {
                resolve(cached);
                return;
            }
            
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                try {
                    // Dimensões otimizadas baseadas no container
                    const screenWidth = window.innerWidth;
                    let maxWidth, maxHeight;
                    
                    if (screenWidth < 640) {
                        maxWidth = 280;
                        maxHeight = 160;
                    } else if (screenWidth < 1024) {
                        maxWidth = 300;
                        maxHeight = 180;
                    } else {
                        maxWidth = 320;
                        maxHeight = 200;
                    }
                    
                    // Se a imagem já está no tamanho ideal, usar diretamente
                    if (this.naturalWidth <= maxWidth && this.naturalHeight <= maxHeight) {
                        const imgHtml = `<img src="${imageSrc}" alt="${altText}" class="service-image w-full h-48 object-cover" loading="lazy">`;
                        sessionStorage.setItem(cacheKey, imgHtml);
                        resolve(imgHtml);
                        return;
                    }
                    
                    // Calcular dimensões mantendo proporção
                    const { width, height } = calculateAspectRatio(
                        this.naturalWidth, 
                        this.naturalHeight, 
                        maxWidth, 
                        maxHeight
                    );
                    
                    // Usar OffscreenCanvas se disponível para melhor performance
                    const canvas = window.OffscreenCanvas ? 
                        new OffscreenCanvas(width, height) : 
                        document.createElement('canvas');
                    
                    const ctx = canvas.getContext('2d');
                    
                    // Configurar canvas
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Configurações de qualidade otimizadas
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    // Desenhar imagem redimensionada
                    ctx.drawImage(this, 0, 0, width, height);
                    
                    // Converter para blob para melhor performance
                    canvas.convertToBlob({ 
                        type: 'image/jpeg', 
                        quality: this.naturalWidth > 1000 ? 0.8 : 0.9 
                    }).then(blob => {
                        const url = URL.createObjectURL(blob);
                        const imgHtml = `<img src="${url}" alt="${altText}" class="service-image w-full h-48 object-cover" loading="lazy">`;
                        
                        // Cache o resultado
                        sessionStorage.setItem(cacheKey, imgHtml);
                        
                        // Limpar URL após um tempo para liberar memória
                        setTimeout(() => URL.revokeObjectURL(url), 30000);
                        
                        resolve(imgHtml);
                    }).catch(() => {
                        // Fallback para toDataURL se convertToBlob falhar
                        const resizedImageSrc = canvas.toDataURL('image/jpeg', 0.8);
                        const imgHtml = `<img src="${resizedImageSrc}" alt="${altText}" class="service-image w-full h-48 object-cover" loading="lazy">`;
                        sessionStorage.setItem(cacheKey, imgHtml);
                        resolve(imgHtml);
                    });
                    
                } catch (error) {
                    console.error('Erro ao processar imagem:', error);
                    const fallback = `
                        <div class="service-image-placeholder w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <i class="fas fa-image text-4xl text-purple-400"></i>
                        </div>
                    `;
                    sessionStorage.setItem(cacheKey, fallback);
                    resolve(fallback);
                }
            };
            
            img.onerror = function() {
                console.warn('Erro ao carregar imagem:', imageSrc);
                const fallback = `
                    <div class="service-image-placeholder w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <i class="fas fa-image text-4xl text-purple-400"></i>
                    </div>
                `;
                sessionStorage.setItem(cacheKey, fallback);
                resolve(fallback);
            };
            
            // Timeout reduzido para melhor responsividade
            setTimeout(() => {
                if (!img.complete) {
                    console.warn('Timeout ao carregar imagem:', imageSrc);
                    const fallback = `
                        <div class="service-image-placeholder w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <i class="fas fa-image text-4xl text-purple-400"></i>
                        </div>
                    `;
                    sessionStorage.setItem(cacheKey, fallback);
                    resolve(fallback);
                }
            }, 5000); // Timeout reduzido para 5 segundos
            
            img.src = imageSrc;
        });
    }
    
    // Função para calcular proporção mantendo aspect ratio
    function calculateAspectRatio(originalWidth, originalHeight, maxWidth, maxHeight) {
        const aspectRatio = originalWidth / originalHeight;
        const containerAspectRatio = maxWidth / maxHeight;
        
        let width, height;
        
        if (aspectRatio > containerAspectRatio) {
            // Imagem é mais larga que o container
            width = maxWidth;
            height = maxWidth / aspectRatio;
        } else {
            // Imagem é mais alta que o container
            height = maxHeight;
            width = maxHeight * aspectRatio;
        }
        
        return { width, height };
    }
    
    // Criar card de serviço
    async function createServiceCard(service) {
        const card = document.createElement('div');
        card.className = 'service-card group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-200 overflow-hidden';
        
        // Processar imagem com ajuste automático
        let imageHtml = '';
        if (service.image) {
            try {
                // Usar ajuste automático de imagem
                imageHtml = await createAutoFitImage(service.image, service.title);
            } catch (error) {
                console.error('Erro ao processar imagem:', error);
                imageHtml = createImagePlaceholder();
            }
        } else {
            imageHtml = createImagePlaceholder();
        }
        
        card.innerHTML = `
            <div class="relative">
                <div class="service-image-container">
                    ${imageHtml}
                </div>
                <div class="service-actions">
                    <button class="edit-service-btn" data-id="${service.id}" title="Editar serviço" type="button">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-service-btn" data-id="${service.id}" title="Excluir serviço" type="button">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="p-4">
                <div class="mb-2">
                    <span class="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                        ${service.type}
                    </span>
                </div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">${service.title}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-3">${service.description}</p>
                ${service.arcSize ? `<p class="text-blue-600 text-sm mb-2"><i class="fas fa-ruler mr-1"></i>${service.arcSize}</p>` : ''}
                ${service.price ? `<p class="text-green-600 font-semibold">R$ ${parseFloat(service.price).toFixed(2)}</p>` : ''}
            </div>
        `;
        
        // Adicionar event listeners usando event delegation
        card.addEventListener('click', (e) => {
            if (e.target.closest('.edit-service-btn')) {
                e.preventDefault();
                e.stopPropagation();
                editService(service.id);
            } else if (e.target.closest('.delete-service-btn')) {
                e.preventDefault();
                e.stopPropagation();
                confirmDeleteServiceAction(service.id);
            }
        });
        
        return card;
    }
    
    // Criar placeholder para imagem
    function createImagePlaceholder() {
        return `
            <div class="service-image-placeholder">
                <i class="fas fa-image text-4xl text-purple-400"></i>
                <p class="text-purple-600 text-sm mt-2">Sem imagem</p>
            </div>
        `;
    }
    
    // Criar imagem com ajuste automático
    async function createAutoFitImage(imageSrc, altText) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const containerWidth = 280; // Largura do card
                const containerHeight = 256; // Altura da imagem (16rem)
                
                // Calcular dimensões mantendo proporção
                const imgAspectRatio = img.width / img.height;
                const containerAspectRatio = containerWidth / containerHeight;
                
                let finalWidth, finalHeight;
                
                if (imgAspectRatio > containerAspectRatio) {
                    // Imagem mais larga que o container
                    finalWidth = containerWidth;
                    finalHeight = containerWidth / imgAspectRatio;
                } else {
                    // Imagem mais alta que o container
                    finalHeight = containerHeight;
                    finalWidth = containerHeight * imgAspectRatio;
                }
                
                // Centralizar a imagem
                const offsetX = (containerWidth - finalWidth) / 2;
                const offsetY = (containerHeight - finalHeight) / 2;
                
                resolve(`
                    <img src="${imageSrc}" 
                         alt="${altText || 'Imagem do serviço'}" 
                         class="service-image" 
                         style="width: ${finalWidth}px; height: ${finalHeight}px; object-fit: contain; position: absolute; top: ${offsetY}px; left: ${offsetX}px;">
                `);
            };
            
            img.onerror = function() {
                resolve(createImagePlaceholder());
            };
            
            img.src = imageSrc;
        });
    }
    
    // Abrir modal para adicionar serviço
    function openAddServiceModal() {
        editingServiceId = null;
        serviceForm.reset();
        document.getElementById('service-modal-title').textContent = 'Adicionar Serviço';
        document.getElementById('service-modal-subtitle').textContent = 'Preencha as informações do seu serviço';
        document.getElementById('image-preview').classList.add('hidden');
        serviceModal.classList.remove('hidden');
    }
    
    // Abrir modal para editar serviço
    function editService(serviceId) {
        const service = portfolioServices.find(s => s.id === serviceId);
        if (!service) {
            showErrorToast('Erro', 'Serviço não encontrado.');
            return;
        }
        
        editingServiceId = serviceId;
        document.getElementById('service-modal-title').textContent = 'Editar Serviço';
        document.getElementById('service-modal-subtitle').textContent = 'Atualize as informações do seu serviço';
        
        // Preencher formulário
        document.getElementById('service-type').value = service.type;
        document.getElementById('service-title').value = service.title;
        document.getElementById('service-description').value = service.description;
        document.getElementById('service-price').value = service.price || '';
        document.getElementById('service-arc-size').value = service.arcSize || '';
        
        // Mostrar preview da imagem se existir
        if (service.image) {
            const preview = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-img');
            previewImg.src = service.image;
            preview.classList.remove('hidden');
            document.getElementById('open-image-editor').classList.remove('hidden');
        } else {
            document.getElementById('image-preview').classList.add('hidden');
            document.getElementById('open-image-editor').classList.add('hidden');
        }
        
        serviceModal.classList.remove('hidden');
        showInfoToast('Editando Serviço', 'Modifique as informações conforme necessário.');
    }
    
    // Confirmar exclusão de serviço
    function confirmDeleteServiceAction(serviceId) {
        deletingServiceId = serviceId;
        deleteServiceModal.classList.remove('hidden');
    }
    
    // Excluir serviço
    function deleteService() {
        if (deletingServiceId) {
            portfolioServices = portfolioServices.filter(s => s.id !== deletingServiceId);
            savePortfolioServices();
            renderPortfolioServices();
            deleteServiceModal.classList.add('hidden');
            deletingServiceId = null;
            showSuccessToast('Serviço Excluído', 'O serviço foi removido do seu portfólio com sucesso.');
        }
    }

    // ========== EDITOR DE IMAGEM ==========
    
    // Abrir editor de imagem
    function openImageEditor(imageFile) {
        if (!imageFile) return;
        
        currentEditingImage = imageFile;
        
        // Ler arquivo como data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                originalImageData = e.target.result;
                setupImageEditor(img);
                imageEditorModal.classList.remove('hidden');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(imageFile);
    }
    
    // Configurar editor de imagem
    function setupImageEditor(img) {
        const canvas = imageEditorCanvas;
        const ctx = canvas.getContext('2d');
        
        // Resetar estado
        imageEditorState = {
            zoom: 100,
            position: { x: 0, y: 0 },
            rotation: 0,
            flipHorizontal: false,
            cropRatio: null,
            canvasWidth: 400,
            canvasHeight: 300
        };
        
        // Configurar canvas
        canvas.width = imageEditorState.canvasWidth;
        canvas.height = imageEditorState.canvasHeight;
        
        // Desenhar imagem inicial
        drawImageOnCanvas(img);
        
        // Atualizar preview
        updateImagePreview();
    }
    
    // Desenhar imagem no canvas
    function drawImageOnCanvas(img) {
        const canvas = imageEditorCanvas;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calcular dimensões com zoom
        const scale = imageEditorState.zoom / 100;
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;
        
        // Aplicar rotação
        ctx.save();
        
        if (imageEditorState.rotation !== 0) {
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((imageEditorState.rotation * Math.PI) / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }
        
        // Aplicar flip horizontal
        if (imageEditorState.flipHorizontal) {
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
        }
        
        // Calcular posição
        let x = (canvas.width - imgWidth) / 2 + imageEditorState.position.x;
        let y = (canvas.height - imgHeight) / 2 + imageEditorState.position.y;
        
        // Desenhar imagem
        ctx.drawImage(img, x, y, imgWidth, imgHeight);
        
        ctx.restore();
    }
    
    // Atualizar preview da imagem
    function updateImagePreview() {
        const previewContainer = document.getElementById('image-preview-result');
        const canvas = imageEditorCanvas;
        
        // Criar preview em miniatura
        const previewCanvas = document.createElement('canvas');
        const previewCtx = previewCanvas.getContext('2d');
        
        previewCanvas.width = 200;
        previewCanvas.height = 150;
        
        // Redimensionar canvas para preview
        previewCtx.drawImage(canvas, 0, 0, 200, 150);
        
        previewContainer.innerHTML = '';
        previewContainer.appendChild(previewCanvas);
    }
    
    // Aplicar zoom
    function applyZoom(zoomLevel) {
        imageEditorState.zoom = Math.max(50, Math.min(200, zoomLevel));
        document.getElementById('zoom-value').textContent = imageEditorState.zoom + '%';
        
        if (currentEditingImage) {
            const img = new Image();
            img.onload = () => drawImageOnCanvas(img);
            img.src = originalImageData;
        }
    }
    
    // Aplicar posição
    function applyPosition(position) {
        const positions = {
            'top-left': { x: -50, y: -50 },
            'top': { x: 0, y: -50 },
            'top-right': { x: 50, y: -50 },
            'left': { x: -50, y: 0 },
            'center': { x: 0, y: 0 },
            'right': { x: 50, y: 0 },
            'bottom-left': { x: -50, y: 50 },
            'bottom': { x: 0, y: 50 },
            'bottom-right': { x: 50, y: 50 }
        };
        
        imageEditorState.position = positions[position] || { x: 0, y: 0 };
        
        // Atualizar botões ativos
        document.querySelectorAll('[id^="pos-"]').forEach(btn => {
            btn.classList.remove('pos-button-active');
        });
        document.getElementById(`pos-${position}`).classList.add('pos-button-active');
        
        if (currentEditingImage) {
            const img = new Image();
            img.onload = () => drawImageOnCanvas(img);
            img.src = originalImageData;
        }
    }
    
    // Aplicar rotação
    function applyRotation(degrees) {
        imageEditorState.rotation += degrees;
        
        if (currentEditingImage) {
            const img = new Image();
            img.onload = () => drawImageOnCanvas(img);
            img.src = originalImageData;
        }
    }
    
    // Aplicar flip horizontal
    function applyFlipHorizontal() {
        imageEditorState.flipHorizontal = !imageEditorState.flipHorizontal;
        
        if (currentEditingImage) {
            const img = new Image();
            img.onload = () => drawImageOnCanvas(img);
            img.src = originalImageData;
        }
    }
    
    // Resetar imagem
    function resetImageEditor() {
        imageEditorState = {
            zoom: 100,
            position: { x: 0, y: 0 },
            rotation: 0,
            flipHorizontal: false,
            cropRatio: null,
            canvasWidth: 400,
            canvasHeight: 300
        };
        
        document.getElementById('zoom-value').textContent = '100%';
        document.getElementById('zoom-slider').value = 100;
        
        // Resetar botões ativos
        document.querySelectorAll('[id^="pos-"]').forEach(btn => {
            btn.classList.remove('pos-button-active');
        });
        document.getElementById('pos-center').classList.add('pos-button-active');
        
        if (currentEditingImage) {
            const img = new Image();
            img.onload = () => drawImageOnCanvas(img);
            img.src = originalImageData;
        }
    }
    
    // Aplicar edições da imagem
    function applyImageEdits() {
        if (!currentEditingImage) return;
        
        const canvas = imageEditorCanvas;
        
        // Converter canvas para blob
        canvas.toBlob((blob) => {
            // Criar novo arquivo File
            const editedFile = new File([blob], currentEditingImage.name, {
                type: currentEditingImage.type,
                lastModified: Date.now()
            });
            
            // Atualizar input de arquivo
            const fileInput = document.getElementById('service-image');
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(editedFile);
            fileInput.files = dataTransfer.files;
            
            // Atualizar preview
            const preview = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-img');
            previewImg.src = canvas.toDataURL();
            preview.classList.remove('hidden');
            document.getElementById('open-image-editor').classList.remove('hidden');
            
            // Fechar modal
            imageEditorModal.classList.add('hidden');
            
            showSuccessToast('Imagem Editada', 'As alterações na imagem foram aplicadas com sucesso.');
        }, currentEditingImage.type, 0.9);
    }
    
    // Processar imagem
    function processImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }
    
    // Salvar serviço
    async function saveServiceData(formData) {
        try {
        const serviceData = {
            id: editingServiceId || Date.now().toString(),
            type: formData.get('type'),
            title: formData.get('title'),
            description: formData.get('description'),
            price: formData.get('price') || null,
            arcSize: formData.get('arcSize') || null,
            image: null
        };
        
        // Processar imagem se fornecida
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            serviceData.image = await processImage(imageFile);
        } else if (editingServiceId) {
            // Manter imagem existente se não for fornecida nova imagem
            const existingService = portfolioServices.find(s => s.id === editingServiceId);
            if (existingService) {
                serviceData.image = existingService.image;
            }
        }
        
        if (editingServiceId) {
            // Editar serviço existente
            const index = portfolioServices.findIndex(s => s.id === editingServiceId);
            if (index !== -1) {
                portfolioServices[index] = serviceData;
                    showSuccessToast('Serviço Atualizado', 'As alterações foram salvas com sucesso.');
                } else {
                    showErrorToast('Erro', 'Serviço não encontrado para atualização.');
                    return;
            }
        } else {
            // Adicionar novo serviço
            portfolioServices.push(serviceData);
                showSuccessToast('Serviço Adicionado', 'Novo serviço foi adicionado ao seu portfólio.');
        }
        
        savePortfolioServices();
        renderPortfolioServices();
        serviceModal.classList.add('hidden');
            
            // Resetar formulário
            editingServiceId = null;
            document.getElementById('image-preview').classList.add('hidden');
            document.getElementById('open-image-editor').classList.add('hidden');
            
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            showErrorToast('Erro', 'Ocorreu um erro ao salvar o serviço. Tente novamente.');
        }
    }
    
    // Atualizar portfólio na página inicial
    function updateHomepagePortfolio() {
        // Salvar dados no localStorage
        localStorage.setItem('homepage_portfolio', JSON.stringify(portfolioServices));
        
        // Adicionar timestamp para controle de versão
        localStorage.setItem('homepage_portfolio_updated', Date.now().toString());
        
        // Disparar evento customizado para notificar outras abas/páginas
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            const event = new CustomEvent('portfolioUpdated', {
                detail: {
                    services: portfolioServices,
                    timestamp: Date.now()
                }
            });
            window.dispatchEvent(event);
        }
        
        // Notificar via BroadcastChannel se disponível (para comunicação entre abas)
        if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel('portfolio_updates');
            channel.postMessage({
                type: 'portfolio_updated',
                data: portfolioServices,
                timestamp: Date.now()
            });
            channel.close();
        }
    }
    
    // Configurar event listeners do portfólio
    function setupPortfolioEventListeners() {
        // Botões para abrir modal de adicionar serviço
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', openAddServiceModal);
        }
        
        if (addFirstServiceBtn) {
            addFirstServiceBtn.addEventListener('click', openAddServiceModal);
        }
        
        // Fechar modal de serviço
        if (closeServiceModal) {
            closeServiceModal.addEventListener('click', () => serviceModal.classList.add('hidden'));
        }
        
        if (cancelService) {
            cancelService.addEventListener('click', () => serviceModal.classList.add('hidden'));
        }
        
        if (serviceModalOverlay) {
            serviceModalOverlay.addEventListener('click', () => serviceModal.classList.add('hidden'));
        }
        
        // Preview de imagem e editor
        const serviceImageInput = document.getElementById('service-image');
        if (serviceImageInput) {
            serviceImageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const preview = document.getElementById('image-preview');
                        const previewImg = document.getElementById('preview-img');
                        previewImg.src = e.target.result;
                        preview.classList.remove('hidden');
                        document.getElementById('open-image-editor').classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Editor de imagem
        if (openImageEditorBtn) {
            openImageEditorBtn.addEventListener('click', () => {
                const fileInput = document.getElementById('service-image');
                if (fileInput.files.length > 0) {
                    openImageEditor(fileInput.files[0]);
                } else {
                    showWarningToast('Nenhuma Imagem', 'Selecione uma imagem primeiro para editá-la.');
                }
            });
        }
        
        if (editImageBtn) {
            editImageBtn.addEventListener('click', () => {
                const fileInput = document.getElementById('service-image');
                if (fileInput.files.length > 0) {
                    openImageEditor(fileInput.files[0]);
                }
            });
        }
        
        // Event listeners do editor de imagem
        if (closeImageEditorModal) {
            closeImageEditorModal.addEventListener('click', () => imageEditorModal.classList.add('hidden'));
        }
        
        if (imageEditorModalOverlay) {
            imageEditorModalOverlay.addEventListener('click', () => imageEditorModal.classList.add('hidden'));
        }
        
        if (cancelImageEdit) {
            cancelImageEdit.addEventListener('click', () => imageEditorModal.classList.add('hidden'));
        }
        
        if (applyImageEdit) {
            applyImageEdit.addEventListener('click', applyImageEdits);
        }
        
        // Controles de zoom
        const zoomSlider = document.getElementById('zoom-slider');
        if (zoomSlider) {
            zoomSlider.addEventListener('input', (e) => applyZoom(parseInt(e.target.value)));
        }
        
        const zoomInBtn = document.getElementById('zoom-in');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => applyZoom(imageEditorState.zoom + 10));
        }
        
        const zoomOutBtn = document.getElementById('zoom-out');
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => applyZoom(imageEditorState.zoom - 10));
        }
        
        const zoomResetBtn = document.getElementById('zoom-reset');
        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', () => applyZoom(100));
        }
        
        // Controles de posição
        const positionButtons = document.querySelectorAll('[id^="pos-"]');
        positionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const position = btn.id.replace('pos-', '');
                applyPosition(position);
            });
        });
        
        // Controles de rotação
        const rotateLeftBtn = document.getElementById('rotate-left');
        if (rotateLeftBtn) {
            rotateLeftBtn.addEventListener('click', () => applyRotation(-90));
        }
        
        const rotateRightBtn = document.getElementById('rotate-right');
        if (rotateRightBtn) {
            rotateRightBtn.addEventListener('click', () => applyRotation(90));
        }
        
        const flipHorizontalBtn = document.getElementById('flip-horizontal');
        if (flipHorizontalBtn) {
            flipHorizontalBtn.addEventListener('click', applyFlipHorizontal);
        }
        
        const resetImageBtn = document.getElementById('reset-image');
        if (resetImageBtn) {
            resetImageBtn.addEventListener('click', resetImageEditor);
        }
        
        // Salvar serviço
        if (serviceForm) {
            serviceForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(serviceForm);
                await saveServiceData(formData);
            });
        }
        
        // Modal de confirmação de exclusão
        if (cancelDeleteService) {
            cancelDeleteService.addEventListener('click', () => deleteServiceModal.classList.add('hidden'));
        }
        
        if (confirmDeleteService) {
            confirmDeleteService.addEventListener('click', deleteService);
        }
        
        if (deleteServiceModalOverlay) {
            deleteServiceModalOverlay.addEventListener('click', () => deleteServiceModal.classList.add('hidden'));
        }
    }
    
    // Função para recarregar imagens quando a tela for redimensionada
    function handleResize() {
        if (currentModule === 'portfolio' && portfolioServices.length > 0) {
            // Debounce para evitar muitas chamadas durante o redimensionamento
            clearTimeout(window.resizeTimeout);
            window.resizeTimeout = setTimeout(() => {
                renderPortfolioServices();
            }, 300);
        }
    }
    
    // Inicializar portfólio
    function initPortfolio() {
        loadPortfolioServices();
        setupPortfolioEventListeners();
        
        // Adicionar listener para redimensionamento da tela
        window.addEventListener('resize', handleResize);
    }
    
    // Função para limpar e recriar portfólio
    function resetPortfolio() {
        localStorage.removeItem('portfolio_services');
        portfolioServices = [];
        renderPortfolioServices();
        showSuccessToast('Portfólio Limpo', 'Todos os serviços foram removidos.');
    }
    
    // Chamar inicialização do portfólio
    initPortfolio();
    
    // Disponibilizar funções globalmente para debug
    window.editService = editService;
    window.confirmDeleteServiceAction = confirmDeleteServiceAction;
    window.portfolioServices = () => portfolioServices;
    window.resetPortfolio = resetPortfolio;

    // Função para imprimir orçamento
    window.printBudget = function(budget) {
        // Criar uma nova janela para impressão
        const printWindow = window.open('', '_blank');
        
        // Conteúdo HTML para impressão
        const printContent = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Orçamento - ${budget.client}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #10b981;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .logo {
                        font-size: 24px;
                        font-weight: bold;
                        color: #10b981;
                        margin-bottom: 10px;
                    }
                    .budget-title {
                        font-size: 20px;
                        color: #374151;
                        margin: 0;
                    }
                    .section {
                        margin-bottom: 25px;
                    }
                    .section-title {
                        font-size: 16px;
                        font-weight: bold;
                        color: #374151;
                        margin-bottom: 10px;
                        border-bottom: 1px solid #e5e7eb;
                        padding-bottom: 5px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    .info-item {
                        margin-bottom: 8px;
                    }
                    .info-label {
                        font-weight: bold;
                        color: #6b7280;
                    }
                    .info-value {
                        color: #374151;
                    }
                    .image-container {
                        text-align: center;
                        margin: 20px 0;
                        page-break-inside: avoid;
                    }
                    .budget-image {
                        max-width: 100%;
                        max-height: 500px;
                        width: auto;
                        height: auto;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        border: 2px solid #e5e7eb;
                        object-fit: contain;
                    }
                    @media print {
                        .budget-image {
                            max-height: 400px;
                            box-shadow: none;
                            border: 1px solid #d1d5db;
                        }
                    }
                    .value {
                        font-size: 18px;
                        font-weight: bold;
                        color: #10b981;
                    }
                    .status {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    .status-pendente { background-color: #fef3c7; color: #92400e; }
                    .status-aprovado { background-color: #d1fae5; color: #065f46; }
                    .status-rejeitado { background-color: #fee2e2; color: #991b1b; }
                    .status-cancelado { background-color: #f3f4f6; color: #374151; }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        color: #6b7280;
                        font-size: 12px;
                    }
                    @media print {
                        body { margin: 0; padding: 15px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">Up.Baloes</div>
                    <h1 class="budget-title">Detalhes do Orçamento</h1>
                </div>

                ${budget.image ? `
                    <div class="image-container">
                        <h3 style="text-align: center; color: #374151; margin-bottom: 15px; font-size: 16px;">
                            <i class="fas fa-image" style="margin-right: 8px; color: #3b82f6;"></i>Imagem de Inspiração
                        </h3>
                        <img src="../${budget.image}" alt="Imagem de inspiração do orçamento" class="budget-image">
                    </div>
                ` : ''}

                <div class="info-grid">
                    <div class="section">
                        <div class="section-title">Informações do Cliente</div>
                        <div class="info-item">
                            <span class="info-label">Nome:</span>
                            <span class="info-value">${budget.client}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value">${budget.email}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Telefone:</span>
                            <span class="info-value">${budget.phone || 'Não informado'}</span>
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Informações do Evento</div>
                        <div class="info-item">
                            <span class="info-label">Data:</span>
                            <span class="info-value">${formatDate(budget.event_date)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Hora:</span>
                            <span class="info-value">${budget.event_time}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Local:</span>
                            <span class="info-value">${budget.event_location}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Tipo:</span>
                            <span class="info-value">${getServiceTypeLabel(budget.service_type)}</span>
                        </div>
                        ${budget.tamanho_arco_m ? `
                        <div class="info-item">
                            <span class="info-label">Tamanho do Arco:</span>
                            <span class="info-value">${budget.tamanho_arco_m}m</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                ${budget.description ? `
                    <div class="section">
                        <div class="section-title">Descrição</div>
                        <p>${budget.description}</p>
                    </div>
                ` : ''}

                ${budget.estimated_value > 0 ? `
                    <div class="section">
                        <div class="section-title">Valor Estimado</div>
                        <p class="value">R$ ${budget.estimated_value.toFixed(2)}</p>
                    </div>
                ` : ''}

                ${budget.notes ? `
                    <div class="section">
                        <div class="section-title">Observações</div>
                        <p>${budget.notes}</p>
                    </div>
                ` : ''}

                <div class="section">
                    <div class="section-title">Status e Data de Criação</div>
                    <p>
                        <span class="status status-${budget.status}">${getStatusLabel(budget.status)}</span>
                        <span style="margin-left: 15px; color: #6b7280;">Criado em: ${formatDate(budget.created_at)}</span>
                    </p>
                </div>

                <div class="footer">
                    <p>Este documento foi gerado automaticamente pelo sistema Up.Baloes</p>
                    <p>Data de impressão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
                </div>
            </body>
            </html>
        `;
        
        // Escrever o conteúdo na nova janela
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Aguardar o carregamento das imagens e então imprimir
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        };
    };

    // ========== FUNCIONALIDADES DO MODAL DE IMAGEM ==========
    
    function openImageModal(imagePath) {
        const imageModal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const closeImageModal = document.getElementById('close-image-modal');
        const imageModalOverlay = document.getElementById('image-modal-overlay');
        
        if (imageModal && modalImage) {
            // Definir a imagem
            modalImage.src = '../' + imagePath;
            
            // Mostrar modal
            imageModal.classList.remove('hidden');
            imageModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Configurar eventos de fechamento
            if (closeImageModal) {
                closeImageModal.onclick = closeImageModalFunc;
            }
            
            if (imageModalOverlay) {
                imageModalOverlay.onclick = closeImageModalFunc;
            }
            
            // Fechar com ESC
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    closeImageModalFunc();
                    document.removeEventListener('keydown', handleKeyDown);
                }
            };
            document.addEventListener('keydown', handleKeyDown);
        }
    }
    
    function closeImageModalFunc() {
        const imageModal = document.getElementById('image-modal');
        if (imageModal) {
            imageModal.classList.add('hidden');
            imageModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }

    // ========== FUNÇÕES GLOBAIS PARA O MODAL DE ENVIO ==========
    
    // Expor funções globalmente para uso no HTML
    window.openSendBudgetModal = openSendBudgetModal;
    window.selectSendMethod = selectSendMethod;
    window.openImageModal = openImageModal;

    console.log('Dashboard do Decorador - Sistema carregado com sucesso!');
});