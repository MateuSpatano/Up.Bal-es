# 📦 Guia de Instalação do Composer

## O que é Composer?

Composer é o gerenciador de dependências do PHP. Ele é necessário para instalar as bibliotecas que o sistema Up.Baloes usa (JWT e DotEnv).

---

## 🪟 Instalação no Windows

### Método 1: Instalador Oficial (Recomendado)

1. **Baixe o instalador:**
   - Acesse: https://getcomposer.org/Composer-Setup.exe
   - Clique para baixar

2. **Execute o instalador:**
   - Dê duplo clique no arquivo baixado
   - Siga as instruções do instalador
   - Ele detectará automaticamente o PHP instalado

3. **Verifique a instalação:**
   ```bash
   composer --version
   ```

4. **Se o comando não funcionar:**
   - Reinicie o terminal/PowerShell
   - Ou reinicie o computador

### Método 2: Manual

1. **Baixe o composer.phar:**
   ```powershell
   php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
   php composer-setup.php
   php -r "unlink('composer-setup.php');"
   ```

2. **Mova para um diretório global:**
   ```powershell
   move composer.phar C:\composer.phar
   ```

3. **Crie um arquivo .bat:**
   Crie o arquivo `C:\Windows\composer.bat` com:
   ```batch
   @echo off
   php "C:\composer.phar" %*
   ```

---

## 🐧 Instalação no Linux

### Ubuntu/Debian

```bash
# Instalar dependências
sudo apt update
sudo apt install php-cli php-zip unzip curl

# Baixar e instalar
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Verificar
composer --version
```

### Fedora/CentOS/RHEL

```bash
# Instalar dependências
sudo dnf install php-cli php-zip unzip curl

# Baixar e instalar
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Verificar
composer --version
```

---

## 🍎 Instalação no macOS

### Usando Homebrew (Recomendado)

```bash
brew install composer
```

### Instalação Manual

```bash
# Baixar
curl -sS https://getcomposer.org/installer | php

# Mover para local global
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Verificar
composer --version
```

---

## ✅ Verificação da Instalação

Após instalar, execute:

```bash
composer --version
```

Você deve ver algo como:
```
Composer version 2.x.x
```

---

## 🚀 Instalar Dependências do Up.Baloes

Depois de instalar o Composer, instale as dependências do projeto:

### Opção 1: Script Automático (Windows)

Dê duplo clique no arquivo:
```
instalar-dependencias.bat
```

### Opção 2: Linha de Comando

```bash
# Entre na pasta do projeto
cd C:\Users\mateu\OneDrive\Documentos\Área de Trabalho\Up.BaloesV3

# Instale as dependências
composer install
```

---

## 📚 O que será instalado?

O comando `composer install` instalará:

1. **firebase/php-jwt** (^6.10)
   - Biblioteca para gerar e validar tokens JWT
   - Usada para autenticação segura

2. **vlucas/phpdotenv** (^5.6)
   - Biblioteca para carregar variáveis de ambiente
   - Usada para gerenciar credenciais de forma segura

---

## 🐛 Problemas Comuns

### "composer: comando não encontrado"

**Solução:**
1. Verifique se o Composer foi instalado corretamente
2. Reinicie o terminal
3. Reinicie o computador se necessário
4. Verifique se o PHP está instalado: `php --version`

### "Your requirements could not be resolved"

**Solução:**
1. Verifique sua versão do PHP: `php --version`
2. O projeto requer PHP 7.4 ou superior
3. Atualize o PHP se necessário

### "Failed to download"

**Solução:**
1. Verifique sua conexão com a internet
2. Tente novamente: `composer install --no-cache`
3. Configure um proxy se necessário

### Erro de permissão (Linux/Mac)

**Solução:**
```bash
sudo composer install
# ou
composer install --no-plugins
```

---

## 🔄 Comandos Úteis do Composer

| Comando | Descrição |
|---------|-----------|
| `composer install` | Instala as dependências listadas no composer.json |
| `composer update` | Atualiza todas as dependências |
| `composer require pacote/nome` | Adiciona uma nova dependência |
| `composer remove pacote/nome` | Remove uma dependência |
| `composer dump-autoload` | Regenera o autoloader |
| `composer show` | Lista todas as dependências instaladas |
| `composer --version` | Mostra a versão do Composer |

---

## 📁 Estrutura Após Instalação

Após executar `composer install`, você terá:

```
Up.BaloesV3/
├── vendor/                  ← Pasta com as bibliotecas instaladas
│   ├── firebase/
│   │   └── php-jwt/        ← Biblioteca JWT
│   ├── vlucas/
│   │   └── phpdotenv/      ← Biblioteca DotEnv
│   └── autoload.php        ← Autoloader do Composer
│
├── composer.json            ← Lista de dependências
└── composer.lock            ← Versões exatas instaladas
```

⚠️ **Importante:** A pasta `vendor/` não deve ser versionada no Git (já está no .gitignore)

---

## 🎯 Próximos Passos

Depois de instalar as dependências:

1. ✅ Configure o arquivo `.env`
2. ✅ Execute os scripts SQL do banco de dados
3. ✅ Configure o Google OAuth (se for usar)
4. ✅ Teste o sistema!

Consulte: [docs/installation/INICIO_RAPIDO.md](installation/INICIO_RAPIDO.md)

---

## 📞 Links Úteis

- **Site Oficial:** https://getcomposer.org/
- **Documentação:** https://getcomposer.org/doc/
- **Packagist (repositório de pacotes):** https://packagist.org/

---

**Problemas?** Consulte a [documentação oficial do Composer](https://getcomposer.org/doc/00-intro.md)




