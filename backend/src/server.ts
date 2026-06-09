import app from './app';
import { config } from '@core/config';
import logger from '@core/config/logger';
import prisma from '@core/database/prisma';

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
