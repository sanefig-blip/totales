
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { ClipboardListIcon } from './icons/ClipboardListIcon.tsx';
import { XCircleIcon } from './icons/XCircleIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose }) => {
  const { logs, clearLogs, permissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const filteredLogs = useMemo(() => {
    return logs.filter(log =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  const handleClearLogs = () => {
    clearLogs();
    setShowConfirmClear(false);
  };
  
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
        onClick={onClose}
      >
        <div
          className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl m-4 flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
          onClick={e => e.stopPropagation()}
          style={{ animation: 'fade-in-scale 0.3s forwards' }}
        >
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <ClipboardListIcon className="w-7 h-7 text-indigo-400" />
                Registros de Actividad
              </h2>
              <p className="text-gray-400">Historial de todos los cambios realizados en la aplicación.</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XCircleIcon className="w-8 h-8"/>
            </button>
          </div>
          
          <div className="p-6">
             <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Buscar en registros por usuario o acción..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              />
              {permissions.canClearLogs && (
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  disabled={logs.length === 0}
                >
                  <TrashIcon className="w-5 h-5"/>
                  <span>Limpiar Registros</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="px-6 pb-6 flex-grow overflow-y-auto max-h-[60vh]">
            <div className="bg-gray-900/50 rounded-lg">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-gray-900">
                    <tr className="border-b border-gray-700">
                      <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider w-1/4">Fecha y Hora</th>
                      <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider w-1/4">Usuario</th>
                      <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider w-1/2">Acción Realizada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, index) => (
                      <tr key={index} className="border-b border-gray-800 hover:bg-gray-700/50">
                        <td className="p-4 text-gray-400 text-sm font-mono">
                          {new Date(log.timestamp).toLocaleString('es-AR')}
                        </td>
                        <td className="p-4 text-white font-semibold">{log.user}</td>
                        <td className="p-4 text-gray-300">{log.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLogs.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No se encontraron registros.</p>
                )}
            </div>
          </div>
        </div>
      </div>
      
      {showConfirmClear && (
         <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60]">
            <div className="bg-gray-800 rounded-lg p-8 shadow-xl border border-red-500/50 animate-fade-in-scale">
                 <h3 className="text-xl font-bold text-white mb-2">Confirmar Limpieza de Registros</h3>
                 <p className="text-gray-300 mb-6">
                    ¿Está seguro que desea eliminar todos los registros de actividad? <br/>
                    Esta acción es irreversible.
                 </p>
                 <div className="flex justify-end gap-4">
                     <button onClick={() => setShowConfirmClear(false)} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition">
                         Cancelar
                     </button>
                     <button onClick={handleClearLogs} className="px-4 py-2 bg-red-700 text-white font-semibold rounded-md hover:bg-red-800 transition">
                         Sí, Eliminar Todo
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

export default LogModal;
