# 🎈 Up.Baloes V3

Sistema completo para gestão de projetos de decoração com balões. Permite orçar, organizar agendas de decoradores, acompanhar clientes e administrar o fluxo operacional com autenticação segura baseada em JWT.

## 🧭 Índice Rápido

- Visão Geral
- Requisitos
- Instalação
- Configuração do `.env`
- Usuário Padrão
- Estrutura de Pastas
- Principais Módulos
- Comandos Úteis
- Boas Práticas de Segurança
- Suporte

---

## 🌟 Visão Geral

| Área | Destaques |
| ---- | --------- |
| Autenticação | JWT + sessão tradicional com "lembrar-me" e recuperação por e-mail |
| Operação | Painel administrativo com métricas, agenda do decorador e sistema de orçamentos |
| Marketing | Página pública personalizável e portfólio com fotos |
| Experiência | Interface responsiva e otimizada para desktop e mobile |
| UX Avançada | Preservação automática de dados do formulário, preenchimento inteligente para usuários logados e sincronização entre telas |

---

## 🔧 Requisitos

- PHP 7.4 ou superior (extensões `pdo_mysql`, `openssl`, `mbstring`)
- MySQL 5.7 ou superior
- Composer
- Servidor Web (Apache com mod_rewrite ou Nginx)
- Node.js (opcional, apenas se desejar gerenciar dependências front-end adicionais)

---

## 🚀 Instalação

1. Clonar o repositório:
   ```bash
   git clone https://github.com/sua-organizacao/Up.BaloesV3.git
   cd Up.BaloesV3
   ```
2. Instalar dependências PHP:
   ```bash
   composer install
   ```
3. Criar banco e importar estrutura:
   ```bash
   mysql -u root -p -e "CREATE DATABASE up_baloes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -u root -p up_baloes < database/setup_mysql.sql
   ```
4. Configurar variáveis de ambiente (veja a seção seguinte).
5. Garantir que o diretório esteja acessível via servidor web (por exemplo: `http://localhost/Up.BaloesV3`).

---

## ⚙️ Configuração do `.env`

Copie o arquivo de exemplo:
```bash
cp env.example .env
```

Edite os valores mínimos:
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
- **Senha:** Configure no banco de dados após instalação

Altere a senha após o primeiro acesso pelo painel administrativo.

---

## 📂 Estrutura de Pastas

```
Up.BaloesV3/
├── api/          # Endpoints REST auxiliares
├── services/     # Lógica de negócio em PHP (MVC simplificado)
├── pages/        # Páginas HTML do painel e área pública
├── js/           # Scripts para interação e chamadas AJAX
├── css/          # Estilos base do painel e páginas públicas
├── database/     # Scripts SQL e seeds
├── Images/       # Assets usados no portfólio e branding
├── components/   # Biblioteca de componentes UI reutilizáveis
└── vendor/       # Dependências PHP (Composer)
```

---

## 🧩 Principais Módulos

- **Autenticação** (`services/auth_middleware.php`, `services/login.php`): controla sessão, JWT e lembrete "remember me".
- **Gestão de Usuários** (`services/admin.php`, `services/decorador.php`): cadastro, aprovação de decoradores e perfis.
- **Orçamentos** (`services/orcamentos.php`, `services/budget_logs.php`): fluxo completo com histórico de ações.
- **Disponibilidade** (`services/disponibilidade.php`, `services/datas-bloqueadas.php`): agenda dos decoradores, bloqueios e confirmações.
- **Página do Decorador** (`pages/painel-decorador.html`, `services/pagina-decorador.php`): personalização e publicação do portfólio.
- **Carrinho e Solicitações** (`pages/carrinho-cliente.html`, `pages/solicitacao-cliente.html`): sistema de carrinho com preservação de dados e preenchimento automático para usuários logados.

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

## ✨ Funcionalidades de UX

### Preservação de Dados do Formulário
- **Modal de Confirmação**: Os dados preenchidos no modal de confirmação de orçamento são automaticamente salvos no `localStorage` e restaurados quando o modal é reaberto.
- **Campos Preservados**: Nome, email, telefone, local do evento, tipo de serviço, tamanho do arco, descrição e observações.
- **Limpeza Automática**: Dados são limpos automaticamente após envio bem-sucedido da solicitação.

### Preenchimento Automático para Usuários Logados
- **Tela de Solicitação**: Quando um usuário logado acessa a página de solicitação de serviço personalizado (`solicitacao-cliente.html`), os campos de nome, email e telefone são preenchidos automaticamente com os dados da conta.
- **Modal de Confirmação**: No modal de confirmação do carrinho, os dados do usuário são carregados automaticamente, mas não sobrescrevem campos já preenchidos.
- **Priorização Inteligente**: Dados já preenchidos têm prioridade sobre dados do usuário logado, garantindo que informações específicas do formulário não sejam perdidas.

### Sincronização de Dados
- **Carrinho → Modal**: Dados dos itens do carrinho e orçamentos personalizados são utilizados para preencher campos vazios no modal de confirmação.
- **Orçamentos Personalizados**: Informações de orçamentos personalizados (descrição, observações, local) são preservadas e sincronizadas.

---

## 📞 Suporte e Referências

- Estrutura do banco: `database/setup_mysql.sql`
- Configurações globais: `services/config.php`
- Guia detalhado de instalação: `INSTALACAO.md`
- Changelog completo: `CHANGELOG.md`
- Resumo de alterações: `RESUMO_ALTERACOES.md`
- Dúvidas ou bugs: abra uma issue no repositório ou entre em contato com a equipe responsável.

---

**Desenvolvido para Up.Baloes** 🎈