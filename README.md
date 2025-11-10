# 🎈 Up.Baloes - Sistema de Gestão

Sistema completo de gerenciamento para decorações com balões, incluindo autenticação JWT e gestão de clientes, decoradores e administradores.

## 🚀 Instalação Rápida

### 1. Instalar Dependências
```bash
composer install
```

### 2. Configurar Banco de Dados
```bash
# Criar banco de dados
mysql -u root -p
CREATE DATABASE up_baloes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Criar estrutura
mysql -u root -p up_baloes < database/setup_mysql.sql
```

### 3. Configurar Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
# Banco de Dados
DB_HOST=localhost
DB_NAME=up_baloes
DB_USER=root
DB_PASS=

# JWT (Gere com: openssl rand -base64 32)
JWT_SECRET=sua_chave_jwt_aqui
JWT_EXPIRATION=28800

# Sistema
BASE_URL=http://localhost/Up.BaloesV3
ENVIRONMENT=development
```

> Configure também as variáveis `SMTP_*` no `.env` para habilitar o envio de emails de recuperação de senha e notificações.

### 4. Acessar o Sistema
```
http://localhost/Up.BaloesV3
```

**Login Admin:** admin@upbaloes.com | **Senha:** admin123

## 📂 Estrutura do Projeto

```
Up.BaloesV3/
├── api/                    # Endpoints REST
├── services/               # Backend PHP
├── pages/                  # Frontend HTML
├── js/                     # Scripts JavaScript
├── css/                    # Estilos CSS
├── database/               # Scripts SQL
├── Images/                 # Imagens do sistema
└── vendor/                 # Dependências PHP
```

## 🔧 Tecnologias

- **Backend:** PHP 7.4+, MySQL 5.7+
- **Frontend:** HTML5, TailwindCSS, JavaScript ES6+
- **Autenticação:** JWT
- **Dependências:** Firebase JWT, vlucas/phpdotenv

## 📋 Funcionalidades

- ✅ Autenticação com sessões, tokens "lembrar-me" e recuperação de senha por email
- ✅ Gestão de usuários (Admin, Decorador, Cliente) com aprovação de decoradores
- ✅ Sistema de orçamentos com registros de atividade
- ✅ Personalização da página pública do decorador e gestão de portfólio
- ✅ Painel administrativo com métricas em tempo real
- ✅ Interface responsiva otimizada para desktop e mobile

## 🛠️ Desenvolvimento

### Estrutura de Autenticação
```php
// Middleware de proteção
require_once 'services/auth_middleware.php';
$userData = requireAuth(); // Qualquer usuário
$adminData = requireAdminAuth(); // Apenas admin
```

### Endpoints da API
- `POST /api/login.php` - Login com JWT
- `POST /services/login.php` - Login tradicional, lembrete de sessão e recuperação de senha
- `POST /services/admin.php` - Gestão administrativa
- `POST /services/portfolio.php` - CRUD do portfólio do decorador autenticado

### Banco de Dados
- **usuarios** - Dados dos usuários e perfis
- **remember_tokens** - Tokens persistentes do "lembrar-me"
- **password_reset_tokens** - Tokens temporários para redefinição de senha
- **access_logs** - Histórico de logins, logouts e eventos relevantes
- **orcamentos** - Solicitações de orçamento
- **budget_logs** - Log de ações nos orçamentos
- **decorator_page_customization** - Configurações da página pública do decorador
- **decorator_portfolio_items** - Serviços exibidos no portfólio público
- **decorator_availability** - Disponibilidade dos decoradores
- **decorator_blocked_dates** - Datas bloqueadas

## 🔒 Segurança

- Tokens JWT com expiração configurável
- Senhas hashadas com bcrypt
- Validação rigorosa de dados
- Proteção contra SQL Injection (PDO)
- Headers de segurança configurados

## 📞 Suporte

Para dúvidas sobre desenvolvimento, consulte:
- Código comentado nos arquivos PHP
- Estrutura do banco em `database/setup_mysql.sql`
- Configurações em `services/config.php`

---

**Desenvolvido para Up.Baloes** 🎈