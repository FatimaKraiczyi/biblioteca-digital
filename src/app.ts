import express from 'express';
import livroRoutes from './routes/livroRoutes';

const app = express();

app.use(express.json());
app.use('/livros', livroRoutes);

app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
    codigo: 404,
    timestamp: new Date().toISOString(),
    caminho: req.originalUrl
  });
});

export default app;
