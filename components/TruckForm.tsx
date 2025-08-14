
import React, { useState, useEffect, useMemo } from 'react';
import { Truck, Status } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { zoneOrder, stationLoginOptions } from '../data.ts';

interface TruckFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (truck: Truck) => void;
  existingTruck: Truck | null;
}

const TruckForm: React.FC<TruckFormProps> = ({ isOpen, onClose, onSave, existingTruck }) => {
  const { trucks } = useAuth();
  const [formData, setFormData] = useState<Partial<Truck>>({
    status: 'Para Servicio',
    personnelList: [],
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (existingTruck) {
      setFormData(existingTruck);
    } else {
      setFormData({ status: 'Para Servicio', personnelList: [] });
    }
  }, [existingTruck, isOpen]);
  
  const allStations = useMemo(() => {
      const stations = new Set(stationLoginOptions);
      trucks.forEach(t => stations.add(t.station));
      return Array.from(stations).sort();
  }, [trucks]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.id || !formData.name || !formData.station || !formData.zone) {
        setError('Por favor, complete todos los campos obligatorios.');
        return;
    }
    
    // Check for unique ID only on creation
    if (!existingTruck && trucks.some(t => t.id === formData.id)) {
        setError(`El ID de unidad '${formData.id}' ya existe. Debe ser único.`);
        return;
    }

    onSave(formData as Truck);
  };
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {existingTruck ? 'Editar Unidad' : 'Agregar Nueva Unidad'}
          </h2>
          <p className="text-gray-400">
            {existingTruck ? `Modificando ${existingTruck.name}` : 'Ingrese los detalles de la nueva unidad.'}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-300 mb-1">
                ID de Unidad (Único) <span className="text-red-500">*</span>
              </label>
              <input
                id="id"
                name="id"
                type="text"
                value={formData.id || ''}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition disabled:bg-gray-700"
                placeholder="Ej: IV-2650"
                required
                disabled={!!existingTruck}
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Nombre de Unidad <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                placeholder="Ej: IV-2650"
                required
              />
            </div>
            <div>
              <label htmlFor="interno" className="block text-sm font-medium text-gray-300 mb-1">
                Número de Interno
              </label>
              <input
                id="interno"
                name="interno"
                type="text"
                value={formData.interno || ''}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                placeholder="Ej: 351"
              />
            </div>
             <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
                Tipo de Unidad
              </label>
              <input
                id="type"
                name="type"
                type="text"
                value={formData.type || ''}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                placeholder="Ej: Autobomba, Cisterna"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="zone" className="block text-sm font-medium text-gray-300 mb-1">
                  Zona <span className="text-red-500">*</span>
                </label>
                <select
                  id="zone"
                  name="zone"
                  value={formData.zone || ''}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  required
                >
                  <option value="" disabled>Seleccione una zona...</option>
                  {zoneOrder.map(zone => <option key={zone} value={zone}>{zone}</option>)}
                </select>
              </div>
               <div>
                <label htmlFor="station" className="block text-sm font-medium text-gray-300 mb-1">
                  Estación / Destacamento <span className="text-red-500">*</span>
                </label>
                <select
                  id="station"
                  name="station"
                  value={formData.station || ''}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  required
                >
                  <option value="" disabled>Seleccione una estación...</option>
                  {allStations.map(station => <option key={station} value={station}>{station}</option>)}
                </select>
              </div>
            </div>
             {error && <p className="text-sm text-red-500 bg-red-900/30 p-3 rounded-md">{error}</p>}
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
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TruckForm;