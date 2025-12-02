import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../docs/swagger.js';

import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';
import profissionalRoutes from './routes/profissionalRoutes.js';
import agendamentoRoutes from './routes/agendamentoRoutes.js';
import prontuarioRoutes from './routes/prontuarioRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
// import agendamentoRoutes from './routes/agendamentoRoutes.js';

dotenv.config();

const app = express();

// ========= diretórios para arquivos estáticos =========
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// pasta "public" na raiz do projeto
app.use(express.static(path.join(__dirname, '../public')));
// =======================================================

// middleware para ler JSON
app.use(express.json());

// rota simples de saúde da API
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    mensagem: 'API SGHSS em execução',
    versao: '1.0.0'
  });
});

// rotas de autenticação
app.use('/auth', authRoutes);

// rotas de pacientes (protegidas por authMiddleware lá no arquivo de rotas)
app.use('/pacientes', pacienteRoutes);

// rotas de profissionais (protegidas por authMiddleware lá no arquivo de rotas)
app.use('/profissionais', profissionalRoutes);

// rotas de agendamento (protegidas por authMiddleware lá no arquivo de rotas)
app.use('/agendamentos', agendamentoRoutes);

// rotas de prontuários (protegidas por authMiddleware lá no arquivo de rotas)
app.use('/prontuarios', prontuarioRoutes);

//rotas de audit logs (protegidas por authMiddleware lá no arquivo de rotas)
app.use('/auditLogs', auditRoutes);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


export default app;
