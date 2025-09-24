-- Script para atualizar a estrutura da tabela decorator_availability
-- Up.Baloes - Sistema de Gestão de Decoração com Balões
-- Este script migra de intervalos únicos para intervalos por dia

-- Adicionar nova coluna para intervalos por dia
ALTER TABLE decorator_availability 
ADD COLUMN service_intervals JSON COMMENT 'Intervalos entre serviços por dia da semana';

-- Migrar dados existentes para a nova estrutura
UPDATE decorator_availability 
SET service_intervals = JSON_ARRAY(
    JSON_OBJECT('day', 'monday', 'interval', COALESCE(service_interval, 1), 'unit', COALESCE(interval_unit, 'hours')),
    JSON_OBJECT('day', 'tuesday', 'interval', COALESCE(service_interval, 1), 'unit', COALESCE(interval_unit, 'hours')),
    JSON_OBJECT('day', 'wednesday', 'interval', COALESCE(service_interval, 1), 'unit', COALESCE(interval_unit, 'hours')),
    JSON_OBJECT('day', 'thursday', 'interval', COALESCE(service_interval, 1), 'unit', COALESCE(interval_unit, 'hours')),
    JSON_OBJECT('day', 'friday', 'interval', COALESCE(service_interval, 1), 'unit', COALESCE(interval_unit, 'hours')),
    JSON_OBJECT('day', 'saturday', 'interval', COALESCE(service_interval, 1), 'unit', COALESCE(interval_unit, 'hours')),
    JSON_OBJECT('day', 'sunday', 'interval', COALESCE(service_interval, 1), 'unit', COALESCE(interval_unit, 'hours'))
)
WHERE service_intervals IS NULL;

-- Remover colunas antigas após a migração
ALTER TABLE decorator_availability 
DROP COLUMN service_interval,
DROP COLUMN interval_unit;

-- Verificar se a migração foi bem-sucedida
SELECT 
    user_id,
    available_days,
    time_schedules,
    service_intervals,
    max_daily_services,
    created_at,
    updated_at
FROM decorator_availability
LIMIT 5;