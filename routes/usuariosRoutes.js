import express from 'express';
import * as usuariosControllers from '../controllers/usuariosControllers.js';

const router = express.Router();

router.post('/criarUsuario', usuariosControllers.store);
router.get('/listarUsuarios', usuariosControllers.getAll);
router.get('/listarUsuario/:id', usuariosControllers.getOne);
router.put('/atualizarUsuario/:id', usuariosControllers.update);
router.delete('/deletarUsuario/:id', usuariosControllers.deletar);

export default router;