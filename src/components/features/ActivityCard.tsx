import { Activity } from '@/types';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Building,
  Users,
  Lock,
  User,
  CheckCircle,
  XCircle,
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

// Imágenes profesionales por categoría
const categoryImages: Record<string, string> = {
  Deporte: 'https://images.unsplash.com/photo-1517649281201-d68a607a4fc9?w=800&h=500&fit=crop&crop=center',
  Música: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=500&fit=crop&crop=center',
  Arte: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=500&fit=crop&crop=center',
  Gastronomía: 'https://images.unsplash.com/photo-1556911220-bda9f7f7597e?w=800&h=500&fit=crop&crop=center',
  Bienestar: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=500&fit=crop&crop=center',
  'Bienestar Laboral': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=500&fit=crop&crop=center',
  Aventura: 'https://images.unsplash.com/photo-1503264116251-35a269479413?w=800&h=500&fit=crop&crop=center',
  Juegos: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800&h=500&fit=crop&crop=center',
  Social: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&h=500&fit=crop&crop=center',
  Tecnología: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=500&fit=crop&crop=center',
  Reunión: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=500&fit=crop&crop=center',
  Negocios: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop&crop=center',
  Educacion: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop&crop=center',
};

const defaultActivityImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop&crop=center';

export function ActivityCard({
  activity,
  isParticipating = false,
  onParticipate,
  onCancel,
  showActions = false,
}: ActivityCardProps) {
  const isFull = activity.cupos && activity.inscritos.length >= activity.cupos;
  const isDisabled = activity.obligatorio || isFull;
  const availableSpots = activity.cupos ? activity.cupos - activity.inscritos.length : 0;
  const isAvailable = availableSpots > 0;
  
  const imageUrl = activity.imagen || categoryImages[activity.categoria] || defaultActivityImage;

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d 'de' MMMM", { locale: es });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-w-0 h-full"
    >
      <div className="group bg-white border border-[#E4E6F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Imagen con overlay profesional */}
        <div className="relative h-48 flex-shrink-0 overflow-hidden bg-gradient-to-r from-[#1E2245] to-[#303C72]">
          <img
            src={imageUrl}
            alt={activity.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultActivityImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Badge de disponibilidad */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            {activity.obligatorio && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E85A1A] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                <Lock className="h-3 w-3" />
                Obligatoria
              </span>
            )}
            {activity.cupos && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-lg ${
                isFull 
                  ? 'bg-red-500 text-white' 
                  : isAvailable 
                    ? 'bg-[#2DB87A] text-white'
                    : 'bg-yellow-500 text-white'
              }`}>
                {isFull ? (
                  <>
                    <XCircle className="h-3 w-3" />
                    Completos
                  </>
                ) : isAvailable ? (
                  <>
                    <User className="h-3 w-3" />
                    {availableSpots} cupos
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    Por definir
                  </>
                )}
              </span>
            )}
          </div>

          {/* Categoría en la parte inferior izquierda */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
              {activity.categoria}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Título y fecha */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-[#1E2245] text-lg leading-tight line-clamp-1 flex-1">
              {activity.nombre}
            </h3>
            <span className="text-xs font-bold text-[#9499BB] whitespace-nowrap">
              {formatDate(activity.fecha)}
            </span>
          </div>

          {/* Metadata en grid para mejor organización */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#F4F5FA]">
                <Clock className="h-3.5 w-3.5 text-[#9499BB]" />
              </div>
              <span className="text-sm font-semibold text-[#1E2245]">
                {activity.hora}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#F4F5FA]">
                {activity.modalidad === 'virtual' ? (
                  <Video className="h-3.5 w-3.5 text-[#9499BB]" />
                ) : (
                  <Building className="h-3.5 w-3.5 text-[#9499BB]" />
                )}
              </div>
              <span className="text-sm font-semibold text-[#1E2245] capitalize">
                {activity.modalidad}
              </span>
            </div>
          </div>

          {/* Lugar con ícono */}
          <div className="flex items-center gap-2 mt-2">
            <MapPin className="h-4 w-4 text-[#9499BB] flex-shrink-0" />
            <span className="text-sm text-[#5A5F80] truncate font-medium">
              {activity.lugar}
            </span>
          </div>

          {/* Participantes */}
          {activity.cupos && (
            <div className="flex items-center gap-2 mt-2">
              <Users className="h-4 w-4 text-[#9499BB] flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9499BB] font-medium">
                    {activity.inscritos.length} inscritos
                  </span>
                  <span className="text-[#9499BB] font-medium">
                    {activity.cupos} cupos totales
                  </span>
                </div>
                {/* Barra de progreso */}
                <div className="w-full h-1.5 bg-[#F4F5FA] rounded-full mt-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFull ? 'bg-red-500' : 'bg-[#E85A1A]'
                    }`}
                    style={{ width: `${Math.min((activity.inscritos.length / activity.cupos) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Botón de acción */}
          {showActions && (
            <div className="mt-4 pt-4 border-t border-[#F0F2FA]">
              {activity.obligatorio ? (
                <div className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1E2245] to-[#303C72] text-white text-sm font-bold flex items-center justify-center gap-2">                  <Lock className="h-4 w-4" />
                  Asistencia Obligatoria
                </div>
              ) : isParticipating ? (
                <button
                  className="w-full py-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors border border-red-200 flex items-center justify-center gap-2"
                  onClick={onCancel}
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar Participación
                </button>
              ) : (
                <button
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
  isFull && activity.cupos
    ? 'bg-[#F4F5FA] text-[#9499BB] cursor-not-allowed'
    : 'bg-gradient-to-r from-[#1E2245] to-[#303C72] hover:from-[#171B36] hover:to-[#27325F] text-white shadow-sm hover:shadow-md'
}`}
                  disabled={isFull}
                  onClick={onParticipate}
                >
                  {isFull ? (
                    <>
                      <XCircle className="h-4 w-4" />
                      Cupos Agotados
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Participaré
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Admin Activity Card
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
  const imageUrl = activity.imagen || categoryImages[activity.categoria] || defaultActivityImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="group overflow-hidden transition-all hover:shadow-2xl bg-white border border-[#E4E6F0] rounded-2xl">
        <div className="flex items-center gap-4 p-4">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
            <img
              src={imageUrl}
              alt={activity.nombre}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultActivityImage;
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activity.estado === 'publicada' 
                  ? 'bg-[#E8F8F0] text-[#1A9960]' 
                  : 'bg-[#F4F5FA] text-[#9499BB]'
              }`}>
                {activity.estado === 'publicada' ? '● Publicada' : '○ Borrador'}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F4F5FA] text-[#5A5F80]">
                {activity.categoria}
              </span>
            </div>
            <h3 className="font-semibold truncate text-[#1E2245]">{activity.nombre}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#9499BB] mt-1">
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
className="px-3 py-1.5 text-sm bg-[#1E2245] text-white rounded-xl hover:bg-[#171B36] transition-colors font-bold"              onClick={onEdit}
            >
              Editar
            </button>
            {activity.estado === 'publicada' ? (
              <button
                className="px-3 py-1.5 text-sm bg-[#F4F5FA] text-[#9499BB] rounded-xl hover:bg-[#E4E6F0] transition-colors font-bold"
                onClick={onDraft}
              >
                Borrador
              </button>
            ) : (
              <button
                className="px-3 py-1.5 text-sm bg-[#E85A1A] text-white rounded-xl hover:bg-[#C03510] transition-colors font-bold"
                onClick={onPublish}
              >
                Publicar
              </button>
            )}
            <button
  className="px-3 py-1.5 text-sm font-bold rounded-xl bg-gradient-to-r from-[#1E2245] to-[#303C72] hover:from-[#171B36] hover:to-[#27325F] text-white transition-all duration-300 shadow-sm hover:shadow-md"
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