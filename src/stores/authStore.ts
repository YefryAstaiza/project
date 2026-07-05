import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: 'viewHV' | 'manageActivities' | 'editOwnCard', targetUserId?: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      hasPermission: (permission: 'viewHV' | 'manageActivities' | 'editOwnCard', targetUserId?: string) => {
        const { user } = get();
        if (!user) return false;

        const privilegedRoles: UserRole[] = ['admin', 'ceo', 'director_proyecto', 'asistente_gerencia'];

        switch (permission) {
          case 'viewHV':
            return privilegedRoles.includes(user.rol) || user.id === targetUserId;
          case 'manageActivities':
            return user.rol === 'admin';
          case 'editOwnCard':
            return user.id === targetUserId;
          default:
            return false;
        }
      },
    }),
    {
      name: 'conecta360-auth',
    }
  )
);
