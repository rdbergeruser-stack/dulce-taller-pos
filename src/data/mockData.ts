import { RawMaterial, Preparation, PreparationIngredient, Order, StockMovement } from '../types/database';

export const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  { id: 'rm-1', code: 'INS-001', name: 'Harina 0000', unit: 'gr', current_stock: 15000, min_stock: 5000, unit_cost: 1.20, is_active: true },
  { id: 'rm-2', code: 'INS-002', name: 'Manteca', unit: 'gr', current_stock: 8000, min_stock: 2000, unit_cost: 12.00, is_active: true },
  { id: 'rm-3', code: 'INS-003', name: 'Huevos frescos', unit: 'un', current_stock: 120, min_stock: 30, unit_cost: 180.00, is_active: true },
  { id: 'rm-4', code: 'INS-004', name: 'Jugo de Limón natural', unit: 'ml', current_stock: 5000, min_stock: 1000, unit_cost: 4.00, is_active: true },
  { id: 'rm-5', code: 'INS-005', name: 'Azúcar blanca', unit: 'gr', current_stock: 12000, min_stock: 4000, unit_cost: 1.50, is_active: true },
  { id: 'rm-6', code: 'INS-006', name: 'Leche Condensada', unit: 'gr', current_stock: 10000, min_stock: 2500, unit_cost: 6.00, is_active: true },
  { id: 'rm-15', code: 'INS-007', name: 'Frutillas frescas', unit: 'gr', current_stock: 5000, min_stock: 1500, unit_cost: 6.00, is_active: true },
  { id: 'rm-16', code: 'INS-008', name: 'Crema de leche', unit: 'ml', current_stock: 4000, min_stock: 1200, unit_cost: 7.50, is_active: true },
  { id: 'rm-17', code: 'INS-009', name: 'Gelatina sin sabor / Brillo', unit: 'gr', current_stock: 1000, min_stock: 200, unit_cost: 12.00, is_active: true },
  { id: 'rm-7', code: 'INS-010', name: 'Café de especialidad en grano', unit: 'gr', current_stock: 4000, min_stock: 1000, unit_cost: 25.00, is_active: true },
  { id: 'rm-8', code: 'INS-011', name: 'Leche entera / vegetal', unit: 'ml', current_stock: 15000, min_stock: 3000, unit_cost: 1.30, is_active: true },
  { id: 'rm-9', code: 'INS-012', name: 'Cacao en polvo (Decoración)', unit: 'gr', current_stock: 1000, min_stock: 200, unit_cost: 15.00, is_active: true },
  { id: 'rm-10', code: 'INS-013', name: 'Servilleta / Kit mesa', unit: 'un', current_stock: 500, min_stock: 100, unit_cost: 10.00, is_active: true },
  { id: 'rm-14', code: 'INS-023', name: 'Caja Take-Away / Embalaje especial', unit: 'un', current_stock: 80, min_stock: 25, unit_cost: 450.00, is_active: true }
];

export const INITIAL_PREPARATIONS: Preparation[] = [
  {
    id: 'p-1',
    code: 'PREP-001',
    name: 'Lemon Pie (Torta Entera)',
    category: 'pasteleria',
    description: 'Torta entera clásica de 8 porciones con base crocante y merengue italiano.',
    unit_type: 'entera',
    portion_yield: 1.0,
    price: 28000.00,
    stock_available: 4,
    is_active: true
  },
  {
    id: 'p-2',
    code: 'PREP-002',
    name: 'Porción Lemon Pie',
    category: 'pasteleria',
    description: 'Porción individual (1/8 de torta entera). Descuenta 0.125 de stock terminado.',
    unit_type: 'porcion',
    portion_yield: 8.0,
    price: 3800.00,
    stock_available: 16,
    is_active: true
  },
  {
    id: 'p-3',
    code: 'PREP-010',
    name: 'Café Capuccino',
    category: 'cafeteria',
    description: 'Café de especialidad doble shot con leche texturizada y cacao amargo.',
    unit_type: 'taza',
    portion_yield: 1.0,
    price: 2900.00,
    stock_available: 50,
    is_active: true
  }
];

export const INITIAL_RECIPES: PreparationIngredient[] = [
  // Lemon Pie (Torta entera)
  { id: 'pi-1', preparation_id: 'p-1', raw_material_id: 'rm-1', quantity_required: 250, unit: 'gr' },
  { id: 'pi-2', preparation_id: 'p-1', raw_material_id: 'rm-2', quantity_required: 150, unit: 'gr' },
  { id: 'pi-3', preparation_id: 'p-1', raw_material_id: 'rm-3', quantity_required: 4, unit: 'un' },
  { id: 'pi-4', preparation_id: 'p-1', raw_material_id: 'rm-4', quantity_required: 150, unit: 'ml' },
  { id: 'pi-5', preparation_id: 'p-1', raw_material_id: 'rm-5', quantity_required: 300, unit: 'gr' },
  { id: 'pi-6', preparation_id: 'p-1', raw_material_id: 'rm-6', quantity_required: 395, unit: 'gr' },
  
  // Café Capuccino
  { id: 'pi-7', preparation_id: 'p-3', raw_material_id: 'rm-7', quantity_required: 18, unit: 'gr' },
  { id: 'pi-8', preparation_id: 'p-3', raw_material_id: 'rm-8', quantity_required: 180, unit: 'ml' },
  { id: 'pi-9', preparation_id: 'p-3', raw_material_id: 'rm-9', quantity_required: 3, unit: 'gr' },
  { id: 'pi-10', preparation_id: 'p-3', raw_material_id: 'rm-10', quantity_required: 2, unit: 'un' }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    order_number: 101,
    origin: 'salon',
    table_number: 'Mesa 4',
    status: 'en_preparacion',
    notes: 'Capuccino con leche bien caliente. Porción de Lemon Pie con merengue extra dorado.',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
    items: [
      { id: 'oi-1', order_id: 'ord-101', preparation_id: 'p-2', quantity: 2, unit_price: 3800.00 },
      { id: 'oi-2', order_id: 'ord-101', preparation_id: 'p-3', quantity: 2, unit_price: 2900.00 }
    ]
  },
  {
    id: 'ord-102',
    order_number: 102,
    origin: 'takeaway',
    table_number: 'Mostrador',
    status: 'pendiente',
    notes: 'Para llevar en caja protegida.',
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
    items: [
      { id: 'oi-3', order_id: 'ord-102', preparation_id: 'p-1', quantity: 1, unit_price: 28000.00 }
    ]
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    raw_material_id: 'rm-1',
    movement_type: 'entrada',
    quantity: 15000,
    previous_stock: 0,
    new_stock: 15000,
    reason: 'Ingreso inicial por compra a proveedor Molino Cañuelas',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'mov-2',
    raw_material_id: 'rm-2',
    movement_type: 'entrada',
    quantity: 8000,
    previous_stock: 0,
    new_stock: 8000,
    reason: 'Ingreso inicial Manteca La Serenísima',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];
