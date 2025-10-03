-- Adicionar campo de foto de perfil na tabela de usuários
-- Up.Baloes - Sistema de Gestão de Decoração com Balões

USE up_baloes;

-- Adicionar campo de foto de perfil
ALTER TABLE usuarios 
ADD COLUMN foto_perfil VARCHAR(255) NULL 
COMMENT 'Caminho para foto de perfil do usuário' 
AFTER redes_sociais;

-- Adicionar índice para performance
ALTER TABLE usuarios 
ADD INDEX idx_foto_perfil (foto_perfil);

-- Verificar se a coluna foi adicionada
DESCRIBE usuarios;


