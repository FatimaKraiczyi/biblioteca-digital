import { Request, Response } from 'express';
import { Livro } from '../models/Livro';
import sql from '../database';

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

    const result = await sql.unsafe(query, params);
    const livros = result.map((row: any) => ({
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
    const result = await sql`
      SELECT l.id, l.titulo, l.isbn, l.ano_publicacao, l.disponivel, a.id as autor_id, a.nome as autor_nome
      FROM livros l JOIN autores a ON l.autor_id = a.id WHERE l.id = ${id}
    `;
    if (result.length === 0) {
      return res.status(404).json({
        erro: "Livro não encontrado",
        codigo: 404,
        timestamp: new Date().toISOString(),
        caminho: req.originalUrl
      });
    }
    const row = result[0];
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
    const result = await sql`
      INSERT INTO livros (titulo, isbn, ano_publicacao, disponivel, autor_id)
      VALUES (${titulo}, ${isbn}, ${ano_publicacao}, ${disponivel ?? true}, ${autor_id})
      RETURNING id
    `;
    res.status(201).json({
      id: result[0].id,
      _links: [
        { rel: "self", href: `/livros/${result[0].id}`, method: "GET" }
      ]
    });
  } catch (err) {
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
    const result = await sql`
      UPDATE livros SET titulo=${titulo}, isbn=${isbn}, ano_publicacao=${ano_publicacao}, disponivel=${disponivel}, autor_id=${autor_id}
      WHERE id=${id} RETURNING *
    `;
    if (result.length === 0) {
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
  } catch (err) {
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
    const result = await sql`
      DELETE FROM livros WHERE id=${id} RETURNING id
    `;
    if (result.length === 0) {
      return res.status(404).json({
        erro: "Livro não encontrado",
        codigo: 404,
        timestamp: new Date().toISOString(),
        caminho: req.originalUrl
      });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      erro: "Erro ao remover livro",
      codigo: 500,
      timestamp: new Date().toISOString(),
      caminho: req.originalUrl
    });
  }
};
