import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isAdmin: boolean;
  isMozo: boolean;
  switchRole: (role: UserRole, name?: string) => void;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const DEFAULT_USERS: Record<UserRole, Profile> = {
  admin: {
    id: 'user-admin-1',
    email: 'encargado@dulcetaller.com',
    full_name: 'Martina (Admin / Encargada Stock)',
    role: 'admin',
    created_at: new Date().toISOString()
  },
  mozo: {
    id: 'user-mozo-1',
    email: 'mozo1@dulcetaller.com',
    full_name: 'Lucas (Mozo de Salón)',
    role: 'mozo',
    created_at: new Date().toISOString()
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile>(DEFAULT_USERS.admin);

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

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
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

      return () => subscription.unsubscribe();
    }
  }, []);

  const switchRole = (newRole: UserRole, customName?: string) => {
    const base = DEFAULT_USERS[newRole];
    setCurrentUser({
      ...base,
      full_name: customName || base.full_name
    });
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        role: currentUser.role,
        isAdmin: currentUser.role === 'admin',
        isMozo: currentUser.role === 'mozo',
        switchRole,
        signOut,
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
