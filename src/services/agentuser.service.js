import Prisma from "../config/prismaClient.js";

export class AgentUserService {

    async assignUser(userId, agentId) {
        return await Prisma.agentUser.create({
            data: {
                agentId: agentId,
                userId: userId
            }
        });
    }

    async unAssignUser(agentUserData) {
        return await Prisma.agentUser.deleteMany({
            where: {
                agentId: agentUserData.agentId,
                userId: agentUserData.userId
            }
        });
    }

    async getUsersByAgentId(agentId) {
        return await Prisma.agentUser.findMany({
            where: {
                agentId: agentId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                        employmentType: true,
                        companyName: true,
                        createdAt: true,
                        isVerified: true,
                        kycStatus: true,
                    },

                },
                agent: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    }
                }
            }
        });
    }
}