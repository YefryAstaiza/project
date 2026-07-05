import { useState } from 'react';
import { NewEmployee } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { toast } from 'sonner';

interface NewEmployeeCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: NewEmployee;
}

export function NewEmployeeCommentDialog({
  open,
  onOpenChange,
  employee,
}: NewEmployeeCommentDialogProps) {
  const appStore = useAppStore();
  const [comentario, setComentario] = useState(employee.comentario || '');

  const handleSave = () => {
    if (comentario.length > 200) {
      toast.error('El comentario no puede exceder 200 caracteres');
      return;
    }

    appStore.updateNewEmployeeComment(employee.userId, comentario);
    toast.success('Comentario actualizado correctamente');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-corporative-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy">
            <MessageCircle className="h-5 w-5 text-orange" />
            Deja aquí un comentario
          </DialogTitle>
          <DialogDescription>
            Escribe un mensaje de bienvenida para tus nuevos compañeros (máximo 200 caracteres).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value.slice(0, 200))}
              maxLength={200}
              rows={4}
              placeholder="¡Hola! Feliz de ser parte del equipo..."
              className="border-corporative-border focus:border-orange focus:ring-orange"
            />
            <p className="text-xs text-muted-corporate text-right mt-1">
              {comentario.length}/200
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-corporative-border text-navy">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-orange hover:bg-orange-dark text-white">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
