import { Preparation, PreparationIngredient, RawMaterial } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_PREPARATIONS, INITIAL_RECIPES } from '../data/mockData';

let localPreps: Preparation[] = [...INITIAL_PREPARATIONS];
let localRecipes: PreparationIngredient[] = [...INITIAL_RECIPES];

export const recipeService = {
  async getPreparations(): Promise<Preparation[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('preparations')
        .select('*')
        .order('name');
      if (error) throw error;
      return ((data || []) as Preparation[]).filter(
        (p: any) => p.code !== 'PREP-020' && p.category !== 'taller' && !p.name?.toLowerCase().includes('taller')
      );
    }
    return [...localPreps].filter(
      (p: any) => p.code !== 'PREP-020' && p.category !== 'taller' && !p.name?.toLowerCase().includes('taller')
    );
  },

  async createPreparation(prep: Omit<Preparation, 'id'>): Promise<Preparation> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('preparations')
        .insert([prep])
        .select()
        .single();
      if (error) throw error;
      return data as Preparation;
    }
    const newPrep: Preparation = {
      ...prep,
      id: 'p-' + Date.now(),
      created_at: new Date().toISOString()
    };
    localPreps.push(newPrep);
    return newPrep;
  },

  async updatePreparation(id: string, updates: Partial<Preparation>): Promise<Preparation> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('preparations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Preparation;
    }
    const idx = localPreps.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Preparación no encontrada');
    localPreps[idx] = { ...localPreps[idx], ...updates, updated_at: new Date().toISOString() };
    return localPreps[idx];
  },

  async deletePreparation(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('order_items').delete().eq('preparation_id', id);
      await supabase.from('production_records').delete().eq('preparation_id', id);
      await supabase.from('stock_movements').delete().eq('preparation_id', id);
      await supabase.from('preparation_ingredients').delete().eq('preparation_id', id);
      const { error } = await supabase.from('preparations').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    localPreps = localPreps.filter(p => p.id !== id);
    localRecipes = localRecipes.filter(r => r.preparation_id !== id);
  },

  async getRecipe(preparationId: string): Promise<PreparationIngredient[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('preparation_ingredients')
        .select('*, raw_materials(*)')
        .eq('preparation_id', preparationId);
      if (error) throw error;
      return data as PreparationIngredient[];
    }
    return localRecipes.filter(r => r.preparation_id === preparationId);
  },

  async saveRecipe(preparationId: string, ingredients: { raw_material_id: string; quantity_required: number; unit: string }[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      // Eliminar ingredientes existentes y reinsertar
      await supabase.from('preparation_ingredients').delete().eq('preparation_id', preparationId);
      if (ingredients.length > 0) {
        const payload = ingredients.map(ing => ({
          preparation_id: preparationId,
          raw_material_id: ing.raw_material_id,
          quantity_required: ing.quantity_required,
          unit: ing.unit
        }));
        const { error } = await supabase.from('preparation_ingredients').insert(payload);
        if (error) throw error;
      }
      return;
    }

    localRecipes = localRecipes.filter(r => r.preparation_id !== preparationId);
    for (const ing of ingredients) {
      localRecipes.push({
        id: 'pi-' + Date.now() + Math.random(),
        preparation_id: preparationId,
        raw_material_id: ing.raw_material_id,
        quantity_required: ing.quantity_required,
        unit: ing.unit
      });
    }
  },

  calculateRecipeCost(recipe: PreparationIngredient[], materials: RawMaterial[]): number {
    return recipe.reduce((acc, ing) => {
      const mat = materials.find(m => m.id === ing.raw_material_id);
      if (!mat) return acc;
      return acc + (ing.quantity_required * mat.unit_cost);
    }, 0);
  }
};

