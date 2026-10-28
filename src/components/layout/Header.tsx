import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, LogOut, Shield, User, Bell } from 'lucide-react';
import { RawMaterial, Preparation } from '../../types/database';
import { NotificationsModal } from '../notifications/NotificationsModal';

interface HeaderProps {
  lowStockCount: number;
  outOfStockVitrinaCount?: number;
  lowStockVitrinaCount?: number;
  materials?: RawMaterial[];
  preparations?: Preparation[];
  onNavigateToProduction?: (preparationId: string) => void;
  onNavigateToInventory?: (subTab: 'vitrina' | 'stock' | 'kardex') => void;
  onNavigateToPurchases?: () => void;
  onNavigateToOrders?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  lowStockCount, 
  outOfStockVitrinaCount = 0,
  lowStockVitrinaCount = 0,
  materials = [],
  preparations = [],
  onNavigateToProduction,
  onNavigateToInventory,
  onNavigateToPurchases,
  onNavigateToOrders
}) => {
  const { user, isAdmin, logout } = useAuth();
  const [time, setTime] = useState<string>('');
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'vitrina' | 'materials'>('all');

  const totalAlerts = lowStockCount + outOfStockVitrinaCount + lowStockVitrinaCount;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header className="bg-[#fff8f2] border-b border-[#dec0b6] px-4 md:px-6 py-3 shadow-sm select-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Logo Oficial */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo Dulce Taller" 
              className="w-11 h-11 object-contain rounded-xl shadow-xs p-1 bg-white border border-[#dec0b6]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-xl md:text-2xl text-[#1c120c] tracking-tight">
                  Dulce Taller
                </h1>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f5ede3] text-[#9d3c0c] border border-[#dec0b6]">
                  POS Tablet
                </span>
              </div>
              <p className="text-xs text-[#7c5641] hidden sm:block">
                Gestión de Comandas, Producción & Stock
              </p>
            </div>
          </div>

          {/* Right Actions: Clock, Stock Alert Buttons, User Profile Box & Logout */}
          <div className="flex items-center gap-2.5 md:gap-4">
            {/* Reloj de turno */}
            <div className="text-right hidden lg:block pr-3 border-r border-[#dec0b6]">
              <span className="text-xs text-[#7c5641] block">Hora de Turno</span>
              <span className="text-sm font-bold text-[#1c120c]">{time} hs</span>
            </div>

            {/* Botón Campana Centro de Notificaciones */}
            <button
              type="button"
              onClick={() => { setNotifFilter('all'); setIsNotifModalOpen(true); }}
              className="relative p-2 rounded-xl border border-[#dec0b6] bg-white text-[#7c5641] hover:text-[#9d3c0c] hover:bg-[#f5ede3] active:scale-95 transition-all shadow-xs"
              aria-label={`Centro de notificaciones. ${totalAlerts} alertas activas`}
              title="Abrir Centro de Alertas y Notificaciones"
            >
              <Bell className="w-5 h-5" aria-hidden="true" focusable="false" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#ba1a1a] text-white text-xs font-black flex items-center justify-center border-2 border-white animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Alerta Clickeable de Stock Mínimo Insumos */}
            {lowStockCount > 0 && (
              <button
                type="button"
                onClick={() => { setNotifFilter('materials'); setIsNotifModalOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold animate-pulse hover:brightness-95 hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                aria-label={`${lowStockCount} insumos por debajo del mínimo. Haz clic para ver detalles y gestionar reposición.`}
                title="Haz clic para ver qué insumos están escaseando"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" focusable="false" />
                <span>{lowStockCount} insumos bajos</span>
              </button>
            )}

            {/* Alertas Clickeables de Vitrina Agotada */}
            {outOfStockVitrinaCount > 0 && (
              <button
                type="button"
                onClick={() => { setNotifFilter('vitrina'); setIsNotifModalOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-xs font-extrabold border border-[#ba1a1a]/30 animate-pulse hover:brightness-95 hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                aria-label={`${outOfStockVitrinaCount} productos agotados en vitrina. Haz clic para cocinar o fraccionar.`}
                title="Haz clic para ver los productos agotados y mandar a cocinar"
              >
                <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" aria-hidden="true" />
                <span>{outOfStockVitrinaCount} vitrina agotada</span>
              </button>
            )}

            {/* Alertas Clickeables de Vitrina con Poco Stock */}
            {outOfStockVitrinaCount === 0 && lowStockVitrinaCount > 0 && (
              <button
                type="button"
                onClick={() => { setNotifFilter('vitrina'); setIsNotifModalOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fef3c7] text-[#92400e] text-xs font-bold border border-[#fde68a] hover:brightness-95 hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                aria-label={`${lowStockVitrinaCount} productos con poco stock en vitrina. Haz clic para ver detalles.`}
                title="Haz clic para ver los productos con poco stock en vitrina"
              >
                <span>{lowStockVitrinaCount} poco stock vitrina</span>
              </button>
            )}

            {/* Caja de Usuario Activo y Rol */}
            {user && (
              <div className="flex items-center gap-3 pl-2 sm:border-l border-[#dec0b6]">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                    isAdmin ? 'bg-[#1c120c]' : 'bg-[#9d3c0c]'
                  }`}>
                    {isAdmin ? <Shield className="w-4 h-4" aria-hidden="true" focusable="false" /> : <User className="w-4 h-4" aria-hidden="true" focusable="false" />}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-[#1c120c] leading-tight">
                      {user.full_name}
                    </div>
                    <div className="text-xs font-semibold text-[#7c5641] flex items-center gap-1 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-[#1c120c]' : 'bg-[#9d3c0c]'}`} />
                      <span>{isAdmin ? 'Administrador / Stock' : 'Mozo de Salón'}</span>
                    </div>
                  </div>
                </div>

                {/* Botón Cerrar Sesión / Salir de turno */}
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Cerrar turno y salir del sistema"
                  className="p-2 ml-1 rounded-xl text-[#7c5641] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 active:scale-95 transition-all"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" focusable="false" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal / Panel Interactivo de Alertas y Notificaciones con Acción Directa */}
      <NotificationsModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        materials={materials}
        preparations={preparations}
        initialFilter={notifFilter}
        onNavigateToProduction={onNavigateToProduction}
        onNavigateToInventory={onNavigateToInventory}
        onNavigateToPurchases={onNavigateToPurchases}
        onNavigateToOrders={onNavigateToOrders}
      />
    </>
  );
};
