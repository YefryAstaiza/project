import { News } from '@/types';
import { Calendar, Gift, Baby, Award, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface NewsCardProps {
  news: News;
}

const typeConfig = {
  cumpleanos: {
    icon: Gift,
    label: 'Cumpleaños',
  },
  nacimiento: {
    icon: Baby,
    label: 'Nacimiento',
  },
  logro: {
    icon: Award,
    label: 'Logro',
  },
  noticia: {
    icon: Bell,
    label: 'Noticia',
  },
};

// Default placeholder images by type
const defaultImages: Record<string, string> = {
  cumpleanos: 'https://images.unsplash.com/photo-1558636508-e0db3814d1a8?w=600&h=400&fit=crop',
  nacimiento: 'https://images.unsplash.com/photo-1515488042675-83e9c6bebbde?w=600&h=400&fit=crop',
  logro: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=400&fit=crop',
  noticia: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop',
};

export function NewsCard({ news }: NewsCardProps) {
  const config = typeConfig[news.tipo];
  const Icon = config.icon;
  const imageUrl = news.imagen || defaultImages[news.tipo];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-w-0"
    >
      <div className={`card-full-bleed group`}>
        {/* Background image */}
        <img
          src={imageUrl}
          alt={news.titulo}
          className="card-full-bleed-image"
        />

        {/* Gradient overlay */}
        <div className="card-full-bleed-overlay" />

        {/* Content overlay at bottom */}
        <div className="card-full-bleed-content">
          {/* Top row: badge + date */}
          <div className="flex items-center justify-between gap-2">
            <span className="card-badge">
              <Icon className="h-3.5 w-3.5" />
              {config.label}
            </span>
            <span className="card-pill">
              <Calendar className="h-3 w-3" />
              {format(new Date(news.fecha), 'd MMM', { locale: es })}
            </span>
          </div>

          {/* Title */}
          <h3 className="card-title line-clamp-2">
            {news.titulo}
          </h3>

          {/* Description */}
          <p className="card-description line-clamp-2">
            {news.descripcion}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
