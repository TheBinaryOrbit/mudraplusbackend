import Prisma from "../config/prismaClient.js"
import logger from "../utils/logger.utils.js"

/**
 * KYC Expiry Check Job
 * Checks if user's KYC has expired and updates status to resubmit
 */
const checkKycExpiry = async () => {
  try {
    logger.info('[KYC Expiry Check] Job started at:', new Date().toISOString());

    const currentDate = new Date();

    // Find all users whose kycExpireAt is less than current date
    // and kycStatus is not already 'resubmit'
    const expiredUsers = await Prisma.user.findMany({
      where: {
        kycExpireAt: {
          lt: currentDate,
        },
        kycStatus: {
          not: 'resubmit',
        },
        isBlocked: false, // Only check active users
      },
      select: {
        id: true,
        email: true,
        phone: true,
        kycExpireAt: true,
        kycStatus: true,
      },
    });

    if (expiredUsers.length === 0) {
      logger.info('[KYC Expiry Check] No expired KYC found.');
      return {
        success: true,
        message: 'No expired KYC found',
        count: 0,
      };
    }

    logger.info(`[KYC Expiry Check] Found ${expiredUsers.length} users with expired KYC`);

    // Update all expired users' kycStatus to 'resubmit'
    const updateResult = await Prisma.user.updateMany({
      where: {
        id: {
          in: expiredUsers.map((user) => user.id),
        },
      },
      data: {
        kycStatus: 'resubmit',
      },
    });

    logger.info(`[KYC Expiry Check] Updated ${updateResult.count} users to 'resubmit' status`);

    // Log details of updated users
    expiredUsers.forEach((user) => {
      logger.info(
        `[KYC Expiry Check] User ID: ${user.id}, Email: ${user.email}, Previous Status: ${user.kycStatus}, Expired At: ${user.kycExpireAt}`
      );
    });

    logger.info('[KYC Expiry Check] Job completed successfully at:', new Date().toISOString());

    return {
      success: true,
      message: 'KYC expiry check completed',
      count: updateResult.count,
      users: expiredUsers.map((u) => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
      })),
    };
  } catch (error) {
    logger.error('[KYC Expiry Check] Error occurred:', error);
    throw error;
  }
};

checkKycExpiry();
export { checkKycExpiry };
