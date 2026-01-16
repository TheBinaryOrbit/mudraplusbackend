import Prisma from "../config/prismaClient.js";


export class BankDetailsService {
    async addBankDetails(userId, bankData) {
        return await Prisma.bankDetails.create({
            data: {
                userId: userId,
                bankName: bankData.bankName,
                accountNumber: bankData.accountNumber,
                ifscCode: bankData.ifscCode,
                accountHolderName: bankData.accountHolderName
            }
        });
    }

    async getBankDetailsByUserId(userId) {
        return await Prisma.bankDetails.findMany({
            where: { userId , isdeleted: false }
        });
    }

    async deleteBankDetails(bankDetailsId, userId) {
        return await Prisma.bankDetails.update({
            where: {
                id: bankDetailsId,
                userId: userId
            },
            data: {
                isdeleted: true
            }
        });
    }

    async updateBankDetails(bankDetailsId, userId, bankData) {
        return await Prisma.bankDetails.update({
            where: {
                id: bankDetailsId,
                userId: userId
            },
            data: {
                bankName: bankData.bankName,
                accountNumber: bankData.accountNumber,
                ifscCode: bankData.ifscCode,
                accountHolderName: bankData.accountHolderName
            }
        });
    }
}