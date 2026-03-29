import React, { useState, useEffect } from 'react';
import { Procedure, ProcedureCategory } from '../types';

interface ToothProcedure {
  id: string;
  toothNumber: number;
  faces: string[];
  procedureName: string;
  date: string;
  status: 'PLANNED' | 'DONE';
  procedureId: string;
}

interface ToothProps {
  number: number;
  isSelected?: boolean;
  onClick: (num: number) => void;
  status?: string;
  hasProcedures?: boolean;
}

const ToothIcon: React.FC<ToothProps> = ({ number, isSelected, onClick, status, hasProcedures }) => {
  return (
    <div 
      onClick={() => onClick(number)}
      className={`relative w-12 h-16 border-2 rounded-md transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
        isSelected ? 'border-sky-500 bg-sky-50 shadow-sm ring-1 ring-sky-200' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <span className={`text-[10px] font-bold absolute top-1 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`}>
        {number}
      </span>
      
      <div className="grid grid-cols-3 grid-rows-3 w-8 h-8 mt-2 relative">
        <div className="col-start-2 bg-slate-100 border border-slate-200"></div>
        <div className="row-start-2 bg-slate-100 border border-slate-200"></div>
        <div className="row-start-2 col-start-2 bg-slate-100 border border-slate-200 flex items-center justify-center">
           {status === 'CARIES' && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
           {status === 'IMPLANT' && <i className="fas fa-bolt text-[8px] text-sky-600"></i>}
           {hasProcedures && !status && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
        </div>
        <div className="row-start-2 col-start-3 bg-slate-100 border border-slate-200"></div>
        <div className="row-start-3 col-start-2 bg-slate-100 border border-slate-200"></div>
      </div>
    </div>
  );
};

interface OdontogramProps {
  plan?: any[];
  onProcedureAdd?: (proc: any) => void;
  onProcedureUpdate?: (proc: any) => void;
  onProcedureDelete?: (id: string) => void;
}

const Odontogram: React.FC<OdontogramProps> = ({ plan, onProcedureAdd, onProcedureUpdate, onProcedureDelete }) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [procedures, setProcedures] = useState<ToothProcedure[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcId, setEditingProcId] = useState<string | null>(null);
  
  const [availableProcedures, setAvailableProcedures] = useState<Procedure[]>(() => {
    const saved = localStorage.getItem('odontoflow_procedures');
    return saved ? JSON.parse(saved) : [];
  });

  const [newProc, setNewProc] = useState({
    procedureId: '',
    faces: [] as string[],
    status: 'DONE' as 'PLANNED' | 'DONE',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (plan && availableProcedures.length > 0) {
      const mapped = plan
        .filter(p => p.status !== 'CANCELADO' && p.tooth && p.tooth.trim() !== '')
        .map(p => ({
          id: p.id,
          toothNumber: parseInt(p.tooth!),
          faces: p.face && p.face !== '-' ? p.face.split('-').filter((f: string) => f.trim() !== '') : [],
          procedureName: p.description,
          date: p.date,
          status: p.status === 'REALIZADO' ? 'DONE' : 'PLANNED' as 'PLANNED' | 'DONE',
          procedureId: availableProcedures.find(ap => ap.name === p.description)?.id || ''
        }));
      setProcedures(mapped as ToothProcedure[]);
    }
  }, [plan, availableProcedures]);

  const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];

  const statuses = [
    { id: 'HEALTHY', label: 'Hígido', color: 'bg-white' },
    { id: 'CARIES', label: 'Cárie', color: 'bg-red-500' },
    { id: 'RESTORATION', label: 'Restauração', color: 'bg-sky-500' },
    { id: 'IMPLANT', label: 'Implante', color: 'bg-slate-800' },
    { id: 'MISSING', label: 'Ausente', color: 'bg-slate-200' },
  ];

  const handleOpenAddModal = () => {
    setEditingProcId(null);
    setNewProc({ 
      procedureId: '', 
      faces: [], 
      status: 'DONE',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proc: ToothProcedure) => {
    setEditingProcId(proc.id);
    setNewProc({
      procedureId: proc.procedureId,
      faces: proc.faces,
      status: proc.status,
      date: proc.date
    });
    setIsModalOpen(true);
  };

  const handleSaveProcedure = () => {
    if (!newProc.procedureId || !selectedTooth) return;

    const procTemplate = availableProcedures.find(p => p.id === newProc.procedureId);
    if (!procTemplate) return;

    if (editingProcId) {
      onProcedureUpdate?.({
        id: editingProcId,
        tooth: String(selectedTooth),
        face: newProc.faces.join('-') || '-',
        description: procTemplate.name,
        value: procTemplate.defaultValue,
        status: newProc.status === 'DONE' ? 'REALIZADO' : 'PLANEJADO',
        date: newProc.date
      });
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      onProcedureAdd?.({
        id: newId,
        tooth: String(selectedTooth),
        face: newProc.faces.join('-') || '-',
        description: procTemplate.name,
        value: procTemplate.defaultValue,
        status: newProc.status === 'DONE' ? 'REALIZADO' : 'PLANEJADO',
        date: newProc.date
      });
    }

    setIsModalOpen(false);
    setNewProc({ procedureId: '', faces: [], status: 'DONE', date: new Date().toISOString().split('T')[0] });
    setEditingProcId(null);
  };

  const toggleFace = (face: string) => {
    setNewProc(prev => ({
      ...prev,
      faces: prev.faces.includes(face) 
        ? prev.faces.filter(f => f !== face) 
        : [...prev.faces, face]
    }));
  };

  const displayDate = (d: string) => d.includes('-') ? d.split('-').reverse().join('/') : d;

  const currentToothProcedures = procedures.filter(p => p.toothNumber === selectedTooth);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Odontograma Interativo</h2>
          <p className="text-xs text-slate-500">Selecione um dente para visualizar o histórico ou adicionar procedimentos.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button className="px-4 py-1.5 text-xs font-bold bg-white text-sky-600 rounded-md shadow-sm">Adulto</button>
          <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Infantil</button>
        </div>
      </div>

      <div className="space-y-12 py-4">
        <div className="flex justify-center gap-1">
          <div className="flex gap-1 border-r-2 border-slate-100 pr-2">
            {upperRight.map(n => <ToothIcon key={n} number={n} isSelected={selectedTooth === n} onClick={setSelectedTooth} hasProcedures={procedures.some(p => p.toothNumber === n)} />)}
          </div>
          <div className="flex gap-1 pl-2">
            {upperLeft.map(n => <ToothIcon key={n} number={n} isSelected={selectedTooth === n} onClick={setSelectedTooth} hasProcedures={procedures.some(p => p.toothNumber === n)} />)}
          </div>
        </div>

        <div className="flex justify-center gap-1">
          <div className="flex gap-1 border-r-2 border-slate-100 pr-2">
            {lowerRight.map(n => <ToothIcon key={n} number={n} isSelected={selectedTooth === n} onClick={setSelectedTooth} hasProcedures={procedures.some(p => p.toothNumber === n)} />)}
          </div>
          <div className="flex gap-1 pl-2">
            {lowerLeft.map(n => <ToothIcon key={n} number={n} isSelected={selectedTooth === n} onClick={setSelectedTooth} hasProcedures={procedures.some(p => p.toothNumber === n)} />)}
          </div>
        </div>
      </div>

      {selectedTooth && (
        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in slide-in-from-bottom-4 duration-300">
           <div className="flex flex-col md:flex-row gap-8">
              <div className="shrink-0">
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">Dente Selecionado</p>
                 <div className="w-20 h-24 bg-white border-2 border-sky-500 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-sky-100 relative">
                    <span className="text-xl font-black text-sky-600">{selectedTooth}</span>
                    <div className="grid grid-cols-3 grid-rows-3 w-10 h-10 mt-2">
                      <div className={`col-start-2 border border-slate-200 ${newProc.faces.includes('V') ? 'bg-sky-400' : 'bg-slate-50'}`}></div>
                      <div className={`row-start-2 border border-slate-200 ${newProc.faces.includes('M') ? 'bg-sky-400' : 'bg-slate-50'}`}></div>
                      <div className={`row-start-2 col-start-2 border border-slate-200 ${newProc.faces.includes('O') ? 'bg-sky-400' : 'bg-slate-50'}`}></div>
                      <div className={`row-start-2 col-start-3 border border-slate-200 ${newProc.faces.includes('D') ? 'bg-sky-400' : 'bg-slate-50'}`}></div>
                      <div className={`row-start-3 col-start-2 border border-slate-200 ${newProc.faces.includes('L') ? 'bg-sky-400' : 'bg-slate-50'}`}></div>
                    </div>
                 </div>
              </div>

              <div className="flex-1 space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Procedimentos no Dente {selectedTooth}</h3>
                    <button 
                      onClick={handleOpenAddModal}
                      className="px-4 py-2 bg-sky-500 text-white rounded-lg text-xs font-bold shadow-md hover:bg-sky-600 transition-all flex items-center gap-2"
                    >
                      <i className="fas fa-plus"></i> Adicionar Procedimento
                    </button>
                 </div>

                 <div className="space-y-2">
                    {currentToothProcedures.length > 0 ? currentToothProcedures.map(p => (
                      <div key={p.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm group hover:border-sky-200 transition-colors">
                         <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${p.status === 'DONE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                            <div>
                               <p className="text-sm font-bold text-slate-700">{p.procedureName}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">
                                 {p.faces.length > 0 ? `Faces: ${p.faces.join(', ')}` : 'Face Única'} • {displayDate(p.date)}
                               </p>
                            </div>
                         </div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenEditModal(p)}
                              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            >
                              <i className="fas fa-edit text-xs"></i>
                            </button>
                            <button 
                              onClick={() => {
                                if(window.confirm('Excluir este procedimento do dente?')) {
                                  onProcedureDelete?.(p.id);
                                }
                              }}
                              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <i className="fas fa-trash text-xs"></i>
                            </button>
                         </div>
                      </div>
                    )) : (
                      <div className="py-8 text-center bg-white/50 rounded-xl border border-dashed border-slate-200">
                         <p className="text-sm text-slate-400 italic">Nenhum procedimento registrado para este dente.</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="mt-12 flex justify-center gap-8 flex-wrap border-t border-slate-50 pt-8">
        {statuses.map(s => (
          <div key={s.id} className="flex items-center gap-2 group cursor-help">
            <div className={`w-3 h-3 rounded-full ${s.color} border border-slate-200 group-hover:scale-125 transition-transform`}></div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{s.label}</span>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div>
                 <h3 className="font-bold text-slate-800 text-lg">
                   {editingProcId ? 'Editar Procedimento' : 'Lançar Procedimento'}
                 </h3>
                 <p className="text-xs text-slate-500">Dente: <span className="font-bold text-sky-600">{selectedTooth}</span></p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <i className="fas fa-times text-xl"></i>
               </button>
            </div>

            <div className="p-8 space-y-6 h-[500px] overflow-y-auto">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Procedimento Clínico</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                    value={newProc.procedureId}
                    onChange={(e) => setNewProc({...newProc, procedureId: e.target.value})}
                  >
                    <option value="">Selecione um serviço...</option>
                    {Array.from(new Set(availableProcedures.map(p => p.category))).map(cat => (
                      <optgroup key={cat} label={cat.toUpperCase()}>
                        {availableProcedures.filter(p => p.category === cat).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Faces Envolvidas</label>
                  <div className="flex justify-between gap-2">
                    {['V', 'M', 'O', 'D', 'L'].map(face => (
                      <button 
                        key={face}
                        onClick={() => toggleFace(face)}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                          newProc.faces.includes(face)
                          ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-100'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {face}
                        <p className="text-[8px] mt-0.5 opacity-60">
                          {face === 'V' ? 'Vestib.' : face === 'M' ? 'Mesial' : face === 'O' ? 'Oclusal' : face === 'D' ? 'Distal' : 'Lingual'}
                        </p>
                      </button>
                    ))}
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Status do Registro</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setNewProc({...newProc, status: 'DONE'})}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${
                        newProc.status === 'DONE' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >
                      <i className="fas fa-check-circle"></i> Realizado
                    </button>
                    <button 
                      onClick={() => setNewProc({...newProc, status: 'PLANNED'})}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${
                        newProc.status === 'PLANNED' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-100 text-slate-400'
                      }`}
                    >
                      <i className="fas fa-clock"></i> Planejado
                    </button>
                  </div>
               </div>

               {newProc.status === 'DONE' && (
                 <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Data de Realização</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      value={newProc.date.includes('/') ? newProc.date.split('/').reverse().join('-') : newProc.date}
                      onChange={e => setNewProc({...newProc, date: e.target.value})}
                    />
                 </div>
               )}
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveProcedure}
                disabled={!newProc.procedureId}
                className={`px-10 py-2.5 rounded-xl text-sm font-bold shadow-xl transition-all disabled:opacity-50 disabled:pointer-events-none ${
                  editingProcId ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100' : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-100'
                }`}
              >
                {editingProcId ? 'Salvar Alterações' : 'Confirmar Lançamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Odontogram;