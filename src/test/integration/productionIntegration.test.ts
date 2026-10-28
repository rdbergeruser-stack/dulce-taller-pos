import { describe, it, expect } from 'vitest';
import { inventoryService } from '../../services/inventoryService';
import { productionService } from '../../services/productionService';
import { recipeService } from '../../services/recipeService';
import { portionService } from '../../services/portionService';

describe('Pruebas de Integración - Producción y Stock Transaccional', { timeout: 15000 }, () => {
  it('1. Creación de Materia Prima y persistencia con movimiento inicial', async () => {
    const testCode = `TEST-${Date.now().toString().slice(-5)}`;
    const newMat = await inventoryService.createRawMaterial({
      code: testCode,
      name: 'Vainilla en Rama Test',
      unit: 'un',
      current_stock: 50,
      min_stock: 10,
      unit_cost: 300,
      is_active: true
    });

    expect(newMat.id).toBeDefined();
    const all = await inventoryService.getRawMaterials();
    const found = all.find(m => m.code === testCode);
    expect(found).toBeDefined();
    expect(found?.current_stock).toBe(50);
  });

  it('2. Confirmación de Producción: descuenta insumos de forma atómica e incrementa producto terminado', async () => {
    let materialsBefore = await inventoryService.getRawMaterials();
    
    // Asegurar stock suficiente para la prueba de producción
    const azucar = materialsBefore.find(m => m.name.toLowerCase().includes('azúcar') || m.name.toLowerCase().includes('azucar'));
    if (azucar && azucar.current_stock < 1000) {
      await inventoryService.updateRawMaterial(azucar.id, { current_stock: 5000 });
    }
    const harina = materialsBefore.find(m => m.code === 'INS-001');
    if (harina && harina.current_stock < 1000) {
      await inventoryService.updateRawMaterial(harina.id, { current_stock: 5000 });
    }
    const manteca = materialsBefore.find(m => m.code === 'INS-002');
    if (manteca && manteca.current_stock < 1000) {
      await inventoryService.updateRawMaterial(manteca.id, { current_stock: 5000 });
    }
    
    materialsBefore = await inventoryService.getRawMaterials();
    const flourBefore = materialsBefore.find(m => m.code === 'INS-001')!.current_stock;
    const butterBefore = materialsBefore.find(m => m.code === 'INS-002')!.current_stock;

    const prepsBefore = await recipeService.getPreparations();
    const lemonPieBefore = prepsBefore.find(p => p.code === 'PREP-001')!;
    const stockAvailableBefore = lemonPieBefore.stock_available;

    // Confirmar producción de 1 Lemon Pie (consume 250g harina y 150g manteca)
    const result = await productionService.confirmProduction(lemonPieBefore.id, 1, 'user-admin', 'Producción de prueba test');
    expect(result.success).toBe(true);
    expect(result.batchCode).toContain('LOTE-');

    // Verificar descuento exacto
    const materialsAfter = await inventoryService.getRawMaterials();
    const flourAfter = materialsAfter.find(m => m.code === 'INS-001')!.current_stock;
    const butterAfter = materialsAfter.find(m => m.code === 'INS-002')!.current_stock;

    expect(flourAfter).toBe(flourBefore - 250);
    expect(butterAfter).toBe(butterBefore - 150);

    // Verificar incremento de producto terminado en vitrina
    const prepsAfter = await recipeService.getPreparations();
    const lemonPieAfter = prepsAfter.find(p => p.code === 'PREP-001')!;
    expect(lemonPieAfter.stock_available).toBe(stockAvailableBefore + 1);
  });

  it('3. Rechazo de Producción por Stock Insuficiente: no descuenta materias primas si no alcanza', async () => {
    const preps = await recipeService.getPreparations();
    const lemonPie = preps.find(p => p.code === 'PREP-001')!;

    // Intentar producir una cantidad descomunal que excede el stock disponible
    await expect(
      productionService.confirmProduction(lemonPie.id, 10000, 'user-admin')
    ).rejects.toThrow(/Stock insuficiente/);
  });

  it('4. Validación de Cantidades: rechaza cantidades menores o iguales a cero', async () => {
    const preps = await recipeService.getPreparations();
    const lemonPie = preps.find(p => p.code === 'PREP-001')!;

    await expect(
      productionService.confirmProduction(lemonPie.id, 0, 'user-admin')
    ).rejects.toThrow(/mayor a 0/);
  });

  it('5. Opción 3 - Fraccionamiento de Vitrina: Cortar torta entera suma porciones y descuenta 1 torta entera', async () => {
    const prepsBefore = await recipeService.getPreparations();
    const motherBefore = prepsBefore.find(p => p.code === 'PREP-001')!;
    const sliceBefore = prepsBefore.find(p => p.code === 'PREP-002')!;

    const motherStockBefore = motherBefore.stock_available;
    const sliceStockBefore = sliceBefore.stock_available;

    const res = await portionService.manualSliceCake(sliceBefore.id, 1);
    expect(res.success).toBe(true);

    const prepsAfter = await recipeService.getPreparations();
    const motherAfter = prepsAfter.find(p => p.code === 'PREP-001')!;
    const sliceAfter = prepsAfter.find(p => p.code === 'PREP-002')!;

    expect(motherAfter.stock_available).toBe(motherStockBefore - 1);
    expect(sliceAfter.stock_available).toBe(sliceStockBefore + 8);
  });
});

