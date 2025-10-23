# 🧩 Componentes Reutilizáveis - Up.Baloes

Esta pasta contém todos os componentes reutilizáveis do sistema Up.Baloes, organizados por categoria para facilitar a manutenção e reutilização.

## 📁 Estrutura de Componentes

### 🎨 **UI Components**
- `buttons/` - Botões reutilizáveis
- `cards/` - Cards e containers
- `forms/` - Formulários e campos
- `modals/` - Modais e popups
- `navigation/` - Elementos de navegação

### 🔧 **Functional Components**
- `auth/` - Componentes de autenticação
- `dashboard/` - Componentes do dashboard
- `budget/` - Componentes de orçamento
- `user/` - Componentes de usuário

### 📱 **Layout Components**
- `layout/` - Estruturas de layout
- `sidebar/` - Sidebars e menus
- `header/` - Cabeçalhos
- `footer/` - Rodapés

## 🚀 Como Usar

### 1. **Incluir Componente**
```html
<!-- Incluir componente -->
<script src="../components/buttons/primary-button.js"></script>
```

### 2. **Usar em HTML**
```html
<!-- Usar componente -->
<div id="primary-button-container"></div>
<script>
    createPrimaryButton('container-id', {
        text: 'Salvar',
        icon: 'fas fa-save',
        onClick: function() { /* ação */ }
    });
</script>
```

### 3. **Usar em JavaScript**
```javascript
// Importar e usar
import { createModal } from '../components/modals/confirmation-modal.js';

const modal = createModal({
    title: 'Confirmar Ação',
    message: 'Tem certeza?',
    onConfirm: () => { /* ação */ }
});
```

## 📋 Lista de Componentes

### 🎨 **UI Components**

#### Buttons
- `primary-button.js` - Botão primário
- `secondary-button.js` - Botão secundário
- `floating-button.js` - Botão flutuante
- `icon-button.js` - Botão com ícone

#### Cards
- `info-card.js` - Card de informações
- `metric-card.js` - Card de métricas
- `service-card.js` - Card de serviço
- `budget-card.js` - Card de orçamento

#### Forms
- `input-field.js` - Campo de entrada
- `select-field.js` - Campo de seleção
- `textarea-field.js` - Campo de texto
- `file-upload.js` - Upload de arquivo
- `form-validator.js` - Validador de formulário

#### Modals
- `confirmation-modal.js` - Modal de confirmação
- `form-modal.js` - Modal de formulário
- `image-modal.js` - Modal de imagem
- `loading-modal.js` - Modal de carregamento

### 🔧 **Functional Components**

#### Auth
- `login-form.js` - Formulário de login
- `register-form.js` - Formulário de cadastro
- `password-reset.js` - Reset de senha

#### Dashboard
- `stats-widget.js` - Widget de estatísticas
- `chart-widget.js` - Widget de gráfico
- `notification-widget.js` - Widget de notificações

#### Budget
- `budget-form.js` - Formulário de orçamento
- `budget-list.js` - Lista de orçamentos
- `budget-details.js` - Detalhes do orçamento

#### User
- `user-profile.js` - Perfil do usuário
- `user-settings.js` - Configurações do usuário
- `user-avatar.js` - Avatar do usuário

### 📱 **Layout Components**

#### Layout
- `main-layout.js` - Layout principal
- `grid-layout.js` - Layout em grid
- `flex-layout.js` - Layout flexível

#### Navigation
- `navbar.js` - Barra de navegação
- `sidebar.js` - Barra lateral
- `breadcrumb.js` - Navegação estrutural
- `pagination.js` - Paginação

## 🎯 Benefícios

- ✅ **Reutilização** - Componentes usados em múltiplas páginas
- ✅ **Manutenção** - Alterações centralizadas
- ✅ **Consistência** - Design uniforme
- ✅ **Performance** - Código otimizado
- ✅ **Escalabilidade** - Fácil adição de novos componentes

