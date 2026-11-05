import React, { useState } from 'react';
import { useAuth, PRESET_USERS } from '../../contexts/AuthContext';
import { Profile, UserRole } from '../../types/database';
import { 
  ShieldCheck, 
  ArrowRight, 
  Coffee, 
  ChefHat,
  Lock, 
  Mail,
  UserCheck
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { users, login, loginWithUser, loginWithEmail } = useAuth();
  const [useManualForm, setUseManualForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Perfiles principales de turno del establecimiento garantizados
  const coreStaff: { profile: Profile; subtitle: string; description: string }[] = [
    {
      profile: PRESET_USERS.mozo,
      subtitle: 'Mozo de Salón',
      description: 'Crea comandas, visualiza vitrina y stock, entrega y cobra cuentas.'
    },
    {
      profile: PRESET_USERS.cocinero,
      subtitle: 'Cocinero / Maestro Pastelero',
      description: 'Elabora comandas de salón, monitorea stock y solicita producción al admin.'
    },
    {
      profile: PRESET_USERS.admin,
      subtitle: 'Admin / Encargada de Stock',
      description: 'Autoriza producción, crea recetas y administra usuarios y roles.'
    }
  ];

  // Usuarios adicionales creados por el administrador
  const customUsers = users.filter(u => 
    !['user-mozo-1', 'user-cocinero-1', 'user-admin-1'].includes(u.id) &&
    !['mozo1@dulcetaller.com', 'cocina@dulcetaller.com', 'encargado@dulcetaller.com'].includes(u.email.toLowerCase())
  );

  const handleSelectCoreUser = (roleName: UserRole, customName?: string) => {
    login(roleName, customName);
  };

  const handleSelectCustomUser = (u: Profile) => {
    loginWithUser(u);
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

  const getRoleCardStyle = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          iconBox: 'bg-[#1c120c] text-white',
          icon: <ShieldCheck className="w-6 h-6" aria-hidden="true" focusable="false" />,
          badge: 'bg-[#1c120c]/10 text-[#1c120c]',
          roleLabel: 'Admin / Encargada de Stock'
        };
      case 'cocinero':
        return {
          iconBox: 'bg-[#9d3c0c] text-white',
          icon: <ChefHat className="w-6 h-6" aria-hidden="true" focusable="false" />,
          badge: 'bg-[#ffdbce] text-[#9d3c0c]',
          roleLabel: 'Cocinero / Maestro Pastelero'
        };
      case 'mozo':
        return {
          iconBox: 'bg-[#efe7dd] text-[#7c5641]',
          icon: <Coffee className="w-6 h-6" aria-hidden="true" focusable="false" />,
          badge: 'bg-[#f5ede3] text-[#7c5641]',
          roleLabel: 'Mozo de Salón'
        };
    }
  };

  return (
    <main role="main" className="min-h-screen bg-[#fff8f2] flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#dec0b6] shadow-xl overflow-hidden">
        {/* Header con identidad Dulce Taller Oficial */}
        <header className="p-8 text-center bg-gradient-to-b from-[#f5ede3] to-white border-b border-[#dec0b6]/60">
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
        </header>

        {/* Cuerpo del Login */}
        <div className="p-6 md:p-8 space-y-6">
          {errorMessage && (
            <div role="alert" className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-xs font-bold border border-[#ba1a1a]/20">
              {errorMessage}
            </div>
          )}

          {!useManualForm ? (
            /* Modo 1: Selección Táctil de Personal de Turno */
            <section aria-labelledby="role-selection-title" className="space-y-4">
              <h2 id="role-selection-title" className="text-xs font-bold uppercase tracking-wider text-[#7c5641] block text-center">
                Selecciona tu Usuario para Iniciar Turno
              </h2>

              {/* Los 3 Perfiles Base del Sistema (Mozo, Cocinero, Administrador) */}
              <div className="space-y-3">
                {coreStaff.map(({ profile, subtitle, description }) => {
                  const style = getRoleCardStyle(profile.role);
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => handleSelectCoreUser(profile.role, profile.full_name)}
                      aria-label={`Iniciar turno como ${profile.full_name}, ${subtitle}`}
                      className="w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group bg-[#fff8f2] border-[#dec0b6] hover:bg-[#efe7dd] hover:border-[#9d3c0c] active:scale-98 shadow-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${style.iconBox}`}>
                          {style.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-[#1c120c]">
                              {profile.full_name}
                            </h3>
                          </div>
                          <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#dec0b6] mt-0.5 ${style.badge}`}>
                            {subtitle}
                          </span>
                          <p className="text-[11px] text-[#7c5641] mt-1 line-clamp-1">
                            {description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#7c5641] group-hover:text-[#9d3c0c] group-hover:translate-x-1 transition-all shrink-0 ml-2" aria-hidden="true" focusable="false" />
                    </button>
                  );
                })}
              </div>

              {/* Colaboradores adicionales dados de alta por el Administrador */}
              {customUsers.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-[#dec0b6]/50">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#7c5641]">
                    Otros Colaboradores Registrados ({customUsers.length})
                  </h4>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {customUsers.map(u => {
                      const style = getRoleCardStyle(u.role);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectCustomUser(u)}
                          className="w-full p-3 rounded-xl border border-[#dec0b6] bg-white hover:bg-[#fff8f2] flex items-center justify-between text-left transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#f5ede3] text-[#9d3c0c] flex items-center justify-center">
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-xs text-[#1c120c]">{u.full_name}</p>
                              <span className="text-[10px] text-[#7c5641] uppercase font-semibold">{style.roleLabel}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#7c5641]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setUseManualForm(true)}
                  className="text-xs text-[#7c5641] hover:text-[#9d3c0c] font-semibold underline"
                >
                  O ingresar con correo y contraseña
                </button>
              </div>
            </section>
          ) : (
            /* Modo 2: Formulario Manual */
            <form onSubmit={handleFormSubmit} className="space-y-4" aria-label="Formulario de ingreso">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-xs font-bold text-[#7c5641]">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7c5641] absolute left-3 top-3.5" aria-hidden="true" focusable="false" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cocina@dulcetaller.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#dec0b6] bg-[#fff8f2] text-sm font-medium text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-xs font-bold text-[#7c5641]">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7c5641] absolute left-3 top-3.5" aria-hidden="true" focusable="false" />
                  <input
                    id="login-password"
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
        <footer className="p-4 bg-[#f5ede3] border-t border-[#dec0b6] text-center text-[11px] text-[#7c5641]">
          Conexión segura activa con PostgreSQL en Supabase
        </footer>
      </div>
    </main>
  );
};
