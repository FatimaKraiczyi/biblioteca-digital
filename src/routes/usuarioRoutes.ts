import { Router } from 'express';
import {
  listarUsuarios,
  obterUsuario,
  criarUsuario,
  atualizarUsuario,
  removerUsuario
} from '../controllers/usuarioController';

const router = Router();

router.get('/', listarUsuarios);
router.get('/:id', obterUsuario);
router.post('/', criarUsuario);
router.put('/:id', atualizarUsuario);
router.delete('/:id', removerUsuario);

export default router;
