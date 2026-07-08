import { ProfileCard as ProfileCardType, ReactionType, CommunityPost } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileText, Edit, Heart, MessageCircle, Send, Trash2, Sparkles, Bell, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useState, useRef, useEffect, type MouseEvent } from 'react';
import { ReactionPicker } from '@/components/shared/ReactionBar';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';

interface ProfileCardProps {
  card: ProfileCardType;
  userReaction?: { tipo: ReactionType };
  reactions: { tipo: ReactionType; user: { nombre: string; apellido: string } }[];
  onReact: (tipo: ReactionType) => void;
  onEdit?: () => void;
  onViewHV?: () => void;
}

// Paleta de azules difuminados: todo en familia azul, cada tarjeta "hereda" un tono
// distinto según su id, pero siempre dentro del mismo espectro (nada de naranjas/verdes/rosas).
const ACCENT_PALETTES = [
  { glowA: '#3B82F6', glowB: '#1E3A8A', solid: '#3B82F6', soft: '#EAF2FF' },
  { glowA: '#60A5FA', glowB: '#2563EB', solid: '#60A5FA', soft: '#EFF6FF' },
  { glowA: '#38BDF8', glowB: '#0C4A6E', solid: '#38BDF8', soft: '#E3F6FF' },
  { glowA: '#818CF8', glowB: '#3730A3', solid: '#818CF8', soft: '#EEF0FF' },
  { glowA: '#0EA5E9', glowB: '#075985', solid: '#0EA5E9', soft: '#E0F5FF' },
  { glowA: '#6366F1', glowB: '#1E1B7A', solid: '#6366F1', soft: '#ECEBFF' },
];

const CONFETTI_COLORS = ['#93C5FD', '#60A5FA', '#38BDF8', '#818CF8', '#BFDBFE'];

function pickPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return ACCENT_PALETTES[hash % ACCENT_PALETTES.length];
}

