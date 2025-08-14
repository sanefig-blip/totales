
import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { User, PERMISSIONS } from '../authData.ts';
import { detachmentParentMap, initialStationCodes, initialTrucks, initialCrews, initialPersonnel } from '../data.ts';
import { Truck, LogEntry, Personnel, CrewMember } from '../types.ts';

interface AuthContextType {
  currentUser: User | null;
  login: (user: User, code: string) => boolean;
  logout: () => void;
  permissions: Record<string, boolean>;
  isAuthorized: (station: string) => boolean;
  stationCodes: Record<string, string>;
  updateStationCode: (stationName: string, newCode: string) => void;
  trucks: Truck[];
  addTruck: (truck: Truck) => void;
  updateTruck: (truckId: string, updatedData: Partial<Truck>, logMessage?: string) => void;
  deleteTruck: (truckId: string) => void;
  stationCrews: Record<string, CrewMember[]>;
  addFirefighter: (stationName: string, firefighterName: string, interno: string) => void;
  removeFirefighter: (stationName: string, firefighterName: string) => void;
  logs: LogEntry[];
  clearLogs: () => void;
  personnel: Personnel[];
  addPersonnel: (person: Personnel) => void;
  updatePersonnel: (lp: string, updatedData: Personnel) => void;
  deletePersonnel: (lp: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultPermissions = {
    canEditAssignment: false,
    canMoveTruck: false,
    canChangeStatus: false,
    canManageCrew: false,
    canGeneratePdf: false,
    canManageNomenclador: false,
    canViewLogs: false,
    canClearLogs: false,
    canManagePersonnel: false,
    canManageInternos: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [trucks, setTrucks] = useState<Truck[]>(() => {
    try {
      const saved = localStorage.getItem('trucks');
      return saved ? JSON.parse(saved) : initialTrucks;
    } catch {
      return initialTrucks;
    }
  });
  
  const [stationCrews, setStationCrews] = useState<Record<string, CrewMember[]>>(() => {
    try {
      const saved = localStorage.getItem('stationCrews');
      return saved ? JSON.parse(saved) : initialCrews;
    } catch {
      return initialCrews;
    }
  });

  const [stationCodes, setStationCodes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('stationCodes');
      return saved ? JSON.parse(saved) : initialStationCodes;
    } catch {
      return initialStationCodes;
    }
  });
  
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [personnel, setPersonnel] = useState<Personnel[]>(() => {
    try {
        const saved = localStorage.getItem('personnel');
        return saved ? JSON.parse(saved) : initialPersonnel;
    } catch {
        return initialPersonnel;
    }
  });

