import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { AdminActivityCard } from '@/components/features/ActivityCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Calendar, FileText, UserPlus, Trash2, RotateCcw } from 'lucide-react';
import { Activity, Modality } from '@/types';
import { toast } from 'sonner';

type CreateType = 'activity' | 'news' | 'employee';

export function AdminActivities() {
  const appStore = useAppStore();

  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'deleted'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<CreateType | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  // Activity form state
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [lugar, setLugar] = useState('');
  const [modalidad, setModalidad] = useState<Modality>('presencial');
  const [categoria, setCategoria] = useState('');
  const [cupos, setCupos] = useState<string>('');
  const [descripcion, setDescripcion] = useState('');
  const [obligatorio, setObligatorio] = useState(false);

  // News form state - field name is "Nombre" not "Título"
  const [newsNombre, setNewsNombre] = useState('');
  const [newsDescripcion, setNewsDescripcion] = useState('');
  const [newsTipo, setNewsTipo] = useState<'cumpleanos' | 'nacimiento' | 'logro' | 'noticia'>('noticia');

  // Employee selection state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Get data
  const activities = appStore.activities;
  const deletedActivities = appStore.getDeletedActivities();
  const activeUsers = appStore.getActiveUsers();

  // Filter activities - sorted from most recent to oldest
  const filteredActivities = activities
    .filter((a) => {
      if (activeTab === 'published') return a.estado === 'publicada' && !a.deletedAt;
      if (activeTab === 'draft') return a.estado === 'borrador' && !a.deletedAt;
      if (activeTab === 'deleted') return false;
      return !a.deletedAt;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Handlers
  const resetForm = () => {
    setNombre('');
    setFecha('');
    setHora('');
    setLugar('');
    setModalidad('presencial');
    setCategoria('');
    setCupos('');
    setDescripcion('');
    setObligatorio(false);
    setNewsNombre('');
    setNewsDescripcion('');
    setNewsTipo('noticia');
    setSelectedEmployeeId('');
    setEmployeeSearch('');
    setEditingActivity(null);
  };

  const handleCloseCreate = () => {
    setCreateDialogOpen(false);
    setCreateType(null);
    resetForm();
  };

  const handleCreateActivity = (publish: boolean) => {
    if (!nombre || !fecha || !hora || !lugar || !categoria || !descripcion) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validate fecha is today or future
    const selectedDate = new Date(fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error('La fecha debe ser hoy o una fecha futura');
      return;
    }

    // Validate cupos > 0 if provided
    if (cupos && parseInt(cupos) <= 0) {
      toast.error('Los cupos deben ser mayores a 0');
      return;
    }

    if (editingActivity) {
      appStore.updateActivity(editingActivity.id, {
        nombre,
        fecha,
        hora,
        lugar,
        modalidad,
        categoria,
        cupos: cupos ? parseInt(cupos) : undefined,
        descripcion,
        obligatorio,
        estado: publish ? 'publicada' : 'borrador',
      });
      toast.success('Actividad actualizada correctamente');
    } else {
      appStore.addActivity({
        nombre,
        fecha,
        hora,
        lugar,
        modalidad,
        categoria,
        cupos: cupos ? parseInt(cupos) : undefined,
        descripcion,
        obligatorio,
        estado: publish ? 'publicada' : 'borrador',
      });
      toast.success('Actividad creada correctamente');
    }

    handleCloseCreate();
  };

  const handleCreateNews = (publish: boolean) => {
    if (!newsNombre || !newsDescripcion) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    appStore.addNews({
      titulo: newsNombre,
      descripcion: newsDescripcion,
      tipo: newsTipo,
      fecha: new Date().toISOString().split('T')[0],
      estado: publish ? 'publicada' : 'borrador',
    });

    toast.success('Novedad creada correctamente');
    handleCloseCreate();
  };

  const handleCreateEmployee = () => {
    if (!selectedEmployeeId) {
      toast.error('Por favor selecciona un colaborador');
      return;
    }

    // Check if already published this week
    const existingPublish = appStore.newEmployees.find(
      (e) => e.userId === selectedEmployeeId && e.estado === 'publicada'
    );

    if (existingPublish) {
      toast.error('Este colaborador ya está publicado en Nuevos en el Equipo');
      return;
    }

    appStore.addNewEmployee(selectedEmployeeId);
    toast.success('Colaborador publicado correctamente. El propietario puede agregar un comentario desde su tarjeta.');
    handleCloseCreate();
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setNombre(activity.nombre);
    setFecha(activity.fecha);
    setHora(activity.hora);
    setLugar(activity.lugar);
    setModalidad(activity.modalidad);
    setCategoria(activity.categoria);
    setCupos(activity.cupos?.toString() || '');
    setDescripcion(activity.descripcion);
    setObligatorio(activity.obligatorio);
    setCreateType('activity');
    setCreateDialogOpen(true);
  };

  const handleDeleteActivity = (id: string) => {
    setActivityToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (activityToDelete) {
      appStore.deleteActivity(activityToDelete);
      toast.success('Actividad eliminada');
    }
    setDeleteDialogOpen(false);
    setActivityToDelete(null);
  };

  const handleRestore = (id: string) => {
    appStore.restoreActivity(id);
    toast.success('Actividad restaurada');
  };

  const handlePermanentDelete = (id: string) => {
    appStore.permanentlyDeleteActivity(id);
    toast.success('Actividad eliminada permanentemente');
  };

  const handlePublishDraft = (id: string) => {
    appStore.updateActivity(id, { estado: 'publicada' });
    toast.success('Actividad publicada');
  };

  const handleMoveToDraft = (id: string) => {
    appStore.updateActivity(id, { estado: 'borrador' });
    toast.success('Actividad movida a borrador');
  };

  // Filter employees by search - exclude users with estado 'aspirante'
  const filteredEmployees = activeUsers.filter((u) => {
    if (u.estado === 'aspirante') return false;
    if (!employeeSearch) return true;
    const fullName = `${u.nombre} ${u.apellido}`.toLowerCase();
    return fullName.includes(employeeSearch.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-glass-scene p-6 relative z-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Gestión de actividades Conecta360
            </h1>
            <p className="text-white/70 mt-1">
              Administra actividades, novedades y nuevos integrantes
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total</p>
                <p className="text-2xl font-bold text-white">
                  {activities.filter((a) => !a.deletedAt).length}
                </p>
              </div>
              <div className="p-2 rounded-lg glass-icon-btn">
                <Calendar className="h-6 w-6 text-orange" />
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Publicadas</p>
                <p className="text-2xl font-bold text-orange">
                  {activities.filter((a) => a.estado === 'publicada' && !a.deletedAt).length}
                </p>
              </div>
              <div className="p-2 rounded-lg glass-icon-btn">
                <FileText className="h-6 w-6 text-orange" />
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Borradores</p>
                <p className="text-2xl font-bold text-white/90">
                  {activities.filter((a) => a.estado === 'borrador' && !a.deletedAt).length}
                </p>
              </div>
              <div className="p-2 rounded-lg glass-icon-btn">
                <FileText className="h-6 w-6 text-white/70" />
              </div>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Papelera</p>
                <p className="text-2xl font-bold text-destructive">
                  {deletedActivities.length}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-destructive/20">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <TabsList className="glass-card bg-white/5">
              <TabsTrigger value="all" className="data-[state=active]:bg-orange data-[state=active]:text-white text-white/70">Todas</TabsTrigger>
              <TabsTrigger value="published" className="data-[state=active]:bg-orange data-[state=active]:text-white text-white/70">Publicadas</TabsTrigger>
              <TabsTrigger value="draft" className="data-[state=active]:bg-orange data-[state=active]:text-white text-white/70">Borrador</TabsTrigger>
              <TabsTrigger value="deleted" className="data-[state=active]:bg-orange data-[state=active]:text-white text-white/70">
                Papelera ({deletedActivities.length})
              </TabsTrigger>
            </TabsList>

            {/* Create Button */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="action-btn-solid">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Creación
                </Button>
              </DialogTrigger>

              {/* Create Options Dialog or Forms */}
              <DialogContent className="sm:max-w-2xl glass-card bg-[#1E2245]/95">
                {!createType ? (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-white">Nueva Creación</DialogTitle>
                      <DialogDescription className="text-white/60">
                        Selecciona el tipo de contenido que deseas crear
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-3 py-4">
                      <Button
                        variant="outline"
                        className="justify-start h-auto py-4 glass-icon-btn hover:bg-white/15"
                        onClick={() => setCreateType('activity')}
                      >
                        <div className="p-2 rounded-lg glass-icon-btn mr-3">
                          <Calendar className="h-5 w-5 text-orange" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-black">+ Novedad</p>
                          <p className="text-sm text-black/60">
                            Crea una nueva actividad o evento
                          </p>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start h-auto py-4 glass-icon-btn hover:bg-white/15"
                        onClick={() => setCreateType('news')}
                      >
                        <div className="p-2 rounded-lg glass-icon-btn mr-3">
                          <FileText className="h-5 w-5 text-orange" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-black">+ Nuevos en el equipo</p>
                          <p className="text-sm text-black/60">
                            Publica noticias, logros o cumpleaños
                          </p>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start h-auto py-4 glass-icon-btn hover:bg-white/15"
                        onClick={() => setCreateType('employee')}
                      >
                        <div className="p-2 rounded-lg glass-icon-btn mr-3">
                          <UserPlus className="h-5 w-5 text-orange" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-black">+ Actividad</p>
                          <p className="text-sm text-black/60">
                            Presenta a un nuevo colaborador
                          </p>
                        </div>
                      </Button>
                    </div>
                  </>
                ) : createType === 'activity' ? (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        {editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
                      </DialogTitle>
                      <DialogDescription className="text-white/60">
                        Publica o guarda en borrador este formulario
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                      <div className="col-span-2">
                        <Label htmlFor="nombre" className="text-white/80">Nombre *</Label>
                        <Input
                          id="nombre"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value.slice(0, 100))}
                          maxLength={100}
                          placeholder="Máximo 100 caracteres"
                          className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-orange focus:ring-orange"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fecha" className="text-white/80">Fecha *</Label>
                        <Input
                          id="fecha"
                          type="date"
                          value={fecha}
                          onChange={(e) => setFecha(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="border-white/20 bg-white/10 text-white focus:border-orange focus:ring-orange"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hora" className="text-white/80">Hora *</Label>
                        <Input
                          id="hora"
                          type="time"
                          value={hora}
                          onChange={(e) => setHora(e.target.value)}
                          className="border-white/20 bg-white/10 text-white focus:border-orange focus:ring-orange"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="lugar" className="text-white/80">Lugar *</Label>
                        <Input
                          id="lugar"
                          value={lugar}
                          onChange={(e) => setLugar(e.target.value.slice(0, 100))}
                          maxLength={100}
                          placeholder="Máximo 100 caracteres"
                          className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-orange focus:ring-orange"
                        />
                      </div>
                      <div>
                        <Label htmlFor="modalidad" className="text-white/80">Modalidad *</Label>
                        <Select
                          value={modalidad}
                          onValueChange={(v) => setModalidad(v as Modality)}
                        >
                          <SelectTrigger className="border-white/20 bg-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="presencial">Presencial</SelectItem>
                            <SelectItem value="virtual">Virtual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="categoria" className="text-white/80">Categoría *</Label>
                        <Input
                          id="categoria"
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value)}
                          placeholder="Ej: Capacitación"
                          className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-orange focus:ring-orange"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cupos" className="text-white/80">Cupos disponibles</Label>
                        <Input
                          id="cupos"
                          type="number"
                          min="1"
                          value={cupos}
                          onChange={(e) => setCupos(e.target.value)}
                          placeholder="Sin límite"
                          className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-orange focus:ring-orange"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Switch
                          id="obligatorio"
                          checked={obligatorio}
                          onCheckedChange={setObligatorio}
                        />
                        <Label htmlFor="obligatorio" className="text-white/80">Actividad obligatoria</Label>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="descripcion" className="text-white/80">Descripción *</Label>
                        <Textarea
                          id="descripcion"
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value.slice(0, 1000))}
                          maxLength={1000}
                          rows={4}
                          placeholder="Máximo 1000 caracteres"
                          className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-orange focus:ring-orange"
                        />
                        <p className="text-xs text-white/50 text-right">
                          {descripcion.length}/1000
                        </p>
                      </div>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={handleCloseCreate} className="glass-icon-btn text-white/80 hover:text-white">
                        Cancelar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleCreateActivity(false)}
                        className="glass-badge text-white/90"
                      >
                        Guardar Borrador
                      </Button>
                      <Button onClick={() => handleCreateActivity(true)} className="action-btn-solid">
                        Publicar
                      </Button>
                    </DialogFooter>
                  </>
                ) : createType === 'news' ? (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-white">Novedad</DialogTitle>
                      <DialogDescription className="text-white/60">
                        Publica o guarda en borrador este formulario
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="newsTipo" className="text-white/80">Tipo *</Label>
                        <Select
                          value={newsTipo}
                          onValueChange={(v) =>
                            setNewsTipo(v as typeof newsTipo)
                          }
                        >
                          <SelectTrigger className="border-white/20 bg-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cumpleanos">Cumpleaños</SelectItem>
                            <SelectItem value="nacimiento">Nacimiento</SelectItem>
                            <SelectItem value="logro">Logro</SelectItem>
                            <SelectItem value="noticia">Noticia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="newsNombre" className="text-white/80">Nombre *</Label>
                        <Input
                          id="newsNombre"
                          value={newsNombre}
                          onChange={(e) => setNewsNombre(e.target.value.slice(0, 100))}
                          maxLength={100}
                          placeholder="Máximo 100 caracteres"
                          className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-orange focus:ring-orange"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newsDescripcion" className="text-white/80">Descripción *</Label>
                        <Textarea
                          id="newsDescripcion"
                          value={newsDescripcion}
                          onChange={(e) =>
                            setNewsDescripcion(e.target.value.slice(0, 1000))
                          }
                          maxLength={1000}
                          rows={4}
                          placeholder="Máximo 1000 caracteres"
                          className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-orange focus:ring-orange"
                        />
                        <p className="text-xs text-white/50 text-right">
                          {newsDescripcion.length}/1000
                        </p>
                      </div>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={handleCloseCreate} className="glass-icon-btn text-white/80 hover:text-white">
                        Cancelar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleCreateNews(false)}
                        className="glass-badge text-white/90"
                      >
                        Guardar Borrador
                      </Button>
                      <Button onClick={() => handleCreateNews(true)} className="action-btn-solid">
                        Publicar
                      </Button>
                    </DialogFooter>
                  </>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-white">Nuevo en el Equipo</DialogTitle>
                      <DialogDescription className="text-white/60">
                        Selecciona un colaborador para presentarlo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="employeeSearch" className="text-white/80">Buscar colaborador</Label>
                        <Input
                          id="employeeSearch"
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          placeholder="Escribe para buscar..."
                          className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-orange focus:ring-orange"
                        />
                      </div>
                      <div>
                        <Label className="text-white/80">Seleccionar colaborador *</Label>
                        <div className="mt-2 text-xs text-white/50 mb-2">
                          Usuarios activos (se excluyen aspirantes)
                        </div>
                        <div className="mt-2 max-h-48 overflow-y-auto space-y-2 glass-card p-2">
                          {filteredEmployees.length === 0 ? (
                            <p className="text-sm text-white/50 text-center py-4">
                              No se encontraron colaboradores
                            </p>
                          ) : (
                            filteredEmployees.map((emp) => (
                              <Button
                                key={emp.id}
                                variant={
                                  selectedEmployeeId === emp.id
                                    ? 'default'
                                    : 'ghost'
                                }
                                className={`w-full justify-start ${selectedEmployeeId === emp.id ? 'bg-orange text-white hover:bg-orange/90' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                                onClick={() => setSelectedEmployeeId(emp.id)}
                              >
                                {emp.nombre} {emp.apellido} - {emp.cargo}
                              </Button>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="rounded-lg glass-card bg-orange/10 border-orange/30 p-3">
                        <p className="text-xs text-orange">
                          Nota: El colaborador seleccionado podrá agregar un comentario personal desde su tarjeta (máximo 200 caracteres).
                        </p>
                      </div>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={handleCloseCreate} className="glass-icon-btn text-white/80 hover:text-white">
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateEmployee} className="action-btn-solid">Publicar</Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <AdminActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={() => handleEditActivity(activity)}
                  onDelete={() => handleDeleteActivity(activity.id)}
                  onPublish={() => handlePublishDraft(activity.id)}
                  onDraft={() => handleMoveToDraft(activity.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="published" className="mt-4">
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <AdminActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={() => handleEditActivity(activity)}
                  onDelete={() => handleDeleteActivity(activity.id)}
                  onPublish={() => handlePublishDraft(activity.id)}
                  onDraft={() => handleMoveToDraft(activity.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="draft" className="mt-4">
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <AdminActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={() => handleEditActivity(activity)}
                  onDelete={() => handleDeleteActivity(activity.id)}
                  onPublish={() => handlePublishDraft(activity.id)}
                  onDraft={() => handleMoveToDraft(activity.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="deleted" className="mt-4">
            {deletedActivities.length === 0 ? (
              <div className="glass-card border-dashed flex flex-col items-center justify-center py-12">
                <Trash2 className="h-12 w-12 text-white/40" />
                <p className="mt-4 text-sm text-white/50">
                  No hay actividades en la papelera
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {deletedActivities.map((activity) => (
                  <div key={activity.id} className="opacity-60 glass-card flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-white">{activity.nombre}</p>
                      <p className="text-sm text-white/50">
                        Eliminado hace{' '}
                        {Math.floor(
                          (Date.now() - new Date(activity.deletedAt!).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        días
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(activity.id)}
                        className="glass-icon-btn text-white/80 hover:text-white"
                      >
                        <RotateCcw className="mr-1 h-4 w-4" />
                        Restaurar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handlePermanentDelete(activity.id)}
                      >
                        Eliminar Permanentemente
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="glass-card bg-[#1E2245]/95">
            <DialogHeader>
              <DialogTitle className="text-white">¿Eliminar actividad?</DialogTitle>
              <DialogDescription className="text-white/60">
                Esta acción moverá la actividad a la papelera. Podrás restaurarla
                durante 7 días. Después será eliminada permanentemente.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="glass-icon-btn text-white/80 hover:text-white">
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
