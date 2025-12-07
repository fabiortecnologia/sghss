import express from 'express';
import {
  criar,
  obterPorId,
  listarPorPaciente,
  atualizar,
  emitirReceita
} from '../controllers/prontuarioController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireNotPatient } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', requireNotPatient, criar);
router.get('/:id', requireNotPatient, obterPorId);
router.get('/paciente/:pacienteId', listarPorPaciente);
router.patch('/:id', requireNotPatient, atualizar);
router.get('/:id/receita', requireNotPatient, emitirReceita);

export default router;
