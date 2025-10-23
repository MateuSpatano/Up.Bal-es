/**
 * 🎯 Configuração dos Componentes - Up.Baloes
 * Configurações globais e temas para os componentes
 */

// Configurações globais
const ComponentConfig = {
    // Tema padrão
    theme: {
        primary: {
            color: 'blue',
            classes: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        },
        secondary: {
            color: 'gray',
            classes: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
        },
        success: {
            color: 'green',
            classes: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        },
        danger: {
            color: 'red',
            classes: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        },
        warning: {
            color: 'yellow',
            classes: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        },
        info: {
            color: 'blue',
            classes: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
    },
    
    // Configurações de animação
    animations: {
        duration: '300ms',
        easing: 'ease-in-out',
        scale: {
            hover: '1.05',
            active: '0.95'
        }
    },
    
    // Configurações de tamanho
    sizes: {
        small: {
            padding: 'px-3 py-2',
            text: 'text-sm',
            icon: 'text-sm'
        },
        medium: {
            padding: 'px-4 py-3',
            text: 'text-base',
            icon: 'text-lg'
        },
        large: {
            padding: 'px-6 py-4',
            text: 'text-lg',
            icon: 'text-xl'
        }
    },
    
    // Configurações de validação
    validation: {
        showErrors: true,
        highlightFields: true,
        validateOnSubmit: true,
        validateOnBlur: true,
        validateOnInput: false
    },
    
    // Configurações de notificação
    notifications: {
        position: 'top-right',
        duration: 5000,
        maxVisible: 5,
        animation: 'slide-in'
    },
    
    // Configurações de modal
    modals: {
        overlay: true,
        closable: true,
        animation: 'fade-in',
        zIndex: 50
    },
    
    // Configurações de sidebar
    sidebar: {
        collapsible: true,
        position: 'left',
        variant: 'default',
        size: 'medium'
    }
};

// Temas predefinidos
const Themes = {
    default: {
        primary: 'blue',
        secondary: 'gray',
        success: 'green',
        danger: 'red',
        warning: 'yellow',
        info: 'blue'
    },
    
    dark: {
        primary: 'purple',
        secondary: 'gray',
        success: 'green',
        danger: 'red',
        warning: 'yellow',
        info: 'blue'
    },
    
    colorful: {
        primary: 'purple',
        secondary: 'pink',
        success: 'green',
        danger: 'red',
        warning: 'orange',
        info: 'blue'
    }
};

// Configurações de ícones
const IconConfig = {
    // Ícones padrão para cada tipo de componente
    buttons: {
        primary: 'fas fa-check',
        secondary: 'fas fa-times',
        save: 'fas fa-save',
        edit: 'fas fa-edit',
        delete: 'fas fa-trash',
        add: 'fas fa-plus',
        search: 'fas fa-search',
        filter: 'fas fa-filter',
        sort: 'fas fa-sort',
        refresh: 'fas fa-sync',
        download: 'fas fa-download',
        upload: 'fas fa-upload'
    },
    
    fields: {
        text: 'fas fa-font',
        email: 'fas fa-envelope',
        password: 'fas fa-lock',
        phone: 'fas fa-phone',
        date: 'fas fa-calendar',
        time: 'fas fa-clock',
        number: 'fas fa-hashtag',
        url: 'fas fa-link',
        file: 'fas fa-file',
        image: 'fas fa-image'
    },
    
    cards: {
        info: 'fas fa-info-circle',
        metric: 'fas fa-chart-bar',
        service: 'fas fa-briefcase',
        budget: 'fas fa-file-invoice',
        user: 'fas fa-user',
        notification: 'fas fa-bell'
    },
    
    navigation: {
        home: 'fas fa-home',
        dashboard: 'fas fa-tachometer-alt',
        users: 'fas fa-users',
        settings: 'fas fa-cog',
        help: 'fas fa-question-circle',
        logout: 'fas fa-sign-out-alt'
    }
};

// Configurações de validação predefinidas
const ValidationConfig = {
    // Mensagens de erro padrão
    messages: {
        required: 'Este campo é obrigatório',
        email: 'Email inválido',
        phone: 'Telefone inválido',
        minLength: 'Deve ter pelo menos {min} caracteres',
        maxLength: 'Deve ter no máximo {max} caracteres',
        min: 'Valor mínimo: {min}',
        max: 'Valor máximo: {max}',
        pattern: 'Formato inválido',
        password: 'Senha deve ter pelo menos 8 caracteres, com letras maiúsculas, minúsculas e números',
        confirmPassword: 'Senhas não coincidem',
        cpf: 'CPF inválido',
        cnpj: 'CNPJ inválido',
        url: 'URL inválida',
        date: 'Data inválida',
        time: 'Hora inválida'
    },
    
    // Padrões de validação
    patterns: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
        cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
        url: /^https?:\/\/.+/,
        date: /^\d{2}\/\d{2}\/\d{4}$/,
        time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
};

// Configurações de responsividade
const ResponsiveConfig = {
    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
    },
    
    // Configurações para cada breakpoint
    configs: {
        mobile: {
            sidebar: {
                collapsible: true,
                collapsed: true,
                overlay: true
            },
            buttons: {
                size: 'medium',
                fullWidth: true
            },
            cards: {
                size: 'medium',
                stacked: true
            }
        },
        
        tablet: {
            sidebar: {
                collapsible: true,
                collapsed: false,
                overlay: false
            },
            buttons: {
                size: 'medium',
                fullWidth: false
            },
            cards: {
                size: 'medium',
                stacked: false
            }
        },
        
        desktop: {
            sidebar: {
                collapsible: true,
                collapsed: false,
                overlay: false
            },
            buttons: {
                size: 'medium',
                fullWidth: false
            },
            cards: {
                size: 'large',
                stacked: false
            }
        }
    }
};

