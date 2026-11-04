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
  ReceiptText,
  Building2,
  Copy,
  Check,
  Radio,
  Sparkles,
  MessageSquare,
  Send,
  Smartphone
} from 'lucide-react';

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'qr' | 'transferencia' | 'voucher';

interface PaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (orderId: string, paymentData: {
    method: PaymentMethod;
    amountPaid: number;
    changeGiven: number;
    receiptNumber: string;
    details?: string;
  }) => Promise<void>;
}

// Componente decorativo de código QR estilizado
const SimulatedQrSvg: React.FC<{ size?: number }> = ({ size = 180 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 29 29" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="rounded-xl shadow-inner bg-white p-2 border border-[#dec0b6]"
    aria-hidden="true"
    focusable="false"
  >
    {/* Corner 1: Top-Left */}
    <rect x="2" y="2" width="7" height="7" fill="#1c120c" rx="1" />
    <rect x="3" y="3" width="5" height="5" fill="#ffffff" />
    <rect x="4" y="4" width="3" height="3" fill="#9d3c0c" rx="0.5" />

    {/* Corner 2: Top-Right */}
    <rect x="20" y="2" width="7" height="7" fill="#1c120c" rx="1" />
    <rect x="21" y="3" width="5" height="5" fill="#ffffff" />
    <rect x="22" y="4" width="3" height="3" fill="#9d3c0c" rx="0.5" />

    {/* Corner 3: Bottom-Left */}
    <rect x="2" y="20" width="7" height="7" fill="#1c120c" rx="1" />
    <rect x="3" y="21" width="5" height="5" fill="#ffffff" />
    <rect x="4" y="22" width="3" height="3" fill="#9d3c0c" rx="0.5" />

    {/* Timing Patterns */}
    <rect x="10" y="5" width="1" height="1" fill="#1c120c" />
    <rect x="12" y="5" width="1" height="1" fill="#1c120c" />
    <rect x="14" y="5" width="1" height="1" fill="#1c120c" />
    <rect x="16" y="5" width="1" height="1" fill="#1c120c" />
    <rect x="18" y="5" width="1" height="1" fill="#1c120c" />

    <rect x="5" y="10" width="1" height="1" fill="#1c120c" />
    <rect x="5" y="12" width="1" height="1" fill="#1c120c" />
    <rect x="5" y="14" width="1" height="1" fill="#1c120c" />
    <rect x="5" y="16" width="1" height="1" fill="#1c120c" />
    <rect x="5" y="18" width="1" height="1" fill="#1c120c" />

    {/* Random/Realistic Data Matrix Modules */}
    <rect x="11" y="2" width="2" height="1" fill="#1c120c" />
    <rect x="15" y="3" width="1" height="2" fill="#1c120c" />
    <rect x="17" y="2" width="1" height="1" fill="#9d3c0c" />

    <rect x="10" y="10" width="2" height="2" fill="#9d3c0c" />
    <rect x="13" y="9" width="1" height="1" fill="#1c120c" />
    <rect x="15" y="10" width="2" height="1" fill="#1c120c" />
    <rect x="18" y="11" width="1" height="2" fill="#1c120c" />

    <rect x="2" y="11" width="2" height="1" fill="#1c120c" />
    <rect x="7" y="13" width="1" height="2" fill="#1c120c" />
    <rect x="1" y="15" width="2" height="1" fill="#1c120c" />

    <rect x="10" y="14" width="3" height="1" fill="#1c120c" />
    <rect x="14" y="13" width="1" height="3" fill="#9d3c0c" />
    <rect x="17" y="15" width="2" height="2" fill="#1c120c" />

    <rect x="21" y="10" width="2" height="1" fill="#1c120c" />
    <rect x="24" y="11" width="1" height="3" fill="#1c120c" />
    <rect x="26" y="12" width="1" height="1" fill="#9d3c0c" />

    <rect x="11" y="18" width="1" height="2" fill="#1c120c" />
    <rect x="13" y="19" width="2" height="1" fill="#1c120c" />
    <rect x="16" y="18" width="2" height="2" fill="#9d3c0c" />

    {/* Alignment Pattern */}
    <rect x="20" y="20" width="5" height="5" fill="#1c120c" rx="0.5" />
    <rect x="21" y="21" width="3" height="3" fill="#ffffff" />
    <rect x="22" y="22" width="1" height="1" fill="#9d3c0c" />

    <rect x="10" y="22" width="2" height="1" fill="#1c120c" />
    <rect x="13" y="24" width="1" height="2" fill="#1c120c" />
    <rect x="15" y="23" width="3" height="1" fill="#1c120c" />
    <rect x="18" y="25" width="1" height="2" fill="#1c120c" />

    <rect x="2" y="25" width="1" height="2" fill="#1c120c" />
    <rect x="26" y="22" width="1" height="2" fill="#1c120c" />
    <rect x="25" y="26" width="2" height="1" fill="#1c120c" />
  </svg>
);

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
  const [paidDetails, setPaidDetails] = useState<string>('');

  // Estados simulación Transferencia
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [transferRef, setTransferRef] = useState<string>('');

  // Estados simulación Tarjeta / Posnet
  const [cardType, setCardType] = useState<'debito' | 'credito'>('debito');
  const [couponNumber, setCouponNumber] = useState<string>(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [isCardContactlessSimulated, setIsCardContactlessSimulated] = useState(false);

  // Estados Voucher
  const [voucherCode, setVoucherCode] = useState<string>('');

  // Estados WhatsApp
  const [showWhatsAppInput, setShowWhatsAppInput] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');

  const cashNum = parseFloat(cashReceived) || 0;
  const change = Math.max(0, cashNum - totalAmount);
  const isCashSufficient = method !== 'efectivo' || cashNum >= totalAmount;

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount.toString());
  };

  const handleCopyAlias = () => {
    navigator.clipboard.writeText('DULCE.TALLER.CAFE');
    setCopiedAlias(true);
    setTimeout(() => setCopiedAlias(false), 2000);
  };

  const handleSimulateContactless = () => {
    setIsCardContactlessSimulated(true);
    setTimeout(() => setIsCardContactlessSimulated(false), 2500);
  };

  const generateWhatsAppMessage = (receipt: string, details: string) => {
    const itemsList = (order.items || [])
      .map(item => `• ${item.quantity}x ${item.preparation?.name || 'Producto'} ($${(item.quantity * item.unit_price).toLocaleString('es-AR')})`)
      .join('\n');

    const paymentMethodLabel = method === 'efectivo' 
      ? 'Efectivo' 
      : method === 'qr' 
      ? 'QR / Billetera Virtual' 
      : method === 'transferencia' 
      ? 'Transferencia Bancaria' 
      : method === 'tarjeta' 
      ? `Tarjeta ${cardType.toUpperCase()}` 
      : 'Voucher';

    const detailsLine = details ? ` (${details})` : '';

    return `🧁 *DULCE TALLER - Pastelería & Café*
---------------------------------------
🧾 *Comprobante de Pago:* #${receipt}
📋 *Comanda:* #${order.order_number} (${order.origin.toUpperCase()}${order.table_number ? ` - ${order.table_number}` : ''})
📅 *Fecha:* ${new Date().toLocaleDateString('es-AR')} - ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
---------------------------------------
*Detalle del Consumo:*
${itemsList}

💰 *TOTAL ABONADO:* $${totalAmount.toLocaleString('es-AR')}
💳 *Forma de Pago:* ${paymentMethodLabel}${detailsLine}
---------------------------------------
_¡Muchas gracias por elegirnos! Esperamos que disfrutes tu pedido._ 🍰☕
📍 Av. Corrientes 1234 • Dulce Taller`;
  };

  const handleSendWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let cleanPhone = customerPhone.replace(/\D/g, '');
    
    // Auto-formato para Argentina si se ingresan 10 u 11 dígitos
    if (cleanPhone.length === 10) {
      cleanPhone = `549${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      cleanPhone = `549${cleanPhone.slice(1)}`;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('54') && !cleanPhone.startsWith('549')) {
      cleanPhone = `549${cleanPhone.slice(2)}`;
    }

    const text = encodeURIComponent(generateWhatsAppMessage(receiptCode, paidDetails));
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${text}`
      : `https://wa.me/?text=${text}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePay = async () => {
    if (!isCashSufficient) return;

    setIsProcessing(true);
    const code = `TICK-${Date.now().toString().slice(-6)}`;
    setReceiptCode(code);

    let details = '';
    if (method === 'qr') {
      details = 'Billetera Virtual / Transferencias 3.0';
    } else if (method === 'transferencia') {
      details = `Alias DULCE.TALLER.CAFE${transferRef.trim() ? ` - Ref: ${transferRef.trim()}` : ''}`;
    } else if (method === 'tarjeta') {
      details = `${cardType.toUpperCase()} - Cupón #${couponNumber}`;
    } else if (method === 'voucher') {
      details = voucherCode.trim() ? `Código: ${voucherCode.trim()}` : 'Voucher Obsequio';
    }

    setPaidDetails(details);

    try {
      await onConfirmPayment(order.id, {
        method,
        amountPaid: method === 'efectivo' ? cashNum : totalAmount,
        changeGiven: method === 'efectivo' ? change : 0,
        receiptNumber: code,
        details
      });
      setPaymentSuccess(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    setPaymentSuccess(false);
    setShowWhatsAppInput(false);
    setCustomerPhone('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div 
        className="bg-[#fff8f2] rounded-3xl border border-[#dec0b6] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dec0b6] bg-[#f5ede3]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#9d3c0c] text-white rounded-xl shadow-sm">
              <ReceiptText className="w-5 h-5" aria-hidden="true" focusable="false" />
            </div>
            <div>
              <h2 id="payment-modal-title" className="font-serif font-bold text-xl text-[#1c120c]">
                {paymentSuccess ? 'Comprobante Emitido' : `Cobro de Comanda #${order.order_number}`}
              </h2>
              <p className="text-xs text-[#7c5641]">
                {order.origin.toUpperCase()} {order.table_number && `• ${order.table_number}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            aria-label="Cerrar modal de cobro"
            className="p-2 rounded-xl text-[#7c5641] hover:bg-[#efe7dd] active:scale-95 transition-all"
          >
            <X className="w-5 h-5" aria-hidden="true" focusable="false" />
          </button>
        </div>

        {/* CONTENIDO DEL MODAL */}
        {!paymentSuccess ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Panel Izquierdo: Resumen de la Cuenta (5 cols) */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-[#dec0b6] p-4 md:p-5 flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#7c5641] pb-2 border-b border-[#dec0b6]/50">
                  Detalle a Cobrar
                </h3>

                <div className="divide-y divide-[#dec0b6]/40 py-2 space-y-2 max-h-56 overflow-y-auto">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#1c120c]">
                          {item.quantity}x {item.preparation?.name || 'Producto'}
                        </span>
                        {item.notes && (
                          <p className="text-xs text-[#7c5641] italic">{item.notes}</p>
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
              <div className="pt-4 border-t border-[#dec0b6] bg-[#f5ede3] -mx-4 md:-mx-5 -mb-4 md:-mb-5 p-4 md:p-5 rounded-b-2xl">
                <span className="text-xs font-bold text-[#7c5641] uppercase tracking-wider block">
                  Total a Pagar
                </span>
                <span className="font-serif text-3xl font-bold text-[#9d3c0c]">
                  ${totalAmount.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Panel Derecho: Métodos de Pago y Simulación (7 cols) */}
            <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7c5641] block">
                  Selecciona Método de Pago
                </span>

                {/* Grilla de Métodos de Pago */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'efectivo', label: 'Efectivo', icon: <Banknote className="w-4 h-4" aria-hidden="true" focusable="false" /> },
                    { id: 'qr', label: 'Cobro QR', icon: <QrCode className="w-4 h-4" aria-hidden="true" focusable="false" /> },
                    { id: 'transferencia', label: 'Transferencia', icon: <Building2 className="w-4 h-4" aria-hidden="true" focusable="false" /> },
                    { id: 'tarjeta', label: 'Tarjeta (POSNET)', icon: <CreditCard className="w-4 h-4" aria-hidden="true" focusable="false" /> },
                    { id: 'voucher', label: 'Voucher', icon: <Ticket className="w-4 h-4" aria-hidden="true" focusable="false" /> }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id as PaymentMethod)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        method === m.id
                          ? 'bg-[#9d3c0c] text-white border-[#9d3c0c] shadow-md shadow-[#9d3c0c]/20'
                          : 'bg-white text-[#1c120c] border-[#dec0b6] hover:bg-[#efe7dd]'
                      }`}
                    >
                      <span className={method === m.id ? 'text-white' : 'text-[#9d3c0c]'}>
                        {m.icon}
                      </span>
                      <span className="text-xs font-bold leading-tight truncate">{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* 1. SECCIÓN EFECTIVO */}
                {method === 'efectivo' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#dec0b6] space-y-3 shadow-xs">
                    <div className="space-y-1">
                      <label htmlFor="pay-cash-input" className="text-xs font-bold text-[#7c5641]">
                        Monto Recibido en Efectivo ($)
                      </label>
                      <input
                        id="pay-cash-input"
                        type="number"
                        step="any"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-[#fff8f2] text-lg font-bold text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                      />
                    </div>

                    {/* Botones rápidos de billetes */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-[#7c5641] uppercase font-bold w-full">
                        Atajos rápidos:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuickCash(totalAmount)}
                        className="px-2.5 py-1 rounded-lg bg-[#efe7dd] border border-[#dec0b6] text-xs font-bold text-[#1c120c] hover:bg-[#dec0b6] active:scale-95"
                      >
                        Exacto (${totalAmount.toLocaleString('es-AR')})
                      </button>
                      {[5000, 10000, 20000, 50000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleQuickCash(val)}
                          className="px-2.5 py-1 rounded-lg bg-[#efe7dd] border border-[#dec0b6] text-xs font-bold text-[#1c120c] hover:bg-[#dec0b6] active:scale-95"
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

                {/* 2. SECCIÓN COBRO QR (SIMULADO) */}
                {method === 'qr' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#dec0b6] space-y-3.5 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Código QR Visual */}
                      <div className="relative group shrink-0">
                        <SimulatedQrSvg size={145} />
                        <div className="absolute inset-0 bg-[#9d3c0c]/10 rounded-xl pointer-events-none" />
                      </div>

                      {/* Información de Cobro QR */}
                      <div className="space-y-1.5 text-center sm:text-left flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f5ede3] border border-[#dec0b6] text-xs font-bold text-[#9d3c0c]">
                          <QrCode className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                          <span>Interoperable / Transferencias 3.0</span>
                        </div>
                        <h4 className="font-bold text-sm text-[#1c120c]">
                          Escanear con Mercado Pago, MODO o cualquier app
                        </h4>
                        <p className="text-xs text-[#7c5641]">
                          Monto a cobrar: <strong className="text-[#9d3c0c] text-sm">${totalAmount.toLocaleString('es-AR')}</strong>
                        </p>
                        <div className="pt-1 flex items-center gap-2 justify-center sm:justify-start">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#446147] animate-ping" />
                          <span className="text-xs font-semibold text-[#446147]">
                            Esperando pago del cliente en mostrador...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SECCIÓN TRANSFERENCIA BANCARIA */}
                {method === 'transferencia' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#dec0b6] space-y-3 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#dec0b6]/50">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#9d3c0c]" aria-hidden="true" focusable="false" />
                        <span className="text-xs font-bold text-[#1c120c]">Datos de Cuenta para Transferir</span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#f5ede3] text-[#7c5641]">
                        Banco Galicia / MP
                      </span>
                    </div>

                    {/* Tarjeta de Datos Bancarios con botón Copiar */}
                    <div className="p-3 rounded-xl bg-[#fff8f2] border border-[#dec0b6] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[#7c5641] block">Alias:</span>
                          <span className="font-mono font-black text-sm text-[#9d3c0c]">
                            DULCE.TALLER.CAFE
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyAlias}
                          className="px-2.5 py-1.5 rounded-lg border border-[#dec0b6] bg-white text-xs font-bold text-[#1c120c] hover:bg-[#efe7dd] active:scale-95 transition-all flex items-center gap-1 shadow-xs"
                          title="Copiar alias al portapapeles"
                        >
                          {copiedAlias ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#446147]" aria-hidden="true" focusable="false" />
                              <span className="text-[#446147]">¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#7c5641]" aria-hidden="true" focusable="false" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-[#7c5641] pt-1 border-t border-[#dec0b6]/40">
                        <div>
                          <span>Titular: </span>
                          <strong className="text-[#1c120c]">Dulce Taller Pastelería SRL</strong>
                        </div>
                        <div>
                          <span>CUIT: </span>
                          <strong className="text-[#1c120c]">30-71829384-9</strong>
                        </div>
                      </div>
                    </div>

                    {/* Campo de Comprobante / Referencia (Opcional para arqueo) */}
                    <div className="space-y-1">
                      <label htmlFor="pay-transfer-ref" className="text-xs font-bold text-[#7c5641]">
                        Nº de Comprobante / Últimos 4 dígitos de operación (opcional)
                      </label>
                      <input
                        id="pay-transfer-ref"
                        type="text"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        placeholder="Ej. 8492 o Ref-Galicia"
                        className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-[#fff8f2] text-xs font-mono font-bold text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                      />
                    </div>
                  </div>
                )}

                {/* 4. SECCIÓN TARJETA DÉBITO / CRÉDITO (SIMULACIÓN POSNET) */}
                {method === 'tarjeta' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#dec0b6] space-y-3.5 shadow-xs">
                    {/* Selector Débito / Crédito */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 p-1 bg-[#f5ede3] rounded-xl border border-[#dec0b6]">
                        <button
                          type="button"
                          onClick={() => setCardType('debito')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            cardType === 'debito'
                              ? 'bg-[#9d3c0c] text-white shadow-xs'
                              : 'text-[#7c5641] hover:text-[#1c120c]'
                          }`}
                        >
                          Débito
                        </button>
                        <button
                          type="button"
                          onClick={() => setCardType('credito')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            cardType === 'credito'
                              ? 'bg-[#9d3c0c] text-white shadow-xs'
                              : 'text-[#7c5641] hover:text-[#1c120c]'
                          }`}
                        >
                          Crédito (1 pago)
                        </button>
                      </div>

                      <span className="text-xs text-[#7c5641] font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#446147]" />
                        Terminal POSNET #01 Conectada
                      </span>
                    </div>

                    {/* Gráfico de Terminal POSNET y Contactless */}
                    <div className="p-3.5 rounded-xl bg-[#fff8f2] border border-[#dec0b6] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isCardContactlessSimulated 
                            ? 'bg-[#ebffe8] text-[#446147] border border-[#aecfae] scale-110' 
                            : 'bg-[#9d3c0c] text-white shadow-sm'
                        }`}>
                          {isCardContactlessSimulated ? (
                            <CheckCircle2 className="w-5 h-5 animate-pulse" aria-hidden="true" focusable="false" />
                          ) : (
                            <Radio className="w-5 h-5 animate-pulse" aria-hidden="true" focusable="false" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1c120c]">
                            {isCardContactlessSimulated ? '¡Tarjeta leída y aprobada!' : 'Acerque o inserte la tarjeta en el POS'}
                          </p>
                          <p className="text-xs text-[#7c5641]">
                            Visa • Mastercard • Maestro • Cabal
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSimulateContactless}
                        className="px-2.5 py-1.5 rounded-lg border border-[#dec0b6] bg-white text-xs font-bold text-[#9d3c0c] hover:bg-[#ffdbce] active:scale-95 transition-all shadow-xs flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                        <span>Simular Contactless</span>
                      </button>
                    </div>

                    {/* Número de Cupón del POSNET */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="pay-card-coupon" className="text-xs font-bold text-[#7c5641]">
                          Nº de Cupón / Operación del POSNET
                        </label>
                        <span className="text-xs text-[#7c5641]">Autogenerado / Editable</span>
                      </div>
                      <input
                        id="pay-card-coupon"
                        type="text"
                        value={couponNumber}
                        onChange={(e) => setCouponNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-[#fff8f2] text-xs font-mono font-bold text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* 5. SECCIÓN VOUCHER */}
                {method === 'voucher' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#dec0b6] space-y-3 shadow-xs">
                    <div className="space-y-1">
                      <label htmlFor="pay-voucher-code" className="text-xs font-bold text-[#7c5641]">
                        Código de Cupón / Voucher / Gift Card
                      </label>
                      <input
                        id="pay-voucher-code"
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="Ej. DULCE-REGALO-100"
                        className="w-full px-3 py-2 rounded-xl border border-[#dec0b6] bg-[#fff8f2] text-xs font-mono font-bold text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                      />
                    </div>
                    <p className="text-xs text-[#7c5641]">
                      Cubre el total de la comanda: <strong className="text-[#9d3c0c]">${totalAmount.toLocaleString('es-AR')}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Botón de Confirmación Manual */}
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing || !isCashSufficient}
                className="w-full py-3.5 rounded-2xl bg-[#9d3c0c] text-white text-base font-bold shadow-lg shadow-[#9d3c0c]/30 hover:bg-[#7f2b00] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
              >
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" focusable="false" />
                <span>
                  {isProcessing 
                    ? 'Registrando Cobro...' 
                    : method === 'qr'
                    ? `Confirmar Acreditación QR ($${totalAmount.toLocaleString('es-AR')})`
                    : method === 'transferencia'
                    ? `Confirmar Transferencia Recibida ($${totalAmount.toLocaleString('es-AR')})`
                    : method === 'tarjeta'
                    ? `Confirmar Cobro con Tarjeta ($${totalAmount.toLocaleString('es-AR')})`
                    : `Confirmar Cobro ($${totalAmount.toLocaleString('es-AR')})`}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* PANTALLA DE COMPROBANTE EMITIDO CON ÉXITO */
          <div className="p-8 text-center space-y-6 flex-1 flex flex-col items-center justify-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-[#ebffe8] text-[#446147] border border-[#aecfae] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" aria-hidden="true" focusable="false" />
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
              {paidDetails && (
                <div className="flex justify-between text-[#7c5641]">
                  <span>Detalle:</span>
                  <span className="text-[#1c120c] font-semibold">{paidDetails}</span>
                </div>
              )}
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

            {/* Opciones de Envío por WhatsApp e Impresión */}
            <div className="w-full max-w-sm space-y-3">
              {!showWhatsAppInput ? (
                <button
                  type="button"
                  onClick={() => setShowWhatsAppInput(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba5a] active:scale-95 transition-all shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" aria-hidden="true" focusable="false" />
                  <span>Enviar Ticket por WhatsApp</span>
                </button>
              ) : (
                <form onSubmit={handleSendWhatsApp} className="p-3 bg-white rounded-2xl border border-[#25D366] shadow-sm space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label htmlFor="pay-wa-phone" className="text-xs font-bold text-[#1c120c] flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#25D366]" aria-hidden="true" focusable="false" />
                      <span>Celular del Cliente</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowWhatsAppInput(false)}
                      className="text-xs text-[#7c5641] hover:text-[#1c120c]"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="pay-wa-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej. 11 2345-6789"
                      className="flex-1 px-3 py-2 rounded-xl border border-[#dec0b6] bg-[#fff8f2] text-xs font-bold text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba5a] active:scale-95 transition-all flex items-center gap-1 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                      <span>Enviar</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#7c5641] text-left">
                    Se abrirá WhatsApp con el detalle del ticket listo para enviar.
                  </p>
                </form>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#dec0b6] bg-white text-xs font-bold text-[#1c120c] hover:bg-[#efe7dd] active:scale-95 transition-all shadow-xs"
              >
                <Printer className="w-4 h-4" aria-hidden="true" focusable="false" />
                <span>Imprimir Ticket</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1c120c] text-white text-xs font-bold hover:bg-black active:scale-95 shadow-md transition-all"
              >
                <span>Finalizar y Salir</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" focusable="false" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
