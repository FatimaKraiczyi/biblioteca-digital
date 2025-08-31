import { Request, Response } from 'express';
import pool from '../database';

export const listarAutores = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, nome FROM autores ORDER BY nome ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar autores' });
  }
};

export const obterAutor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, nome FROM autores WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Autor não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao obter autor' });
  }
};

export const criarAutor = async (req: Request, res: Response) => {
  try {
    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ erro: 'Nome do autor é obrigatório' });
    }
    const result = await pool.query('INSERT INTO autores (nome) VALUES ($1) RETURNING id, nome', [nome]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar autor' });
  }
};

export const atualizarAutor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ erro: 'Nome do autor é obrigatório' });
    }
    const result = await pool.query('UPDATE autores SET nome = $1 WHERE id = $2 RETURNING id, nome', [nome, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Autor não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar autor' });
  }
};

export const removerAutor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM autores WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Autor não encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao remover autor' });
  }
};
