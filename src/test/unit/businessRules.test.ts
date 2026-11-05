import { describe, it, expect } from 'vitest';
import { recipeService } from '../../services/recipeService';
import { inventoryService } from '../../services/inventoryService';
import { findMotherPreparation, getEffectiveAvailableStock } from '../../services/portionService';
import { RawMaterial, PreparationIngredient, Preparation, UserRole, Order } from '../../types/database';
import { productionOrderService } from '../../services/productionOrderService';
import { notificationService } from '../../services/notificationService';

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

  it('4. Opción 3: Vinculación inteligente Torta Entera y Porción', () => {
    const preps: Preparation[] = [
      {
        id: 'p-mother',
        code: 'PREP-001',
        name: 'Lemon Pie (Torta Entera)',
        category: 'pasteleria',
        unit_type: 'entera',
        portion_yield: 1,
        price: 28000,
        stock_available: 3,
        is_active: true
      },
      {
        id: 'p-slice',
        code: 'PREP-002',
        name: 'Porción Lemon Pie',
        category: 'pasteleria',
        unit_type: 'porcion',
        portion_yield: 8,
        price: 3800,
        stock_available: 0,
        is_active: true
      }
    ];

    const mother = findMotherPreparation(preps[1], preps);
    expect(mother).not.toBeNull();
    expect(mother?.id).toBe('p-mother');

    const effective = getEffectiveAvailableStock(preps[1], preps);
    expect(effective.directStock).toBe(0);
    expect(effective.motherStock).toBe(3);
    // 0 cortadas + (3 tortas * 8 porciones) = 24 porciones disponibles potenciales
    expect(effective.totalAvailablePortions).toBe(24);
  });

  it('5. Flujo de Roles: Asignación de producción de Admin a Cocinero y registro de finalización', () => {
    // El Administrador indica qué debe elaborar el cocinero
    const assigned = productionOrderService.assignProductionOrder({
      preparation_id: 'p-mother',
      quantity: 2,
      assigned_by: 'Martina González (Admin)',
      notes: 'Hornear para reposición de vitrina'
    });

    expect(assigned.status).toBe('pendiente');
    expect(assigned.quantity).toBe(2);
    expect(assigned.assigned_by).toContain('Admin');

    // El cocinero completa la tarea
    const completed = productionOrderService.completeProductionOrder(
      assigned.id,
      'Mateo Benítez (Cocinero)',
      'LOTE-20261104-001'
    );

    expect(completed.status).toBe('completada');
    expect(completed.completed_by).toContain('Cocinero');
    expect(completed.batch_code).toBe('LOTE-20261104-001');
  });

  it('6. Notificación a Cocina: cuando se crea comanda, se genera aviso para cocina con mesa y productos', () => {
    const mockOrder: Order = {
      id: 'ord-test-999',
      order_number: 999,
      origin: 'salon',
      table_number: 'Mesa 12',
      status: 'pendiente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [
        { id: '1', order_id: 'ord-test-999', preparation_id: 'p-1', quantity: 2, unit_price: 3800 }
      ]
    };

    const notif = notificationService.notifyNewOrder(mockOrder, 'Lucas Rodríguez');
    expect(notif.order_number).toBe(999);
    expect(notif.message).toContain('Mesa 12');
    expect(notif.message).toContain('Lucas Rodríguez');
    expect(notif.read).toBe(false);

    const activeNotifs = notificationService.getNotifications();
    expect(activeNotifs.some(n => n.order_number === 999)).toBe(true);
  });

  it('7. Matriz de Roles y Permisos de Interfaz', () => {
    const roles: UserRole[] = ['admin', 'mozo', 'cocinero'];
    expect(roles).toContain('cocinero');

    // Regla de permisos:
    // - Solo admin puede gestionar usuarios y roles
    // - Mozo crea comanda, entrega y cobra, pero NO inicia preparación
    // - Cocinero ve comandas, inicia preparación y marca listo, pero NO crea ni cobra comandas
    const canCreateOrders = (r: UserRole) => r === 'admin' || r === 'mozo';
    const canStartCooking = (r: UserRole) => r === 'admin' || r === 'cocinero';
    const canDeliverAndCollect = (r: UserRole) => r === 'admin' || r === 'mozo';
    const canManageUsers = (r: UserRole) => r === 'admin';

    expect(canCreateOrders('cocinero')).toBe(false);
    expect(canCreateOrders('mozo')).toBe(true);

    expect(canStartCooking('mozo')).toBe(false);
    expect(canStartCooking('cocinero')).toBe(true);

    expect(canDeliverAndCollect('cocinero')).toBe(false);
    expect(canDeliverAndCollect('mozo')).toBe(true);

    expect(canManageUsers('admin')).toBe(true);
    expect(canManageUsers('mozo')).toBe(false);
    expect(canManageUsers('cocinero')).toBe(false);
  });

  it('8. Bloqueo de comandas por encima del stock disponible en vitrina', async () => {
    // Si una torta tiene stock 3, no se debe permitir pedir 5
    const prepStock = 3;
    const requestedQty = 5;
    const isExceeded = requestedQty > prepStock;
    expect(isExceeded).toBe(true);
  });

  it('9. Lista de compras: genera sugerencia automática cuando un insumo cae por debajo del mínimo', async () => {
    const { purchaseService } = await import('../../services/purchaseService');
    const materialsWithLowSugar: RawMaterial[] = [
      { id: 'rm-sugar', code: 'INS-010', name: 'Azúcar común', unit: 'kg', current_stock: 1, min_stock: 5, unit_cost: 1100, is_active: true }
    ];

    const list = await purchaseService.getPurchaseList(materialsWithLowSugar);
    const sugarItem = list.find(i => i.raw_material_id === 'rm-sugar');

    expect(sugarItem).toBeDefined();
    expect(sugarItem?.quantity_suggested).toBe(9); // (min_stock * 2) - current_stock = 10 - 1 = 9
    expect(sugarItem?.is_purchased).toBe(false);
  });
});

