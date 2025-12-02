import express from 'express';
import {
  criar,
  obterPorId,
  listarPorPaciente,
  atualizar,
  emitirReceita
} from '../controllers/prontuarioController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', criar);
router.get('/:id', obterPorId);
router.get('/paciente/:pacienteId', listarPorPaciente);
router.patch('/:id', atualizar);
router.get('/:id/receita', emitirReceita);

export default router;
