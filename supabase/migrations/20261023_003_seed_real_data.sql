-- ==============================================================================
-- DULCE TALLER - DATOS SEMILLA REALES DE PASTELERÍA Y CAFETERÍA
-- Migración: 20261023_003_seed_real_data.sql
-- ==============================================================================

-- 1. INSERTAR MATERIAS PRIMAS REALES (Fichas Técnicas IFTS 29)
INSERT INTO public.raw_materials (code, name, unit, current_stock, min_stock, unit_cost) VALUES
('INS-001', 'Harina 0000', 'gr', 15000, 5000, 1.20),
('INS-002', 'Manteca', 'gr', 8000, 2000, 12.00),
('INS-003', 'Huevos frescos', 'un', 120, 30, 180.00),
('INS-004', 'Jugo de Limón natural', 'ml', 5000, 1000, 4.00),
('INS-005', 'Azúcar blanca', 'gr', 12000, 4000, 1.50),
('INS-006', 'Leche Condensada', 'gr', 10000, 2500, 6.00),
('INS-010', 'Café de especialidad en grano', 'gr', 4000, 1000, 25.00),
('INS-011', 'Leche entera / vegetal', 'ml', 15000, 3000, 1.30),
('INS-012', 'Cacao en polvo (Decoración)', 'gr', 1000, 200, 15.00),
('INS-013', 'Servilleta / Kit mesa', 'un', 500, 100, 10.00),
('INS-023', 'Caja Take-Away / Embalaje especial', 'un', 80, 25, 450.00)
ON CONFLICT (code) DO NOTHING;

-- 2. INSERTAR PREPARACIONES REALES
INSERT INTO public.preparations (code, name, category, description, unit_type, portion_yield, price, stock_available) VALUES
('PREP-001', 'Lemon Pie (Torta Entera)', 'pasteleria', 'Torta entera clásica de 8 porciones con base crocante y merengue italiano.', 'entera', 1.0, 28000.00, 4),
('PREP-002', 'Porción Lemon Pie', 'pasteleria', 'Porción individual (1/8 de torta entera). Descuenta 0.125 de stock terminado.', 'porcion', 8.0, 3800.00, 16),
('PREP-010', 'Café Capuccino', 'cafeteria', 'Café de especialidad doble shot con leche texturizada y cacao amargo.', 'taza', 1.0, 2900.00, 50)
ON CONFLICT (code) DO NOTHING;

-- 3. ASOCIAR INGREDIENTES A RECETA: LEMON PIE (Torta Entera)
DO $$
DECLARE
    v_prep_id UUID;
BEGIN
    SELECT id INTO v_prep_id FROM public.preparations WHERE code = 'PREP-001';
    
    IF v_prep_id IS NOT NULL THEN
        -- Harina 0000: 250 gr
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 250, 'gr' FROM public.raw_materials WHERE code = 'INS-001'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        -- Manteca: 150 gr
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 150, 'gr' FROM public.raw_materials WHERE code = 'INS-002'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        -- Huevos frescos: 4 un
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 4, 'un' FROM public.raw_materials WHERE code = 'INS-003'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        -- Jugo de Limón: 150 ml
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 150, 'ml' FROM public.raw_materials WHERE code = 'INS-004'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        -- Azúcar blanca: 300 gr
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 300, 'gr' FROM public.raw_materials WHERE code = 'INS-005'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        -- Leche Condensada: 395 gr
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 395, 'gr' FROM public.raw_materials WHERE code = 'INS-006'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;
    END IF;
END $$;

-- 4. ASOCIAR INGREDIENTES A RECETA: CAFÉ CAPUCCINO
DO $$
DECLARE
    v_prep_id UUID;
BEGIN
    SELECT id INTO v_prep_id FROM public.preparations WHERE code = 'PREP-010';
    
    IF v_prep_id IS NOT NULL THEN
        -- Café en grano: 18 gr
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 18, 'gr' FROM public.raw_materials WHERE code = 'INS-010'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        -- Leche: 180 ml
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 180, 'ml' FROM public.raw_materials WHERE code = 'INS-011'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        -- Cacao en polvo: 3 gr
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 3, 'gr' FROM public.raw_materials WHERE code = 'INS-012'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        -- Servilleta / Kit mesa: 2 un
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 2, 'un' FROM public.raw_materials WHERE code = 'INS-013'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;
    END IF;
END $$;

