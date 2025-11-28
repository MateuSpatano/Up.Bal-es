// Sistema de cadastro Up.Baloes
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos do formulário
    const cadastroForm = document.getElementById('cadastro-form');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');
    const enderecoInput = document.getElementById('endereco');
    const cidadeInput = document.getElementById('cidade');
    const estadoInput = document.getElementById('estado');
    const cepInput = document.getElementById('cep');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmar-senha');
    const aceitarTermosInput = document.getElementById('aceitar-termos');
    const toggleSenhaBtn = document.getElementById('toggle-senha');
    const toggleConfirmarSenhaBtn = document.getElementById('toggle-confirmar-senha');
    const cadastroBtn = document.getElementById('cadastro-btn');
    const cadastroBtnText = document.getElementById('cadastro-btn-text');
    const cadastroSpinner = document.getElementById('cadastro-spinner');
    const messageContainer = document.getElementById('message-container');
    const message = document.getElementById('message');
    
    // Estado dos campos
    let isSenhaVisible = false;
    let isConfirmarSenhaVisible = false;
    let isLoading = false;

    // Toggle de visibilidade da senha
    toggleSenhaBtn.addEventListener('click', function() {
        isSenhaVisible = !isSenhaVisible;
        
        if (isSenhaVisible) {
            senhaInput.type = 'text';
            toggleSenhaBtn.innerHTML = '<i class="fas fa-eye-slash text-gray-400 hover:text-blue-500 transition-colors duration-200"></i>';
        } else {
            senhaInput.type = 'password';
            toggleSenhaBtn.innerHTML = '<i class="fas fa-eye text-gray-400 hover:text-blue-500 transition-colors duration-200"></i>';
        }
    });

    // Toggle de visibilidade da confirmação de senha
    toggleConfirmarSenhaBtn.addEventListener('click', function() {
        isConfirmarSenhaVisible = !isConfirmarSenhaVisible;
        
        if (isConfirmarSenhaVisible) {
            confirmarSenhaInput.type = 'text';
            toggleConfirmarSenhaBtn.innerHTML = '<i class="fas fa-eye-slash text-gray-400 hover:text-blue-500 transition-colors duration-200"></i>';
        } else {
            confirmarSenhaInput.type = 'password';
            toggleConfirmarSenhaBtn.innerHTML = '<i class="fas fa-eye text-gray-400 hover:text-blue-500 transition-colors duration-200"></i>';
        }
    });

    // Máscara para telefone
    telefoneInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            if (value.length < 14) {
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            }
        }
        this.value = value;
    });

    // Máscara para CEP
    cepInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length <= 8) {
            value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
        this.value = value;
    });

    // Validação em tempo real
    nomeInput.addEventListener('input', function() {
        validateNome(this);
    });

    emailInput.addEventListener('input', function() {
        validateEmail(this);
    });

    telefoneInput.addEventListener('input', function() {
        validateTelefone(this);
    });

    senhaInput.addEventListener('input', function() {
        validateSenha(this);
        if (confirmarSenhaInput.value) {
            validateConfirmarSenha(confirmarSenhaInput);
        }
    });

    confirmarSenhaInput.addEventListener('input', function() {
        validateConfirmarSenha(this);
    });

    // Função de validação de nome
    function validateNome(input) {
        const nome = input.value.trim();
        
        if (nome === '') {
            removeValidationClasses(input);
            return false;
        }
        
        if (nome.length >= 2) {
            addValidationClass(input, 'success');
            return true;
        } else {
            addValidationClass(input, 'error');
            return false;
        }
    }

    // Função de validação de email
    function validateEmail(input) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email === '') {
            removeValidationClasses(input);
            return false;
        }
        
        if (emailRegex.test(email)) {
            addValidationClass(input, 'success');
            return true;
        } else {
            addValidationClass(input, 'error');
            return false;
        }
    }

    // Função de validação de telefone
    function validateTelefone(input) {
        const telefone = input.value.replace(/\D/g, '');
        
        if (telefone === '') {
            removeValidationClasses(input);
            return true; // Telefone é opcional
        }
        
        if (telefone.length >= 10) {
            addValidationClass(input, 'success');
            return true;
        } else {
            addValidationClass(input, 'error');
            return false;
        }
    }

    // Função de validação de senha
    function validateSenha(input) {
        const senha = input.value;
        
        if (senha === '') {
            removeValidationClasses(input);
            return false;
        }
        
        if (senha.length >= 6) {
            addValidationClass(input, 'success');
            return true;
        } else {
            addValidationClass(input, 'error');
            return false;
        }
    }

    // Função de validação de confirmação de senha
    function validateConfirmarSenha(input) {
        const confirmarSenha = input.value;
        const senha = senhaInput.value;
        
        if (confirmarSenha === '') {
            removeValidationClasses(input);
            return false;
        }
        
        if (confirmarSenha === senha && senha.length >= 6) {
            addValidationClass(input, 'success');
            return true;
        } else {
            addValidationClass(input, 'error');
            return false;
        }
    }

    // Funções de validação visual
    function addValidationClass(input, type) {
        input.classList.remove('input-error', 'input-success');
        input.classList.add(`input-${type}`);
    }

    function removeValidationClasses(input) {
        input.classList.remove('input-error', 'input-success');
    }

    // ========== SUBMISSÃO DO FORMULÁRIO ==========
    
    cadastroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isLoading) return;
        
        // Validação dos campos obrigatórios
        const isNomeValid = validateNome(nomeInput);
        const isEmailValid = validateEmail(emailInput);
        const isSenhaValid = validateSenha(senhaInput);
        const isConfirmarSenhaValid = validateConfirmarSenha(confirmarSenhaInput);
        const isTermosAceitos = aceitarTermosInput.checked;
        
        if (!isNomeValid || !isEmailValid || !isSenhaValid || !isConfirmarSenhaValid) {
            showMessage('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
            return;
        }
        
        if (!isTermosAceitos) {
            showMessage('Você deve aceitar os termos e condições para continuar.', 'error');
            return;
        }
        
        // Dados do formulário
        const formData = {
            nome: nomeInput.value.trim(),
            email: emailInput.value.trim(),
            telefone: telefoneInput.value.trim(),
            endereco: enderecoInput.value.trim(),
            cidade: cidadeInput.value.trim(),
            estado: estadoInput.value,
            cep: cepInput.value.trim(),
            senha: senhaInput.value
        };
        
        // Iniciar loading
        setLoadingState(true);
        
        try {
            // Chamada para o backend PHP
            const response = await cadastrarUsuario(formData);
            
            if (response.success) {
                showMessage('Conta criada com sucesso! Redirecionando para a página inicial...', 'success');
                
                // Verificar se há parâmetro de retorno na URL
                const urlParams = new URLSearchParams(window.location.search);
                const returnUrl = urlParams.get('return');
                
                // Redirecionamento após 3 segundos
                setTimeout(() => {
                    // Se houver URL de retorno, redirecionar para ela
                    if (returnUrl) {
                        window.location.href = decodeURIComponent(returnUrl);
                    } else if (typeof contextSlug !== 'undefined' && contextSlug && contextSlug !== '') {
                        // Se houver contextSlug (vindo de uma página do decorador), redirecionar para lá
                        const baseUrl = (typeof window.BASE_URL !== 'undefined' && window.BASE_URL) ? window.BASE_URL : '/Up.Bal-es/';
                        window.location.href = baseUrl + contextSlug + '/';
                    } else {
                        window.location.href = '../index.html';
                    }
                }, 3000);
                
            } else {
                showMessage(response.message || 'Erro ao criar conta. Tente novamente.', 'error');
            }
            
        } catch (error) {
            console.error('Erro no cadastro:', error);
            showMessage('Erro de conexão. Tente novamente.', 'error');
        } finally {
            setLoadingState(false);
        }
    });

    // ========== FUNÇÕES AUXILIARES ==========
    
    // Definir estado de loading
    function setLoadingState(loading) {
        isLoading = loading;
        
        if (loading) {
            cadastroBtn.disabled = true;
            cadastroBtnText.classList.add('hidden');
            cadastroSpinner.classList.remove('hidden');
            cadastroBtn.classList.add('opacity-75', 'cursor-not-allowed');
        } else {
            cadastroBtn.disabled = false;
            cadastroBtnText.classList.remove('hidden');
            cadastroSpinner.classList.add('hidden');
            cadastroBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    }

    // Mostrar mensagem
    function showMessage(text, type) {
        message.textContent = text;
        messageContainer.className = 'block';
        message.className = `rounded-lg p-4 text-sm font-medium message-${type}`;
        
        // Auto-hide após 5 segundos
        setTimeout(() => {
            messageContainer.classList.add('hidden');
        }, 5000);
    }

    // ========== INTEGRAÇÃO COM BACKEND PHP ==========
    
    // Função para cadastrar usuário
    async function cadastrarUsuario(formData) {
        try {
            const response = await fetch('../services/cadastro.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'cadastrar',
                    ...formData
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    // ========== INICIALIZAÇÃO ==========
    
    // Aplicar scroll transparente
    applyTransparentScroll();
    
    // Adicionar efeitos visuais
    addVisualEffects();

    // ========== SCROLL TRANSPARENTE ==========
    
    function applyTransparentScroll() {
        // Aplicar scroll transparente via JavaScript
        const style = document.createElement('style');
        style.textContent = `
            /* Scroll transparente universal */
            * {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
            }
            
            *::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
                background: transparent !important;
            }
            
            *::-webkit-scrollbar-track {
                display: none !important;
                background: transparent !important;
            }
            
            *::-webkit-scrollbar-thumb {
                display: none !important;
                background: transparent !important;
            }
            
            *::-webkit-scrollbar-corner {
                display: none !important;
                background: transparent !important;
            }
            
            html, body {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
            }
            
            html::-webkit-scrollbar,
            body::-webkit-scrollbar {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        
        // Forçar reaplicação em elementos dinâmicos
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            node.style.scrollbarWidth = 'none';
                            node.style.msOverflowStyle = 'none';
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // ========== EFEITOS VISUAIS ==========
    
    function addVisualEffects() {
        // Efeito de partículas
        createParticles();
        
        // Animação de entrada do formulário
        cadastroForm.classList.add('fade-in-up');
        
        // Efeito de ripple nos botões
        document.querySelectorAll('button').forEach(button => {
            button.classList.add('ripple-effect');
        });
    }

    // Criar partículas animadas
    function createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        document.getElementById('animated-background').appendChild(particlesContainer);
        
        // Criar partículas
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                createParticle(particlesContainer);
            }, i * 200);
        }
        
        // Continuar criando partículas
        setInterval(() => {
            createParticle(particlesContainer);
        }, 3000);
    }

    function createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        
        container.appendChild(particle);
        
        // Remover partícula após animação
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 8000);
    }

    console.log('Cadastro page loaded successfully!');
});
