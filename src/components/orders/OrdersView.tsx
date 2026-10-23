import React, { useState } from 'react';
import { Order, OrderStatus, Preparation } from '../../types/database';
import { NewOrderModal } from './NewOrderModal';
import { PaymentModal, PaymentMethod } from './PaymentModal';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  PackageCheck, 
  Coffee,
  Sparkles,
  Utensils,
  Banknote,
  AlertTriangle,
  AlertOctagon,
  Check
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  preparations: Preparation[];
  onCreateOrder: (
    orderData: { origin: any; table_number?: string; notes?: string },
    items: { preparation_id: string; quantity: number; unit_price: number; notes?: string }[]
  ) => Promise<void>;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onPayOrder?: (orderId: string, paymentData: { method: PaymentMethod; amountPaid: number; changeGiven: number; receiptNumber: string }) => Promise<void>;
  isLoading: boolean;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  preparations,
  onCreateOrder,
  onUpdateStatus,
  onPayOrder,
  isLoading
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('activas');
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);

  const activeOrders = orders.filter(o => o.status !== 'entregada' && o.status !== 'cancelada');

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'activas') return o.status !== 'entregada' && o.status !== 'cancelada';
    if (statusFilter === 'todas') return true;
    return o.status === statusFilter;
  });

  const getVitrinaAlert = (stock: number, unitType: string) => {
    if (stock <= 0) {
      return {
        level: 'out',
        label: 'AGOTADO (0 un.)',
        badgeClass: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30 animate-pulse font-extrabold',
        icon: <AlertOctagon className="w-3 h-3 text-[#ba1a1a] shrink-0" />
      };
    }
    const lowThreshold = unitType === 'entera' ? 1 : 3;
    if (stock <= lowThreshold) {
      return {
        level: 'low',
        label: `Poco Stock (${stock} ${unitType})`,
        badgeClass: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a] font-bold',
        icon: <AlertTriangle className="w-3 h-3 text-[#92400e] shrink-0" />
      };
    }
    return {
      level: 'ok',
      label: `${stock} ${unitType}`,
      badgeClass: 'bg-[#ebffe8] text-[#446147] border-[#aecfae] font-semibold',
      icon: <Check className="w-3 h-3 text-[#446147] shrink-0" />
    };
  };

  const getStatusBadge = (status: OrderStatus, notes?: string) => {
    const isPaid = notes && notes.includes('[PAGADO');

    switch (status) {
      case 'pendiente':
        return (
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
            <Clock className="w-3.5 h-3.5" /> Pendiente
          </span>
        );
      case 'en_preparacion':
        return (
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#ffdbce] text-[#9d3c0c] border border-[#dec0b6]">
            <ChefHat className="w-3.5 h-3.5" /> En Preparación
          </span>
        );
      case 'lista':
        return (
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#ebffe8] text-[#446147] border border-[#aecfae] animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5" /> Lista para Servir
          </span>
        );
      case 'entregada':
        return isPaid ? (
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#ebffe8] text-[#446147] border border-[#aecfae]">
            <CheckCircle2 className="w-3.5 h-3.5" /> Cobrada & Finalizada
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#f5ede3] text-[#7c5641] border border-[#dec0b6]">
            <PackageCheck className="w-3.5 h-3.5" /> Entregada (Pendiente Cobro)
          </span>
        );
      default:
        return null;
    }
  };

  const getOriginIcon = (origin: string) => {
    switch (origin) {
      case 'salon':
        return <Utensils className="w-4 h-4 text-[#9d3c0c]" />;
      case 'takeaway':
        return <Coffee className="w-4 h-4 text-[#7c5641]" />;
      case 'taller':
        return <Sparkles className="w-4 h-4 text-[#d97736]" />;
      default:
        return null;
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Recién';
    if (diff === 1) return 'Hace 1 min';
    if (diff < 60) return `Hace ${diff} min`;
    return `Hace ${Math.floor(diff / 60)}h`;
  };

  const handleConfirmPayment = async (orderId: string, paymentData: any) => {
    if (onPayOrder) {
      await onPayOrder(orderId, paymentData);
    } else {
      await onUpdateStatus(orderId, 'entregada');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar KDS: Stats & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#dec0b6] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f5ede3] rounded-xl text-[#9d3c0c]">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1c120c]">
              Comandas en Cocina y Salón (KDS)
            </h2>
            <p className="text-xs text-[#7c5641]">
              {activeOrders.length} comandas en curso de preparación, entrega o cobro
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#9d3c0c] text-white text-sm font-bold shadow-md shadow-[#9d3c0c]/25 hover:bg-[#7f2b00] active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>+ Nueva Comanda</span>
        </button>
      </div>

      {/* Franja de Disponibilidad en Vitrina (Stock Elaborado) con Alertas Inteligentes */}
      <div className="bg-[#f5ede3] p-4 rounded-2xl border border-[#dec0b6] shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
              Disponibilidad en Vitrina (Stock Cocinado)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#7c5641] font-semibold border border-[#dec0b6]">
              Tiempo Real
            </span>
          </div>
          <span className="text-[11px] text-[#7c5641] hidden md:inline">
            Descuento automático al despachar comanda
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {preparations.map(p => {
            const alertInfo = getVitrinaAlert(p.stock_available || 0, p.unit_type);

            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  alertInfo.level === 'out'
                    ? 'bg-[#ffdad6]/40 border-[#ba1a1a] shadow-xs'
                    : alertInfo.level === 'low'
                    ? 'bg-[#fef3c7]/30 border-[#d97736]'
                    : 'bg-white border-[#dec0b6]'
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-[#1c120c] truncate">
                    {p.name}
                  </h4>
                  <span className="text-[10px] text-[#7c5641] uppercase font-semibold">
                    {p.unit_type}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] font-bold text-[#1c120c]">
                    ${p.price.toLocaleString('es-AR')}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${alertInfo.badgeClass}`}>
                    {alertInfo.icon}
                    <span>{alertInfo.label}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtros Táctiles Rápidos */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'activas', label: `Activas (${activeOrders.length})` },
          { id: 'pendiente', label: 'Pendientes' },
          { id: 'en_preparacion', label: 'En Preparación' },
          { id: 'lista', label: 'Listas para Servir' },
          { id: 'entregada', label: 'Entregadas / Cobros' },
          { id: 'todas', label: 'Historial Completo' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              statusFilter === filter.id
                ? 'bg-[#1c120c] text-white border-[#1c120c]'
                : 'bg-white text-[#7c5641] border-[#dec0b6] hover:bg-[#efe7dd]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Grid KDS de Comandas */}
      {isLoading ? (
        <div className="p-12 text-center text-[#7c5641] font-medium">
          Cargando comandas en curso...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#dec0b6] space-y-3">
          <ChefHat className="w-10 h-10 text-[#dec0b6] mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[#1c120c]">
            No hay comandas en este estado
          </h3>
          <p className="text-xs text-[#7c5641] max-w-sm mx-auto">
            Utiliza el botón "+ Nueva Comanda" para registrar los pedidos de salón, mostrador o talleres.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map(order => {
            const isPaid = order.notes && order.notes.includes('[PAGADO');
            const total = (order.items || []).reduce((s, it) => s + (it.quantity * it.unit_price), 0);

            return (
              <div
                key={order.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-sm ${
                  isPaid
                    ? 'bg-[#f5ede3]/40 border-[#aecfae] opacity-90'
                    : order.status === 'lista'
                    ? 'bg-[#fffdfa] border-[#446147] ring-2 ring-[#446147]/20'
                    : order.status === 'en_preparacion'
                    ? 'bg-white border-[#bd5324]'
                    : order.status === 'entregada'
                    ? 'bg-white border-[#d97736] ring-1 ring-[#d97736]/20'
                    : 'bg-white border-[#dec0b6]'
                }`}
              >
                <div>
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#dec0b6]/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-lg text-[#1c120c]">
                          #{order.order_number}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-[#f5ede3] text-[#1c120c]">
                          {getOriginIcon(order.origin)}
                          <span className="capitalize">{order.origin}</span>
                          {order.table_number && ` • ${order.table_number}`}
                        </span>
                      </div>
                      <span className="text-xs text-[#7c5641] flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(order.created_at)}
                      </span>
                    </div>

                    <div>{getStatusBadge(order.status, order.notes)}</div>
                  </div>

                  {/* Lista de Ítems */}
                  <div className="py-3 space-y-2">
                    {(order.items || []).map((item, idx) => {
                      const prepName = item.preparation?.name || 
                        preparations.find(p => p.id === item.preparation_id)?.name || 
                        'Producto';

                      return (
                        <div key={idx} className="flex items-start justify-between gap-2 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#efe7dd] text-[#9d3c0c] font-bold text-xs flex items-center justify-center shrink-0">
                              {item.quantity}x
                            </span>
                            <div>
                              <span className="font-bold text-[#1c120c]">{prepName}</span>
                              {item.notes && (
                                <p className="text-xs text-[#9d3c0c] italic font-medium">
                                  Nota: {item.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#7c5641]">
                            ${(item.quantity * item.unit_price).toLocaleString('es-AR')}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Observación General */}
                  {order.notes && (
                    <div className="p-2.5 rounded-xl bg-[#f5ede3] border border-[#dec0b6] text-xs text-[#57423a] my-2">
                      <span className="font-bold block">Observación:</span>
                      {order.notes}
                    </div>
                  )}
                </div>

                {/* Footer de Tarjeta: Total y Botones Táctiles de Acción */}
                <div className="pt-3 border-t border-[#dec0b6]/60 mt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs pb-1">
                    <span className="text-[#7c5641] font-semibold">Total comanda:</span>
                    <span className="font-serif text-base font-bold text-[#9d3c0c]">
                      ${total.toLocaleString('es-AR')}
                    </span>
                  </div>

                  {order.status === 'pendiente' && (
                    <button
                      onClick={() => onUpdateStatus(order.id, 'en_preparacion')}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#9d3c0c] text-white text-sm font-bold hover:bg-[#7f2b00] active:scale-95 shadow-sm transition-all"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Iniciar Preparación</span>
                    </button>
                  )}

                  {order.status === 'en_preparacion' && (
                    <button
                      onClick={() => onUpdateStatus(order.id, 'lista')}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#446147] text-white text-sm font-bold hover:bg-[#314d34] active:scale-95 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Marcar como Lista</span>
                    </button>
                  )}

                  {order.status === 'lista' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onUpdateStatus(order.id, 'entregada')}
                        className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#1c120c] text-white text-xs font-bold hover:bg-black active:scale-95 shadow-sm transition-all"
                        title="Descuenta del stock de producto cocinado en vitrina"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Entregar</span>
                      </button>

                      <button
                        onClick={() => setPayingOrder(order)}
                        className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold hover:bg-[#7f2b00] active:scale-95 shadow-sm transition-all"
                      >
                        <Banknote className="w-4 h-4" />
                        <span>Cobrar</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'entregada' && !isPaid && (
                    <button
                      onClick={() => setPayingOrder(order)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#9d3c0c] text-white text-sm font-bold hover:bg-[#7f2b00] active:scale-95 shadow-md shadow-[#9d3c0c]/20 transition-all"
                    >
                      <Banknote className="w-5 h-5" />
                      <span>Cobrar Cuenta (${total.toLocaleString('es-AR')})</span>
                    </button>
                  )}

                  {order.status === 'entregada' && isPaid && (
                    <div className="text-center py-2 px-3 rounded-xl bg-[#ebffe8] border border-[#aecfae] text-xs font-bold text-[#446147] flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Cuenta Cobrada • Comprobante Emitido</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Nueva Comanda */}
      <NewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preparations={preparations}
        onSubmit={onCreateOrder}
      />

      {/* Modal de Cobro & Comprobante */}
      <PaymentModal
        order={payingOrder}
        isOpen={Boolean(payingOrder)}
        onClose={() => setPayingOrder(null)}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
};
