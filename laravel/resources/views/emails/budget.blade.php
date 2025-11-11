<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu Orçamento - Up.Baloes</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .budget-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .budget-info h3 { color: #495057; margin-top: 0; }
        .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .info-label { font-weight: bold; color: #6c757d; }
        .info-value { color: #495057; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        .custom-message { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎈 Up.Baloes</h1>
            <p>Seu orçamento de decoração com balões está pronto!</p>
        </div>

        <div class="content">
            <h2>Olá, {{ $budget['client'] ?? 'Cliente' }}!</h2>

            <p>Obrigado por escolher a Up.Baloes para sua decoração especial! Seu orçamento foi preparado com muito carinho e está pronto para sua análise.</p>

            @if(!empty($customMessage))
                <div class="custom-message">
                    <strong>Mensagem personalizada:</strong><br>
                    {!! nl2br(e($customMessage)) !!}
                </div>
            @endif

            <div class="budget-info">
                <h3>📋 Detalhes do Seu Orçamento</h3>
                <div class="info-row">
                    <span class="info-label">Serviço:</span>
                    <span class="info-value">{{ $serviceTypeLabel }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Data do Evento:</span>
                    <span class="info-value">
                        @if(!empty($budget['event_date']))
                            {{ \Carbon\Carbon::parse($budget['event_date'])->format('d/m/Y') }}
                        @endif
                        {{ !empty($budget['event_time']) ? ' às ' . $budget['event_time'] : '' }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Local:</span>
                    <span class="info-value">{{ $budget['event_location'] ?? '-' }}</span>
                </div>
                @if(!empty($budget['tamanho_arco_m']))
                    <div class="info-row">
                        <span class="info-label">Tamanho do Arco:</span>
                        <span class="info-value">{{ $budget['tamanho_arco_m'] }} metros</span>
                    </div>
                @endif
                @if(!empty($budget['estimated_value']) && $budget['estimated_value'] > 0)
                    <div class="info-row">
                        <span class="info-label">Valor Estimado:</span>
                        <span class="info-value">R$ {{ number_format($budget['estimated_value'], 2, ',', '.') }}</span>
                    </div>
                @endif
            </div>

            <div style="text-align: center;">
                <a href="{{ $budgetUrl }}" class="cta-button">Ver Orçamento Completo</a>
            </div>

            <p>Clique no botão acima para visualizar todos os detalhes do seu orçamento, incluindo imagens de inspiração e informações adicionais.</p>

            <p>Se você tiver alguma dúvida ou desejar fazer alterações, não hesite em entrar em contato conosco!</p>

            <p>Estamos ansiosos para tornar seu evento ainda mais especial! 🎉</p>
        </div>

        <div class="footer">
            <p><strong>Up.Baloes</strong> - Decoração com Balões</p>
            <p>📧 contato@upbaloes.com | 📱 (11) 99999-9999</p>
        </div>
    </div>
</body>
</html>

