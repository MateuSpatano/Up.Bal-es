-- Adicionar campo de imagem na tabela de orçamentos
-- Este script adiciona um campo para armazenar o caminho da imagem relacionada ao orçamento

ALTER TABLE orcamentos 
ADD COLUMN imagem VARCHAR(500) NULL COMMENT 'Caminho para a imagem relacionada ao orçamento';

-- Adicionar índice para melhor performance em consultas
CREATE INDEX idx_orcamentos_imagem ON orcamentos(imagem);