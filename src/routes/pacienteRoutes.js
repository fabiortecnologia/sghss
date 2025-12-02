import express from 'express';
import {
  listar,
  obterPorId,
  criar,
  atualizar,
  remover,
  criarComUsuario,
  criarUsuarioParaPaciente,
  anonimizar
} from '../controllers/pacienteController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireAdmin, requireAdminOrReceptionist } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// todas as rotas de pacientes exigem autenticação
router.use(authMiddleware);

router.get('/', listar);
router.get('/:id', obterPorId);

// somente ADMIN ou RECEPCIONISTA podem criar/atualizar/remover pacientes
router.post('/com-usuario', requireAdminOrReceptionist, criarComUsuario);
router.post('/:id/criar-usuario', requireAdminOrReceptionist, criarUsuarioParaPaciente);

router.post('/', requireAdminOrReceptionist, criar);
router.put('/:id', requireAdminOrReceptionist, atualizar);
router.delete('/:id', requireAdminOrReceptionist, remover);

// LGPD — somente ADMIN
router.post('/:id/anonimizar', requireAdmin, anonimizar);

export default router;
