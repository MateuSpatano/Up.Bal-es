-- Script para atualizar a tabela de usuários com novos campos
-- Execute este script no banco de dados up_baloes

USE up_baloes;

-- Adicionar novos campos à tabela usuarios
ALTER TABLE usuarios 
ADD COLUMN telefone VARCHAR(20) NULL AFTER email,
ADD COLUMN endereco TEXT NULL AFTER telefone,
ADD COLUMN cidade VARCHAR(100) NULL AFTER endereco,
ADD COLUMN estado VARCHAR(2) NULL AFTER cidade,
ADD COLUMN cep VARCHAR(10) NULL AFTER estado;

-- Adicionar índices para melhor performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_telefone ON usuarios(telefone);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);
CREATE INDEX idx_usuarios_cidade ON usuarios(cidade);

-- Atualizar dados de exemplo (opcional)
UPDATE usuarios 
SET 
    telefone = '(11) 99999-9999',
    endereco = 'Rua das Flores, 123',
    cidade = 'São Paulo',
    estado = 'SP',
    cep = '01234-567'
WHERE email = 'admin@upbaloes.com';

-- Verificar a estrutura atualizada
DESCRIBE usuarios;