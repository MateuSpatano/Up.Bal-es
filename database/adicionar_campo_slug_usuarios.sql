-- Script para adicionar campo slug na tabela de usuários
-- Execute este script no banco de dados up_baloes

USE up_baloes;

-- Adicionar campo slug se não existir
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE NULL AFTER cep;

-- Criar índice para o campo slug
CREATE INDEX IF NOT EXISTS idx_usuarios_slug ON usuarios(slug);

-- Atualizar slugs existentes (se houver)
UPDATE usuarios 
SET slug = LOWER(REPLACE(REPLACE(REPLACE(nome, ' ', '-'), '.', ''), ',', ''))
WHERE slug IS NULL OR slug = '';

-- Verificar a estrutura atualizada
DESCRIBE usuarios;