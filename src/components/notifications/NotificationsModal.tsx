import React, { useState, useEffect } from 'react';
import { Preparation, RawMaterial } from '../../types/database';
import { 
  Bell, 
  X, 
  Sparkles, 
  CookingPot, 
  Package, 
  ShoppingCart, 
  CheckCircle2, 
  Eye,
  Send,
  ChefHat
} from 'lucide-react';
import { findMotherPreparation, getEffectiveAvailableStock } from '../../services/portionService';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import { KitchenNotification } from '../../types/database';

export interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: RawMaterial[];
  preparations: Preparation[];
  initialFilter?: 'all' | 'vitrina' | 'materials' | 'kitchen';
  onNavigateToProduction?: (preparationId: string) => void;
  onNavigateToInventory?: (subTab: 'vitrina' | 'stock' | 'kardex', materialId?: string) => void;
  onNavigateToPurchases?: () => void;
  onNavigateToOrders?: (focusVitrina?: boolean, orderId?: string) => void;
  onSendKitchenNotice?: (itemName: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  materials,
  preparations,
  initialFilter = 'all',
  onNavigateToProduction,
  onNavigateToInventory,
  onNavigateToPurchases,
  onNavigateToOrders,
  onSendKitchenNotice
}) => {
  const { isAdmin, isCocinero, isMozo } = useAuth();
  const [filter, setFilter] = useState<'all' | 'vitrina' | 'materials' | 'kitchen'>(initialFilter);
  const [kitchenNotifs, setKitchenNotifs] = useState<KitchenNotification[]>([]);
  const [sentNotices, setSentNotices] = useState<Record<string, boolean>>({});
  const [noticeFeedback, setNoticeFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isCocinero && initialFilter === 'all') {
        setFilter('kitchen');
      } else if (isMozo) {
        setFilter(initialFilter === 'materials' || initialFilter === 'kitchen' ? 'vitrina' : initialFilter);
      } else {
        setFilter(initialFilter);
      }
      setNoticeFeedback(null);
      setKitchenNotifs(notificationService.getNotifications());
    }
  }, [isOpen, initialFilter, isCocinero, isMozo]);

  if (!isOpen) return null;

  // 1. Calcular alertas de vitrina
  const vitrinaAlerts = preparations
    .map(p => {
      const isPortion = p.unit_type === 'porcion';
      const effective = isPortion ? getEffectiveAvailableStock(p, preparations) : null;
      const directStock = p.stock_available || 0;
      const effectiveStock = isPortion && effective ? effective.totalAvailablePortions : directStock;

      const threshold = p.unit_type === 'entera' ? 1 : (p.unit_type === 'porcion' ? 5 : 3);
      const isOut = effectiveStock <= 0;
      const isLow = effectiveStock > 0 && effectiveStock <= threshold;

      if (!isOut && !isLow) return null;

      const motherPrep = isPortion ? findMotherPreparation(p, preparations) : null;

      return {
        item: p,
        isPortion,
        directStock,
        effectiveStock,
        isOut,
        isLow,
        motherPrep,
        motherStock: motherPrep?.stock_available || 0
      };
    })
    .filter(Boolean) as Array<{
      item: Preparation;
      isPortion: boolean;
      directStock: number;
      effectiveStock: number;
      isOut: boolean;
      isLow: boolean;
      motherPrep: Preparation | null;
      motherStock: number;
    }>;

  // 2. Calcular alertas de materias primas (exclusivo administración)
  const materialAlerts = materials
    .filter(m => m.is_active && m.current_stock <= m.min_stock)
    .map(m => {
      const isOut = m.current_stock <= 0;
      const suggested = Math.max(0, (m.min_stock * 2) - m.current_stock);
      return {
        material: m,
        isOut,
        suggested
      };
    });

  // 3. Notificaciones de cocina pertinentes para el rol activo
  const relevantKitchenNotifs = (isCocinero || isAdmin) ? kitchenNotifs : [];
  const unreadKitchen = relevantKitchenNotifs.filter(k => !k.read);

  // Total de alertas relevantes para el usuario activo
  const totalAlerts = vitrinaAlerts.length + 
    (isAdmin ? materialAlerts.length : 0) + 
    unreadKitchen.length;

  const handleAction = (callback?: () => void) => {
    if (callback) callback();
    onClose();
  };

  const handleSendNotice = (itemName: string) => {
    if (onSendKitchenNotice) {
      onSendKitchenNotice(itemName);
      setSentNotices(prev => ({ ...prev, [itemName]: true }));
      setNoticeFeedback(`Aviso enviado a Administración para reponer "${itemName}"`);
      setTimeout(() => setNoticeFeedback(null), 4000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/50 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
    >
      <div className="bg-[#fff8f2] rounded-2xl border border-[#dec0b6] shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#dec0b6] bg-[#f5ede3]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#9d3c0c] text-white">
              <Bell className="w-5 h-5" aria-hidden="true" focusable="false" />
            </div>
            <div>
              <h2 id="notification-modal-title" className="font-serif font-bold text-lg md:text-xl text-[#1c120c]">
                Centro de Notificaciones & Alertas
              </h2>
              <p className="text-xs text-[#7c5641]">
                {totalAlerts === 0 
                  ? 'Todo el stock y vitrina se encuentran óptimos' 
                  : `${totalAlerts} ítem(s) requieren atención o reposición`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel de notificaciones"
            className="p-2 rounded-xl text-[#7c5641] hover:text-[#1c120c] hover:bg-[#dec0b6]/40 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" focusable="false" />
          </button>
        </div>

        {/* Pestañas de filtrado rápido */}
        <div className="px-5 pt-3 pb-2 border-b border-[#dec0b6] flex items-center gap-2 bg-white flex-wrap">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-[#9d3c0c] text-white shadow-xs'
                : 'text-[#7c5641] hover:bg-[#f5ede3]'
            }`}
          >
            Todas ({totalAlerts})
          </button>

          {(isCocinero || isAdmin) && (
            <button
              type="button"
              onClick={() => setFilter('kitchen')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                filter === 'kitchen'
                  ? 'bg-[#9d3c0c] text-white shadow-xs'
                  : 'text-[#7c5641] hover:bg-[#f5ede3]'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              <span>Cocina ({unreadKitchen.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setFilter('vitrina')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'vitrina'
                ? 'bg-[#9d3c0c] text-white shadow-xs'
                : 'text-[#7c5641] hover:bg-[#f5ede3]'
            }`}
          >
            Vitrina ({vitrinaAlerts.length})
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setFilter('materials')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'materials'
                  ? 'bg-[#9d3c0c] text-white shadow-xs'
                  : 'text-[#7c5641] hover:bg-[#f5ede3]'
              }`}
            >
              Insumos ({materialAlerts.length})
            </button>
          )}
        </div>

        {/* Banner de confirmación de aviso */}
        {noticeFeedback && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-[#ebffe8] border border-[#aecfae] text-xs font-bold text-[#446147] flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#446147]" aria-hidden="true" focusable="false" />
              <span>{noticeFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setNoticeFeedback(null)}
              className="text-[#446147] hover:opacity-70 p-1"
              aria-label="Cerrar confirmación"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            </button>
          </div>
        )}

        {/* Lista de Alertas / Contenido */}
        <div className="p-4 md:p-5 overflow-y-auto space-y-4 flex-1">
          {totalAlerts === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#ebffe8] text-[#446147] flex items-center justify-center mx-auto border border-[#aecfae]">
                <CheckCircle2 className="w-7 h-7" aria-hidden="true" focusable="false" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1c120c]">
                ¡Inventario y Vitrina al Día!
              </h3>
              <p className="text-xs text-[#7c5641] max-w-sm mx-auto">
                No hay productos agotados ni materias primas por debajo del nivel de alerta mínimo.
              </p>
            </div>
          ) : (
            <>
              {/* SECCIÓN COMANDAS PARA COCINA (Visible para Cocinero y Admin) */}
              {(isCocinero || isAdmin) && (filter === 'all' || filter === 'kitchen') && relevantKitchenNotifs.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c5641] flex items-center gap-1.5">
                      <span>🔔 Comandas Nuevas para Cocina</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#ffdbce] text-[#9d3c0c] font-bold">
                        {relevantKitchenNotifs.length}
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        notificationService.clearAll();
                        setKitchenNotifs([]);
                      }}
                      className="text-[11px] text-[#7c5641] hover:text-[#ba1a1a] font-medium"
                    >
                      Limpiar avisos
                    </button>
                  </div>

                  <div className="space-y-2">
                    {relevantKitchenNotifs.map(k => (
                      <div 
                        key={k.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                          !k.read ? 'bg-[#ffdbce]/40 border-[#9d3c0c]' : 'bg-white border-[#dec0b6]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#9d3c0c] text-white flex items-center justify-center font-bold">
                            <ChefHat className="w-5 h-5" aria-hidden="true" focusable="false" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#1c120c]">{k.title}</h4>
                            <p className="text-xs text-[#7c5641]">{k.message}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            notificationService.markAsRead(k.id);
                            if (onNavigateToOrders) {
                              onNavigateToOrders(false, k.order_id);
                            }
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#9d3c0c] text-white text-xs font-bold shadow-xs hover:bg-[#7f2b00] active:scale-95 shrink-0 transition-all"
                        >
                          Ir a Comanda
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECCIÓN VITRINA */}
              {(filter === 'all' || filter === 'vitrina') && vitrinaAlerts.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c5641] flex items-center gap-1.5">
                      <span>🍰 Vitrina y Mostrador</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-bold">
                        {vitrinaAlerts.length}
                      </span>
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {vitrinaAlerts.map(({ item, isPortion, directStock, effectiveStock, isOut, motherPrep, motherStock }) => {
                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                            isOut
                              ? 'bg-[#ffdad6]/35 border-[#ba1a1a]/40'
                              : 'bg-[#fef3c7]/35 border-[#fde68a]'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                                isOut
                                  ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/40 animate-pulse'
                                  : 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
                              }`}>
                                {isOut ? '🚨 AGOTADO' : '⚠️ POCO STOCK'}
                              </span>
                              <h4 className="text-xs font-bold text-[#1c120c]">
                                {item.name}
                              </h4>
                            </div>

                            <p className="text-xs text-[#7c5641]">
                              Stock actual: <strong className={isOut ? 'text-[#ba1a1a]' : 'text-[#92400e]'}>
                                {isPortion ? `${directStock} porciones listas (${effectiveStock} efectivas)` : `${directStock} ${item.unit_type}`}
                              </strong>
                              {isPortion && motherPrep && (
                                <span className="ml-1 text-xs text-[#7c5641]">
                                  | Tortas enteras disponibles: <strong>{motherStock}</strong>
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Acciones directas según rol */}
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            {isAdmin ? (
                              <>
                                {isPortion && motherStock > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => handleAction(() => onNavigateToInventory?.('vitrina'))}
                                    className="px-3 py-2 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold hover:bg-[#7f2b00] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
                                    title="Ir a Vitrina para fraccionar 1 torta entera en porciones"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                                    <span>Cortar en Vitrina</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAction(() => {
                                      const prepIdToCook = isPortion && motherPrep ? motherPrep.id : item.id;
                                      onNavigateToProduction?.(prepIdToCook);
                                    })}
                                    className="px-3 py-2 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold hover:bg-[#7f2b00] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
                                    title="Ir a Producción para iniciar la cocción con esta receta"
                                  >
                                    <CookingPot className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                                    <span>Cocinar en Producción</span>
                                  </button>
                                )}
                              </>
                            ) : isCocinero ? (
                              <button
                                type="button"
                                onClick={() => handleSendNotice(item.name)}
                                disabled={sentNotices[item.name]}
                                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                                  sentNotices[item.name]
                                    ? 'bg-[#ebffe8] border border-[#aecfae] text-[#446147] cursor-default'
                                    : 'bg-[#9d3c0c] text-white hover:bg-[#7f2b00] active:scale-95'
                                }`}
                                title="Enviar aviso a la Administración solicitando autorizar producción"
                              >
                                {sentNotices[item.name] ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                                    <span>Aviso Enviado</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                                    <span>Avisar a Admin para Cocinar</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAction(() => onNavigateToOrders?.(true))}
                                className="px-3 py-2 rounded-xl border border-[#9d3c0c] bg-white text-[#9d3c0c] text-xs font-bold hover:bg-[#ffdbce] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
                                title="Ir a la pantalla de comandas y enfocar la disponibilidad de vitrina"
                              >
                                <Eye className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                                <span>Ver en Vitrina</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECCIÓN MATERIAS PRIMAS (Exclusiva para Administrador) */}
              {isAdmin && (filter === 'all' || filter === 'materials') && materialAlerts.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c5641] flex items-center gap-1.5">
                      <span>📦 Materias Primas e Insumos</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-bold">
                        {materialAlerts.length}
                      </span>
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {materialAlerts.map(({ material, isOut, suggested }) => (
                      <div
                        key={material.id}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                          isOut
                            ? 'bg-[#ffdad6]/35 border-[#ba1a1a]/40'
                            : 'bg-[#fef3c7]/35 border-[#fde68a]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                              isOut
                                ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/40 animate-pulse'
                                : 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
                            }`}>
                              {isOut ? '🚨 SIN STOCK' : '⚠️ STOCK MÍNIMO'}
                            </span>
                            <h4 className="text-xs font-bold text-[#1c120c]">
                              {material.name} ({material.code})
                            </h4>
                          </div>

                          <p className="text-xs text-[#7c5641]">
                            Stock: <strong className={isOut ? 'text-[#ba1a1a]' : 'text-[#92400e]'}>
                              {material.current_stock} {material.unit}
                            </strong> (Mín: {material.min_stock} {material.unit})
                            <span className="ml-2 text-xs text-[#7c5641]">
                              • Sugerido a reponer: <strong>{suggested} {material.unit}</strong>
                            </span>
                          </p>
                        </div>

                        {/* Acciones directas */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={() => handleAction(() => onNavigateToPurchases?.())}
                            className="px-3 py-2 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold hover:bg-[#7f2b00] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
                            title="Ir a la Lista de Compras para gestionar orden al proveedor"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                            <span>Ver en Compras</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(() => onNavigateToInventory?.('stock', material.id))}
                            className="px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-[#7c5641] text-xs font-bold hover:bg-[#efe7dd] active:scale-95 transition-all flex items-center gap-1.5"
                            title="Ajustar stock o ver historial de movimientos de este insumo"
                          >
                            <Package className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                            <span>Ajustar Stock</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Modal con Atajos */}
        <div className="px-5 py-3 border-t border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
          <div className="text-xs text-[#7c5641]">
            <span className="font-semibold">Dulce Taller POS</span> • Alertas automáticas en tiempo real
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1c120c] text-white text-xs font-bold hover:bg-[#3d2c24] active:scale-95 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
