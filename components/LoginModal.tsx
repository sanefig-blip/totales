import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { stationLoginOptions, detachmentParentMap } from '../data.ts';
import { User } from '../authData.ts';
import { UserIcon } from './icons/UserIcon.tsx';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon.tsx';
import { KeyIcon } from './icons/KeyIcon.tsx';

const LoginModal: React.FC = () => {
  const { login } = useAuth();
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation) return;

    setIsLoading(true);
    setError('');

    const isAdmin = selectedStation === 'O.C.O.B.';
    const user: User = {
      id: selectedStation.toLowerCase().replace(/\s/g, '-'),
      name: selectedStation,
      role: isAdmin ? 'Admin' : 'Operador',
      stationScope: selectedStation,
    };

    setTimeout(() => {
      const success = login(user, code);
      if (!success) {
        setError('Código de acceso incorrecto. Intente de nuevo.');
        setIsLoading(false);
      }
      // On success, the app re-renders from context, no need to set loading to false
    }, 300);
  };

  const handleSelectStation = (stationName: string) => {
    setSelectedStation(stationName);
    setError('');
    setCode('');
  };

  const handleGoBack = () => {
    setSelectedStation(null);
    setError('');
  };

  const getLoginDetails = (stationName: string) => {
    if (stationName === 'O.C.O.B.') {
      return { Icon: UserIcon, label: 'Acceso Total (Admin)' };
    }
    if (detachmentParentMap[stationName]) {
      return { Icon: UserIcon, label: 'Acceso de Destacamento' };
    }
    return { Icon: UserIcon, label: 'Acceso de Estación' };
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex flex-col justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-red-500 mb-4">UNIDADES DE BOMBEROS DE LA CIUDAD</h1>
        <p className="text-xl text-gray-300">
          {selectedStation ? 'Ingrese su código de acceso' : 'Seleccione una estación para iniciar sesión'}
        </p>
      </div>
      <div className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 relative">
        {!selectedStation ? (
          <>
            <h2 className="text-xl font-semibold text-white mb-6 text-center">Seleccionar Sesión</h2>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
              {stationLoginOptions.map((stationName) => {
                const { Icon, label } = getLoginDetails(stationName);
                return (
                  <button
                    key={stationName}
                    onClick={() => handleSelectStation(stationName)}
                    className="w-full flex items-center p-4 bg-gray-700 hover:bg-red-600 rounded-md transition-all duration-200 group text-left"
                  >
                    <Icon className="w-6 h-6 mr-4 text-gray-400 group-hover:text-white flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white">{stationName}</p>
                      <p className="text-sm text-gray-400 group-hover:text-red-100">{label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            <button onClick={handleGoBack} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div className="text-center mb-6 pt-2">
                <h2 className="text-xl font-semibold text-white">{selectedStation}</h2>
                <p className="text-sm text-red-400">{getLoginDetails(selectedStation).label}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="access-code" className="sr-only">Código de Acceso</label>
                <div className="relative">
                    <KeyIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                    id="access-code"
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`w-full bg-gray-900 border rounded-md py-3 text-white focus:ring-2 transition-colors pl-10 pr-4 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-red-500 focus:border-red-500'}`}
                    placeholder="Código de Acceso"
                    required
                    autoFocus
                    />
                </div>
                {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center transition-colors disabled:bg-red-800 disabled:cursor-not-allowed"
                disabled={isLoading || !code}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Ingresar'}
              </button>
            </form>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginModal;