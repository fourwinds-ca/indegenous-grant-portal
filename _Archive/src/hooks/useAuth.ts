import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);

      // Sync with backend if we have a session
      if (session) {
        syncSessionWithBackend(session.access_token, session.refresh_token);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session) {
        syncSessionWithBackend(session.access_token, session.refresh_token);
      }

      // Invalidate queries on auth state change
      queryClient.invalidateQueries();
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Sync session with backend
  const syncSessionWithBackend = async (accessToken: string, refreshToken: string) => {
    try {
      await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      });
    } catch (error) {
      console.error('Failed to sync session with backend:', error);
    }
  };

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!session,
    retry: false,
  });

  const signInWithEmail = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
  });

  const signUpWithEmail = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
  });

  const signOut = useMutation({
    mutationFn: async () => {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Sign out from backend
      await fetch('/api/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  const signInWithOAuth = async (provider: 'google' | 'github' | 'azure') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) throw error;
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    signInWithEmail: signInWithEmail.mutateAsync,
    signUpWithEmail: signUpWithEmail.mutateAsync,
    signOut: signOut.mutateAsync,
    signInWithOAuth,
  };
}