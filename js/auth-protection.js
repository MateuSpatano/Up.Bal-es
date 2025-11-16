/**
 * Sistema de Proteção de Autenticação - Up.Baloes
 * Protege páginas contra navegação não autorizada usando botões do navegador
 */

// Verificar se está em uma página protegida
function isProtectedPage() {
    const protectedPages = [
        'admin.html',
        'painel-decorador.html',
        'minhas-compras.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    return protectedPages.includes(currentPage);
}

// Verificar autenticação do usuário
function isLoggedIn() {
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    return userToken !== null && userData !== null;
}

// Verificar se é admin
function isAdmin() {
    if (!isLoggedIn()) return false;
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        return userData.role === 'admin';
    } catch (e) {
        return false;
    }
}

// Verificar se é decorador
function isDecorator() {
    if (!isLoggedIn()) return false;
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        return userData.role === 'decorator';
    } catch (e) {
        return false;
    }
}

// Verificar autenticação no backend
async function verifyBackendAuth() {
    try {
        const response = await fetch('../services/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'check_auth'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            return result.success === true;
        }
        return false;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return false;
    }
}

// Verificar autenticação admin no backend
async function verifyBackendAdminAuth() {
    try {
        const response = await fetch('../services/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'check_admin_auth'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            return result.success === true;
        }
        return false;
    } catch (error) {
        console.error('Erro ao verificar autenticação admin:', error);
        return false;
    }
}

// Redirecionar para login
function redirectToLogin() {
    // Limpar dados de autenticação
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    
    // Redirecionar para página de login
    window.location.replace('login.html');
}

// Redirecionar para login admin
function redirectToAdminLogin() {
    // Limpar dados de autenticação
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    
    // Redirecionar para página de login admin
    window.location.replace('admin-login.html');
}

// Proteger página admin
async function protectAdminPage() {
    if (!isAdmin()) {
        redirectToAdminLogin();
        return false;
    }
    
    // Verificar autenticação no backend
    const backendAuth = await verifyBackendAdminAuth();
    if (!backendAuth) {
        redirectToAdminLogin();
        return false;
    }
    
    // Marcar página como protegida no sessionStorage
    sessionStorage.setItem('protected_page', 'admin');
    sessionStorage.setItem('page_timestamp', Date.now().toString());
    
    return true;
}

// Proteger página de decorador
async function protectDecoratorPage() {
    if (!isDecorator()) {
        redirectToLogin();
        return false;
    }
    
    // Verificar autenticação no backend
    const backendAuth = await verifyBackendAuth();
    if (!backendAuth) {
        redirectToLogin();
        return false;
    }
    
    // Marcar página como protegida no sessionStorage
    sessionStorage.setItem('protected_page', 'decorator');
    sessionStorage.setItem('page_timestamp', Date.now().toString());
    
    return true;
}

// Proteger página de cliente
async function protectClientPage() {
    if (!isLoggedIn()) {
        redirectToLogin();
        return false;
    }
    
    // Verificar autenticação no backend
    const backendAuth = await verifyBackendAuth();
    if (!backendAuth) {
        redirectToLogin();
        return false;
    }
    
    // Marcar página como protegida no sessionStorage
    sessionStorage.setItem('protected_page', 'client');
    sessionStorage.setItem('page_timestamp', Date.now().toString());
    
    return true;
}

// Verificar se pode acessar página protegida
function canAccessProtectedPage(pageType) {
    const protectedPage = sessionStorage.getItem('protected_page');
    const pageTimestamp = sessionStorage.getItem('page_timestamp');
    
    // Se não há marcação de página protegida, verificar autenticação atual
    if (!protectedPage || !pageTimestamp) {
        return false;
    }
    
    // Verificar se o tipo de página corresponde
    if (protectedPage !== pageType) {
        return false;
    }
    
    // Verificar se a marcação não expirou (30 minutos)
    const timestamp = parseInt(pageTimestamp);
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutos
    
    if (now - timestamp > maxAge) {
        sessionStorage.removeItem('protected_page');
        sessionStorage.removeItem('page_timestamp');
        return false;
    }
    
    // Verificar autenticação atual
    if (pageType === 'admin' && !isAdmin()) {
        return false;
    }
    
    if (pageType === 'decorator' && !isDecorator()) {
        return false;
    }
    
    if (pageType === 'client' && !isLoggedIn()) {
        return false;
    }
    
    return true;
}

// Proteger contra navegação com botões do navegador
function protectBrowserNavigation(pageType) {
    // Adicionar entrada ao histórico quando a página é carregada
    history.pushState({ page: pageType, timestamp: Date.now() }, '', window.location.href);
    
    // Interceptar evento popstate (botões voltar/avançar)
    window.addEventListener('popstate', function(event) {
        // Verificar autenticação atual
        let shouldRedirect = false;
        
        if (pageType === 'admin') {
            if (!isAdmin()) {
                shouldRedirect = true;
            }
        } else if (pageType === 'decorator') {
            if (!isDecorator()) {
                shouldRedirect = true;
            }
        } else if (pageType === 'client') {
            if (!isLoggedIn()) {
                shouldRedirect = true;
            }
        }
        
        if (shouldRedirect) {
            // Bloquear navegação e redirecionar
            if (pageType === 'admin') {
                redirectToAdminLogin();
            } else {
                redirectToLogin();
            }
            
            // Adicionar entrada ao histórico para evitar loop
            history.pushState({ page: pageType, timestamp: Date.now() }, '', window.location.href);
        } else {
            // Verificar se pode acessar a página protegida
            if (!canAccessProtectedPage(pageType)) {
                // Redirecionar se não tiver acesso
                if (pageType === 'admin') {
                    redirectToAdminLogin();
                } else {
                    redirectToLogin();
                }
                
                // Adicionar entrada ao histórico para evitar loop
                history.pushState({ page: pageType, timestamp: Date.now() }, '', window.location.href);
            }
        }
    });
    
    // Verificar autenticação periodicamente (a cada 30 segundos)
    setInterval(async function() {
        let shouldRedirect = false;
        
        if (pageType === 'admin') {
            if (!isAdmin()) {
                shouldRedirect = true;
            } else {
                const backendAuth = await verifyBackendAdminAuth();
                if (!backendAuth) {
                    shouldRedirect = true;
                }
            }
        } else if (pageType === 'decorator') {
            if (!isDecorator()) {
                shouldRedirect = true;
            } else {
                const backendAuth = await verifyBackendAuth();
                if (!backendAuth) {
                    shouldRedirect = true;
                }
            }
        } else if (pageType === 'client') {
            if (!isLoggedIn()) {
                shouldRedirect = true;
            } else {
                const backendAuth = await verifyBackendAuth();
                if (!backendAuth) {
                    shouldRedirect = true;
                }
            }
        }
        
        if (shouldRedirect) {
            clearProtection();
            if (pageType === 'admin') {
                redirectToAdminLogin();
            } else {
                redirectToLogin();
            }
        }
    }, 30000); // Verificar a cada 30 segundos
}

// Limpar proteção ao fazer logout
function clearProtection() {
    sessionStorage.removeItem('protected_page');
    sessionStorage.removeItem('page_timestamp');
}

// Exportar funções para uso global
window.authProtection = {
    protectAdminPage,
    protectDecoratorPage,
    protectClientPage,
    protectBrowserNavigation,
    clearProtection,
    isLoggedIn,
    isAdmin,
    isDecorator,
    redirectToLogin,
    redirectToAdminLogin
};

