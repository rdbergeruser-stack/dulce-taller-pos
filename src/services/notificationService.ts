import { KitchenNotification, Order } from '../types/database';

const STORAGE_KEY = 'dulce_taller_kitchen_notifications';

type NotificationListener = (notifications: KitchenNotification[]) => void;
const listeners: Set<NotificationListener> = new Set();

// Sincronización entre pestañas del navegador mediante evento storage
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const notifs = JSON.parse(e.newValue);
        if (Array.isArray(notifs)) {
          listeners.forEach(fn => fn(notifs));
        }
      } catch {
        // Fallback
      }
    }
  });
}

export const notificationService = {
  getNotifications(): KitchenNotification[] {
    const saved = localStorage.getItem(STORAGE_KEY);
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

  notifyNewOrder(order: Order, createdByName?: string, currentRole?: string | null): KitchenNotification {
    const notifications = this.getNotifications();
    const tableOrOrigin = order.origin === 'salon' 
      ? (order.table_number || 'Salón') 
      : 'Mostrador / Para llevar';

    const itemsSummary = (order.items || []).map(i => `${i.quantity}x`).join(', ');

    const newNotif: KitchenNotification = {
      id: 'notif-' + Date.now(),
      type: 'new_order',
      title: `¡Nueva Comanda #${order.order_number}!`,
      message: `${createdByName ? `Mozo ${createdByName}: ` : ''}${tableOrOrigin} • ${order.items?.length || 1} producto(s) (${itemsSummary || 'Sin detalle'})`,
      order_id: order.id,
      order_number: order.order_number,
      table_number: order.table_number,
      created_at: new Date().toISOString(),
      read: false
    };

    notifications.unshift(newNotif);
    // Conservar las últimas 30 notificaciones
    const trimmed = notifications.slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

    // Solo reproducir sonido de cocina si el usuario activo en este dispositivo es cocinero
    if (currentRole === 'cocinero') {
      this.playChime();
    }

    // Notificar a observadores activos
    listeners.forEach(fn => fn(trimmed));

    return newNotif;
  },

  markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => n.id === notificationId ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    listeners.forEach(fn => fn(updated));
  },

  markAllAsRead(): void {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    listeners.forEach(fn => fn(updated));
  },

  clearAll(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    listeners.forEach(fn => fn([]));
  },

  subscribe(listener: NotificationListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  playChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Campana de dos tonos: Ding-Dong armonioso de cocina (880Hz -> 1320Hz)
      playTone(880, 0, 0.4);
      playTone(1320, 0.15, 0.7);
    } catch {
      // Ignorar si el navegador bloquea audio sin interacción
    }
  }
};
