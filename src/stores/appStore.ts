import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  ProfileCard, 
  Activity, 
  News, 
  NewEmployee, 
  Reaction, 
  Hobby, 
  NewEmployeeReaction,
  CommunityPost,
  CommunityComment
} from '@/types';
import { mockUsers, mockProfileCards, mockActivities, mockNews, mockNewEmployees, mockReactions, mockHobbies } from '@/services/mockData';
import { subDays } from 'date-fns';

// Tipos para las nuevas funcionalidades
interface NewsReaction {
  userId: string;
  type: 'like' | 'felicidades' | 'fuego';
}

interface BirthdayMessage {
  userId: string;
  message: string;
  date: string;
  userName: string;
}

interface AppState {
  // Data
  users: User[];
  profileCards: ProfileCard[];
  activities: Activity[];
  news: News[];
  newEmployees: NewEmployee[];
  reactions: Reaction[];
  hobbies: Hobby[];

  // Nuevos estados para reacciones y mensajes en novedades
  newsReactions: Record<string, NewsReaction[]>;
  birthdayMessages: Record<string, BirthdayMessage[]>;

  // Reacciones para nuevos empleados
  newEmployeeReactions: NewEmployeeReaction[];

  // Publicaciones de la comunidad
  communityPosts: CommunityPost[];

  // User actions
  updateUser: (userId: string, updates: Partial<User>) => void;

  // Profile card actions
  updateProfileCard: (cardId: string, updates: Partial<ProfileCard>) => void;
  addHobbyToCard: (cardId: string, hobby: Hobby) => void;
  removeHobbyFromCard: (cardId: string, hobbyId: string) => void;
  updateProfilePhoto: (cardId: string, photoUrl: string) => void;

  // Reaction actions (profile cards)
  addReaction: (profileCardId: string, userId: string, tipo: Reaction['tipo']) => void;
  removeReaction: (profileCardId: string, userId: string) => void;
  getUserReaction: (profileCardId: string, userId: string) => Reaction | undefined;

  // Nuevas acciones para reacciones en novedades
  updateNewsReactions: (newsId: string, reactions: NewsReaction[]) => void;
  getNewsReactions: (newsId: string) => NewsReaction[];

  // Nuevas acciones para mensajes de cumpleaños
  updateBirthdayMessages: (newsId: string, messages: BirthdayMessage[]) => void;
  getBirthdayMessages: (newsId: string) => BirthdayMessage[];

  // Acciones para reacciones en nuevos empleados
  addNewEmployeeReaction: (newEmployeeId: string, userId: string, tipo: '👋' | '🎉' | '🔥' | '🤝') => void;
  removeNewEmployeeReaction: (newEmployeeId: string, userId: string) => void;
  getNewEmployeeReactions: (newEmployeeId: string) => NewEmployeeReaction[];

  // Acciones para publicaciones de la comunidad
  addCommunityPost: (userId: string, content: string, category?: 'venta' | 'evento' | 'anuncio' | 'pregunta' | 'otro') => void;
  likeCommunityPost: (postId: string, userId: string) => void;
  addCommunityComment: (postId: string, userId: string, content: string) => void;
  deleteCommunityPost: (postId: string, userId: string) => void;
  getCommunityPosts: () => CommunityPost[];

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

      // Inicializar nuevos estados vacíos
      newsReactions: {},
      birthdayMessages: {},
      newEmployeeReactions: [],
      communityPosts: [],

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

      // Reaction actions (profile cards)
      addReaction: (profileCardId, userId, tipo) => {
        const state = get();
        const existingReaction = state.reactions.find(
          (r) => r.profileCardId === profileCardId && r.userId === userId
        );

        if (existingReaction) {
          set((state) => ({
            reactions: state.reactions.map((r) =>
              r.id === existingReaction.id ? { ...r, tipo } : r
            ),
          }));
        } else {
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

      // ===== REACCIONES EN NOVEDADES =====
      updateNewsReactions: (newsId, reactions) => {
        set((state) => ({
          newsReactions: {
            ...state.newsReactions,
            [newsId]: reactions,
          },
        }));
      },

      getNewsReactions: (newsId) => {
        return get().newsReactions[newsId] || [];
      },

      // ===== MENSAJES DE CUMPLEAÑOS =====
      updateBirthdayMessages: (newsId, messages) => {
        set((state) => ({
          birthdayMessages: {
            ...state.birthdayMessages,
            [newsId]: messages,
          },
        }));
      },

      getBirthdayMessages: (newsId) => {
        return get().birthdayMessages[newsId] || [];
      },

      // ===== REACCIONES PARA NUEVOS EMPLEADOS =====
      addNewEmployeeReaction: (newEmployeeId, userId, tipo) => {
        const state = get();
        const user = state.users.find((u) => u.id === userId);
        if (!user) return;

        const existingIndex = state.newEmployeeReactions.findIndex(
          (r) => r.newEmployeeId === newEmployeeId && r.userId === userId
        );

        if (existingIndex !== -1) {
          set((state) => ({
            newEmployeeReactions: state.newEmployeeReactions.map((r, index) =>
              index === existingIndex ? { ...r, tipo } : r
            ),
          }));
        } else {
          const newReaction: NewEmployeeReaction = {
            id: `ner-${Date.now()}`,
            newEmployeeId,
            userId,
            user,
            tipo,
            createdAt: new Date().toISOString(),
          };
          set((state) => ({
            newEmployeeReactions: [...state.newEmployeeReactions, newReaction],
          }));
        }
      },

      removeNewEmployeeReaction: (newEmployeeId, userId) => {
        set((state) => ({
          newEmployeeReactions: state.newEmployeeReactions.filter(
            (r) => !(r.newEmployeeId === newEmployeeId && r.userId === userId)
          ),
        }));
      },

      getNewEmployeeReactions: (newEmployeeId) => {
        return get().newEmployeeReactions.filter(
          (r) => r.newEmployeeId === newEmployeeId
        );
      },

      // ===== PUBLICACIONES DE LA COMUNIDAD =====
      addCommunityPost: (userId, content, category) => {
        const state = get();
        const user = state.users.find((u) => u.id === userId);
        if (!user || !content.trim()) return;

        const newPost: CommunityPost = {
          id: `post-${Date.now()}`,
          userId,
          user,
          content: content.trim(),
          category: category || 'otro',
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          communityPosts: [newPost, ...state.communityPosts],
        }));
      },

      likeCommunityPost: (postId, userId) => {
        set((state) => ({
          communityPosts: state.communityPosts.map((post) => {
            if (post.id !== postId) return post;
            const likes = post.likes.includes(userId)
              ? post.likes.filter((id) => id !== userId)
              : [...post.likes, userId];
            return { ...post, likes };
          }),
        }));
      },

      addCommunityComment: (postId, userId, content) => {
        const state = get();
        const user = state.users.find((u) => u.id === userId);
        if (!user || !content.trim()) return;

        const newComment: CommunityComment = {
          id: `comment-${Date.now()}`,
          userId,
          user,
          content: content.trim(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          communityPosts: state.communityPosts.map((post) => {
            if (post.id !== postId) return post;
            return { ...post, comments: [...post.comments, newComment] };
          }),
        }));
      },

      deleteCommunityPost: (postId, userId) => {
        set((state) => ({
          communityPosts: state.communityPosts.filter(
            (post) => !(post.id === postId && post.userId === userId)
          ),
        }));
      },

      getCommunityPosts: () => {
        return get().communityPosts;
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
          hobbies: [],
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
      version: 1,
    }
  )
);