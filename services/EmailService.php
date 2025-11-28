<?php
/**
 * Serviço de Email para Up.Baloes
 * Centraliza o envio de emails usando PHPMailer com SMTP
 */

require_once __DIR__ . '/config.php';

class EmailService {
    private $mail;
    private $config;
    
    public function __construct() {
        global $email_config;
        $this->config = $email_config;
        
        // Carregar autoload do Composer
        $autoloadPath = __DIR__ . '/../vendor/autoload.php';
        if (file_exists($autoloadPath)) {
            require_once $autoloadPath;
        }
        
        if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            throw new Exception('PHPMailer não encontrado. Execute: composer install');
        }
        
        $this->mail = new \PHPMailer\PHPMailer\PHPMailer(true);
        $this->configureSMTP();
    }
    
    /**
     * Configurar servidor SMTP
     */
    private function configureSMTP() {
        $this->mail->isSMTP();
        $this->mail->Host = $this->config['smtp_host'] ?? 'smtp.gmail.com';
        $this->mail->SMTPAuth = true;
        
        // Limpar e validar username
        $username = trim($this->config['smtp_username'] ?? '');
        if (empty($username)) {
            throw new Exception('SMTP_USERNAME não configurado no .env');
        }
        $this->mail->Username = $username;
        
        // Remover espaços da senha de app (Gmail gera senhas com espaços: "xxxx xxxx xxxx xxxx")
        $password = $this->config['smtp_password'] ?? '';
        $password = str_replace(' ', '', trim($password)); // Remove todos os espaços
        
        if (empty($password)) {
            throw new Exception('SMTP_PASSWORD não configurado no .env');
        }
        
        // Log para debug (sem mostrar a senha completa)
        if (ENVIRONMENT === 'development') {
            error_log("SMTP Config - Username: {$username}");
            error_log("SMTP Config - Password length: " . strlen($password) . " caracteres");
            error_log("SMTP Config - Password starts with: " . substr($password, 0, 4) . "...");
        }
        
        $this->mail->Password = $password;
        
        $this->mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $this->mail->Port = $this->config['smtp_port'] ?? 587;
        $this->mail->CharSet = 'UTF-8';
        
        // Timeout aumentado para conexões mais lentas
        $this->mail->Timeout = 30;
        
        // Remover validação de certificado SSL em desenvolvimento
        if (ENVIRONMENT === 'development') {
            $this->mail->SMTPOptions = [
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ];
        }
        
        // Remetente padrão
        $fromEmail = $this->config['from_email'] ?? 'noreply@upbaloes.com';
        $fromName = $this->config['from_name'] ?? 'Up.Baloes';
        $this->mail->setFrom($fromEmail, $fromName);
    }
    
    /**
     * Enviar email genérico
     * 
     * @param string $to Email do destinatário
     * @param string $subject Assunto do email
     * @param string $htmlBody Corpo HTML do email
     * @param string|null $textBody Corpo em texto plano (opcional)
     * @param string|null $replyTo Email para resposta (opcional)
     * @param string|null $replyToName Nome para resposta (opcional)
     * @return array ['success' => bool, 'message' => string]
     */
    public function sendEmail($to, $subject, $htmlBody, $textBody = null, $replyTo = null, $replyToName = null) {
        try {
            // Limpar destinatários anteriores
            $this->mail->clearAddresses();
            $this->mail->clearReplyTos();
            
            // Destinatário
            $this->mail->addAddress($to);
            
            // Reply-To personalizado ou padrão
            if ($replyTo) {
                $this->mail->addReplyTo($replyTo, $replyToName ?? $this->config['from_name'] ?? 'Up.Baloes');
            } else {
                $replyToDefault = $this->config['reply_to'] ?? $this->config['from_email'] ?? 'noreply@upbaloes.com';
                $this->mail->addReplyTo($replyToDefault, $this->config['from_name'] ?? 'Up.Baloes');
            }
            
            // Conteúdo
            $this->mail->isHTML(true);
            $this->mail->Subject = $subject;
            $this->mail->Body = $htmlBody;
            
            // Versão texto plano
            if ($textBody !== null && trim($textBody) !== '') {
                $this->mail->AltBody = $textBody;
            }
            
            // Habilitar debug detalhado em desenvolvimento
            if (ENVIRONMENT === 'development') {
                $this->mail->SMTPDebug = 2; // Mostrar mensagens de debug
                $this->mail->Debugoutput = function($str, $level) {
                    error_log("PHPMailer Debug (Level $level): $str");
                };
            }
            
            // Enviar
            $this->mail->send();
            
            error_log("Email enviado com sucesso para: {$to}");
            return [
                'success' => true,
                'message' => 'Email enviado com sucesso!'
            ];
            
        } catch (\PHPMailer\PHPMailer\Exception $e) {
            $errorInfo = $this->mail->ErrorInfo;
            $errorMsg = "Erro ao enviar email para {$to}: {$errorInfo}";
            error_log($errorMsg);
            error_log("Detalhes do erro PHPMailer: " . $e->getMessage());
            
            // Log adicional das configurações (sem senha)
            error_log("SMTP Config - Host: " . ($this->config['smtp_host'] ?? 'não configurado'));
            error_log("SMTP Config - Port: " . ($this->config['smtp_port'] ?? 'não configurado'));
            error_log("SMTP Config - Username: " . ($this->config['smtp_username'] ?? 'não configurado'));
            error_log("SMTP Config - Password: " . (isset($this->config['smtp_password']) && !empty($this->config['smtp_password']) ? 'configurado' : 'não configurado'));
            
            return [
                'success' => false,
                'message' => 'Erro ao enviar email. Verifique os logs para mais detalhes.',
                'error' => $errorInfo
            ];
        } catch (Exception $e) {
            $errorMsg = "Exceção ao enviar email para {$to}: " . $e->getMessage();
            error_log($errorMsg);
            error_log("Stack trace: " . $e->getTraceAsString());
            
            return [
                'success' => false,
                'message' => 'Erro ao enviar email: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Enviar email de recuperação de senha
     * 
     * @param string $to Email do destinatário
     * @param string $userName Nome do usuário
     * @param string $resetLink Link para redefinir senha
     * @param int $expirationMinutes Minutos de validade do link
     * @return array ['success' => bool, 'message' => string]
     */
    public function sendPasswordResetEmail($to, $userName, $resetLink, $expirationMinutes = 60) {
        $subject = 'Recuperação de senha - Up.Baloes';
        
        $htmlBody = $this->getPasswordResetTemplate($userName, $resetLink, $expirationMinutes);
        $textBody = "Olá {$userName},\n\nRecebemos uma solicitação para redefinir sua senha no Up.Baloes.\n\nAcesse o link abaixo para criar uma nova senha (válido por {$expirationMinutes} minutos):\n{$resetLink}\n\nSe você não solicitou a alteração, ignore este email.\n\nEquipe Up.Baloes";
        
        return $this->sendEmail($to, $subject, $htmlBody, $textBody);
    }
    
    /**
     * Enviar email de orçamento para cliente
     * 
     * @param string $to Email do cliente
     * @param array $budgetData Dados do orçamento
     * @param string $budgetUrl URL para visualizar o orçamento
     * @param string|null $customMessage Mensagem personalizada do decorador
     * @param string|null $decoratorEmail Email do decorador para Reply-To
     * @param string|null $decoratorName Nome do decorador
     * @return array ['success' => bool, 'message' => string]
     */
    public function sendBudgetEmail($to, $budgetData, $budgetUrl, $customMessage = null, $decoratorEmail = null, $decoratorName = null) {
        $subject = 'Seu Orçamento de Decoração com Balões - Up.Baloes';
        
        $htmlBody = $this->getBudgetEmailTemplate($budgetData, $budgetUrl, $customMessage);
        $textBody = $this->getBudgetEmailTextTemplate($budgetData, $budgetUrl, $customMessage);
        
        return $this->sendEmail($to, $subject, $htmlBody, $textBody, $decoratorEmail, $decoratorName);
    }
    
    /**
     * Template HTML para recuperação de senha
     */
    private function getPasswordResetTemplate($userName, $resetLink, $expirationMinutes) {
        return "
        <!DOCTYPE html>
        <html lang=\"pt-BR\">
        <head>
            <meta charset=\"UTF-8\">
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
            <title>Recuperação de Senha - Up.Baloes</title>
        </head>
        <body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;\">
            <div style=\"max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\">
                <div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;\">
                    <h1 style=\"margin: 0; font-size: 28px;\">Recuperação de Senha</h1>
                    <p style=\"margin: 10px 0 0 0; opacity: 0.9;\">Up.Baloes</p>
                </div>
                <div style=\"padding: 30px;\">
                    <p>Olá {$userName},</p>
                    <p>Recebemos uma solicitação para redefinir sua senha do sistema Up.Baloes.</p>
                    <p>Para criar uma nova senha, clique no botão abaixo:</p>
                    <p style=\"margin: 24px 0; text-align: center;\">
                        <a href=\"{$resetLink}\" style=\"display:inline-block;padding:12px 24px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;\">Redefinir minha senha</a>
                    </p>
                    <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
                    <p style=\"word-break:break-all;background:#f8f9fa;padding:10px;border-radius:5px;\"><a href=\"{$resetLink}\" target=\"_blank\">{$resetLink}</a></p>
                    <p style=\"color: #666; font-size: 14px;\">Este link é válido por {$expirationMinutes} minutos.</p>
                    <p>Se você não solicitou a alteração de senha, ignore este email.</p>
                    <p style=\"margin-top: 30px;\">Atenciosamente,<br><strong>Equipe Up.Baloes</strong></p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
    
    /**
     * Template HTML para email de orçamento
     */
    private function getBudgetEmailTemplate($budgetData, $budgetUrl, $customMessage = null) {
        $serviceTypeLabels = [
            'arco-tradicional' => 'Arco Tradicional',
            'arco-desconstruido' => 'Arco Desconstruído',
            'escultura-balao' => 'Escultura de Balão',
            'centro-mesa' => 'Centro de Mesa',
            'baloes-piscina' => 'Balões na Piscina'
        ];
        
        $serviceType = $serviceTypeLabels[$budgetData['service_type'] ?? $budgetData['tipo_servico'] ?? ''] ?? 'Serviço de Decoração';
        $clientName = $budgetData['client'] ?? $budgetData['cliente'] ?? 'Cliente';
        $eventDate = $budgetData['event_date'] ?? $budgetData['data_evento'] ?? '';
        $eventTime = $budgetData['event_time'] ?? $budgetData['hora_evento'] ?? '';
        $eventLocation = $budgetData['event_location'] ?? $budgetData['local_evento'] ?? '';
        $estimatedValue = $budgetData['estimated_value'] ?? $budgetData['valor_estimado'] ?? 0;
        $description = $budgetData['description'] ?? $budgetData['descricao'] ?? '';
        
        $formattedDate = $eventDate ? date('d/m/Y', strtotime($eventDate)) : '';
        $formattedValue = number_format($estimatedValue, 2, ',', '.');
        
        $customMessageHtml = '';
        if ($customMessage && trim($customMessage) !== '') {
            $customMessageHtml = "
            <div style=\"background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;\">
                <p style=\"margin: 0; font-weight: bold; color: #856404;\">Mensagem do decorador:</p>
                <p style=\"margin: 10px 0 0 0; color: #856404;\">" . nl2br(htmlspecialchars($customMessage)) . "</p>
            </div>
            ";
        }
        
        return "
        <!DOCTYPE html>
        <html lang=\"pt-BR\">
        <head>
            <meta charset=\"UTF-8\">
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
            <title>Seu Orçamento - Up.Baloes</title>
        </head>
        <body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;\">
            <div style=\"max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\">
                <div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;\">
                    <h1 style=\"margin: 0; font-size: 28px;\">Seu Orçamento está Pronto! 🎈</h1>
                    <p style=\"margin: 10px 0 0 0; opacity: 0.9;\">Up.Baloes</p>
                </div>
                <div style=\"padding: 30px;\">
                    <p>Olá {$clientName},</p>
                    <p>Seu orçamento de decoração com balões está pronto!</p>
                    {$customMessageHtml}
                    <div style=\"background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;\">
                        <h3 style=\"color: #495057; margin-top: 0;\">Detalhes do Serviço</h3>
                        <div style=\"display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef;\">
                            <span style=\"font-weight: bold; color: #6c757d;\">Serviço:</span>
                            <span>{$serviceType}</span>
                        </div>
                        <div style=\"display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef;\">
                            <span style=\"font-weight: bold; color: #6c757d;\">Data:</span>
                            <span>{$formattedDate}</span>
                        </div>
                        <div style=\"display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef;\">
                            <span style=\"font-weight: bold; color: #6c757d;\">Hora:</span>
                            <span>{$eventTime}</span>
                        </div>
                        <div style=\"display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef;\">
                            <span style=\"font-weight: bold; color: #6c757d;\">Local:</span>
                            <span>{$eventLocation}</span>
                        </div>
                        <div style=\"display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0;\">
                            <span style=\"font-weight: bold; color: #6c757d;\">Valor Estimado:</span>
                            <span style=\"font-size: 20px; font-weight: bold; color: #667eea;\">R$ {$formattedValue}</span>
                        </div>
                    </div>
                    " . ($description ? "<p style=\"background: #e7f3ff; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3;\"><strong>Descrição:</strong><br>" . nl2br(htmlspecialchars($description)) . "</p>" : "") . "
                    <p style=\"margin: 24px 0; text-align: center;\">
                        <a href=\"{$budgetUrl}\" style=\"display:inline-block;padding:12px 24px;background-color:#667eea;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;\">Visualizar Orçamento Completo</a>
                    </p>
                    <p style=\"margin-top: 30px;\">Qualquer dúvida, estamos à disposição!</p>
                    <p>Atenciosamente,<br><strong>Equipe Up.Baloes</strong></p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
    
    /**
     * Template texto plano para email de orçamento
     */
    private function getBudgetEmailTextTemplate($budgetData, $budgetUrl, $customMessage = null) {
        $serviceTypeLabels = [
            'arco-tradicional' => 'Arco Tradicional',
            'arco-desconstruido' => 'Arco Desconstruído',
            'escultura-balao' => 'Escultura de Balão',
            'centro-mesa' => 'Centro de Mesa',
            'baloes-piscina' => 'Balões na Piscina'
        ];
        
        $serviceType = $serviceTypeLabels[$budgetData['service_type'] ?? $budgetData['tipo_servico'] ?? ''] ?? 'Serviço de Decoração';
        $clientName = $budgetData['client'] ?? $budgetData['cliente'] ?? 'Cliente';
        $eventDate = $budgetData['event_date'] ?? $budgetData['data_evento'] ?? '';
        $eventTime = $budgetData['event_time'] ?? $budgetData['hora_evento'] ?? '';
        $eventLocation = $budgetData['event_location'] ?? $budgetData['local_evento'] ?? '';
        $estimatedValue = $budgetData['estimated_value'] ?? $budgetData['valor_estimado'] ?? 0;
        
        $formattedDate = $eventDate ? date('d/m/Y', strtotime($eventDate)) : '';
        $formattedValue = number_format($estimatedValue, 2, ',', '.');
        
        $text = "Olá {$clientName},\n\n";
        $text .= "Seu orçamento de decoração com balões está pronto!\n\n";
        
        if ($customMessage && trim($customMessage) !== '') {
            $text .= "Mensagem do decorador:\n{$customMessage}\n\n";
        }
        
        $text .= "Detalhes do Serviço:\n";
        $text .= "• Serviço: {$serviceType}\n";
        $text .= "• Data: {$formattedDate}\n";
        $text .= "• Hora: {$eventTime}\n";
        $text .= "• Local: {$eventLocation}\n";
        $text .= "• Valor Estimado: R$ {$formattedValue}\n\n";
        $text .= "Visualizar orçamento completo: {$budgetUrl}\n\n";
        $text .= "Qualquer dúvida, estamos à disposição!\n\n";
        $text .= "Atenciosamente,\nEquipe Up.Baloes";
        
        return $text;
    }
}

