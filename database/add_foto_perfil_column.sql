-- =====================================================
-- ADICIONAR CAMPO foto_perfil NA TABELA usuarios
-- Up.Baloes - Sistema de Gestão de Decoração com Balões
-- =====================================================

USE up_baloes;

-- Alterar delimitador para permitir criação de stored procedure
DELIMITER //

-- Remover procedure se já existir (antes de criar)
DROP PROCEDURE IF EXISTS add_foto_perfil_column //

-- Criar stored procedure temporária para adicionar coluna
CREATE PROCEDURE add_foto_perfil_column()
BEGIN
    DECLARE col_count INT DEFAULT 0;
    
    -- Verificar se a coluna já existe
    SELECT COUNT(*) INTO col_count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'up_baloes' 
        AND TABLE_NAME = 'usuarios' 
        AND COLUMN_NAME = 'foto_perfil';

    IF col_count = 0 THEN
        SET @sql = 'ALTER TABLE usuarios ADD COLUMN foto_perfil VARCHAR(255) NULL AFTER bio COMMENT "Caminho da foto de perfil do usuário"';
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT 'Campo foto_perfil criado com sucesso' AS resultado;
    ELSE
        SELECT 'Campo foto_perfil já existe' AS resultado;
    END IF;
END //

-- Restaurar delimitador padrão
DELIMITER ;

-- Executar a stored procedure para adicionar a coluna
CALL add_foto_perfil_column();

-- Remover a stored procedure temporária
DROP PROCEDURE IF EXISTS add_foto_perfil_column;

-- Verificar se a coluna foi criada
SELECT 
    COLUMN_NAME as 'Coluna',
    DATA_TYPE as 'Tipo',
    IS_NULLABLE as 'Permite NULL',
    COLUMN_COMMENT as 'Comentário'
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'up_baloes' 
AND TABLE_NAME = 'usuarios' 
AND COLUMN_NAME = 'foto_perfil';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

