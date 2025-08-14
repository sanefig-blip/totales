

import React, { useState, useMemo, useCallback } from 'react';
import { Truck, Status } from './types.ts';
import AssignmentModal from './components/AssignmentModal.tsx';
import MoveTruckModal from './components/MoveTruckModal.tsx';
import StatusUpdateModal from './components/StatusUpdateModal.tsx';
import StationSection from './components/StationSection.tsx';
import { detachmentParentMap, zoneOrder } from './data.ts';
import { DownloadIcon } from './components/icons/DownloadIcon.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import LoginModal from './components/LoginModal.tsx';
import { LogoutIcon } from './components/icons/LogoutIcon.tsx';
import { KeyIcon } from './components/icons/KeyIcon.tsx';
import ManageCodesModal from './components/ManageCodesModal.tsx';
import { BookIcon } from './components/icons/BookIcon.tsx';
import NomencladorModal from './components/NomencladorModal.tsx';
import { ClipboardListIcon } from './components/icons/ClipboardListIcon.tsx';
import LogModal from './components/LogModal.tsx';
import StatusSummaryTable from './components/StatusSummaryTable.tsx';
import TypeSummaryTable from './components/TypeSummaryTable.tsx';
import { UsersIcon } from './components/icons/UsersIcon.tsx';
import ManagePersonnelModal from './components/ManagePersonnelModal.tsx';
import { NumberIcon } from './components/icons/NumberIcon.tsx';
import ManageInternosModal from './components/ManageInternosModal.tsx';
import { ChevronDownIcon } from './components/icons/ChevronDownIcon.tsx';


// Type declarations for jsPDF and autoTable
declare global {
  interface Window {
    jspdf: any;
  }
}

