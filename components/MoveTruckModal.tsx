
import React, { useState, useEffect } from 'react';
import { Truck } from '../types.ts';

interface MoveTruckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (truckId: string, newStation: string) => void;
  truck: Truck | null;
  destinations: { zone: string; stations: string[] }[];
}

const MoveTruckModal: React.FC<MoveTruckModalProps> = ({ isOpen, onClose, onSave, truck, destinations }) => {
  const [selectedStation, setSelectedStation] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedStation('');
    }
  }, [isOpen]);

  if (!isOpen || !truck) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStation) {
      onSave(truck.id, selectedStation);
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
          <h2 className="text-2xl font-bold text-white">Mover Unidad</h2>
          <p className="text-gray-400">
            Unidad: <span className="font-semibold text-red-400">{truck.name}</span>
          </p>
           <p className="text-sm text-gray-500">
            Desde: {truck.station}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="destination-station" className="block text-sm font-medium text-gray-300 mb-1">
                Seleccionar Nuevo Destino
              </label>
              <select
                id="destination-station"
                value={selectedStation}
                onChange={e => setSelectedStation(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                required
              >
                <option value="" disabled>Seleccione una estación...</option>
                {destinations.map(group => (
                  <optgroup key={group.zone} label={group.zone} className="font-bold text-red-400 bg-gray-800">
                    {group.stations
                      .filter(station => station !== truck.station)
                      .map(station => (
                        <option key={station} value={station} className="font-normal text-white bg-gray-900">
                          {station}
                        </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
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
              disabled={!selectedStation}
            >
              Confirmar Traslado
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

export default MoveTruckModal;