
import { API_BASE_URL } from './config';

export const migrateLocalStorageToDatabase = async () => {
    const results = {
        patients: 0,
        appointments: 0,
        procedures: 0,
        users: 0,
        evolutions: 0,
        treatments: 0,
        payments: 0,
        notices: 0,
        supplies: 0,
        transactions: 0,
        errors: [] as string[]
    };

    // 1. Migrate Base Procedures
    const proceduresStr = localStorage.getItem('odontoflow_procedures');
    if (proceduresStr) {
        try {
            const procedures = JSON.parse(proceduresStr);
            for (const proc of procedures) {
                const resp = await fetch(`${API_BASE_URL}/api/base-procedures`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(proc)
                });
                if (resp.ok) results.procedures++;
            }
        } catch (e: any) { results.errors.push(`Erro procedimentos: ${e.message}`); }
    }

    // 2. Migrate Users
    const usersStr = localStorage.getItem('odontoflow_users');
    if (usersStr) {
        try {
            const users = JSON.parse(usersStr);
            for (const user of users) {
                const resp = await fetch(`${API_BASE_URL}/api/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });
                if (resp.ok) results.users++;
            }
        } catch (e: any) { results.errors.push(`Erro usuários: ${e.message}`); }
    }

    // 3. Migrate Patients
    const patientsStr = localStorage.getItem('odontoflow_patients');
    if (patientsStr) {
        try {
            const patients = JSON.parse(patientsStr);
            for (const patient of patients) {
                // Get anamnese for this patient
                const anamneseStr = localStorage.getItem(`odontoflow_anamnese_${patient.id}`);
                if (anamneseStr) {
                    patient.medicalHistory = anamneseStr;
                }

                const resp = await fetch(`${API_BASE_URL}/api/patients`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(patient)
                });
                if (resp.ok) {
                    results.patients++;
                    // Migrate sub-records only if patient was successfully/already in DB
                    await migratePatientSubRecords(patient.id, results);
                }
            }
        } catch (e: any) { results.errors.push(`Erro pacientes: ${e.message}`); }
    }

    // 4. Migrate Appointments
    const appointmentsStr = localStorage.getItem('odontoflow_appointments');
    if (appointmentsStr) {
        try {
            const appointments = JSON.parse(appointmentsStr);
            for (const appt of appointments) {
                const resp = await fetch(`${API_BASE_URL}/api/appointments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(appt)
                });
                if (resp.ok) results.appointments++;
            }
        } catch (e: any) { results.errors.push(`Erro agendamentos: ${e.message}`); }
    }

    // 5. Migrate Notices
    const noticesStr = localStorage.getItem('odontoflow_notices');
    if (noticesStr) {
        try {
            const notices = JSON.parse(noticesStr);
            for (const notice of notices) {
                const resp = await fetch(`${API_BASE_URL}/api/notices`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(notice)
                });
                if (resp.ok) results.notices++;
            }
        } catch (e: any) { results.errors.push(`Erro avisos: ${e.message}`); }
    }

    // 6. Migrate Supplies
    // Key might be odontoflow_supplies, odontoflow_materials, or odontoflow_materials_estoque
    const suppliesKey = ['odontoflow_materials', 'odontoflow_supplies', 'odontoflow_materials_estoque'].find(k => localStorage.getItem(k));
    if (suppliesKey) {
        try {
            const supplies = JSON.parse(localStorage.getItem(suppliesKey) || '[]');
            for (const s of supplies) {
                const resp = await fetch(`${API_BASE_URL}/api/supplies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(s)
                });
                if (resp.ok) results.supplies++;
            }
        } catch (e: any) { results.errors.push(`Erro suprimentos: ${e.message}`); }
    }

    // 7. Migrate Global Transactions
    const transKey = ['odontoflow_global_transactions', 'odontoflow_transactions'].find(k => localStorage.getItem(k));
    if (transKey) {
        try {
            const trans = JSON.parse(localStorage.getItem(transKey) || '[]');
            for (const t of trans) {
                // Ensure field names match (localStorage used "desc", API uses "description")
                const record = {
                    ...t,
                    description: t.description || t.desc
                };
                const resp = await fetch(`${API_BASE_URL}/api/transactions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record)
                });
                if (resp.ok) results.transactions++;
            }
        } catch (e: any) { results.errors.push(`Erro financeiro global: ${e.message}`); }
    }

    return results;
};


const migratePatientSubRecords = async (patientId: string, results: any) => {
    // Evolutions
    const evoStr = localStorage.getItem(`odontoflow_evo_${patientId}`);
    if (evoStr) {
        try {
            const evos = JSON.parse(evoStr);
            for (const evo of evos) {
                evo.patientId = patientId;
                const resp = await fetch(`${API_BASE_URL}/api/evolutions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(evo)
                });
                if (resp.ok) results.evolutions++;
            }
        } catch (e) {}
    }

    // Treatments (Plans)
    const planStr = localStorage.getItem(`odontoflow_plan_${patientId}`);
    if (planStr) {
        try {
            const plans = JSON.parse(planStr);
            for (const plan of plans) {
                plan.patientId = patientId;
                const resp = await fetch(`${API_BASE_URL}/api/treatments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(plan)
                });
                if (resp.ok) results.treatments++;
            }
        } catch (e) {}
    }

    // Payments
    const payStr = localStorage.getItem(`odontoflow_pay_${patientId}`);
    if (payStr) {
        try {
            const pays = JSON.parse(payStr);
            for (const pay of pays) {
                pay.patientId = patientId;
                const resp = await fetch(`${API_BASE_URL}/api/payments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pay)
                });
                if (resp.ok) results.payments++;
            }
        } catch (e) {}
    }
};
