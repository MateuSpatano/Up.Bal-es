# Configuração do XAMPP para o Projeto Up.BaloesV3

## Problema: Erro 404 ao acessar URLs de decoradores

Se você está recebendo erros 404 ao tentar acessar URLs como `http://localhost/Up.BaloesV3/mateus-rian-da-silva-teixeira`, siga os passos abaixo:

## Passo 1: Habilitar mod_rewrite no Apache

1. Abra o arquivo `httpd.conf` do XAMPP (geralmente em `C:\xampp\apache\conf\httpd.conf`)
2. Procure pela linha que contém `#LoadModule rewrite_module modules/mod_rewrite.so`
3. Remova o `#` no início da linha para descomentar:
   ```
   LoadModule rewrite_module modules/mod_rewrite.so
   ```
4. Salve o arquivo

## Passo 2: Configurar AllowOverride

No mesmo arquivo `httpd.conf`, procure pela seção `<Directory>` que aponta para o DocumentRoot:

```apache
<Directory "C:/xampp/htdocs">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>
```

Altere `AllowOverride None` para `AllowOverride All`:

```apache
<Directory "C:/xampp/htdocs">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

## Passo 3: Verificar o DocumentRoot

Certifique-se de que o DocumentRoot do Apache está apontando para a pasta correta. No `httpd.conf`, procure por:

```apache
DocumentRoot "C:/xampp/htdocs"
```

Se seu projeto estiver em outro local, você pode:
- Mover o projeto para `C:/xampp/htdocs/Up.BaloesV3`
- OU alterar o DocumentRoot para apontar para a pasta do projeto

## Passo 4: Reiniciar o Apache

1. Abra o Painel de Controle do XAMPP
2. Pare o Apache (se estiver rodando)
3. Inicie o Apache novamente

## Passo 5: Verificar se o .htaccess está funcionando

1. Acesse `http://localhost/Up.BaloesV3/` no navegador
2. Se a página carregar normalmente, o .htaccess está funcionando
3. Teste uma URL de decorador: `http://localhost/Up.BaloesV3/seu-slug-aqui`

## Solução Alternativa: Usar Virtual Host

Se o problema persistir, configure um Virtual Host:

1. Abra o arquivo `httpd-vhosts.conf` (geralmente em `C:\xampp\apache\conf\extra\httpd-vhosts.conf`)

2. Adicione a seguinte configuração:

```apache
<VirtualHost *:80>
    ServerName upbaloes.local
    DocumentRoot "C:/xampp/htdocs/Up.BaloesV3"
    <Directory "C:/xampp/htdocs/Up.BaloesV3">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

3. Edite o arquivo `hosts` do Windows (em `C:\Windows\System32\drivers\etc\hosts`) e adicione:
   ```
   127.0.0.1    upbaloes.local
   ```

4. Reinicie o Apache

5. Acesse `http://upbaloes.local/` no navegador

## Verificação de Logs

Se ainda houver problemas, verifique os logs do Apache:
- `C:\xampp\apache\logs\error.log`

Os erros relacionados ao mod_rewrite aparecerão neste arquivo.

## Notas Importantes

- O nome do projeto no caminho deve ser exatamente `Up.BaloesV3` (com ponto e maiúsculas/minúsculas corretas)
- Certifique-se de que o arquivo `.htaccess` está na raiz do projeto
- O módulo `mod_rewrite` deve estar habilitado no Apache

