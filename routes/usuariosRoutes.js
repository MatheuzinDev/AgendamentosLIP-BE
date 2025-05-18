import express from 'express';
import * as usuariosControllers from '../controllers/usuariosControllers.js';
import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/criarUsuario', usuariosControllers.store);
router.get('/listarUsuarios', verificarToken, usuariosControllers.getAll);
//router.get('/listarUsuario/:id', usuariosControllers.getOne);
router.get('/listarUsuario/:matricula', verificarToken, usuariosControllers.getOneByMatricula);
//router.put('/atualizarUsuario/:id', usuariosControllers.update);
router.put('/atualizarUsuario/:matricula', verificarToken, usuariosControllers.updateByMatricula);
//router.delete('/deletarUsuario/:id', usuariosControllers.deletar);
router.delete('/deletarUsuario/:matricula', verificarToken, usuariosControllers.deletarByMatricula);
router.get('/perfil', verificarToken, usuariosControllers.getPerfil);
router.put('/alterarSenha', verificarToken, usuariosControllers.alterarSenha);


export default router;