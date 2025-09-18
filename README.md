# Up.Baloes - Sistema Gerenciador de Serviços com Balões

Sistema moderno e responsivo para gestão de serviços com balões, desenvolvido com HTML, CSS, JavaScript e PHP.

## 🚀 Funcionalidades

### ✅ Tela Inicial
- Navbar fixa com scroll suave
- Logo redonda do sistema
- Menu de navegação responsivo
- Dropdown de usuário com opções de Login/Logout
- Design moderno e empresarial

### ✅ Tela de Login
- Fundo animado com balões voando
- Campos de email e senha com validação
- Checkbox "Lembrar minhas credenciais"
- Link "Esqueci minha senha" com modal
- Integração completa com backend PHP
- Animações e efeitos visuais

### ✅ Backend PHP
- Sistema de autenticação seguro
- Gerenciamento de sessões
- Recuperação de senha
- Logs de acesso
- Estrutura preparada para banco de dados

## 📁 Estrutura do Projeto

```
Up.BaloesV3/
├── Images/
│   └── Logo System.jpeg
├── css/
│   ├── styles.css          # Estilos principais
│   └── login.css           # Estilos da tela de login
├── js/
│   ├── main.js             # JavaScript principal
│   └── login.js            # JavaScript da tela de login
├── pages/
│   └── login.html          # Página de login
├── services/
│   ├── config.php          # Configurações do sistema
│   └── login.php           # Serviço de autenticação
├── components/             # Componentes reutilizáveis
├── utils/                  # Funções auxiliares
└── index.html             # Página principal
```

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - HTML5
  - CSS3 (TailwindCSS)
  - JavaScript (ES6+)
  - Font Awesome (ícones)

- **Backend:**
  - PHP 7.4+
  - MySQL/MariaDB
  - PDO (Database Access)

## 📋 Pré-requisitos

- Servidor web (Apache/Nginx)
- PHP 7.4 ou superior
- MySQL 5.7 ou superior
- Navegador moderno

## ⚙️ Instalação

### 1. Configurar o Servidor
```bash
# Clone ou baixe o projeto para o diretório do servidor web
# Exemplo: /var/www/html/ ou C:\xampp\htdocs\
```

### 2. Configurar o Banco de Dados
```sql
-- Execute o SQL abaixo para criar a estrutura do banco
CREATE DATABASE up_baloes;
USE up_baloes;

-- Tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'user', 'manager') DEFAULT 'user',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de tokens de "lembrar"
CREATE TABLE remember_tokens (
    user_id INT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de recuperação de senha
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de logs de acesso
CREATE TABLE access_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Inserir usuário admin padrão
INSERT INTO usuarios (nome, email, senha, perfil) 
VALUES ('Administrador', 'admin@upbaloes.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
-- Senha padrão: password
```

### 3. Configurar as Credenciais
Edite o arquivo `services/config.php` com suas configurações:

```php
$database_config = [
    'host' => 'localhost',
    'dbname' => 'up_baloes',
    'username' => 'seu_usuario',
    'password' => 'sua_senha',
    // ...
];
```

### 4. Configurar Permissões
```bash
# Criar diretórios necessários
mkdir -p logs cache uploads temp

# Definir permissões (Linux/Mac)
chmod 755 logs cache uploads temp
```

## 🎯 Como Usar

### 1. Acessar o Sistema
- Abra o navegador e acesse: `http://localhost/Up.BaloesV3/`

### 2. Fazer Login
- Clique no ícone de usuário na navbar
- Selecione "Login"
- Use as credenciais padrão:
  - **Email:** admin@upbaloes.com
  - **Senha:** password

### 3. Funcionalidades Disponíveis
- **Login/Logout:** Sistema completo de autenticação
- **Lembrar Credenciais:** Salva email para próximos acessos
- **Recuperar Senha:** Modal para envio de email de recuperação
- **Design Responsivo:** Funciona em desktop, tablet e mobile

## 🔧 Configurações Avançadas

### Personalizar Cores e Estilos
Edite os arquivos CSS em `css/styles.css` e `css/login.css`:

```css
/* Exemplo de personalização */
:root {
    --primary-color: #3b82f6;
    --secondary-color: #6366f1;
    --accent-color: #f59e0b;
}
```

### Configurar Email
Edite `services/config.php` para configurar envio de emails:

```php
$email_config = [
    'smtp_host' => 'smtp.gmail.com',
    'smtp_port' => 587,
    'smtp_username' => 'seu-email@gmail.com',
    'smtp_password' => 'sua-senha-de-app',
    // ...
];
```

### Adicionar Novos Usuários
```sql
-- Exemplo de inserção de novo usuário
INSERT INTO usuarios (nome, email, senha, perfil) 
VALUES ('João Silva', 'joao@exemplo.com', '$2y$10$...', 'user');
```

## 🔒 Segurança

- Senhas hasheadas com `password_hash()`
- Proteção contra SQL Injection com PDO
- Validação de dados de entrada
- Headers de segurança configurados
- Logs de acesso para auditoria

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
- Verifique as credenciais em `services/config.php`
- Confirme se o MySQL está rodando
- Verifique se o banco `up_baloes` existe

### Página de Login Não Carrega
- Verifique se o servidor web está rodando
- Confirme se o PHP está habilitado
- Verifique os logs de erro do servidor

### Estilos Não Aplicam
- Confirme se o TailwindCSS está carregando
- Verifique se os arquivos CSS estão no local correto
- Limpe o cache do navegador

## 📈 Próximos Passos

- [ ] Implementar dashboard principal
- [ ] Adicionar gestão de clientes
- [ ] Criar sistema de portfólio
- [ ] Implementar carrinho de compras
- [ ] Adicionar relatórios e gráficos
- [ ] Sistema de notificações
- [ ] API REST completa

## 📞 Suporte

Para dúvidas ou suporte:
- Email: suporte@upbaloes.com
- Documentação: [Wiki do Projeto]
- Issues: [GitHub Issues]

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Up.Baloes** - Sistema moderno para gestão de serviços com balões 🎈