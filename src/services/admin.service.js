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

}