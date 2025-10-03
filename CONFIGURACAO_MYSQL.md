# 🗄️ Configuração do MySQL para Up.Baloes

## ✅ **Status da Compatibilidade**

Seu sistema **já está totalmente compatível com MySQL**! Não foram encontradas incompatibilidades com PostgreSQL.

## 🚀 **Instruções de Configuração**

### **1. Instalação do MySQL**

#### **Windows (XAMPP/WAMP)**
```bash
# Baixar e instalar XAMPP ou WAMP
# Iniciar os serviços Apache e MySQL
# Acessar phpMyAdmin: http://localhost/phpmyadmin
```

#### **Linux (Ubuntu/Debian)**
```bash
sudo apt update
sudo apt install mysql-server php-mysql php-pdo
sudo mysql_secure_installation
```

#### **macOS (Homebrew)**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### **2. Configuração do Banco de Dados**

#### **Opção A: Script Automático**
```bash
# Executar o script de configuração
mysql -u root -p < database/setup_mysql.sql
```

#### **Opção B: Manual (phpMyAdmin)**
1. Acesse `http://localhost/phpmyadmin`
2. Crie um novo banco: `up_baloes`
3. Selecione charset: `utf8mb4_unicode_ci`
4. Execute o script `database/setup_mysql.sql`

### **3. Configuração do PHP**

#### **Verificar Extensões PHP**
```bash
# Verificar se as extensões estão instaladas
php -m | grep -E "(mysql|pdo)"
```

#### **Configurar php.ini**
```ini
; Habilitar extensões MySQL
extension=pdo_mysql
extension=mysqli

; Configurações de upload
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
```

### **4. Configuração do Sistema**

#### **Arquivo: `services/config.php`**
```php
$database_config = [
    'host' => 'localhost',
    'dbname' => 'up_baloes',
    'username' => 'root',
    'password' => 'sua_senha_aqui',
    'charset' => 'utf8mb4',
    'port' => 3306,
    // ... outras configurações
];
```

## 🔧 **Configurações Otimizadas para MySQL**

### **1. Charset e Collation**
- **Charset**: `utf8mb4` (suporte completo a Unicode)
- **Collation**: `utf8mb4_unicode_ci` (ordenação correta)

### **2. Engine de Tabelas**
- **Engine**: `InnoDB` (transações, chaves estrangeiras, performance)

### **3. Configurações PDO**
```php
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
    PDO::ATTR_PERSISTENT => false,
];
```

## 📊 **Estrutura do Banco de Dados**

### **Tabelas Principais**
- `usuarios` - Decoradores do sistema
- `orcamentos` - Orçamentos de decoração
- `budget_logs` - Log de ações
- `decorator_availability` - Disponibilidade dos decoradores
- `decorator_blocked_dates` - Datas bloqueadas

### **Características MySQL**
- ✅ **AUTO_INCREMENT** para chaves primárias
- ✅ **JSON** para dados estruturados
- ✅ **ENUM** para valores fixos
- ✅ **TIMESTAMP** com auto-update
- ✅ **FOREIGN KEY** com CASCADE

## 🚨 **Troubleshooting**

### **Erro de Conexão**
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Verificar porta
netstat -tlnp | grep :3306
```

### **Erro de Charset**
```sql
-- Verificar charset do banco
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'up_baloes';
```

### **Erro de Permissões**
```sql
-- Criar usuário específico (opcional)
CREATE USER 'upbaloes'@'localhost' IDENTIFIED BY 'senha_forte';
GRANT ALL PRIVILEGES ON up_baloes.* TO 'upbaloes'@'localhost';
FLUSH PRIVILEGES;
```

## 📈 **Performance MySQL**

### **Índices Otimizados**
- Chaves primárias com AUTO_INCREMENT
- Índices em campos de busca frequente
- Índices compostos para queries complexas

### **Configurações Recomendadas**
```ini
# my.cnf
[mysqld]
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
max_connections = 200
query_cache_size = 32M
```

## ✅ **Verificação Final**

### **Teste de Conexão**
```php
<?php
require_once 'services/config.php';

try {
    $pdo = getDatabaseConnection($database_config);
    echo "✅ Conexão com MySQL estabelecida com sucesso!";
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage();
}
?>
```

### **Verificar Tabelas**
```sql
USE up_baloes;
SHOW TABLES;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_orcamentos FROM orcamentos;
```

## 🎉 **Conclusão**

Seu sistema está **100% compatível com MySQL**! Apenas execute o script de configuração e ajuste as credenciais no arquivo `config.php`.

### **Próximos Passos**
1. ✅ Executar `database/setup_mysql.sql`
2. ✅ Configurar credenciais em `services/config.php`
3. ✅ Testar conexão
4. ✅ Iniciar o sistema

**Sistema pronto para produção com MySQL!** 🚀
