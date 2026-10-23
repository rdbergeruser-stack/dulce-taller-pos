import { RawMaterial, StockMovement } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_RAW_MATERIALS, INITIAL_MOVEMENTS } from '../data/mockData';

let localMaterials: RawMaterial[] = [...INITIAL_RAW_MATERIALS];
let localMovements: StockMovement[] = [...INITIAL_MOVEMENTS];

export const inventoryService = {
  async getRawMaterials(): Promise<RawMaterial[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('raw_materials')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as RawMaterial[];
    }
    return [...localMaterials];
  },

  async createRawMaterial(material: Omit<RawMaterial, 'id'>, userId?: string): Promise<RawMaterial> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('raw_materials')
        .insert([material])
        .select()
        .single();
      if (error) throw error;

      // Registrar movimiento de stock inicial si current_stock > 0
      if (material.current_stock > 0) {
        const isValidUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        await supabase.from('stock_movements').insert([{
          raw_material_id: data.id,
          movement_type: 'entrada',
          quantity: material.current_stock,
          previous_stock: 0,
          new_stock: material.current_stock,
          reason: 'Carga inicial de materia prima: ' + material.name,
          created_by: isValidUuid ? userId : null
        }]);
      }

      return data as RawMaterial;
    }

    const newMaterial: RawMaterial = {
      ...material,
      id: 'rm-' + Date.now(),
      created_at: new Date().toISOString()
    };
    localMaterials.push(newMaterial);

    if (material.current_stock > 0) {
      localMovements.unshift({
        id: 'mov-' + Date.now(),
        raw_material_id: newMaterial.id,
        movement_type: 'entrada',
        quantity: material.current_stock,
        previous_stock: 0,
        new_stock: material.current_stock,
        reason: 'Carga inicial de materia prima: ' + material.name,
        created_at: new Date().toISOString()
      });
    }

    return newMaterial;
  },

  async updateRawMaterial(id: string, updates: Partial<RawMaterial>, userId?: string, reason?: string): Promise<RawMaterial> {
    if (isSupabaseConfigured && supabase) {
      // Si cambia el stock, registrar movimiento
      if (updates.current_stock !== undefined) {
        const { data: current } = await supabase
          .from('raw_materials')
          .select('current_stock')
          .eq('id', id)
          .single();

        if (current && current.current_stock !== updates.current_stock) {
          const isValidUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
          const diff = updates.current_stock - current.current_stock;
          await supabase.from('stock_movements').insert([{
            raw_material_id: id,
            movement_type: diff > 0 ? 'entrada' : 'ajuste',
            quantity: diff,
            previous_stock: current.current_stock,
            new_stock: updates.current_stock,
            reason: reason || 'Ajuste manual de stock de materia prima',
            created_by: isValidUuid ? userId : null
          }]);
        }
      }

      const { data, error } = await supabase
        .from('raw_materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as RawMaterial;
    }

    const index = localMaterials.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Materia prima no encontrada');

    const previous = localMaterials[index];
    if (updates.current_stock !== undefined && updates.current_stock !== previous.current_stock) {
      const diff = updates.current_stock - previous.current_stock;
      localMovements.unshift({
        id: 'mov-' + Date.now(),
        raw_material_id: id,
        movement_type: diff > 0 ? 'entrada' : 'ajuste',
        quantity: diff,
        previous_stock: previous.current_stock,
        new_stock: updates.current_stock,
        reason: reason || 'Ajuste manual de stock de materia prima',
        created_at: new Date().toISOString()
      });
    }

    localMaterials[index] = { ...previous, ...updates, updated_at: new Date().toISOString() };
    return localMaterials[index];
  },

  async getMovements(): Promise<StockMovement[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*, raw_materials(name, unit), preparations(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as StockMovement[];
    }
    return [...localMovements];
  },

  getLowStockAlerts(materials: RawMaterial[]): RawMaterial[] {
    return materials.filter(m => m.is_active && m.current_stock <= m.min_stock);
  }
};

