-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Tabela de empréstimos
CREATE TABLE IF NOT EXISTS emprestimos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    livro_id INT NOT NULL,
    data_emprestimo DATE NOT NULL DEFAULT CURRENT_DATE,
    data_devolucao DATE,
    devolvido BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (livro_id) REFERENCES livros(id)
);
-- Criação das tabelas essenciais para a API Biblioteca Digital

-- Tabela de autores
CREATE TABLE autores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
);

-- Tabela de livros
CREATE TABLE livros (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    ano_publicacao INT NOT NULL,
    disponivel BOOLEAN DEFAULT TRUE,
    autor_id INT NOT NULL,
    FOREIGN KEY (autor_id) REFERENCES autores(id) ON DELETE CASCADE
);

 
