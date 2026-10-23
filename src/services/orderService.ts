import { Order, OrderItem, OrderStatus } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_ORDERS } from '../data/mockData';
import { recipeService } from './recipeService';

let localOrders: Order[] = [...INITIAL_ORDERS];

export const orderService = {
  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, preparations(*))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((o: any) => ({
        ...o,
        items: o.order_items || []
      })) as Order[];
    }
    return [...localOrders];
  },

  async createOrder(
    orderData: { origin: 'salon' | 'takeaway' | 'taller'; table_number?: string; notes?: string },
    items: { preparation_id: string; quantity: number; unit_price: number; notes?: string }[],
    userId?: string
  ): Promise<Order> {
    if (items.length === 0) {
      throw new Error('La comanda debe contener al menos un producto.');
    }

    const isValidUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    if (isSupabaseConfigured && supabase) {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([{
          origin: orderData.origin,
          table_number: orderData.table_number || null,
          notes: orderData.notes || null,
          status: 'pendiente',
          created_by: isValidUuid ? userId : null
        }])
        .select()
        .single();

      if (orderErr) throw orderErr;

      const orderItems = items.map(item => ({
        order_id: order.id,
        preparation_id: item.preparation_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.notes || null
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      return {
        ...order,
        items: orderItems as OrderItem[]
      } as Order;
    }

    const newOrderNumber = localOrders.length > 0 ? Math.max(...localOrders.map(o => o.order_number)) + 1 : 101;
    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      order_number: newOrderNumber,
      origin: orderData.origin,
      table_number: orderData.table_number || (orderData.origin === 'salon' ? 'Mesa 1' : 'Mostrador'),
      status: 'pendiente',
      notes: orderData.notes,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: items.map((it, idx) => ({
        id: 'oi-' + Date.now() + '-' + idx,
        order_id: 'ord-' + Date.now(),
        preparation_id: it.preparation_id,
        quantity: it.quantity,
        unit_price: it.unit_price,
        notes: it.notes
      }))
    };

    localOrders.unshift(newOrder);
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, userId?: string): Promise<Order> {
    if (isSupabaseConfigured && supabase) {
      const isValidUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      if (status === 'entregada') {
        const { error } = await supabase.rpc('dispatch_order', {
          p_order_id: orderId,
          p_user_id: isValidUuid ? userId : null
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', orderId);
        if (error) throw error;
      }

      const { data: updated } = await supabase
        .from('orders')
        .select('*, order_items(*, preparations(*))')
        .eq('id', orderId)
        .single();
      return updated as Order;
    }

    const index = localOrders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Comanda no encontrada');

    const order = localOrders[index];

    // Si se pasa a entregada, descontar del stock de productos elaborados en vitrina
    if (status === 'entregada' && order.status !== 'entregada') {
      const preps = await recipeService.getPreparations();
      if (order.items) {
        for (const item of order.items) {
          const prep = preps.find(p => p.id === item.preparation_id);
          if (prep) {
            const newStock = Math.max(0, (prep.stock_available || 0) - item.quantity);
            await recipeService.updatePreparation(item.preparation_id, {
              stock_available: newStock
            });
          }
        }
      }
    }

    localOrders[index] = {
      ...order,
      status,
      updated_at: new Date().toISOString()
    };

    return localOrders[index];
  }
};
