import { ProfileCard as ProfileCardType, ReactionType } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileText, Edit, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ReactionPicker } from '@/components/shared/ReactionBar';
import { useAuthStore } from '@/stores/authStore';

interface ProfileCardProps {
  card: ProfileCardType;
  userReaction?: { tipo: ReactionType };
  reactions: { tipo: ReactionType; user: { nombre: string; apellido: string } }[];
  onReact: (tipo: ReactionType) => void;
  onEdit?: () => void;
  onViewHV?: () => void;
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
  const [showReactions, setShowReactions] = useState(false);

  const canEdit = currentUser?.id === card.userId;
  const canViewHV = hasPermission('viewHV', card.userId);

  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.tipo] = (acc[r.tipo] || 0) + 1;
    return acc;
  }, {} as Record<ReactionType, number>);

  const initials = `${card.user.nombre[0]}${card.user.apellido[0]}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-shrink-0 w-[260px] min-w-[260px]"
    >
      <div className="h-full flex flex-col overflow-hidden transition-all hover:shadow-2xl group glass-card">
        <div className="p-4 flex-1">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-3">
              <Avatar className="h-20 w-20 ring-2 ring-orange/30 ring-offset-2 ring-offset-[#1E2245]/50">
                <AvatarImage src={card.foto} alt={`${card.user.nombre} ${card.user.apellido}`} />
                <AvatarFallback className="text-2xl bg-navy2 text-white">{initials}</AvatarFallback>
              </Avatar>
              {canEdit && (
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity glass-icon-btn"
                  onClick={onEdit}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Name and Role */}
            <h3 className="font-semibold glass-text-primary line-clamp-1">
              {card.user.nombre} {card.user.apellido}
            </h3>
            <p className="text-sm glass-text-secondary line-clamp-1">{card.user.cargo}</p>

            {/* Career and Seniority */}
            <div className="mt-2 flex flex-wrap justify-center gap-1 min-h-[24px]">
              <Badge variant="outline" className="text-xs glass-badge text-white/90">
                {card.user.carrera}
              </Badge>
              <Badge variant="secondary" className="text-xs glass-badge text-white/90">
                {card.user.seniority}
              </Badge>
            </div>

            {/* Hobbies */}
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 min-h-[28px]">
              {card.hobbies.slice(0, 4).map((hobby) => (
                <TooltipProvider key={hobby.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-1 text-xs py-0.5 glass-badge text-white/90">
                        {hobby.icono && <span>{hobby.icono}</span>}
                        <span className="truncate max-w-[60px]">{hobby.nombre}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-navy text-white">
                      <p>{hobby.nombre}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {card.hobbies.length > 4 && (
                <Badge variant="outline" className="text-xs py-0.5 glass-badge text-white/70">
                  +{card.hobbies.length - 4}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 bg-white/5 p-3 mt-auto">
          {/* Reactions */}
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1 relative">
              <AnimatePresence>
                {Object.entries(reactionCounts).map(([tipo, count]) => {
                  if (count === 0) return null;
                  const emoji = tipo === 'felicidades' ? '🎉'
                    : tipo === 'saludos' ? '👋'
                    : tipo === 'fuego' ? '🔥'
                    : '👍';
                  return (
                    <motion.span
                      key={tipo}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-0.5 text-sm"
                    >
                      <span>{emoji}</span>
                      <span className="text-xs glass-text-secondary">{count}</span>
                    </motion.span>
                  );
                })}
              </AnimatePresence>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-xs glass-icon-btn border-0"
                onClick={() => setShowReactions(!showReactions)}
              >
                <Heart className="h-3.5 w-3.5" />
                Reaccionar
              </Button>

              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 z-10"
                  >
                    <ReactionPicker
                      currentUserId={currentUser?.id || ''}
                      existingReaction={userReaction ? { tipo: userReaction.tipo } as any : undefined}
                      onReact={(tipo) => {
                        onReact(tipo);
                        setShowReactions(false);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* View HV Button - SOLID action button */}
          {canViewHV && (
            <Button
              size="sm"
              className="w-full gap-2 action-btn-solid"
              onClick={onViewHV}
            >
              <FileText className="h-3.5 w-3.5" />
              Ver Hoja de Vida
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
