# Biblioteca Digital API

API RESTful para gerenciamento de biblioteca digital, permitindo o controle de livros, autores, usuários e empréstimos.

## 📚 Documentação da API

A documentação completa dos endpoints está disponível através do Swagger UI em:
- Local: http://localhost:3000
- Produção: https://biblioteca-digital-production-f217.up.railway.app

## 🚀 Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- PostgreSQL
- Swagger

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js >=18.0.0
- PostgreSQL
- npm ou yarn

### Passos para Instalação

1. Clone o repositório:
```bash
git clone https://github.com/FatimaKraiczyi/biblioteca-digital.git
cd biblioteca-digital
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/biblioteca
PORT=3000
NODE_ENV=development
```

4. Execute as migrações do banco de dados:
```bash
psql -U seu_usuario -d biblioteca -f src/database/criar_tabelas.sql
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 💡 Guia de Uso

### HATEOAS (Hypermedia as the Engine of Application State)

A API implementa HATEOAS para facilitar a navegação entre recursos. Os links são retornados na propriedade `_links` e seguem o seguinte formato:

```json
{
  "_links": [
    {
      "rel": "self",
      "href": "/api/livros/1",
      "method": "GET"
    },
    {
      "rel": "update",
      "href": "/api/livros/1",
      "method": "PUT"
    },
    {
      "rel": "delete",
      "href": "/api/livros/1",
      "method": "DELETE"
    }
  ]
}
```

Tipos de relações (`rel`) disponíveis:
- `self`: Link para o próprio recurso
- `update`: Link para atualizar o recurso
- `delete`: Link para remover o recurso
- `emprestar`: Link para criar um empréstimo (disponível apenas para livros disponíveis)
- `devolver`: Link para devolver um livro (disponível apenas para livros emprestados)

### Paginação e Filtros

A API suporta paginação e filtros nas listagens. Exemplo para livros:

```http
GET /api/livros?page=1&size=10&autor=Machado&disponivel=true&sort=titulo&order=asc
```

Parâmetros suportados:
- `page`: Número da página (default: 1)
- `size`: Itens por página (default: 10)
- `sort`: Campo para ordenação
- `order`: Direção da ordenação (asc/desc)
- `autor`: Filtrar por nome do autor
- `disponivel`: Filtrar por disponibilidade

### Tratamento de Erros

A API utiliza os seguintes códigos de status HTTP:

- `200`: Sucesso
- `201`: Recurso criado com sucesso
- `204`: Recurso removido com sucesso
- `400`: Erro de validação
- `404`: Recurso não encontrado
- `409`: Conflito (ex: ISBN ou email duplicado)
- `500`: Erro interno do servidor

Exemplo de resposta de erro:
```json
{
  "erro": "Mensagem descritiva do erro",
  "codigo": 400,
  "timestamp": "2025-08-31T06:51:04.000Z",
  "detalhe": "Informações adicionais sobre o erro (opcional)"
}
```

### Regras de Negócio

#### Empréstimos
- Limite de 3 empréstimos simultâneos por usuário
- Prazo de devolução: 15 dias
- Usuários com empréstimos em atraso não podem fazer novos empréstimos
- Um livro só pode ser emprestado se estiver disponível

#### Livros
- ISBN deve ser único
- Formato ISBN-10 ou ISBN-13 válido
- Ano de publicação entre 1000 e o ano atual
- Autor deve existir no sistema

#### Autores
- Nome não pode ser duplicado (case-insensitive)
- Nomes são normalizados (espaços extras removidos e palavras capitalizadas)

#### Usuários
- Email deve ser único (case-insensitive)
- Email deve ter formato válido
- Emails são normalizados para lowercase

