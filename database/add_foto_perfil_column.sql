USE up_baloes;

DELIMITER //

DROP PROCEDURE IF EXISTS add_foto_perfil_column //

CREATE PROCEDURE add_foto_perfil_column()
BEGIN
    DECLARE col_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO col_count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'up_baloes' 
        AND TABLE_NAME = 'usuarios' 
        AND COLUMN_NAME = 'foto_perfil';

    IF col_count = 0 THEN
        SET @sql = 'ALTER TABLE usuarios ADD COLUMN foto_perfil VARCHAR(255) NULL AFTER bio';
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        -- Comentário (MariaDB permite em comando isolado)
        ALTER TABLE usuarios 
            MODIFY foto_perfil VARCHAR(255) NULL COMMENT "Caminho da foto de perfil do usuário";

        SELECT 'Campo foto_perfil criado com sucesso' AS resultado;
    ELSE
        SELECT 'Campo foto_perfil já existe' AS resultado;
    END IF;
END //

DELIMITER ;

CALL add_foto_perfil_column();

DROP PROCEDURE IF EXISTS add_foto_perfil_column;

SELECT 
    COLUMN_NAME as 'Coluna',
    DATA_TYPE as 'Tipo',
    IS_NULLABLE as 'Permite NULL',
    COLUMN_COMMENT as 'Comentário'
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'up_baloes' 
AND TABLE_NAME = 'usuarios' 
AND COLUMN_NAME = 'foto_perfil';
