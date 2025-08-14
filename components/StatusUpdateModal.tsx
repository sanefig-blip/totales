
import React, { useState, useEffect } from 'react';
import { Truck, Status } from '../types.ts';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (truckId: string, newStatus: Status, reason?: string) => void;
  truck: Truck | null;
}

const statusOptions: Status[] = ['Unidad Integrando Fuerza o Servicio', 'Para Servicio', 'Reserva', 'Alternativa', 'A Préstamo', 'Fuera de Servicio'];

const statusInfo: Record<Status, { color: string; label: string }> = {
    'Unidad Integrando Fuerza o Servicio': { color: 'bg-violet-500', label: 'Unidad Integrando Fuerza o Servicio' },
    'Para Servicio': { color: 'bg-white', label: 'Para Servicio' },
    'Reserva': { color: 'bg-green-500', label: 'Reserva' },
    'Alternativa': { color: 'bg-yellow-400', label: 'Alternativa' },
    'A Préstamo': { color: 'bg-blue-500', label: 'A Préstamo' },
    'Fuera de Servicio': { color: 'bg-red-500', label: 'Fuera de Servicio' },
};

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ isOpen, onClose, onSave, truck }) => {
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (truck) {
      setSelectedStatus(truck.status);
      setReason(truck.statusReason || '');
    } else {
      setReason('');
    }
  }, [truck, isOpen]);

  if (!isOpen || !truck) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus) {
      onSave(truck.id, selectedStatus, reason);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Actualizar Estado</h2>
          <p className="text-gray-400">
            Unidad: <span className="font-semibold text-red-400">{truck.name}</span>
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-3">
            <p className="block text-sm font-medium text-gray-300 mb-2">
                Seleccionar Nuevo Estado
            </p>
            {statusOptions.map(status => (
                <button
                    type="button"
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`w-full text-left px-4 py-3 rounded-md flex items-center gap-4 transition-all duration-200 border-2 ${
                        selectedStatus === status 
                        ? 'border-red-500 bg-red-900/40' 
                        : 'border-transparent bg-gray-700 hover:bg-gray-600'
                    }`}
                >
                    <span className={`w-4 h-4 rounded-full flex-shrink-0 border border-gray-900/50 ${statusInfo[status].color}`}></span>
                    <span className="font-medium text-white">{statusInfo[status].label}</span>
                </button>
            ))}
            {selectedStatus && ['Reserva', 'Fuera de Servicio'].includes(selectedStatus) && (
              <div className="pt-2">
                <label htmlFor="status-reason" className="block text-sm font-medium text-gray-300 mb-1">
                  Motivo (Opcional)
                </label>
                <input
                  id="status-reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  placeholder="Ej: Falta de personal, Problema mecánico"
                />
              </div>
            )}
          </div>
          <div className="bg-gray-800/50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition disabled:bg-red-800 disabled:cursor-not-allowed"
              disabled={!selectedStatus}
            >
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

export default StatusUpdateModal;