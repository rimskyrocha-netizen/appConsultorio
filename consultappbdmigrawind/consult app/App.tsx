import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Agenda from './pages/Agenda';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import Financial from './pages/Financial';
import Procedures from './pages/Procedures';
import UserManagement from './pages/UserManagement';
import Backup from './pages/Backup';
import Supplies from './pages/Supplies';
import Notices from './pages/Notices';
import Login from './pages/Login';
import { UserRole, User, Patient } from './types';
import { API_BASE_URL } from './config';

const INITIAL_PATIENTS: Patient[] = [
  { id: 'teste', name: 'TESTE', cpf: '', birthDate: '', phone: '', email: '', tags: [] },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appName, setAppName] = useState(() => localStorage.getItem('odontoflow_name') || 'Consultório Odontológico Dr. Rimsky e Dra. Yoko');
  const [appIcon, setAppIcon] = useState(() => localStorage.getItem('odontoflow_icon') || 'fa-teeth-open');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({ name: appName, icon: appIcon });
  const iconInputRef = useRef<HTMLInputElement>(null);

  // Estado global de pacientes
  const [patients, setPatients] = useState<Patient[]>([]);

  // Carrega pacientes da API
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/patients`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
          setPatients(sorted);
          // Sincroniza com localStorage para compatibilidade com componentes que ainda usam
          localStorage.setItem('odontoflow_patients', JSON.stringify(sorted));
        }
      })
      .catch(err => {
        console.error('Erro ao buscar pacientes da API', err);
        // Fallback para mock
        setPatients(INITIAL_PATIENTS);
      });
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const handleSaveSettings = () => {
    setAppName(tempSettings.name);
    setAppIcon(tempSettings.icon);
    localStorage.setItem('odontoflow_name', tempSettings.name);
    localStorage.setItem('odontoflow_icon', tempSettings.icon);
    setIsSettingsModalOpen(false);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempSettings({ ...tempSettings, icon: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const navItems = [
    { path: '/', label: 'Agenda', icon: 'fa-calendar-alt' },
    { path: '/pacientes', label: 'Pacientes', icon: 'fa-users' },
    { path: '/procedimentos', label: 'Procedimentos', icon: 'fa-hand-holding-medical' },
    { path: '/suprimentos', label: 'Suprimentos', icon: 'fa-box-open' },
    { path: '/avisos', label: 'Avisos e Pendências', icon: 'fa-bell' },
    { path: '/financeiro', label: 'Financeiro', icon: 'fa-dollar-sign' },
    { path: '/usuarios', label: 'Controle de Acesso', icon: 'fa-user-lock', adminOnly: true },
    { path: '/backup', label: 'Segurança e Backup', icon: 'fa-shield-virus', adminOnly: true },
  ];

  const handleGlobalNewPatient = () => {
    navigate('/pacientes', { state: { openNewPatientModal: true } });
    setIsSidebarOpen(false);
  };

  if (!user) {
    return <Login onLogin={handleLogin} appName={appName} appIcon={appIcon} />;
  }

  const isAdmin = user?.role === UserRole.ADMIN;

  const renderIcon = (icon: string, className: string = "text-xl") => {
    if (icon.startsWith('data:image')) {
      return <img src={icon} className="w-full h-full object-contain rounded" alt="App Icon" />;
    }
    return <i className={`fas ${icon} ${className}`}></i>;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col shrink-0 z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center gap-3 relative group">
          <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center shrink-0 overflow-hidden p-1">
            {renderIcon(appIcon)}
          </div>
          <div className="flex-1 overflow-hidden">
            <span className="font-bold text-sm tracking-tight leading-tight block line-clamp-2">{appName}</span>
          </div>
          {isAdmin && (
            <button 
              onClick={() => {
                setTempSettings({ name: appName, icon: appIcon });
                setIsSettingsModalOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md transition-all ml-1"
              title="Configurações da Aplicação"
            >
              <i className="fas fa-cog text-xs"></i>
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path || (item.path === '/pacientes' && location.pathname.startsWith('/pacientes')) 
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <i className={`fas ${item.icon} w-5 text-center`}></i>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-xl transition-all group"
          >
             <i className="fas fa-sign-out-alt w-5 text-center group-hover:scale-110 transition-transform"></i>
             <span className="text-xs font-bold uppercase tracking-wider">Encerrar Sessão</span>
          </button>
          
          <div className="mt-4 flex items-center gap-3 px-2 py-3 bg-slate-800/50 rounded-xl">
            <img src="https://picsum.photos/seed/dentist/40/40" className="rounded-full w-10 h-10 border-2 border-slate-700 shrink-0" alt="Avatar" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-[10px] text-sky-400 uppercase font-black tracking-widest">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
             >
                <i className="fas fa-bars text-xl"></i>
             </button>
             <div className="relative w-full max-w-md hidden sm:block">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input 
                  type="text" 
                  placeholder="Buscar paciente, agendamento ou transação..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-sky-500 rounded-full text-sm transition-all outline-none"
                />
             </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <i className="fas fa-bell"></i>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button 
              onClick={handleGlobalNewPatient}
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 lg:px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-sky-100"
            >
              <i className="fas fa-plus"></i> <span className="hidden xs:inline">Novo Paciente</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<Agenda patients={patients} />} />
            <Route path="/pacientes" element={<PatientList currentUser={user} patients={patients} setPatients={setPatients} />} />
            <Route path="/pacientes/:id" element={<PatientDetail patients={patients} setPatients={setPatients} />} />
            <Route path="/procedimentos" element={<Procedures />} />
            <Route path="/suprimentos" element={<Supplies />} />
            <Route path="/avisos" element={<Notices />} />
            <Route path="/financeiro" element={<Financial patients={patients} />} />
            <Route path="/usuarios" element={<UserManagement />} />
            <Route path="/backup" element={<Backup />} />
          </Routes>
        </div>
      </main>

      {/* Modal de Configurações da Aplicação (Admin Only) */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Personalizar Aplicação</h3>
                <p className="text-xs text-slate-500">Altere o nome e o ícone do sistema.</p>
              </div>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nome da Clínica / Aplicação</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                  value={tempSettings.name}
                  onChange={(e) => setTempSettings({ ...tempSettings, name: e.target.value })}
                  placeholder="Ex: Consultório Dr. Exemplo"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ícone da Aplicação</label>
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 shrink-0 overflow-hidden p-1 border border-sky-200">
                    {renderIcon(tempSettings.icon)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                      value={tempSettings.icon.startsWith('data:image') ? '' : tempSettings.icon}
                      onChange={(e) => setTempSettings({ ...tempSettings, icon: e.target.value })}
                      placeholder="Classe FontAwesome (ex: fa-tooth)"
                    />
                    <div className="flex flex-wrap gap-2">
                       <input 
                         type="file" 
                         ref={iconInputRef}
                         onChange={handleIconUpload}
                         className="hidden" 
                         accept="image/*"
                       />
                       <button 
                         onClick={() => iconInputRef.current?.click()}
                         className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-all min-w-[100px]"
                       >
                         <i className="fas fa-upload mr-1"></i> Upload
                       </button>
                       <button 
                         onClick={() => setTempSettings({ ...tempSettings, icon: 'fa-teeth-open' })}
                         className="px-3 py-2 bg-slate-100 rounded-lg text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all"
                         title="Resetar para Padrão"
                       >
                         <i className="fas fa-undo"></i>
                       </button>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-slate-400 font-medium">Use uma classe FontAwesome ou faça upload de um logotipo quadrado.</p>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button onClick={() => setIsSettingsModalOpen(false)} className="px-6 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors w-full sm:w-auto">Cancelar</button>
              <button 
                onClick={handleSaveSettings}
                className="px-8 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all w-full sm:w-auto"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;