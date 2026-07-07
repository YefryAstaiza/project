import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Mail, ArrowRight, MessageSquare, CalendarCheck, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const users = useAppStore((state) => state.users);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      setError('Usuario no encontrado. Prueba con: admin@empresa.com');
      return;
    }

    login(user);
    navigate('/');
  };

  const quickLogin = (role: string) => {
    const user = users.find((u) => u.rol === role);
    if (user) {
      login(user);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#12142e]">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1E2245] to-[#0d0e22]">
        {/* circuit-style background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.15]"
          viewBox="0 0 600 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <g stroke="#FF7A3D" strokeWidth="1" fill="none">
            <path d="M0 100 H180 V220 H400" />
            <path d="M0 350 H120 V500 H320 V650" />
            <path d="M600 150 H420 V300 H250" />
            <path d="M600 550 H480 V680 H260" />
          </g>
          <g fill="#FF7A3D">
            <circle cx="180" cy="100" r="4" />
            <circle cx="400" cy="220" r="4" />
            <circle cx="120" cy="350" r="4" />
            <circle cx="320" cy="500" r="4" />
            <circle cx="420" cy="150" r="4" />
            <circle cx="250" cy="300" r="4" />
            <circle cx="480" cy="550" r="4" />
            <circle cx="260" cy="650" r="4" />
          </g>
        </svg>

        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
  <img 
    src="https://katary360.katary.co:8088/assets/images/katary/logo-1.png" 
    className="h-24 w-24 object-contain" 
    alt="Katary" 
  />
</div>

            <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
              Conecta<span className="text-orange">360</span>
            </h1>
            <p className="text-white/60 text-lg mt-4 max-w-md">
              Todo tu equipo, sus tareas y su comunicación en un solo lugar.
            </p>

            <div className="mt-12 space-y-5">
              {[
                { icon: MessageSquare, text: 'Comunicación centralizada por proyecto' },
                { icon: CalendarCheck, text: 'Seguimiento de tareas en tiempo real' },
                { icon: TrendingUp, text: 'Visibilidad total del progreso del equipo' },
              ].map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 border border-white/10 shrink-0">
                    <Icon className="h-4 w-4 text-orange" />
                  </div>
                  <span className="text-white/80 text-sm">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-glass-scene relative">
        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8 lg:hidden">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange mb-4 shadow-lg shadow-orange/30"
              >
                <Users className="h-8 w-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold tracking-tight text-black">Conecta360</h1>
              <p className="text-black/70 mt-2">Conecta con tu equipo de trabajo</p>
            </div>

            <div className="glass-card p-6 space-y-6">
              <div className="space-y-1 pb-2 border-b border-white/10">
                <h2 className="text-2xl font-semibold text-black">Iniciar sesión</h2>
                <p className="text-black/60">Ingresa tu correo electrónico para continuar</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black/80">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@empresa.com"
                      className="pl-9 border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-orange focus:ring-orange"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                <Button type="submit" className="w-full action-btn-solid">
                  Ingresar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#1E2245] px-2 text-white/60">Acceso rápido</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('admin')}
                  className="glass-icon-btn text-black/80 hover:text-white"
                >
                  Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('ceo')}
                  className="glass-icon-btn text-black/80 hover:text-white"
                >
                  CEO
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('director_proyecto')}
                  className="glass-icon-btn text-black/80 hover:text-white"
                >
                  Director
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('empleado')}
                  className="glass-icon-btn text-black/80 hover:text-white"
                >
                  Empleado
                </Button>
              </div>
            </div>

            <p className="text-center text-xs text-white/50 mt-6">
              Demo: Usa cualquier correo del sistema o los botones de acceso rápido
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}