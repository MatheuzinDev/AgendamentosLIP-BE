import express from 'express';
import * as agendamentosControllers from '../controllers/agendamentosControllers.js';
import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/criarAgendamento', verificarToken, agendamentosControllers.store);
router.get('/listarAgendamentos', verificarToken, agendamentosControllers.getAll);
router.get('/listarAgendamento/:id', agendamentosControllers.getOne);
router.put('/atualizarAgendamento/:id', agendamentosControllers.update);
router.delete('/deletarAgendamento/:id', agendamentosControllers.deletar);
router.get('/pedidosPendentes', verificarToken, agendamentosControllers.getAllPendentes)

export default router;