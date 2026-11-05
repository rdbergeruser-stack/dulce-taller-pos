export type UserRole = 'admin' | 'mozo' | 'cocinero';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface ProductionOrder {
  id: string;
  preparation_id: string;
  quantity: number;
  notes?: string;
  status: 'pendiente' | 'completada' | 'cancelada';
  assigned_by: string;
  assigned_at: string;
  completed_by?: string;
  completed_at?: string;
  batch_code?: string;
  preparation?: Preparation;
}

export interface ProductionRequest {
  id: string;
  preparation_id: string;
  preparation_name: string;
  unit_type: string;
  current_stock: number;
  requested_by: string;
  requested_at: string;
  status: 'pendiente' | 'autorizada';
}

export interface KitchenNotification {
  id: string;
  type: 'new_order' | 'kitchen_alert';
  title: string;
  message: string;
  order_id?: string;
  order_number?: number;
  table_number?: string;
  created_at: string;
  read: boolean;
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

export type PreparationCategory = 'pasteleria' | 'cafeteria';
export type PreparationUnitType = 'porcion' | 'entera' | 'taza';

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

export type OrderOrigin = 'salon' | 'takeaway';
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

