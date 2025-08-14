
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Personnel } from '../types.ts';
import PersonnelForm from './PersonnelForm.tsx';
import { UsersIcon } from './icons/UsersIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { EditIcon } from './icons/EditIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { XCircleIcon } from './icons/XCircleIcon.tsx';
import { ChevronUpDownIcon } from './icons/ChevronUpDownIcon.tsx';
import { ChevronUpIcon } from './icons/ChevronUpIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';

type SortKey = keyof Personnel;
type SortDirection = 'asc' | 'desc';

interface ManagePersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManagePersonnelModal: React.FC<ManagePersonnelModalProps> = ({ isOpen, onClose }) => {
  const { personnel, addPersonnel, updatePersonnel, deletePersonnel } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [personToDelete, setPersonToDelete] = useState<Personnel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('lastName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  if (!isOpen) return null;

  const handleAddNew = () => {
    setEditingPerson(null);
    setIsFormOpen(true);
  };

  const handleEdit = (person: Personnel) => {
    setEditingPerson(person);
    setIsFormOpen(true);
  };

  const handleSave = (personData: Personnel) => {
    if (editingPerson) {
      updatePersonnel(editingPerson.lp, personData);
    } else {
      addPersonnel(personData);
    }
    setIsFormOpen(false);
    setEditingPerson(null);
  };

  const handleDelete = (person: Personnel) => {
    setPersonToDelete(person);
  };

  const confirmDelete = () => {
    if (personToDelete) {
      deletePersonnel(personToDelete.lp);
      setPersonToDelete(null);
    }
  };

  const sortedAndFilteredPersonnel = useMemo(() => {
    const filtered = personnel.filter(p =>
      Object.values(p).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    return filtered.sort((a, b) => {
      const aVal = a[sortKey] || '';
      const bVal = b[sortKey] || '';
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [personnel, searchTerm, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const SortableHeader: React.FC<{ sortField: SortKey; label: string; className?: string; }> = ({ sortField, label, className }) => {
    const isSorting = sortKey === sortField;
    return (
      <th
        className={`p-3 text-sm font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors ${className}`}
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
      <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={onClose}>
        <div
          className="bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl m-4 flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
          onClick={e => e.stopPropagation()} style={{ animation: 'fade-in-scale 0.3s forwards' }}
        >
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <UsersIcon className="w-7 h-7 text-teal-400" />
                Gestionar Personal
              </h2>
              <p className="text-gray-400">Administrar la base de datos de personal.</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XCircleIcon className="w-8 h-8" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, LP, DNI..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              />
              <button
                onClick={handleAddNew}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Agregar Personal</span>
              </button>
            </div>
          </div>

          <div className="px-6 pb-6 flex-grow overflow-y-auto max-h-[60vh]">
            <div className="bg-gray-900/50 rounded-lg overflow-hidden">
              <table className="w-full text-left table-fixed">
                <thead className="sticky top-0 bg-gray-900 z-10">
                  <tr className="border-b border-gray-700">
                    <SortableHeader sortField="lastName" label="Apellido" className="w-1/5" />
                    <SortableHeader sortField="firstName" label="Nombre" className="w-1/5" />
                    <SortableHeader sortField="rank" label="Jerarquía" className="w-1/5" />
                    <SortableHeader sortField="lp" label="LP" className="w-[100px]" />
                    <SortableHeader sortField="dni" label="DNI" className="w-[100px]" />
                    <SortableHeader sortField="interno" label="N° Interno" className="w-[100px]" />
                    <th className="p-3 text-sm font-semibold text-gray-300 uppercase tracking-wider text-right w-[100px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {sortedAndFilteredPersonnel.map(person => (
                    <tr key={person.lp} className="hover:bg-gray-700/50">
                      <td className="p-3 text-white font-semibold truncate">{person.lastName}</td>
                      <td className="p-3 text-gray-300 truncate">{person.firstName}</td>
                      <td className="p-3 text-gray-300 truncate">{person.rank}</td>
                      <td className="p-3 text-gray-300 font-mono text-sm truncate">{person.lp}</td>
                      <td className="p-3 text-gray-300 font-mono text-sm truncate">{person.dni}</td>
                      <td className="p-3 text-gray-300 font-mono text-sm truncate">{person.interno || '-'}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(person)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/50 rounded-md transition-colors" aria-label="Editar">
                            <EditIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(person)} className="p-2 text-red-500 hover:text-red-400 hover:bg-red-900/50 rounded-md transition-colors" aria-label="Eliminar">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sortedAndFilteredPersonnel.length === 0 && <p className="text-center text-gray-500 py-8">No se encontró personal.</p>}
            </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <PersonnelForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
          existingPerson={editingPerson}
        />
      )}

      {personToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60]">
          <div className="bg-gray-800 rounded-lg p-8 shadow-xl border border-red-500/50 animate-fade-in-scale">
            <h3 className="text-xl font-bold text-white mb-2">Confirmar Eliminación</h3>
            <p className="text-gray-300 mb-6">
              ¿Está seguro que desea eliminar a <span className="font-bold text-red-400">{personToDelete.firstName} {personToDelete.lastName}</span>?
              <br />Esta acción es irreversible.
            </p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setPersonToDelete(null)} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition">Cancelar</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-700 text-white font-semibold rounded-md hover:bg-red-800 transition">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </>
  );
};

export default ManagePersonnelModal;