-- =====================================================
-- MIGRAÇÃO: Adicionar coluna termos_condicoes na tabela usuarios
-- Up.Baloes - Sistema de Gestão de Decoração com Balões
-- =====================================================

USE up_baloes;

-- Adicionar campo termos_condicoes se não existir
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'up_baloes' 
    AND TABLE_NAME = 'usuarios' 
    AND COLUMN_NAME = 'termos_condicoes');

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE usuarios ADD COLUMN termos_condicoes TEXT NULL AFTER redes_sociais COMMENT "Termos e condições personalizados do decorador"', 
    'SELECT "Campo termos_condicoes já existe"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar se a coluna foi criada
SELECT 
    COLUMN_NAME as 'Coluna',
    DATA_TYPE as 'Tipo',
    IS_NULLABLE as 'Permite NULL',
    COLUMN_COMMENT as 'Comentário'
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'up_baloes' 
AND TABLE_NAME = 'usuarios' 
AND COLUMN_NAME = 'termos_condicoes';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

