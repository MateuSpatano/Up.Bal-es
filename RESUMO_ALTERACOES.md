# Resumo das Alterações Recentes

## 🔐 Autenticação e Segurança
- Login centralizado no `services/login.php` com tokens "lembrar-me", logs (`access_logs`) e bloqueio por perfil
- Novo fluxo de recuperação de senha com validação de token (`password_reset_tokens`) e página dedicada (`pages/reset-password.html`)
- Configuração de SMTP documentada no `.env` e na instalação para habilitar notificações por email
- Script SQL `database/setup_mysql.sql` atualizado com criação condicional de colunas (`whatsapp`, `instagram`, `email_comunicacao`) e índices

## 🎨 Portfólio do Decorador
- Serviço `services/portfolio.php` permite CRUD completo dos itens do portfólio autenticado
- `js/painel-decorador.js` sincroniza as ações de interface com o backend (listagem, criação, edição e limpeza)
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
- ✅ Endpoints criados em `services/admin.php`:
  - `get_page_customization`: Carrega configurações existentes
  - `save_page_customization`: Salva/atualiza configurações
- ✅ Validação de dados implementada
- ✅ Log de ações administrativas

### 5. Frontend - Página Pública
- ✅ `pagina-decorador.php` atualizado para usar personalizações
- ✅ Aplicação de cores via CSS variables
- ✅ Imagem de capa como background
- ✅ Redes sociais exibidas na seção de serviços
- ✅ SEO personalizado aplicado

### 6. Centralização de Variáveis de Ambiente
- ✅ Todas as variáveis de conexão com banco de dados centralizadas em `services/config.php`
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

1. **pages/admin.html** - Modal de edição adicionado
2. **js/admin.js** - Funções de edição e gerenciamento
3. **services/admin.php** - Endpoints de API
4. **pagina-decorador.php** - Aplicação de personalizações
5. **services/config.php** - Centralização de variáveis
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
- ✅ Todas centralizadas em `services/config.php`
- ✅ Uso de dotenv para carregamento
- ✅ Documentação completa no `env.example`
- ✅ Valores padrão para desenvolvimento
- ✅ Fácil configuração para deploy

---

## 🎯 Melhorias de UX: Preservação de Dados e Preenchimento Automático

### ✅ Funcionalidades Implementadas

### 1. Preservação Automática de Dados do Formulário
- ✅ Sistema de salvamento automático implementado no modal de confirmação de orçamento
- ✅ Dados são salvos no `localStorage` com a chave `upbaloes_confirm_form_data`
- ✅ Restauração automática ao reabrir o modal
- ✅ Campos preservados:
  - Nome completo do cliente
  - Email do cliente
  - Telefone do cliente
  - Local do evento
  - Tipo de serviço
  - Tamanho do arco (metros)
  - Descrição do evento
  - Observações adicionais
- ✅ Limpeza automática após envio bem-sucedido

### 2. Preenchimento Automático para Usuários Logados
- ✅ Tela de solicitação de serviço personalizado (`solicitacao-cliente.html`)
  - Verifica se o usuário está logado ao carregar a página
  - Preenche automaticamente: nome, email e telefone
  - Funciona apenas se o usuário tiver token de autenticação válido

- ✅ Modal de confirmação do carrinho (`carrinho-cliente.html`)
  - Carrega dados do usuário logado automaticamente
  - Não sobrescreve campos já preenchidos
  - Prioriza dados específicos do formulário sobre dados da conta

### 3. Sincronização de Dados entre Telas
- ✅ Dados dos itens do carrinho são utilizados para preencher campos vazios
- ✅ Informações de orçamentos personalizados são preservadas
- ✅ Integração entre carrinho, modal e tela de solicitação

### 📝 Arquivos Modificados

1. **js/carrinho-cliente.js**
   - Função `saveFormData()`: Salva dados do formulário no localStorage
   - Função `restoreFormData()`: Restaura dados salvos ao abrir o modal
   - Função `setupFormAutoSave()`: Configura salvamento automático em tempo real
   - Função `loadUserData()`: Melhorada para não sobrescrever campos preenchidos
   - Função `openConfirmModal()`: Restaura dados e carrega informações do usuário
   - Função `closeConfirmModal()`: Salva dados antes de fechar

2. **js/solicitacao-cliente.js**
   - Função `loadUserDataIfLoggedIn()`: Verifica login e preenche campos automaticamente
   - Integrada na função `init()` para execução ao carregar a página

### 🔧 Detalhes Técnicos

**Armazenamento:**
- Chave do localStorage: `upbaloes_confirm_form_data`
- Formato: JSON com todos os campos do formulário
- Persistência: Mantida até envio bem-sucedido ou limpeza manual

**Priorização de Dados:**
1. Dados já preenchidos no formulário (maior prioridade)
2. Dados salvos no localStorage
3. Dados do usuário logado
4. Dados dos itens do carrinho/orçamentos

**Event Listeners:**
- Configurados para campos: `input` e `change`
- Sistema de flags para evitar duplicação
- Remoção automática após envio bem-sucedido

### ✨ Benefícios

- ✅ Melhor experiência do usuário: dados não são perdidos ao fechar o modal
- ✅ Redução de retrabalho: usuários não precisam preencher novamente
- ✅ Preenchimento inteligente: dados da conta são utilizados automaticamente
- ✅ Compatibilidade: funciona com usuários logados e não logados
- ✅ Performance: uso eficiente do localStorage

### ⚠️ Observações Importantes

1. **Compatibilidade**: Funciona com todos os navegadores modernos que suportam localStorage
2. **Limpeza**: Dados são limpos automaticamente após envio bem-sucedido
3. **Segurança**: Dados são armazenados localmente no navegador (não enviados ao servidor até o envio)
4. **Validação**: Mantida a validação existente do formulário
5. **Performance**: Salvamento ocorre apenas quando há mudanças nos campos







