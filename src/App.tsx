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

import { RawMaterial, Preparation, Order, StockMovement, PurchaseListItem, OrderStatus, OrderOrigin } from './types/database';

function MainApp() {
  const { user, isAdmin, role } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');

  // Estados de datos
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [preparations, setPreparations] = useState<Preparation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchases, setPurchases] = useState<PurchaseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const [mats, movs, preps, ords, purch] = await Promise.all([
        inventoryService.getRawMaterials(),
        inventoryService.getMovements(),
        recipeService.getPreparations(),
        orderService.getOrders(),
        purchaseService.getPurchaseList()
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

  // Si cambia el rol de admin a mozo y está en una pestaña restringida, volver a 'orders'
  useEffect(() => {
    if (role === 'mozo' && activeTab !== 'orders') {
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
    await orderService.createOrder(orderData, items, user.id);
    showToast(`Comanda #${orders.length > 0 ? Math.max(...orders.map(o => o.order_number)) + 1 : 101} creada con éxito.`);
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

  // Handlers Inventario
  const handleAddMaterial = async (mat: Omit<RawMaterial, 'id'>) => {
    await inventoryService.createRawMaterial(mat, user.id);
    showToast(`Materia prima "${mat.name}" creada exitosamente.`);
    await loadAllData();
  };

  const handleAdjustStock = async (id: string, newStock: number, reason: string) => {
    await inventoryService.updateRawMaterial(id, { current_stock: newStock }, user.id, reason);
    showToast('Stock de materia prima ajustado.');
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
    await purchaseService.generateAutoSuggestions();
    showToast('Sugerencias de compras recalculadas.');
    await loadAllData();
  };

  const lowStockCount = inventoryService.getLowStockAlerts(materials).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pendiente' || o.status === 'en_preparacion').length;

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
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
      <Header lowStockCount={lowStockCount} />

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
            isLoading={isLoading}
          />
        )}

        {activeTab === 'production' && isAdmin && (
          <ProductionView
            preparations={preparations}
            materials={materials}
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

        {activeTab === 'inventory' && isAdmin && (
          <InventoryView
            materials={materials}
            movements={movements}
            onAddMaterial={handleAddMaterial}
            onAdjustStock={handleAdjustStock}
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
