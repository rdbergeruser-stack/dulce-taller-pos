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
  { id: 'rm-18', code: 'INS-014', name: 'Chocolate cobertura semiamargo 70%', unit: 'gr', current_stock: 8000, min_stock: 2000, unit_cost: 16.00, is_active: true },
  { id: 'rm-19', code: 'INS-015', name: 'Almendras tostadas', unit: 'gr', current_stock: 3000, min_stock: 800, unit_cost: 22.00, is_active: true },
  { id: 'rm-20', code: 'INS-016', name: 'Chips de chocolate belga', unit: 'gr', current_stock: 5000, min_stock: 1200, unit_cost: 18.00, is_active: true },
  { id: 'rm-21', code: 'INS-017', name: 'Esencia de vainilla natural', unit: 'ml', current_stock: 1000, min_stock: 200, unit_cost: 8.00, is_active: true },
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
    id: 'p-6',
    code: 'PREP-005',
    name: 'Brownie Húmedo de Chocolate (Placa Entera)',
    category: 'pasteleria',
    description: 'Placa entera artesanal de puro chocolate 70% con fina costra crujiente de almendras tostadas (rinde 16 porciones).',
    unit_type: 'entera',
    portion_yield: 1.0,
    price: 45000.00,
    stock_available: 0,
    is_active: true
  },
  {
    id: 'p-7',
    code: 'PREP-006',
    name: 'Porción Brownie Húmedo de Chocolate',
    category: 'pasteleria',
    description: 'Cuadrado de puro chocolate intenso con fina costra crujiente de almendras. Porción individual (1/16 de placa entera). [TORTA_MADRE:PREP-005]',
    unit_type: 'porcion',
    portion_yield: 16.0,
    price: 3600.00,
    stock_available: 16,
    is_active: true
  },
  {
    id: 'p-8',
    code: 'PREP-007',
    name: 'Cookies Estilo Americano',
    category: 'pasteleria',
    description: 'Galletas horneadas en el día con chips de chocolate belga y manteca noisette. Venta por unidad (lote de horneado rinde 6 unidades).',
    unit_type: 'unidad',
    portion_yield: 6.0,
    price: 2400.00,
    stock_available: 18,
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
  },
  {
    id: 'p-4',
    code: 'PREP-011',
    name: 'Chocolate Caliente',
    category: 'cafeteria',
    description: 'Ganache de cacao puro fundida lentamente en leche texturizada con canela y vainilla.',
    unit_type: 'taza',
    portion_yield: 1.0,
    price: 3200.00,
    stock_available: 25,
    is_active: true
  },
  {
    id: 'p-5',
    code: 'PREP-012',
    name: 'Café Latte',
    category: 'cafeteria',
    description: 'Nuestro blend de la casa emulsionado con microespuma de leche sedosa.',
    unit_type: 'taza',
    portion_yield: 1.0,
    price: 2900.00,
    stock_available: 40,
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

  // Brownie Húmedo de Chocolate (Placa entera - rinde 16 porciones)
  { id: 'pi-19', preparation_id: 'p-6', raw_material_id: 'rm-1', quantity_required: 150, unit: 'gr' },
  { id: 'pi-20', preparation_id: 'p-6', raw_material_id: 'rm-2', quantity_required: 220, unit: 'gr' },
  { id: 'pi-21', preparation_id: 'p-6', raw_material_id: 'rm-3', quantity_required: 4, unit: 'un' },
  { id: 'pi-22', preparation_id: 'p-6', raw_material_id: 'rm-5', quantity_required: 320, unit: 'gr' },
  { id: 'pi-23', preparation_id: 'p-6', raw_material_id: 'rm-18', quantity_required: 350, unit: 'gr' },
  { id: 'pi-24', preparation_id: 'p-6', raw_material_id: 'rm-9', quantity_required: 30, unit: 'gr' },
  { id: 'pi-25', preparation_id: 'p-6', raw_material_id: 'rm-19', quantity_required: 80, unit: 'gr' },
  { id: 'pi-26', preparation_id: 'p-6', raw_material_id: 'rm-21', quantity_required: 5, unit: 'ml' },

  // Cookies Estilo Americano (Lote de 6 cookies horneadas)
  { id: 'pi-27', preparation_id: 'p-8', raw_material_id: 'rm-1', quantity_required: 180, unit: 'gr' },
  { id: 'pi-28', preparation_id: 'p-8', raw_material_id: 'rm-2', quantity_required: 110, unit: 'gr' },
  { id: 'pi-29', preparation_id: 'p-8', raw_material_id: 'rm-5', quantity_required: 120, unit: 'gr' },
  { id: 'pi-30', preparation_id: 'p-8', raw_material_id: 'rm-3', quantity_required: 1, unit: 'un' },
  { id: 'pi-31', preparation_id: 'p-8', raw_material_id: 'rm-20', quantity_required: 100, unit: 'gr' },
  { id: 'pi-32', preparation_id: 'p-8', raw_material_id: 'rm-21', quantity_required: 5, unit: 'ml' },
  
  // Café Capuccino
  { id: 'pi-7', preparation_id: 'p-3', raw_material_id: 'rm-7', quantity_required: 18, unit: 'gr' },
  { id: 'pi-8', preparation_id: 'p-3', raw_material_id: 'rm-8', quantity_required: 180, unit: 'ml' },
  { id: 'pi-9', preparation_id: 'p-3', raw_material_id: 'rm-9', quantity_required: 3, unit: 'gr' },
  { id: 'pi-10', preparation_id: 'p-3', raw_material_id: 'rm-10', quantity_required: 2, unit: 'un' },

  // Chocolate Caliente
  { id: 'pi-11', preparation_id: 'p-4', raw_material_id: 'rm-8', quantity_required: 200, unit: 'ml' },
  { id: 'pi-12', preparation_id: 'p-4', raw_material_id: 'rm-18', quantity_required: 45, unit: 'gr' },
  { id: 'pi-13', preparation_id: 'p-4', raw_material_id: 'rm-5', quantity_required: 15, unit: 'gr' },
  { id: 'pi-14', preparation_id: 'p-4', raw_material_id: 'rm-9', quantity_required: 3, unit: 'gr' },
  { id: 'pi-15', preparation_id: 'p-4', raw_material_id: 'rm-10', quantity_required: 1, unit: 'un' },

  // Café Latte
  { id: 'pi-16', preparation_id: 'p-5', raw_material_id: 'rm-7', quantity_required: 18, unit: 'gr' },
  { id: 'pi-17', preparation_id: 'p-5', raw_material_id: 'rm-8', quantity_required: 220, unit: 'ml' },
  { id: 'pi-18', preparation_id: 'p-5', raw_material_id: 'rm-10', quantity_required: 1, unit: 'un' }
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
