-- =====================================================
-- MIGRAÇÃO: Adicionar coluna termos_condicoes na tabela usuarios
-- Up.Baloes - Sistema de Gestão de Decoração com Balões
-- =====================================================

USE up_baloes;

-- Alterar delimitador para permitir criação de stored procedure
DELIMITER //

-- Remover procedure se já existir (antes de criar)
DROP PROCEDURE IF EXISTS add_termos_condicoes_column //

-- Criar stored procedure temporária para adicionar coluna
CREATE PROCEDURE add_termos_condicoes_column()
BEGIN
    DECLARE col_count INT DEFAULT 0;
    
    -- Adicionar campo termos_condicoes se não existir
    SELECT COUNT(*) INTO col_count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'up_baloes' 
        AND TABLE_NAME = 'usuarios' 
        AND COLUMN_NAME = 'termos_condicoes';

    IF col_count = 0 THEN
        SET @sql = 'ALTER TABLE usuarios ADD COLUMN termos_condicoes TEXT NULL AFTER redes_sociais COMMENT ''Termos e condições personalizados do decorador''';
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT 'Campo termos_condicoes criado com sucesso' AS resultado;
    ELSE
        SELECT 'Campo termos_condicoes já existe' AS resultado;
    END IF;
END //

-- Restaurar delimitador padrão
DELIMITER ;

-- Executar a stored procedure para adicionar a coluna
CALL add_termos_condicoes_column();

-- Remover a stored procedure temporária
DROP PROCEDURE IF EXISTS add_termos_condicoes_column;

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

