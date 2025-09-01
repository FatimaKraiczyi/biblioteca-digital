import { Usuario } from '../models/Usuario';
import { Autor } from '../models/Autor';
import { Emprestimo } from '../models/Emprestimo';
import { Link } from '../models/Link';

export function buildUsuarioLinks(usuario: Usuario): Link[] {
    return [
        { rel: "self", href: `/api/usuarios/${usuario.id}`, method: "GET" },
        { rel: "update", href: `/api/usuarios/${usuario.id}`, method: "PUT" },
        { rel: "delete", href: `/api/usuarios/${usuario.id}`, method: "DELETE" },
        { rel: "emprestimos", href: `/api/emprestimos?usuario_id=${usuario.id}`, method: "GET" }
    ];
}

export function buildAutorLinks(autor: Autor): Link[] {
    return [
        { rel: "self", href: `/api/autores/${autor.id}`, method: "GET" },
        { rel: "update", href: `/api/autores/${autor.id}`, method: "PUT" },
        { rel: "delete", href: `/api/autores/${autor.id}`, method: "DELETE" },
        { rel: "livros", href: `/api/livros?autor_id=${autor.id}`, method: "GET" }
    ];
}

export function buildLivroLinks(livro: { id: number, disponivel: boolean }): Link[] {
    const links: Link[] = [
        { rel: "self", href: `/api/livros/${livro.id}`, method: "GET" },
        { rel: "update", href: `/api/livros/${livro.id}`, method: "PUT" },
        { rel: "delete", href: `/api/livros/${livro.id}`, method: "DELETE" }
    ];

    if (livro.disponivel) {
        links.push({ rel: "emprestar", href: `/api/emprestimos`, method: "POST" });
    }

    return links;
}

export function buildEmprestimoLinks(emprestimo: Emprestimo): Link[] {
    const links: Link[] = [
        { rel: "self", href: `/api/emprestimos/${emprestimo.id}`, method: "GET" },
        { rel: "usuario", href: `/api/usuarios/${emprestimo.usuario_id}`, method: "GET" },
        { rel: "livro", href: `/api/livros/${emprestimo.livro_id}`, method: "GET" }
    ];

    // Adiciona link de devolução apenas se o empréstimo não foi devolvido
    if (!emprestimo.devolvido) {
        links.push({ 
            rel: "devolver", 
            href: `/api/emprestimos/${emprestimo.id}/devolucao`, 
            method: "PUT" 
        });
    }

    return links;
}
