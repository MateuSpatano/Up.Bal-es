# 🚀 Guia de Instalação - Up.Baloes

## Pré-requisitos
- PHP 7.4 ou superior
- MySQL 5.7 ou superior
- Composer
- Servidor web (Apache/Nginx)

## Passo a Passo

### 1. Instalar Dependências PHP
```bash
composer install
```

### 2. Configurar Banco de Dados
```bash
# Criar banco de dados
mysql -u root -p
CREATE DATABASE up_baloes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Importar estrutura
mysql -u root -p up_baloes < database/setup_mysql.sql
```

### 3. Configurar Ambiente
```bash
# Copiar arquivo de configuração
cp env.example .env

# Editar configurações
nano .env
```

**Configurações mínimas necessárias:**
```env
DB_HOST=localhost
DB_NAME=up_baloes
DB_USER=root
DB_PASS=sua_senha_mysql
JWT_SECRET=sua_chave_jwt_aqui
```

### 4. Configurar envio de emails (opcional)
- Edite as variáveis `SMTP_*` no arquivo `.env` com as credenciais do seu provedor (Gmail, Outlook, etc.)
- O envio de emails é necessário para a recuperação de senha e notificações automáticas
- Em ambientes de desenvolvimento, utilize senhas de aplicativo ou serviços de sandbox (Mailtrap, Mailhog)

### 5. Testar Instalação
1. Acesse: `http://localhost/Up.BaloesV3`
2. Faça login com: admin@upbaloes.com / admin123
3. Verifique se o painel administrativo carrega

## Solução de Problemas

### Erro: "Composer não encontrado"
```bash
# Instalar Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### Erro: "Cannot connect to database"
- Verifique se o MySQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão: `mysql -u root -p up_baloes`

### Erro: "Class not found"
```bash
composer install --no-dev
```

## Próximos Passos
1. Personalize o sistema
2. Configure backup do banco
3. Deploy em produção
