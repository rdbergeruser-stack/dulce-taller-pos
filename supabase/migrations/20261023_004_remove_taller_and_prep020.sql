-- ==============================================================================
-- DULCE TALLER - LIMPIEZA DE MÓDULO TALLER Y PREP-020
-- Migración: 20261023_004_remove_taller_and_prep020.sql
-- ==============================================================================

-- 1. Eliminar ítems de comandas de salón o taller asociados a PREP-020
DELETE FROM public.order_items 
WHERE preparation_id IN (
    SELECT id FROM public.preparations 
    WHERE code = 'PREP-020' OR category = 'taller' OR name ILIKE '%taller%'
);

-- 2. Eliminar comandas con origen taller
DELETE FROM public.orders WHERE origin = 'taller';

-- 3. Eliminar recetas, registros de producción y kardex asociados
DELETE FROM public.preparation_ingredients 
WHERE preparation_id IN (
    SELECT id FROM public.preparations 
    WHERE code = 'PREP-020' OR category = 'taller' OR name ILIKE '%taller%'
);

DELETE FROM public.production_records 
WHERE preparation_id IN (
    SELECT id FROM public.preparations 
    WHERE code = 'PREP-020' OR category = 'taller' OR name ILIKE '%taller%'
);

DELETE FROM public.stock_movements 
WHERE preparation_id IN (
    SELECT id FROM public.preparations 
    WHERE code = 'PREP-020' OR category = 'taller' OR name ILIKE '%taller%'
);

-- 4. Eliminar la preparación PREP-020 (Kit Participativo Taller de Cookies)
DELETE FROM public.preparations 
WHERE code = 'PREP-020' OR category = 'taller' OR name ILIKE '%taller%';

-- 5. Eliminar insumos exclusivos del taller de cookies si existen
DELETE FROM public.raw_materials 
WHERE code IN ('INS-020', 'INS-021', 'INS-022');

