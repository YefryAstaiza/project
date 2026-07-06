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
import { FileText, Edit, Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface ProfileCardProps {
  card: ProfileCardType;
  userReaction?: { tipo: ReactionType };
  reactions: { tipo: ReactionType; user: { nombre: string; apellido: string } }[];
  onReact: (tipo: ReactionType) => void;
  onEdit?: () => void;
  onViewHV?: () => void;
}

// Opciones de reacción con emojis y etiquetas
const REACTION_OPTIONS = [
  { tipo: 'felicidades' as ReactionType, emoji: '🎉', label: 'Felicidades' },
  { tipo: 'saludos' as ReactionType, emoji: '👋', label: 'Saludos' },
  { tipo: 'fuego' as ReactionType, emoji: '🔥', label: 'Fuego' },
  { tipo: 'like' as ReactionType, emoji: '👍', label: 'Me gusta' },
];

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

  const getReactionEmoji = (tipo: string) => {
    const map: Record<string, string> = {
      felicidades: '🎉',
      saludos: '👋',
      fuego: '🔥',
      like: '👍',
    };
    return map[tipo] || '👍';
  };

  const handleReaction = (tipo: ReactionType) => {
    onReact(tipo);
    setShowReactions(false);
  };

  // Verificar si el usuario ya reaccionó con este tipo
  const isUserReaction = (tipo: string) => {
    return userReaction?.tipo === tipo;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-shrink-0 w-[260px] min-w-[260px]"
    >
      <div className="h-full flex flex-col overflow-hidden transition-all hover:shadow-2xl group bg-white border border-[#E4E6F0] rounded-2xl shadow-sm">
        <div className="p-4 flex-1">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-3">
              <Avatar className="h-20 w-20 ring-2 ring-[#E85A1A]/30 ring-offset-2 ring-offset-white">
                <AvatarImage src={card.foto} alt={`${card.user.nombre} ${card.user.apellido}`} />
                <AvatarFallback className="text-2xl bg-[#E85A1A] text-white">{initials}</AvatarFallback>
              </Avatar>
              {canEdit && (
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-[#E85A1A] text-white hover:bg-[#C03510]"
                  onClick={onEdit}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Name */}
            <h3 className="font-semibold text-[#1E2245] line-clamp-1">
              {card.user.nombre} {card.user.apellido}
            </h3>
            
            {/* Role */}
            <p className="text-sm text-[#9499BB] line-clamp-1">{card.user.cargo}</p>

            {/* Career and Seniority */}
            <div className="mt-2 flex flex-wrap justify-center gap-1 min-h-[24px]">
              <Badge variant="outline" className="text-xs bg-[#F0F2FA] text-[#6B7280] border-[#E4E6F0]">
                {card.user.carrera}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-[#FEF0EA] text-[#C03510] border-[#E4E6F0]">
                {card.user.seniority}
              </Badge>
            </div>

            {/* Hobbies */}
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 min-h-[28px]">
              {card.hobbies.slice(0, 4).map((hobby) => (
                <TooltipProvider key={hobby.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-1 text-xs py-0.5 bg-[#F4F5FA] text-[#5A5F80] border-[#E4E6F0]">
                        {hobby.icono && <span>{hobby.icono}</span>}
                        <span className="truncate max-w-[60px]">{hobby.nombre}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1E2245] text-white">
                      <p>{hobby.nombre}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {card.hobbies.length > 4 && (
                <Badge variant="outline" className="text-xs py-0.5 bg-white text-[#9499BB] border-dashed border-[#C8CADB]">
                  +{card.hobbies.length - 4}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#F0F2FA] bg-[#F8F9FC] p-3 mt-auto">
          {/* Reactions */}
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1 relative flex-wrap">
              {/* Mostrar reacciones existentes */}
              {Object.entries(reactionCounts).map(([tipo, count]) => {
                if (count === 0) return null;
                const isActive = isUserReaction(tipo);
                return (
                  <motion.span
                    key={tipo}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={`flex items-center gap-0.5 text-sm px-1.5 py-0.5 rounded-full border ${
                      isActive 
                        ? 'bg-[#FEF0EA] border-[#E85A1A]/30 text-[#C03510]' 
                        : 'bg-[#F4F5FA] border-[#E4E6F0] text-[#5A5F80]'
                    }`}
                  >
                    <span>{getReactionEmoji(tipo)}</span>
                    <span className="text-xs font-bold">{count}</span>
                  </motion.span>
                );
              })}

              {/* Botón Reaccionar */}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-xs text-[#5A5F80] hover:text-[#1E2245] hover:bg-[#F4F5FA] border-0"
                onClick={() => setShowReactions(!showReactions)}
              >
                <Heart className="h-3.5 w-3.5" />
                Reaccionar
              </Button>

              {/* Picker de reacciones */}
              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 z-50 bg-white border border-[#E4E6F0] rounded-2xl shadow-xl p-2 flex gap-1"
                  >
                    {REACTION_OPTIONS.map((option) => {
                      const isActive = isUserReaction(option.tipo);
                      return (
                        <button
                          key={option.tipo}
                          onClick={() => handleReaction(option.tipo)}
                          className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all hover:bg-[#F4F5FA] hover:scale-110 min-w-[44px] ${
                            isActive ? 'bg-[#FEF0EA]' : ''
                          }`}
                        >
                          <span className="text-2xl">{option.emoji}</span>
                          <span className="text-[8px] font-bold text-[#B0B4CC] text-center leading-tight">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* View HV Button */}
          {canViewHV && (
            <Button
              size="sm"
              className="w-full gap-2 bg-[#E85A1A] text-white hover:bg-[#C03510]"
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