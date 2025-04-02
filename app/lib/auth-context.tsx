"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
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
      const { data, error } = await supabase.auth.getSession();
      
      if (data.session) {
        console.log("AuthProvider Initial Session:", data.session);
        setSession(data.session);
        setUser(data.session.user);
      } else {
        console.log("AuthProvider Initial Session: None");
      }
      
      setIsLoading(false);
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
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
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
        return { error: profileError, data: null };
      }
    }
    
    setIsLoading(false);
    return { data, error };
  };

  // Sign in an existing user
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    return { data, error };
  };

  // Sign out the user
  const signOut = async () => {
    await supabase.auth.signOut();
    // Auth state listener and router.refresh() will handle the rest
  };

  // Reset password
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);
    return { data, error };
  };

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