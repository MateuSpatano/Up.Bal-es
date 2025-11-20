// JavaScript para o Dashboard do Decorador - Up.Baloes

// Função global simples de notificação (será substituída pela versão completa após DOMContentLoaded)
window.showNotification = function(message, type = 'info') {
    // Versão simples usando alert até que a versão completa esteja disponível
    alert(message);
};

// Funções globais para editar e excluir horários (definidas antes do DOMContentLoaded)
function editTimeSchedule(scheduleId) {
    const scheduleItem = document.querySelector(`[data-schedule-id="${scheduleId}"]`);
    if (!scheduleItem) return;
    
    // Tornar os campos editáveis
    const fields = scheduleItem.querySelector('.time-schedule-fields');
    if (!fields) return;
    
    const daySelect = fields.querySelector('select[name="schedule_day"]');
    const startTimeInput = fields.querySelector('input[name="start_time"]');
    const endTimeInput = fields.querySelector('input[name="end_time"]');
    
    if (daySelect && startTimeInput && endTimeInput) {
        // Remover atributo disabled se existir
        daySelect.disabled = false;
        startTimeInput.disabled = false;
        endTimeInput.disabled = false;
        
        // Adicionar classe de edição
        scheduleItem.classList.add('editing');
        
        // Mudar botão de editar para salvar
        const editBtn = scheduleItem.querySelector('.edit-schedule-btn');
        if (editBtn) {
            editBtn.innerHTML = '<i class="fas fa-check"></i>';
            editBtn.onclick = function() {
                saveTimeSchedule(scheduleId);
            };
        }
        
        // Focar no primeiro campo
        daySelect.focus();
    }
}

function deleteTimeSchedule(scheduleId) {
    if (confirm('Tem certeza que deseja excluir este horário?')) {
        const scheduleItem = document.querySelector(`[data-schedule-id="${scheduleId}"]`);
        if (scheduleItem) {
            scheduleItem.remove();
            // Tentar usar showNotification global, senão usar alert
            if (window.showNotification && typeof window.showNotification === 'function') {
                window.showNotification('Horário excluído com sucesso!', 'success');
            } else {
                alert('Horário excluído com sucesso!');
            }
        }
    }
}

