# Funcionalidade de Links Únicos para Decoradores

## Visão Geral

Esta funcionalidade permite que cada decorador tenha um link único no formato `www.upbaloes.com/{slug}`, onde o slug é um identificador amigável gerado automaticamente a partir do nome do decorador.

## Arquivos Criados/Modificados

### Novos Arquivos

1. **`database/add_slug_field_to_users.sql`** - Script SQL para adicionar campo slug
2. **`utils/slug-generator.php`** - Utilitário para geração de slugs
3. **`services/decorator.php`** - Serviço para gerenciar decoradores
4. **`decorator-page.php`** - Página que exibe dados do decorador
5. **`decorator-not-found.html`** - Página de erro 404
6. **`.htaccess`** - Configuração de rotas dinâmicas

### Arquivos Modificados

1. **`js/admin.js`** - Atualizado para gerar e exibir slugs

## Como Funciona

### 1. Geração de Slug

- O slug é gerado automaticamente a partir do nome do decorador
- Caracteres especiais e acentos são removidos
- Espaços são substituídos por hífens
- Se o slug já existir, um número é adicionado (ex: `joao-baloes-2`)

### 2. Banco de Dados

- Campo `slug` adicionado à tabela `usuarios`
- Índice único criado para garantir unicidade
- Triggers automáticos para gerar slug ao inserir/atualizar

### 3. Rotas Dinâmicas

- Arquivo `.htaccess` captura URLs no formato `/{slug}`
- Redireciona para `decorator-page.php` com o slug como parâmetro
- Exclui arquivos e diretórios existentes da captura

### 4. Página do Decorador

- Carrega dados do decorador pelo slug
- Exibe informações de contato, serviços e portfólio
- Design responsivo e otimizado para SEO

## Instalação

### 1. Executar Script SQL

```sql
-- Execute o arquivo database/add_slug_field_to_users.sql
-- no seu banco de dados MySQL
```

### 2. Configurar Servidor

- Certifique-se de que o mod_rewrite está habilitado
- O arquivo `.htaccess` deve estar na raiz do projeto

### 3. Verificar Permissões

- Diretório `utils/` deve ter permissão de leitura
- Diretório `services/` deve ter permissão de execução

## Uso

### Para Administradores

1. **Criar Decorador:**
   - Acesse a área administrativa
   - Vá em "Criar Decorador"
   - Preencha os dados
   - O slug será gerado automaticamente
   - Um modal mostrará o link único gerado

2. **Copiar Link:**
   - Na tabela de usuários, clique no ícone de link
   - O link será copiado para a área de transferência
   - Compartilhe com clientes

### Para Clientes

1. **Acessar Decorador:**
   - Digite `www.upbaloes.com/{slug}` no navegador
   - Exemplo: `www.upbaloes.com/joao-baloes`

2. **Visualizar Informações:**
   - Nome e informações de contato
   - Lista de serviços oferecidos
   - Portfólio de trabalhos realizados
   - Botão para solicitar orçamento

## Exemplos de Slugs

| Nome do Decorador | Slug Gerado |
|-------------------|-------------|
| João Silva | joao-silva |
| Maria Festas | maria-festas |
| Ana & Cia | ana-cia |
| José da Silva | jose-da-silva |
| Maria José | maria-jose |

## Tratamento de Erros

### Decorador Não Encontrado

- URL: `decorator-not-found.html`
- Exibe mensagem amigável
- Oferece opções para o usuário
- Lista outros decoradores disponíveis

### Slug Inválido

- Caracteres especiais são removidos
- Slugs vazios são rejeitados
- Validação no frontend e backend

## SEO e Otimização

### Meta Tags

- Título personalizado com nome do decorador
- Descrição otimizada para busca
- Open Graph para redes sociais

### Performance

- Cache de dados do decorador
- Compressão GZIP habilitada
- Imagens otimizadas

## Segurança

### Validação

- Sanitização de entrada
- Validação de slug
- Proteção contra SQL injection

### Acesso

- Apenas decoradores ativos são exibidos
- Verificação de permissões
- Logs de acesso

## Manutenção

### Atualizar Slug

```php
// Exemplo de como atualizar slug via API
$response = await fetch('services/decorator.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        action: 'update_slug',
        decorator_id: 123,
        new_name: 'Novo Nome'
    })
});
```

### Backup

- Sempre faça backup antes de executar scripts SQL
- Teste em ambiente de desenvolvimento primeiro

## Troubleshooting

### Problemas Comuns

1. **Slug não funciona:**
   - Verifique se mod_rewrite está habilitado
   - Confirme se .htaccess está na raiz

2. **Erro 500:**
   - Verifique logs do servidor
   - Confirme permissões de arquivo

3. **Slug duplicado:**
   - Execute o script SQL novamente
   - Verifique triggers do banco

### Logs

- Erros são logados em `../logs/error.log`
- Acessos são registrados em `access_logs`

## Futuras Melhorias

- [ ] Cache de páginas de decoradores
- [ ] Analytics de visualizações
- [ ] Sistema de avaliações
- [ ] Chat integrado
- [ ] Agendamento online
