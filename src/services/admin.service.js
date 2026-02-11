import Prisma from "../config/prismaClient.js";

export class AdminService {

    async createAdmin(adminData) {
        try {
            return await Prisma.admin.create({
                data: {
                    name: adminData.name,
                    email: adminData.email,
                    password: adminData.password,
                    role: adminData.role,
                    phone: adminData.phone
                }
            });
        } catch (error) {
            throw new Error('Error creating admin in the database');
        }
    }


    async getAdminByEmail(email) {
        return await Prisma.admin.findUnique({
            where: {
                email,
                isDeleted: false
            }
        });
    }

    async getAllAdmins(where) {
        return await Prisma.admin.findMany({
            where: { ...where, isDeleted: false }
        });
    }

    async updateAdminPassword(adminId, newPassword) {
        return await Prisma.admin.update({
            where: { id: adminId },
            data: { password: newPassword }
        });
    }

    async getadminStats() {
        const [
            totalApplications,
            activeloans,
            pendingapprovals,
            collectedAmount,
            totalUsers,
            pendingKyc,
            blockedUsers,
            activeBorrower
        ] = await Promise.all(
            [
                Prisma.loan.count(),
                Prisma.loan.count({ where: { status: 'active' } }),
                Prisma.loan.count({ where: { status: 'applied' } }),
                Prisma.transaction.aggregate({ where: { transactionType: { in: ['repayment', 'precloserrepayment'] } }, _sum: { amount: true } }),
                Prisma.user.count(),
                Prisma.user.count({ where: { kycStatus: 'pending' } }),
                Prisma.user.count({ where: { isBlocked: true } }),
                Prisma.user.count({ where: { loans: { some: {} } } })
            ]
        )

        return {
            totalApplications,
            activeloans,
            pendingapprovals,
            collectedAmount: collectedAmount._sum.amount || 0,
            totalUsers,
            pendingKyc,
            blockedUsers,
            activeBorrower
        }
    }

    async getAgentStats(agentId) {
        const [
            totalApplications,
            activeloans,
            pendingapprovals,
            collectedAmount,
            totalUsers,
            pendingKyc,
            blockedUsers,
            activeBorrower
        ] = await Promise.all(
            [
                Prisma.loan.count({ where: { user : { agentUsers : { some : { agentId } } } } }) || 0,
                Prisma.loan.count({ where: { status: 'active' , user : { agentUsers : { some : { agentId } } } } }) || 0,
                Prisma.loan.count({ where: { status: 'applied' , user : { agentUsers : { some : { agentId } } } } }) || 0,
                Prisma.transaction.aggregate({ where: { user: { agentUsers : { some : { agentId } } },transactionType: { in: ['repayment', 'precloserrepayment'] } }, _sum: { amount: true } }) || 0,
                Prisma.user.count({ where : { agentUsers : { some :  {agentId}}}}) || 0,
                Prisma.user.count({ where: { kycStatus: 'pending' , agentUsers : { some :  {agentId}} } }) || 0,
                Prisma.user.count({ where: { isBlocked: true , agentUsers : { some :  {agentId}} } }) || 0,
                Prisma.user.count({ where: { loans: { some: { agentUsers : { some : { agentId } } } } } }) || 0
            ]
        )

        return {
            totalApplications,
            activeloans,
            pendingapprovals,
            collectedAmount: collectedAmount._sum.amount || 0,
            totalUsers,
            pendingKyc,
            blockedUsers,
            activeBorrower
        }
    }
}