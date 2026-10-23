import React, { useState } from 'react';
import { useAuth, PRESET_USERS } from '../../contexts/AuthContext';
import { UserRole } from '../../types/database';
import { 
  ShieldCheck, 
  ArrowRight, 
  Coffee, 
  Lock, 
  Mail
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, loginWithEmail } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [useManualForm, setUseManualForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuickLogin = (role: UserRole) => {
    setSelectedRole(role);
    login(role);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa correo y contraseña.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await loginWithEmail(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Credenciales inválidas.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#dec0b6] shadow-xl overflow-hidden">
        {/* Header con identidad Dulce Taller Oficial */}
        <div className="p-8 text-center bg-gradient-to-b from-[#f5ede3] to-white border-b border-[#dec0b6]/60">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white p-2 border border-[#dec0b6] shadow-md flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Logo Dulce Taller" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-serif font-bold text-3xl text-[#1c120c] tracking-tight">
            Dulce Taller
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#9d3c0c] font-bold mt-1">
            Pastelería & Café de Especialidad
          </p>
          <p className="text-xs text-[#7c5641] mt-2 font-medium">
            Sistema Interno de Comandas y Gestión de Stock
          </p>
        </div>

        {/* Cuerpo del Login */}
        <div className="p-6 md:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-xs font-bold border border-[#ba1a1a]/20">
              {errorMessage}
            </div>
          )}

          {!useManualForm ? (
            /* Modo 1: Selección Táctil de Personal de Turno */
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7c5641] block text-center">
                Selecciona tu Usuario para Iniciar Turno
              </label>

              <div className="space-y-3">
                {/* Perfil Mozo */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('mozo')}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                    selectedRole === 'mozo'
                      ? 'bg-[#ffdbce]/40 border-[#9d3c0c] ring-2 ring-[#9d3c0c]/30 shadow-sm'
                      : 'bg-[#fff8f2] border-[#dec0b6] hover:bg-[#efe7dd]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#efe7dd] text-[#9d3c0c] flex items-center justify-center font-bold">
                      <Coffee className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#1c120c]">
                        {PRESET_USERS.mozo.full_name}
                      </h3>
                      <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f5ede3] text-[#7c5641] border border-[#dec0b6] mt-0.5">
                        Mozo de Salón
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#7c5641] group-hover:text-[#9d3c0c] group-hover:translate-x-1 transition-all" />
                </button>

                {/* Perfil Admin / Encargada */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                    selectedRole === 'admin'
                      ? 'bg-[#ffdbce]/40 border-[#9d3c0c] ring-2 ring-[#9d3c0c]/30 shadow-sm'
                      : 'bg-[#fff8f2] border-[#dec0b6] hover:bg-[#efe7dd]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#1c120c] text-white flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#1c120c]">
                        {PRESET_USERS.admin.full_name}
                      </h3>
                      <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#1c120c]/10 text-[#1c120c] border border-[#dec0b6] mt-0.5">
                        Admin / Encargada de Stock
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#7c5641] group-hover:text-[#9d3c0c] group-hover:translate-x-1 transition-all" />
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setUseManualForm(true)}
                  className="text-xs text-[#7c5641] hover:text-[#9d3c0c] font-semibold underline"
                >
                  O ingresar con correo y contraseña
                </button>
              </div>
            </div>
          ) : (
            /* Modo 2: Formulario Manual */
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#7c5641]">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7c5641] absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="encargado@dulcetaller.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dec0b6] bg-[#fff8f2] text-sm font-medium text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#7c5641]">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7c5641] absolute left-3 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dec0b6] bg-[#fff8f2] text-sm font-medium text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#9d3c0c] text-white font-bold text-sm shadow-md hover:bg-[#7f2b00] active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setUseManualForm(false)}
                  className="text-xs text-[#7c5641] hover:text-[#9d3c0c] font-semibold underline"
                >
                  Volver a selección rápida de personal
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f5ede3] border-t border-[#dec0b6] text-center text-[11px] text-[#7c5641]">
          Conexión segura activa con PostgreSQL en Supabase
        </div>
      </div>
    </div>
  );
};
