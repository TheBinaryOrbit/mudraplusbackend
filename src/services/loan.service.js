import Prisma from "../config/prismaClient.js";

export class LoanService {
    async createLoan(userId , loanData) {
        return await Prisma.loan.create({
            data: {
                userId: userId,
                bankId: loanData.bankId,
                requestedAmount: loanData.requestedAmount,
                requestedTenure: loanData.requestedTenure,
            },
        });
    }

    async adminUpdateLoan(loanId, updateData) {
        return await Prisma.loan.update({
            where: { id: loanId },
            data: updateData,
        });
    }

    async userUpdateLoan(loanId, updateData , userId) {
        return await Prisma.loan.update({
            where: { id: loanId , userId: userId },
            data: updateData,
        });
    }

    async getLoanById(loanId) {
        return await Prisma.loan.findUnique({
            where: { id: loanId },
            include : {
                user: true,
                bank: true,
                transactions: true
            }
        });
    }

    async getLoansByUserId(userId) {
        return await Prisma.loan.findMany({
            where: { userId: userId },
        });
    }
}