  useEffect(() => { localStorage.setItem('trucks', JSON.stringify(trucks)); }, [trucks]);
  useEffect(() => { localStorage.setItem('stationCrews', JSON.stringify(stationCrews)); }, [stationCrews]);
  useEffect(() => { localStorage.setItem('stationCodes', JSON.stringify(stationCodes)); }, [stationCodes]);
  useEffect(() => { localStorage.setItem('logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('personnel', JSON.stringify(personnel)); }, [personnel]);
  

  const addLog = (message: string) => {
    if (!currentUser) return;
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      user: currentUser.name,
      message,
    };
    setLogs(prevLogs => [newLog, ...prevLogs]);
  };


  const login = (user: User, code: string): boolean => {
    const isAdmin = user.role === 'Admin';
    const expectedCode = isAdmin ? stationCodes['O.C.O.B.'] : stationCodes[user.name];
    if (expectedCode === code) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateStationCode = (stationName: string, newCode: string) => {
    setStationCodes(prevCodes => ({
      ...prevCodes,
      [stationName]: newCode,
    }));
    addLog(`Cambió el código de acceso para ${stationName}.`);
  };

  const addTruck = (truck: Truck) => {
    setTrucks(prevTrucks => [...prevTrucks, truck]);
    addLog(`Agregó la unidad ${truck.name} (${truck.id}) a ${truck.station}.`);
  };

  const updateTruck = (truckId: string, updatedData: Partial<Truck>, logMessage?: string) => {
    let oldTruck: Truck | undefined;
    setTrucks(prevTrucks => {
      oldTruck = prevTrucks.find(t => t.id === truckId);
      return prevTrucks.map(t => t.id === truckId ? { ...t, ...updatedData } : t)
    });
    
    if (logMessage) {
        addLog(logMessage);
    }
  };

  const deleteTruck = (truckId: string) => {
    const truckToDelete = trucks.find(t => t.id === truckId);
    if(truckToDelete) {
        setTrucks(prevTrucks => prevTrucks.filter(t => t.id !== truckId));
        addLog(`Eliminó la unidad ${truckToDelete.name} (${truckToDelete.id}).`);
    }
  };

  const addFirefighter = (stationName: string, firefighterName: string, interno: string) => {
    setStationCrews(prevCrews => {
      const currentCrew = prevCrews[stationName] || [];
      if (currentCrew.some(member => member.name === firefighterName)) {
        return prevCrews;
      }
      addLog(`Agregó a ${firefighterName} (Interno: ${interno}) a la dotación de ${stationName}.`);
      const newMember: CrewMember = { name: firefighterName, interno };
      return {
        ...prevCrews,
        [stationName]: [...currentCrew, newMember],
      };
    });
  };

  const removeFirefighter = (stationName: string, firefighterName: string) => {
    setStationCrews(prevCrews => {
      const currentCrew = prevCrews[stationName] || [];
      addLog(`Quitó a ${firefighterName} de la dotación de ${stationName}.`);
      return {
        ...prevCrews,
        [stationName]: currentCrew.filter(member => member.name !== firefighterName),
      };
    });
  };
  
  const clearLogs = () => {
    setLogs([]);
  };

  const addPersonnel = (person: Personnel) => {
    setPersonnel(prev => [...prev, person]);
    addLog(`Agregó a ${person.rank} ${person.lastName}, ${person.firstName} (LP: ${person.lp}) a la base de datos de personal.`);
  };

  const updatePersonnel = (lp: string, updatedData: Personnel) => {
    setPersonnel(prev => prev.map(p => p.lp === lp ? updatedData : p));
    addLog(`Actualizó los datos de ${updatedData.rank} ${updatedData.lastName}, ${updatedData.firstName} (LP: ${lp}).`);
  };

  const deletePersonnel = (lp: string) => {
    const personToDelete = personnel.find(p => p.lp === lp);
    if (personToDelete) {
      setPersonnel(prev => prev.filter(p => p.lp !== lp));
      addLog(`Eliminó a ${personToDelete.rank} ${personToDelete.lastName}, ${personToDelete.firstName} (LP: ${lp}) de la base de datos de personal.`);
    }
  };


  const permissions = useMemo(() => {
    if (!currentUser) {
        return defaultPermissions;
    }
    const userPermissions = PERMISSIONS[currentUser.role] || defaultPermissions;
    return {
        ...userPermissions,
        canManagePersonnel: currentUser.role === 'Admin',
    };
  }, [currentUser]);

  const isAuthorized = (stationName: string): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'Admin') {
      return true;
    }

    if (currentUser.stationScope === stationName) {
      return true;
    }

    if (detachmentParentMap[stationName] === currentUser.stationScope) {
      return true;
    }

    return false;
  };


  const value = { 
    currentUser, 
    login, 
    logout, 
    permissions, 
    isAuthorized, 
    stationCodes, 
    updateStationCode, 
    trucks, 
    addTruck, 
    updateTruck, 
    deleteTruck,
    stationCrews,
    addFirefighter,
    removeFirefighter,
    logs,
    clearLogs,
    personnel,
    addPersonnel,
    updatePersonnel,
    deletePersonnel,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
