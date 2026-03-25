
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole, Patient } from '../types';
import { API_BASE_URL } from '../config';

interface PatientListProps {
  currentUser: User | null;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

const PatientList: React.FC<PatientListProps> = ({ currentUser, patients, setPatients }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    phone: '',
    whatsapp: '',
    email: '',
    insuranceName: '',
    insuranceCard: '',
    observations: '',
    tags: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenModal = () => {
    setFormData({ 
      name: '', 
      cpf: '', 
      birthDate: '', 
      phone: '', 
      whatsapp: '', 
      email: '', 
      insuranceName: '', 
      insuranceCard: '', 
      observations: '',
      tags: []
    });
    setErrors({});
    setIsModalOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.state && (location.state as any).openNewPatientModal) {
      handleOpenModal();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.cpf && p.cpf.includes(searchTerm)) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const now = new Date();
    const isoDate = now.getFullYear() + '-' + 
                    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(now.getDate()).padStart(2, '0') + 'T' + 
                    String(now.getHours()).padStart(2, '0') + ':' + 
                    String(now.getMinutes()).padStart(2, '0') + ':' + 
                    String(now.getSeconds()).padStart(2, '0');

    const newPatient: Partial<Patient> = {
      ...formData,
      birthDate: formData.birthDate ? formData.birthDate : undefined,
      cpf: formData.cpf ? formData.cpf : undefined,
      lastVisit: isoDate,
      tags: formData.tags.length > 0 ? formData.tags : ['Novo']
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient)
      });
      
      if (response.ok) {
        const savedPatient = await response.json();
        setPatients(prevPatients => [savedPatient, ...prevPatients]);
        
        // Reseta o formulário
        setFormData({
          name: '', cpf: '', birthDate: '', phone: '', whatsapp: '',
          email: '', insuranceName: '', insuranceCard: '', observations: '', tags: []
        });

        setIsModalOpen(false);
        setSearchTerm('');
      } else {
        const errorText = await response.text();
        alert('Erro ao salvar paciente: ' + errorText);
      }
    } catch (error) {
      console.error('Erro na requisição', error);
      alert('Erro de conexão com o servidor.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setPatients(prev => prev.filter(p => p.id !== id));
          setOpenMenuId(null);
        } else {
          const errorText = await response.text();
          alert('Erro ao excluir paciente do banco de dados: ' + errorText);
        }
      } catch (error) {
        console.error('Erro ao excluir paciente:', error);
        alert('Erro de conexão com o servidor ao excluir paciente.');
      }
    }
  };

  const handleExport = () => {
    if (filteredPatients.length === 0) return;
    const headers = ['ID', 'Nome', 'CPF', 'Nascimento', 'Telefone', 'WhatsApp', 'Email', 'Plano', 'Carteirinha', 'Ultima Visita', 'Observações'];
    const csvContent = [
      headers.join(';'),
      ...filteredPatients.map(p => [
        p.id, `"${p.name}"`, p.cpf, p.birthDate, p.phone, p.whatsapp, p.email, `"${p.insuranceName}"`, p.insuranceCard, p.lastVisit, `"${p.observations || ''}"`
      ].join(';'))
    ].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pacientes_consultorio_rimsky_yoko_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pacientes</h1>
          <p className="text-slate-500">Gerencie todos os pacientes da sua clínica.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <i className="fas fa-file-export mr-2"></i> Exportar
          </button>
          <button onClick={handleOpenModal} className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 shadow-md transition-all flex items-center gap-2">
            <i className="fas fa-plus"></i> Novo Paciente
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
           <div className="relative flex-1">
             <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
             <input type="text" placeholder="Filtrar por nome, CPF ou telefone..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-widest font-bold border-b border-slate-200">
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">CPF</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Última Visita</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4" onClick={() => navigate(`/pacientes/${p.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold">{p.name[0]}</div>
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          {p.phone} {p.whatsapp && <i className="fab fa-whatsapp text-emerald-500"></i>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.cpf || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <p className="font-medium">{p.insuranceName || 'Particular'}</p>
                    <p className="text-[10px] text-slate-400">{p.insuranceCard}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <span className={p.lastVisit === 'Novo' ? 'text-sky-600 font-bold' : ''}>{p.lastVisit}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === p.id ? null : p.id); }}
                        className={`p-2 rounded-lg transition-colors ${openMenuId === p.id ? 'bg-sky-50 text-sky-600' : 'text-slate-400 hover:text-sky-600'}`}
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>

                      {openMenuId === p.id && (
                        <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-2 text-left animate-in fade-in zoom-in-95 duration-100">
                          <button 
                            onClick={() => navigate(`/pacientes/${p.id}`)}
                            className="w-full px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                          >
                            <i className="fas fa-folder-open w-4 text-sky-500"></i> Ver Prontuário
                          </button>
                          <button 
                            onClick={() => navigate('/', { state: { openScheduleModal: true, patientName: p.name } })}
                            className="w-full px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                          >
                            <i className="fas fa-calendar-plus w-4 text-emerald-500"></i> Agendar Consulta
                          </button>
                          
                          {isAdmin && (
                            <>
                              <div className="my-1 border-t border-slate-50"></div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                                className="w-full px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                              >
                                <i className="fas fa-trash-alt w-4"></i> Excluir Paciente
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">Nenhum paciente encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Cadastrar Novo Paciente</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl"><i className="fas fa-times"></i></button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto font-inter">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo *</label>
                <input type="text" className={`w-full px-4 py-2 border rounded-lg text-sm outline-none transition-all ${errors.name ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:ring-2 focus:ring-sky-500'}`} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: João da Silva" />
              </div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">CPF</label><input type="text" className={`w-full px-4 py-2 border rounded-lg text-sm outline-none transition-all ${errors.cpf ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:ring-2 focus:ring-sky-500'}`} value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} placeholder="000.000.000-00" /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nascimento</label><input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone Principal *</label><input type="text" className={`w-full px-4 py-2 border rounded-lg text-sm outline-none transition-all ${errors.phone ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:ring-2 focus:ring-sky-500'}`} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">WhatsApp <i className="fab fa-whatsapp text-emerald-500"></i></label><input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="Somente números..." /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label><input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="exemplo@email.com" /></div>
              <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2"><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Informações do Plano / Convênio</h4></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Plano</label><input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" value={formData.insuranceName} onChange={e => setFormData({ ...formData, insuranceName: e.target.value })} placeholder="Ex: Bradesco, Unimed..." /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nº da Carteirinha</label><input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" value={formData.insuranceCard} onChange={e => setFormData({ ...formData, insuranceCard: e.target.value })} placeholder="0000.0000.0000" /></div>
              <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2 mb-2"><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Informações Adicionais</h4><div className="mb-2"><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Observações Gerais</label><textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none min-h-[120px]" placeholder="Outras informações relevantes sobre o paciente, histórico ou preferências..." value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} /></div></div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-semibold text-slate-600">Cancelar</button>
              <button onClick={handleSave} className="px-8 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all">Salvar Paciente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
