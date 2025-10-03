# 🚀 Instalação Rápida - Up.Baloes

## ⚡ Instalação em 5 Passos

### **1. Clone o Repositório**
```bash
git clone https://github.com/seu-usuario/up-baloes.git
cd up-baloes
```

### **2. Configure o Banco de Dados**
```bash
# Execute o script de configuração
mysql -u root -p < database/setup_mysql.sql
```

### **3. Configure as Credenciais**
```bash
# Copie o arquivo de exemplo
cp services/config.example.php services/config.php

# Edite as credenciais do banco
nano services/config.php
```

### **4. Configure Permissões**
```bash
# Crie os diretórios necessários
mkdir -p logs cache uploads temp

# Configure as permissões
chmod 755 logs cache uploads temp
```

### **5. Acesse o Sistema**
- Abra: `http://localhost/up-baloes`
- Login admin: `admin@upbaloes.com` / `password`

## 🔧 Configuração Detalhada

### **Banco de Dados**
```sql
-- Criar banco
CREATE DATABASE up_baloes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Executar script
mysql -u root -p up_baloes < database/setup_mysql.sql
```

### **PHP (config.php)**
```php
$database_config = [
    'host' => 'localhost',
    'dbname' => 'up_baloes',
    'username' => 'seu_usuario',
    'password' => 'sua_senha',
    'charset' => 'utf8mb4',
    'port' => 3306
];
```

### **Servidor Web**
- **Apache:** Configure DocumentRoot
- **Nginx:** Configure server block
- **XAMPP/WAMP:** Coloque na pasta htdocs

## ✅ Verificação

### **Teste de Conexão**
```php
<?php
require_once 'services/config.php';
try {
    $pdo = getDatabaseConnection($database_config);
    echo "✅ Conexão OK!";
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage();
}
?>
```

### **Teste de Funcionalidades**
1. ✅ Acesso à página principal
2. ✅ Login funcionando
3. ✅ Cadastro funcionando
4. ✅ Painel admin acessível
5. ✅ Upload de imagens funcionando

## 🐛 Solução de Problemas

### **Erro de Conexão com Banco**
- Verifique se o MySQL está rodando
- Confirme as credenciais em `config.php`
- Teste a conexão manualmente

### **Erro de Permissões**
```bash
chmod -R 755 logs cache uploads temp
chown -R www-data:www-data logs cache uploads temp
```

### **Erro 500**
- Verifique os logs do servidor
- Confirme se todas as extensões PHP estão instaladas
- Verifique a sintaxe dos arquivos PHP

## 📞 Suporte

- **GitHub Issues:** [Abrir Issue](https://github.com/seu-usuario/up-baloes/issues)
- **Email:** suporte@upbaloes.com
- **Documentação:** [README.md](README.md)

---

**Sistema pronto para uso! 🎈**
