import React, { useState } from 'react';
import { Order, OrderStatus, Preparation } from '../../types/database';
import { NewOrderModal } from './NewOrderModal';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  PackageCheck, 
  Coffee,
  Sparkles,
  Utensils
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  preparations: Preparation[];
  onCreateOrder: (
    orderData: { origin: any; table_number?: string; notes?: string },
    items: { preparation_id: string; quantity: number; unit_price: number; notes?: string }[]
  ) => Promise<void>;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  isLoading: boolean;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  preparations,
  onCreateOrder,
  onUpdateStatus,
  isLoading
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('activas');

  const activeOrders = orders.filter(o => o.status !== 'entregada' && o.status !== 'cancelada');

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'activas') return o.status !== 'entregada' && o.status !== 'cancelada';
    if (statusFilter === 'todas') return true;
    return o.status === statusFilter;
  });

  const getStatusBadge = (status: OrderStatus) => {
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
        return (
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#f5ede3] text-[#7c5641] border border-[#dec0b6]">
            <PackageCheck className="w-3.5 h-3.5" /> Entregada
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
              {activeOrders.length} comandas en curso de preparación o entrega
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

      {/* Franja de Disponibilidad en Vitrina (Stock Elaborado) */}
      <div className="bg-[#f5ede3] p-3.5 rounded-2xl border border-[#dec0b6] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
            Stock en Vitrina / Productos Elaborados Listos
          </span>
          <span className="text-[11px] text-[#7c5641] hidden sm:inline">
            Se descuenta automáticamente al entregar comanda
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {preparations.map(p => {
            const hasStock = (p.stock_available || 0) > 0;
            return (
              <div
                key={p.id}
                className="bg-white p-2.5 rounded-xl border border-[#dec0b6] flex items-center justify-between shadow-xs"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-bold text-[#1c120c] truncate">
                    {p.name}
                  </h4>
                  <span className="text-[10px] text-[#7c5641] uppercase font-semibold">
                    {p.category}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-sm font-bold ${hasStock ? 'text-[#446147]' : 'text-[#ba1a1a]'}`}>
                    {p.stock_available}
                  </span>
                  <span className="text-[10px] text-[#7c5641] ml-0.5 uppercase">
                    {p.unit_type}
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
          { id: 'lista', label: 'Listas' },
          { id: 'entregada', label: 'Entregadas' },
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
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-sm ${
                order.status === 'lista'
                  ? 'bg-[#fffdfa] border-[#446147] ring-2 ring-[#446147]/20'
                  : order.status === 'en_preparacion'
                  ? 'bg-white border-[#bd5324]'
                  : order.status === 'entregada'
                  ? 'bg-[#f5ede3]/60 border-[#dec0b6] opacity-80'
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

                  <div>{getStatusBadge(order.status)}</div>
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
                      </div>
                    );
                  })}
                </div>

                {/* Observación General */}
                {order.notes && (
                  <div className="p-2.5 rounded-xl bg-[#f5ede3] border border-[#dec0b6] text-xs text-[#57423a] my-2">
                    <span className="font-bold block">Observación general:</span>
                    {order.notes}
                  </div>
                )}
              </div>

              {/* Botones táctiles de cambio de estado */}
              <div className="pt-4 border-t border-[#dec0b6]/60 mt-2">
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
                  <button
                    onClick={() => onUpdateStatus(order.id, 'entregada')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1c120c] text-white text-sm font-bold hover:bg-black active:scale-95 shadow-sm transition-all"
                    title="Descuenta del stock de producto cocinado en vitrina y cierra la orden"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Entregar & Descontar Vitrina</span>
                  </button>
                )}

                {order.status === 'entregada' && (
                  <div className="text-center py-2 text-xs font-semibold text-[#7c5641]">
                    Comanda completada y despachada
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Nueva Comanda */}
      <NewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preparations={preparations}
        onSubmit={onCreateOrder}
      />
    </div>
  );
};
