import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/database';
import { 
  Users, 
  X, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Coffee, 
  ChefHat, 
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface UsersManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsersManagementModal: React.FC<UsersManagementModalProps> = ({ isOpen, onClose }) => {
  const { users, user: currentUser, createUser, deleteUser } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('mozo');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const created = await createUser({
        full_name: fullName.trim(),
        email: email.trim(),
        role
      });
      setSuccessMsg(`Usuario "${created.full_name}" creado exitosamente con rol ${getRoleLabel(created.role)}.`);
      setFullName('');
      setEmail('');
      setRole('mozo');
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message || 'Error al crear el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"?`)) {
      return;
    }
    setError(null);
    setSuccessMsg(null);
    try {
      await deleteUser(userId);
      setSuccessMsg(`Usuario "${userName}" eliminado del sistema.`);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar usuario.');
    }
  };

  const getRoleIcon = (roleName: UserRole) => {
    switch (roleName) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-white" aria-hidden="true" focusable="false" />;
      case 'cocinero':
        return <ChefHat className="w-4 h-4 text-white" aria-hidden="true" focusable="false" />;
      case 'mozo':
        return <Coffee className="w-4 h-4 text-white" aria-hidden="true" focusable="false" />;
    }
  };

  const getRoleBadge = (roleName: UserRole) => {
    switch (roleName) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#1c120c] text-white">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            Administrador
          </span>
        );
      case 'cocinero':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#9d3c0c] text-white">
            <ChefHat className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            Cocinero / Pastelero
          </span>
        );
      case 'mozo':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#7c5641] text-white">
            <Coffee className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
            Mozo de Salón
          </span>
        );
    }
  };

  const getRoleLabel = (roleName: UserRole) => {
    switch (roleName) {
      case 'admin': return 'Administrador';
      case 'cocinero': return 'Cocinero / Maestro Pastelero';
      case 'mozo': return 'Mozo de Salón';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="users-management-title"
    >
      <div 
        className="bg-[#fff8f2] rounded-3xl border border-[#dec0b6] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="p-5 md:p-6 border-b border-[#dec0b6] bg-[#f5ede3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1c120c] text-white flex items-center justify-center shadow-sm">
              <Users className="w-6 h-6" aria-hidden="true" focusable="false" />
            </div>
            <div>
              <h2 id="users-management-title" className="font-serif font-bold text-xl text-[#1c120c]">
                Gestión de Usuarios & Roles
              </h2>
              <p className="text-xs text-[#7c5641]">
                Panel de control de acceso para personal de turno y asignación de permisos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#7c5641] hover:text-[#1c120c] hover:bg-[#dec0b6]/40 transition-all"
            aria-label="Cerrar modal de gestión de usuarios"
          >
            <X className="w-5 h-5" aria-hidden="true" focusable="false" />
          </button>
        </div>

        {/* Mensajes de feedback */}
        {error && (
          <div role="alert" className="mx-6 mt-4 p-3 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold border border-[#ba1a1a]/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" focusable="false" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div role="status" className="mx-6 mt-4 p-3 rounded-xl bg-[#ebffe8] text-[#446147] text-xs font-bold border border-[#aecfae] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" focusable="false" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Contenido desplazable */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(90vh-160px)]">
          {/* Botón / Sección para Crear Nuevo Usuario */}
          {!isCreating ? (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#dec0b6] shadow-xs">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1c120c]">
                  Nuevo Colaborador o Empleado
                </h3>
                <p className="text-xs text-[#7c5641]">
                  Crea accesos inmediatos para nuevos mozos, cocineros o administradores
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setIsCreating(true); setError(null); setSuccessMsg(null); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-md shadow-[#9d3c0c]/20 hover:bg-[#7f2b00] active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" aria-hidden="true" focusable="false" />
                <span>+ Agregar Usuario</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} className="p-5 rounded-2xl bg-white border border-[#dec0b6] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#dec0b6]">
                <h3 className="font-serif font-bold text-base text-[#1c120c] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#9d3c0c]" aria-hidden="true" focusable="false" />
                  Alta de Nuevo Usuario
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-[#7c5641] hover:text-[#ba1a1a] font-semibold"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="user-fullname" className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
                    Nombre y Apellido *
                  </label>
                  <input
                    id="user-fullname"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ej. Sofía Méndez"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dec0b6] bg-[#fff8f2] text-sm font-semibold text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="user-email" className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
                    Correo / Identificador *
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="sofia@dulcetaller.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dec0b6] bg-[#fff8f2] text-sm font-semibold text-[#1c120c] focus:outline-none focus:ring-2 focus:ring-[#9d3c0c]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#7c5641] block">
                  Asignar Rol y Nivel de Permisos *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Rol Mozo */}
                  <button
                    type="button"
                    onClick={() => setRole('mozo')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      role === 'mozo'
                        ? 'bg-[#ffdbce]/40 border-[#9d3c0c] ring-2 ring-[#9d3c0c]/30 shadow-xs'
                        : 'bg-[#fff8f2] border-[#dec0b6] hover:bg-[#efe7dd]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-[#7c5641] text-white flex items-center justify-center font-bold">
                        <Coffee className="w-4 h-4" aria-hidden="true" focusable="false" />
                      </div>
                      <span className="font-bold text-xs text-[#1c120c]">Mozo</span>
                    </div>
                    <p className="text-[11px] text-[#7c5641]">
                      Crea comandas, atiende mesas y cobra pedidos en el salón.
                    </p>
                  </button>

                  {/* Rol Cocinero */}
                  <button
                    type="button"
                    onClick={() => setRole('cocinero')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      role === 'cocinero'
                        ? 'bg-[#ffdbce]/40 border-[#9d3c0c] ring-2 ring-[#9d3c0c]/30 shadow-xs'
                        : 'bg-[#fff8f2] border-[#dec0b6] hover:bg-[#efe7dd]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-[#9d3c0c] text-white flex items-center justify-center font-bold">
                        <ChefHat className="w-4 h-4" aria-hidden="true" focusable="false" />
                      </div>
                      <span className="font-bold text-xs text-[#1c120c]">Cocinero</span>
                    </div>
                    <p className="text-[11px] text-[#7c5641]">
                      Ve comandas, inicia cocción y elabora lotes indicados por el Admin.
                    </p>
                  </button>

                  {/* Rol Administrador */}
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      role === 'admin'
                        ? 'bg-[#ffdbce]/40 border-[#9d3c0c] ring-2 ring-[#9d3c0c]/30 shadow-xs'
                        : 'bg-[#fff8f2] border-[#dec0b6] hover:bg-[#efe7dd]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-[#1c120c] text-white flex items-center justify-center font-bold">
                        <ShieldCheck className="w-4 h-4" aria-hidden="true" focusable="false" />
                      </div>
                      <span className="font-bold text-xs text-[#1c120c]">Administrador</span>
                    </div>
                    <p className="text-[11px] text-[#7c5641]">
                      Control total: stock, recetas, compras, órdenes de cocina y roles.
                    </p>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#7c5641] hover:bg-[#efe7dd]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#9d3c0c] text-white text-xs font-bold shadow-md hover:bg-[#7f2b00] active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Confirmar y Guardar Usuario'}
                </button>
              </div>
            </form>
          )}

          {/* Listado de Usuarios Existentes */}
          <section aria-labelledby="registered-users-heading" className="space-y-3">
            <h3 id="registered-users-heading" className="text-xs font-bold uppercase tracking-wider text-[#7c5641]">
              Usuarios Registrados en el Sistema ({users.length})
            </h3>

            <div className="divide-y divide-[#dec0b6]/50 bg-white rounded-2xl border border-[#dec0b6] overflow-hidden shadow-xs">
              {users.map(u => {
                const isCurrent = currentUser?.id === u.id;
                const isSystemPreset = ['user-admin-1', 'user-mozo-1', 'user-cocinero-1'].includes(u.id);

                return (
                  <div key={u.id} className="p-4 flex items-center justify-between gap-3 hover:bg-[#fffbf8] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs ${
                        u.role === 'admin' ? 'bg-[#1c120c]' : u.role === 'cocinero' ? 'bg-[#9d3c0c]' : 'bg-[#7c5641]'
                      }`}>
                        {getRoleIcon(u.role)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#1c120c]">
                            {u.full_name}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ebffe8] text-[#446147] border border-[#aecfae]">
                              Tu usuario activo
                            </span>
                          )}
                          {isSystemPreset && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f5ede3] text-[#7c5641] border border-[#dec0b6]">
                              Base del Sistema
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#7c5641]">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>{getRoleBadge(u.role)}</div>

                      {!isCurrent && !isSystemPreset ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id, u.full_name)}
                          className="p-2 rounded-xl text-[#7c5641] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-all"
                          aria-label={`Eliminar usuario ${u.full_name}`}
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" focusable="false" />
                        </button>
                      ) : (
                        <div className="p-2 text-[#dec0b6]" title="Usuario protegido">
                          <Lock className="w-4 h-4" aria-hidden="true" focusable="false" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f5ede3] border-t border-[#dec0b6] flex items-center justify-between text-xs text-[#7c5641]">
          <span>Solo el Administrador tiene autorización para crear o modificar roles.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-[#dec0b6] text-xs font-bold text-[#1c120c] hover:bg-[#efe7dd]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