// Função para aplicar tema
function applyTheme(themeName) {
    const theme = Themes[themeName];
    if (!theme) {
        console.warn(`Tema '${themeName}' não encontrado. Usando tema padrão.`);
        return;
    }
    
    // Atualizar configurações globais
    Object.assign(ComponentConfig.theme, theme);
    
    // Aplicar classes CSS personalizadas
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
    });
    
    console.log(`Tema '${themeName}' aplicado com sucesso!`);
}

// Função para obter configuração responsiva
function getResponsiveConfig() {
    const width = window.innerWidth;
    
    if (width < 640) {
        return ResponsiveConfig.configs.mobile;
    } else if (width < 1024) {
        return ResponsiveConfig.configs.tablet;
    } else {
        return ResponsiveConfig.configs.desktop;
    }
}

// Função para obter ícone padrão
function getDefaultIcon(type, category) {
    return IconConfig[category]?.[type] || 'fas fa-question-circle';
}

// Função para obter mensagem de erro
function getErrorMessage(type, params = {}) {
    let message = ValidationConfig.messages[type] || 'Erro de validação';
    
    // Substituir parâmetros na mensagem
    Object.entries(params).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, value);
    });
    
    return message;
}

// Função para obter padrão de validação
function getValidationPattern(type) {
    return ValidationConfig.patterns[type] || null;
}

// Exportar configurações
export {
    ComponentConfig,
    Themes,
    IconConfig,
    ValidationConfig,
    ResponsiveConfig,
    applyTheme,
    getResponsiveConfig,
    getDefaultIcon,
    getErrorMessage,
    getValidationPattern
};

// Para uso direto no HTML
window.ComponentConfig = ComponentConfig;
window.Themes = Themes;
window.IconConfig = IconConfig;
window.ValidationConfig = ValidationConfig;
window.ResponsiveConfig = ResponsiveConfig;
window.applyTheme = applyTheme;
window.getResponsiveConfig = getResponsiveConfig;
window.getDefaultIcon = getDefaultIcon;
window.getErrorMessage = getErrorMessage;
window.getValidationPattern = getValidationPattern;
