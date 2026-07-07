import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Settings,
  Users,
  Bell,
  FileText,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const userNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Notificaciones', href: '/notificaciones', icon: Bell },
  { title: 'Hoja de Vida', href: '/hoja-de-vida', icon: FileText },
  { title: 'Actividades Proyectos', href: '/actividades-proyectos', icon: Briefcase },
];

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Notificaciones', href: '/notificaciones', icon: Bell },
  { title: 'Hoja de Vida', href: '/hoja-de-vida', icon: FileText },
  { title: 'Actividades Proyectos', href: '/actividades-proyectos', icon: Briefcase },
  { title: 'Gestión Actividades', href: '/admin/activities', icon: Settings, adminOnly: true },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const navItems = user?.rol === 'admin' ? adminNavItems : userNavItems;

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* ===== HEADER AZUL - SOLO ESTA PARTE ===== */}
      <div className="flex h-16 items-center border-b border-[#2D3163] bg-[#1E2245] px-6">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://katary360.katary.co:8088/assets/images/katary/logo-1.png"
            alt="Katary"
            className="h-10 w-10 object-contain"
          />
          <span className="text-lg font-semibold text-white">Conecta360</span>
        </Link>
      </div>

      {/* ===== RESTO DEL SIDEBAR EN BLANCO ===== */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-orange text-white shadow-lg shadow-orange/20'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange/20">
            <Users className="h-4 w-4 text-orange" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs text-gray-500">Conecta con tu equipo</p>
            <p className="text-sm font-medium text-gray-900 truncate">Conecta360</p>
          </div>
        </div>
      </div>
    </div>
  );
}