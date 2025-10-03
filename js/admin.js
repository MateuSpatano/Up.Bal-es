// Admin.js - Sistema de Administração Up.Baloes
class AdminSystem {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredUsers = [];
        this.charts = {};
        
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadUsers();
        this.setupEventListeners();
        this.updateCurrentTime();
        this.loadDashboardData();
        this.initializeCharts();
        
        // Atualizar hora a cada minuto
        setInterval(() => this.updateCurrentTime(), 60000);
    }

    // Verificação de Autenticação
    checkAuthentication() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.showNotification('Acesso negado. Apenas administradores podem acessar esta área.', 'error');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            return;
        }
    }

    // Carregar dados dos usuários
    loadUsers() {
        // Simular dados de usuários (em produção, viria de uma API)
        this.users = [
            {
                id: 1,
                name: 'João Silva',
                email: 'joao@email.com',
                phone: '(11) 99999-9999',
                type: 'client',
                status: 'active',
                createdAt: '2024-01-15',
                address: 'Rua das Flores, 123'
            },
            {
                id: 2,
                name: 'Maria Santos',
                email: 'maria@email.com',
                phone: '(11) 88888-8888',
                type: 'decorator',
                status: 'active',
                createdAt: '2024-01-20',
                address: 'Av. Principal, 456'
            },
            {
                id: 3,
                name: 'Pedro Costa',
                email: 'pedro@email.com',
                phone: '(11) 77777-7777',
                type: 'client',
                status: 'inactive',
                createdAt: '2024-02-01',
                address: 'Rua da Paz, 789'
            },
            {
                id: 4,
                name: 'Ana Oliveira',
                email: 'ana@email.com',
                phone: '(11) 66666-6666',
                type: 'decorator',
                status: 'active',
                createdAt: '2024-02-10',
                address: 'Rua do Sol, 321'
            }
        ];
        
        this.filteredUsers = [...this.users];
        this.renderUsersTable();
    }

    // Configurar Event Listeners
    setupEventListeners() {
        // Menu mobile
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('admin-sidebar');
        const mobileOverlay = document.getElementById('mobile-overlay');

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('-translate-x-full');
                mobileOverlay.classList.toggle('hidden');
            });
        }

        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
                mobileOverlay.classList.add('hidden');
            });
        }

        // Navegação do menu
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('href').substring(1);
                this.showPage(target);
                
                // Fechar menu mobile após clicar
                if (window.innerWidth < 768) {
                    sidebar.classList.add('-translate-x-full');
                    mobileOverlay.classList.add('hidden');
                }
            });
        });

        // Formulário de criação de decorador
        document.getElementById('create-decorator-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createDecorator();
        });

        // Formulário de edição de usuário
        document.getElementById('edit-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateUser();
        });

        // Busca e filtros
        document.getElementById('user-search').addEventListener('input', () => {
            this.filterUsers();
        });

        document.getElementById('user-type-filter').addEventListener('change', () => {
            this.filterUsers();
        });

        document.getElementById('user-status-filter').addEventListener('change', () => {
            this.filterUsers();
        });

        // Paginação
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderUsersTable();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderUsersTable();
            }
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Modais
        this.setupModalListeners();

        // Máscaras de input
        this.setupInputMasks();

        // Toggle de senha
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', (e) => {
                this.togglePasswordVisibility(e.target);
            });
        });
    }

    // Configurar listeners dos modais
    setupModalListeners() {
        // Modal de edição de usuário
        document.getElementById('close-edit-user-modal').addEventListener('click', () => {
            this.closeModal('edit-user-modal');
        });

        document.getElementById('edit-user-modal-overlay').addEventListener('click', () => {
            this.closeModal('edit-user-modal');
        });

        document.getElementById('cancel-edit-user').addEventListener('click', () => {
            this.closeModal('edit-user-modal');
        });
    }

    // Configurar máscaras de input
    setupInputMasks() {
        // CPF
        const cpfInput = document.getElementById('decorator-cpf');
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });

        // Telefone
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            });
        });
    }

    // Mostrar página específica
    showPage(pageId) {
        // Remover classe active de todos os itens do menu
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Adicionar classe active ao item clicado
        document.querySelector(`a[href="#${pageId}"]`).classList.add('active');

        // Esconder todos os conteúdos
        document.querySelectorAll('.admin-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Mostrar conteúdo da página selecionada
        document.getElementById(`${pageId}-content`).classList.remove('hidden');

        // Atualizar título da página
        const titles = {
            'dashboard': { title: 'Dashboard', subtitle: 'Visão geral do sistema' },
            'create-decorator': { title: 'Criar Decorador', subtitle: 'Adicionar nova conta de decorador' },
            'manage-users': { title: 'Gerenciar Usuários', subtitle: 'Administrar contas de usuários' },
            'reports': { title: 'Relatórios', subtitle: 'Visualizar relatórios do sistema' },
            'settings': { title: 'Configurações', subtitle: 'Configurar opções do sistema' }
        };

        const pageInfo = titles[pageId];
        if (pageInfo) {
            document.getElementById('page-title').textContent = pageInfo.title;
            document.getElementById('page-subtitle').textContent = pageInfo.subtitle;
        }

        // Carregar dados específicos da página
        if (pageId === 'dashboard') {
            this.loadDashboardData();
        } else if (pageId === 'manage-users') {
            this.renderUsersTable();
        }
    }

    // Carregar dados do dashboard
    loadDashboardData() {
        // Simular dados (em produção, viria de uma API)
        const dashboardData = {
            totalClients: this.users.filter(u => u.type === 'client').length,
            activeDecorators: this.users.filter(u => u.type === 'decorator' && u.status === 'active').length,
            totalRequests: 45, // Simulado
            totalServices: 32  // Simulado
        };

        // Atualizar métricas
        document.getElementById('total-clients').textContent = dashboardData.totalClients;
        document.getElementById('active-decorators').textContent = dashboardData.activeDecorators;
        document.getElementById('total-requests').textContent = dashboardData.totalRequests;
        document.getElementById('total-services').textContent = dashboardData.totalServices;

        // Carregar atividades recentes
        this.loadRecentActivities();
    }

    // Carregar atividades recentes
    loadRecentActivities() {
        const activities = [
            { action: 'Novo decorador criado', user: 'Ana Oliveira', time: '2 horas atrás', type: 'success' },
            { action: 'Cliente desativado', user: 'Pedro Costa', time: '4 horas atrás', type: 'warning' },
            { action: 'Solicitação de orçamento', user: 'João Silva', time: '6 horas atrás', type: 'info' },
            { action: 'Serviço concluído', user: 'Maria Santos', time: '1 dia atrás', type: 'success' }
        ];

        const container = document.getElementById('recent-activities');
        container.innerHTML = activities.map(activity => `
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'success' ? 'bg-green-100 text-green-600' :
                    activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                }">
                    <i class="fas ${
                        activity.type === 'success' ? 'fa-check' :
                        activity.type === 'warning' ? 'fa-exclamation' :
                        'fa-info'
                    } text-sm"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-800">${activity.action}</p>
                    <p class="text-xs text-gray-500">${activity.user} • ${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    // Inicializar gráficos
    initializeCharts() {
        // Gráfico de solicitações por mês
        const requestsCtx = document.getElementById('requests-chart').getContext('2d');
        this.charts.requests = new Chart(requestsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Solicitações',
                    data: [12, 19, 8, 15, 22, 18],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5
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
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });

        // Gráfico de usuários por tipo
        const usersCtx = document.getElementById('users-chart').getContext('2d');
        this.charts.users = new Chart(usersCtx, {
            type: 'doughnut',
            data: {
                labels: ['Clientes', 'Decoradores'],
                datasets: [{
                    data: [
                        this.users.filter(u => u.type === 'client').length,
                        this.users.filter(u => u.type === 'decorator').length
                    ],
                    backgroundColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    // Criar decorador
    async createDecorator() {
        const form = document.getElementById('create-decorator-form');
        const formData = new FormData(form);
        
        const decoratorData = {
            action: 'create',
            nome: formData.get('name'),
            cpf: formData.get('cpf'),
            email: formData.get('email'),
            telefone: formData.get('phone'),
            whatsapp: formData.get('whatsapp'),
            communication_email: formData.get('communication_email'),
            endereco: formData.get('address'),
            senha: formData.get('password')
        };

        // Validações
        if (!this.validateDecoratorData(decoratorData)) {
            return;
        }

        try {
            // Mostrar loading
            const submitBtn = document.getElementById('create-decorator-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Criando...';
            submitBtn.disabled = true;

            // Enviar para o servidor
            const response = await fetch('../services/decorador.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(decoratorData)
            });

            const result = await response.json();

            if (result.success) {
                // Adicionar usuário localmente
                const newDecorator = {
                    id: result.data.id,
                    name: decoratorData.nome,
                    email: decoratorData.email,
                    phone: decoratorData.telefone,
                    type: 'decorator',
                    status: 'active',
                    createdAt: new Date().toISOString().split('T')[0],
                    slug: result.data.slug,
                    url: result.data.url
                };

                this.users.push(newDecorator);
                this.filteredUsers = [...this.users];
                
                // Limpar formulário
                form.reset();
                
                // Mostrar sucesso com link
                this.showDecoratorCreatedSuccess(result.data);
                
                // Atualizar dashboard
                this.loadDashboardData();
                this.charts.users.data.datasets[0].data = [
                    this.users.filter(u => u.type === 'client').length,
                    this.users.filter(u => u.type === 'decorator').length
                ];
                this.charts.users.update();
            } else {
                this.showNotification(result.message || 'Erro ao criar decorador', 'error');
            }
        } catch (error) {
            console.error('Erro ao criar decorador:', error);
            this.showNotification('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Restaurar botão
            const submitBtn = document.getElementById('create-decorator-btn');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // Validar dados do decorador
    validateDecoratorData(data) {
        if (!data.nome || data.nome.trim().length < 2) {
            this.showNotification('Nome deve ter pelo menos 2 caracteres', 'error');
            return false;
        }

        if (!this.validateCPF(data.cpf)) {
            this.showNotification('CPF inválido', 'error');
            return false;
        }

        if (!this.validateEmail(data.email)) {
            this.showNotification('Email inválido', 'error');
            return false;
        }

        if (this.users.find(u => u.email === data.email)) {
            this.showNotification('Email já cadastrado', 'error');
            return false;
        }

        if (!data.telefone || data.telefone.trim().length < 10) {
            this.showNotification('Telefone inválido', 'error');
            return false;
        }

        if (!data.whatsapp || data.whatsapp.trim().length < 10) {
            this.showNotification('WhatsApp inválido', 'error');
            return false;
        }

        if (!this.validateEmail(data.communication_email)) {
            this.showNotification('E-mail para comunicação inválido', 'error');
            return false;
        }

        if (this.users.find(u => u.communication_email === data.communication_email)) {
            this.showNotification('E-mail para comunicação já cadastrado', 'error');
            return false;
        }

        if (!data.senha || data.senha.length < 8) {
            this.showNotification('Senha deve ter pelo menos 8 caracteres', 'error');
            return false;
        }

        return true;
    }

    // Validar CPF
    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        
        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validar dígitos verificadores
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = 11 - (sum % 11);
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = 11 - (sum % 11);
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }

    // Validar email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Filtrar usuários
    filterUsers() {
        const search = document.getElementById('user-search').value.toLowerCase();
        const typeFilter = document.getElementById('user-type-filter').value;
        const statusFilter = document.getElementById('user-status-filter').value;

        this.filteredUsers = this.users.filter(user => {
            const matchesSearch = !search || 
                user.name.toLowerCase().includes(search) || 
                user.email.toLowerCase().includes(search);
            
            const matchesType = !typeFilter || user.type === typeFilter;
            const matchesStatus = !statusFilter || user.status === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });

        this.currentPage = 1;
        this.renderUsersTable();
    }

    // Renderizar tabela de usuários
    renderUsersTable() {
        const tbody = document.getElementById('users-table-body');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageUsers = this.filteredUsers.slice(startIndex, endIndex);

        tbody.innerHTML = pageUsers.map(user => `
            <tr class="table-row">
                <td class="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <i class="fas fa-user text-gray-600 text-xs md:text-sm"></i>
                        </div>
                        <div class="ml-2 md:ml-4">
                            <div class="text-xs md:text-sm font-medium text-gray-900">${user.name}</div>
                            <div class="text-xs md:text-sm text-gray-500">${user.email}</div>
                            <div class="sm:hidden">
                                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                    user.type === 'decorator' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }">
                                    <i class="fas ${user.type === 'decorator' ? 'fa-user-tie' : 'fa-user'} mr-1"></i>
                                    ${user.type === 'decorator' ? 'Decorador' : 'Cliente'}
                                </span>
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden sm:table-cell">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.type === 'decorator' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }">
                        <i class="fas ${user.type === 'decorator' ? 'fa-user-tie' : 'fa-user'} mr-1"></i>
                        ${user.type === 'decorator' ? 'Decorador' : 'Cliente'}
                    </span>
                </td>
                <td class="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span class="status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td class="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden md:table-cell">
                    ${new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td class="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-1 md:space-x-2">
                        ${user.type === 'decorator' && user.slug ? `
                            <button onclick="admin.copyDecoratorLink('${user.url}')" class="text-green-600 hover:text-green-900 p-1" title="Copiar Link">
                                <i class="fas fa-link text-xs md:text-sm"></i>
                            </button>
                        ` : ''}
                        <button onclick="admin.editUser(${user.id})" class="text-blue-600 hover:text-blue-900 p-1" title="Editar">
                            <i class="fas fa-edit text-xs md:text-sm"></i>
                        </button>
                        <button onclick="admin.toggleUserStatus(${user.id})" class="text-yellow-600 hover:text-yellow-900 p-1" title="Alterar Status">
                            <i class="fas fa-toggle-${user.status === 'active' ? 'on' : 'off'} text-xs md:text-sm"></i>
                        </button>
                        <button onclick="admin.deleteUser(${user.id})" class="text-red-600 hover:text-red-900 p-1" title="Excluir">
                            <i class="fas fa-trash text-xs md:text-sm"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Atualizar paginação
        this.updatePagination();
    }

    // Atualizar paginação
    updatePagination() {
        const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredUsers.length);

        document.getElementById('showing-start').textContent = startItem;
        document.getElementById('showing-end').textContent = endItem;
        document.getElementById('total-users').textContent = this.filteredUsers.length;
        document.getElementById('current-page').textContent = this.currentPage;

        document.getElementById('prev-page').disabled = this.currentPage === 1;
        document.getElementById('next-page').disabled = this.currentPage === totalPages;
    }

    // Editar usuário
    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        // Preencher formulário
        document.getElementById('edit-user-id').value = user.id;
        document.getElementById('edit-user-name').value = user.name;
        document.getElementById('edit-user-email').value = user.email;
        document.getElementById('edit-user-phone').value = user.phone;
        document.getElementById('edit-user-status').value = user.status;

        // Mostrar modal
        this.showModal('edit-user-modal');
    }

    // Atualizar usuário
    updateUser() {
        const form = document.getElementById('edit-user-form');
        const formData = new FormData(form);
        
        const userId = parseInt(formData.get('id'));
        const userIndex = this.users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) return;

        // Atualizar dados
        this.users[userIndex] = {
            ...this.users[userIndex],
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            status: formData.get('status')
        };

        this.filteredUsers = [...this.users];
        this.renderUsersTable();
        this.closeModal('edit-user-modal');
        this.showNotification('Usuário atualizado com sucesso!', 'success');
    }

    // Alternar status do usuário
    toggleUserStatus(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        user.status = user.status === 'active' ? 'inactive' : 'active';
        this.filteredUsers = [...this.users];
        this.renderUsersTable();
        
        const statusText = user.status === 'active' ? 'ativado' : 'desativado';
        this.showNotification(`Usuário ${statusText} com sucesso!`, 'success');
    }

    // Excluir usuário
    deleteUser(userId) {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) {
            return;
        }

        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return;

        this.users.splice(userIndex, 1);
        this.filteredUsers = [...this.users];
        this.renderUsersTable();
        this.showNotification('Usuário excluído com sucesso!', 'success');
    }

    // Mostrar modal
    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    // Fechar modal
    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    // Alternar visibilidade da senha
    togglePasswordVisibility(button) {
        const input = button.closest('.relative').querySelector('input');
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    // Atualizar hora atual
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        document.getElementById('current-time').textContent = timeString;
    }

    // Mostrar notificação
    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                    'fa-info-circle'
                }"></i>
                <span>${message}</span>
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
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Mostrar sucesso da criação do decorador com link
    showDecoratorCreatedSuccess(data) {
        // Criar modal de sucesso
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 overflow-y-auto';
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <!-- Overlay -->
                <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>

                <!-- Modal Content -->
                <div class="inline-block w-full max-w-2xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <i class="fas fa-check text-white text-lg"></i>
                                </div>
                                <div>
                                    <h3 class="text-xl font-semibold text-white">Decorador Criado com Sucesso!</h3>
                                    <p class="text-green-100 text-sm">Link único gerado automaticamente</p>
                                </div>
                            </div>
                            <button class="text-white hover:text-gray-200 transition-colors duration-200 close-modal">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-6">
                        <div class="text-center mb-6">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-user-tie text-green-600 text-2xl"></i>
                            </div>
                            <h4 class="text-lg font-semibold text-gray-800 mb-2">Link do Decorador</h4>
                            <p class="text-gray-600">Compartilhe este link com seus clientes</p>
                        </div>

                        <!-- Link do decorador -->
                        <div class="bg-gray-50 rounded-lg p-4 mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-link mr-2 text-blue-600"></i>URL do Decorador
                            </label>
                            <div class="flex">
                                <input type="text" 
                                       value="${data.url}" 
                                       readonly 
                                       class="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-white text-gray-800 font-mono text-sm"
                                       id="decorator-url">
                                <button onclick="copyDecoratorUrl()" 
                                        class="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors duration-200"
                                        title="Copiar link">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Informações adicionais -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div class="bg-blue-50 rounded-lg p-4">
                                <h5 class="font-semibold text-blue-800 mb-2">
                                    <i class="fas fa-info-circle mr-2"></i>Slug Gerado
                                </h5>
                                <p class="text-blue-600 font-mono">${data.slug}</p>
                            </div>
                            <div class="bg-purple-50 rounded-lg p-4">
                                <h5 class="font-semibold text-purple-800 mb-2">
                                    <i class="fas fa-id-badge mr-2"></i>ID do Decorador
                                </h5>
                                <p class="text-purple-600">#${data.id}</p>
                            </div>
                        </div>

                        <!-- Botões -->
                        <div class="flex flex-col sm:flex-row gap-3">
                            <button class="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 close-modal">
                                <i class="fas fa-times mr-2"></i>Fechar
                            </button>
                            <a href="${data.url}" 
                               target="_blank"
                               class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 text-center">
                                <i class="fas fa-external-link-alt mr-2"></i>Ver Página do Decorador
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners para fechar modal
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });
        
        // Fechar ao clicar no overlay
        modal.querySelector('.fixed.inset-0').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.body.removeChild(modal);
            }
        });
    }

    // Copiar link do decorador
    copyDecoratorLink(url) {
        try {
            navigator.clipboard.writeText(url).then(() => {
                this.showNotification('Link copiado para a área de transferência!', 'success');
            }).catch(() => {
                // Fallback para navegadores mais antigos
                const textArea = document.createElement('textarea');
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('Link copiado para a área de transferência!', 'success');
            });
        } catch (err) {
            console.error('Erro ao copiar link:', err);
            this.showNotification('Erro ao copiar link', 'error');
        }
    }

    // Logout
    logout() {
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('currentUser');
            window.location.href = '../index.html';
        }
    }
}

// Função global para copiar URL do decorador
function copyDecoratorUrl() {
    const urlInput = document.getElementById('decorator-url');
    if (urlInput) {
        urlInput.select();
        urlInput.setSelectionRange(0, 99999); // Para dispositivos móveis
        
        try {
            document.execCommand('copy');
            
            // Mostrar feedback visual
            const button = event.target.closest('button');
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.classList.add('bg-green-600');
            button.classList.remove('bg-blue-600');
            
            setTimeout(() => {
                button.innerHTML = originalIcon;
                button.classList.remove('bg-green-600');
                button.classList.add('bg-blue-600');
            }, 2000);
            
        } catch (err) {
            console.error('Erro ao copiar:', err);
            // Fallback para navegadores modernos
            if (navigator.clipboard) {
                navigator.clipboard.writeText(urlInput.value).then(() => {
                    const button = event.target.closest('button');
                    const originalIcon = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check"></i>';
                    button.classList.add('bg-green-600');
                    button.classList.remove('bg-blue-600');
                    
                    setTimeout(() => {
                        button.innerHTML = originalIcon;
                        button.classList.remove('bg-green-600');
                        button.classList.add('bg-blue-600');
                    }, 2000);
                });
            }
        }
    }
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new AdminSystem();
});
