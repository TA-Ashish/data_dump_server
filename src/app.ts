import 'express-async-errors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import logger from './utils/logger';

export function createApp(): Application {
    const app = express();

    app.use(helmet());

    app.use(
        rateLimit({
            windowMs: env.RATE_LIMIT_WINDOW_MS,
            max: env.RATE_LIMIT_MAX,
            standardHeaders: true,
            legacyHeaders: false,
            message: { success: false, error: 'Too many requests, please try again later.' },
        }),
    );

    app.use(
        morgan('combined', {
            stream: { write: (msg) => logger.info(msg.trim()) },
            skip: () => env.NODE_ENV === 'test',
        }),
    );

    // 1mb limit guards against payload flooding
    app.use(express.json({ limit: '1mb' }));

    app.get('/health', (_req: Request, res: Response) => {
        res.json({ status: 'ok' });
    });

    app.use('/api/v1', routes);

    app.use((_req: Request, res: Response) => {
        res.status(404).json({ success: false, error: 'Route not found' });
    });

    // Must be registered last — Express identifies error handlers by arity (4 params)
    app.use(errorHandler);

    return app;
}
