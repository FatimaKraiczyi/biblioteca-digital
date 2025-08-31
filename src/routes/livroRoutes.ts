import { Router } from 'express';
import { listarLivros, obterLivro, criarLivro, atualizarLivro, removerLivro } from '../controllers/livroController';

const router = Router();

router.get('/', listarLivros);
router.get('/:id', obterLivro);
router.post('/', criarLivro);
router.put('/:id', atualizarLivro);
router.delete('/:id', removerLivro);

export default router;
