-- ==============================================================================
-- DULCE TALLER - SEED RECETAS CAFETERÍA Y PASTELERÍA (DULCE TALLER WEB)
-- Migración: 20261105_007_seed_menu_recipes.sql
-- ==============================================================================

-- 1. INSERTAR NUEVAS MATERIAS PRIMAS
INSERT INTO public.raw_materials (code, name, unit, current_stock, min_stock, unit_cost) VALUES
('INS-014', 'Chocolate cobertura semiamargo 70%', 'gr', 8000, 2000, 16.00),
('INS-015', 'Almendras tostadas', 'gr', 3000, 800, 22.00),
('INS-016', 'Chips de chocolate belga', 'gr', 5000, 1200, 18.00),
('INS-017', 'Esencia de vainilla natural', 'ml', 1000, 200, 8.00)
ON CONFLICT (code) DO NOTHING;

-- 2. ELIMINAR CUALQUIER RESTRICCIÓN PREVIA DE unit_type DINÁMICAMENTE
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.preparations'::regclass 
          AND contype = 'c' 
          AND pg_get_constraintdef(oid) ILIKE '%unit_type%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.preparations DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 3. NORMALIZAR FILAS EXISTENTES QUE PUDIERAN TENER VALORES DISCORDANTES O EN BLANCO
UPDATE public.preparations 
SET unit_type = 'entera' 
WHERE unit_type IS NULL OR trim(unit_type) = '';

UPDATE public.preparations 
SET unit_type = 'unidad' 
WHERE lower(trim(unit_type)) IN ('un', 'kit', 'unidad individual');

UPDATE public.preparations 
SET unit_type = trim(lower(unit_type));

UPDATE public.preparations 
SET unit_type = 'unidad' 
WHERE unit_type NOT IN ('porcion', 'entera', 'taza', 'unidad', 'un', 'kit');

-- 4. APLICAR NUEVA RESTRICCIÓN PERMISIVA
ALTER TABLE public.preparations 
ADD CONSTRAINT preparations_unit_type_check 
CHECK (unit_type IN ('porcion', 'entera', 'taza', 'unidad', 'un', 'kit'));

-- 5. INSERTAR NUEVAS PREPARACIONES (Brownie, Cookies, Chocolate Caliente, Café Latte)
INSERT INTO public.preparations (code, name, category, description, unit_type, portion_yield, price, stock_available) VALUES
('PREP-005', 'Brownie Húmedo de Chocolate (Placa Entera)', 'pasteleria', 'Placa entera artesanal de puro chocolate 70% con fina costra crujiente de almendras tostadas (rinde 16 porciones).', 'entera', 1.0, 45000.00, 0),
('PREP-006', 'Porción Brownie Húmedo de Chocolate', 'pasteleria', 'Cuadrado de puro chocolate intenso con fina costra crujiente de almendras. Porción individual (1/16 de placa entera). [TORTA_MADRE:PREP-005]', 'porcion', 16.0, 3600.00, 16),
('PREP-007', 'Cookies Estilo Americano', 'pasteleria', 'Galletas horneadas en el día con chips de chocolate belga y manteca noisette. Venta por unidad (lote de horneado rinde 6 unidades).', 'unidad', 6.0, 2400.00, 18),
('PREP-011', 'Chocolate Caliente', 'cafeteria', 'Ganache de cacao puro fundida lentamente en leche texturizada con canela y vainilla.', 'taza', 1.0, 3200.00, 25),
('PREP-012', 'Café Latte', 'cafeteria', 'Nuestro blend de la casa emulsionado con microespuma de leche sedosa.', 'taza', 1.0, 2900.00, 40)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    unit_type = EXCLUDED.unit_type,
    portion_yield = EXCLUDED.portion_yield,
    price = EXCLUDED.price;

-- 6. ASOCIAR INGREDIENTES A RECETA: BROWNIE HÚMEDO (Placa Entera - PREP-005)
DO $$
DECLARE
    v_prep_id UUID;
BEGIN
    SELECT id INTO v_prep_id FROM public.preparations WHERE code = 'PREP-005';
    
    IF v_prep_id IS NOT NULL THEN
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 150, 'gr' FROM public.raw_materials WHERE code = 'INS-001'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 220, 'gr' FROM public.raw_materials WHERE code = 'INS-002'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 4, 'un' FROM public.raw_materials WHERE code = 'INS-003'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 320, 'gr' FROM public.raw_materials WHERE code = 'INS-005'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 350, 'gr' FROM public.raw_materials WHERE code = 'INS-014'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 30, 'gr' FROM public.raw_materials WHERE code = 'INS-012'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 80, 'gr' FROM public.raw_materials WHERE code = 'INS-015'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 5, 'ml' FROM public.raw_materials WHERE code = 'INS-017'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;
    END IF;
END $$;

-- 7. ASOCIAR INGREDIENTES A RECETA: COOKIES ESTILO AMERICANO (Lote de 6 - PREP-007)
DO $$
DECLARE
    v_prep_id UUID;
BEGIN
    SELECT id INTO v_prep_id FROM public.preparations WHERE code = 'PREP-007';
    
    IF v_prep_id IS NOT NULL THEN
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 180, 'gr' FROM public.raw_materials WHERE code = 'INS-001'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 110, 'gr' FROM public.raw_materials WHERE code = 'INS-002'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 120, 'gr' FROM public.raw_materials WHERE code = 'INS-005'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 1, 'un' FROM public.raw_materials WHERE code = 'INS-003'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 100, 'gr' FROM public.raw_materials WHERE code = 'INS-016'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 5, 'ml' FROM public.raw_materials WHERE code = 'INS-017'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;
    END IF;
END $$;

-- 8. ASOCIAR INGREDIENTES A RECETA: CHOCOLATE CALIENTE (PREP-011)
DO $$
DECLARE
    v_prep_id UUID;
BEGIN
    SELECT id INTO v_prep_id FROM public.preparations WHERE code = 'PREP-011';
    
    IF v_prep_id IS NOT NULL THEN
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 200, 'ml' FROM public.raw_materials WHERE code = 'INS-011'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 45, 'gr' FROM public.raw_materials WHERE code = 'INS-014'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 15, 'gr' FROM public.raw_materials WHERE code = 'INS-005'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 3, 'gr' FROM public.raw_materials WHERE code = 'INS-012'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 1, 'un' FROM public.raw_materials WHERE code = 'INS-013'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;
    END IF;
END $$;

-- 9. ASOCIAR INGREDIENTES A RECETA: CAFÉ LATTE (PREP-012)
DO $$
DECLARE
    v_prep_id UUID;
BEGIN
    SELECT id INTO v_prep_id FROM public.preparations WHERE code = 'PREP-012';
    
    IF v_prep_id IS NOT NULL THEN
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 18, 'gr' FROM public.raw_materials WHERE code = 'INS-010'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 220, 'ml' FROM public.raw_materials WHERE code = 'INS-011'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;

        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_prep_id, id, 1, 'un' FROM public.raw_materials WHERE code = 'INS-013'
        ON CONFLICT (preparation_id, raw_material_id) DO NOTHING;
    END IF;
END $$;
