import { create } from "zustand";
import { AuthAPI, ProfileAPI } from "../dto/api";

interface User {
  id: number | null;
  username: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthChecking: boolean;
  isLoginLoading: boolean;

  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isAuthChecking: true,
  isLoginLoading: true,
  login: async (username: string, password: string) => {
    set({ isLoginLoading: true, error: null, isLoading: true });

    try {
      await AuthAPI.login({ username, password });
      const profileData = await ProfileAPI.getProfile();

      set({
        user: profileData.profile,
        isAuthenticated: true,
        isLoginLoading: false,
        isLoading: false,
      });
    } catch (error: any) {
      let errorMessage = "Произошла ошибка при входе";

      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((err: any) => err.msg)
            .join(", ");
        } else {
          errorMessage = error.response.data.detail;
        }
      }

      set({ error: errorMessage, isLoginLoading: false, isLoading: false });

      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await AuthAPI.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    set({ isAuthChecking: true });
    try {
      if (AuthAPI.isAuthenticated()) {
        try {
          const response = await ProfileAPI.getProfile();
          set({
            user: response.profile,
            isAuthenticated: true,
            isLoading: false,
            isAuthChecking: false,
          });

          return true;
        } catch (_) {
          try {
            const response = await AuthAPI.refreshToken();
            set({
              user: {
                id: response.id,
                username: response.username,
              },
              isAuthenticated: true,
              isLoading: false,
              isAuthChecking: false,
            });

            return true;
          } catch (_) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isAuthChecking: false,
            });

            return false;
          }
        }
      }

      set({ isLoading: false, isAuthChecking: false });
      return false;
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isAuthChecking: false,
      });

      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
