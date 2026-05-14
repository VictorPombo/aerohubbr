'use client';

// ═══════════════════════════════════════════════════════
// AeroGest — Supabase Auth Context
// ═══════════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types/models';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar o perfil completo do usuário (tabela profiles)
  const fetchProfile = async (authUserId: string, email: string): Promise<User> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (error) {
        console.warn('Perfil não encontrado na tabela profiles. Retornando fallback.', error);
        // Fallback caso a tabela profiles ainda não tenha sido populada ou criada
        return {
          id: authUserId,
          email: email,
          full_name: email.split('@')[0], // Nome extraído do e-mail
          role: 'pilot', // Papel padrão
          canac: '',
          created_at: new Date().toISOString(),
        };
      }

      return {
        id: data.id,
        email: email, // O email não fica na tabela profiles, pegamos do Auth
        full_name: data.full_name,
        role: data.role,
        canac: data.anac_code || data.canac || '',
        avatar_url: data.avatar_url,
        created_at: data.created_at,
      };
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      return {
        id: authUserId,
        email: email,
        full_name: email.split('@')[0],
        role: 'pilot',
        created_at: new Date().toISOString(),
      };
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      setIsLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao pegar sessão:', error);
        if (mounted) setIsLoading(false);
        return;
      }

      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email || '');
        if (mounted) setUser(profile);
      } else {
        if (mounted) setUser(null);
      }
      
      if (mounted) setIsLoading(false);
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email || '');
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      throw error; // Lançamos o erro para a página de login tratar (exibir toast)
    }

    if (data.session?.user) {
      const profile = await fetchProfile(data.session.user.id, data.session.user.email || '');
      setUser(profile);
    }
    
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
