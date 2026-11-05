import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginView } from './components/auth/LoginView';
import { Header } from './components/layout/Header';
import { Navigation, ActiveTab } from './components/layout/Navigation';
import { OrdersView } from './components/orders/OrdersView';
import { InventoryView } from './components/inventory/InventoryView';
import { RecipesView } from './components/recipes/RecipesView';
import { ProductionView } from './components/production/ProductionView';
import { PurchasesView } from './components/purchases/PurchasesView';

import { inventoryService } from './services/inventoryService';
import { recipeService } from './services/recipeService';
import { orderService } from './services/orderService';
import { purchaseService } from './services/purchaseService';
import { notificationService } from './services/notificationService';

import { supabase, isSupabaseConfigured } from './lib/supabase';
import { RawMaterial, Preparation, Order, StockMovement, PurchaseListItem, OrderStatus, OrderOrigin } from './types/database';

function MainApp() {
  const { user, isAdmin, isCocinero, isMozo, role } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
  const [productionInitialPrepId, setProductionInitialPrepId] = useState<string | undefined>(undefined);
  const [inventoryInitialSubTab, setInventoryInitialSubTab] = useState<'vitrina' | 'stock' | 'kardex'>('vitrina');
  const [inventoryHighlightMaterialId, setInventoryHighlightMaterialId] = useState<string | undefined>(undefined);

  // Estados de datos
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [preparations, setPreparations] = useState<Preparation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchases, setPurchases] = useState<PurchaseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);

  // Notificación tipo toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Cargar datos
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const mats = await inventoryService.getRawMaterials();
      const [movs, preps, ords, purch] = await Promise.all([
        inventoryService.getMovements(),
        recipeService.getPreparations(),
        orderService.getOrders(),
        purchaseService.getPurchaseList(mats)
      ]);
      setMaterials(mats);
      setMovements(movs);
      setPreparations(preps);
      setOrders(ords);
      setPurchases(purch);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  // Si cambia el rol y el usuario se encuentra en una pestaña restringida, volver a 'orders'
  useEffect(() => {
    if (role === 'mozo' && activeTab !== 'orders' && activeTab !== 'inventory') {
      setActiveTab('orders');
    } else if (role === 'cocinero' && activeTab !== 'orders' && activeTab !== 'production' && activeTab !== 'inventory') {
      setActiveTab('orders');
    }
  }, [role, activeTab]);

  // Si no hay usuario autenticado, renderizar la pantalla de Login previa
  if (!user) {
    return <LoginView />;
  }

  // Handlers Comandas
  const handleCreateOrder = async (
    orderData: { origin: OrderOrigin; table_number?: string; notes?: string },
    items: { preparation_id: string; quantity: number; unit_price: number; notes?: string }[]
  ) => {
    const createdOrder = await orderService.createOrder(orderData, items, user.id);
    // Notificar a Cocina (el tono de campana solo suena en dispositivos de cocineros)
    notificationService.notifyNewOrder(createdOrder, user.full_name, role || undefined);
    showToast(`Comanda #${createdOrder.order_number} creada con éxito. Notificación enviada a cocina.`, 'success');
    await loadAllData();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await orderService.updateOrderStatus(orderId, status, user.id);
    if (status === 'entregada') {
      showToast('Comanda entregada. Stock de vitrina actualizado.', 'success');
    } else {
      showToast(`Estado de comanda actualizado a: ${status}`, 'info');
    }
    await loadAllData();
  };

  const handlePayOrder = async (orderId: string, paymentData: { method: any; amountPaid: number; changeGiven: number; receiptNumber: string; details?: string }) => {
    const order = orders.find(o => o.id === orderId);
    const existingNotes = order?.notes ? `${order.notes} | ` : '';
    const detailsStr = paymentData.details ? ` (${paymentData.details})` : '';
    const paymentNote = `${existingNotes}[PAGADO: ${paymentData.method.toUpperCase()}${detailsStr} | Recibido: $${paymentData.amountPaid.toLocaleString('es-AR')} | Vuelto: $${paymentData.changeGiven.toLocaleString('es-AR')} | Ticket #${paymentData.receiptNumber}]`;

    if (order && order.status !== 'entregada') {
      await orderService.updateOrderStatus(orderId, 'entregada', user.id);
    }

    if (isSupabaseConfigured && supabase) {
      await supabase.from('orders').update({ notes: paymentNote }).eq('id', orderId);
    } else if (order) {
      order.notes = paymentNote;
    }

    showToast(`Cuenta cobrada exitosamente ($${paymentData.amountPaid.toLocaleString('es-AR')}). Ticket #${paymentData.receiptNumber}`, 'success');
    await loadAllData();
  };

  // Handlers Inventario
  const handleAddMaterial = async (mat: Omit<RawMaterial, 'id'>) => {
    await inventoryService.createRawMaterial(mat, user.id);
    showToast(`Materia prima "${mat.name}" creada exitosamente.`);
    await loadAllData();
  };

  const handleAdjustStock = async (id: string, newStock: number, reason: string, newMinStock?: number) => {
    const updates: Partial<RawMaterial> = { current_stock: newStock };
    if (newMinStock !== undefined) {
      updates.min_stock = newMinStock;
    }
    await inventoryService.updateRawMaterial(id, updates, user.id, reason);
    showToast('Stock y niveles de alerta de materia prima actualizados.');
    await loadAllData();
  };

  const handleAdjustPrepStock = async (id: string, newStock: number, reason: string) => {
    await recipeService.updatePreparation(id, { stock_available: newStock });
    showToast(`Stock de vitrina actualizado (${reason}).`);
    await loadAllData();
  };

  // Handlers Compras
  const handleUpdatePurchaseItem = async (id: string, updates: Partial<PurchaseListItem>) => {
    await purchaseService.updateItem(id, updates);
    showToast('Lista de compras actualizada.');
    await loadAllData();
  };

  const handleAddPurchaseItem = async (item: Omit<PurchaseListItem, 'id'>) => {
    await purchaseService.addManualItem(item);
    showToast(`Ítem "${item.item_name}" agregado a compras.`);
    await loadAllData();
  };

  const handleRefreshPurchaseSuggestions = async () => {
    await purchaseService.generateAutoSuggestions(materials);
    showToast('Sugerencias de compras recalculadas según stock.');
    await loadAllData();
  };

  // Navegación contextual desde Notificaciones
  const handleNavigateToProduction = (preparationId: string) => {
    if (role === 'mozo') {
      showToast('Acceso exclusivo para rol Administrador / Cocina', 'info');
      return;
    }
    setProductionInitialPrepId(preparationId);
    setActiveTab('production');
  };

  const handleNavigateToInventory = (subTab: 'vitrina' | 'stock' | 'kardex', materialId?: string) => {
    if (isMozo && subTab !== 'vitrina') {
      setInventoryInitialSubTab('vitrina');
    } else {
      setInventoryInitialSubTab(subTab);
    }
    setInventoryHighlightMaterialId(materialId);
    setActiveTab('inventory');
  };

  const handleNavigateToPurchases = () => {
    if (!isAdmin) {
      showToast('Acceso exclusivo para rol Administrador', 'info');
      return;
    }
    setActiveTab('purchases');
  };

  const handleNavigateToOrders = (focusVitrina?: boolean, orderId?: string) => {
    setActiveTab('orders');
    if (orderId) {
      setHighlightOrderId(orderId);
    }
    if (focusVitrina) {
      setTimeout(() => {
        const el = document.getElementById('vitrina-disponibilidad');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-[#9d3c0c]', 'shadow-lg');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-[#9d3c0c]', 'shadow-lg');
          }, 2500);
        }
      }, 250);
    }
  };

  const handleSendKitchenNotice = (itemName: string) => {
    showToast(`🔔 Aviso registrado para cocina y admin: "${itemName}" en nivel crítico.`, 'info');
  };

  const lowStockCount = inventoryService.getLowStockAlerts(materials).length;
  const outOfStockVitrinaCount = preparations.filter(p => (p.stock_available || 0) <= 0).length;
  const lowStockVitrinaCount = preparations.filter(p => {
    const stock = p.stock_available || 0;
    const threshold = p.unit_type === 'entera' ? 1 : 3;
    return stock > 0 && stock <= threshold;
  }).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pendiente' || o.status === 'en_preparacion').length;

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] animate-bounce">
          <div className={`px-5 py-3 rounded-2xl shadow-xl border text-sm font-bold ${
            toast.type === 'success'
              ? 'bg-[#ebffe8] text-[#446147] border-[#aecfae]'
              : toast.type === 'error'
              ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30'
              : 'bg-[#1c120c] text-white border-black'
          }`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Header con Perfil de Usuario y Logout */}
      <Header 
        lowStockCount={lowStockCount} 
        outOfStockVitrinaCount={outOfStockVitrinaCount}
        lowStockVitrinaCount={lowStockVitrinaCount}
        materials={materials}
        preparations={preparations}
        onNavigateToProduction={handleNavigateToProduction}
        onNavigateToInventory={handleNavigateToInventory}
        onNavigateToPurchases={handleNavigateToPurchases}
        onNavigateToOrders={handleNavigateToOrders}
        onSendKitchenNotice={handleSendKitchenNotice}
      />

      {/* Navegación Táctil para Tablet */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-12">
        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            preparations={preparations}
            onCreateOrder={handleCreateOrder}
            onUpdateStatus={handleUpdateOrderStatus}
            onPayOrder={handlePayOrder}
            isLoading={isLoading}
            highlightOrderId={highlightOrderId}
            onClearHighlight={() => setHighlightOrderId(null)}
          />
        )}

        {activeTab === 'production' && (isAdmin || isCocinero) && (
          <ProductionView
            preparations={preparations}
            materials={materials}
            initialPreparationId={productionInitialPrepId}
            onProductionCompleted={loadAllData}
          />
        )}

        {activeTab === 'recipes' && isAdmin && (
          <RecipesView
            preparations={preparations}
            materials={materials}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            materials={materials}
            movements={movements}
            preparations={preparations}
            initialSubTab={inventoryInitialSubTab}
            highlightMaterialId={inventoryHighlightMaterialId}
            onAddMaterial={handleAddMaterial}
            onAdjustStock={handleAdjustStock}
            onAdjustPrepStock={handleAdjustPrepStock}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'purchases' && isAdmin && (
          <PurchasesView
            items={purchases}
            materials={materials}
            onUpdateItem={handleUpdatePurchaseItem}
            onAddItem={handleAddPurchaseItem}
            onRefreshSuggestions={handleRefreshPurchaseSuggestions}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
