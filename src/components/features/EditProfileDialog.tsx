import { useState } from 'react';
import { ProfileCard as ProfileCardType, Hobby } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Camera, X, Plus, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { toast } from 'sonner';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileCard: ProfileCardType;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profileCard,
}: EditProfileDialogProps) {
  const appStore = useAppStore();

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showPhotoRules, setShowPhotoRules] = useState(false);
  const [hobbies, setHobbies] = useState<Hobby[]>(profileCard.hobbies);

  const availableHobbies = appStore.hobbies.filter(
    (h) => !hobbies.some((eh) => eh.id === h.id)
  );

  const handlePhotoClick = () => {
    setShowPhotoRules(true);
  };

  const handleAcceptPhotoRules = () => {
    setShowPhotoRules(false);
    // Simulate file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedPhoto(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAddHobby = (hobby: Hobby) => {
    if (hobbies.length >= 5) {
      toast.error('Máximo 5 hobbies permitidos');
      return;
    }
    setHobbies([...hobbies, hobby]);
  };

  const handleRemoveHobby = (hobbyId: string) => {
    if (hobbies.length <= 1) {
      toast.error('Debes tener al menos 1 hobby');
      return;
    }
    setHobbies(hobbies.filter((h) => h.id !== hobbyId));
  };

  const handleSave = () => {
    if (selectedPhoto) {
      appStore.updateProfilePhoto(profileCard.id, selectedPhoto);
    }
    hobbies.forEach((h) => {
      if (!profileCard.hobbies.some((eh) => eh.id === h.id)) {
        appStore.addHobbyToCard(profileCard.id, h);
      }
    });
    profileCard.hobbies.forEach((h) => {
      if (!hobbies.some((eh) => eh.id === h.id)) {
        appStore.removeHobbyFromCard(profileCard.id, h.id);
      }
    });

    toast.success('Perfil actualizado correctamente');
    onOpenChange(false);
  };

  const initials = `${profileCard.user.nombre[0]}${profileCard.user.apellido[0]}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white border-corporative-border">
        <DialogHeader>
          <DialogTitle className="text-navy">Editar Mi Tarjeta</DialogTitle>
          <DialogDescription>
            Personaliza tu tarjeta de perfil en Conecta360
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Photo Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-2 ring-orange/30 ring-offset-2">
                <AvatarImage
                  src={selectedPhoto || profileCard.foto}
                  alt={`${profileCard.user.nombre} ${profileCard.user.apellido}`}
                />
                <AvatarFallback className="text-2xl bg-navy2 text-white">{initials}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-orange text-white hover:bg-orange-dark"
                onClick={handlePhotoClick}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-corporate text-center">
              Haz clic en el icono de cámara para cambiar tu foto
            </p>
          </div>

          <Separator className="bg-corporative-border" />

          {/* Hobbies Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-navy">Mis Hobbies</Label>
              <span className="text-xs text-muted-corporate">
                {hobbies.length}/5 hobbies
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {hobbies.map((hobby) => (
                <Badge
                  key={hobby.id}
                  variant="secondary"
                  className="gap-1 py-1.5 pr-1 bg-navy2/10 text-navy2"
                >
                  {hobby.icono && <span>{hobby.icono}</span>}
                  {hobby.nombre}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-1 h-4 w-4 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveHobby(hobby.id)}
                    disabled={hobbies.length <= 1}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>

            {hobbies.length < 5 && availableHobbies.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-corporate">
                  Agregar hobbies
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {availableHobbies.slice(0, 10).map((hobby) => (
                    <Button
                      key={hobby.id}
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-xs border-corporative-border text-navy hover:border-orange hover:text-orange"
                      onClick={() => handleAddHobby(hobby)}
                    >
                      <Plus className="h-3 w-3" />
                      {hobby.icono && <span>{hobby.icono}</span>}
                      {hobby.nombre}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-corporative-border text-navy">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-orange hover:bg-orange-dark text-white">Guardar Cambios</Button>
        </DialogFooter>

        {/* Photo Rules Dialog */}
        <Dialog open={showPhotoRules} onOpenChange={setShowPhotoRules}>
          <DialogContent className="sm:max-w-md bg-white border-corporative-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-navy">
                <AlertCircle className="h-5 w-5 text-orange" />
                Lineamientos para tu Foto de Perfil
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4 text-sm text-navy">
              <p>Tu foto debe ser tipo retrato (de la cara hasta el pecho), mostrando únicamente al colaborador.</p>
              <Separator className="bg-corporative-border" />
              <div className="space-y-2">
                <p className="font-medium text-destructive">No se permiten:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Otras personas, menores o mascotas</li>
                  <li>Objetos que cubran el rostro</li>
                  <li>Contenido ofensivo, obsceno o inapropiado</li>
                </ul>
              </div>
              <Separator className="bg-corporative-border" />
              <div className="space-y-2">
                <p className="font-medium text-navy">Formato permitido:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>JPG o PNG</li>
                  <li>Imagen clara y profesional</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPhotoRules(false)} className="border-corporative-border text-navy">
                Cancelar
              </Button>
              <Button onClick={handleAcceptPhotoRules} className="bg-orange hover:bg-orange-dark text-white">
                Aceptar y Seleccionar Foto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
