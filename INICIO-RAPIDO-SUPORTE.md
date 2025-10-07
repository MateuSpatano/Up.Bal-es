# 🚀 Início Rápido - Sistema de Suporte

**Up.Baloes - Guia de 5 Minutos**

---

## 👨‍🎨 Para Decoradores

### **Como Relatar um Problema:**

1. **Abra** seu painel de decorador (`painel-decorador.html`)

2. **Clique** no botão 🎧 (headset) no canto superior direito

3. **Preencha** o formulário:
   - **Título:** "Erro ao salvar orçamento" (exemplo)
   - **Descrição:** Detalhe o que aconteceu
   - **Anexo:** Tire um print da tela (opcional)

4. **Clique** em "Enviar Feedback"

5. **✅ Pronto!** Você verá:
   - Toast verde "Feedback Enviado"
   - Mensagem de confirmação
   - Modal fecha sozinho em 3 segundos

---

## 👨‍💼 Para Administradores

### **Como Ver e Gerenciar Chamados:**

1. **Abra** o painel admin (`admin.html`)

2. **Clique** em "Suporte" no menu lateral

3. **Veja** as estatísticas:
   ```
   Total: 3  |  Novos: 1  |  Em Análise: 1  |  Resolvidos: 1
   ```

4. **Clique** em qualquer chamado da lista

5. **No modal** você pode:
   - 👁️ Ver todos os detalhes
   - 🖼️ Visualizar anexo (se houver)
   - 🔄 Mudar status
   - 🗑️ Excluir chamado

6. **Alterar Status:**
   - Selecione novo status (Em Análise, Resolvido, etc)
   - Clique em "Salvar Status"
   - ✅ Atualizado!

---

## 🎯 Exemplo Completo (2 Minutos)

### **Teste Rápido:**

#### **No Decorador:**
```
1. Abra painel-decorador.html
2. Clique no 🎧
3. Digite:
   Título: "Teste de suporte"
   Descrição: "Este é um teste do sistema"
4. Enviar
5. ✅ Confirmação aparece
```

#### **No Admin:**
```
1. Abra admin.html
2. Menu → Suporte
3. ✅ Veja "1" em "Novos"
4. ✅ Veja o chamado "Teste de suporte"
5. Clique para ver detalhes
6. Mude status para "Em Análise"
7. Salve
8. ✅ Estatísticas atualizadas!
```

---

## 🔍 Verificar se Funcionou

**Console do Navegador (F12):**

```javascript
// Ver todos chamados
console.table(JSON.parse(localStorage.getItem('support_tickets')));

// Resultado esperado:
[
  {
    id: "1234567890abc",
    title: "Teste de suporte",
    status: "em_analise",
    decorator_name: "Decorador Desenvolvimento",
    created_at: "2025-10-07T..."
  }
]
```

---

## ⚡ Atalhos

| Ação | Como Fazer |
|------|------------|
| Abrir suporte (Decorador) | Clique no 🎧 no header |
| Limpar chamados | `localStorage.removeItem('support_tickets')` |
| Criar chamado teste | Ver SISTEMA-SUPORTE-COMPLETO.md |
| Recarregar lista (Admin) | `window.admin.loadSupportTickets()` |

---

## 🐛 Problemas?

**Chamados não aparecem no admin?**
```javascript
// Verifique se estão salvos:
console.log(localStorage.getItem('support_tickets'));
```

**Modal não abre?**
```javascript
// Verifique se elemento existe:
console.log(document.getElementById('support-modal'));
```

**Erro ao enviar?**
```javascript
// Verifique dados do usuário:
console.log(localStorage.getItem('userData'));
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- **`SISTEMA-SUPORTE-COMPLETO.md`** - Documentação técnica completa
- **`ALTERACOES-FORMULARIO-DECORADOR.md`** - Alterações no formulário
- **`GUIA-USO-NOTIFICACOES.md`** - Sistema de notificações

---

**✨ Sistema pronto para uso! Teste agora! 🎧**



