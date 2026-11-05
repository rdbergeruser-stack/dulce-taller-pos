-- ==============================================================================
-- DULCE TALLER POS - MIGRATION 20261105_006
-- Índice condicional para items de lista de compras no adquiridos
-- Permite compras recurrentes pero evita duplicados simultáneos de la misma materia prima
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'purchase_list_items' 
          AND indexname = 'idx_purchase_list_unpurchased_mat'
    ) THEN
        CREATE UNIQUE INDEX idx_purchase_list_unpurchased_mat 
        ON public.purchase_list_items (raw_material_id) 
        WHERE is_purchased = false AND raw_material_id IS NOT NULL;
    END IF;
END $$;

