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
  Eye
} from 'lucide-react';
import { findMotherPreparation, getEffectiveAvailableStock } from '../../services/portionService';
import { useAuth } from '../../contexts/AuthContext';

export interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: RawMaterial[];
  preparations: Preparation[];
  initialFilter?: 'all' | 'vitrina' | 'materials';
  onNavigateToProduction?: (preparationId: string) => void;
  onNavigateToInventory?: (subTab: 'vitrina' | 'stock' | 'kardex') => void;
  onNavigateToPurchases?: () => void;
  onNavigateToOrders?: () => void;
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
  onNavigateToOrders
}) => {
  const { isAdmin } = useAuth();
  const [filter, setFilter] = useState<'all' | 'vitrina' | 'materials'>(initialFilter);

  useEffect(() => {
    if (isOpen) {
      setFilter(initialFilter);
    }
  }, [isOpen, initialFilter]);

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

  // 2. Calcular alertas de materias primas
  const materialAlerts = materials
    .filter(m => m.is_active && m.current_stock <= m.min_stock)
    .map(m => ({
      item: m,
      isOut: m.current_stock <= 0,
      isLow: m.current_stock > 0 && m.current_stock <= m.min_stock
    }));

  const totalAlerts = vitrinaAlerts.length + materialAlerts.length;

  const handleAction = (callback?: () => void) => {
    if (callback) {
      callback();
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
    >
      <div 
        className="bg-[#fff8f2] rounded-2xl border border-[#dec0b6] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera del Centro de Notificaciones */}
        <div className="p-4 md:p-5 border-b border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9d3c0c] text-white flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5" aria-hidden="true" focusable="false" />
            </div>
            <div>
              <h2 id="notification-modal-title" className="font-serif font-bold text-lg md:text-xl text-[#1c120c]">
                Alertas de Stock & Vitrina
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
        <div className="px-5 pt-3 pb-2 border-b border-[#dec0b6] flex items-center gap-2 bg-white">
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
        </div>

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

                          {/* Acciones directas */}
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
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAction(() => onNavigateToOrders?.())}
                                className="px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-[#7c5641] text-xs font-bold hover:bg-[#efe7dd] active:scale-95 transition-all flex items-center gap-1.5"
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

              {/* SECCIÓN MATERIAS PRIMAS */}
              {(filter === 'all' || filter === 'materials') && materialAlerts.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#7c5641] flex items-center gap-1.5">
                      <span>📦 Materias Primas e Insumos</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] font-bold">
                        {materialAlerts.length}
                      </span>
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {materialAlerts.map(({ item, isOut }) => (
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
                              {isOut ? '🚨 AGOTADO' : '⚠️ BAJO MÍNIMO'}
                            </span>
                            <span className="text-xs font-mono font-bold text-[#7c5641]">
                              {item.code}
                            </span>
                            <h4 className="text-xs font-bold text-[#1c120c]">
                              {item.name}
                            </h4>
                          </div>

                          <p className="text-xs text-[#7c5641]">
                            Stock actual: <strong className={isOut ? 'text-[#ba1a1a]' : 'text-[#92400e]'}>
                              {item.current_stock.toLocaleString('es-AR')} {item.unit}
                            </strong>
                            <span className="ml-1 text-xs text-[#7c5641]">
                              (Mínimo de alerta: {item.min_stock.toLocaleString('es-AR')} {item.unit})
                            </span>
                          </p>
                        </div>

                        {/* Acciones directas */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {isAdmin ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAction(() => onNavigateToInventory?.('stock'))}
                                className="px-2.5 py-1.5 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold text-[#9d3c0c] hover:bg-[#ffdbce] active:scale-95 transition-all flex items-center gap-1"
                                title="Ver en tabla de inventario para ajustar stock o alerta"
                              >
                                <Package className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                                <span>Ajustar Stock</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAction(() => onNavigateToPurchases?.())}
                                className="px-2.5 py-1.5 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold hover:bg-[#7f2b00] active:scale-95 transition-all flex items-center gap-1 shadow-xs"
                                title="Ir a la lista de compras para reponer insumo"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                                <span>Comprar</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-xs font-semibold text-[#7c5641] bg-white px-2 py-1 rounded-lg border border-[#dec0b6]">
                              Aviso a Cocina
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pie del modal con accesos rápidos */}
        <div className="p-3 md:p-4 border-t border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
          <span className="text-xs text-[#7c5641] hidden sm:inline">
            Haz clic en cualquier acción para saltar directo a la sección correspondiente.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#dec0b6] text-[#1c120c] text-xs font-bold hover:bg-[#cdaca0] active:scale-95 transition-all ml-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
