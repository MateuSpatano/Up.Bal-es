# 🔧 Configuração do Banco de Dados - Guia Rápido

## ⚠️ IMPORTANTE: Segurança

**NUNCA faça commit do arquivo `.env` no Git!** Ele contém credenciais sensíveis e está protegido pelo `.gitignore`.

---

## 🚀 Configuração Rápida (5 minutos)

### Passo 1: Copiar arquivo de exemplo

```bash
# Windows (PowerShell)
Copy-Item env.example .env

# Linux/Mac
cp env.example .env
```

### Passo 2: Editar o arquivo `.env`

Abra o arquivo `.env` criado e configure suas credenciais:

```env
# ===========================================
# AMBIENTE
# ===========================================
ENVIRONMENT=development

# ===========================================
# BANCO DE DADOS MYSQL
# ===========================================
DB_HOST=localhost
DB_NAME=up_baloes
DB_USER=root
DB_PASS=sua_senha_mysql_aqui
DB_PORT=3306

# ===========================================
# JWT (JSON Web Tokens)
# ===========================================
JWT_SECRET=sua_chave_secreta_jwt_aqui
JWT_EXPIRATION=28800

# ===========================================
# URL DO SISTEMA
# ===========================================
BASE_URL=http://localhost/Up.BaloesV3

# ===========================================
# EMAIL SMTP (Opcional)
# ===========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@upbaloes.com
SMTP_FROM_NAME=Up.Baloes System
```

### Passo 3: Configurar Banco de Dados

#### 3.1 Criar o banco de dados

```sql
CREATE DATABASE up_baloes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3.2 Executar script SQL

```bash
# Windows (PowerShell)
mysql -u root -p up_baloes < database/setup_mysql.sql

# Linux/Mac
mysql -u root -p up_baloes < database/setup_mysql.sql
```

### Passo 4: Criar usuário administrador (opcional)

```sql
USE up_baloes;

INSERT INTO usuarios (nome, email, senha, perfil, ativo, aprovado_por_admin, is_active, is_admin) 
VALUES (
    'Administrador',
    'admin@upbaloes.com',
    '$2y$12$1jyUYLSwquFx8Ynz67aLR.Pgku1p.UxeAljf7w3ksOaBtcNX6c/RS', -- senha: admin123
    'admin',
    1,
    1,
    1,
    1
);
```

---

## 📋 Configurações Mínimas Necessárias

Para o sistema funcionar, você precisa configurar pelo menos:

```env
ENVIRONMENT=development
DB_HOST=localhost
DB_NAME=up_baloes
DB_USER=root
DB_PASS=sua_senha
DB_PORT=3306
JWT_SECRET=qualquer_chave_secreta_aqui
BASE_URL=http://localhost/Up.BaloesV3
```

---

## 🔍 Verificar Configuração

### Teste 1: Verificar se o arquivo existe

```bash
# Windows
Test-Path .env

# Linux/Mac
ls -la .env
```

### Teste 2: Verificar conexão com banco

Acesse no navegador:
```
http://localhost/Up.BaloesV3/services/login.php
```

Se aparecer erro de método não permitido, está funcionando! (O endpoint espera POST)

---

## 🆘 Problemas Comuns

### Problema: "Arquivo .env não encontrado"

**Solução:** Copie o `env.example` para `.env`:
```bash
cp env.example .env
```

### Problema: "Erro de conexão com banco"

**Verificações:**
1. ✅ MySQL está rodando?
2. ✅ Credenciais no `.env` estão corretas?
3. ✅ Banco de dados `up_baloes` existe?
4. ✅ Usuário tem permissão para acessar o banco?

### Problema: "Access denied for user"

**Solução:** Verifique `DB_USER` e `DB_PASS` no arquivo `.env`

---

## 📝 Checklist de Configuração

- [ ] Arquivo `.env` criado a partir do `env.example`
- [ ] Credenciais do banco configuradas no `.env`
- [ ] Banco de dados `up_baloes` criado
- [ ] Script `setup_mysql.sql` executado
- [ ] Usuário admin criado (opcional)
- [ ] MySQL está rodando
- [ ] Teste de conexão realizado

---

## 🔐 Segurança

- ✅ Arquivo `.env` está no `.gitignore` (não será commitado)
- ✅ Cada desenvolvedor cria seu próprio `.env` localmente
- ✅ Credenciais nunca são compartilhadas no Git
- ✅ Use `env.example` como referência

---

**Última atualização:** 2024

