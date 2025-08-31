export interface Autor {
  id: number;
  nome: string;
}

export interface Livro {
  id: number;
  titulo: string;
  isbn: string;
  ano_publicacao: number;
  disponivel: boolean;
  autor: Autor;
}
