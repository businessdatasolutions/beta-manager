import 'dotenv/config';
import app from './app';
import { initializeScheduler } from './jobs';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);

  // Initialize cron job scheduler
  if (process.env.NODE_ENV !== 'test') {
    initializeScheduler();
  }
});
