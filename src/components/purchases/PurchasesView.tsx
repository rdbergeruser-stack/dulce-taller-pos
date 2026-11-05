import React, { useState } from 'react';
import { PurchaseListItem, RawMaterial } from '../../types/database';
import { ShoppingCart, Plus, Check, RefreshCw, X, AlertTriangle } from 'lucide-react';

interface PurchasesViewProps {
  items: PurchaseListItem[];
  materials?: RawMaterial[];
  onUpdateItem: (id: string, updates: Partial<PurchaseListItem>) => Promise<void>;
  onAddItem: (item: Omit<PurchaseListItem, 'id'>) => Promise<void>;
  onRefreshSuggestions: () => Promise<void>;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  items,
  materials = [],
  onUpdateItem,
  onAddItem,
  onRefreshSuggestions
}) => {
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newQty, setNewQty] = useState('1000');
  const [newUnit, setNewUnit] = useState('gr');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    await onAddItem({
      item_name: newItemName.trim(),
      quantity_suggested: 0,
      quantity_to_buy: parseFloat(newQty) || 0,
      unit: newUnit,
      is_purchased: false,
      notes: newNotes.trim() || undefined
    });

    setIsNewItemModalOpen(false);
    setNewItemName('');
    setNewQty('1000');
    setNewNotes('');
  };

  // 1. Ítems pendientes guardados
  const savedPendingItems = items.filter(i => !i.is_purchased);
  const savedPendingRawMaterialIds = new Set(savedPendingItems.map(i => i.raw_material_id).filter(Boolean));

  // 2. Detectar insumos que estén bajo stock mínimo en tiempo real
  const lowStockMaterials = materials.filter(m => m.is_active && Number(m.current_stock) <= Number(m.min_stock));
  
  // 3. Generar sugerencias dinámicas para los insumos bajos que aún no estén en la lista de compras
  const dynamicSuggestions: PurchaseListItem[] = lowStockMaterials
    .filter(m => !savedPendingRawMaterialIds.has(m.id))
    .map(mat => {
      const targetStock = Number(mat.min_stock) * 2;
      const current = Number(mat.current_stock);
      const suggested = Math.max(1, Math.round((targetStock - current) * 100) / 100);
      return {
        id: 'sugg-' + mat.id,
        raw_material_id: mat.id,
        item_name: `${mat.name} (${mat.code})`,
        quantity_suggested: suggested,
        quantity_to_buy: suggested,
        unit: mat.unit,
        is_purchased: false,
        notes: `Alerta: Stock actual (${mat.current_stock} ${mat.unit}) <= Mínimo (${mat.min_stock} ${mat.unit})`
      };
    });

  const pendingItems = [...dynamicSuggestions, ...savedPendingItems];
  const purchasedItems = items.filter(i => i.is_purchased);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#dec0b6] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f5ede3] text-[#9d3c0c] rounded-xl">
            <ShoppingCart className="w-6 h-6" aria-hidden="true" focusable="false" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1c120c]">
              Lista de Compras Inteligente
            </h2>
            <p className="text-xs text-[#7c5641]">
              Sugerencias automáticas basadas en stock mínimo y reposición de seguridad
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshSuggestions}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#dec0b6] text-xs font-bold text-[#7c5641] hover:bg-[#efe7dd] active:scale-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            <span>Actualizar Sugerencias</span>
          </button>
          <button
            onClick={() => setIsNewItemModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-sm hover:bg-[#7f2b00] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" aria-hidden="true" focusable="false" />
            <span>+ Agregar Ítem</span>
          </button>
        </div>
      </div>

      {/* Tabla de Compras Pendientes */}
      <div className="bg-white rounded-2xl border border-[#dec0b6] overflow-hidden shadow-sm">
        <div className="p-4 bg-[#f5ede3] border-b border-[#dec0b6] flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-[#1c120c] flex items-center gap-2">
            <span>Insumos por Comprar ({pendingItems.length})</span>
            {lowStockMaterials.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" aria-hidden="true" focusable="false" />
                {lowStockMaterials.length} con stock bajo
              </span>
            )}
          </h3>
          <span className="text-xs text-[#7c5641]">
            Cantidades editables para enviar al proveedor
          </span>
        </div>

        {pendingItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#7c5641]">
            No hay compras pendientes. Todos los insumos están en niveles óptimos de stock.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#fff8f2] text-[#7c5641] text-xs uppercase font-bold border-b border-[#dec0b6]">
                  <th className="py-3 px-4">Insumo</th>
                  <th className="py-3 px-4">Sugerido Sistema</th>
                  <th className="py-3 px-4">Cantidad a Comprar</th>
                  <th className="py-3 px-4">Notas / Proveedor</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dec0b6]/50">
                {pendingItems.map(item => (
                  <tr key={item.id} className="hover:bg-[#fffbf8] text-xs">
                    <td className="py-3 px-4 font-bold text-[#1c120c]">
                      {item.item_name}
                    </td>
                    <td className="py-3 px-4 text-[#7c5641]">
                      {item.quantity_suggested > 0 ? `${item.quantity_suggested} ${item.unit}` : 'Manual'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="any"
                          value={item.quantity_to_buy}
                          onChange={(e) => onUpdateItem(item.id, { quantity_to_buy: parseFloat(e.target.value) || 0 })}
                          className="w-24 px-2 py-1 border border-[#dec0b6] rounded-lg bg-white text-[#1c120c] font-bold focus:outline-none focus:ring-1 focus:ring-[#9d3c0c]"
                        />
                        <span className="text-[#7c5641] font-semibold">{item.unit}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Ej. Distribuidora del Sur..."
                        value={item.notes || ''}
                        onChange={(e) => onUpdateItem(item.id, { notes: e.target.value })}
                        className="w-full max-w-xs px-2 py-1 border border-[#dec0b6] rounded-lg bg-white text-xs text-[#1c120c] focus:outline-none focus:ring-1 focus:ring-[#9d3c0c]"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onUpdateItem(item.id, { is_purchased: true })}
                        className="px-3 py-1.5 rounded-lg bg-[#ebffe8] border border-[#aecfae] text-[#446147] hover:bg-[#d6f5d2] active:scale-95 font-bold text-xs inline-flex items-center gap-1 transition-all"
                        title="Marcar como comprado"
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                        <span>Comprado</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historial de Compras Recientes */}
      {purchasedItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#dec0b6] overflow-hidden shadow-sm opacity-80">
          <div className="p-4 bg-[#f5ede3] border-b border-[#dec0b6] flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-[#7c5641]">
              Comprados Recientemente ({purchasedItems.length})
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {purchasedItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-[#fff8f2] border border-[#dec0b6] text-xs">
                <span className="line-through text-[#7c5641] font-medium">
                  {item.item_name} - {item.quantity_to_buy} {item.unit}
                </span>
                <button
                  onClick={() => onUpdateItem(item.id, { is_purchased: false })}
                  className="text-xs text-[#9d3c0c] hover:underline font-bold"
                >
                  Restaurar a pendientes
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Agregar Ítem Manual */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#dec0b6] shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#dec0b6] bg-[#f5ede3]">
              <h3 className="font-serif font-bold text-base text-[#1c120c]">
                Agregar Ítem a la Lista de Compras
              </h3>
              <button
                onClick={() => setIsNewItemModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7c5641] hover:bg-[#dec0b6]/40"
              >
                <X className="w-4 h-4" aria-hidden="true" focusable="false" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7c5641] mb-1">
                  Nombre del Ítem / Insumo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Servilletas, Caja de embalaje, Harina 000..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dec0b6] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7c5641] mb-1">
                    Cantidad a Comprar
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dec0b6] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7c5641] mb-1">
                    Unidad de Medida
                  </label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dec0b6] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                  >
                    <option value="gr">Gramos (gr)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="l">Litros (l)</option>
                    <option value="un">Unidades (un)</option>
                    <option value="paquete">Paquete</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7c5641] mb-1">
                  Notas / Observación
                </label>
                <input
                  type="text"
                  placeholder="Opcional: proveedor recomendado, urgencia..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dec0b6] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#dec0b6]">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-4 py-2 border border-[#dec0b6] rounded-xl text-xs font-bold text-[#7c5641] hover:bg-[#efe7dd]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#9d3c0c] text-white rounded-xl text-xs font-bold hover:bg-[#7f2b00] active:scale-95"
                >
                  Agregar a Compras
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
