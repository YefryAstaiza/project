import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Settings,
  Users,
  Bell,
  FileText,
  Briefcase,
  ChevronLeft,
  ChevronRight,
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

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
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

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { user } = useAuthStore();
  const location = useLocation();

  const navItems = user?.rol === 'admin' ? adminNavItems : userNavItems;

  return (
    <div 
      className={cn(
        'flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* ===== HEADER AZUL CON LOGO ===== */}
      <div className={cn(
        'flex h-16 items-center border-b border-[#2D3163] bg-[#1E2245]',
        collapsed ? 'justify-center px-2' : 'px-4'
      )}>
        <Link to="/" className={cn(
          'flex items-center gap-2',
          collapsed ? 'justify-center' : ''
        )}>
          <img
            src="https://katary360.katary.co:8088/assets/images/katary/logo-1.png"
            alt="Katary"
            className="h-10 w-10 object-contain flex-shrink-0"
          />
          {!collapsed && (
            <span className="text-lg font-semibold text-white">Conecta360</span>
          )}
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
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  collapsed && 'justify-center px-2'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* ===== FOOTER CON BOTÓN COLAPSAR ===== */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            collapsed && 'justify-center px-2'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 flex-shrink-0" />
              <span>Colapsar</span>
            </>
          )}
        </button>

        {!collapsed && (
          <div className="mt-3 pt-3 border-t border-gray-200">
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
        )}
      </div>
    </div>
  );
}