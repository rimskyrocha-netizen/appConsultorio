
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Odontogram from '../components/Odontogram';
import { Patient, User } from '../types';

interface EvolutionRecord {
  id: string;
  date: string;
  professional: string;
  notes: string;
  tags: string[];
}

interface PatientAttachment {
  id: string;
  url: string;
  name: string;
  date: string;
}

interface TreatmentProcedure {
  id: string;
  tooth?: string;
  face?: string;
  description: string;
  value: number;
  status: 'PLANEJADO' | 'REALIZADO' | 'CANCELADO';
  date: string;
}

interface PaymentRecord {
  id: string;
  date: string;
  value: number;
  method: string;
  status: 'PAGO' | 'PENDENTE';
  notes?: string;
}

interface AnamneseData {
  mainComplaint: string;
  hasSystemicDisease: boolean;
  systemicDiseaseDetails: string;
  underMedicalTreatment: boolean;
  medicalTreatmentDetails: string;
  hospitalizedOrSurgery: boolean;
  hospitalizedDetails: string;
  hasDiabetes: boolean;
  hasHypertension: boolean;
  hasHeartProblems: boolean;
  hasAsthma: boolean;
  hasEpilepsy: boolean;
  takingMedication: boolean;
  medicationDetails: string;
  hasAllergies: boolean;
  allergyDetails: string;
  lastDentalVisit: string;
  previousDentalSurgeries: boolean;
  dentalSurgeriesDetails: string;
  usesProsthesisOrOrtho: boolean;
  prosthesisDetails: string;
  smoker: boolean;
  consumesAlcohol: boolean;
  brushingFrequency: string;
  flossing: boolean;
  otherNotes: string;
}

interface ReceiptData {
  value: number;
  description: string;
  date: string;
  professional: string;
  cro?: string;
  state?: string;
  city?: string;
}

const INITIAL_EVOLUTIONS: EvolutionRecord[] = [];
const INITIAL_PLAN: TreatmentProcedure[] = [];
const INITIAL_PAYMENTS: PaymentRecord[] = [];
const INITIAL_ATTACHMENTS: PatientAttachment[] = [];

