// src/routes/profissionalRoutes.js
import express from 'express';
import {
  listar,
  obterPorId,
  criar,
  atualizar,
  remover,
  criarComUsuario,
  criarUsuarioParaProfissional,
  reativar
} from '../controllers/profissionalController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// todas as rotas exigem usuário autenticado
router.use(authMiddleware);

// qualquer usuário logado pode listar
router.get('/', listar);
router.get('/:id', obterPorId);

// somente ADMIN pode criar/atualizar/remover profissionais
router.post('/', requireAdmin, criar);
router.post('/com-usuario', requireAdmin, criarComUsuario);
router.post('/:id/criar-usuario', requireAdmin, criarUsuarioParaProfissional)
router.put('/:id', requireAdmin, atualizar);
router.patch('/:id/reativar', requireAdmin, reativar);
router.delete('/:id', requireAdmin, remover);

export default router;
