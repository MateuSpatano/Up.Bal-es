# 📧 Guia de Configuração do Sistema de Email

Este guia explica como configurar o sistema de envio de emails do Up.Baloes.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Configuração para Gmail](#configuração-para-gmail)
4. [Configuração para Hotmail/Outlook](#configuração-para-hotmailoutlook)
5. [Configuração para Outros Provedores](#configuração-para-outros-provedores)
6. [Como Usar o EmailService](#como-usar-o-emailservice)
7. [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O sistema utiliza **PHPMailer** com **SMTP** para envio de emails. Isso garante maior confiabilidade e suporte a diferentes provedores de email.

### Funcionalidades Disponíveis

- ✅ Recuperação de senha
- ✅ Envio de orçamentos para clientes
- ✅ Emails personalizados com Reply-To do decorador
- ✅ Templates HTML profissionais
- ✅ Suporte a múltiplos provedores SMTP

## ⚙️ Configuração Inicial

### 1. Instalar Dependências

Certifique-se de que o PHPMailer está instalado:

```bash
composer install
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
# Configurações SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
SMTP_FROM_EMAIL=noreply@upbaloes.com
SMTP_FROM_NAME=Up.Baloes System
```

## 📮 Configuração para Gmail

### Passo a Passo

1. **Ative a verificação em duas etapas**
   - Acesse: https://myaccount.google.com/security
   - Ative a "Verificação em duas etapas"

2. **Gere uma Senha de App**
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "App" e "Email"
   - Clique em "Gerar"
   - Copie a senha gerada (16 caracteres)

3. **Configure o .env**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=seu-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Senha de app gerada
   SMTP_FROM_EMAIL=seu-email@gmail.com
   SMTP_FROM_NAME=Up.Baloes System
   ```

## 📧 Configuração para Hotmail/Outlook

### Passo a Passo

1. **Ative a verificação em duas etapas**
   - Acesse: https://account.microsoft.com/security
   - Ative a "Verificação em duas etapas"

2. **Gere uma Senha de App**
   - Acesse: https://account.microsoft.com/security
   - Vá em "Senhas de app"
   - Gere uma nova senha de app para "Email"
   - Copie a senha gerada

3. **Configure o .env**
   ```env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_USERNAME=seu-email@hotmail.com
   SMTP_PASSWORD=senha-de-app-gerada
   SMTP_FROM_EMAIL=seu-email@hotmail.com
   SMTP_FROM_NAME=Up.Baloes System
   ```

## 🌐 Configuração para Outros Provedores

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USERNAME=seu-email@yahoo.com
SMTP_PASSWORD=senha-de-app
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=sua-api-key-do-sendgrid
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=seu-usuario-mailgun
SMTP_PASSWORD=sua-senha-mailgun
```

## 💻 Como Usar o EmailService

### Exemplo 1: Enviar Email Genérico

```php
require_once __DIR__ . '/services/EmailService.php';

$emailService = new EmailService();

$result = $emailService->sendEmail(
    'cliente@email.com',                    // Destinatário
    'Assunto do Email',                      // Assunto
    '<h1>Conteúdo HTML</h1>',               // Corpo HTML
    'Conteúdo em texto plano',               // Texto plano (opcional)
    'decorador@email.com',                   // Reply-To (opcional)
    'Nome do Decorador'                      // Nome Reply-To (opcional)
);

if ($result['success']) {
    echo "Email enviado com sucesso!";
} else {
    echo "Erro: " . $result['message'];
}
```

### Exemplo 2: Enviar Email de Recuperação de Senha

```php
require_once __DIR__ . '/services/EmailService.php';

$emailService = new EmailService();

$resetLink = 'https://seusite.com/reset-password?token=abc123';
$result = $emailService->sendPasswordResetEmail(
    'usuario@email.com',    // Email do usuário
    'João Silva',            // Nome do usuário
    $resetLink,              // Link de recuperação
    60                       // Minutos de validade (opcional, padrão: 60)
);
```

### Exemplo 3: Enviar Email de Orçamento

```php
require_once __DIR__ . '/services/EmailService.php';

$emailService = new EmailService();

$budgetData = [
    'client' => 'Maria Silva',
    'service_type' => 'arco-tradicional',
    'event_date' => '2024-12-25',
    'event_time' => '14:00',
    'event_location' => 'Rua Exemplo, 123',
    'estimated_value' => 500.00,
    'description' => 'Decoração para aniversário'
];

$budgetUrl = 'https://seusite.com/orcamento/123';
$result = $emailService->sendBudgetEmail(
    'cliente@email.com',        // Email do cliente
    $budgetData,                 // Dados do orçamento
    $budgetUrl,                  // URL do orçamento
    'Mensagem personalizada',    // Mensagem do decorador (opcional)
    'decorador@email.com',       // Email do decorador para Reply-To (opcional)
    'Nome do Decorador'          // Nome do decorador (opcional)
);
```

## 🔧 Troubleshooting

### Erro: "PHPMailer não encontrado"

**Solução:**
```bash
composer install
```

### Erro: "SMTP connect() failed"

**Possíveis causas:**
1. Credenciais incorretas
2. Porta bloqueada pelo firewall
3. Verificação em duas etapas não ativada

**Solução:**
- Verifique as credenciais no `.env`
- Use senha de app, não a senha normal
- Verifique se a porta 587 está aberta

### Erro: "Authentication failed"

**Solução:**
- Para Gmail: Use senha de app, não a senha da conta
- Para Outlook: Ative verificação em duas etapas e gere senha de app
- Verifique se `SMTP_USERNAME` e `SMTP_PASSWORD` estão corretos

### Emails não chegam na caixa de entrada

**Possíveis causas:**
1. Vão para spam
2. Email bloqueado pelo provedor
3. Configuração incorreta

**Solução:**
- Verifique a pasta de spam
- Configure SPF/DKIM no domínio (para produção)
- Teste com diferentes provedores de email

### Emails funcionam em desenvolvimento mas não em produção

**Solução:**
- Verifique se o `.env` está configurado corretamente no servidor
- Certifique-se de que as variáveis de ambiente estão sendo carregadas
- Verifique logs de erro em `logs/error.log`

## 📝 Notas Importantes

1. **Nunca commite o arquivo `.env`** com credenciais reais
2. **Use senhas de app** para Gmail/Outlook, não senhas normais
3. **Em produção**, configure SPF e DKIM no DNS do domínio
4. **Monitore os logs** em `logs/error.log` para identificar problemas
5. **Teste sempre** após alterar configurações de email

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs em `logs/error.log`
2. Teste as configurações SMTP com um cliente de email
3. Verifique se o PHPMailer está instalado corretamente
4. Consulte a documentação do PHPMailer: https://github.com/PHPMailer/PHPMailer

