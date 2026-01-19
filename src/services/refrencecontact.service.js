import Prisma from "../config/prismaClient.js";

export class RefrenceContactService {
    createRefrenceContact = async (userId, referencePerson1, referencePerson2) => {

        await this.deleteRefrenceContact(userId);

        return await Prisma.referencesContact.createMany({
            data: [
                {
                    userId: userId,
                    name: referencePerson1.name,
                    relation: referencePerson1.relation,
                    phone: referencePerson1.phone,
                },
                {
                    userId: userId,
                    name: referencePerson2.name,
                    relation: referencePerson2.relation,
                    phone: referencePerson2.phone,
                }
            ]
        });
    }


    deleteRefrenceContact = async (userId) => {
        const refrenceContact = await Prisma.referencesContact.deleteMany({
            where: {
                userId: userId
            }
        });
        return refrenceContact;
    }
}

