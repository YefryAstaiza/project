import { Reaction, ReactionType, User } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Flame, ThumbsUp, PartyPopper, Hand } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const reactionIcons: Record<ReactionType, { icon: React.ReactNode; label: string; color: string }> = {
  felicidades: {
    icon: <PartyPopper className="h-4 w-4" />,
    label: 'Felicidades',
    color: 'text-orange',
  },
  saludos: {
    icon: <Hand className="h-4 w-4" />,
    label: 'Saludos',
    color: 'text-blue-400',
  },
  fuego: {
    icon: <Flame className="h-4 w-4" />,
    label: 'Fuego',
    color: 'text-orange',
  },
  acuerdo: {
    icon: <ThumbsUp className="h-4 w-4" />,
    label: 'De acuerdo',
    color: 'text-green-400',
  },
};

interface ReactionBarProps {
  reactions: Reaction[];
  currentUserId: string;
  className?: string;
}

export function ReactionBar({
  reactions,
  currentUserId,
  className,
}: ReactionBarProps) {

  const getReactionCount = (tipo: ReactionType) =>
    reactions.filter((r) => r.tipo === tipo).length;

  const getUsersByReaction = (tipo: ReactionType): User[] =>
    reactions.filter((r) => r.tipo === tipo).map((r) => r.user);

  const hasUserReacted = (tipo: ReactionType) =>
    reactions.some((r) => r.userId === currentUserId && r.tipo === tipo);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Object.entries(reactionIcons).map(([tipo, { icon, label, color }]) => {
          const count = getReactionCount(tipo as ReactionType);
          if (count === 0) return null;

          return (
            <Popover key={tipo}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 gap-1 px-2 glass-icon-btn',
                    hasUserReacted(tipo as ReactionType) &&
                      'ring-1 ring-orange/30'
                  )}
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn('flex items-center', color)}
                  >
                    {icon}
                  </motion.span>
                  <span className="text-xs font-medium text-white/90">{count}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-white border border-gray-200 text-gray-900" align="start">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                  <div className="max-h-40 overflow-auto space-y-2">
                    {getUsersByReaction(tipo as ReactionType).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.foto} />
                          <AvatarFallback className="bg-orange text-white text-xs">
                            {user.nombre[0]}
                            {user.apellido[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white/90">
                          {user.nombre} {user.apellido}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
}

// ReactionPicker - for selecting a reaction
interface ReactionPickerProps {
  currentUserId: string;
  existingReaction?: Reaction;
  onReact: (tipo: ReactionType) => void;
}

export function ReactionPicker({
  existingReaction,
  onReact,
}: ReactionPickerProps) {
  return (
    <div className="flex items-center gap-1 rounded-full glass-card p-1">
      {Object.entries(reactionIcons).map(([tipo, { icon, label, color }]) => {
        const isSelected = existingReaction?.tipo === tipo;

        return (
          <TooltipProvider key={tipo}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-8 w-8 rounded-full transition-transform hover:scale-110',
                    isSelected && 'ring-1 ring-orange bg-orange/20'
                  )}
                  onClick={() => onReact(tipo as ReactionType)}
                >
                  <motion.span
                    whileTap={{ scale: 1.2 }}
                    className={cn('flex items-center', isSelected ? color : 'text-white/60')}
                  >
                    {icon}
                  </motion.span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="glass-card bg-[#1E2245] text-white">
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
