import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Settings,
  Users,
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
];

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Gestión Actividades', href: '/admin/activities', icon: Settings, adminOnly: true },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();

  const navItems = user?.rol === 'admin' ? adminNavItems : userNavItems;

  return (
    <div className="flex h-full w-64 flex-col glass-card border-r border-white/10 bg-[#1E2245]/95">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange text-white shadow-lg shadow-orange/20">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-white">Conecta360</span>
        </Link>
      </div>

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
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange/20">
            <Users className="h-4 w-4 text-orange" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs text-white/60">Conecta con tu equipo</p>
            <p className="text-sm font-medium text-white truncate">Conecta360</p>
          </div>
        </div>
      </div>
    </div>
  );
}
