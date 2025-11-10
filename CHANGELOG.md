# 📋 Changelog - Limpeza do Projeto

## 2025-11-10 — Autenticação reforçada e portfólio dos decoradores

- 🔐 Login centralizado no `services/login.php` agora suporta tokens "lembrar-me", logs de acesso e recuperação de senha por email
- ✉️ Fluxo completo de redefinição de senha com página dedicada (`pages/reset-password.html`) e script `js/reset-password.js`
- 🗂️ Novo serviço `services/portfolio.php` permitindo CRUD do portfólio diretamente pelo painel do decorador
- 🗄️ Script `database/setup_mysql.sql` atualizado com tabelas `remember_tokens`, `password_reset_tokens`, `access_logs`, `decorator_page_customization` e `decorator_portfolio_items`
- 🧩 Ajustes no frontend (`js/login.js`, `js/admin.js`, `js/painel-decorador.js`) para consumir os novos endpoints e validar fluxos
- 📝 Documentação (`README.md`, `INSTALACAO.md`, `RESUMO_ALTERACOES.md`) revisada para refletir as funcionalidades atuais e a configuração de SMTP

## ✅ Arquivos Removidos

### Documentação Excessiva
- `ACESSO-DESENVOLVIMENTO.md`
- `ALTERACOES-FORMULARIO-DECORADOR.md`
- `CORRECOES-PORTFOLIO-DECORADOR.md`
- `GUIA-LANCAMENTO-CUSTOS.md`
- `GUIA-USO-NOTIFICACOES.md`
- `INICIO-RAPIDO-SUPORTE.md`
- `INSTALACAO.md` (substituído por versão limpa)
- `RESUMO-IMPLEMENTACAO-SUPORTE.md`
- `SISTEMA-SUPORTE-COMPLETO.md`
- `docs/ANALISE_COMPLETA.md`
- `docs/COMPOSER_INSTALACAO.md`
- `docs/README.md`

### Scripts SQL Desnecessários
- `database/adicionar_campo_*.sql` (15 arquivos)
- `database/atualizar_*.sql` (3 arquivos)
- `database/criar_tabela_*.sql` (4 arquivos)

### Imagens de Exemplo
- `Images/Image 1.jpeg` até `Images/Image 20.jpeg` (20 arquivos)

### Arquivos de Configuração
- `instalar-dependencias.bat`
- `decorador-nao-encontrado.html`

### Pastas Vazias
- `components/` (pasta vazia)
- `docs/` (pasta vazia)

## ✅ Arquivos Criados/Atualizados

### Documentação Essencial
- `README.md` - Documentação principal limpa e objetiva
- `INSTALACAO.md` - Guia de instalação simplificado
- `env.example` - Arquivo de configuração de exemplo
- `CHANGELOG.md` - Este arquivo de mudanças

### Correções
- Corrigidas referências de `config.new.php` para `config.php` em:
  - `services/auth_middleware.php`
  - `api/login.php`

## 📊 Resultado Final

### Estrutura Limpa
```
Up.BaloesV3/
├── api/                    # Endpoints REST (2 arquivos)
├── services/               # Backend PHP (11 arquivos)
├── pages/                  # Frontend HTML (6 arquivos)
├── js/                     # Scripts JavaScript (7 arquivos)
├── css/                    # Estilos CSS (5 arquivos)
├── database/               # Scripts SQL (1 arquivo)
├── Images/                 # Imagens essenciais (2 arquivos)
├── utils/                  # Utilitários (1 arquivo)
├── vendor/                 # Dependências PHP
├── README.md               # Documentação principal
├── INSTALACAO.md           # Guia de instalação
├── env.example             # Configuração de exemplo
└── CHANGELOG.md            # Log de mudanças
```

### Benefícios da Limpeza
- ✅ Projeto mais organizado e fácil de navegar
- ✅ Documentação focada no essencial
- ✅ Menos arquivos desnecessários
- ✅ Estrutura clara para desenvolvedores
- ✅ Instalação simplificada
- ✅ Manutenção mais fácil

## 🎯 Próximos Passos

1. **Para Desenvolvedores:**
   - Siga o `README.md` para entender o projeto
   - Use `INSTALACAO.md` para configurar o ambiente
   - Configure o arquivo `.env` baseado no `env.example`

2. **Para Produção:**
   - Configure credenciais reais no `.env`
   - Configure backup do banco de dados
   - Configure HTTPS

---

**Projeto limpo e otimizado para desenvolvimento!** 🎈
