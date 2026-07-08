import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
//import { NewsCard } from '@/components/features/NewsCard';
import { KatariBot } from '@/components/features/KatariBot';
import { PollBubble } from '@/components/features/PollBubble';
import { NewEmployeeCard } from '@/components/features/NewEmployeeCard';
import { ProfileCard } from '@/components/features/ProfileCard';
import { ActivityCard } from '@/components/features/ActivityCard';
import { EditProfileDialog } from '@/components/features/EditProfileDialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Gift, 
  Bell, 
  Users, 
  Calendar, 
  Newspaper, 
  UserPlus,
  Play,
  MessageCircle,
  Heart,
  ThumbsUp,
  Sparkles,
  X,
  Smile
} from 'lucide-react';
import { ProfileCard as ProfileCardType } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

// Imágenes por defecto para novedades
const defaultImages: Record<string, string> = {
  cumpleanos: 'https://images.unsplash.com/photo-1558636508-e0db3814d1a8?w=600&h=400&fit=crop',
  nacimiento: 'https://images.unsplash.com/photo-1515488042675-83e9c6bebbde?w=600&h=400&fit=crop',
  logro: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=400&fit=crop',
  noticia: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop',
};

// Opciones de reacción
const REACTION_OPTIONS = [
  { tipo: 'like', emoji: '👍', label: 'Me gusta' },
  { tipo: 'felicidades', emoji: '🎉', label: 'Felicidades' },
  { tipo: 'fuego', emoji: '🔥', label: 'Fuego' },
];

