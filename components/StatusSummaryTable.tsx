
import React, { useState, useMemo } from 'react';
import { Truck, Status } from '../types.ts';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';

const statusOrder: Status[] = [
  'Unidad Integrando Fuerza o Servicio',
  'Para Servicio',
  'Reserva',
  'Alternativa',
  'A Préstamo',
  'Fuera de Servicio',
];

const statusDisplayInfo: Record<Status, { title: string; textClass: string }> = {
  'Unidad Integrando Fuerza o Servicio': { title: 'U.I.F.S.', textClass: 'text-violet-300' },
  'Para Servicio': { title: 'Para Servicio', textClass: 'text-white' },
  'Reserva': { title: 'Reserva', textClass: 'text-green-300' },
  'Alternativa': { title: 'Alternativa', textClass: 'text-yellow-300' },
  'A Préstamo': { title: 'A Préstamo', textClass: 'text-blue-300' },
  'Fuera de Servicio': { title: 'Fuera de Servicio', textClass: 'text-red-300' },
};

interface StatusSummaryTableProps {
  trucks: Truck[];
  operationalUnitsCount: number;
  operationalAutobombas: number;
  operationalCisternas: number;
  operationalHeavyUnits: number;
}

const StatusSummaryTable: React.FC<StatusSummaryTableProps> = ({ trucks, operationalUnitsCount, operationalAutobombas, operationalCisternas, operationalHeavyUnits }) => {
  const [isSectionExpanded, setIsSectionExpanded] = useState(true);
  const [expandedStatuses, setExpandedStatuses] = useState<Set<Status>>(new Set());

  const groupedByStatus = useMemo(() => {
    const groups = {} as Record<Status, Truck[]>;
    statusOrder.forEach(status => {
      groups[status] = [];
    });
    trucks.forEach(truck => {
      if (groups[truck.status]) {
        groups[truck.status].push(truck);
      }
    });
    return groups;
  }, [trucks]);
  
  const toggleStatus = (status: Status) => {
    setExpandedStatuses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  return (
    <section className="bg-gray-800 rounded-lg p-6 shadow-xl mt-8">
       <button 
        onClick={() => setIsSectionExpanded(!isSectionExpanded)}
        className="w-full flex justify-between items-center text-left border-b-2 border-red-500/30 pb-3 mb-6 group"
        aria-expanded={isSectionExpanded}
       >
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-red-400">
            Resumen por Estado
          </h2>
          <ChevronDownIcon className={`w-6 h-6 text-gray-400 group-hover:text-white transition-transform duration-300 ${isSectionExpanded ? 'rotate-180' : ''}`} />
        </div>
        <div className="text-right">
            <div className="font-bold text-2xl text-green-400">{operationalUnitsCount}</div>
            <div className="text-xs uppercase tracking-wider text-gray-400">Operativas</div>
            <div className="flex justify-end items-center gap-4 mt-1 text-xs text-gray-500">
              <span>Autobombas: <span className="font-semibold text-gray-300">{operationalAutobombas}</span></span>
              <span>Cisternas: <span className="font-semibold text-gray-300">{operationalCisternas}</span></span>
              <div className="h-4 w-px bg-gray-600"></div>
              <span className="font-bold">A+C: <span className="font-bold text-amber-300 text-sm">{operationalHeavyUnits}</span></span>
            </div>
        </div>
      </button>

      {isSectionExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {statusOrder.map(status => {
            const statusTrucks = groupedByStatus[status];
            const count = statusTrucks.length;
            const isExpanded = expandedStatuses.has(status);

            return (
              <div key={status} className="bg-gray-900/50 rounded-lg overflow-hidden transition-all duration-300">
                <button
                  onClick={() => toggleStatus(status)}
                  className={`w-full flex justify-between items-center p-4 text-left font-bold transition-colors duration-200 ${statusDisplayInfo[status].textClass} ${isExpanded ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'}`}
                  aria-expanded={isExpanded}
                >
                  <span>{statusDisplayInfo[status].title} ({count})</span>
                  <ChevronDownIcon className={`h-5 w-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="p-4 bg-gray-900/30 max-h-48 overflow-y-auto animate-fade-in-sm">
                    {count > 0 ? (
                       <>
                        {(status === 'Para Servicio' || status === 'Fuera de Servicio') ? (
                          (() => {
                            const breakdownByType = statusTrucks.reduce((acc, truck) => {
                              const type = truck.type || 'Sin Tipo';
                              acc[type] = (acc[type] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>);

                            return (
                              <ul className="space-y-1 text-sm text-gray-300">
                                {Object.entries(breakdownByType)
                                  .sort(([typeA], [typeB]) => typeA.localeCompare(typeB))
                                  .map(([type, typeCount]) => (
                                    <li key={type} className="flex justify-between">
                                      <span>{type}:</span>
                                      <span className="font-semibold">{typeCount}</span>
                                    </li>
                                  ))}
                              </ul>
                            );
                          })()
                        ) : (
                          <ul className="space-y-1 text-sm text-gray-300 select-all">
                            {statusTrucks.sort((a, b) => a.name.localeCompare(b.name)).map(truck => (
                              <li key={truck.id}>{truck.name}</li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Ninguna</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
       <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fade-in-sm {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-sm {
          animation: fade-in-sm 0.2s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default StatusSummaryTable;
