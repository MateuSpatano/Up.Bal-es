# 🎈 Up.Baloes - Sistema de Gestão

Sistema completo de gerenciamento para decorações com balões, incluindo autenticação JWT, login com Google OAuth 2.0 e gestão de clientes, decoradores e administradores.

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

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_REDIRECT_URI=http://localhost/Up.BaloesV3/google-callback.php
```

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
- **Autenticação:** JWT, Google OAuth 2.0
- **Dependências:** Firebase JWT, Google API Client

## 📋 Funcionalidades

- ✅ Autenticação JWT com expiração
- ✅ Login com Google OAuth 2.0
- ✅ Gestão de usuários (Admin, Decorador, Cliente)
- ✅ Sistema de orçamentos
- ✅ Painel administrativo
- ✅ Interface responsiva

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
- `GET /api/google-config.php` - Configuração Google OAuth
- `POST /services/login.php` - Login tradicional
- `POST /services/admin.php` - Gestão administrativa

### Banco de Dados
- **usuarios** - Dados dos usuários
- **orcamentos** - Solicitações de orçamento
- **budget_logs** - Log de ações
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