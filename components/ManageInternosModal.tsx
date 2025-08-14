
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Personnel, Truck } from '../types.ts';
import { UsersIcon } from './icons/UsersIcon.tsx';
import { FireTruckIcon } from './icons/FireTruckIcon.tsx';
import { XCircleIcon } from './icons/XCircleIcon.tsx';

const ManageInternosModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const { personnel, trucks, updatePersonnel, updateTruck } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'unidades'>('personal');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const filteredPersonnel = useMemo(() =>
    personnel.filter(p =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.interno || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.lastName.localeCompare(b.lastName)), [personnel, searchTerm]
  );

  const filteredTrucks = useMemo(() =>
    trucks.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.interno || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name)), [trucks, searchTerm]
  );

  const handleEditClick = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditingValue(currentValue);
  };

  const handleSave = () => {
    if (!editingId) return;

    if (activeTab === 'personal') {
      const person = personnel.find(p => p.lp === editingId);
      if (person) {
        updatePersonnel(editingId, { ...person, interno: editingValue });
      }
    } else {
      const truck = trucks.find(t => t.id === editingId);
      if (truck) {
        const logMessage = `Actualizó el N° Interno de la unidad ${truck.name} a "${editingValue}" desde el gestor de internos.`;
        updateTruck(editingId, { ...truck, interno: editingValue }, logMessage);
      }
    }
    setEditingId(null);
    setEditingValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditingValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl m-4 flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
           onClick={e => e.stopPropagation()} style={{ animation: 'fade-in-scale 0.3s forwards' }}>
        
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Gestionar Números de Interno</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><XCircleIcon className="w-8 h-8"/></button>
        </div>

        <div className="p-6">
          <div className="flex border-b border-gray-700">
            <button onClick={() => setActiveTab('personal')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'personal' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400 hover:text-white'}`}>
                <UsersIcon className="inline w-5 h-5 mr-2" />Personal
            </button>
            <button onClick={() => setActiveTab('unidades')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'unidades' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-400 hover:text-white'}`}>
                <FireTruckIcon className="inline w-5 h-5 mr-2" />Unidades
            </button>
          </div>
          <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                 className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-red-500 transition mt-4"/>
        </div>

        <div className="px-6 pb-6 flex-grow overflow-y-auto max-h-[60vh]">
          {activeTab === 'personal' ? (
            <table className="w-full text-left table-fixed">
              <thead><tr className="border-b border-gray-700">
                <th className="p-3 w-2/5 text-sm font-semibold text-gray-300 uppercase">Apellido y Nombre</th>
                <th className="p-3 w-1/5 text-sm font-semibold text-gray-300 uppercase">LP</th>
                <th className="p-3 w-2/5 text-sm font-semibold text-gray-300 uppercase">N° Interno</th>
              </tr></thead>
              <tbody>{filteredPersonnel.map(p => (
                <tr key={p.lp} className="hover:bg-gray-700/50">
                  <td className="p-3 truncate"><span className="font-bold">{p.lastName}</span>, {p.firstName}</td>
                  <td className="p-3 font-mono text-gray-400">{p.lp}</td>
                  <td className="p-3 cursor-pointer" onClick={() => handleEditClick(p.lp, p.interno || '')}>
                    {editingId === p.lp ? (
                      <input type="text" value={editingValue} onChange={e => setEditingValue(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown}
                             className="w-full bg-gray-900 border border-red-500 rounded px-2 py-1" autoFocus/>
                    ) : ( <span className="font-mono">{p.interno || <span className="text-gray-500 italic">Sin Asignar</span>}</span> )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          ) : (
            <table className="w-full text-left table-fixed">
              <thead><tr className="border-b border-gray-700">
                <th className="p-3 w-2/5 text-sm font-semibold text-gray-300 uppercase">Unidad</th>
                <th className="p-3 w-1/5 text-sm font-semibold text-gray-300 uppercase">Tipo</th>
                <th className="p-3 w-2/5 text-sm font-semibold text-gray-300 uppercase">N° Interno</th>
              </tr></thead>
              <tbody>{filteredTrucks.map(t => (
                <tr key={t.id} className="hover:bg-gray-700/50">
                  <td className="p-3 truncate font-bold">{t.name}</td>
                  <td className="p-3 text-gray-400">{t.type || 'N/A'}</td>
                   <td className="p-3 cursor-pointer" onClick={() => handleEditClick(t.id, t.interno || '')}>
                    {editingId === t.id ? (
                      <input type="text" value={editingValue} onChange={e => setEditingValue(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown}
                             className="w-full bg-gray-900 border border-red-500 rounded px-2 py-1" autoFocus/>
                    ) : ( <span className="font-mono">{t.interno || <span className="text-gray-500 italic">Sin Asignar</span>}</span> )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default ManageInternosModal;
