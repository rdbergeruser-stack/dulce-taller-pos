import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ClipboardList, 
  Package, 
  BookOpen, 
  CookingPot, 
  ShoppingCart,
  Lock,
  ChefHat
} from 'lucide-react';

export type ActiveTab = 'orders' | 'inventory' | 'recipes' | 'production' | 'purchases';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingOrdersCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingOrdersCount
}) => {
  const { isAdmin, isCocinero, isMozo } = useAuth();

  const tabs: { 
    id: ActiveTab; 
    label: string; 
    icon: React.ReactNode; 
    disabled?: boolean;
    disabledReason?: string;
    badge?: number 
  }[] = [
    {
      id: 'orders',
      label: 'Comandas & Pedidos',
      icon: <ClipboardList className="w-5 h-5" aria-hidden="true" focusable="false" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
    },
    {
      id: 'production',
      label: isCocinero ? 'Taller de Cocina' : 'Registrar Producción',
      icon: isCocinero 
        ? <ChefHat className="w-5 h-5" aria-hidden="true" focusable="false" /> 
        : <CookingPot className="w-5 h-5" aria-hidden="true" focusable="false" />,
      disabled: !isAdmin && !isCocinero,
      disabledReason: 'Acceso para Administrador y Cocina'
    },
    {
      id: 'recipes',
      label: 'Recetas & Preparaciones',
      icon: <BookOpen className="w-5 h-5" aria-hidden="true" focusable="false" />,
      disabled: !isAdmin,
      disabledReason: 'Solo administradores'
    },
    {
      id: 'inventory',
      label: isMozo ? 'Stock de Vitrina' : 'Materias Primas & Stock',
      icon: <Package className="w-5 h-5" aria-hidden="true" focusable="false" />,
      disabled: false
    },
    {
      id: 'purchases',
      label: 'Lista de Compras',
      icon: <ShoppingCart className="w-5 h-5" aria-hidden="true" focusable="false" />,
      disabled: !isAdmin,
      disabledReason: 'Solo administradores'
    }
  ];

  return (
    <nav aria-label="Módulos de trabajo" className="bg-[#f5ede3] border-b border-[#dec0b6] px-3 md:px-6 py-2 overflow-x-auto select-none no-scrollbar">
      <div className="flex items-center gap-2 min-w-max">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!isDisabled) {
                  onTabChange(tab.id);
                }
              }}
              disabled={isDisabled}
              aria-current={isActive ? 'page' : undefined}
              aria-label={isDisabled ? `${tab.label} (${tab.disabledReason || 'Restringido'})` : tab.label}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                isActive
                  ? 'bg-[#9d3c0c] text-white shadow-md shadow-[#9d3c0c]/25 font-semibold'
                  : isDisabled
                  ? 'opacity-40 cursor-not-allowed text-[#7c5641] hover:bg-transparent'
                  : 'text-[#1c120c] hover:bg-[#efe7dd] active:scale-95'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-[#9d3c0c]'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>

              {tab.badge !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white text-[#9d3c0c]' : 'bg-[#9d3c0c] text-white'
                }`}>
                  {tab.badge}
                </span>
              )}

              {isDisabled && (
                <Lock className="w-3.5 h-3.5 text-[#7c5641] ml-1" aria-hidden="true" focusable="false" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
