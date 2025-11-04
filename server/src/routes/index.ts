import type { Express, Request, Response } from 'express';
import { Router } from 'express';
import { searchRouter } from './searchRoutes';

export function registerRoutes(app: Express) {
  const api = Router();

  api.use('/search', searchRouter);

  app.get('/health', (_: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', api);
}
