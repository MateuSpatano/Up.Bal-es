# 🎯 Área Administrativa - Up.Baloes

## 📋 Visão Geral

A área administrativa do sistema Up.Baloes foi desenvolvida para permitir que administradores gerenciem decoradores, supervisionem o uso da plataforma e tenham controle total sobre o sistema.

## 🚀 Como Acessar

### 1. Acesso via Menu Principal
- Acesse a página principal (`index.html`)
- Clique no menu do usuário (ícone de usuário no canto superior direito)
- Selecione "Área Administrativa"

### 2. Login Administrativo
- **URL:** `pages/admin-login.html`
- **Credenciais de Demonstração:**
  - **Email:** `admin@upbaloes.com`
  - **Senha:** `admin123`

## 🎛️ Funcionalidades Implementadas

### 1. 📊 Dashboard de Visão Geral
- **Métricas Principais:**
  - Total de Clientes Cadastrados
  - Total de Decoradores Ativos
  - Total de Solicitações de Orçamento
  - Total de Serviços Criados

- **Gráficos Interativos:**
  - Gráfico de linha: Solicitações por mês
  - Gráfico de pizza: Distribuição de usuários por tipo

- **Atividades Recentes:**
  - Timeline de ações realizadas no sistema
  - Status visual com ícones coloridos

### 2. 👤 Criação de Contas de Decoradores
- **Formulário Completo:**
  - Nome completo (obrigatório)
  - CPF com validação (obrigatório)
  - E-mail com validação (obrigatório)
  - Telefone com máscara (obrigatório)
  - Endereço completo (obrigatório)
  - Senha segura (obrigatório)

- **Validações Implementadas:**
  - Validação de CPF com algoritmo oficial
  - Validação de e-mail
  - Verificação de e-mail duplicado
  - Senha mínima de 8 caracteres
  - Máscaras automáticas para CPF e telefone

### 3. 👥 Gerenciamento de Usuários
- **Listagem Completa:**
  - Visualização de todos os usuários (clientes e decoradores)
  - Informações: Nome, e-mail, tipo, status, data de cadastro
  - Avatar padrão para cada usuário

- **Ações Disponíveis:**
  - ✏️ **Editar:** Modificar dados do usuário
  - 🔄 **Ativar/Desativar:** Alternar status da conta
  - 🗑️ **Excluir:** Remover usuário do sistema

- **Filtros e Busca:**
  - Busca por nome ou e-mail
  - Filtro por tipo de usuário (Cliente/Decorador)
  - Filtro por status (Ativo/Inativo)
  - Paginação com navegação

### 4. 🔍 Sistema de Busca e Filtros
- **Busca Inteligente:**
  - Busca em tempo real
  - Pesquisa por nome ou e-mail
  - Resultados instantâneos

- **Filtros Avançados:**
  - Por tipo de usuário
  - Por status da conta
  - Combinação de filtros

### 5. 🔐 Segurança e Controle
- **Autenticação:**
  - Verificação de perfil admin obrigatória
  - Redirecionamento automático se não autorizado
  - Sessão persistente no localStorage

- **Controle de Acesso:**
  - Apenas usuários com role "admin" podem acessar
  - Verificação em tempo real
  - Logout seguro com confirmação

## 🎨 Interface e Design

### Design System
- **Cores Principais:**
  - Azul: `#1e3a8a` (Primary)
  - Verde: `#10b981` (Success)
  - Amarelo: `#f59e0b` (Warning)
  - Vermelho: `#ef4444` (Danger)

- **Componentes:**
  - Cards com sombras e hover effects
  - Botões com gradientes e animações
  - Modais responsivos
  - Tabelas com hover states
  - Notificações toast

### Responsividade
- **Desktop:** Layout completo com sidebar fixa
- **Tablet:** Sidebar colapsável
- **Mobile:** Interface adaptada para telas pequenas

## 📁 Estrutura de Arquivos

```
├── pages/
│   ├── admin.html              # Página principal da área administrativa
│   └── admin-login.html        # Página de login administrativo
├── js/
│   └── admin.js               # JavaScript da área administrativa
├── css/
│   └── admin.css              # Estilos específicos da área admin
└── ADMIN_README.md            # Esta documentação
```

## 🔧 Tecnologias Utilizadas

- **HTML5:** Estrutura semântica
- **CSS3:** Estilos modernos com Flexbox/Grid
- **JavaScript ES6+:** Funcionalidades interativas
- **TailwindCSS:** Framework CSS utilitário
- **Font Awesome:** Ícones
- **Chart.js:** Gráficos interativos

## 🚀 Funcionalidades Futuras

### Relatórios (Em Desenvolvimento)
- Relatórios de vendas
- Análise de performance
- Exportação de dados

### Configurações (Em Desenvolvimento)
- Configurações do sistema
- Personalização de interface
- Backup de dados

## 🐛 Dados de Demonstração

O sistema inclui dados simulados para demonstração:

### Usuários Pré-cadastrados:
1. **João Silva** - Cliente Ativo
2. **Maria Santos** - Decorador Ativo
3. **Pedro Costa** - Cliente Inativo
4. **Ana Oliveira** - Decorador Ativo

### Métricas Simuladas:
- Total de Solicitações: 45
- Total de Serviços: 32

## 📱 Como Testar

1. **Acesse o sistema:**
   ```
   http://localhost/Up.BaloesV3/index.html
   ```

2. **Faça login como admin:**
   - Clique em "Área Administrativa"
   - Use as credenciais: `admin@upbaloes.com` / `admin123`

3. **Teste as funcionalidades:**
   - Navegue pelo dashboard
   - Crie um novo decorador
   - Gerencie usuários existentes
   - Use os filtros de busca

## 🔒 Segurança

- **Autenticação:** Verificação de role admin
- **Validação:** Dados de entrada validados
- **Sessão:** Controle de sessão no localStorage
- **Logout:** Limpeza segura de dados

## 📞 Suporte

Para dúvidas ou problemas com a área administrativa, consulte:
- Este arquivo README
- Código comentado nos arquivos JavaScript
- Console do navegador para logs de debug

---

**Desenvolvido para o sistema Up.Baloes** 🎈
