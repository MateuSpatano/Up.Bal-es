document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') ? params.get('token').trim() : '';
    
    const form = document.getElementById('reset-password-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const submitBtn = document.getElementById('reset-submit-btn');
    const statusMessage = document.getElementById('status-message');
    const statusMessageContent = document.getElementById('status-message-content');
    const resetDescription = document.getElementById('reset-description');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    let isSubmitting = false;
    
    function showStatusMessage(text, type = 'info') {
        const styles = {
            success: 'bg-green-100 text-green-700 border border-green-200',
            error: 'bg-red-100 text-red-700 border border-red-200',
            warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
            info: 'bg-blue-100 text-blue-700 border border-blue-200'
        };
        
        statusMessageContent.textContent = text;
        statusMessageContent.className = `rounded-lg px-4 py-3 text-sm font-medium ${styles[type] || styles.info}`;
        statusMessage.classList.remove('hidden');
    }
    
    function setFormEnabled(enabled) {
        newPasswordInput.disabled = !enabled;
        confirmPasswordInput.disabled = !enabled;
        submitBtn.disabled = !enabled;
    }
    
    function togglePasswordVisibility(button) {
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input.type === 'password') {
            input.type = 'text';
            button.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            input.type = 'password';
            button.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }
    
    passwordToggles.forEach(button => {
        button.addEventListener('click', () => togglePasswordVisibility(button));
    });
    
    if (!token) {
        showStatusMessage('Token de recuperação ausente. Solicite uma nova recuperação de senha.', 'error');
        setFormEnabled(false);
        return;
    }
    
    async function validateToken() {
        try {
            const response = await fetch('../services/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'validate_reset_token',
                    token
                })
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Token inválido ou expirado.');
            }
            
            if (result.data && result.data.name) {
                resetDescription.textContent = `Crie uma nova senha para ${result.data.email}.`;
            }
            
            showStatusMessage('Token validado. Informe sua nova senha.', 'success');
        } catch (error) {
            console.error('Erro ao validar token:', error);
            showStatusMessage(error.message || 'Token inválido ou expirado. Solicite uma nova recuperação.', 'error');
            setFormEnabled(false);
        }
    }
    
    function validatePasswords() {
        const password = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        
        if (!password || !confirmPassword) {
            showStatusMessage('Informe e confirme a nova senha.', 'warning');
            return false;
        }
        
        if (password.length < 8) {
            showStatusMessage('A senha deve ter pelo menos 8 caracteres.', 'warning');
            return false;
        }
        
        if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
            showStatusMessage('A senha deve conter letras e números.', 'warning');
            return false;
        }
        
        if (password !== confirmPassword) {
            showStatusMessage('As senhas informadas não coincidem.', 'warning');
            return false;
        }
        
        return true;
    }
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (isSubmitting) {
            return;
        }
        
        if (!validatePasswords()) {
            return;
        }
        
        isSubmitting = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Redefinindo...</span>';
        
        try {
            const response = await fetch('../services/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'set_new_password',
                    token,
                    password: newPasswordInput.value.trim(),
                    confirm_password: confirmPasswordInput.value.trim()
                })
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Não foi possível redefinir a senha.');
            }
            
            showStatusMessage(result.message || 'Senha redefinida com sucesso! Redirecionando para o login...', 'success');
            setFormEnabled(false);
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            showStatusMessage(error.message || 'Erro interno. Tente novamente mais tarde.', 'error');
        } finally {
            isSubmitting = false;
            submitBtn.innerHTML = '<i class="fas fa-check-circle"></i><span>Redefinir senha</span>';
        }
    });
    
    validateToken();
});





