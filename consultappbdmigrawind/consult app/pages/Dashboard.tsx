
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Patient } from '../types';
import { API_BASE_URL } from '../config';

const data = [
  { name: 'Seg', atendimentos: 0, faturamento: 0 },
  { name: 'Ter', atendimentos: 0, faturamento: 0 },
  { name: 'Qua', atendimentos: 0, faturamento: 0 },
  { name: 'Qui', atendimentos: 0, faturamento: 0 },
  { name: 'Sex', atendimentos: 0, faturamento: 0 },
  { name: 'Sáb', atendimentos: 0, faturamento: 0 },
];

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [upcomingApps, setUpcomingApps] = useState<any[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    // Busca pacientes para mapeamento de IDs
    fetch(`${API_BASE_URL}/api/patients`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setPatients(data); })
      .catch(err => console.error('Erro ao buscar pacientes no dashboard:', err));

    // Busca agendamentos de hoje
    fetch(`${API_BASE_URL}/api/appointments`)
      .then(res => res.json())
      .then(apps => {
        if (Array.isArray(apps)) {
          const today = new Date().toISOString().split('T')[0];
          const filtered = apps
            .filter((app: any) => app.date === today && !app.isBlock)
            .sort((a: any, b: any) => a.time.localeCompare(b.time));
          setUpcomingApps(filtered.slice(0, 5));
        }
      })
      .catch(err => console.error('Erro ao buscar agendamentos no dashboard:', err));
  }, []);

  const handleAction = (label: string) => {
    if (label === 'Nova Consulta') {
      navigate('/', { state: { openScheduleModal: true } });
    }
  };

  const getPatientId = (name: string) => {
    const found = patients.find(p => p.name.toLowerCase() === name.toLowerCase());
    return found ? found.id : null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Olá, {user?.name}</h1>
        <p className="text-slate-500">Aqui está o resumo do seu consultório hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Atendimentos Hoje', value: upcomingApps.length.toString(), icon: 'fa-calendar-check', color: 'bg-blue-500' },
          { label: 'Novos Pacientes', value: '0', icon: 'fa-user-plus', color: 'bg-emerald-500' },
          { label: 'Faturamento Mês', value: 'R$ 0,00', icon: 'fa-wallet', color: 'bg-amber-500' },
          { label: 'Inadimplência', value: '0%', icon: 'fa-exclamation-triangle', color: 'bg-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} text-white w-12 h-12 rounded-lg flex items-center justify-center shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-800">Desempenho Semanal</h2>
              <select className="text-sm border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500">
                <option>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="faturamento" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h2 className="font-bold text-slate-800 mb-6">Próximos Pacientes</h2>
             {upcomingApps.length > 0 ? (
               <div className="divide-y divide-slate-100">
                 {upcomingApps.map((app) => {
                   const patientId = getPatientId(app.patientName);
                   return (
                     <div key={app.id} className="py-4 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                              {app.patientName[0]}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-800">{app.patientName}</p>
                              <p className="text-xs text-slate-500 font-medium">
                                <i className="far fa-clock mr-1"></i> {app.time} • {app.type}
                              </p>
                           </div>
                        </div>
                        {patientId && (
                          <button 
                            onClick={() => navigate(`/pacientes/${patientId}`)}
                            className="px-4 py-1.5 bg-slate-50 text-sky-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all"
                          >
                            Ver Prontuário
                          </button>
                        )}
                     </div>
                   );
                 })}
               </div>
             ) : (
               <div className="py-12 text-center text-slate-400 italic text-sm">
                  Nenhum atendimento agendado para hoje.
               </div>
             )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-sky-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl">
             <h3 className="text-lg font-bold mb-2">Suporte por IA</h3>
             <p className="text-sky-100 text-sm mb-6">Analise radiografias ou gere resumos clínicos inteligentes com nossa IA integrada.</p>
             <button className="w-full py-3 bg-white text-sky-600 rounded-xl font-bold text-sm shadow-md hover:bg-sky-50 transition-colors">
               Iniciar Assistente
             </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-6">Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Nova Consulta', icon: 'fa-calendar-plus', color: 'text-sky-500' },
               ].map((action, i) => (
                 <button 
                  key={i} 
                  onClick={() => handleAction(action.label)}
                  className="flex flex-col items-center gap-2 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all group w-full"
                 >
                    <i className={`fas ${action.icon} ${action.color} text-xl group-hover:scale-110 transition-transform`}></i>
                    <span className="text-xs font-semibold text-slate-600 text-center">{action.label}</span>
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
