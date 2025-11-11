# Resumo das Alterações Recentes

## 🔐 Autenticação e Segurança
- Login centralizado no `App\Http\Controllers\Api\AuthController` com tokens "lembrar-me", logs (`access_logs`) e bloqueio por perfil
- Novo fluxo de recuperação de senha com validação de token (`password_reset_tokens`) e página dedicada (`resources/views/legacy/reset-password.blade.php`)
- Configuração de SMTP documentada no `.env` e na instalação para habilitar notificações por email
- Migrações do Laravel (`laravel/database/migrations/`) gerenciam toda a estrutura do banco de dados, incluindo colunas (`whatsapp`, `instagram`, `email_comunicacao`) e índices

## 🎨 Portfólio do Decorador
- API `App\Http\Controllers\Api\PortfolioController` permite CRUD completo dos itens do portfólio autenticado
- `laravel/public/js/painel-decorador.js` sincroniza as ações de interface com o backend (listagem, criação, edição e limpeza)
- Dados persistidos na tabela `decorator_portfolio_items`, com suporte a upload de imagens e ordenação
- Integração com o painel administrativo para gerar links e comunicar atualizações entre abas

## 🧩 Personalização da Página do Decorador

### ✅ Funcionalidades Implementadas

### 1. Botão de Edição no Admin
- ✅ Adicionado botão "Editar Tela Inicial" (ícone de paleta) na listagem de usuários para cada decorador
- ✅ Botão aparece apenas para decoradores que possuem slug/URL

### 2. Interface de Edição Completa
- ✅ Modal de edição com 5 abas organizadas:
  - **Conteúdo**: Título, descrição e texto de boas-vindas
  - **Visual**: Imagem de capa, cores primária, secundária e de destaque
  - **Serviços**: Configuração de serviços (preparado para expansão)
  - **Redes Sociais**: Facebook, Instagram, WhatsApp, YouTube
  - **SEO**: Meta título, descrição e palavras-chave

### 3. Banco de Dados
- ✅ Nova tabela `decorator_page_customization` criada
- ✅ Script SQL disponível em `database/add_page_customization.sql`
- ✅ Campos para todos os elementos personalizáveis

### 4. Backend PHP
- ✅ Endpoints criados em `App\Http\Controllers\Api\AdminController`:
  - `get_page_customization`: Carrega configurações existentes
  - `save_page_customization`: Salva/atualiza configurações
- ✅ Validação de dados implementada
- ✅ Log de ações administrativas

### 5. Frontend - Página Pública
- ✅ `resources/views/legacy/painel-decorador.blade.php` atualizado para usar personalizações
- ✅ Aplicação de cores via CSS variables
- ✅ Imagem de capa como background
- ✅ Redes sociais exibidas na seção de serviços
- ✅ SEO personalizado aplicado

- ✅ Todas as variáveis de conexão com banco de dados centralizadas em `config/upbaloes.php`
- ✅ Uso de `vlucas/phpdotenv` para carregar `.env`
- ✅ Variáveis organizadas por categoria no `env.example`
- ✅ Valores padrão definidos para desenvolvimento
- ✅ Fácil configuração para produção

### 📋 Estrutura de Tabelas do Banco de Dados

### Nova Tabela: `decorator_page_customization`

**Campos principais:**
- `decorator_id` (INT, FK para usuarios)
- `page_title` (VARCHAR 255) - Título da página
- `page_description` (TEXT) - Descrição da página
- `welcome_text` (TEXT) - Texto de boas-vindas
- `cover_image_url` (VARCHAR 500) - URL da imagem de capa
- `primary_color`, `secondary_color`, `accent_color` (VARCHAR 7) - Cores hex
- `social_media` (JSON) - Links de redes sociais
- `meta_title`, `meta_description`, `meta_keywords` - SEO
- `is_active` (BOOLEAN) - Status da personalização
- `created_at`, `updated_at` (TIMESTAMP)

**Relacionamentos:**
- Foreign Key para `usuarios(id)` com CASCADE DELETE
- Unique constraint em `decorator_id`

### 🔧 Variáveis de Ambiente Centralizadas

### Banco de Dados
- `DB_HOST` - Host do MySQL
- `DB_NAME` - Nome do banco de dados
- `DB_USER` - Usuário do banco
- `DB_PASS` - Senha do banco
- `DB_PORT` - Porta do MySQL (padrão: 3306)

### Sistema
- `ENVIRONMENT` - development ou production
- `BASE_URL` - URL base do sistema
- `JWT_SECRET` - Chave secreta para JWT
- `JWT_EXPIRATION` - Tempo de expiração do token

### Email (Opcional)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`

### 📝 Arquivos Modificados

1. **resources/views/legacy/admin.blade.php** - Modal de edição adicionado
2. **laravel/public/js/admin.js** - Funções de edição e gerenciamento
3. **App/Http/Controllers/Api/AdminController.php** - Endpoints de API
4. **resources/views/legacy/painel-decorador.blade.php** - Aplicação de personalizações
5. **config/upbaloes.php** - Centralização de variáveis
6. **env.example** - Documentação completa das variáveis
7. **database/add_page_customization.sql** - Script de criação da tabela

### 🚀 Como Usar

### 1. Executar Script SQL
```bash
mysql -u root -p up_baloes < database/add_page_customization.sql
```

### 2. Configurar Variáveis de Ambiente
```bash
cp env.example .env
# Editar .env com suas configurações
```

### 3. Acessar Funcionalidade
1. Faça login como Admin
2. Vá em "Gerenciar Usuários"
3. Clique no ícone de paleta ao lado de um decorador
4. Edite os campos desejados
5. Salve as alterações

### ⚠️ Observações Importantes

1. **Tabela do Banco**: É necessário executar o script SQL `database/add_page_customization.sql` antes de usar a funcionalidade.

2. **Variáveis de Ambiente**: O sistema usa valores padrão se o arquivo `.env` não existir, mas é recomendado criar o arquivo para produção.

3. **Compatibilidade**: O código mantém compatibilidade com decoradores que não possuem personalização, usando valores padrão.

4. **Segurança**: Todas as entradas são sanitizadas antes de salvar no banco de dados.

### ✨ Melhorias Implementadas

- ✅ Interface visual moderna e intuitiva
- ✅ Validação de dados no frontend e backend
- ✅ Contadores de caracteres para campos SEO
- ✅ Sincronização entre color picker e input de texto
- ✅ Preview da página antes de salvar
- ✅ Sistema de tabs para organização
- ✅ Valores padrão quando não há personalização

### 📊 Resumo Final

**Alterações na Estrutura de Tabelas:**
- ✅ **SIM, houve alteração**: Nova tabela `decorator_page_customization` criada
- ✅ Script SQL fornecido para aplicação
- ✅ Sem modificações em tabelas existentes
- ✅ Compatível com estrutura atual

**Variáveis de Ambiente:**
- ✅ Todas centralizadas em `config/upbaloes.php`
- ✅ Uso de dotenv para carregamento
- ✅ Documentação completa no `env.example`
- ✅ Valores padrão para desenvolvimento
- ✅ Fácil configuração para deploy







