-- =====================================================
-- SCRIPT PARA CRIAR/VERIFICAR ADMINISTRADOR PADRÃO
-- Up.Baloes - Sistema de Gestão de Decoração com Balões
-- =====================================================

USE up_baloes;

-- Verificar se o admin já existe
SELECT 
    id,
    nome,
    email,
    perfil,
    ativo,
    created_at
FROM usuarios 
WHERE email = 'admin@upbaloes.com' OR perfil = 'admin';

-- Criar admin padrão se não existir
INSERT INTO usuarios (nome, email, senha, perfil, ativo, aprovado_por_admin, is_active, is_admin, slug, created_at) 
SELECT 
    'Administrador',
    'admin@upbaloes.com',
    '$2y$12$1jyUYLSwquFx8Ynz67aLR.Pgku1p.UxeAljf7w3ksOaBtcNX6c/RS', -- senha: admin123
    'admin',
    1,
    1,
    1,
    1,
    'administrador',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'admin@upbaloes.com' OR perfil = 'admin'
);

-- Verificar novamente após criação
SELECT 
    id,
    nome,
    email,
    perfil,
    ativo,
    created_at
FROM usuarios 
WHERE email = 'admin@upbaloes.com' OR perfil = 'admin';

-- =====================================================
-- CREDENCIAIS DO ADMIN PADRÃO
-- =====================================================
-- Email: admin@upbaloes.com
-- Senha: admin123
-- ⚠️ IMPORTANTE: Altere a senha após o primeiro login!
-- =====================================================

