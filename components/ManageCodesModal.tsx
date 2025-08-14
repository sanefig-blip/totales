import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { stationLoginOptions } from '../data.ts';
import { EditIcon } from './icons/EditIcon.tsx';
import { KeyIcon } from './icons/KeyIcon.tsx';

interface ManageCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageCodesModal: React.FC<ManageCodesModalProps> = ({ isOpen, onClose }) => {
  const { stationCodes, updateStationCode } = useAuth();
  const [editingStation, setEditingStation] = useState<string | null>(null);
  const [newCode, setNewCode] = useState('');

  if (!isOpen) return null;

  const handleEdit = (stationName: string) => {
    setEditingStation(stationName);
    setNewCode(stationCodes[stationName] || '');
  };

  const handleSave = (stationName: string) => {
    if (newCode.trim()) {
      updateStationCode(stationName, newCode.trim());
    }
    setEditingStation(null);
    setNewCode('');
  };

  const handleCancel = () => {
    setEditingStation(null);
    setNewCode('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, stationName: string) => {
    if (e.key === 'Enter') {
        handleSave(stationName);
    } else if (e.key === 'Escape') {
        handleCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Gestionar Códigos de Acceso</h2>
            <p className="text-gray-400">Actualice los códigos para cada estación.</p>
          </div>
           <KeyIcon className="w-8 h-8 text-amber-500" />
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <ul className="space-y-3">
            {stationLoginOptions.map(stationName => (
              <li key={stationName} className="bg-gray-700/50 p-3 rounded-md flex items-center justify-between gap-4">
                <span className="font-semibold text-white flex-1">{stationName}</span>
                {editingStation === stationName ? (
                  <div className="flex items-center gap-2 flex-grow-[2]">
                    <input
                      type="text"
                      value={newCode}
                      onChange={e => setNewCode(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, stationName)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                      autoFocus
                    />
                    <button onClick={() => handleSave(stationName)} className="px-3 py-1.5 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition">Guardar</button>
                    <button onClick={handleCancel} className="px-3 py-1.5 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition">Cancelar</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <code className="text-amber-400 bg-gray-900/50 px-3 py-1 rounded-md text-sm font-mono">
                      {stationCodes[stationName]}
                    </code>
                    <button
                      onClick={() => handleEdit(stationName)}
                      className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
                    >
                      <EditIcon className="h-4 w-4 mr-1" /> Cambiar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-800/50 px-6 py-4 flex justify-end border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition"
          >
            Cerrar
          </button>
        </div>
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

export default ManageCodesModal;
