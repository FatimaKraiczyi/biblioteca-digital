import express from 'express';
import livroRoutes from './routes/livroRoutes';
import autorRoutes from './routes/autorRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import emprestimoRoutes from './routes/emprestimoRoutes';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const app = express();

app.use(express.json());

app.use('/livros', livroRoutes);
app.use('/autores', autorRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/emprestimos', emprestimoRoutes);

// Swagger UI
const swaggerFile = path.resolve(__dirname, '../swagger.yaml');
const swaggerDocument = yaml.load(fs.readFileSync(swaggerFile, 'utf8')) as object;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
    codigo: 404,
    timestamp: new Date().toISOString(),
    caminho: req.originalUrl
  });
});

export default app;
