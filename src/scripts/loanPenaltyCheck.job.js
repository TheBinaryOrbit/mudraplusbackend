import Prisma from "../config/prismaClient.js"
import logger from "../utils/logger.utils.js"

/**
 * Loan Penalty Check Job
 * Checks if loan endDate has passed and applies penalty charges
 */
const checkLoanPenalty = async () => {
  try {
    logger.info('[Loan Penalty Check] Job started at:', new Date().toISOString());

    const currentDate = new Date();
    
    // Get late fee percentage from environment variable (default to 1.5%)
    const lateFeePercentage = parseFloat(processcd.env.LATE_FEE_PERCENTAGE) || 1.5;
    
    logger.info(`[Loan Penalty Check] Using late fee percentage: ${lateFeePercentage}%`);

    // Find all active/overdue loans where endDate has passed
    const overdueLoans = await Prisma.loan.findMany({
      where: {
        endDate: {
          lt: currentDate,
        },
        status: {
          in: ['active', 'overdue'],
        },
        remainingAmount: {
          gt: 0, // Only loans with remaining balance
        },
        principalAmount: {
          not: null,
        },
      },
      select: {
        id: true,
        loanNumber: true,
        userId: true,
        principalAmount: true,
        penaltyAmount: true,
        remainingAmount: true,
        endDate: true,
        status: true,
      },
    });

    if (overdueLoans.length === 0) {
      logger.info('[Loan Penalty Check] No overdue loans found.');
      return {
        success: true,
        message: 'No overdue loans found',
        count: 0,
      };
    }

    logger.info(`[Loan Penalty Check] Found ${overdueLoans.length} overdue loans`);

    let updatedCount = 0;
    const updateResults = [];

    // Process each overdue loan
    for (const loan of overdueLoans) {
      try {
        // Calculate penalty: lateFeePercentage% of principalAmount
        const penaltyCalculated = (loan.principalAmount * lateFeePercentage) / 100;
        
        // New penalty amount = existing penalty + calculated penalty
        const newPenaltyAmount = (loan.penaltyAmount || 0) + penaltyCalculated;
        
        // New remaining amount = existing remaining + calculated penalty
        const newRemainingAmount = (loan.remainingAmount || 0) + penaltyCalculated;

        // Update the loan
        await Prisma.loan.update({
          where: { id: loan.id },
          data: {
            penaltyAmount: newPenaltyAmount,
            remainingAmount: newRemainingAmount,
            status: 'overdue', // Update status to overdue if it was active
          },
        });

        updatedCount++;
        
        const result = {
          loanId: loan.id,
          loanNumber: loan.loanNumber,
          userId: loan.userId,
          principalAmount: loan.principalAmount,
          penaltyCalculated: penaltyCalculated,
          oldPenaltyAmount: loan.penaltyAmount || 0,
          newPenaltyAmount: newPenaltyAmount,
          oldRemainingAmount: loan.remainingAmount || 0,
          newRemainingAmount: newRemainingAmount,
          endDate: loan.endDate,
        };
        
        updateResults.push(result);
        
        logger.info(
          `[Loan Penalty Check] Loan #${loan.loanNumber} - Principal: ₹${loan.principalAmount}, ` +
          `Penalty Added: ₹${penaltyCalculated.toFixed(2)}, ` +
          `New Penalty Total: ₹${newPenaltyAmount.toFixed(2)}, ` +
          `New Remaining: ₹${newRemainingAmount.toFixed(2)}`
        );
      } catch (error) {
        logger.error(`[Loan Penalty Check] Failed to update loan #${loan.loanNumber}:`, error);
      }
    }

    logger.info(`[Loan Penalty Check] Successfully updated ${updatedCount} loans`);
    logger.info('[Loan Penalty Check] Job completed successfully at:', new Date().toISOString());

    return {
      success: true,
      message: 'Loan penalty check completed',
      count: updatedCount,
      lateFeePercentage,
      loans: updateResults,
    };
  } catch (error) {
    logger.error('[Loan Penalty Check] Error occurred:', error);
    throw error;
  }
};

export { checkLoanPenalty };
