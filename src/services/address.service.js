import Prisma from "../config/prismaClient.js";

export class AddressService {
    async addAddress(userId, addressData) {
        return await Prisma.address.create({
            data: {
                userId: userId,
                street: addressData.street,
                city: addressData.city,
                state: addressData.state,
                pinCode: addressData.pinCode,
                addressType: addressData.addressType
            }
        });
    }


    async updateAddress(userId, addressId, updateData) {
        return await Prisma.address.update({
            where: {
                id: addressId,
                userId: userId
            },
            data: updateData
        });
    }

    async getAddressByUserIdAndAddressType(userId, addressType) {
        const address = await Prisma.address.findFirst({
            where: {
                userId: userId,
                addressType: addressType
            }
        });

        const addressProof = await Prisma.document.findMany({
            where: {
                userId: userId,
                documentType: addressType === 'residential' ? 'residentialAddressProof' : 'employmentAddressProof'
            }
        });

        return { address, addressProof };
    }
}