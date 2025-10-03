-- =====================================================
-- ADICIONAR CAMPOS WHATSAPP E COMMUNICATION_EMAIL
-- Up.Baloes - Sistema de Gestão de Decoração com Balões
-- =====================================================

-- Usar o banco de dados
USE up_baloes;

-- Adicionar campo WhatsApp
ALTER TABLE usuarios 
ADD COLUMN whatsapp VARCHAR(20) NULL 
COMMENT 'Número do WhatsApp para comunicação' 
AFTER telefone;

-- Adicionar campo E-mail para Comunicação
ALTER TABLE usuarios 
ADD COLUMN communication_email VARCHAR(100) NULL 
COMMENT 'E-mail específico para comunicação e envio de orçamentos' 
AFTER whatsapp;

-- Adicionar índice único para o e-mail de comunicação
ALTER TABLE usuarios 
ADD UNIQUE INDEX idx_communication_email (communication_email);

-- Adicionar índice para WhatsApp
ALTER TABLE usuarios 
ADD INDEX idx_whatsapp (whatsapp);

-- Comentário da tabela
ALTER TABLE usuarios 
COMMENT='Tabela de usuários do sistema (decoradores) com campos de comunicação';
