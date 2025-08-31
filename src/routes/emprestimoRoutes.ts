import { Router } from 'express';
import {
  listarEmprestimos,
  obterEmprestimo,
  criarEmprestimo,
  devolverEmprestimo
} from '../controllers/emprestimoController';

const router = Router();

router.get('/', listarEmprestimos);
router.get('/:id', obterEmprestimo);
router.post('/', criarEmprestimo);
router.put('/:id/devolucao', devolverEmprestimo);

export default router;
