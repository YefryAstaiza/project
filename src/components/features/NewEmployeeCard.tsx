import { NewEmployee } from '@/types';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { AnimatedAvatar } from '@/components/shared/AnimatedAvatar';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { useState } from 'react';

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

export function NewEmployeeCard({ employee }: NewEmployeeCardProps) {
  const { user } = useAuthStore();
  const appStore = useAppStore();
  const { user: employeeUser } = employee;
  const initials = `${employeeUser.nombre[0]}${employeeUser.apellido[0]}`;
  const [showPicker, setShowPicker] = useState(false);

  // Obtener reacciones de este nuevo empleado
  const reactions = appStore.getNewEmployeeReactions(employee.id);
  const userReaction = reactions.find((r) => r.userId === user?.id);

  // Contar reacciones por tipo
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.tipo] = (acc[r.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleReaction = (emoji: '👋' | '🎉' | '🔥' | '🤝') => {
    if (!user) return;
    
    if (userReaction?.tipo === emoji) {
      // Si ya tiene esta reacción, la elimina
      appStore.removeNewEmployeeReaction(employee.id, user.id);
    } else {
      // Agrega o cambia la reacción
      appStore.addNewEmployeeReaction(employee.id, user.id, emoji);
    }
    setShowPicker(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-w-0"
    >
      <div className="bg-[#2D3163] border border-[#3D4170] rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden h-full flex flex-col">
        {/* Cabecera azul para el avatar y badge */}
        <div className="relative px-4 pt-4 pb-0" style={{ background: '#1E2245' }}>
          <div className="flex items-start gap-4">
            {/* Avatar animado */}
            <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
              <AnimatedAvatar 
                initials={initials}
                size={64}
                colors={['#E85A1A', '#2DB87A', '#3B82F6', '#F59E0B']}
                imageUrl={employeeUser.foto}
              />
            </div>

            {/* Badge NUEVO */}
            <div className="absolute -top-1 left-12 z-50 bg-[#2DB87A] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-[#1E2245] uppercase tracking-[0.5px] shadow-lg">
              NUEVO
            </div>

            {/* Name block */}
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="text-white font-semibold text-base leading-tight line-clamp-1">
                {employeeUser.nombre} {employeeUser.apellido}
              </h3>
              <p className="text-sm mt-0.5 line-clamp-1" style={{ color: '#9499BB' }}>
                {employeeUser.cargo}
              </p>
            </div>
          </div>
        </div>

        {/* Cuerpo de la tarjeta */}
        <div className="px-4 py-3 bg-white">
          {/* Tags row */}
          <div className="flex flex-wrap gap-2">
            <span className="card-tag-neutral">
              {employeeUser.carrera}
            </span>
            <span className="card-tag-level">
              {employeeUser.seniority}
            </span>
          </div>

          {/* Comment box */}
          {employee.comentario && (
            <div className="mt-3">
              <p className="text-sm text-[#5A5F80] italic leading-relaxed">
                "{employee.comentario}"
              </p>
            </div>
          )}

          {/* Hobbies */}
          {employee.hobbies && employee.hobbies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {employee.hobbies.map((hobby) => (
                <span
                  key={hobby}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4F5FA] border border-[#E4E6F0] text-[#5A5F80]"
                >
                  {hobby}
                </span>
              ))}
            </div>
          )}

          {/* Reacciones */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {/* Mostrar reacciones existentes */}
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <span
                key={emoji}
                className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border ${
                  userReaction?.tipo === emoji
                    ? 'bg-[#FEF0EA] border-[#E85A1A]/30 text-[#C03510]'
                    : 'bg-[#F4F5FA] border-[#E4E6F0] text-[#5A5F80]'
                }`}
              >
                <span>{emoji}</span>
                <span className="font-bold">{count}</span>
              </span>
            ))}

            {/* Botón Reaccionar */}
            <div className="relative">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#F4F5FA] text-[#5A5F80] hover:bg-[#FEF0EA] transition-colors border border-[#E4E6F0]"
              >
                <span>😊</span>
                <span>Reaccionar</span>
              </button>

              {/* Picker de reacciones */}
              {showPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-50 bg-white border border-[#E4E6F0] rounded-2xl shadow-xl p-1.5 flex gap-0.5">
                  {REACTION_OPTIONS.map((option) => (
                    <button
                      key={option.emoji}
                      onClick={() => handleReaction(option.emoji as any)}
                      className={`flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl transition-all hover:bg-[#F4F5FA] hover:scale-110 min-w-[44px] ${
                        userReaction?.tipo === option.emoji ? 'bg-[#FEF0EA]' : ''
                      }`}
                    >
                      <span className="text-xl">{option.emoji}</span>
                      <span className="text-[8px] font-bold text-[#B0B4CC] text-center leading-tight">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0F2FA]">
            <span className="text-xs" style={{ color: 'var(--muted-text)' }}>
              <Calendar className="h-3 w-3 inline mr-1.5" />
              {format(new Date(employee.fechaPublicacion), "d 'de' MMMM, yyyy", { locale: es })}
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
    </motion.div>
  );
}