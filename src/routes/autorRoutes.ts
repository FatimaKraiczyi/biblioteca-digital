import { Router } from 'express';
import {
  listarAutores,
  obterAutor,
  criarAutor,
  atualizarAutor,
  removerAutor
} from '../controllers/autorController';

const router = Router();

router.get('/', listarAutores);
router.get('/:id', obterAutor);
router.post('/', criarAutor);
router.put('/:id', atualizarAutor);
router.delete('/:id', removerAutor);

export default router;
