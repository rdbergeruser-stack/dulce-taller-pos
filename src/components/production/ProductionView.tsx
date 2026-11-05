import React, { useState, useEffect } from 'react';
import { Preparation, RawMaterial, ProductionOrder, ProductionRequest } from '../../types/database';
import { productionService, ProductionRequirementPreview } from '../../services/productionService';
import { productionOrderService } from '../../services/productionOrderService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CookingPot, 
  CheckCircle, 
  AlertOctagon, 
  ShieldCheck, 
  ChefHat, 
  Clock, 
  Send, 
  ClipboardList,
  CheckCircle2,
  Trash2,
  Bell,
  Zap
} from 'lucide-react';

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
  const { user, isAdmin, isCocinero } = useAuth();
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

  // Órdenes de producción asignadas por el Administrador
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [productionRequests, setProductionRequests] = useState<ProductionRequest[]>([]);

  const loadData = () => {
    setProductionOrders(productionOrderService.getProductionOrders());
    setProductionRequests(productionOrderService.getProductionRequests().filter(r => r.status === 'pendiente'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickAuthorize = (prepId: string, qty: number, prepName: string, requestedBy?: string) => {
    try {
      productionOrderService.assignProductionOrder({
        preparation_id: prepId,
        quantity: qty,
        assigned_by: user?.full_name || 'Administración',
        notes: requestedBy ? `Autorizado por solicitud de ${requestedBy}` : 'Autorizado por bajo stock en vitrina'
      });
      setResultMessage({
        type: 'success',
        text: `¡Producción autorizada y asignada a Cocina! ${qty}x ${prepName}. El cocinero ya la tiene en su panel.`
      });
      loadData();
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Error al autorizar la producción.'
      });
    }
  };

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

  // 1. Administrador: Asignar Orden de Producción al Cocinero
  const handleAssignToKitchen = () => {
    if (!selectedPrepId || !selectedPrep) return;
    try {
      const assigned = productionOrderService.assignProductionOrder({
        preparation_id: selectedPrepId,
        quantity,
        assigned_by: user?.full_name || 'Administración',
        notes: notes.trim() || undefined
      });

      setResultMessage({
        type: 'success',
        text: `Orden de producción asignada a Cocina: ${assigned.quantity}x ${selectedPrep.name}. El cocinero ya tiene la indicación en su panel.`
      });
      setNotes('');
      loadData();
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Error al asignar la orden a cocina.'
      });
    }
  };

  // 2. Administrador: Producir en el acto directamente
  const handleDirectProduction = async () => {
    if (!canProduce || !selectedPrepId) return;

    setIsSubmitting(true);
    setResultMessage(null);

    try {
      const res = await productionService.confirmProduction(
        selectedPrepId,
        quantity,
        user?.id,
        notes.trim() || undefined
      );

      setResultMessage({
        type: 'success',
        text: res.message,
        batch: res.batchCode
      });
      setNotes('');
      await onProductionCompleted();
      loadData();
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Error al procesar la confirmación de producción.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper para resolver la preparación real (incluso si viene de un ID mock como 'p-1')
  const resolvePreparation = (prepId: string): Preparation | undefined => {
    return preparations.find(p => 
      p.id === prepId || 
      (prepId === 'p-1' && (p.code === 'PREP-001' || p.name.toLowerCase().includes('lemon'))) ||
      (prepId === 'p-2' && (p.code === 'PREP-002' || p.name.toLowerCase().includes('porción') || p.name.toLowerCase().includes('porcion'))) ||
      (prepId === 'p-3' && (p.code === 'PREP-010' || p.name.toLowerCase().includes('café') || p.name.toLowerCase().includes('cafe')))
    ) || preparations.find(p => p.unit_type === 'entera') || preparations[0];
  };

  // 3. Cocinero: Elaborar y completar una orden indicada por el Administrador
  const handleCookAssignedOrder = async (order: ProductionOrder) => {
    setIsSubmitting(true);
    setResultMessage(null);

    const targetPrep = resolvePreparation(order.preparation_id);
    if (!targetPrep) {
      setResultMessage({
        type: 'error',
        text: 'No se encontró la preparación a elaborar.'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Descuento atómico de insumos e ingreso a vitrina con el ID válido
      const res = await productionService.confirmProduction(
        targetPrep.id,
        order.quantity,
        user?.id,
        order.notes ? `Orden asignada por ${order.assigned_by}: ${order.notes}` : `Orden de producción de ${order.assigned_by}`
      );

      // 2. Marcar orden como completada con lote generado
      productionOrderService.completeProductionOrder(
        order.id,
        user?.full_name || 'Mateo Benítez (Cocinero)',
        res.batchCode
      );

      setResultMessage({
        type: 'success',
        text: `¡Lote cocinado y finalizado con éxito! Se ingresaron ${order.quantity} unidades a la vitrina lista para venta.`,
        batch: res.batchCode
      });

      await onProductionCompleted();
      loadData();
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Error al completar la cocción de la orden.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    productionOrderService.cancelProductionOrder(orderId);
    loadData();
  };

  const pendingOrders = productionOrders.filter(o => o.status === 'pendiente');
  const completedOrders = productionOrders.filter(o => o.status === 'completada').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner Informativo Adaptado a Rol */}
      <div className="bg-white p-5 rounded-2xl border border-[#dec0b6] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f5ede3] text-[#9d3c0c] rounded-xl">
            {isCocinero ? <ChefHat className="w-6 h-6" aria-hidden="true" focusable="false" /> : <CookingPot className="w-6 h-6" aria-hidden="true" focusable="false" />}
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1c120c]">
              {isCocinero ? 'Taller de Cocina & Elaboración' : 'Registro & Asignación de Producción'}
            </h2>
            <p className="text-xs text-[#7c5641]">
              {isCocinero 
                ? 'Elaboración de las preparaciones indicadas por la Administración. Cocinas y finalizas lotes para vitrina.'
                : 'Indica al cocinero las preparaciones a elaborar o registra producción directa con validación transaccional.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5ede3] border border-[#dec0b6] text-xs font-semibold text-[#7c5641]">
          <ShieldCheck className="w-4 h-4 text-[#446147]" aria-hidden="true" focusable="false" />
          <span>{isCocinero ? 'Modo Cocinero • Recetas Indicadas' : 'Validación Transaccional Activa'}</span>
        </div>
      </div>

      {resultMessage && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm animate-fadeIn ${
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
                Lote generado y registrado en Kardex: {resultMessage.batch}
              </p>
            )}
          </div>
        </div>
      )}

      {/* VISTA PARA COCINERO: Órdenes de Producción Asignadas por el Administrador */}
      {isCocinero && (
        <div className="space-y-6">
          <div className="bg-[#fff8f2] p-5 rounded-2xl border border-[#dec0b6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#dec0b6]">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#9d3c0c]" aria-hidden="true" focusable="false" />
                <h3 className="font-serif font-bold text-lg text-[#1c120c]">
                  Órdenes de Producción Asignadas por la Administración ({pendingOrders.length})
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#ffdbce] text-[#9d3c0c] font-bold border border-[#dec0b6]">
                {pendingOrders.length === 0 ? 'Sin tareas pendientes' : 'Pendientes de cocinar'}
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-8 text-center text-[#7c5641] space-y-2">
                <ChefHat className="w-10 h-10 text-[#dec0b6] mx-auto" aria-hidden="true" focusable="false" />
                <p className="font-bold text-sm text-[#1c120c]">
                  ¡Al día! No tienes órdenes de producción pendientes asignadas por el Administrador.
                </p>
                <p className="text-xs">
                  Concéntrate en la elaboración y despacho de las comandas activas en la pestaña <strong>Comandas & KDS</strong>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {pendingOrders.map(order => {
                  const prep = resolvePreparation(order.preparation_id);
                  const prepName = prep?.name || 'Lemon Pie (Torta Entera)';

                  return (
                    <div 
                      key={order.id}
                      className="p-5 rounded-2xl border border-[#dec0b6] bg-white shadow-sm flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#dec0b6]/50">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9d3c0c]">
                              {prep?.category || 'Pastelería'}
                            </span>
                            <h4 className="font-serif font-bold text-lg text-[#1c120c]">
                              {prepName}
                            </h4>
                            <p className="text-xs text-[#7c5641]">
                              Indicado por: <strong>{order.assigned_by}</strong>
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] text-xs font-bold border border-[#fde68a]">
                            Cantidad: {order.quantity} {prep?.unit_type || 'un'}
                          </span>
                        </div>

                        {order.notes && (
                          <div className="my-3 p-2.5 rounded-xl bg-[#fff8f2] border border-[#dec0b6] text-xs text-[#7c5641]">
                            <span className="font-bold block text-[#1c120c]">Instrucción de la Encargada:</span>
                            {order.notes}
                          </div>
                        )}

                        <div className="text-xs text-[#7c5641] flex items-center gap-1 mt-2">
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                          <span>Asignado hace un momento</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCookAssignedOrder(order)}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#9d3c0c] text-white text-sm font-bold shadow-md shadow-[#9d3c0c]/25 hover:bg-[#7f2b00] active:scale-95 disabled:opacity-50 transition-all"
                      >
                        <CookingPot className="w-4 h-4" aria-hidden="true" focusable="false" />
                        <span>{isSubmitting ? 'Cocinando Lote...' : `Cocinar y Finalizar ${order.quantity} ${prep?.unit_type || 'un'}`}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Historial de Lotes Cocinados Recientes */}
          {completedOrders.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-[#dec0b6] shadow-xs space-y-3">
              <h3 className="font-serif font-bold text-base text-[#1c120c] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#446147]" aria-hidden="true" focusable="false" />
                Últimos Lotes Cocinados en este Turno
              </h3>
              <div className="divide-y divide-[#dec0b6]/50">
                {completedOrders.map(order => {
                  const prep = preparations.find(p => p.id === order.preparation_id);
                  return (
                    <div key={order.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#1c120c]">{order.quantity}x {prep?.name}</span>
                        <span className="text-[#7c5641] ml-2">Lote: {order.batch_code}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#ebffe8] text-[#446147] font-bold">
                        Ingresado a Vitrina
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISTA PARA ADMINISTRADOR: Formulario para Indicar/Asignar o Producir + Gestión de Órdenes */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Panel de Autorización Rápida: Solicitudes de Cocina y Productos con Bajo Stock */}
          {(productionRequests.length > 0 || preparations.some(p => p.unit_type !== 'porcion' && p.stock_available <= 1)) && (
            <div className="bg-[#fff8f2] p-5 rounded-2xl border border-[#dec0b6] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#dec0b6]">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#9d3c0c] animate-bounce" />
                  <h3 className="font-serif font-bold text-lg text-[#1c120c]">
                    Autorización de Producción para Productos de Bajo Stock & Solicitudes de Cocina
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#fef3c7] text-[#92400e] font-bold border border-[#fde68a]">
                  Atención de Administración
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Solicitudes directas del Cocinero */}
                {productionRequests.map(req => (
                  <div key={req.id} className="p-4 rounded-xl border border-[#9d3c0c]/40 bg-white shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ffdbce] text-[#9d3c0c] border border-[#9d3c0c]/30">
                          🔔 Solicitado por {req.requested_by}
                        </span>
                        <h4 className="font-serif font-bold text-base text-[#1c120c] mt-1">
                          {req.preparation_name}
                        </h4>
                        <p className="text-xs text-[#7c5641]">
                          Stock crítico actual en vitrina: <strong>{req.current_stock} {req.unit_type}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#dec0b6]/50">
                      <button
                        type="button"
                        onClick={() => handleQuickAuthorize(req.preparation_id, 2, req.preparation_name, req.requested_by)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold hover:bg-[#7f2b00] shadow-sm active:scale-95 transition-all"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Autorizar y Asignar (+2 un)</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* 2. Productos de vitrina con bajo stock no solicitados aún */}
                {preparations
                  .filter(p => p.unit_type !== 'porcion' && p.stock_available <= 1 && !productionRequests.some(r => r.preparation_id === p.id))
                  .map(p => (
                    <div key={p.id} className="p-4 rounded-xl border border-[#dec0b6] bg-white shadow-xs flex flex-col justify-between space-y-3">
                      <div>
                        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                          ⚠️ Poco Stock en Vitrina ({p.stock_available} {p.unit_type})
                        </span>
                        <h4 className="font-serif font-bold text-base text-[#1c120c] mt-1">
                          {p.name}
                        </h4>
                        <p className="text-xs text-[#7c5641]">
                          Categoría: {p.category} • Precio: ${p.price.toLocaleString('es-AR')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#dec0b6]/50">
                        <button
                          type="button"
                          onClick={() => handleQuickAuthorize(p.id, 2, p.name)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1c120c] text-white text-xs font-bold hover:bg-black shadow-sm active:scale-95 transition-all"
                        >
                          <Zap className="w-4 h-4 text-[#dec0b6]" />
                          <span>Autorizar Producción (+2 {p.unit_type})</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de Configuración de Lote */}
            <div className="bg-white rounded-2xl border border-[#dec0b6] p-6 shadow-sm space-y-5">
              <h3 className="font-serif font-bold text-lg text-[#1c120c] pb-3 border-b border-[#dec0b6]">
                1. Indicar Preparación a Cocinar
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
                  💡 Las porciones individuales no se cocinan directamente: se hornea la <strong>Torta Entera</strong> y el sistema fracciona las porciones automáticamente en vitrina.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="prod-quantity-input" className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
                  Cantidad a Indicar ({selectedPrep?.unit_type || 'un'})
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
                  Instrucciones para el Cocinero (Opcional)
                </label>
                <input
                  id="prod-notes-input"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Tanda para evento especial / reposición urgente vitrina"
                  className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-xs text-[#1c120c]"
                />
              </div>
            </div>

            {/* Vista Previa de Consumo de Insumos */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dec0b6] p-6 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#dec0b6]">
                  <h3 className="font-serif font-bold text-lg text-[#1c120c]">
                    2. Vista Previa de Insumos & Opciones de Producción
                  </h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    canProduce
                      ? 'bg-[#ebffe8] text-[#446147]'
                      : 'bg-[#ffdad6] text-[#ba1a1a]'
                  }`}>
                    {canProduce ? 'Stock Insumos Suficiente' : 'Stock Insuficiente'}
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

                {/* Acciones del Administrador: Asignar a Cocina o Producir Directo */}
              <div className="pt-4 border-t border-[#dec0b6] flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-[#7c5641]">
                  Puedes <strong>indicar esta preparación al cocinero</strong> para que la elabore en su turno, o registrarla de inmediato.
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Botón 1: Asignar a Cocina */}
                  <button
                    type="button"
                    onClick={handleAssignToKitchen}
                    disabled={requirements.length === 0}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1c120c] text-white text-xs font-bold shadow-sm hover:bg-black active:scale-95 disabled:opacity-50 transition-all"
                  >
                    <Send className="w-4 h-4 text-[#dec0b6]" aria-hidden="true" focusable="false" />
                    <span>Indicar a Cocinero</span>
                  </button>

                  {/* Botón 2: Producir Directo */}
                  <button
                    type="button"
                    onClick={handleDirectProduction}
                    disabled={!canProduce || isSubmitting || requirements.length === 0}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-md shadow-[#9d3c0c]/30 hover:bg-[#7f2b00] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <CookingPot className="w-4 h-4" aria-hidden="true" focusable="false" />
                    <span>{isSubmitting ? 'Procesando...' : `Producir en el Acto (${quantity} un)`}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Seguimiento de Órdenes Asignadas por la Administración */}
          <div className="bg-white p-6 rounded-2xl border border-[#dec0b6] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#dec0b6]">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#9d3c0c]" aria-hidden="true" focusable="false" />
                <h3 className="font-serif font-bold text-lg text-[#1c120c]">
                  Seguimiento de Órdenes Indicadas a Cocina ({productionOrders.length})
                </h3>
              </div>
              <span className="text-xs text-[#7c5641]">
                {pendingOrders.length} pendiente(s) en cocina
              </span>
            </div>

            {productionOrders.length === 0 ? (
              <p className="text-xs text-[#7c5641] py-4 text-center">
                No hay órdenes de producción indicadas aún. Usa el formulario superior para asignarle recetas a los cocineros.
              </p>
            ) : (
              <div className="divide-y divide-[#dec0b6]/50">
                {productionOrders.map(order => {
                  const prep = resolvePreparation(order.preparation_id);
                  const isPending = order.status === 'pendiente';

                  return (
                    <div key={order.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1c120c]">
                            {order.quantity}x {prep?.name || 'Preparación'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isPending 
                              ? 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]' 
                              : 'bg-[#ebffe8] text-[#446147] border border-[#aecfae]'
                          }`}>
                            {isPending ? 'Pendiente en Cocina' : `Cocinado por ${order.completed_by || 'Cocinero'}`}
                          </span>
                        </div>
                        {order.notes && (
                          <p className="text-xs text-[#7c5641] mt-0.5 italic">
                            Instrucción: &quot;{order.notes}&quot;
                          </p>
                        )}
                        {order.batch_code && (
                          <p className="text-[11px] font-mono font-bold text-[#446147] mt-0.5">
                            Lote producido: {order.batch_code}
                          </p>
                        )}
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order.id)}
                            className="p-2 rounded-xl text-[#7c5641] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-all text-xs flex items-center gap-1 font-semibold"
                            title="Cancelar orden indicada"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                            <span>Cancelar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
