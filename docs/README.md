# 📚 Documentação Completa - Up.Baloes

Índice de toda a documentação do sistema Up.Baloes.

---

## 🚀 Guias de Instalação

### Essencial
- **[../INSTALACAO.md](../INSTALACAO.md)** ⭐ Guia principal de instalação (5 passos)
- **[COMPOSER_INSTALACAO.md](COMPOSER_INSTALACAO.md)** - Como instalar o Composer

### Guias Adicionais (se disponíveis na raiz)
- ../INICIO_RAPIDO.md - Configure em 5 minutos
- ../SETUP_RAPIDO_BANCO.md - Setup do banco rápido
- ../COMO_TESTAR.md - Como testar o sistema

---

## 🔐 Autenticação e Segurança

### JWT e Google OAuth (se disponíveis na raiz)
- ../INSTALACAO_JWT_GOOGLE.md - Guia completo de implementação
- ../README_AUTH.md - Visão geral do sistema
- ../RESUMO_IMPLEMENTACAO.md - Detalhes técnicos

### Funcionalidades Implementadas
- ✅ Autenticação JWT com tokens de 8 horas
- ✅ Login com Google OAuth 2.0
- ✅ Middleware de proteção de rotas
- ✅ Gestão segura de credenciais via .env
- ✅ Apenas e-mails pré-cadastrados podem usar Google OAuth

---

## 🗄️ Banco de Dados

### Scripts SQL Oficiais
Localizados em: `../database/`

- `setup_mysql.sql` - Estrutura completa do banco
- `adicionar_campo_google_email.sql` - Campo para Google OAuth
- Outros scripts para adicionar campos e atualizações

### Documentação (se disponível na raiz)
- ../CONFIGURACAO_MYSQL.md - Configuração do MySQL

---

## 🔧 Configuração

### Templates de Variáveis de Ambiente

**Para Testes:**
```bash
copy ../.env.teste .env
```
- Dados fictícios funcionais
- Chave JWT já configurada
- Pronto para usar

**Para Produção:**
```bash
copy ../.env.example .env
```
- Template vazio
- Preencha com dados reais

### Configurações Mínimas (.env)

```env
# Banco de Dados
DB_HOST=localhost
DB_NAME=up_baloes
DB_USER=root
DB_PASS=

# JWT
JWT_SECRET=sua_chave_jwt_aqui
JWT_EXPIRATION=28800

# Sistema
BASE_URL=http://localhost/Up.BaloesV3
ENVIRONMENT=development
```

### Configurações Opcionais (.env)

```env
# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_secret

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=sua-senha
```

---

## 🧪 Testando

### Criar Usuário Admin de Teste

```sql
USE up_baloes;
INSERT INTO usuarios (nome, email, senha, perfil, ativo, aprovado_por_admin, created_at) 
VALUES (
    'Administrador',
    'admin@upbaloes.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin', 1, 1, NOW()
);
```

**Credenciais:**  
Email: admin@upbaloes.com  
Senha: admin123

### Acessar o Sistema

```
http://localhost/Up.BaloesV3/pages/login.html
```

---

## 📖 Guias por Tarefa

### Quero instalar o sistema
→ [../INSTALACAO.md](../INSTALACAO.md)

### Quero entender JWT e Google OAuth
→ ../INSTALACAO_JWT_GOOGLE.md (se disponível na raiz)

### Não consigo instalar Composer
→ [COMPOSER_INSTALACAO.md](COMPOSER_INSTALACAO.md)

### Tenho problemas com o banco
→ ../CONFIGURACAO_MYSQL.md (se disponível na raiz)

### Quero testar rapidamente
→ ../COMO_TESTAR.md (se disponível na raiz)

---

## 🎯 Próximos Passos

1. ✅ Leia [../INSTALACAO.md](../INSTALACAO.md)
2. ✅ Execute `composer install`
3. ✅ Configure o `.env`
4. ✅ Crie o banco de dados
5. ✅ Teste o sistema!

---

## 📞 Problemas?

| Erro | Solução |
|------|---------|
| Composer não encontrado | [COMPOSER_INSTALACAO.md](COMPOSER_INSTALACAO.md) |
| Class not found | Execute: `composer install` |
| Erro de banco | Verifique credenciais no `.env` |
| Login não funciona | Crie usuário admin (SQL acima) |

---

## 📂 Arquivos Essenciais do Projeto

### Raiz (Apenas Essenciais)
```
✅ index.html                    - Página inicial
✅ README.md                     - Documentação principal
✅ INSTALACAO.md                 - Guia de instalação
✅ composer.json                 - Dependências
✅ .env.teste                    - Config de teste
✅ .env.example                  - Template vazio
✅ instalar-dependencias.bat    - Instalador
✅ google-callback.php           - OAuth handler
✅ LICENSE                       - Licença
```

### Pastas
```
✅ api/          - Endpoints REST
✅ services/     - Backend PHP
✅ pages/        - Frontend HTML
✅ js/           - Scripts
✅ css/          - Estilos
✅ database/     - Scripts SQL oficiais
✅ docs/         - Documentação (esta pasta)
✅ Images/       - Assets
✅ utils/        - Utilitários
```

---

© 2024 Up.Baloes - Todos os direitos reservados
