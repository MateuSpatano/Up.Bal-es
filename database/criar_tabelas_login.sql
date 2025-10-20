-- Script para criar tabelas necessárias para o sistema de login centralizado
-- Execute este script no seu banco de dados MySQL

-- Tabela para tokens de "lembrar"
CREATE TABLE IF NOT EXISTS remember_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela para tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela para logs de acesso
CREATE TABLE IF NOT EXISTS access_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Adicionar campo de aprovação para decoradores (se não existir)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS aprovado_por_admin BOOLEAN DEFAULT FALSE AFTER ativo;

-- Adicionar campo de tentativas de login (se não existir)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS tentativas_login INT DEFAULT 0 AFTER aprovado_por_admin;

-- Adicionar campo de bloqueio temporário (se não existir)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS bloqueado_ate DATETIME NULL AFTER tentativas_login;

-- Atualizar decoradores existentes para serem aprovados (opcional)
-- UPDATE usuarios SET aprovado_por_admin = TRUE WHERE perfil = 'decorator';

-- Limpar tokens expirados (procedimento para execução periódica)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS LimparTokensExpirados()
BEGIN
    DELETE FROM remember_tokens WHERE expires_at < NOW();
    DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = TRUE;
END //
DELIMITER ;

-- Criar evento para limpeza automática (opcional - requer EVENT_SCHEDULER habilitado)
-- CREATE EVENT IF NOT EXISTS LimpezaTokensEvent
-- ON SCHEDULE EVERY 1 HOUR
-- DO
--   CALL LimparTokensExpirados();







