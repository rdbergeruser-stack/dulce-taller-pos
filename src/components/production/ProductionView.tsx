import React, { useState, useEffect } from 'react';
import { Preparation, RawMaterial } from '../../types/database';
import { productionService, ProductionRequirementPreview } from '../../services/productionService';
import { CookingPot, CheckCircle, AlertOctagon, ShieldCheck } from 'lucide-react';

interface ProductionViewProps {
  preparations: Preparation[];
  materials: RawMaterial[];
  initialPreparationId?: string;
  onProductionCompleted: () => Promise<void>;
}

export const ProductionView: React.FC<ProductionViewProps> = ({
  preparations,
  materials,
  initialPreparationId,
  onProductionCompleted
}) => {
  const produciblePreparations = preparations.filter(p => p.unit_type !== 'porcion');
  const [selectedPrepId, setSelectedPrepId] = useState<string>(
    initialPreparationId || produciblePreparations[0]?.id || preparations[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [requirements, setRequirements] = useState<ProductionRequirementPreview[]>([]);
  const [canProduce, setCanProduce] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string; batch?: string } | null>(null);

  // Sincronizar selección si cambia initialPreparationId desde una notificación externa
  useEffect(() => {
    if (initialPreparationId && produciblePreparations.some(p => p.id === initialPreparationId)) {
      setSelectedPrepId(initialPreparationId);
    }
  }, [initialPreparationId]);

  // Asegurar que si cambian las preparaciones o está seleccionada una porción, seleccione una preparación válida
  useEffect(() => {
    if (produciblePreparations.length > 0 && !produciblePreparations.some(p => p.id === selectedPrepId)) {
      setSelectedPrepId(produciblePreparations[0].id);
    }
  }, [preparations]);

  const selectedPrep = preparations.find(p => p.id === selectedPrepId);

  useEffect(() => {
    if (selectedPrepId && quantity > 0) {
      calculatePreview();
    }
  }, [selectedPrepId, quantity, materials]);

  const calculatePreview = async () => {
    if (!selectedPrepId) return;
    const res = await productionService.getRequirementsPreview(selectedPrepId, quantity, materials);
    setRequirements(res.requirements);
    setCanProduce(res.canProduce);
  };

  const handleConfirmProduction = async () => {
    if (!canProduce || !selectedPrepId) return;

    setIsSubmitting(true);
    setResultMessage(null);

    try {
      const res = await productionService.confirmProduction(
        selectedPrepId,
        quantity,
        undefined,
        notes.trim() || undefined
      );

      setResultMessage({
        type: 'success',
        text: res.message,
        batch: res.batchCode
      });
      setNotes('');
      await onProductionCompleted();
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Error al procesar la confirmación de producción.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Informativo */}
      <div className="bg-white p-5 rounded-2xl border border-[#dec0b6] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f5ede3] text-[#9d3c0c] rounded-xl">
            <CookingPot className="w-6 h-6" aria-hidden="true" focusable="false" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1c120c]">
              Registro de Producción Terminada
            </h2>
            <p className="text-xs text-[#7c5641]">
              Descuento atómico de materias primas e ingreso de producto cocinado al stock de vitrina
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5ede3] border border-[#dec0b6] text-xs font-semibold text-[#7c5641]">
          <ShieldCheck className="w-4 h-4 text-[#446147]" aria-hidden="true" focusable="false" />
          <span>Validación Transaccional Activa</span>
        </div>
      </div>

      {resultMessage && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${
          resultMessage.type === 'success'
            ? 'bg-[#ebffe8] border-[#aecfae] text-[#446147]'
            : 'bg-[#ffdad6] border-[#ba1a1a]/30 text-[#ba1a1a]'
        }`}>
          {resultMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" focusable="false" />
          ) : (
            <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" focusable="false" />
          )}
          <div>
            <p className="font-bold text-sm">{resultMessage.text}</p>
            {resultMessage.batch && (
              <p className="text-xs mt-0.5 font-mono font-bold">
                Lote generado: {resultMessage.batch}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Configuración de Lote */}
        <div className="bg-white rounded-2xl border border-[#dec0b6] p-6 shadow-sm space-y-5">
          <h3 className="font-serif font-bold text-lg text-[#1c120c] pb-3 border-b border-[#dec0b6]">
            1. Definir Lote a Cocinar
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="prod-prep-select" className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
                Preparación / Torta Base
              </label>
              <span className="text-xs text-[#7c5641] font-medium bg-[#f5ede3] px-2 py-0.5 rounded-full border border-[#dec0b6]">
                Tortas Enteras y Cafetería
              </span>
            </div>
            <select
              id="prod-prep-select"
              value={selectedPrepId}
              onChange={(e) => setSelectedPrepId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#dec0b6] bg-[#fff8f2] text-sm font-bold text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
            >
              {produciblePreparations.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category}) - Stock actual: {p.stock_available} {p.unit_type}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#7c5641] italic">
              💡 Las porciones individuales no se cocinan directamente con materias primas: se hornea la <strong>Torta Entera</strong> y el sistema fracciona las porciones automáticamente en vitrina.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="prod-quantity-input" className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
              Cantidad a Producir ({selectedPrep?.unit_type || 'un'})
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 4, 8].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuantity(num)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    quantity === num
                      ? 'bg-[#9d3c0c] text-white border-[#9d3c0c]'
                      : 'bg-[#f5ede3] text-[#7c5641] border-[#dec0b6] hover:bg-[#efe7dd]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <input
              id="prod-quantity-input"
              type="number"
              min="0.1"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="w-full mt-2 px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-base font-bold text-center text-[#1c120c]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="prod-notes-input" className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
              Notas de Producción (Opcional)
            </label>
            <input
              id="prod-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Tanda para evento especial / reposición de vitrina"
              className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs text-[#1c120c]"
            />
          </div>
        </div>

        {/* Vista Previa de Consumo de Insumos */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dec0b6] p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#dec0b6]">
              <h3 className="font-serif font-bold text-lg text-[#1c120c]">
                2. Vista Previa de Descuento de Insumos
              </h3>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                canProduce
                  ? 'bg-[#ebffe8] text-[#446147]'
                  : 'bg-[#ffdad6] text-[#ba1a1a]'
              }`}>
                {canProduce ? 'Stock Disponible Suficiente' : 'Stock Insuficiente'}
              </span>
            </div>

            {requirements.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7c5641] bg-[#fff8f2] rounded-xl border border-dashed border-[#dec0b6]">
                Esta preparación no tiene ingredientes configurados en su receta.
              </div>
            ) : (
              <div className="rounded-xl border border-[#dec0b6] overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#f5ede3] text-[#7c5641] text-xs uppercase font-bold">
                      <th className="py-2.5 px-3">Materia Prima</th>
                      <th className="py-2.5 px-3 text-right">Stock Actual</th>
                      <th className="py-2.5 px-3 text-right">Consumo Requerido</th>
                      <th className="py-2.5 px-3 text-right">Stock Post-Cocción</th>
                      <th className="py-2.5 px-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dec0b6]/50">
                    {requirements.map((req, i) => {
                      const postStock = req.availableStock - req.quantityRequired;
                      return (
                        <tr
                          key={i}
                          className={`text-xs font-medium ${
                            !req.isSufficient ? 'bg-[#ffdad6]/30' : 'hover:bg-[#fffbf8]'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold text-[#1c120c]">
                            {req.rawMaterial.name}
                            <span className="font-mono text-xs text-[#7c5641] ml-1">
                              ({req.rawMaterial.code})
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#7c5641]">
                            {req.availableStock.toLocaleString('es-AR')} {req.rawMaterial.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#9d3c0c]">
                            -{req.quantityRequired.toLocaleString('es-AR')} {req.rawMaterial.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold">
                            <span className={postStock < 0 ? 'text-[#ba1a1a]' : 'text-[#446147]'}>
                              {postStock.toLocaleString('es-AR')} {req.rawMaterial.unit}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {req.isSufficient ? (
                              <span className="text-xs font-bold text-[#446147] bg-[#ebffe8] px-2 py-0.5 rounded-full">
                                OK
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                                Faltan {(req.quantityRequired - req.availableStock).toFixed(1)} {req.rawMaterial.unit}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Botón de Confirmación Transaccional */}
          <div className="pt-4 border-t border-[#dec0b6] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#7c5641]">
              Al confirmar, los insumos se descuentan <strong>una sola vez</strong> y se agregan{' '}
              <strong>{quantity} {selectedPrep?.unit_type}</strong> a la vitrina lista para despacho.
            </p>

            <button
              onClick={handleConfirmProduction}
              disabled={!canProduce || isSubmitting || requirements.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#9d3c0c] text-white text-sm font-bold shadow-md shadow-[#9d3c0c]/30 hover:bg-[#7f2b00] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <CookingPot className="w-5 h-5" aria-hidden="true" focusable="false" />
              <span>
                {isSubmitting ? 'Procesando Lote...' : `Confirmar Producción (${quantity} un)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
