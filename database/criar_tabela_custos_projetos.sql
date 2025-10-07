-- =====================================================
-- CRIAÇÃO DA TABELA DE CUSTOS REAIS DOS PROJETOS
-- Up.Baloes - Sistema de Gestão de Decoração com Balões
-- =====================================================

USE up_baloes;

-- =====================================================
-- TABELA DE CUSTOS REAIS DOS PROJETOS
-- =====================================================
CREATE TABLE IF NOT EXISTS projeto_custos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orcamento_id INT NOT NULL,
    preco_venda DECIMAL(10,2) NOT NULL COMMENT 'Preço de venda do orçamento (read-only)',
    custo_total_materiais DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Custo total com materiais (balões, etc.)',
    custo_total_mao_de_obra DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Custo total com mão de obra',
    custos_diversos DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Outros custos (combustível, frete, etc.)',
    custo_total_projeto DECIMAL(10,2) GENERATED ALWAYS AS (custo_total_materiais + custo_total_mao_de_obra + custos_diversos) STORED COMMENT 'Custo total calculado automaticamente',
    lucro_real_liquido DECIMAL(10,2) GENERATED ALWAYS AS (preco_venda - custo_total_materiais - custo_total_mao_de_obra - custos_diversos) STORED COMMENT 'Lucro real líquido calculado automaticamente',
    margem_lucro_percentual DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN preco_venda > 0 THEN ROUND(((preco_venda - custo_total_materiais - custo_total_mao_de_obra - custos_diversos) / preco_venda) * 100, 2)
            ELSE 0
        END
    ) STORED COMMENT 'Margem de lucro em percentual calculada automaticamente',
    observacoes TEXT COMMENT 'Observações sobre os custos',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Chaves estrangeiras e índices
    FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_orcamento_custos (orcamento_id),
    INDEX idx_orcamento_id (orcamento_id),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tabela para armazenar custos reais dos projetos aprovados';

-- =====================================================
-- VERIFICAÇÃO DA TABELA CRIADA
-- =====================================================

-- Verificar se a tabela foi criada corretamente
DESCRIBE projeto_custos;

-- Verificar índices criados
SHOW INDEX FROM projeto_custos;

-- =====================================================
-- EXEMPLO DE INSERÇÃO DE DADOS (OPCIONAL)
-- =====================================================

-- Exemplo de como inserir custos para um projeto (substituir IDs pelos reais)
/*
INSERT INTO projeto_custos (
    orcamento_id,
    preco_venda,
    custo_total_materiais,
    custo_total_mao_de_obra,
    custos_diversos,
    observacoes
) VALUES (
    1, -- ID do orçamento aprovado
    500.00, -- Preço de venda
    150.00, -- Custo com materiais
    200.00, -- Custo com mão de obra
    50.00, -- Outros custos
    'Custos lançados após conclusão do projeto'
);
*/
