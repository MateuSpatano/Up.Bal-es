# 🎈 Up.Baloes - Sistema de Gestão de Decoração com Balões

Sistema web completo para gestão de serviços de decoração com balões, desenvolvido com HTML5, CSS3, JavaScript e PHP.

## 🚀 Funcionalidades

### ✨ **Sistema de Autenticação**
- Login e cadastro de usuários
- Recuperação de senha
- Controle de sessão seguro
- Diferentes níveis de acesso (Cliente, Decorador, Admin)

### 🎨 **Painel do Decorador**
- Dashboard com métricas e estatísticas
- Gerenciamento de portfólio
- Sistema de agenda integrado
- Controle de disponibilidade
- Gestão de datas bloqueadas
- Criação e gerenciamento de orçamentos

### 👑 **Área Administrativa**
- Dashboard administrativo completo
- Gerenciamento de usuários
- Criação de contas de decoradores
- Relatórios e estatísticas
- Controle total do sistema

### 📋 **Sistema de Orçamentos**
- 5 tipos de serviços especializados:
  - Arco Tradicional
  - Arco Desconstruído
  - Escultura de Balão
  - Centro de Mesa
  - Balões na Piscina
- Upload de imagens de inspiração
- Controle de status (Pendente, Aprovado, Recusado, Cancelado)
- Sistema de logs completo

### 📱 **Design Responsivo**
- Interface moderna e intuitiva
- Totalmente responsivo para mobile, tablet e desktop
- Animações suaves e efeitos visuais
- Tema consistente em todo o sistema

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com TailwindCSS
- **JavaScript (ES6+)** - Interatividade e validações
- **Font Awesome** - Ícones
- **Chart.js** - Gráficos e estatísticas
- **FullCalendar** - Sistema de agenda

### **Backend**
- **PHP 7.4+** - Lógica de negócio
- **MySQL 5.7+** - Banco de dados
- **PDO** - Conexão segura com banco
- **JSON** - Comunicação API

### **Recursos**
- **CORS** - Comunicação entre frontend e backend
- **Sessions** - Controle de autenticação
- **Password Hashing** - Segurança de senhas
- **File Upload** - Upload de imagens
- **Email Integration** - Sistema de notificações

## 📦 Instalação

### **Pré-requisitos**
- PHP 7.4 ou superior
- MySQL 5.7 ou superior
- Servidor web (Apache/Nginx)
- Extensões PHP: PDO, PDO_MySQL, JSON

### **1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/up-baloes.git
cd up-baloes
```

### **2. Configure o banco de dados**
```bash
# Execute o script de configuração
mysql -u root -p < database/setup_mysql.sql
```

### **3. Configure as credenciais**
Edite o arquivo `services/config.php`:
```php
$database_config = [
    'host' => 'localhost',
    'dbname' => 'up_baloes',
    'username' => 'seu_usuario',
    'password' => 'sua_senha',
    // ...
];
```

### **4. Configure o servidor web**
- Configure o DocumentRoot para a pasta do projeto
- Certifique-se de que o PHP está habilitado
- Configure as permissões de escrita para as pastas `uploads/`, `logs/`, `cache/`

### **5. Acesse o sistema**
- Abra o navegador e acesse: `http://localhost/up-baloes`
- Use as credenciais padrão do admin:
  - **Email:** admin@upbaloes.com
  - **Senha:** password

## 🗄️ Estrutura do Banco de Dados

### **Tabelas Principais**
- `usuarios` - Decoradores e administradores
- `orcamentos` - Solicitações de orçamento
- `budget_logs` - Log de ações
- `decorator_availability` - Disponibilidade dos decoradores
- `decorator_blocked_dates` - Datas bloqueadas

### **Características**
- Charset: `utf8mb4_unicode_ci`
- Engine: `InnoDB`
- Chaves estrangeiras com CASCADE
- Índices otimizados para performance

## 📁 Estrutura do Projeto

```
up-baloes/
├── components/          # Componentes reutilizáveis
├── css/                # Estilos CSS
│   ├── estilos.css
│   ├── login.css
│   ├── admin.css
│   └── painel-decorador.css
├── database/           # Scripts SQL
│   └── setup_mysql.sql
├── Images/             # Imagens do sistema
├── js/                 # JavaScript
│   ├── principal.js
│   ├── login.js
│   ├── cadastro.js
│   ├── admin.js
│   ├── painel-decorador.js
│   └── solicitacao-cliente.js
├── pages/              # Páginas HTML
│   ├── index.html
│   ├── login.html
│   ├── cadastro.html
│   ├── admin.html
│   ├── painel-decorador.html
│   └── solicitacao-cliente.html
├── services/           # Backend PHP
│   ├── config.php
│   ├── cadastro.php
│   ├── decorador.php
│   ├── orcamentos.php
│   ├── painel.php
│   ├── conta.php
│   ├── disponibilidade.php
│   └── datas-bloqueadas.php
├── utils/              # Utilitários
│   └── gerador-slug.php
├── index.html          # Página principal
├── pagina-decorador.php
├── decorador-nao-encontrado.html
└── README.md
```

## 🔧 Configuração

### **Variáveis de Ambiente**
```php
// services/config.php
define('ENVIRONMENT', 'development'); // development, production

$database_config = [
    'host' => 'localhost',
    'dbname' => 'up_baloes',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'port' => 3306
];
```

### **Configurações de Segurança**
- Senhas com hash seguro
- Proteção contra SQL Injection
- Validação de dados de entrada
- Headers de segurança
- Controle de sessão

## 🚀 Uso

### **1. Acesso ao Sistema**
- **Página Principal:** `index.html`
- **Login:** `pages/login.html`
- **Cadastro:** `pages/cadastro.html`
- **Admin:** `pages/admin.html`

### **2. Fluxo de Trabalho**
1. **Cliente** solicita orçamento
2. **Decorador** recebe e avalia solicitação
3. **Sistema** gerencia disponibilidade
4. **Admin** supervisiona operações

### **3. Tipos de Usuário**
- **Cliente:** Solicita serviços
- **Decorador:** Gerencia portfólio e orçamentos
- **Admin:** Controla todo o sistema

## 📊 Recursos Avançados

### **Sistema de Agenda**
- Calendário integrado
- Controle de disponibilidade
- Bloqueio de datas
- Intervalos entre serviços

### **Gestão de Portfólio**
- Upload de imagens
- Organização por categorias
- Galeria responsiva

### **Relatórios e Estatísticas**
- Dashboard com métricas
- Gráficos interativos
- Relatórios de performance

## 🔒 Segurança

- **Autenticação** segura com sessões
- **Validação** de dados em frontend e backend
- **Sanitização** de entradas
- **Proteção** contra ataques comuns
- **Logs** de auditoria

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

**Mateus** - Desenvolvedor Full Stack
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- Email: seu-email@exemplo.com

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma [issue](https://github.com/seu-usuario/up-baloes/issues)
- Envie um email para: suporte@upbaloes.com

## 🎯 Roadmap

- [ ] Sistema de pagamentos
- [ ] App mobile
- [ ] Integração com redes sociais
- [ ] Sistema de notificações push
- [ ] API REST completa
- [ ] Testes automatizados

---

**Desenvolvido com ❤️ para revolucionar o mercado de decoração com balões!** 🎈
