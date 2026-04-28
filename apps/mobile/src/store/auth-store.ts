import { create } from 'zustand';

/**
 * Auth User Interface
 *
 * Matches the profile returned from our backend.
 * Clerk manages authentication — this store only holds
 * the user's backend profile data.
 */
export interface AuthUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ user: null, isLoading: false, error: null }),
}));
