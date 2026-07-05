import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, ProfileCard, Activity, News, NewEmployee, Reaction, Hobby } from '@/types';
import { mockUsers, mockProfileCards, mockActivities, mockNews, mockNewEmployees, mockReactions, mockHobbies } from '@/services/mockData';
import { subDays } from 'date-fns';

interface AppState {
  // Data
  users: User[];
  profileCards: ProfileCard[];
  activities: Activity[];
  news: News[];
  newEmployees: NewEmployee[];
  reactions: Reaction[];
  hobbies: Hobby[];

  // User actions
  updateUser: (userId: string, updates: Partial<User>) => void;

  // Profile card actions
  updateProfileCard: (cardId: string, updates: Partial<ProfileCard>) => void;
  addHobbyToCard: (cardId: string, hobby: Hobby) => void;
  removeHobbyFromCard: (cardId: string, hobbyId: string) => void;
  updateProfilePhoto: (cardId: string, photoUrl: string) => void;

  // Reaction actions
  addReaction: (profileCardId: string, userId: string, tipo: Reaction['tipo']) => void;
  removeReaction: (profileCardId: string, userId: string) => void;
  getUserReaction: (profileCardId: string, userId: string) => Reaction | undefined;

  // Activity actions
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'inscritos'>) => void;
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  deleteActivity: (activityId: string) => void;
  restoreActivity: (activityId: string) => void;
  permanentlyDeleteActivity: (activityId: string) => void;
  participateInActivity: (activityId: string, userId: string) => void;
  cancelParticipation: (activityId: string, userId: string) => void;

  // News actions
  addNews: (newsItem: Omit<News, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNews: (newsId: string, updates: Partial<News>) => void;
  deleteNews: (newsId: string) => void;
  restoreNews: () => void;

  // New employee actions
  addNewEmployee: (employeeId: string, comentario?: string) => void;
  updateNewEmployeeComment: (employeeId: string, comentario: string) => void;
  removeNewEmployee: (employeeId: string) => void;

  // Getters
  getActiveUsers: () => User[];
  getVisibleProfileCards: () => ProfileCard[];
  getRecentNews: () => News[];
  getNewEmployeesThisWeek: () => NewEmployee[];
  getActiveActivities: () => Activity[];
  getDeletedActivities: () => Activity[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial data from mock
      users: mockUsers,
      profileCards: mockProfileCards,
      activities: mockActivities,
      news: mockNews,
      newEmployees: mockNewEmployees,
      reactions: mockReactions,
      hobbies: mockHobbies,

      // User actions
      updateUser: (userId, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user
          ),
        }));
      },

      // Profile card actions
      updateProfileCard: (cardId, updates) => {
        set((state) => ({
          profileCards: state.profileCards.map((card) =>
            card.id === cardId ? { ...card, ...updates, updatedAt: new Date().toISOString() } : card
          ),
        }));
      },

      addHobbyToCard: (cardId, hobby) => {
        set((state) => ({
          profileCards: state.profileCards.map((card) => {
            if (card.id === cardId && card.hobbies.length < 5) {
              return {
                ...card,
                hobbies: [...card.hobbies, hobby],
                updatedAt: new Date().toISOString(),
              };
            }
            return card;
          }),
        }));
      },

      removeHobbyFromCard: (cardId, hobbyId) => {
        set((state) => ({
          profileCards: state.profileCards.map((card) => {
            if (card.id === cardId && card.hobbies.length > 1) {
              return {
                ...card,
                hobbies: card.hobbies.filter((h) => h.id !== hobbyId),
                updatedAt: new Date().toISOString(),
              };
            }
            return card;
          }),
        }));
      },

      updateProfilePhoto: (cardId, photoUrl) => {
        set((state) => ({
          profileCards: state.profileCards.map((card) =>
            card.id === cardId ? { ...card, foto: photoUrl, updatedAt: new Date().toISOString() } : card
          ),
        }));
      },

      // Reaction actions
      addReaction: (profileCardId, userId, tipo) => {
        const state = get();
        const existingReaction = state.reactions.find(
          (r) => r.profileCardId === profileCardId && r.userId === userId
        );

        if (existingReaction) {
          // Update existing reaction
          set((state) => ({
            reactions: state.reactions.map((r) =>
              r.id === existingReaction.id ? { ...r, tipo } : r
            ),
          }));
        } else {
          // Add new reaction
          const user = state.users.find((u) => u.id === userId);
          if (!user) return;

          const newReaction: Reaction = {
            id: `reaction-${Date.now()}`,
            profileCardId,
            userId,
            user,
            tipo,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            reactions: [...state.reactions, newReaction],
          }));
        }
      },

      removeReaction: (profileCardId, userId) => {
        set((state) => ({
          reactions: state.reactions.filter(
            (r) => !(r.profileCardId === profileCardId && r.userId === userId)
          ),
        }));
      },

      getUserReaction: (profileCardId, userId) => {
        return get().reactions.find(
          (r) => r.profileCardId === profileCardId && r.userId === userId
        );
      },

      // Activity actions
      addActivity: (activity) => {
        const newActivity: Activity = {
          ...activity,
          id: `activity-${Date.now()}`,
          inscritos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          activities: [newActivity, ...state.activities],
        }));
      },

      updateActivity: (activityId, updates) => {
        set((state) => ({
          activities: state.activities.map((activity) =>
            activity.id === activityId
              ? { ...activity, ...updates, updatedAt: new Date().toISOString() }
              : activity
          ),
        }));
      },

      deleteActivity: (activityId) => {
        set((state) => ({
          activities: state.activities.map((activity) =>
            activity.id === activityId
              ? { ...activity, deletedAt: new Date().toISOString() }
              : activity
          ),
        }));
      },

      restoreActivity: (activityId) => {
        set((state) => ({
          activities: state.activities.map((activity) =>
            activity.id === activityId ? { ...activity, deletedAt: undefined } : activity
          ),
        }));
      },

      permanentlyDeleteActivity: (activityId) => {
        set((state) => ({
          activities: state.activities.filter((activity) => activity.id !== activityId),
        }));
      },

      participateInActivity: (activityId, userId) => {
        const state = get();
        const activity = state.activities.find((a) => a.id === activityId);
        const user = state.users.find((u) => u.id === userId);

        if (!activity || !user) return;
        if (activity.obligatorio) return;
        if (activity.cupos && activity.inscritos.length >= activity.cupos) return;
        if (activity.inscritos.some((i) => i.userId === userId)) return;

        const newInscription = {
          id: `inscripcion-${Date.now()}`,
          activityId,
          userId,
          user,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === activityId ? { ...a, inscritos: [...a.inscritos, newInscription] } : a
          ),
        }));
      },

      cancelParticipation: (activityId, userId) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === activityId
              ? { ...a, inscritos: a.inscritos.filter((i) => i.userId !== userId) }
              : a
          ),
        }));
      },

      // News actions
      addNews: (newsItem) => {
        const newItem: News = {
          ...newsItem,
          id: `news-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          news: [newItem, ...state.news],
        }));
      },

      updateNews: (newsId, updates) => {
        set((state) => ({
          news: state.news.map((item) =>
            item.id === newsId ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
          ),
        }));
      },

      deleteNews: (newsId) => {
        set((state) => ({
          news: state.news.filter((item) => item.id !== newsId),
        }));
      },

      restoreNews: () => {
        // Since we filter deleted news, this is a no-op for now
      },

      // New employee actions
      addNewEmployee: (employeeId, comentario) => {
        const state = get();
        const user = state.users.find((u) => u.id === employeeId);
        if (!user) return;

        const newEmployee: NewEmployee = {
          id: `newemp-${Date.now()}`,
          userId: employeeId,
          user,
          comentario,
          fechaPublicacion: new Date().toISOString(),
          estado: 'publicada',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          newEmployees: [newEmployee, ...state.newEmployees],
        }));
      },

      updateNewEmployeeComment: (employeeId, comentario) => {
        set((state) => ({
          newEmployees: state.newEmployees.map((e) =>
            e.userId === employeeId ? { ...e, comentario, updatedAt: new Date().toISOString() } : e
          ),
        }));
      },

      removeNewEmployee: (employeeId) => {
        set((state) => ({
          newEmployees: state.newEmployees.filter((e) => e.userId !== employeeId),
        }));
      },

      // Getters
      getActiveUsers: () => {
        return get().users.filter((u) => u.estado === 'activo');
      },

      getVisibleProfileCards: () => {
        const users = get().getActiveUsers();
        const activeUserIds = users.map((u) => u.id);
        return get().profileCards.filter((card) => activeUserIds.includes(card.userId));
      },

      getRecentNews: () => {
        return get().news.filter(
          (n) => n.estado === 'publicada' && !n.deletedAt
        );
      },

      getNewEmployeesThisWeek: () => {
        const weekAgo = subDays(new Date(), 7);
        return get().newEmployees.filter(
          (e) => {
            const publishDate = new Date(e.fechaPublicacion);
            return e.estado === 'publicada' && publishDate >= weekAgo;
          }
        );
      },

      getActiveActivities: () => {
        const now = new Date();
        // Set to start of today (00:00)
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return get().activities.filter(
          (a) => !a.deletedAt && a.estado === 'publicada' && new Date(a.fecha) >= todayStart
        );
      },

      getDeletedActivities: () => {
        const weekAgo = subDays(new Date(), 7);
        return get().activities.filter(
          (a) => a.deletedAt && new Date(a.deletedAt) >= weekAgo
        );
      },
    }),
    {
      name: 'conecta360-data',
    }
  )
);
