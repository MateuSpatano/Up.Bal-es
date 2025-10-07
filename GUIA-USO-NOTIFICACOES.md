# 📱 Guia de Uso - Sistema de Notificações para Decoradores

**Up.Baloes - Painel Administrativo**  
**Data:** 07/10/2025

---

## 🎯 Visão Geral

O sistema permite ao administrador enviar notificações personalizadas para decoradores via **WhatsApp** e **E-mail** quando aprovar ou recusar cadastros.

---

## 📋 Campos do Formulário de Decorador

### ✅ **Campos Atualizados:**

| Campo | Tipo | Obrigatório | Finalidade |
|-------|------|-------------|------------|
| Nome Completo | Texto | ✅ Sim | Identificação |
| CPF | Texto | ✅ Sim | Documento |
| **E-mail Google** | E-mail | ✅ **Sim** | **Login no sistema** |
| Telefone | Tel | ✅ Sim | Contato |
| WhatsApp | Tel | ✅ Sim | **Receber notificações** |
| **E-mail de Comunicação** | E-mail | ✅ **Sim** | **Receber e-mails/orçamentos** |
| Endereço | TextArea | ✅ Sim | Localização |
| Senha | Password | ✅ Sim | Autenticação |

### ❌ **Campo Removido:**
- ~~E-mail~~ (duplicado - removido para evitar confusão)

---

## 🚀 Como Usar o Sistema de Notificações

### **Método 1: Ao Criar um Decorador**

1. **Criar Decorador**
   - Vá em **"Criar Decorador"** no menu
   - Preencha todos os campos
   - Clique em **"Criar Conta de Decorador"**

2. **Modal de Sucesso Aparece**
   - ✅ Veja o link único do decorador
   - ✅ Slug gerado automaticamente
   - ✅ ID do decorador

3. **Enviar Notificação** (3 opções):
   - 🔔 Clique em **"Enviar Notificação"** (botão verde)
   - 🔗 Clique em **"Ver Página"** (para visualizar)
   - ❌ Clique em **"Fechar"** (para depois)

---

### **Método 2: Da Lista de Usuários**

1. **Acesse "Gerenciar Usuários"**

2. **Encontre um Decorador**

3. **Clique nos Botões de Ação:**

   **Para Decoradores Aguardando Aprovação:**
   - ✅ **Botão Verde (Check)** → Aprovar
   - ❌ **Botão Vermelho (X)** → Recusar e abrir notificação
   - ✏️ **Botão Azul (Lápis)** → Editar

   **Para Decoradores Ativos:**
   - 🔔 **Botão Roxo (Sino)** → Enviar notificação de aprovação
   - ✏️ **Botão Azul (Lápis)** → Editar
   - 🔄 **Botão Amarelo (Toggle)** → Ativar/Desativar
   - 🗑️ **Botão Vermelho (Lixeira)** → Excluir

---

### **Método 3: Via Console (Debug)**

Abra o console (F12) e execute:

```javascript
// Enviar notificação de aprovação
notifyDecorator(1, 'approved');

// Enviar notificação de recusa
notifyDecorator(1, 'rejected');
```

---

## 📝 Modal de Notificação - Interface

### **Tela Completa do Modal:**

```
╔══════════════════════════════════════════════════════╗
║  [✅] Notificar Aprovação                           [X]║
║  Revise e edite a mensagem antes de enviar           ║
╠══════════════════════════════════════════════════════╣
║                                                        ║
║  📋 Decorador:                                        ║
║  João Silva Decorações                                ║
║                                                        ║
║  📤 Canais de Envio:                                  ║
║  ┌────────────────────┐  ┌────────────────────┐     ║
║  │ [✓] WhatsApp       │  │ [✓] E-mail         │     ║
║  │ 📱 (11) 99999-9999 │  │ 📧 joao@email.com  │     ║
║  └────────────────────┘  └────────────────────┘     ║
║                                                        ║
║  💬 Mensagem WhatsApp:                                ║
║  ┌─────────────────────────────────────────────┐    ║
║  │ 🎉 *Parabéns, João Silva Decorações!*       │    ║
║  │                                              │    ║
║  │ Sua conta de decorador foi *APROVADA*...    │    ║
║  │ [Edite à vontade]                            │    ║
║  └─────────────────────────────────────────────┘    ║
║  ℹ️ Use *negrito* _itálico_ ~riscado~   247 caracteres║
║                                                        ║
║  📧 Assunto do E-mail:                                ║
║  ┌─────────────────────────────────────────────┐    ║
║  │ 🎉 Conta Aprovada - Bem-vindo à Up.Baloes!  │    ║
║  └─────────────────────────────────────────────┘    ║
║                                                        ║
║  📝 Mensagem E-mail:                                  ║
║  ┌─────────────────────────────────────────────┐    ║
║  │ <div style="...">                            │    ║
║  │   [HTML formatado com design profissional]  │    ║
║  │   [Totalmente editável]                      │    ║
║  └─────────────────────────────────────────────┘    ║
║                                                        ║
║  ────────────────────────────────────────────────    ║
║  [Cancelar]          [📤 Enviar Notificação]         ║
╚══════════════════════════════════════════════════════╝
```

