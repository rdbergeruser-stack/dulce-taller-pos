import { PurchaseListItem } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { inventoryService } from './inventoryService';

let localPurchases: PurchaseListItem[] = [];

export const purchaseService = {
  async getPurchaseList(): Promise<PurchaseListItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('purchase_list_items')
        .select('*')
        .order('is_purchased', { ascending: true });
      if (error) throw error;
      return data as PurchaseListItem[];
    }

    if (localPurchases.length === 0) {
      await this.generateAutoSuggestions();
    }
    return [...localPurchases];
  },

  async generateAutoSuggestions(): Promise<PurchaseListItem[]> {
    const materials = await inventoryService.getRawMaterials();
    const lowStock = inventoryService.getLowStockAlerts(materials);

    const generated: PurchaseListItem[] = lowStock.map(mat => {
      // Sugerencia: reponer hasta superar el doble del mínimo
      const targetStock = mat.min_stock * 2;
      const suggested = Math.max(0, targetStock - mat.current_stock);

      return {
        id: 'pur-' + mat.id,
        raw_material_id: mat.id,
        item_name: mat.name + ' (' + mat.code + ')',
        quantity_suggested: suggested,
        quantity_to_buy: suggested,
        unit: mat.unit,
        is_purchased: false,
        notes: `Alerta: Stock actual (${mat.current_stock} ${mat.unit}) <= Mínimo (${mat.min_stock} ${mat.unit})`
      };
    });

    if (isSupabaseConfigured && supabase) {
      for (const item of generated) {
        await supabase
          .from('purchase_list_items')
          .upsert([{
            raw_material_id: item.raw_material_id,
            item_name: item.item_name,
            quantity_suggested: item.quantity_suggested,
            quantity_to_buy: item.quantity_to_buy,
            unit: item.unit,
            notes: item.notes
          }], { onConflict: 'raw_material_id' });
      }
      return this.getPurchaseList();
    }

    // Merge con locales
    for (const gen of generated) {
      const exists = localPurchases.find(p => p.raw_material_id === gen.raw_material_id);
      if (!exists) {
        localPurchases.push(gen);
      }
    }
    return [...localPurchases];
  },

  async updateItem(id: string, updates: Partial<PurchaseListItem>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('purchase_list_items')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      return;
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
