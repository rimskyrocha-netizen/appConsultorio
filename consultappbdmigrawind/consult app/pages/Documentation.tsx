
import React from 'react';

const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">Documentação - Consultório Odontológico Dr. Rimsky e Dra. Yoko</h1>
        <p className="text-lg text-slate-500">Especificações técnicas, PRD e Roadmap do SaaS.</p>
      </div>

      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <i className="fas fa-rocket text-sky-500"></i> PRD (Product Requirements Document)
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-slate-700 mb-2">1. Personas</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
              <li><strong>Dr. Carlos (Dono):</strong> Precisa de visão macro (BI, Faturamento, ROI).</li>
              <li><strong>Mariana (Secretária):</strong> Foco em agilidade, confirmação via WhatsApp e encaixes.</li>
              <li><strong>Tiago (Paciente):</strong> Busca conveniência, agendamento online e transparência financeira.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-700 mb-2">2. Jornada do Usuário</h3>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600 text-sm">
              <li>Agendamento online ou telefone (Check de disponibilidade).</li>
              <li>Confirmação automática 24h antes (WhatsApp/SMS).</li>
              <li>Check-in na clínica e preenchimento de anamnese digital.</li>
              <li>Consulta, Odontograma e Evolução Clínica.</li>
              <li>Geração de Orçamento e Assinatura Digital do Contrato.</li>
              <li>Faturamento, Emissão de Recibo e pós-venda.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <i className="fas fa-database text-sky-500"></i> Modelo de Dados (Entidades)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm mb-2">Multi-Tenancy</h4>
            <p className="text-xs text-slate-600"><code>Tenants</code> (Clinics) -> <code>Units</code> -> <code>Chairs</code></p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm mb-2">RBAC</h4>
            <p className="text-xs text-slate-600"><code>Users</code> -> <code>Roles</code> -> <code>Permissions</code></p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm mb-2">Clinical</h4>
            <p className="text-xs text-slate-600"><code>Patients</code> -> <code>MedicalRecords</code> -> <code>OdontogramState</code></p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="font-bold text-slate-800 text-sm mb-2">Financial</h4>
            <p className="text-xs text-slate-600"><code>Budgets</code> -> <code>Procedures</code> -> <code>Transactions</code></p>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <i className="fas fa-shield-alt text-sky-500"></i> LGPD & Compliance
        </h2>
        <div className="space-y-4 text-slate-600 text-sm">
          <p><strong>Criptografia:</strong> Dados sensíveis (CPF, Anamnese) criptografados em repouso (AES-256).</p>
          <p><strong>Auditoria:</strong> Registro de <code>LOGS</code> de acesso a cada registro clínico (Quem, Quando, O quê).</p>
          <p><strong>Direito ao Esquecimento:</strong> Fluxo automatizado de exclusão/anonimização seguindo prazos legais de prontuário.</p>
        </div>
      </section>

      <section className="bg-sky-50 p-8 rounded-2xl border border-sky-200 space-y-6">
        <h2 className="text-2xl font-bold text-sky-900 flex items-center gap-3">
          <i className="fas fa-map-marked-alt"></i> Roadmap MVP (4 Sprints)
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 font-bold">1</div>
            <div>
               <h4 className="font-bold text-sky-900">Sprint 1: Estrutura Base</h4>
               <p className="text-sm text-sky-700">Auth, Multi-tenancy, Cadastro de Pacientes e Segurança LGPD.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 font-bold">2</div>
            <div>
               <h4 className="font-bold text-sky-900">Sprint 2: Agenda & IA</h4>
               <p className="text-sm text-sky-700">Agenda dinâmica, salas e assistente IA para resumos clínicos.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 font-bold">3</div>
            <div>
               <h4 className="font-bold text-sky-900">Sprint 3: Prontuário & Odontograma</h4>
               <p className="text-sm text-sky-700">Odontograma 2D interativo, periograma e upload de exames.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 font-bold">4</div>
            <div>
               <h4 className="font-bold text-sky-900">Sprint 4: Financeiro & Faturamento</h4>
               <p className="text-sm text-sky-700">Fluxo de caixa, orçamentos, contratos e integração de pagamentos.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Documentation;
