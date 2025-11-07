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
    email_comunicacao VARCHAR(100) DEFAULT NULL,
    google_email VARCHAR(100) DEFAULT NULL,
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    cpf VARCHAR(14),
    endereco VARCHAR(255),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    senha VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    perfil ENUM('user','decorator','admin') DEFAULT 'user',
    ativo TINYINT(1) DEFAULT 1,
    aprovado_por_admin TINYINT(1) DEFAULT 0,
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
    INDEX idx_is_active (is_active),
    INDEX idx_ativo (ativo),
    INDEX idx_perfil (perfil),
    INDEX idx_aprovado (aprovado_por_admin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tabela de usuários do sistema (decoradores)';

-- =====================================================
-- TABELA DE TOKENS "LEMBRAR-ME"
-- =====================================================
CREATE TABLE IF NOT EXISTS remember_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_user_admin (user_id, is_admin),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tokens para funcionalidade lembrar acesso.';

-- =====================================================
-- TABELA DE TOKENS DE RECUPERAÇÃO DE SENHA
-- =====================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token_reset (token),
    INDEX idx_user_reset (user_id),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Tokens utilizados no fluxo de recuperação de senha.';

-- =====================================================
-- TABELA DE LOG DE ACESSOS
-- =====================================================
CREATE TABLE IF NOT EXISTS access_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_action_log (action),
    INDEX idx_created_at_log (created_at),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Registros de acesso e ações do sistema.';

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
    nome, email, email_comunicacao, google_email, telefone, whatsapp, senha, slug, perfil,
    ativo, aprovado_por_admin, bio, especialidades, is_active, is_admin, email_verified
) VALUES (
    'Administrador',
    'admin@upbaloes.com',
    'admin@upbaloes.com',
    'admin@upbaloes.com',
    '(11) 99999-9999',
    '(11) 99999-9999',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    'admin',
    'admin',
    1,
    1,
    'Administrador do sistema Up.Baloes',
    '["Arco Tradicional", "Arco Desconstruído", "Escultura de Balão", "Centro de Mesa", "Balões na Piscina"]',
    TRUE,
    TRUE,
    TRUE
) ON DUPLICATE KEY UPDATE
    nome = VALUES(nome),
    telefone = VALUES(telefone),
    email_comunicacao = VALUES(email_comunicacao),
    google_email = VALUES(google_email),
    whatsapp = VALUES(whatsapp),
    perfil = VALUES(perfil),
    ativo = VALUES(ativo),
    aprovado_por_admin = VALUES(aprovado_por_admin),
    is_active = VALUES(is_active),
    is_admin = VALUES(is_admin),
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

-- Nota: Datas bloqueadas devem ser configuradas pelo decorador através da interface administrativa

-- =====================================================
-- ADICIONAR CAMPOS DE CONTATO NA TABELA USUARIOS
-- =====================================================

-- Adicionar campo WhatsApp se não existir
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'up_baloes' AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'whatsapp');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE usuarios ADD COLUMN whatsapp VARCHAR(20) NULL AFTER telefone', 
    'SELECT "Campo whatsapp já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar campo Instagram se não existir
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'up_baloes' AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'instagram');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE usuarios ADD COLUMN instagram VARCHAR(255) NULL AFTER whatsapp', 
    'SELECT "Campo instagram já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar campo Email de Comunicação se não existir
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'up_baloes' AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'email_comunicacao');
SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE usuarios ADD COLUMN email_comunicacao VARCHAR(100) NULL AFTER email', 
    'SELECT "Campo email_comunicacao já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Criar índices para melhorar performance (se não existirem)
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'up_baloes' AND TABLE_NAME = 'usuarios' AND INDEX_NAME = 'idx_whatsapp');
SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_whatsapp ON usuarios(whatsapp)', 
    'SELECT "Índice idx_whatsapp já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'up_baloes' AND TABLE_NAME = 'usuarios' AND INDEX_NAME = 'idx_instagram');
SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_instagram ON usuarios(instagram)', 
    'SELECT "Índice idx_instagram já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Atualizar campos existentes: se o email_comunicacao não existir, usar o email como padrão
UPDATE usuarios 
SET email_comunicacao = email 
WHERE email_comunicacao IS NULL AND email IS NOT NULL;

-- =====================================================
-- TABELA DE PERSONALIZAÇÃO DA PÁGINA PÚBLICA DO DECORADOR
-- =====================================================

-- Criar tabela para personalização da página pública
CREATE TABLE IF NOT EXISTS decorator_page_customization (
    id INT AUTO_INCREMENT PRIMARY KEY,
    decorator_id INT NOT NULL,
    
    -- Conteúdo textual
    page_title VARCHAR(255) DEFAULT NULL COMMENT 'Título da página',
    page_description TEXT DEFAULT NULL COMMENT 'Descrição da página',
    welcome_text TEXT DEFAULT NULL COMMENT 'Texto de boas-vindas',
    
    -- Visual
    cover_image_url VARCHAR(500) DEFAULT NULL COMMENT 'URL da imagem de capa',
    primary_color VARCHAR(7) DEFAULT '#667eea' COMMENT 'Cor primária (hex)',
    secondary_color VARCHAR(7) DEFAULT '#764ba2' COMMENT 'Cor secundária (hex)',
    accent_color VARCHAR(7) DEFAULT '#f59e0b' COMMENT 'Cor de destaque (hex)',
    
    -- Serviços (JSON)
    services_config JSON DEFAULT NULL COMMENT 'Configuração de serviços com ícones',
    
    -- Redes sociais (JSON)
    social_media JSON DEFAULT NULL COMMENT 'Links de redes sociais',
    
    -- SEO
    meta_title VARCHAR(255) DEFAULT NULL COMMENT 'Título para SEO',
    meta_description TEXT DEFAULT NULL COMMENT 'Descrição para SEO',
    meta_keywords VARCHAR(500) DEFAULT NULL COMMENT 'Palavras-chave para SEO',
    
    -- Configurações de exibição
    show_contact_section BOOLEAN DEFAULT TRUE COMMENT 'Mostrar seção de contato',
    show_services_section BOOLEAN DEFAULT TRUE COMMENT 'Mostrar seção de serviços',
    show_portfolio_section BOOLEAN DEFAULT TRUE COMMENT 'Mostrar seção de portfólio',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Personalização ativa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Relacionamentos
    FOREIGN KEY (decorator_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_decorator_page (decorator_id),
    INDEX idx_decorator_id (decorator_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Personalização da página pública de cada decorador';

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
