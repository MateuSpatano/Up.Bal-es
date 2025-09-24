-- Script para adicionar campo slug à tabela usuarios
-- Execute este script no banco de dados up_baloes

USE up_baloes;

-- Adicionar campo slug à tabela usuarios
ALTER TABLE usuarios 
ADD COLUMN slug VARCHAR(100) NULL AFTER nome;

-- Criar índice único para o campo slug
CREATE UNIQUE INDEX idx_usuarios_slug ON usuarios(slug);

-- Função para gerar slug a partir do nome
DELIMITER $$

CREATE FUNCTION generate_slug(input_name VARCHAR(255)) 
RETURNS VARCHAR(100)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE slug VARCHAR(100);
    DECLARE base_slug VARCHAR(100);
    DECLARE counter INT DEFAULT 0;
    DECLARE final_slug VARCHAR(100);
    
    -- Converter para minúsculas, remover acentos e caracteres especiais
    SET base_slug = LOWER(input_name);
    SET base_slug = REPLACE(base_slug, 'á', 'a');
    SET base_slug = REPLACE(base_slug, 'à', 'a');
    SET base_slug = REPLACE(base_slug, 'ã', 'a');
    SET base_slug = REPLACE(base_slug, 'â', 'a');
    SET base_slug = REPLACE(base_slug, 'é', 'e');
    SET base_slug = REPLACE(base_slug, 'è', 'e');
    SET base_slug = REPLACE(base_slug, 'ê', 'e');
    SET base_slug = REPLACE(base_slug, 'í', 'i');
    SET base_slug = REPLACE(base_slug, 'ì', 'i');
    SET base_slug = REPLACE(base_slug, 'î', 'i');
    SET base_slug = REPLACE(base_slug, 'ó', 'o');
    SET base_slug = REPLACE(base_slug, 'ò', 'o');
    SET base_slug = REPLACE(base_slug, 'õ', 'o');
    SET base_slug = REPLACE(base_slug, 'ô', 'o');
    SET base_slug = REPLACE(base_slug, 'ú', 'u');
    SET base_slug = REPLACE(base_slug, 'ù', 'u');
    SET base_slug = REPLACE(base_slug, 'û', 'u');
    SET base_slug = REPLACE(base_slug, 'ç', 'c');
    SET base_slug = REPLACE(base_slug, 'ñ', 'n');
    
    -- Remover caracteres especiais e espaços, substituir por hífens
    SET base_slug = REGEXP_REPLACE(base_slug, '[^a-z0-9\\s]', '');
    SET base_slug = REGEXP_REPLACE(base_slug, '\\s+', '-');
    SET base_slug = TRIM(BOTH '-' FROM base_slug);
    
    -- Limitar tamanho
    SET base_slug = LEFT(base_slug, 80);
    
    -- Verificar se já existe e adicionar contador se necessário
    SET final_slug = base_slug;
    
    WHILE EXISTS(SELECT 1 FROM usuarios WHERE slug = final_slug) DO
        SET counter = counter + 1;
        SET final_slug = CONCAT(base_slug, '-', counter);
    END WHILE;
    
    RETURN final_slug;
END$$

DELIMITER ;

-- Trigger para gerar slug automaticamente ao inserir usuário
DELIMITER $$

CREATE TRIGGER tr_usuarios_generate_slug_insert
BEFORE INSERT ON usuarios
FOR EACH ROW
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        SET NEW.slug = generate_slug(NEW.nome);
    END IF;
END$$

DELIMITER ;

-- Trigger para gerar slug automaticamente ao atualizar nome
DELIMITER $$

CREATE TRIGGER tr_usuarios_generate_slug_update
BEFORE UPDATE ON usuarios
FOR EACH ROW
BEGIN
    IF OLD.nome != NEW.nome AND (NEW.slug IS NULL OR NEW.slug = '' OR NEW.slug = OLD.slug) THEN
        SET NEW.slug = generate_slug(NEW.nome);
    END IF;
END$$

DELIMITER ;

-- Atualizar slugs para usuários existentes
UPDATE usuarios 
SET slug = generate_slug(nome) 
WHERE slug IS NULL OR slug = '';

-- Verificar a estrutura atualizada
DESCRIBE usuarios;

-- Verificar alguns exemplos de slugs gerados
SELECT id, nome, slug FROM usuarios LIMIT 10;