function saveTimeSchedule(scheduleId) {
    const scheduleItem = document.querySelector(`[data-schedule-id="${scheduleId}"]`);
    if (!scheduleItem) return;
    
    const fields = scheduleItem.querySelector('.time-schedule-fields');
    if (!fields) return;
    
    const daySelect = fields.querySelector('select[name="schedule_day"]');
    const startTimeInput = fields.querySelector('input[name="start_time"]');
    const endTimeInput = fields.querySelector('input[name="end_time"]');
    
    // Validar campos
    if (!daySelect || !daySelect.value || !startTimeInput || !startTimeInput.value || !endTimeInput || !endTimeInput.value) {
        if (typeof showNotification === 'function') {
            showNotification('Preencha todos os campos do horário', 'error');
        } else {
            alert('Preencha todos os campos do horário');
        }
        return;
    }
    
    if (startTimeInput.value >= endTimeInput.value) {
        if (typeof showNotification === 'function') {
            showNotification('Horário de início deve ser anterior ao horário de fim', 'error');
        } else {
            alert('Horário de início deve ser anterior ao horário de fim');
        }
        return;
    }
    
    // Remover atributo disabled para garantir que os valores sejam coletados ao salvar
    if (daySelect.disabled) daySelect.disabled = false;
    if (startTimeInput.disabled) startTimeInput.disabled = false;
    if (endTimeInput.disabled) endTimeInput.disabled = false;
    
    // Remover classe de edição
    scheduleItem.classList.remove('editing');
    
    // Restaurar botão de editar
    const editBtn = scheduleItem.querySelector('.edit-schedule-btn');
    if (editBtn) {
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.onclick = function() {
            editTimeSchedule(scheduleId);
        };
    }
    
    if (typeof showNotification === 'function') {
        showNotification('Horário atualizado com sucesso!', 'success');
    } else {
        alert('Horário atualizado com sucesso!');
    }
}

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
    const userDisplayName = document.getElementById('user-display-name');
    
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
    let currentModule = 'painel-gerencial';
    let budgets = [];
    let filteredBudgets = [];
    let currentFilters = {};
    let calendarInstance = null;
    let budgetSortOrder = 'desc'; // 'desc' para mais recentes primeiro, 'asc' para mais antigos primeiro
    let currentView = 'list';
    let currentSendBudget = null;
    let selectedSendMethod = null;
    
    // Variáveis para validação de disponibilidade
    let availabilityValidationTimeout = null;
    let availabilityValidationSetup = false;

    // ========== INICIALIZAÇÃO ==========
    
    // Verificar autenticação antes de continuar
    (async function() {
        // Verificar se é decorador
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.role !== 'decorator') {
            window.location.replace('login.html');
            return;
        }
        
        // Verificar autenticação no backend se a proteção estiver disponível
        if (window.authProtection) {
            const isProtected = await window.authProtection.protectDecoratorPage();
            if (!isProtected) {
                return;
            }
            window.authProtection.protectBrowserNavigation('decorator');
        }
        
        // Carregar dados do usuário
        loadUserData();
        
        // Configurar event listeners
        setupEventListeners();
    })();
    
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
    
    // Verificar se há hash na URL (ex: #dashboard)
    const urlHash = window.location.hash.replace('#', '');
    let initialModule = 'painel-gerencial';
    
    // Se houver hash na URL e corresponder a um módulo válido, usar esse módulo
    if (urlHash) {
        const validModules = ['painel-gerencial', 'personalizar-tela', 'portfolio', 'agenda', 'dashboard', 'account'];
        if (validModules.includes(urlHash)) {
            initialModule = urlHash;
        }
    }
    
    // Mostrar módulo inicial
    showModule(initialModule);

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
        setupCostModalEventListeners();
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
        console.log('Mostrando módulo:', moduleName);
        
        // Ocultar todos os módulos
        moduleContents.forEach(module => {
            module.classList.add('hidden');
        });
        
        // Mostrar módulo selecionado
        const targetModule = document.getElementById(`${moduleName}-module`);
        if (targetModule) {
            targetModule.classList.remove('hidden');
            targetModule.classList.add('content-enter');
            console.log('Módulo exibido:', moduleName);
        } else {
            console.error('Módulo não encontrado:', `${moduleName}-module`);
        }
        
        // Atualizar item de navegação ativo
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-module') === moduleName) {
                item.classList.add('active');
            }
        });
        
        // Atualizar título da página
        updatePageTitle(moduleName);
        
        // Atualizar estado atual
        currentModule = moduleName;
        
        // Controlar visibilidade do botão flutuante
        toggleFloatingButton(moduleName);
        
        // Aguardar um pouco para garantir que o DOM está atualizado antes de carregar dados
        setTimeout(() => {
            // Simular carregamento de dados do módulo
            loadModuleData(moduleName);
        }, 100);
    }
    
    function toggleFloatingButton(moduleName) {
        const floatingBtn = document.getElementById('floating-add-btn');
        if (!floatingBtn) return;
        
        // Ocultar botão no módulo de agenda e personalizar tela
        if (moduleName === 'agenda' || moduleName === 'personalizar-tela') {
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
            'personalizar-tela': 'Personalizar Tela Inicial',
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
            case 'personalizar-tela':
                loadPersonalizarTelaData();
                break;
            case 'portfolio':
                loadPortfolioData();
                break;
            case 'agenda':
                loadAgendaData();
                break;
            case 'dashboard':
                loadDashboardData();
                loadProjetosConcluidos();
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
        
        // Atualizar lucro total do mês
        const lucroTotal = kpis.lucro_total_mes || 0;
        document.getElementById('kpi-lucro-total-mes').textContent = formatCurrency(lucroTotal);
        
        // Atualizar margem média de lucro
        const margemMedia = kpis.margem_media_lucro || 0;
        document.getElementById('kpi-margem-media-lucro').textContent = margemMedia.toFixed(1) + '%';
        
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
    
    // ========== FUNCIONALIDADES DE LANÇAMENTO DE CUSTOS ==========
    
    let projetosConcluidos = [];
    let currentProjectId = null;
    
    function setupCostModalEventListeners() {
        // Botão de atualizar projetos concluídos
        const refreshBtn = document.getElementById('refresh-projetos-concluidos');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadProjetosConcluidos);
        }
        
        // Modal de custos
        const costModal = document.getElementById('cost-modal');
        const closeCostModalBtn = document.getElementById('close-cost-modal');
        const cancelCostBtn = document.getElementById('cancel-cost');
        const costModalOverlay = document.getElementById('cost-modal-overlay');
        
        if (closeCostModalBtn) {
            closeCostModalBtn.addEventListener('click', closeCostModal);
        }
        
        if (cancelCostBtn) {
            cancelCostBtn.addEventListener('click', closeCostModal);
        }
        
        if (costModalOverlay) {
            costModalOverlay.addEventListener('click', closeCostModal);
        }
        
        // Formulário de custos
        const costForm = document.getElementById('cost-form');
        if (costForm) {
            costForm.addEventListener('submit', handleCostSubmit);
        }
        
        // Campos de custos para cálculo em tempo real
        const costInputs = ['cost-materiais', 'cost-mao-obra', 'cost-diversos'];
        costInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', updateCostCalculations);
            }
        });
    }
    
    function loadProjetosConcluidos() {
        showProjetosConcluidosLoading();
        
        fetch('../services/painel.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getData'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.projetos_concluidos) {
                projetosConcluidos = data.projetos_concluidos;
                renderProjetosConcluidos();
            } else {
                showProjetosConcluidosError(data.message || 'Erro ao carregar projetos.');
            }
        })
        .catch(error => {
            console.error('Erro ao carregar projetos concluídos:', error);
            showProjetosConcluidosError('Erro de conexão. Verifique sua internet e tente novamente.');
        });
    }
    
    function showProjetosConcluidosLoading() {
        document.getElementById('projetos-concluidos-loading').classList.remove('hidden');
        document.getElementById('projetos-concluidos-empty').classList.add('hidden');
        document.getElementById('projetos-concluidos-list').classList.add('hidden');
    }
    
    function showProjetosConcluidosError(message) {
        document.getElementById('projetos-concluidos-loading').classList.add('hidden');
        document.getElementById('projetos-concluidos-empty').classList.add('hidden');
        document.getElementById('projetos-concluidos-list').classList.add('hidden');
        
        // Mostrar erro temporário
        const listContainer = document.getElementById('projetos-concluidos-list');
        listContainer.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-exclamation-triangle text-2xl text-red-600"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Erro ao carregar projetos</h3>
                <p class="text-gray-600 mb-4">${message}</p>
                <button onclick="loadProjetosConcluidos()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    <i class="fas fa-redo mr-2"></i>Tentar Novamente
                </button>
            </div>
        `;
        listContainer.classList.remove('hidden');
    }
    
    function renderProjetosConcluidos() {
        document.getElementById('projetos-concluidos-loading').classList.add('hidden');
        
        if (projetosConcluidos.length === 0) {
            document.getElementById('projetos-concluidos-empty').classList.remove('hidden');
            document.getElementById('projetos-concluidos-list').classList.add('hidden');
            return;
        }
        
        document.getElementById('projetos-concluidos-empty').classList.add('hidden');
        const listContainer = document.getElementById('projetos-concluidos-list');
        
        listContainer.innerHTML = projetosConcluidos.map(projeto => {
            const dataFormatada = formatDate(projeto.data_evento);
            const valorFormatado = formatCurrency(projeto.valor_estimado);
            const tipoServico = getServiceTypeLabel(projeto.tipo_servico);
            const custosLancados = projeto.custos_lancados;
            
            return `
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <h4 class="font-semibold text-gray-800">${projeto.cliente}</h4>
                                <span class="px-2 py-1 text-xs font-medium rounded-full ${custosLancados ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                    ${custosLancados ? 'Custos Lançados' : 'Pendente'}
                                </span>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                <div>
                                    <i class="fas fa-calendar mr-1"></i>
                                    ${dataFormatada}
                                </div>
                                <div>
                                    <i class="fas fa-tag mr-1"></i>
                                    ${tipoServico}
                                </div>
                                <div>
                                    <i class="fas fa-dollar-sign mr-1"></i>
                                    ${valorFormatado}
                                </div>
                            </div>
                            <div class="mt-2 text-sm text-gray-600">
                                <i class="fas fa-map-marker-alt mr-1"></i>
                                ${projeto.local_evento}
                            </div>
                        </div>
                        <div class="flex items-center space-x-2 ml-4">
                            <button onclick="openCostModal(${projeto.id})" 
                                    class="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 text-sm font-medium">
                                <i class="fas fa-calculator mr-1"></i>
                                ${custosLancados ? 'Editar Custos' : 'Lançar Custos'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        listContainer.classList.remove('hidden');
    }
    
    function openCostModal(orcamentoId) {
        currentProjectId = orcamentoId;
        
        // Buscar detalhes do projeto
        fetch('../services/painel.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getDetalhesCustos',
                orcamento_id: orcamentoId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.projeto) {
                populateCostModal(data.projeto);
                showCostModal();
            } else {
                showNotification('Erro ao carregar dados do projeto.', 'error');
            }
        })
        .catch(error => {
            console.error('Erro ao carregar detalhes do projeto:', error);
            showNotification('Erro de conexão. Tente novamente.', 'error');
        });
    }
    
    function populateCostModal(projeto) {
        // Preencher informações do projeto
        document.getElementById('cost-modal-cliente').textContent = projeto.cliente;
        document.getElementById('cost-modal-data').textContent = formatDate(projeto.data_evento);
        document.getElementById('cost-modal-servico').textContent = getServiceTypeLabel(projeto.tipo_servico);
        document.getElementById('cost-modal-local').textContent = projeto.local_evento;
        
        // Preencher preço de venda
        document.getElementById('cost-precio-venda').value = projeto.valor_estimado || 0;
        
        // Preencher custos se já existirem
        document.getElementById('cost-materiais').value = projeto.custo_total_materiais || 0;
        document.getElementById('cost-mao-obra').value = projeto.custo_total_mao_de_obra || 0;
        document.getElementById('cost-diversos').value = projeto.custos_diversos || 0;
        document.getElementById('cost-observacoes').value = projeto.observacoes || '';
        
        // Atualizar cálculos
        updateCostCalculations();
    }
    
    function showCostModal() {
        document.getElementById('cost-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    function closeCostModal() {
        document.getElementById('cost-modal').classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Limpar formulário
        document.getElementById('cost-form').reset();
        document.getElementById('cost-success-message').classList.add('hidden');
        currentProjectId = null;
    }
    
    function updateCostCalculations() {
        const precoVenda = parseFloat(document.getElementById('cost-precio-venda').value) || 0;
        const materiais = parseFloat(document.getElementById('cost-materiais').value) || 0;
        const maoObra = parseFloat(document.getElementById('cost-mao-obra').value) || 0;
        const diversos = parseFloat(document.getElementById('cost-diversos').value) || 0;
        
        const custoTotal = materiais + maoObra + diversos;
        const lucroLiquido = precoVenda - custoTotal;
        const margemPercentual = precoVenda > 0 ? ((lucroLiquido / precoVenda) * 100) : 0;
        
        // Atualizar resumo
        document.getElementById('cost-resumo-total').textContent = formatCurrency(custoTotal);
        document.getElementById('cost-resumo-lucro').textContent = formatCurrency(lucroLiquido);
        document.getElementById('cost-resumo-margem').textContent = margemPercentual.toFixed(1) + '%';
        
        // Atualizar cores baseado no lucro
        const lucroElement = document.getElementById('cost-resumo-lucro');
        const margemElement = document.getElementById('cost-resumo-margem');
        
        if (lucroLiquido < 0) {
            lucroElement.className = 'font-medium text-red-600';
            margemElement.className = 'font-medium text-red-600';
        } else if (lucroLiquido === 0) {
            lucroElement.className = 'font-medium text-yellow-600';
            margemElement.className = 'font-medium text-yellow-600';
        } else {
            lucroElement.className = 'font-medium text-emerald-600';
            margemElement.className = 'font-medium text-emerald-600';
        }
    }
    
    function handleCostSubmit(event) {
        event.preventDefault();
        
        if (!currentProjectId) {
            showNotification('Erro: ID do projeto não encontrado.', 'error');
            return;
        }
        
        const formData = new FormData(event.target);
        const dadosCustos = {
            custo_total_materiais: parseFloat(formData.get('custo_total_materiais')) || 0,
            custo_total_mao_de_obra: parseFloat(formData.get('custo_total_mao_de_obra')) || 0,
            custos_diversos: parseFloat(formData.get('custos_diversos')) || 0,
            observacoes: formData.get('observacoes') || ''
        };
        
        // Mostrar loading no botão
        const saveBtn = document.getElementById('save-cost');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';
        saveBtn.disabled = true;
        
        fetch('../services/painel.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'lancarCustos',
                orcamento_id: currentProjectId,
                dados_custos: dadosCustos
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mostrar mensagem de sucesso
                document.getElementById('cost-success-message').classList.remove('hidden');
                
                // Recarregar dados do dashboard após 2 segundos
                setTimeout(() => {
                    closeCostModal();
                    loadDashboardKPIs(); // Recarregar KPIs
                    loadProjetosConcluidos(); // Recarregar lista de projetos
                    showNotification(data.message, 'success');
                }, 2000);
            } else {
                showNotification(data.message || 'Erro ao salvar custos.', 'error');
            }
        })
        .catch(error => {
            console.error('Erro ao salvar custos:', error);
            showNotification('Erro de conexão. Tente novamente.', 'error');
        })
        .finally(() => {
            // Restaurar botão
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        });
    }
    
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    function getServiceTypeLabel(type) {
        const labels = {
            'arco-tradicional': 'Arco Tradicional',
            'arco-desconstruido': 'Arco Desconstruído',
            'escultura-balao': 'Escultura de Balão',
            'centro-mesa': 'Centro de Mesa',
            'baloes-piscina': 'Balões na Piscina'
        };
        return labels[type] || 'Serviço';
    }
    
    function showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        // Definir cores baseadas no tipo
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 hover:opacity-75">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Tornar função global
        window.showNotification = showNotification;
        
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
                budgets = [];
            }
        } catch (error) {
            console.error('Erro ao carregar orçamentos:', error);
            showNotification('Erro de conexão ao carregar orçamentos.', 'error');
            budgets = [];
        }
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
        if (typeof initPortfolio === 'function') {
            initPortfolio();
        }
        
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
    
    // Funções já estão definidas globalmente antes do DOMContentLoaded
    
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
            
            // Coletar valores mesmo se os campos estiverem desabilitados
            const dayValue = day ? day.value : '';
            const startTimeValue = startTime ? startTime.value : '';
            const endTimeValue = endTime ? endTime.value : '';
            
            if (dayValue && startTimeValue && endTimeValue) {
                data.time_schedules.push({
                    day: dayValue,
                    start_time: startTimeValue,
                    end_time: endTimeValue
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
    
    // Funções globais para os botões de ação (editTimeSchedule e deleteTimeSchedule já foram atribuídas acima)
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
            updateUserInterface({});
            return;
        }
        
        // Atualizar interface
        updateUserInterface(userData);
    }
    
    function updateUserInterface(userData = {}) {
        const nameValue = typeof userData.name === 'string' && userData.name.trim().length > 0
            ? userData.name.trim()
            : '--';
        const emailValue = typeof userData.email === 'string' && userData.email.trim().length > 0
            ? userData.email.trim()
            : '--';
        
        if (userName) {
            userName.textContent = nameValue;
        }
        
        if (userDisplayName) {
            userDisplayName.textContent = nameValue;
        }
        
        if (userEmail) {
            userEmail.textContent = emailValue;
        }
        
        const shouldPersist = userData && Object.values(userData).some(value => {
            if (value === null || value === undefined) return false;
            if (typeof value === 'string') {
                return value.trim().length > 0;
            }
            return true;
        });
        
        if (shouldPersist) {
            localStorage.setItem('userData', JSON.stringify(userData));
        } else {
            localStorage.removeItem('userData');
        }
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
    
    // Variáveis para busca automática de clientes (declaradas antes de setupBudgetModals)
    let clientSearchTimeout = null;
    let clientAutocompleteSetup = false;
    let selectedClientId = null;
    
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
        
        // Configurar validação de disponibilidade em tempo real
        setupAvailabilityValidation();
        
        // Configurar busca automática de clientes
        setupClientAutocomplete();
        
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
            
            // Garantir que a validação de disponibilidade esteja configurada
            setTimeout(() => {
                setupAvailabilityValidation();
            }, 100);
            
            // Garantir que a busca de clientes esteja configurada
            setTimeout(() => {
                setupClientAutocomplete();
            }, 100);
            
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
                
                // Limpar sugestões de clientes e resetar estado
                const suggestionsContainer = document.getElementById('client-suggestions');
                if (suggestionsContainer) {
                    suggestionsContainer.classList.add('hidden');
                    suggestionsContainer.innerHTML = '';
                }
                const clientInput = document.getElementById('budget-client');
                if (clientInput) {
                    clientInput.classList.remove('border-blue-500');
                }
                // Resetar flag de autocomplete para permitir reconfiguração
                clientAutocompleteSetup = false;
                selectedClientId = null;
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
        if (!(await validateCreateBudgetForm())) {
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
            
            // Verificar se a resposta é válida
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            console.log('Resposta do servidor:', result);
            
            if (result.success) {
                showNotification('Orçamento criado com sucesso!', 'success');
                closeCreateBudgetModalFunc();
                
                // Recarregar orçamentos
                await loadBudgets();
            } else {
                showNotification('Erro ao criar orçamento: ' + (result.message || 'Erro desconhecido'), 'error');
                console.error('Erro do servidor:', result);
            }
            
        } catch (error) {
            showNotification('Erro de conexão. Tente novamente.', 'error');
            console.error('Erro ao criar orçamento:', error);
            
            // Log detalhado do erro
            if (error instanceof TypeError && error.message.includes('JSON')) {
                console.error('Erro ao parsear JSON. Verifique a resposta do servidor.');
            }
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

    // ========== VALIDAÇÃO DE DISPONIBILIDADE EM TEMPO REAL ==========
    
    function setupAvailabilityValidation() {
        const eventDate = document.getElementById('budget-event-date');
        const eventTime = document.getElementById('budget-event-time');
        
        if (!eventDate || !eventTime) return;
        
        // Evitar adicionar listeners múltiplas vezes
        if (availabilityValidationSetup) return;
        availabilityValidationSetup = true;
        
        // Função para validar disponibilidade quando ambos campos estiverem preenchidos
        const validateAvailability = async () => {
            if (!eventDate.value || !eventTime.value) {
                return;
            }
            
            // Limpar timeout anterior para evitar múltiplas chamadas
            if (availabilityValidationTimeout) {
                clearTimeout(availabilityValidationTimeout);
            }
            
            // Aguardar um pouco após a digitação para evitar muitas requisições
            availabilityValidationTimeout = setTimeout(async () => {
                try {
                    const response = await fetch('../services/disponibilidade.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            action: 'validate',
                            event_date: eventDate.value,
                            event_time: eventTime.value
                        })
                    });
                    
                    const result = await response.json();
                    
                    // Remover classes de validação anteriores
                    eventDate.classList.remove('border-red-500', 'border-green-500');
                    eventTime.classList.remove('border-red-500', 'border-green-500');
                    
                    if (!result.success) {
                        // Adicionar classe de erro visual
                        eventDate.classList.add('border-red-500');
                        eventTime.classList.add('border-red-500');
                        
                        // Mostrar mensagem de erro de forma discreta
                        const errorMessage = result.message || 'Horário não disponível';
                        showNotification(errorMessage, 'error');
                    } else {
                        // Adicionar classe de sucesso visual
                        eventDate.classList.add('border-green-500');
                        eventTime.classList.add('border-green-500');
                    }
                } catch (error) {
                    console.error('Erro ao validar disponibilidade:', error);
                    // Não mostrar erro ao usuário em validação em tempo real
                }
            }, 500); // Aguardar 500ms após parar de digitar
        };
        
        // Adicionar listeners nos campos
        eventDate.addEventListener('change', validateAvailability);
        eventTime.addEventListener('change', validateAvailability);
        
        // Também validar quando o usuário sair do campo (blur)
        eventDate.addEventListener('blur', validateAvailability);
        eventTime.addEventListener('blur', validateAvailability);
    }

    // ========== BUSCA AUTOMÁTICA DE CLIENTES ==========
    
    function setupClientAutocomplete() {
        const clientInput = document.getElementById('budget-client');
        const emailInput = document.getElementById('budget-email');
        const phoneInput = document.getElementById('budget-phone');
        
        if (!clientInput || !emailInput || !phoneInput) return;
        
        // Evitar adicionar listeners múltiplas vezes
        if (clientAutocompleteSetup) {
            // Se já foi configurado, apenas garantir que o container existe
            let existingContainer = document.getElementById('client-suggestions');
            if (!existingContainer) {
                const suggestionsContainer = document.createElement('div');
                suggestionsContainer.id = 'client-suggestions';
                suggestionsContainer.className = 'absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto hidden';
                clientInput.parentElement.style.position = 'relative';
                clientInput.parentElement.appendChild(suggestionsContainer);
            }
            return;
        }
        clientAutocompleteSetup = true;
        
        // Criar container para sugestões
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'client-suggestions';
        suggestionsContainer.className = 'absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto hidden';
        clientInput.parentElement.style.position = 'relative';
        clientInput.parentElement.appendChild(suggestionsContainer);
        
        // Função para buscar clientes
        const searchClients = async (name) => {
            if (!name || name.length < 2) {
                suggestionsContainer.classList.add('hidden');
                return;
            }
            
            // Limpar timeout anterior
            if (clientSearchTimeout) {
                clearTimeout(clientSearchTimeout);
            }
            
            // Aguardar um pouco após a digitação
            clientSearchTimeout = setTimeout(async () => {
                try {
                    const response = await fetch('../services/orcamentos.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            action: 'search_clients',
                            name: name
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    
                    console.log('Resultado da busca de clientes:', result);
                    
                    if (result.success && result.clients && result.clients.length > 0) {
                        // Limpar sugestões anteriores
                        suggestionsContainer.innerHTML = '';
                        
                        // Adicionar sugestões
                        result.clients.forEach(client => {
                            const suggestionItem = document.createElement('div');
                            suggestionItem.className = 'px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0';
                            suggestionItem.innerHTML = `
                                <div class="font-medium text-gray-800">${client.nome}</div>
                                <div class="text-sm text-gray-600">${client.email || ''} ${client.telefone ? '• ' + client.telefone : ''}</div>
                            `;
                            
                            suggestionItem.addEventListener('click', () => {
                                // Preencher campos automaticamente
                                clientInput.value = client.nome;
                                emailInput.value = client.email || '';
                                phoneInput.value = client.telefone || '';
                                selectedClientId = client.id;
                                
                                // Ocultar sugestões
                                suggestionsContainer.classList.add('hidden');
                                
                                // Remover indicador visual de busca
                                clientInput.classList.remove('border-blue-500');
                            });
                            
                            suggestionsContainer.appendChild(suggestionItem);
                        });
                        
                        // Mostrar sugestões
                        suggestionsContainer.classList.remove('hidden');
                        
                        // Adicionar indicador visual
                        clientInput.classList.add('border-blue-500');
                    } else {
                        // Nenhum cliente encontrado
                        suggestionsContainer.classList.add('hidden');
                        clientInput.classList.remove('border-blue-500');
                        selectedClientId = null;
                    }
                } catch (error) {
                    console.error('Erro ao buscar clientes:', error);
                    suggestionsContainer.classList.add('hidden');
                }
            }, 300); // Aguardar 300ms após parar de digitar
        };
        
        // Listener no campo de nome do cliente
        clientInput.addEventListener('input', (e) => {
            const name = e.target.value.trim();
            selectedClientId = null; // Resetar quando o usuário digitar
            
            // Limpar campos se o nome foi apagado
            if (!name) {
                emailInput.value = '';
                phoneInput.value = '';
                suggestionsContainer.classList.add('hidden');
                clientInput.classList.remove('border-blue-500');
                return;
            }
            
            searchClients(name);
        });
        
        // Ocultar sugestões ao clicar fora
        document.addEventListener('click', (e) => {
            const isClickInside = clientInput === e.target || 
                                 clientInput.parentElement.contains(e.target) ||
                                 suggestionsContainer.contains(e.target);
            
            if (!isClickInside) {
                suggestionsContainer.classList.add('hidden');
            }
        });
        
        // Ocultar sugestões ao pressionar ESC
        clientInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                suggestionsContainer.classList.add('hidden');
            }
        });
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
    
    async function validateCreateBudgetForm() {
        // Obter elementos do formulário
        const client = document.getElementById('budget-client');
        const email = document.getElementById('budget-email');
        const eventDate = document.getElementById('budget-event-date');
        const eventTime = document.getElementById('budget-event-time');
        const eventLocation = document.getElementById('budget-event-location');
        const serviceType = document.getElementById('budget-service-type'); // CORRETO: serviceType, não eventType
        
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
        
        if (!serviceType || !serviceType.value) {
            showNotification('Tipo de serviço é obrigatório', 'error');
            return false;
        }
        
        // Validar data não pode ser no passado
        const eventDateTime = new Date(eventDate.value + 'T' + eventTime.value);
        if (eventDateTime < new Date()) {
            showNotification('Data do evento não pode ser no passado', 'error');
            return false;
        }
        
        // Validar disponibilidade com a configuração cadastrada
        try {
            const availabilityResponse = await fetch('../services/disponibilidade.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'validate',
                    event_date: eventDate.value,
                    event_time: eventTime.value
                })
            });
            
            const availabilityResult = await availabilityResponse.json();
            
            if (!availabilityResult.success) {
                showNotification(availabilityResult.message || 'Horário não disponível', 'error');
                return false;
            }
        } catch (error) {
            console.error('Erro ao validar disponibilidade:', error);
            // Não bloquear o envio se houver erro na validação, apenas logar
            // O backend também validará a disponibilidade
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
        
        if (!serviceType || !serviceType.value) {
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
    
    async function handleLogout() {
        // Confirmar logout
        if (confirm('Tem certeza que deseja sair?')) {
            try {
                // Chamar logout no backend
                await fetch('../services/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'logout'
                    })
                });
            } catch (error) {
                console.error('Erro no logout:', error);
            } finally {
                // Limpar dados locais
                localStorage.removeItem('userData');
                localStorage.removeItem('userToken');
                
                // Limpar proteção de navegação
                if (window.authProtection) {
                    window.authProtection.clearProtection();
                }
                
                // Redirecionar para login
                window.location.replace('login.html');
            }
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
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    const logoutHeaderBtn = document.getElementById('logout-header-btn');
    
    // Estado dos dropdowns
    let notificationsOpen = false;
    let userDropdownOpen = false;
    
    // Verificar se o usuário é admin e mostrar botão de admin
    function checkAdminAccess() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            if (userData.role === 'admin' && adminPanelBtn) {
                adminPanelBtn.classList.remove('hidden');
            }
        } catch (e) {
            console.warn('Erro ao verificar acesso admin:', e);
        }
    }
    
    // Chamar verificação de admin
    checkAdminAccess();
    
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
    
    // Painel Admin
    if (adminPanelBtn) {
        adminPanelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeUserDropdown();
            // Redirecionar para a página de admin
            window.location.href = 'admin.html';
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
    async function loadPortfolioServices(showToastOnError = true) {
        try {
            const response = await fetch('../services/portfolio.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'list_portfolio_items'
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Resposta não é JSON do portfolio.php:', text.substring(0, 500));
                throw new Error('Resposta do servidor não é JSON');
            }
            
            const result = await response.json();
            
            if (result.success) {
                const items = Array.isArray(result.data?.items) ? result.data.items : [];
                portfolioServices = items.map(normalizePortfolioItem);
            } else {
                portfolioServices = [];
                if (showToastOnError) {
                    showWarningToast('Portfólio', result.message || 'Não foi possível carregar seus serviços.');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar portfólio:', error);
            portfolioServices = [];
            if (showToastOnError) {
                showErrorToast('Portfólio', 'Erro ao carregar seu portfólio. Verifique a conexão e tente novamente.');
            }
        }
        
        renderPortfolioServices();
        updateHomepagePortfolio();
    }
    
    function normalizePortfolioItem(item = {}) {
        const imagePath = item.image || item.image_url || item.image_path || null;
        let normalizedImage = null;
        
        if (imagePath) {
            if (imagePath.startsWith('../')) {
                normalizedImage = imagePath;
            } else if (imagePath.startsWith('uploads/')) {
                normalizedImage = `../${imagePath}`;
            } else {
                normalizedImage = imagePath;
            }
        }
        
        return {
            id: item.id,
            type: item.type || item.service_type || 'Serviço',
            title: item.title || 'Serviço',
            description: item.description || '',
            price: item.price !== null && item.price !== undefined ? Number(item.price) : null,
            arcSize: item.arcSize || item.arc_size || '',
            image: normalizedImage,
            created_at: item.created_at || null,
            updated_at: item.updated_at || null
        };
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
                    <button onclick="editService('${service.id}')" class="text-blue-600 hover:text-blue-800" title="Editar serviço">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="confirmDeleteServiceAction('${service.id}')" class="text-red-600 hover:text-red-800" title="Excluir serviço">
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
            const editBtn = e.target.closest('.edit-service-btn');
            const deleteBtn = e.target.closest('.delete-service-btn');
            
            if (editBtn) {
                e.preventDefault();
                e.stopPropagation();
                const serviceId = editBtn.getAttribute('data-id') || service.id;
                console.log('Botão editar clicado para serviço ID:', serviceId);
                editService(serviceId);
            } else if (deleteBtn) {
                e.preventDefault();
                e.stopPropagation();
                const serviceId = deleteBtn.getAttribute('data-id') || service.id;
                console.log('Botão excluir clicado para serviço ID:', serviceId);
                confirmDeleteServiceAction(serviceId);
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
        console.log('Editando serviço ID:', serviceId);
        const service = portfolioServices.find(s => s.id === serviceId || s.id === String(serviceId));
        if (!service) {
            console.error('Serviço não encontrado. ID:', serviceId, 'Serviços disponíveis:', portfolioServices);
            showErrorToast('Erro', 'Serviço não encontrado.');
            return;
        }
        
        console.log('Serviço encontrado:', service);
        editingServiceId = serviceId;
        
        const modalTitle = document.getElementById('service-modal-title');
        const modalSubtitle = document.getElementById('service-modal-subtitle');
        if (modalTitle) modalTitle.textContent = 'Editar Serviço';
        if (modalSubtitle) modalSubtitle.textContent = 'Atualize as informações do seu serviço';
        
        // Preencher formulário - usar os IDs corretos do HTML
        const typeField = document.getElementById('service-type');
        const titleField = document.getElementById('service-title');
        const descriptionField = document.getElementById('service-description');
        const priceField = document.getElementById('service-price');
        const arcSizeField = document.getElementById('service-arc-size');
        
        if (typeField) typeField.value = service.type || service.service_type || '';
        if (titleField) titleField.value = service.title || '';
        if (descriptionField) descriptionField.value = service.description || '';
        if (priceField) priceField.value = service.price || '';
        if (arcSizeField) arcSizeField.value = service.arcSize || service.arc_size || '';
        
        console.log('Campos preenchidos:', {
            type: service.type,
            title: service.title,
            description: service.description,
            price: service.price,
            arcSize: service.arcSize
        });
        
        // Mostrar preview da imagem se existir
        const preview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        const openImageEditor = document.getElementById('open-image-editor');
        
        if (service.image && preview && previewImg) {
            previewImg.src = service.image;
            preview.classList.remove('hidden');
            if (openImageEditor) openImageEditor.classList.remove('hidden');
        } else {
            if (preview) preview.classList.add('hidden');
            if (openImageEditor) openImageEditor.classList.add('hidden');
        }
        
        if (serviceModal) {
            serviceModal.classList.remove('hidden');
            showInfoToast('Editando Serviço', 'Modifique as informações conforme necessário.');
        } else {
            console.error('Modal de serviço não encontrado!');
            showErrorToast('Erro', 'Modal de edição não encontrado.');
        }
    }
    
    // Confirmar exclusão de serviço
    function confirmDeleteServiceAction(serviceId) {
        console.log('Confirmando exclusão do serviço ID:', serviceId);
        if (!serviceId) {
            console.error('ID do serviço não fornecido para exclusão');
            showErrorToast('Erro', 'ID do serviço não encontrado.');
            return;
        }
        
        deletingServiceId = serviceId;
        if (deleteServiceModal) {
            deleteServiceModal.classList.remove('hidden');
        } else {
            console.error('Modal de confirmação de exclusão não encontrado!');
            showErrorToast('Erro', 'Modal de confirmação não encontrado.');
        }
    }
    
    // Excluir serviço
    async function deleteService() {
        if (!deletingServiceId) {
            console.warn('Nenhum ID de serviço para excluir');
            return;
        }
        
        console.log('Excluindo serviço ID:', deletingServiceId);
        
        let originalButtonContent = null;
        try {
            if (confirmDeleteService) {
                originalButtonContent = confirmDeleteService.innerHTML;
                confirmDeleteService.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Removendo...';
                confirmDeleteService.disabled = true;
            }
            
            const response = await fetch('../services/portfolio.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete_portfolio_item',
                    id: deletingServiceId
                })
            });
            
            console.log('Resposta do servidor:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Resultado da exclusão:', result);
            
            if (result.success) {
                if (deleteServiceModal) deleteServiceModal.classList.add('hidden');
                const deletedId = deletingServiceId;
                deletingServiceId = null;
                
                // Recarregar serviços
                await loadPortfolioServices(false);
                
                showSuccessToast('Serviço removido', result.message || 'O serviço foi removido do portfólio.');
            } else {
                showErrorToast('Erro', result.message || 'Não foi possível remover o serviço. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao remover serviço:', error);
            showErrorToast('Erro', 'Erro ao remover o serviço: ' + error.message);
        } finally {
            if (confirmDeleteService) {
                confirmDeleteService.disabled = false;
                confirmDeleteService.innerHTML = originalButtonContent || '<i class="fas fa-trash mr-2"></i>Excluir';
            }
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
    
    // Salvar serviço
    async function saveServiceData(formData) {
        const isEdit = Boolean(editingServiceId);
        let originalButtonContent = null;
        
        try {
            if (saveService) {
                originalButtonContent = saveService.innerHTML;
                saveService.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';
                saveService.disabled = true;
            }
            
            const payload = new FormData();
            payload.append('action', isEdit ? 'update_portfolio_item' : 'create_portfolio_item');
            if (isEdit) {
                payload.append('id', editingServiceId);
            }
            
            // Mapear campos do formulário para o formato esperado pelo backend
            // O formulário usa name="type", name="title", etc.
            const type = formData.get('type') || '';
            const title = formData.get('title') || '';
            const description = formData.get('description') || '';
            const price = formData.get('price') || '';
            const arcSize = formData.get('arcSize') || '';
            const image = formData.get('image');
            
            // Validar campos obrigatórios
            if (!type || !title) {
                showErrorToast('Erro', 'Tipo e título do serviço são obrigatórios.');
                if (saveService) {
                    saveService.disabled = false;
                    saveService.innerHTML = originalButtonContent || '<i class="fas fa-save mr-2"></i>Salvar Serviço';
                }
                return;
            }
            
            // Adicionar campos no formato esperado pelo backend
            payload.append('type', type);
            payload.append('title', title);
            payload.append('description', description);
            if (price) {
                payload.append('price', price);
            }
            if (arcSize) {
                payload.append('arcSize', arcSize);
            }
            if (image && image instanceof File && image.size > 0) {
                payload.append('image', image);
            }
            
            console.log('Enviando dados do serviço:', {
                action: isEdit ? 'update_portfolio_item' : 'create_portfolio_item',
                id: editingServiceId,
                type,
                title,
                description,
                price,
                arcSize,
                hasImage: image && image instanceof File
            });
            
            const response = await fetch('../services/portfolio.php', {
                method: 'POST',
                body: payload
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Resultado do salvamento:', result);
            
            if (result.success) {
                await loadPortfolioServices(false);
                
                if (serviceModal) serviceModal.classList.add('hidden');
                if (serviceForm) serviceForm.reset();
                editingServiceId = null;
                const preview = document.getElementById('image-preview');
                const openEditorBtn = document.getElementById('open-image-editor');
                if (preview) preview.classList.add('hidden');
                if (openEditorBtn) openEditorBtn.classList.add('hidden');
                
                const message = result.message || (isEdit ? 'Serviço atualizado com sucesso!' : 'Serviço adicionado com sucesso!');
                showSuccessToast('Portfólio', message);
            } else {
                console.error('Erro ao salvar:', result);
                showErrorToast('Erro', result.message || 'Não foi possível salvar o serviço. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            showErrorToast('Erro', 'Ocorreu um erro ao salvar o serviço. Verifique sua conexão e tente novamente.');
        } finally {
            if (saveService) {
                saveService.disabled = false;
                saveService.innerHTML = originalButtonContent || '<i class="fas fa-save mr-2"></i>Salvar Serviço';
            }
        }
    }
    
    // Atualizar portfólio na página inicial
    function updateHomepagePortfolio() {
        const sanitizedServices = portfolioServices.map(service => ({
            id: service.id,
            type: service.type,
            title: service.title,
            description: service.description,
            price: service.price,
            arcSize: service.arcSize,
            image: service.image
        }));
        
        localStorage.setItem('homepage_portfolio', JSON.stringify(sanitizedServices));
        
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
        console.log('Configurando event listeners do portfólio...');
        
        // Botões para abrir modal de adicionar serviço
        if (addServiceBtn) {
            // Remover listener anterior se existir
            const newAddBtn = addServiceBtn.cloneNode(true);
            addServiceBtn.parentNode.replaceChild(newAddBtn, addServiceBtn);
            newAddBtn.addEventListener('click', openAddServiceModal);
        }
        
        if (addFirstServiceBtn) {
            // Remover listener anterior se existir
            const newAddFirstBtn = addFirstServiceBtn.cloneNode(true);
            addFirstServiceBtn.parentNode.replaceChild(newAddFirstBtn, addFirstServiceBtn);
            newAddFirstBtn.addEventListener('click', openAddServiceModal);
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
        
        // Salvar serviço - remover listener anterior se existir
        if (serviceForm) {
            // Remover listener anterior
            const newForm = serviceForm.cloneNode(true);
            serviceForm.parentNode.replaceChild(newForm, serviceForm);
            
            newForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Formulário de serviço submetido');
                const formData = new FormData(newForm);
                await saveServiceData(formData);
            });
            
            // Atualizar referência
            const serviceFormRef = newForm;
        }
        
        // Modal de confirmação de exclusão
        if (cancelDeleteService) {
            // Remover listener anterior
            const newCancelBtn = cancelDeleteService.cloneNode(true);
            cancelDeleteService.parentNode.replaceChild(newCancelBtn, cancelDeleteService);
            newCancelBtn.addEventListener('click', () => {
                if (deleteServiceModal) deleteServiceModal.classList.add('hidden');
            });
        }
        
        if (confirmDeleteService) {
            // Remover listener anterior
            const newConfirmBtn = confirmDeleteService.cloneNode(true);
            confirmDeleteService.parentNode.replaceChild(newConfirmBtn, confirmDeleteService);
            newConfirmBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão confirmar exclusão clicado');
                await deleteService();
            });
        }
        
        if (deleteServiceModalOverlay) {
            // Remover listener anterior
            const newOverlay = deleteServiceModalOverlay.cloneNode(true);
            deleteServiceModalOverlay.parentNode.replaceChild(newOverlay, deleteServiceModalOverlay);
            newOverlay.addEventListener('click', () => {
                if (deleteServiceModal) deleteServiceModal.classList.add('hidden');
            });
        }
        
        console.log('Event listeners do portfólio configurados com sucesso');
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
    async function resetPortfolio() {
        try {
            const response = await fetch('../services/portfolio.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'clear_portfolio'
                })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                portfolioServices = [];
                renderPortfolioServices();
                updateHomepagePortfolio();
                showSuccessToast('Portfólio Limpo', result.message || 'Todos os serviços foram removidos.');
            } else {
                showErrorToast('Erro', result.message || 'Não foi possível limpar o portfólio.');
            }
        } catch (error) {
            console.error('Erro ao limpar portfólio:', error);
            showErrorToast('Erro', 'Não foi possível limpar o portfólio. Verifique a conexão.');
        }
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

    // ========== SISTEMA DE SUPORTE ==========
    
    const supportBtn = document.getElementById('support-btn');
    const supportModal = document.getElementById('support-modal');
    const supportModalOverlay = document.getElementById('support-modal-overlay');
    const closeSupportModal = document.getElementById('close-support-modal');
    const cancelSupport = document.getElementById('cancel-support');
    const supportForm = document.getElementById('support-form');
    const supportAttachment = document.getElementById('support-attachment');
    const supportPreview = document.getElementById('support-preview');
    const supportPreviewImg = document.getElementById('support-preview-img');
    const removeSupportAttachment = document.getElementById('remove-support-attachment');
    const supportSuccessMessage = document.getElementById('support-success-message');
    
    // Abrir modal de suporte
    if (supportBtn) {
        supportBtn.addEventListener('click', () => {
            supportModal.classList.remove('hidden');
            supportSuccessMessage.classList.add('hidden');
        });
    }
    
    // Fechar modal de suporte
    function closeSupportModalFunc() {
        supportModal.classList.add('hidden');
        supportForm.reset();
        supportPreview.classList.add('hidden');
        supportSuccessMessage.classList.add('hidden');
    }
    
    if (closeSupportModal) {
        closeSupportModal.addEventListener('click', closeSupportModalFunc);
    }
    
    if (cancelSupport) {
        cancelSupport.addEventListener('click', closeSupportModalFunc);
    }
    
    if (supportModalOverlay) {
        supportModalOverlay.addEventListener('click', closeSupportModalFunc);
    }
    
    // Preview de anexo
    if (supportAttachment) {
        supportAttachment.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validar tamanho
                if (file.size > 5 * 1024 * 1024) {
                    showErrorToast('Arquivo muito grande', 'O anexo deve ter no máximo 5MB');
                    e.target.value = '';
                    return;
                }
                
                // Validar tipo
                if (!file.type.startsWith('image/')) {
                    showErrorToast('Tipo inválido', 'Apenas imagens são permitidas');
                    e.target.value = '';
                    return;
                }
                
                // Mostrar preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    supportPreviewImg.src = e.target.result;
                    supportPreview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Remover anexo
    if (removeSupportAttachment) {
        removeSupportAttachment.addEventListener('click', () => {
            supportAttachment.value = '';
            supportPreview.classList.add('hidden');
        });
    }
    
    // Enviar formulário de suporte
    if (supportForm) {
        supportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Obter dados do usuário logado
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            
            // Verificar se o usuário está identificado (usar 'name' ou 'nome' para compatibilidade)
            if (!userData.name && !userData.nome) {
                showErrorToast('Erro', 'Usuário não identificado. Faça login novamente.');
                return;
            }
            
            // Garantir que temos o ID do decorador
            if (!userData.id) {
                showErrorToast('Erro', 'ID do decorador não encontrado. Faça login novamente.');
                return;
            }
            
            // Coletar dados do formulário
            const formData = new FormData(supportForm);
            const title = formData.get('title');
            const description = formData.get('description');
            const attachmentFile = formData.get('attachment');
            
            // Processar anexo se existir
            let attachmentData = null;
            if (attachmentFile && attachmentFile.size > 0) {
                attachmentData = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(attachmentFile);
                });
            }
            
            // Enviar para o backend
            try {
                const response = await fetch('../services/suporte.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'create',
                        title: title,
                        description: description,
                        attachment: attachmentData,
                        decorator_id: userData.id,
                        decorator_name: userData.name || userData.nome || 'Decorador',
                        decorator_email: userData.email || 'Não informado'
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Mostrar mensagem de sucesso
                    supportSuccessMessage.classList.remove('hidden');
                    
                    // Limpar formulário
                    supportForm.reset();
                    supportPreview.classList.add('hidden');
                    
                    // Mostrar toast
                    showSuccessToast('Feedback Enviado', 'Seu chamado foi registrado com sucesso! Nossa equipe entrará em contato em breve.');
                    
                    // Fechar modal após 3 segundos
                    setTimeout(() => {
                        closeSupportModalFunc();
                    }, 3000);
                    
                    // Log para debug
                    console.log('Chamado de suporte criado:', result.ticket);
                } else {
                    throw new Error(result.message || 'Erro ao criar chamado');
                }
            } catch (error) {
                console.error('Erro ao enviar chamado:', error);
                showErrorToast('Erro', 'Não foi possível enviar o chamado. Tente novamente.');
            }
        });
    }

    // ========== FUNCIONALIDADES DE PERSONALIZAÇÃO DA TELA INICIAL ==========
    
    let editModeActive = false;
    let currentCustomizationData = null;
    
    async function loadPersonalizarTelaData() {
        console.log('Iniciando carregamento do módulo Personalizar Tela');
        
        try {
            // Obter dados do usuário
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            console.log('Dados do usuário:', userData);
            
            if (!userData.slug) {
                showNotification('Slug do decorador não encontrado. Faça login novamente.', 'error');
                console.error('Slug não encontrado no userData');
                return;
            }
            
            // Aguardar um pouco para garantir que o DOM está pronto
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Configurar link de visualização da página
            const viewPageLink = document.getElementById('decorator-view-page-link');
            if (viewPageLink) {
                // Construir URL da página pública do decorador
                const currentPath = window.location.pathname;
                let pageUrl;
                if (currentPath.includes('/pages/')) {
                    const basePath = currentPath.substring(0, currentPath.indexOf('/pages/'));
                    pageUrl = `${basePath}/${userData.slug}`;
                } else {
                    pageUrl = `../${userData.slug}`;
                }
                // Garantir que a URL não tenha barras duplas
                pageUrl = pageUrl.replace(/\/+/g, '/');
                viewPageLink.href = pageUrl;
                console.log('Link de visualização configurado:', pageUrl);
            }
            
            // Carregar preview da página do decorador (via slug)
            const previewIframe = document.getElementById('decorator-page-preview');
            const previewContainer = document.getElementById('page-preview-container');
            
            if (!previewIframe) {
                console.error('Iframe não encontrado!');
                showNotification('Erro: elemento de preview não encontrado', 'error');
                return;
            }
            
            if (!previewContainer) {
                console.error('Container de preview não encontrado!');
            }
            
            // Construir URL correta - usar caminho absoluto baseado na estrutura do projeto
            let previewUrl;
            const currentPath = window.location.pathname;
            
            // Verificar se estamos em /pages/
            if (currentPath.includes('/pages/')) {
                const basePath = currentPath.substring(0, currentPath.indexOf('/pages/'));
                previewUrl = `${basePath}/${userData.slug}`;
            } else {
                // Se não estiver em /pages/, usar caminho relativo
                previewUrl = `../${userData.slug}`;
            }
            
            // Garantir que a URL não tenha barras duplas
            previewUrl = previewUrl.replace(/\/+/g, '/');
            
            console.log('Carregando preview da URL:', previewUrl);
            console.log('Caminho atual:', currentPath);
            
            // Limpar src anterior e definir novo
            previewIframe.src = '';
            
            // Aguardar um frame antes de definir novo src
            setTimeout(() => {
                previewIframe.src = previewUrl;
                console.log('Iframe src definido para:', previewIframe.src);
            }, 50);
            
            // Aguardar o iframe carregar completamente
            previewIframe.onload = function() {
                console.log('Preview da página do decorador carregado com sucesso:', previewIframe.src);
                showNotification('Preview carregado com sucesso!', 'success');
                
                // Pequeno delay para garantir que o conteúdo está renderizado
                setTimeout(() => {
                    // Se o modo de edição estiver ativo, reativar
                    if (editModeActive) {
                        enableEditMode();
                    }
                }, 500);
            };
            
            previewIframe.onerror = function() {
                console.error('Erro ao carregar preview da página do decorador');
                showNotification('Erro ao carregar preview. Verifique se o slug está correto e se a página existe.', 'error');
            };
            
            // Timeout de segurança
            setTimeout(() => {
                if (!previewIframe.contentDocument && !previewIframe.contentWindow) {
                    console.warn('Iframe ainda não carregou após 5 segundos');
                }
            }, 5000);
            
            // Carregar configurações
            const response = await fetch('../services/decorador.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_my_page_customization'
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
                currentCustomizationData = result.data;
                const config = result.data;
                
                // Preencher campos de conteúdo
                const pageTitleEl = document.getElementById('decorator-page-title');
                const pageDescEl = document.getElementById('decorator-page-description');
                const welcomeTextEl = document.getElementById('decorator-welcome-text');
                
                if (pageTitleEl) pageTitleEl.value = config.page_title || '';
                if (pageDescEl) pageDescEl.value = config.page_description || '';
                if (welcomeTextEl) welcomeTextEl.value = config.welcome_text || '';
                
                // Preencher campos visuais
                const coverImageEl = document.getElementById('decorator-cover-image-url');
                if (coverImageEl) coverImageEl.value = config.cover_image_url || '';
                
                const primaryColor = config.primary_color || '#667eea';
                const secondaryColor = config.secondary_color || '#764ba2';
                const accentColor = config.accent_color || '#f59e0b';
                
                const primaryColorEl = document.getElementById('decorator-primary-color');
                const primaryColorHexEl = document.getElementById('decorator-primary-color-hex');
                const secondaryColorEl = document.getElementById('decorator-secondary-color');
                const secondaryColorHexEl = document.getElementById('decorator-secondary-color-hex');
                const accentColorEl = document.getElementById('decorator-accent-color');
                const accentColorHexEl = document.getElementById('decorator-accent-color-hex');
                
                if (primaryColorEl) primaryColorEl.value = primaryColor;
                if (primaryColorHexEl) primaryColorHexEl.value = primaryColor;
                if (secondaryColorEl) secondaryColorEl.value = secondaryColor;
                if (secondaryColorHexEl) secondaryColorHexEl.value = secondaryColor;
                if (accentColorEl) accentColorEl.value = accentColor;
                if (accentColorHexEl) accentColorHexEl.value = accentColor;
                
                // Preencher redes sociais
                const socialFacebookEl = document.getElementById('decorator-social-facebook');
                const socialInstagramEl = document.getElementById('decorator-social-instagram');
                const socialWhatsappEl = document.getElementById('decorator-social-whatsapp');
                const socialYoutubeEl = document.getElementById('decorator-social-youtube');
                
                if (config.social_media) {
                    const social = typeof config.social_media === 'string' ? JSON.parse(config.social_media) : config.social_media;
                    if (socialFacebookEl) socialFacebookEl.value = social.facebook || '';
                    if (socialInstagramEl) socialInstagramEl.value = social.instagram || '';
                    if (socialWhatsappEl) socialWhatsappEl.value = social.whatsapp || '';
                    if (socialYoutubeEl) socialYoutubeEl.value = social.youtube || '';
                }
                
                // Preencher contatos
                const contactEmailEl = document.getElementById('decorator-contact-email');
                const contactWhatsappEl = document.getElementById('decorator-contact-whatsapp');
                const contactInstagramEl = document.getElementById('decorator-contact-instagram');
                
                if (contactEmailEl) contactEmailEl.value = config.contact_email || '';
                if (contactWhatsappEl) contactWhatsappEl.value = config.contact_whatsapp || '';
                if (contactInstagramEl) contactInstagramEl.value = config.contact_instagram || '';
                
                // Preencher SEO
                const metaTitleEl = document.getElementById('decorator-meta-title');
                const metaDescEl = document.getElementById('decorator-meta-description');
                const metaKeywordsEl = document.getElementById('decorator-meta-keywords');
                
                if (metaTitleEl) metaTitleEl.value = config.meta_title || '';
                if (metaDescEl) metaDescEl.value = config.meta_description || '';
                if (metaKeywordsEl) metaKeywordsEl.value = config.meta_keywords || '';
                
                // Atualizar contadores
                updateDecoratorCharCounters();
                
                // Atualizar preview quando campos mudarem
                setupPreviewUpdates();
            }
            
            // Configurar tabs e eventos após um pequeno delay
            setTimeout(() => {
                console.log('Configurando eventos do módulo...');
                setupDecoratorCustomizationTabs();
                setupDecoratorColorInputs();
                setupDecoratorCharCounters();
                setupEditModeToggle();
                setupSaveButton();
                console.log('Eventos configurados com sucesso');
            }, 200);
            
        } catch (error) {
            console.error('Erro ao carregar personalização:', error);
            showNotification('Erro ao carregar configurações: ' + error.message, 'error');
        }
    }
    
    function setupSaveButton() {
        const saveBtn = document.getElementById('decorator-save-customization');
        if (!saveBtn) {
            console.warn('Botão de salvar não encontrado, tentando novamente...');
            // Tentar novamente após um pequeno delay
            setTimeout(setupSaveButton, 200);
            return;
        }
        
        console.log('Configurando botão de salvar...');
        
        // Remover listener anterior se existir usando clone
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        
        // Adicionar novo listener
        newSaveBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão salvar clicado!');
            const form = document.getElementById('decorator-page-customization-form');
            if (!form) {
                showNotification('Formulário não encontrado', 'error');
                return;
            }
            
            const originalText = newSaveBtn.innerHTML;
            
            try {
                const formData = new FormData(form);
                
                // Coletar dados do formulário
                const customizationData = {
                    action: 'save_my_page_customization',
                    page_title: formData.get('page_title'),
                    page_description: formData.get('page_description'),
                    welcome_text: formData.get('welcome_text'),
                    cover_image_url: formData.get('cover_image_url'),
                    primary_color: formData.get('primary_color'),
                    secondary_color: formData.get('secondary_color'),
                    accent_color: formData.get('accent_color'),
                    social_facebook: formData.get('social_facebook'),
                    social_instagram: formData.get('social_instagram'),
                    social_whatsapp: formData.get('social_whatsapp'),
                    social_youtube: formData.get('social_youtube'),
                    meta_title: formData.get('meta_title'),
                    meta_description: formData.get('meta_description'),
                    meta_keywords: formData.get('meta_keywords'),
                    contact_email: formData.get('contact_email'),
                    contact_whatsapp: formData.get('contact_whatsapp'),
                    contact_instagram: formData.get('contact_instagram')
                };
                
                // Validar dados obrigatórios
                if (!customizationData.page_title || !customizationData.page_description) {
                    showNotification('Título e descrição são obrigatórios', 'error');
                    return;
                }
                
                // Mostrar loading
                newSaveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';
                newSaveBtn.disabled = true;
                
                // Enviar para o servidor
                const response = await fetch('../services/decorador.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(customizationData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Personalização salva com sucesso!', 'success');
                    // Recarregar preview
                    updatePreview();
                    // Atualizar link de visualização (caso o slug tenha mudado)
                    updateViewPageLink();
                } else {
                    showNotification('Erro: ' + (result.message || 'Erro ao salvar personalização'), 'error');
                }
                
            } catch (error) {
                console.error('Erro ao salvar personalização:', error);
                showNotification('Erro ao salvar personalização: ' + error.message, 'error');
            } finally {
                newSaveBtn.innerHTML = originalText;
                newSaveBtn.disabled = false;
            }
        });
    }
    
    let previewUpdateTimeout = null;
    const previewUpdateHandlers = new WeakMap();
    
    function setupPreviewUpdates() {
        // Atualizar preview quando campos mudarem (com debounce)
        const inputs = document.querySelectorAll('#decorator-page-customization-form input, #decorator-page-customization-form textarea');
        inputs.forEach(input => {
            // Remover listener anterior se existir
            const existingHandler = previewUpdateHandlers.get(input);
            if (existingHandler) {
                input.removeEventListener('input', existingHandler.inputHandler);
                input.removeEventListener('change', existingHandler.changeHandler);
            }
            
            // Criar novos handlers
            const inputHandler = () => {
                // Debounce: aguardar 1 segundo após a última mudança
                clearTimeout(previewUpdateTimeout);
                previewUpdateTimeout = setTimeout(() => {
                    updatePreview();
                }, 1000);
            };
            
            const changeHandler = () => {
                clearTimeout(previewUpdateTimeout);
                updatePreview();
            };
            
            // Adicionar listeners
            input.addEventListener('input', inputHandler);
            input.addEventListener('change', changeHandler);
            
            // Armazenar handlers para remoção futura
            previewUpdateHandlers.set(input, { inputHandler, changeHandler });
        });
    }
    
    function updateViewPageLink() {
        const viewPageLink = document.getElementById('decorator-view-page-link');
        if (!viewPageLink) return;
        
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.slug) {
            const currentPath = window.location.pathname;
            let pageUrl;
            if (currentPath.includes('/pages/')) {
                const basePath = currentPath.substring(0, currentPath.indexOf('/pages/'));
                pageUrl = `${basePath}/${userData.slug}`;
            } else {
                pageUrl = `../${userData.slug}`;
            }
            pageUrl = pageUrl.replace(/\/+/g, '/');
            viewPageLink.href = pageUrl;
        }
    }
    
    function updatePreview() {
        const previewIframe = document.getElementById('decorator-page-preview');
        if (!previewIframe) {
            console.warn('Iframe não encontrado para atualizar preview');
            return;
        }
        
        // Obter dados do usuário para recarregar com o slug correto
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.slug) {
            // Construir URL correta
            const currentPath = window.location.pathname;
            let previewUrl;
            if (currentPath.includes('/pages/')) {
                const basePath = currentPath.substring(0, currentPath.indexOf('/pages/'));
                previewUrl = `${basePath}/${userData.slug}`;
            } else {
                previewUrl = `../${userData.slug}`;
            }
            previewUrl = previewUrl.replace(/\/+/g, '/');
            
            console.log('Atualizando preview com URL:', previewUrl);
            
            // Recarregar iframe para aplicar mudanças
            previewIframe.src = '';
            setTimeout(() => {
                previewIframe.src = previewUrl;
            }, 300);
        } else {
            console.warn('Slug não encontrado para atualizar preview');
        }
    }
    
    function setupEditModeToggle() {
        const toggleBtn = document.getElementById('decorator-toggle-edit-mode');
        const overlay = document.getElementById('edit-overlay');
        
        if (!toggleBtn) {
            console.warn('Botão de modo edição não encontrado, tentando novamente...');
            setTimeout(setupEditModeToggle, 200);
            return;
        }
        
        console.log('Configurando botão de modo edição...');
        
        // Remover listener anterior usando clone
        const newToggleBtn = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
        
        if (newToggleBtn && overlay) {
            newToggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão modo edição clicado! Modo ativo:', !editModeActive);
                
                editModeActive = !editModeActive;
                
                if (editModeActive) {
                    overlay.classList.remove('hidden');
                    newToggleBtn.innerHTML = '<i class="fas fa-times mr-2"></i>Sair do Modo Edição';
                    newToggleBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
                    newToggleBtn.classList.add('bg-red-600', 'hover:bg-red-700');
                    
                    // Aguardar iframe carregar antes de habilitar modo edição
                    const previewIframe = document.getElementById('decorator-page-preview');
                    if (previewIframe) {
                        if (previewIframe.contentDocument || previewIframe.contentWindow) {
                            enableEditMode();
                        } else {
                            previewIframe.onload = function() {
                                enableEditMode();
                            };
                        }
                    }
                } else {
                    overlay.classList.add('hidden');
                    newToggleBtn.innerHTML = '<i class="fas fa-edit mr-2"></i>Modo Edição';
                    newToggleBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
                    newToggleBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
                    disableEditMode();
                }
            });
        }
    }
    
    function enableEditMode() {
        const previewIframe = document.getElementById('decorator-page-preview');
        if (!previewIframe) return;
        
        // Aguardar iframe carregar completamente
        const tryEnableEdit = () => {
            try {
                const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow?.document;
                if (!iframeDoc || !iframeDoc.body) {
                    setTimeout(tryEnableEdit, 200);
                    return;
                }
                
                // Verificar se já foi adicionado o estilo
                if (iframeDoc.getElementById('decorator-edit-style')) return;
                
                const style = iframeDoc.createElement('style');
                style.id = 'decorator-edit-style';
                style.textContent = `
                    .editable-element {
                        position: relative !important;
                        cursor: pointer !important;
                        outline: 2px dashed rgba(59, 130, 246, 0.5) !important;
                        outline-offset: 2px !important;
                    }
                    .editable-element:hover {
                        outline-color: rgba(59, 130, 246, 0.8) !important;
                        background-color: rgba(59, 130, 246, 0.1) !important;
                    }
                    .edit-icon {
                        position: absolute !important;
                        top: -8px !important;
                        right: -8px !important;
                        background: #3b82f6 !important;
                        color: white !important;
                        border-radius: 50% !important;
                        width: 24px !important;
                        height: 24px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        font-size: 12px !important;
                        z-index: 10000 !important;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
                    }
                `;
                iframeDoc.head.appendChild(style);
                
                // Função auxiliar para tornar elementos editáveis
                function makeElementEditable(el, field, iframeDoc) {
                    if (el.classList.contains('editable-element')) return;
                    
                    el.classList.add('editable-element');
                    el.setAttribute('data-edit-field', field);
                    
                    // Verificar se já tem ícone
                    if (el.querySelector('.edit-icon')) return;
                    
                    const editIcon = iframeDoc.createElement('div');
                    editIcon.className = 'edit-icon';
                    editIcon.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                    el.style.position = 'relative';
                    el.appendChild(editIcon);
                    
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        let value = '';
                        if (field === 'cover_image_url') {
                            try {
                                const iframeWindow = previewIframe.contentWindow || previewIframe.contentDocument.defaultView;
                                const bgImage = iframeWindow.getComputedStyle(el).backgroundImage;
                                value = bgImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
                            } catch (err) {
                                value = el.style.backgroundImage || '';
                            }
                        } else {
                            value = el.textContent || el.innerText || '';
                        }
                        openEditModal(field, value);
                    });
                }
                
                // Adicionar classe editável e ícone de lápis aos elementos principais
                // Baseado na nova estrutura simplificada da pagina-decorador.php
                // Estrutura: section#inicio.decorator-hero > h1 e p.text-xl
                
                // 1. Título (h1 dentro de #inicio)
                try {
                    let titleEl = iframeDoc.querySelector('#inicio h1') || 
                                  iframeDoc.querySelector('section#inicio h1') ||
                                  iframeDoc.querySelector('.decorator-hero h1');
                    if (titleEl) {
                        makeElementEditable(titleEl, 'page_title', iframeDoc);
                    }
                } catch (err) {
                    console.error('Erro ao adicionar edição para título:', err);
                }
                
                // 2. Descrição (p.text-xl dentro de #inicio)
                try {
                    let descEl = iframeDoc.querySelector('#inicio p.text-xl') ||
                                 iframeDoc.querySelector('#inicio p.text-xl.md\\:text-2xl') ||
                                 iframeDoc.querySelector('section#inicio p.text-xl') ||
                                 iframeDoc.querySelector('section#inicio p');
                    if (descEl) {
                        makeElementEditable(descEl, 'page_description', iframeDoc);
                    }
                } catch (err) {
                    console.error('Erro ao adicionar edição para descrição:', err);
                }
                
                // 3. Imagem de capa (section.decorator-hero)
                try {
                    let heroEl = iframeDoc.querySelector('section.decorator-hero') ||
                                 iframeDoc.querySelector('section#inicio.decorator-hero') ||
                                 iframeDoc.querySelector('#inicio.decorator-hero');
                    if (heroEl) {
                        makeElementEditable(heroEl, 'cover_image_url', iframeDoc);
                    }
                } catch (err) {
                    console.error('Erro ao adicionar edição para imagem de capa:', err);
                }
            } catch (e) {
                console.error('Erro ao habilitar modo de edição:', e);
                // Se houver erro de CORS, apenas mostrar mensagem
                showNotification('Modo de edição visual disponível. Use os campos do formulário para editar.', 'info');
            }
        };
        
        // Tentar habilitar após um pequeno delay para garantir que o iframe carregou
        setTimeout(tryEnableEdit, 500);
    }
    
    function disableEditMode() {
        const previewIframe = document.getElementById('decorator-page-preview');
        if (!previewIframe) return;
        
        try {
            const iframeDoc = previewIframe.contentDocument || previewIframe.contentWindow?.document;
            if (!iframeDoc || !iframeDoc.body) return;
            
            // Remover estilo de edição
            const editStyle = iframeDoc.getElementById('decorator-edit-style');
            if (editStyle) {
                editStyle.remove();
            }
            
            // Remover classes e ícones de edição
            const editableElements = iframeDoc.querySelectorAll('.editable-element');
            editableElements.forEach(el => {
                el.classList.remove('editable-element');
                el.removeAttribute('data-edit-field');
                const editIcon = el.querySelector('.edit-icon');
                if (editIcon) editIcon.remove();
            });
        } catch (e) {
            console.error('Erro ao desabilitar modo de edição:', e);
        }
    }
    
    function openEditModal(field, currentValue) {
        // Limpar valor se for URL de imagem
        if (field === 'cover_image_url' && currentValue) {
            currentValue = currentValue.replace(/url\(['"]?/g, '').replace(/['"]?\)/g, '');
        }
        
        // Criar modal simples para editar
        const modal = document.createElement('div');
        modal.id = 'edit-modal-overlay';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <h3 class="text-lg font-semibold mb-4 text-gray-800">
                    <i class="fas fa-edit mr-2 text-indigo-600"></i>
                    Editar ${getFieldLabel(field)}
                </h3>
                ${field === 'cover_image_url' ? 
                    `<input type="url" id="edit-field-value" class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4" value="${currentValue}" placeholder="https://exemplo.com/imagem.jpg">` :
                    `<textarea id="edit-field-value" class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4" rows="4" placeholder="Digite o conteúdo">${currentValue || ''}</textarea>`
                }
                <div class="flex gap-2">
                    <button id="cancel-edit" class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                        <i class="fas fa-times mr-2"></i>Cancelar
                    </button>
                    <button id="save-edit" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <i class="fas fa-save mr-2"></i>Salvar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Fechar ao clicar no overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.getElementById('save-edit').addEventListener('click', () => {
            const newValue = document.getElementById('edit-field-value').value.trim();
            if (newValue) {
                updateField(field, newValue);
                modal.remove();
                // Aguardar um pouco antes de atualizar preview para garantir que o campo foi atualizado
                setTimeout(() => {
                    updatePreview();
                }, 200);
            } else {
                showNotification('O campo não pode estar vazio', 'error');
            }
        });
        
        document.getElementById('cancel-edit').addEventListener('click', () => {
            modal.remove();
        });
        
        // Focar no campo de edição
        setTimeout(() => {
            const input = document.getElementById('edit-field-value');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);
    }
    
    function getFieldLabel(field) {
        const labels = {
            'page_title': 'Título',
            'page_description': 'Descrição',
            'welcome_text': 'Texto de Boas-vindas',
            'cover_image_url': 'URL da Imagem'
        };
        return labels[field] || field;
    }
    
    function updateField(field, value) {
        const fieldMap = {
            'page_title': 'decorator-page-title',
            'page_description': 'decorator-page-description',
            'welcome_text': 'decorator-welcome-text',
            'cover_image_url': 'decorator-cover-image-url'
        };
        
        const inputId = fieldMap[field];
        if (inputId) {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = value;
                // Disparar eventos para atualizar preview
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Mostrar feedback visual
                input.style.borderColor = '#10b981';
                setTimeout(() => {
                    input.style.borderColor = '';
                }, 1000);
                
                showNotification(`${getFieldLabel(field)} atualizado!`, 'success');
            }
        }
    }
    
    function setupDecoratorCustomizationTabs() {
        // Usar event delegation no container do formulário
        const form = document.getElementById('decorator-page-customization-form');
        if (!form) {
            setTimeout(setupDecoratorCustomizationTabs, 100);
            return;
        }
        
        // Função para lidar com cliques nas tabs
        function handleTabClick(e) {
            const tab = e.target.closest('.decorator-customization-tab');
            if (!tab) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const targetTab = tab.getAttribute('data-tab');
            if (!targetTab) return;
            
            const tabs = document.querySelectorAll('.decorator-customization-tab');
            const panels = document.querySelectorAll('.decorator-tab-panel');
            
            // Remover active de todas as tabs
            tabs.forEach(t => {
                t.classList.remove('active', 'text-indigo-600', 'border-indigo-600');
                t.classList.add('text-gray-500');
            });
            
            // Adicionar active na tab clicada
            tab.classList.add('active', 'text-indigo-600', 'border-indigo-600');
            tab.classList.remove('text-gray-500');
            
            // Esconder todos os painéis
            panels.forEach(p => p.classList.add('hidden'));
            
            // Mostrar painel correspondente
            const panel = document.getElementById(`decorator-tab-${targetTab}-panel`);
            if (panel) {
                panel.classList.remove('hidden');
            }
        }
        
        // Remover listener anterior se existir
        form.removeEventListener('click', handleTabClick);
        form.addEventListener('click', handleTabClick);
    }
    
    function setupDecoratorColorInputs() {
        const colorInputs = ['primary', 'secondary', 'accent'];
        
        colorInputs.forEach(color => {
            const colorPicker = document.getElementById(`decorator-${color}-color`);
            const colorHex = document.getElementById(`decorator-${color}-color-hex`);
            
            if (colorPicker && colorHex) {
                // Sincronizar color picker com input de texto
                colorPicker.addEventListener('input', (e) => {
                    colorHex.value = e.target.value;
                });
                
                // Sincronizar input de texto com color picker
                colorHex.addEventListener('input', (e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                        colorPicker.value = value;
                    }
                });
            }
        });
    }
    
    function setupDecoratorCharCounters() {
        const metaTitle = document.getElementById('decorator-meta-title');
        const metaDescription = document.getElementById('decorator-meta-description');
        const metaTitleCount = document.getElementById('decorator-meta-title-count');
        const metaDescriptionCount = document.getElementById('decorator-meta-description-count');
        
        if (metaTitle && metaTitleCount) {
            metaTitle.addEventListener('input', () => {
                const count = metaTitle.value.length;
                metaTitleCount.textContent = `${count} caracteres`;
                metaTitleCount.style.color = count > 60 ? '#ef4444' : '#6b7280';
            });
        }
        
        if (metaDescription && metaDescriptionCount) {
            metaDescription.addEventListener('input', () => {
                const count = metaDescription.value.length;
                metaDescriptionCount.textContent = `${count} caracteres`;
                metaDescriptionCount.style.color = count > 160 ? '#ef4444' : '#6b7280';
            });
        }
        
        updateDecoratorCharCounters();
    }
    
    function updateDecoratorCharCounters() {
        const metaTitle = document.getElementById('decorator-meta-title');
        const metaDescription = document.getElementById('decorator-meta-description');
        const metaTitleCount = document.getElementById('decorator-meta-title-count');
        const metaDescriptionCount = document.getElementById('decorator-meta-description-count');
        
        if (metaTitle && metaTitleCount) {
            const count = metaTitle.value.length;
            metaTitleCount.textContent = `${count} caracteres`;
        }
        
        if (metaDescription && metaDescriptionCount) {
            const count = metaDescription.value.length;
            metaDescriptionCount.textContent = `${count} caracteres`;
        }
    }
    

    console.log('Dashboard do Decorador - Sistema carregado com sucesso!');
});