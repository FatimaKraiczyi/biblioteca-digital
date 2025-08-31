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
      return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
    }
    const result = await pool.query('INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING id, nome, email', [nome, email]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar usuário' });
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
  } catch (err) {
    console.error(err);
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
