
import React from 'react';
import { Truck } from '../types.ts';
import TruckCard from './TruckCard.tsx';

interface TruckListProps {
  trucks: Truck[];
  onEdit: (truck: Truck) => void;
  onClear: (id: string) => void;
  onMove: (truck: Truck) => void;
  onOpenStatusModal: (truck: Truck) => void;
}

const TruckList: React.FC<TruckListProps> = ({ trucks, onEdit, onClear, onMove, onOpenStatusModal }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {trucks.map(truck => (
        <TruckCard key={truck.id} truck={truck} onEdit={onEdit} onClear={onClear} onMove={onMove} onOpenStatusModal={onOpenStatusModal} />
      ))}
    </div>
  );
};

export default TruckList;