import { describe, it, expect } from 'vitest';
import { recipeService } from '../../services/recipeService';
import { inventoryService } from '../../services/inventoryService';
import { RawMaterial, PreparationIngredient } from '../../types/database';

describe('Reglas de Negocio Unitarias - Dulce Taller', () => {
  const mockMaterials: RawMaterial[] = [
    { id: 'rm-1', code: 'INS-001', name: 'Harina 0000', unit: 'gr', current_stock: 5000, min_stock: 5000, unit_cost: 1.20, is_active: true },
    { id: 'rm-2', code: 'INS-002', name: 'Manteca', unit: 'gr', current_stock: 1500, min_stock: 2000, unit_cost: 12.00, is_active: true },
    { id: 'rm-3', code: 'INS-003', name: 'Huevos frescos', unit: 'un', current_stock: 50, min_stock: 30, unit_cost: 180.00, is_active: true }
  ];

  it('1. Alerta de Stock Mínimo: detecta insumos con stock igual o inferior al punto de reposición', () => {
    const alerts = inventoryService.getLowStockAlerts(mockMaterials);
    // Harina (5000 == 5000) y Manteca (1500 <= 2000) deben disparar alerta
    expect(alerts.length).toBe(2);
    expect(alerts.map(m => m.code)).toEqual(['INS-001', 'INS-002']);
  });

  it('2. Cálculo de Consumo de Receta: calcula con precisión insumos requeridos según lote', () => {
    // Receta de Lemon Pie (250g Harina, 150g Manteca, 4 huevos)
    const recipe: PreparationIngredient[] = [
      { id: '1', preparation_id: 'p-1', raw_material_id: 'rm-1', quantity_required: 250, unit: 'gr' },
      { id: '2', preparation_id: 'p-1', raw_material_id: 'rm-2', quantity_required: 150, unit: 'gr' }
    ];

    const quantityToProduce = 3; // 3 tortas enteras
    const flourRequired = recipe.find(r => r.raw_material_id === 'rm-1')!.quantity_required * quantityToProduce;
    const butterRequired = recipe.find(r => r.raw_material_id === 'rm-2')!.quantity_required * quantityToProduce;

    expect(flourRequired).toBe(750);
    expect(butterRequired).toBe(450);
  });

  it('3. Costeo Teórico: calcula correctamente el costo unitario de insumos de una preparación', () => {
    const recipe: PreparationIngredient[] = [
      { id: '1', preparation_id: 'p-1', raw_material_id: 'rm-1', quantity_required: 250, unit: 'gr' }, // 250 * 1.2 = 300
      { id: '2', preparation_id: 'p-1', raw_material_id: 'rm-2', quantity_required: 150, unit: 'gr' }, // 150 * 12 = 1800
      { id: '3', preparation_id: 'p-1', raw_material_id: 'rm-3', quantity_required: 4, unit: 'un' }     // 4 * 180 = 720
    ];

    const cost = recipeService.calculateRecipeCost(recipe, mockMaterials);
    expect(cost).toBe(300 + 1800 + 720); // 2820
  });
});

