import express from 'express';
import livroRoutes from './routes/livroRoutes';
import autorRoutes from './routes/autorRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import emprestimoRoutes from './routes/emprestimoRoutes';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import cors from 'cors';

const app = express();

// Configuração do CORS
app.use(cors());

app.use(express.json());

// Rotas da API
app.use('/api/livros', livroRoutes);
app.use('/api/autores', autorRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/emprestimos', emprestimoRoutes);

// Swagger UI
const swaggerFile = path.resolve(__dirname, '../swagger.yaml');
const swaggerDocument = yaml.load(fs.readFileSync(swaggerFile, 'utf8')) as object;
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API Biblioteca Digital"
}));

app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
    codigo: 404,
    timestamp: new Date().toISOString(),
    caminho: req.originalUrl
  });
});

export default app;
