# Guia de Lançamento de Custos - Up.Baloes

## Visão Geral

O módulo de lançamento de custos foi aprimorado para permitir que os decoradores lancem os custos reais de seus projetos aprovados diretamente no dashboard, calculando automaticamente o lucro real e a margem de lucro.

## Funcionalidades Implementadas

### 1. Novos KPIs no Dashboard

- **Lucro Total do Mês**: Soma do lucro líquido de todos os projetos com custos lançados no período
- **Margem Média de Lucro**: Média percentual da margem de lucro dos projetos

### 2. Seção de Projetos Concluídos

- Lista todos os orçamentos com status "Aprovado"
- Mostra quais projetos já tiveram custos lançados e quais estão pendentes
- Botão "+ Lançar Custos" ou "+ Editar Custos" para cada projeto

### 3. Modal de Lançamento de Custos

- **Preço de Venda**: Campo read-only com o valor do orçamento aprovado
- **Custo Total com Materiais**: Gastos com balões, fitas, bases, etc.
- **Custo Total com Mão de Obra**: Valor pago para montagem e instalação
- **Outros Custos**: Combustível, frete, taxas, etc.
- **Observações**: Campo opcional para observações sobre os custos
- **Resumo de Cálculos**: Atualização em tempo real dos valores calculados

### 4. Cálculos Automáticos

- **Custo Total do Projeto**: Soma de materiais + mão de obra + outros custos
- **Lucro Real Líquido**: Preço de venda - Custo total do projeto
- **Margem de Lucro**: (Lucro real / Preço de venda) × 100

## Como Usar

### Passo 1: Acessar o Dashboard
1. Faça login no painel do decorador
2. Navegue para o módulo "Dashboard"
3. A seção "Projetos Concluídos para Lançar Custos" aparecerá automaticamente

### Passo 2: Lançar Custos de um Projeto
1. Na lista de projetos concluídos, clique em "+ Lançar Custos" no projeto desejado
2. O modal será aberto com as informações do projeto pré-preenchidas
3. Preencha os campos de custos:
   - Custo Total com Materiais
   - Custo Total com Mão de Obra
   - Outros Custos
   - Observações (opcional)
4. Observe o resumo de cálculos sendo atualizado em tempo real
5. Clique em "Salvar Custos"

### Passo 3: Verificar Resultados
1. Após salvar, o modal será fechado automaticamente
2. Os KPIs do dashboard serão atualizados instantaneamente
3. O projeto aparecerá como "Custos Lançados" na lista
4. O botão mudará para "+ Editar Custos" para permitir alterações futuras

## Estrutura do Banco de Dados

### Nova Tabela: `projeto_custos`

```sql
CREATE TABLE projeto_custos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orcamento_id INT NOT NULL,
    preco_venda DECIMAL(10,2) NOT NULL,
    custo_total_materiais DECIMAL(10,2) DEFAULT 0.00,
    custo_total_mao_de_obra DECIMAL(10,2) DEFAULT 0.00,
    custos_diversos DECIMAL(10,2) DEFAULT 0.00,
    custo_total_projeto DECIMAL(10,2) GENERATED ALWAYS AS (...),
    lucro_real_liquido DECIMAL(10,2) GENERATED ALWAYS AS (...),
    margem_lucro_percentual DECIMAL(5,2) GENERATED ALWAYS AS (...),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE CASCADE
);
```

## APIs Implementadas

### 1. Obter Dados do Dashboard
```javascript
POST /services/painel.php
{
    "action": "getData"
}
```

### 2. Lançar Custos
```javascript
POST /services/painel.php
{
    "action": "lancarCustos",
    "orcamento_id": 123,
    "dados_custos": {
        "custo_total_materiais": 150.00,
        "custo_total_mao_de_obra": 200.00,
        "custos_diversos": 50.00,
        "observacoes": "Observações sobre os custos"
    }
}
```

### 3. Obter Detalhes de Custos
```javascript
POST /services/painel.php
{
    "action": "getDetalhesCustos",
    "orcamento_id": 123
}
```

## Características Técnicas

### Backend (PHP)
- Validação de dados de entrada
- Cálculos automáticos via colunas geradas do MySQL
- Tratamento de erros e logs
- Verificação de permissões (decorador só pode ver seus próprios projetos)

### Frontend (JavaScript)
- Interface responsiva com Tailwind CSS
- Cálculos em tempo real no modal
- Atualização dinâmica dos KPIs
- Notificações de sucesso/erro
- Validação de formulários

### Banco de Dados
- Colunas geradas para cálculos automáticos
- Índices para performance
- Relacionamentos com foreign keys
- Triggers para atualização de timestamps

## Benefícios

1. **Controle Financeiro**: Acompanhamento preciso do lucro real de cada projeto
2. **Tomada de Decisão**: Dados para otimizar preços e custos
3. **Relatórios**: Base para relatórios financeiros detalhados
4. **Eficiência**: Interface integrada no dashboard principal
5. **Precisão**: Cálculos automáticos evitam erros manuais

## Próximos Passos Sugeridos

1. Relatórios de lucratividade por período
2. Análise de tendências de custos
3. Alertas para projetos com margem baixa
4. Exportação de dados para planilhas
5. Comparação com orçamentos estimados

## Suporte

Para dúvidas ou problemas com a funcionalidade de lançamento de custos, consulte:
- Logs do sistema em `error_log`
- Console do navegador para erros JavaScript
- Verificação da estrutura do banco de dados
