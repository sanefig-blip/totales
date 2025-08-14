
export type Role = 'Admin' | 'Operador';

export interface User {
  id: string;
  name: string;
  role: Role;
  stationScope: string; // The station user is logged into. Role 'Admin' grants global access.
}

export const PERMISSIONS: Record<Role, Record<string, boolean>> = {
  Admin: { // Jefatura Role
    canEditAssignment: true,
    canMoveTruck: true,
    canChangeStatus: true,
    canManageCrew: true,
    canGeneratePdf: true,
    canManageNomenclador: true,
    canViewLogs: true,
    canClearLogs: true,
    canManagePersonnel: true,
    canManageInternos: true,
  },
  Operador: { // Station Role
    canEditAssignment: true,
    canMoveTruck: true,
    canChangeStatus: true,
    canManageCrew: true,
    canGeneratePdf: true,
    canManageNomenclador: false,
    canViewLogs: false,
    canClearLogs: false,
    canManagePersonnel: false,
    canManageInternos: false,
  },
};
