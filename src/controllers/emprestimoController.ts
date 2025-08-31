import { Request, Response } from 'express';
import pool from '../database';

export const listarEmprestimos = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT e.id, e.data_emprestimo, e.data_devolucao, e.devolvido, \
      u.id as usuario_id, u.nome as usuario_nome, l.id as livro_id, l.titulo as livro_titulo\
      FROM emprestimos e\
      JOIN usuarios u ON e.usuario_id = u.id\
      JOIN livros l ON e.livro_id = l.id\
      ORDER BY e.data_emprestimo DESC`);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar empréstimos' });
  }
};

export const obterEmprestimo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT e.id, e.data_emprestimo, e.data_devolucao, e.devolvido, \
      u.id as usuario_id, u.nome as usuario_nome, l.id as livro_id, l.titulo as livro_titulo\
      FROM emprestimos e\
      JOIN usuarios u ON e.usuario_id = u.id\
      JOIN livros l ON e.livro_id = l.id\
      WHERE e.id = $1`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Empréstimo não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao obter empréstimo' });
  }
};

export const criarEmprestimo = async (req: Request, res: Response) => {
  try {
    const { usuario_id, livro_id } = req.body;
    if (!usuario_id || !livro_id) {
      return res.status(400).json({ 
        erro: 'Usuário e livro são obrigatórios',
        codigo: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Verifica se o usuário existe
    const usuario = await pool.query('SELECT id FROM usuarios WHERE id = $1', [usuario_id]);
    if (!usuario?.rowCount || usuario.rowCount === 0) {
      return res.status(404).json({ 
        erro: 'Usuário não encontrado',
        codigo: 404,
        timestamp: new Date().toISOString()
      });
    }

    // Verifica se o usuário tem empréstimos em atraso
    const emprestimosAtrasados = await pool.query(
      `SELECT COUNT(*) as total FROM emprestimos 
       WHERE usuario_id = $1 
       AND devolvido = false 
       AND data_emprestimo < CURRENT_DATE - INTERVAL '15 days'`,
      [usuario_id]
    );

    if (emprestimosAtrasados?.rows[0]?.total > 0) {
      return res.status(400).json({ 
        erro: 'Usuário possui empréstimos em atraso',
        codigo: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Verifica o número de empréstimos ativos do usuário
    const emprestimosAtivos = await pool.query(
      'SELECT COUNT(*) as total FROM emprestimos WHERE usuario_id = $1 AND devolvido = false',
      [usuario_id]
    );

    const LIMITE_EMPRESTIMOS = 3;
    if (emprestimosAtivos?.rows[0]?.total >= LIMITE_EMPRESTIMOS) {
      return res.status(400).json({ 
        erro: `Usuário já atingiu o limite de ${LIMITE_EMPRESTIMOS} empréstimos simultâneos`,
        codigo: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Verifica se o livro existe e está disponível
    const livro = await pool.query('SELECT disponivel FROM livros WHERE id = $1', [livro_id]);
    if (!livro?.rowCount || livro.rowCount === 0) {
      return res.status(404).json({ 
        erro: 'Livro não encontrado',
        codigo: 404,
        timestamp: new Date().toISOString()
      });
    }

    if (!livro.rows[0].disponivel) {
      return res.status(400).json({ 
        erro: 'Livro não disponível para empréstimo',
        codigo: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Cria o empréstimo com data de devolução prevista (15 dias)
    const result = await pool.query(
      `INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo, data_devolucao) 
       VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days') 
       RETURNING id, usuario_id, livro_id, data_emprestimo, data_devolucao, devolvido`,
      [usuario_id, livro_id]
    );

    // Atualiza o livro para indisponível
    await pool.query('UPDATE livros SET disponivel = FALSE WHERE id = $1', [livro_id]);

    res.status(201).json({
      ...result.rows[0],
      mensagem: 'Empréstimo realizado com sucesso',
      data_devolucao_prevista: result.rows[0].data_devolucao
    });
  } catch (err: any) {
    console.error(err);
    if (err.code === '23502') {
      return res.status(400).json({ 
        erro: 'Dados inválidos: algum campo obrigatório está nulo.',
        detalhe: err.detail,
        codigo: 400,
        timestamp: new Date().toISOString()
      });
    }
    if (err.code === '23503') {
      return res.status(400).json({ 
        erro: 'Violação de integridade referencial: usuário ou livro não existe.',
        detalhe: err.detail,
        codigo: 400,
        timestamp: new Date().toISOString()
      });
    }
    res.status(500).json({ 
      erro: 'Erro ao criar empréstimo',
      codigo: 500,
      timestamp: new Date().toISOString()
    });
  }
};

export const devolverEmprestimo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Marca o empréstimo como devolvido e registra a data de devolução
    const result = await pool.query(
      'UPDATE emprestimos SET devolvido = TRUE, data_devolucao = CURRENT_DATE WHERE id = $1 RETURNING livro_id',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Empréstimo não encontrado' });
    }
    // Torna o livro disponível novamente
    await pool.query('UPDATE livros SET disponivel = TRUE WHERE id = $1', [result.rows[0].livro_id]);
    res.status(200).json({ mensagem: 'Livro devolvido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao devolver empréstimo' });
  }
};
