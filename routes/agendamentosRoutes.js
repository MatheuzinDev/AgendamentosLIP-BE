import express from 'express';
import * as agendamentosControllers from '../controllers/agendamentosControllers.js';

const router = express.Router();

router.post('/criarAgendamento', agendamentosControllers.store);
router.get('/listarAgendamentos', agendamentosControllers.getAll);
router.get('/listarAgendamento/:id', agendamentosControllers.getOne);
router.put('/atualizarAgendamento/:id', agendamentosControllers.update);
router.delete('/deletarAgendamento/:id', agendamentosControllers.deletar);

export default router;