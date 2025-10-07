# 📦 Guia de Instalação - Up.Baloes

## 🎯 Requisitos

- PHP 7.4 ou superior
- MySQL 5.7 ou superior
- Composer (gerenciador de dependências PHP)
- Servidor web (Apache/Nginx/XAMPP/WAMP)

---

## 🚀 Instalação em 5 Passos

### 1️⃣ Instalar Composer

**Windows:**
```
Baixe: https://getcomposer.org/Composer-Setup.exe
Execute o instalador
Reinicie o terminal
```

**Linux/Mac:**
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

📖 Guia detalhado: [docs/COMPOSER_INSTALACAO.md](docs/COMPOSER_INSTALACAO.md)

### 2️⃣ Instalar Dependências

**Opção A - Automático (Windows):**
```
Dê duplo clique em: instalar-dependencias.bat
```

**Opção B - Manual:**
```bash
composer install
```

Isso instalará:
- `firebase/php-jwt` - Autenticação JWT
- `vlucas/phpdotenv` - Variáveis de ambiente

### 3️⃣ Configurar Ambiente

**Copiar template:**
```bash
# Para testes (com dados fictícios)
copy .env.teste .env

# Para produção (preencher manualmente)
copy .env.example .env
```

**Editar o arquivo `.env`:**
```env
# Banco de Dados (OBRIGATÓRIO)
DB_HOST=localhost
DB_NAME=up_baloes
DB_USER=root
DB_PASS=sua_senha_aqui

# JWT (OBRIGATÓRIO - use a chave que já vem no .env.teste ou gere nova)
JWT_SECRET=dGVzdGVfand0X3NlY3JldF9rZXlfZm9yX3VwX2JhbG9lc19zeXN0ZW1fMjAyNA==

# Sistema
BASE_URL=http://localhost/Up.BaloesV3
ENVIRONMENT=development
```

**Gerar nova chave JWT (opcional):**
```bash
# Linux/Mac
openssl rand -base64 32

# Ou use: https://generate-secret.vercel.app/32
```

### 4️⃣ Configurar Banco de Dados

```bash
# 1. Abrir MySQL
mysql -u root -p

# 2. Criar banco de dados
CREATE DATABASE up_baloes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# 3. Criar estrutura do banco
mysql -u root -p up_baloes < database/setup_mysql.sql

# 4. Adicionar campo Google Email
mysql -u root -p up_baloes < database/adicionar_campo_google_email.sql
```

### 5️⃣ Criar Usuário Administrador

```sql
# Execute no MySQL:
USE up_baloes;

INSERT INTO usuarios (nome, email, senha, perfil, ativo, aprovado_por_admin, created_at) 
VALUES (
    'Administrador',
    'admin@upbaloes.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    1,
    1,
    NOW()
);
```

**Credenciais:**
- Email: admin@upbaloes.com
- Senha: admin123

---

## ✅ Verificar Instalação

### 1. Acessar o sistema
```
http://localhost/Up.BaloesV3
```

### 2. Fazer login
```
URL: http://localhost/Up.BaloesV3/pages/login.html
Email: admin@upbaloes.com
Senha: admin123
```

### 3. Testar API JWT
```bash
curl -X POST http://localhost/Up.BaloesV3/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@upbaloes.com","password":"admin123"}'
```

Deve retornar um token JWT!

---

## 🔧 Configuração do Google OAuth (Opcional)

Para ativar o login com Google:

### 1. Criar Projeto no Google Cloud

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto
3. Vá em "APIs e Serviços" → "Credenciais"
4. Clique em "Criar Credenciais" → "ID do cliente OAuth"

### 2. Configurar OAuth

- **Tipo:** Aplicativo da Web
- **URIs autorizadas:**
  ```
  http://localhost
  http://localhost/Up.BaloesV3
  ```
- **URIs de redirecionamento:**
  ```
  http://localhost/Up.BaloesV3/google-callback.php
  ```

### 3. Atualizar .env

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost/Up.BaloesV3/google-callback.php
```

📖 Guia completo: [docs/INSTALACAO_JWT_GOOGLE.md](docs/INSTALACAO_JWT_GOOGLE.md)

---

## 🐛 Solução de Problemas

### ❌ Composer não encontrado
```
Instale: https://getcomposer.org/Composer-Setup.exe
```

### ❌ Class 'Dotenv\Dotenv' not found
```bash
composer install
```

### ❌ Cannot connect to database
```
Verifique as credenciais no arquivo .env:
- DB_HOST, DB_NAME, DB_USER, DB_PASS
```

### ❌ Table 'usuarios' doesn't exist
```bash
mysql -u root -p up_baloes < database/setup_mysql.sql
```

### ❌ Login não funciona
```
1. Verifique se criou o usuário admin
2. Verifique se o .env está configurado
3. Verifique se as dependências estão instaladas
```

📖 Mais soluções: [docs/COMO_TESTAR.md](docs/COMO_TESTAR.md)

---

## 📚 Documentação Completa

- [docs/README.md](docs/README.md) - Índice de todos os guias
- [docs/COMO_TESTAR.md](docs/COMO_TESTAR.md) - Como testar o sistema
- [docs/INSTALACAO_JWT_GOOGLE.md](docs/INSTALACAO_JWT_GOOGLE.md) - JWT e Google OAuth
- [docs/COMPOSER_INSTALACAO.md](docs/COMPOSER_INSTALACAO.md) - Instalar Composer

---

## ✅ Checklist Final

- [ ] Composer instalado e funcionando
- [ ] `composer install` executado com sucesso
- [ ] Arquivo `.env` criado e configurado
- [ ] Banco de dados `up_baloes` criado
- [ ] Scripts SQL executados (setup_mysql.sql + adicionar_campo_google_email.sql)
- [ ] Usuário admin criado
- [ ] Sistema acessível em http://localhost/Up.BaloesV3
- [ ] Login funcionando
- [ ] Sem erros no console do navegador (F12)

---

**Tudo pronto!** 🎉 Agora você pode usar o sistema!

© 2024 Up.Baloes
