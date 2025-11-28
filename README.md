# 🎈 Up.Baloes V3

Sistema completo Multi-Tenant para gestão de projetos de decoração com balões. Permite que cada decorador tenha seu próprio site isolado, personalizável, com sistema de orçamentos, organização de agendas, acompanhamento de clientes e administração completa do fluxo operacional com autenticação segura baseada em JWT.

## 🧭 Índice Rápido

- [Visão Geral](#-visão-geral)
- [Requisitos](#-requisitos)
- [Instalação](#-instalação)
- [Configuração do `.env`](#️-configuração-do-env)
- [Usuário Padrão](#-usuário-padrão)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Arquitetura Multi-Tenant](#-arquitetura-multi-tenant)
- [Principais Módulos](#-principais-módulos)
- [Sistema de Rotas](#-sistema-de-rotas)
- [Personalização de Páginas](#-personalização-de-páginas)
- [Comandos Úteis](#️-comandos-úteis)
- [Boas Práticas de Segurança](#-boas-práticas-de-segurança)
- [Suporte](#-suporte)

---

## 🌟 Visão Geral

| Área | Destaques |
| ---- | --------- |
| **Multi-Tenant** | Cada decorador tem seu próprio site isolado com URL personalizada (`/{slug}`) |
| **Autenticação** | JWT + sessão tradicional com "lembrar-me" e recuperação por e-mail |
| **Operação** | Painel administrativo com métricas, agenda do decorador e sistema de orçamentos |
| **Marketing** | Página pública personalizável com cores, textos e portfólio com fotos |
| **Experiência** | Interface responsiva e otimizada para desktop e mobile |
| **UX Avançada** | Preservação automática de dados do formulário, preenchimento inteligente para usuários logados e sincronização entre telas |
| **Roteamento** | URLs amigáveis com contexto do decorador preservado em todas as páginas |

---

## 🔧 Requisitos

- **PHP 7.4 ou superior** (extensões `pdo_mysql`, `openssl`, `mbstring`, `json`)
- **MySQL 5.7 ou superior** (ou MariaDB 10.2+)
- **Composer** (para gerenciamento de dependências PHP)
- **Servidor Web** (Apache com mod_rewrite habilitado ou Nginx)
- **Node.js** (opcional, apenas se desejar gerenciar dependências front-end adicionais)

---

## 🚀 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/sua-organizacao/Up.BaloesV3.git
cd Up.BaloesV3
```

### 2. Instalar Dependências PHP

```bash
composer install
```

### 3. Criar Banco de Dados

```bash
mysql -u root -p -e "CREATE DATABASE up_baloes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p up_baloes < database/setup_mysql.sql
```

### 4. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e edite conforme necessário:

```bash
cp env.example .env
```

### 5. Configurar Servidor Web

#### Apache

Certifique-se de que o `mod_rewrite` está habilitado e que o arquivo `.htaccess` está presente na raiz do projeto.

#### Nginx

Configure as regras de rewrite equivalentes no arquivo de configuração do Nginx.

### 6. Acessar o Sistema

Após configurar o servidor web, acesse:
- **Página inicial**: `http://localhost/Up.Bal-es/index.html`
- **Painel Admin**: `http://localhost/Up.Bal-es/pages/admin-login.html`
- **Página de um decorador**: `http://localhost/Up.Bal-es/{slug-do-decorador}`

---

## ⚙️ Configuração do `.env`

Copie o arquivo de exemplo:

```bash
cp env.example .env
```

Edite os valores mínimos necessários:

```env
# Banco de Dados
DB_HOST=localhost
DB_NAME=up_baloes
DB_USER=root
DB_PASS=sua_senha_aqui
DB_PORT=3306

# JWT (Gere uma nova chave com: openssl rand -base64 32)
JWT_SECRET=sua_chave_jwt_aqui
JWT_EXPIRATION=28800

# URL Base do Sistema
BASE_URL=http://localhost/Up.Bal-es
ENVIRONMENT=development

# SMTP (Necessário para recuperação de senha e notificações)
SMTP_HOST=smtp.seuprovedor.com
SMTP_PORT=587
SMTP_USERNAME=usuario@dominio.com
SMTP_PASSWORD=senha_ou_token
SMTP_FROM_EMAIL=suporte@upbaloes.com
SMTP_FROM_NAME="Up.Baloes"
```

> ⚠️ **Importante**: Em produção, utilize chaves e segredos únicos, nunca commitados no repositório. O nome do projeto deve ser `Up.Bal-es` (com hífen).

---

## 👤 Usuário Padrão

- **Login:** `admin@upbaloes.com`
- **Senha:** Configure no banco de dados após instalação

Altere a senha após o primeiro acesso pelo painel administrativo.

---

## 📂 Estrutura de Pastas

```
Up.BaloesV3/
├── api/                    # Endpoints REST auxiliares
├── services/               # Lógica de negócio em PHP (MVC simplificado)
│   ├── config.php         # Configurações globais do sistema
│   ├── decorador-service.php  # Serviço de gerenciamento de decoradores
│   ├── pagina-decorador.php   # Página pública dinâmica do decorador
│   ├── carrinho.php       # Página de carrinho com contexto do decorador
│   ├── solicitacao.php    # Página de solicitação com contexto do decorador
│   ├── minhas-compras.php # Página de minhas compras com contexto do decorador
│   ├── auth_middleware.php # Middleware de autenticação
│   ├── login.php          # Sistema de login
│   ├── admin.php          # Gestão administrativa
│   ├── orcamentos.php     # Sistema de orçamentos
│   └── disponibilidade.php # Gestão de disponibilidade
├── pages/                  # Páginas HTML estáticas do painel
│   ├── painel-decorador.html  # Painel de personalização do decorador
│   ├── admin-login.html   # Login administrativo
│   ├── login.html         # Login de clientes
│   └── ...
├── js/                     # Scripts JavaScript
│   ├── principal.js       # Funções principais e carrinho
│   ├── carrinho-cliente.js # Lógica do carrinho
│   ├── solicitacao-cliente.js # Lógica de solicitação
│   ├── minhas-compras.js  # Lógica de minhas compras
│   ├── painel-decorador.js # Painel do decorador
│   └── ...
├── css/                    # Estilos CSS
│   └── estilos.css        # Estilos principais
├── database/               # Scripts SQL e seeds
│   └── setup_mysql.sql    # Estrutura do banco de dados
├── Images/                 # Assets (imagens, logos, etc.)
├── components/            # Biblioteca de componentes UI reutilizáveis
├── vendor/                # Dependências PHP (Composer)
└── .htaccess              # Configuração de rotas amigáveis
```

---

## 🏗️ Arquitetura Multi-Tenant

O sistema Up.Baloes V3 implementa uma arquitetura **Multi-Tenant por Decorador**, onde cada decorador possui:

### Características Principais

1. **URL Personalizada**: Cada decorador tem sua própria URL baseada em um slug único
   - Exemplo: `http://localhost/Up.Bal-es/mateus-rian-da-silva-teixeira`

2. **Isolamento Completo**: Cada decorador tem:
   - Página pública personalizada
   - Portfólio próprio
   - Cores e tema personalizados
   - Contatos próprios (email, WhatsApp, Instagram)

3. **Contexto Preservado**: Todas as páginas relacionadas mantêm o contexto do decorador:
   - Carrinho: `/{slug}/carrinho`
   - Solicitação: `/{slug}/solicitar`
   - Minhas Compras: `/{slug}/minhas-compras`

4. **Personalização Visual**: Cada decorador pode personalizar:
   - Cores primária, secundária e de destaque
   - Título e descrição da página
   - Texto de boas-vindas
   - Portfólio com imagens e preços
   - Serviços oferecidos

### Fluxo de Dados

```
Cliente → Página do Decorador (/{slug})
         ↓
    Adiciona itens ao carrinho
         ↓
    Acessa carrinho (/{slug}/carrinho)
         ↓
    Confirma solicitação
         ↓
    Solicitação vinculada ao decorator_id correto
```

---

## 🧩 Principais Módulos

### Autenticação e Segurança

- **`services/auth_middleware.php`**: Middleware de autenticação
- **`services/login.php`**: Sistema de login com JWT e sessão
- **`js/auth-protection.js`**: Proteção de páginas no frontend
- Recursos: "Lembrar-me", recuperação de senha por email, proteção contra navegação não autorizada

### Gestão de Usuários

- **`services/admin.php`**: Gestão administrativa completa
- **`services/decorador-service.php`**: Serviço de gerenciamento de decoradores
- Funcionalidades: Cadastro, aprovação de decoradores, gestão de perfis, busca por slug

### Páginas Públicas Dinâmicas

- **`services/pagina-decorador.php`**: Página pública principal do decorador
- **`services/carrinho.php`**: Carrinho com contexto do decorador
- **`services/solicitacao.php`**: Solicitação de serviço com contexto
- **`services/minhas-compras.php`**: Histórico de compras do cliente

### Orçamentos

- **`services/orcamentos.php`**: Sistema completo de orçamentos
- **`services/budget_logs.php`**: Histórico de ações nos orçamentos
- Funcionalidades: Criação, aprovação, recusa, cancelamento, histórico completo

### Disponibilidade e Agenda

- **`services/disponibilidade.php`**: Gestão de disponibilidade dos decoradores
- **`services/datas-bloqueadas.php`**: Sistema de bloqueio de datas
- Funcionalidades: Calendário de disponibilidade, horários, bloqueios, confirmações

### Personalização

- **`pages/painel-decorador.html`**: Interface de personalização
- **`js/painel-decorador.js`**: Lógica de personalização
- Funcionalidades: Cores, textos, portfólio, serviços, redes sociais

---

## 🛣️ Sistema de Rotas

O sistema utiliza rotas amigáveis configuradas no arquivo `.htaccess`:

### Rotas Principais

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/{slug}` | `services/pagina-decorador.php` | Página pública do decorador |
| `/{slug}/carrinho` | `services/carrinho.php` | Carrinho do cliente (contexto do decorador) |
| `/{slug}/solicitar` | `services/solicitacao.php` | Solicitação de serviço (contexto do decorador) |
| `/{slug}/minhas-compras` | `services/minhas-compras.php` | Histórico de compras (contexto do decorador) |

### Regras de Roteamento

```apache
# Rotas específicas do decorador (devem vir antes da regra geral)
RewriteRule ^([a-zA-Z0-9-]+)/carrinho/?$ services/carrinho.php?slug=$1 [L,QSA]
RewriteRule ^([a-zA-Z0-9-]+)/solicitar/?$ services/solicitacao.php?slug=$1 [L,QSA]
RewriteRule ^([a-zA-Z0-9-]+)/minhas-compras/?$ services/minhas-compras.php?slug=$1 [L,QSA]

# Regra geral para página do decorador
RewriteRule ^([a-zA-Z0-9-]+)/?$ services/pagina-decorador.php?slug=$1 [L,QSA]
```

### Detecção de URL Base

O sistema detecta automaticamente a URL base correta:
- Prioriza `Up.Bal-es` sobre `Up.BaloesV3`
- Remove duplicações de `localhost`
- Garante URLs consistentes em todo o sistema

---

## 🎨 Personalização de Páginas

Cada decorador pode personalizar sua página pública através do painel administrativo:

### Elementos Personalizáveis

1. **Cores**:
   - Cor primária
   - Cor secundária
   - Cor de destaque

2. **Conteúdo**:
   - Título da página
   - Descrição
   - Texto de boas-vindas

3. **Portfólio**:
   - Adicionar/remover itens
   - Upload de imagens
   - Preços e descrições
   - Ordenação personalizada

4. **Serviços**:
   - Lista de serviços oferecidos
   - Preços e descrições
   - Ícones personalizados

5. **Contatos**:
   - Email de comunicação
   - WhatsApp
   - Instagram
   - Outras redes sociais

### Aplicação de Personalização

As personalizações são aplicadas automaticamente em:
- Página principal do decorador
- Página de carrinho
- Página de solicitação
- Página de minhas compras

Todas as páginas mantêm a identidade visual do decorador através de variáveis CSS e JavaScript globais.

---

## 🛠️ Comandos Úteis

```bash
# Atualizar dependências PHP
composer update

# Regenerar autoload (caso adicione novos serviços)
composer dump-autoload

# Servir a aplicação localmente (modo simples com PHP embutido)
php -S localhost:8000 -t .

# Verificar logs de erro (se configurado)
tail -f logs/error.log

# Backup do banco de dados
mysqldump -u root -p up_baloes > backup_$(date +%Y%m%d).sql
```

---

## 🔒 Boas Práticas de Segurança

### Configurações Recomendadas

1. **HTTPS em Produção**:
   - Configure certificado SSL
   - Ative HTTPS no `.htaccess` (descomente as regras)
   - Configure `BASE_URL` com `https://`

2. **JWT Secret**:
   - Use uma chave forte (mínimo 32 caracteres)
   - Gere com: `openssl rand -base64 32`
   - Rotacione periodicamente

3. **Senhas**:
   - Configure políticas de senha forte
   - Use hash seguro (já implementado com `password_hash`)

4. **Permissões**:
   - Restrinja permissões de escrita em `vendor/`
   - Proteja arquivos de configuração (`.env`, `config.php`)
   - Configure permissões adequadas em `uploads/` e `logs/`

5. **Backups**:
   - Realize backups periódicos do banco (`up_baloes`)
   - Monitore logs de acesso (`access_logs`)
   - Mantenha backups em local seguro

6. **Validação**:
   - Todas as entradas são sanitizadas
   - Uso de prepared statements (proteção contra SQL injection)
   - Validação de tipos e formatos

---

## ✨ Funcionalidades de UX

### Preservação de Dados do Formulário

- **Modal de Confirmação**: Os dados preenchidos no modal de confirmação de orçamento são automaticamente salvos no `localStorage` e restaurados quando o modal é reaberto.
- **Campos Preservados**: Nome, email, telefone, local do evento, tipo de serviço, tamanho do arco, descrição e observações.
- **Limpeza Automática**: Dados são limpos automaticamente após envio bem-sucedido da solicitação.

### Preenchimento Automático para Usuários Logados

- **Tela de Solicitação**: Quando um usuário logado acessa a página de solicitação, os campos de nome, email e telefone são preenchidos automaticamente com os dados da conta.
- **Modal de Confirmação**: No modal de confirmação do carrinho, os dados do usuário são carregados automaticamente, mas não sobrescrevem campos já preenchidos.
- **Priorização Inteligente**: Dados já preenchidos têm prioridade sobre dados do usuário logado.

### Sincronização de Dados

- **Carrinho → Modal**: Dados dos itens do carrinho e orçamentos personalizados são utilizados para preencher campos vazios no modal de confirmação.
- **Orçamentos Personalizados**: Informações de orçamentos personalizados (descrição, observações, local) são preservadas e sincronizadas.
- **Contexto do Decorador**: Todas as páginas mantêm o contexto do decorador através de variáveis JavaScript globais.

---

## 🐛 Correções e Melhorias Recentes

### Sistema Multi-Tenant

- ✅ **Páginas Dinâmicas PHP**: Conversão de páginas HTML estáticas para PHP dinâmico com contexto do decorador
- ✅ **Rotas Amigáveis**: Implementação de rotas amigáveis baseadas no slug do decorador
- ✅ **Preservação de Contexto**: Todas as páginas (carrinho, solicitação, minhas compras) mantêm o contexto do decorador
- ✅ **Identidade Visual**: Aplicação automática de cores e personalizações em todas as páginas

### Correções de Funcionalidades

- ✅ **Função `get_first_decorator`**: Adicionada para buscar automaticamente o primeiro decorador quando necessário
- ✅ **Validação de email**: Validação completa de email em todos os pontos de entrada
- ✅ **Tratamento de erros**: Melhorado tratamento de erros em todas as operações
- ✅ **URLs Corrigidas**: Correção de URLs incorretas (duplicação de localhost, nome do projeto)

### Melhorias de Segurança

- ✅ **Headers de segurança**: Configurados corretamente em todos os serviços
- ✅ **Validação de entrada**: Sanitização em todos os formulários
- ✅ **SQL Injection**: Proteção através de prepared statements
- ✅ **XSS Protection**: Proteção contra Cross-Site Scripting

### Melhorias de Performance

- ✅ **Otimização de queries**: Queries de banco de dados otimizadas
- ✅ **Cache de configurações**: Cache quando apropriado
- ✅ **Validação pré-processamento**: Validação de dados antes de processamento

---

## 📞 Suporte e Referências

### Documentação Adicional

- **Estrutura do banco**: `database/setup_mysql.sql`
- **Configurações globais**: `services/config.php`
- **Changelog completo**: `CHANGELOG.md`
- **Guia de instalação**: `INSTALACAO.md` (se disponível)

### Estrutura do Banco de Dados

Principais tabelas:
- `usuarios`: Usuários do sistema (clientes, decoradores, admins)
- `decorator_page_customization`: Personalizações das páginas dos decoradores
- `decorator_portfolio_items`: Itens do portfólio
- `solicitacoes`: Solicitações de serviços
- `orcamentos`: Orçamentos criados
- `disponibilidade`: Agenda dos decoradores
- `datas_bloqueadas`: Datas bloqueadas

### Contato

- **Dúvidas ou bugs**: Abra uma issue no repositório
- **Suporte técnico**: Entre em contato com a equipe responsável

---

## 🔍 Verificação de Erros

O projeto foi verificado e os seguintes problemas foram corrigidos:

✅ **Função ausente**: `get_first_decorator` adicionada em `services/admin.php`  
✅ **Validações**: Todas as validações de entrada estão funcionando corretamente  
✅ **Tratamento de erros**: Tratamento adequado de exceções em todos os serviços  
✅ **Segurança**: Headers de segurança configurados corretamente  
✅ **Compatibilidade**: Código compatível com PHP 7.4+ e MySQL 5.7+  
✅ **Multi-Tenant**: Sistema Multi-Tenant funcionando corretamente  
✅ **Rotas**: Rotas amigáveis configuradas e funcionando  
✅ **URLs**: URLs corrigidas e consistentes em todo o sistema  

---

## 📝 Notas Importantes

### Nome do Projeto

- O nome correto do projeto é **`Up.Bal-es`** (com hífen)
- O sistema detecta e corrige automaticamente referências a `Up.BaloesV3`
- URLs base sempre usam `Up.Bal-es`

### Desenvolvimento vs Produção

- **Desenvolvimento**: `ENVIRONMENT=development` no `.env`
- **Produção**: `ENVIRONMENT=production` no `.env` (desabilita exibição de erros)

### Migração de Versões

Ao atualizar o sistema:
1. Faça backup do banco de dados
2. Atualize as dependências: `composer update`
3. Execute scripts de migração (se houver)
4. Verifique as configurações do `.env`
5. Teste todas as funcionalidades

---

**Desenvolvido para Up.Baloes** 🎈

---

## 📄 Licença

[Especificar licença aqui]

---

## 👥 Contribuidores

[Lista de contribuidores]

---

**Última atualização**: 2025
