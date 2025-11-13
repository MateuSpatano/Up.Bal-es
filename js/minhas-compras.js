// JavaScript para página Minhas Compras
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos DOM
    const requestsContainer = document.getElementById('requests-container');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const statusFilter = document.getElementById('status-filter');
    const refreshBtn = document.getElementById('refresh-btn');
    const detailsModal = document.getElementById('request-details-modal');
    const closeDetailsModalBtn = document.getElementById('close-details-modal-btn');
    const detailsContent = document.getElementById('request-details-content');
    
    let currentFilter = '';
    
    // ========== CARREGAMENTO DE SOLICITAÇÕES ==========
    
    async function loadRequests() {
        try {
            loadingState.classList.remove('hidden');
            emptyState.classList.add('hidden');
            
            // Obter email do usuário logado
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const userEmail = userData.email;
            
            if (!userEmail) {
                showNotification('Você precisa estar logado para ver suas solicitações', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            
            // Buscar solicitações do cliente
            const response = await fetch('../services/orcamentos.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'list_client',
                    email: userEmail,
                    status: currentFilter || undefined
                })
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Erro ao carregar solicitações');
            }
            
            const requests = result.requests || [];
            
            loadingState.classList.add('hidden');
            
            if (requests.length === 0) {
                emptyState.classList.remove('hidden');
                requestsContainer.innerHTML = '';
                requestsContainer.appendChild(emptyState);
            } else {
                emptyState.classList.add('hidden');
                renderRequests(requests);
            }
            
        } catch (error) {
            console.error('Erro ao carregar solicitações:', error);
            loadingState.classList.add('hidden');
            showNotification('Erro ao carregar solicitações. Tente novamente.', 'error');
        }
    }
    
    // ========== RENDERIZAÇÃO ==========
    
    function renderRequests(requests) {
        requestsContainer.innerHTML = '';
        
        requests.forEach(request => {
            const requestCard = createRequestCard(request);
            requestsContainer.appendChild(requestCard);
        });
    }
    
    function createRequestCard(request) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow';
        
        const status = request.status || 'pendente';
        const statusConfig = getStatusConfig(status);
        const formattedDate = formatDate(request.created_at);
        const formattedEventDate = request.event_date ? formatDate(request.event_date) : 'Não informado';
        const formattedTime = request.event_time || 'Não informado';
        const totalValue = parseFloat(request.valor_estimado || 0);
        
        card.innerHTML = `
            <div class="flex flex-col md:flex-row gap-4 sm:gap-6">
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between mb-3 sm:mb-4">
                        <div class="flex-1 min-w-0">
                            <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2 break-words">
                                Solicitação #${request.id || 'N/A'}
                            </h3>
                            <div class="flex items-center gap-2 mb-2 flex-wrap">
                                <span class="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}">
                                    <i class="${statusConfig.icon} mr-1"></i>${statusConfig.label}
                                </span>
                            </div>
                        </div>
                        <button onclick="showRequestDetails(${request.id})" 
                                class="text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0 ml-2"
                                title="Ver detalhes">
                            <i class="fas fa-eye text-lg sm:text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div>
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">
                                <i class="fas fa-gift mr-2"></i><strong>Tipo de Serviço:</strong>
                            </p>
                            <p class="text-sm sm:text-base text-gray-800 break-words">${getServiceTypeLabel(request.tipo_servico || request.service_type)}</p>
                        </div>
                        
                        <div>
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">
                                <i class="fas fa-calendar-alt mr-2"></i><strong>Data do Evento:</strong>
                            </p>
                            <p class="text-sm sm:text-base text-gray-800">${formattedEventDate} às ${formattedTime}</p>
                        </div>
                        
                        <div class="sm:col-span-2">
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">
                                <i class="fas fa-map-marker-alt mr-2"></i><strong>Local:</strong>
                            </p>
                            <p class="text-sm sm:text-base text-gray-800 break-words">${escapeHtml(request.local_evento || request.event_location || 'Não informado')}</p>
                        </div>
                        
                        <div>
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">
                                <i class="fas fa-dollar-sign mr-2"></i><strong>Valor Total:</strong>
                            </p>
                            <p class="text-lg sm:text-xl font-bold text-green-600">R$ ${formatPrice(totalValue)}</p>
                        </div>
                    </div>
                    
                    <div class="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                        <p class="text-xs sm:text-sm text-gray-600">
                            <i class="fas fa-clock mr-2"></i>Solicitado em: ${formattedDate}
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // ========== MODAL DE DETALHES ==========
    
    window.showRequestDetails = async function(requestId) {
        try {
            detailsContent.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i><p class="mt-4 text-gray-600">Carregando detalhes...</p></div>';
            detailsModal.classList.remove('hidden');
            detailsModal.classList.add('flex');
            document.body.style.overflow = 'hidden';
            
            // Buscar detalhes da solicitação
            const response = await fetch('../services/orcamentos.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_client',
                    id: requestId
                })
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Erro ao carregar detalhes');
            }
            
            const request = result.request || result.budget;
            renderRequestDetails(request);
            
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
            detailsContent.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                    <p class="text-gray-600">Erro ao carregar detalhes da solicitação.</p>
                    <button onclick="closeDetailsModal()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Fechar
                    </button>
                </div>
            `;
        }
    };
    
    function renderRequestDetails(request) {
        const status = request.status || 'pendente';
        const statusConfig = getStatusConfig(status);
        
        detailsContent.innerHTML = `
            <div class="space-y-4 sm:space-y-6">
                <!-- Status -->
                <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">Status da Solicitação</p>
                            <span class="px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}">
                                <i class="${statusConfig.icon} mr-2"></i>${statusConfig.label}
                            </span>
                        </div>
                        <p class="text-xs sm:text-sm text-gray-600">
                            ID: #${request.id || 'N/A'}
                        </p>
                    </div>
                </div>
                
                <!-- Dados do Cliente -->
                <div>
                    <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                        <i class="fas fa-user mr-2 text-blue-600"></i>Dados do Cliente
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">Nome</p>
                            <p class="text-sm sm:text-base text-gray-800 font-medium break-words">${escapeHtml(request.cliente || request.client || 'Não informado')}</p>
                        </div>
                        <div>
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">Email</p>
                            <p class="text-sm sm:text-base text-gray-800 font-medium break-words">${escapeHtml(request.email || 'Não informado')}</p>
                        </div>
                        <div>
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">Telefone</p>
                            <p class="text-sm sm:text-base text-gray-800 font-medium">${escapeHtml(request.telefone || request.phone || 'Não informado')}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Dados do Evento -->
                <div>
                    <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                        <i class="fas fa-calendar-alt mr-2 text-purple-600"></i>Dados do Evento
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">Data</p>
                            <p class="text-sm sm:text-base text-gray-800 font-medium">${request.event_date ? formatDate(request.event_date) : 'Não informado'}</p>
                        </div>
                        <div>
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">Horário</p>
                            <p class="text-sm sm:text-base text-gray-800 font-medium">${request.event_time || request.hora_evento || 'Não informado'}</p>
                        </div>
                        <div class="sm:col-span-2">
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">Local</p>
                            <p class="text-sm sm:text-base text-gray-800 font-medium break-words">${escapeHtml(request.local_evento || request.event_location || 'Não informado')}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Dados do Serviço -->
                <div>
                    <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                        <i class="fas fa-gift mr-2 text-green-600"></i>Dados do Serviço
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">Tipo de Serviço</p>
                            <p class="text-sm sm:text-base text-gray-800 font-medium">${getServiceTypeLabel(request.tipo_servico || request.service_type)}</p>
                        </div>
                        ${request.tamanho_arco_m ? `
                        <div>
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">Tamanho do Arco</p>
                            <p class="text-sm sm:text-base text-gray-800 font-medium">${request.tamanho_arco_m} metros</p>
                        </div>
                        ` : ''}
                        <div>
                            <p class="text-xs sm:text-sm text-gray-600 mb-1">Valor Total</p>
                            <p class="text-xl sm:text-2xl font-bold text-green-600">R$ ${formatPrice(parseFloat(request.valor_estimado || request.estimated_value || 0))}</p>
                        </div>
                    </div>
                    ${request.descricao || request.description ? `
                    <div class="mt-3 sm:mt-4">
                        <p class="text-xs sm:text-sm text-gray-600 mb-1">Descrição</p>
                        <p class="text-sm sm:text-base text-gray-800 break-words">${escapeHtml(request.descricao || request.description)}</p>
                    </div>
                    ` : ''}
                    ${request.observacoes || request.notes ? `
                    <div class="mt-3 sm:mt-4">
                        <p class="text-xs sm:text-sm text-gray-600 mb-1">Observações</p>
                        <p class="text-sm sm:text-base text-gray-800 break-words">${escapeHtml(request.observacoes || request.notes)}</p>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Informações Adicionais -->
                <div class="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <p class="text-xs sm:text-sm text-gray-600 mb-2">
                        <i class="fas fa-clock mr-2"></i><strong>Solicitado em:</strong> ${formatDateTime(request.created_at)}
                    </p>
                    ${request.updated_at && request.updated_at !== request.created_at ? `
                    <p class="text-xs sm:text-sm text-gray-600">
                        <i class="fas fa-edit mr-2"></i><strong>Última atualização:</strong> ${formatDateTime(request.updated_at)}
                    </p>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    window.closeDetailsModal = function() {
        detailsModal.classList.add('hidden');
        detailsModal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    };
    
    // ========== EVENT LISTENERS ==========
    
    statusFilter.addEventListener('change', function() {
        currentFilter = this.value;
        loadRequests();
    });
    
    refreshBtn.addEventListener('click', function() {
        loadRequests();
    });
    
    closeDetailsModalBtn.addEventListener('click', closeDetailsModal);
    
    // Fechar modal ao clicar fora
    detailsModal.addEventListener('click', function(e) {
        if (e.target === detailsModal) {
            closeDetailsModal();
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !detailsModal.classList.contains('hidden')) {
            closeDetailsModal();
        }
    });
    
    // ========== UTILITÁRIOS ==========
    
    function getStatusConfig(status) {
        const configs = {
            'pendente': {
                label: 'Pendente',
                bgColor: 'bg-yellow-100',
                textColor: 'text-yellow-800',
                icon: 'fas fa-clock'
            },
            'aprovado': {
                label: 'Confirmado',
                bgColor: 'bg-green-100',
                textColor: 'text-green-800',
                icon: 'fas fa-check-circle'
            },
            'recusado': {
                label: 'Recusado',
                bgColor: 'bg-red-100',
                textColor: 'text-red-800',
                icon: 'fas fa-times-circle'
            },
            'cancelado': {
                label: 'Cancelado',
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-800',
                icon: 'fas fa-ban'
            }
        };
        
        return configs[status] || configs['pendente'];
    }
    
    function getServiceTypeLabel(type) {
        const labels = {
            'arco-tradicional': 'Arco Tradicional',
            'arco-desconstruido': 'Arco Desconstruído',
            'escultura-balao': 'Escultura de Balão',
            'centro-mesa': 'Centro de Mesa',
            'baloes-piscina': 'Balões na Piscina'
        };
        
        return labels[type] || type || 'Não informado';
    }
    
    function formatPrice(value) {
        return parseFloat(value || 0).toFixed(2).replace('.', ',');
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'Não informado';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    function formatDateTime(dateString) {
        if (!dateString) return 'Não informado';
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR');
    }
    
    function escapeHtml(text) {
        if (!text) return '';
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
        loadRequests();
        
        // Atualizar a cada 30 segundos
        setInterval(loadRequests, 30000);
        
        console.log('Minhas Compras - Sistema carregado com sucesso!');
    }
    
    init();
});

