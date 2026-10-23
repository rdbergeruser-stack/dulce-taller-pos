import React, { useState } from 'react';
import { Preparation, OrderOrigin } from '../../types/database';
import { X, Plus, Minus, Check, Coffee, Sparkles, Utensils } from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preparations: Preparation[];
  onSubmit: (
    orderData: { origin: OrderOrigin; table_number?: string; notes?: string },
    items: { preparation_id: string; quantity: number; unit_price: number; notes?: string }[]
  ) => Promise<void>;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  preparations,
  onSubmit
}) => {
  const [origin, setOrigin] = useState<OrderOrigin>('salon');
  const [tableNumber, setTableNumber] = useState<string>('Mesa 01');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [cart, setCart] = useState<Record<string, { quantity: number; notes: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = (prepId: string) => {
    setCart(prev => ({
      ...prev,
      [prepId]: {
        quantity: (prev[prepId]?.quantity || 0) + 1,
        notes: prev[prepId]?.notes || ''
      }
    }));
  };

  const handleRemoveItem = (prepId: string) => {
    setCart(prev => {
      const current = prev[prepId]?.quantity || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[prepId];
        return next;
      }
      return {
        ...prev,
        [prepId]: {
          ...prev[prepId],
          quantity: current - 1
        }
      };
    });
  };

  const handleItemNotesChange = (prepId: string, notes: string) => {
    setCart(prev => ({
      ...prev,
      [prepId]: {
        quantity: prev[prepId]?.quantity || 1,
        notes
      }
    }));
  };

  const selectedItems = Object.entries(cart).map(([prepId, data]) => {
    const prep = preparations.find(p => p.id === prepId)!;
    return {
      preparation_id: prepId,
      preparation: prep,
      quantity: data.quantity,
      unit_price: prep?.price || 0,
      notes: data.notes
    };
  }).filter(item => Boolean(item.preparation));

  const totalAmount = selectedItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setErrorMessage('Debes seleccionar al menos un producto para la comanda.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          origin,
          table_number: origin === 'salon' ? tableNumber : origin === 'takeaway' ? 'Mostrador' : 'Taller',
          notes: orderNotes.trim() || undefined
        },
        selectedItems.map(item => ({
          preparation_id: item.preparation_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          notes: item.notes.trim() || undefined
        }))
      );
      setCart({});
      setOrderNotes('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al crear la comanda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#fff8f2] rounded-2xl border border-[#dec0b6] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dec0b6] bg-[#f5ede3]">
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1c120c]">
              Nueva Comanda
            </h2>
            <p className="text-xs text-[#7c5641]">
              Selección táctil de ítems y destino del pedido
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7c5641] hover:bg-[#efe7dd] active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-sm font-medium border border-[#ba1a1a]/20">
              {errorMessage}
            </div>
          )}

          {/* Configuración de Origen y Mesa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
                Destino del Pedido
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'salon', label: 'Salón', icon: <Utensils className="w-4 h-4" /> },
                  { id: 'takeaway', label: 'Take Away', icon: <Coffee className="w-4 h-4" /> },
                  { id: 'taller', label: 'Taller', icon: <Sparkles className="w-4 h-4" /> }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOrigin(opt.id as OrderOrigin)}
                    className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-sm font-bold border transition-all ${
                      origin === opt.id
                        ? 'bg-[#9d3c0c] text-white border-[#9d3c0c] shadow-sm'
                        : 'bg-white text-[#1c120c] border-[#dec0b6] hover:bg-[#efe7dd]'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {origin === 'salon' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
                  Mesa de Salón (4 mesas)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['Mesa 01', 'Mesa 02', 'Mesa 03', 'Mesa 04'].map((mesa) => (
                    <button
                      key={mesa}
                      type="button"
                      onClick={() => setTableNumber(mesa)}
                      className={`h-[46px] rounded-xl text-xs font-bold border transition-all ${
                        tableNumber === mesa
                          ? 'bg-[#1c120c] text-white border-[#1c120c] shadow-sm'
                          : 'bg-white text-[#1c120c] border-[#dec0b6] hover:bg-[#efe7dd]'
                      }`}
                    >
                      {mesa}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botones de Alta Rotación (Menú táctil) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
                Productos de Alta Rotación
              </label>
              <span className="text-xs text-[#7c5641]">
                Toca para agregar a la comanda
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {preparations.map(prep => {
                const count = cart[prep.id]?.quantity || 0;
                const stock = prep.stock_available || 0;
                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock <= (prep.unit_type === 'entera' ? 1 : 3);

                return (
                  <div
                    key={prep.id}
                    onClick={() => {
                      if (isOutOfStock) {
                        setErrorMessage(`El producto "${prep.name}" está agotado en vitrina.`);
                        return;
                      }
                      handleAddItem(prep.id);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none text-left flex flex-col justify-between ${
                      isOutOfStock
                        ? 'bg-[#ffdad6]/30 border-[#ba1a1a]/40 opacity-75'
                        : count > 0
                        ? 'bg-[#ffdbce]/40 border-[#9d3c0c] ring-2 ring-[#9d3c0c]/30'
                        : 'bg-white border-[#dec0b6] hover:border-[#9d3c0c]/50 hover:bg-[#fffbf8]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#f5ede3] text-[#7c5641]">
                          {prep.category}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/30">
                            AGOTADO
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                            Poco ({stock})
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-[#446147]">
                            Stock: {stock} {prep.unit_type}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-[#1c120c] line-clamp-1">
                        {prep.name}
                      </h4>
                      <p className="text-xs text-[#7c5641] mt-0.5 font-medium">
                        ${prep.price.toLocaleString('es-AR')}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#dec0b6]/50 flex items-center justify-between">
                      <span className="text-xs text-[#9d3c0c] font-bold">
                        {count > 0 ? `${count} en comanda` : '+ Agregar'}
                      </span>
                      {count > 0 && (
                        <div className="w-5 h-5 rounded-full bg-[#9d3c0c] text-white flex items-center justify-center text-xs font-bold">
                          {count}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen de Ítems en la comanda */}
          {selectedItems.length > 0 && (
            <div className="space-y-3 bg-[#f5ede3] p-4 rounded-xl border border-[#dec0b6]">
              <h3 className="font-bold text-sm text-[#1c120c] flex items-center justify-between">
                <span>Detalle de la Comanda ({selectedItems.length} productos)</span>
                <span className="text-base text-[#9d3c0c] font-bold">
                  Total: ${totalAmount.toLocaleString('es-AR')}
                </span>
              </h3>

              <div className="space-y-2">
                {selectedItems.map(item => (
                  <div
                    key={item.preparation_id}
                    className="p-3 bg-white rounded-xl border border-[#dec0b6] flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-[200px]">
                      <span className="font-bold text-sm text-[#1c120c]">
                        {item.preparation.name}
                      </span>
                      <span className="text-xs text-[#7c5641] ml-2">
                        (${item.unit_price} c/u)
                      </span>
                      <input
                        type="text"
                        placeholder="Observación para cocina (ej. leche descremada, caliente)..."
                        value={item.notes}
                        onChange={(e) => handleItemNotesChange(item.preparation_id, e.target.value)}
                        className="mt-1 w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#dec0b6] bg-[#fff8f2] text-[#1c120c] focus:outline-none focus:ring-1 focus:ring-[#9d3c0c]"
                      />
                    </div>

                    {/* Controles de Cantidad */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-[#efe7dd] rounded-lg border border-[#dec0b6]">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.preparation_id)}
                          className="w-8 h-8 flex items-center justify-center text-[#7c5641] hover:text-[#1c120c] active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-[#1c120c]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddItem(item.preparation_id)}
                          className="w-8 h-8 flex items-center justify-center text-[#7c5641] hover:text-[#1c120c] active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <span className="w-20 text-right font-bold text-sm text-[#1c120c]">
                        ${(item.quantity * item.unit_price).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones generales de la comanda */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
              Observaciones Generales de la Comanda
            </label>
            <textarea
              rows={2}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Instrucciones adicionales para despacho o salón..."
              className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-white text-sm text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
            />
          </div>
        </form>

        {/* Footer Modal con Botón Táctil Amplio */}
        <div className="px-6 py-4 border-t border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-[#dec0b6] text-sm font-bold text-[#7c5641] hover:bg-[#efe7dd] transition-all"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedItems.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#9d3c0c] text-white text-sm font-bold shadow-md shadow-[#9d3c0c]/30 hover:bg-[#7f2b00] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Check className="w-5 h-5" />
            <span>{isSubmitting ? 'Enviando...' : `Crear Comanda ($${totalAmount.toLocaleString('es-AR')})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
