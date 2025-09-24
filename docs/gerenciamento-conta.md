# Funcionalidade de Gerenciamento de Conta - Up.Baloes

## Visão Geral

A funcionalidade de Gerenciamento de Conta permite que os usuários atualizem suas informações pessoais através de um modal moderno e responsivo, sem precisar navegar para outra página.

## Funcionalidades Implementadas

### ✅ Interface do Modal
- **Design Moderno**: Modal responsivo com gradientes e animações suaves
- **Ícones Elegantes**: Utilização do Font Awesome para ícones intuitivos
- **Layout Responsivo**: Adaptável a diferentes tamanhos de tela (desktop, tablet, mobile)
- **Animações**: Transições suaves de abertura/fechamento

### ✅ Campos Disponíveis
- **Nome Completo** (obrigatório)
- **Email** (obrigatório)
- **Telefone** (opcional, com formatação automática)
- **Endereço** (opcional, textarea)
- **Cidade** (opcional)
- **Estado** (opcional, dropdown com todos os estados brasileiros)
- **CEP** (opcional, com formatação automática)
- **Senha Atual** (obrigatório para alterar senha)
- **Nova Senha** (opcional, com validação de força)
- **Confirmar Nova Senha** (opcional)

### ✅ Validações em Tempo Real
- **Email**: Validação de formato e verificação de duplicatas
- **Telefone**: Formatação automática e validação de padrão brasileiro
- **CEP**: Formatação automática e validação de padrão
- **Senha**: Validação de força (mínimo 8 caracteres, letras e números)
- **Confirmação de Senha**: Verificação de coincidência

### ✅ Funcionalidades de UX
- **Toggle de Senha**: Botões para mostrar/ocultar senhas
- **Mensagens de Feedback**: Indicadores visuais de erro e sucesso
- **Loading States**: Indicadores de carregamento durante salvamento
- **Fechamento Inteligente**: ESC, clique fora do modal, ou botão cancelar
- **Prevenção de Scroll**: Bloqueia scroll da página quando modal está aberto

### ✅ Backend PHP
- **Endpoint Seguro**: `services/account.php` com validações robustas
- **Validação de Dados**: Sanitização e validação de todos os campos
- **Verificação de Senha**: Validação da senha atual antes de alterar
- **Prevenção de Duplicatas**: Verificação de email único
- **Logs de Auditoria**: Registro de alterações no banco de dados
- **Transações**: Uso de transações para garantir consistência

## Como Usar

### 1. Acessar o Modal
1. Clique no ícone de usuário na navbar (canto superior direito)
2. Selecione "Gestão de Conta" no dropdown
3. O modal será aberto com os dados atuais do usuário

### 2. Editar Informações
1. Preencha os campos desejados
2. As validações acontecem em tempo real
3. Para alterar a senha, preencha os campos de senha
4. Clique em "Salvar Alterações"

### 3. Cancelar Alterações
- Clique em "Cancelar"
- Pressione ESC
- Clique fora do modal

## Estrutura de Arquivos

```
Up.BaloesV3/
├── index.html                 # Modal HTML integrado
├── css/styles.css            # Estilos do modal
├── js/main.js                # Funcionalidades JavaScript
├── services/
│   ├── account.php           # Endpoint PHP
│   └── config.php            # Configurações
├── database/
│   └── update_users_table.sql # Script de atualização do banco
└── docs/
    └── account-management.md  # Esta documentação
```

## Configuração do Banco de Dados

### 1. Executar Script SQL
```sql
-- Execute o arquivo database/update_users_table.sql
-- Isso adicionará os novos campos à tabela usuarios
```

### 2. Campos Adicionados
- `telefone` VARCHAR(20)
- `endereco` TEXT
- `cidade` VARCHAR(100)
- `estado` VARCHAR(2)
- `cep` VARCHAR(10)

## Personalização

### Cores e Estilos
Edite as variáveis CSS em `css/styles.css`:
```css
/* Cores principais do modal */
--primary-color: #3b82f6;
--secondary-color: #6366f1;
--success-color: #10b981;
--error-color: #ef4444;
```

### Validações
Modifique as funções de validação em `js/main.js`:
```javascript
// Exemplo: alterar validação de senha
function validatePassword(password) {
    // Sua lógica personalizada aqui
}
```

### Campos Adicionais
Para adicionar novos campos:
1. Adicione o campo no HTML do modal
2. Adicione validação no JavaScript
3. Atualize o endpoint PHP
4. Adicione coluna no banco de dados

## Segurança

### Medidas Implementadas
- **Sanitização**: Todos os dados são sanitizados antes do processamento
- **Validação**: Validação tanto no frontend quanto no backend
- **Prevenção de SQL Injection**: Uso de prepared statements
- **Verificação de Sessão**: Apenas usuários logados podem acessar
- **Hash de Senhas**: Senhas são hasheadas com `password_hash()`
- **Headers de Segurança**: Headers de segurança configurados

### Recomendações
- Sempre valide dados no backend
- Use HTTPS em produção
- Implemente rate limiting para prevenir spam
- Mantenha logs de auditoria
- Atualize dependências regularmente

## Troubleshooting

### Problemas Comuns

#### Modal não abre
- Verifique se o JavaScript está carregando
- Confirme se os elementos DOM existem
- Verifique o console do navegador para erros

#### Validações não funcionam
- Confirme se os event listeners estão configurados
- Verifique se as funções de validação estão definidas
- Teste as validações individualmente

#### Erro ao salvar dados
- Verifique se o endpoint PHP está acessível
- Confirme se o usuário está logado
- Verifique os logs de erro do servidor
- Teste a conexão com o banco de dados

#### Estilos não aplicam
- Confirme se o TailwindCSS está carregando
- Verifique se os arquivos CSS estão no local correto
- Limpe o cache do navegador

## Próximas Melhorias

### Funcionalidades Futuras
- [ ] Upload de foto de perfil
- [ ] Integração com API de CEP (ViaCEP)
- [ ] Histórico de alterações
- [ ] Notificações por email
- [ ] Autenticação de dois fatores
- [ ] Exportação de dados pessoais

### Melhorias de Performance
- [ ] Lazy loading de dados
- [ ] Cache de validações
- [ ] Otimização de queries
- [ ] Compressão de assets

## Suporte

Para dúvidas ou problemas:
- Verifique esta documentação
- Consulte os logs de erro
- Teste em ambiente de desenvolvimento
- Entre em contato com a equipe de desenvolvimento

---

**Up.Baloes** - Sistema moderno para gestão de serviços com balões 🎈