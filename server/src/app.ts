import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './utils/logger';
import { registerRoutes } from './routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (env.CORS_ORIGIN) {
    app.use(
      cors({
  origin: env.CORS_ORIGIN.split(',').map((value: string) => value.trim()),
        credentials: true
      })
    );
  } else {
    app.use(cors({ origin: true, credentials: true }));
  }

  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.use(
    pinoHttp({
      logger,
      autoLogging: env.NODE_ENV !== 'test'
    })
  );

  registerRoutes(app);

  app.use((_: Request, res: Response) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
}
