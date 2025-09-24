-- Criação da tabela de disponibilidade do decorador
-- Up.Baloes - Sistema de Gestão de Decoração com Balões

CREATE TABLE IF NOT EXISTS decorator_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    available_days JSON NOT NULL COMMENT 'Dias da semana disponíveis para atendimento',
    time_schedules JSON NOT NULL COMMENT 'Horários de atendimento por dia da semana',
    service_intervals JSON NOT NULL COMMENT 'Intervalos entre serviços por dia da semana',
    max_daily_services INT DEFAULT 3 COMMENT 'Máximo de serviços por dia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_user_availability (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configurações de disponibilidade dos decoradores';

-- Exemplo de dados de configuração padrão
INSERT INTO decorator_availability (
    user_id, 
    available_days, 
    time_schedules, 
    service_intervals,
    max_daily_services
) VALUES (
    1,
    '["monday", "tuesday", "wednesday", "thursday", "friday"]',
    '[
        {"day": "monday", "start_time": "08:00", "end_time": "18:00"},
        {"day": "tuesday", "start_time": "08:00", "end_time": "18:00"},
        {"day": "wednesday", "start_time": "08:00", "end_time": "18:00"},
        {"day": "thursday", "start_time": "08:00", "end_time": "18:00"},
        {"day": "friday", "start_time": "08:00", "end_time": "18:00"}
    ]',
    '[
        {"day": "monday", "interval": 1, "unit": "hours"},
        {"day": "tuesday", "interval": 1, "unit": "hours"},
        {"day": "wednesday", "interval": 1, "unit": "hours"},
        {"day": "thursday", "interval": 1, "unit": "hours"},
        {"day": "friday", "interval": 1, "unit": "hours"}
    ]',
    3
) ON DUPLICATE KEY UPDATE
    available_days = VALUES(available_days),
    time_schedules = VALUES(time_schedules),
    service_intervals = VALUES(service_intervals),
    max_daily_services = VALUES(max_daily_services),
    updated_at = CURRENT_TIMESTAMP;