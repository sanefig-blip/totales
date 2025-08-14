
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Truck, Personnel } from '../types.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { XCircleIcon } from './icons/XCircleIcon.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, officer: Truck['officer'], personnel: number, personnelList: string[]) => void;
  truck: Truck | null;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ isOpen, onClose, onSave, truck }) => {
  const { personnel: personnelData } = useAuth();
  
  const [hierarchy, setHierarchy] = useState('');
  const [officerFirstName, setOfficerFirstName] = useState('');
  const [officerLastName, setOfficerLastName] = useState('');
  const [lp, setLp] = useState('');
  const [poc, setPoc] = useState('');
  const [interno, setInterno] = useState('');
  const [personnel, setPersonnel] = useState('');
  const [personnelList, setPersonnelList] = useState<string[]>([]);
  const [newPersonnelName, setNewPersonnelName] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPersonnel, setFilteredPersonnel] = useState<Personnel[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const sortedPersonnel = useMemo(() => 
    [...personnelData].sort((a, b) => a.lastName.localeCompare(b.lastName)), 
  [personnelData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (truck) {
      const officerName = truck.officer?.name || '';
      setHierarchy(truck.officer?.hierarchy || '');
      
      const nameParts = officerName.split(' ');
      const lastName = nameParts.pop() || '';
      const firstName = nameParts.join(' ');

      setOfficerFirstName(truck.officer?.firstName || firstName);
      setOfficerLastName(truck.officer?.lastName || lastName);
      setLp(truck.officer?.lp || '');
      setPoc(truck.officer?.poc || '');
      setInterno(truck.officer?.interno || '');
      setPersonnel(truck.personnel?.toString() || '');
      setPersonnelList(truck.personnelList || []);
      setSearchQuery(officerName ? `${truck.officer?.lastName}, ${truck.officer?.firstName}` : '');

    } else {
      // Reset fields when modal is closed or truck is null
      setHierarchy('');
      setOfficerFirstName('');
      setOfficerLastName('');
      setLp('');
      setPoc('');
      setInterno('');
      setPersonnel('');
      setPersonnelList([]);
      setNewPersonnelName('');
      setSearchQuery('');
    }
  }, [truck, isOpen]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = sortedPersonnel.filter(p => 
        p.firstName.toLowerCase().includes(lowercasedQuery) ||
        p.lastName.toLowerCase().includes(lowercasedQuery) ||
        `${p.lastName.toLowerCase()}, ${p.firstName.toLowerCase()}`.includes(lowercasedQuery) ||
        `${p.firstName.toLowerCase()} ${p.lastName.toLowerCase()}`.includes(lowercasedQuery) ||
        p.lp.toLowerCase().includes(lowercasedQuery) ||
        p.dni.toLowerCase().includes(lowercasedQuery) ||
        p.interno?.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredPersonnel(filtered);
      setIsDropdownOpen(filtered.length > 0);
    } else {
      setFilteredPersonnel([]);
      setIsDropdownOpen(false);
    }
  }, [searchQuery, sortedPersonnel]);


  if (!isOpen || !truck) return null;
  
  const handleSelectPersonnel = (person: Personnel) => {
    setHierarchy(person.rank);
    setOfficerFirstName(person.firstName);
    setOfficerLastName(person.lastName);
    setLp(person.lp);
    setInterno(person.interno || '');
    setSearchQuery(`${person.lastName}, ${person.firstName}`);
    setIsDropdownOpen(false);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const currentOfficerFullName = `${officerLastName}, ${officerFirstName}`;
    if (query.toLowerCase() !== currentOfficerFullName.toLowerCase()) {
        setHierarchy('');
        setOfficerFirstName('');
        setOfficerLastName('');
        setLp('');
        setInterno('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const personnelNumber = parseInt(personnel, 10);
    const fullName = `${officerFirstName.trim()} ${officerLastName.trim()}`.trim();
    
    if (hierarchy && fullName && lp && !isNaN(personnelNumber) && personnelNumber > 0) {
      const officerData = {
        hierarchy: hierarchy.trim(),
        name: fullName,
        firstName: officerFirstName.trim(),
        lastName: officerLastName.trim(),
        lp: lp.trim(),
        poc: poc.trim(),
        interno: interno.trim(),
      };
      onSave(truck.id, officerData, personnelNumber, personnelList);
    }
  };

  const handleAddPersonnel = () => {
    const trimmedName = newPersonnelName.trim();
    if(trimmedName && !personnelList.includes(trimmedName)) {
      setPersonnelList([...personnelList, trimmedName]);
      setNewPersonnelName('');
    }
  };

  const handleRemovePersonnel = (nameToRemove: string) => {
    setPersonnelList(personnelList.filter(name => name !== nameToRemove));
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Asignar Oficial</h2>
          <p className="text-gray-400">Unidad: <span className="font-semibold text-red-400">{truck.name}</span></p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
            <div className="space-y-3 p-4 border border-gray-700 rounded-lg">
                <h3 className="text-lg font-medium text-amber-400">Oficial a Cargo</h3>
                
                <div ref={searchContainerRef} className="relative">
                    <label htmlFor="officer-search" className="block text-sm font-medium text-gray-300 mb-1">Buscar Oficial (por Nombre, Apellido o LP)</label>
                    <input 
                        id="officer-search" 
                        type="text" 
                        value={searchQuery} 
                        onChange={handleSearchChange} 
                        onFocus={() => searchQuery.length > 1 && setIsDropdownOpen(true)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition" 
                        placeholder="Comience a escribir para buscar..." 
                        autoComplete="off"
                        required
                    />
                    {isDropdownOpen && filteredPersonnel.length > 0 && (
                        <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                            {filteredPersonnel.map(person => (
                                <li 
                                    key={person.lp} 
                                    onClick={() => handleSelectPersonnel(person)}
                                    className="px-4 py-2 text-white hover:bg-red-600 cursor-pointer"
                                >
                                    <p className="font-semibold">{person.lastName}, {person.firstName}</p>
                                    <p className="text-xs text-gray-400">
                                      {person.rank} - LP: {person.lp}
                                      {person.interno && <span className="font-mono"> - Int: {person.interno}</span>}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {officerFirstName && (
                   <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mt-2 p-3 bg-gray-900/50 rounded-md">
                        <div><span className="font-semibold text-gray-400">Jerarquía:</span> <span className="text-gray-200">{hierarchy}</span></div>
                        <div><span className="font-semibold text-gray-400">Nombre:</span> <span className="text-gray-200">{officerFirstName} {officerLastName}</span></div>
                        <div><span className="font-semibold text-gray-400">LP:</span> <span className="text-gray-200">{lp}</span></div>
                    </div>
                     <div>
                        <label htmlFor="officer-interno" className="block text-sm font-medium text-gray-300 mb-1">N° de Interno (Editable)</label>
                        <input 
                            id="officer-interno" 
                            type="text" 
                            value={interno} 
                            onChange={e => setInterno(e.target.value)} 
                            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" 
                            placeholder="N° de Interno"
                        />
                    </div>
                   </>
                )}
                
                <div>
                    <label htmlFor="officer-poc" className="block text-sm font-medium text-gray-300 mb-1">POC (Opcional)</label>
                    <input id="officer-poc" type="text" value={poc} onChange={e => setPoc(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition" placeholder="Ej: P.O.C." />
                </div>
            </div>

            <div className="space-y-3 p-4 border border-gray-700 rounded-lg">
                <h3 className="text-lg font-medium text-cyan-400">Dotación de la Unidad</h3>
                <div>
                    <label htmlFor="personnel-count" className="block text-sm font-medium text-gray-300 mb-1">Cantidad Total de Personal</label>
                    <input id="personnel-count" type="number" value={personnel} onChange={e => setPersonnel(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition" placeholder="Ej: 8" min="1" required />
                </div>
                
                <div className="border-t border-gray-600 pt-3">
                     <label htmlFor="add-personnel-name" className="block text-sm font-medium text-gray-300 mb-1">Agregar Personal a la Lista (Opcional)</label>
                    <div className="flex gap-2">
                        <input id="add-personnel-name" type="text" value={newPersonnelName} onChange={e => setNewPersonnelName(e.target.value)} className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition" placeholder="Nombre y Apellido"/>
                        <button type="button" onClick={handleAddPersonnel} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-2 rounded-md flex items-center justify-center transition-colors disabled:bg-cyan-800 disabled:cursor-not-allowed" disabled={!newPersonnelName.trim()}>
                           <PlusIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {personnelList.length > 0 && (
                  <ul className="space-y-2 pt-2">
                    {personnelList.map((name, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md text-sm">
                        <span className="text-gray-200">{name}</span>
                        <button type="button" onClick={() => handleRemovePersonnel(name)} aria-label={`Quitar a ${name}`} className="text-gray-500 hover:text-red-400 transition-colors">
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          </div>
          <div className="bg-gray-800/50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition disabled:bg-red-800 disabled:cursor-not-allowed" disabled={!hierarchy || !officerFirstName || !officerLastName || !lp || !personnel || parseInt(personnel, 10) <= 0}>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default AssignmentModal;
