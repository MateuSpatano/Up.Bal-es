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

-- =====================================================
-- ADICIONAR ÍNDICES PARA MELHORAR PERFORMANCE
-- =====================================================

-- Índice para busca de solicitações por email do cliente
-- (usado na funcionalidade "Minhas Compras")
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'up_baloes' 
    AND TABLE_NAME = 'orcamentos' 
    AND INDEX_NAME = 'idx_email');
    
SET @sql = IF(@idx_exists = 0, 
    'ALTER TABLE orcamentos ADD INDEX idx_email (email) COMMENT "Índice para busca de solicitações por email do cliente"', 
    'SELECT "Índice idx_email já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para ordenação por data de criação
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'up_baloes' 
    AND TABLE_NAME = 'orcamentos' 
    AND INDEX_NAME = 'idx_created_at');
    
SET @sql = IF(@idx_exists = 0, 
    'ALTER TABLE orcamentos ADD INDEX idx_created_at (created_at) COMMENT "Índice para ordenação por data de criação"', 
    'SELECT "Índice idx_created_at já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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

