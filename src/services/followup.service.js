import Prisma from "../config/prismaClient.js";


export class FollowupService {
    createFollowUp = async ({userId, agentUserId, note, nextFollowUpDate , followUpType , loanId , followUpDate}) => {
        return await Prisma.followUp.create({
            data: {
                userId,
                agentUserId,
                loanId,
                note,
                nextFollowUpDate,
                followUpType,
                followUpDate,
            }
        });
    }
}