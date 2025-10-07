-- ====================================================================
-- Adicionar campo google_email na tabela usuarios
-- Sistema Up.Baloes - Autenticação com Google OAuth
-- ====================================================================

-- Este campo armazena o e-mail da conta Google do usuário
-- para permitir login via Google OAuth 2.0
-- Apenas usuários com este campo preenchido podem fazer login com Google

USE up_baloes;

-- Adicionar coluna google_email se não existir
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS google_email VARCHAR(255) NULL 
AFTER email,
ADD INDEX idx_google_email (google_email);

-- Adicionar constraint de unicidade para evitar duplicatas
ALTER TABLE usuarios 
ADD CONSTRAINT unique_google_email UNIQUE (google_email);

-- Comentário da coluna
ALTER TABLE usuarios 
MODIFY COLUMN google_email VARCHAR(255) NULL 
COMMENT 'E-mail da conta Google do usuário para login com OAuth 2.0';

-- Verificar se a coluna foi criada corretamente
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_KEY,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'up_baloes' 
  AND TABLE_NAME = 'usuarios' 
  AND COLUMN_NAME = 'google_email';

-- ====================================================================
-- Instruções de uso:
-- ====================================================================
-- 1. Execute este script no seu banco de dados MySQL
-- 2. O campo google_email permite NULL, portanto é opcional
-- 3. Para um decorador fazer login com Google, o administrador deve
--    cadastrar o e-mail do Google dele neste campo
-- 4. O e-mail do Google é independente do e-mail principal do sistema
-- ====================================================================

-- Exemplo de como atualizar um decorador existente:
-- UPDATE usuarios 
-- SET google_email = 'decorador@gmail.com' 
-- WHERE id = 123 AND perfil = 'decorator';




