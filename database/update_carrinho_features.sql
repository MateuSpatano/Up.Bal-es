-- SCRIPT DE ATUALIZAÇÃO - Funcionalidades de Carrinho
USE up_baloes;

DELIMITER //

DROP PROCEDURE IF EXISTS add_index_if_not_exists //

CREATE PROCEDURE add_index_if_not_exists()
BEGIN
    DECLARE idx_count INT DEFAULT 0;

    -- Índice para busca por email
    SELECT COUNT(*) INTO idx_count 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'up_baloes'
      AND TABLE_NAME = 'orcamentos'
      AND INDEX_NAME = 'idx_email';

    IF idx_count = 0 THEN
        SET @sql = 'ALTER TABLE orcamentos ADD INDEX idx_email (email)';
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT 'Índice idx_email criado com sucesso' AS resultado;
    ELSE
        SELECT 'Índice idx_email já existe' AS resultado;
    END IF;

    -- Índice para ordenação por data
    SET idx_count = 0;

    SELECT COUNT(*) INTO idx_count 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'up_baloes'
      AND TABLE_NAME = 'orcamentos'
      AND INDEX_NAME = 'idx_created_at';

    IF idx_count = 0 THEN
        SET @sql = 'ALTER TABLE orcamentos ADD INDEX idx_created_at (created_at)';
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT 'Índice idx_created_at criado com sucesso' AS resultado;
    ELSE
        SELECT 'Índice idx_created_at já existe' AS resultado;
    END IF;

END //

DELIMITER ;

CALL add_index_if_not_exists();

DROP PROCEDURE IF EXISTS add_index_if_not_exists;

-- Verificação dos índices
SELECT 
    INDEX_NAME AS 'Nome do Índice',
    COLUMN_NAME AS 'Coluna',
    NON_UNIQUE AS 'Não Único',
    SEQ_IN_INDEX AS 'Ordem'
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'up_baloes'
  AND TABLE_NAME = 'orcamentos'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;
