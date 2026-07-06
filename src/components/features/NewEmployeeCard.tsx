import { NewEmployee } from '@/types';
import { Calendar, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';

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
      <div 
        className="overflow-hidden"
        style={{ 
          borderRadius: '16px',
          border: '1px solid #E4E6F0',
          background: 'white',
          boxShadow: '0 2px 8px rgba(30,34,69,0.06)',
        }}
      >
        {/* Cabecera azul para el avatar y badge */}
        <div className="relative px-4 pt-4 pb-0" style={{ background: '#1E2245' }}>
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-2xl"
                style={{ background: 'var(--orange)' }}
              >
                {initials}
              </div>
              {/* Badge NUEVO */}
              <div className="absolute -top-1 -right-1 bg-[#2DB87A] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-[#1E2245] uppercase tracking-[0.5px]">
                NUEVO
              </div>
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
          {/* Tags row */}
          <div className="flex flex-wrap gap-2">
            <span className="card-tag-neutral">
              {user.carrera}
            </span>
            <span className="card-tag-level">
              {user.seniority}
            </span>
          </div>

          {/* Date row */}
          <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: 'var(--muted-text)' }}>
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>
              Publicado {format(new Date(employee.fechaPublicacion), "d 'de' MMMM, yyyy", { locale: es })}
            </span>
          </div>

          {/* Comment box */}
          {employee.comentario && (
            <div className="card-message-box mt-auto pt-3">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--orange)' }} />
                <p className="card-message-text line-clamp-3">
                  "{employee.comentario}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}