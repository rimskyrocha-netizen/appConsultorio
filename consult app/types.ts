export enum UserRole {
  ADMIN = 'ADMIN',
  DENTIST = 'DENTIST',
  RECEPTION = 'RECEPTION',
  ASSISTANT = 'ASSISTANT', // ASB/TSB
  FINANCIAL = 'FINANCIAL',
  STOCK = 'STOCK',
  AUDITOR = 'AUDITOR',
  PATIENT = 'PATIENT'
}

export enum ProcedureCategory {
  ESTETICA = 'Estética',
  CIRURGIA = 'Cirurgia',
  PREVENCAO = 'Prevenção',
  ORTODONTIA = 'Ortodontia',
  ENDODONTIA = 'Endodontia',
  PROTESE = 'Prótese',
  PERIODONTIA = 'Periodontia',
  EXAME = 'Exame/Diagnóstico',
  IMPLANTE = 'Implante'
}

export interface Procedure {
  id: string;
  name: string;
  description: string;
  category: ProcedureCategory;
  defaultValue: number;
  estimatedMinutes: number;
}

export interface Tenant {
  id: string;
  name: string;
  cnpj: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  tenantId: string;
  specialty?: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastAccess?: string;
  cro?: string;
  state?: string;
  city?: string;
  password?: string;
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  whatsapp?: string;
  email: string;
  lastVisit?: string;
  tags: string[];
  medicalHistory?: string;
  insuranceName?: string;
  insuranceCard?: string;
  observations?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  start: string;
  end: string;
  type: 'CONSULTATION' | 'PROCEDURE' | 'RETURN' | 'EMERGENCY';
  status: 'SCHEDULED' | 'CONFIRMED' | 'WAITING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELED';
  notes?: string;
}

export interface ToothFace {
  id: 'O' | 'M' | 'D' | 'V' | 'L'; // Oclusal, Mesial, Distal, Vestibular, Lingual
  status: 'HEALTHY' | 'CARIES' | 'RESTORATION' | 'FRACTURE' | 'MISSING' | 'IMPLANT';
}

export interface Tooth {
  number: number;
  faces: Record<string, ToothFace>;
  generalStatus: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  description: string;
  totalValue: number;
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  procedures: TreatmentProcedure[];
}

export interface TreatmentProcedure {
  id: string;
  toothNumber?: number;
  face?: string;
  description: string;
  value: number;
  status: 'PLANNED' | 'DONE';
}