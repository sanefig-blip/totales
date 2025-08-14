
import React, { useState, useMemo } from 'react';
import { Truck } from '../types.ts';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';

interface TypeSummaryTableProps {
  trucks: Truck[];
}

const TypeSummaryTable: React.FC<TypeSummaryTableProps> = ({ trucks }) => {
  const [isSectionExpanded, setIsSectionExpanded] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  const { groupedByType, typeOrder } = useMemo(() => {
    const groups = {} as Record<string, Truck[]>;
    trucks.forEach(truck => {
      const type = truck.type || 'Sin Tipo';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(truck);
    });

    const desiredTypeOrder = ['Autobomba', 'Cisterna', 'Unidad Liviana'];
    
    const sortedTypeOrder = Object.keys(groups).sort((a, b) => {
        const indexA = desiredTypeOrder.indexOf(a);
        const indexB = desiredTypeOrder.indexOf(b);

        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        if (indexA !== -1) {
            return -1;
        }
        if (indexB !== -1) {
            return 1;
        }
        return a.localeCompare(b);
    });

    return { groupedByType: groups, typeOrder: sortedTypeOrder };
  }, [trucks]);

  const toggleType = (type: string) => {
    setExpandedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
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
        <h2 className="text-3xl font-bold text-red-400">
          Resumen por Tipo de Unidad
        </h2>
        <ChevronDownIcon className={`w-6 h-6 text-gray-400 group-hover:text-white transition-transform duration-300 ${isSectionExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isSectionExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {typeOrder.map(type => {
            const typeTrucks = groupedByType[type];
            const count = typeTrucks.length;
            const isExpanded = expandedTypes.has(type);

            return (
              <div key={type} className="bg-gray-900/50 rounded-lg overflow-hidden transition-all duration-300">
                <button
                  onClick={() => toggleType(type)}
                  className={`w-full flex justify-between items-center p-4 text-left font-bold transition-colors duration-200 text-white ${isExpanded ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'}`}
                  aria-expanded={isExpanded}
                >
                  <span>{type} ({count})</span>
                  <ChevronDownIcon className={`h-5 w-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="p-4 bg-gray-900/30 max-h-48 overflow-y-auto animate-fade-in-sm">
                    {count > 0 ? (
                      <ul className="space-y-1 text-sm text-gray-300 select-all">
                        {typeTrucks.sort((a, b) => a.name.localeCompare(b.name)).map(truck => (
                          <li key={truck.id}>{truck.name}</li>
                        ))}
                      </ul>
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

export default TypeSummaryTable;
