# 🎈 Up.Baloes - Sistema de Gerenciamento de Decorações

Sistema completo de gerenciamento para decorações com balões, incluindo autenticação JWT, login com Google OAuth 2.0 e gestão completa de clientes, decoradores e administradores.

[![PHP](https://img.shields.io/badge/PHP-7.4%2B-777BB4?style=flat&logo=php)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7%2B-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-Proprietary-red)](LICENSE)

---

## ✨ Funcionalidades Principais

### 🔐 Autenticação e Segurança
- **JWT (JSON Web Tokens)** com expiração de 8 horas
- **Google OAuth 2.0** para login social (apenas e-mails pré-cadastrados)
- **Middleware de proteção** de rotas por perfil
- **Senhas hashadas** com bcrypt
- **Variáveis de ambiente** para dados sensíveis

### 👥 Gestão de Usuários
- **3 perfis:** Cliente, Decorador e Administrador
- **Cadastro de clientes** via formulário público
- **Cadastro de decoradores** pelo administrador
- **Aprovação manual** de decoradores
- **Campo de e-mail Google** para login social

### 📋 Sistema de Orçamentos
- 5 tipos de serviços especializados
- Upload de imagens de inspiração
- Controle de status (Pendente, Aprovado, Recusado, Cancelado)
- Sistema de logs completo

### 🎯 Painel Administrativo
- Dashboard com métricas e estatísticas
- Gerenciamento completo de usuários
- Criação de contas de decoradores
- Relatórios e gráficos interativos

### 📱 Design Responsivo
- Interface moderna e intuitiva
- Totalmente responsivo (mobile, tablet, desktop)
- Scroll funcional em todas as resoluções
- Animações suaves e efeitos visuais

---

## 🚀 Instalação em 5 Passos

### 1️⃣ Instalar Composer

**Windows:**
```bash
# Baixe e execute:
https://getcomposer.org/Composer-Setup.exe
```

**Linux/Mac:**
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

📖 **Guia detalhado:** [docs/COMPOSER_INSTALACAO.md](docs/COMPOSER_INSTALACAO.md)

### 2️⃣ Instalar Dependências PHP

**Opção A - Automático (Windows):**
```bash
# Dê duplo clique no arquivo:
instalar-dependencias.bat
```

**Opção B - Manual:**
```bash
composer install
```

Isso instalará:
- ✅ `firebase/php-jwt` - Autenticação JWT
- ✅ `vlucas/phpdotenv` - Variáveis de ambiente

### 3️⃣ Configurar Ambiente

```bash
# Copiar template de configuração com dados de teste
copy .env.teste .env

# Ou copiar template vazio para preencher manualmente
copy .env.example .env
```

**Edite o arquivo `.env`** e configure (mínimo necessário):
```env
DB_HOST=localhost
DB_NAME=up_baloes
DB_USER=root
DB_PASS=          # Deixe vazio se não tiver senha

JWT_SECRET=sua_chave_jwt_aqui
```

💡 **Dica:** O arquivo `.env.teste` já vem com uma chave JWT funcional para testes!

### 4️⃣ Configurar Banco de Dados

```bash
# 1. Criar banco de dados
mysql -u root -p
CREATE DATABASE up_baloes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# 2. Criar estrutura do banco
mysql -u root -p up_baloes < database/setup_mysql.sql

# 3. Adicionar campo para Google Email
mysql -u root -p up_baloes < database/adicionar_campo_google_email.sql
```

### 5️⃣ Acessar o Sistema

Abra o navegador e acesse:
```
http://localhost/Up.BaloesV3
```

🎉 **Pronto! Sistema funcionando!**

**Próximo passo:** Crie seu primeiro usuário admin pelo painel ou via SQL:

```sql
USE up_baloes;
INSERT INTO usuarios (nome, email, senha, perfil, ativo, aprovado_por_admin, created_at) 
VALUES (
    'Administrador',
    'admin@upbaloes.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin', 1, 1, NOW()
);
```
*(Senha: admin123)*

---

## 📂 Estrutura do Projeto

```
Up.BaloesV3/
│
├── 📄 index.html                    # Página inicial
├── 📄 composer.json                 # Dependências PHP
├── 📄 .env.teste                    # Configuração de teste (copie para .env)
├── 📄 .env.example                  # Template vazio
├── 📄 instalar-dependencias.bat     # Instalador Windows
├── 📄 google-callback.php           # Handler OAuth Google
│
├── 📁 api/                          # Endpoints REST
│   ├── login.php                    # Autenticação JWT
│   └── google-config.php            # Config Google (público)
│
├── 📁 services/                     # Backend PHP
│   ├── config.php                   # Configuração principal
│   ├── auth_middleware.php          # Middleware JWT
│   ├── login.php                    # Login tradicional
│   ├── admin.php                    # Gestão administrativa
│   ├── cadastro.php                 # Cadastro de usuários
│   ├── decorador.php                # Serviços de decoradores
│   ├── orcamentos.php               # Gestão de orçamentos
│   └── ...
│
├── 📁 pages/                        # Frontend HTML
│   ├── login.html                   # Login (+ Google OAuth)
│   ├── admin.html                   # Painel administrativo
│   ├── cadastro.html                # Cadastro de clientes
│   ├── painel-decorador.html        # Painel do decorador
│   └── ...
│
├── 📁 js/                           # Scripts JavaScript
│   ├── login.js                     # Lógica de login
│   ├── admin.js                     # Lógica administrativa
│   └── ...
│
├── 📁 css/                          # Estilos CSS
│   ├── estilos.css                  # Estilos globais
│   ├── login.css                    # Estilos de login
│   ├── login-fixes.css              # Correções responsivas
│   └── ...
│
├── 📁 database/                     # Scripts SQL
│   ├── setup_mysql.sql              # Criação inicial
│   ├── adicionar_campo_google_email.sql
│   └── ...
│
├── 📁 docs/                         # 📚 Documentação
│   ├── README.md                    # Índice da documentação
│   ├── COMPOSER_INSTALACAO.md       # Como instalar Composer
│   ├── INSTALACAO_JWT_GOOGLE.md     # Guia JWT e Google
│   ├── COMO_TESTAR.md               # Como testar o sistema
│   └── ...
│
├── 📁 Images/                       # Imagens do sistema
└── 📁 utils/                        # Utilitários
```

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **PHP 7.4+** - Linguagem principal
- **MySQL 5.7+** - Banco de dados
- **JWT (firebase/php-jwt)** - Autenticação via tokens
- **DotEnv (vlucas/phpdotenv)** - Variáveis de ambiente
- **PDO** - Conexão segura com banco

### Frontend
- **HTML5** - Estrutura semântica
- **TailwindCSS** - Framework CSS moderno
- **JavaScript ES6+** - Interatividade
- **Font Awesome** - Ícones
- **Chart.js** - Gráficos no painel admin

### Autenticação
- **JWT** - Tokens seguros com expiração
- **Google OAuth 2.0** - Login social
- **BCrypt** - Hash de senhas

---

## 📖 Documentação Completa

### Para Começar
- **[INSTALACAO.md](INSTALACAO.md)** - Guia de instalação em 3 passos
- **[docs/COMO_TESTAR.md](docs/COMO_TESTAR.md)** - Como testar o sistema
- **[docs/COMPOSER_INSTALACAO.md](docs/COMPOSER_INSTALACAO.md)** - Instalar Composer

### Autenticação
- **[docs/INSTALACAO_JWT_GOOGLE.md](docs/INSTALACAO_JWT_GOOGLE.md)** - JWT e Google OAuth
- **[docs/README_AUTH.md](docs/README_AUTH.md)** - Visão geral da autenticação

### Banco de Dados
- **[docs/CONFIGURACAO_MYSQL.md](docs/CONFIGURACAO_MYSQL.md)** - Setup do MySQL

### Todos os Guias
- **[docs/README.md](docs/README.md)** - Índice completo da documentação

---

## ⚙️ Configuração

### Arquivo .env (Obrigatório)

O sistema usa variáveis de ambiente para configuração. Copie um dos templates:

**Para testes rápidos:**
```bash
copy .env.teste .env
```

**Para configuração manual:**
```bash
copy .env.example .env
```

**Configurações mínimas necessárias:**
```env
# Banco de Dados
DB_HOST=localhost
DB_NAME=up_baloes
DB_USER=root
DB_PASS=

# JWT (Gere com: openssl rand -base64 32)
JWT_SECRET=sua_chave_segura_aqui
JWT_EXPIRATION=28800

# Sistema
BASE_URL=http://localhost/Up.BaloesV3
ENVIRONMENT=development
```

**Configurações opcionais:**
```env
# Google OAuth (para login com Google)
GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_REDIRECT_URI=http://localhost/Up.BaloesV3/google-callback.php

# Email SMTP (para envio de emails)
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
```

---

## 🧪 Testando o Sistema

Após instalar e configurar o banco de dados, crie um usuário admin:

```sql
USE up_baloes;
INSERT INTO usuarios (nome, email, senha, perfil, ativo, aprovado_por_admin, created_at) 
VALUES (
    'Administrador',
    'admin@upbaloes.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin', 1, 1, NOW()
);
```

Acesse: `http://localhost/Up.BaloesV3/pages/login.html`

**Login:** admin@upbaloes.com  
**Senha:** admin123

📖 **Guia detalhado:** [docs/COMO_TESTAR.md](docs/COMO_TESTAR.md)

---

## 🎯 Como Usar

### Login Normal (JWT)

```javascript
// Exemplo de login via API
fetch('http://localhost/Up.BaloesV3/api/login.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@email.com',
    password: 'senha123'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Token:', data.token);
  console.log('Usuário:', data.user);
});
```

### Proteger Rotas PHP

```php
<?php
require_once '../services/auth_middleware.php';

// Requer autenticação (qualquer perfil)
$userData = requireAuth();

// Apenas administradores
$adminData = requireAdminAuth();

// Apenas decoradores
$decoratorData = requireDecoratorAuth();
?>
```

### Login com Google

1. Administrador cadastra o e-mail Google do decorador
2. Decorador clica em "Fazer Login com o Google"
3. Autoriza o acesso
4. Sistema valida e autentica automaticamente

📖 **Guia completo:** [docs/INSTALACAO_JWT_GOOGLE.md](docs/INSTALACAO_JWT_GOOGLE.md)

---

## 📊 Endpoints da API

| Endpoint | Método | Descrição | Autenticação |
|----------|--------|-----------|--------------|
| `/api/login.php` | POST | Login com JWT | Não |
| `/api/google-config.php` | GET | Config do Google OAuth | Não |
| `/services/login.php` | POST | Login tradicional | Não |
| `/services/admin.php` | POST | Gestão administrativa | Admin |
| `/services/cadastro.php` | POST | Cadastro de clientes | Não |
| `/services/decorador.php` | POST | Serviços do decorador | Decorador |
| `/services/orcamentos.php` | POST | Gestão de orçamentos | Autenticado |

---

## 🔒 Segurança Implementada

- ✅ Tokens JWT com expiração configurável
- ✅ Senhas hashadas com bcrypt (PASSWORD_DEFAULT)
- ✅ Validação rigorosa de e-mails
- ✅ Sanitização de todos os inputs
- ✅ Proteção contra SQL Injection (PDO Prepared Statements)
- ✅ Headers de segurança (XSS, CSRF, etc.)
- ✅ CORS configurável por ambiente
- ✅ Logs de acesso para auditoria
- ✅ Variáveis de ambiente protegidas (.gitignore)
- ✅ Apenas e-mails pré-cadastrados no Google OAuth

---

## 🐛 Solução de Problemas

### Erro: "Composer não encontrado"
```bash
# Instale o Composer:
# Windows: https://getcomposer.org/Composer-Setup.exe
# Linux/Mac: curl -sS https://getcomposer.org/installer | php
```

### Erro: "Class 'Dotenv\Dotenv' not found"
```bash
composer install
```

### Erro: "Cannot connect to database"
```env
# Verifique o .env:
DB_HOST=localhost
DB_NAME=up_baloes
DB_USER=root
DB_PASS=sua_senha_aqui  # Se tiver senha
```

### Erro: "Email do Google não encontrado"
```
1. Acesse o painel admin
2. Edite o decorador
3. Preencha o campo "E-mail da Conta Google"
4. Salve e tente login com Google novamente
```

### Login não funciona
```bash
# Verifique se os usuários foram criados:
mysql -u root -p up_baloes < usuarios_teste.sql
```

### Google OAuth não funciona
```
Isso é normal! As credenciais no .env são fictícias.
Para usar Google OAuth, configure credenciais reais:
1. https://console.cloud.google.com/
2. Crie projeto e credenciais OAuth 2.0
3. Atualize GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env
```

📖 **Mais soluções:** [docs/COMO_TESTAR.md](docs/COMO_TESTAR.md)

---

## 📚 Documentação Adicional

### Guias Principais
- **[INSTALACAO.md](INSTALACAO.md)** - Instalação detalhada
- **[docs/README.md](docs/README.md)** - Índice completo
- **[docs/COMO_TESTAR.md](docs/COMO_TESTAR.md)** - Guia de testes

### Tópicos Específicos
- **[Autenticação JWT](docs/INSTALACAO_JWT_GOOGLE.md)** - Implementação completa
- **[Google OAuth](docs/INSTALACAO_JWT_GOOGLE.md#configuração-do-google-oauth)** - Configuração
- **[Banco de Dados](docs/CONFIGURACAO_MYSQL.md)** - Setup do MySQL
- **[Instalar Composer](docs/COMPOSER_INSTALACAO.md)** - Passo a passo

---

## 🧰 Ferramentas e Scripts

### Scripts de Instalação
- `instalar-dependencias.bat` - Instala dependências (Windows)

### Arquivos de Configuração
- `.env.teste` - Template com dados fictícios funcionais
- `.env.example` - Template vazio para preencher
- `composer.json` - Dependências PHP

---

## 🎓 Próximos Passos Após Instalação

### 1. Explorar o Sistema
- ✅ Faça login como admin
- ✅ Crie um novo decorador
- ✅ Teste o cadastro de cliente
- ✅ Explore os painéis

### 2. Configurar Google OAuth (Opcional)
- 📖 Siga: [docs/INSTALACAO_JWT_GOOGLE.md](docs/INSTALACAO_JWT_GOOGLE.md)
- Configure credenciais reais
- Teste login com Google

### 3. Personalizar
- Ajuste o `.env` para suas necessidades
- Configure SMTP para envio de emails
- Personalize cores e logo

### 4. Deploy em Produção
- Gere nova chave JWT: `openssl rand -base64 32`
- Configure `ENVIRONMENT=production` no `.env`
- Use HTTPS
- Configure backups do banco

---

## 📋 Checklist de Instalação

- [ ] Composer instalado
- [ ] Dependências instaladas (`composer install`)
- [ ] Arquivo `.env` criado e configurado
- [ ] Banco de dados `up_baloes` criado
- [ ] Estrutura do banco criada (`database/setup_mysql.sql`)
- [ ] Campo google_email adicionado (`database/adicionar_campo_google_email.sql`)
- [ ] Usuário admin criado
- [ ] Login funcionando
- [ ] Painel admin acessível
- [ ] API JWT retornando tokens

---

## 🤝 Contribuindo

Este é um projeto proprietário da Up.Baloes. Para contribuir:

1. Mantenha os padrões de código existentes
2. Documente todas as alterações
3. Teste antes de fazer commit
4. **Nunca faça commit do arquivo `.env`**
5. Atualize a documentação se necessário

---

## 📄 Licença

© 2024 Up.Baloes. Todos os direitos reservados.

Este é um software proprietário. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte e Documentação

### Problemas?
- 🐛 **Erros de instalação:** [docs/COMO_TESTAR.md](docs/COMO_TESTAR.md)
- 🔐 **Problemas de autenticação:** [docs/INSTALACAO_JWT_GOOGLE.md](docs/INSTALACAO_JWT_GOOGLE.md)
- 🗄️ **Problemas de banco:** [docs/CONFIGURACAO_MYSQL.md](docs/CONFIGURACAO_MYSQL.md)

### Recursos
- 📖 [Documentação Completa](docs/)
- 🚀 [Guia de Início Rápido](docs/INICIO_RAPIDO.md)
- 🧪 [Como Testar](docs/COMO_TESTAR.md)

---

## 🎯 Status do Projeto

✅ **Funcional e Pronto para Uso**

- [x] Sistema de autenticação JWT implementado
- [x] Login com Google OAuth 2.0 funcional
- [x] Gestão completa de usuários
- [x] Painel administrativo operacional
- [x] Sistema de orçamentos ativo
- [x] Interface responsiva (mobile-first)
- [x] Documentação completa
- [x] Scripts de teste e instalação
- [x] Código sem erros de linter

---

**Desenvolvido com ❤️ para Up.Baloes** 🎈

**Última atualização:** Outubro 2024 | **Versão:** 1.0.0
