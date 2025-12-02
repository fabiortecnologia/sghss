import express from 'express';
import {
  listar,
  obterPorId,
  criar,
  cancelar,
  reagendar
} from '../controllers/agendamentoController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireAdminOrReceptionist } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Todas as rotas exigem token
router.use(authMiddleware);


router.get('/', listar);
router.get('/:id', obterPorId);
router.post('/', requireAdminOrReceptionist, criar);
router.patch('/:id/reagendar', requireAdminOrReceptionist, reagendar);
router.patch('/:id/cancelar', requireAdminOrReceptionist, cancelar);

export default router;
