"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

type AuthError = {
  message: string;
  status?: number;
};

type AuthResponse<T> = {
  error: AuthError | null;
  data: T | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<AuthResponse<User>>;
  signIn: (email: string, password: string) => Promise<AuthResponse<Session>>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse<{}>>;  
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log("AuthProvider Initial Session:", data.session);
          setSession(data.session);
          setUser(data.session.user);
        } else {
          console.log("AuthProvider Initial Session: None");
        }
      } catch (error) {
        console.error("Error fetching initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener using the browser client
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider Auth State Change:", event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Refresh the page after sign-in/sign-out to ensure server components
        // get the latest auth state via middleware.
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          router.refresh();
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Sign up a new user
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    name: string
  ): Promise<AuthResponse<User>> => {
    setIsLoading(true);
    
    try {
      // Create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      // If sign-up was successful, create a record in the customers table
      if (data?.user && !error) {
        const { error: profileError } = await supabase
          .from('customers')
          .insert([
            { 
              id: data.user.id,
              name,
              email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ]);
        
        if (profileError) {
          console.error('Error creating customer profile:', profileError);
          return { error: { message: profileError.message, status: Number(profileError.code) || undefined }, data: null };
        }
        
        return { data: data.user, error: null };
      }
      
      return { 
        data: data?.user || null, 
        error: error ? { message: error.message, status: error.status } : null 
      };
    } catch (err) {
      console.error('Unexpected error during sign up:', err);
      return { data: null, error: { message: 'An unexpected error occurred' } };
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Sign in an existing user
  const signIn = useCallback(async (
    email: string, 
    password: string
  ): Promise<AuthResponse<Session>> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { 
        data: data?.session || null, 
        error: error ? { message: error.message, status: error.status } : null 
      };
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      return { data: null, error: { message: 'An unexpected error occurred' } };
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Sign out the user
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      // Auth state listener and router.refresh() will handle the rest
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  }, [supabase]);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<AuthResponse<{}>> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      return { 
        data: data || null, 
        error: error ? { message: error.message, status: error.status } : null 
      };
    } catch (err) {
      console.error('Unexpected error during password reset:', err);
      return { data: null, error: { message: 'An unexpected error occurred' } };
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}