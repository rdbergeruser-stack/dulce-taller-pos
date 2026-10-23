export type UserRole = 'admin' | 'mozo';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export type RawMaterialUnit = 'gr' | 'ml' | 'un' | 'kg' | 'lt';

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  unit: RawMaterialUnit;
  current_stock: number;
  min_stock: number;
  unit_cost: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type PreparationCategory = 'pasteleria' | 'cafeteria' | 'taller';
export type PreparationUnitType = 'porcion' | 'entera' | 'taza' | 'kit';

export interface Preparation {
  id: string;
  code: string;
  name: string;
  category: PreparationCategory;
  description?: string;
  unit_type: PreparationUnitType;
  portion_yield: number;
  price: number;
  stock_available: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PreparationIngredient {
  id: string;
  preparation_id: string;
  raw_material_id: string;
  quantity_required: number;
  unit: string;
  raw_material?: RawMaterial;
}

export interface ProductionRecord {
  id: string;
  preparation_id: string;
  quantity_produced: number;
  batch_code: string;
  notes?: string;
  produced_by?: string;
  created_at: string;
  preparation?: Preparation;
}

export type MovementType = 
  | 'entrada' 
  | 'ajuste' 
  | 'produccion_consumo' 
  | 'merma' 
  | 'venta_despacho';

export interface StockMovement {
  id: string;
  raw_material_id?: string;
  preparation_id?: string;
  movement_type: MovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  reference_id?: string;
  created_by?: string;
  created_at: string;
  raw_material?: RawMaterial;
  preparation?: Preparation;
}

export type OrderOrigin = 'salon' | 'takeaway' | 'taller';
export type OrderStatus = 'pendiente' | 'en_preparacion' | 'lista' | 'entregada' | 'cancelada';

export interface OrderItem {
  id: string;
  order_id: string;
  preparation_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  preparation?: Preparation;
}

export interface Order {
  id: string;
  order_number: number;
  origin: OrderOrigin;
  table_number?: string;
  status: OrderStatus;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface PurchaseListItem {
  id: string;
  raw_material_id?: string;
  item_name: string;
  quantity_suggested: number;
  quantity_to_buy: number;
  unit: string;
  is_purchased: boolean;
  notes?: string;
}

