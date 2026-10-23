import React, { useState } from 'react';
import { PurchaseListItem } from '../../types/database';
import { ShoppingCart, Plus, Check, RefreshCw, X } from 'lucide-react';

interface PurchasesViewProps {
  items: PurchaseListItem[];
  materials?: any[];
  onUpdateItem: (id: string, updates: Partial<PurchaseListItem>) => Promise<void>;
  onAddItem: (item: Omit<PurchaseListItem, 'id'>) => Promise<void>;
  onRefreshSuggestions: () => Promise<void>;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  items,
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

  const pendingItems = items.filter(i => !i.is_purchased);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#dec0b6] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f5ede3] text-[#9d3c0c] rounded-xl">
            <ShoppingCart className="w-6 h-6" />
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
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar Sugerencias</span>
          </button>
          <button
            onClick={() => setIsNewItemModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-sm hover:bg-[#7f2b00] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agregar Ítem</span>
          </button>
        </div>
      </div>

      {/* Tabla de Compras Pendientes */}
      <div className="bg-white rounded-2xl border border-[#dec0b6] overflow-hidden shadow-sm">
        <div className="p-4 bg-[#f5ede3] border-b border-[#dec0b6] flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-[#1c120c]">
            Insumos por Comprar ({pendingItems.length})
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
                          className="w-24 px-2.5 py-1.5 rounded-lg border border-[#dec0b6] bg-white font-bold text-[#1c120c] focus:outline-none focus:ring-1 focus:ring-[#9d3c0c]"
                        />
                        <span className="font-semibold text-[#7c5641] uppercase">{item.unit}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#7c5641] italic">
                      {item.notes || 'Reposición habitual'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onUpdateItem(item.id, { is_purchased: true })}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#ebffe8] text-[#446147] border border-[#aecfae] text-xs font-bold hover:bg-[#d5f5d3] active:scale-95 transition-all mx-auto"
                      >
                        <Check className="w-3.5 h-3.5" />
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

      {/* Modal Agregar Ítem Manual */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#fff8f2] rounded-2xl border border-[#dec0b6] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#1c120c]">
                Agregar Ítem a la Lista de Compras
              </h3>
              <button onClick={() => setIsNewItemModalOpen(false)}>
                <X className="w-5 h-5 text-[#7c5641]" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#7c5641]">Descripción / Insumo</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ej. Servilletas decoradas o Café Colombia"
                  className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7c5641]">Cantidad a Comprar</label>
                  <input
                    type="number"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7c5641]">Unidad</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold"
                  >
                    <option value="gr">Gramos (gr)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="un">Unidades (un)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="lt">Litros (lt)</option>
                    <option value="caja">Caja / Pack</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#7c5641]">Notas / Proveedor</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ej. Proveedor Molino Cañuelas"
                  className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#dec0b6] text-xs font-bold text-[#7c5641] hover:bg-[#efe7dd]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-md hover:bg-[#7f2b00] active:scale-95"
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
