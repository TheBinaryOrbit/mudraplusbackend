import cron from 'node-cron';
import { checkKycExpiry } from './kycExpiryCheck.job.js';
import { checkLoanPenalty } from './loanPenaltyCheck.job.js';
import logger from '../utils/logger.utils.js';

/**
 * Initialize all cron jobs
 */
const initCronJobs = () => {
  logger.info('[Cron Scheduler] Initializing cron jobs...');

  // KYC Expiry Check Job - Runs once every 3 days at midnight (00:00)
  // Cron expression: '0 0 */3 * *'
  // - Minute: 0
  // - Hour: 0 (midnight)
  // - Day of month: */3 (every 3 days)
  // - Month: * (every month)
  // - Day of week: * (every day of week)
  const kycExpiryJob = cron.schedule(
    '0 0 */3 * *',
    async () => {
      logger.info('[Cron Scheduler] Running KYC Expiry Check Job...');
      try {
        await checkKycExpiry();
      } catch (error) {
        logger.error('[Cron Scheduler] KYC Expiry Check Job failed:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata', // Adjust timezone as needed
    }
  );

  logger.info('[Cron Scheduler] KYC Expiry Check Job scheduled - Runs every 3 days at midnight');

  // Loan Penalty Check Job - Runs daily at 6:00 AM
  // Cron expression: '0 6 * * *'
  // - Minute: 0
  // - Hour: 6 (6 AM)
  // - Day of month: * (every day)
  // - Month: * (every month)
  // - Day of week: * (every day of week)
  const loanPenaltyJob = cron.schedule(
    '0 6 * * *',
    async () => {
      logger.info('[Cron Scheduler] Running Loan Penalty Check Job...');
      try {
        await checkLoanPenalty();
      } catch (error) {
        logger.error('[Cron Scheduler] Loan Penalty Check Job failed:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata', // Adjust timezone as needed
    }
  );

  logger.info('[Cron Scheduler] Loan Penalty Check Job scheduled - Runs daily at 6:00 AM');

  // Return the cron job instance for potential management
  return {
    kycExpiryJob,
    loanPenaltyJob,
  };
};

/**
 * Stop all cron jobs
 */
const stopCronJobs = (jobs) => {
  logger.info('[Cron Scheduler] Stopping all cron jobs...');
  if (jobs && jobs.kycExpiryJob) {
    jobs.kycExpiryJob.stop();
    logger.info('[Cron Scheduler] KYC Expiry Check Job stopped');
  }
  if (jobs && jobs.loanPenaltyJob) {
    jobs.loanPenaltyJob.stop();
    logger.info('[Cron Scheduler] Loan Penalty Check Job stopped');
  }
};

// Auto-start cron jobs when this file is run directly
const cronJobs = initCronJobs();

// Graceful shutdown handlers
process.on('SIGINT', () => {
  logger.info('[Cron Scheduler] Received SIGINT, shutting down gracefully...');
  stopCronJobs(cronJobs);
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('[Cron Scheduler] Received SIGTERM, shutting down gracefully...');
  stopCronJobs(cronJobs);
  process.exit(0);
});

// Keep the process running
process.on('uncaughtException', (error) => {
  logger.error('[Cron Scheduler] Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('[Cron Scheduler] Unhandled Rejection at:', { promise, reason });
});

logger.info('[Cron Scheduler] Cron jobs process is running. Press Ctrl+C to stop.');

export { initCronJobs, stopCronJobs };