---

## ✏️ Recursos de Edição

### **1. Mensagens Totalmente Editáveis**
- ✅ Você pode modificar **qualquer parte** da mensagem
- ✅ Alterar texto, adicionar informações, personalizar
- ✅ Formatação WhatsApp: `*negrito*` `_itálico_` `~riscado~`

### **2. Contador de Caracteres (WhatsApp)**
- 🟢 **0-800 caracteres:** Cinza (normal)
- 🟡 **801-1000 caracteres:** Amarelo (atenção)
- 🔴 **1001+ caracteres:** Vermelho (muito longo)

### **3. Seleção de Canais**
- ☑️ Marque/desmarque WhatsApp
- ☑️ Marque/desmarque E-mail
- ⚠️ Pelo menos 1 canal deve estar selecionado

### **4. Ocultar/Mostrar Seções**
- Se desmarcar WhatsApp → seção de mensagem WhatsApp oculta
- Se desmarcar E-mail → seção de e-mail oculta

---

## 📱 Templates de Mensagens

### **🟢 Aprovação (Status: `approved`)**

#### **WhatsApp:**
```
🎉 *Parabéns, [Nome]!*

Sua conta de decorador foi *APROVADA* pela Up.Baloes! ✅

Agora você pode:
✨ Acessar seu painel de decorador
📅 Gerenciar sua agenda
💼 Criar e enviar orçamentos
📸 Montar seu portfólio

*Acesse agora:*
👉 https://upbaloes.com/login

Bem-vindo(a) à nossa equipe! 🎈

_Equipe Up.Baloes_
```

#### **E-mail:**
- **Assunto:** 🎉 Conta Aprovada - Bem-vindo à Up.Baloes!
- **Design:** HTML profissional com gradiente verde
- **Elementos:** 
  - Header verde com título
  - Boas-vindas personalizadas
  - Lista de funcionalidades
  - Botão CTA "Acessar Meu Painel"
  - Footer institucional

---

### **🔴 Recusa (Status: `rejected`)**

#### **WhatsApp:**
```
Olá, [Nome].

Agradecemos seu interesse em fazer parte da equipe Up.Baloes. 🎈

Infelizmente, após análise, não foi possível aprovar sua conta de decorador neste momento. ❌

*Possíveis motivos:*
• Dados incompletos ou incorretos
• Documentação pendente
• Não atendimento aos requisitos

*Você pode:*
📝 Revisar seus dados
📧 Entrar em contato conosco
🔄 Fazer uma nova solicitação

_Equipe Up.Baloes_
📞 Contato: (XX) XXXXX-XXXX
```

#### **E-mail:**
- **Assunto:** Sobre sua solicitação - Up.Baloes
- **Design:** HTML profissional com gradiente cinza
- **Elementos:**
  - Header cinza neutro
  - Mensagem empática
  - Box amarelo com motivos
  - Box cinza com possíveis razões
  - Box azul com próximos passos
  - Botão "Entrar em Contato"
  - Footer de suporte

---

## 🎨 Cores e Visual

