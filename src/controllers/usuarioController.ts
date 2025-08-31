import { Request, Response } from 'express';
import pool from '../database';

export const listarUsuarios = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, nome, email FROM usuarios ORDER BY nome ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};

export const obterUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, nome, email FROM usuarios WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao obter usuário' });
  }
};

export const criarUsuario = async (req: Request, res: Response) => {
  try {
    const { nome, email } = req.body;
    if (!nome || !email) {
      return res.status(400).json({ 
        erro: 'Nome e email são obrigatórios',
        codigo: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Validação básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        erro: 'Formato de email inválido',
        codigo: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Verifica se já existe usuário com o mesmo email
    const usuarioExistente = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1)', [email]);
    if (usuarioExistente?.rowCount && usuarioExistente.rowCount > 0) {
      return res.status(409).json({ 
        erro: 'Já existe um usuário cadastrado com este email',
        codigo: 409,
        timestamp: new Date().toISOString()
      });
    }

    const result = await pool.query(
      'INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING id, nome, email', 
      [nome.trim(), email.toLowerCase()]
    );
    
    res.status(201).json({
      ...result.rows[0],
      mensagem: 'Usuário criado com sucesso'
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
    if (err.code === '23505') {
      return res.status(409).json({ 
        erro: 'Já existe um usuário cadastrado com este email.',
        codigo: 409,
        timestamp: new Date().toISOString()
      });
    }
    res.status(500).json({ 
      erro: 'Erro ao criar usuário',
      codigo: 500,
      timestamp: new Date().toISOString()
    });
  }
};

export const atualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, email } = req.body;
    if (!nome || !email) {
      return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
    }
    const result = await pool.query('UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3 RETURNING id, nome, email', [nome, email, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err: any) {
    console.error(err);
    if (err.code === '23502') {
      return res.status(400).json({ erro: 'Dados inválidos: algum campo obrigatório está nulo.', detalhe: err.detail });
    }
    res.status(500).json({ erro: 'Erro ao atualizar usuário' });
  }
};

export const removerUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover usuário' });
  }
};
