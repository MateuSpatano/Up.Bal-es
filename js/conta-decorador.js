/**
 * JavaScript para página de gerenciamento de conta do decorador
 * Up.Baloes - Sistema de Gestão de Decoração com Balões
 */

document.addEventListener('DOMContentLoaded', function() {
    // ========== ELEMENTOS DOM ==========
    
    // Elementos principais
    const profileImage = document.getElementById('profile-image');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const totalBudgets = document.getElementById('total-budgets');
    const memberSince = document.getElementById('member-since');
    
    // Formulários
    const personalForm = document.getElementById('personal-form');
    const socialForm = document.getElementById('social-form');
    const passwordForm = document.getElementById('password-form');
    
    // Botões de edição
    const editPersonalBtn = document.getElementById('edit-personal-btn');
    const editSocialBtn = document.getElementById('edit-social-btn');
    const changePasswordBtn = document.getElementById('change-password-btn');
    
    // Botões de cancelar/salvar
    const cancelPersonalBtn = document.getElementById('cancel-personal-btn');
    const savePersonalBtn = document.getElementById('save-personal-btn');
    const cancelSocialBtn = document.getElementById('cancel-social-btn');
    const saveSocialBtn = document.getElementById('save-social-btn');
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');
    const savePasswordBtn = document.getElementById('save-password-btn');
    
    // Modal de foto
    const photoUploadModal = document.getElementById('photo-upload-modal');
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const closePhotoModal = document.getElementById('close-photo-modal');
    const photoModalOverlay = document.getElementById('photo-upload-modal-overlay');
    const photoInput = document.getElementById('photo-input');
    const selectPhotoBtn = document.getElementById('select-photo-btn');
    const photoPreview = document.getElementById('photo-preview');
    const cancelPhotoBtn = document.getElementById('cancel-photo-btn');
    const savePhotoBtn = document.getElementById('save-photo-btn');
    
    // Modal de senha
    const passwordModal = document.getElementById('password-modal');
    const closePasswordModal = document.getElementById('close-password-modal');
    const passwordModalOverlay = document.getElementById('password-modal-overlay');
    
    // ========== VARIÁVEIS DE ESTADO ==========
    
    let userData = null;
    let isEditingPersonal = false;
    let isEditingSocial = false;
    let selectedPhotoFile = null;
    
    // ========== INICIALIZAÇÃO ==========
    
    init();
    
    function init() {
        loadUserData();
        setupEventListeners();
        console.log('Página de conta do decorador carregada!');
    }
    
    // ========== CARREGAMENTO DE DADOS ==========
    
    async function loadUserData() {
        try {
            const response = await fetch('../services/conta.php', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                userData = result.user;
                updateUserInterface(result.user, result.stats);
            } else {
                showNotification('Erro ao carregar dados: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showNotification('Erro ao carregar dados do usuário', 'error');
        }
    }
    
    function updateUserInterface(user, stats) {
        // Atualizar header
        if (userName) userName.textContent = user.nome;
        if (userEmail) userEmail.textContent = user.email;
        
        // Atualizar sidebar
        if (profileName) profileName.textContent = user.nome;
        if (profileEmail) profileEmail.textContent = user.email;
        
        // Atualizar foto de perfil
        if (profileImage) {
            if (user.foto_perfil) {
                profileImage.src = '../' + user.foto_perfil;
            } else {
                profileImage.src = '../assets/images/default-avatar.png';
            }
        }
        
        // Atualizar estatísticas
        if (totalBudgets) totalBudgets.textContent = stats.total_orcamentos || 0;
        if (memberSince) memberSince.textContent = stats.member_since || '-';
        
        // Atualizar formulário pessoal
        updatePersonalForm(user);
        
        // Atualizar formulário social
        updateSocialForm(user);
    }
    
    function updatePersonalForm(user) {
        const fields = ['name', 'email', 'phone', 'slug', 'bio'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.value = user[field] || '';
            }
        });
        
        // Atualizar especialidades
        updateSpecialties(user.especialidades || []);
    }
    
    function updateSocialForm(user) {
        const socialData = user.redes_sociais || {};
        const fields = ['instagram', 'facebook', 'whatsapp', 'website'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.value = socialData[field] || '';
            }
        });
    }
    
    function updateSpecialties(specialties) {
        const container = document.getElementById('specialties-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (specialties.length === 0) {
            container.innerHTML = '<span class="text-gray-500 text-sm">Nenhuma especialidade definida</span>';
            return;
        }
        
        specialties.forEach(specialty => {
            const tag = document.createElement('span');
            tag.className = 'px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full';
            tag.textContent = specialty;
            container.appendChild(tag);
        });
    }
    
    // ========== EVENT LISTENERS ==========
    
    function setupEventListeners() {
        // Botões de edição
        if (editPersonalBtn) {
            editPersonalBtn.addEventListener('click', () => togglePersonalEdit(true));
        }
        
        if (editSocialBtn) {
            editSocialBtn.addEventListener('click', () => toggleSocialEdit(true));
        }
        
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', openPasswordModal);
        }
        
        // Botões de cancelar
        if (cancelPersonalBtn) {
            cancelPersonalBtn.addEventListener('click', () => togglePersonalEdit(false));
        }
        
        if (cancelSocialBtn) {
            cancelSocialBtn.addEventListener('click', () => toggleSocialEdit(false));
        }
        
        // Botões de salvar
        if (savePersonalBtn) {
            savePersonalBtn.addEventListener('click', savePersonalData);
        }
        
        if (saveSocialBtn) {
            saveSocialBtn.addEventListener('click', saveSocialData);
        }
        
        // Modal de foto
        if (changePhotoBtn) {
            changePhotoBtn.addEventListener('click', openPhotoModal);
        }
        
        if (closePhotoModal) {
            closePhotoModal.addEventListener('click', closePhotoModalFunc);
        }
        
        if (photoModalOverlay) {
            photoModalOverlay.addEventListener('click', closePhotoModalFunc);
        }
        
        if (selectPhotoBtn) {
            selectPhotoBtn.addEventListener('click', () => photoInput.click());
        }
        
        if (photoInput) {
            photoInput.addEventListener('change', handlePhotoSelect);
        }
        
        if (cancelPhotoBtn) {
            cancelPhotoBtn.addEventListener('click', closePhotoModalFunc);
        }
        
        if (savePhotoBtn) {
            savePhotoBtn.addEventListener('click', savePhoto);
        }
        
        // Modal de senha
        if (closePasswordModal) {
            closePasswordModal.addEventListener('click', closePasswordModalFunc);
        }
        
        if (passwordModalOverlay) {
            passwordModalOverlay.addEventListener('click', closePasswordModalFunc);
        }
        
        if (cancelPasswordBtn) {
            cancelPasswordBtn.addEventListener('click', closePasswordModalFunc);
        }
        
        if (passwordForm) {
            passwordForm.addEventListener('submit', handlePasswordChange);
        }
        
        // Fechar modais com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (photoUploadModal && !photoUploadModal.classList.contains('hidden')) {
                    closePhotoModalFunc();
                }
                if (passwordModal && !passwordModal.classList.contains('hidden')) {
                    closePasswordModalFunc();
                }
            }
        });
    }
    
    // ========== FUNCIONALIDADES DE EDIÇÃO ==========
    
    function togglePersonalEdit(editing) {
        isEditingPersonal = editing;
        
        const fields = ['name', 'email', 'phone', 'slug', 'bio'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.readOnly = !editing;
                if (editing) {
                    element.classList.remove('bg-gray-100');
                    element.classList.add('bg-white');
                } else {
                    element.classList.add('bg-gray-100');
                    element.classList.remove('bg-white');
                }
            }
        });
        
        // Mostrar/ocultar botões
        if (editPersonalBtn) editPersonalBtn.classList.toggle('hidden', editing);
        if (cancelPersonalBtn) cancelPersonalBtn.classList.toggle('hidden', !editing);
        if (savePersonalBtn) savePersonalBtn.classList.toggle('hidden', !editing);
    }
    
    function toggleSocialEdit(editing) {
        isEditingSocial = editing;
        
        const fields = ['instagram', 'facebook', 'whatsapp', 'website'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.readOnly = !editing;
                if (editing) {
                    element.classList.remove('bg-gray-100');
                    element.classList.add('bg-white');
                } else {
                    element.classList.add('bg-gray-100');
                    element.classList.remove('bg-white');
                }
            }
        });
        
        // Mostrar/ocultar botões
        if (editSocialBtn) editSocialBtn.classList.toggle('hidden', editing);
        if (cancelSocialBtn) cancelSocialBtn.classList.toggle('hidden', !editing);
        if (saveSocialBtn) saveSocialBtn.classList.toggle('hidden', !editing);
    }
    
    // ========== SALVAMENTO DE DADOS ==========
    
    async function savePersonalData() {
        if (!personalForm) return;
        
        const formData = new FormData(personalForm);
        formData.append('action', 'update_personal');
        
        try {
            if (savePersonalBtn) {
                savePersonalBtn.classList.add('btn-loading');
                savePersonalBtn.disabled = true;
            }
            
            const response = await fetch('../services/conta.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Dados pessoais atualizados com sucesso!', 'success');
                togglePersonalEdit(false);
                await loadUserData(); // Recarregar dados
            } else {
                showNotification('Erro ao atualizar dados: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar dados pessoais:', error);
            showNotification('Erro ao salvar dados pessoais', 'error');
        } finally {
            if (savePersonalBtn) {
                savePersonalBtn.classList.remove('btn-loading');
                savePersonalBtn.disabled = false;
            }
        }
    }
    
    async function saveSocialData() {
        if (!socialForm) return;
        
        const formData = new FormData(socialForm);
        formData.append('action', 'update_social');
        
        try {
            if (saveSocialBtn) {
                saveSocialBtn.classList.add('btn-loading');
                saveSocialBtn.disabled = true;
            }
            
            const response = await fetch('../services/conta.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Redes sociais atualizadas com sucesso!', 'success');
                toggleSocialEdit(false);
                await loadUserData(); // Recarregar dados
            } else {
                showNotification('Erro ao atualizar redes sociais: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar redes sociais:', error);
            showNotification('Erro ao salvar redes sociais', 'error');
        } finally {
            if (saveSocialBtn) {
                saveSocialBtn.classList.remove('btn-loading');
                saveSocialBtn.disabled = false;
            }
        }
    }
    
    // ========== MODAL DE FOTO ==========
    
    function openPhotoModal() {
        if (photoUploadModal) {
            photoUploadModal.classList.remove('hidden');
            photoUploadModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closePhotoModalFunc() {
        if (photoUploadModal) {
            photoUploadModal.classList.add('hidden');
            photoUploadModal.classList.remove('show');
            document.body.style.overflow = 'auto';
            
            // Resetar
            selectedPhotoFile = null;
            if (photoInput) photoInput.value = '';
            if (photoPreview) {
                photoPreview.classList.add('hidden');
                photoPreview.src = '';
            }
            if (savePhotoBtn) savePhotoBtn.disabled = true;
        }
    }
    
    function handlePhotoSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validar arquivo
        if (!file.type.startsWith('image/')) {
            showNotification('Por favor, selecione apenas arquivos de imagem', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showNotification('A imagem deve ter no máximo 5MB', 'error');
            return;
        }
        
        selectedPhotoFile = file;
        
        // Mostrar preview
        const reader = new FileReader();
        reader.onload = function(e) {
            if (photoPreview) {
                photoPreview.src = e.target.result;
                photoPreview.classList.remove('hidden');
            }
            if (savePhotoBtn) savePhotoBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
    
    async function savePhoto() {
        if (!selectedPhotoFile) return;
        
        const formData = new FormData();
        formData.append('profile_photo', selectedPhotoFile);
        
        try {
            if (savePhotoBtn) {
                savePhotoBtn.classList.add('btn-loading');
                savePhotoBtn.disabled = true;
            }
            
            const response = await fetch('../services/conta.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Foto de perfil atualizada com sucesso!', 'success');
                closePhotoModalFunc();
                await loadUserData(); // Recarregar dados
            } else {
                showNotification('Erro ao atualizar foto: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar foto:', error);
            showNotification('Erro ao salvar foto', 'error');
        } finally {
            if (savePhotoBtn) {
                savePhotoBtn.classList.remove('btn-loading');
                savePhotoBtn.disabled = false;
            }
        }
    }
    
    // ========== MODAL DE SENHA ==========
    
    function openPasswordModal() {
        if (passwordModal) {
            passwordModal.classList.remove('hidden');
            passwordModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closePasswordModalFunc() {
        if (passwordModal) {
            passwordModal.classList.add('hidden');
            passwordModal.classList.remove('show');
            document.body.style.overflow = 'auto';
            
            // Resetar formulário
            if (passwordForm) passwordForm.reset();
        }
    }
    
    async function handlePasswordChange(e) {
        e.preventDefault();
        
        const formData = new FormData(passwordForm);
        formData.append('action', 'change_password');
        
        try {
            if (savePasswordBtn) {
                savePasswordBtn.classList.add('btn-loading');
                savePasswordBtn.disabled = true;
            }
            
            const response = await fetch('../services/conta.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Senha alterada com sucesso!', 'success');
                closePasswordModalFunc();
            } else {
                showNotification('Erro ao alterar senha: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            showNotification('Erro ao alterar senha', 'error');
        } finally {
            if (savePasswordBtn) {
                savePasswordBtn.classList.remove('btn-loading');
                savePasswordBtn.disabled = false;
            }
        }
    }
    
    // ========== SISTEMA DE NOTIFICAÇÕES ==========
    
    function showNotification(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `px-6 py-4 rounded-lg shadow-lg text-white transform transition-all duration-300 translate-x-full`;
        
        // Cores baseadas no tipo
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500');
                break;
            case 'error':
                notification.classList.add('bg-red-500');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500');
                break;
            default:
                notification.classList.add('bg-blue-500');
        }
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation' : 'info'}-circle mr-3"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remover após 5 segundos
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
});
