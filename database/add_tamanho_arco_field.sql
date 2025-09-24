-- Script para adicionar campo "Tamanho do Arco" na tabela de orçamentos
-- Data: 2024
-- Descrição: Adiciona coluna tamanho_arco_m para armazenar o tamanho do arco em metros

-- Adicionar coluna tamanho_arco_m na tabela orcamentos
ALTER TABLE orcamentos 
ADD COLUMN tamanho_arco_m NUMERIC(4,1) NULL 
COMMENT 'Tamanho do arco em metros (com 1 casa decimal)';

-- Adicionar índice para melhor performance em consultas
CREATE INDEX idx_orcamentos_tamanho_arco ON orcamentos(tamanho_arco_m);

-- Comentário da coluna
ALTER TABLE orcamentos 
MODIFY COLUMN tamanho_arco_m NUMERIC(4,1) NULL 
COMMENT 'Tamanho do arco em metros (com 1 casa decimal) - obrigatório para tipos Arco-Tradicional e Arco-Desconstruído';
