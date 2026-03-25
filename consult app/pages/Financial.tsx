import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Patient } from '../types';

interface Transaction {
  id: string;
  desc: string;
  type: 'IN' | 'OUT';
  value: number;
  date: string;
  method: string;
  patientId?: string;
}

interface PaymentRecord {
  id: string;
  date: string;
  value: number;
  method: string;
  status: 'PAGO' | 'PENDENTE';
  notes?: string;
}

interface TreatmentProcedure {
  id: string;
  value: number;
  status: 'PLANEJADO' | 'REALIZADO' | 'CANCELADO';
}

interface ConsolidatedFinancials {
  totalIn: number;
  totalOut: number;
  projectedReceivable: number;
  transactions: Transaction[];
  overduePatients: { id: string; name: string; value: number; days: number }[];
}

const INITIAL_TRANSACTIONS: Transaction[] = [];

const Financial: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Carrega transações globais (receitas avulsas da clínica)
  const [globalTransactions, setGlobalTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('odontoflow_global_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Persiste transações globais
  useEffect(() => {
    localStorage.setItem('odontoflow_global_transactions', JSON.stringify(globalTransactions));
  }, [globalTransactions]);

  // Consolidação de dados de todos os pacientes
  const consolidated = useMemo((): ConsolidatedFinancials => {
    const savedPatients = localStorage.getItem('odontoflow_patients');
    const patients: Patient[] = savedPatients ? JSON.parse(savedPatients) : [];
    
    let totalInFromPatients = 0;
    let totalProjected = 0;
    const patientTransactions: Transaction[] = [];
    const overdueList: ConsolidatedFinancials['overduePatients'] = [];

    patients.forEach(p => {
      // Busca pagamentos do paciente
      const paySaved = localStorage.getItem(`odontoflow_pay_${p.id}`);
      const payments: PaymentRecord[] = paySaved ? JSON.parse(paySaved) : [];
      
      // Busca plano de tratamento para calcular saldo devedor (projetado)
      const planSaved = localStorage.getItem(`odontoflow_plan_${p.id}`);
      const plan: TreatmentProcedure[] = planSaved ? JSON.parse(planSaved) : [];

      let patientPaidTotal = 0;
      payments.forEach(pay => {
        if (pay.status === 'PAGO') {
          patientPaidTotal += pay.value;
          totalInFromPatients += pay.value;
          patientTransactions.push({
            id: pay.id,
            desc: `Recebimento: ${p.name}`,
            type: 'IN',
            value: pay.value,
            date: pay.date,
            method: pay.method,
            patientId: p.id
          });
        }
      });

      const planTotal = plan.reduce((acc, curr) => acc + (curr.status !== 'CANCELADO' ? curr.value : 0), 0);
      const debt = planTotal - patientPaidTotal;

      if (debt > 0) {
        totalProjected += debt;
        overdueList.push({
          id: p.id,
          name: p.name,
          value: debt,
          days: 15 // Mockado para exemplo, em real seria diff de datas
        });
      }
    });

    const allTransactions = [...globalTransactions, ...patientTransactions]
      .filter(t => t.type === 'IN')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalInGlobal = globalTransactions.reduce((acc, curr) => acc + (curr.type === 'IN' ? curr.value : 0), 0);

    return {
      totalIn: totalInFromPatients + totalInGlobal,
      totalOut: 0,
      projectedReceivable: totalProjected,
      transactions: allTransactions,
      overduePatients: overdueList.sort((a, b) => b.value - a.value)
    };
  }, [globalTransactions]);

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isSendingCollection, setIsSendingCollection] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [collectionChannels, setCollectionChannels] = useState({ whatsapp: true, email: false, sms: false });

  const [formData, setFormData] = useState({
    desc: '',
    type: 'IN' as 'IN' | 'OUT',
    value: '',
    date: new Date().toISOString().split('T')[0],
    method: 'PIX'
  });

  useEffect(() => {
    if (location.state && (location.state as any).openEntryModal) {
      setIsEntryModalOpen(true);
      window.history.replaceState({}, document.title);
    }
    // Inicializa seleção de cobrança com todos os inadimplentes
    setSelectedPatients(consolidated.overduePatients.map(p => p.id));
  }, [location.state, consolidated.overduePatients]);

  const handleSaveEntry = () => {
    if (!formData.desc.trim() || !formData.value) {
      alert("Por favor, preencha a descrição e o valor.");
      return;
    }

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      desc: formData.desc,
      type: 'IN',
      value: parseFloat(formData.value),
      date: formData.date,
      method: formData.method
    };

    setGlobalTransactions([newTransaction, ...globalTransactions]);
    setIsEntryModalOpen(false);
    setFormData({
      desc: '',
      type: 'IN',
      value: '',
      date: new Date().toISOString().split('T')[0],
      method: 'PIX'
    });
  };

  const handleStartCollection = () => {
    if (selectedPatients.length === 0) {
      alert("Selecione pelo menos um paciente para cobrança.");
      return;
    }
    setIsSendingCollection(true);
    setTimeout(() => {
      setIsSendingCollection(false);
      setIsCollectionModalOpen(false);
      alert(`${selectedPatients.length} notificações de cobrança enviadas!`);
    }, 2000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Dados mockados para o gráfico baseados nos totais atuais
  const chartData = [
    { name: 'Prev', receita: consolidated.totalIn * 0.8 },
    { name: 'Atual', receita: consolidated.totalIn },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financeiro Consolidado</h1>
          <p className="text-slate-500">Gestão global de receitas de pacientes e lançamentos da clínica.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white font-medium hover:bg-slate-50 transition-all text-sm">
            Exportar DRE
          </button>
          <button 
            onClick={() => setIsEntryModalOpen(true)}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-sky-600 transition-all"
          >
            Lançamento de Receita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h2 className="font-bold text-slate-800 mb-6">Desempenho Financeiro</h2>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="receita" stroke="#0ea5e9" fill="#e0f2fe" />
                  </AreaChart>
               </ResponsiveContainer>
             </div>
           </div>

           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-100 flex items-center justify-between">
               <h2 className="font-bold text-slate-800">Fluxo de Caixa Integrado (Entradas)</h2>
               <span className="text-[10px] font-black text-slate-400 uppercase">Sincronizado com Prontuários</span>
             </div>
             <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
               {consolidated.transactions.map((t) => (
                 <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                         <i className="fas fa-arrow-up text-xs"></i>
                       </div>
                       <div>
                         <p className="text-sm font-semibold text-slate-800">{t.desc}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.method} • {t.date.split('-').reverse().join('/')}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-emerald-600">
                        + {formatCurrency(t.value)}
                      </p>
                      {t.patientId && (
                        <button 
                          onClick={() => navigate(`/pacientes/${t.patientId}`)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-all"
                          title="Ver Prontuário"
                        >
                          <i className="fas fa-external-link-alt text-xs"></i>
                        </button>
                      )}
                    </div>
                 </div>
               ))}
               {consolidated.transactions.length === 0 && (
                 <div className="p-12 text-center text-slate-400 italic text-sm">Nenhuma transação encontrada.</div>
               )}
             </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest">Resumo Consolidado</h3>
             <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                   <p className="text-[10px] text-emerald-600 font-black uppercase mb-1">Total Recebido</p>
                   <p className="text-2xl font-bold text-emerald-700">{formatCurrency(consolidated.totalIn)}</p>
                </div>
                <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl">
                   <p className="text-[10px] text-sky-600 font-black uppercase mb-1">A Receber (Saldo Devedor)</p>
                   <p className="text-2xl font-bold text-sky-700">{formatCurrency(consolidated.projectedReceivable)}</p>
                </div>
             </div>
           </div>

           <div className={`p-6 rounded-2xl border transition-all ${consolidated.overduePatients.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                <i className={`fas fa-exclamation-circle ${consolidated.overduePatients.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}></i> 
                Gestão de Débitos
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {consolidated.overduePatients.length} pacientes possuem tratamentos em aberto. Total pendente: <strong>{formatCurrency(consolidated.projectedReceivable)}</strong>.
              </p>
              <button 
                onClick={() => setIsCollectionModalOpen(true)}
                disabled={consolidated.overduePatients.length === 0}
                className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-all shadow-md disabled:opacity-50"
              >
                Notificar Inadimplentes
              </button>
           </div>
        </div>
      </div>

      {/* Modal Novo Lançamento Global */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-file-invoice-dollar text-sky-500"></i> Lançamento de Receita Manual
              </h3>
              <button onClick={() => setIsEntryModalOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                 <button className="flex-1 py-2 text-xs font-bold rounded-lg transition-all bg-white shadow-sm text-emerald-600">Receita Clínica</button>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label><input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label><input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label><input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Método</label><select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })}><option value="PIX">PIX</option><option value="Boleto">Boleto</option><option value="Cartão">Cartão</option><option value="Dinheiro">Dinheiro</option></select></div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3"><button onClick={() => setIsEntryModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600">Cancelar</button><button onClick={handleSaveEntry} className="px-8 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-lg">Confirmar</button></div>
          </div>
        </div>
      )}

      {/* Modal Régua de Cobrança baseada em dados reais */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800">Régua de Cobrança Automática</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Inadimplentes Atuais</p>
              </div>
              <button onClick={() => setIsCollectionModalOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {consolidated.overduePatients.map(patient => (
                  <div key={patient.id} className="p-3 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                       <input type="checkbox" checked={selectedPatients.includes(patient.id)} onChange={() => setSelectedPatients(prev => prev.includes(patient.id) ? prev.filter(id => id !== patient.id) : [...prev, patient.id])} className="w-4 h-4 rounded text-sky-500" />
                       <div><p className="text-sm font-bold text-slate-700">{patient.name}</p><p className="text-[10px] text-rose-500 font-bold uppercase">Saldo: {formatCurrency(patient.value)}</p></div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Canais de Notificação</label>
                <div className="grid grid-cols-3 gap-3">
                   <button onClick={() => setCollectionChannels({...collectionChannels, whatsapp: !collectionChannels.whatsapp})} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${collectionChannels.whatsapp ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-400'}`}><i className="fab fa-whatsapp text-lg"></i><span className="text-[10px] font-black uppercase">WhatsApp</span></button>
                   <button onClick={() => setCollectionChannels({...collectionChannels, email: !collectionChannels.email})} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${collectionChannels.email ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-slate-100 text-slate-400'}`}><i className="fas fa-envelope text-lg"></i><span className="text-[10px] font-black uppercase">E-mail</span></button>
                   <button onClick={() => setCollectionChannels({...collectionChannels, sms: !collectionChannels.sms})} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${collectionChannels.sms ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white border-slate-100 text-slate-400'}`}><i className="fas fa-comment-dots text-lg"></i><span className="text-[10px] font-black uppercase">SMS</span></button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsCollectionModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600">Cancelar</button>
              <button onClick={handleStartCollection} disabled={isSendingCollection || selectedPatients.length === 0} className="px-8 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold shadow-lg">
                {isSendingCollection ? 'Enviando...' : `Cobrar ${selectedPatients.length} selecionados`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financial;