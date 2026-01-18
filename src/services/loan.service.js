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
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                },
                bank: {
                    select: {
                        id: true,
                        bankName : true,
                        accountNumber : true,
                        ifscCode : true
                    }
                },
                transactions: {
                    select: {
                        id: true,
                        amount: true,
                        transactionType: true,
                        createdAt: true
                    }
                }
            }
        });
    }

    async getLoansByUserId(userId) {
        return await Prisma.loan.findMany({
            where: { userId: userId },
            select : {
                id: true,
                loanNumber : true,
                bank: {
                    select: {
                        id: true,
                        bankName : true,
                        accountNumber : true
                    }
                },
                requestedAmount: true,
                requestedTenure: true,
                principalAmount: true,
                tenure: true,
                intrestRate : true,
                intrestType : true,
                totalAmountPayable  :true,
                status : true,
                startDate : true,
                endDate : true,
            }
        });
    }

    async getAllLoans() {
        return await Prisma.loan.findMany({});
    }
}