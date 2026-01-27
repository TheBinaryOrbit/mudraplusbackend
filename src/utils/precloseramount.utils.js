export const calculatePrecloserAmount = (loan, precloserChargesPercent) => {
    if (!loan.intrestRate) {
        throw new Error('Interest rate is not defined for this loan');
    }

    const currentDate = new Date();
    const startDate = new Date(loan.startDate);

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysDifference = Math.floor(
        (currentDate - startDate) / msPerDay 
    );

    if (daysDifference < 0) {
        throw new Error("Invalid loan start date");
    }

    // Interest till today
    const intrestRateTillDate = loan.intrestRate*daysDifference;



    return ((loan.principalAmount + (loan.principalAmount * intrestRateTillDate / 100) + (loan.principalAmount * precloserChargesPercent / 100)).toFixed(2)) - loan.paidAmount;
};
