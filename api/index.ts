import express from 'express';
import { apiRouter } from '../server/routes.ts';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

export default app;
