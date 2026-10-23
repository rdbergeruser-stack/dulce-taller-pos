-- ==============================================================================
-- DULCE TALLER - FUNCIONES TRANSACCIONALES (RPC)
-- Migración: 20261023_002_production_rpc.sql
-- ==============================================================================

-- 1. FUNCIÓN PARA CONFIRMAR PRODUCCIÓN TERMINADA
-- Valida stock de insumos, descuenta materias primas atómicamente,
-- registra movimientos de kardex y suma al stock de preparaciones terminadas.
CREATE OR REPLACE FUNCTION public.confirm_production_batch(
    p_preparation_id UUID,
    p_quantity_produced NUMERIC,
    p_user_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_prep RECORD;
    v_ing RECORD;
    v_raw RECORD;
    v_required NUMERIC;
    v_prod_id UUID;
    v_batch_code VARCHAR(50);
BEGIN
    -- Validaciones iniciales
    IF p_quantity_produced <= 0 THEN
        RAISE EXCEPTION 'La cantidad producida debe ser mayor a 0.';
    END IF;

    -- Obtener la preparación
    SELECT * INTO v_prep FROM public.preparations WHERE id = p_preparation_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'La preparación especificada no existe.';
    END IF;

    -- Verificar que la preparación tenga receta cargada
    IF NOT EXISTS (SELECT 1 FROM public.preparation_ingredients WHERE preparation_id = p_preparation_id) THEN
        RAISE EXCEPTION 'La preparación % no tiene ingredientes configurados en su receta.', v_prep.name;
    END IF;

    -- PASO 1: Validación de stock suficiente para TODOS los ingredientes (Pre-flight check)
    FOR v_ing IN 
        SELECT pi.raw_material_id, pi.quantity_required, rm.name, rm.unit, rm.current_stock
        FROM public.preparation_ingredients pi
        JOIN public.raw_materials rm ON rm.id = pi.raw_material_id
        WHERE pi.preparation_id = p_preparation_id
        FOR UPDATE OF rm -- Bloqueo de fila para evitar condiciones de carrera (Race Condition)
    LOOP
        v_required := v_ing.quantity_required * p_quantity_produced;
        
        IF v_ing.current_stock < v_required THEN
            RAISE EXCEPTION 'Stock insuficiente de %: disponible % %, requerido % %.',
                v_ing.name, v_ing.current_stock, v_ing.unit, v_required, v_ing.unit;
        END IF;
    END LOOP;

    -- Generar código de lote (Batch)
    v_batch_code := 'LOTE-' || to_char(now(), 'YYYYMMDD-HH24MI') || '-' || substring(v_prep.code, 1, 4);

    -- PASO 2: Descuento atómico de materias primas y registro en Kardex
    FOR v_ing IN 
        SELECT pi.raw_material_id, pi.quantity_required, rm.current_stock
        FROM public.preparation_ingredients pi
        JOIN public.raw_materials rm ON rm.id = pi.raw_material_id
        WHERE pi.preparation_id = p_preparation_id
    LOOP
        v_required := v_ing.quantity_required * p_quantity_produced;

        -- Descontar stock
        UPDATE public.raw_materials
        SET current_stock = current_stock - v_required,
            updated_at = now()
        WHERE id = v_ing.raw_material_id;

        -- Registrar movimiento en kardex
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

    -- PASO 3: Asentar registro de producción
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

    -- PASO 4: Incrementar stock de productos cocinados / terminados disponibles
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


-- 2. FUNCIÓN PARA DESCONTAR STOCK DE PRODUCTOS TERMINADOS AL ENTREGAR O DESPACHAR COMANDA
CREATE OR REPLACE FUNCTION public.dispatch_order(
    p_order_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_prep RECORD;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'La comanda no existe.';
    END IF;

    IF v_order.status = 'entregada' THEN
        RAISE EXCEPTION 'Esta comanda ya fue entregada previamente.';
    END IF;

    -- Verificar stock disponible de preparaciones y descontar
    FOR v_item IN 
        SELECT oi.*, p.name AS prep_name, p.stock_available, p.unit_type
        FROM public.order_items oi
        JOIN public.preparations p ON p.id = oi.preparation_id
        WHERE oi.order_id = p_order_id
        FOR UPDATE OF p
    LOOP
        -- Descontar del stock disponible de vitrina
        UPDATE public.preparations
        SET stock_available = GREATEST(0, stock_available - v_item.quantity),
            updated_at = now()
        WHERE id = v_item.preparation_id;

        -- Registrar movimiento en stock_movements para trazabilidad
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

    -- Actualizar estado de comanda
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

