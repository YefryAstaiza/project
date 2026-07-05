import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const users = useAppStore((state) => state.users);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Find user by email
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
    <div className="min-h-screen flex items-center justify-center bg-glass-scene p-4">
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange mb-4 shadow-lg shadow-orange/30"
            >
              <Users className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Conecta360</h1>
            <p className="text-white/70 mt-2">
              Conecta con tu equipo de trabajo
            </p>
          </div>

          <div className="glass-card p-6 space-y-6">
            <div className="space-y-1 pb-2 border-b border-white/10">
              <h2 className="text-2xl font-semibold text-white">Iniciar Sesión</h2>
              <p className="text-white/60">
                Ingresa tu correo electrónico para continuar
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Correo electrónico</Label>
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
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
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
                <span className="bg-[#1E2245] px-2 text-white/60">
                  Acceso rápido
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('admin')}
                className="glass-icon-btn text-white/80 hover:text-white"
              >
                Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('ceo')}
                className="glass-icon-btn text-white/80 hover:text-white"
              >
                CEO
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('director_proyecto')}
                className="glass-icon-btn text-white/80 hover:text-white"
              >
                Director
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin('empleado')}
                className="glass-icon-btn text-white/80 hover:text-white"
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
  );
}
