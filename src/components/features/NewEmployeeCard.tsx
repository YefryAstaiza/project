import { NewEmployee } from '@/types';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { AnimatedAvatar } from '@/components/shared/AnimatedAvatar';

interface NewEmployeeCardProps {
  employee: NewEmployee;
}

export function NewEmployeeCard({ employee }: NewEmployeeCardProps) {
  const { user } = employee;
  const initials = `${user.nombre[0]}${user.apellido[0]}`;

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
            {/* Avatar animado - contenedor con tamaño fijo */}
            <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
              <AnimatedAvatar 
                initials={initials}
                size={64}
                colors={['#E85A1A', '#2DB87A', '#3B82F6', '#F59E0B']}
                imageUrl={user.foto}
              />
            </div>

            {/* Badge NUEVO - FUERA del contenedor del canvas */}
            <div className="absolute -top-1 left-12 z-50 bg-[#2DB87A] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-[#1E2245] uppercase tracking-[0.5px] shadow-lg">
              NUEVO
            </div>

            {/* Name block */}
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="text-white font-semibold text-base leading-tight line-clamp-1">
                {user.nombre} {user.apellido}
              </h3>
              <p className="text-sm mt-0.5 line-clamp-1" style={{ color: '#9499BB' }}>
                {user.cargo}
              </p>
            </div>
          </div>
        </div>

        {/* Cuerpo de la tarjeta - estilo claro */}
        <div className="px-4 py-3 bg-white">
          {/* Tags row - carrera y seniority */}
          <div className="flex flex-wrap gap-2">
            <span className="card-tag-neutral">
              {user.carrera}
            </span>
            <span className="card-tag-level">
              {user.seniority}
            </span>
          </div>

          {/* Comment box - mensaje de bienvenida */}
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

          {/* Reacciones de bienvenida */}
          <div className="flex items-center gap-1 mt-3">
            <span className="text-sm">👏</span>
            <span className="text-sm">👏</span>
            <span className="text-sm">👏</span>
          </div>

          {/* Date row y botón ocultar */}
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