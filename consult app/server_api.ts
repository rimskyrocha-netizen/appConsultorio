
// API independente usando Fastify
// Nota: Em produção, este arquivo seria o entrypoint do container da API
import { CryptoService } from './server_crypto';
import { StorageService } from './server_storage';

export const backupRoutes = async (fastify: any) => {
  
  // Lista histórico de backups do Postgres de metadados
  fastify.get('/backups', async (request: any, reply: any) => {
    // query: SELECT * FROM backups ORDER BY created_at DESC
    return { backups: [] };
  });

  // Gatilho para backup manual
  fastify.post('/backups/run', async (request: any, reply: any) => {
    const { data, user } = request.body; // Dados do LocalStorage enviados pelo app
    
    // 1. Enfileira no BullMQ
    // 2. Registra "IN_PROGRESS" no DB
    
    return { jobId: 'bkp_123', status: 'QUEUED' };
  });

  // Gatilho para restauração (Total ou Seletiva)
  fastify.post('/backups/restore', async (request: any, reply: any) => {
    const { backupId, mode, scope } = request.body;
    // mode: 'DRY_RUN' | 'REAL'
    
    return { jobId: 'rst_456', status: 'QUEUED' };
  });
};
