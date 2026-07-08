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
import { LogOut, User, Menu, ChevronDown } from 'lucide-react';

interface NavbarProps {
  // Opcional: si tienes un sidebar, conecta este callback para abrirlo/cerrarlo.
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuthStore();

  const getRolLabel = (rol: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrador',
      ceo: 'CEO',
      director_proyecto: 'Director de Proyecto',
      asistente_gerencia: 'Asistente de Gerencia',
      empleado: 'Colaborador',
    };
    return roles[rol] || 'Colaborador';
  };

  return (
    <header
      className="sticky top-0 z-50 flex h-14 items-center justify-between px-4 sm:px-6"
      style={{
        // Degradado igual a la referencia: azul muy oscuro a la izquierda que se aclara
        // hacia la derecha, con un "glow" radial suave para el brillo central.
        background: `
          radial-gradient(560px circle at 72% 40%, rgba(130,160,255,0.35), transparent 60%),
          linear-gradient(90deg, #05081C 0%, #0E1440 26%, #1B2657 50%, #2C3F8C 74%, #3D56D6 100%)
        `,
      }}
    >
      {/* Izquierda: ícono de menú + mensaje de bienvenida */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Abrir menú"
          className="text-white/90 hover:text-white transition-colors flex-shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-sm text-white truncate">
          Bienvenido{' '}
          <span className="font-bold">
            {user?.nombre?.toUpperCase()} {user?.apellido?.toUpperCase()}
          </span>{' '}
          <span className="text-white/70">( {getRolLabel(user?.rol || 'empleado')} )</span>
        </p>
      </div>

      {/* Derecha: avatar + email + flecha, todo en un solo trigger de dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 text-white hover:bg-white/10 flex-shrink-0"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.foto} alt={user?.nombre} />
              <AvatarFallback className="bg-white text-[#1E2245]">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/90 hidden sm:inline">{user?.email}</span>
            <ChevronDown className="h-4 w-4 text-white/70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#2D3163] border-[#3D4170] text-white" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-white">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-xs leading-none text-white/60">{user?.email}</p>
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
    </header>
  );
}