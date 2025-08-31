import { Request, Response } from 'express';
import { Livro } from '../models/Livro';
import pool from '../database';
 
// Função utilitária para montar links HATEOAS
function buildLinks(livro: Livro) {
  const links = [
    { rel: "self", href: `/livros/${livro.id}`, method: "GET" },
    { rel: "update", href: `/livros/${livro.id}`, method: "PUT" },
    { rel: "delete", href: `/livros/${livro.id}`, method: "DELETE" }
  ];
  if (livro.disponivel) {
    links.push({ rel: "emprestar", href: `/emprestimos`, method: "POST" });
  } else {
    links.push({ rel: "devolver", href: `/emprestimos/{id}/devolucao`, method: "PUT" });
  }
  return links;
}

export const listarLivros = async (req: Request, res: Response) => {
  try {
    // Query params: autor, disponivel, paginação, ordenação
    const { autor, disponivel, page = 1, size = 10, sort = 'titulo', order = 'asc' } = req.query;
    let query = `
      SELECT l.id, l.titulo, l.isbn, l.ano_publicacao, l.disponivel, a.id as autor_id, a.nome as autor_nome
      FROM livros l
      JOIN autores a ON l.autor_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (autor) {
      query += ` AND a.nome ILIKE $${params.length + 1}`;
      params.push(`%${autor}%`);
    }
    if (disponivel !== undefined) {
      query += ` AND l.disponivel = $${params.length + 1}`;
      params.push(disponivel === 'true');
    }
    query += ` ORDER BY l.${sort} ${order === 'desc' ? 'DESC' : 'ASC'}`;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(size), (Number(page) - 1) * Number(size));

    const result = await pool.query(query, params);
    const livros = result.rows.map((row: any) => ({
      id: row.id,
      titulo: row.titulo,
      isbn: row.isbn,
      ano_publicacao: row.ano_publicacao,
      disponivel: row.disponivel,
      autor: {
        id: row.autor_id,
        nome: row.autor_nome
      },
      _links: buildLinks({
        id: row.id,
        titulo: row.titulo,
        isbn: row.isbn,
        ano_publicacao: row.ano_publicacao,
        disponivel: row.disponivel,
        autor: { id: row.autor_id, nome: row.autor_nome }
      })
    }));
    res.status(200).json(livros);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: "Erro ao listar livros",
      codigo: 500,
      timestamp: new Date().toISOString(),
      caminho: req.originalUrl
    });
  }
};

export const obterLivro = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT l.id, l.titulo, l.isbn, l.ano_publicacao, l.disponivel, a.id as autor_id, a.nome as autor_nome
       FROM livros l JOIN autores a ON l.autor_id = a.id WHERE l.id = $1`, [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        erro: "Livro não encontrado",
        codigo: 404,
        timestamp: new Date().toISOString(),
        caminho: req.originalUrl
      });
    }
    const row = result.rows[0];
    const livro = {
      id: row.id,
      titulo: row.titulo,
      isbn: row.isbn,
      ano_publicacao: row.ano_publicacao,
      disponivel: row.disponivel,
      autor: {
        id: row.autor_id,
        nome: row.autor_nome
      },
      _links: buildLinks({
        id: row.id,
        titulo: row.titulo,
        isbn: row.isbn,
        ano_publicacao: row.ano_publicacao,
        disponivel: row.disponivel,
        autor: { id: row.autor_id, nome: row.autor_nome }
      })
    };
    res.status(200).json(livro);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: "Erro ao obter livro",
      codigo: 500,
      timestamp: new Date().toISOString(),
      caminho: req.originalUrl
    });
  }
};

export const criarLivro = async (req: Request, res: Response) => {
  try {
    const { titulo, isbn, ano_publicacao, disponivel, autor_id } = req.body;
    if (!titulo || !isbn || !ano_publicacao || autor_id === undefined) {
      return res.status(400).json({
        erro: "Dados obrigatórios ausentes",
        codigo: 400,
        timestamp: new Date().toISOString(),
        caminho: req.originalUrl
      });
    }
    const result = await pool.query(
      `INSERT INTO livros (titulo, isbn, ano_publicacao, disponivel, autor_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`, 
      [titulo, isbn, ano_publicacao, disponivel ?? true, autor_id]
    );
    res.status(201).json({
      id: result.rows[0].id,
      _links: [
        { rel: "self", href: `/livros/${result.rows[0].id}`, method: "GET" }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: "Erro ao criar livro",
      codigo: 500,
      timestamp: new Date().toISOString(),
      caminho: req.originalUrl
    });
  }
};

export const atualizarLivro = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo, isbn, ano_publicacao, disponivel, autor_id } = req.body;
    // Validação dos campos obrigatórios
    if (!titulo || !isbn || !ano_publicacao || autor_id === undefined) {
      return res.status(400).json({
        erro: "Campos obrigatórios ausentes (titulo, isbn, ano_publicacao, autor_id)",
        codigo: 400,
        timestamp: new Date().toISOString(),
        caminho: req.originalUrl
      });
    }
    const result = await pool.query(
      `UPDATE livros SET titulo=$1, isbn=$2, ano_publicacao=$3, disponivel=$4, autor_id=$5 WHERE id=$6 RETURNING *`,
      [titulo, isbn, ano_publicacao, disponivel, autor_id, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        erro: "Livro não encontrado",
        codigo: 404,
        timestamp: new Date().toISOString(),
        caminho: req.originalUrl
      });
    }
    res.status(200).json({
      mensagem: "Livro atualizado com sucesso",
      _links: [
        { rel: "self", href: `/livros/${id}`, method: "GET" }
      ]
    });
  } catch (err: any) {
    console.error(err);
    // Tratamento para evitar queda da API em erro de conexão
    if (err.code === '23502') {
      return res.status(400).json({
        erro: "Dados inválidos: algum campo obrigatório está nulo.",
        codigo: 400,
        detalhe: err.detail,
        timestamp: new Date().toISOString(),
        caminho: req.originalUrl
      });
    }
    res.status(500).json({
      erro: "Erro ao atualizar livro",
      codigo: 500,
      timestamp: new Date().toISOString(),
      caminho: req.originalUrl
    });
  }
};

export const removerLivro = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM livros WHERE id=$1`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({
        erro: "Livro não encontrado",
        codigo: 404,
        timestamp: new Date().toISOString(),
        caminho: req.originalUrl
      });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: "Erro ao remover livro",
      codigo: 500,
      timestamp: new Date().toISOString(),
      caminho: req.originalUrl
    });
  }
};
