# Painel Gerencial do Decorador - Up.Balões

## Funcionalidades Implementadas

### 1. Botão Flutuante de Criação de Orçamentos
- **Localização**: Canto inferior direito da tela
- **Comportamento**: Fixo, acompanha o scroll
- **Funcionalidade**: Abre modal para criação de novo orçamento
- **Estilo**: Botão circular com gradiente azul e efeitos hover

### 2. Modal de Criação de Orçamentos
- **Campos Obrigatórios**:
  - Nome do cliente
  - Email do cliente
  - Data do evento
  - Hora do evento
  - Local do evento
  - Tipo de serviço
- **Campos Opcionais**:
  - Telefone
  - Descrição do evento
  - Valor estimado
  - Observações
- **Validações**:
  - Data não pode ser no passado
  - Email deve ter formato válido
  - Campos obrigatórios devem ser preenchidos

### 3. Gerenciamento de Orçamentos Pendentes
- **Seções Organizadas**:
  - Orçamentos Pendentes (amarelo)
  - Orçamentos Aprovados (verde)
  - Orçamentos Recusados (vermelho)
- **Contadores**: Mostram quantidade de orçamentos em cada categoria
- **Botões de Ação** (apenas para pendentes):
  - Ver Detalhes
  - Editar Orçamento ✅ **IMPLEMENTADO**
  - Aprovar Orçamento
  - Recusar Orçamento

### 3.1. Modal de Edição de Orçamentos
- **Acesso**: Clique no botão "Editar" de qualquer orçamento pendente
- **Campos Editáveis**:
  - Nome do cliente
  - Email do cliente
  - Telefone
  - Data do evento
  - Hora do evento
  - Local do evento
  - Tipo de serviço
  - Descrição do evento
  - Valor estimado
  - Observações
- **Validações**:
  - Todos os campos obrigatórios devem ser preenchidos
  - Data não pode ser no passado
  - Email deve ter formato válido
- **Funcionalidades**:
  - Pré-preenchimento automático com dados atuais
  - Validação em tempo real
  - Salvamento via API
  - Atualização automática da lista após edição

### 4. Calendário de Eventos
- **Biblioteca**: FullCalendar v6.1.10
- **Visualizações**: Mês, Semana, Dia
- **Idioma**: Português brasileiro
- **Funcionalidades**:
  - Eventos coloridos por status
  - Clique no evento para ver detalhes
  - Navegação entre meses
  - Responsivo para mobile

### 5. Sistema de Filtros
- **Filtros Disponíveis**:
  - Status do orçamento
  - Período (hoje, semana, mês, todos)
  - Nome do cliente
- **Aplicação**: Filtros são aplicados em tempo real

### 6. Backend PHP
- **Arquivo**: `services/budgets.php`
- **Funcionalidades**:
  - Criar orçamento
  - Listar orçamentos
  - Obter orçamento por ID
  - Atualizar orçamento
  - Aprovar orçamento
  - Recusar orçamento
  - Deletar orçamento
  - Obter estatísticas
- **Segurança**: Validação de dados e logs de ações

### 7. Interface Responsiva
- **Mobile**: Layout adaptado para telas pequenas
- **Tablet**: Otimizado para tablets
- **Desktop**: Interface completa para desktop
- **Impressão**: Estilos específicos para impressão

## Estrutura de Arquivos

```
Up.BaloesV3/
├── pages/
│   └── decorator-dashboard.html    # Página principal do painel
├── js/
│   └── decorator-dashboard.js      # JavaScript do painel
├── css/
│   └── decorator-dashboard.css     # Estilos personalizados
├── services/
│   └── budgets.php                 # API de orçamentos
└── docs/
    └── decorator-dashboard-features.md  # Esta documentação
```

## Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Estilos personalizados e responsivos
- **JavaScript ES6+**: Funcionalidades interativas
- **TailwindCSS**: Framework CSS utilitário
- **Font Awesome**: Ícones
- **FullCalendar**: Biblioteca de calendário

### Backend
- **PHP 7.4+**: Linguagem de programação
- **MySQL**: Banco de dados
- **PDO**: Interface de acesso ao banco

## Banco de Dados

### Tabela: orcamentos
```sql
CREATE TABLE orcamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    data_evento DATE NOT NULL,
    hora_evento TIME NOT NULL,
    local_evento VARCHAR(255) NOT NULL,
    tipo_servico ENUM('arco-tradicional', 'arco-desconstruido', 'escultura-balao', 'centro-mesa', 'baloes-piscina') NOT NULL,
    descricao TEXT,
    valor_estimado DECIMAL(10,2) DEFAULT 0,
    observacoes TEXT,
    status ENUM('pendente', 'aprovado', 'recusado', 'enviado') DEFAULT 'pendente',
    decorador_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (decorador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

### Tabela: budget_logs
```sql
CREATE TABLE budget_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    budget_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES orcamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
```

## Como Usar

### 1. Acesso ao Painel
- Faça login no sistema
- Acesse o painel do decorador
- O painel carregará automaticamente os orçamentos

### 2. Criar Novo Orçamento
- Clique no botão "+" flutuante
- Preencha os dados do orçamento
- Clique em "Criar Orçamento"

### 3. Gerenciar Orçamentos
- Visualize orçamentos por categoria
- Use os botões de ação para cada orçamento
- **Editar Orçamento**: Clique em "Editar" para modificar dados
- Aprove ou recuse orçamentos pendentes

### 4. Visualizar Calendário
- Clique no botão "Calendário"
- Navegue entre os meses
- Clique nos eventos para ver detalhes

### 5. Filtrar Orçamentos
- Use os filtros na parte superior
- Clique em "Filtrar" para aplicar

## Recursos Futuros

- [x] Edição de orçamentos existentes ✅ **IMPLEMENTADO**
- [ ] Envio de orçamentos por email
- [ ] Relatórios e estatísticas avançadas
- [ ] Notificações em tempo real
- [ ] Upload de imagens para orçamentos
- [ ] Integração com sistema de pagamentos
- [ ] Chat com clientes
- [ ] Sistema de avaliações

## Suporte

Para dúvidas ou problemas, consulte a documentação técnica ou entre em contato com o suporte.