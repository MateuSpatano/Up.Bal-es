-- Script para atualizar os tipos de serviços no banco de dados Up.Balões
-- Execute este script para migrar de tipos de eventos para tipos de serviços

-- 1. Adicionar nova coluna tipo_servico
ALTER TABLE orcamentos ADD COLUMN tipo_servico ENUM('arco-tradicional', 'arco-desconstruido', 'escultura-balao', 'centro-mesa', 'baloes-piscina') NULL;

-- 2. Migrar dados existentes (mapear tipos de eventos para tipos de serviços)
UPDATE orcamentos SET tipo_servico = 'arco-tradicional' WHERE tipo_evento = 'aniversario';
UPDATE orcamentos SET tipo_servico = 'arco-desconstruido' WHERE tipo_evento = 'casamento';
UPDATE orcamentos SET tipo_servico = 'escultura-balao' WHERE tipo_evento = 'formatura';
UPDATE orcamentos SET tipo_servico = 'centro-mesa' WHERE tipo_evento = 'corporativo';
UPDATE orcamentos SET tipo_servico = 'baloes-piscina' WHERE tipo_evento = 'infantil';
UPDATE orcamentos SET tipo_servico = 'arco-tradicional' WHERE tipo_evento = 'outros';

-- 3. Tornar a coluna tipo_servico obrigatória
ALTER TABLE orcamentos MODIFY COLUMN tipo_servico ENUM('arco-tradicional', 'arco-desconstruido', 'escultura-balao', 'centro-mesa', 'baloes-piscina') NOT NULL;

-- 4. Remover a coluna antiga tipo_evento (opcional - descomente se desejar remover)
-- ALTER TABLE orcamentos DROP COLUMN tipo_evento;

-- 5. Verificar a migração
SELECT tipo_servico, COUNT(*) as quantidade FROM orcamentos GROUP BY tipo_servico;