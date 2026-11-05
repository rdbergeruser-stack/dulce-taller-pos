import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isMozo: boolean;
  isCocinero: boolean;
  users: Profile[];
  login: (role: UserRole, customName?: string) => void;
  loginWithUser: (user: Profile) => void;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  createUser: (userData: { full_name: string; email: string; role: UserRole }) => Promise<Profile>;
  deleteUser: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  isConfigured: boolean;
}

export const PRESET_USERS: Record<UserRole, Profile> = {
  admin: {
    id: 'user-admin-1',
    email: 'encargado@dulcetaller.com',
    full_name: 'Martina González',
    role: 'admin',
    created_at: '2026-10-01T08:00:00Z'
  },
  mozo: {
    id: 'user-mozo-1',
    email: 'mozo1@dulcetaller.com',
    full_name: 'Lucas Rodríguez',
    role: 'mozo',
    created_at: '2026-10-01T08:00:00Z'
  },
  cocinero: {
    id: 'user-cocinero-1',
    email: 'cocina@dulcetaller.com',
    full_name: 'Mateo Benítez',
    role: 'cocinero',
    created_at: '2026-10-01T08:00:00Z'
  }
};

export const INITIAL_USERS_LIST: Profile[] = [
  PRESET_USERS.admin,
  PRESET_USERS.mozo,
  PRESET_USERS.cocinero
];

const USERS_STORAGE_KEY = 'dulce_taller_users';
const ACTIVE_USER_KEY = 'dulce_taller_active_user';

const ensureBaseUsers = (list: Profile[]): Profile[] => {
  const bases = [PRESET_USERS.mozo, PRESET_USERS.cocinero, PRESET_USERS.admin];
  const map = new Map<string, Profile>();
  bases.forEach(b => map.set(b.id, b));
  list.forEach(u => map.set(u.id, u));
  return Array.from(map.values());
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lista de usuarios registrados (base + creados por admin)
  const [users, setUsers] = useState<Profile[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return ensureBaseUsers(parsed);
        }
      } catch {
        // Fallback a INITIAL_USERS_LIST
      }
    }
    return INITIAL_USERS_LIST;
  });

  // Usuario en turno activo
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem(ACTIVE_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Persistir lista de usuarios
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Persistir usuario activo
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  }, [currentUser]);

  // Cargar usuarios y sesión desde Supabase si está disponible
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      // 1. Obtener perfiles reales de la BD
      client
        .from('profiles')
        .select('*')
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setUsers(prev => ensureBaseUsers([...data, ...prev]));
          }
        });

      // 2. Sesión activa
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data) setCurrentUser(data as Profile);
            });
        }
      });
    }
  }, []);

  const loginWithUser = (userToSet: Profile) => {
    setCurrentUser(userToSet);
  };

  const login = (newRole: UserRole, customName?: string) => {
    // Buscar si ya existe un usuario con ese rol en la lista
    const existing = users.find(u => u.role === newRole);
    if (existing && !customName) {
      setCurrentUser(existing);
      return;
    }
    const base = PRESET_USERS[newRole];
    const userToSet: Profile = {
      ...(existing || base),
      full_name: customName || (existing ? existing.full_name : base.full_name)
    };
    setCurrentUser(userToSet);
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (profile) {
          setCurrentUser(profile as Profile);
          return { success: true };
        }
      }
    }

    // Buscar en la lista local de usuarios registrados
    const matched = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      return { success: true };
    }

    // Fallbacks inteligentes por coincidencia en correo
    const lowerEmail = email.toLowerCase();
    if (lowerEmail.includes('admin') || lowerEmail.includes('encargad')) {
      login('admin', 'Martina González');
      return { success: true };
    } else if (lowerEmail.includes('cocin') || lowerEmail.includes('pastel')) {
      login('cocinero', 'Mateo Benítez');
      return { success: true };
    } else {
      login('mozo', 'Lucas Rodríguez');
      return { success: true };
    }
  };

  // Crear usuario con rol asignado por el Administrador
  const createUser = async (userData: { full_name: string; email: string; role: UserRole }): Promise<Profile> => {
    const trimmedEmail = userData.email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      throw new Error(`Ya existe un usuario registrado con el correo ${trimmedEmail}`);
    }

    const newUser: Profile = {
      id: 'user-' + Date.now(),
      email: trimmedEmail,
      full_name: userData.full_name.trim(),
      role: userData.role,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').insert([{
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role
        }]);
      } catch (err) {
        console.warn('Nota: guardado local activo (Supabase profiles insert bypass):', err);
      }
    }

    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  // Eliminar usuario
  const deleteUser = async (userId: string): Promise<void> => {
    // Proteger contra borrado del usuario con el que se está navegando actualmente
    if (currentUser?.id === userId) {
      throw new Error('No puedes eliminar el usuario con la sesión activa actual.');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').delete().eq('id', userId);
      } catch (err) {
        console.warn('Supabase profile delete error:', err);
      }
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem(ACTIVE_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        role: currentUser?.role || null,
        isAdmin: currentUser?.role === 'admin',
        isMozo: currentUser?.role === 'mozo',
        isCocinero: currentUser?.role === 'cocinero',
        users,
        login,
        loginWithUser,
        loginWithEmail,
        createUser,
        deleteUser,
        logout,
        isConfigured: isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