### **Modal de Aprovação:**
- 🟢 **Header:** Gradiente verde (#10b981 → #059669)
- ✅ **Ícone:** Check circle
- 🎉 **Tom:** Celebrativo e positivo

### **Modal de Recusa:**
- ⚪ **Header:** Gradiente cinza (#6b7280 → #4b5563)
- ❌ **Ícone:** Times circle
- 🤝 **Tom:** Respeitoso e construtivo

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────────────┐
│  1. Admin cria decorador                        │
│     ↓                                            │
│  2. Formulário preenchido (sem email duplicado) │
│     ↓                                            │
│  3. Sistema cria conta com:                     │
│     • google_email (login)                      │
│     • communication_email (notificações)        │
│     • whatsapp (notificações)                   │
│     ↓                                            │
│  4. Modal de sucesso aparece                    │
│     ↓                                            │
│  5. Admin clica "Enviar Notificação"            │
│     ↓                                            │
│  6. Modal de notificação abre                   │
│     • Templates pré-carregados                  │
│     • Dados do decorador exibidos               │
│     ↓                                            │
│  7. Admin revisa/edita mensagens                │
│     • Modifica texto se necessário              │
│     • Seleciona canais                          │
│     ↓                                            │
│  8. Admin clica "Enviar Notificação"            │
│     ↓                                            │
│  9. Sistema processa:                           │
│     • Monta dados completos                     │
│     • Valida seleções                           │
│     • Envia para canais selecionados            │
│     ↓                                            │
│ 10. Feedback de sucesso                         │
│     • Toast verde aparece                       │
│     • Modal fecha automaticamente               │
└─────────────────────────────────────────────────┘
```

---

## 🧪 Exemplos de Uso

### **Exemplo 1: Notificação Completa (WhatsApp + E-mail)**

```javascript
// Criar decorador
const newDecorator = {
    id: 123,
    nome: 'Maria Santos Decorações',
    google_email: 'maria@gmail.com',
    communication_email: 'contato@mariasantos.com',
    whatsapp: '(11) 98765-4321'
};

// Abrir modal de notificação
notifyDecorator(123, 'approved');

// Modal abre com:
// ✅ Ambos canais marcados
// ✅ Mensagens pré-carregadas
// ✅ Nome "Maria Santos Decorações" nos templates
```

### **Exemplo 2: Apenas WhatsApp**

```javascript
// Abrir modal
notifyDecorator(456, 'approved');

// No modal:
// 1. Desmarque checkbox "E-mail"
// 2. Seção de e-mail desaparece
// 3. Edite mensagem WhatsApp se quiser
// 4. Envie
```

### **Exemplo 3: Recusa com Mensagem Personalizada**

```javascript
// Abrir modal
notifyDecorator(789, 'rejected');

// No modal:
// 1. Template de recusa pré-carregado
// 2. Edite para adicionar razão específica
// 3. Exemplo: Adicione "Área de atuação incompatível"
// 4. Envie
```

---

## 💡 Dicas de Uso

### **✅ Boas Práticas:**

1. **Sempre revise** as mensagens antes de enviar
2. **Personalize** com informações específicas do decorador
3. **Use ambos canais** para garantir que a mensagem chegue
4. **Teste** primeiro com seus próprios contatos
5. **Mantenha tom profissional** mas amigável

### **📝 Formatação WhatsApp:**

```
*Texto em negrito* → Texto em negrito
_Texto em itálico_ → Texto em itálico
~Texto riscado~ → Texto riscado
```

### **⚠️ Limites do WhatsApp:**

- **Ideal:** Até 800 caracteres
- **Aceitável:** Até 1000 caracteres
- **Evite:** Mais de 1000 (pode ser cortado)

---

## 🎨 Personalização de Templates

### **Variáveis Disponíveis:**

| Variável | Descrição | Uso |
|----------|-----------|-----|
| `${decoratorName}` | Nome do decorador | Inserido automaticamente |
| Status | `approved` ou `rejected` | Define qual template usar |

### **Como Personalizar:**

#### **Opção 1: Editar no Modal (Recomendado)**
- Abra o modal
- Edite diretamente os campos
- Alteração vale **apenas para este envio**

#### **Opção 2: Modificar Templates Padrão (Permanente)**
Edite `js/admin.js`, função `getMessageTemplates()` (linha 1137):

```javascript
getMessageTemplates(decoratorName, status) {
    const templates = {
        approved: {
            whatsapp: `Sua mensagem personalizada...`,
            emailSubject: `Seu assunto...`,
            emailBody: `<div>Seu HTML...</div>`
        },
        rejected: {
            // ...
        }
    };
    return templates[status];
}
```

---

## 📊 Dados Enviados

### **Estrutura JSON:**

```json
{
    "decorator_id": 123,
    "decorator_name": "Maria Santos Decorações",
    "status": "approved",
    "channels": {
        "whatsapp": true,
        "email": true
    },
    "messages": {
        "whatsapp": "Mensagem formatada com emojis...",
        "email": {
            "subject": "🎉 Conta Aprovada - Bem-vindo à Up.Baloes!",
            "body": "<div style='...'>HTML completo...</div>"
        }
    },
    "contacts": {
        "whatsapp": "(11) 98765-4321",
        "email": "contato@mariasantos.com"
    }
}
```

---

## 🔧 Integração com Backend

### **Para Implementar Envio Real:**

1. **Descomentar** código em `admin.js` (linha 1402):

```javascript
const response = await fetch('../services/admin.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        action: 'send_decorator_notification',
        ...notificationData
    })
});
```

2. **Criar endpoint** em `services/admin.php`:

```php
case 'send_decorator_notification':
    $data = $input;
    
    // Validar dados
    // ...
    
    // Enviar WhatsApp
    if ($data['channels']['whatsapp']) {
        sendWhatsAppMessage(
            $data['contacts']['whatsapp'],
            $data['messages']['whatsapp']
        );
    }
    
    // Enviar E-mail
    if ($data['channels']['email']) {
        sendEmail(
            $data['contacts']['email'],
            $data['messages']['email']['subject'],
            $data['messages']['email']['body']
        );
    }
    
    // Retornar sucesso
    echo json_encode(['success' => true]);
    break;
