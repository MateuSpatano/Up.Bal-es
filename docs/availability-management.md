# Gerenciamento de Disponibilidade - Up.Baloes

## Visão Geral

O módulo de Gerenciamento de Disponibilidade permite que os decoradores configurem seus horários de atendimento, dias disponíveis e intervalos entre serviços. Essas configurações são utilizadas para validar automaticamente a criação de orçamentos e agendamentos.

## Funcionalidades Implementadas

### 1. Seleção de Dias da Semana

- **Interface**: Cards interativos para cada dia da semana
- **Funcionalidade**: Seleção múltipla de dias disponíveis
- **Validação**: Pelo menos um dia deve ser selecionado
- **Persistência**: Configurações salvas no banco de dados

### 2. Horários de Atendimento

- **Interface**: Formulário dinâmico para adicionar horários
- **Campos**:
  - Dia da semana
  - Horário de início
  - Horário de fim
- **Validação**: Horário de início deve ser anterior ao fim
- **Gestão**: Adicionar, editar e excluir horários

### 3. Intervalo Entre Serviços

- **Configuração**: Tempo mínimo entre um serviço e outro
- **Unidades**: Horas ou minutos
- **Validação**: Verificação automática ao criar orçamentos
- **Flexibilidade**: Configurável de 0 a 24 horas

### 4. Limite de Serviços por Dia

- **Configuração**: Máximo de serviços que podem ser agendados no mesmo dia
- **Validação**: Verificação automática ao criar orçamentos
- **Flexibilidade**: Configurável de 1 a 10 serviços

## Como Usar

### Acessando o Módulo

1. Faça login no painel do decorador
2. Navegue para "Gerenciar Agenda" no menu lateral
3. A interface de disponibilidade será exibida automaticamente

### Configurando Dias Disponíveis

1. Na seção "Dias de Disponibilidade"
2. Clique nos cards dos dias da semana desejados
3. Os dias selecionados ficarão destacados em azul

### Adicionando Horários de Atendimento

1. Na seção "Horários de Atendimento"
2. Clique em "Adicionar Horário"
3. Preencha:
   - Dia da semana
   - Horário de início
   - Horário de fim
4. Use os botões de ação para editar ou excluir horários

### Configurando Intervalos

1. Na seção "Intervalo Entre Serviços"
2. Defina o tempo mínimo entre serviços
3. Escolha a unidade (horas ou minutos)
4. Configure o máximo de serviços por dia

### Salvando Configurações

1. Clique em "Salvar Configurações"
2. As configurações serão validadas
3. Se válidas, serão salvas no banco de dados
4. Uma notificação de sucesso será exibida

## Validações Automáticas

### Ao Criar Orçamentos

O sistema verifica automaticamente:

1. **Dia da Semana**: Se o dia está nos dias disponíveis
2. **Horário**: Se está dentro dos horários de atendimento
3. **Limite Diário**: Se não excede o máximo de serviços por dia
4. **Intervalo**: Se respeita o intervalo mínimo entre serviços

### Mensagens de Erro

- "Não há atendimento neste dia da semana"
- "Horário fora do período de atendimento"
- "Limite de X serviços por dia atingido"
- "Intervalo mínimo de X hora(s) entre serviços não respeitado"

## Estrutura do Banco de Dados

### Tabela: decorator_availability

```sql
CREATE TABLE decorator_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    available_days JSON NOT NULL,
    time_schedules JSON NOT NULL,
    service_interval INT DEFAULT 1,
    interval_unit ENUM('hours', 'minutes') DEFAULT 'hours',
    max_daily_services INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Exemplo de Dados

```json
{
    "available_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "time_schedules": [
        {
            "day": "monday",
            "start_time": "08:00",
            "end_time": "18:00"
        }
    ],
    "service_interval": 1,
    "interval_unit": "hours",
    "max_daily_services": 3
}
```

## APIs Disponíveis

### Salvar Configurações

**Endpoint**: `POST /services/availability.php`

**Payload**:
```json
{
    "action": "save",
    "available_days": ["monday", "tuesday"],
    "time_schedules": [
        {
            "day": "monday",
            "start_time": "08:00",
            "end_time": "18:00"
        }
    ],
    "service_interval": 1,
    "interval_unit": "hours",
    "max_daily_services": 3
}
```

### Carregar Configurações

**Endpoint**: `POST /services/availability.php`

**Payload**:
```json
{
    "action": "load"
}
```

### Validar Disponibilidade

**Endpoint**: `POST /services/availability.php`

**Payload**:
```json
{
    "action": "validate",
    "event_date": "2024-12-25",
    "event_time": "14:00"
}
```

## Considerações Técnicas

### Compatibilidade

- O sistema funciona mesmo sem configurações de disponibilidade
- Validações são aplicadas apenas quando configurações existem
- Modo de compatibilidade para decoradores existentes

### Performance

- Configurações são carregadas uma vez por sessão
- Validações são executadas no servidor
- Cache local para melhor experiência do usuário

### Segurança

- Validações no frontend e backend
- Sanitização de dados de entrada
- Verificação de permissões de usuário

## Troubleshooting

### Problemas Comuns

1. **Configurações não salvam**
   - Verifique se todos os campos obrigatórios estão preenchidos
   - Confirme se há pelo menos um dia e um horário configurado

2. **Validações não funcionam**
   - Verifique se as configurações foram salvas corretamente
   - Confirme se o banco de dados está acessível

3. **Interface não carrega**
   - Verifique se o JavaScript está habilitado
   - Confirme se os arquivos CSS e JS estão carregando

### Logs

Os erros são registrados em:
- Logs do servidor web
- Console do navegador (F12)
- Tabela `budget_logs` (se configurada)

## Próximas Funcionalidades

- [ ] Calendário visual de disponibilidade
- [ ] Bloqueios de datas específicas
- [ ] Notificações de conflitos
- [ ] Relatórios de disponibilidade
- [ ] Sincronização com calendários externos