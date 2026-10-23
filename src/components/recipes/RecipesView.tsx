import React, { useState, useEffect } from 'react';
import { Preparation, PreparationIngredient, RawMaterial } from '../../types/database';
import { recipeService } from '../../services/recipeService';
import { BookOpen, Plus, Trash2, X } from 'lucide-react';

interface RecipesViewProps {
  preparations: Preparation[];
  materials: RawMaterial[];
  onRefresh: () => Promise<void>;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  preparations,
  materials,
  onRefresh
}) => {
  const [selectedPrep, setSelectedPrep] = useState<Preparation | null>(preparations[0] || null);
  const [currentRecipe, setCurrentRecipe] = useState<PreparationIngredient[]>([]);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

  // Modal para agregar ingrediente
  const [isAddIngModalOpen, setIsAddIngModalOpen] = useState(false);
  const [selectedRawId, setSelectedRawId] = useState<string>(materials[0]?.id || '');
  const [quantityReq, setQuantityReq] = useState<string>('100');

  useEffect(() => {
    if (selectedPrep) {
      loadRecipe(selectedPrep.id);
    }
  }, [selectedPrep]);

  const loadRecipe = async (prepId: string) => {
    setIsLoadingRecipe(true);
    try {
      const data = await recipeService.getRecipe(prepId);
      setCurrentRecipe(data);
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrep || !selectedRawId) return;

    const raw = materials.find(m => m.id === selectedRawId);
    if (!raw) return;

    const qty = parseFloat(quantityReq);
    if (isNaN(qty) || qty <= 0) return;

    const updated = [
      ...currentRecipe.filter(r => r.raw_material_id !== selectedRawId),
      {
        raw_material_id: selectedRawId,
        quantity_required: qty,
        unit: raw.unit
      }
    ];

    await recipeService.saveRecipe(selectedPrep.id, updated);
    setIsAddIngModalOpen(false);
    await loadRecipe(selectedPrep.id);
    await onRefresh();
  };

  const handleRemoveIngredient = async (rawId: string) => {
    if (!selectedPrep) return;
    const updated = currentRecipe
      .filter(r => r.raw_material_id !== rawId)
      .map(r => ({
        raw_material_id: r.raw_material_id,
        quantity_required: r.quantity_required,
        unit: r.unit
      }));
    await recipeService.saveRecipe(selectedPrep.id, updated);
    await loadRecipe(selectedPrep.id);
    await onRefresh();
  };

  // Cálculo de costo teórico
  const theoreticalCost = recipeService.calculateRecipeCost(currentRecipe, materials);
  const margin = selectedPrep && selectedPrep.price > 0 
    ? ((selectedPrep.price - theoreticalCost) / selectedPrep.price) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-[#dec0b6] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f5ede3] text-[#9d3c0c] rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1c120c]">
              Fichas Técnicas & Recetas Estándar
            </h2>
            <p className="text-xs text-[#7c5641]">
              Composición de insumos por unidad elaborada y costeo teórico
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector de Preparaciones */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
            Selecciona una Preparación
          </label>
          <div className="space-y-2">
            {preparations.map(prep => {
              const isSelected = selectedPrep?.id === prep.id;
              return (
                <div
                  key={prep.id}
                  onClick={() => setSelectedPrep(prep)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#ffdbce]/40 border-[#9d3c0c] ring-2 ring-[#9d3c0c]/30 shadow-sm'
                      : 'bg-white border-[#dec0b6] hover:bg-[#fffbf8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f5ede3] text-[#7c5641]">
                      {prep.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#7c5641]">
                      {prep.code}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-[#1c120c] mt-1">
                    {prep.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#dec0b6]/40 text-xs">
                    <span className="text-[#7c5641]">
                      Precio venta: <strong className="text-[#1c120c]">${prep.price.toLocaleString('es-AR')}</strong>
                    </span>
                    <span className="font-bold text-[#446147]">
                      Vitrina: {prep.stock_available} {prep.unit_type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalle de Receta e Ingredientes */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPrep ? (
            <div className="bg-white rounded-2xl border border-[#dec0b6] p-6 shadow-sm space-y-6">
              {/* Header Ficha Técnica */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#dec0b6]">
                <div>
                  <span className="text-xs font-mono font-bold text-[#9d3c0c]">
                    FICHA TÉCNICA {selectedPrep.code}
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-[#1c120c]">
                    {selectedPrep.name}
                  </h3>
                  <p className="text-xs text-[#7c5641] mt-0.5">
                    {selectedPrep.description || 'Sin descripción'}
                  </p>
                </div>

                <button
                  onClick={() => setIsAddIngModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-sm hover:bg-[#7f2b00] active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Agregar Ingrediente</span>
                </button>
              </div>

              {/* Métricas de Costeo */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#f5ede3] border border-[#dec0b6]">
                  <span className="text-[11px] font-bold text-[#7c5641] uppercase block">
                    Costo Insumos
                  </span>
                  <span className="text-lg font-bold text-[#1c120c]">
                    ${theoreticalCost.toFixed(2)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f5ede3] border border-[#dec0b6]">
                  <span className="text-[11px] font-bold text-[#7c5641] uppercase block">
                    Precio Sugerido
                  </span>
                  <span className="text-lg font-bold text-[#9d3c0c]">
                    ${selectedPrep.price.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f5ede3] border border-[#dec0b6]">
                  <span className="text-[11px] font-bold text-[#7c5641] uppercase block">
                    Margen Teórico
                  </span>
                  <span className="text-lg font-bold text-[#446147]">
                    {margin.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Tabla de Ingredientes de la Receta */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
                  Ingredientes Requeridos por Unidad Producida
                </h4>

                {isLoadingRecipe ? (
                  <div className="p-6 text-center text-xs text-[#7c5641]">Cargando receta...</div>
                ) : currentRecipe.length === 0 ? (
                  <div className="p-6 text-center bg-[#fff8f2] rounded-xl border border-dashed border-[#dec0b6] text-xs text-[#7c5641]">
                    Esta preparación aún no tiene ingredientes asignados. Haz clic en "+ Agregar Ingrediente".
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#dec0b6] overflow-hidden">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-[#f5ede3] text-[#7c5641] text-xs uppercase font-bold">
                          <th className="py-2.5 px-3">Insumo</th>
                          <th className="py-2.5 px-3">Cantidad Requerida</th>
                          <th className="py-2.5 px-3">Costo Unit.</th>
                          <th className="py-2.5 px-3">Subtotal</th>
                          <th className="py-2.5 px-3 text-right">Quitar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dec0b6]/50">
                        {currentRecipe.map(ing => {
                          const mat = materials.find(m => m.id === ing.raw_material_id);
                          const subtotal = mat ? ing.quantity_required * mat.unit_cost : 0;

                          return (
                            <tr key={ing.id} className="hover:bg-[#fffbf8] text-xs font-medium">
                              <td className="py-2.5 px-3 font-bold text-[#1c120c]">
                                {mat?.name || 'Insumo'} <span className="font-mono text-[10px] text-[#7c5641]">({mat?.code})</span>
                              </td>
                              <td className="py-2.5 px-3 font-bold text-[#9d3c0c]">
                                {ing.quantity_required} {ing.unit}
                              </td>
                              <td className="py-2.5 px-3 text-[#7c5641]">
                                ${mat?.unit_cost.toFixed(2) || '0.00'}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-[#1c120c]">
                                ${subtotal.toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => handleRemoveIngredient(ing.raw_material_id)}
                                  className="p-1 rounded text-[#ba1a1a] hover:bg-[#ffdad6] active:scale-95"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#dec0b6] text-sm text-[#7c5641]">
              Selecciona una preparación para ver su ficha técnica
            </div>
          )}
        </div>
      </div>

      {/* Modal Agregar Ingrediente */}
      {isAddIngModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#fff8f2] rounded-2xl border border-[#dec0b6] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#1c120c]">
                Agregar Ingrediente a {selectedPrep?.name}
              </h3>
              <button onClick={() => setIsAddIngModalOpen(false)}>
                <X className="w-5 h-5 text-[#7c5641]" />
              </button>
            </div>

            <form onSubmit={handleAddIngredient} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#7c5641]">Materia Prima / Insumo</label>
                <select
                  value={selectedRawId}
                  onChange={(e) => setSelectedRawId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold text-[#1c120c]"
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code}) - {m.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#7c5641]">
                  Cantidad Requerida por Unidad
                </label>
                <input
                  type="number"
                  step="any"
                  value={quantityReq}
                  onChange={(e) => setQuantityReq(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-sm font-bold text-[#1c120c]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddIngModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#dec0b6] text-xs font-bold text-[#7c5641] hover:bg-[#efe7dd]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-md hover:bg-[#7f2b00] active:scale-95"
                >
                  Guardar Ingrediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
