# 🔧 Modo de Desenvolvimento - Up.Baloes

## ⚡ Acesso Rápido às Telas (Sem Banco de Dados)

Este documento explica como acessar as telas administrativas e de decorador **sem precisar de autenticação real** durante o desenvolvimento.

---

## 🎯 O Que Foi Configurado?

Adicionei uma **variável de ambiente de desenvolvimento** (`DEV_MODE`) nas seguintes páginas:

### 1. **Painel Administrativo** (`pages/admin.html`)
- ✅ Login automático como **Admin**
- ✅ Dados mockados do administrador
- ✅ Acesso completo ao dashboard e funcionalidades

### 2. **Painel do Decorador** (`pages/painel-decorador.html`)
- ✅ Login automático como **Decorador**
- ✅ Dados mockados do decorador
- ✅ Acesso completo ao painel gerencial

---

## 🚀 Como Usar?

### **Opção 1: Acesso Direto pelo Navegador**

Basta abrir os arquivos HTML diretamente:

#### **Painel Admin:**
```
file:///C:/Users/mateu/OneDrive/Documentos/Área de Trabalho/Up.BaloesV3/pages/admin.html
```

#### **Painel Decorador:**
```
file:///C:/Users/mateu/OneDrive/Documentos/Área de Trabalho/Up.BaloesV3/pages/painel-decorador.html
```

### **Opção 2: Pelo Windows Explorer**
1. Navegue até a pasta `pages`
2. Clique duas vezes em:
   - `admin.html` (para área administrativa)
   - `painel-decorador.html` (para área do decorador)

---

## 📋 Dados Mockados

### **Admin (admin.html)**
```javascript
{
    id: 1,
    nome: 'Admin Desenvolvimento',
    email: 'admin@dev.com',
    role: 'admin',
    telefone: '(11) 99999-9999'
}
```

### **Decorador (painel-decorador.html)**
```javascript
{
    id: 2,
    nome: 'Decorador Desenvolvimento',
    email: 'decorador@dev.com',
    role: 'decorator',
    telefone: '(11) 98888-8888',
    whatsapp: '(11) 98888-8888',
    endereco: 'Rua Teste, 123',
    slug: 'decorador-dev'
}
```

---

## 🔒 Como Desativar o Modo de Desenvolvimento?

Quando você conectar o banco de dados e quiser usar a autenticação real:

### **Em `admin.html`** (linha 70):
```javascript
const DEV_MODE = false; // Mude de true para false
```

### **Em `painel-decorador.html`** (linha 31):
```javascript
const DEV_MODE = false; // Mude de true para false
```

---

## ⚠️ IMPORTANTE

### **❌ NÃO SE ESQUEÇA:**
1. **SEMPRE desative o modo de desenvolvimento em produção!**
2. Mude `DEV_MODE = false` antes de fazer deploy
3. Este modo é **APENAS PARA DESENVOLVIMENTO LOCAL**
4. Nunca coloque o sistema online com `DEV_MODE = true`

---

## 🎨 O Que Você Pode Testar?

### **No Painel Admin:**
- ✅ Visualizar dashboard com métricas
- ✅ Criar decoradores (formulário completo)
- ✅ Gerenciar usuários (tabela, filtros, edição)
- ✅ Ver gráficos e estatísticas
- ✅ Navegar por todas as seções

### **No Painel Decorador:**
- ✅ Painel gerencial de orçamentos
- ✅ Gerenciar portfólio
- ✅ Controlar agenda e disponibilidade
- ✅ Ver dashboard com estatísticas
- ✅ Gerenciar conta

---

## 📱 Console do Navegador

Quando você abrir as páginas com `DEV_MODE = true`, verá mensagens no console:

```
🔧 MODO DESENVOLVIMENTO: Admin logado automaticamente
```
ou
```
🔧 MODO DESENVOLVIMENTO: Decorador logado automaticamente
```

Para ver o console:
- Pressione **F12** no navegador
- Clique na aba **Console**

---

## 🐛 Solução de Problemas

### **Problema: Ainda me redireciona para o login**
**Solução:** 
1. Limpe o localStorage do navegador:
   - Pressione F12
   - Console → digite: `localStorage.clear()`
   - Recarregue a página (F5)

### **Problema: Dados não aparecem**
**Solução:**
1. Verifique se `DEV_MODE = true`
2. Abra o console (F12) e veja se há erros
3. Verifique se o localStorage foi populado:
   ```javascript
   console.log(localStorage.getItem('userData'));
   ```

---

## 📝 Checklist para Produção

Antes de fazer deploy, verifique:

- [ ] `DEV_MODE = false` em `admin.html`
- [ ] `DEV_MODE = false` em `painel-decorador.html`
- [ ] Banco de dados configurado
- [ ] API de autenticação funcionando
- [ ] Teste o login real com usuários verdadeiros

---

## 👨‍💻 Para Desenvolvedores

Se você quiser modificar os dados mockados, edite as linhas:

- **admin.html**: linhas 73-80
- **painel-decorador.html**: linhas 35-44

---

**Desenvolvido para facilitar o desenvolvimento local sem necessidade de banco de dados! 🚀**

Data: 07/10/2025