const App: React.FC = () => {
  const { 
    currentUser, 
    logout, 
    permissions, 
    trucks,
    updateTruck,
    stationCrews,
    addFirefighter,
    removeFirefighter,
    personnel,
    updatePersonnel,
  } = useAuth();
  
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [movingTruck, setMovingTruck] = useState<Truck | null>(null);
  const [statusUpdatingTruck, setStatusUpdatingTruck] = useState<Truck | null>(null);
  const [isManageCodesModalOpen, setManageCodesModalOpen] = useState(false);
  const [isNomencladorModalOpen, setNomencladorModalOpen] = useState(false);
  const [isPersonnelModalOpen, setPersonnelModalOpen] = useState(false);
  const [isLogModalOpen, setLogModalOpen] = useState(false);
  const [isInternosModalOpen, setInternosModalOpen] = useState(false);
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({});

  const isZoneExpanded = useCallback((zone: string) => {
    return expandedZones[zone] !== false; // Default to true (expanded)
  }, [expandedZones]);

  const toggleZone = useCallback((zone: string) => {
    setExpandedZones(prev => ({
      ...prev,
      [zone]: !isZoneExpanded(zone)
    }));
  }, [isZoneExpanded]);

  const operationalUnitsBreakdown = useMemo(() => {
    const operationalTrucks = trucks.filter(
      (truck) => truck.status === 'Para Servicio' || truck.status === 'Reserva'
    );
    
    const total = operationalTrucks.length;
    const autobombas = operationalTrucks.filter(t => t.type === 'Autobomba').length;
    const cisternas = operationalTrucks.filter(t => t.type === 'Cisterna').length;
    const heavyTotal = autobombas + cisternas;

    return { total, autobombas, cisternas, heavyTotal };
  }, [trucks]);
  
  const paraServicioBreakdown = useMemo(() => {
    const paraServicioTrucks = trucks.filter(
      (truck) => truck.status === 'Para Servicio'
    );
    
    const autobombas = paraServicioTrucks.filter(t => t.type === 'Autobomba').length;
    const cisternas = paraServicioTrucks.filter(t => t.type === 'Cisterna').length;

    return { autobombas, cisternas };
  }, [trucks]);

  const handleSave = useCallback((id: string, officer: Truck['officer'], personnelCount: number, personnelList: string[]) => {
    const truck = trucks.find(t => t.id === id);
    if (!truck) return;

    // Check if the officer's interno has been updated and save it to the main personnel DB
    if (officer && officer.lp) {
        const originalPerson = personnel.find(p => p.lp === officer.lp);
        if (originalPerson && originalPerson.interno !== officer.interno) {
            updatePersonnel(officer.lp, { ...originalPerson, interno: officer.interno });
        }
    }

    let logMessage = '';
    if (officer?.name && officer.name !== truck.officer?.name) {
        const pocText = officer.poc ? `, POC: ${officer.poc}` : '';
        logMessage = `Asignó a ${officer.hierarchy} ${officer.name} (LP: ${officer.lp}${pocText}) con ${personnelCount} efectivos a la unidad ${truck.name}.`;
    } else {
        logMessage = `Actualizó la asignación de la unidad ${truck.name}.`;
    }

    const nameParts = officer?.name.split(' ') || [];
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ');

    const fullOfficerData = officer ? { ...officer, firstName, lastName } : undefined;

    updateTruck(id, { officer: fullOfficerData, personnel: personnelCount, personnelList }, logMessage);
    setEditingTruck(null);
  }, [trucks, updateTruck, personnel, updatePersonnel]);

  const handleClear = useCallback((id: string) => {
    const truck = trucks.find(t => t.id === id);
    if (!truck) return;
    const logMessage = `Quitó la asignación de la unidad ${truck.name}.`;
    updateTruck(id, { officer: undefined, personnel: undefined, personnelList: [] }, logMessage);
  }, [trucks, updateTruck]);

  const handleOpenModal = useCallback((truck: Truck) => {
    setEditingTruck(truck);
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditingTruck(null);
  }, []);

  const handleOpenMoveModal = useCallback((truck: Truck) => {
    setMovingTruck(truck);
  }, []);

  const handleCloseMoveModal = useCallback(() => {
    setMovingTruck(null);
  }, []);

  const handleConfirmMove = useCallback((truckId: string, newStation: string) => {
    const truckToMove = trucks.find(t => t.id === truckId);
    const destinationTruck = trucks.find(t => t.station === newStation);
    if (!truckToMove || !destinationTruck) return;
    const newZone = destinationTruck.zone;

    const logMessage = `Movió la unidad ${truckToMove.name} de ${truckToMove.station} a ${newStation}.`;
    updateTruck(truckId, { station: newStation, zone: newZone }, logMessage);
    handleCloseMoveModal();
  }, [trucks, updateTruck, handleCloseMoveModal]);

  const handleOpenStatusModal = useCallback((truck: Truck) => {
    setStatusUpdatingTruck(truck);
  }, []);

  const handleCloseStatusModal = useCallback(() => {
    setStatusUpdatingTruck(null);
  }, []);
  
  const handleConfirmStatusUpdate = useCallback((truckId: string, status: Status, reason?: string) => {
    const truck = trucks.find(t => t.id === truckId);
    if (!truck) return;
    
    const reasonText = reason ? ` (Motivo: ${reason})` : '';
    const logMessage = `Cambió el estado de la unidad ${truck.name} a "${status}"${reasonText}.`;
    
    const updatedData: Partial<Truck> = { status };
    if (['Reserva', 'Fuera de Servicio'].includes(status)) {
        updatedData.statusReason = reason;
    } else {
        updatedData.statusReason = undefined;
    }

    updateTruck(truckId, updatedData, logMessage);
    handleCloseStatusModal();
  }, [trucks, updateTruck, handleCloseStatusModal]);

  const groupedData = useMemo(() => {
    type StationGroup = {
      trucks: Truck[];
      detachments: Record<string, Truck[]>;
    };
    const groups: Record<string, Record<string, StationGroup>> = {};
    const stationOrder: Record<string, string[]> = {};
    
    const statusOrder: Record<Status, number> = {
      'Unidad Integrando Fuerza o Servicio': 0,
      'Para Servicio': 1,
      'Reserva': 2,
      'Alternativa': 3,
      'A Préstamo': 4,
      'Fuera de Servicio': 5,
    };

    trucks.forEach(truck => {
      let zone = truck.zone || 'SIN ZONA';
      const station = truck.station || 'SIN ESTACIÓN';

      if (station === 'DIV. B.E.FE.R.') {
        zone = 'DIVISIÓN B.E.FE.R.';
      }
      
      const parentStationName = detachmentParentMap[station];

      if (parentStationName) { // This is a detachment truck
        if (!groups[zone]) {
          groups[zone] = {};
          stationOrder[zone] = [];
        }
        if (!groups[zone][parentStationName]) {
          groups[zone][parentStationName] = { trucks: [], detachments: {} };
          if (!stationOrder[zone].includes(parentStationName)) {
            stationOrder[zone].push(parentStationName);
          }
        }
        if (!groups[zone][parentStationName].detachments[station]) {
          groups[zone][parentStationName].detachments[station] = [];
        }
        groups[zone][parentStationName].detachments[station].push(truck);
      } else { // This is a main station truck
        if (!groups[zone]) {
          groups[zone] = {};
          stationOrder[zone] = [];
        }
        if (!groups[zone][station]) {
          groups[zone][station] = { trucks: [], detachments: {} };
           if(!stationOrder[zone].includes(station)) {
              stationOrder[zone].push(station);
          }
        }
        groups[zone][station].trucks.push(truck);
      }
    });
    
    const sortFunction = (a: Truck, b: Truck) => {
        const aHasOfficer = a.officer && a.officer.name.trim() !== '' ? 0 : 1;
        const bHasOfficer = b.officer && b.officer.name.trim() !== '' ? 0 : 1;
        if (aHasOfficer !== bHasOfficer) {
            return aHasOfficer - bHasOfficer;
        }
        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
    };

    for (const zone of Object.keys(groups)) {
      for (const stationName of Object.keys(groups[zone])) {
        const stationGroup = groups[zone][stationName];
        stationGroup.trucks.sort(sortFunction);
        for (const detachmentName of Object.keys(stationGroup.detachments)) {
          stationGroup.detachments[detachmentName].sort(sortFunction);
        }
      }
    }
    
    const sortedZoneKeys = Object.keys(groups).sort((a, b) => {
      const indexA = zoneOrder.indexOf(a);
      const indexB = zoneOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    const sortedGroups: Record<string, Record<string, StationGroup>> = {};
    for (const key of sortedZoneKeys) {
        if (!stationOrder[key]) continue;
        const sortedStations = stationOrder[key].sort((a, b) => {
            if (a === 'DIV. B.E.FE.R.') return 1;
            if (b === 'DIV. B.E.FE.R.') return -1;
            return a.localeCompare(b);
        });
        sortedGroups[key] = {};
        for (const stationKey of sortedStations) {
            sortedGroups[key][stationKey] = groups[key][stationKey];
        }
    }

    return { groups: sortedGroups, stationOrder };
  }, [trucks]);

  const generatePdf = useCallback(() => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');

    const statusColors: Record<Status, [number, number, number] | null> = {
      'Unidad Integrando Fuerza o Servicio': [139, 92, 246],
      'Para Servicio': [255, 255, 255],
      'Reserva': [34, 197, 94],
      'Alternativa': [250, 204, 21],
      'A Préstamo': [59, 130, 246],
      'Fuera de Servicio': [239, 68, 68],
    };

    const addHeader = (docInstance: any) => {
      docInstance.setFontSize(18);
      docInstance.setTextColor(239, 68, 68);
      docInstance.text('Reporte de Unidades de Bomberos', 40, 50);
      docInstance.setFontSize(10);
      docInstance.setTextColor(156, 163, 175);
      const dateText = new Date().toLocaleString('es-AR');
      docInstance.text(dateText, docInstance.internal.pageSize.getWidth() - 40, 50, { align: 'right' });
      docInstance.setDrawColor(107, 114, 128);
      docInstance.setLineWidth(0.5);
      docInstance.line(40, 60, docInstance.internal.pageSize.getWidth() - 40, 60);
    };

    addHeader(doc);

    const { groups, stationOrder } = groupedData;
    const allTrucksForPdf: (Truck | { isHeader: true; title: string, level: 'zone' | 'station' })[] = [];

    Object.keys(groups).forEach(zone => {
      allTrucksForPdf.push({ isHeader: true, title: zone, level: 'zone' });

      (stationOrder[zone] || []).forEach(stationName => {
        const stationData = groups[zone][stationName];
        if (!stationData) return;

        if (stationData.trucks.length > 0) {
          allTrucksForPdf.push({ isHeader: true, title: stationName, level: 'station' });
          allTrucksForPdf.push(...stationData.trucks);
        }

        Object.entries(stationData.detachments).forEach(([detachmentName, detachmentTrucks]) => {
          if (detachmentTrucks.length > 0) {
            allTrucksForPdf.push({ isHeader: true, title: detachmentName, level: 'station' });
            allTrucksForPdf.push(...detachmentTrucks);
          }
        });
      });
    });

    const body = allTrucksForPdf.map(item => {
      if ('isHeader' in item) {
        return [{ content: item.title, colSpan: 6, styles: {
          fillColor: item.level === 'zone' ? [127, 29, 29] : [55, 65, 81],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: item.level === 'zone' ? 14 : 11,
        } }];
      }
      const truck = item;
      const officerText = truck.officer ? `${truck.officer.hierarchy} ${truck.officer.name}` : 'Sin Asignación';
      const personnelText = truck.personnel ? truck.personnel.toString() : '-';
      let statusText: string = truck.status;
      if ((truck.status === 'Reserva' || truck.status === 'Fuera de Servicio') && truck.statusReason) {
        statusText = `${truck.status} - ${truck.statusReason}`;
      }
      return ['', truck.name, truck.type || '-', statusText, officerText, personnelText];
    });

    doc.autoTable({
      startY: 80,
      head: [[{ content: '', styles: { cellWidth: 10 } }, 'Unidad', 'Tipo', 'Estado', 'Oficial a Cargo', 'Personal']],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: 'bold' },
      styles: {
        fillColor: [31, 41, 55],
        textColor: [209, 213, 219],
        lineColor: [55, 65, 81],
        lineWidth: 0.5,
      },
      didDrawCell: (data: any) => {
        const item = allTrucksForPdf[data.row.index];
        if (data.column.index === 0 && data.row.section === 'body' && item && !('isHeader' in item)) {
          const color = statusColors[item.status];
          if (color) {
            doc.setFillColor(...color);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          }
        }
      },
      didDrawPage: (data: any) => {
        addHeader(data.doc);
      },
      margin: { top: 70 },
    });

    doc.save('reporte_unidades.pdf');
  }, [groupedData]);


  const destinationStations = useMemo(() => {
     const allZones = Array.from(new Set(trucks.map(t => t.zone)));
     return allZones.map(zone => ({
         zone,
         stations: Array.from(new Set(trucks.filter(t => t.zone === zone).map(t => t.station)))
     }));
  }, [trucks]);
  
  if (!currentUser) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-40 border-b border-gray-700">
        <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-red-500">UNIDADES DE BOMBEROS</h1>
            <div className="hidden sm:flex items-center gap-4">
                 <button onClick={() => setNomencladorModalOpen(true)} disabled={!permissions.canManageNomenclador} className="toolbar-button disabled:opacity-50 disabled:cursor-not-allowed">
                    <BookIcon className="w-5 h-5"/> Nomenclador
                </button>
                 <button onClick={() => setPersonnelModalOpen(true)} disabled={!permissions.canManagePersonnel} className="toolbar-button disabled:opacity-50 disabled:cursor-not-allowed">
                    <UsersIcon className="w-5 h-5"/> Personal
                </button>
                 <button onClick={() => setInternosModalOpen(true)} disabled={!permissions.canManageInternos} className="toolbar-button disabled:opacity-50 disabled:cursor-not-allowed">
                    <NumberIcon className="w-5 h-5"/> Internos
                </button>
                <button onClick={() => setLogModalOpen(true)} disabled={!permissions.canViewLogs} className="toolbar-button disabled:opacity-50 disabled:cursor-not-allowed">
                    <ClipboardListIcon className="w-5 h-5"/> Registros
                </button>
                 <button onClick={generatePdf} disabled={!permissions.canGeneratePdf} className="toolbar-button disabled:opacity-50 disabled:cursor-not-allowed">
                    <DownloadIcon className="w-5 h-5"/> PDF
                </button>
            </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-white">{currentUser.name}</p>
            <p className="text-xs text-gray-400">{currentUser.role}</p>
          </div>
          {permissions.canManageNomenclador && (
             <button onClick={() => setManageCodesModalOpen(true)} className="toolbar-button-icon" aria-label="Gestionar Códigos">
                <KeyIcon className="w-5 h-5"/>
            </button>
          )}
          <button onClick={logout} className="toolbar-button-icon" aria-label="Cerrar sesión">
            <LogoutIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 md:p-8">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StatusSummaryTable
              trucks={trucks}
              operationalUnitsCount={operationalUnitsBreakdown.total}
              operationalAutobombas={operationalUnitsBreakdown.autobombas}
              operationalCisternas={operationalUnitsBreakdown.cisternas}
              operationalHeavyUnits={operationalUnitsBreakdown.heavyTotal}
            />
            <TypeSummaryTable trucks={trucks} />
          </div>

        <div className="mt-10 space-y-8">
          {Object.entries(groupedData.groups).map(([zone, stations]) => {
            const isExpanded = isZoneExpanded(zone);
            return (
              <section key={zone}>
                 <button onClick={() => toggleZone(zone)} className="w-full text-left flex justify-between items-center group mb-6 transition-colors p-2 rounded-lg hover:bg-gray-800/50">
                    <h2 className="text-3xl font-bold text-red-500 pb-2 border-b-2 border-red-500/30 group-hover:border-red-500 transition-colors">
                        {zone}
                    </h2>
                    <ChevronDownIcon className={`w-8 h-8 text-gray-500 group-hover:text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                {isExpanded && (
                    <div className="space-y-8 animate-fade-in">
                    {Object.entries(stations).map(([stationName, stationData]) => (
                      <StationSection
                        key={stationName}
                        stationName={stationName}
                        trucks={stationData.trucks}
                        detachments={stationData.detachments}
                        firefighters={stationCrews[stationName] || []}
                        onEditTruck={handleOpenModal}
                        onClearTruck={handleClear}
                        onMoveTruck={handleOpenMoveModal}
                        onOpenStatusModal={handleOpenStatusModal}
                        onAddFirefighter={addFirefighter}
                        onRemoveFirefighter={removeFirefighter}
                      />
                    ))}
                    </div>
                )}
              </section>
            );
          })}
        </div>
      </main>

      {editingTruck && (
        <AssignmentModal 
          isOpen={!!editingTruck} 
          onClose={handleCloseModal} 
          onSave={handleSave}
          truck={editingTruck} 
        />
      )}
      
      {movingTruck && (
        <MoveTruckModal
            isOpen={!!movingTruck}
            onClose={handleCloseMoveModal}
            onSave={handleConfirmMove}
            truck={movingTruck}
            destinations={destinationStations}
        />
      )}
      
      {statusUpdatingTruck && (
          <StatusUpdateModal 
              isOpen={!!statusUpdatingTruck}
              onClose={handleCloseStatusModal}
              onSave={handleConfirmStatusUpdate}
              truck={statusUpdatingTruck}
          />
      )}
      
      {isManageCodesModalOpen && permissions.canManageNomenclador && (
        <ManageCodesModal isOpen={isManageCodesModalOpen} onClose={() => setManageCodesModalOpen(false)} />
      )}
      
      {isNomencladorModalOpen && permissions.canManageNomenclador && (
        <NomencladorModal isOpen={isNomencladorModalOpen} onClose={() => setNomencladorModalOpen(false)} />
      )}

      {isLogModalOpen && permissions.canViewLogs && (
          <LogModal isOpen={isLogModalOpen} onClose={() => setLogModalOpen(false)} />
      )}

       {isPersonnelModalOpen && permissions.canManagePersonnel && (
          <ManagePersonnelModal isOpen={isPersonnelModalOpen} onClose={() => setPersonnelModalOpen(false)} />
      )}

       {isInternosModalOpen && permissions.canManageInternos && (
          <ManageInternosModal isOpen={isInternosModalOpen} onClose={() => setInternosModalOpen(false)} />
       )}


      <style>{`
          .toolbar-button {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              background-color: rgb(55 65 81 / 1);
              padding: 0.5rem 1rem;
              border-radius: 0.375rem;
              font-weight: 600;
              font-size: 0.875rem;
              color: rgb(209 213 219 / 1);
              transition: background-color 0.2s;
          }
          .toolbar-button:hover:not(:disabled) {
              background-color: rgb(75 85 99 / 1);
          }
          .toolbar-button-icon {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              background-color: rgb(55 65 81 / 1);
              padding: 0.6rem;
              border-radius: 0.375rem;
              color: rgb(209 213 219 / 1);
              transition: background-color 0.2s;
          }
           .toolbar-button-icon:hover {
              background-color: rgb(75 85 99 / 1);
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default App;