import { NewEmployee } from '@/types';
import { Sparkles } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { AnimatedAvatar } from '@/components/shared/AnimatedAvatar';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { useState, useRef, useEffect, type MouseEvent } from 'react';

interface NewEmployeeCardProps {
  employee: NewEmployee;
}

// Opciones de reacción para nuevos empleados
const REACTION_OPTIONS = [
  { emoji: '👋', label: 'Saludar' },
  { emoji: '🎉', label: 'Celebrar' },
  { emoji: '🔥', label: 'Motivar' },
  { emoji: '🤝', label: 'Apoyar' },
];

// Paleta de acentos: cada tarjeta "hereda" un color distinto según su id
const ACCENT_PALETTES = [
  { grad: 'from-[#FF6B6B] to-[#FFA36C]', solid: '#FF6B6B', soft: '#FFF1EC' },
  { grad: 'from-[#6C5CE7] to-[#A29BFE]', solid: '#6C5CE7', soft: '#F1EFFE' },
  { grad: 'from-[#00B894] to-[#55EFC4]', solid: '#00B894', soft: '#E7FBF4' },
  { grad: 'from-[#0984E3] to-[#74B9FF]', solid: '#0984E3', soft: '#EAF4FF' },
  { grad: 'from-[#E17055] to-[#FAB1A0]', solid: '#E17055', soft: '#FDEEEA' },
  { grad: 'from-[#FD79A8] to-[#FFC2E2]', solid: '#FD79A8', soft: '#FFEFF6' },
];

const HOBBY_COLORS = [
  'bg-[#FFF1EC] text-[#E85A1A]',
  'bg-[#EAF4FF] text-[#0984E3]',
  'bg-[#E7FBF4] text-[#00B894]',
  'bg-[#F1EFFE] text-[#6C5CE7]',
  'bg-[#FFEFF6] text-[#D6336C]',
  'bg-[#FFF9E6] text-[#B08900]',
];

const CONFETTI_COLORS = ['#FFD93D', '#6BCB77', '#4D96FF', '#FF6B6B', '#C780FA'];

function pickPalette(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return ACCENT_PALETTES[hash % ACCENT_PALETTES.length];
}

function getIcebreaker(employee: NewEmployee): string {
  const { user } = employee;
  if (employee.hobbies && employee.hobbies.length > 0) {
    const hobby = employee.hobbies[Math.floor(Math.random() * employee.hobbies.length)];
    return `A ${user.nombre} le encanta ${hobby.toLowerCase()}. ¡Rompe el hielo preguntándole al respecto!`;
  }
  return `${user.nombre} es ${user.carrera}. ¡Pregúntale qué lo trajo hasta aquí!`;
}

