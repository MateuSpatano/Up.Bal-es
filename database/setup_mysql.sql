-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO INICIAL DO BANCO DE DADOS
-- Up.Baloes - Sistema de Gestão de Decoração com Balões
-- Compatível com MySQL 5.7+ / MariaDB 10.2+
-- =====================================================

-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS up_baloes 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE up_baloes;

-- =====================================================
-- TABELA DE USUÁRIOS (DECORADORES)
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    senha VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    bio TEXT,
    especialidades TEXT,
    portfolio_images JSON,
    redes_sociais JSON,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tabela de usuários do sistema (decoradores)';

-- =====================================================
-- TABELA DE ORÇAMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS orcamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    data_evento DATE NOT NULL,
    hora_evento TIME NOT NULL,
    local_evento VARCHAR(255) NOT NULL,
    tipo_servico ENUM('arco-tradicional', 'arco-desconstruido', 'escultura-balao', 'centro-mesa', 'baloes-piscina') NOT NULL,
    descricao TEXT,
    valor_estimado DECIMAL(10,2) DEFAULT 0.00,
    observacoes TEXT,
    status ENUM('pendente', 'aprovado', 'recusado', 'cancelado', 'enviado') DEFAULT 'pendente',
    decorador_id INT NOT NULL,
    created_via ENUM('client', 'decorator') DEFAULT 'client',
    imagem VARCHAR(255) COMMENT 'Caminho para imagem de inspiração',
    tamanho_arco_m DECIMAL(4,1) COMMENT 'Tamanho do arco em metros',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (decorador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_decorador_id (decorador_id),
    INDEX idx_status (status),
    INDEX idx_data_evento (data_evento),
    INDEX idx_created_via (created_via)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tabela de orçamentos do sistema';

-- =====================================================
-- TABELA DE LOGS DE ORÇAMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS budget_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    budget_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES orcamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_budget_id (budget_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Log de ações realizadas nos orçamentos';

-- =====================================================
-- TABELA DE DISPONIBILIDADE DOS DECORADORES
-- =====================================================
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
    UNIQUE KEY unique_user_availability (user_id),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Configurações de disponibilidade dos decoradores';

-- =====================================================
-- TABELA DE DATAS BLOQUEADAS
-- =====================================================
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
    UNIQUE KEY unique_user_blocked_date (user_id, blocked_date),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Datas bloqueadas pelos decoradores';

-- =====================================================
-- INSERIR DADOS INICIAIS
-- =====================================================

-- Inserir usuário administrador padrão
INSERT INTO usuarios (
    nome, email, telefone, senha, slug, bio, 
    especialidades, is_active, is_admin, email_verified
) VALUES (
    'Administrador',
    'admin@upbaloes.com',
    '(11) 99999-9999',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    'admin',
    'Administrador do sistema Up.Baloes',
    '["Arco Tradicional", "Arco Desconstruído", "Escultura de Balão", "Centro de Mesa", "Balões na Piscina"]',
    TRUE,
    TRUE,
    TRUE
) ON DUPLICATE KEY UPDATE
    nome = VALUES(nome),
    telefone = VALUES(telefone),
    bio = VALUES(bio),
    especialidades = VALUES(especialidades);

-- Inserir configuração de disponibilidade padrão para o admin
INSERT INTO decorator_availability (
    user_id, 
    available_days, 
    time_schedules, 
    service_intervals,
    max_daily_services
) VALUES (
    1,
    '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]',
    '[
        {"day": "monday", "start_time": "08:00", "end_time": "18:00"},
        {"day": "tuesday", "start_time": "08:00", "end_time": "18:00"},
        {"day": "wednesday", "start_time": "08:00", "end_time": "18:00"},
        {"day": "thursday", "start_time": "08:00", "end_time": "18:00"},
        {"day": "friday", "start_time": "08:00", "end_time": "18:00"},
        {"day": "saturday", "start_time": "08:00", "end_time": "16:00"}
    ]',
    '[
        {"day": "monday", "interval": 1, "unit": "hours"},
        {"day": "tuesday", "interval": 1, "unit": "hours"},
        {"day": "wednesday", "interval": 1, "unit": "hours"},
        {"day": "thursday", "interval": 1, "unit": "hours"},
        {"day": "friday", "interval": 1, "unit": "hours"},
        {"day": "saturday", "interval": 1, "unit": "hours"}
    ]',
    5
) ON DUPLICATE KEY UPDATE
    available_days = VALUES(available_days),
    time_schedules = VALUES(time_schedules),
    service_intervals = VALUES(service_intervals),
    max_daily_services = VALUES(max_daily_services),
    updated_at = CURRENT_TIMESTAMP;

-- Inserir algumas datas bloqueadas padrão
INSERT INTO decorator_blocked_dates (user_id, blocked_date, reason, is_recurring) VALUES 
(1, '2024-12-25', 'Natal - Feriado', TRUE),
(1, '2024-12-31', 'Reveillon - Feriado', TRUE),
(1, '2025-01-01', 'Ano Novo - Feriado', TRUE)
ON DUPLICATE KEY UPDATE 
    reason = VALUES(reason),
    is_recurring = VALUES(is_recurring),
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    TABLE_NAME as 'Tabela',
    TABLE_ROWS as 'Registros',
    CREATE_TIME as 'Criada em'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'up_baloes'
ORDER BY TABLE_NAME;

-- Verificar configuração do charset
SELECT 
    DEFAULT_CHARACTER_SET_NAME as 'Charset Padrão',
    DEFAULT_COLLATION_NAME as 'Collation Padrão'
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'up_baloes';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
