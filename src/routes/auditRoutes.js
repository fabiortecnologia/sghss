import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';
import { listarAuditLogs } from '../controllers/auditLogsController.js';

const router = express.Router();

// todas as rotas de audit logs exigem autenticação
router.use(authMiddleware);

// somente ADMIN pode visualizar logs de auditoria
router.get('/', requireAdmin, listarAuditLogs);

export default router;
