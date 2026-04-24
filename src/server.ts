import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import logger from './utils/logger';

async function bootstrap(): Promise<void> {
    await connectDatabase();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
        logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    const shutdown = async (signal: string): Promise<void> => {
        logger.info(`Received ${signal} — shutting down gracefully`);
        server.close(async () => {
            await disconnectDatabase();
            logger.info('Server closed');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Fatal startup error', err);
    process.exit(1);
});
