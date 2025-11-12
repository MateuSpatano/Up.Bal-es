# 📝 Por Que o Arquivo .env Está "Bloqueado"

## 🔒 Motivo do Bloqueio

O arquivo `.env` está configurado para ser **ignorado pelo Git** (através do `.gitignore`), o que é uma **boa prática de segurança**. Isso impede que informações sensíveis sejam commitadas no repositório.

Além disso, o **Cursor** (e outros editores) podem bloquear a edição direta de arquivos `.env` por segurança, já que eles contêm:
- Senhas de banco de dados
- Chaves secretas (JWT_SECRET)
- Credenciais de email
- Outras informações sensíveis

## ✅ Status Atual

- ✅ Arquivo `.env` existe e está acessível
- ✅ Não está marcado como somente leitura
- ✅ Está no `.gitignore` (correto!)
- ⚠️ Pode estar bloqueado no editor por segurança

## 💡 Como Editar o Arquivo .env

### Opção 1: Editor de Texto (Recomendado)
```bash
notepad .env
```
ou
```bash
code .env
```

### Opção 2: PowerShell
```powershell
notepad .env
```

### Opção 3: Via Terminal
```bash
# Ver conteúdo
Get-Content .env

# Editar (abre no editor padrão)
notepad .env
```

## 📋 Configurações Importantes no .env

Certifique-se de configurar:

```env
# Banco de Dados (OBRIGATÓRIO)
DB_HOST=localhost
DB_NAME=up_baloes
DB_USER=root
DB_PASS=sua_senha_mysql_aqui

# JWT (OBRIGATÓRIO - já configurado)
JWT_SECRET=TXtTNWmzdc19wPl40SUhGD0WBh+UwtnB2FCTE3WzjRU=

# URL do Sistema
BASE_URL=http://localhost/Up.BaloesV3
```

## ⚠️ Importante

- **NUNCA** commite o arquivo `.env` no Git
- **NUNCA** compartilhe o arquivo `.env` publicamente
- **SEMPRE** use o `env.example` como referência
- **MANTENHA** o `.env` no `.gitignore`

## 🔐 Segurança

O bloqueio do `.env` é uma **proteção**, não um problema! Isso garante que:
- Senhas não sejam expostas acidentalmente
- Chaves secretas permaneçam seguras
- Credenciais não sejam commitadas no Git

---

**O arquivo está funcionando corretamente!** Use um editor de texto para modificá-lo quando necessário.

