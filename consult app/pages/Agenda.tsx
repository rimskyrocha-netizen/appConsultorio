import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole, Patient } from '../types';

interface Appointment {
  id: string;
  patientName: string;
  type: string;
  time: string;
  date: string;
  dentistId: string;
  color: string;
  textColor: string;
  bgColor: string;
  isBlock?: boolean;
}

const INITIAL_APPOINTMENTS: Appointment[] = [];

const Agenda: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('day');
  
  // Carrega os agendamentos do localStorage na inicialização
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('odontoflow_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const savedPatients = localStorage.getItem('odontoflow_patients');
    if (savedPatients) setPatients(JSON.parse(savedPatients));
  }, []);

  // Salva no localStorage sempre que o estado de appointments mudar
  useEffect(() => {
    localStorage.setItem('odontoflow_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Lista dinâmica de dentistas/admins baseada nos usuários cadastrados
  const dentists = useMemo(() => {
    const savedUsers = localStorage.getItem('odontoflow_users');
    const INITIAL_USERS_LIST: User[] = [
      { id: 'u1', name: 'Dr. Roberto Santos', email: 'roberto@odontoflow.com', role: UserRole.ADMIN, tenantId: 't1', status: 'ACTIVE', cro: '123456', state: 'SP', city: 'São Paulo' },
      { id: 'u2', name: 'Dra. Marina Costa', email: 'marina@odontoflow.com', role: UserRole.DENTIST, tenantId: 't1', status: 'ACTIVE', specialty: 'Ortodontia', cro: '654321', state: 'SP', city: 'São Paulo' },
      { id: 'u3', name: 'Camila Ferreira', email: 'camila@odontoflow.com', role: UserRole.RECEPTION, tenantId: 't1', status: 'ACTIVE' },
      { id: 'u4', name: 'Joaquim Silva', email: 'financeiro@odontoflow.com', role: UserRole.FINANCIAL, tenantId: 't1', status: 'ACTIVE' },
      { id: 'u5', name: 'Luciana Mello', email: 'luciana@odontoflow.com', role: UserRole.ASSISTANT, tenantId: 't1', status: 'ACTIVE' },
    ];
    
    let allUsers: User[] = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS_LIST;
    
    // Filtra apenas Dentistas e Administradores ativos
    const filtered = allUsers.filter(u => 
      (u.role === UserRole.DENTIST || u.role === UserRole.ADMIN) && 
      u.status === 'ACTIVE'
    );

    const colorSchemes = [
      { color: 'border-sky-500', textColor: 'text-sky-800', bgColor: 'bg-sky-50' },
      { color: 'border-emerald-500', textColor: 'text-emerald-800', bgColor: 'bg-emerald-50' },
      { color: 'border-amber-500', textColor: 'text-amber-800', bgColor: 'bg-amber-50' },
      { color: 'border-indigo-500', textColor: 'text-indigo-800', bgColor: 'bg-indigo-50' },
      { color: 'border-rose-500', textColor: 'text-rose-800', bgColor: 'bg-rose-50' },
    ];

    return filtered.map((u, i) => ({
      id: u.id,
      name: u.name,
      ...colorSchemes[i % colorSchemes.length]
    }));
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'APPOINTMENT' | 'BLOCK'>('APPOINTMENT');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [formData, setFormData] = useState({
    patientName: '',
    type: 'Avaliação',
    time: '08:00',
    date: new Date().toISOString().split('T')[0],
    dentistId: dentists[0]?.id || '',
    blockReason: 'Outro'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + direction);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (direction * 7));
    else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + direction);
    else if (viewMode === 'year') newDate.setFullYear(newDate.getFullYear() + direction);
    setCurrentDate(newDate);
  };

  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); 
    start.setDate(diff);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        id: i,
        name: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        fullDate: d.toISOString().split('T')[0]
      };
    });
  }, [currentDate]);

  const subheaderText = useMemo(() => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (viewMode === 'week') {
      return `${weekDays[0].date} - ${weekDays[6].date}, ${currentDate.getFullYear()}`;
    }
    if (viewMode === 'year') {
      return `Calendário de ${currentDate.getFullYear()}`;
    }
    return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, [viewMode, currentDate, weekDays]);

  const columns = useMemo(() => {
    if (viewMode === 'day') return dentists;
    if (viewMode === 'week') return weekDays.map(d => ({ id: d.id.toString(), name: d.name, date: d.date, fullDate: d.fullDate }));
    return [];
  }, [viewMode, weekDays, dentists]);

  useEffect(() => {
    const state = location.state as { openScheduleModal?: boolean; patientName?: string };
    if (state?.openScheduleModal) {
      setModalType('APPOINTMENT');
      setFormData(prev => ({
        ...prev,
        patientName: state.patientName || '',
        date: currentDate.toISOString().split('T')[0],
        dentistId: prev.dentistId || dentists[0]?.id || ''
      }));
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.pathname, location.state, dentists, currentDate]);

  const handleOpenModal = (type: 'APPOINTMENT' | 'BLOCK' = 'APPOINTMENT', dateStr?: string, timeStr?: string, dentistId?: string) => {
    setModalType(type);
    setErrors({});
    setFormData({
      patientName: '',
      type: 'Avaliação',
      date: dateStr || currentDate.toISOString().split('T')[0],
      time: timeStr || '08:00',
      dentistId: dentistId || dentists[0]?.id || '',
      blockReason: 'Outro'
    });
    setIsModalOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (modalType === 'APPOINTMENT' && !formData.patientName.trim()) {
      newErrors.patientName = 'Nome do paciente é obrigatório';
    }
    
    const hasOverlap = appointments.some(app => app.time === formData.time && app.dentistId === formData.dentistId && app.date === formData.date);
    if (hasOverlap) {
      newErrors.time = 'Este horário já está ocupado para este profissional nesta data';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const selectedDentist = dentists.find(c => c.id === formData.dentistId);
    
    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientName: modalType === 'BLOCK' ? `BLOQUEIO: ${formData.blockReason.toUpperCase()}` : formData.patientName,
      type: modalType === 'BLOCK' ? 'Indisponibilidade' : formData.type,
      time: formData.time,
      date: formData.date,
      dentistId: formData.dentistId,
      isBlock: modalType === 'BLOCK',
      color: modalType === 'BLOCK' ? 'border-slate-400' : (selectedDentist?.color || 'border-slate-500'),
      textColor: modalType === 'BLOCK' ? 'text-slate-500' : (selectedDentist?.textColor || 'text-slate-800'),
      bgColor: modalType === 'BLOCK' ? 'bg-slate-100' : (selectedDentist?.bgColor || 'bg-slate-50')
    };

    setAppointments([...appointments, newAppointment]);
    setIsModalOpen(false);
  };

  const handleDeleteAppointment = (id: string) => {
    if (window.confirm('Deseja remover definitivamente este item da agenda?')) {
      setAppointments(appointments.filter(app => app.id !== id));
    }
  };

  const handleViewRecord = (name: string) => {
    const found = patients.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (found) {
      navigate(`/pacientes/${found.id}`);
    } else {
      alert('Paciente não encontrado no cadastro base.');
    }
  };

  const getAppointmentsForSlot = (time: string, colId: string, colFullDate?: string) => {
    const targetDate = colFullDate || currentDate.toISOString().split('T')[0];
    if (viewMode === 'day') {
      return appointments.filter(app => app.time === time && app.dentistId === colId && app.date === targetDate);
    } else if (viewMode === 'week') {
      return appointments.filter(app => app.time === time && app.date === colFullDate);
    }
    return [];
  };

  const handleExport = () => {
    if (appointments.length === 0) return;
    const headers = ['ID', 'Paciente/Motivo', 'Tipo', 'Horário', 'Data', 'Dentista', 'Bloqueio'];
    const csvContent = [
      headers.join(';'),
      ...appointments.map(app => {
        const dentist = dentists.find(c => c.id === app.dentistId)?.name || 'N/A';
        return [
          app.id,
          `"${app.patientName}"`,
          `"${app.type}"`,
          app.time,
          app.date,
          `"${dentist}"`,
          app.isBlock ? 'SIM' : 'NÃO'
        ].join(';');
      })
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `agenda_consultorio_rimsky_yoko_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button onClick={() => navigateDate(-1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              Hoje
            </button>
            <button onClick={() => navigateDate(1)} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
              Agenda {viewMode === 'day' ? 'Diária' : viewMode === 'week' ? 'Semanal' : viewMode === 'month' ? 'Mensal' : 'Anual'}
            </h1>
            <p className="text-sm text-slate-500 capitalize">{subheaderText}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 overflow-x-auto max-w-full">
             <button onClick={() => setViewMode('day')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all shrink-0 ${viewMode === 'day' ? 'bg-slate-100 shadow-sm text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}>Dia</button>
             <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all shrink-0 ${viewMode === 'week' ? 'bg-slate-100 shadow-sm text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}>Semana</button>
             <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all shrink-0 ${viewMode === 'month' ? 'bg-slate-100 shadow-sm text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}>Mês</button>
             <button onClick={() => setViewMode('year')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all shrink-0 ${viewMode === 'year' ? 'bg-slate-100 shadow-sm text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}>Ano</button>
          </div>
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
            <i className="fas fa-file-export"></i> <span className="hidden sm:inline">Exportar CSV</span>
          </button>
          <div className="flex gap-2">
            <button onClick={() => handleOpenModal('BLOCK')} className="px-4 py-2 border border-slate-200 text-slate-600 bg-white rounded-lg text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
               <i className="fas fa-ban text-rose-400"></i> Bloquear
            </button>
            <button onClick={() => handleOpenModal('APPOINTMENT')} className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-sky-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
               <i className="fas fa-plus"></i> Agendar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto min-h-[600px] custom-scrollbar">
        {viewMode === 'day' || viewMode === 'week' ? (
          <div className="min-w-[800px]">
            <div className={`grid ${viewMode === 'day' ? `grid-cols-${columns.length + 1}` : 'grid-cols-8'} border-b border-slate-200`}>
               <div className="p-4 border-r border-slate-100 bg-slate-50 flex items-center justify-center">
                 <i className="far fa-clock text-slate-400"></i>
               </div>
               {columns.map(col => (
                 <div key={col.id} className="p-4 text-center border-r border-slate-100 last:border-r-0">
                    <p className="font-bold text-slate-800 truncate">{col.name}</p>
                    {viewMode === 'day' ? (
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Profissional</p>
                    ) : (
                      <p className="text-[10px] text-sky-500 font-bold mt-1">{(col as any).date}</p>
                    )}
                 </div>
               ))}
            </div>

            <div className="flex flex-col">
              {times.map(time => (
                <div key={time} className={`grid ${viewMode === 'day' ? `grid-cols-${columns.length + 1}` : 'grid-cols-8'} group h-20`}>
                   <div className="p-4 border-r border-slate-100 bg-slate-50 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-400">{time}</span>
                   </div>
                   
                   {columns.map(col => (
                     <div key={col.id} className="relative border-r border-slate-100 border-b border-slate-100 last:border-r-0 group-hover:bg-slate-50/30 transition-colors">
                        {getAppointmentsForSlot(time, col.id, (col as any).fullDate).map(app => (
                          <div key={app.id} className={`absolute inset-1 ${app.bgColor} border-l-4 ${app.color} rounded p-1.5 z-10 cursor-pointer shadow-sm hover:shadow-md transition-all overflow-hidden ${app.isBlock ? 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.02)_10px,rgba(0,0,0,0.02)_20px)]' : ''}`}>
                             <div className="flex items-start justify-between h-full">
                                <div className="flex-1 min-w-0">
                                   <p className={`text-[10px] font-bold ${app.textColor} truncate`}>
                                     {app.isBlock && <i className="fas fa-lock mr-1 opacity-60"></i>}
                                     {app.patientName}
                                   </p>
                                   {viewMode === 'day' && <p className={`text-[9px] opacity-80 ${app.textColor} truncate`}>{app.type}</p>}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteAppointment(app.id); }} className="text-[9px] text-slate-400 hover:text-rose-500 transition-colors p-0.5">
                                     <i className="fas fa-times"></i>
                                  </button>
                                  {!app.isBlock && (
                                    <button onClick={(e) => { e.stopPropagation(); handleViewRecord(app.patientName); }} className="text-[9px] text-slate-400 hover:text-sky-600 transition-colors p-0.5" title="Ver Prontuário">
                                       <i className="fas fa-folder-open"></i>
                                    </button>
                                  )}
                                </div>
                             </div>
                          </div>
                        ))}
                        {getAppointmentsForSlot(time, col.id, (col as any).fullDate).length === 0 && (
                          <button onClick={() => handleOpenModal('APPOINTMENT', (col as any).fullDate, time, col.id)} className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center text-sky-300 hover:text-sky-500 transition-all">
                             <i className="fas fa-plus-circle text-lg"></i>
                          </button>
                        )}
                     </div>
                   ))}
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'month' ? (
          <div className="p-4 lg:p-6 min-w-[700px]">
            <div className="grid grid-cols-7 border-b border-slate-100 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="p-3 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-lg overflow-hidden">
               {Array.from({ length: 35 }).map((_, i) => {
                 const currentMonth = currentDate.getMonth();
                 const firstDay = new Date(currentDate.getFullYear(), currentMonth, 1).getDay();
                 const dayNum = i - firstDay + 1;
                 const daysInMonth = new Date(currentDate.getFullYear(), currentMonth + 1, 0).getDate();
                 
                 const cellDateStr = dayNum > 0 && dayNum <= daysInMonth 
                    ? new Date(currentDate.getFullYear(), currentMonth, dayNum).toISOString().split('T')[0]
                    : null;

                 return (
                   <div key={i} className="min-h-[100px] lg:min-h-[120px] bg-white p-2 lg:p-3 hover:bg-slate-50 transition-colors relative group">
                      {dayNum > 0 && dayNum <= daysInMonth && (
                        <>
                          <span className={`text-xs font-bold ${dayNum === new Date().getDate() && currentMonth === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear() ? 'bg-sky-500 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
                            {dayNum}
                          </span>
                          <div className="mt-2 space-y-1">
                             {appointments.filter(app => app.date === cellDateStr).slice(0, 3).map(app => (
                               <div key={app.id} className={`${app.bgColor} ${app.textColor} text-[8px] lg:text-[9px] p-1 rounded border-l-2 ${app.color} truncate font-bold flex items-center justify-between group/item`}>
                                 <span className="truncate" onClick={() => !app.isBlock && handleViewRecord(app.patientName)}>{app.time} {app.patientName}</span>
                                 <button onClick={(e) => { e.stopPropagation(); handleDeleteAppointment(app.id); }} className="ml-1 opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-rose-500 transition-all p-0.5">
                                    <i className="fas fa-times text-[8px]"></i>
                                 </button>
                               </div>
                             ))}
                          </div>
                          <button onClick={() => handleOpenModal('APPOINTMENT', cellDateStr!)} className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 p-1 lg:p-1.5 bg-slate-50 text-slate-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-sky-50 hover:text-sky-600">
                             <i className="fas fa-plus text-[10px]"></i>
                          </button>
                        </>
                      )}
                   </div>
                 );
               })}
            </div>
          </div>
        ) : (
          <div className="p-4 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {months.map((month, index) => (
                <div key={month} className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:shadow-md transition-all cursor-pointer group" onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(index);
                  setCurrentDate(newDate);
                  setViewMode('month');
                }}>
                  <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3 flex items-center justify-between">
                    {month}
                    <span className="text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Ver Mês</span>
                  </h3>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 31 }).map((_, d) => {
                      const dayVal = d + 1;
                      const isCurrentDay = dayVal === new Date().getDate() && index === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                      return (
                        <div key={d} className={`w-full aspect-square rounded-sm flex items-center justify-center text-[8px] font-bold ${isCurrentDay ? 'bg-sky-500 text-white' : 'text-slate-400'}`}>
                          {dayVal}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {appointments.filter(app => {
                          const appDate = new Date(app.date);
                          return appDate.getMonth() === index && appDate.getFullYear() === currentDate.getFullYear();
                        }).length} Agendamentos
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {modalType === 'APPOINTMENT' ? 'Novo Agendamento' : 'Bloquear Horário'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                 <button onClick={() => setModalType('APPOINTMENT')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${modalType === 'APPOINTMENT' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500'}`}>Paciente</button>
                 <button onClick={() => setModalType('BLOCK')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${modalType === 'BLOCK' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-500'}`}>Bloqueio</button>
              </div>

              {modalType === 'APPOINTMENT' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paciente *</label>
                    <input type="text" className={`w-full px-4 py-2 border rounded-lg text-sm outline-none transition-all ${errors.patientName ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:ring-2 focus:ring-sky-500'}`} value={formData.patientName} onChange={e => setFormData({ ...formData, patientName: e.target.value })} placeholder="Nome do paciente..." />
                    {errors.patientName && <p className="mt-1 text-[10px] text-rose-500 font-bold">{errors.patientName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Consulta</label>
                    <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                      <option>Avaliação</option>
                      <option>Limpeza e Profilaxia</option>
                      <option>Restauração</option>
                      <option>Endodontia</option>
                      <option>Implante</option>
                      <option>Ortodontia</option>
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo do Bloqueio</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none" value={formData.blockReason} onChange={e => setFormData({ ...formData, blockReason: e.target.value })}>
                    <option>Intervalo Almoço</option>
                    <option>Curso/Treinamento</option>
                    <option>Folga</option>
                    <option>Particular</option>
                    <option>Outro</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                  <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horário</label>
                  <select className={`w-full px-4 py-2 border rounded-lg text-sm outline-none ${errors.time ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:ring-2 focus:ring-sky-500'}`} value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}>
                    {times.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dentista</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" value={formData.dentistId} onChange={e => setFormData({ ...formData, dentistId: e.target.value })}>
                  {dentists.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {errors.time && <p className="mt-1 text-[10px] text-rose-500 font-bold uppercase">{errors.time}</p>}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors w-full sm:w-auto">Cancelar</button>
              <button onClick={handleSave} className={`px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-all w-full sm:w-auto ${modalType === 'BLOCK' ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'}`}>Confirmar {modalType === 'BLOCK' ? 'Bloqueio' : 'Agendamento'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;