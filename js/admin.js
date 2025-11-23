// Admin.js - Sistema de Administração Up.Baloes
class AdminSystem {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredUsers = [];
        this.charts = {};
        this.dashboardData = null;
        this.supportTickets = [];
        this.filteredTickets = [];
        this.currentTicket = null;
        this.adminProfile = null;
        this.pendingAdminProfileImage = null;
        this.removeAdminProfileImage = false;
        this.adminPhotoFeedbackTimeout = null;
        this.adminSettingsLoaded = false;
        this.defaultAdminPhoto = '../Images/Logo System.jpeg';
        
        this.init();
    }

    async init() {
        // Verificar autenticação antes de continuar
        const isAuthenticated = await this.checkAuthentication();
        if (!isAuthenticated) {
            return; // Não continuar se não estiver autenticado
        }
        
        // Ativar proteção contra navegação com botões do navegador
        if (window.authProtection) {
            window.authProtection.protectBrowserNavigation('admin');
        }
        
        this.loadUsers();
        this.setupEventListeners();
        this.setupNotificationModalListeners();
        this.setupTicketModalListeners();
        this.updateCurrentTime();
        this.loadDashboardData();
        this.initializeCharts();
        this.loadSupportTickets();
        this.initializeSettingsModule();
        
        // Atualizar hora a cada minuto
        setInterval(() => this.updateCurrentTime(), 60000);
    }

    /**
     * Função auxiliar para fazer parse seguro de resposta JSON
     * Usa a função global safeResponseJson se disponível
     * @param {Response} response - Objeto Response do fetch
     * @param {*} defaultValue - Valor padrão caso o parse falhe
     * @returns {Promise<*>} - Objeto parseado ou valor padrão
     */
    async safeJsonParse(response, defaultValue = null) {
        if (typeof window !== 'undefined' && window.safeResponseJson) {
            return await window.safeResponseJson(response, defaultValue);
        }
        // Fallback se json-utils.js não estiver carregado
        try {
            const contentType = response.headers.get('content-type');
            const text = await response.text();
            
            // Log detalhado para debug
            if (!text || text.trim() === '') {
                console.error('Resposta vazia do servidor. Status:', response.status, response.statusText);
                console.error('URL:', response.url);
                console.error('Headers:', Object.fromEntries(response.headers.entries()));
                
                // Se for erro 401, retornar objeto de erro estruturado
                if (response.status === 401) {
                    return {
                        success: false,
                        message: 'Não autorizado. Faça login novamente.'
                    };
                }
                
                // Se for erro 500, retornar erro genérico
                if (response.status >= 500) {
                    return {
                        success: false,
                        message: 'Erro interno do servidor. Tente novamente mais tarde.'
                    };
                }
                
                // Para outros casos, retornar erro genérico baseado no status
                if (response.status >= 400) {
                    return {
                        success: false,
                        message: `Erro ${response.status}: ${response.statusText || 'Erro na requisição'}`
                    };
                }
                
                return defaultValue;
            }

            // Tentar fazer parse mesmo se Content-Type não for JSON (alguns servidores não enviam correto)
            try {
                const parsed = (typeof window !== 'undefined' && window.safeJsonParse) 
                    ? window.safeJsonParse(text, null) 
                    : JSON.parse(text);
                return parsed;
            } catch (parseError) {
                console.error('Erro ao fazer parse JSON. Status:', response.status);
                console.error('Content-Type:', contentType);
                console.error('Resposta raw (primeiros 500 chars):', text.substring(0, 500));
                console.error('Erro de parse:', parseError.message);
                
                // Se for erro 401, retornar objeto de erro estruturado
                if (response.status === 401) {
                    return {
                        success: false,
                        message: 'Não autorizado. Faça login novamente.'
                    };
                }
                
                // Tentar extrair mensagem de erro do HTML/texto se possível
                if (text.includes('Não autorizado') || text.includes('não autorizado') || text.toLowerCase().includes('unauthorized')) {
                    return {
                        success: false,
                        message: 'Não autorizado. Faça login novamente.'
                    };
                }
                
                // Se for erro 500, retornar erro genérico
                if (response.status >= 500) {
                    return {
                        success: false,
                        message: 'Erro interno do servidor. Tente novamente mais tarde.'
                    };
                }
                
                return defaultValue;
            }
        } catch (error) {
            console.error('Erro ao processar resposta:', error);
            return defaultValue;
        }
    }

    /**
     * Função auxiliar para fazer parse seguro de localStorage
     * @param {string} key - Chave do localStorage
     * @param {*} defaultValue - Valor padrão
     * @returns {*} - Objeto parseado ou valor padrão
     */
    safeLocalStorageGet(key, defaultValue = null) {
        if (typeof window !== 'undefined' && window.safeLocalStorageParse) {
            return window.safeLocalStorageParse(key, defaultValue);
        }
        // Fallback
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;
            return (typeof window !== 'undefined' && window.safeJsonParse) 
                ? window.safeJsonParse(item, defaultValue) 
                : JSON.parse(item);
        } catch (e) {
            console.warn(`Erro ao ler localStorage[${key}]:`, e);
            return defaultValue;
        }
    }

    // Verificação de Autenticação
    async checkAuthentication() {
        this.currentUser = this.safeLocalStorageGet('userData', {});
        
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.showNotification('Acesso negado. Apenas administradores podem acessar esta área.', 'error');
            setTimeout(() => {
                if (window.authProtection) {
                    window.authProtection.redirectToAdminLogin();
                } else {
                    window.location.replace('admin-login.html');
                }
            }, 2000);
            return false;
        }
        
        // Verificar autenticação no backend
        if (window.authProtection) {
            const backendAuth = await window.authProtection.verifyBackendAdminAuth();
            if (!backendAuth) {
                this.showNotification('Sessão expirada. Faça login novamente.', 'error');
                setTimeout(() => {
                    window.authProtection.redirectToAdminLogin();
                }, 2000);
                return false;
            }
        }
        
        return true;
    }

    // Carregar dados dos usuários
    async loadUsers() {
        try {
            // Obter valores dos filtros (vazios por padrão para retornar todos)
            const searchValue = document.getElementById('user-search')?.value || '';
            const typeValue = document.getElementById('user-type-filter')?.value || '';
            const statusValue = document.getElementById('user-status-filter')?.value || '';
            
            // Se não há filtros aplicados, carregar todos os usuários (sem paginação)
            // Caso contrário, usar paginação normal
            const hasFilters = searchValue || typeValue || statusValue;
            const limit = hasFilters ? this.itemsPerPage : 10000; // Limite alto para carregar todos quando sem filtros
            
            // Resetar página para 1 quando não há filtros
            if (!hasFilters) {
                this.currentPage = 1;
            }
            
            const response = await fetch('../services/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin', // Incluir cookies/sessão
                body: JSON.stringify({
                    action: 'get_users',
                    page: hasFilters ? this.currentPage : 1,
                    limit: limit,
                    search: searchValue,
                    type: typeValue, // Vazio por padrão = todos os tipos
                    status: statusValue // Vazio por padrão = todos os status
                })
            });
            
            // Log detalhado para debug
            if (!response.ok) {
                console.error('Erro HTTP ao carregar usuários:', response.status, response.statusText);
            }
            
            const result = await this.safeJsonParse(response, { success: false });
            
            if (result && result.success) {
                // Ajustar para a estrutura de resposta do admin.php
                this.users = result.data?.users || result.users || [];
                // Inicializar filteredUsers com todos os usuários carregados
                this.filteredUsers = [...this.users];
                this.refreshUsersChart();
                // Usar renderUsersTable para manter consistência com o sistema de filtros
                this.renderUsersTable();
            } else {
                const errorMsg = result?.message || 'Erro desconhecido ao carregar usuários';
                console.error('Erro ao carregar usuários:', errorMsg);
                console.error('Result completo:', result);
                
                // Se for erro de autenticação, redirecionar para login
                if (result?.message && (result.message.includes('Não autorizado') || result.message.includes('não autorizado'))) {
                    this.showNotification('Sessão expirada. Redirecionando para login...', 'error');
                    setTimeout(() => {
                        window.location.href = 'admin-login.html';
                    }, 2000);
                    return;
                }
                
                this.showNotification('Erro ao carregar usuários: ' + errorMsg, 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            console.error('Stack trace:', error.stack);
            this.showNotification('Erro de conexão ao carregar usuários', 'error');
        }
    }

    // Atualizar tabela de usuários
    updateUsersTable() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.users.forEach(user => {
            const row = document.createElement('tr');
            row.className = 'table-row hover:bg-gray-50';
            
            const statusBadge = this.getStatusBadge(user.status);
            const typeIcon = user.type === 'decorator' ? 'fas fa-user-tie' : 'fas fa-user';
            const typeText = user.type === 'decorator' ? 'Decorador' : 'Cliente';
            
            row.innerHTML = `
                <td class="px-3 md:px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                            <i class="${typeIcon} text-white text-sm"></i>
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${user.name}</div>
                            <div class="text-sm text-gray-500">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-3 md:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span class="text-sm text-gray-900">${typeText}</span>
                </td>
                <td class="px-3 md:px-6 py-4 whitespace-nowrap">
                    ${statusBadge}
                </td>
                <td class="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    ${new Date(user.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td class="px-3 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex space-x-2">
                        ${user.type === 'decorator' && user.url ?
                            `<button data-url="${user.url}"
                                    onclick="adminSystem.copyDecoratorLink(this.dataset.url)"
                                    class="text-emerald-600 hover:text-emerald-900 transition-colors duration-200"
                                    title="Copiar link público">
                                <i class="fas fa-share-nodes"></i>
                            </button>` : ''}
                        <button onclick="adminSystem.editUser(${user.id})" 
                                class="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                title="Editar usuário">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${user.type === 'decorator' && user.status === 'pending_approval' ? 
                            `<button onclick="adminSystem.approveDecorator(${user.id}, true)" 
                                     class="text-green-600 hover:text-green-900 transition-colors duration-200"
                                     title="Aprovar decorador">
                                <i class="fas fa-check"></i>
                            </button>
                            <button onclick="notifyDecorator(${user.id}, 'rejected')" 
                                     class="text-red-600 hover:text-red-900 transition-colors duration-200"
                                     title="Recusar e notificar">
                                <i class="fas fa-times"></i>
                            </button>` : ''}
                        ${user.type === 'decorator' && user.status === 'active' ? 
                            `<button onclick="notifyDecorator(${user.id}, 'approved')" 
                                     class="text-purple-600 hover:text-purple-900 transition-colors duration-200"
                                     title="Enviar notificação">
                                <i class="fas fa-bell"></i>
                            </button>` : ''}
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // Obter badge de status
    getStatusBadge(status) {
        const badges = {
            'active': '<span class="status-badge status-active">Ativo</span>',
            'inactive': '<span class="status-badge status-inactive">Inativo</span>',
            'pending_approval': '<span class="status-badge bg-yellow-100 text-yellow-800">Aguardando Aprovação</span>'
        };
        return badges[status] || '<span class="status-badge status-inactive">Desconhecido</span>';
    }

    // Atualizar paginação
    updatePagination(pagination) {
        const currentPageEl = document.getElementById('current-page');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const showingStart = document.getElementById('showing-start');
        const showingEnd = document.getElementById('showing-end');
        const totalUsers = document.getElementById('total-users');
        
        if (currentPageEl) currentPageEl.textContent = pagination.current_page;
        if (prevBtn) prevBtn.disabled = pagination.current_page <= 1;
        if (nextBtn) nextBtn.disabled = pagination.current_page >= pagination.total_pages;
        if (showingStart) showingStart.textContent = ((pagination.current_page - 1) * pagination.items_per_page) + 1;
        if (showingEnd) showingEnd.textContent = Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items);
        if (totalUsers) totalUsers.textContent = pagination.total_items;
    }

    // Aprovar decorador
    async approveDecorator(userId, approved) {
        try {
            const response = await fetch('../services/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'approve_decorator',
                    user_id: userId,
                    approved: approved
                })
            });
            
            const result = await this.safeJsonParse(response, { success: false });
            
            if (result && result.success) {
                this.showNotification(result.message, 'success');
                this.loadUsers(); // Recarregar lista
            } else {
                this.showNotification('Erro: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao aprovar decorador:', error);
            this.showNotification('Erro de conexão', 'error');
        }
    }

    // Editar usuário
    async editUser(userId) {
        try {
            // Buscar dados completos do usuário do servidor
            const response = await fetch('../services/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_user',
                    user_id: userId
                })
            });
            
            const result = await this.safeJsonParse(response, { success: false });
            
            let user;
            if (!result || !result.success) {
                // Fallback: buscar da lista local
                user = this.users.find(u => u.id === userId);
                if (!user) {
                    this.showNotification('Usuário não encontrado', 'error');
                    return;
                }
            } else {
                user = result.data;
            }
            
            // Armazenar status original para comparação posterior
            const originalStatus = user.status || (user.ativo ? 'active' : 'inactive');
            const originalApproved = user.aprovado_por_admin || (user.status === 'active' && user.type === 'decorator');
            
            // Preencher modal de edição
            document.getElementById('edit-user-id').value = user.id;
            document.getElementById('edit-user-name').value = user.name || '';
            document.getElementById('edit-user-email').value = user.email || '';
            document.getElementById('edit-user-phone').value = user.phone || '';
            document.getElementById('edit-user-whatsapp').value = user.whatsapp || '';
            document.getElementById('edit-user-instagram').value = user.instagram || '';
            document.getElementById('edit-user-email-comunicacao').value = user.email_comunicacao || '';
            
            // Definir status baseado no campo ativo do banco de dados
            const statusValue = user.ativo !== undefined ? (user.ativo ? 'active' : 'inactive') : (user.status || 'active');
            document.getElementById('edit-user-status').value = statusValue;
            
            // Armazenar dados originais no elemento para comparação
            document.getElementById('edit-user-id').setAttribute('data-original-status', statusValue);
            document.getElementById('edit-user-id').setAttribute('data-original-approved', originalApproved ? '1' : '0');
            
            // Mostrar seção de aprovação se for decorador
            const approvalSection = document.getElementById('decorator-approval-section');
            if (user && user.type === 'decorator') {
                if (approvalSection) {
                    approvalSection.classList.remove('hidden');
                    // Usar aprovado_por_admin do banco, não o status
                    const approvedValue = user.aprovado_por_admin !== undefined ? (user.aprovado_por_admin ? '1' : '0') : (statusValue === 'active' ? '1' : '0');
                    document.getElementById('edit-user-approved').value = approvedValue;
                }
            } else {
                if (approvalSection) {
                    approvalSection.classList.add('hidden');
                }
            }
            
            // Mostrar modal
            document.getElementById('edit-user-modal').classList.remove('hidden');
            
        } catch (error) {
            console.error('Erro ao editar usuário:', error);
            this.showNotification('Erro ao carregar dados do usuário', 'error');
        }
    }

    // Salvar edição de usuário
    async saveUserEdit() {
        try {
            const userId = document.getElementById('edit-user-id').value;
            const originalStatus = document.getElementById('edit-user-id').getAttribute('data-original-status');
            const currentStatus = document.getElementById('edit-user-status').value;
            
            const formData = {
                id: userId,
                name: document.getElementById('edit-user-name').value,
                email: document.getElementById('edit-user-email').value,
                phone: document.getElementById('edit-user-phone').value,
                whatsapp: document.getElementById('edit-user-whatsapp').value,
                instagram: document.getElementById('edit-user-instagram').value,
                email_comunicacao: document.getElementById('edit-user-email-comunicacao').value
            };
            
            // Só enviar status se foi realmente alterado
            if (currentStatus !== originalStatus) {
                formData.status = currentStatus;
            }
            
            // Adicionar aprovação se for decorador
            const approvalSection = document.getElementById('decorator-approval-section');
            if (approvalSection && !approvalSection.classList.contains('hidden')) {
                const originalApproved = document.getElementById('edit-user-id').getAttribute('data-original-approved') === '1';
                const currentApproved = document.getElementById('edit-user-approved').value === '1';
                
                // Só enviar aprovação se foi realmente alterada
                if (currentApproved !== originalApproved) {
                    formData.aprovado_por_admin = currentApproved;
                }
            }
            
            const response = await fetch('../services/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'update_user',
                    ...formData
                })
            });
            
            const result = await this.safeJsonParse(response, { success: false });
            
            if (result && result.success) {
                this.showNotification(result.message, 'success');
                document.getElementById('edit-user-modal').classList.add('hidden');
                this.loadUsers(); // Recarregar lista
            } else {
                this.showNotification('Erro: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            this.showNotification('Erro de conexão', 'error');
        }
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
        const createDecoratorForm = document.getElementById('create-decorator-form');
        if (createDecoratorForm) {
            createDecoratorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createDecorator();
            });
        }

        // Botão de cancelar criação de decorador
        const cancelDecoratorBtn = document.getElementById('cancel-decorator-creation');
        if (cancelDecoratorBtn) {
            cancelDecoratorBtn.addEventListener('click', () => {
                document.getElementById('create-decorator-form').reset();
                this.showPage('dashboard');
            });
        }

        // Formulário de edição de usuário
        const editUserForm = document.getElementById('edit-user-form');
        if (editUserForm) {
            editUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveUserEdit();
            });
        }

        // Busca e filtros
        const userSearch = document.getElementById('user-search');
        if (userSearch) {
            userSearch.addEventListener('input', () => {
                this.filterUsers();
            });
        }

        const userTypeFilter = document.getElementById('user-type-filter');
        if (userTypeFilter) {
            userTypeFilter.addEventListener('change', () => {
                this.filterUsers();
            });
        }

        const userStatusFilter = document.getElementById('user-status-filter');
        if (userStatusFilter) {
            userStatusFilter.addEventListener('change', () => {
                this.filterUsers();
            });
        }

        // Paginação
        const prevPageBtn = document.getElementById('prev-page');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderUsersTable();
                }
            });
        }

        const nextPageBtn = document.getElementById('next-page');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderUsersTable();
                }
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Modais
        this.setupModalListeners();

        // Máscaras de input
        this.setupInputMasks();

        // Suporte - Filtros e Busca
        const supportSearch = document.getElementById('support-search');
        const supportFilter = document.getElementById('support-status-filter');
        
        if (supportSearch) {
            supportSearch.addEventListener('input', () => this.filterSupportTickets());
        }
        
        if (supportFilter) {
            supportFilter.addEventListener('change', () => this.filterSupportTickets());
        }

        // Toggle de senha
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', (e) => {
                this.togglePasswordVisibility(e.target);
            });
        });

        // Modal de personalização da página
        const closePageCustomizationBtn = document.getElementById('close-page-customization-modal');
        const cancelPageCustomizationBtn = document.getElementById('cancel-page-customization');
        const pageCustomizationOverlay = document.getElementById('page-customization-overlay');
        const pageCustomizationForm = document.getElementById('page-customization-form');
        const previewPageCustomizationBtn = document.getElementById('preview-page-customization');

        if (closePageCustomizationBtn) {
            closePageCustomizationBtn.addEventListener('click', () => this.closePageCustomizationModal());
        }

        if (cancelPageCustomizationBtn) {
            cancelPageCustomizationBtn.addEventListener('click', () => this.closePageCustomizationModal());
        }

        if (pageCustomizationOverlay) {
            pageCustomizationOverlay.addEventListener('click', () => this.closePageCustomizationModal());
        }

        if (pageCustomizationForm) {
            pageCustomizationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePageCustomization();
            });
        }

        if (previewPageCustomizationBtn) {
            previewPageCustomizationBtn.addEventListener('click', () => this.previewPageCustomization());
        }
    }

    // Configurar listeners dos modais
    setupModalListeners() {
        // Modal de edição de usuário
        const closeEditUserModal = document.getElementById('close-edit-user-modal');
        if (closeEditUserModal) {
            closeEditUserModal.addEventListener('click', () => {
                this.closeModal('edit-user-modal');
            });
        }

        const editUserModalOverlay = document.getElementById('edit-user-modal-overlay');
        if (editUserModalOverlay) {
            editUserModalOverlay.addEventListener('click', () => {
                this.closeModal('edit-user-modal');
            });
        }

        const cancelEditUser = document.getElementById('cancel-edit-user');
        if (cancelEditUser) {
            cancelEditUser.addEventListener('click', () => {
                this.closeModal('edit-user-modal');
            });
        }

        // Modal de edição de documentos legais
        const closeEditLegalDocumentModal = document.getElementById('close-edit-legal-document-modal');
        if (closeEditLegalDocumentModal) {
            closeEditLegalDocumentModal.addEventListener('click', () => {
                this.closeModal('edit-legal-document-modal');
            });
        }

        const editLegalDocumentModalOverlay = document.getElementById('edit-legal-document-modal-overlay');
        if (editLegalDocumentModalOverlay) {
            editLegalDocumentModalOverlay.addEventListener('click', () => {
                this.closeModal('edit-legal-document-modal');
            });
        }

        const cancelEditLegalDocument = document.getElementById('cancel-edit-legal-document');
        if (cancelEditLegalDocument) {
            cancelEditLegalDocument.addEventListener('click', () => {
                this.closeModal('edit-legal-document-modal');
            });
        }

        // Botão de visualizar documento legal
        const previewLegalDocument = document.getElementById('preview-legal-document');
        if (previewLegalDocument) {
            previewLegalDocument.addEventListener('click', () => {
                const documentType = document.getElementById('legal-document-type').value;
                const content = document.getElementById('legal-document-content').value;
                const filePath = documentType === 'termos' ? 'termos-e-condicoes.html' : 'politica-de-privacidade.html';
                
                // Abrir em nova aba para visualização
                const blob = new Blob([content], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            });
        }
    }

    // Configurar máscaras de input
    setupInputMasks() {
        // CPF
        const cpfInput = document.getElementById('decorator-cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            });
        }

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
        const activeNavItem = document.querySelector(`a[href="#${pageId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Esconder todos os conteúdos
        document.querySelectorAll('.admin-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Mostrar conteúdo da página selecionada
        const pageContent = document.getElementById(`${pageId}-content`);
        if (pageContent) {
            pageContent.classList.remove('hidden');
        }

        // Atualizar título da página
        const titles = {
            'dashboard': { title: 'Dashboard', subtitle: 'Visão geral do sistema' },
            'create-decorator': { title: 'Criar Decorador', subtitle: 'Adicionar nova conta de decorador' },
            'manage-users': { title: 'Gerenciar Usuários', subtitle: 'Administrar contas de usuários' },
            'support': { title: 'Central de Suporte', subtitle: 'Gerenciar chamados de decoradores' },
            'settings': { title: 'Configurações', subtitle: 'Configurar opções do sistema' }
        };

        const pageInfo = titles[pageId];
        if (pageInfo) {
            const pageTitle = document.getElementById('page-title');
            const pageSubtitle = document.getElementById('page-subtitle');
            if (pageTitle) pageTitle.textContent = pageInfo.title;
            if (pageSubtitle) pageSubtitle.textContent = pageInfo.subtitle;
        }

        // Carregar dados específicos da página
        if (pageId === 'dashboard') {
            this.loadDashboardData();
        } else if (pageId === 'manage-users') {
            // Garantir que os usuários sejam carregados quando a página é exibida
            if (this.users.length === 0) {
                this.loadUsers();
            } else {
                // Se já há usuários carregados, apenas renderizar a tabela
                this.renderUsersTable();
            }
        } else if (pageId === 'support') {
            console.log('🔔 Módulo de suporte ativado - carregando tickets...');
            // Garantir que o container existe antes de renderizar
            setTimeout(() => {
                this.loadSupportTickets();
            }, 100);
        } else if (pageId === 'settings') {
            this.loadAdminProfile(!this.adminSettingsLoaded);
        }
    }

    // Carregar dados do dashboard
    async loadDashboardData() {
        const fallbackMetrics = {
            total_clients: this.users.filter(u => u.type === 'client').length,
            active_decorators: this.users.filter(u => u.type === 'decorator' && u.status === 'active').length,
            total_requests: 0,
            total_services: 0,
            pending_approvals: 0
        };

        try {
            const response = await fetch('../services/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin', // Incluir cookies/sessão
                body: JSON.stringify({ action: 'get_dashboard_data' })
            });

            // Log detalhado para debug
            if (!response.ok) {
                console.error('Erro HTTP ao carregar dashboard:', response.status, response.statusText);
                console.error('URL:', response.url);
            }

            // Usar função auxiliar para parse seguro
            const result = await this.safeJsonParse(response, { success: false });
            
            if (!result) {
                console.warn('Não foi possível fazer parse da resposta do dashboard');
                this.dashboardData = null;
                this.updateDashboardMetrics(fallbackMetrics);
                this.loadRecentActivities([]);
                return;
            }

            if (result.success) {
                // result.data pode conter os dados diretamente ou result pode ter os dados na raiz
                const data = result.data || result;
                this.dashboardData = data;
                this.updateDashboardMetrics(data);
                this.loadRecentActivities(data.activities || []);
                return;
            } else {
                const errorMsg = result?.message || 'Erro desconhecido';
                console.warn('Resposta do dashboard não teve sucesso:', errorMsg);
                
                // Se for erro de autenticação, redirecionar para login
                if (result?.message && (result.message.includes('Não autorizado') || result.message.includes('não autorizado'))) {
                    this.showNotification('Sessão expirada. Redirecionando para login...', 'error');
                    setTimeout(() => {
                        window.location.href = 'admin-login.html';
                    }, 2000);
                    return;
                }
            }

            console.warn('Não foi possível carregar dados atualizados do dashboard.', result);
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            console.error('Stack trace:', error.stack);
        }

        this.dashboardData = null;
        this.updateDashboardMetrics(fallbackMetrics);
        this.loadRecentActivities([]);
    }

    updateDashboardMetrics(metrics = {}) {
        const totalClientsEl = document.getElementById('total-clients');
        const activeDecoratorsEl = document.getElementById('active-decorators');
        const totalRequestsEl = document.getElementById('total-requests');
        const totalServicesEl = document.getElementById('total-services');

        const totalClients = Number(metrics.total_clients ?? metrics.totalClients ?? 0);
        const activeDecorators = Number(metrics.active_decorators ?? metrics.activeDecorators ?? 0);
        const totalRequests = Number(metrics.total_requests ?? metrics.totalRequests ?? 0);
        const totalServices = Number(metrics.total_services ?? metrics.totalServices ?? 0);

        if (totalClientsEl) {
            totalClientsEl.textContent = totalClients.toLocaleString('pt-BR');
        }
        if (activeDecoratorsEl) {
            activeDecoratorsEl.textContent = activeDecorators.toLocaleString('pt-BR');
        }
        if (totalRequestsEl) {
            totalRequestsEl.textContent = totalRequests.toLocaleString('pt-BR');
        }
        if (totalServicesEl) {
            totalServicesEl.textContent = totalServices.toLocaleString('pt-BR');
        }
    }

    // Carregar atividades recentes
    loadRecentActivities(activities = []) {
        const container = document.getElementById('recent-activities');
        if (!container) return;

        if (!Array.isArray(activities) || activities.length === 0) {
            container.innerHTML = `
                <div class="flex items-center justify-center py-6">
                    <p class="text-sm text-gray-500">Nenhuma atividade recente disponível.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(activity => {
            // Garantir que todas as propriedades existam
            const type = activity.type || 'info';
            const action = activity.action || activity.message || 'Atividade';
            const user = activity.user || activity.nome || 'Usuário';
            const time = activity.time || activity.date || 'Agora';
            
            return `
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                    type === 'success' ? 'bg-green-100 text-green-600' :
                    type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                }">
                    <i class="fas ${
                        type === 'success' ? 'fa-check' :
                        type === 'warning' ? 'fa-exclamation' :
                        'fa-info'
                    } text-sm"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-800">${action}</p>
                    <p class="text-xs text-gray-500">${user} • ${time}</p>
                </div>
            </div>
            `;
        }).join('');
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
                    data: [0, 0, 0, 0, 0, 0],
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
        const usersChartEl = document.getElementById('users-chart');
        if (!usersChartEl) return;
        
        const usersCtx = usersChartEl.getContext('2d');
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

    refreshUsersChart() {
        if (!this.charts.users) return;

        this.charts.users.data.datasets[0].data = [
            this.users.filter(u => u.type === 'client').length,
            this.users.filter(u => u.type === 'decorator').length
        ];

        this.charts.users.update();
    }

    // Criar decorador
    async createDecorator() {
        const form = document.getElementById('create-decorator-form');
        const formData = new FormData(form);
        
        const name = (formData.get('name') || '').trim();
        const cpf = (formData.get('cpf') || '').trim();
        const phone = (formData.get('phone') || '').trim();
        const whatsapp = (formData.get('whatsapp') || '').trim();
        const communicationEmail = (formData.get('communication_email') || '').trim();
        const address = (formData.get('address') || '').trim();
        const password = formData.get('password') || '';
        
        const decoratorData = {
            action: 'create',
            nome: name,
            cpf,
            email: communicationEmail,
            telefone: phone,
            whatsapp,
            communication_email: communicationEmail,
            endereco: address,
            senha: password
        };

        // Validações
        if (!this.validateDecoratorData(decoratorData)) {
            return;
        }

        // Obter referência do botão antes do try
        const submitBtn = document.getElementById('create-decorator-btn');
        if (!submitBtn) {
            this.showNotification('Erro: Botão de envio não encontrado', 'error');
            return;
        }
        
        const originalText = submitBtn.innerHTML;
        
        try {
            // Mostrar loading
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Criando...';
            submitBtn.disabled = true;

            // Enviar para o servidor
            const response = await fetch('../services/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'create_decorator',
                    name: decoratorData.nome,
                    email: decoratorData.email,
                    password: decoratorData.senha,
                    cpf: decoratorData.cpf,
                    phone: decoratorData.telefone,
                    whatsapp: decoratorData.whatsapp,
                    communication_email: decoratorData.communication_email,
                    address: decoratorData.endereco
                })
            });

            const result = await this.safeJsonParse(response, { success: false });

            if (result && result.success) {
                // Adicionar usuário localmente
                const newDecorator = {
                    id: result.data.id,
                    name: result.data.name || decoratorData.nome,
                    email: result.data.email || decoratorData.email,
                    phone: decoratorData.telefone,
                    communication_email: result.data.communication_email || decoratorData.communication_email,
                    whatsapp: result.data.whatsapp || decoratorData.whatsapp,
                    type: 'decorator',
                    status: 'active',
                    createdAt: new Date().toISOString().split('T')[0],
                    slug: result.data.slug || null,
                    url: result.data.url || null
                };

                this.users.push(newDecorator);
                this.filteredUsers = [...this.users];
                
                // Limpar formulário
                form.reset();
                
                // Mostrar sucesso com link
                this.showDecoratorCreatedSuccess(result.data);
                
                // Atualizar dashboard
                this.loadDashboardData();
                this.refreshUsersChart();
            } else {
                this.showNotification(result.message || 'Erro ao criar decorador', 'error');
            }
        } catch (error) {
            console.error('Erro ao criar decorador:', error);
            this.showNotification('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Restaurar botão sempre, mesmo em caso de erro
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
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

        if (!data.telefone || data.telefone.trim().length < 10) {
            this.showNotification('Telefone inválido', 'error');
            return false;
        }

        if (!data.whatsapp || data.whatsapp.trim().length < 10) {
            this.showNotification('WhatsApp inválido', 'error');
            return false;
        }

        if (!this.validateEmail(data.email)) {
            this.showNotification('E-mail inválido', 'error');
            return false;
        }
        
        if (this.users.find(u => (u.email || '').toLowerCase() === data.email.toLowerCase())) {
            this.showNotification('E-mail já cadastrado', 'error');
            return false;
        }
        
        if (data.communication_email && data.communication_email.toLowerCase() !== data.email.toLowerCase()) {
            if (!this.validateEmail(data.communication_email)) {
                this.showNotification('E-mail para comunicação inválido', 'error');
                return false;
            }
            
            if (this.users.find(u => (u.communication_email || '').toLowerCase() === data.communication_email.toLowerCase())) {
                this.showNotification('E-mail para comunicação já cadastrado', 'error');
                return false;
            }
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
    async filterUsers() {
        const search = document.getElementById('user-search')?.value || '';
        const typeFilter = document.getElementById('user-type-filter')?.value || '';
        const statusFilter = document.getElementById('user-status-filter')?.value || '';
        
        // Se não há filtros aplicados, recarregar todos os usuários do servidor
        // Caso contrário, filtrar localmente dos usuários já carregados
        const hasFilters = search || typeFilter || statusFilter;
        
        if (!hasFilters) {
            // Sem filtros: recarregar todos os usuários do servidor
            await this.loadUsers();
            return;
        }
        
        // Com filtros: filtrar localmente
        const searchLower = search.toLowerCase();
        this.filteredUsers = this.users.filter(user => {
            const matchesSearch = !searchLower || 
                user.name.toLowerCase().includes(searchLower) || 
                user.email.toLowerCase().includes(searchLower);
            
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
                    ${new Date(user.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td class="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-1 md:space-x-2">
                        ${user.type === 'decorator' && user.url ? `
                            <button data-url="${user.url}"
                                    onclick="adminSystem.copyDecoratorLink(this.dataset.url)"
                                    class="text-emerald-600 hover:text-emerald-900 p-1"
                                    title="Copiar link público">
                                <i class="fas fa-share-nodes text-xs md:text-sm"></i>
                            </button>
                        ` : ''}
                        ${user.type === 'decorator' ? `
                            <button onclick="notifyDecorator(${user.id}, '${user.status === 'active' ? 'approved' : 'rejected'}')" class="text-purple-600 hover:text-purple-900 p-1" title="Enviar Notificação">
                                <i class="fas fa-bell text-xs md:text-sm"></i>
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



    // Alternar status do usuário
    async toggleUserStatus(userId) {
        try {
            const user = this.users.find(u => u.id === userId);
            if (!user) {
                this.showNotification('Usuário não encontrado', 'error');
                return;
            }

            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            
            // Chamar backend para atualizar o status
            const response = await fetch('../services/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'update_user',
                    id: userId,
                    status: newStatus
                })
            });
            
            const result = await this.safeJsonParse(response, { success: false });
            
            if (result && result.success) {
                // Atualizar status local após sucesso no backend
                user.status = newStatus;
                this.filteredUsers = [...this.users];
                this.renderUsersTable();
                
                const statusText = newStatus === 'active' ? 'ativado' : 'desativado';
                this.showNotification(`Usuário ${statusText} com sucesso!`, 'success');
            } else {
                this.showNotification('Erro: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao alterar status do usuário:', error);
            this.showNotification('Erro de conexão ao alterar status', 'error');
        }
    }

    // Excluir usuário
    async deleteUser(userId) {
        if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            // Chamar backend para excluir o usuário
            const response = await fetch('../services/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete_user',
                    id: userId
                })
            });
            
            const result = await this.safeJsonParse(response, { success: false });
            
            if (result && result.success) {
                // Remover usuário da lista local após sucesso no backend
                const userIndex = this.users.findIndex(u => u.id === userId);
                if (userIndex !== -1) {
                    this.users.splice(userIndex, 1);
                    this.filteredUsers = [...this.users];
                    this.refreshUsersChart();
                    this.renderUsersTable();
                }
                this.showNotification('Usuário excluído com sucesso!', 'success');
            } else {
                this.showNotification('Erro: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            this.showNotification('Erro de conexão ao excluir usuário', 'error');
        }
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
                                       value="${data.url || 'Gerando URL...'}" 
                                       readonly 
                                       class="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-white text-gray-800 font-mono text-sm"
                                       id="decorator-url">
                                <button onclick="copyDecoratorUrl()" 
                                        class="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors duration-200"
                                        title="Copiar link"
                                        ${!data.url ? 'disabled' : ''}>
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
                                <p class="text-blue-600 font-mono">${data.slug || 'N/A'}</p>
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
                            <button onclick="notifyDecorator(${data.id}, 'approved')" class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 close-modal-and-notify">
                                <i class="fas fa-bell mr-2"></i>Enviar Notificação
                            </button>
                            ${data.url ? `
                            <a href="${data.url}" 
                               target="_blank"
                               class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 text-center">
                                <i class="fas fa-external-link-alt mr-2"></i>Ver Página
                            </a>
                            ` : `
                            <button disabled class="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed text-center">
                                <i class="fas fa-external-link-alt mr-2"></i>URL não disponível
                            </button>
                            `}
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
        
        // Event listener para fechar e abrir notificação
        modal.querySelectorAll('.close-modal-and-notify').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
                // A função notifyDecorator já foi chamada no onclick
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
    async logout() {
        if (confirm('Tem certeza que deseja sair?')) {
            try {
                // Chamar logout no backend
                await fetch('../services/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'admin_logout'
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
                
                // Redirecionar para login admin
                window.location.replace('admin-login.html');
            }
        }
    }

    // ========== SISTEMA DE NOTIFICAÇÕES PARA DECORADORES ==========
    
    // Templates de mensagens
    getMessageTemplates(decoratorName, status) {
        const templates = {
            approved: {
                whatsapp: `🎉 *Parabéns, ${decoratorName}!*\n\nSua conta de decorador foi *APROVADA* pela Up.Baloes! ✅\n\nAgora você pode:\n✨ Acessar seu painel de decorador\n📅 Gerenciar sua agenda\n💼 Criar e enviar orçamentos\n📸 Montar seu portfólio\n\n*Acesse agora:*\n👉 https://upbaloes.com/login\n\nBem-vindo(a) à nossa equipe! 🎈\n\n_Equipe Up.Baloes_`,
                
                emailSubject: `🎉 Conta Aprovada - Bem-vindo à Up.Baloes!`,
                
                emailBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Conta Aprovada!</h1>
    </div>
    
    <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Olá, <strong>${decoratorName}</strong>!</p>
        
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Temos uma ótima notícia! 🎈 Sua conta de decorador foi <strong style="color: #10b981;">APROVADA</strong> pela equipe Up.Baloes!
        </p>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h3 style="color: #059669; margin-top: 0;">Agora você pode:</h3>
            <ul style="color: #555; line-height: 1.8;">
                <li>✨ Acessar seu painel de decorador</li>
                <li>📅 Gerenciar sua agenda e disponibilidade</li>
                <li>💼 Criar e enviar orçamentos personalizados</li>
                <li>📸 Montar e exibir seu portfólio</li>
                <li>📊 Acompanhar suas solicitações</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://upbaloes.com/login" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                Acessar Meu Painel
            </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <strong>Bem-vindo(a) à nossa equipe!</strong><br>
            Estamos ansiosos para ver seus trabalhos incríveis! 🎈
        </p>
        
        <p style="font-size: 14px; color: #999; margin-top: 20px;">
            Atenciosamente,<br>
            <strong style="color: #10b981;">Equipe Up.Baloes</strong>
        </p>
    </div>
</div>`
            },
            
            rejected: {
                whatsapp: `Olá, ${decoratorName}.\n\nAgradecemos seu interesse em fazer parte da equipe Up.Baloes. 🎈\n\nInfelizmente, após análise, não foi possível aprovar sua conta de decorador neste momento. ❌\n\n*Possíveis motivos:*\n• Dados incompletos ou incorretos\n• Documentação pendente\n• Não atendimento aos requisitos\n\n*Você pode:*\n📝 Revisar seus dados\n📧 Entrar em contato conosco\n🔄 Fazer uma nova solicitação\n\n_Equipe Up.Baloes_\n📞 Contato: (XX) XXXXX-XXXX`,
                
                emailSubject: `Sobre sua solicitação - Up.Baloes`,
                
                emailBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
    <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Sobre sua solicitação</h1>
    </div>
    
    <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Olá, <strong>${decoratorName}</strong>,</p>
        
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Primeiramente, agradecemos seu interesse em fazer parte da equipe de decoradores Up.Baloes. 🎈
        </p>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <p style="color: #92400e; margin: 0; font-size: 16px;">
                Após análise cuidadosa, informamos que <strong>não foi possível aprovar sua conta</strong> de decorador neste momento.
            </p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h3 style="color: #374151; margin-top: 0;">Possíveis motivos:</h3>
            <ul style="color: #555; line-height: 1.8;">
                <li>Dados incompletos ou incorretos</li>
                <li>Documentação pendente</li>
                <li>Não atendimento aos requisitos mínimos</li>
                <li>Informações de contato inválidas</li>
            </ul>
        </div>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h3 style="color: #1e40af; margin-top: 0;">O que você pode fazer:</h3>
            <ul style="color: #555; line-height: 1.8;">
                <li>📝 Revisar e corrigir seus dados cadastrais</li>
                <li>📧 Entrar em contato conosco para mais informações</li>
                <li>🔄 Fazer uma nova solicitação após as correções</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:contato@upbaloes.com" style="background-color: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
                Entrar em Contato
            </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Estamos à disposição para esclarecer qualquer dúvida.
        </p>
        
        <p style="font-size: 14px; color: #999; margin-top: 20px;">
            Atenciosamente,<br>
            <strong style="color: #6b7280;">Equipe Up.Baloes</strong>
        </p>
    </div>
</div>`
            }
        };
        
        return templates[status] || templates.approved;
    }
    
    // Abrir modal de notificação
    openNotificationModal(decorator, status = 'approved') {
        const modal = document.getElementById('notification-modal');
        const header = document.getElementById('notification-header');
        const icon = document.getElementById('notification-icon');
        const title = document.getElementById('notification-title');
        const subtitle = document.getElementById('notification-subtitle');
        
        // Configurar cores e textos baseados no status
        if (status === 'approved') {
            header.className = 'bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4';
            icon.className = 'fas fa-check-circle text-white text-lg';
            title.textContent = 'Notificar Aprovação';
            subtitle.textContent = 'O decorador será notificado sobre a aprovação';
        } else {
            header.className = 'bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4';
            icon.className = 'fas fa-times-circle text-white text-lg';
            title.textContent = 'Notificar Recusa';
            subtitle.textContent = 'O decorador será notificado sobre a não aprovação';
        }
        
        // Preencher informações do decorador
        document.getElementById('notification-decorator-name').textContent = decorator.nome;
        document.getElementById('notification-whatsapp').textContent = decorator.whatsapp || 'Não informado';
        document.getElementById('notification-email').textContent = decorator.communication_email || decorator.email || 'Não informado';
        
        // Obter templates
        const templates = this.getMessageTemplates(decorator.nome, status);
        
        // Preencher mensagens
        document.getElementById('whatsapp-message').value = templates.whatsapp;
        document.getElementById('email-subject').value = templates.emailSubject;
        document.getElementById('email-message').value = templates.emailBody;
        
        // Atualizar contador de caracteres
        this.updateCharCounter();
        
        // Salvar dados do decorador e status para envio posterior
        this.currentNotification = {
            decorator: decorator,
            status: status
        };
        
        // Mostrar modal
        modal.classList.remove('hidden');
    }
    
    // Atualizar contador de caracteres do WhatsApp
    updateCharCounter() {
        const whatsappMessage = document.getElementById('whatsapp-message');
        const charCount = document.getElementById('whatsapp-char-count');
        
        if (whatsappMessage && charCount) {
            const count = whatsappMessage.value.length;
            charCount.textContent = `${count} caracteres`;
            
            if (count > 1000) {
                charCount.style.color = '#ef4444';
            } else if (count > 800) {
                charCount.style.color = '#f59e0b';
            } else {
                charCount.style.color = '#6b7280';
            }
        }
    }
    
    // Fechar modal de notificação
    closeNotificationModal() {
        document.getElementById('notification-modal').classList.add('hidden');
        this.currentNotification = null;
    }
    
    // Enviar notificação
    async sendNotification() {
        if (!this.currentNotification) return;
        
        const sendWhatsApp = document.getElementById('send-whatsapp').checked;
        const sendEmail = document.getElementById('send-email').checked;
        
        if (!sendWhatsApp && !sendEmail) {
            this.showNotification('Selecione pelo menos um canal de envio', 'warning');
            return;
        }
        
        const whatsappMessage = document.getElementById('whatsapp-message').value;
        const emailSubject = document.getElementById('email-subject').value;
        const emailMessage = document.getElementById('email-message').value;
        
        // Dados para envio
        const notificationData = {
            decorator_id: this.currentNotification.decorator.id,
            decorator_name: this.currentNotification.decorator.nome,
            status: this.currentNotification.status,
            channels: {
                whatsapp: sendWhatsApp,
                email: sendEmail
            },
            messages: {
                whatsapp: whatsappMessage,
                email: {
                    subject: emailSubject,
                    body: emailMessage
                }
            },
            contacts: {
                whatsapp: this.currentNotification.decorator.whatsapp,
                email: this.currentNotification.decorator.communication_email || this.currentNotification.decorator.email
            }
        };
        
        try {
            // Mostrar loading
            const btn = document.getElementById('send-notification');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
            btn.disabled = true;
            
            // Simular envio (substituir por chamada real à API)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Log para debug
            console.log('Notificação enviada:', notificationData);
            
            // Sucesso
            this.showNotification(
                `Notificação enviada com sucesso para ${this.currentNotification.decorator.nome}!`,
                'success'
            );
            
            // Fechar modal
            this.closeNotificationModal();
            
            // TODO: Implementar chamada real à API
            // const response = await fetch('../services/admin.php', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         action: 'send_decorator_notification',
            //         ...notificationData
            //     })
            // });
            
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            this.showNotification('Erro ao enviar notificação', 'error');
        } finally {
            const btn = document.getElementById('send-notification');
            btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar Notificação';
            btn.disabled = false;
        }
    }
    
    // Configurar listeners do modal de notificação
    setupNotificationModalListeners() {
        // Fechar modal
        const closeBtn = document.getElementById('close-notification-modal');
        const cancelBtn = document.getElementById('cancel-notification');
        const overlay = document.getElementById('notification-modal-overlay');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeNotificationModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeNotificationModal());
        }
        
        if (overlay) {
            overlay.addEventListener('click', () => this.closeNotificationModal());
        }
        
        // Enviar notificação
        const sendBtn = document.getElementById('send-notification');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendNotification());
        }
        
        // Contador de caracteres WhatsApp
        const whatsappMessage = document.getElementById('whatsapp-message');
        if (whatsappMessage) {
            whatsappMessage.addEventListener('input', () => this.updateCharCounter());
        }
        
        // Controlar visibilidade das seções de mensagem
        const sendWhatsAppCheckbox = document.getElementById('send-whatsapp');
        const sendEmailCheckbox = document.getElementById('send-email');
        const whatsappSection = document.getElementById('whatsapp-message-section');
        const emailSection = document.getElementById('email-message-section');
        
        if (sendWhatsAppCheckbox && whatsappSection) {
            sendWhatsAppCheckbox.addEventListener('change', (e) => {
                whatsappSection.style.display = e.target.checked ? 'block' : 'none';
            });
        }
        
        if (sendEmailCheckbox && emailSection) {
            sendEmailCheckbox.addEventListener('change', (e) => {
                emailSection.style.display = e.target.checked ? 'block' : 'none';
            });
        }
    }

    // ========== SISTEMA DE SUPORTE ==========
    
    // Carregar chamados de suporte
    async loadSupportTickets() {
        try {
            const response = await fetch('../services/suporte.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin', // Incluir cookies/sessão
                body: JSON.stringify({
                    action: 'list'
                })
            });
            
            // Log detalhado para debug
            if (!response.ok) {
                console.error('Erro HTTP ao carregar tickets:', response.status, response.statusText);
                console.error('URL:', response.url);
            }
            
            // Usar função auxiliar para parse seguro
            const result = await this.safeJsonParse(response, { success: false });
            
            if (!result) {
                console.warn('Não foi possível fazer parse da resposta de tickets de suporte');
                const saved = localStorage.getItem('support_tickets');
                try {
                    this.supportTickets = this.safeLocalStorageGet('support_tickets', []);
                } catch (e) {
                    console.error('Erro ao fazer parse do localStorage:', e);
                    this.supportTickets = [];
                }
                this.filteredTickets = [...this.supportTickets];
                this.renderSupportTickets();
                this.updateSupportStats();
                return;
            }
            
            if (result.success) {
                console.log('✅ Tickets carregados com sucesso:', result.tickets?.length || 0);
                console.log('📋 Dados dos tickets:', result.tickets);
                console.log('📊 Estrutura da resposta:', {
                    success: result.success,
                    tickets: result.tickets,
                    count: result.count,
                    hasTickets: Array.isArray(result.tickets) && result.tickets.length > 0
                });
                
                // Normalizar tickets: garantir que todos tenham IDs válidos
                const normalizedTickets = (result.tickets || []).map(ticket => {
                    // Garantir que o ID seja sempre um número ou string válido
                    if (ticket && ticket.id !== undefined && ticket.id !== null) {
                        return {
                            ...ticket,
                            id: ticket.id // Manter o tipo original (número ou string)
                        };
                    }
                    return null;
                }).filter(t => t !== null);
                
                console.log('🔄 Tickets normalizados:', normalizedTickets.length);
                console.log('📝 Primeiro ticket normalizado:', normalizedTickets[0]);
                
                this.supportTickets = normalizedTickets;
                this.filteredTickets = [...this.supportTickets];
                
                console.log('🔄 Tickets após cópia:', {
                    supportTickets: this.supportTickets.length,
                    filteredTickets: this.filteredTickets.length
                });
                
                // Ordenar por data (mais recentes primeiro)
                this.filteredTickets.sort((a, b) => {
                    const dateA = new Date(a.created_at || 0);
                    const dateB = new Date(b.created_at || 0);
                    return dateB - dateA;
                });
                
                console.log('📅 Tickets após ordenação:', this.filteredTickets.length);
                console.log('🎯 Primeiro ticket:', this.filteredTickets[0]);
                
                // Verificar se o módulo de suporte está visível
                const supportContent = document.getElementById('support-content');
                console.log('📄 Módulo de suporte visível:', supportContent && !supportContent.classList.contains('hidden'));
                
                this.renderSupportTickets();
                this.updateSupportStats();
            } else {
                const errorMsg = result?.message || 'Erro desconhecido';
                console.error('Erro ao carregar tickets:', errorMsg);
                console.error('Result completo:', result);
                
                // Se for erro de autenticação, redirecionar para login
                if (result?.message && (result.message.includes('Não autorizado') || result.message.includes('não autorizado'))) {
                    this.showNotification('Sessão expirada. Redirecionando para login...', 'error');
                    setTimeout(() => {
                        window.location.href = 'admin-login.html';
                    }, 2000);
                    return;
                }
                
                // Fallback para localStorage se houver erro
                try {
                    this.supportTickets = this.safeLocalStorageGet('support_tickets', []);
                } catch (e) {
                    console.error('Erro ao fazer parse do localStorage:', e);
                    this.supportTickets = [];
                }
                this.filteredTickets = [...this.supportTickets];
                this.renderSupportTickets();
                this.updateSupportStats();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar tickets:', error.message || error);
            console.error('Stack trace:', error.stack);
            console.error('Tipo do erro:', error.constructor.name);
            
            // Não tentar renderizar se houver erro crítico
            // Apenas mostrar mensagem de erro
            this.showNotification('Erro ao carregar tickets de suporte. Verifique o console para mais detalhes.', 'error');
            
            // Fallback para localStorage em caso de erro (mas com proteção)
            try {
                const saved = localStorage.getItem('support_tickets');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                        // Validar cada ticket antes de usar
                        this.supportTickets = parsed.filter(t => t && t.id !== undefined && t.id !== null);
                        this.filteredTickets = [...this.supportTickets];
                        console.log('📦 Carregados', this.supportTickets.length, 'tickets do localStorage');
                        this.renderSupportTickets();
                        this.updateSupportStats();
                    } else {
                        this.supportTickets = [];
                        this.filteredTickets = [];
                    }
                } else {
                    this.supportTickets = [];
                    this.filteredTickets = [];
                }
            } catch (e) {
                console.error('Erro ao fazer parse do localStorage:', e);
                this.supportTickets = [];
                this.filteredTickets = [];
            }
        }
    }
    
    // Renderizar chamados de suporte
    renderSupportTickets() {
        console.log('renderSupportTickets: Iniciando renderização');
        console.log('renderSupportTickets: Tickets filtrados:', this.filteredTickets.length);
        console.log('renderSupportTickets: Tickets totais:', this.supportTickets.length);
        
        const container = document.getElementById('support-tickets-container');
        const emptyState = document.getElementById('support-empty');
        
        console.log('renderSupportTickets: Container encontrado:', !!container);
        console.log('renderSupportTickets: Empty state encontrado:', !!emptyState);
        
        if (!container) {
            console.error('renderSupportTickets: Container não encontrado!');
            return;
        }
        
        if (this.filteredTickets.length === 0) {
            console.log('renderSupportTickets: Nenhum ticket para renderizar');
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }
        
        console.log('renderSupportTickets: Renderizando', this.filteredTickets.length, 'tickets');
        
        if (emptyState) emptyState.classList.add('hidden');
        
        const ticketsHTML = this.filteredTickets.map((ticket, index) => {
            try {
                console.log(`🔍 Processando ticket ${index}:`, {
                    ticket: ticket,
                    id: ticket?.id,
                    idType: typeof ticket?.id,
                    idValue: ticket?.id
                });
                
                // Validar dados do ticket
                if (!ticket) {
                    console.warn('⚠️ Ticket nulo encontrado no índice:', index);
                    return '';
                }
                
                // Garantir que ticket.id existe e pode ser convertido para string
                if (ticket.id === undefined || ticket.id === null) {
                    console.warn('⚠️ Ticket sem ID encontrado no índice:', index, ticket);
                    return '';
                }
                
                // Log detalhado do ID antes de processar
                console.log(`📌 Ticket ${index} - ID antes de processar:`, {
                    raw: ticket.id,
                    type: typeof ticket.id,
                    isNumber: typeof ticket.id === 'number',
                    isString: typeof ticket.id === 'string',
                    value: ticket.id
                });
                
                const statusColors = {
                'novo': 'bg-yellow-100 text-yellow-800 border-yellow-300',
                'em_analise': 'bg-blue-100 text-blue-800 border-blue-300',
                'resolvido': 'bg-green-100 text-green-800 border-green-300',
                'fechado': 'bg-gray-100 text-gray-800 border-gray-300',
                'cancelado': 'bg-gray-100 text-gray-800 border-gray-300'
            };
            
            const statusLabels = {
                'novo': 'Novo',
                'em_analise': 'Em Análise',
                'resolvido': 'Resolvido',
                'fechado': 'Fechado',
                'cancelado': 'Cancelado'
            };
            
            const statusIcons = {
                'novo': 'fa-exclamation-circle',
                'em_analise': 'fa-sync',
                'resolvido': 'fa-check-circle',
                'fechado': 'fa-times-circle',
                'cancelado': 'fa-ban'
            };
            
            const ticketStatus = ticket.status || 'novo';
            const ticketTitle = ticket.title || 'Sem título';
            const ticketDescription = ticket.description || 'Sem descrição';
            const decoratorName = ticket.decorator_name || 'Desconhecido';
            const createdAt = ticket.created_at ? this.formatDateTime(ticket.created_at) : 'Data não disponível';
            
            // Converter ID de forma ABSOLUTAMENTE segura
            // NUNCA usar ticket.id.substring diretamente - sempre converter para string primeiro
            let ticketId = '';
            let ticketIdDisplay = 'N/A';
            
            try {
                // Verificar se ticket.id existe
                if (ticket.id !== undefined && ticket.id !== null) {
                    // Converter para string usando método mais seguro possível
                    // NUNCA usar ticket.id.substring diretamente
                    const rawId = ticket.id;
                    
                    // Converter para string
                    ticketId = String(rawId);
                    
                    // Validação rigorosa antes de usar substring
                    if (typeof ticketId !== 'string') {
                        console.error('❌ ticketId não é string após String():', typeof ticketId, ticketId);
                        // Tentar novamente
                        ticketId = String(rawId);
                    }
                    
                    // Validar que a conversão funcionou E que é string antes de usar substring
                    if (ticketId && typeof ticketId === 'string' && ticketId.length > 0) {
                        // Agora sim podemos usar substring com segurança
                        try {
                            ticketIdDisplay = ticketId.substring(0, Math.min(8, ticketId.length));
                        } catch (substringError) {
                            console.error('❌ Erro ao usar substring em ticketId:', substringError, {
                                ticketId: ticketId,
                                ticketIdType: typeof ticketId,
                                ticketIdLength: ticketId?.length
                            });
                            ticketIdDisplay = String(rawId).substring(0, 8);
                        }
                    } else {
                        // Se a conversão falhou, usar fallback
                        ticketId = String(rawId);
                        if (typeof ticketId === 'string' && ticketId.length > 0) {
                            ticketIdDisplay = ticketId.length > 8 ? ticketId.substring(0, 8) : ticketId;
                        } else {
                            ticketIdDisplay = 'N/A';
                        }
                    }
                } else {
                    ticketId = '';
                    ticketIdDisplay = 'N/A';
                }
            } catch (e) {
                console.error('❌ Erro ao processar ticket.id:', e, {
                    ticket: ticket,
                    ticketId: ticket?.id,
                    ticketIdType: typeof ticket?.id
                });
                // Fallback absoluto - garantir que sempre temos strings válidas
                try {
                    if (ticket.id !== undefined && ticket.id !== null) {
                        ticketId = String(ticket.id);
                        if (typeof ticketId === 'string' && ticketId.length > 0) {
                            ticketIdDisplay = ticketId.length > 8 ? ticketId.substring(0, 8) : ticketId;
                        } else {
                            ticketIdDisplay = 'N/A';
                        }
                    } else {
                        ticketId = '';
                        ticketIdDisplay = 'N/A';
                    }
                } catch (fallbackError) {
                    console.error('❌ Erro no fallback:', fallbackError);
                    ticketId = '';
                    ticketIdDisplay = 'N/A';
                }
            }
            
            // Validação final ABSOLUTA antes de usar no template
            // Garantir que ambos são strings válidas
            if (typeof ticketId !== 'string') {
                console.error('❌ ticketId não é string após todas as tentativas:', typeof ticketId, ticketId);
                ticketId = ticket.id !== undefined && ticket.id !== null ? String(ticket.id) : '';
            }
            
            if (typeof ticketIdDisplay !== 'string') {
                console.error('❌ ticketIdDisplay não é string após todas as tentativas:', typeof ticketIdDisplay, ticketIdDisplay);
                // Tentar criar de forma mais direta
                try {
                    const finalId = String(ticket.id || '');
                    if (typeof finalId === 'string' && finalId.length > 0) {
                        ticketIdDisplay = finalId.substring(0, Math.min(8, finalId.length));
                    } else {
                        ticketIdDisplay = 'N/A';
                    }
                } catch (finalError) {
                    console.error('❌ Erro no fallback final:', finalError);
                    ticketIdDisplay = 'N/A';
                }
            }
            
            return `
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer" onclick="adminSystem.viewTicketDetails('${ticketId}')">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            <h4 class="text-lg font-semibold text-gray-800 mb-1">${this.escapeHtml(ticketTitle)}</h4>
                            <div class="flex items-center space-x-4 text-sm text-gray-600">
                                <span><i class="fas fa-user mr-1 text-blue-600"></i>${this.escapeHtml(decoratorName)}</span>
                                <span><i class="fas fa-calendar mr-1 text-purple-600"></i>${createdAt}</span>
                            </div>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[ticketStatus] || statusColors['novo']}">
                            <i class="fas ${statusIcons[ticketStatus] || statusIcons['novo']} mr-1"></i>${statusLabels[ticketStatus] || statusLabels['novo']}
                        </span>
                    </div>
                    <p class="text-gray-700 text-sm line-clamp-2 mb-3">${this.escapeHtml(ticketDescription)}</p>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                        <div class="flex items-center space-x-3">
                            ${ticket.attachment ? '<span><i class="fas fa-paperclip mr-1"></i>Anexo</span>' : ''}
                            <span>ID: #${ticketIdDisplay}</span>
                        </div>
                        <button class="text-indigo-600 hover:text-indigo-800 font-medium">
                            Ver Detalhes <i class="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                </div>
            `;
            } catch (error) {
                console.error(`❌ Erro ao renderizar ticket no índice ${index}:`, error);
                console.error('Ticket que causou erro:', ticket);
                return '';
            }
        }).filter(html => html !== '').join('');
        
        if (ticketsHTML.length === 0 && this.filteredTickets.length > 0) {
            console.error('⚠️ Nenhum HTML foi gerado apesar de haver tickets!');
            console.error('Tickets:', this.filteredTickets);
        }
        
        console.log('🎨 HTML gerado:', ticketsHTML.length, 'caracteres');
        
        try {
            container.innerHTML = ticketsHTML;
            console.log('✅ Tickets renderizados no DOM');
        } catch (error) {
            console.error('❌ Erro ao inserir HTML no container:', error);
            console.error('HTML que causou erro:', ticketsHTML.substring(0, 500));
        }
    }
    
    // Filtrar chamados
    filterSupportTickets() {
        const search = document.getElementById('support-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('support-status-filter')?.value || '';
        
        this.filteredTickets = this.supportTickets.filter(ticket => {
            const matchesSearch = !search || 
                ticket.title.toLowerCase().includes(search) ||
                ticket.decorator_name.toLowerCase().includes(search) ||
                ticket.description.toLowerCase().includes(search);
            
            const matchesStatus = !statusFilter || ticket.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
        
        this.renderSupportTickets();
        this.updateSupportStats();
    }
    
    // Atualizar estatísticas
    updateSupportStats() {
        const total = document.getElementById('support-total');
        const newTickets = document.getElementById('support-new');
        const analysis = document.getElementById('support-analysis');
        const resolved = document.getElementById('support-resolved');
        
        if (total) total.textContent = this.supportTickets.length;
        if (newTickets) newTickets.textContent = this.supportTickets.filter(t => t.status === 'novo').length;
        if (analysis) analysis.textContent = this.supportTickets.filter(t => t.status === 'em_analise').length;
        if (resolved) resolved.textContent = this.supportTickets.filter(t => t.status === 'resolvido').length;
    }
    
    // Ver detalhes do chamado
    viewTicketDetails(ticketId) {
        // Converter ticketId para string para comparação
        const ticketIdStr = String(ticketId);
        const ticket = this.supportTickets.find(t => String(t.id) === ticketIdStr);
        if (!ticket) {
            this.showNotification('Chamado não encontrado', 'error');
            return;
        }
        
        this.currentTicket = ticket;
        
        // Preencher modal - usar função auxiliar segura
        const ticketIdDisplay = this.safeIdDisplay(ticket.id, 8);
        document.getElementById('ticket-details-id').textContent = `Chamado #${ticketIdDisplay}`;
        document.getElementById('ticket-decorator-name').textContent = ticket.decorator_name || 'Desconhecido';
        document.getElementById('ticket-decorator-contact').textContent = ticket.decorator_email || 'Não informado';
        document.getElementById('ticket-datetime').textContent = this.formatDateTime(ticket.created_at);
        document.getElementById('ticket-title').textContent = ticket.title || 'Sem título';
        document.getElementById('ticket-description').textContent = ticket.description || 'Sem descrição';
        document.getElementById('ticket-new-status').value = ticket.status || 'novo';
        
        // Badge de status
        const statusColors = {
            'novo': 'bg-yellow-100 text-yellow-800',
            'em_analise': 'bg-blue-100 text-blue-800',
            'resolvido': 'bg-green-100 text-green-800',
            'fechado': 'bg-gray-100 text-gray-800'
        };
        
        const statusLabels = {
            'novo': 'Novo',
            'em_analise': 'Em Análise',
            'resolvido': 'Resolvido',
            'fechado': 'Fechado'
        };
        
        document.getElementById('ticket-status-badge').innerHTML = `
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColors[ticket.status]}">
                ${statusLabels[ticket.status]}
            </span>
        `;
        
        // Anexo
        const attachmentSection = document.getElementById('ticket-attachment-section');
        const attachmentImg = document.getElementById('ticket-attachment');
        
        if (ticket.attachment) {
            attachmentImg.src = ticket.attachment;
            attachmentImg.onclick = () => window.open(ticket.attachment, '_blank');
            attachmentSection.classList.remove('hidden');
        } else {
            attachmentSection.classList.add('hidden');
        }
        
        // Mostrar modal
        document.getElementById('ticket-details-modal').classList.remove('hidden');
    }
    
    async saveTicketStatus() {
        if (!this.currentTicket) return;
        
        const newStatus = document.getElementById('ticket-new-status').value;
        const adminResponse = document.getElementById('ticket-admin-response')?.value || null;
        
        try {
            const response = await fetch('../services/suporte.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'update_status',
                    ticket_id: this.currentTicket.id,
                    status: newStatus,
                    admin_response: adminResponse
                })
            });
            
            const result = await this.safeJsonParse(response, { success: false });
            
            if (result && result.success) {
                // Recarregar tickets do servidor
                await this.loadSupportTickets();
                
                // Fechar modal
                this.closeTicketDetails();
                
                this.showNotification('Status do chamado atualizado com sucesso!', 'success');
            } else {
                throw new Error(result.message || 'Erro ao atualizar status');
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            this.showNotification('Erro ao atualizar status do chamado', 'error');
        }
    }
    
    // Excluir chamado
    async deleteTicket() {
        if (!this.currentTicket) return;
        
        if (!confirm('Tem certeza que deseja excluir este chamado?')) {
            return;
        }
        
        try {
            const response = await fetch('../services/suporte.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'delete',
                    ticket_id: this.currentTicket.id
                })
            });
            
            const result = await this.safeJsonParse(response, { success: false });
            
            if (result && result.success) {
                // Recarregar tickets do servidor
                await this.loadSupportTickets();
                
                this.closeTicketDetails();
                
                this.showNotification('Chamado excluído com sucesso!', 'success');
            } else {
                throw new Error(result.message || 'Erro ao deletar ticket');
            }
        } catch (error) {
            console.error('Erro ao deletar ticket:', error);
            this.showNotification('Erro ao excluir chamado', 'error');
        }
    }
    
    // Fechar modal de detalhes
    closeTicketDetails() {
        document.getElementById('ticket-details-modal').classList.add('hidden');
        this.currentTicket = null;
    }
    
    // Configurar listeners do modal de chamados
    setupTicketModalListeners() {
        const closeBtn = document.getElementById('close-ticket-details');
        const closeBtn2 = document.getElementById('close-ticket-btn');
        const overlay = document.getElementById('ticket-details-overlay');
        const saveBtn = document.getElementById('save-ticket-status');
        const deleteBtn = document.getElementById('delete-ticket-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeTicketDetails());
        }
        
        if (closeBtn2) {
            closeBtn2.addEventListener('click', () => this.closeTicketDetails());
        }
        
        if (overlay) {
            overlay.addEventListener('click', () => this.closeTicketDetails());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveTicketStatus());
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteTicket());
        }
    }
    
    // Formatar data e hora
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Função auxiliar para converter ID para string de forma segura
     * NUNCA use ticket.id diretamente - sempre use esta função
     */
    safeIdToString(id) {
        try {
            if (id === undefined || id === null) {
                return '';
            }
            if (typeof id === 'string') {
                return id;
            }
            if (typeof id === 'number') {
                return String(id);
            }
            // Tentar converter de qualquer forma
            const str = String(id);
            if (typeof str === 'string') {
                return str;
            }
            return '';
        } catch (e) {
            console.error('Erro ao converter ID para string:', e, id);
            return '';
        }
    }
    
    /**
     * Função auxiliar para criar display ID de forma segura
     */
    safeIdDisplay(id, maxLength = 8) {
        try {
            let idStr = '';
            
            // Tentar usar função auxiliar se existir
            if (typeof this.safeIdToString === 'function') {
                idStr = this.safeIdToString(id);
            } else {
                // Fallback direto se função não existir
                if (id !== undefined && id !== null) {
                    idStr = String(id);
                }
            }
            
            // Validação rigorosa
            if (!idStr || typeof idStr !== 'string' || idStr.length === 0) {
                return 'N/A';
            }
            
            // Garantir que idStr é realmente uma string antes de usar substring
            const validatedStr = String(idStr);
            if (typeof validatedStr !== 'string') {
                console.error('safeIdDisplay: validatedStr ainda não é string:', typeof validatedStr, validatedStr);
                return 'N/A';
            }
            
            // Agora sim podemos usar substring com segurança
            return validatedStr.substring(0, Math.min(maxLength, validatedStr.length));
        } catch (e) {
            console.error('Erro ao criar display ID:', e, id);
            // Fallback absoluto
            try {
                if (id !== undefined && id !== null) {
                    const fallbackStr = String(id);
                    if (typeof fallbackStr === 'string' && fallbackStr.length > 0) {
                        return fallbackStr.substring(0, Math.min(maxLength, fallbackStr.length));
                    }
                }
            } catch (fallbackError) {
                console.error('Erro no fallback:', fallbackError);
            }
            return 'N/A';
        }
    }
    
    formatDateTime(dateString) {
        if (!dateString) return 'Data não disponível';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // ========== EDIÇÃO DA PÁGINA PÚBLICA ==========
    
    // Editar personalização da página
    async editPageCustomization(decoratorId) {
        try {
            // Buscar dados do decorador
            const user = this.users.find(u => u.id === decoratorId);
            if (!user || user.type !== 'decorator') {
                this.showNotification('Decorador não encontrado', 'error');
                return;
            }
            
            // Mostrar modal primeiro para garantir que os elementos estejam no DOM
            const modal = document.getElementById('page-customization-modal');
            if (modal) {
                modal.classList.remove('hidden');
            }
            
            // Preencher nome no modal (com verificação de null)
            const decoratorNameEl = document.getElementById('page-customization-decorator-name');
            const decoratorIdEl = document.getElementById('page-customization-decorator-id');
            
            if (decoratorNameEl) decoratorNameEl.textContent = user.name;
            if (decoratorIdEl) decoratorIdEl.value = decoratorId;
            
            // Configurar tabs antes de carregar dados
            this.setupPageCustomizationTabs();
            
            // Configurar cores
            this.setupColorInputs();
            
            // Configurar contadores de caracteres
            this.setupCharCounters();
            
            // Carregar configurações existentes após mostrar o modal
            await this.loadPageCustomization(decoratorId);
            
        } catch (error) {
            console.error('Erro ao abrir edição de página:', error);
            this.showNotification('Erro ao carregar configurações da página', 'error');
        }
    }
    
    // Carregar configurações da página
    async loadPageCustomization(decoratorId) {
        try {
            const response = await fetch('../services/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_page_customization',
                    decorator_id: decoratorId
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
                const config = result.data;
                
                // Preencher campos de contato
                if (document.getElementById('contact-email')) {
                    document.getElementById('contact-email').value = config.contact_email || '';
                }
                if (document.getElementById('contact-whatsapp')) {
                    document.getElementById('contact-whatsapp').value = config.contact_whatsapp || '';
                }
                if (document.getElementById('contact-instagram')) {
                    document.getElementById('contact-instagram').value = config.contact_instagram || '';
                }
                
                // Verificar se há dados salvos
                const hasData = config.page_title && config.page_description;
                
                // Preencher campos de conteúdo (com verificação de null)
                const pageTitleEl = document.getElementById('page-title');
                const pageDescEl = document.getElementById('page-description');
                const welcomeTextEl = document.getElementById('welcome-text');
                
                if (pageTitleEl) pageTitleEl.value = config.page_title || '';
                if (pageDescEl) pageDescEl.value = config.page_description || '';
                if (welcomeTextEl) welcomeTextEl.value = config.welcome_text || '';
                
                // Preencher campos visuais (com verificação de null)
                const coverImageEl = document.getElementById('cover-image-url');
                if (coverImageEl) coverImageEl.value = config.cover_image_url || '';
                
                const primaryColor = config.primary_color || '#667eea';
                const secondaryColor = config.secondary_color || '#764ba2';
                const accentColor = config.accent_color || '#f59e0b';
                
                const primaryColorEl = document.getElementById('primary-color');
                const primaryColorHexEl = document.getElementById('primary-color-hex');
                const secondaryColorEl = document.getElementById('secondary-color');
                const secondaryColorHexEl = document.getElementById('secondary-color-hex');
                const accentColorEl = document.getElementById('accent-color');
                const accentColorHexEl = document.getElementById('accent-color-hex');
                
                if (primaryColorEl) primaryColorEl.value = primaryColor;
                if (primaryColorHexEl) primaryColorHexEl.value = primaryColor;
                if (secondaryColorEl) secondaryColorEl.value = secondaryColor;
                if (secondaryColorHexEl) secondaryColorHexEl.value = secondaryColor;
                if (accentColorEl) accentColorEl.value = accentColor;
                if (accentColorHexEl) accentColorHexEl.value = accentColor;
                
                // Preencher redes sociais (com verificação de null)
                const socialFacebookEl = document.getElementById('social-facebook');
                const socialInstagramEl = document.getElementById('social-instagram');
                const socialWhatsappEl = document.getElementById('social-whatsapp');
                const socialYoutubeEl = document.getElementById('social-youtube');
                
                if (config.social_media) {
                    const social = typeof config.social_media === 'string' 
                        ? ((typeof window !== 'undefined' && window.safeJsonParse) 
                            ? window.safeJsonParse(config.social_media, {}) 
                            : JSON.parse(config.social_media)) 
                        : config.social_media;
                    if (socialFacebookEl) socialFacebookEl.value = social.facebook || '';
                    if (socialInstagramEl) socialInstagramEl.value = social.instagram || '';
                    if (socialWhatsappEl) socialWhatsappEl.value = social.whatsapp || '';
                    if (socialYoutubeEl) socialYoutubeEl.value = social.youtube || '';
                } else {
                    if (socialFacebookEl) socialFacebookEl.value = '';
                    if (socialInstagramEl) socialInstagramEl.value = '';
                    if (socialWhatsappEl) socialWhatsappEl.value = '';
                    if (socialYoutubeEl) socialYoutubeEl.value = '';
                }
                
                // Preencher SEO (com verificação de null)
                const metaTitleEl = document.getElementById('meta-title');
                const metaDescEl = document.getElementById('meta-description');
                const metaKeywordsEl = document.getElementById('meta-keywords');
                
                if (metaTitleEl) metaTitleEl.value = config.meta_title || '';
                if (metaDescEl) metaDescEl.value = config.meta_description || '';
                if (metaKeywordsEl) metaKeywordsEl.value = config.meta_keywords || '';
                
                // Atualizar contadores
                this.updateCharCounters();
            }
            
        } catch (error) {
            console.error('Erro ao carregar personalização:', error);
            this.showNotification('Erro ao carregar configurações. Verifique a conexão com o servidor.', 'error');
        }
    }
    
    // Salvar personalização da página
    async savePageCustomization() {
        // Obter referência do botão antes do try
        const submitBtn = document.getElementById('save-page-customization');
        if (!submitBtn) {
            this.showNotification('Erro: Botão de envio não encontrado', 'error');
            return;
        }
        
        const originalText = submitBtn.innerHTML;
        
        try {
            const form = document.getElementById('page-customization-form');
            if (!form) {
                this.showNotification('Erro: Formulário não encontrado', 'error');
                return;
            }
            
            const formData = new FormData(form);
            
            const decoratorId = formData.get('decorator_id');
            
            // Coletar dados do formulário
            const customizationData = {
                action: 'save_page_customization',
                decorator_id: decoratorId,
                page_title: formData.get('page_title'),
                page_description: formData.get('page_description'),
                welcome_text: formData.get('welcome_text'),
                cover_image_url: formData.get('cover_image_url'),
                primary_color: formData.get('primary_color'),
                secondary_color: formData.get('secondary_color'),
                accent_color: formData.get('accent_color'),
                social_media: JSON.stringify({
                    facebook: formData.get('social_facebook'),
                    instagram: formData.get('social_instagram'),
                    whatsapp: formData.get('social_whatsapp'),
                    youtube: formData.get('social_youtube')
                }),
                meta_title: formData.get('meta_title'),
                meta_description: formData.get('meta_description'),
                meta_keywords: formData.get('meta_keywords'),
                // Campos de contato para página inicial
                contact_email: formData.get('contact_email'),
                contact_whatsapp: formData.get('contact_whatsapp'),
                contact_instagram: formData.get('contact_instagram')
            };
            
            // Validar dados obrigatórios
            if (!customizationData.page_title || !customizationData.page_description) {
                this.showNotification('Título e descrição são obrigatórios', 'error');
                // Restaurar botão antes de retornar
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            // Mostrar loading
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';
            submitBtn.disabled = true;
            
            // Enviar para o servidor
            const response = await fetch('../services/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customizationData)
            });
            
            const result = await this.safeJsonParse(response, { success: false });
            
            if (result && result.success) {
                this.showNotification('Personalização salva com sucesso!', 'success');
                this.closePageCustomizationModal();
            } else {
                this.showNotification('Erro: ' + result.message, 'error');
            }
            
        } catch (error) {
            console.error('Erro ao salvar personalização:', error);
            this.showNotification('Erro ao salvar personalização', 'error');
        } finally {
            // Restaurar botão sempre, mesmo em caso de erro
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    }
    
    // Fechar modal de personalização
    closePageCustomizationModal() {
        document.getElementById('page-customization-modal').classList.add('hidden');
        document.getElementById('page-customization-form').reset();
    }
    
    // Configurar tabs
    setupPageCustomizationTabs() {
        const tabs = document.querySelectorAll('.page-customization-tab');
        const panels = document.querySelectorAll('.tab-panel');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
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
                const panel = document.getElementById(`tab-${targetTab}-panel`);
                if (panel) {
                    panel.classList.remove('hidden');
                }
            });
        });
    }
    
    // Configurar inputs de cor
    setupColorInputs() {
        const colorInputs = ['primary', 'secondary', 'accent'];
        
        colorInputs.forEach(color => {
            const colorPicker = document.getElementById(`${color}-color`);
            const colorHex = document.getElementById(`${color}-color-hex`);
            
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
    
    // Configurar contadores de caracteres
    setupCharCounters() {
        const metaTitle = document.getElementById('meta-title');
        const metaDescription = document.getElementById('meta-description');
        const metaTitleCount = document.getElementById('meta-title-count');
        const metaDescriptionCount = document.getElementById('meta-description-count');
        
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
    }
    
    // Atualizar contadores de caracteres
    updateCharCounters() {
        const metaTitle = document.getElementById('meta-title');
        const metaDescription = document.getElementById('meta-description');
        const metaTitleCount = document.getElementById('meta-title-count');
        const metaDescriptionCount = document.getElementById('meta-description-count');
        
        if (metaTitle && metaTitleCount) {
            const count = metaTitle.value.length;
            metaTitleCount.textContent = `${count} caracteres`;
        }
        
        if (metaDescription && metaDescriptionCount) {
            const count = metaDescription.value.length;
            metaDescriptionCount.textContent = `${count} caracteres`;
        }
    }
    
    // Visualizar página
    previewPageCustomization() {
        const decoratorId = document.getElementById('page-customization-decorator-id').value;
        const user = this.users.find(u => u.id === parseInt(decoratorId));
        
        if (user && user.slug) {
            window.open(`../${user.slug}`, '_blank');
        } else {
            this.showNotification('Slug do decorador não encontrado', 'error');
        }
    }

    // Editar documento legal (Termos ou Política de Privacidade)
    async editLegalDocument(type) {
        try {
            console.log('editLegalDocument chamado com tipo:', type);
            const filePath = type === 'termos' ? '../pages/termos-e-condicoes.html' : '../pages/politica-de-privacidade.html';
            
            console.log('Carregando arquivo:', filePath);
            // Buscar conteúdo do arquivo
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error('Erro ao carregar arquivo: ' + response.status);
            }
            
            const html = await response.text();
            console.log('Arquivo carregado, tamanho:', html.length);
            
            // Configurar modal
            const modal = document.getElementById('edit-legal-document-modal');
            const title = document.getElementById('legal-document-title');
            const subtitle = document.getElementById('legal-document-subtitle');
            const icon = document.getElementById('legal-document-icon');
            const content = document.getElementById('legal-document-content');
            const documentType = document.getElementById('legal-document-type');
            
            if (!modal) {
                console.error('Modal edit-legal-document-modal não encontrado');
                this.showNotification('Erro: Modal não encontrado', 'error');
                return;
            }
            
            if (!title || !subtitle || !icon || !content || !documentType) {
                console.error('Elementos do modal não encontrados:', { title, subtitle, icon, content, documentType });
                this.showNotification('Erro: Elementos do modal não encontrados', 'error');
                return;
            }
            
            if (type === 'termos') {
                title.textContent = 'Editar Termos e Condições';
                subtitle.textContent = 'Atualize o conteúdo dos Termos e Condições do sistema';
                icon.className = 'fas fa-file-contract text-white text-lg';
            } else {
                title.textContent = 'Editar Política de Privacidade';
                subtitle.textContent = 'Atualize o conteúdo da Política de Privacidade do sistema';
                icon.className = 'fas fa-shield-alt text-white text-lg';
            }
            
            documentType.value = type;
            content.value = html;
            
            // Mostrar modal
            console.log('Mostrando modal');
            modal.classList.remove('hidden');
            
            // Focar no campo de conteúdo
            setTimeout(() => {
                content.focus();
            }, 300);
            
        } catch (error) {
            console.error('Erro ao carregar documento legal:', error);
            this.showNotification('Erro ao carregar arquivo do documento: ' + error.message, 'error');
        }
    }

    // Salvar documento legal
    async saveLegalDocument() {
        try {
            const documentType = document.getElementById('legal-document-type').value;
            const content = document.getElementById('legal-document-content').value;
            
            if (!documentType || !content) {
                this.showNotification('Tipo de documento ou conteúdo não encontrado', 'error');
                return;
            }
            
            const filePath = documentType === 'termos' ? 'termos-e-condicoes.html' : 'politica-de-privacidade.html';
            
            const response = await fetch('../services/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'save_legal_document',
                    file_path: filePath,
                    content: content
                })
            });
            
            const result = await this.safeJsonParse(response, { success: false });
            
            if (result && result.success) {
                this.showNotification('Documento salvo com sucesso!', 'success');
                document.getElementById('edit-legal-document-modal').classList.add('hidden');
            } else {
                this.showNotification('Erro: ' + (result.message || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar documento legal:', error);
            this.showNotification('Erro de conexão', 'error');
        }
    }

    // Carregar termos padrão do sistema


    // ========== MÓDULO DE CONFIGURAÇÕES ==========
    
    // Inicializar módulo de configurações
    initializeSettingsModule() {
        // Configurar formulário de perfil do admin
        const adminAccountForm = document.getElementById('admin-account-form');
        if (adminAccountForm) {
            adminAccountForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAdminProfile();
            });
        }

        // Configurar formulário de senha do admin
        const adminPasswordForm = document.getElementById('admin-password-form');
        if (adminPasswordForm) {
            adminPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changeAdminPassword();
            });
        }

        // Configurar botão de reset do perfil
        const resetAdminProfile = document.getElementById('reset-admin-profile');
        if (resetAdminProfile) {
            resetAdminProfile.addEventListener('click', () => {
                this.loadAdminProfile(true);
            });
        }

        // Configurar upload de foto do admin
        const adminPhotoInput = document.getElementById('admin-profile-photo-input');
        if (adminPhotoInput) {
            adminPhotoInput.addEventListener('change', (e) => {
                this.handleAdminPhotoUpload(e);
            });
        }

        // Configurar remoção de foto do admin
        const removeAdminPhoto = document.getElementById('remove-admin-photo');
        if (removeAdminPhoto) {
            removeAdminPhoto.addEventListener('click', () => {
                this.removeAdminPhoto();
            });
        }

        // Configurar botões de edição de documentos legais
        // Usar delegação de eventos para garantir que funcione mesmo se os elementos ainda não existirem
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'edit-termos-btn') {
                console.log('Botão termos clicado (delegação)');
                e.preventDefault();
                this.editLegalDocument('termos');
            } else if (e.target && e.target.id === 'edit-privacidade-btn') {
                console.log('Botão privacidade clicado (delegação)');
                e.preventDefault();
                this.editLegalDocument('privacidade');
            } else if (e.target && e.target.closest('#edit-termos-btn')) {
                console.log('Botão termos clicado (closest)');
                e.preventDefault();
                this.editLegalDocument('termos');
            } else if (e.target && e.target.closest('#edit-privacidade-btn')) {
                console.log('Botão privacidade clicado (closest)');
                e.preventDefault();
                this.editLegalDocument('privacidade');
            }
        });

        // Também tentar adicionar listeners diretos como fallback
        const editTermosBtn = document.getElementById('edit-termos-btn');
        if (editTermosBtn) {
            editTermosBtn.addEventListener('click', (e) => {
                console.log('Botão termos clicado (direto)');
                e.preventDefault();
                this.editLegalDocument('termos');
            });
        } else {
            console.warn('Botão edit-termos-btn não encontrado no momento da inicialização');
        }

        const editPrivacidadeBtn = document.getElementById('edit-privacidade-btn');
        if (editPrivacidadeBtn) {
            editPrivacidadeBtn.addEventListener('click', (e) => {
                console.log('Botão privacidade clicado (direto)');
                e.preventDefault();
                this.editLegalDocument('privacidade');
            });
        } else {
            console.warn('Botão edit-privacidade-btn não encontrado no momento da inicialização');
        }

        // Configurar contador de caracteres da bio
        const adminBio = document.getElementById('admin-bio');
        if (adminBio) {
            adminBio.addEventListener('input', () => {
                const count = adminBio.value.length;
                const counter = document.getElementById('admin-bio-count');
                if (counter) {
                    counter.textContent = count;
                    if (count > 500) {
                        counter.classList.add('text-red-500');
                    } else {
                        counter.classList.remove('text-red-500');
                    }
                }
            });
        }

        // Configurar toggles de senha
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const targetId = toggle.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                if (targetInput) {
                    const type = targetInput.type === 'password' ? 'text' : 'password';
                    targetInput.type = type;
                    toggle.querySelector('i').classList.toggle('fa-eye');
                    toggle.querySelector('i').classList.toggle('fa-eye-slash');
                }
            });
        });
    }

    // Carregar perfil do admin
    async loadAdminProfile(forceReload = false) {
        if (this.adminProfile && !forceReload) {
            this.populateAdminProfileForm();
            return;
        }

        try {
            const response = await fetch('../services/admin.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_admin_profile'
                })
            });

            const result = await this.safeJsonParse(response, { success: false });

            if (result && result.success && result.data) {
                this.adminProfile = result.data;
                this.populateAdminProfileForm();
                this.adminSettingsLoaded = true;
            } else {
                this.showNotification('Erro ao carregar perfil: ' + (result.message || 'Erro desconhecido'), 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar perfil do admin:', error);
            this.showNotification('Erro ao carregar perfil do administrador', 'error');
        }
    }

    // Preencher formulário de perfil do admin
    populateAdminProfileForm() {
        if (!this.adminProfile) return;

        const fields = {
            'admin-name': this.adminProfile.name || '',
            'admin-email': this.adminProfile.email || '',
            'admin-phone': this.adminProfile.phone || '',
            'admin-whatsapp': this.adminProfile.whatsapp || '',
            'admin-instagram': this.adminProfile.instagram || '',
            'admin-communication-email': this.adminProfile.communication_email || '',
            'admin-bio': this.adminProfile.bio || ''
        };

        Object.keys(fields).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = fields[id];
            }
        });

        // Atualizar foto de perfil
        const adminProfilePhoto = document.getElementById('admin-profile-photo');
        if (adminProfilePhoto) {
            if (this.adminProfile.profile_photo) {
                adminProfilePhoto.src = '../' + this.adminProfile.profile_photo;
            } else {
                adminProfilePhoto.src = this.defaultAdminPhoto;
            }
        }

        // Atualizar nome e email exibidos
        const adminProfileName = document.getElementById('admin-profile-name');
        const adminProfileEmail = document.getElementById('admin-profile-email');
        if (adminProfileName) adminProfileName.textContent = this.adminProfile.name || 'Administrador';
        if (adminProfileEmail) adminProfileEmail.textContent = this.adminProfile.email || 'admin@upbaloes.com';

        // Atualizar contador de bio
        const adminBio = document.getElementById('admin-bio');
        const bioCount = document.getElementById('admin-bio-count');
        if (adminBio && bioCount) {
            bioCount.textContent = adminBio.value.length;
        }
    }

    // Salvar perfil do admin
    async saveAdminProfile() {
        try {
            const formData = {
                name: document.getElementById('admin-name')?.value || '',
                email: document.getElementById('admin-email')?.value || '',
                phone: document.getElementById('admin-phone')?.value || '',
                whatsapp: document.getElementById('admin-whatsapp')?.value || '',
                instagram: document.getElementById('admin-instagram')?.value || '',
                communication_email: document.getElementById('admin-communication-email')?.value || '',
                bio: document.getElementById('admin-bio')?.value || '',
                profile_image: this.pendingAdminProfileImage || null,
                remove_profile_image: this.removeAdminProfileImage || false
            };

            const submitBtn = document.getElementById('save-admin-profile');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';
                submitBtn.disabled = true;

                const response = await fetch('../services/admin.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'update_admin_profile',
                        ...formData
                    })
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification('Perfil atualizado com sucesso!', 'success');
                    this.adminProfile = result.data;
                    this.pendingAdminProfileImage = null;
                    this.removeAdminProfileImage = false;
                    this.populateAdminProfileForm();
                    
                    // Mostrar feedback de atualização
                    const updatedFeedback = document.getElementById('admin-profile-updated');
                    if (updatedFeedback) {
                        updatedFeedback.classList.remove('hidden');
                        setTimeout(() => {
                            updatedFeedback.classList.add('hidden');
                        }, 3000);
                    }
                } else {
                    this.showNotification('Erro: ' + (result.message || 'Erro ao salvar perfil'), 'error');
                }

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Erro ao salvar perfil do admin:', error);
            this.showNotification('Erro ao salvar perfil', 'error');
        }
    }

    // Alterar senha do admin
    async changeAdminPassword() {
        try {
            const currentPassword = document.getElementById('admin-current-password')?.value || '';
            const newPassword = document.getElementById('admin-new-password')?.value || '';
            const confirmPassword = document.getElementById('admin-confirm-password')?.value || '';

            if (newPassword !== confirmPassword) {
                this.showNotification('As senhas não coincidem', 'error');
                return;
            }

            const submitBtn = document.getElementById('save-admin-password');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Alterando...';
                submitBtn.disabled = true;

                const response = await fetch('../services/admin.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'change_admin_password',
                        current_password: currentPassword,
                        new_password: newPassword,
                        confirm_password: confirmPassword
                    })
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification('Senha alterada com sucesso!', 'success');
                    document.getElementById('admin-password-form')?.reset();
                } else {
                    this.showNotification('Erro: ' + (result.message || 'Erro ao alterar senha'), 'error');
                }

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Erro ao alterar senha do admin:', error);
            this.showNotification('Erro ao alterar senha', 'error');
        }
    }

    // Manipular upload de foto do admin
    handleAdminPhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showNotification('Por favor, selecione uma imagem válida', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            this.showNotification('A imagem deve ter no máximo 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.pendingAdminProfileImage = e.target.result;
            const adminProfilePhoto = document.getElementById('admin-profile-photo');
            if (adminProfilePhoto) {
                adminProfilePhoto.src = e.target.result;
            }
            this.showAdminPhotoFeedback('Foto carregada. Clique em "Salvar Alterações" para confirmar.', 'success');
        };
        reader.readAsDataURL(file);
    }

    // Remover foto do admin
    removeAdminPhoto() {
        this.removeAdminProfileImage = true;
        this.pendingAdminProfileImage = null;
        const adminProfilePhoto = document.getElementById('admin-profile-photo');
        if (adminProfilePhoto) {
            adminProfilePhoto.src = this.defaultAdminPhoto;
        }
        this.showAdminPhotoFeedback('Foto removida. Clique em "Salvar Alterações" para confirmar.', 'info');
    }

    // Mostrar feedback de foto do admin
    showAdminPhotoFeedback(message, type) {
        const feedback = document.getElementById('admin-photo-feedback');
        if (!feedback) return;

        feedback.textContent = message;
        feedback.classList.remove('hidden', 'text-green-600', 'text-blue-600', 'text-red-600');
        
        const colorClass = type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : 'text-blue-600';
        feedback.classList.add(colorClass);

        if (this.adminPhotoFeedbackTimeout) {
            clearTimeout(this.adminPhotoFeedbackTimeout);
        }

        this.adminPhotoFeedbackTimeout = setTimeout(() => {
            feedback.classList.add('hidden');
        }, 5000);
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
    try {
        window.admin = new AdminSystem();
        window.adminSystem = window.admin; // Alias para compatibilidade
        
        // Garantir que ambos estão disponíveis globalmente
        if (!window.admin || !window.adminSystem) {
            console.error('Erro ao inicializar AdminSystem');
        }
    } catch (error) {
        console.error('Erro ao inicializar sistema administrativo:', error);
        alert('Erro ao carregar a área administrativa. Por favor, recarregue a página.');
    }
});

// Funções globais para uso no HTML
window.notifyDecorator = function(decoratorId, status) {
    if (window.admin && window.admin.users) {
        const decorator = window.admin.users.find(u => u.id === decoratorId);
        if (decorator) {
            window.admin.openNotificationModal(decorator, status);
        } else {
            console.error('Decorador não encontrado');
        }
    }
};
