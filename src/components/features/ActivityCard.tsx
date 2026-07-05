import { Activity } from '@/types';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Building,
  Users,
  Lock,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface ActivityCardProps {
  activity: Activity;
  isParticipating?: boolean;
  onParticipate?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

// Default placeholder image for activities
const defaultActivityImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop';

export function ActivityCard({
  activity,
  isParticipating = false,
  onParticipate,
  onCancel,
  showActions = false,
}: ActivityCardProps) {
  const isFull = activity.cupos && activity.inscritos.length >= activity.cupos;
  const isDisabled = activity.obligatorio || isFull;
  const imageUrl = activity.imagen || defaultActivityImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-w-0"
    >
      <div className="card-full-bleed group">
        {/* Background image */}
        <img
          src={imageUrl}
          alt={activity.nombre}
          className="card-full-bleed-image"
        />

        {/* Gradient overlay */}
        <div className="card-full-bleed-overlay" />

        {/* Obligatory badge at top right */}
        {activity.obligatorio && (
          <div className="absolute top-4 right-4">
            <span className="card-badge card-badge-orange">
              <Lock className="h-3.5 w-3.5 mr-1" />
              Obligatoria
            </span>
          </div>
        )}

        {/* Content overlay at bottom */}
        <div className="card-full-bleed-content">
          {/* Category badge */}
          <span className="card-badge">
            {activity.categoria}
          </span>

          {/* Title */}
          <h3 className="card-title line-clamp-1">
            {activity.nombre}
          </h3>

          {/* Metadata pills row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="card-pill">
              <Calendar className="h-3 w-3" />
              {format(new Date(activity.fecha), "d MMM", { locale: es })}
            </span>
            <span className="card-pill">
              <Clock className="h-3 w-3" />
              {activity.hora}
            </span>
            <span className="card-pill">
              {activity.modalidad === 'virtual' ? (
                <Video className="h-3 w-3" />
              ) : (
                <Building className="h-3 w-3" />
              )}
              <span className="capitalize truncate max-w-[80px]">{activity.modalidad}</span>
            </span>
            {activity.cupos && (
              <span className={`card-pill ${isFull ? 'bg-red-500/20 border-red-400/30' : ''}`}>
                <Users className="h-3 w-3" />
                {activity.inscritos.length}/{activity.cupos}
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{activity.lugar}</span>
          </div>

          {/* Action button */}
          {showActions && (
            <div className="mt-2">
              {activity.obligatorio ? (
                <div className="card-btn-white flex items-center justify-center gap-2 opacity-90">
                  <Lock className="h-4 w-4" />
                  Asistencia Obligatoria
                </div>
              ) : isParticipating ? (
                <button
                  className="card-btn-destructive"
                  onClick={onCancel}
                >
                  Cancelar Participación
                </button>
              ) : (
                <button
                  className="card-btn-orange"
                  disabled={isDisabled || false}
                  onClick={onParticipate}
                  style={{ opacity: isDisabled ? 0.6 : 1 }}
                >
                  {isFull ? 'Cupos Agotados' : 'Participaré'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Admin Activity Card for management (keeps glass style for admin panel)
interface AdminActivityCardProps {
  activity: Activity;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onDraft?: () => void;
}

export function AdminActivityCard({
  activity,
  onEdit,
  onDelete,
  onPublish,
  onDraft,
}: AdminActivityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="group overflow-hidden transition-all hover:shadow-2xl glass-card">
        <div className="flex items-center gap-4 p-4">
          {activity.imagen ? (
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={activity.imagen}
                alt={activity.nombre}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white/10 border border-white/10">
              <Calendar className="h-8 w-8 glass-text-muted" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`card-badge text-xs ${activity.estado === 'publicada' ? 'card-badge-orange' : ''}`}>
                {activity.estado === 'publicada' ? 'Publicada' : 'Borrador'}
              </span>
              <span className="card-badge text-xs">
                {activity.categoria}
              </span>
            </div>
            <h3 className="font-semibold truncate text-white">{activity.nombre}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(activity.fecha), "d MMM yyyy", { locale: es })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {activity.hora}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {activity.inscritos.length}
                {activity.cupos && ` / ${activity.cupos}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-sm glass-icon-btn rounded-md"
              onClick={onEdit}
            >
              Editar
            </button>
            {activity.estado === 'publicada' ? (
              <button
                className="px-3 py-1.5 text-sm card-badge cursor-pointer hover:bg-white/20 transition-colors"
                onClick={onDraft}
              >
                Borrador
              </button>
            ) : (
              <button
                className="px-3 py-1.5 text-sm card-btn-orange"
                onClick={onPublish}
              >
                Publicar
              </button>
            )}
            <button
              className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded-md hover:bg-red-500/30 transition-colors"
              onClick={onDelete}
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
