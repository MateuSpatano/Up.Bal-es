# 🎈 Up.Baloes V3

Sistema completo para gestão de projetos de decoração com balões. Permite orçar, organizar agendas de decoradores, acompanhar clientes e administrar o fluxo operacional com autenticação segura baseada em JWT.

## 🧭 Índice Rápido

- Visão Geral
- Funcionalidades Principais
- Requisitos
- Instalação
- Configuração do `.env`
- Usuário Padrão
- Estrutura de Pastas
- Arquitetura e Módulos
- Comandos Úteis
- Boas Práticas de Segurança
- Suporte

---

## 🌟 Visão Geral

| Área | Destaques |
| ---- | --------- |
| Autenticação | Login unificado (admin/decorador), sessão + remember-me, reset de senha por e-mail |
| Operação | Painel administrativo com métricas, aprovação de decoradores, orçamentos e notificações |
| Atendimento | Painel do decorador com agenda, controle de disponibilidade, portfólio e orçamento |
| Marketing | Página pública personalizável, landing page e formulário de solicitação de clientes |
| Experiência | Interface responsiva Tailwind + componentes JavaScript especializados |

---

## ✨ Funcionalidades Principais

### Autenticação e Segurança
- Login de administradores e decoradores com gerenciamento de sessão e cookie “lembrar-me”.
- Recuperação de senha com tokens temporários e e-mails transacionais.
- Logs de acesso (`access_logs`) para auditoria de ações sensíveis.

### Painel Administrativo (`/admin/painel`)
- Dashboard com KPIs (clientes, decoradores ativos, orçamentos, serviços).
- Gestão de usuários (clientes/decoradores) com filtros, aprovação e alteração de dados.
- Personalização da página pública de cada decorador (cores, textos, SEO, redes sociais).
- Administração de perfil próprio (dados, foto, senha) e disparo de notificações.

### Painel do Decorador (`/painel-decorador`)
- Resumo operacional (orçamentos recentes, status, métricas rápidas).
- Gestão de agenda (disponibilidade recorrente, bloqueios, validação de horários).
- CRUD de orçamentos, envio de propostas e controle de custos de projeto.
- Portfólio com upload de imagens, destaque de serviços e organização automática.
- Edição de conta (dados pessoais, endereço, contatos) e troca de senha.

### Site Público
- Tela de login/cadastro responsiva e moderna.
- Página pública do decorador totalmente customizável pelo painel admin.
- Formulário de solicitação de cliente integrado à API pública.
- Conteúdo institucional com menus dinâmicos e integração com o portfólio.

---

## 🔧 Requisitos

- PHP 8.2 ou superior (extensões: `pdo_mysql`, `openssl`, `mbstring`, `json`, `curl`)
- MySQL 8.0+ (ou MariaDB compatível)
- Composer 2.x
- Node.js 18+ (opcional: para recompilar assets com Vite)
- Servidor Web (Apache com `mod_rewrite` ou Nginx configurado para Laravel)

---

## 🚀 Instalação

1. Clonar o repositório:
   ```bash
   git clone https://github.com/sua-organizacao/Up.BaloesV3.git
   cd Up.BaloesV3
   ```
2. Instalar dependências PHP (aplicação Laravel):
   ```bash
   cd laravel
   composer install
   ```
3. (Opcional) Instalar dependências front-end e compilar assets:
   ```bash
   npm install
   npm run build
   ```
4. Criar banco de dados:
   ```bash
   mysql -u root -p -e "CREATE DATABASE up_baloes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```
