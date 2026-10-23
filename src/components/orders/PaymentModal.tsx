import React, { useState } from 'react';
import { Order } from '../../types/database';
import { 
  X, 
  Banknote, 
  CreditCard, 
  QrCode, 
  Ticket, 
  CheckCircle2, 
  Printer, 
  ArrowRight,
  ReceiptText
} from 'lucide-react';

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'qr' | 'voucher';

interface PaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (orderId: string, paymentData: {
    method: PaymentMethod;
    amountPaid: number;
    changeGiven: number;
    receiptNumber: string;
  }) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirmPayment
}) => {
  if (!isOpen || !order) return null;

  const totalAmount = (order.items || []).reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [cashReceived, setCashReceived] = useState<string>(totalAmount.toString());
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptCode, setReceiptCode] = useState<string>('');

  const cashNum = parseFloat(cashReceived) || 0;
  const change = Math.max(0, cashNum - totalAmount);
  const isCashSufficient = method !== 'efectivo' || cashNum >= totalAmount;

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const handlePay = async () => {
    if (!isCashSufficient) return;

    setIsProcessing(true);
    const code = `TICK-${Date.now().toString().slice(-6)}`;
    setReceiptCode(code);

    try {
      await onConfirmPayment(order.id, {
        method,
        amountPaid: method === 'efectivo' ? cashNum : totalAmount,
        changeGiven: method === 'efectivo' ? change : 0,
        receiptNumber: code
      });
      setPaymentSuccess(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    setPaymentSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-[#fff8f2] rounded-3xl border border-[#dec0b6] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dec0b6] bg-[#f5ede3]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#9d3c0c] text-white rounded-xl shadow-sm">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-[#1c120c]">
                {paymentSuccess ? 'Comprobante Emitido' : `Cobro de Comanda #${order.order_number}`}
              </h2>
              <p className="text-xs text-[#7c5641]">
                {order.origin.toUpperCase()} {order.table_number && `• ${order.table_number}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="p-2 rounded-xl text-[#7c5641] hover:bg-[#efe7dd] active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO DEL MODAL */}
        {!paymentSuccess ? (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Panel Izquierdo: Resumen de la Cuenta */}
            <div className="bg-white rounded-2xl border border-[#dec0b6] p-5 flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#7c5641] pb-2 border-b border-[#dec0b6]/50">
                  Detalle a Cobrar
                </h3>

                <div className="divide-y divide-[#dec0b6]/40 py-2 space-y-2 max-h-60 overflow-y-auto">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#1c120c]">
                          {item.quantity}x {item.preparation?.name || 'Producto'}
                        </span>
                        {item.notes && (
                          <p className="text-[10px] text-[#7c5641] italic">{item.notes}</p>
                        )}
                      </div>
                      <span className="font-bold text-[#1c120c]">
                        ${(item.quantity * item.unit_price).toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gran Total */}
              <div className="pt-4 border-t border-[#dec0b6] bg-[#f5ede3] -mx-5 -mb-5 p-5 rounded-b-2xl">
                <span className="text-xs font-bold text-[#7c5641] uppercase tracking-wider block">
                  Total a Pagar
                </span>
                <span className="font-serif text-3xl font-bold text-[#9d3c0c]">
                  ${totalAmount.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Panel Derecho: Métodos de Pago y Cálculo */}
            <div className="space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-[#7c5641] block">
                  Selecciona Método de Pago
                </label>

                {/* Grilla de Métodos */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'efectivo', label: 'Efectivo', icon: <Banknote className="w-5 h-5" /> },
                    { id: 'tarjeta', label: 'Tarjeta Débito/Crédito', icon: <CreditCard className="w-5 h-5" /> },
                    { id: 'qr', label: 'QR / Transferencia', icon: <QrCode className="w-5 h-5" /> },
                    { id: 'voucher', label: 'Voucher / Gift Card', icon: <Ticket className="w-5 h-5" /> }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id as PaymentMethod)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        method === m.id
                          ? 'bg-[#9d3c0c] text-white border-[#9d3c0c] shadow-md shadow-[#9d3c0c]/20'
                          : 'bg-white text-[#1c120c] border-[#dec0b6] hover:bg-[#efe7dd]'
                      }`}
                    >
                      <span className={method === m.id ? 'text-white' : 'text-[#9d3c0c]'}>
                        {m.icon}
                      </span>
                      <span className="text-xs font-bold leading-tight">{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Si es Efectivo: Ingreso de billetes y Vuelto */}
                {method === 'efectivo' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#dec0b6] space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#7c5641]">
                        Monto Recibido en Efectivo ($)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-[#fff8f2] text-lg font-bold text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                      />
                    </div>

                    {/* Botones rápidos de billetes */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-[#7c5641] uppercase font-bold w-full">
                        Atajos rápidos:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuickCash(totalAmount)}
                        className="px-2.5 py-1 rounded-lg bg-[#efe7dd] border border-[#dec0b6] text-xs font-bold text-[#1c120c] hover:bg-[#dec0b6]"
                      >
                        Exacto (${totalAmount.toLocaleString('es-AR')})
                      </button>
                      {[5000, 10000, 20000, 50000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleQuickCash(val)}
                          className="px-2.5 py-1 rounded-lg bg-[#efe7dd] border border-[#dec0b6] text-xs font-bold text-[#1c120c] hover:bg-[#dec0b6]"
                        >
                          ${val.toLocaleString('es-AR')}
                        </button>
                      ))}
                    </div>

                    {/* Vuelto calculado */}
                    <div className="pt-2 border-t border-[#dec0b6]/50 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#7c5641]">Vuelto a Entregar:</span>
                      <span className={`text-xl font-bold font-serif ${
                        cashNum < totalAmount ? 'text-[#ba1a1a]' : 'text-[#446147]'
                      }`}>
                        {cashNum < totalAmount 
                          ? `Faltan $${(totalAmount - cashNum).toLocaleString('es-AR')}` 
                          : `$${change.toLocaleString('es-AR')}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Si es Tarjeta o QR */}
                {method !== 'efectivo' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#dec0b6] text-center space-y-2">
                    <p className="text-xs font-bold text-[#1c120c]">
                      {method === 'qr' ? 'Presentar código QR en mostrador' : 'Cobrar en terminal POS / Posnet'}
                    </p>
                    <p className="text-xs text-[#7c5641]">
                      Monto a cobrar en pantalla: <strong className="text-[#9d3c0c] text-sm">${totalAmount.toLocaleString('es-AR')}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Botón de Confirmación */}
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing || !isCashSufficient}
                className="w-full py-4 rounded-2xl bg-[#9d3c0c] text-white text-base font-bold shadow-lg shadow-[#9d3c0c]/30 hover:bg-[#7f2b00] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {isProcessing ? 'Procesando Pago...' : `Confirmar Cobro ($${totalAmount.toLocaleString('es-AR')})`}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* PANTALLA DE COMPROBANTE EMITIDO CON ÉXITO */
          <div className="p-8 text-center space-y-6 flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#ebffe8] text-[#446147] border border-[#aecfae] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-bold text-2xl text-[#1c120c]">
                ¡Pago Registrado Exitosamente!
              </h3>
              <p className="text-xs text-[#7c5641]">
                Comprobante <strong className="font-mono text-[#1c120c]">{receiptCode}</strong>
              </p>
            </div>

            <div className="w-full max-w-sm bg-white p-5 rounded-2xl border border-[#dec0b6] text-left text-xs space-y-2 shadow-sm font-mono">
              <div className="flex justify-between border-b pb-2">
                <span>Comanda:</span>
                <strong className="text-[#1c120c]">#{order.order_number} ({order.origin})</strong>
              </div>
              <div className="flex justify-between">
                <span>Método:</span>
                <strong className="text-[#1c120c] uppercase">{method}</strong>
              </div>
              <div className="flex justify-between">
                <span>Monto Cobrado:</span>
                <strong className="text-[#1c120c]">${totalAmount.toLocaleString('es-AR')}</strong>
              </div>
              {method === 'efectivo' && (
                <>
                  <div className="flex justify-between">
                    <span>Efectivo recibido:</span>
                    <span>${cashNum.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-[#446147] font-bold">
                    <span>Vuelto entregado:</span>
                    <span>${change.toLocaleString('es-AR')}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold text-[#1c120c] hover:bg-[#efe7dd] active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ticket</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1c120c] text-white text-xs font-bold hover:bg-black active:scale-95 shadow-md"
              >
                <span>Finalizar y Salir</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