export function Dashboard() {
  const { user } = useAuthStore();
  const appStore = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingCard, setEditingCard] = useState<ProfileCardType | null>(null);
  
  const [showMessageInput, setShowMessageInput] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  // Get data from store
  const news = appStore.getRecentNews();
  const newEmployees = appStore.getNewEmployeesThisWeek();
  const profileCards = appStore.getVisibleProfileCards();
  const activities = appStore.getActiveActivities();
  const reactions = appStore.reactions;

  // Nuevos métodos del store
  const newsReactions = appStore.newsReactions || {};
  const birthdayMessages = appStore.birthdayMessages || {};

  // Separate cumpleaños and other news
  const cumpleanosNews = news.filter((n) => n.tipo === 'cumpleanos');
  const otherNews = news.filter((n) => n.tipo !== 'cumpleanos');

  // Limit for display
  const displayCumpleanos = cumpleanosNews.slice(0, 4);
  const displayOthers = otherNews.slice(0, 4);

  // Filter profile cards based on search
  const filteredProfileCards = profileCards.filter((card) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesName = `${card.user.nombre} ${card.user.apellido}`.toLowerCase().includes(query);
    const matchesCareer = card.user.carrera.toLowerCase().includes(query);
    const matchesHobby = card.hobbies.some((h) => h.nombre.toLowerCase().includes(query));
    return matchesName || matchesCareer || matchesHobby;
  });

  // Carousel state
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showRightFade, setShowRightFade] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  // Carrusel de novedades (Sección 0)
  const newsCarouselRef = useRef<HTMLDivElement>(null);
  const [showNewsRightFade, setShowNewsRightFade] = useState(false);

  // Carrusel de novedades (Sección 1)
  const newsSectionCarouselRef = useRef<HTMLDivElement>(null);
  const [showNewsSectionRightFade, setShowNewsSectionRightFade] = useState(false);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setShowRightFade(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const checkNewsScroll = () => {
    if (newsCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = newsCarouselRef.current;
      setShowNewsRightFade(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const checkNewsSectionScroll = () => {
    if (newsSectionCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = newsSectionCarouselRef.current;
      setShowNewsSectionRightFade(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    checkNewsScroll();
    checkNewsSectionScroll();
    window.addEventListener('resize', () => {
      checkScroll();
      checkNewsScroll();
      checkNewsSectionScroll();
    });
    return () => window.removeEventListener('resize', () => {
      checkScroll();
      checkNewsScroll();
      checkNewsSectionScroll();
    });
  }, [filteredProfileCards.length, news.length]);

  // Auto-scroll del carrusel de novedades (Sección 0)
  useEffect(() => {
    if (!newsCarouselRef.current || news.length === 0) return;

    const container = newsCarouselRef.current;
    let interval: NodeJS.Timeout | null = null;
    let isPaused = false;
    let resumeTimeout: NodeJS.Timeout | null = null;

    const scrollStep = () => {
      if (isPaused || !container) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 5) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 2, behavior: 'smooth' });
      }
    };

    const startAutoScroll = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      isPaused = false;
      interval = setInterval(scrollStep, 80);
    };

    const pauseAutoScroll = () => {
      isPaused = true;
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleMouseEnter = () => {
      pauseAutoScroll();
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
    };

    const handleMouseLeave = () => {
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
      resumeTimeout = setTimeout(() => {
        startAutoScroll();
        resumeTimeout = null;
      }, 2000);
    };

    const timeoutId = setTimeout(startAutoScroll, 500);

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
      clearTimeout(timeoutId);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [news.length]);

  // Auto-scroll del carrusel de novedades (Sección 1)
  useEffect(() => {
    if (!newsSectionCarouselRef.current || news.length === 0) return;

    const container = newsSectionCarouselRef.current;
    let interval: NodeJS.Timeout | null = null;
    let isPaused = false;
    let resumeTimeout: NodeJS.Timeout | null = null;

    const scrollStep = () => {
      if (isPaused || !container) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 5) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 2, behavior: 'smooth' });
      }
    };

    const startAutoScroll = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      isPaused = false;
      interval = setInterval(scrollStep, 80);
    };

    const pauseAutoScroll = () => {
      isPaused = true;
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleMouseEnter = () => {
      pauseAutoScroll();
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
    };

    const handleMouseLeave = () => {
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
      resumeTimeout = setTimeout(() => {
        startAutoScroll();
        resumeTimeout = null;
      }, 2000);
    };

    const timeoutId = setTimeout(startAutoScroll, 500);

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
      clearTimeout(timeoutId);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [news.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftPos.current = carouselRef.current.scrollLeft;
    carouselRef.current.style.cursor = 'grabbing';
    carouselRef.current.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    carouselRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!carouselRef.current) return;
    isDragging.current = false;
    carouselRef.current.style.cursor = 'grab';
    carouselRef.current.style.userSelect = '';
  };

  // Filter and sort activities
  const filteredActivities = activities
    .filter((a) => selectedCategory === 'all' || a.categoria === selectedCategory)
    .sort((a, b) => {
      const now = new Date();
      const dateA = new Date(a.fecha);
      const dateB = new Date(b.fecha);
      const daysA = Math.ceil((dateA.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysB = Math.ceil((dateB.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysA >= 0 && daysB >= 0) return daysA - daysB;
      if (daysA >= 0) return -1;
      if (daysB >= 0) return 1;
      return Math.abs(daysB) - Math.abs(daysA);
    });

  const categories = [...new Set(activities.map((a) => a.categoria))];

  const getUserReaction = (profileCardId: string) => {
    const reaction = reactions.find(
      (r) => r.profileCardId === profileCardId && r.userId === user?.id
    );
    return reaction;
  };

  const getCardReactions = (profileCardId: string) => {
    return reactions.filter((r) => r.profileCardId === profileCardId);
  };

  const isParticipating = (activityId: string) => {
    return activities
      .find((a) => a.id === activityId)
      ?.inscritos.some((i) => i.userId === user?.id) || false;
  };

  // ===== FUNCIONES PARA REACCIONES Y MENSAJES EN NOVEDADES =====
  
  const handleNewsReaction = (newsId: string, tipo: string) => {
    if (!user?.id) return;
    
    const currentReactions = newsReactions[newsId] || [];
    const existingIndex = currentReactions.findIndex(r => r.userId === user.id);
    
    let newReactions = [...currentReactions];
    
    if (existingIndex !== -1) {
      if (currentReactions[existingIndex].type === tipo) {
        newReactions.splice(existingIndex, 1);
      } else {
        newReactions[existingIndex] = { userId: user.id, type: tipo };
      }
    } else {
      newReactions.push({ userId: user.id, type: tipo });
    }
    
    appStore.updateNewsReactions(newsId, newReactions);
    setShowReactionPicker(null);
  };

  const handleBirthdayMessage = (newsId: string) => {
    if (!user?.id || !messageText.trim()) return;
    
    const currentMessages = birthdayMessages[newsId] || [];
    const newMessages = [
      ...currentMessages,
      { 
        userId: user.id, 
        message: messageText.trim(), 
        date: new Date().toISOString(),
        userName: user.nombre
      }
    ];
    
    appStore.updateBirthdayMessages(newsId, newMessages);
    setMessageText('');
    setShowMessageInput(null);
  };

  const getNewsReactions = (newsId: string) => {
    return newsReactions[newsId] || [];
  };

  const getBirthdayMessages = (newsId: string) => {
    return birthdayMessages[newsId] || [];
  };

  const getUserNewsReaction = (newsId: string) => {
    const reactions = getNewsReactions(newsId);
    const found = reactions.find(r => r.userId === user?.id);
    return found?.type || null;
  };

  // Renderizar reacciones
  const renderReactions = (newsId: string) => {
    const reactions = getNewsReactions(newsId);
    const userReaction = getUserNewsReaction(newsId);
    
    const counts = reactions.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {REACTION_OPTIONS.map((option) => {
          const count = counts[option.tipo] || 0;
          if (count === 0) return null;
          const isActive = userReaction === option.tipo;
          return (
            <span
              key={option.tipo}
              className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border ${
                isActive 
                  ? 'bg-[#FEF0EA] border-[#E85A1A]/30 text-[#C03510]' 
                  : 'bg-[#F4F5FA] border-[#E4E6F0] text-[#5A5F80]'
              }`}
            >
              <span>{option.emoji}</span>
              <span className="font-bold">{count}</span>
            </span>
          );
        })}
      </div>
    );
  };

  // Renderizar picker de reacciones
  const renderReactionPicker = (newsId: string) => {
    const userReaction = getUserNewsReaction(newsId);
    
    return (
      <div className="absolute bottom-full left-0 mb-2 z-50 bg-white border border-[#E4E6F0] rounded-2xl shadow-xl p-1.5 flex gap-0.5">
        {REACTION_OPTIONS.map((option) => {
          const isActive = userReaction === option.tipo;
          return (
            <button
              key={option.tipo}
              onClick={() => handleNewsReaction(newsId, option.tipo)}
              className={`flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl transition-all hover:bg-[#F4F5FA] hover:scale-110 min-w-[44px] ${
                isActive ? 'bg-[#FEF0EA]' : ''
              }`}
            >
              <span className="text-xl">{option.emoji}</span>
              <span className="text-[8px] font-bold text-[#B0B4CC] text-center leading-tight">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // Mapeo de iconos y etiquetas para novedades del carrusel
  const iconMap: Record<string, string> = {
    cumpleanos: '🎂',
    nacimiento: '👶',
    logro: '🏆',
    noticia: '📢',
  };
  const labelMap: Record<string, string> = {
    cumpleanos: 'Cumpleaños',
    nacimiento: 'Nacimiento',
    logro: 'Logro',
    noticia: 'Noticia',
  };

  return (
    <div className="min-h-screen relative z-10 overflow-x-hidden bg-white">
      <div className="container max-w-7xl mx-auto py-6 space-y-8 px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E2245]">
            Bienvenido, {user?.nombre}
          </h1>
          <p className="text-[#9499BB] font-semibold">
            Descubre novedades y conecta con tu equipo
          </p>
        </div>

        {/* ===== SECCIÓN 0: CARRUSEL DE NOVEDADES (TIPO TICKER) - COMENTADO ===== */}
        {/*
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-[2px] w-7 bg-[#E85A1A] rounded-full" />
            <span className="font-syne text-[10px] font-bold tracking-[2.5px] uppercase text-[#E85A1A]">
              Novedades
            </span>
          </div>

          <div className="relative">
            <div
              ref={newsCarouselRef}
              className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth
                [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling]:touch"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={checkNewsScroll}
            >
              {news.map((item) => (
                <div 
                  key={item.id} 
                  className="flex-shrink-0 flex items-center gap-3 bg-[#2D3163] rounded-xl px-4 py-3 border border-[#3D4170] min-w-[280px] max-w-[320px] shadow-lg hover:shadow-xl transition-all"
                >
                  <span className="text-3xl">{iconMap[item.tipo] || '📢'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#E85A1A] uppercase tracking-wider">
                        {labelMap[item.tipo] || 'Noticia'}
                      </span>
                      <span className="text-[10px] text-[#9499BB]">
                        {format(new Date(item.fecha), 'd MMM', { locale: es })}
                      </span>
                    </div>
                    <p className="text-sm text-white font-medium line-clamp-1">
                      {item.titulo}
                    </p>
                    <p className="text-xs text-[#9499BB] line-clamp-1">
                      {item.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-[#E4E6F0] text-[#1E2245] hover:bg-[#E85A1A] hover:text-white hover:border-[#E85A1A] transition-all flex items-center justify-center shadow-lg -ml-3"
              onClick={() => {
                if (newsCarouselRef.current) {
                  newsCarouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                }
              }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-[#E4E6F0] text-[#1E2245] hover:bg-[#E85A1A] hover:text-white hover:border-[#E85A1A] transition-all flex items-center justify-center shadow-lg -mr-3"
              onClick={() => {
                if (newsCarouselRef.current) {
                  newsCarouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                }
              }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {showNewsRightFade && (
              <div className="absolute right-0 top-0 bottom-2 w-12 pointer-events-none
                bg-gradient-to-l from-white to-transparent" />
            )}
          </div>
        </section>
        */}

        {/* ===== SECCIÓN 1: NOVEDADES DEL EQUIPO (Video + Carrusel de Novedades) ===== */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-[2px] w-7 bg-[#E85A1A] rounded-full" />
            <span className="font-syne text-[10px] font-bold tracking-[2.5px] uppercase text-[#E85A1A]">
              Novedades del equipo
            </span>
          </div>

          {/* Grid: Video a la izquierda, Carrusel a la derecha */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Columna izquierda: Video */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-[#E4E6F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                <div className="relative flex-1 bg-[#1E2245] flex items-center justify-center group cursor-pointer overflow-hidden min-h-[300px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E85A1A]/20 to-transparent" />
                  <div className="relative z-10 text-center p-6">
                    <div className="w-24 h-24 rounded-full bg-[#E85A1A] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#E85A1A]/30">
                      <Play className="h-12 w-12 text-white fill-white ml-1" />
                    </div>
                    <p className="text-white font-semibold text-lg">Ver video de bienvenida</p>
                    <p className="text-[#9499BB] text-sm mt-1">Conoce las novedades de la plataforma</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna derecha: Carrusel de novedades */}
            <div className="lg:col-span-3 space-y-4">
              {/* Títulos de las secciones de novedades */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#FEF0EA]">
                    
                  </div>
                  
                  
                    
                  
                </div>
                <div className="flex-1 h-px bg-[#E4E6F0]" />
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#FEF0EA]">
                    
                  </div>
                  
                  
                </div>
              </div>

              {/* Carrusel de novedades */}
              <div className="relative">
                <div
                  ref={newsSectionCarouselRef}
                  className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth
                    [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling]:touch"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  onScroll={checkNewsSectionScroll}
                >
                  {news.map((item) => {
                    const isBirthday = item.tipo === 'cumpleanos';
                    const iconMap2: Record<string, string> = {
                      cumpleanos: '🎂',
                      nacimiento: '👶',
                      logro: '🏆',
                      noticia: '📢',
                    };
                    const labelMap2: Record<string, string> = {
                      cumpleanos: 'Cumpleaños',
                      nacimiento: 'Nacimiento',
                      logro: 'Logro',
                      noticia: 'Noticia',
                    };
                    const imageMap: Record<string, string> = {
                      cumpleanos: defaultImages.cumpleanos,
                      nacimiento: defaultImages.nacimiento,
                      logro: defaultImages.logro,
                      noticia: defaultImages.noticia,
                    };
                    const imageUrl = item.imagen || imageMap[item.tipo] || defaultImages.noticia;
                    const messages = getBirthdayMessages(item.id);

                    return (
                      <div 
                        key={item.id} 
                        className="flex-shrink-0 w-[280px] bg-white border border-[#E4E6F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
                      >
                        <div className="relative h-28 flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt={item.titulo}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = defaultImages.noticia;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-2 left-3 right-3">
                            <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/10">
                              {iconMap2[item.tipo] || '📢'} {labelMap2[item.tipo] || 'Noticia'}
                            </span>
                            <span className="float-right text-[9px] text-white/80">
                              📅 {format(new Date(item.fecha), 'd MMM', { locale: es })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-3 flex-1 flex flex-col">
                          <h4 className="font-semibold text-[#1E2245] text-sm line-clamp-1">
                            {item.titulo}
                          </h4>
                          <p className="text-xs text-[#9499BB] line-clamp-2 flex-1 mt-0.5">
                            {item.descripcion}
                          </p>

                          <div className="mt-1.5">
                            {renderReactions(item.id)}
                          </div>

                          {isBirthday && messages.length > 0 && (
                            <div className="mt-1.5 space-y-0.5 max-h-12 overflow-y-auto">
                              {messages.slice(-1).map((msg, idx) => (
                                <div key={idx} className="text-[10px] text-[#5A5F80] bg-[#F8F9FC] px-2 py-0.5 rounded-lg border border-[#E4E6F0] truncate">
                                  💬 {msg.userName}: {msg.message}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-2 relative">
                            <button
                              onClick={() => setShowReactionPicker(showReactionPicker === item.id ? null : item.id)}
                              className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                                getUserNewsReaction(item.id)
                                  ? 'bg-[#FEF0EA] border-[#E85A1A]/30 text-[#C03510]'
                                  : 'bg-[#F4F5FA] text-[#5A5F80] hover:bg-[#FEF0EA] border border-[#E4E6F0]'
                              }`}
                            >
                              <Smile className="h-3 w-3" />
                              <span>Reaccionar</span>
                            </button>
                            
                            {isBirthday && (
                              <button
                                onClick={() => setShowMessageInput(showMessageInput === item.id ? null : item.id)}
                                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#F4F5FA] text-[#5A5F80] hover:bg-[#FEF0EA] transition-colors border border-[#E4E6F0]"
                              >
                                <MessageCircle className="h-3 w-3" />
                                <span>Mensaje</span>
                              </button>
                            )}

                            <AnimatePresence>
                              {showReactionPicker === item.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="absolute bottom-full left-0 mb-2 z-50"
                                >
                                  {renderReactionPicker(item.id)}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <AnimatePresence>
                            {isBirthday && showMessageInput === item.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex gap-1.5 mt-1.5"
                              >
                                <input
                                  placeholder="Escribe un mensaje..."
                                  className="flex-1 px-2 py-1 text-xs bg-[#F8F5F0] text-[#1E2245] rounded-lg border border-[#E4E6F0] focus:border-[#E85A1A] focus:ring-2 focus:ring-[#E85A1A]/20 outline-none"
                                  value={messageText}
                                  onChange={(e) => setMessageText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleBirthdayMessage(item.id);
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleBirthdayMessage(item.id)}
                                  className="px-2 py-1 bg-[#E85A1A] text-white rounded-lg text-[10px] font-bold hover:bg-[#C03510] transition-colors"
                                >
                                  Enviar
                                </button>
                                <button
                                  onClick={() => setShowMessageInput(null)}
                                  className="px-1.5 py-1 bg-[#F4F5FA] text-[#9499BB] rounded-lg text-[10px] hover:bg-[#E4E6F0] transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Flechas de navegación del carrusel de novedades */}
                <button 
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-[#E4E6F0] text-[#1E2245] hover:bg-[#E85A1A] hover:text-white hover:border-[#E85A1A] transition-all flex items-center justify-center shadow-lg -ml-3"
                  onClick={() => {
                    if (newsSectionCarouselRef.current) {
                      newsSectionCarouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                    }
                  }}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-[#E4E6F0] text-[#1E2245] hover:bg-[#E85A1A] hover:text-white hover:border-[#E85A1A] transition-all flex items-center justify-center shadow-lg -mr-3"
                  onClick={() => {
                    if (newsSectionCarouselRef.current) {
                      newsSectionCarouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                    }
                  }}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {showNewsSectionRightFade && (
                  <div className="absolute right-0 top-0 bottom-2 w-12 pointer-events-none
                    bg-gradient-to-l from-white to-transparent" />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECCIÓN 2: NUEVOS EN EL EQUIPO ===== */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-[2px] w-7 bg-[#E85A1A] rounded-full" />
            <span className="font-syne text-[10px] font-bold tracking-[2.5px] uppercase text-[#E85A1A]">
              Nuevos en el equipo
            </span>
            <Badge className="bg-[#E85A1A] text-white ml-2">
              {newEmployees.length}
            </Badge>
          </div>

          {newEmployees.length === 0 ? (
            <div className="bg-white border border-[#E4E6F0] rounded-2xl p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-[#C8CADB]" />
              <p className="mt-4 text-sm text-[#9499BB] font-semibold">
                No hay nuevos integrantes esta semana
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
              {newEmployees.map((employee) => (
                <NewEmployeeCard key={employee.id} employee={employee} />
              ))}
            </div>
          )}
        </section>

        {/* ===== SECCIÓN 3: COMUNIDAD DE HOBBIES ===== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-[2px] w-7 bg-[#E85A1A] rounded-full" />
              <span className="font-syne text-[10px] font-bold tracking-[2.5px] uppercase text-[#E85A1A]">
                Comunidad de hobbies
              </span>
              <span className="text-[11px] font-bold text-[#9499BB] ml-2">
                {filteredProfileCards.length} colaboradores
              </span>
            </div>

            <div className="relative flex-1 min-w-0 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C0C3D8]" />
              <Input
                placeholder="Buscar por nombre, carrera, hobby..."
                className="w-full pl-9 border-[#E4E6F0] bg-white text-[#1E2245] placeholder:text-[#C0C3D8] focus:border-[#E85A1A] focus:ring-[#E85A1A] rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredProfileCards.length === 0 ? (
            <div className="bg-white border border-[#E4E6F0] rounded-2xl p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-[#C8CADB]" />
              <p className="mt-4 text-sm text-[#9499BB] font-semibold">
                No se encontraron colaboradores
              </p>
            </div>
          ) : (
            <div className="relative">
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 pr-8 cursor-grab
                  [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling]:touch"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onScroll={checkScroll}
              >
                {filteredProfileCards.map((card) => (
                  <ProfileCard
                    key={card.id}
                    card={card}
                    userReaction={getUserReaction(card.id)}
                    reactions={getCardReactions(card.id)}
                    onReact={(tipo) => {
                      appStore.addReaction(card.id, user?.id || '', tipo);
                    }}
                    onEdit={() => {
                      if (user?.id === card.userId) {
                        setEditingCard(card);
                      }
                    }}
                  />
                ))}
              </div>

              {showRightFade && (
                <div className="absolute right-0 top-0 bottom-2 w-12 pointer-events-none
                  bg-gradient-to-l from-white to-transparent" />
              )}
            </div>
          )}
        </section>

        {/* ===== SECCIÓN 4: ACTIVIDADES Y EVENTOS ===== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-[2px] w-7 bg-[#E85A1A] rounded-full" />
              <span className="font-syne text-[10px] font-bold tracking-[2.5px] uppercase text-[#E85A1A]">
                Actividades y eventos
              </span>
              <Badge className="bg-[#E85A1A] text-white ml-2">
                {filteredActivities.length}
              </Badge>
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-40 border-[#E4E6F0] bg-white text-[#1E2245] rounded-xl">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="bg-white border border-[#E4E6F0] rounded-2xl p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-[#C8CADB]" />
              <p className="mt-4 text-sm text-[#9499BB] font-semibold">
                No hay actividades programadas
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  isParticipating={isParticipating(activity.id)}
                  showActions
                  onParticipate={() => {
                    appStore.participateInActivity(activity.id, user?.id || '');
                  }}
                  onCancel={() => {
                    appStore.cancelParticipation(activity.id, user?.id || '');
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* ===== SECCIÓN 5: ASISTENTE INTELIGENTE (FUTURO) ===== */}
        <section className="space-y-4 opacity-50 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="h-[2px] w-7 bg-[#E85A1A] rounded-full" />
            <span className="font-syne text-[10px] font-bold tracking-[2.5px] uppercase text-[#E85A1A]">
              Asistente Inteligente
            </span>
            <Badge className="bg-[#9499BB] text-white text-[10px]">
              Próximamente
            </Badge>
          </div>
          <div className="bg-white border border-[#E4E6F0] rounded-2xl p-6 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-[#9499BB]" />
            <p className="text-sm text-[#9499BB] font-semibold">
              Pregunta lo que necesites y la IA te ayudará
            </p>
            <p className="text-xs text-[#C0C3D8] mt-1">
              Ej: "¿Dónde puedo ver mi asignación?", "¿Cómo me inscribo a una actividad?"
            </p>
          </div>
        </section>
      </div>

      <KatariBot />
      <PollBubble />

      {/* Edit Profile Dialog */}
      {editingCard && (
        <EditProfileDialog
          open={!!editingCard}
          onOpenChange={(open) => {
            if (!open) setEditingCard(null);
          }}
          profileCard={editingCard}
        />
      )}
    </div>
  );
}