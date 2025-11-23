-- =====================================================
-- MIGRAÇÃO: Adicionar coluna politica_privacidade na tabela usuarios
-- Up.Baloes - Sistema de Gestão de Decoração com Balões
-- =====================================================

USE up_baloes;

-- Alterar delimitador para permitir criação de stored procedure
DELIMITER //

-- Remover procedure se já existir (antes de criar)
DROP PROCEDURE IF EXISTS add_politica_privacidade_column //

-- Criar stored procedure temporária para adicionar coluna
CREATE PROCEDURE add_politica_privacidade_column()
BEGIN
    DECLARE col_count INT DEFAULT 0;
    
    -- Adicionar campo politica_privacidade se não existir
    SELECT COUNT(*) INTO col_count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'up_baloes' 
        AND TABLE_NAME = 'usuarios' 
        AND COLUMN_NAME = 'politica_privacidade';

    IF col_count = 0 THEN
        SET @sql = 'ALTER TABLE usuarios ADD COLUMN politica_privacidade TEXT NULL AFTER termos_condicoes COMMENT "Política de privacidade personalizada do decorador"';
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT 'Campo politica_privacidade criado com sucesso' AS resultado;
    ELSE
        SELECT 'Campo politica_privacidade já existe' AS resultado;
    END IF;
END //

-- Restaurar delimitador padrão
DELIMITER ;

-- Executar a stored procedure para adicionar a coluna
CALL add_politica_privacidade_column();

-- Remover a stored procedure temporária
DROP PROCEDURE IF EXISTS add_politica_privacidade_column;

-- Verificar se a coluna foi criada
SELECT 
    COLUMN_NAME as 'Coluna',
    DATA_TYPE as 'Tipo',
    IS_NULLABLE as 'Permite NULL',
    COLUMN_COMMENT as 'Comentário'
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'up_baloes' 
AND TABLE_NAME = 'usuarios' 
AND COLUMN_NAME = 'politica_privacidade';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

