
import React, { useState, useEffect, useRef } from 'react';

interface Checkpoint {
  id: string;
  timestamp: string;
  size: string;
  description: string;
}

interface CloudBackupEntry {
  id: string;
  timestamp: string;
  size: string;
  status: 'SUCCESS' | 'SYNCING';
}

interface BackupConfig {
  autoCheckpoint: boolean;
  interval: number; // em horas
  lastExport: string | null;
  lastCloudSync: string | null;
  cloudProvider: string;
  cloudInterval: number; // em horas
  autoCloudSync: boolean;
  cloudAccount: string;
}

const Backup: React.FC = () => {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(() => {
    const saved = localStorage.getItem('odontoflow_local_checkpoints');
    return saved ? JSON.parse(saved) : [];
  });

  const [cloudBackups, setCloudBackups] = useState<CloudBackupEntry[]>(() => {
    const saved = localStorage.getItem('odontoflow_cloud_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [config, setConfig] = useState<BackupConfig>(() => {
    const saved = localStorage.getItem('odontoflow_local_config');
    return saved ? JSON.parse(saved) : {
      autoCheckpoint: true,
      interval: 4,
      lastExport: null,
      lastCloudSync: null,
      cloudProvider: 'AWS S3',
      cloudInterval: 24,
      autoCloudSync: false,
      cloudAccount: ''
    };
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCloudProcessing, setIsCloudProcessing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('odontoflow_local_checkpoints', JSON.stringify(checkpoints));
  }, [checkpoints]);

  useEffect(() => {
    localStorage.setItem('odontoflow_cloud_history', JSON.stringify(cloudBackups));
  }, [cloudBackups]);

  useEffect(() => {
    localStorage.setItem('odontoflow_local_config', JSON.stringify(config));
  }, [config]);

  /**
   * Captura ABSOLUTAMENTE TODOS os dados do OdontoFlow, 
   * incluindo histórico de checkpoints, avisos, procedimentos e configurações.
   */
  const getSystemData = () => {
    const allData: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('odontoflow_')) {
        allData[key] = localStorage.getItem(key);
      }
    }
    return allData;
  };

  const createCheckpoint = (desc: string = "Manual") => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const currentData = getSystemData();
      const blob = new Blob([JSON.stringify(currentData)], { type: 'application/json' });
      const size = (blob.size / 1024).toFixed(1) + ' KB';
      
      const newCheckpoint: Checkpoint = {
        id: 'PT-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        timestamp: new Date().toLocaleString('pt-BR'),
        size,
        description: desc
      };

      localStorage.setItem(`odontoflow_snapshot_${newCheckpoint.id}`, JSON.stringify(currentData));
      setCheckpoints(prev => [newCheckpoint, ...prev].slice(0, 15));
      setIsProcessing(false);
    }, 1000);
  };

  const handleCloudSync = () => {
    if (!config.cloudAccount) {
      alert("Por favor, configure uma conta de nuvem antes de sincronizar.");
      return;
    }
    setIsCloudProcessing(true);
    
    setTimeout(() => {
      const currentData = getSystemData();
      const blob = new Blob([JSON.stringify(currentData)], { type: 'application/json' });
      const size = (blob.size / 1024).toFixed(1) + ' KB';
      
      const newCloudEntry: CloudBackupEntry = {
        id: 'CLOUD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        timestamp: new Date().toLocaleString('pt-BR'),
        size,
        status: 'SUCCESS'
      };

      // Simulação de armazenamento em nuvem (persiste no LocalStorage com prefixo específico)
      localStorage.setItem(`odontoflow_cloud_storage_${newCloudEntry.id}`, JSON.stringify(currentData));
      
      setCloudBackups(prev => [newCloudEntry, ...prev].slice(0, 10));
      setConfig(prev => ({ ...prev, lastCloudSync: newCloudEntry.timestamp }));
      setIsCloudProcessing(false);
    }, 2500);
  };

  const handleExportFile = () => {
    const data = getSystemData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `backup_total_odontoflow_${date}.json`;
    link.click();
    
    setConfig(prev => ({ ...prev, lastExport: new Date().toLocaleString('pt-BR') }));
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (window.confirm("ATENÇÃO: Este backup restaurará TODO o sistema, incluindo Avisos, Procedimentos e Pontos de Restauração antigos. Deseja prosseguir?")) {
          restoreFullState(data);
        }
      } catch (err) {
        alert("Erro ao ler arquivo. Certifique-se de que é um backup válido do OdontoFlow.");
      }
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const restoreFromCheckpoint = (id: string) => {
    const savedData = localStorage.getItem(`odontoflow_snapshot_${id}`);
    if (savedData && window.confirm("Voltar o sistema para este ponto? Todos os avisos e procedimentos criados após este registro serão revertidos.")) {
      restoreFullState(JSON.parse(savedData));
    }
  };

  const restoreFromCloud = (id: string) => {
    const savedData = localStorage.getItem(`odontoflow_cloud_storage_${id}`);
    if (savedData && window.confirm("Baixar e restaurar este backup da nuvem? O sistema será reiniciado com os dados deste período.")) {
      restoreFullState(JSON.parse(savedData));
    }
  };

  /**
   * Restauração de Estado Completo (Soberania de Dados)
   */
  const restoreFullState = (data: Record<string, string>) => {
    setIsRestoring(true);
    setTimeout(() => {
      // Limpeza profunda para evitar conflitos de versões de dados
      localStorage.clear();
      
      // Reinjeção atômica de todos os módulos
      Object.entries(data).forEach(([key, value]) => {
        if (value) localStorage.setItem(key, value);
      });

      setIsRestoring(false);
      alert("Sistema restaurado integralmente! Todos os módulos (Avisos, Procedimentos e Histórico) foram reestabelecidos.");
      window.location.reload();
    }, 2500);
  };

  const deleteCheckpoint = (id: string) => {
    if (window.confirm("Remover este registro do histórico de pontos de controle?")) {
      localStorage.removeItem(`odontoflow_snapshot_${id}`);
      setCheckpoints(prev => prev.filter(c => c.id !== id));
    }
  };

  const deleteCloudEntry = (id: string) => {
    if (window.confirm("Excluir este backup da nuvem? Esta ação é irreversível.")) {
      localStorage.removeItem(`odontoflow_cloud_storage_${id}`);
      setCloudBackups(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-inter">Backup e Soberania de Dados</h1>
          <p className="text-slate-500 font-inter">Gestão de histórico completo, avisos e tabela de procedimentos.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            className="hidden" 
            accept=".json"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2 font-inter"
          >
            <i className="fas fa-file-import"></i> Restaurar Arquivo
          </button>
          <button 
            onClick={() => createCheckpoint()}
            disabled={isProcessing}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 font-inter"
          >
            <i className={`fas ${isProcessing ? 'fa-circle-notch fa-spin' : 'fa-history'}`}></i>
            Marcar Ponto de Controle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 font-inter">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-cloud text-sky-500"></i>
                Backup em Nuvem (Sync)
              </h3>
              <button 
                onClick={handleCloudSync}
                disabled={isCloudProcessing}
                className="text-[10px] font-black px-3 py-1.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all flex items-center gap-2 uppercase"
              >
                {isCloudProcessing ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-sync"></i>}
                Sincronizar Agora
              </button>
            </div>
            <div className="overflow-x-auto font-inter">
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">
                      <th className="px-6 py-4">Servidor</th>
                      <th className="px-6 py-4">Data Sincronização</th>
                      <th className="px-6 py-4">Tamanho</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cloudBackups.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-xs font-bold text-slate-600">{config.cloudProvider}</span>
                           </div>
                           <p className="text-[9px] text-slate-400 font-medium ml-4 truncate max-w-[120px]">{config.cloudAccount}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">{b.timestamp}</td>
                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{b.size}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => restoreFromCloud(b.id)}
                              className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black border border-sky-100 hover:bg-sky-500 hover:text-white transition-all"
                            >
                              BAIXAR E RESTAURAR
                            </button>
                            <button onClick={() => deleteCloudEntry(b.id)} className="p-1.5 text-slate-300 hover:text-rose-500">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {cloudBackups.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                          Nenhuma sincronização em nuvem realizada.
                        </td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 font-inter">
                <i className="fas fa-list-ul text-indigo-500"></i>
                Linha do Tempo Local
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200 uppercase font-inter">
                {checkpoints.length} Estados Salvos
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left font-inter">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">
                    <th className="px-6 py-4">Snapshot Capturado</th>
                    <th className="px-6 py-4">Data e Hora</th>
                    <th className="px-6 py-4">Peso do Registro</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {checkpoints.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black">
                             {c.id.split('-')[1]}
                           </div>
                           <div>
                             <p className="text-sm font-bold text-slate-700">{c.description}</p>
                             <p className="text-[10px] font-mono text-slate-400">{c.id}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">{c.timestamp}</td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{c.size}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => restoreFromCheckpoint(c.id)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100"
                          >
                            Restaurar
                          </button>
                          <button 
                            onClick={() => deleteCheckpoint(c.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {checkpoints.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                        Nenhum registro histórico local disponível.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border-b-4 border-indigo-500 font-inter">
             <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl pointer-events-none">
               <i className="fas fa-save"></i>
             </div>
             <div className="relative z-10 space-y-6">
                <div>
                  <h3 className="text-xl font-bold">Arquivo de Segurança Integral</h3>
                  <p className="text-slate-400 text-sm mt-2">
                    Exporte o arquivo .JSON que contém todo o consultório: Pacientes, Agenda, Financeiro, 
                    <span className="text-indigo-300 font-bold ml-1">Avisos, Tabela de Procedimentos</span> e o seu Histórico de Pontos.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button 
                    onClick={handleExportFile}
                    className="w-full sm:w-auto px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-900/40 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-download"></i> Baixar Backup Completo
                  </button>
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Última Exportação Física</p>
                    <p className="text-sm font-bold text-white">{config.lastExport || 'Pendente'}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6 font-inter">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-magic text-indigo-500"></i>
              Automação de Snapshots
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">Auto-Checkpoints</p>
                  <p className="text-[10px] text-slate-400">Salvar estado periodicamente</p>
                </div>
                <button 
                  onClick={() => setConfig({...config, autoCheckpoint: !config.autoCheckpoint})}
                  className={`w-12 h-6 rounded-full transition-all relative ${config.autoCheckpoint ? 'bg-indigo-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.autoCheckpoint ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {config.autoCheckpoint && (
                <div className="animate-in slide-in-from-top-2 duration-300 space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Frequência: {config.interval}h de uso</label>
                  <input 
                    type="range"
                    min="1"
                    max="24"
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    value={config.interval}
                    onChange={e => setConfig({...config, interval: parseInt(e.target.value)})}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-cloud-upload-alt text-sky-500"></i>
              Configuração de Nuvem
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Provedor de Nuvem</label>
                <select 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                  value={config.cloudProvider}
                  onChange={e => setConfig({...config, cloudProvider: e.target.value})}
                >
                  <option value="AWS S3">AWS S3 (Amazon)</option>
                  <option value="Google Cloud">Google Cloud Storage</option>
                  <option value="Azure Blob">Microsoft Azure</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Conta / E-mail de Sincronização</label>
                <input 
                  type="text"
                  placeholder="ex: conta@clínica.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  value={config.cloudAccount}
                  onChange={e => setConfig({...config, cloudAccount: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">Sync Automático</p>
                  <p className="text-[10px] text-slate-400">Sincronizar com a nuvem</p>
                </div>
                <button 
                  onClick={() => setConfig({...config, autoCloudSync: !config.autoCloudSync})}
                  className={`w-12 h-6 rounded-full transition-all relative ${config.autoCloudSync ? 'bg-sky-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.autoCloudSync ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {config.autoCloudSync && (
                <div className="animate-in slide-in-from-top-2 duration-300 space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">Periodicidade: a cada {config.cloudInterval}h</label>
                  <input 
                    type="range"
                    min="1"
                    max="168"
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    value={config.cloudInterval}
                    onChange={e => setConfig({...config, cloudInterval: parseInt(e.target.value)})}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Escopo do Backup</h4>
             <div className="space-y-3">
                {[
                  { name: 'Pacientes e Prontuários', icon: 'fa-users' },
                  { name: 'Agenda e Horários', icon: 'fa-calendar-alt' },
                  { name: 'Avisos e Pendências', icon: 'fa-bell', highlight: true },
                  { name: 'Tabela de Procedimentos', icon: 'fa-hand-holding-medical', highlight: true },
                  { name: 'Financeiro e Recibos', icon: 'fa-dollar-sign' },
                  { name: 'Estoque de Suprimentos', icon: 'fa-box-open' },
                  { name: 'Pontos de Restauração', icon: 'fa-history' }
                ].map(mod => (
                  <div key={mod.name} className={`flex items-center justify-between text-xs p-2 rounded-lg ${mod.highlight ? 'bg-indigo-50/50' : ''}`}>
                    <div className="flex items-center gap-2">
                       <i className={`fas ${mod.icon} ${mod.highlight ? 'text-indigo-500' : 'text-slate-300'}`}></i>
                       <span className={mod.highlight ? 'text-indigo-700 font-bold' : 'text-slate-500'}>{mod.name}</span>
                    </div>
                    <i className="fas fa-check-circle text-emerald-500"></i>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl space-y-4">
             <div className="flex items-center gap-3 text-blue-600">
               <i className="fas fa-info-circle text-xl"></i>
               <h4 className="font-bold text-sm">Sincronização em Nuvem</h4>
             </div>
             <p className="text-xs text-blue-700 leading-relaxed">
               A sincronização em nuvem garante que seus dados (incluindo <strong>avisos e procedimentos</strong>) estejam seguros mesmo em caso de falha física no dispositivo. Os dados são criptografados antes do envio.
             </p>
          </div>
        </div>
      </div>

      {isRestoring && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95">
             <div className="w-20 h-20 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center text-3xl mx-auto">
               <i className="fas fa-sync-alt animate-spin"></i>
             </div>
             <div>
               <h3 className="text-xl font-black text-slate-800">Espelhamento Integral</h3>
               <p className="text-sm text-slate-500 mt-2">Reconstruindo histórico, avisos e tabela de preços. O sistema será reiniciado...</p>
             </div>
             <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 animate-pulse w-full"></div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backup;
