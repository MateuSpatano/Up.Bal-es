-- =====================================================
-- SCRIPT DE ATUALIZAÇÃO - Funcionalidades de Carrinho
-- Up.Baloes - Sistema de Gestão de Decoração com Balões
-- Data: 2024
-- =====================================================
-- 
-- Este script adiciona índices necessários para as novas funcionalidades
-- de carrinho e solicitações do cliente.
-- Execute este script apenas se você já tem o banco de dados criado.
-- =====================================================

USE up_baloes;

-- Alterar delimitador para permitir criação de stored procedure
DELIMITER //

-- Remover procedure se já existir (antes de criar)
DROP PROCEDURE IF EXISTS add_index_if_not_exists //

-- Criar stored procedure temporária para adicionar índices
CREATE PROCEDURE add_index_if_not_exists()
BEGIN
    DECLARE idx_count INT DEFAULT 0;
    
    -- Índice para busca de solicitações por email do cliente
    -- (usado na funcionalidade "Minhas Compras")
    SELECT COUNT(*) INTO idx_count FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = 'up_baloes' 
        AND TABLE_NAME = 'orcamentos' 
        AND INDEX_NAME = 'idx_email';
        
    IF idx_count = 0 THEN
        SET @sql = 'ALTER TABLE orcamentos ADD INDEX idx_email (email) COMMENT "Índice para busca de solicitações por email do cliente"';
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT 'Índice idx_email criado com sucesso' AS resultado;
    ELSE
        SELECT 'Índice idx_email já existe' AS resultado;
    END IF;

    -- Índice para ordenação por data de criação
    SET idx_count = 0;
    SELECT COUNT(*) INTO idx_count FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = 'up_baloes' 
        AND TABLE_NAME = 'orcamentos' 
        AND INDEX_NAME = 'idx_created_at';
        
    IF idx_count = 0 THEN
        SET @sql = 'ALTER TABLE orcamentos ADD INDEX idx_created_at (created_at) COMMENT "Índice para ordenação por data de criação"';
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT 'Índice idx_created_at criado com sucesso' AS resultado;
    ELSE
        SELECT 'Índice idx_created_at já existe' AS resultado;
    END IF;
END //

-- Restaurar delimitador padrão
DELIMITER ;

-- =====================================================
-- ADICIONAR ÍNDICES PARA MELHORAR PERFORMANCE
-- =====================================================

-- Executar a stored procedure para adicionar os índices
CALL add_index_if_not_exists();

-- Remover a stored procedure temporária
DROP PROCEDURE IF EXISTS add_index_if_not_exists;

-- =====================================================
-- VERIFICAÇÃO DOS ÍNDICES
-- =====================================================

-- Verificar índices da tabela orcamentos
SELECT 
    INDEX_NAME as 'Nome do Índice',
    COLUMN_NAME as 'Coluna',
    NON_UNIQUE as 'Não Único',
    SEQ_IN_INDEX as 'Ordem'
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'up_baloes' 
AND TABLE_NAME = 'orcamentos'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- =====================================================
-- FIM DO SCRIPT DE ATUALIZAÇÃO
-- =====================================================

