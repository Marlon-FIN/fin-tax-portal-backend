import express from 'express';
import uploadRouter from './routes/upload';
import taxDeclarationRouter from './routes/taxDeclaration';
import filesRouter from './routes/files';

export const app = express();

app.use(express.json());
app.use(uploadRouter);
app.use(taxDeclarationRouter);
app.use(filesRouter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
