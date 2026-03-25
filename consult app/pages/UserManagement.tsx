import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Dr. Roberto Santos', email: 'roberto@odontoflow.com', role: UserRole.ADMIN, tenantId: 't1', status: 'ACTIVE', lastAccess: '10/11/2023 09:15', cro: '123456', state: 'SP', city: 'São Paulo' },
  { id: 'u2', name: 'Dra. Marina Costa', email: 'marina@odontoflow.com', role: UserRole.DENTIST, tenantId: 't1', status: 'ACTIVE', lastAccess: '10/11/2023 14:30', specialty: 'Ortodontia', cro: '654321', state: 'SP', city: 'São Paulo' },
  { id: 'u3', name: 'Camila Ferreira', email: 'camila@odontoflow.com', role: UserRole.RECEPTION, tenantId: 't1', status: 'ACTIVE', lastAccess: '10/11/2023 08:00' },
  { id: 'u4', name: 'Joaquim Silva', email: 'financeiro@odontoflow.com', role: UserRole.FINANCIAL, tenantId: 't1', status: 'ACTIVE', lastAccess: '09/11/2023 17:00' },
  { id: 'u5', name: 'Luciana Mello', email: 'luciana@odontoflow.com', role: UserRole.ASSISTANT, tenantId: 't1', status: 'ACTIVE', lastAccess: '10/11/2023 10:22' },
];

const ROLE_DETAILS: Record<UserRole, { label: string; color: string; icon: string }> = {
  [UserRole.ADMIN]: { label: 'Admin da Clínica', color: 'bg-indigo-100 text-indigo-700', icon: 'fa-user-shield' },
  [UserRole.DENTIST]: { label: 'Dentista', color: 'bg-sky-100 text-sky-700', icon: 'fa-user-md' },
  [UserRole.RECEPTION]: { label: 'Recepção / Gestão', color: 'bg-emerald-100 text-emerald-700', icon: 'fa-calendar-alt' },
  [UserRole.FINANCIAL]: { label: 'Financeiro', color: 'bg-amber-100 text-amber-700', icon: 'fa-dollar-sign' },
  [UserRole.ASSISTANT]: { label: 'ASB / TSB', color: 'bg-slate-100 text-slate-700', icon: 'fa-hands-helping' },
  [UserRole.STOCK]: { label: 'Estoquista', color: 'bg-orange-100 text-orange-700', icon: 'fa-boxes' },
  [UserRole.AUDITOR]: { label: 'Auditor', color: 'bg-rose-100 text-rose-700', icon: 'fa-search-dollar' },
  [UserRole.PATIENT]: { label: 'Paciente', color: 'bg-slate-100 text-slate-500', icon: 'fa-user' },
};

const UserManagement: React.FC = () => {
  // Carrega os usuários do localStorage ou usa os iniciais
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('odontoflow_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Salva no localStorage sempre que houver alteração na lista de usuários
  useEffect(() => {
    localStorage.setItem('odontoflow_users', JSON.stringify(users));
  }, [users]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.RECEPTION,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    cro: '',
    state: '',
    city: ''
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ 
        name: user.name, 
        email: user.email, 
        password: '', // Senha vazia por padrão ao editar
        role: user.role, 
        status: user.status,
        cro: user.cro || '',
        state: user.state || '',
        city: user.city || ''
      });
    } else {
      setEditingUser(null);
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        role: UserRole.RECEPTION, 
        status: 'ACTIVE',
        cro: '',
        state: '',
        city: ''
      });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      alert('Nome e E-mail são obrigatórios.');
      return;
    }

    if (!editingUser && !formData.password) {
      alert('A senha é obrigatória para novos usuários.');
      return;
    }

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { 
        ...u, 
        name: formData.name, 
        email: formData.email, 
        role: formData.role, 
        status: formData.status,
        cro: formData.cro,
        state: formData.state,
        city: formData.city,
        password: formData.password || u.password
      } : u));
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        tenantId: 't1',
        lastAccess: 'Nunca',
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        cro: formData.cro,
        state: formData.state,
        city: formData.city,
        password: formData.password || '123456'
      };
      setUsers(prev => [newUser, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário permanentemente? Esta ação não pode ser desfeita.')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Controle de Acesso</h1>
          <p className="text-slate-500">Gerencie os usuários e permissões da sua clínica.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-sky-600 transition-all flex items-center gap-2"
        >
          <i className="fas fa-user-plus"></i> Convidar Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-widest font-bold border-b border-slate-200">
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Perfil / Cargo</th>
                <th className="px-6 py-4">Dados Profissionais</th>
                <th className="px-6 py-4">Último Acesso</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${ROLE_DETAILS[u.role].color}`}>
                      <i className={`fas ${ROLE_DETAILS[u.role].icon}`}></i>
                      {ROLE_DETAILS[u.role].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {u.cro ? (
                      <p>CRO-{u.state} {u.cro}<br/>{u.city}</p>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{u.lastAccess}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase ${u.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {u.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleOpenModal(u)}
                        className="p-2 text-slate-400 hover:text-sky-600 transition-colors"
                        title="Editar Usuário / Resetar Senha"
                      >
                        <i className="fas fa-user-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors" 
                        title="Excluir Usuário"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">{editingUser ? 'Editar Permissões e Senha' : 'Convidar Novo Usuário'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail Corporativo</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {(formData.role === UserRole.DENTIST || formData.role === UserRole.ADMIN) && (
                <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 space-y-3">
                  <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Informações para Documentos (Recibos/Contratos)</p>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Número do CRO</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                      value={formData.cro}
                      onChange={e => setFormData({ ...formData, cro: e.target.value })}
                      placeholder="Ex: 123456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">UF (Estado)</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase().substring(0, 2) })}
                        placeholder="Ex: SP"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cidade</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Ex: São Paulo"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  {editingUser ? 'Nova Senha (opcional)' : 'Senha de Acesso *'}
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                    placeholder={editingUser ? "Deixe em branco para não alterar" : "Mínimo 6 caracteres"}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                  </button>
                </div>
                {editingUser && (
                   <p className="mt-1 text-[10px] text-slate-400">
                     Ao preencher este campo, a senha do usuário será alterada imediatamente após salvar.
                   </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Perfil de Acesso (Poderes)</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  {Object.entries(ROLE_DETAILS).map(([role, detail]) => (
                    <option key={role} value={role}>{detail.label}</option>
                  ))}
                </select>
                <p className="mt-2 text-[10px] text-slate-400 leading-tight">
                  <i className="fas fa-info-circle mr-1"></i> 
                  O perfil define quais telas e ações o usuário poderá realizar no sistema.
                </p>
              </div>
              
              {editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status da Conta</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setFormData({ ...formData, status: 'ACTIVE' })}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${formData.status === 'ACTIVE' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                    >
                      ATIVO
                    </button>
                    <button 
                      onClick={() => setFormData({ ...formData, status: 'INACTIVE' })}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${formData.status === 'INACTIVE' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-500'}`}
                    >
                      BLOQUEADO
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600">Cancelar</button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-sky-600 transition-all"
              >
                {editingUser ? 'Salvar Alterações' : 'Enviar Convite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;