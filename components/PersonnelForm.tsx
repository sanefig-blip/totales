
import React, { useState, useEffect } from 'react';
import { Personnel } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

interface PersonnelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Personnel) => void;
  existingPerson: Personnel | null;
}

const PersonnelForm: React.FC<PersonnelFormProps> = ({ isOpen, onClose, onSave, existingPerson }) => {
  const { personnel } = useAuth();
  const [formData, setFormData] = useState<Partial<Personnel>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(existingPerson || {});
  }, [existingPerson, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const requiredFields: (keyof Personnel)[] = ['lp', 'dni', 'firstName', 'lastName', 'rank'];
    for (const field of requiredFields) {
        if (!formData[field]) {
            setError('Por favor, complete todos los campos.');
            return;
        }
    }
    
    if (!existingPerson && personnel.some(p => p.lp === formData.lp)) {
        setError(`El LP '${formData.lp}' ya existe. Debe ser único.`);
        return;
    }
    if (!existingPerson && personnel.some(p => p.dni === formData.dni)) {
        setError(`El DNI '${formData.dni}' ya existe. Debe ser único.`);
        return;
    }

    onSave(formData as Personnel);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60]" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={e => e.stopPropagation()} style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">{existingPerson ? 'Editar Personal' : 'Agregar Nuevo Personal'}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">Apellido <span className="text-red-500">*</span></label>
                    <input id="lastName" name="lastName" type="text" value={formData.lastName || ''} onChange={handleChange} required className="w-full input-style" />
                </div>
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">Nombre <span className="text-red-500">*</span></label>
                    <input id="firstName" name="firstName" type="text" value={formData.firstName || ''} onChange={handleChange} required className="w-full input-style" />
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="rank" className="block text-sm font-medium text-gray-300 mb-1">Jerarquía <span className="text-red-500">*</span></label>
                    <input id="rank" name="rank" type="text" value={formData.rank || ''} onChange={handleChange} required className="w-full input-style" />
                </div>
                <div>
                    <label htmlFor="interno" className="block text-sm font-medium text-gray-300 mb-1">N° Interno</label>
                    <input id="interno" name="interno" type="text" value={formData.interno || ''} onChange={handleChange} className="w-full input-style" />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="lp" className="block text-sm font-medium text-gray-300 mb-1">LP (Legajo Personal) <span className="text-red-500">*</span></label>
                    <input id="lp" name="lp" type="text" value={formData.lp || ''} onChange={handleChange} required disabled={!!existingPerson} className="w-full input-style disabled:bg-gray-700" />
                </div>
                <div>
                    <label htmlFor="dni" className="block text-sm font-medium text-gray-300 mb-1">DNI <span className="text-red-500">*</span></label>
                    <input id="dni" name="dni" type="text" value={formData.dni || ''} onChange={handleChange} required className="w-full input-style" />
                </div>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-900/30 p-3 rounded-md">{error}</p>}
          </div>
          <div className="bg-gray-800/50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
      <style>{`
        .input-style {
            background-color: #1F2937; 
            border: 1px solid #4B5563; 
            border-radius: 0.375rem; 
            padding: 0.5rem 0.75rem; 
            color: white;
            transition: all 0.2s;
        }
        .input-style:focus {
            --tw-ring-color: #EF4444;
            box-shadow: 0 0 0 2px var(--tw-ring-color);
            border-color: #EF4444;
        }
         .btn-primary {
            background-color: #DC2626;
            color: white;
            font-weight: 600;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            transition: background-color 0.2s;
        }
        .btn-primary:hover { background-color: #B91C1C; }
        .btn-secondary {
            background-color: #4B5563;
            color: white;
            font-weight: 600;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            transition: background-color 0.2s;
        }
        .btn-secondary:hover { background-color: #6B7280; }
      `}</style>
    </div>
  );
};

export default PersonnelForm;