
import React, { useState } from 'react';
import { Truck, CrewMember } from '../types.ts';
import TruckList from './TruckList.tsx';
import { UsersIcon } from './icons/UsersIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { XCircleIcon } from './icons/XCircleIcon.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

interface StationSectionProps {
  stationName: string;
  trucks: Truck[];
  detachments: Record<string, Truck[]>;
  firefighters: CrewMember[];
  onEditTruck: (truck: Truck) => void;
  onClearTruck: (id: string) => void;
  onMoveTruck: (truck: Truck) => void;
  onOpenStatusModal: (truck: Truck) => void;
  onAddFirefighter: (stationName: string, firefighterName: string, interno: string) => void;
  onRemoveFirefighter: (stationName: string, firefighterName: string) => void;
}

const StationSection: React.FC<StationSectionProps> = ({ 
  stationName, 
  trucks, 
  detachments,
  firefighters, 
  onEditTruck, 
  onClearTruck, 
  onMoveTruck,
  onOpenStatusModal,
  onAddFirefighter, 
  onRemoveFirefighter 
}) => {
  const { permissions, isAuthorized } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [newFirefighterFirstName, setNewFirefighterFirstName] = useState('');
  const [newFirefighterLastName, setNewFirefighterLastName] = useState('');
  const [newFirefighterInterno, setNewFirefighterInterno] = useState('');

  const canManageStationCrew = permissions.canManageCrew && isAuthorized(stationName);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${newFirefighterFirstName.trim()} ${newFirefighterLastName.trim()}`.trim();
    const interno = newFirefighterInterno.trim();
    if (fullName && interno) {
      onAddFirefighter(stationName, fullName, interno);
      setNewFirefighterFirstName('');
      setNewFirefighterLastName('');
      setNewFirefighterInterno('');
    }
  };

  const hasContent = trucks.length > 0 || Object.keys(detachments).length > 0;
  
  const sortedDetachments = Object.entries(detachments).sort((a, b) => {
    const aName = a[0];
    const bName = b[0];

    // Specific rule to keep Saavedra under Urquiza
    if (aName === 'DESTACAMENTO URQUIZA' && bName === 'DESTACAMENTO SAAVEDRA') {
        return -1;
    }
    if (aName === 'DESTACAMENTO SAAVEDRA' && bName === 'DESTACAMENTO URQUIZA') {
        return 1;
    }

    return a[0].localeCompare(b[0]);
  });

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 md:p-6">
      <h3 className="text-xl font-semibold text-white mb-4">{stationName}</h3>
      
      {trucks.length > 0 && (
        <TruckList 
          trucks={trucks} 
          onEdit={onEditTruck} 
          onClear={onClearTruck} 
          onMove={onMoveTruck} 
          onOpenStatusModal={onOpenStatusModal} 
        />
      )}

      {sortedDetachments.length > 0 && (
        <div className={`space-y-6 ${trucks.length > 0 ? 'mt-6 pt-6 border-t border-gray-700/50' : ''}`}>
          {sortedDetachments.map(([detachmentName, detachmentTrucks]) => (
            <div key={detachmentName}>
              <h4 className="text-lg font-semibold text-amber-400 mb-3 ml-1">{detachmentName}</h4>
              <TruckList 
                trucks={detachmentTrucks}
                onEdit={onEditTruck}
                onClear={onClearTruck}
                onMove={onMoveTruck}
                onOpenStatusModal={onOpenStatusModal}
              />
            </div>
          ))}
        </div>
      )}

      {!hasContent && <p className="text-gray-500 italic">No hay unidades en esta estación.</p>}

      <div className="mt-6 border-t border-gray-700 pt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left text-lg font-medium text-cyan-400 hover:text-cyan-300 p-2 rounded-md transition-colors"
          aria-expanded={isExpanded}
        >
          <span className="flex items-center">
            <UsersIcon className="h-6 w-6 mr-2" />
            Dotación de la Estación ({firefighters.length})
          </span>
          <ChevronDownIcon className={`h-6 w-6 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {isExpanded && (
          <div className="mt-4 pl-4 md:pl-8">
            {firefighters.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {firefighters.sort((a, b) => a.name.localeCompare(b.name)).map((member, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md animate-fade-in-sm">
                    <span className="text-gray-200 font-medium">{member.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono text-cyan-300">{member.interno}</span>
                      {canManageStationCrew && (
                          <button 
                            onClick={() => onRemoveFirefighter(stationName, member.name)} 
                            aria-label={`Quitar a ${member.name}`}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic my-4">No hay personal asignado a esta dotación.</p>
            )}

            {canManageStationCrew && (
              <form onSubmit={handleAdd} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                    <label htmlFor={`ff-first-name-${stationName}`} className="sr-only">Nombre</label>
                    <input
                        id={`ff-first-name-${stationName}`}
                        type="text"
                        value={newFirefighterFirstName}
                        onChange={(e) => setNewFirefighterFirstName(e.target.value)}
                        placeholder="Nombre"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                        aria-label="Nombre del nuevo bombero"
                    />
                </div>
                <div>
                    <label htmlFor={`ff-last-name-${stationName}`} className="sr-only">Apellido</label>
                    <input
                        id={`ff-last-name-${stationName}`}
                        type="text"
                        value={newFirefighterLastName}
                        onChange={(e) => setNewFirefighterLastName(e.target.value)}
                        placeholder="Apellido"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                        aria-label="Apellido del nuevo bombero"
                    />
                </div>
                 <div>
                    <label htmlFor={`ff-interno-${stationName}`} className="sr-only">Número de Interno</label>
                    <input
                        id={`ff-interno-${stationName}`}
                        type="text"
                        value={newFirefighterInterno}
                        onChange={(e) => setNewFirefighterInterno(e.target.value)}
                        placeholder="N° de Interno"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                        aria-label="Número de Interno"
                    />
                </div>
                <button 
                    type="submit" 
                    className="sm:col-span-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors disabled:bg-red-800 disabled:cursor-not-allowed"
                    disabled={!newFirefighterFirstName.trim() || !newFirefighterLastName.trim() || !newFirefighterInterno.trim()}
                >
                    <PlusIcon className="h-5 w-5 mr-1" />
                    <span>Agregar</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in-sm {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-sm {
          animation: fade-in-sm 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StationSection;