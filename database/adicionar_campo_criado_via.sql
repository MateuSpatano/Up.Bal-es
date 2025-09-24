-- Adicionar coluna created_via na tabela orcamentos
-- Esta coluna distingue entre festas solicitadas por clientes e criadas pelo decorador

ALTER TABLE orcamentos 
ADD COLUMN created_via ENUM('client', 'decorator') DEFAULT 'decorator' 
AFTER decorador_id;

-- Comentário da coluna
ALTER TABLE orcamentos 
MODIFY COLUMN created_via ENUM('client', 'decorator') DEFAULT 'decorator' 
COMMENT 'Indica se o orçamento foi criado via fluxo do cliente (client) ou pelo decorador (decorator)';
