<?php
/**
 * Script para diagnosticar e corrigir problemas de autenticação SMTP
 * 
 * Acesse via navegador: http://localhost/Up.BaloesV3/services/fix-smtp-auth.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

require_once __DIR__ . '/config.php';

header('Content-Type: text/html; charset=utf-8');

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagnóstico SMTP - Up.Baloes</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
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
        h1 { color: #667eea; }
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
        .warning {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border: 1px solid #ffeaa7;
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
            font-size: 12px;
        }
        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        .step {
            margin: 20px 0;
            padding: 15px;
            border-left: 4px solid #667eea;
            background: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Diagnóstico de Autenticação SMTP</h1>
        
        <?php
        global $email_config;
        
        // Verificar configurações
        echo '<div class="info">';
        echo '<h3>📋 Configurações Atuais:</h3>';
        echo '<pre>';
        echo 'SMTP_HOST: ' . ($email_config['smtp_host'] ?? '❌ não configurado') . "\n";
        echo 'SMTP_PORT: ' . ($email_config['smtp_port'] ?? '❌ não configurado') . "\n";
        echo 'SMTP_USERNAME: ' . ($email_config['smtp_username'] ?? '❌ não configurado') . "\n";
        echo 'SMTP_PASSWORD: ' . (isset($email_config['smtp_password']) && !empty($email_config['smtp_password']) 
            ? '✅ configurado (' . strlen($email_config['smtp_password']) . ' caracteres)' 
            : '❌ não configurado') . "\n";
        echo 'FROM_EMAIL: ' . ($email_config['from_email'] ?? '❌ não configurado') . "\n";
        echo 'FROM_NAME: ' . ($email_config['from_name'] ?? '❌ não configurado') . "\n";
        echo '</pre>';
        echo '</div>';
        
        // Verificar problemas comuns
        $issues = [];
        
        // 1. Verificar se username está configurado
        if (empty($email_config['smtp_username'])) {
            $issues[] = 'SMTP_USERNAME não está configurado no .env';
        }
        
        // 2. Verificar se password está configurado
        if (empty($email_config['smtp_password'])) {
            $issues[] = 'SMTP_PASSWORD não está configurado no .env';
        } else {
            // Verificar se a senha tem o formato correto (senha de app do Gmail tem 16 caracteres sem espaços)
            $passwordClean = str_replace(' ', '', trim($email_config['smtp_password']));
            if (strlen($passwordClean) !== 16) {
                $issues[] = "Senha de app deve ter 16 caracteres (sem espaços). Atual: " . strlen($passwordClean) . " caracteres";
            }
        }
        
        // 3. Verificar formato do email
        if (!empty($email_config['smtp_username']) && !filter_var($email_config['smtp_username'], FILTER_VALIDATE_EMAIL)) {
            $issues[] = 'SMTP_USERNAME não é um email válido';
        }
        
        // 4. Verificar se é Gmail
        if (strpos($email_config['smtp_host'] ?? '', 'gmail.com') !== false) {
            if (strpos($email_config['smtp_username'] ?? '', '@gmail.com') === false && 
                strpos($email_config['smtp_username'] ?? '', '@googlemail.com') === false) {
                $issues[] = 'Para Gmail, o SMTP_USERNAME deve ser um email @gmail.com';
            }
        }
        
        if (!empty($issues)) {
            echo '<div class="error">';
            echo '<h3>❌ Problemas Encontrados:</h3>';
            echo '<ul>';
            foreach ($issues as $issue) {
                echo '<li>' . htmlspecialchars($issue) . '</li>';
            }
            echo '</ul>';
            echo '</div>';
        } else {
            echo '<div class="success">';
            echo '<h3>✅ Configurações Básicas OK</h3>';
            echo '<p>As configurações básicas estão corretas. Vamos testar a autenticação...</p>';
            echo '</div>';
        }
        
        // Testar autenticação se tudo estiver OK
        if (empty($issues) && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['test_auth'])) {
            echo '<div class="step">';
            echo '<h3>🧪 Testando Autenticação SMTP...</h3>';
            
            try {
                $autoloadPath = __DIR__ . '/../vendor/autoload.php';
                if (!file_exists($autoloadPath)) {
                    throw new Exception('vendor/autoload.php não encontrado. Execute: composer install');
                }
                
                require_once $autoloadPath;
                
                if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                    throw new Exception('PHPMailer não encontrado. Execute: composer install');
                }
                
                $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
                
                // Configurar SMTP
                $mail->isSMTP();
                $mail->Host = $email_config['smtp_host'];
                $mail->SMTPAuth = true;
                $mail->Username = trim($email_config['smtp_username']);
                
                // Remover espaços da senha
                $password = str_replace(' ', '', trim($email_config['smtp_password']));
                $mail->Password = $password;
                
                $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = $email_config['smtp_port'];
                $mail->CharSet = 'UTF-8';
                $mail->Timeout = 30;
                
                // Habilitar debug
                $mail->SMTPDebug = 2;
                $debugOutput = '';
                $mail->Debugoutput = function($str, $level) use (&$debugOutput) {
                    $debugOutput .= $str . "\n";
                };
                
                echo '<pre style="max-height: 400px; overflow-y: auto;">';
                echo "Conectando ao servidor SMTP...\n";
                echo "Host: {$email_config['smtp_host']}\n";
                echo "Porta: {$email_config['smtp_port']}\n";
                echo "Username: {$email_config['smtp_username']}\n";
                echo "Password: " . str_repeat('*', strlen($password)) . " (" . strlen($password) . " caracteres)\n\n";
                
                // Tentar conectar e autenticar
                $mail->smtpConnect();
                
                echo "\n✅ Conexão SMTP estabelecida com sucesso!\n";
                echo "✅ Autenticação realizada com sucesso!\n";
                
                $mail->smtpClose();
                
                echo '</pre>';
                
                echo '<div class="success">';
                echo '<h3>✅ Autenticação Bem-Sucedida!</h3>';
                echo '<p>O problema não é de autenticação. Verifique outros aspectos do envio de email.</p>';
                echo '</div>';
                
            } catch (\PHPMailer\PHPMailer\Exception $e) {
                echo '</pre>';
                
                echo '<div class="error">';
                echo '<h3>❌ Erro de Autenticação</h3>';
                echo '<p><strong>Mensagem:</strong> ' . htmlspecialchars($e->getMessage()) . '</p>';
                echo '<p><strong>Erro PHPMailer:</strong> ' . htmlspecialchars($mail->ErrorInfo) . '</p>';
                
                if (!empty($debugOutput)) {
                    echo '<p><strong>Debug Output:</strong></p>';
                    echo '<pre style="max-height: 300px; overflow-y: auto;">' . htmlspecialchars($debugOutput) . '</pre>';
                }
                
                echo '</div>';
                
                // Sugestões baseadas no erro
                echo '<div class="warning">';
                echo '<h3>💡 Possíveis Soluções:</h3>';
                echo '<ol>';
                
                if (strpos($mail->ErrorInfo, 'authentication') !== false || strpos($mail->ErrorInfo, '535') !== false) {
                    echo '<li><strong>Senha de App Incorreta:</strong><br>';
                    echo '   • Acesse: <a href="https://myaccount.google.com/apppasswords" target="_blank">https://myaccount.google.com/apppasswords</a><br>';
                    echo '   • Gere uma NOVA senha de app para "Email"<br>';
                    echo '   • Copie a senha gerada (16 caracteres)<br>';
                    echo '   • Atualize o arquivo .env com a nova senha</li>';
                    
                    echo '<li><strong>Verificação em Duas Etapas:</strong><br>';
                    echo '   • Certifique-se de que a verificação em duas etapas está ATIVADA<br>';
                    echo '   • Acesse: <a href="https://myaccount.google.com/security" target="_blank">https://myaccount.google.com/security</a></li>';
                    
                    echo '<li><strong>Formato da Senha:</strong><br>';
                    echo '   • A senha de app deve ter 16 caracteres (sem espaços)<br>';
                    echo '   • Exemplo: <code>cgsbtfupvognlxcf</code> (sem espaços)<br>';
                    echo '   • Ou: <code>cgsb tfup vogn lxcf</code> (com espaços - será removido automaticamente)</li>';
                }
                
                if (strpos($mail->ErrorInfo, 'connection') !== false || strpos($mail->ErrorInfo, 'timeout') !== false) {
                    echo '<li><strong>Problema de Conexão:</strong><br>';
                    echo '   • Verifique sua conexão com a internet<br>';
                    echo '   • Verifique se o firewall não está bloqueando a porta 587<br>';
                    echo '   • Tente usar a porta 465 com SSL</li>';
                }
                
                echo '</ol>';
                echo '</div>';
                
            } catch (Exception $e) {
                echo '</pre>';
                
                echo '<div class="error">';
                echo '<h3>❌ Erro:</h3>';
                echo '<p>' . htmlspecialchars($e->getMessage()) . '</p>';
                echo '</div>';
            }
            
            echo '</div>';
        }
        ?>
        
        <?php if (empty($issues)): ?>
        <form method="POST" style="margin-top: 30px;">
            <div class="step">
                <h3>Testar Autenticação</h3>
                <p>Clique no botão abaixo para testar a autenticação SMTP com as configurações atuais.</p>
                <button type="submit" name="test_auth" value="1" 
                        style="background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    🔐 Testar Autenticação SMTP
                </button>
            </div>
        </form>
        <?php endif; ?>
        
        <div class="info" style="margin-top: 30px;">
            <h3>📝 Checklist de Verificação:</h3>
            <ul>
                <li>✅ Verificação em duas etapas ativada no Google</li>
                <li>✅ Senha de app gerada (16 caracteres)</li>
                <li>✅ Senha de app copiada corretamente para o .env</li>
                <li>✅ SMTP_USERNAME é um email válido</li>
                <li>✅ Arquivo .env está na raiz do projeto</li>
                <li>✅ Variáveis do .env não têm aspas extras</li>
            </ul>
        </div>
    </div>
</body>
</html>