```

3. **Configurar APIs:**
   - **WhatsApp:** Twilio, WhatsApp Business API
   - **E-mail:** PHPMailer, SendGrid, AWS SES

---

## 🐛 Solução de Problemas

### **Problema: Modal não abre**
**Solução:**
```javascript
// Verifique no console:
console.log(window.admin);
console.log(window.admin.users);
```

### **Problema: Decorador não encontrado**
**Solução:**
```javascript
// Verifique ID do decorador:
console.log(window.admin.users);
// Use o ID correto
```

### **Problema: Campos vazios no modal**
**Solução:**
- Certifique-se que o decorador tem `whatsapp` e `communication_email`
- Verifique dados no localStorage
- Recarregue a lista de usuários

### **Problema: Contador não atualiza**
**Solução:**
- Digite algo no campo WhatsApp
- Listener está configurado para `input` event
- Verifique console por erros

---

## 📱 Preview de Mensagens

### **Como Visualizar:**

#### **WhatsApp:**
1. Abra o modal de notificação
2. Copie o texto do campo WhatsApp
3. Envie para você mesmo
4. Veja como fica formatado

#### **E-mail:**
1. Copie o HTML do campo E-mail
2. Cole em um editor HTML online (ex: CodePen)
3. Veja preview visual
4. Ou envie para seu próprio e-mail

---

## ✅ Checklist de Uso

**Antes de Enviar:**
- [ ] Nome do decorador está correto
- [ ] Canais de envio selecionados
- [ ] Mensagens revisadas
- [ ] Informações de contato conferidas
- [ ] Mensagem WhatsApp < 1000 caracteres
- [ ] Assunto do e-mail claro e objetivo
- [ ] Tom apropriado (aprovação/recusa)

**Depois de Enviar:**
- [ ] Feedback de sucesso recebido
- [ ] Modal fechou automaticamente
- [ ] Verifique console para log de dados
- [ ] (Em produção) Confirme recebimento com decorador

---

## 🎯 Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| `Esc` | Fechar modal |
| `Tab` | Navegar entre campos |
| `Ctrl + A` | Selecionar todo texto |

---

## 📈 Próximas Funcionalidades

- [ ] Histórico de notificações enviadas
- [ ] Templates salvos personalizados
- [ ] Anexos em e-mails
- [ ] Agendamento de envio
- [ ] Confirmação de leitura
- [ ] Reenvio automático
- [ ] Múltiplos idiomas
- [ ] Estatísticas de entrega

---

## 🔐 Segurança

- ✅ Apenas admins autenticados podem enviar
- ✅ Dados validados antes do envio
- ✅ Logs de todas as notificações
- ✅ Sanitização de HTML em e-mails
- ✅ Rate limiting (implementar no backend)

---

## 📞 Suporte

**Problemas ou dúvidas?**
- 📧 Contato: dev@upbaloes.com
- 📖 Documentação completa em `/docs`
- 🐛 Reporte bugs via Issues do GitHub

---

**✨ Sistema pronto para uso! Boas notificações! 📱**

