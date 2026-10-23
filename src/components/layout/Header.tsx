import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserCheck, Shield, UtensilsCrossed, Database, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onOpenDbGuide: () => void;
  lowStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDbGuide, lowStockCount }) => {
  const { role, switchRole, isConfigured } = useAuth();
  const [time, setTime] = useState<string>('');

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
    <header className="bg-[#fff8f2] border-b border-[#dec0b6] px-4 md:px-6 py-3 shadow-sm select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9d3c0c] to-[#bd5324] flex items-center justify-center text-white shadow-md shadow-[#9d3c0c]/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-xl md:text-2xl text-[#1c120c] tracking-tight">
                Dulce Taller
              </h1>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f5ede3] text-[#9d3c0c] border border-[#dec0b6]">
                App Interna
              </span>
            </div>
            <p className="text-xs text-[#7c5641] hidden sm:block">
              Sistema de Comandas, Recetas & Control de Producción
            </p>
          </div>
        </div>

        {/* Right Actions: Clock, Stock Alert, DB status, Role Selector */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Reloj de turno */}
          <div className="text-right hidden lg:block pr-2 border-r border-[#dec0b6]">
            <span className="text-xs text-[#7c5641] block">Hora actual</span>
            <span className="text-sm font-bold text-[#1c120c]">{time} hs</span>
          </div>

          {/* Alerta de Stock Mínimo */}
          {lowStockCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold animate-pulse">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{lowStockCount} stock bajo</span>
            </div>
          )}

          {/* Conexión Supabase */}
          <button
            onClick={onOpenDbGuide}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isConfigured
                ? 'bg-[#ebffe8] text-[#446147] border-[#aecfae] hover:bg-[#d5f5d3]'
                : 'bg-[#fef3c7] text-[#92400e] border-[#fde68a] hover:bg-[#fde68a]'
            }`}
            title="Estado de persistencia con Supabase"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isConfigured ? 'Supabase Conectado' : 'Conectar Supabase'}
            </span>
          </button>

          {/* Selector de Rol táctil rápido */}
          <div className="flex items-center bg-[#efe7dd] p-1 rounded-xl border border-[#dec0b6]">
            <button
              type="button"
              onClick={() => switchRole('mozo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                role === 'mozo'
                  ? 'bg-[#9d3c0c] text-white shadow-sm'
                  : 'text-[#7c5641] hover:text-[#1c120c]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Mozo</span>
            </button>
            <button
              type="button"
              onClick={() => switchRole('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                role === 'admin'
                  ? 'bg-[#1c120c] text-white shadow-sm'
                  : 'text-[#7c5641] hover:text-[#1c120c]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin / Stock</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