// Ráfaga de confeti reutilizable, igual que en NewEmployeeCard
function ConfettiBurst({
  triggerKey,
  count = 14,
  originLeft = '50%',
  originTop = '20%',
}: {
  triggerKey: number;
  count?: number;
  originLeft?: string;
  originTop?: string;
}) {
  if (!triggerKey) return null;
  const particles = Array.from({ length: count });
  return (
    <AnimatePresence>
      <motion.div key={triggerKey} className="pointer-events-none absolute inset-0 z-40 overflow-visible">
        {particles.map((_, i) => {
          const angle = (i / particles.length) * Math.PI * 2;
          const distance = 34 + Math.random() * 28;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance - 10;
          const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
          return (
            <motion.span
              key={i}
              initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
              animate={{ opacity: 0, x, y, scale: 1, rotate: Math.random() * 360 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: originLeft,
                top: originTop,
                width: 6,
                height: 6,
                borderRadius: 2,
                background: color,
              }}
            />
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}

export function ProfileCard({
  card,
  userReaction,
  reactions,
  onReact,
  onEdit,
  onViewHV,
}: ProfileCardProps) {
  const { user: currentUser, hasPermission } = useAuthStore();
  const appStore = useAppStore();
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [postContent, setPostContent] = useState('');
  const [showPostInput, setShowPostInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [milestoneKey, setMilestoneKey] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevTotalRef = useRef(0);

  const palette = pickPalette(card.id);

  const canEdit = currentUser?.id === card.userId;
  const canViewHV = hasPermission('viewHV', card.userId);

  // Tilt 3D estilo "carta coleccionable" que sigue al mouse
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isFlipped) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 14);
    rotateX.set(-(py - 0.5) * 14);
  };
  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const handleFlip = () => setIsFlipped((v) => !v);

  // Obtener publicaciones de este usuario
  const userPosts = appStore.getCommunityPosts?.()?.filter(
    (post: CommunityPost) => post.userId === card.userId
  ) || [];

  // Mostrar notificación temporal
  const showTemporaryNotification = (message: string) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setShowNotification(true);
    setNotificationMessage(message);
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  // Verificar si hay nuevas publicaciones
  useEffect(() => {
    if (userPosts.length > 0) {
      const latestPost = userPosts[0];
      const now = new Date();
      const postDate = new Date(latestPost.createdAt);
      const diffMinutes = Math.floor((now.getTime() - postDate.getTime()) / 1000 / 60);

      if (diffMinutes < 5) {
        showTemporaryNotification(`${latestPost.user.nombre} publicó algo nuevo!`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPosts]);

  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.tipo] = (acc[r.tipo] || 0) + 1;
    return acc;
  }, {} as Record<ReactionType, number>);

  // Celebración de hito: cada 5 reacciones, confeti grande + badge breve
  const totalReactions = reactions.length;
  useEffect(() => {
    if (totalReactions > 0 && totalReactions % 5 === 0 && totalReactions !== prevTotalRef.current) {
      setMilestoneKey((k) => k + 1);
      setShowMilestone(true);
      const t = setTimeout(() => setShowMilestone(false), 2200);
      prevTotalRef.current = totalReactions;
      return () => clearTimeout(t);
    }
    prevTotalRef.current = totalReactions;
  }, [totalReactions]);

  const initials = `${card.user.nombre[0]}${card.user.apellido[0]}`;

  const getReactionEmoji = (tipo: string) => {
    const map: Record<string, string> = {
      felicidades: '🎉',
      saludos: '👋',
      fuego: '🔥',
      like: '👍',
    };
    return map[tipo] || '👍';
  };

  const handleReact = (tipo: ReactionType) => {
    onReact(tipo);
    if (userReaction?.tipo !== tipo) {
      setConfettiKey((k) => k + 1);
    }
    setShowReactions(false);
  };

  const handleCreatePost = () => {
    if (!currentUser || !postContent.trim()) return;
    setIsSubmitting(true);
    appStore.addCommunityPost?.(currentUser.id, postContent.trim(), 'otro');
    setPostContent('');
    setShowPostInput(false);
    setIsSubmitting(false);
    showTemporaryNotification('Publicación creada con éxito!');
  };

  const handleLikePost = (postId: string) => {
    if (!currentUser) return;
    appStore.likeCommunityPost?.(postId, currentUser.id);
  };

  const handleAddComment = (postId: string) => {
    if (!currentUser || !commentText.trim()) return;
    appStore.addCommunityComment?.(postId, currentUser.id, commentText.trim());
    setCommentText('');
  };

  const handleDeletePost = (postId: string) => {
    if (!currentUser) return;
    if (confirm('¿Estás seguro de eliminar esta publicación?')) {
      appStore.deleteCommunityPost?.(postId, currentUser.id);
    }
  };

  // Header con degradado azul difuminado: capas de blobs desenfocados en vez de
  // un degradado lineal plano, para que se vea "manchado"/soft en vez de bandas duras.
  const headerBackground = `radial-gradient(120% 140% at 15% 0%, ${palette.glowA}CC 0%, transparent 55%),
     radial-gradient(120% 140% at 85% 20%, ${palette.glowB}CC 0%, transparent 60%),
     radial-gradient(160% 160% at 50% 100%, ${palette.glowB} 0%, transparent 70%),
     linear-gradient(180deg, #16224A 0%, #0E1733 100%)`;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{ perspective: 1000 }}
      // pt-8 reserva espacio propio DENTRO de esta caja para la burbuja de notificación
      // y el badge de hito, así nunca se cortan por el overflow de un carrusel padre.
      className="flex-shrink-0 w-[280px] min-w-[280px] relative pt-8"
    >
      {/* Burbuja de notificación */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-[999] bg-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap max-w-[260px]"
            style={{ color: palette.solid, border: `1px solid ${palette.solid}30` }}
          >
            <Bell className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{notificationMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge de hito por reacciones */}
      <AnimatePresence>
        {showMilestone && !showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-[999] bg-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
            style={{ color: palette.solid, border: `1px solid ${palette.solid}30` }}
          >
            🔥 ¡Le encanta al equipo!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capa que aplica el tilt 3D; todo lo que gira vive aquí adentro */}
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative h-full">
        {/* Capa de flip: gira 180° en Y para mostrar el reverso con las publicaciones */}
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative h-full"
        >
          {/* ============ FRONT FACE ============ */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              pointerEvents: isFlipped ? 'none' : 'auto',
              position: 'relative',
              zIndex: isFlipped ? 0 : 1,
            }}
            className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-2xl group bg-[#0E1733] border border-[#2B3768] rounded-2xl shadow-lg"
          >
            <ConfettiBurst triggerKey={confettiKey} />

            {/* Cabecera: degradado azul difuminado (blobs desenfocados, no bandas planas) */}
            <div
              className="relative overflow-hidden px-4 pt-4 pb-3"
              style={{ background: headerBackground }}
            >
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
                  backgroundSize: '14px 14px',
                }}
                animate={{ backgroundPosition: ['0px 0px', '14px 14px'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />

              {/* Stickers decorativos flotantes */}
              <motion.span
                className="absolute top-1.5 left-2 text-xs pointer-events-none opacity-90"
                animate={{ y: [0, -4, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                ⭐
              </motion.span>
              <motion.span
                className="absolute top-2 right-3 text-xs pointer-events-none opacity-80"
                animate={{ y: [0, 4, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              >
                ✨
              </motion.span>

              {/* Botón de flip: da vuelta a la tarjeta para ver publicaciones */}
              <motion.button
                onClick={handleFlip}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Ver publicaciones de esta persona"
                className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-md border border-white/20 hover:bg-white/30 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {userPosts.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-white text-[8px] font-extrabold flex items-center justify-center"
                    style={{ color: palette.solid }}
                  >
                    {userPosts.length}
                  </span>
                )}
              </motion.button>

              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Avatar */}
                <motion.div
                  className="relative mb-2"
                  whileHover={{ rotate: [0, -6, 6, -3, 0] }}
                  transition={{ duration: 0.5 }}
                  onHoverStart={() => setIsAvatarHovered(true)}
                  onHoverEnd={() => setIsAvatarHovered(false)}
                >
                  <AnimatePresence>
                    {isAvatarHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 bg-white text-[11px] font-semibold px-2 py-1 rounded-lg shadow-md whitespace-nowrap"
                        style={{ color: palette.solid }}
                      >
                        ¡Hola! 👋
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="w-20 h-20 rounded-full ring-2 ring-white/30 ring-offset-2 ring-offset-[#0E1733] bg-[#F4F5FA] flex items-center justify-center text-3xl font-bold text-[#1E2245] overflow-hidden">
                    {card.foto ? (
                      <img
                        src={card.foto}
                        alt={`${card.user.nombre} ${card.user.apellido}`}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  {canEdit && (
                    <Button
                      size="icon"
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white text-[#1E2245] hover:bg-gray-100 shadow-lg"
                      onClick={onEdit}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </motion.div>

                {/* Name and Role */}
                <h3 className="font-semibold text-white line-clamp-1 drop-shadow-sm">
                  {card.user.nombre} {card.user.apellido}
                </h3>
                <p className="text-sm text-white/80 line-clamp-1">{card.user.cargo}</p>

                {/* Career and Seniority */}
                <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                  <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/20">
                    {card.user.carrera}
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/20">
                    {card.user.seniority}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="px-4 py-3 flex-1 flex flex-col bg-[#111C3D]">
              {/* Hobbies */}
              <div className="flex flex-wrap justify-center gap-1.5 min-h-[28px]">
                {card.hobbies.slice(0, 4).map((hobby, i) => (
                  <TooltipProvider key={hobby.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.05 * i, duration: 0.25 }}
                          whileHover={{ scale: 1.08 }}
                        >
                          <Badge variant="outline" className="gap-1 text-xs py-0.5 bg-[#1B2757] text-[#9DB2E8] border-[#2B3768]">
                            {hobby.icono && <span>{hobby.icono}</span>}
                            <span className="truncate max-w-[60px]">{hobby.nombre}</span>
                          </Badge>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1E2245] text-white">
                        <p>{hobby.nombre}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {card.hobbies.length > 4 && (
                  <Badge variant="outline" className="text-xs py-0.5 bg-transparent text-[#6E7BAE] border-dashed border-[#2B3768]">
                    +{card.hobbies.length - 4}
                  </Badge>
                )}
              </div>

              {/* Hint para descubrir publicaciones dando vuelta la tarjeta */}
              <button
                onClick={handleFlip}
                className="mt-4 mx-auto flex items-center gap-1.5 text-xs font-semibold text-[#9DB2E8] hover:text-white transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {userPosts.length > 0
                  ? `Ver ${userPosts.length} publicación${userPosts.length === 1 ? '' : 'es'}`
                  : 'Dar vuelta la tarjeta'}
              </button>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-2 border-t border-[#1F2B57] bg-[#0B142E] p-3 mt-auto">
              {/* Reactions */}
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1 relative flex-wrap">
                  <AnimatePresence>
                    {Object.entries(reactionCounts).map(([tipo, count]) => {
                      if (count === 0) return null;
                      const isActive = userReaction?.tipo === tipo;
                      return (
                        <motion.span
                          key={tipo}
                          layout
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          whileHover={{ scale: 1.08 }}
                          className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-[#1B2757] border-[#60A5FA]/40 text-[#93C5FD]'
                              : 'bg-[#152049] border-[#2B3768] text-[#9DB2E8]'
                          }`}
                        >
                          <span>{getReactionEmoji(tipo)}</span>
                          <span className="font-bold">{count}</span>
                        </motion.span>
                      );
                    })}
                  </AnimatePresence>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 text-xs text-[#9DB2E8] hover:text-white hover:bg-[#1B2757] border-0"
                      onClick={() => setShowReactions(!showReactions)}
                    >
                      <Heart className="h-3.5 w-3.5" />
                      Reaccionar
                    </Button>
                  </motion.div>

                  <AnimatePresence>
                    {showReactions && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                        className="absolute bottom-full left-0 mb-2 z-10"
                      >
                        <ReactionPicker
                          currentUserId={currentUser?.id || ''}
                          existingReaction={userReaction ? { tipo: userReaction.tipo } as any : undefined}
                          onReact={handleReact}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* View HV Button */}
              {canViewHV && (
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-[#1B2757] text-white hover:bg-[#243766]"
                    onClick={onViewHV}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Ver Hoja de Vida
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* ============ BACK FACE: publicaciones de la comunidad ============ */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              position: 'absolute',
              inset: 0,
              pointerEvents: isFlipped ? 'auto' : 'none',
              zIndex: isFlipped ? 2 : 0,
            }}
            className="h-full flex flex-col overflow-hidden bg-[#0E1733] border border-[#2B3768] rounded-2xl shadow-lg"
          >
            {/* Mini cabecera del reverso, con el mismo acento azul difuminado */}
            <div
              className="relative px-4 py-3 flex items-center justify-between flex-shrink-0"
              style={{ background: headerBackground }}
            >
              <div className="flex items-center gap-2 min-w-0 relative z-10">
                <div className="w-8 h-8 rounded-full bg-[#F4F5FA] flex items-center justify-center text-xs font-bold text-[#1E2245] flex-shrink-0 overflow-hidden">
                  {card.foto ? (
                    <img src={card.foto} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold line-clamp-1">
                    {card.user.nombre} {card.user.apellido}
                  </p>
                  <p className="text-white/70 text-[10px] line-clamp-1">Publicaciones</p>
                </div>
              </div>
              <motion.button
                onClick={handleFlip}
                whileHover={{ scale: 1.1, rotate: -12 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Volver al frente"
                className="relative z-10 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-md border border-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </motion.button>
            </div>

            {/* Cuerpo del reverso: compositor + feed de publicaciones */}
            <div className="px-4 py-3 flex-1 flex flex-col bg-[#111C3D] overflow-hidden">
              {canEdit && (
                <button
                  onClick={() => setShowPostInput(!showPostInput)}
                  className="w-full text-xs text-[#6E7BAE] hover:text-white transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Compartir algo con la comunidad
                </button>
              )}

              <AnimatePresence>
                {showPostInput && canEdit && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex-shrink-0"
                  >
                    <div className="flex gap-1.5 mt-2">
                      <input
                        type="text"
                        placeholder="¿Qué quieres compartir?"
                        className="flex-1 px-2 py-1 text-xs bg-[#152049] text-white placeholder:text-[#6E7BAE] rounded-lg border border-[#2B3768] focus:border-[#60A5FA] focus:ring-2 focus:ring-[#60A5FA]/20 outline-none"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCreatePost();
                          }
                        }}
                        autoFocus
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCreatePost}
                        disabled={!postContent.trim() || isSubmitting}
                        className="px-2 py-1 bg-[#3B82F6] text-white rounded-lg text-[10px] font-bold hover:bg-[#2563EB] transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lista de publicaciones */}
              <div className="mt-2 space-y-2 flex-1 overflow-y-auto custom-scrollbar min-h-0">
                {userPosts.length > 0 ? (
                  userPosts.map((post: CommunityPost) => (
                    <div key={post.id} className="bg-[#152049] rounded-xl p-2 border border-[#2B3768]">
                      <p className="text-xs text-[#C7D3F5] leading-relaxed">{post.content}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-0.5 text-[10px] transition-colors ${
                            post.likes.includes(currentUser?.id || '') ? 'text-[#60A5FA]' : 'text-[#6E7BAE] hover:text-[#60A5FA]'
                          }`}
                        >
                          <Heart className={`h-3 w-3 ${post.likes.includes(currentUser?.id || '') ? 'fill-[#60A5FA]' : ''}`} />
                          <span>{post.likes.length}</span>
                        </motion.button>
                        <button
                          onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                          className="flex items-center gap-0.5 text-[10px] text-[#6E7BAE] hover:text-white transition-colors"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>{post.comments.length}</span>
                        </button>
                        {post.userId === currentUser?.id && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-[10px] text-[#43518F] hover:text-red-400 transition-colors ml-auto"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {/* Comentarios */}
                      <AnimatePresence>
                        {showComments === post.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-1.5"
                          >
                            {post.comments.slice(0, 2).map((comment) => (
                              <div key={comment.id} className="flex items-start gap-1.5 py-0.5">
                                <div className="w-4 h-4 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-[6px] font-bold flex-shrink-0">
                                  {comment.user.nombre[0]}
                                </div>
                                <p className="text-[9px] text-[#9DB2E8]">
                                  <span className="font-semibold text-white">{comment.user.nombre}</span>
                                  {' '}
                                  {comment.content}
                                </p>
                              </div>
                            ))}
                            {post.comments.length > 2 && (
                              <p className="text-[8px] text-[#6E7BAE] text-center mt-0.5">
                                +{post.comments.length - 2} comentarios más
                              </p>
                            )}
                            {currentUser && (
                              <div className="flex gap-1 mt-1">
                                <input
                                  type="text"
                                  placeholder="Comentar..."
                                  className="flex-1 px-1.5 py-0.5 text-[9px] bg-[#0E1733] text-white placeholder:text-[#43518F] rounded-lg border border-[#2B3768] focus:border-[#60A5FA] outline-none"
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddComment(post.id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleAddComment(post.id)}
                                  className="px-1.5 py-0.5 bg-[#3B82F6] text-white rounded-lg text-[8px] font-bold hover:bg-[#2563EB] transition-colors"
                                >
                                  <Send className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                    <span className="text-2xl mb-2 opacity-60">💬</span>
                    <p className="text-xs text-[#6E7BAE]">
                      {card.user.nombre} aún no ha compartido nada con la comunidad.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}