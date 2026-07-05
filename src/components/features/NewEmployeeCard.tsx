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
      <div className="card-new-employee">
        {/* Top row: Avatar + name block */}
        <div className="flex items-start gap-3">
          {/* Avatar with initials */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
               style={{ background: 'var(--orange)' }}>
            {initials}
          </div>

          {/* Name block */}
          <div className="flex-1 min-w-0">
            {/* New badge */}
            <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white mb-1"
                 style={{ background: 'var(--orange)' }}>
              NUEVO
            </div>

            {/* Name */}
            <h3 className="text-white font-semibold text-base leading-tight line-clamp-1">
              {user.nombre} {user.apellido}
            </h3>

            {/* Role */}
            <p className="text-sm mt-0.5 line-clamp-1" style={{ color: 'var(--muted-text)' }}>
              {user.cargo}
            </p>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="card-tag-neutral">
            {user.carrera}
          </span>
          <span className="card-tag-level">
            {user.seniority}
          </span>
        </div>

        {/* Date row */}
        <div className="flex items-center gap-1.5 mt-3 text-xs"
             style={{ color: 'var(--muted-text)' }}>
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>
            Publicado {format(new Date(employee.fechaPublicacion), "d 'de' MMMM, yyyy", { locale: es })}
          </span>
        </div>

        {/* Comment box - anchored to bottom */}
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
    </motion.div>
  );
}
