import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isMozo: boolean;
  login: (role: UserRole, customName?: string) => void;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isConfigured: boolean;
}

export const PRESET_USERS: Record<UserRole, Profile> = {
  admin: {
    id: 'user-admin-1',
    email: 'encargado@dulcetaller.com',
    full_name: 'Martina González',
    role: 'admin',
    created_at: new Date().toISOString()
  },
  mozo: {
    id: 'user-mozo-1',
    email: 'mozo1@dulcetaller.com',
    full_name: 'Lucas Rodríguez',
    role: 'mozo',
    created_at: new Date().toISOString()
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialmente null para exigir pantalla de login
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('dulce_taller_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dulce_taller_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dulce_taller_active_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
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

  const login = (newRole: UserRole, customName?: string) => {
    const base = PRESET_USERS[newRole];
    const userToSet: Profile = {
      ...base,
      full_name: customName || base.full_name
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

    // Fallback con los usuarios predefinidos
    if (email.toLowerCase().includes('admin') || email.toLowerCase().includes('encargad')) {
      login('admin', 'Martina González');
      return { success: true };
    } else {
      login('mozo', 'Lucas Rodríguez');
      return { success: true };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem('dulce_taller_active_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        role: currentUser?.role || null,
        isAdmin: currentUser?.role === 'admin',
        isMozo: currentUser?.role === 'mozo',
        login,
        loginWithEmail,
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
