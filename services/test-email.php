<?php
/**
 * Script de teste para envio de email
 * Use este arquivo para testar se o envio de email está funcionando
 * 
 * Acesse via navegador: http://localhost/Up.BaloesV3/services/test-email.php
 */

// Desabilitar exibição de erros na tela (mostrar apenas no log)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/EmailService.php';

// Configurar headers para HTML
header('Content-Type: text/html; charset=utf-8');

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste de Email - Up.Baloes</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #667eea;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border: 1px solid #c3e6cb;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border: 1px solid #f5c6cb;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border: 1px solid #bee5eb;
        }
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Teste de Envio de Email</h1>
        
        <?php
        // Verificar se foi enviado um email de teste
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['test_email'])) {
            $testEmail = trim($_POST['test_email']);
            
            if (empty($testEmail) || !filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
                echo '<div class="error"><strong>Erro:</strong> Email inválido!</div>';
            } else {
                try {
                    // Mostrar configurações (sem senha)
                    echo '<div class="info">';
                    echo '<h3>📋 Configurações SMTP:</h3>';
                    global $email_config;
                    echo '<pre>';
                    echo 'SMTP_HOST: ' . ($email_config['smtp_host'] ?? 'não configurado') . "\n";
                    echo 'SMTP_PORT: ' . ($email_config['smtp_port'] ?? 'não configurado') . "\n";
                    echo 'SMTP_USERNAME: ' . ($email_config['smtp_username'] ?? 'não configurado') . "\n";
                    echo 'SMTP_PASSWORD: ' . (isset($email_config['smtp_password']) && !empty($email_config['smtp_password']) ? '***configurado***' : 'não configurado') . "\n";
                    echo 'FROM_EMAIL: ' . ($email_config['from_email'] ?? 'não configurado') . "\n";
                    echo 'FROM_NAME: ' . ($email_config['from_name'] ?? 'não configurado') . "\n";
                    echo '</pre>';
                    echo '</div>';
                    
                    // Tentar enviar email
                    echo '<div class="info"><strong>Enviando email de teste para:</strong> ' . htmlspecialchars($testEmail) . '</div>';
                    
                    $emailService = new EmailService();
                    
                    $subject = 'Teste de Email - Up.Baloes';
                    $htmlBody = '
                    <h2>Email de Teste</h2>
                    <p>Este é um email de teste do sistema Up.Baloes.</p>
                    <p>Se você recebeu este email, significa que a configuração SMTP está funcionando corretamente! ✅</p>
                    <p><strong>Data/Hora:</strong> ' . date('d/m/Y H:i:s') . '</p>
                    ';
                    $textBody = 'Este é um email de teste do sistema Up.Baloes. Se você recebeu este email, significa que a configuração SMTP está funcionando corretamente!';
                    
                    $result = $emailService->sendEmail($testEmail, $subject, $htmlBody, $textBody);
                    
                    if ($result['success']) {
                        echo '<div class="success">';
                        echo '<h3>✅ Email enviado com sucesso!</h3>';
                        echo '<p>Verifique a caixa de entrada e a pasta de spam do email: <strong>' . htmlspecialchars($testEmail) . '</strong></p>';
                        echo '</div>';
                    } else {
                        echo '<div class="error">';
                        echo '<h3>❌ Erro ao enviar email:</h3>';
                        echo '<p><strong>Mensagem:</strong> ' . htmlspecialchars($result['message'] ?? 'Erro desconhecido') . '</p>';
                        if (isset($result['error'])) {
                            echo '<p><strong>Detalhes do erro:</strong></p>';
                            echo '<pre>' . htmlspecialchars($result['error']) . '</pre>';
                        }
                        echo '</div>';
                    }
                    
                } catch (Exception $e) {
                    echo '<div class="error">';
                    echo '<h3>❌ Exceção ao tentar enviar email:</h3>';
                    echo '<p><strong>Erro:</strong> ' . htmlspecialchars($e->getMessage()) . '</p>';
                    echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
                    echo '</div>';
                }
            }
        } else {
            // Mostrar formulário de teste
            global $email_config;
            
            echo '<div class="info">';
            echo '<h3>ℹ️ Informações:</h3>';
            echo '<p>Este script testa o envio de emails usando as configurações do arquivo <code>.env</code>.</p>';
            echo '<p><strong>Configuração atual:</strong></p>';
            echo '<ul>';
            echo '<li>SMTP Host: ' . ($email_config['smtp_host'] ?? 'não configurado') . '</li>';
            echo '<li>SMTP Port: ' . ($email_config['smtp_port'] ?? 'não configurado') . '</li>';
            echo '<li>SMTP Username: ' . ($email_config['smtp_username'] ?? 'não configurado') . '</li>';
            echo '<li>SMTP Password: ' . (isset($email_config['smtp_password']) && !empty($email_config['smtp_password']) ? '✅ Configurado' : '❌ Não configurado') . '</li>';
            echo '</ul>';
            echo '</div>';
            
            // Verificar se PHPMailer está disponível
            $autoloadPath = __DIR__ . '/../vendor/autoload.php';
            if (!file_exists($autoloadPath)) {
                echo '<div class="error">';
                echo '<strong>Erro:</strong> vendor/autoload.php não encontrado. Execute: <code>composer install</code>';
                echo '</div>';
            } elseif (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                echo '<div class="error">';
                echo '<strong>Erro:</strong> PHPMailer não encontrado. Execute: <code>composer install</code>';
                echo '</div>';
            } else {
                echo '<div class="success">✅ PHPMailer está instalado e disponível</div>';
            }
        }
        ?>
        
        <form method="POST" style="margin-top: 30px;">
            <h3>Enviar Email de Teste</h3>
            <p>
                <label for="test_email"><strong>Email para teste:</strong></label><br>
                <input type="email" 
                       id="test_email" 
                       name="test_email" 
                       placeholder="seu-email@gmail.com" 
                       required 
                       style="width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;">
            </p>
            <p>
                <button type="submit" 
                        style="background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    📧 Enviar Email de Teste
                </button>
            </p>
        </form>
        
        <div class="info" style="margin-top: 30px;">
            <h3>🔍 Verificar Logs</h3>
            <p>Se o email não for enviado, verifique os logs em:</p>
            <ul>
                <li><code>logs/error.log</code> - Logs gerais do sistema</li>
                <li>Logs do PHP (verifique a configuração do PHP)</li>
            </ul>
        </div>
    </div>
</body>
</html>

