# 🔍 Guia de Diagnóstico - Problemas com Envio de Email

Se os emails não estão chegando, siga estes passos para identificar o problema:

## ✅ Passo 1: Testar o Envio de Email

1. Acesse o script de teste:
   ```
   http://localhost/Up.BaloesV3/services/test-email.php
   ```

2. Digite seu email e clique em "Enviar Email de Teste"

3. Verifique a mensagem de sucesso/erro na tela

## ✅ Passo 2: Verificar Configuração do .env

Certifique-se de que o arquivo `.env` está configurado corretamente:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=upbaloes6@gmail.com
SMTP_PASSWORD=cgsb tfup vogn lxcf
SMTP_FROM_EMAIL=upbaloes6@gmail.com
SMTP_FROM_NAME=Up.Baloes System
```

**⚠️ IMPORTANTE:** A senha de app do Gmail pode ter espaços. O sistema remove automaticamente, mas você pode remover manualmente também:
- Com espaços: `cgsb tfup vogn lxcf`
- Sem espaços: `cgsbtfupvognlxcf` (ambos funcionam)

## ✅ Passo 3: Verificar Logs

### Verificar logs do PHP:
1. Abra o arquivo `logs/error.log` na raiz do projeto
2. Procure por mensagens relacionadas a "Email" ou "PHPMailer"
3. Copie as mensagens de erro encontradas

### Verificar logs do servidor:
- Se estiver usando XAMPP/WAMP: Verifique os logs do Apache
- Se estiver usando servidor Linux: Verifique `/var/log/apache2/error.log` ou `/var/log/php/error.log`

## ✅ Passo 4: Verificar Senha de App do Gmail

### Problema comum: Senha de app incorreta

1. Acesse: https://myaccount.google.com/apppasswords
2. Verifique se a senha de app foi gerada corretamente
3. Se necessário, gere uma nova senha de app:
   - Selecione "App" → "Email"
   - Selecione "Dispositivo" → "Outro (nome personalizado)"
   - Digite "Up.Baloes System"
   - Clique em "Gerar"
   - Copie a nova senha (16 caracteres)

4. Atualize o `.env` com a nova senha

## ✅ Passo 5: Verificar Verificação em Duas Etapas

A senha de app só funciona se a verificação em duas etapas estiver ativada:

1. Acesse: https://myaccount.google.com/security
2. Verifique se "Verificação em duas etapas" está **ATIVADA**
3. Se não estiver, ative primeiro e depois gere a senha de app

## ✅ Passo 6: Verificar Firewall/Antivírus

Alguns firewalls ou antivírus podem bloquear conexões SMTP:

1. Temporariamente desative o firewall/antivírus
2. Teste novamente o envio de email
3. Se funcionar, configure uma exceção para a porta 587

## ✅ Passo 7: Verificar Pasta de Spam

1. Verifique a pasta de **Spam/Lixo Eletrônico** do email
2. Se o email estiver lá, marque como "Não é spam"
3. Adicione `upbaloes6@gmail.com` aos contatos

## 🔧 Erros Comuns e Soluções

### Erro: "SMTP connect() failed"
**Causa:** Problema de conexão com o servidor SMTP
**Solução:**
- Verifique se a porta 587 está aberta
- Verifique se o firewall não está bloqueando
- Tente usar a porta 465 com SSL ao invés de TLS

### Erro: "Authentication failed"
**Causa:** Credenciais incorretas
**Solução:**
- Verifique se está usando senha de app, não senha normal
- Verifique se a senha não tem espaços extras
- Gere uma nova senha de app

### Erro: "PHPMailer não encontrado"
**Causa:** Dependências não instaladas
**Solução:**
```bash
composer install
```

### Email enviado mas não chega
**Causa:** Pode estar na pasta de spam ou bloqueado
**Solução:**
- Verifique pasta de spam
- Verifique se o email do remetente não está bloqueado
- Aguarde alguns minutos (pode haver delay)

## 📞 Informações para Suporte

Se ainda não funcionar, colete estas informações:

1. **Mensagem de erro completa** do script de teste
2. **Últimas linhas do arquivo** `logs/error.log`
3. **Configuração do .env** (sem mostrar a senha completa, apenas confirmar que está configurado)
4. **Versão do PHP** (execute `php -v` no terminal)
5. **Sistema operacional** (Windows/Linux/Mac)

## 🧪 Teste Manual com PHPMailer

Se quiser testar diretamente, crie um arquivo `test-phpmailer.php`:

```php
<?php
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'upbaloes6@gmail.com';
    $mail->Password = 'cgsbtfupvognlxcf'; // Senha sem espaços
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    $mail->setFrom('upbaloes6@gmail.com', 'Up.Baloes System');
    $mail->addAddress('seu-email-teste@gmail.com');
    
    $mail->isHTML(true);
    $mail->Subject = 'Teste';
    $mail->Body = 'Teste de email';
    
    $mail->send();
    echo 'Email enviado!';
} catch (Exception $e) {
    echo "Erro: {$mail->ErrorInfo}";
}
?>
```

