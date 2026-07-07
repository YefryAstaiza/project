import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, LogOut, Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const initials = user
    ? `${user.nombre[0]}${user.apellido[0]}`
    : 'UN';

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-[#2D3163] bg-[#1E2245] px-4">
      <div className="flex flex-1 items-center justify-end gap-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-white/70 hover:text-white hover:bg-white/10 border-0"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-white/70 hover:text-white hover:bg-white/10 border-0">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E85A1A] text-[10px] font-medium text-white border border-[#E85A1A]/30">
            3
          </span>
          <span className="sr-only">Notificaciones</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 gap-2 px-2 text-white/90 hover:text-white hover:bg-white/10">
              <Avatar className="h-8 w-8 ring-2 ring-[#E85A1A]/30">
                <AvatarImage src={user?.foto} alt={user?.nombre} />
                <AvatarFallback className="bg-[#E85A1A] text-xs text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-sm font-medium text-white">
                  {user?.nombre} {user?.apellido}
                </span>
                <span className="text-xs text-white/60">{user?.cargo}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#2D3163] border-[#3D4170] text-white" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-white">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs leading-none text-white/60">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#3D4170]" />
            <DropdownMenuItem className="gap-2 text-white/80 hover:text-white hover:bg-white/10 focus:text-white focus:bg-white/10">
              <User className="h-4 w-4" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#3D4170]" />
            <DropdownMenuItem
              className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}