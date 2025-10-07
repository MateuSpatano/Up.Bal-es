-- ============================================
-- Tabela de Suporte/Chamados
-- Sistema Up.Baloes
-- Data: 07/10/2025
-- ============================================

-- Criar tabela de chamados de suporte
CREATE TABLE IF NOT EXISTS chamados_suporte (
    -- Identificação
    id VARCHAR(50) PRIMARY KEY,
    
    -- Conteúdo do Chamado
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    anexo LONGTEXT DEFAULT NULL COMMENT 'Imagem em base64',
    
    -- Informações do Decorador
    decorador_id INT NOT NULL,
    decorador_nome VARCHAR(100) NOT NULL,
    decorador_email VARCHAR(100),
    
    -- Status e Controle
    status ENUM('novo', 'em_analise', 'resolvido', 'fechado') DEFAULT 'novo',
    prioridade ENUM('baixa', 'media', 'alta', 'urgente') DEFAULT 'media' COMMENT 'Para implementação futura',
    categoria VARCHAR(50) DEFAULT 'geral' COMMENT 'Para implementação futura',
    
    -- Timestamps
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolvido_em DATETIME DEFAULT NULL,
    
    -- Relacionamento
    FOREIGN KEY (decorador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Índices para performance
    INDEX idx_status (status),
    INDEX idx_decorador (decorador_id),
    INDEX idx_criado_em (criado_em),
    INDEX idx_status_criado (status, criado_em)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chamados de suporte dos decoradores';

-- ============================================
-- Tabela de Comentários/Respostas (Opcional - Implementação Futura)
-- ============================================

CREATE TABLE IF NOT EXISTS chamados_comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chamado_id VARCHAR(50) NOT NULL,
    usuario_id INT NOT NULL,
    usuario_nome VARCHAR(100) NOT NULL,
    usuario_tipo ENUM('admin', 'decorator') NOT NULL,
    comentario TEXT NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Relacionamentos
    FOREIGN KEY (chamado_id) REFERENCES chamados_suporte(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Índices
    INDEX idx_chamado (chamado_id),
    INDEX idx_criado_em (criado_em)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Comentários e respostas dos chamados';

-- ============================================
-- Triggers para automação
-- ============================================

-- Trigger para atualizar data de resolução automaticamente
DELIMITER $$

CREATE TRIGGER atualizar_data_resolucao
BEFORE UPDATE ON chamados_suporte
FOR EACH ROW
BEGIN
    -- Se status mudou para "resolvido" e ainda não tem data de resolução
    IF NEW.status = 'resolvido' AND OLD.status != 'resolvido' AND NEW.resolvido_em IS NULL THEN
        SET NEW.resolvido_em = CURRENT_TIMESTAMP;
    END IF;
    
    -- Se status voltou para não-resolvido, limpar data
    IF NEW.status != 'resolvido' AND OLD.status = 'resolvido' THEN
        SET NEW.resolvido_em = NULL;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- Views para relatórios (Opcional)
-- ============================================

-- View de chamados abertos
CREATE OR REPLACE VIEW chamados_abertos AS
SELECT 
    c.*,
    u.telefone AS decorador_telefone,
    u.whatsapp AS decorador_whatsapp,
    TIMESTAMPDIFF(HOUR, c.criado_em, NOW()) AS horas_abertas
FROM chamados_suporte c
JOIN usuarios u ON c.decorador_id = u.id
WHERE c.status IN ('novo', 'em_analise')
ORDER BY c.criado_em DESC;

-- View de estatísticas
CREATE OR REPLACE VIEW estatisticas_suporte AS
SELECT 
    COUNT(*) AS total_chamados,
    SUM(CASE WHEN status = 'novo' THEN 1 ELSE 0 END) AS novos,
    SUM(CASE WHEN status = 'em_analise' THEN 1 ELSE 0 END) AS em_analise,
    SUM(CASE WHEN status = 'resolvido' THEN 1 ELSE 0 END) AS resolvidos,
    SUM(CASE WHEN status = 'fechado' THEN 1 ELSE 0 END) AS fechados,
    AVG(TIMESTAMPDIFF(HOUR, criado_em, resolvido_em)) AS tempo_medio_resolucao_horas
FROM chamados_suporte;

-- ============================================
-- Dados de exemplo (Opcional - para testes)
-- ============================================

-- INSERT INTO chamados_suporte (id, titulo, descricao, decorador_id, decorador_nome, decorador_email, status)
-- VALUES 
-- ('test001', 'Erro ao salvar orçamento', 'Quando tento salvar um orçamento, o sistema trava...', 1, 'João Silva', 'joao@test.com', 'novo'),
-- ('test002', 'Dúvida sobre agenda', 'Como faço para bloquear datas específicas?', 2, 'Maria Santos', 'maria@test.com', 'em_analise'),
-- ('test003', 'Sugestão de melhoria', 'Seria ótimo ter a opção de...', 1, 'João Silva', 'joao@test.com', 'resolvido');

-- ============================================
-- Queries úteis
-- ============================================

-- Listar todos chamados (ordem decrescente)
-- SELECT * FROM chamados_suporte ORDER BY criado_em DESC;

-- Buscar chamados por decorador
-- SELECT * FROM chamados_suporte WHERE decorador_id = ? ORDER BY criado_em DESC;

-- Chamados novos (não vistos)
-- SELECT * FROM chamados_suporte WHERE status = 'novo' ORDER BY criado_em ASC;

-- Estatísticas rápidas
-- SELECT * FROM estatisticas_suporte;

-- Chamados abertos há mais de 24 horas
-- SELECT * FROM chamados_abertos WHERE horas_abertas > 24;

-- ============================================
-- Índices adicionais para performance (se necessário)
-- ============================================

-- CREATE INDEX idx_titulo ON chamados_suporte(titulo);
-- CREATE INDEX idx_status_prioridade ON chamados_suporte(status, prioridade);
-- CREATE FULLTEXT INDEX idx_descricao ON chamados_suporte(descricao);

-- ============================================
-- Fim do arquivo
-- ============================================