interface PatientDetailProps {
  patients: Patient[];
  setPatients?: React.Dispatch<React.SetStateAction<Patient[]>>;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patients, setPatients }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState('prontuario');

  const getStoredData = (key: string, defaultVal: any) => {
    const saved = localStorage.getItem(`odontoflow_${key}_${id}`);
    return saved ? JSON.parse(saved) : defaultVal;
  };

  const [evolutions, setEvolutions] = useState<EvolutionRecord[]>(() => 
    getStoredData('evo', INITIAL_EVOLUTIONS)
  );
  const [plan, setPlan] = useState<TreatmentProcedure[]>(() => 
    getStoredData('plan', INITIAL_PLAN)
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(() => 
    getStoredData('pay', INITIAL_PAYMENTS)
  );
  const [attachments, setAttachments] = useState<PatientAttachment[]>(() => 
    getStoredData('att', INITIAL_ATTACHMENTS)
  );
  const [photoUrl, setPhotoUrl] = useState<string>(() => 
    localStorage.getItem(`odontoflow_photo_${id}`) || ''
  );
  
  // Sincronização dos dados ao mudar de paciente para evitar sobreposição de dados de diferentes IDs
  useEffect(() => {
    if (id) {
      setEvolutions(getStoredData('evo', INITIAL_EVOLUTIONS));
      setPlan(getStoredData('plan', INITIAL_PLAN));
      setPayments(getStoredData('pay', INITIAL_PAYMENTS));
      setAttachments(getStoredData('att', INITIAL_ATTACHMENTS));
      setPhotoUrl(localStorage.getItem(`odontoflow_photo_${id}`) || '');
      setAnamnese(getStoredData('anamnese', {
        mainComplaint: '',
        hasSystemicDisease: false,
        systemicDiseaseDetails: '',
        underMedicalTreatment: false,
        medicalTreatmentDetails: '',
        hospitalizedOrSurgery: false,
        hospitalizedDetails: '',
        hasDiabetes: false,
        hasHypertension: false,
        hasHeartProblems: false,
        hasAsthma: false,
        hasEpilepsy: false,
        takingMedication: false,
        medicationDetails: '',
        // Fix: Changed 'boolean' type usage to 'false' value
        hasAllergies: false,
        allergyDetails: '',
        lastDentalVisit: '',
        previousDentalSurgeries: false,
        dentalSurgeriesDetails: '',
        usesProsthesisOrOrtho: false,
        prosthesisDetails: '',
        smoker: false,
        consumesAlcohol: false,
        brushingFrequency: '',
        flossing: false,
        otherNotes: ''
      }));
    }
  }, [id]);

  useEffect(() => { if (id) localStorage.setItem(`odontoflow_evo_${id}`, JSON.stringify(evolutions)); }, [evolutions, id]);
  useEffect(() => { if (id) localStorage.setItem(`odontoflow_plan_${id}`, JSON.stringify(plan)); }, [plan, id]);
  useEffect(() => { if (id) localStorage.setItem(`odontoflow_pay_${id}`, JSON.stringify(payments)); }, [payments, id]);
  useEffect(() => { if (id) localStorage.setItem(`odontoflow_att_${id}`, JSON.stringify(attachments)); }, [attachments, id]);
  useEffect(() => { if (id) localStorage.setItem(`odontoflow_photo_${id}`, photoUrl); }, [photoUrl, id]);

  const [selectedAttachment, setSelectedAttachment] = useState<PatientAttachment | null>(null);
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  const [editingEvoId, setEditingEvoId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPlanEditModalOpen, setIsPlanEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPlanProc, setEditingPlanProc] = useState<TreatmentProcedure | null>(null);
  
  const [isContractEditModalOpen, setIsContractEditModalOpen] = useState(false);
  const [isBudgetEditModalOpen, setIsBudgetEditModalOpen] = useState(false);
  const [isConsentEditModalOpen, setIsConsentEditModalOpen] = useState(false);

  const [showReceiptPrint, setShowReceiptPrint] = useState(false);
  const [showContractPrint, setShowContractPrint] = useState(false);
  const [showBudgetPrint, setShowBudgetPrint] = useState(false);
  const [showConsentPrint, setShowConsentPrint] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [anamneseSaved, setAnamneseSaved] = useState(false);

  const [newEvolutionData, setNewEvolutionData] = useState({
    notes: '',
    tags: [] as string[]
  });

  const [newPayment, setNewPayment] = useState<Partial<PaymentRecord>>({
    date: new Date().toISOString().split('T')[0],
    value: 0,
    method: 'PIX',
    status: 'PAGO',
    notes: ''
  });
  
  const [patient, setPatient] = useState<Patient>(() => {
    return patients.find(p => p.id === id) || {
      id: id || '1',
      name: 'Paciente não encontrado',
      cpf: '',
      birthDate: '',
      phone: '',
      email: '',
      tags: []
    };
  });

  useEffect(() => {
    const found = patients.find(p => p.id === id);
    if (found) setPatient(found);
  }, [id, patients]);

  const [anamnese, setAnamnese] = useState<AnamneseData>(() => 
    getStoredData('anamnese', {
      mainComplaint: '',
      hasSystemicDisease: false,
      systemicDiseaseDetails: '',
      underMedicalTreatment: false,
      medicalTreatmentDetails: '',
      hospitalizedOrSurgery: false,
      hospitalizedDetails: '',
      hasDiabetes: false,
      hasHypertension: false,
      hasHeartProblems: false,
      hasAsthma: false,
      hasEpilepsy: false,
      takingMedication: false,
      medicationDetails: '',
      hasAllergies: false,
      allergyDetails: '',
      lastDentalVisit: '',
      previousDentalSurgeries: false,
      dentalSurgeriesDetails: '',
      usesProsthesisOrOrtho: false,
      prosthesisDetails: '',
      smoker: false,
      consumesAlcohol: false,
      brushingFrequency: '',
      flossing: false,
      otherNotes: ''
    })
  );

  useEffect(() => { if (id) localStorage.setItem(`odontoflow_anamnese_${id}`, JSON.stringify(anamnese)); }, [anamnese, id]);

  const [editFormData, setEditFormData] = useState<Patient>({ ...patient });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    value: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    professional: 'Dr. Roberto Santos',
    cro: '123456',
    state: 'SP',
    city: 'São Paulo'
  });

  const [contractText, setContractText] = useState('');
  const [budgetText, setBudgetText] = useState('Validade deste orçamento: 15 dias. Pagamento facilitado conforme condições comerciais da clínica.');
  const [consentText, setConsentText] = useState('');

  const calculateTotalPlan = () => {
    return plan.reduce((acc, curr) => acc + (curr.status !== 'CANCELADO' ? curr.value : 0), 0);
  };

  const calculateTotalPaid = () => {
    return payments.reduce((acc, curr) => acc + (curr.status === 'PAGO' ? curr.value : 0), 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile: PatientAttachment = {
          id: Math.random().toString(36).substr(2, 9),
          url: reader.result as string,
          name: file.name,
          date: new Date().toLocaleDateString('pt-BR')
        };
        setAttachments(prev => [newFile, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = (file: PatientAttachment) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAttachment = (e: React.MouseEvent, attachmentId: string) => {
    e.stopPropagation(); // Previne que o clique no botão de excluir ative o download no container pai
    if (window.confirm('Deseja excluir este anexo permanentemente?')) {
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    }
  };

  const handleSavePatientEdit = () => {
    const errors: Record<string, string> = {};
    if (!editFormData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!editFormData.phone.trim()) errors.phone = 'Telefone é obrigatório';
    
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    
    const updatedPatient = { ...editFormData };
    setPatient(updatedPatient);
    if (setPatients) setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
    setIsEditModalOpen(false);
    setEditErrors({});
  };

  const handleSaveAnamnese = () => {
    localStorage.setItem(`odontoflow_anamnese_${id}`, JSON.stringify(anamnese));
    setAnamneseSaved(true);
    setTimeout(() => setAnamneseSaved(false), 3000);
  };

  const handleOpenPlanAdd = () => {
    setEditingPlanProc({
      id: '',
      description: '',
      tooth: '',
      face: '',
      value: 0,
      status: 'PLANEJADO',
      date: new Date().toISOString().split('T')[0]
    });
    setIsPlanEditModalOpen(true);
  };

  const handleOpenPlanEdit = (proc: TreatmentProcedure) => {
    setEditingPlanProc({ ...proc });
    setIsPlanEditModalOpen(true);
  };

  const handleSavePlanProc = () => {
    if (!editingPlanProc) return;
    if (!editingPlanProc.description.trim()) return alert("Descrição é obrigatória");
    if (editingPlanProc.id) {
      setPlan(prev => prev.map(p => p.id === editingPlanProc.id ? editingPlanProc : p));
    } else {
      const newProc: TreatmentProcedure = { ...editingPlanProc, id: Math.random().toString(36).substr(2, 9) };
      setPlan(prev => [...prev, newProc]);
    }
    setIsPlanEditModalOpen(false);
    setEditingPlanProc(null);
  };

  const handleSavePayment = () => {
    if (!newPayment.value || newPayment.value <= 0) return alert("Insira um valor válido.");
    const record: PaymentRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: newPayment.date!,
      value: newPayment.value,
      method: newPayment.method!,
      status: newPayment.status!,
      notes: newPayment.notes
    };
    setPayments([record, ...payments]);
    setIsPaymentModalOpen(false);
    setNewPayment({ date: new Date().toISOString().split('T')[0], value: 0, method: 'PIX', status: 'PAGO', notes: '' });
  };

  const handleGeneratePDF = () => {
    setIsGenerating(true);
    const originalTitle = document.title;
    document.title = `Recibo_${patient.name.split(' ')[0]}_${receiptData.date.replace(/-/g, '')}`;
    setShowReceiptPrint(true);
    setTimeout(() => {
      window.print();
      setShowReceiptPrint(false);
      setIsReceiptModalOpen(false);
      setIsGenerating(false);
      document.title = originalTitle;
    }, 500);
  };

  const handleOpenContractEdit = () => {
    setContractText(`Pelo presente instrumento particular, de um lado Consultório Odontológico Dr. Rimsky e Dra. Yoko, devidamente representado, e de outro lado o(a) paciente ${patient.name}, CPF nº ${patient.cpf}, residente e domiciliado(a) conforme cadastro, celebram o presente contrato sob as cláusulas abaixo:
Cláusula 1ª: O objeto do presente contrato é a prestação de serviços odontológicos constantes no Plano de Tratamento aceito pelo CONTRATANTE nesta data.
Cláusula 2ª: O valor total do tratamento é de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotalPlan())}, conforme discriminado no orçamento anexo.
Cláusula 3ª: O CONTRATANTE compromete-se a seguir as orientações clínicas e comparecer pontualmente às consultas agendadas.
Cláusula 4ª: O foro da comarca de São Paulo/SP fica eleito para dirimir quaisquer dúvidas oriundas deste instrumento.`);
    setIsContractEditModalOpen(true);
  };

  const handleGenerateContract = () => {
    setIsGenerating(true);
    const originalTitle = document.title;
    document.title = `Contrato_${patient.name.split(' ')[0]}`;
    setShowContractPrint(true);
    setTimeout(() => {
      window.print();
      setShowContractPrint(false);
      setIsContractEditModalOpen(false);
      setIsGenerating(false);
      document.title = originalTitle;
    }, 500);
  };

  const handleOpenBudgetEdit = () => setIsBudgetEditModalOpen(true);

  const handleGenerateBudget = () => {
    setIsGenerating(true);
    const originalTitle = document.title;
    document.title = `Orcamento_${patient.name.split(' ')[0]}`;
    setShowBudgetPrint(true);
    setTimeout(() => {
      window.print();
      setShowBudgetPrint(false);
      setIsBudgetEditModalOpen(false);
      setIsGenerating(false);
      document.title = originalTitle;
    }, 500);
  };

  const handleOpenConsentEdit = () => {
    setConsentText(`Eu, ${patient.name}, abaixo assinado, declaro que fui devidamente informado(a) e esclarecido(a) pelo cirurgião-dentista sobre o diagnóstico, objetivos, riscos e benefícios do tratamento odontológico proposto no meu plano de tratamento.
Compreendo que qualquer procedimento clínico ou cirúrgico envolve riscos, tais como inchaço, dor, hemorragia, infecção ou reações alérgicas. Declaro que informei corretamente todos os meus dados médicos e alergias na ficha de anamnese.
Autorizo a equipe do Consultório Dr. Rimsky e Dra. Yoko a realizar os procedimentos necessários, bem como a administração de anestésicos locais necessários para o tratamento.
Estou ciente de que o sucesso do tratamento depende também da minha colaboração, seguindo as recomendações pós-operatórias e comparecendo às consultas agendadas.`);
    setIsConsentEditModalOpen(true);
  };

  const handleGenerateConsent = () => {
    setIsGenerating(true);
    const originalTitle = document.title;
    document.title = `TermoConsentimento_${patient.name.split(' ')[0]}`;
    setShowConsentPrint(true);
    setTimeout(() => {
      window.print();
      setShowConsentPrint(false);
      setIsConsentEditModalOpen(false);
      setIsGenerating(false);
      document.title = originalTitle;
    }, 500);
  };

  const handleSaveEvolution = () => {
    if (!newEvolutionData.notes.trim()) return alert("A nota de evolução é obrigatória.");
    if (editingEvoId) {
      setEvolutions(prev => prev.map(evo => evo.id === editingEvoId ? { ...evo, notes: newEvolutionData.notes, tags: newEvolutionData.tags } : evo));
    } else {
      const newEntry: EvolutionRecord = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        professional: 'DR. ROBERTO',
        notes: newEvolutionData.notes,
        tags: newEvolutionData.tags
      };
      setEvolutions([newEntry, ...evolutions]);
    }
    setNewEvolutionData({ notes: '', tags: [] });
    setEditingEvoId(null);
    setIsEvolutionModalOpen(false);
  };

  const toggleEditTag = (tag: string) => {
    setEditFormData(prev => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag] }));
  };

  const toggleEvolutionTag = (tag: string) => {
    setNewEvolutionData(prev => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag] }));
  };

  const calculateAge = (date: string) => {
    if (!date) return 0;
    const today = new Date();
    const birth = new Date(date);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const QuestionToggle = ({ label, value, onChange, warning }: { label: string, value: boolean, onChange: (val: boolean) => void, warning?: boolean }) => (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
      <span className={`text-sm font-medium ${warning && value ? 'text-rose-600' : 'text-slate-700'}`}>{label}</span>
      <div className="flex bg-slate-100 p-1 rounded-lg">
        <button onClick={() => onChange(true)} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${value ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400'}`}>SIM</button>
        <button onClick={() => onChange(false)} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!value ? 'bg-white shadow-sm text-slate-600' : 'text-slate-400'}`}>NÃO</button>
      </div>
    </div>
  );

  const handleOdontogramAdd = (newProc: TreatmentProcedure) => setPlan(prev => [...prev, newProc]);
  const handleOdontogramUpdate = (updatedProc: TreatmentProcedure) => setPlan(prev => prev.map(p => p.id === updatedProc.id ? updatedProc : p));
  const handleOdontogramDelete = (id: string) => setPlan(prev => prev.filter(p => p.id !== id));

  const updateReceiptProfessional = (name: string) => {
    const savedUsers = localStorage.getItem('odontoflow_users');
    if (savedUsers) {
      const users: User[] = JSON.parse(savedUsers);
      const matched = users.find(u => u.name.toLowerCase().includes(name.toLowerCase()));
      if (matched) {
        setReceiptData({
          ...receiptData,
          professional: matched.name,
          cro: matched.cro || receiptData.cro,
          state: matched.state || receiptData.state,
          city: matched.city || receiptData.city
        });
        return;
      }
    }
    setReceiptData({ ...receiptData, professional: name });
  };

  return (
    <div className="space-y-6 theme-odontoflow print:m-0 print:p-0">
      {showReceiptPrint && (
        <div className="fixed inset-0 bg-white z-[100] p-12 flex flex-col items-center justify-between text-slate-900 border-8 border-slate-50 m-4">
           <div className="w-full space-y-8">
              <div className="flex items-center justify-between border-b-2 border-slate-200 pb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center text-white text-3xl"><i className="fas fa-teeth-open"></i></div>
                    <div><h2 className="text-xl font-black tracking-tight leading-tight max-w-[200px]">Consultório Odontológico Dr. Rimsky e Dra. Yoko</h2></div>
                 </div>
                 <div className="text-right">
                    <p className="text-3xl font-black">RECIBO</p>
                    <p className="text-xl font-bold text-sky-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receiptData.value)}</p>
                 </div>
              </div>
              <div className="space-y-6 py-8 text-lg leading-relaxed">
                 <p>Recebi de <span className="font-bold border-b border-dotted border-slate-400 px-2">{patient.name}</span>,</p>
                 <p>inscrito no CPF sob o nº <span className="font-bold border-b border-dotted border-slate-400 px-2">{patient.cpf}</span>,</p>
                 <p>a importância de <span className="font-bold border-b border-dotted border-slate-400 px-2">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receiptData.value)}</span>,</p>
                 <p>referente a: <span className="italic border-b border-dotted border-slate-400 px-2">{receiptData.description}</span>.</p>
              </div>
              <div className="pt-12 flex flex-col items-center gap-12">
                 <p className="text-slate-600">Localidade e Data: <span className="font-bold">{receiptData.city || 'São Paulo'}, {new Date(receiptData.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                 <div className="w-72 border-t-2 border-slate-400 mt-12 pt-4 text-center">
                    <p className="font-black text-slate-800">{receiptData.professional}</p>
                    <p className="text-xs text-slate-500 uppercase font-bold">Cirurgião Dentista • CRO-{receiptData.state || 'SP'} {receiptData.cro || '123456'}</p>
                 </div>
              </div>
           </div>
           <div className="w-full text-[10px] text-slate-400 flex justify-between uppercase font-black tracking-tighter border-t pt-4">
              <span>Gerado eletronicamente via Consultório Odontológico Dr. Rimsky e Dra. Yoko</span>
              <span>Página 1 de 1</span>
           </div>
        </div>
      )}
      {showContractPrint && (
        <div className="fixed inset-0 bg-white z-[100] p-12 flex flex-col text-slate-900 overflow-y-auto">
           <div className="text-center border-b-2 pb-6 mb-8"><h2 className="text-xl font-black uppercase">Contrato de Prestação de Serviços Odontológicos</h2></div>
           <div className="space-y-6 text-sm leading-relaxed text-justify whitespace-pre-wrap">
              {contractText}
              <div className="pt-20 grid grid-cols-2 gap-12">
                 <div className="border-t border-slate-800 pt-2 text-center"><p className="font-bold">{patient.name}</p><p className="text-[10px] uppercase font-bold">Contratante</p></div>
                 <div className="border-t border-slate-800 pt-2 text-center"><p className="font-bold">{receiptData.professional}</p><p className="text-[10px] uppercase font-bold">Contratado</p><p className="text-[9px]">CRO-{receiptData.state} {receiptData.cro}</p></div>
              </div>
              <p className="text-center text-[10px] mt-12">{receiptData.city || 'São Paulo'}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
           </div>
        </div>
      )}
      {showBudgetPrint && (
        <div className="fixed inset-0 bg-white z-[100] p-12 flex flex-col text-slate-900 overflow-y-auto">
           <div className="flex justify-between items-start border-b-2 pb-6 mb-8">
              <div><h2 className="text-2xl font-black uppercase">Orçamento de Tratamento</h2><p className="text-sm font-bold text-slate-500">Paciente: {patient.name}</p><p className="text-sm font-bold text-slate-500">CPF: {patient.cpf}</p></div>
              <div className="text-right"><p className="text-xs font-bold uppercase">Data: {new Date().toLocaleDateString('pt-BR')}</p></div>
           </div>
           <table className="w-full text-left text-sm mb-12">
              <thead><tr className="bg-slate-100 border-y"><th className="p-2">Dente/Face</th><th className="p-2">Procedimento</th><th className="p-2 text-right">Valor</th></tr></thead>
              <tbody className="divide-y">
                 {plan.filter(p => p.status !== 'CANCELADO').map(p => (
                    <tr key={p.id}><td className="p-2 font-bold">{p.tooth || '-'}/{p.face || '-'}</td><td className="p-2">{p.description}</td><td className="p-2 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)}</td></tr>
                 ))}
              </tbody>
              <tfoot><tr className="bg-slate-50 font-black text-lg"><td colSpan={2} className="p-2 text-right uppercase">Total do Orçamento:</td><td className="p-2 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotalPlan())}</td></tr></tfoot>
           </table>
           {budgetText && <div className="mb-12 p-4 bg-slate-50 border rounded italic text-sm">{budgetText}</div>}
           <div className="border-t-2 pt-6"><p className="text-xs font-bold uppercase mb-4">Assinatura de Aceite:</p><div className="w-72 border-b border-slate-800 h-10 mb-2"></div><p className="text-[10px] font-bold">{patient.name}</p></div>
        </div>
      )}
      {showConsentPrint && (
        <div className="fixed inset-0 bg-white z-[100] p-12 flex flex-col text-slate-900 overflow-y-auto">
           <div className="text-center border-b-2 pb-6 mb-8"><h2 className="text-xl font-black uppercase">Termo de Consentimento Livre e Esclarecido (TCLE)</h2></div>
           <div className="space-y-6 text-sm leading-relaxed text-justify whitespace-pre-wrap">
              {consentText}
              <div className="pt-20 border-t border-slate-400 mt-20 text-center mx-auto w-96"><p className="font-bold">{patient.name}</p><p className="text-[10px] uppercase font-bold">Assinatura do Paciente ou Responsável Legal</p><p className="text-[10px] mt-4">CPF: {patient.cpf}</p></div>
              <p className="text-center text-[10px] mt-12">{receiptData.city || 'São Paulo'}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
           </div>
        </div>
      )}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start justify-between print:hidden gap-6">
        <div className="flex gap-6 w-full">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden">
              <img 
                src={photoUrl || `https://picsum.photos/seed/patient${patient.id}/150/150`} 
                alt="Paciente" 
                className="w-full h-full object-cover"
              />
            </div>
            <button 
              onClick={() => photoInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-sky-600 shadow-sm transition-all z-10"
              title="Configurar Foto"
            >
              <i className="fas fa-cog text-xs"></i>
            </button>
            <input 
              type="file" 
              ref={photoInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
          </div>
          <div className="space-y-2 overflow-hidden flex-1 font-inter">
            <div className="flex items-center gap-3">
               <h1 className="text-2xl font-bold text-slate-800 truncate">{patient.name}</h1>
               {patient.whatsapp && <a href={`https://wa.me/55${patient.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><i className="fab fa-whatsapp"></i></a>}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-2"><i className="fas fa-id-card text-slate-400"></i> {patient.cpf || '-'}</span>
              <span className="flex items-center gap-2"><i className="fas fa-calendar text-slate-400"></i> {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : '-'} ({calculateAge(patient.birthDate)} anos)</span>
              <span className="flex items-center gap-2"><i className="fas fa-phone text-slate-400"></i> {patient.phone}</span>
              {patient.email && <span className="flex items-center gap-2"><i className="fas fa-envelope text-slate-400"></i> {patient.email}</span>}
            </div>
            <div className="flex flex-wrap gap-2 pt-1"><span className="text-[10px] px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full font-bold uppercase tracking-wider border border-sky-100"><i className="fas fa-shield-alt mr-1"></i> {patient.insuranceName || 'Particular'} {patient.insuranceCard && `(${patient.insuranceCard})`}</span>{patient.tags.map(tag => (<span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold uppercase tracking-wider">{tag}</span>))}</div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 w-full md:w-auto">
          <button onClick={() => { setEditFormData({ ...patient }); setEditErrors({}); setIsEditModalOpen(true); }} className="flex-1 md:flex-none p-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-all shadow-sm"><i className="fas fa-edit mr-2"></i> Editar</button>
          <button onClick={() => navigate('/', { state: { openScheduleModal: true, patientName: patient.name } })} className="flex-1 md:flex-none px-5 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all">Nova Consulta</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
        <div className="lg:col-span-2 space-y-8">
          <div className="border-b border-slate-200 flex gap-8 overflow-x-auto pb-1">
            {[{ id: 'prontuario', label: 'Prontuário & Odontograma' }, { id: 'anamnese', label: 'Anamnese Digital' }, { id: 'plano', label: 'Plano de Tratamento' }, { id: 'financeiro', label: 'Financeiro' }, { id: 'documentos', label: 'Documentos' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-4 text-sm font-semibold transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-sky-600' : 'text-slate-500 hover:text-slate-800'}`}>{tab.label}{activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-600"></div>}</button>
            ))}
          </div>
          {activeTab === 'prontuario' && (
            <><Odontogram plan={plan} onProcedureAdd={handleOdontogramAdd} onProcedureUpdate={handleOdontogramUpdate} onProcedureDelete={handleOdontogramDelete} />
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><i className="fas fa-history text-slate-400"></i> Evolução Clínica</h2><button onClick={() => { setEditingEvoId(null); setNewEvolutionData({ notes: '', tags: [] }); setIsEvolutionModalOpen(true); }} className="text-sm text-sky-600 font-bold hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-all">+ Nova Evolução</button></div>
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:bg-slate-100">
                  {evolutions.map((evo) => (
                    <div key={evo.id} className="relative flex gap-6 group"><div className="absolute left-0 mt-1.5 w-10 h-10 rounded-full bg-white border-2 border-sky-500 z-10 flex items-center justify-center shadow-sm"><i className="fas fa-stethoscope text-sky-500 text-xs"></i></div>
                      <div className="flex-1 ml-12"><div className="flex items-center justify-between mb-2"><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{evo.date} • {evo.professional}</p><div className="flex items-center gap-2"><div className="flex gap-1">{evo.tags.map(tag => (<span key={tag} className="text-[9px] px-1.5 py-0.5 bg-sky-50 text-sky-600 rounded font-bold uppercase">{tag}</span>))}</div><div className="flex gap-1 transition-opacity ml-2"><button onClick={() => { setEditingEvoId(evo.id); setNewEvolutionData({ notes: evo.notes, tags: evo.tags }); setIsEvolutionModalOpen(true); }} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"><i className="fas fa-edit text-[10px]"></i></button><button onClick={() => { if(window.confirm('Excluir esta evolução clínica?')) setEvolutions(prev => prev.filter(e => e.id !== evo.id)); }} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"><i className="fas fa-trash text-[10px]"></i></button></div></div></div><div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed">{evo.notes}</div></div></div>
                  ))}
                </div>
              </div>
            </>
          )}
          {activeTab === 'anamnese' && (
            <div className="space-y-6 animate-in fade-in duration-300 pb-10">
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><div><h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight font-inter">Ficha de Anamnese Odontológica</h2><p className="text-xs text-slate-500 font-medium">Preenchimento digital conforme protocolo clínico.</p></div><div className="flex items-center gap-3"><button className="p-2 text-slate-400 hover:text-sky-600 transition-colors" title="Imprimir Anamnese"><i className="fas fa-print"></i></button><button onClick={handleSaveAnamnese} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${anamneseSaved ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-sky-500 text-white shadow-sky-100 hover:bg-sky-600'}`}>{anamneseSaved ? <><i className="fas fa-check mr-2"></i> Atualizado!</> : 'Salvar Ficha'}</button></div></div>
                  <div className="p-8 space-y-12 font-inter">
                    <section><h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 pb-2 border-b-2 border-slate-100 font-inter">1. Queixa Principal</h3><textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all h-20" placeholder="Relato do paciente sobre o motivo da consulta..." value={anamnese.mainComplaint} onChange={e => setAnamnese({...anamnese, mainComplaint: e.target.value})} /></section>
                    <section><h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 pb-2 border-b-2 border-slate-100 font-inter">2. Histórico Médico</h3>
                      <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><QuestionToggle label="Possui alguma doença sistêmica?" value={anamnese.hasSystemicDisease} onChange={val => setAnamnese({...anamnese, hasSystemicDisease: val})} warning />{anamnese.hasSystemicDisease && <input className="w-full px-4 py-2 text-sm border-b-2 border-rose-100 bg-rose-50/20 outline-none" placeholder="Qual?" value={anamnese.systemicDiseaseDetails} onChange={e => setAnamnese({...anamnese, systemicDiseaseDetails: e.target.value})} />}<QuestionToggle label="Faz tratamento médico atualmente?" value={anamnese.underMedicalTreatment} onChange={val => setAnamnese({...anamnese, underMedicalTreatment: val})} />{anamnese.underMedicalTreatment && <input className="w-full px-4 py-2 text-sm border-b-2 border-sky-100 bg-sky-50/20 outline-none" placeholder="Especifique o tratamento..." value={anamnese.medicalTreatmentDetails} onChange={e => setAnamnese({...anamnese, medicalTreatmentDetails: e.target.value})} />}<QuestionToggle label="Já foi internado ou submetido a cirurgia?" value={anamnese.hospitalizedOrSurgery} onChange={val => setAnamnese({...anamnese, hospitalizedOrSurgery: val})} />{anamnese.hospitalizedOrSurgery && <input className="w-full px-4 py-2 text-sm border-b-2 border-sky-100 bg-sky-50/20 outline-none" placeholder="Motivo e data aproximada..." value={anamnese.hospitalizedDetails} onChange={e => setAnamnese({...anamnese, hospitalizedDetails: e.target.value})} />}</div><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-inter"><p className="text-[10px] font-black text-slate-400 uppercase md:col-span-3 mt-2 font-inter">Condições Específicas:</p><QuestionToggle label="Cardiopatias" value={anamnese.hasHeartProblems} onChange={val => setAnamnese({...anamnese, hasHeartProblems: val})} warning /><QuestionToggle label="Diabetes" value={anamnese.hasDiabetes} onChange={val => setAnamnese({...anamnese, hasDiabetes: val})} warning /><QuestionToggle label="Hipertensão" value={anamnese.hasHypertension} onChange={val => setAnamnese({...anamnese, hasHypertension: val})} warning /><QuestionToggle label="Asma" value={anamnese.hasAsthma} onChange={val => setAnamnese({...anamnese, hasAsthma: val})} warning /><QuestionToggle label="Epilepsia" value={anamnese.hasEpilepsy} onChange={val => setAnamnese({...anamnese, hasEpilepsy: val})} warning /></div></div></section>
                    <section><h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 pb-2 border-b-2 border-slate-100 font-inter">3. Medicações e Alergias</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-inter"><div className="space-y-3"><QuestionToggle label="Faz uso de medicamentos contínuos?" value={anamnese.takingMedication} onChange={val => setAnamnese({...anamnese, takingMedication: val})} />{anamnese.takingMedication && <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 h-20" placeholder="Quais medicamentos e dosagens?" value={anamnese.medicationDetails} onChange={e => setAnamnese({...anamnese, medicationDetails: e.target.value})} />}</div><div className="space-y-3"><QuestionToggle label="Alergia a medicamentos ou anestésicos?" value={anamnese.hasAllergies} onChange={val => setAnamnese({...anamnese, hasAllergies: val})} warning />{anamnese.hasAllergies && <textarea className="w-full p-3 bg-rose-50 border border-rose-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 h-20" placeholder="Descreva as substâncias..." value={anamnese.allergyDetails} onChange={e => setAnamnese({...anamnese, allergyDetails: e.target.value})} />}</div></div></section>
                    <section><h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 pb-2 border-b-2 border-slate-100 font-inter">4. Histórico Odontológico</h3><div className="space-y-6 font-inter"><div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Data da última consulta odontológica</label><input type="text" className="w-full bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500" value={anamnese.lastDentalVisit} onChange={e => setAnamnese({...anamnese, lastDentalVisit: e.target.value})} placeholder="Ex: Há 6 meses, Ano passado..." /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><QuestionToggle label="Já realizou extrações, cirurgias ou canal?" value={anamnese.previousDentalSurgeries} onChange={val => setAnamnese({...anamnese, previousDentalSurgeries: val})} />{anamnese.previousDentalSurgeries && <input className="w-full px-4 py-2 text-sm border-b-2 border-sky-100 bg-sky-50/20 outline-none" placeholder="Quais procedimentos?" value={anamnese.dentalSurgeriesDetails} onChange={e => setAnamnese({...anamnese, dentalSurgeriesDetails: e.target.value})} />}<QuestionToggle label="Usa prótese ou aparelho ortodôntico?" value={anamnese.usesProsthesisOrOrtho} onChange={val => setAnamnese({...anamnese, usesProsthesisOrOrtho: val})} />{anamnese.usesProsthesisOrOrtho && <input className="w-full px-4 py-2 text-sm border-b-2 border-sky-100 bg-sky-50/20 outline-none" placeholder="Descreva o tipo de aparelho/prótese..." value={anamnese.prosthesisDetails} onChange={e => setAnamnese({...anamnese, prosthesisDetails: e.target.value})} />}</div></div></section>
                    <section><h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 pb-2 border-b-2 border-slate-100 font-inter">5. Hábitos</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-inter"><QuestionToggle label="Fuma?" value={anamnese.smoker} onChange={val => setAnamnese({...anamnese, smoker: val})} warning /><QuestionToggle label="Consome álcool?" value={anamnese.consumesAlcohol} onChange={val => setAnamnese({...anamnese, consumesAlcohol: val})} /><div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"><div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Escova os dentes quantas vezes ao dia?</label><input type="text" className="w-full bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-sm outline-none" value={anamnese.brushingFrequency} onChange={e => setAnamnese({...anamnese, brushingFrequency: e.target.value})} /></div><QuestionToggle label="Usa fio dental?" value={anamnese.flossing} onChange={val => setAnamnese({...anamnese, flossing: val})} /></div></div></section>
                    <section><h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 pb-2 border-b-2 border-slate-100 font-inter">6. Observações Adicionais</h3><textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all h-32" placeholder="Anotações complementares relevantes ao histórico clínico do paciente..." value={anamnese.otherNotes} onChange={e => setAnamnese({...anamnese, otherNotes: e.target.value})} /></section>
                  </div>
               </div>
            </div>
          )}
          {activeTab === 'plano' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30"><h2 className="text-lg font-bold text-slate-800 font-inter">Plano de Tratamento</h2><button onClick={handleOpenPlanAdd} className="px-4 py-2 bg-sky-500 text-white rounded-lg text-xs font-bold hover:bg-sky-600 transition-all">+ Adicionar Procedimento</button></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-inter">
                      <thead><tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-100"><th className="px-6 py-4">Dente/Face</th><th className="px-6 py-4">Procedimento</th><th className="px-6 py-4">Valor</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">{plan.map((proc) => (<tr key={proc.id} className="hover:bg-slate-50 transition-colors"><td className="px-6 py-4"><span className="font-bold text-sky-600">{proc.tooth || '-'}</span><span className="text-slate-400 ml-1">[{proc.face || '-'}]</span></td><td className="px-6 py-4 text-sm font-medium text-slate-700">{proc.description}</td><td className="px-6 py-4 text-sm font-bold text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proc.value)}</td><td className="px-6 py-4"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${proc.status === 'REALIZADO' ? 'bg-emerald-100 text-emerald-700' : proc.status === 'CANCELADO' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>{proc.status}</span></td><td className="px-6 py-4 text-right"><button onClick={() => handleOpenPlanEdit(proc)} className="p-2 text-slate-400 hover:text-sky-600 transition-colors" title="Editar Procedimento"><i className="fas fa-edit"></i></button><button onClick={() => setPlan(prev => prev.filter(p => p.id !== proc.id))} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><i className="fas fa-trash"></i></button></td></tr>))}</tbody>
                    </table>
                  </div>
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center font-inter"><p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total do Plano</p><p className="text-xl font-black text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotalPlan())}</p></div>
               </div>
            </div>
          )}
          {activeTab === 'financeiro' && (
            <div className="space-y-6 animate-in fade-in duration-300 font-inter">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-inter">Total do Plano</p><p className="text-xl font-black text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotalPlan())}</p></div><div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm"><p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 font-inter">Total Recebido</p><p className="text-xl font-black text-emerald-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotalPaid())}</p></div><div className={`p-6 rounded-2xl border shadow-sm ${calculateTotalPlan() - calculateTotalPaid() > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}><p className={`text-[10px] font-black uppercase tracking-widest mb-1 font-inter ${calculateTotalPlan() - calculateTotalPaid() > 0 ? 'text-rose-600' : 'text-slate-400'}`}>Saldo Devedor</p><p className={`text-xl font-black ${calculateTotalPlan() - calculateTotalPaid() > 0 ? 'text-rose-700' : 'text-slate-800'}`}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotalPlan() - calculateTotalPaid())}</p></div></div>
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-inter"><div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"><h2 className="text-lg font-bold text-slate-800 font-inter">Histórico de Pagamentos</h2><button onClick={() => setIsPaymentModalOpen(true)} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all">+ Registrar Recebimento</button></div>
                  <div className="overflow-x-auto"><table className="w-full text-left font-inter"><thead><tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-100"><th className="px-6 py-4">Data</th><th className="px-6 py-4">Valor</th><th className="px-6 py-4">Método</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">{payments.map((pay) => (<tr key={pay.id} className="hover:bg-slate-50 transition-colors"><td className="px-6 py-4 text-sm font-medium text-slate-600">{new Date(pay.date).toLocaleDateString('pt-BR')}</td><td className="px-6 py-4 text-sm font-bold text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pay.value)}</td><td className="px-6 py-4 text-sm text-slate-500">{pay.method}{pay.notes && <p className="text-[10px] italic text-slate-400">{pay.notes}</p>}</td><td className="px-6 py-4"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${pay.status === 'PAGO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{pay.status}</span></td><td className="px-6 py-4 text-right"><button onClick={() => { setReceiptData({ value: pay.value, description: `Pagamento referente a serviços odontológicos em ${new Date(pay.date).toLocaleDateString('pt-BR')}.`, date: pay.date, professional: 'Dr. Roberto Santos' }); setIsReceiptModalOpen(true); }} className="p-2 text-slate-400 hover:text-sky-600" title="Emitir Recibo desta transação"><i className="fas fa-file-invoice-dollar"></i></button><button onClick={() => setPayments(prev => prev.filter(p => p.id !== pay.id))} className="p-2 text-slate-400 hover:text-rose-500"><i className="fas fa-trash"></i></button></td></tr>))}{payments.length === 0 && (<tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm font-inter">Nenhum pagamento registrado.</td></tr>)}</tbody>
                    </table></div>
               </div>
            </div>
          )}
          {activeTab === 'documentos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300 font-inter"><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all group"><div><div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center mb-4 text-xl font-inter"><i className="fas fa-file-contract"></i></div><h3 className="font-bold text-slate-800 font-inter">Contrato de Tratamento</h3><p className="text-xs text-slate-500 mt-2 font-inter">Gerar contrato padrão de prestação de serviços odontológicos.</p></div><button onClick={handleOpenContractEdit} disabled={isGenerating} className="w-full mt-6 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-sky-500 hover:text-white transition-all disabled:opacity-50">{isGenerating ? 'PROCESSANDO...' : 'EDITAR E GERAR'}</button></div><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all group"><div><div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4 text-xl font-inter"><i className="fas fa-file-alt"></i></div><h3 className="font-bold text-slate-800 font-inter">Orçamento Detalhado</h3><p className="text-xs text-slate-500 mt-2 font-inter">Gera PDF com os valores e procedimentos do plano ativo.</p></div><button onClick={handleOpenBudgetEdit} disabled={isGenerating} className="w-full mt-6 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50">{isGenerating ? 'PROCESSANDO...' : 'EDITAR E GERAR'}</button></div><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all group"><div><div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-4 text-xl font-inter"><i className="fas fa-user-check"></i></div><h3 className="font-bold text-slate-800 font-inter">Termo de Consentimento</h3><p className="text-xs text-slate-500 mt-2 font-inter">Documento de riscos e autorização cirúrgica/clínica.</p></div><button onClick={handleOpenConsentEdit} disabled={isGenerating} className="w-full mt-6 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50">{isGenerating ? 'PROCESSANDO...' : 'EDITAR E GERAR'}</button></div></div>
          )}
        </div>
        <div className="space-y-6 font-inter"><div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm font-inter"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider font-inter"><i className="fas fa-paperclip text-slate-400 font-inter"></i> Arquivos Anexados</h3><div className="grid grid-cols-2 gap-3 font-inter"><button onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-sky-300 transition-all group font-inter"><i className="fas fa-cloud-upload-alt text-xl mb-1 group-hover:scale-110 transition-transform font-inter"></i><span className="text-[10px] font-bold uppercase tracking-tighter font-inter">Anexar</span></button><input type="file" ref={fileInputRef} className="hidden font-inter" accept="image/*,.pdf" onChange={handleFileUpload} />{attachments.map(att => (<div key={att.id} onClick={() => handleDownload(att)} className="aspect-square bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative group cursor-pointer shadow-sm font-inter"><img src={att.url} className="w-full h-full object-cover" alt={att.name} /><div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[1px] font-inter"><button type="button" onClick={(e) => handleDeleteAttachment(e, att.id)} className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-inter border-none shadow-md hover:bg-rose-600 transition-all"><i className="fas fa-trash text-xs font-inter"></i></button></div></div>))}</div></div><div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm font-inter"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider font-inter"><i className="fas fa-info-circle text-slate-400 font-inter"></i> Resumo Financeiro</h3><div className="space-y-4 font-inter"><div><p className="text-[10px] text-slate-400 font-bold uppercase font-inter">Saldo Devedor (Plano)</p><p className="text-lg font-bold text-rose-500 font-inter">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotalPlan() - calculateTotalPaid())}</p></div><button onClick={() => { setReceiptData({ ...receiptData, value: calculateTotalPaid(), description: `Recebimento total referente a tratamentos odontológicos concluídos e em andamento.` }); setIsReceiptModalOpen(true); }} className="w-full py-2 bg-sky-500 text-white rounded-lg text-xs font-bold transition-all shadow-md hover:bg-sky-600 font-inter">Emitir Recibo Global</button></div></div></div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden font-inter">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 font-inter">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 font-inter"><div><h3 className="font-bold text-slate-800 text-lg font-inter">Editar Dados do Paciente</h3><p className="text-xs text-slate-500 font-inter">Atualize as informações cadastrais básicas.</p></div><button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-inter"><i className="fas fa-times text-xl font-inter"></i></button></div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto font-inter"><div className="md:col-span-2"><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Nome Completo *</label><input type="text" className={`w-full px-4 py-2 border rounded-xl text-sm outline-none transition-all font-inter ${editErrors.name ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:ring-2 focus:ring-sky-500'}`} value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} /></div><div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">CPF</label><input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none font-inter" value={editFormData.cpf} onChange={e => setEditFormData({ ...editFormData, cpf: e.target.value })} /></div><div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Nascimento</label><input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none font-inter" value={editFormData.birthDate} onChange={e => setEditFormData({ ...editFormData, birthDate: e.target.value })} /></div><div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Telefone Principal *</label><input type="text" className={`w-full px-4 py-2 border rounded-xl text-sm outline-none transition-all font-inter ${editErrors.phone ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:ring-2 focus:ring-sky-500'}`} value={editFormData.phone} onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} /></div><div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">WhatsApp</label><input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none font-inter" value={editFormData.whatsapp} onChange={e => setEditFormData({ ...editFormData, whatsapp: e.target.value })} /></div><div className="md:col-span-2"><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">E-mail</label><input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none font-inter" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} /></div><div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 font-inter">Plano / Convênio</h4></div><div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Nome do Convênio</label><input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none font-inter" value={editFormData.insuranceName} onChange={e => setEditFormData({ ...editFormData, insuranceName: e.target.value })} /></div><div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Nº Carteirinha</label><input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none font-inter" value={editFormData.insuranceCard} onChange={e => setEditFormData({ ...editFormData, insuranceCard: e.target.value })} /></div><div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 font-inter">Informações Administrativas</h4></div><div className="md:col-span-2"><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Observações Gerais</label><textarea className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none h-24 font-inter" value={editFormData.observations} onChange={e => setEditFormData({ ...editFormData, observations: e.target.value })} placeholder="Notas internas, preferências ou histórico relevante..." /></div><div className="md:col-span-2"><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-inter">Classificação (Tags)</label><div className="flex flex-wrap gap-2">{['Ortodontia', 'Implante', 'Estética', 'Retorno', 'VIP', 'Novo', 'Atrasado'].map(tag => (<button key={tag} onClick={() => toggleEditTag(tag)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border font-inter ${editFormData.tags.includes(tag) ? 'bg-sky-500 border-sky-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-sky-300'}`}>{tag}</button>))}</div></div></div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 font-inter"><button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors font-inter">Cancelar</button><button onClick={handleSavePatientEdit} className="px-10 py-2.5 bg-sky-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-sky-100 hover:bg-sky-600 transition-all font-inter">Salvar Alterações</button></div>
          </div>
        </div>
      )}
      {isContractEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden font-inter">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 font-inter"><div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 font-inter"><h3 className="font-bold text-slate-800 font-inter">Personalizar Contrato</h3><button onClick={() => setIsContractEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-inter"><i className="fas fa-times font-inter"></i></button></div><div className="p-8 font-inter"><textarea className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none h-[400px] leading-relaxed font-inter" value={contractText} onChange={e => setContractText(e.target.value)} /></div><div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 font-inter"><button onClick={() => setIsContractEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 font-inter">Cancelar</button><button onClick={handleGenerateContract} className="px-8 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-sky-600 transition-all flex items-center gap-2 font-inter"><i className="fas fa-print font-inter"></i> Gerar Impressão</button></div></div>
        </div>
      )}
      {isBudgetEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden font-inter">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 font-inter"><div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 font-inter"><h3 className="font-bold text-slate-800 font-inter">Observações do Orçamento</h3><button onClick={() => setIsBudgetEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-inter"><i className="fas fa-times font-inter"></i></button></div><div className="p-8 space-y-4 font-inter"><p className="text-xs text-slate-500 font-inter">Adicione notas de rodapé, prazos de validade ou condições de pagamento específicas para este orçamento.</p><textarea className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-48 leading-relaxed font-inter" value={budgetText} onChange={e => setBudgetText(e.target.value)} /></div><div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 font-inter"><button onClick={() => setIsBudgetEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 font-inter">Cancelar</button><button onClick={handleGenerateBudget} className="px-8 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2 font-inter"><i className="fas fa-print font-inter"></i> Gerar Impressão</button></div></div>
        </div>
      )}
      {isConsentEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden font-inter">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 font-inter"><div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 font-inter"><h3 className="font-bold text-slate-800 font-inter">Personalizar Termo de Consentimento</h3><button onClick={() => setIsConsentEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-inter"><i className="fas fa-times font-inter"></i></button></div><div className="p-8 font-inter"><textarea className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none h-[400px] leading-relaxed font-inter" value={consentText} onChange={e => setConsentText(e.target.value)} /></div><div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 font-inter"><button onClick={() => setIsConsentEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 font-inter">Cancelar</button><button onClick={handleGenerateConsent} className="px-8 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2 font-inter"><i className="fas fa-print font-inter"></i> Gerar Impressão</button></div></div>
        </div>
      )}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden font-inter">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 font-inter">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 font-inter">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 font-inter"><i className="fas fa-file-invoice-dollar text-sky-500 font-inter"></i> Configurar Recibo</h3>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-inter"><i className="fas fa-times font-inter"></i></button>
            </div>
            <div className="p-8 space-y-4 font-inter max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Valor do Recibo (R$)</label>
                <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none font-inter" value={receiptData.value} onChange={e => setReceiptData({...receiptData, value: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Referente a (Descrição)</label>
                <textarea className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none h-24 font-inter" value={receiptData.description} onChange={e => setReceiptData({...receiptData, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Data de Emissão</label>
                <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none font-inter" value={receiptData.date} onChange={e => setReceiptData({...receiptData, date: e.target.value})} />
              </div>
              <div className="border-t border-slate-100 pt-4 mt-2 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dados do Profissional</p>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-inter">Nome do Profissional</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none font-inter" value={receiptData.professional} onChange={e => updateReceiptProfessional(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-inter">CRO</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none font-inter" value={receiptData.cro} onChange={e => setReceiptData({...receiptData, cro: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-inter">UF</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none font-inter" value={receiptData.state} onChange={e => setReceiptData({...receiptData, state: e.target.value.toUpperCase()})} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-inter">Cidade</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none font-inter" value={receiptData.city} onChange={e => setReceiptData({...receiptData, city: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 font-inter">
              <button onClick={() => setIsReceiptModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 font-inter">Cancelar</button>
              <button onClick={handleGeneratePDF} disabled={isGenerating} className="px-8 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all flex items-center gap-2 font-inter">
                {isGenerating ? <><i className="fas fa-circle-notch fa-spin font-inter"></i> Processando...</> : <><i className="fas fa-print font-inter"></i> Visualizar e Imprimir</>}
              </button>
            </div>
          </div>
        </div>
      )}
      {isPlanEditModalOpen && editingPlanProc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden font-inter">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 font-inter">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 font-inter">
              <h3 className="font-bold text-slate-800 font-inter">
                {editingPlanProc.id ? 'Editar Procedimento' : 'Novo Procedimento no Plano'}
              </h3>
              <button onClick={() => setIsPlanEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-inter">
                <i className="fas fa-times font-inter"></i>
              </button>
            </div>
            <div className="p-8 space-y-4 font-inter">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Descrição do Procedimento *</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none font-inter" value={editingPlanProc.description} onChange={e => setEditingPlanProc({...editingPlanProc, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Dente (Opcional)</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none font-inter" value={editingPlanProc.tooth} onChange={e => setEditingPlanProc({...editingPlanProc, tooth: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Face (Opcional)</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none font-inter" value={editingPlanProc.face} onChange={e => setEditingPlanProc({...editingPlanProc, face: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Valor (R$) *</label>
                  <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none font-inter" value={editingPlanProc.value} onChange={e => setEditingPlanProc({...editingPlanProc, value: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Data</label>
                  <input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none font-inter" value={editingPlanProc.date} onChange={e => setEditingPlanProc({...editingPlanProc, date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Status</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none bg-white font-inter" value={editingPlanProc.status} onChange={e => setEditingPlanProc({...editingPlanProc, status: e.target.value as any})}>
                  <option value="PLANEJADO">PLANEJADO</option>
                  <option value="REALIZADO">REALIZADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 font-inter">
              <button onClick={() => setIsPlanEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 font-inter">Cancelar</button>
              <button onClick={handleSavePlanProc} className="px-8 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-sky-600 transition-all font-inter">Salvar no Plano</button>
            </div>
          </div>
        </div>
      )}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden font-inter">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 font-inter"><div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 font-inter"><h3 className="font-bold text-slate-800 flex items-center gap-2 font-inter"><i className="fas fa-hand-holding-dollar text-emerald-500 font-inter"></i> Registrar Pagamento</h3><button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-inter"><i className="fas fa-times font-inter"></i></button></div><div className="p-8 space-y-4 font-inter"><div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Valor Recebido (R$)</label><input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none font-inter" value={newPayment.value} onChange={e => setNewPayment({...newPayment, value: parseFloat(e.target.value)})} /></div><div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Data do Pagamento</label><input type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-inter" value={newPayment.date} onChange={e => setNewPayment({...newPayment, date: e.target.value})} /></div><div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Método</label><select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-inter" value={newPayment.method} onChange={e => setNewPayment({...newPayment, method: e.target.value})}><option value="PIX">PIX</option><option value="Dinheiro">Dinheiro</option><option value="Cartão de Crédito">Cartão de Crédito</option><option value="Cartão de Débito">Cartão de Débito</option><option value="Boleto">Boleto</option></select></div><div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Status</label><select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-inter" value={newPayment.status} onChange={e => setNewPayment({...newPayment, status: e.target.value as any})}><option value="PAGO">PAGO</option><option value="PENDENTE">PENDENTE (Previsão)</option></select></div><div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-inter">Observações</label><input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-inter" placeholder="Ex: Parcela 2, Pago via App..." value={newPayment.notes} onChange={e => setNewPayment({...newPayment, notes: e.target.value})} /></div></div><div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 font-inter"><button onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 font-inter">Cancelar</button><button onClick={handleSavePayment} className="px-8 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all font-inter">Confirmar Lançamento</button></div></div>
        </div>
      )}
      {isEvolutionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden font-inter">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 font-inter"><div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 font-inter"><h3 className="font-bold text-slate-800 flex items-center gap-2 font-inter"><i className="fas fa-notes-medical text-sky-500 font-inter"></i>{editingEvoId ? 'Editar Evolução Clínica' : 'Registrar Evolução Clínica'}</h3><button onClick={() => { setIsEvolutionModalOpen(false); setEditingEvoId(null); }} className="text-slate-400 hover:text-slate-600 font-inter"><i className="fas fa-times font-inter"></i></button></div><div className="p-8 space-y-6 font-inter"><div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-inter">Anotações do Procedimento *</label><textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none h-48 leading-relaxed font-inter" placeholder="Descreva o que foi realizado hoje, observações clínicas, orientações dadas ao paciente, etc..." value={newEvolutionData.notes} onChange={e => setNewEvolutionData({...newEvolutionData, notes: e.target.value})} /></div><div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 font-inter">Tags Rápidas</label><div className="flex flex-wrap gap-2 font-inter">{['Profilaxia', 'Cirurgia', 'Restauração', 'Endodontia', 'Ortodontia', 'Urgência', 'Consulta'].map(tag => (<button key={tag} onClick={() => toggleEvolutionTag(tag)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border font-inter ${newEvolutionData.tags.includes(tag) ? 'bg-sky-500 border-sky-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-sky-300'}`}>{tag}</button>))}</div></div></div><div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 font-inter"><button onClick={() => { setIsEvolutionModalOpen(false); setEditingEvoId(null); }} className="px-6 py-2 text-sm font-semibold text-slate-600 font-inter">Cancelar</button><button onClick={handleSaveEvolution} className="px-8 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all font-inter">{editingEvoId ? 'Salvar Alterações' : 'Salvar Evolução'}</button></div></div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
