-- Criação da tabela de datas bloqueadas do decorador
-- Up.Baloes - Sistema de Gestão de Decoração com Balões

CREATE TABLE IF NOT EXISTS decorator_blocked_dates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    blocked_date DATE NOT NULL,
    reason VARCHAR(255) DEFAULT 'Data bloqueada pelo decorador',
    is_recurring BOOLEAN DEFAULT FALSE COMMENT 'Se a data se repete anualmente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_blocked_date (blocked_date),
    UNIQUE KEY unique_user_blocked_date (user_id, blocked_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Datas bloqueadas pelos decoradores';

-- Exemplo de dados de datas bloqueadas
INSERT INTO decorator_blocked_dates (user_id, blocked_date, reason, is_recurring) VALUES 
(1, '2024-12-25', 'Natal - Feriado', TRUE),
(1, '2024-12-31', 'Reveillon - Feriado', TRUE),
(1, '2024-01-01', 'Ano Novo - Feriado', TRUE)
ON DUPLICATE KEY UPDATE 
    reason = VALUES(reason),
    is_recurring = VALUES(is_recurring),
    updated_at = CURRENT_TIMESTAMP;