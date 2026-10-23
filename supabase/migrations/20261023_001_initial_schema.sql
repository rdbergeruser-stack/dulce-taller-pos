-- ==============================================================================
-- DULCE TALLER - ESQUEMA INICIAL DE BASE DE DATOS
-- Migración: 20261023_001_initial_schema.sql
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES (Vinculada a Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'mozo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA DE MATERIAS PRIMAS (INSUMOS)
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

-- 4. TABLA DE PREPARACIONES (PRODUCTOS TERMINADOS / OFERTA)
CREATE TABLE IF NOT EXISTS public.preparations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('pasteleria', 'cafeteria')),
    description TEXT,
    unit_type VARCHAR(20) NOT NULL CHECK (unit_type IN ('porcion', 'entera', 'taza')),
    portion_yield NUMERIC(6, 2) NOT NULL DEFAULT 1.0 CHECK (portion_yield > 0),
    price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    stock_available NUMERIC(10, 3) NOT NULL DEFAULT 0 CHECK (stock_available >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLA DE RECETAS (INGREDIENTES POR PREPARACIÓN)
CREATE TABLE IF NOT EXISTS public.preparation_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    preparation_id UUID NOT NULL REFERENCES public.preparations(id) ON DELETE CASCADE,
    raw_material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE RESTRICT,
    quantity_required NUMERIC(12, 4) NOT NULL CHECK (quantity_required > 0),
    unit VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(preparation_id, raw_material_id)
);

-- 6. TABLA DE REGISTRO DE PRODUCCIÓN TERMINADA
CREATE TABLE IF NOT EXISTS public.production_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    preparation_id UUID NOT NULL REFERENCES public.preparations(id) ON DELETE RESTRICT,
    quantity_produced NUMERIC(10, 3) NOT NULL CHECK (quantity_produced > 0),
    batch_code VARCHAR(50),
    notes TEXT,
    produced_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABLA DE MOVIMIENTOS DE STOCK (KARDEX AUDITABLE)
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
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABLA DE COMANDAS (ÓRDENES)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number SERIAL UNIQUE,
    origin VARCHAR(20) NOT NULL CHECK (origin IN ('salon', 'takeaway')),
    table_number VARCHAR(10),
    status VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_preparacion', 'lista', 'entregada', 'cancelada')),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. TABLA DE ÍTEMS DE COMANDA
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    preparation_id UUID NOT NULL REFERENCES public.preparations(id) ON DELETE RESTRICT,
    quantity NUMERIC(6, 3) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. TABLA DE LISTA DE COMPRAS
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

-- ÍNDICES DE RENDIMIENTO
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

-- Políticas permisivas para usuarios autenticados del sistema interno
CREATE POLICY "Usuarios autenticados pueden ver perfiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins pueden gestionar perfiles" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Lectura de materias primas para autenticados" ON public.raw_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestion de materias primas para admins" ON public.raw_materials FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Lectura de preparaciones para autenticados" ON public.preparations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestion de preparaciones para admins" ON public.preparations FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Lectura de recetas para autenticados" ON public.preparation_ingredients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestion de recetas para admins" ON public.preparation_ingredients FOR ALL TO authenticated USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Acceso a produccion para autenticados" ON public.production_records FOR ALL TO authenticated USING (true);
CREATE POLICY "Lectura de movimientos para autenticados" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Acceso a comandas para autenticados" ON public.orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso a items de comandas para autenticados" ON public.order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso a lista de compras para autenticados" ON public.purchase_list_items FOR ALL TO authenticated USING (true);

