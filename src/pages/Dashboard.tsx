import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { NewsCard } from '@/components/features/NewsCard';
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
import { Search, Gift, Bell, Users, Calendar, Newspaper, UserPlus } from 'lucide-react';
import { ProfileCard as ProfileCardType } from '@/types';

export function Dashboard() {
  const { user } = useAuthStore();
  const appStore = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingCard, setEditingCard] = useState<ProfileCardType | null>(null);

  // Get data from store
  const news = appStore.getRecentNews();
  const newEmployees = appStore.getNewEmployeesThisWeek();
  const profileCards = appStore.getVisibleProfileCards();
  const activities = appStore.getActiveActivities();
  const reactions = appStore.reactions;

  // Separate cumpleaños and other news - cumpleaños left, others right
  const cumpleanosNews = news.filter((n) => n.tipo === 'cumpleanos');
  const otherNews = news.filter((n) => n.tipo !== 'cumpleanos');

  // Limit for display (4 of each)
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

  // Carousel state for Conecta360
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showRightFade, setShowRightFade] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  // Check if carousel can scroll right
  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setShowRightFade(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [filteredProfileCards.length]);

  // Drag-to-scroll handlers
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

  // Filter and sort activities - most recent first
  const filteredActivities = activities
    .filter((a) => selectedCategory === 'all' || a.categoria === selectedCategory)
    .sort((a, b) => {
      const now = new Date();
      const dateA = new Date(a.fecha);
      const dateB = new Date(b.fecha);

      // Calculate days from today
      const daysA = Math.ceil((dateA.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysB = Math.ceil((dateB.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Prioritize future dates, then recent, then past
      if (daysA >= 0 && daysB >= 0) return daysA - daysB; // Both future: closer first
      if (daysA >= 0) return -1; // A is future, B is past: A first
      if (daysB >= 0) return 1; // B is future, A is past: B first
      return Math.abs(daysB) - Math.abs(daysA); // Both past: more recent first
    });

  // Get unique activity categories
  const categories = [...new Set(activities.map((a) => a.categoria))];

  // Get current user's reactions on cards
  const getUserReaction = (profileCardId: string) => {
    const reaction = reactions.find(
      (r) => r.profileCardId === profileCardId && r.userId === user?.id
    );
    return reaction;
  };

  // Get all reactions for a card
  const getCardReactions = (profileCardId: string) => {
    return reactions.filter((r) => r.profileCardId === profileCardId);
  };

  // Handle participation
  const isParticipating = (activityId: string) => {
    return activities
      .find((a) => a.id === activityId)
      ?.inscritos.some((i) => i.userId === user?.id) || false;
  };

  return (
    <div className="min-h-screen relative z-10 overflow-x-hidden">
      <div className="container max-w-7xl mx-auto py-6 space-y-8 px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Bienvenido, {user?.nombre}
          </h1>
          <p className="text-white/70">
            Descubre novedades y conecta con tu equipo
          </p>
        </div>

        {/* Section 1: Novedades del equipo */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg glass-icon-btn">
              <Newspaper className="h-5 w-5 text-orange" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Novedades del equipo
            </h2>
          </div>

          {/* Layout: Cumpleaños left, others right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cumpleaños - Left side */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg glass-icon-btn">
                  <Gift className="h-4 w-4 text-pink-400" />
                </div>
                <h3 className="text-lg font-medium text-white">Cumpleaños</h3>
                <Badge className="glass-badge-cumpleanos">
                  {displayCumpleanos.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                {displayCumpleanos.length > 0 ? (
                  displayCumpleanos.map((newsItem) => (
                    <NewsCard
                      key={newsItem.id}
                      news={newsItem}
                    />
                  ))
                ) : (
                  <div className="col-span-2 glass-card p-6 text-center">
                    <Gift className="h-8 w-8 mx-auto mb-2 glass-text-muted" />
                    <p className="text-sm glass-text-secondary">
                      No hay cumpleaños próximos
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Other news - Right side */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg glass-icon-btn">
                  <Bell className="h-4 w-4 text-navy2" />
                </div>
                <h3 className="text-lg font-medium text-white">Otras Novedades</h3>
                <Badge className="glass-badge-noticia">
                  {displayOthers.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                {displayOthers.length > 0 ? (
                  displayOthers.map((newsItem) => (
                    <NewsCard
                      key={newsItem.id}
                      news={newsItem}
                    />
                  ))
                ) : (
                  <div className="col-span-2 glass-card p-6 text-center">
                    <Bell className="h-8 w-8 mx-auto mb-2 glass-text-muted" />
                    <p className="text-sm glass-text-secondary">
                      No hay otras novedades
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Nuevos en el equipo */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg glass-icon-btn">
              <UserPlus className="h-5 w-5 text-orange" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Nuevos en el Equipo
            </h2>
            <Badge className="bg-orange text-white ml-2">
              {newEmployees.length}
            </Badge>
          </div>

          {newEmployees.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Users className="h-12 w-12 mx-auto glass-text-muted" />
              <p className="mt-4 text-sm glass-text-secondary">
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

        {/* Section 3: Conecta360 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg glass-icon-btn">
                <Users className="h-5 w-5 text-orange" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">Conecta360</h2>
              <Badge className="glass-badge text-white/90 ml-2">
                {filteredProfileCards.length} colaboradores
              </Badge>
            </div>

            <div className="relative flex-1 min-w-0 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 glass-text-muted" />
              <Input
                placeholder="Buscar por nombre, carrera, hobby..."
                className="w-full pl-9 border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-orange focus:ring-orange"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredProfileCards.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Users className="h-12 w-12 mx-auto glass-text-muted" />
              <p className="mt-4 text-sm glass-text-secondary">
                No se encontraron colaboradores
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Carousel container */}
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

              {/* Fade indicator on the right */}
              {showRightFade && (
                <div className="absolute right-0 top-0 bottom-2 w-12 pointer-events-none
                  bg-gradient-to-l from-[#1E2245] to-transparent" />
              )}
            </div>
          )}
        </section>

        {/* Section 4: Actividades y Eventos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg glass-icon-btn">
                <Calendar className="h-5 w-5 text-orange" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Actividades y Eventos
              </h2>
              <Badge className="glass-badge text-white/90 ml-2">
                {filteredActivities.length}
              </Badge>
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-40 border-white/20 bg-white/10 text-white">
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
            <div className="glass-card p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto glass-text-muted" />
              <p className="mt-4 text-sm glass-text-secondary">
                No hay actividades programadas
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
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
      </div>

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
