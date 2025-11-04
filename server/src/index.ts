import type { Request, Response, NextFunction } from 'express';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'Yarn server running');
});
