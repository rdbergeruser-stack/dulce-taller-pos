-- ==============================================================================
-- DULCE TALLER - INSTALACIÓN COMPLETA (ESQUEMA + RPC + DATOS SEMILLA REALES)
-- Copiar y pegar este contenido completo en el SQL Editor de tu proyecto Supabase
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'mozo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA DE MATERIAS PRIMAS
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    unit VARCHAR(10) NOT NULL CHECK (unit IN ('gr', 'ml', 'un', 'kg', 'lt')),
    current_stock NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_stock NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA DE PREPARACIONES
CREATE TABLE IF NOT EXISTS public.preparations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('pasteleria', 'cafeteria', 'taller')),
    description TEXT,
    unit_type VARCHAR(20) NOT NULL CHECK (unit_type IN ('porcion', 'entera', 'taza', 'kit')),
    portion_yield NUMERIC(6, 2) NOT NULL DEFAULT 1.0 CHECK (portion_yield > 0),
    price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    stock_available NUMERIC(10, 3) NOT NULL DEFAULT 0 CHECK (stock_available >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLA DE RECETAS
CREATE TABLE IF NOT EXISTS public.preparation_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    preparation_id UUID NOT NULL REFERENCES public.preparations(id) ON DELETE CASCADE,
    raw_material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE RESTRICT,
    quantity_required NUMERIC(12, 4) NOT NULL CHECK (quantity_required > 0),
    unit VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(preparation_id, raw_material_id)
);

-- 6. REGISTRO DE PRODUCCIÓN TERMINADA
CREATE TABLE IF NOT EXISTS public.production_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    preparation_id UUID NOT NULL REFERENCES public.preparations(id) ON DELETE RESTRICT,
    quantity_produced NUMERIC(10, 3) NOT NULL CHECK (quantity_produced > 0),
    batch_code VARCHAR(50),
    notes TEXT,
    produced_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. MOVIMIENTOS DE STOCK
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raw_material_id UUID REFERENCES public.raw_materials(id) ON DELETE RESTRICT,
    preparation_id UUID REFERENCES public.preparations(id) ON DELETE SET NULL,
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('entrada', 'ajuste', 'produccion_consumo', 'merma', 'venta_despacho')),
    quantity NUMERIC(12, 3) NOT NULL,
    previous_stock NUMERIC(12, 3) NOT NULL,
    new_stock NUMERIC(12, 3) NOT NULL,
    reason TEXT NOT NULL,
    reference_id UUID,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. COMANDAS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number SERIAL UNIQUE,
    origin VARCHAR(20) NOT NULL CHECK (origin IN ('salon', 'takeaway', 'taller')),
    table_number VARCHAR(10),
    status VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_preparacion', 'lista', 'entregada', 'cancelada')),
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ÍTEMS DE COMANDA
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    preparation_id UUID NOT NULL REFERENCES public.preparations(id) ON DELETE RESTRICT,
    quantity NUMERIC(6, 3) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. LISTA DE COMPRAS
