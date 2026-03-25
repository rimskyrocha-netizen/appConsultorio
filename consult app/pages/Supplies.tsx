import React, { useState, useEffect, useMemo } from 'react';

interface Material {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  lastPurchaseDate?: string;
  supplier?: string;
}

const CATEGORIES = ['Consumo', 'Instrumental', 'Implantes', 'Ortodontia', 'EPIs', 'Outros'];

const INITIAL_MATERIALS: Material[] = [
  { id: 'm1', name: 'Resina Composta A1', category: 'Consumo', currentStock: 5, minStock: 2, unit: 'Seringa', lastPurchaseDate: '2023-10-15', supplier: 'Dental Cremer' },
  { id: 'm2', name: 'Luvas de Nitrilo M', category: 'EPIs', currentStock: 1, minStock: 5, unit: 'Caixa c/ 100', lastPurchaseDate: '2023-11-02', supplier: 'Dental Speed' },
  { id: 'm3', name: 'Anestésico Lidocaína', category: 'Consumo', currentStock: 0, minStock: 10, unit: 'Tubete', lastPurchaseDate: '2023-09-20', supplier: 'Dental Cremer' },
];

const Supplies: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('odontoflow_supplies');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Material, 'id'>>({
    name: '',
    category: 'Consumo',
    currentStock: 0,
    minStock: 0,
    unit: 'Unidade',
    supplier: ''
  });

  useEffect(() => {
    localStorage.setItem('odontoflow_supplies', JSON.stringify(materials));
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           m.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterMode === 'low') return matchesSearch && m.currentStock <= m.minStock && m.currentStock > 0;
      if (filterMode === 'out') return matchesSearch && m.currentStock === 0;
      return matchesSearch;
    });
  }, [materials, searchTerm, filterMode]);

  const handleOpenModal = (m?: Material) => {
    if (m) {
      setEditingId(m.id);
      setFormData({
        name: m.name,
        category: m.category,
        currentStock: m.currentStock,
        minStock: m.minStock,
        unit: m.unit,
        supplier: m.supplier || '',
        lastPurchaseDate: m.lastPurchaseDate
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: 'Consumo',
        currentStock: 0,
        minStock: 0,
        unit: 'Unidade',
        supplier: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return alert("Nome é obrigatório");
    
    if (editingId) {
      setMaterials(prev => prev.map(m => m.id === editingId ? { ...formData, id: editingId } : m));
    } else {
      const newMaterial: Material = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      };
      setMaterials(prev => [newMaterial, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Deseja excluir este material do estoque?")) {
      setMaterials(prev => prev.filter(m => m.id !== id));
    }
  };

  const getStatusColor = (m: Material) => {
    if (m.currentStock === 0) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (m.currentStock <= m.minStock) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const getStatusLabel = (m: Material) => {
    if (m.currentStock === 0) return 'ESGOTADO';
    if (m.currentStock <= m.minStock) return 'ABAIXO DO MÍNIMO';
    return 'NORMAL';
  };

  const shoppingList = useMemo(() => {
    return materials.filter(m => m.currentStock <= m.minStock);
  }, [materials]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestão de Suprimentos</h1>
          <p className="text-slate-500">Controle de estoque, consumo e necessidade de compra.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <i className="fas fa-print"></i> Imprimir Lista
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-sky-600 transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Novo Material
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center text-xl">
            <i className="fas fa-box"></i>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Total Itens</p>
            <p className="text-xl font-bold text-slate-800">{materials.length}</p>
          </div>
        </div>
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center text-xl shadow-lg shadow-amber-200">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div>
            <p className="text-xs text-amber-600 font-bold uppercase">Estoque Baixo</p>
            <p className="text-xl font-bold text-amber-700">{materials.filter(m => m.currentStock > 0 && m.currentStock <= m.minStock).length}</p>
          </div>
        </div>
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500 text-white rounded-xl flex items-center justify-center text-xl shadow-lg shadow-rose-200">
            <i className="fas fa-times-circle"></i>
          </div>
          <div>
            <p className="text-xs text-rose-600 font-bold uppercase">Esgotados</p>
            <p className="text-xl font-bold text-rose-700">{materials.filter(m => m.currentStock === 0).length}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-xl">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Lista de Compras</p>
            <p className="text-xl font-bold">{shoppingList.length} itens</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Pesquisar material..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
              <button onClick={() => setFilterMode('all')} className={`flex-1 md:px-4 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${filterMode === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>Todos</button>
              <button onClick={() => setFilterMode('low')} className={`flex-1 md:px-4 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${filterMode === 'low' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-400'}`}>Críticos</button>
              <button onClick={() => setFilterMode('out')} className={`flex-1 md:px-4 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${filterMode === 'out' ? 'bg-rose-100 text-rose-700 shadow-sm' : 'text-slate-400'}`}>Falta</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">
                    <th className="px-6 py-4">Material / Categoria</th>
                    <th className="px-6 py-4">Estoque Atual</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMaterials.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 group transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{m.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{m.category} • {m.unit}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <span className={`text-sm font-black ${m.currentStock <= m.minStock ? 'text-rose-500' : 'text-slate-700'}`}>
                             {m.currentStock}
                           </span>
                           <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${m.currentStock <= m.minStock ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${Math.min((m.currentStock / (m.minStock * 2)) * 100, 100)}%` }}
                              />
                           </div>
                           <span className="text-[10px] text-slate-300 font-bold">mín. {m.minStock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] px-2 py-1 rounded-full font-black border ${getStatusColor(m)}`}>
                          {getStatusLabel(m)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(m)} className="p-2 text-slate-400 hover:text-sky-600"><i className="fas fa-edit"></i></button>
                          <button onClick={() => handleDelete(m.id)} className="p-2 text-slate-400 hover:text-rose-600"><i className="fas fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMaterials.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">Nenhum material encontrado nestes critérios.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">
                 <i className="fas fa-shopping-basket"></i>
              </div>
              <h3 className="font-bold text-lg mb-1">Necessidade de Compra</h3>
              <p className="text-slate-400 text-xs mb-6">Itens que atingiram o estoque de segurança e precisam de reposição.</p>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                 {shoppingList.map(item => (
                   <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
                      <div>
                         <p className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">{item.name}</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase">Repor: {Math.max(item.minStock * 2 - item.currentStock, 1)} {item.unit}</p>
                      </div>
                      <i className={`fas ${item.currentStock === 0 ? 'fa-times-circle text-rose-500' : 'fa-exclamation-circle text-amber-500'} text-xs`}></i>
                   </div>
                 ))}
                 {shoppingList.length === 0 && (
                   <div className="py-8 text-center text-slate-500 text-xs italic">Tudo em ordem! Nenhum item pendente.</div>
                 )}
              </div>
              
              <button 
                disabled={shoppingList.length === 0}
                className="w-full mt-6 py-3 bg-sky-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg shadow-sky-900/20 disabled:opacity-30"
              >
                Gerar Orçamento Rápido
              </button>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm mb-4">Dicas de Economia</h4>
              <ul className="space-y-3">
                 <li className="flex gap-3">
                    <i className="fas fa-lightbulb text-amber-400 mt-1"></i>
                    <p className="text-xs text-slate-600">Combine compras de materiais de consumo para obter frete grátis e descontos progressivos.</p>
                 </li>
                 <li className="flex gap-3">
                    <i className="fas fa-check-circle text-sky-400 mt-1"></i>
                    <p className="text-xs text-slate-600">Verifique a validade de resinas e adesivos mensalmente para evitar perdas por vencimento.</p>
                 </li>
              </ul>
           </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">{editingId ? 'Editar Material' : 'Novo Material no Estoque'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Material *</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                     {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Qtd Atual</label>
                    <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: parseInt(e.target.value) || 0})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mínimo (Alerta)</label>
                    <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none font-bold text-rose-500" value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unidade de Medida</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="Ex: Seringa, Tubete, Cx c/ 100..." />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fornecedor Preferencial</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} />
               </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600">Cancelar</button>
              <button onClick={handleSave} className="px-8 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-lg">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supplies;