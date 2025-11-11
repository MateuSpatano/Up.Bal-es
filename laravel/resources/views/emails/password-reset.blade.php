<p>Olá {{ $name }},</p>

<p>Recebemos uma solicitação para redefinir sua senha do sistema Up.Baloes.</p>

<p>Para criar uma nova senha, clique no botão abaixo:</p>

<p style="margin: 24px 0;">
    <a href="{{ $resetLink }}"
       style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">
        Redefinir minha senha
    </a>
</p>

<p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>

<p style="word-break:break-all;">
    <a href="{{ $resetLink }}" target="_blank">{{ $resetLink }}</a>
</p>

<p>Este link é válido por {{ $lifetime }} minutos.</p>

<p>Se você não solicitou a alteração de senha, ignore este email.</p>

<p>Atenciosamente,<br>Equipe Up.Baloes</p>

