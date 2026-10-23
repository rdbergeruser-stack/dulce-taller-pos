import React, { useState } from 'react';
import { RawMaterial, StockMovement } from '../../types/database';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  History, 
  X
} from 'lucide-react';

interface InventoryViewProps {
  materials: RawMaterial[];
  movements: StockMovement[];
  onAddMaterial: (mat: Omit<RawMaterial, 'id'>) => Promise<void>;
  onAdjustStock: (id: string, newStock: number, reason: string) => Promise<void>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  materials,
  movements,
  onAddMaterial,
  onAdjustStock
}) => {
  const [subTab, setSubTab] = useState<'stock' | 'kardex'>('stock');
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [newStockValue, setNewStockValue] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [isNewMatModalOpen, setIsNewMatModalOpen] = useState(false);

  // Form nueva materia prima
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<'gr' | 'ml' | 'un' | 'kg' | 'lt'>('gr');
  const [stock, setStock] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [cost, setCost] = useState('0');

  const lowStockMaterials = materials.filter(m => m.is_active && m.current_stock <= m.min_stock);

  const handleOpenAdjust = (mat: RawMaterial) => {
    setSelectedMaterial(mat);
    setNewStockValue(mat.current_stock.toString());
    setAdjustReason('Reingreso o ajuste físico de inventario');
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;
    const num = parseFloat(newStockValue);
    if (isNaN(num) || num < 0) {
      alert('Ingresa una cantidad válida mayor o igual a 0');
      return;
    }
    await onAdjustStock(selectedMaterial.id, num, adjustReason);
    setSelectedMaterial(null);
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    await onAddMaterial({
      code: code.trim(),
      name: name.trim(),
      unit,
      current_stock: parseFloat(stock) || 0,
      min_stock: parseFloat(minStock) || 0,
      unit_cost: parseFloat(cost) || 0,
      is_active: true
    });
    setIsNewMatModalOpen(false);
    setCode('');
    setName('');
    setStock('0');
    setMinStock('0');
    setCost('0');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Alertas si hay stock bajo */}
      {lowStockMaterials.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#ffdad6] border border-[#ba1a1a]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ba1a1a] text-white rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#ba1a1a]">
                Alerta de Stock Mínimo ({lowStockMaterials.length} insumos críticos)
              </h3>
              <p className="text-xs text-[#93000a]">
                Los siguientes insumos están en o por debajo de su punto de reposición: {' '}
                {lowStockMaterials.map(m => `${m.name} (${m.current_stock} ${m.unit})`).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tabs: Inventario vs Historial Kardex */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center bg-[#efe7dd] p-1 rounded-xl border border-[#dec0b6]">
          <button
            onClick={() => setSubTab('stock')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'stock'
                ? 'bg-white text-[#1c120c] shadow-sm'
                : 'text-[#7c5641] hover:text-[#1c120c]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Materias Primas ({materials.length})</span>
          </button>
          <button
            onClick={() => setSubTab('kardex')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'kardex'
                ? 'bg-white text-[#1c120c] shadow-sm'
                : 'text-[#7c5641] hover:text-[#1c120c]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Auditoría de Movimientos (Kardex)</span>
          </button>
        </div>

        {subTab === 'stock' && (
          <button
            onClick={() => setIsNewMatModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-sm hover:bg-[#7f2b00] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Materia Prima</span>
          </button>
        )}
      </div>

      {/* TAB 1: LISTADO DE MATERIAS PRIMAS */}
      {subTab === 'stock' && (
        <div className="bg-white rounded-2xl border border-[#dec0b6] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#f5ede3] border-b border-[#dec0b6] text-[#7c5641] text-xs uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Materia Prima</th>
                  <th className="py-3.5 px-4">Unidad</th>
                  <th className="py-3.5 px-4">Stock Actual</th>
                  <th className="py-3.5 px-4">Stock Mínimo</th>
                  <th className="py-3.5 px-4">Costo Unit.</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dec0b6]/50 font-medium">
                {materials.map(mat => {
                  const isLow = mat.current_stock <= mat.min_stock;
                  return (
                    <tr
                      key={mat.id}
                      className={`hover:bg-[#fffbf8] transition-colors ${
                        isLow ? 'bg-[#ffdad6]/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-xs font-bold font-mono text-[#7c5641]">
                        {mat.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1c120c]">
                        {mat.name}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#7c5641] font-semibold uppercase">
                        {mat.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-base font-bold ${
                          isLow ? 'text-[#ba1a1a]' : 'text-[#1c120c]'
                        }`}>
                          {mat.current_stock.toLocaleString('es-AR')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#7c5641]">
                        {mat.min_stock.toLocaleString('es-AR')} {mat.unit}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#7c5641]">
                        ${mat.unit_cost.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/30">
                            Bajo Mínimo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ebffe8] text-[#446147]">
                            Óptimo
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenAdjust(mat)}
                          className="px-3 py-1.5 rounded-lg border border-[#dec0b6] bg-[#f5ede3] text-xs font-bold text-[#9d3c0c] hover:bg-[#ffdbce] active:scale-95 transition-all"
                        >
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDITORÍA KARDEX */}
      {subTab === 'kardex' && (
        <div className="bg-white rounded-2xl border border-[#dec0b6] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#1c120c]">
              Registro Completo de Movimientos de Stock
            </h3>
            <span className="text-xs text-[#7c5641]">
              Auditoría cronológica de consumos, mermas y entradas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#fff8f2] border-b border-[#dec0b6] text-[#7c5641] text-xs uppercase font-bold">
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Materia Prima / Producto</th>
                  <th className="py-3 px-4">Tipo Movimiento</th>
                  <th className="py-3 px-4">Cantidad</th>
                  <th className="py-3 px-4">Previo &rarr; Nuevo</th>
                  <th className="py-3 px-4">Motivo / Orden</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dec0b6]/50">
                {movements.map(mov => {
                  const mat = materials.find(m => m.id === mov.raw_material_id);
                  const isPositive = mov.quantity > 0;

                  return (
                    <tr key={mov.id} className="hover:bg-[#fffbf8] text-xs">
                      <td className="py-3 px-4 text-[#7c5641]">
                        {new Date(mov.created_at).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#1c120c]">
                        {mat ? `${mat.name} (${mat.code})` : 'Preparación / Orden'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-[#efe7dd] text-[#7c5641]">
                          {mov.movement_type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 font-bold ${
                        isPositive ? 'text-[#446147]' : 'text-[#ba1a1a]'
                      }`}>
                        {isPositive ? `+${mov.quantity}` : mov.quantity} {mat?.unit || 'un'}
                      </td>
                      <td className="py-3 px-4 text-[#7c5641]">
                        {mov.previous_stock} &rarr; <span className="font-bold text-[#1c120c]">{mov.new_stock}</span>
                      </td>
                      <td className="py-3 px-4 text-[#57423a] italic max-w-xs truncate">
                        {mov.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL AJUSTE DE STOCK */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#fff8f2] rounded-2xl border border-[#dec0b6] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#1c120c]">
                Ajustar Stock: {selectedMaterial.name}
              </h3>
              <button onClick={() => setSelectedMaterial(null)}>
                <X className="w-5 h-5 text-[#7c5641]" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-white border border-[#dec0b6] text-xs space-y-1">
                <p className="text-[#7c5641]">Código: <span className="font-mono font-bold text-[#1c120c]">{selectedMaterial.code}</span></p>
                <p className="text-[#7c5641]">Stock actual en sistema: <span className="font-bold text-[#1c120c]">{selectedMaterial.current_stock} {selectedMaterial.unit}</span></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#7c5641]">
                  Nuevo Stock Físico ({selectedMaterial.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#dec0b6] bg-white text-base font-bold text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#7c5641]">
                  Motivo del Ajuste (Auditoría)
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                  placeholder="Ej. Ingreso factura proveedor, merma o recuento físico"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMaterial(null)}
                  className="px-4 py-2 rounded-xl border border-[#dec0b6] text-xs font-bold text-[#7c5641] hover:bg-[#efe7dd]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-md hover:bg-[#7f2b00] active:scale-95"
                >
                  Guardar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR MATERIA PRIMA */}
      {isNewMatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#fff8f2] rounded-2xl border border-[#dec0b6] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#1c120c]">
                Nueva Materia Prima
              </h3>
              <button onClick={() => setIsNewMatModalOpen(false)}>
                <X className="w-5 h-5 text-[#7c5641]" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7c5641]">Código (Ej. INS-024)</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="INS-024"
                    className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7c5641]">Unidad de Medida</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold"
                  >
                    <option value="gr">Gramos (gr)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="un">Unidades (un)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="lt">Litros (lt)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#7c5641]">Nombre del Insumo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Esencia de Vainilla Natural"
                  className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7c5641]">Stock Inicial</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7c5641]">Stock Mínimo</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7c5641]">Costo Unit. ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewMatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#dec0b6] text-xs font-bold text-[#7c5641] hover:bg-[#efe7dd]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-md hover:bg-[#7f2b00] active:scale-95"
                >
                  Crear Materia Prima
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
