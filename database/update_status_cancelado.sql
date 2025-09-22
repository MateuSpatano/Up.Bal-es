-- Atualização da tabela orcamentos para incluir o status 'cancelado'
-- Execute este script no seu banco de dados MySQL

-- Adicionar o status 'cancelado' ao ENUM existente
ALTER TABLE orcamentos 
MODIFY COLUMN status ENUM('pendente', 'aprovado', 'recusado', 'cancelado', 'enviado') 
DEFAULT 'pendente' 
NOT NULL;

-- Verificar se a alteração foi aplicada corretamente
DESCRIBE orcamentos;