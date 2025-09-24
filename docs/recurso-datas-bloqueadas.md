# Funcionalidade de Datas Bloqueadas

## Resumo

Implementação completa de funcionalidade para bloquear datas específicas no módulo de Gerenciar Agenda, permitindo que o decorador bloqueie datas em que não pode atender.

## Funcionalidades Implementadas

### ✅ 1. Estrutura do Banco de Dados
- **Tabela**: `decorator_blocked_dates`
- **Campos**:
  - `id`: ID único da data bloqueada
  - `user_id`: ID do decorador
  - `blocked_date`: Data bloqueada
  - `reason`: Motivo do bloqueio
  - `is_recurring`: Se a data se repete anualmente
  - `created_at` e `updated_at`: Timestamps

### ✅ 2. Serviço Backend (PHP)
- **Arquivo**: `services/blocked-dates.php`
- **Ações disponíveis**:
  - `add`: Adicionar nova data bloqueada
  - `list`: Listar datas bloqueadas
  - `remove`: Remover data bloqueada
  - `check`: Verificar se uma data está bloqueada

### ✅ 3. Interface Frontend
- **Formulário de adição**: Data, motivo e opção de recorrência
- **Lista de datas bloqueadas**: Visualização com opção de remoção
- **Validações**: Data não pode ser no passado
- **Feedback visual**: Cores diferentes para datas recorrentes

### ✅ 4. Integração com Validação
- **Serviço de disponibilidade**: Considera datas bloqueadas na validação
- **Serviço de orçamentos**: Impede criação de orçamentos em datas bloqueadas
- **Verificação automática**: Sistema verifica automaticamente datas recorrentes

## Estrutura de Dados

### Formato de Entrada
```json
{
    "action": "add",
    "blocked_date": "2024-12-25",
    "reason": "Natal - Feriado",
    "is_recurring": true
}
```

### Formato de Resposta
```json
{
    "success": true,
    "message": "Data bloqueada com sucesso",
    "data": {
        "id": 1,
        "blocked_date": "2024-12-25",
        "reason": "Natal - Feriado",
        "is_recurring": true
    }
}
```

## Interface do Usuário

### Formulário de Adição
- **Campo Data**: Input tipo date com validação (não pode ser no passado)
- **Campo Motivo**: Input texto opcional para explicar o bloqueio
- **Checkbox Recorrente**: Para datas que se repetem anualmente (feriados, aniversários)

### Lista de Datas Bloqueadas
- **Visualização**: Cards com data formatada, motivo e status de recorrência
- **Cores**: 
  - Vermelho para datas únicas
  - Amarelo para datas recorrentes
- **Ação**: Botão de remoção com confirmação

## Funcionalidades Especiais

### 🔄 Datas Recorrentes
- **Funcionamento**: Datas marcadas como recorrentes são automaticamente aplicadas para o próximo ano
- **Exemplo**: Se bloquear 25/12/2024 como recorrente, o sistema automaticamente considera 25/12/2025 bloqueada
- **Identificação**: Datas recorrentes aparecem com ícone de repetição e cor amarela

### ✅ Validação Integrada
- **Orçamentos**: Sistema impede criação de orçamentos em datas bloqueadas
- **Disponibilidade**: Validação considera tanto disponibilidade semanal quanto datas bloqueadas
- **Mensagens**: Feedback claro sobre o motivo da indisponibilidade

### 🎯 Verificação Automática
- **API de verificação**: Endpoint para verificar se uma data específica está bloqueada
- **Integração**: Usado por outros serviços do sistema
- **Performance**: Consultas otimizadas com índices no banco

## Como Usar

### Bloquear uma Data
1. Acesse o módulo "Gerenciar Agenda"
2. Vá para a seção "Datas Bloqueadas"
3. Preencha o formulário:
   - Selecione a data a bloquear
   - Adicione um motivo (opcional)
   - Marque "Recorrente" se aplicável
4. Clique em "Bloquear Data"

### Remover uma Data Bloqueada
1. Na lista de datas bloqueadas
2. Clique no ícone de lixeira
3. Confirme a remoção

### Verificar se uma Data Está Bloqueada
- O sistema verifica automaticamente ao tentar criar orçamentos
- Datas bloqueadas aparecem visualmente diferenciadas na interface

## Exemplos de Uso

### Feriados Fixos
```json
{
    "blocked_date": "2024-12-25",
    "reason": "Natal",
    "is_recurring": true
}
```

### Viagens ou Compromissos
```json
{
    "blocked_date": "2024-08-15",
    "reason": "Viagem de férias",
    "is_recurring": false
}
```

### Aniversários Pessoais
```json
{
    "blocked_date": "2024-03-20",
    "reason": "Aniversário",
    "is_recurring": true
}
```

## Integração com Outros Módulos

### Módulo de Orçamentos
- **Validação automática**: Impede criação de orçamentos em datas bloqueadas
- **Mensagem clara**: "Esta data está bloqueada para atendimento"

### Módulo de Agenda
- **Visualização**: Datas bloqueadas aparecem no calendário
- **Gerenciamento**: Interface para adicionar/remover bloqueios

### Sistema de Notificações
- **Alertas**: Notifica quando tentativa de agendamento em data bloqueada
- **Sugestões**: Pode sugerir datas alternativas disponíveis

## Benefícios

### Para o Decorador
- **Controle total**: Pode bloquear qualquer data específica
- **Flexibilidade**: Bloqueios únicos ou recorrentes
- **Organização**: Motivos claros para cada bloqueio
- **Automação**: Sistema gerencia recorrências automaticamente

### Para o Sistema
- **Prevenção de conflitos**: Evita agendamentos em datas indisponíveis
- **Validação robusta**: Múltiplas camadas de verificação
- **Performance**: Consultas otimizadas
- **Escalabilidade**: Suporta muitos decoradores simultaneamente

## Arquivos Criados/Modificados

### Novos Arquivos
- `database/create_blocked_dates_table.sql` - Estrutura da tabela
- `services/blocked-dates.php` - Serviço de gerenciamento
- `docs/blocked-dates-feature.md` - Esta documentação

### Arquivos Modificados
- `pages/decorator-dashboard.html` - Interface de usuário
- `js/decorator-dashboard.js` - Funcionalidades JavaScript
- `services/availability.php` - Integração com validação
- `services/budgets.php` - Integração com orçamentos

## Próximas Melhorias Sugeridas

1. **Calendário Visual**: Mostrar datas bloqueadas no calendário principal
2. **Importação em Massa**: Importar feriados nacionais automaticamente
3. **Notificações**: Alertas quando datas bloqueadas se aproximam
4. **Relatórios**: Estatísticas de uso das datas bloqueadas
5. **API Externa**: Integração com calendários de feriados

---

**Data de Implementação**: Dezembro 2024  
**Versão**: 1.0  
**Status**: ✅ Concluído e Funcional