import Prisma from "../config/prismaClient.js";


export class FollowupService {
    createFollowUp = async ({userId, agentUserId, note, nextFollowUpDate , followUpType , loanId , followUpDate}) => {
        console.log("Creating follow-up with data:", {userId, agentUserId, note, nextFollowUpDate , followUpType , loanId , followUpDate});
        return await Prisma.followUp.create({
            data: {
                userId,
                agentUserId,
                loanId,
                note,
                nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
                followUpType,
                followUpDate: new Date(followUpDate),
            }
        });
    }
}