import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../config';

interface Notice {
  id: string;
  title: string;
  description: string;
  category: 'CLINICA' | 'FINANCEIRA' | 'ADMINISTRATIVA' | 'OUTRA';
  priority: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  date: string;
  status: 'PENDENTE' | 'CONCLUIDO';
  createdAt: string;
}

const INITIAL_NOTICES: Notice[] = [
  { id: 'n1', title: 'Ligar para fornecedor de resinas', description: 'Cotar preços com Dental Cremer e Dental Speed para reposição de estoque.', category: 'ADMINISTRATIVA', priority: 'MEDIA', date: '2023-11-25', status: 'PENDENTE', createdAt: new Date().toISOString() },
  { id: 'n2', title: 'Revisão de Odontograma - Paciente Teste', description: 'Verificar se o plano de tratamento do dente 16 foi finalizado conforme evolução.', category: 'CLINICA', priority: 'ALTA', date: '2023-11-24', status: 'PENDENTE', createdAt: new Date().toISOString() },
  { id: 'n3', title: 'Conciliação Bancária Semanal', description: 'Conferir entradas de cartões e boletos do período de 15 a 22/11.', category: 'FINANCEIRA', priority: 'ALTA', date: '2023-11-23', status: 'CONCLUIDO', createdAt: new Date().toISOString() },
];

const CATEGORY_LABELS: Record<Notice['category'], string> = {
  CLINICA: 'Clínica',
  FINANCEIRA: 'Financeira',
  ADMINISTRATIVA: 'Administrativa',
  OUTRA: 'Outra'
};

const PRIORITY_STYLES: Record<Notice['priority'], string> = {
  BAIXA: 'bg-slate-100 text-slate-600 border-slate-200',
  MEDIA: 'bg-sky-100 text-sky-700 border-sky-200',
  ALTA: 'bg-amber-100 text-amber-700 border-amber-200',
  URGENTE: 'bg-rose-100 text-rose-700 border-rose-200'
};

const Notices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/notices`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotices(data);
      })
      .catch(err => console.error('Erro ao buscar avisos:', err));
  }, []);

  const [filter, setFilter] = useState<'TODOS' | 'PENDENTE' | 'CONCLUIDO'>('PENDENTE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Notice, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    category: 'CLINICA',
    priority: 'MEDIA',
    date: new Date().toISOString().split('T')[0],
    status: 'PENDENTE'
  });

  // Removido useEffect que sincronizava avisos com localStorage

  const filteredNotices = useMemo(() => {
    return notices
      .filter(n => filter === 'TODOS' || n.status === filter)
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'PENDENTE' ? -1 : 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [notices, filter]);

  const handleOpenModal = (notice?: Notice) => {
    if (notice) {
      setEditingId(notice.id);
      setFormData({
        title: notice.title,
        description: notice.description,
        category: notice.category,
        priority: notice.priority,
        date: notice.date,
        status: notice.status
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        category: 'CLINICA',
        priority: 'MEDIA',
        date: new Date().toISOString().split('T')[0],
        status: 'PENDENTE'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return alert("O título é obrigatório");
    
    const record = {
      ...formData,
      id: editingId || undefined,
      createdAt: editingId ? notices.find(n => n.id === editingId)?.createdAt : new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });

      if (response.ok) {
        const saved = await response.json();
        if (editingId) {
          setNotices(prev => prev.map(n => n.id === editingId ? saved : n));
        } else {
          setNotices(prev => [saved, ...prev]);
        }
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Erro ao salvar aviso:', err);
    }
  };

  const toggleStatus = async (id: string) => {
    const notice = notices.find(n => n.id === id);
    if (!notice) return;

    const updated = { ...notice, status: notice.status === 'PENDENTE' ? 'CONCLUIDO' : 'PENDENTE' as any };
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (response.ok) {
        setNotices(prev => prev.map(n => n.id === id ? updated : n));
      }
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja excluir este aviso permanentemente?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/notices/${id}`, { method: 'DELETE' });
        if (response.ok) setNotices(prev => prev.filter(n => n.id !== id));
      } catch (err) {
        console.error('Erro ao excluir:', err);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Avisos e Pendências</h1>
          <p className="text-slate-500">Organize as tarefas clínicas e administrativas do consultório.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Nova Pendência
        </button>
      </div>

      <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit shadow-sm">
        <button onClick={() => setFilter('PENDENTE')} className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'PENDENTE' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Pendentes</button>
        <button onClick={() => setFilter('CONCLUIDO')} className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'CONCLUIDO' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Concluídos</button>
        <button onClick={() => setFilter('TODOS')} className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'TODOS' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Todos</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredNotices.map(notice => (
          <div key={notice.id} className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group transition-all hover:border-sky-300 ${notice.status === 'CONCLUIDO' ? 'opacity-60' : ''}`}>
            <div className="p-5 flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${PRIORITY_STYLES[notice.priority]}`}>
                  {notice.priority}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {CATEGORY_LABELS[notice.category]}
                </span>
              </div>
              
              <div>
                <h3 className={`font-bold text-slate-800 mb-1 ${notice.status === 'CONCLUIDO' ? 'line-through' : ''}`}>
                  {notice.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {notice.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <i className="far fa-calendar-check text-[10px]"></i>
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  Prazo: {new Date(notice.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => toggleStatus(notice.id)}
                className={`flex items-center gap-2 text-xs font-black uppercase transition-all ${notice.status === 'CONCLUIDO' ? 'text-emerald-500' : 'text-slate-400 hover:text-sky-500'}`}
              >
                <i className={`fas ${notice.status === 'CONCLUIDO' ? 'fa-check-circle' : 'fa-circle'}`}></i>
                {notice.status === 'CONCLUIDO' ? 'Concluído' : 'Marcar Concluído'}
              </button>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(notice)} className="p-2 text-slate-400 hover:text-sky-600 transition-all"><i className="fas fa-edit"></i></button>
                <button onClick={() => handleDelete(notice.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><i className="fas fa-trash-alt"></i></button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredNotices.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto text-3xl">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <p className="text-slate-400 italic text-sm">Nenhum aviso ou pendência encontrado nesta categoria.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">{editingId ? 'Editar Pendência' : 'Nova Pendência'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
            </div>
            
            <div className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Título do Aviso *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Pagar fatura mensal, Revisão de caso..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Descrição Detalhada</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all h-24 font-medium"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Informações adicionais sobre o que precisa ser feito..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Categoria</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                  >
                    {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Prioridade</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value as any})}
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Data Limite</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600">Cancelar</button>
              <button onClick={handleSave} className="px-8 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;