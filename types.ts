
export type Status = 'Unidad Integrando Fuerza o Servicio' | 'Para Servicio' | 'Reserva' | 'Alternativa' | 'A Préstamo' | 'Fuera de Servicio';

export interface CrewMember {
  name: string;
  interno: string;
}

export interface Truck {
  id: string;
  name: string;
  type?: string;
  zone: string;
  station: string;
  officer?: {
    hierarchy: string;
    name: string;
    firstName: string;
    lastName: string;
    lp: string;
    poc?: string;
    interno?: string;
  };
  personnel?: number;
  personnelList?: string[];
  status: Status;
  statusReason?: string;
  interno?: string;
}

export interface LogEntry {
  timestamp: string;
  user: string;
  message: string;
}

export interface Personnel {
  rank: string;
  lp: string;
  dni: string;
  lastName: string;
  firstName: string;
  interno?: string;
}