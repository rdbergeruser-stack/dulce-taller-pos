-- ==============================================================================
-- DULCE TALLER - INCORPORACIÓN DE ROL COCINERO
-- Migración: 20261104_005_add_cocinero_role.sql
-- ==============================================================================

-- 1. Actualizar restricción CHECK en tabla de perfiles para admitir 'cocinero'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'mozo', 'cocinero'));

-- 2. Insertar perfil por defecto de cocinero si no existe en mock/seed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'cocina@dulcetaller.com') THEN
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (
            '00000000-0000-0000-0000-000000000003',
            'cocina@dulcetaller.com',
            'Mateo Benítez',
            'cocinero'
        ) ON CONFLICT (email) DO UPDATE SET role = 'cocinero';
    END IF;
END $$;