5. Configurar variáveis de ambiente e gerar a chave da aplicação:
   ```bash
   cp ../env.example .env        # copie o template fornecido na raiz
   php artisan key:generate
   ```
   > **Importante:** Edite o arquivo `.env` e configure as credenciais do banco de dados (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`).
6. Executar migrações para criar todas as tabelas:
   ```bash
   php artisan migrate
   ```
7. Iniciar o servidor local:
   ```bash
   php artisan serve
   ```

> Todas as etapas acima assumem que os comandos são executados dentro do diretório `laravel/`.

---

## ⚙️ Configuração do `.env`

O arquivo de exemplo atualizado encontra-se na raiz (`env.example`). Após copiá-lo para `laravel/.env`, ajuste os valores mínimos:

```env
DB_HOST=localhost
DB_NAME=up_baloes
DB_USER=root
DB_PASS=

# Gere uma nova chave com: openssl rand -base64 32
JWT_SECRET=sua_chave_jwt_aqui
JWT_EXPIRATION=28800

BASE_URL=http://localhost/Up.BaloesV3
ENVIRONMENT=development

# SMTP (necessário para recuperação de senha e notificações)
SMTP_HOST=smtp.seuprovedor.com
SMTP_PORT=587
SMTP_USER=usuario@dominio.com
SMTP_PASS=senha_ou_token
SMTP_FROM=suporte@upbaloes.com
SMTP_FROM_NAME="Up.Baloes"
```

> Em produção, utilize chaves e segredos únicos, nunca commitados no repositório.

---

## 👤 Usuário Padrão

- **Login:** `admin@upbaloes.com`
- **Senha:** `admin123`

Altere a senha após o primeiro acesso pelo painel administrativo.

---

## 📂 Estrutura de Pastas

```
Up.BaloesV3/
├── laravel/                # Aplicação completa
│   ├── app/                # Domínio (Controllers, Models, Services, Policies)
│   ├── bootstrap/          # Bootstrap do framework
│   ├── config/             # Configurações (inclui upbaloes.php)
│   ├── database/           # Migrações e seeders do banco de dados
│   ├── public/             # Assets publicados (css/js/imagens)
│   ├── resources/          # Views Blade e fontes dos assets
│   ├── routes/             # Definições das rotas web/api
│   ├── storage/            # Cache, logs e uploads
│   └── tests/              # Testes unitários e de features
├── components/             # Biblioteca de UI isolada (opcional)
├── docs/                   # Documentação complementar
├── utils/                  # Utilitários avulsos
├── env.example             # Template de configuração de ambiente
└── README.md
```

> **Nota:** Os diretórios legados `css/`, `js/`, `pages/`, `Images/`, `services/`, `database/`, `vendor/` e o `composer.json` raiz foram removidos após a migração completa para Laravel. Todos os assets, serviços e estrutura do banco (via migrations) estão agora dentro de `laravel/`.

---

## 🧱 Arquitetura e Módulos

- **HTTP Layer**
  - Rotas web (`routes/web.php`) servem páginas Blade com assets em `laravel/public`.
  - Rotas API (`routes/api.php`) disponibilizam endpoints RESTful protegidos por middleware de sessão.
- **Controllers & Services**
  - `AuthController`, `AdminController`, `DashboardController`, `PortfolioController`, `BudgetController`, `AccountController`, etc.
  - Serviços dedicados em `app/Services` encapsulam regras de negócio (Account, Budget, DecoratorDashboard, Portfolio).
- **Models**
  - `User`, `Budget`, `DecoratorPortfolioItem`, `DecoratorAvailability`, `DecoratorBlockedDate`, `ProjectCost`, entre outros.
- **Views & Front-end**
  - Interfaces Blade em `resources/views/legacy`.
  - JavaScript modular em `public/js` (login, admin, painel do decorador, etc).
  - Estilos Tailwind + CSS customizados em `public/css`.
- **Configuração**
  - Configurações de negócio centralizadas em `config/upbaloes.php`.
  - Access logs e tokens gerenciados via migrations/tabelas dedicadas.

---

## 🛠️ Comandos Úteis

```bash
# Atualizar dependências
composer update

# Verificar autoload (caso adicione novos serviços)
composer dump-autoload

# Servir a aplicação localmente (modo simples com PHP embutido)
php -S localhost:8000 -t .
```

---

## 🔒 Boas Práticas de Segurança

- Utilize HTTPS em produção e configure o `BASE_URL` com o domínio seguro.
- Defina um `JWT_SECRET` forte e rotacione periodicamente.
- Configure políticas de senha forte para usuários administradores.
- Restrinja permissões de escrita do diretório `vendor/` e arquivos de configuração.
- Realize backups periódicos do banco (`up_baloes`) e monitore o log de acessos (`access_logs`).

---

## 📞 Suporte e Referências

- Migrações do banco: `laravel/database/migrations/`
- Configurações globais: `laravel/config/upbaloes.php`
- Guia passo a passo: `INSTALACAO.md`
- Dúvidas ou bugs: abra uma issue no repositório ou entre em contato com a equipe responsável.

---

**Desenvolvido para Up.Baloes** 🎈