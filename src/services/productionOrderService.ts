import { ProductionOrder, ProductionRequest } from '../types/database';

const STORAGE_KEY = 'dulce_taller_production_orders';
const REQUESTS_STORAGE_KEY = 'dulce_taller_production_requests';

const INITIAL_PRODUCTION_ORDERS: ProductionOrder[] = [
  {
    id: 'pord-1',
    preparation_id: 'p-1', // Lemon Pie (Torta Entera)
    quantity: 2,
    notes: 'Preparar 2 tortas enteras para reposición de vitrina de la tarde.',
    status: 'pendiente',
    assigned_by: 'Martina González (Administradora)',
    assigned_at: new Date(Date.now() - 30 * 60000).toISOString()
  }
];

export const productionOrderService = {
  getProductionOrders(): ProductionOrder[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fallback
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTION_ORDERS));
    return INITIAL_PRODUCTION_ORDERS;
  },

  assignProductionOrder(data: {
    preparation_id: string;
    quantity: number;
    assigned_by: string;
    notes?: string;
  }): ProductionOrder {
    const orders = this.getProductionOrders();
    const newOrder: ProductionOrder = {
      id: 'pord-' + Date.now(),
      preparation_id: data.preparation_id,
      quantity: Math.max(1, data.quantity),
      notes: data.notes?.trim() || undefined,
      status: 'pendiente',
      assigned_by: data.assigned_by,
      assigned_at: new Date().toISOString()
    };

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

    // Si había una solicitud pendiente de este producto, marcarla como atendida/autorizada
    this.markRequestAsAuthorized(data.preparation_id);

    return newOrder;
  },

  completeProductionOrder(id: string, completed_by: string, batch_code: string): ProductionOrder {
    const orders = this.getProductionOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) {
      throw new Error('Orden de producción no encontrada.');
    }

    orders[idx] = {
      ...orders[idx],
      status: 'completada',
      completed_by,
      completed_at: new Date().toISOString(),
      batch_code
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return orders[idx];
  },

  cancelProductionOrder(id: string): void {
    const orders = this.getProductionOrders();
    const filtered = orders.filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  // --- SOLICITUDES DE COCINERO A ADMINISTRACIÓN ---
  getProductionRequests(): ProductionRequest[] {
    const saved = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fallback
      }
    }
    return [];
  },

  createProductionRequest(data: {
    preparation_id: string;
    preparation_name: string;
    unit_type: string;
    current_stock: number;
    requested_by: string;
  }): ProductionRequest {
    const requests = this.getProductionRequests();
    
    // Evitar solicitudes duplicadas pendientes para el mismo producto
    const existing = requests.find(r => r.preparation_id === data.preparation_id && r.status === 'pendiente');
    if (existing) {
      return existing;
    }

    const newReq: ProductionRequest = {
      id: 'preq-' + Date.now(),
      preparation_id: data.preparation_id,
      preparation_name: data.preparation_name,
      unit_type: data.unit_type,
      current_stock: data.current_stock,
      requested_by: data.requested_by,
      requested_at: new Date().toISOString(),
      status: 'pendiente'
    };

    requests.unshift(newReq);
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
    return newReq;
  },

  isRequestPending(preparation_id: string): boolean {
    const requests = this.getProductionRequests();
    return requests.some(r => r.preparation_id === preparation_id && r.status === 'pendiente');
  },

  markRequestAsAuthorized(preparation_id: string): void {
    const requests = this.getProductionRequests();
    const updated = requests.map(r => 
      r.preparation_id === preparation_id && r.status === 'pendiente' 
        ? { ...r, status: 'autorizada' as const } 
        : r
    );
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(updated));
  }
};
