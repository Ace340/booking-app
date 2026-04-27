import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, _password: string) => {
    set({ isLoading: true });

    // TODO: Connect to backend API
    // Simulated auth for now
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!email.includes('@')) {
      set({ isLoading: false });
      return { success: false, error: 'Invalid email address' };
    }

    set({
      user: {
        id: 'mock-user-1',
        email,
        name: email.split('@')[0] ?? 'User',
        role: 'user',
      },
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false,
    });

    return { success: true };
  },

  register: async (email: string, name: string, _password: string) => {
    set({ isLoading: true });

    // TODO: Connect to backend API
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!email.includes('@')) {
      set({ isLoading: false });
      return { success: false, error: 'Invalid email address' };
    }

    if (!name.trim()) {
      set({ isLoading: false });
      return { success: false, error: 'Name is required' };
    }

    set({
      user: {
        id: 'mock-user-1',
        email,
        name,
        role: 'user',
      },
      token: 'mock-token',
      isAuthenticated: true,
      isLoading: false,
    });

    return { success: true };
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));
