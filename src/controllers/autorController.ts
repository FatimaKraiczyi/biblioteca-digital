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
    
    // Normaliza o nome (remove espaços extras e capitaliza palavras)
    const nomeNormalizado = nome
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((palavra: string) => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
      .join(' ');

    // Verifica se já existe autor com o mesmo nome
    const autorExistente = await pool.query('SELECT id FROM autores WHERE LOWER(nome) = LOWER($1)', [nomeNormalizado]);
    if (autorExistente?.rowCount && autorExistente.rowCount > 0) {
      return res.status(409).json({ 
        erro: 'Já existe um autor cadastrado com este nome',
        codigo: 409,
        timestamp: new Date().toISOString()
      });
    }

    const result = await pool.query('INSERT INTO autores (nome) VALUES ($1) RETURNING id, nome', [nomeNormalizado]);
    res.status(201).json({
      ...result.rows[0],
      mensagem: 'Autor criado com sucesso'
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
    res.status(500).json({ 
      erro: 'Erro ao criar autor',
      codigo: 500,
      timestamp: new Date().toISOString()
    });
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
  } catch (err: any) {
    console.error(err);
    if (err.code === '23502') {
      return res.status(400).json({ erro: 'Dados inválidos: algum campo obrigatório está nulo.', detalhe: err.detail });
    }
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
