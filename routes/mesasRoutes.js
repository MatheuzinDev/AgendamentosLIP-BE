import express from 'express';
import * as mesasControllers from '../controllers/mesasControllers.js'
import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/criarMesa', mesasControllers.store)
router.get('/listarMesas', verificarToken, mesasControllers.getAll)
router.get('/listarMesa/:id', mesasControllers.getOne)
router.put('/atualizarMesa/:id', mesasControllers.update)
router.delete('/deletarMesa/:id', mesasControllers.deletar)

export default router;