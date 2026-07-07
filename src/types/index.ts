// User roles available in the system
export type UserRole = 'admin' | 'ceo' | 'director_proyecto' | 'asistente_gerencia' | 'empleado';

// User status - includes 'aspirante' for applicants
export type UserStatus = 'activo' | 'inactivo' | 'desvinculado' | 'aspirante';

// Activity status
export type ActivityStatus = 'publicada' | 'borrador';

// Activity modality
export type Modality = 'virtual' | 'presencial';

// User model
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  foto?: string;
  cargo: string;
  carrera: string;
  seniority: string;
  rol: UserRole;
  estado: UserStatus;
  fechaIngreso: string;
  createdAt: string;
  updatedAt: string;
}

// Hobby model
export interface Hobby {
  id: string;
  nombre: string;
  icono?: string;
}

// Profile card (Conecta360 card)
export interface ProfileCard {
  id: string;
  userId: string;
  user: User;
  foto?: string;
  hobbies: Hobby[];
  createdAt: string;
  updatedAt: string;
}

// Reaction types
export type ReactionType = 'felicidades' | 'saludos' | 'fuego' | 'acuerdo';

// Reaction on a profile card
export interface Reaction {
  id: string;
  profileCardId: string;
  userId: string;
  user: User;
  tipo: ReactionType;
  createdAt: string;
}

// News types
export type NewsType = 'cumpleanos' | 'nacimiento' | 'logro' | 'noticia';

// News/Novedad model
export interface News {
  id: string;
  titulo: string;
  descripcion: string;
  imagen?: string;
  tipo: NewsType;
  fecha: string;
  estado: ActivityStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// New employee showcase
export interface NewEmployee {
  id: string;
  userId: string;
  user: User;
  comentario?: string;
  fechaPublicacion: string;
  estado: ActivityStatus;
  hobbies?: string[];
  createdAt: string;
  updatedAt: string;
}

// Reacción para nuevos empleados
export interface NewEmployeeReaction {
  id: string;
  newEmployeeId: string;
  userId: string;
  user: User;
  tipo: '👋' | '🎉' | '🔥' | '🤝';
  createdAt: string;
}

// Activity model
export interface Activity {
  id: string;
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  modalidad: Modality;
  categoria: string;
  cupos?: number;
  descripcion: string;
  imagen?: string;
  obligatorio: boolean;
  estado: ActivityStatus;
  inscritos: ActivityInscription[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Activity inscription/participation
export interface ActivityInscription {
  id: string;
  activityId: string;
  userId: string;
  user: User;
  createdAt: string;
}

// Comment model (for profile cards)
export interface Comment {
  id: string;
  profileCardId: string;
  userId: string;
  user: User;
  contenido: string;
  createdAt: string;
}

// Permission model - defines who can view HV
export interface Permission {
  canViewHV: boolean;
  roles: UserRole[];
}

// Filter options for activities
export interface ActivityFilter {
  estado: 'todos' | 'publicada' | 'borrador';
}

// Search parameters
export interface SearchParams {
  query: string;
  filters?: {
    carrera?: string;
    seniority?: string;
    hobby?: string;
  };
}