function ConfettiBurst({
  triggerKey,
  count = 10,
  originLeft = '20%',
  originTop = '0%',
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
          const distance = 36 + Math.random() * 30;
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

export function NewEmployeeCard({ employee }: NewEmployeeCardProps) {
  const { user } = useAuthStore();
  const appStore = useAppStore();
  const { user: employeeUser } = employee;
  const initials = `${employeeUser.nombre[0]}${employeeUser.apellido[0]}`;
  const [showPicker, setShowPicker] = useState(false);
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [milestoneKey, setMilestoneKey] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);
  const [icebreaker] = useState(() => getIcebreaker(employee));

  const palette = pickPalette(employee.id);

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

  // Obtener reacciones de este nuevo empleado
  const reactions = appStore.getNewEmployeeReactions(employee.id);
  const userReaction = reactions.find((r) => r.userId === user?.id);
  const totalReactions = reactions.length;

  // Contar reacciones por tipo
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.tipo] = (acc[r.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Celebración de hito: cada 5 reacciones, un confeti grande y un mensaje breve
  const prevTotalRef = useRef(0);
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

  const handleReaction = (emoji: '👋' | '🎉' | '🔥' | '🤝') => {
    if (!user) return;

    if (userReaction?.tipo === emoji) {
      appStore.removeNewEmployeeReaction(employee.id, user.id);
    } else {
      appStore.addNewEmployeeReaction(employee.id, user.id, emoji);
      setConfettiKey((k) => k + 1);
    }
    setShowPicker(false);
  };

  const daysAgo = differenceInDays(new Date(), new Date(employee.fechaPublicacion));
  const joinedLabel =
    daysAgo <= 0 ? 'Se unió hoy' : daysAgo === 1 ? 'Se unió ayer' : `Se unió hace ${daysAgo} días`;

  const comentario = employee.comentario ?? '';
  const isLongComment = comentario.length > 90;
  const shownComment =
    isLongComment && !isCommentExpanded ? `${comentario.slice(0, 90).trim()}…` : comentario;

  const handleFlip = () => {
    setIsFlipped((v) => !v);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24, scale: 0.92, rotate: -3 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={{ perspective: 1000 }}
      className="min-w-0"
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative h-full">
        {/* Insignia de hito flotando encima de todo */}
        <AnimatePresence>
          {showMilestone && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 z-50 bg-white shadow-lg rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap"
              style={{ color: palette.solid }}
            >
              🔥 ¡Le encanta al equipo!
            </motion.div>
          )}
        </AnimatePresence>
        <ConfettiBurst triggerKey={milestoneKey} count={26} originLeft="50%" originTop="30%" />

        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative h-full"
        >
          {/* FRONT FACE */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              pointerEvents: isFlipped ? 'none' : 'auto',
              position: 'relative',
              zIndex: isFlipped ? 0 : 1,
            }}
            className="bg-white border border-[#E4E6F0] rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden h-full flex flex-col"
          >
            {/* Cabecera con color de acento propio + patrón animado + stickers */}
            <div className={`relative px-4 pt-4 pb-5 bg-gradient-to-br ${palette.grad}`}>
              <motion.div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
                  backgroundSize: '14px 14px',
                }}
                animate={{ backgroundPosition: ['0px 0px', '14px 14px'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
              <motion.span
                className="absolute top-1 left-1 text-xs pointer-events-none"
                animate={{ y: [0, -4, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                ⭐
              </motion.span>
              <motion.span
                className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs pointer-events-none opacity-80"
                animate={{ y: [0, 4, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              >
                ✨
              </motion.span>

              {/* Fila principal: avatar+nombre a la izquierda, dado en su propia columna a la derecha.
                  Al ser flex (no absolute) ninguno puede montarse sobre el otro. */}
              <div className="relative z-10 flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  {/* Avatar animado, con wiggle, burbuja de saludo y badge NUEVO anclado a su esquina */}
                  <motion.div
                    className="relative flex-shrink-0"
                    style={{ width: 64, height: 64 }}
                    whileHover={{ rotate: [0, -8, 8, -4, 0] }}
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
                          className="absolute -top-8 left-0 z-30 bg-white text-[11px] font-semibold px-2 py-1 rounded-lg shadow-md whitespace-nowrap"
                          style={{ color: palette.solid }}
                        >
                          ¡Hola! 👋
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatedAvatar
                      initials={initials}
                      size={64}
                      colors={['#E85A1A', '#2DB87A', '#3B82F6', '#F59E0B']}
                      imageUrl={employeeUser.foto}
                    />
                    {/* Badge NUEVO: vive en la esquina del avatar, nunca sobre el nombre */}
                    <div className="absolute -bottom-1 -right-1 z-20">
                      <motion.span
                        className="absolute inset-0 rounded-full"
                        style={{ background: palette.solid }}
                        animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                      />
                      <span
                        className="relative block bg-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-white uppercase tracking-[0.5px] shadow-lg"
                        style={{ color: palette.solid }}
                      >
                        Nuevo
                      </span>
                    </div>
                  </motion.div>

                  {/* Name block: min-w-0 + line-clamp trunca el texto antes de chocar con el dado */}
                  <div className="min-w-0 pt-1">
                    <h3 className="text-white font-semibold text-base leading-tight line-clamp-1 drop-shadow-sm">
                      {employeeUser.nombre} {employeeUser.apellido}
                    </h3>
                    <p className="text-sm mt-0.5 line-clamp-1 text-white/85">{employeeUser.cargo}</p>
                  </div>
                </div>

                {/* Dado: columna propia a la derecha, con su explicación siempre visible debajo (no depende de hover) */}
                <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
                  <motion.button
                    onClick={handleFlip}
                    animate={{ scale: [1, 1.08, 1], rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                    whileHover={{ scale: 1.15, rotate: 12 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Ver dato curioso sobre esta persona"
                    className="w-11 h-11 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-xl shadow-md border-2 border-white/20 hover:border-white/50 transition-colors cursor-pointer"
                  >
                    🎲
                  </motion.button>
                  <span className="text-[15 font-semibold text-white/85 whitespace-nowrap">Dato curioso</span>
                </div>
              </div>
            </div>

            {/* Cuerpo de la tarjeta */}
            <div className="px-4 py-3 bg-white flex-1 flex flex-col">
              {/* Tags row */}
              <div className="flex flex-wrap gap-2">
                <span className="card-tag-neutral">{employeeUser.carrera}</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: palette.soft, color: palette.solid }}
                >
                  {employeeUser.seniority}
                </span>
              </div>

              {/* Comment box */}
              {comentario && (
                <div className="mt-3">
                  <p className="text-sm text-[#5A5F80] italic leading-relaxed">"{shownComment}"</p>
                  {isLongComment && (
                    <button
                      onClick={() => setIsCommentExpanded((v) => !v)}
                      className="text-xs font-semibold mt-1"
                      style={{ color: palette.solid }}
                    >
                      {isCommentExpanded ? 'Leer menos' : 'Leer más'}
                    </button>
                  )}
                </div>
              )}

              {/* Hobbies, con entrada escalonada y color rotativo */}
              {employee.hobbies && employee.hobbies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {employee.hobbies.map((hobby, i) => (
                    <motion.span
                      key={hobby}
                      initial={{ opacity: 0, y: 6, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.05 * i, duration: 0.25 }}
                      whileHover={{ scale: 1.08 }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${HOBBY_COLORS[i % HOBBY_COLORS.length]}`}
                    >
                      {hobby}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Reacciones */}
              <div className="relative flex items-center gap-2 mt-3 flex-wrap">
                <ConfettiBurst triggerKey={confettiKey} />

                {/* Mostrar reacciones existentes */}
                {Object.entries(reactionCounts).map(([emoji, count]) => (
                  <motion.span
                    key={emoji}
                    layout
                    whileHover={{ scale: 1.08 }}
                    className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border ${
                      userReaction?.tipo === emoji
                        ? 'bg-[#FEF0EA] border-[#E85A1A]/30 text-[#C03510]'
                        : 'bg-[#F4F5FA] border-[#E4E6F0] text-[#5A5F80]'
                    }`}
                  >
                    <span>{emoji}</span>
                    <span className="font-bold">{count}</span>
                  </motion.span>
                ))}

                {/* Botón Reaccionar */}
                <div className="relative">
                  <motion.button
                    onClick={() => setShowPicker(!showPicker)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#F4F5FA] text-[#5A5F80] hover:bg-[#FEF0EA] transition-colors border border-[#E4E6F0]"
                  >
                    <span>😊</span>
                    <span>Reaccionar</span>
                  </motion.button>

                  {/* Picker de reacciones */}
                  <AnimatePresence>
                    {showPicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 8 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                        className="absolute bottom-full left-0 mb-2 z-50 bg-white border border-[#E4E6F0] rounded-2xl shadow-xl p-1.5 flex gap-0.5"
                      >
                        {REACTION_OPTIONS.map((option, i) => (
                          <motion.button
                            key={option.emoji}
                            onClick={() => handleReaction(option.emoji as any)}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.03 * i }}
                            whileHover={{ scale: 1.25, rotate: -6 }}
                            whileTap={{ scale: 0.9 }}
                            className={`flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl transition-colors min-w-[44px] ${
                              userReaction?.tipo === option.emoji ? 'bg-[#FEF0EA]' : 'hover:bg-[#F4F5FA]'
                            }`}
                          >
                            <span className="text-xl">{option.emoji}</span>
                            <span className="text-[8px] font-bold text-[#B0B4CC] text-center leading-tight">
                              {option.label}
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Date row */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0F2FA]">
                <span
                  className="text-xs flex items-center"
                  style={{ color: 'var(--muted-text)' }}
                  title={format(new Date(employee.fechaPublicacion), "d 'de' MMMM, yyyy", { locale: es })}
                >
                  <Sparkles className="h-3 w-3 inline mr-1.5" style={{ color: palette.solid }} />
                  {joinedLabel}
                </span>
                <button
                  className="text-xs font-semibold text-[#C0C3D8] hover:text-[#9499BB] transition-colors"
                  onClick={() => {
                    // Aquí va la lógica para ocultar
                  }}
                >
                  Ocultar ✕
                </button>
              </div>
            </div>
          </div>

          {/* BACK FACE: dato curioso / rompehielos */}
          <motion.div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              position: 'absolute',
              inset: 0,
              pointerEvents: isFlipped ? 'auto' : 'none',
              zIndex: isFlipped ? 2 : 0,
            }}
            className="bg-white border border-[#E4E6F0] rounded-2xl shadow-lg overflow-hidden flex flex-col items-center justify-center text-center p-6"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${palette.grad}`}
              style={{ opacity: 0.08 }}
            />
            <span className="text-4xl mb-3 relative z-10">🎲</span>
            <span className="text-[10px] font-semibold text-[#9499BB] uppercase tracking-wider mb-1 relative z-10">
              Dato curioso
            </span>
            <p className="text-sm font-semibold text-[#3A3D5C] leading-relaxed max-w-[85%] relative z-10">
              {icebreaker}
            </p>
            <button
              onClick={() => setIsFlipped(false)}
              className="mt-5 text-xs font-bold px-4 py-2 rounded-full relative z-10 cursor-pointer hover:scale-105 transition-transform active:scale-95"
              style={{ background: palette.soft, color: palette.solid }}
            >
              ↩ Volver
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}