## 🚀 Início Rápido

### 1. **Incluir Componentes**
```html
<!-- Incluir todos os componentes -->
<script src="../components/index.js"></script>

<!-- Ou incluir componentes específicos -->
<script src="../components/buttons/primary-button.js"></script>
<script src="../components/modals/confirmation-modal.js"></script>
```

### 2. **Usar em HTML**
```html
<!-- Container para o componente -->
<div id="my-button"></div>

<script>
// Criar botão primário
createPrimaryButton('my-button', {
    text: 'Salvar',
    icon: 'fas fa-save',
    variant: 'blue',
    onClick: function() {
        alert('Botão clicado!');
    }
});
</script>
```

### 3. **Usar em JavaScript**
```javascript
// Importar componentes específicos
import { createPrimaryButton, showConfirmation } from '../components/index.js';

// Criar botão
const button = createPrimaryButton('container-id', {
    text: 'Confirmar',
    onClick: () => {
        showConfirmation('Tem certeza?', 'Esta ação não pode ser desfeita.');
    }
});
```

## 🎨 Temas e Configurações

### Aplicar Tema
```javascript
// Aplicar tema escuro
applyTheme('dark');

// Aplicar tema colorido
applyTheme('colorful');

// Usar tema padrão
applyTheme('default');
```

### Configurações Personalizadas
```javascript
// Obter configuração responsiva atual
const config = getResponsiveConfig();

// Obter ícone padrão
const icon = getDefaultIcon('save', 'buttons');

// Obter mensagem de erro
const message = getErrorMessage('required');
```

## 📝 Convenções

### Nomenclatura
- **Arquivos:** `kebab-case.js`
- **Funções:** `camelCase`
- **Constantes:** `UPPER_CASE`

### Estrutura
```javascript
// Estrutura padrão de componente
function createComponentName(options = {}) {
    // Configurações padrão
    const defaults = {
        // configurações padrão
    };
    
    // Mesclar opções
    const config = { ...defaults, ...options };
    
    // Criar elemento
    const element = document.createElement('div');
    
    // Configurar elemento
    // ...
    
    // Retornar elemento
    return element;
}

// Exportar função
export { createComponentName };
```

## 🔧 Exemplos Práticos

### Formulário de Login
```javascript
// Criar campos do formulário
const emailField = createEmailField('login-form', {
    label: 'Email',
    required: true,
    placeholder: 'Digite seu email'
});

const passwordField = createPasswordField('login-form', {
    label: 'Senha',
    required: true,
    placeholder: 'Digite sua senha'
});

// Criar botão de login
createPrimaryButton('login-form', {
    text: 'Entrar',
    icon: 'fas fa-sign-in-alt',
    variant: 'blue',
    onClick: handleLogin
});
```

### Dashboard com Cards
```javascript
// Card de métrica
createMetricCard('dashboard', {
    title: 'Vendas do Mês',
    content: '<div class="text-3xl font-bold text-green-600">R$ 15.420,00</div>',
    icon: 'fas fa-chart-line',
    iconColor: 'green'
});

// Card de informações
createInfoCard('dashboard', {
    title: 'Novos Clientes',
    subtitle: 'Este mês',
    content: '15 novos clientes cadastrados',
    icon: 'fas fa-users',
    iconColor: 'blue'
});
```

### Sidebar de Navegação
```javascript
createSidebar('main-sidebar', {
    title: 'Menu Principal',
    logoText: 'Up.Baloes',
    items: [
        { text: 'Dashboard', icon: 'fas fa-home', module: 'dashboard' },
        { text: 'Orçamentos', icon: 'fas fa-file-invoice', module: 'budgets' },
        { text: 'Clientes', icon: 'fas fa-users', module: 'clients' }
    ],
    user: {
        name: 'João Silva',
        email: 'joao@exemplo.com'
    }
});
```

---

**Sistema de componentes modular e reutilizável!** 🎈
