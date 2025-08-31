# Biblioteca Digital API

API para gerenciamento de biblioteca digital, permitindo o controle de livros, autores, usuários e empréstimos.

## Documentação

A documentação completa da API está disponível em:
https://fatimakraiczyi.github.io/biblioteca-digital/

## Desenvolvimento Local

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
Crie um arquivo `.env` na raiz do projeto com:
```env
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/biblioteca
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Deploy

A API está hospedada no Railway e a documentação no GitHub Pages.

### URLs:
- API: https://biblioteca-digital-production.up.railway.app
- Documentação: https://fatimakraiczyi.github.io/biblioteca-digital/

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- PostgreSQL
- Swagger/OpenAPI