CREATE TABLE IF NOT EXISTS public.purchase_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raw_material_id UUID REFERENCES public.raw_materials(id) ON DELETE SET NULL,
    item_name VARCHAR(120) NOT NULL,
    quantity_suggested NUMERIC(12, 3) NOT NULL DEFAULT 0,
    quantity_to_buy NUMERIC(12, 3) NOT NULL DEFAULT 0,
    unit VARCHAR(10) NOT NULL,
    is_purchased BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_raw_materials_stock ON public.raw_materials(current_stock, min_stock);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON public.stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- POLÍTICAS DE SEGURIDAD (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preparations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preparation_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_write_all" ON public.profiles FOR ALL USING (true);

CREATE POLICY "raw_materials_read_all" ON public.raw_materials FOR SELECT USING (true);
CREATE POLICY "raw_materials_write_all" ON public.raw_materials FOR ALL USING (true);

CREATE POLICY "preparations_read_all" ON public.preparations FOR SELECT USING (true);
CREATE POLICY "preparations_write_all" ON public.preparations FOR ALL USING (true);

CREATE POLICY "recipes_read_all" ON public.preparation_ingredients FOR SELECT USING (true);
CREATE POLICY "recipes_write_all" ON public.preparation_ingredients FOR ALL USING (true);

CREATE POLICY "production_read_all" ON public.production_records FOR SELECT USING (true);
CREATE POLICY "production_write_all" ON public.production_records FOR ALL USING (true);

CREATE POLICY "movements_read_all" ON public.stock_movements FOR SELECT USING (true);
CREATE POLICY "movements_write_all" ON public.stock_movements FOR ALL USING (true);

CREATE POLICY "orders_read_all" ON public.orders FOR SELECT USING (true);
CREATE POLICY "orders_write_all" ON public.orders FOR ALL USING (true);

CREATE POLICY "order_items_read_all" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "order_items_write_all" ON public.order_items FOR ALL USING (true);

CREATE POLICY "purchases_read_all" ON public.purchase_list_items FOR SELECT USING (true);
CREATE POLICY "purchases_write_all" ON public.purchase_list_items FOR ALL USING (true);

-- ==============================================================================
-- FUNCIONES RPC TRANSACCIONALES
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.confirm_production_batch(
    p_preparation_id UUID,
    p_quantity_produced NUMERIC,
    p_user_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_prep RECORD;
    v_ing RECORD;
    v_required NUMERIC;
    v_prod_id UUID;
    v_batch_code VARCHAR(50);
BEGIN
    IF p_quantity_produced <= 0 THEN
        RAISE EXCEPTION 'La cantidad producida debe ser mayor a 0.';
    END IF;

    SELECT * INTO v_prep FROM public.preparations WHERE id = p_preparation_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'La preparación especificada no existe.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.preparation_ingredients WHERE preparation_id = p_preparation_id) THEN
        RAISE EXCEPTION 'La preparación % no tiene ingredientes configurados en su receta.', v_prep.name;
    END IF;

    -- Validar stock suficiente para TODOS los ingredientes con bloqueo FOR UPDATE
    FOR v_ing IN 
        SELECT pi.raw_material_id, pi.quantity_required, rm.name, rm.unit, rm.current_stock
        FROM public.preparation_ingredients pi
        JOIN public.raw_materials rm ON rm.id = pi.raw_material_id
        WHERE pi.preparation_id = p_preparation_id
        FOR UPDATE OF rm
    LOOP
        v_required := v_ing.quantity_required * p_quantity_produced;
        
        IF v_ing.current_stock < v_required THEN
            RAISE EXCEPTION 'Stock insuficiente de %: disponible % %, requerido % %.',
                v_ing.name, v_ing.current_stock, v_ing.unit, v_required, v_ing.unit;
        END IF;
    END LOOP;

    v_batch_code := 'LOTE-' || to_char(now(), 'YYYYMMDD-HH24MI') || '-' || substring(v_prep.code, 1, 4);

    -- Descontar insumos y registrar movimientos
    FOR v_ing IN 
        SELECT pi.raw_material_id, pi.quantity_required, rm.current_stock
        FROM public.preparation_ingredients pi
        JOIN public.raw_materials rm ON rm.id = pi.raw_material_id
        WHERE pi.preparation_id = p_preparation_id
    LOOP
        v_required := v_ing.quantity_required * p_quantity_produced;

        UPDATE public.raw_materials
        SET current_stock = current_stock - v_required,
            updated_at = now()
        WHERE id = v_ing.raw_material_id;

        INSERT INTO public.stock_movements (
            raw_material_id,
            preparation_id,
            movement_type,
            quantity,
            previous_stock,
            new_stock,
            reason,
            created_by
        ) VALUES (
            v_ing.raw_material_id,
            p_preparation_id,
            'produccion_consumo',
            -v_required,
            v_ing.current_stock,
            v_ing.current_stock - v_required,
            'Consumo por producción: ' || p_quantity_produced || ' un. de ' || v_prep.name || ' (' || v_batch_code || ')',
            p_user_id
        );
    END LOOP;

    -- Registrar producción
    INSERT INTO public.production_records (
        preparation_id,
        quantity_produced,
        batch_code,
        notes,
        produced_by
    ) VALUES (
        p_preparation_id,
        p_quantity_produced,
        v_batch_code,
        p_notes,
        p_user_id
    ) RETURNING id INTO v_prod_id;

    -- Aumentar stock de producto elaborado
    UPDATE public.preparations
    SET stock_available = stock_available + p_quantity_produced,
        updated_at = now()
    WHERE id = p_preparation_id;

    RETURN jsonb_build_object(
        'success', true,
        'production_id', v_prod_id,
        'batch_code', v_batch_code,
        'quantity_produced', p_quantity_produced,
        'preparation_name', v_prep.name
    );
END;
$$;


CREATE OR REPLACE FUNCTION public.dispatch_order(
    p_order_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'La comanda no existe.';
    END IF;

    IF v_order.status = 'entregada' THEN
        RAISE EXCEPTION 'Esta comanda ya fue entregada previamente.';
    END IF;

    -- Descontar del stock disponible de preparaciones listas
    FOR v_item IN 
        SELECT oi.*, p.name AS prep_name, p.stock_available
        FROM public.order_items oi
        JOIN public.preparations p ON p.id = oi.preparation_id
        WHERE oi.order_id = p_order_id
        FOR UPDATE OF p
    LOOP
        UPDATE public.preparations
        SET stock_available = GREATEST(0, stock_available - v_item.quantity),
            updated_at = now()
        WHERE id = v_item.preparation_id;

        INSERT INTO public.stock_movements (
            preparation_id,
            movement_type,
            quantity,
            previous_stock,
            new_stock,
            reason,
            reference_id,
            created_by
        ) VALUES (
            v_item.preparation_id,
            'venta_despacho',
            -v_item.quantity,
            v_item.stock_available,
            GREATEST(0, v_item.stock_available - v_item.quantity),
            'Despacho comanda #' || v_order.order_number || ' (' || v_order.origin || ')',
            p_order_id,
            p_user_id
        );
    END LOOP;

    UPDATE public.orders
    SET status = 'entregada',
        updated_at = now()
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'new_status', 'entregada'
    );
END;
$$;

-- ==============================================================================
-- INSERCIÓN DE DATOS REALES DE INSUMOS Y RECETAS
-- ==============================================================================

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
('INS-020', 'Masa base de cookie precocida', 'un', 60, 20, 200.00),
('INS-021', 'Manga de Glasé real (colores)', 'un', 30, 10, 350.00),
('INS-022', 'Toppings y Sprinkles variados', 'gr', 1500, 300, 10.00),
('INS-023', 'Caja Take-Away / Embalaje especial', 'un', 80, 25, 450.00)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.preparations (code, name, category, description, unit_type, portion_yield, price, stock_available) VALUES
('PREP-001', 'Lemon Pie (Torta Entera)', 'pasteleria', 'Torta entera clásica de 8 porciones con base crocante y merengue italiano.', 'entera', 1.0, 28000.00, 4),
('PREP-002', 'Porción Lemon Pie', 'pasteleria', 'Porción individual (1/8 de torta entera). Descuenta 0.125 de stock terminado.', 'porcion', 8.0, 3800.00, 16),
('PREP-010', 'Café Capuccino', 'cafeteria', 'Café de especialidad doble shot con leche texturizada y cacao amargo.', 'taza', 1.0, 2900.00, 50),
('PREP-020', 'Kit Participativo Taller de Cookies', 'taller', 'Kit individual para participantes de workshops con bases, mangas y toppings.', 'kit', 1.0, 12000.00, 8)
ON CONFLICT (code) DO NOTHING;

-- RECETAS
DO $$
DECLARE
    v_lemon UUID;
    v_capuccino UUID;
    v_kit UUID;
BEGIN
    SELECT id INTO v_lemon FROM public.preparations WHERE code = 'PREP-001';
    SELECT id INTO v_capuccino FROM public.preparations WHERE code = 'PREP-010';
    SELECT id INTO v_kit FROM public.preparations WHERE code = 'PREP-020';

    IF v_lemon IS NOT NULL THEN
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_lemon, id, 250, 'gr' FROM public.raw_materials WHERE code = 'INS-001' ON CONFLICT DO NOTHING;
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_lemon, id, 150, 'gr' FROM public.raw_materials WHERE code = 'INS-002' ON CONFLICT DO NOTHING;
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_lemon, id, 4, 'un' FROM public.raw_materials WHERE code = 'INS-003' ON CONFLICT DO NOTHING;
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_lemon, id, 150, 'ml' FROM public.raw_materials WHERE code = 'INS-004' ON CONFLICT DO NOTHING;
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_lemon, id, 300, 'gr' FROM public.raw_materials WHERE code = 'INS-005' ON CONFLICT DO NOTHING;
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_lemon, id, 395, 'gr' FROM public.raw_materials WHERE code = 'INS-006' ON CONFLICT DO NOTHING;
    END IF;

    IF v_capuccino IS NOT NULL THEN
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_capuccino, id, 18, 'gr' FROM public.raw_materials WHERE code = 'INS-010' ON CONFLICT DO NOTHING;
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_capuccino, id, 180, 'ml' FROM public.raw_materials WHERE code = 'INS-011' ON CONFLICT DO NOTHING;
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_capuccino, id, 3, 'gr' FROM public.raw_materials WHERE code = 'INS-012' ON CONFLICT DO NOTHING;
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_capuccino, id, 2, 'un' FROM public.raw_materials WHERE code = 'INS-013' ON CONFLICT DO NOTHING;
    END IF;

    IF v_kit IS NOT NULL THEN
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_kit, id, 4, 'un' FROM public.raw_materials WHERE code = 'INS-020' ON CONFLICT DO NOTHING;
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_kit, id, 3, 'un' FROM public.raw_materials WHERE code = 'INS-021' ON CONFLICT DO NOTHING;
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_kit, id, 50, 'gr' FROM public.raw_materials WHERE code = 'INS-022' ON CONFLICT DO NOTHING;
        INSERT INTO public.preparation_ingredients (preparation_id, raw_material_id, quantity_required, unit)
        SELECT v_kit, id, 1, 'un' FROM public.raw_materials WHERE code = 'INS-023' ON CONFLICT DO NOTHING;
    END IF;
END $$;

