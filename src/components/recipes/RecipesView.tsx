import React, { useState, useEffect } from 'react';
import { Preparation, PreparationIngredient, RawMaterial, PreparationCategory, PreparationUnitType } from '../../types/database';
import { recipeService } from '../../services/recipeService';
import { BookOpen, Plus, Trash2, X, ChefHat } from 'lucide-react';

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
  const visiblePreparations = preparations.filter(
    p => p.code !== 'PREP-020' && (p as any).category !== 'taller' && !p.name?.toLowerCase().includes('taller')
  );
  const [selectedPrep, setSelectedPrep] = useState<Preparation | null>(visiblePreparations[0] || null);

  useEffect(() => {
    if (!selectedPrep || selectedPrep.code === 'PREP-020' || (selectedPrep as any).category === 'taller' || selectedPrep.name?.toLowerCase().includes('taller')) {
      if (visiblePreparations.length > 0) {
        setSelectedPrep(visiblePreparations[0]);
      }
    }
  }, [preparations]);
  const [currentRecipe, setCurrentRecipe] = useState<PreparationIngredient[]>([]);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

  // Modal para agregar ingrediente a receta existente
  const [isAddIngModalOpen, setIsAddIngModalOpen] = useState(false);
  const [selectedRawId, setSelectedRawId] = useState<string>(materials[0]?.id || '');
  const [quantityReq, setQuantityReq] = useState<string>('100');

  // Modal para CREAR NUEVA RECETA COMPLETA
  const [isNewRecipeModalOpen, setIsNewRecipeModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<PreparationCategory>('pasteleria');
  const [newUnitType, setNewUnitType] = useState<PreparationUnitType>('porcion');
  const [newPrice, setNewPrice] = useState('3500');
  const [newYield, setNewYield] = useState('1');
  const [newDescription, setNewDescription] = useState('');
  const [newIngredients, setNewIngredients] = useState<{ raw_material_id: string; quantity: number }[]>([]);
  const [isSavingNewRecipe, setIsSavingNewRecipe] = useState(false);
  const [prepToDelete, setPrepToDelete] = useState<Preparation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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





  const confirmDeletePreparation = async (prep: Preparation) => {
    setIsDeleting(true);
    try {
      await recipeService.deletePreparation(prep.id);
      setPrepToDelete(null);
      if (selectedPrep?.id === prep.id) {
        setSelectedPrep(null);
      }
      await onRefresh();
    } catch (err: any) {
      alert('Error al eliminar preparación: ' + (err.message || ''));
    } finally {
      setIsDeleting(false);
    }
  };

  // Crear nueva receta
  const handleOpenNewRecipe = () => {
    const nextNumber = preparations.length + 1;
    const codeSuggestion = `PREP-${nextNumber < 10 ? '00' : '0'}${nextNumber}`;
    setNewCode(codeSuggestion);
    setNewName('');
    setNewDescription('');
    setNewPrice('3500');
    setNewYield('1');
    setNewIngredients([]);
    setIsNewRecipeModalOpen(true);
  };

  const handleAddIngredientToDraft = (rawId: string, qty: number) => {
    setNewIngredients(prev => {
      const filtered = prev.filter(p => p.raw_material_id !== rawId);
      return [...filtered, { raw_material_id: rawId, quantity: qty }];
    });
  };

  const handleRemoveIngredientFromDraft = (rawId: string) => {
    setNewIngredients(prev => prev.filter(p => p.raw_material_id !== rawId));
  };

  const handleSaveNewRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    setIsSavingNewRecipe(true);
    try {
      const created = await recipeService.createPreparation({
        code: newCode.trim(),
        name: newName.trim(),
        category: newCategory,
        description: newDescription.trim() || undefined,
        unit_type: newUnitType,
        portion_yield: parseFloat(newYield) || 1,
        price: parseFloat(newPrice) || 0,
        stock_available: 0,
        is_active: true
      });

      // Guardar ingredientes asociados si se cargaron
      if (newIngredients.length > 0) {
        const ingredientsPayload = newIngredients.map(ing => {
          const mat = materials.find(m => m.id === ing.raw_material_id);
          return {
            raw_material_id: ing.raw_material_id,
            quantity_required: ing.quantity,
            unit: mat?.unit || 'gr'
          };
        });
        await recipeService.saveRecipe(created.id, ingredientsPayload);
      }

      setIsNewRecipeModalOpen(false);
      await onRefresh();
      setSelectedPrep(created);
    } finally {
      setIsSavingNewRecipe(false);
    }
  };

  // Cálculo de costo teórico
  const theoreticalCost = recipeService.calculateRecipeCost(currentRecipe, materials);
  const margin = selectedPrep && selectedPrep.price > 0 
    ? ((selectedPrep.price - theoreticalCost) / selectedPrep.price) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Header con Botón para Crear Nueva Receta */}
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
              Composición de insumos por unidad elaborada, costeo teórico y margen
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenNewRecipe}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-md shadow-[#9d3c0c]/20 hover:bg-[#7f2b00] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Receta / Preparación</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector de Preparaciones */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
            Preparaciones Registradas ({visiblePreparations.length})
          </label>
          <div className="space-y-2">
            {visiblePreparations.map(prep => {
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
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-[#7c5641]">
                        {prep.code}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrepToDelete(prep);
                        }}
                        className="p-1 rounded-lg text-[#7c5641] hover:text-[#ba1a1a] hover:bg-[#ffdad6] active:scale-95 transition-all"
                        title={`Eliminar ${prep.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPrepToDelete(selectedPrep)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab] text-xs font-bold transition-all"
                    title="Eliminar preparación"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Receta</span>
                  </button>
                  <button
                    onClick={() => setIsAddIngModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-sm hover:bg-[#7f2b00] active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Agregar Ingrediente</span>
                  </button>
                </div>
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
                    Precio Venta
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

      {/* MODAL CREAR NUEVA RECETA COMPLETA */}
      {isNewRecipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <div className="bg-[#fff8f2] rounded-3xl border border-[#dec0b6] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#9d3c0c] text-white rounded-xl">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1c120c]">
                    Nueva Receta / Preparación
                  </h3>
                  <p className="text-xs text-[#7c5641]">
                    Carga el producto y sus materias primas requeridas
                  </p>
                </div>
              </div>
              <button onClick={() => setIsNewRecipeModalOpen(false)}>
                <X className="w-5 h-5 text-[#7c5641]" />
              </button>
            </div>

            <form onSubmit={handleSaveNewRecipe} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7c5641]">Código de Ficha</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7c5641]">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold"
                  >
                    <option value="pasteleria">Pastelería</option>
                    <option value="cafeteria">Cafetería</option>

                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#7c5641]">Nombre de la Preparación</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Tarta de Frutillas o Cheesecake"
                  className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7c5641]">Tipo de Unidad</label>
                  <select
                    value={newUnitType}
                    onChange={(e) => setNewUnitType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold"
                  >
                    <option value="porcion">Porción</option>
                    <option value="entera">Torta Entera</option>
                    <option value="taza">Taza / Bebida</option>

                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7c5641]">Rendimiento</label>
                  <input
                    type="number"
                    step="any"
                    value={newYield}
                    onChange={(e) => setNewYield(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#7c5641]">Precio Venta ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold text-[#9d3c0c]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#7c5641]">Descripción</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detalles sobre presentación, conservación o servicio..."
                  className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs"
                />
              </div>

              {/* Sección Ingredientes Iniciales */}
              <div className="pt-2 border-t border-[#dec0b6] space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
                  Ingredientes de la Receta ({newIngredients.length})
                </label>

                <div className="space-y-2">
                  {newIngredients.map((item, idx) => {
                    const mat = materials.find(m => m.id === item.raw_material_id);
                    return (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-[#dec0b6] flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1c120c]">{mat?.name} ({mat?.code})</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#9d3c0c]">{item.quantity} {mat?.unit}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredientFromDraft(item.raw_material_id)}
                            className="text-[#ba1a1a] hover:bg-[#ffdad6] p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Agregar insumo al borrador */}
                <div className="p-3 bg-[#efe7dd] rounded-xl flex items-center gap-2">
                  <select
                    id="draft_select_raw"
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#dec0b6] bg-white text-xs font-bold"
                  >
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.code}) - {m.unit}</option>
                    ))}
                  </select>
                  <input
                    id="draft_qty"
                    type="number"
                    step="any"
                    placeholder="Cant."
                    defaultValue="100"
                    className="w-20 px-2 py-1.5 rounded-lg border border-[#dec0b6] bg-white text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const sel = document.getElementById('draft_select_raw') as HTMLSelectElement;
                      const qty = document.getElementById('draft_qty') as HTMLInputElement;
                      if (sel && qty) {
                        handleAddIngredientToDraft(sel.value, parseFloat(qty.value) || 0);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#9d3c0c] text-white text-xs font-bold hover:bg-[#7f2b00]"
                  >
                    + Añadir
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#dec0b6]">
                <button
                  type="button"
                  onClick={() => setIsNewRecipeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#dec0b6] text-xs font-bold text-[#7c5641]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingNewRecipe}
                  className="px-5 py-2.5 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-md hover:bg-[#7f2b00] active:scale-95 disabled:opacity-50"
                >
                  {isSavingNewRecipe ? 'Guardando...' : 'Crear Receta Completa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Ingrediente a Receta Existente */}
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
      {/* Modal Confirmar Eliminación de Receta / Preparación */}
      {prepToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#fff8f2] rounded-2xl border border-[#dec0b6] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-[#dec0b6] bg-[#fcf0ed] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#ba1a1a]">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-serif font-bold text-lg text-[#1c120c]">
                  ¿Eliminar Preparación / Receta?
                </h3>
              </div>
              <button onClick={() => setPrepToDelete(null)} disabled={isDeleting}>
                <X className="w-5 h-5 text-[#7c5641]" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 bg-white rounded-xl border border-[#dec0b6]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f5ede3] text-[#7c5641]">
                    {prepToDelete.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#7c5641]">
                    {prepToDelete.code}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-lg text-[#1c120c] mt-1">
                  {prepToDelete.name}
                </h4>
                <p className="text-xs text-[#7c5641] mt-0.5">
                  {prepToDelete.description || 'Sin descripción'}
                </p>
              </div>

              <div className="p-3 bg-[#ffdad6]/60 border border-[#ba1a1a]/20 rounded-xl text-xs text-[#ba1a1a] leading-relaxed">
                <strong>Atención:</strong> Esta acción borrará la ficha técnica con todos sus ingredientes y retirará el producto de la vitrina y de la toma de comandas.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPrepToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl border border-[#dec0b6] text-xs font-bold text-[#7c5641] hover:bg-[#efe7dd] active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeletePreparation(prepToDelete)}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#ba1a1a] text-white text-xs font-bold shadow-md shadow-[#ba1a1a]/20 hover:bg-[#93000a] active:scale-95 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Eliminando...' : 'Sí, Eliminar Receta'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};