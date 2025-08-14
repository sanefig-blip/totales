
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Truck } from '../types.ts';
import TruckForm from './TruckForm.tsx';
import { BookIcon } from './icons/BookIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { EditIcon } from './icons/EditIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { XCircleIcon } from './icons/XCircleIcon.tsx';
import { ChevronUpDownIcon } from './icons/ChevronUpDownIcon.tsx';
import { ChevronUpIcon } from './icons/ChevronUpIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';

type SortKey = 'name' | 'type' | 'station' | 'interno';
type SortDirection = 'asc' | 'desc';

interface NomencladorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NomencladorModal: React.FC<NomencladorModalProps> = ({ isOpen, onClose }) => {
  const { trucks, addTruck, updateTruck, deleteTruck } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [truckToDelete, setTruckToDelete] = useState<Truck | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  if (!isOpen) return null;

  const handleAddNew = () => {
    setEditingTruck(null);
    setIsFormOpen(true);
  };

  const handleEdit = (truck: Truck) => {
    setEditingTruck(truck);
    setIsFormOpen(true);
  };
  
  const handleSaveTruck = (truckData: Truck) => {
    if(editingTruck) {
      const logMessage = `Actualizó la unidad ${truckData.name} (${truckData.id}) desde el Nomenclador.`;
      updateTruck(truckData.id, truckData, logMessage);
    } else {
      addTruck(truckData);
    }
    setIsFormOpen(false);
    setEditingTruck(null);
  };

  const handleDelete = (truck: Truck) => {
    setTruckToDelete(truck);
  };
  
  const confirmDelete = () => {
    if (truckToDelete) {
      deleteTruck(truckToDelete.id);
      setTruckToDelete(null);
    }
  };

  const sortedAndFilteredTrucks = useMemo(() => {
    const filtered = trucks.filter(truck => 
        truck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.interno?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
        const aVal = a[sortKey] || '';
        const bVal = b[sortKey] || '';
        
        let comparison = 0;
        if(String(aVal).toLowerCase() > String(bVal).toLowerCase()) {
            comparison = 1;
        } else if (String(aVal).toLowerCase() < String(bVal).toLowerCase()) {
            comparison = -1;
        }

        return sortDirection === 'desc' ? comparison * -1 : comparison;
    });
  }, [trucks, searchTerm, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
        setSortKey(key);
        setSortDirection('asc');
    }
  };
  
  const SortableHeader: React.FC<{
    sortField: SortKey;
    label: string;
    className?: string;
  }> = ({ sortField, label, className }) => {
    const isSorting = sortKey === sortField;
    return (
      <th 
        className={`p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors ${className}`}
        onClick={() => handleSort(sortField)}
      >
        <div className="flex items-center gap-2">
            {label}
            {isSorting ? (
                sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
            ) : (
                <ChevronUpDownIcon className="w-4 h-4 text-gray-500" />
            )}
        </div>
      </th>
    );
  };


  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
        onClick={onClose}
      >
        <div
          className="bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl m-4 flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
          onClick={e => e.stopPropagation()}
          style={{ animation: 'fade-in-scale 0.3s forwards' }}
        >
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <BookIcon className="w-7 h-7 text-sky-400" />
                Nomenclador de Unidades
              </h2>
              <p className="text-gray-400">Gestionar el parque automotor.</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XCircleIcon className="w-8 h-8"/>
            </button>
          </div>
          
          <div className="p-6">
             <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Buscar por nombre, ID, interno, estación, tipo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              />
              <button
                onClick={handleAddNew}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <PlusIcon className="w-5 h-5"/>
                <span>Agregar Unidad</span>
              </button>
            </div>
          </div>
          
          <div className="px-6 pb-6 flex-grow overflow-y-auto max-h-[60vh]">
            <div className="bg-gray-900/50 rounded-lg">
                <table className="w-full text-left table-fixed">
                  <thead className="sticky top-0 bg-gray-900 z-10">
                    <tr className="border-b border-gray-700">
                       <SortableHeader sortField="name" label="Nombre (ID)" className="w-1/3" />
                       <SortableHeader sortField="interno" label="N° Interno" className="w-[120px]" />
                       <SortableHeader sortField="type" label="Tipo" className="w-1/4" />
                       <SortableHeader sortField="station" label="Estación / Zona" className="w-1/3" />
                      <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider text-right w-[100px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAndFilteredTrucks.map(truck => (
                      <tr key={truck.id} className="border-b border-gray-800 hover:bg-gray-700/50">
                        <td className="p-4 text-white">
                          <div className="font-bold">{truck.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{truck.id}</div>
                        </td>
                        <td className="p-4 text-gray-300">{truck.interno || '-'}</td>
                        <td className="p-4 text-gray-300">{truck.type || '-'}</td>
                        <td className="p-4 text-gray-300">
                          <div>{truck.station}</div>
                          <div className="text-xs text-red-400">{truck.zone}</div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(truck)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/50 rounded-md transition-colors"
                              aria-label="Editar"
                            >
                              <EditIcon className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(truck)}
                              className="p-2 text-red-500 hover:text-red-400 hover:bg-red-900/50 rounded-md transition-colors"
                              aria-label="Eliminar"
                            >
                              <TrashIcon className="w-5 h-5"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sortedAndFilteredTrucks.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No se encontraron unidades.</p>
                )}
            </div>
          </div>
        </div>
      </div>
      
      {isFormOpen && (
        <TruckForm 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveTruck}
          existingTruck={editingTruck}
        />
      )}

      {truckToDelete && (
         <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60]">
            <div className="bg-gray-800 rounded-lg p-8 shadow-xl border border-red-500/50 animate-fade-in-scale">
                 <h3 className="text-xl font-bold text-white mb-2">Confirmar Eliminación</h3>
                 <p className="text-gray-300 mb-6">
                    ¿Está seguro que desea eliminar la unidad <span className="font-bold text-red-400">{truckToDelete.name}</span>? <br/>
                    Esta acción es irreversible.
                 </p>
                 <div className="flex justify-end gap-4">
                     <button onClick={() => setTruckToDelete(null)} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition">
                         Cancelar
                     </button>
                     <button onClick={confirmDelete} className="px-4 py-2 bg-red-700 text-white font-semibold rounded-md hover:bg-red-800 transition">
                         Sí, Eliminar
                     </button>
                 </div>
            </div>
         </div>
      )}

      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default NomencladorModal;