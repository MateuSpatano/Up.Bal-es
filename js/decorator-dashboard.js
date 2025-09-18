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

    // ========== VARIÁVEIS DE ESTADO ==========
    
    let isSidebarOpen = false;
    let currentModule = 'dashboard';

    // ========== INICIALIZAÇÃO ==========
    
    // Carregar dados do usuário
    loadUserData();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar navegação
    setupNavigation();
    
    // Configurar modal de conta
    setupAccountModal();
    
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
        
        // Carregar serviços (simulado)
        loadServicos();
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
    }
    
    function loadServicos() {
        // Simular carregamento de serviços
        const servicos = [
            {
                id: 1,
                titulo: 'Decoração de Aniversário',
                cliente: 'Maria Silva',
                data: '15/12/2024',
                hora: '14:00',
                local: 'Rua das Flores, 123',
                status: 'confirmado',
                valor: 'R$ 500,00'
            },
            {
                id: 2,
                titulo: 'Decoração de Casamento',
                cliente: 'João Santos',
                data: '20/12/2024',
                hora: '16:00',
                local: 'Salão de Festas Central',
                status: 'pendente',
                valor: 'R$ 1.200,00'
            },
            {
                id: 3,
                titulo: 'Decoração de Formatura',
                cliente: 'Ana Costa',
                data: '18/12/2024',
                hora: '19:00',
                local: 'Faculdade Central',
                status: 'em-andamento',
                valor: 'R$ 800,00'
            }
        ];
        
        // Aqui você pode implementar a renderização dinâmica dos serviços
        console.log('Serviços carregados:', servicos);
    }
    
    function applyFilters() {
        const statusFilter = document.getElementById('status-filter');
        const periodFilter = document.getElementById('period-filter');
        const clientFilter = document.getElementById('client-filter');
        
        const filters = {
            status: statusFilter ? statusFilter.value : '',
            period: periodFilter ? periodFilter.value : '',
            client: clientFilter ? clientFilter.value : ''
        };
        
        console.log('Aplicando filtros:', filters);
        
        // Aqui você pode implementar a lógica de filtragem
        // Por exemplo, fazer requisição AJAX com os filtros
        
        showNotification('Filtros aplicados com sucesso!', 'success');
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

    console.log('Dashboard do Decorador - Sistema carregado com sucesso!');
});