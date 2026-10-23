import { ProductionRecord, RawMaterial } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { recipeService } from './recipeService';
import { inventoryService } from './inventoryService';

export interface ProductionRequirementPreview {
  rawMaterial: RawMaterial;
  quantityRequired: number;
  availableStock: number;
  isSufficient: boolean;
}

export const productionService = {
  async getRequirementsPreview(
    preparationId: string,
    quantityToProduce: number,
    materials: RawMaterial[]
  ): Promise<{ requirements: ProductionRequirementPreview[]; canProduce: boolean }> {
    const recipe = await recipeService.getRecipe(preparationId);
    if (!recipe || recipe.length === 0) {
      return { requirements: [], canProduce: false };
    }

    let canProduce = true;
    const requirements: ProductionRequirementPreview[] = recipe.map(ing => {
      const mat = materials.find(m => m.id === ing.raw_material_id);
      const quantityRequired = ing.quantity_required * quantityToProduce;
      const availableStock = mat ? mat.current_stock : 0;
      const isSufficient = availableStock >= quantityRequired;

      if (!isSufficient) {
        canProduce = false;
      }

      return {
        rawMaterial: mat || {
          id: ing.raw_material_id,
          code: 'DESC',
          name: 'Insumo desconocido',
          unit: ing.unit as any,
          current_stock: 0,
          min_stock: 0,
          unit_cost: 0,
          is_active: true
        },
        quantityRequired,
        availableStock,
        isSufficient
      };
    });

    return { requirements, canProduce };
  },

  async confirmProduction(
    preparationId: string,
    quantityToProduce: number,
    userId?: string,
    notes?: string
  ): Promise<{ success: boolean; batchCode: string; message: string }> {
    if (quantityToProduce <= 0) {
      throw new Error('La cantidad a producir debe ser mayor a 0');
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('confirm_production_batch', {
        p_preparation_id: preparationId,
        p_quantity_produced: quantityToProduce,
        p_user_id: userId || null,
        p_notes: notes || null
      });

      if (error) {
        throw new Error(error.message || 'Error al confirmar la producción en Supabase.');
      }

      return {
        success: true,
        batchCode: data.batch_code,
        message: `Producción de ${quantityToProduce} unidades confirmada exitosamente.`
      };
    }

    // Modo local / demostrativo transaccional
    const materials = await inventoryService.getRawMaterials();
    const { requirements, canProduce } = await this.getRequirementsPreview(preparationId, quantityToProduce, materials);

    if (requirements.length === 0) {
      throw new Error('La preparación seleccionada no tiene receta configurada.');
    }

    if (!canProduce) {
      const missing = requirements
        .filter(r => !r.isSufficient)
        .map(r => `${r.rawMaterial.name} (faltan ${(r.quantityRequired - r.availableStock).toFixed(1)} ${r.rawMaterial.unit})`)
        .join(', ');
      throw new Error(`Stock insuficiente para producir. Insumos faltantes: ${missing}`);
    }

    const preps = await recipeService.getPreparations();
    const prep = preps.find(p => p.id === preparationId);
    if (!prep) throw new Error('Preparación no encontrada');

    const batchCode = `LOTE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${prep.code}`;

    // Descontar cada materia prima y registrar movimiento
    for (const req of requirements) {
      await inventoryService.updateRawMaterial(
        req.rawMaterial.id,
        { current_stock: req.availableStock - req.quantityRequired },
        userId,
        `Consumo por producción: ${quantityToProduce} un. de ${prep.name} (${batchCode})`
      );
    }

    // Incrementar stock terminado de la preparación
    await recipeService.updatePreparation(preparationId, {
      stock_available: (prep.stock_available || 0) + quantityToProduce
    });

    return {
      success: true,
      batchCode,
      message: `Producción registrada con éxito. Lote: ${batchCode}. Stock terminado actualizado.`
    };
  },

  async getProductionHistory(): Promise<ProductionRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('production_records')
        .select('*, preparations(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProductionRecord[];
    }
    return [];
  }
};

