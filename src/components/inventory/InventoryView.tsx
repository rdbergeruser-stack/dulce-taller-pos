import React, { useState } from 'react';
import { RawMaterial, StockMovement, Preparation } from '../../types/database';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  History, 
  X,
  Cake,
  Sparkles,
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { portionService, getEffectiveAvailableStock } from '../../services/portionService';

interface InventoryViewProps {
  materials: RawMaterial[];
  movements: StockMovement[];
  preparations: Preparation[];
  onAddMaterial: (mat: Omit<RawMaterial, 'id'>) => Promise<void>;
  onAdjustStock: (id: string, newStock: number, reason: string) => Promise<void>;
  onAdjustPrepStock: (id: string, newStock: number, reason: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  materials,
  movements,
  preparations,
  onAddMaterial,
  onAdjustStock,
  onAdjustPrepStock,
  onRefresh
}) => {
  const [subTab, setSubTab] = useState<'vitrina' | 'stock' | 'kardex'>('vitrina');
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [selectedPrep, setSelectedPrep] = useState<Preparation | null>(null);
  const [newStockValue, setNewStockValue] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [isNewMatModalOpen, setIsNewMatModalOpen] = useState(false);
  const [sliceNotice, setSliceNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSlicing, setIsSlicing] = useState(false);

  // Form nueva materia prima
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<'gr' | 'ml' | 'un' | 'kg' | 'lt'>('gr');
  const [stock, setStock] = useState('0');
  const [minStock, setMinStock] = useState('0');
  const [cost, setCost] = useState('0');

  const outOfStockMaterials = materials.filter(m => m.is_active && m.current_stock <= 0);
  const lowStockMaterials = materials.filter(m => m.is_active && m.current_stock > 0 && m.current_stock <= m.min_stock);
  const outOfStockPreps = preparations.filter(p => (p.stock_available || 0) <= 0);
  const lowStockPreps = preparations.filter(p => {
    const s = p.stock_available || 0;
    const threshold = p.unit_type === 'entera' ? 1 : 3;
    return s > 0 && s <= threshold;
  });

  const getRawMaterialStatus = (mat: RawMaterial) => {
    if (mat.current_stock <= 0) {
      return {
        level: 'out',
        rowClass: 'bg-[#ffdad6]/35 hover:bg-[#ffdad6]/60',
        stockClass: 'text-[#ba1a1a] font-black',
        badgeClass: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/40 font-extrabold animate-pulse',
        label: '🚨 AGOTADO'
      };
    }
    if (mat.current_stock <= mat.min_stock) {
      return {
        level: 'low',
        rowClass: 'bg-[#fef3c7]/35 hover:bg-[#fef3c7]/60',
        stockClass: 'text-[#d97736] font-bold',
        badgeClass: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a] font-bold',
        label: '⚠️ BAJO MÍNIMO'
      };
    }
    return {
      level: 'ok',
      rowClass: 'hover:bg-[#fffbf8]',
      stockClass: 'text-[#1c120c] font-bold',
      badgeClass: 'bg-[#ebffe8] text-[#446147] border-[#aecfae]',
      label: '✓ ÓPTIMO'
    };
  };

  const handleOpenAdjust = (mat: RawMaterial) => {
    setSelectedMaterial(mat);
    setSelectedPrep(null);
    setNewStockValue(mat.current_stock.toString());
    setAdjustReason('Reingreso o ajuste físico de inventario');
  };

  const handleOpenAdjustPrep = (prep: Preparation) => {
    setSelectedPrep(prep);
    setSelectedMaterial(null);
    setNewStockValue(prep.stock_available.toString());
    setAdjustReason('Ajuste de vitrina / Registro de merma');
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(newStockValue);
    if (isNaN(num) || num < 0) {
      alert('Ingresa una cantidad válida mayor o igual a 0');
      return;
    }

    if (selectedMaterial) {
      await onAdjustStock(selectedMaterial.id, num, adjustReason);
      setSelectedMaterial(null);
    } else if (selectedPrep) {
      await onAdjustPrepStock(selectedPrep.id, num, adjustReason);
      setSelectedPrep(null);
    }
  };

  const handleManualSlice = async (portionPrepId: string) => {
    setIsSlicing(true);
    setSliceNotice(null);
    try {
      const res = await portionService.manualSliceCake(portionPrepId, 1);
      setSliceNotice({ type: 'success', text: res.message });
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      setSliceNotice({ type: 'error', text: err.message || 'Error al fraccionar la torta.' });
    } finally {
      setIsSlicing(false);
    }
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

  const getPrepCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'pasteleria': return <Cake className="w-4 h-4 text-[#9d3c0c]" />;
      case 'cafeteria': return <Coffee className="w-4 h-4 text-[#7c5641]" />;
      default: return <Sparkles className="w-4 h-4 text-[#d97736]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Alertas si hay productos de vitrina agotados o bajos */}
      {outOfStockPreps.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#ffdad6] border border-[#ba1a1a]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ba1a1a] text-white rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#ba1a1a]">
                🚨 Alerta de Vitrina: {outOfStockPreps.length} productos agotados (Stock 0)
              </h3>
              <p className="text-xs text-[#93000a]">
                Se requiere producir o reponer inmediatamente: {' '}
                <strong>{outOfStockPreps.map(p => p.name).join(', ')}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {lowStockPreps.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#fef3c7] border border-[#fde68a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#d97736] text-white rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#92400e]">
                ⚠️ Advertencia de Vitrina: {lowStockPreps.length} productos con poco stock
              </h3>
              <p className="text-xs text-[#78350f]">
                Quedan pocas unidades disponibles para la venta: {' '}
                {lowStockPreps.map(p => `${p.name} (${p.stock_available} ${p.unit_type})`).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Banners de Alertas Materias Primas */}
      {outOfStockMaterials.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#ffdad6] border border-[#ba1a1a]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ba1a1a] text-white rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#ba1a1a]">
                🚨 Insumos Críticos Agotados: {outOfStockMaterials.length} materias primas en 0
              </h3>
              <p className="text-xs text-[#93000a]">
                Imposible producir recetas que los contengan: {' '}
                <strong>{outOfStockMaterials.map(m => m.name).join(', ')}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {lowStockMaterials.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#fef3c7] border border-[#fde68a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#d97736] text-white rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#92400e]">
                ⚠️ Insumos Bajo Punto de Reposición ({lowStockMaterials.length} insumos)
              </h3>
              <p className="text-xs text-[#78350f]">
                Materias primas próximas a agotarse: {' '}
                {lowStockMaterials.map(m => `${m.name} (${m.current_stock} ${m.unit})`).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tabs: 1) Productos Producidos (Vitrina), 2) Materias Primas, 3) Historial Kardex */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center bg-[#efe7dd] p-1 rounded-xl border border-[#dec0b6] overflow-x-auto max-w-full">
          <button
            onClick={() => setSubTab('vitrina')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'vitrina'
                ? 'bg-[#9d3c0c] text-white shadow-sm'
                : 'text-[#7c5641] hover:text-[#1c120c]'
            }`}
          >
            <Cake className="w-4 h-4" />
            <span>Productos Elaborados / Vitrina ({preparations.length})</span>
          </button>
          <button
            onClick={() => setSubTab('stock')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'stock'
                ? 'bg-white text-[#1c120c] shadow-sm'
                : 'text-[#7c5641] hover:text-[#1c120c]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Materias Primas / Insumos ({materials.length})</span>
          </button>
          <button
            onClick={() => setSubTab('kardex')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'kardex'
                ? 'bg-white text-[#1c120c] shadow-sm'
                : 'text-[#7c5641] hover:text-[#1c120c]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Auditoría Kardex</span>
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

      {/* SUBTAB 1: PRODUCTOS ELABORADOS / VITRINA (STOCK DE LO PRODUCIDO) */}
      {subTab === 'vitrina' && (
        <div className="space-y-4">
          {sliceNotice && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-sm ${
              sliceNotice.type === 'success'
                ? 'bg-[#ebffe8] border-[#aecfae] text-[#446147]'
                : 'bg-[#ffdad6] border-[#ba1a1a]/30 text-[#ba1a1a]'
            }`}>
              <div className="flex items-center gap-2 text-sm font-bold">
                {sliceNotice.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                )}
                <span>{sliceNotice.text}</span>
              </div>
              <button
                onClick={() => setSliceNotice(null)}
                className="text-xs font-bold underline px-2 py-1"
              >
                Cerrar
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {preparations.map(prep => {
              const hasStock = (prep.stock_available || 0) > 0;
              const isPortion = prep.unit_type === 'porcion';
              const effective = getEffectiveAvailableStock(prep, preparations);

              return (
                <div
                  key={prep.id}
                  className="bg-white rounded-2xl border border-[#dec0b6] p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#f5ede3] text-[#7c5641]">
                        {getPrepCategoryIcon(prep.category)}
                        <span>{prep.category}</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-[#7c5641]">
                        {prep.code}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#1c120c] leading-snug">
                      {prep.name}
                    </h3>
                    <p className="text-xs text-[#7c5641] mt-1 line-clamp-2">
                      {prep.description || 'Producto artesanal Dulce Taller'}
                    </p>

                    {isPortion && effective.motherPrep && (
                      <div className="mt-2.5 p-2 rounded-xl bg-[#f5ede3]/70 border border-[#dec0b6] text-[11px] text-[#7c5641] space-y-1">
                        <span className="font-bold text-[#9d3c0c] block">
                          🍰 Torta Base: {effective.motherPrep.name}
                        </span>
                        <span>
                          {effective.motherStock} tortas en stock = {effective.motherStock * effective.yieldPerCake} porciones potenciales
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#dec0b6]/50 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#7c5641] font-semibold">
                        {isPortion ? 'Porciones cortadas:' : 'Stock en Vitrina:'}
                      </span>
                      <div className="text-right">
                        <span className={`text-2xl font-serif font-bold ${
                          hasStock ? 'text-[#446147]' : isPortion && effective.motherStock > 0 ? 'text-[#9d3c0c]' : 'text-[#ba1a1a]'
                        }`}>
                          {prep.stock_available}
                        </span>
                        <span className="text-xs text-[#7c5641] ml-1 uppercase font-bold">
                          {prep.unit_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7c5641]">Precio por unidad:</span>
                      <span className="font-bold text-[#1c120c]">
                        ${prep.price.toLocaleString('es-AR')}
                      </span>
                    </div>

                    {prep.unit_type === 'entera' && (
                      <button
                        onClick={() => handleManualSlice(prep.id)}
                        disabled={prep.stock_available <= 0 || isSlicing}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold hover:bg-[#7f2b00] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-md shadow-[#9d3c0c]/20 transition-all"
                        title={prep.stock_available > 0 ? 'Descuenta 1 torta entera y genera porciones listas en vitrina' : 'Sin stock de tortas enteras para cortar'}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Cortar 1 Torta en Porciones (+8)</span>
                      </button>
                    )}

                    {isPortion && (
                      <button
                        onClick={() => handleManualSlice(prep.id)}
                        disabled={effective.motherStock <= 0 || isSlicing}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold hover:bg-[#7f2b00] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-md shadow-[#9d3c0c]/20 transition-all"
                        title={effective.motherStock > 0 ? 'Descuenta 1 torta entera y suma porciones cortadas' : 'No hay tortas enteras para fraccionar'}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Cortar 1 Torta (+{effective.yieldPerCake} porc.)</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenAdjustPrep(prep)}
                      className="w-full py-2 rounded-xl border border-[#dec0b6] bg-[#f5ede3] text-xs font-bold text-[#9d3c0c] hover:bg-[#ffdbce] active:scale-95 transition-all"
                    >
                      Ajustar Stock / Registrar Merma
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: LISTADO DE MATERIAS PRIMAS */}
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
                  const status = getRawMaterialStatus(mat);
                  return (
                    <tr
                      key={mat.id}
                      className={`transition-colors ${status.rowClass}`}
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
                        <span className={`text-base ${status.stockClass}`}>
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
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${status.badgeClass}`}>
                          {status.label}
                        </span>
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

      {/* SUBTAB 3: AUDITORÍA KARDEX */}
      {subTab === 'kardex' && (
        <div className="bg-white rounded-2xl border border-[#dec0b6] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#1c120c]">
              Registro Completo de Movimientos de Stock
            </h3>
            <span className="text-xs text-[#7c5641]">
              Auditoría cronológica de consumos, mermas, entradas y despachos
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
                  const prep = preparations.find(p => p.id === mov.preparation_id);
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
                        {mat ? `${mat.name} (${mat.code})` : prep ? `${prep.name} (Vitrina)` : 'Stock'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold uppercase tracking-wider text-xs px-2 py-0.5 rounded bg-[#efe7dd] text-[#7c5641]">
                          {mov.movement_type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 font-bold ${
                        isPositive ? 'text-[#446147]' : 'text-[#ba1a1a]'
                      }`}>
                        {isPositive ? `+${mov.quantity}` : mov.quantity} {mat?.unit || prep?.unit_type || 'un'}
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

      {/* MODAL AJUSTE DE STOCK (MATERIA PRIMA O PRODUCTO DE VITRINA) */}
      {(selectedMaterial || selectedPrep) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#fff8f2] rounded-2xl border border-[#dec0b6] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#1c120c]">
                Ajustar Stock: {selectedMaterial?.name || selectedPrep?.name}
              </h3>
              <button onClick={() => { setSelectedMaterial(null); setSelectedPrep(null); }}>
                <X className="w-5 h-5 text-[#7c5641]" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-white border border-[#dec0b6] text-xs space-y-1">
                <p className="text-[#7c5641]">
                  Tipo: <span className="font-bold text-[#1c120c]">{selectedMaterial ? 'Materia Prima' : 'Producto Cocinado en Vitrina'}</span>
                </p>
                <p className="text-[#7c5641]">
                  Stock actual en sistema: <span className="font-bold text-[#1c120c]">
                    {selectedMaterial ? `${selectedMaterial.current_stock} ${selectedMaterial.unit}` : `${selectedPrep?.stock_available} ${selectedPrep?.unit_type}`}
                  </span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#7c5641]">
                  Nuevo Stock Físico ({selectedMaterial?.unit || selectedPrep?.unit_type})
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
                  placeholder="Ej. Recuento físico, merma por rotura/vencimiento, reposición"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setSelectedMaterial(null); setSelectedPrep(null); }}
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
