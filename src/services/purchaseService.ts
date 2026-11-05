import { PurchaseListItem, RawMaterial } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { inventoryService } from './inventoryService';

let localPurchases: PurchaseListItem[] = [];

export const purchaseService = {
  async getPurchaseList(currentMaterials?: RawMaterial[]): Promise<PurchaseListItem[]> {
    let items: PurchaseListItem[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('purchase_list_items')
          .select('*')
          .order('is_purchased', { ascending: true })
          .order('created_at', { ascending: false });
        if (!error && data) {
          items = data as PurchaseListItem[];
        }
      } catch (err) {
        console.warn('Error obteniendo compras de Supabase, usando local:', err);
      }
    } else {
      items = [...localPurchases];
    }

    // Obtener materias primas actuales para verificar si hay alguna en bajo stock sin sugerencia
    const materials = currentMaterials || await inventoryService.getRawMaterials();
    const lowStockMaterials = inventoryService.getLowStockAlerts(materials);

    if (lowStockMaterials.length > 0) {
      const pendingRawMaterialIds = new Set(
        items.filter(i => !i.is_purchased && i.raw_material_id).map(i => i.raw_material_id)
      );

      const missingSuggestions: PurchaseListItem[] = [];
      for (const mat of lowStockMaterials) {
        if (!pendingRawMaterialIds.has(mat.id)) {
          const targetStock = Number(mat.min_stock) * 2;
          const current = Number(mat.current_stock);
          const suggested = Math.max(1, Math.round((targetStock - current) * 100) / 100);

          const suggItem: PurchaseListItem = {
            id: 'sugg-' + mat.id,
            raw_material_id: mat.id,
            item_name: `${mat.name} (${mat.code})`,
            quantity_suggested: suggested,
            quantity_to_buy: suggested,
            unit: mat.unit,
            is_purchased: false,
            notes: `Alerta: Stock actual (${mat.current_stock} ${mat.unit}) <= Mínimo (${mat.min_stock} ${mat.unit})`
          };
          missingSuggestions.push(suggItem);
        }
      }

      if (missingSuggestions.length > 0) {
        if (isSupabaseConfigured && supabase) {
          for (const item of missingSuggestions) {
            try {
              const { data: inserted, error: insertErr } = await supabase
                .from('purchase_list_items')
                .insert([{
                  raw_material_id: item.raw_material_id,
                  item_name: item.item_name,
                  quantity_suggested: item.quantity_suggested,
                  quantity_to_buy: item.quantity_to_buy,
                  unit: item.unit,
                  is_purchased: false,
                  notes: item.notes
                }])
                .select()
                .single();

              if (!insertErr && inserted) {
                items.unshift(inserted as PurchaseListItem);
              } else {
                items.unshift(item);
              }
            } catch {
              items.unshift(item);
            }
          }
        } else {
          localPurchases = [...missingSuggestions, ...localPurchases];
          items = [...localPurchases];
        }
      }
    }

    return items;
  },

  async generateAutoSuggestions(currentMaterials?: RawMaterial[]): Promise<PurchaseListItem[]> {
    const materials = currentMaterials || await inventoryService.getRawMaterials();
    const lowStock = inventoryService.getLowStockAlerts(materials);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: existing } = await supabase
          .from('purchase_list_items')
          .select('*');

        const existingMap = new Map<string, any>();
        (existing || []).forEach((row: any) => {
          if (row.raw_material_id && !row.is_purchased) {
            existingMap.set(row.raw_material_id, row);
          }
        });

        for (const mat of lowStock) {
          const targetStock = Number(mat.min_stock) * 2;
          const current = Number(mat.current_stock);
          const suggested = Math.max(1, Math.round((targetStock - current) * 100) / 100);
          const existingItem = existingMap.get(mat.id);

          if (existingItem) {
            await supabase
              .from('purchase_list_items')
              .update({
                quantity_suggested: suggested,
                quantity_to_buy: existingItem.quantity_to_buy > 0 ? existingItem.quantity_to_buy : suggested,
                notes: `Alerta: Stock actual (${mat.current_stock} ${mat.unit}) <= Mínimo (${mat.min_stock} ${mat.unit})`,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingItem.id);
          } else {
            await supabase
              .from('purchase_list_items')
              .insert([{
                raw_material_id: mat.id,
                item_name: `${mat.name} (${mat.code})`,
                quantity_suggested: suggested,
                quantity_to_buy: suggested,
                unit: mat.unit,
                is_purchased: false,
                notes: `Alerta: Stock actual (${mat.current_stock} ${mat.unit}) <= Mínimo (${mat.min_stock} ${mat.unit})`
              }]);
          }
        }
      } catch (err) {
        console.warn('Error actualizando sugerencias en Supabase:', err);
      }

      return this.getPurchaseList(materials);
    }

    // Modo Local
    for (const mat of lowStock) {
      const targetStock = Number(mat.min_stock) * 2;
      const current = Number(mat.current_stock);
      const suggested = Math.max(1, Math.round((targetStock - current) * 100) / 100);

      const existingIndex = localPurchases.findIndex(p => p.raw_material_id === mat.id && !p.is_purchased);
      if (existingIndex !== -1) {
        localPurchases[existingIndex].quantity_suggested = suggested;
        localPurchases[existingIndex].notes = `Alerta: Stock actual (${mat.current_stock} ${mat.unit}) <= Mínimo (${mat.min_stock} ${mat.unit})`;
      } else {
        localPurchases.unshift({
          id: 'pur-' + mat.id,
          raw_material_id: mat.id,
          item_name: `${mat.name} (${mat.code})`,
          quantity_suggested: suggested,
          quantity_to_buy: suggested,
          unit: mat.unit,
          is_purchased: false,
          notes: `Alerta: Stock actual (${mat.current_stock} ${mat.unit}) <= Mínimo (${mat.min_stock} ${mat.unit})`
        });
      }
    }

    return [...localPurchases];
  },

  async updateItem(id: string, updates: Partial<PurchaseListItem>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isValidUuid) {
        const { error } = await supabase
          .from('purchase_list_items')
          .update(updates)
          .eq('id', id);
        if (error) throw error;
        return;
      }
    }

    const idx = localPurchases.findIndex(p => p.id === id);
    if (idx !== -1) {
      localPurchases[idx] = { ...localPurchases[idx], ...updates };
    }
  },

  async addManualItem(item: Omit<PurchaseListItem, 'id'>): Promise<PurchaseListItem> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('purchase_list_items')
        .insert([item])
        .select()
        .single();
      if (error) throw error;
      return data as PurchaseListItem;
    }

    const newItem: PurchaseListItem = {
      ...item,
      id: 'pur-man-' + Date.now()
    };
    localPurchases.unshift(newItem);
    return newItem;
  }
};
